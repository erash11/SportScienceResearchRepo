import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const synthesisDir = path.join(repoRoot, "docs", "pilot-synthesis");
const screeningDir = path.join(repoRoot, "docs", "pilot-screening");
const papers = JSON.parse(fs.readFileSync(path.join(repoRoot, "papers.json"), "utf8"));
const papersById = new Map(papers.map((paper) => [String(paper.id), paper]));
const failures = [];
const expectedPaperFields = ["id", "year", "citation", "doi", "abstract", "tldr", "methods", "findings", "limitations", "practicalImplications", "athleteDev", "rtp"];
const baseUrl = "https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/SourcePapers/";

const screeningRecords = fs.readdirSync(screeningDir).filter((file) => file.toLowerCase().endsWith(".json")).flatMap((file) => {
  const batch = JSON.parse(fs.readFileSync(path.join(screeningDir, file), "utf8"));
  return (batch.records || []).map((record) => ({ ...record, screeningBatch: batch.batchId }));
});
const screeningBySource = new Map(screeningRecords.map((record) => [record.sourceFile, record]));
const synthesisFiles = fs.existsSync(synthesisDir) ? fs.readdirSync(synthesisDir).filter((file) => file.toLowerCase().endsWith(".json")).sort() : [];
if (!synthesisFiles.length) failures.push("no pilot synthesis batches found");

const entries = [];
for (const file of synthesisFiles) {
  const batch = JSON.parse(fs.readFileSync(path.join(synthesisDir, file), "utf8"));
  if (batch.schemaVersion !== 1) failures.push(`${file} has schema version ${batch.schemaVersion}; expected 1`);
  if (!batch.batchId || !batch.sourceScreeningBatch) failures.push(`${file} lacks batch provenance`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(batch.preparedOn || "")) failures.push(`${file} has an invalid preparedOn date`);
  if (!Array.isArray(batch.records) || !batch.records.length) failures.push(`${file} contains no synthesis records`);
  for (const entry of batch.records || []) entries.push({ ...entry, synthesisBatch: batch.batchId, sourceScreeningBatch: batch.sourceScreeningBatch, preparedOn: batch.preparedOn });
}

const ids = entries.map(({ paper }) => String(paper?.id));
const sources = entries.map(({ sourceFile }) => sourceFile);
if (new Set(ids).size !== ids.length) failures.push("synthesis batches contain repeated paper IDs");
if (new Set(sources).size !== sources.length) failures.push("synthesis batches contain repeated source files");

for (const entry of entries) {
  if (JSON.stringify(Object.keys(entry.paper || {})) !== JSON.stringify(expectedPaperFields)) failures.push(`${entry.sourceFile} has unexpected synthesis paper fields or order`);
  if (!fs.existsSync(path.join(repoRoot, "SourcePapers", entry.sourceFile))) failures.push(`synthesis source file is missing: ${entry.sourceFile}`);
  const screening = screeningBySource.get(entry.sourceFile);
  if (screening?.decision !== "INCLUDE") failures.push(`${entry.sourceFile} lacks an INCLUDE screening decision`);
  if (screening?.screeningBatch !== entry.sourceScreeningBatch) failures.push(`${entry.sourceFile} screening batch provenance is incorrect`);
  if (screening?.publication?.status !== "PUBLISHED" || String(screening?.publication?.paperId) !== String(entry.paper?.id)) failures.push(`${entry.sourceFile} publication status does not match synthesis`);
  if (screening?.publication?.synthesisBatch !== entry.synthesisBatch) failures.push(`${entry.sourceFile} synthesis batch provenance is incorrect`);
  if (String(screening?.sourceVerification?.doi || "").toLowerCase() !== String(entry.paper?.doi || "").toLowerCase()) failures.push(`${entry.sourceFile} DOI differs between screening and synthesis`);

  for (const field of expectedPaperFields.filter((field) => !["id", "year"].includes(field))) if (!String(entry.paper?.[field] || "").trim()) failures.push(`${entry.sourceFile} has blank ${field}`);
  if (!Number.isInteger(entry.paper?.year) || entry.paper.year < 1900 || entry.paper.year > 2100) failures.push(`${entry.sourceFile} has invalid year`);

  const published = papersById.get(String(entry.paper?.id));
  const expectedPublished = entry.paper ? {
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
  } : null;
  if (!published) failures.push(`synthesis paper ${entry.paper?.id} is absent from papers.json`);
  else if (JSON.stringify(published) !== JSON.stringify(expectedPublished)) failures.push(`published paper ${entry.paper.id} differs from synthesis source`);
}

if (failures.length) {
  console.error(`Pilot synthesis audit failed (${failures.length} issue${failures.length === 1 ? "" : "s"}):`);
  failures.slice(0, 50).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 50) console.error(`- ...and ${failures.length - 50} more`);
  process.exit(1);
}

console.log(`Pilot synthesis audit passed: ${entries.length} source-grounded records across ${synthesisFiles.length} batch${synthesisFiles.length === 1 ? "" : "es"}; all match screening provenance and papers.json.`);
