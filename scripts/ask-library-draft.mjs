// Draft an On-Demand / Not Expert-Reviewed Decision Brief from a validated ATL-R request packet.
//
// Usage:
//   npm run pilot:draft -- <request.json> [--out <brief.json>] [--model <id>]
//                          [--pack-only <pack.json>] [--from-draft <composer-output.json>]
//
// Retrieval, evidence packing, excerpt verification and confidence gating run here. The composer
// is the Claude Code CLI (`claude -p`, no tools) unless --from-draft supplies a composer output
// written by another operator agent from the --pack-only prompt.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditDecisionBrief, validateBriefRequest } from "../ask-library/pilot-core.mjs";
import {
  DRAFTER_VERSION,
  buildComposerPrompt,
  buildCriticPrompt,
  buildEvidencePack,
  finalizeDraft,
  parseComposerJson,
  localSourceFile,
  rankRecords,
} from "../ask-library/drafter.mjs";

// ATL_LIBRARY_ROOT points the drafter at another checkout's papers.json and SourcePapers/,
// for example a staged batch branch during evaluation.
const repoRoot = path.resolve(process.env.ATL_LIBRARY_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const sourceRoot = path.join(repoRoot, "SourcePapers");
const DEFAULT_MODEL = process.env.ATL_DRAFTER_MODEL || "claude-opus-5-5";

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? "" : process.argv[index + 1] ?? "";
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

function sourcePath(sourceFile) {
  const resolved = path.resolve(sourceRoot, sourceFile);
  if (!resolved.startsWith(`${sourceRoot}${path.sep}`)) throw new Error("Source file resolves outside SourcePapers.");
  return resolved;
}

const pageCache = new Map();
function readPage(sourceFile, page) {
  const key = `${sourceFile}#${page}`;
  if (!pageCache.has(key)) {
    const result = spawnSync("pdftotext", ["-f", String(page), "-l", String(page), "-layout", sourcePath(sourceFile), "-"], {
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
    });
    if (result.error?.code === "ENOENT") throw new Error("pdftotext is not installed or is not on PATH.");
    pageCache.set(key, result.status === 0 ? result.stdout : "");
  }
  return pageCache.get(key);
}

const countCache = new Map();
function pageCount(sourceFile) {
  if (!countCache.has(sourceFile)) {
    const result = spawnSync("pdfinfo", [sourcePath(sourceFile)], { encoding: "utf8", windowsHide: true });
    countCache.set(sourceFile, Number(String(result.stdout).match(/Pages:\s+(\d+)/)?.[1] ?? 0));
  }
  return countCache.get(sourceFile);
}

function allPages(sourceFile) {
  const total = pageCount(sourceFile);
  return Array.from({ length: total }, (_, i) => readPage(sourceFile, i + 1));
}

function compose(prompt, model) {
  const result = spawnSync(
    "claude",
    ["-p", "--model", model, "--tools", "", "--no-session-persistence", "--output-format", "text"],
    { input: prompt, encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 * 1024, timeout: 15 * 60 * 1000, shell: process.platform === "win32" },
  );
  if (result.error) throw new Error(`Composer failed to start: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Composer exited ${result.status}: ${String(result.stderr).slice(0, 500)}`);
  return result.stdout;
}

function briefIdFor(requestId) {
  return String(requestId).startsWith("ATL-R-") ? `ATL-B-${String(requestId).slice(6)}` : `ATL-B-${requestId}`;
}

async function run() {
  const requestPath = process.argv[2];
  if (!requestPath || requestPath.startsWith("--")) {
    console.error("Usage: npm run pilot:draft -- <request.json> [--out <brief.json>] [--model <id>] [--pack-only <pack.json>] [--from-draft <draft.json>]");
    process.exitCode = 1;
    return;
  }
  const request = readJson(requestPath);
  const requestCheck = validateBriefRequest(request);
  if (!requestCheck.valid) {
    console.log(`FAIL request ${requestPath}`);
    requestCheck.errors.forEach((error) => console.log(`  ERROR: ${error}`));
    process.exitCode = 1;
    return;
  }

  const papers = readJson(path.join(repoRoot, "papers.json"));
  const taxonomy = readJson(path.join(repoRoot, "paper-taxonomy.json"));
  const taxonomyById = new Map(taxonomy.records.map((record) => [String(record.id), record]));
  const papersById = new Map(papers.map((paper) => [String(paper.id), paper]));

  const { queryTokens, supportable, leads } = rankRecords(request, papers, taxonomyById, {
    limit: 16,
    sourceAvailable: (sourceFile) => fs.existsSync(sourcePath(sourceFile)),
  });
  const topScore = supportable[0]?.score ?? 0;
  const relevantLeads = leads.filter((lead) => lead.score >= 0.85 * topScore);
  const candidates = supportable.map((entry) => {
    const meta = taxonomyById.get(String(entry.paper.id));
    return {
      ...entry,
      taxonomy: meta,
      provenance: meta?.reviewStatus || "Legacy published record (summary not full-text reviewed)",
      pages: allPages(entry.sourceFile),
    };
  });
  const pack = buildEvidencePack(candidates, queryTokens, { maxPapers: 14 });
  const prompt = buildComposerPrompt(request, pack, relevantLeads);

  const packOnly = option("--pack-only");
  if (packOnly) {
    fs.mkdirSync(path.dirname(path.resolve(packOnly)), { recursive: true });
    fs.writeFileSync(packOnly, JSON.stringify({ requestId: request.requestId, drafterVersion: DRAFTER_VERSION, prompt, pack: pack.map(({ libraryId, citation }) => ({ libraryId, citation })), leads: relevantLeads.map((lead) => lead.paper.id) }, null, 2));
    console.log(`Wrote composer prompt and evidence pack (${pack.length} sources) to ${packOnly}`);
    return;
  }

  const fromDraft = option("--from-draft");
  const model = option("--model") || DEFAULT_MODEL;
  const raw = fromDraft ? fs.readFileSync(fromDraft, "utf8") : compose(prompt, model);
  let draft = parseComposerJson(raw);
  if (!process.argv.includes("--no-critic")) {
    const cited = [...new Set((draft.claims ?? []).flatMap((claim) => (claim.evidence ?? []).map((item) => String(item.libraryId))))];
    const fullSources = cited
      .map((id) => papersById.get(id))
      .filter((paper) => paper && localSourceFile(paper) && fs.existsSync(sourcePath(localSourceFile(paper))))
      .map((paper) => ({ libraryId: String(paper.id), citation: paper.citation, pages: allPages(localSourceFile(paper)).map((page) => page.slice(0, 9000)) }));
    draft = parseComposerJson(compose(buildCriticPrompt(request, draft, fullSources), model));
  }
  const createdAt = new Date().toISOString();
  const { brief, validation } = await finalizeDraft({
    draft,
    request,
    papersById,
    readPage,
    pageCount,
    briefId: briefIdFor(request.requestId),
    createdAt,
    leads: relevantLeads,
    libraryReview: (paper) => taxonomyById.get(String(paper.id))?.reviewStatus || "Legacy published record; library summary not full-text reviewed",
    composer: { composer: fromDraft ? "operator-supplied draft" : `claude -p (${model})`, criticPass: !process.argv.includes("--no-critic"), sourcesInPack: pack.map((paper) => paper.libraryId) },
  });

  const out = option("--out") || path.join(repoRoot, "pilot-data", "ask-library", "private", "briefs", `${brief.briefId}.json`);
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(brief, null, 2)}\n`);

  const audit = await auditDecisionBrief(brief, { papers, readSourcePage: readPage });
  console.log(`${validation.valid ? "PASS" : "FAIL"} brief structure ${out}`);
  validation.errors.forEach((error) => console.log(`  ERROR: ${error}`));
  console.log(`${audit.valid ? "PASS" : "FAIL"} source-excerpt audit (${audit.excerptsChecked} excerpts checked)`);
  audit.errors.forEach((error) => console.log(`  ERROR: ${error}`));
  console.log(`Tier: ${brief.evidenceConfidence.tier}; claims kept ${brief.claims.length}/${brief.drafter.claimsProposed}; sources ${brief.sources.length}`);
  brief.drafter.notes.forEach((note) => console.log(`  NOTE: ${note}`));
  console.log("A named human claim auditor must confirm interpretation fidelity before delivery.");
  if (!validation.valid || !audit.valid) process.exitCode = 1;
}

await run();
