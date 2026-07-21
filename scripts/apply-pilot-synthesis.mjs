import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const synthesisDir = path.join(repoRoot, "docs", "pilot-synthesis");
const screeningDir = path.join(repoRoot, "docs", "pilot-screening");
const papersPath = path.join(repoRoot, "papers.json");
const baseUrl = "https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/SourcePapers/";
const paperFieldsWithoutUrl = ["id", "year", "citation", "doi", "abstract", "tldr", "methods", "findings", "limitations", "practicalImplications", "athleteDev", "rtp"];

const papers = JSON.parse(fs.readFileSync(papersPath, "utf8"));
const papersById = new Map(papers.map((paper) => [String(paper.id), paper]));
const representedBySource = new Map(papers.map((paper) => {
  const marker = "/SourcePapers/";
  const index = String(paper.driveUrl || "").indexOf(marker);
  return [index === -1 ? null : decodeURIComponent(paper.driveUrl.slice(index + marker.length)), paper];
}).filter(([sourceFile]) => sourceFile));

const screeningFiles = fs.readdirSync(screeningDir).filter((file) => file.toLowerCase().endsWith(".json")).sort();
const screeningBatches = screeningFiles.map((file) => ({ file, data: JSON.parse(fs.readFileSync(path.join(screeningDir, file), "utf8")) }));
const screeningBySource = new Map(screeningBatches.flatMap(({ data }) => (data.records || []).map((record) => [record.sourceFile, record])));
const synthesisFiles = fs.readdirSync(synthesisDir).filter((file) => file.toLowerCase().endsWith(".json")).sort();

let added = 0;
let unchanged = 0;
for (const file of synthesisFiles) {
  const batch = JSON.parse(fs.readFileSync(path.join(synthesisDir, file), "utf8"));
  for (const entry of batch.records || []) {
    const fields = Object.keys(entry.paper || {});
    if (JSON.stringify(fields) !== JSON.stringify(paperFieldsWithoutUrl)) throw new Error(`${file}: ${entry.sourceFile} has unexpected paper fields or order`);
    if (!fs.existsSync(path.join(repoRoot, "SourcePapers", entry.sourceFile))) throw new Error(`${file}: source file is missing: ${entry.sourceFile}`);
    const screening = screeningBySource.get(entry.sourceFile);
    if (!screening || screening.decision !== "INCLUDE") throw new Error(`${file}: source lacks an INCLUDE screening decision: ${entry.sourceFile}`);
    if (String(screening.sourceVerification?.doi || "").toLowerCase() !== String(entry.paper.doi || "").toLowerCase()) throw new Error(`${file}: DOI does not match screening decision for ${entry.sourceFile}`);

    const finalPaper = {
      id: String(entry.paper.id),
      year: entry.paper.year,
      citation: entry.paper.citation,
      doi: entry.paper.doi,
      driveUrl: `${baseUrl}${encodeURIComponent(entry.sourceFile)}`,
      abstract: entry.paper.abstract,
      tldr: entry.paper.tldr,
      methods: entry.paper.methods,
      findings: entry.paper.findings,
      limitations: entry.paper.limitations,
      practicalImplications: entry.paper.practicalImplications,
      athleteDev: entry.paper.athleteDev,
      rtp: entry.paper.rtp,
    };

    const existingById = papersById.get(finalPaper.id);
    const existingBySource = representedBySource.get(entry.sourceFile);
    if (existingById || existingBySource) {
      if (existingById !== existingBySource || JSON.stringify(existingById) !== JSON.stringify(finalPaper)) throw new Error(`${file}: existing paper conflicts with synthesis record ${finalPaper.id}`);
      unchanged += 1;
    } else {
      papers.push(finalPaper);
      papersById.set(finalPaper.id, finalPaper);
      representedBySource.set(entry.sourceFile, finalPaper);
      added += 1;
    }

    screening.publication = {
      status: "PUBLISHED",
      paperId: finalPaper.id,
      synthesisBatch: batch.batchId,
      publishedOn: batch.preparedOn,
    };
  }
}

papers.sort((a, b) => Number(a.id) - Number(b.id));
fs.writeFileSync(papersPath, `${JSON.stringify(papers, null, 2)}\n`);
for (const { file, data } of screeningBatches) fs.writeFileSync(path.join(screeningDir, file), `${JSON.stringify(data, null, 2)}\n`);
console.log(`Applied pilot synthesis: ${added} paper${added === 1 ? "" : "s"} added, ${unchanged} already current, ${papers.length} total published rows.`);
