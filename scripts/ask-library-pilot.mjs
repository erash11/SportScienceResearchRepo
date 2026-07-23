import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  auditDecisionBrief,
  evaluatePilot,
  validateBriefFeedback,
  validateBriefRequest,
  validateDecisionBrief,
} from "../ask-library/pilot-core.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(repoRoot, filePath), "utf8"));
}

function printResult(label, result) {
  const marker = result.valid === false || result.expansionWarranted === false ? "FAIL" : "PASS";
  console.log(`${marker} ${label}`);
  for (const error of result.errors ?? []) console.log(`  ERROR: ${error}`);
  for (const warning of result.warnings ?? []) console.log(`  WARN: ${warning}`);
}

function exitOnInvalid(label, result) {
  printResult(label, result);
  if (result.valid === false) process.exitCode = 1;
}

function resolveSourceFile(sourceFile) {
  const sourceRoot = path.resolve(repoRoot, "SourcePapers");
  const resolved = path.resolve(sourceRoot, sourceFile);
  if (!resolved.startsWith(`${sourceRoot}${path.sep}`)) {
    throw new Error("Source file resolves outside SourcePapers.");
  }
  if (!fs.existsSync(resolved)) {
    throw new Error(`Source file not found: ${sourceFile}`);
  }
  return resolved;
}

function readPdfPage(sourceFile, page) {
  const sourcePath = resolveSourceFile(sourceFile);
  const result = spawnSync(
    "pdftotext",
    ["-f", String(page), "-l", String(page), "-layout", sourcePath, "-"],
    { encoding: "utf8", windowsHide: true },
  );

  if (result.error?.code === "ENOENT") {
    throw new Error("pdftotext is not installed or is not on PATH.");
  }
  if (result.status !== 0) {
    throw new Error(cleanProcessMessage(result.stderr) || `pdftotext exited ${result.status}.`);
  }
  return result.stdout;
}

function cleanProcessMessage(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

async function run() {
  const [command, target] = process.argv.slice(2);

  if (command === "request" && target) {
    exitOnInvalid(target, validateBriefRequest(readJson(target)));
    return;
  }

  if (command === "brief" && target) {
    exitOnInvalid(target, validateDecisionBrief(readJson(target)));
    return;
  }

  if (command === "feedback" && target) {
    exitOnInvalid(target, validateBriefFeedback(readJson(target)));
    return;
  }

  if (command === "audit-source" && target) {
    const brief = readJson(target);
    const papers = readJson("papers.json");
    const result = await auditDecisionBrief(brief, {
      papers,
      readSourcePage: readPdfPage,
    });
    exitOnInvalid(`${target} (${result.excerptsChecked} excerpts checked)`, result);
    return;
  }

  if (command === "score" && target) {
    const result = evaluatePilot(readJson(target));
    console.log(`${result.expansionWarranted ? "PASS" : "HOLD"} pilot expansion decision`);
    for (const gate of result.gates) {
      console.log(`  ${gate.pass ? "PASS" : "FAIL"} ${gate.label}: ${gate.observed} (required ${gate.required})`);
    }
    if (!result.expansionWarranted) process.exitCode = 1;
    return;
  }

  if (command === "check-examples") {
    const examples = "docs/ask-library-pilot/examples";
    exitOnInvalid("example request", validateBriefRequest(readJson(`${examples}/request.example.json`)));
    exitOnInvalid("example brief", validateDecisionBrief(readJson(`${examples}/brief.example.json`)));
    exitOnInvalid("example feedback", validateBriefFeedback(readJson(`${examples}/feedback.example.json`)));
    const score = evaluatePilot(readJson(`${examples}/scorecard.example.json`));
    console.log(`${score.expansionWarranted ? "PASS" : "FAIL"} example scorecard`);
    if (!score.expansionWarranted) process.exitCode = 1;
    return;
  }

  console.error(
    [
      "Usage:",
      "  node scripts/ask-library-pilot.mjs request <request.json>",
      "  node scripts/ask-library-pilot.mjs brief <brief.json>",
      "  node scripts/ask-library-pilot.mjs feedback <feedback.json>",
      "  node scripts/ask-library-pilot.mjs audit-source <brief.json>",
      "  node scripts/ask-library-pilot.mjs score <scorecard.json>",
      "  node scripts/ask-library-pilot.mjs check-examples",
    ].join("\n"),
  );
  process.exitCode = 1;
}

await run();
