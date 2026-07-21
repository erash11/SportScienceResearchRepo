import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TAXONOMY } from "../evidence-taxonomy.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const screeningDir = path.join(repoRoot, "docs", "pilot-screening");
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "docs", "library-coverage-manifest.json"), "utf8"));
const papers = JSON.parse(fs.readFileSync(path.join(repoRoot, "papers.json"), "utf8"));
const failures = [];
const validDecisions = new Set(["INCLUDE", "EXCLUDE", "DEGRADED"]);

function localFilename(url) {
  const marker = "/SourcePapers/";
  const index = String(url || "").indexOf(marker);
  return index === -1 ? null : decodeURIComponent(String(url).slice(index + marker.length));
}

function validateControlledArray(record, name, vocabulary) {
  const values = record[name];
  if (!Array.isArray(values) || !values.length) {
    failures.push(`${record.sourceFile} has no ${name}`);
    return;
  }
  for (const value of values) if (!vocabulary.includes(value)) failures.push(`${record.sourceFile} has invalid ${name}: ${value}`);
}

if (!fs.existsSync(screeningDir)) failures.push("pilot screening directory is missing");
const files = fs.existsSync(screeningDir) ? fs.readdirSync(screeningDir).filter((file) => file.toLowerCase().endsWith(".json")).sort() : [];
if (!files.length) failures.push("no pilot screening JSON batches found");

const batches = files.map((file) => ({ file, data: JSON.parse(fs.readFileSync(path.join(screeningDir, file), "utf8")) }));
const batchIds = batches.map(({ data }) => data.batchId);
if (new Set(batchIds).size !== batchIds.length) failures.push("pilot screening batches contain repeated batch IDs");

const records = [];
for (const { file, data } of batches) {
  if (data.schemaVersion !== 1) failures.push(`${file} has schema version ${data.schemaVersion}; expected 1`);
  if (!data.batchId) failures.push(`${file} has no batchId`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.screenedOn || "")) failures.push(`${file} has an invalid screenedOn date`);
  if (!Array.isArray(data.records) || !data.records.length) failures.push(`${file} contains no screening records`);
  for (const record of data.records || []) records.push({ ...record, screeningBatch: data.batchId });
}

const sourceFiles = records.map(({ sourceFile }) => sourceFile);
if (new Set(sourceFiles).size !== sourceFiles.length) failures.push("a source file is screened in more than one batch");
const publishedBySource = new Map(papers.map((paper) => [localFilename(paper.sourceUrl || paper.driveUrl), paper]).filter(([sourceFile]) => sourceFile));

for (const record of records) {
  if (!record.sourceFile || !fs.existsSync(path.join(repoRoot, "SourcePapers", record.sourceFile))) failures.push(`screened source file is missing: ${record.sourceFile || "(blank)"}`);
  if (!validDecisions.has(record.decision)) failures.push(`${record.sourceFile} has invalid decision: ${record.decision}`);

  const published = publishedBySource.get(record.sourceFile);
  if (published) {
    if (record.publication?.status !== "PUBLISHED") failures.push(`represented screening source lacks PUBLISHED provenance: ${record.sourceFile}`);
    if (String(record.publication?.paperId || "") !== String(published.id)) failures.push(`${record.sourceFile} publication paperId does not match papers.json`);
    if (String(record.sourceVerification?.doi || "").toLowerCase() !== String(published.doi || "").toLowerCase()) failures.push(`${record.sourceFile} published DOI does not match screening verification`);
  } else if (record.publication?.status === "PUBLISHED") {
    failures.push(`${record.sourceFile} is marked PUBLISHED but is absent from papers.json`);
  }
  if (record.decision !== "INCLUDE" && record.publication) failures.push(`${record.sourceFile} has publication provenance without an INCLUDE decision`);

  if (record.decision === "INCLUDE") {
    if (record.sourceVerification?.status !== "PASS") failures.push(`${record.sourceFile} INCLUDE decision lacks PASS source verification`);
    if (!Number.isInteger(record.sourceVerification?.pages) || record.sourceVerification.pages < 1) failures.push(`${record.sourceFile} has invalid page count`);
    if (!Number.isInteger(record.sourceVerification?.extractedCharacters) || record.sourceVerification.extractedCharacters < 500) failures.push(`${record.sourceFile} has insufficient extracted text verification`);
    if (!String(record.sourceVerification?.doi || "").trim()) failures.push(`${record.sourceFile} has no verified DOI`);
    if (!TAXONOMY.studyDesigns.includes(record.studyDesign)) failures.push(`${record.sourceFile} has invalid study design: ${record.studyDesign}`);
    if (!TAXONOMY.domains.includes(record.primaryDomain)) failures.push(`${record.sourceFile} has invalid primary domain: ${record.primaryDomain}`);
    validateControlledArray(record, "domains", TAXONOMY.domains);
    validateControlledArray(record, "audiences", TAXONOMY.audiences);
    validateControlledArray(record, "sports", TAXONOMY.sports);
    validateControlledArray(record, "populations", TAXONOMY.populations);
    if (Array.isArray(record.domains) && !record.domains.includes(record.primaryDomain)) failures.push(`${record.sourceFile} primary domain is absent from domains`);
    for (const field of ["evidenceSummary", "limitations", "synthesisCaution"]) if (!String(record[field] || "").trim()) failures.push(`${record.sourceFile} has no ${field}`);
  }
  if (record.decision === "EXCLUDE" && !String(record.exclusionReason || "").trim()) failures.push(`${record.sourceFile} EXCLUDE decision has no exclusionReason`);
  if (record.decision === "DEGRADED" && !String(record.degradedReason || "").trim()) failures.push(`${record.sourceFile} DEGRADED decision has no degradedReason`);
}

for (const group of manifest.details.duplicateSourceContentGroups) {
  const screenedGroupFiles = group.files.filter((file) => sourceFiles.includes(file));
  if (screenedGroupFiles.length > 1) failures.push(`duplicate source contents were screened twice: ${screenedGroupFiles.join(", ")}`);
  if (screenedGroupFiles.length) {
    const representedGroupFiles = group.files.filter((file) => publishedBySource.has(file));
    if (representedGroupFiles.length && !representedGroupFiles.includes(screenedGroupFiles[0])) failures.push(`screened source content is represented under another filename: ${screenedGroupFiles[0]}`);
  }
}

if (failures.length) {
  console.error(`Pilot screening audit failed (${failures.length} issue${failures.length === 1 ? "" : "s"}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

const counts = Object.fromEntries([...validDecisions].map((decision) => [decision, records.filter((record) => record.decision === decision).length]));
console.log(`Pilot screening audit passed: ${records.length} unique full-text decisions across ${batches.length} batch${batches.length === 1 ? "" : "es"}; INCLUDE=${counts.INCLUDE}, EXCLUDE=${counts.EXCLUDE}, DEGRADED=${counts.DEGRADED}.`);
