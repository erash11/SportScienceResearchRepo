import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TAXONOMY, TAXONOMY_VERSION } from "../evidence-taxonomy.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shortlist = JSON.parse(fs.readFileSync(path.join(repoRoot, "docs", "pilot-expansion-shortlist.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "docs", "library-coverage-manifest.json"), "utf8"));
const papers = JSON.parse(fs.readFileSync(path.join(repoRoot, "papers.json"), "utf8"));
const screeningDir = path.join(repoRoot, "docs", "pilot-screening");
const failures = [];

function localFilename(url) {
  const marker = "/SourcePapers/";
  const index = String(url || "").indexOf(marker);
  return index === -1 ? null : decodeURIComponent(String(url).slice(index + marker.length));
}

function controlledArray(candidate, name, vocabulary) {
  const values = candidate[name];
  if (!Array.isArray(values) || !values.length) failures.push(`${candidate.sourceFile} has no ${name}`);
  for (const value of values || []) if (!vocabulary.includes(value)) failures.push(`${candidate.sourceFile} has invalid ${name}: ${value}`);
}

const screeningRecords = fs.existsSync(screeningDir) ? fs.readdirSync(screeningDir)
  .filter((file) => file.toLowerCase().endsWith(".json"))
  .sort()
  .flatMap((file) => {
    const batch = JSON.parse(fs.readFileSync(path.join(screeningDir, file), "utf8"));
    return (batch.records || []).map((record) => ({ ...record, screeningBatch: batch.batchId }));
  }) : [];
const screeningBySource = new Map(screeningRecords.map((record) => [record.sourceFile, record]));
const represented = new Set(papers.map(({ driveUrl, sourceUrl }) => localFilename(sourceUrl || driveUrl)).filter(Boolean));
const files = shortlist.candidates.map(({ sourceFile }) => sourceFile);

if (shortlist.schemaVersion !== 2) failures.push(`shortlist schema version is ${shortlist.schemaVersion}; expected 2`);
if (shortlist.taxonomyVersion !== TAXONOMY_VERSION) failures.push(`taxonomy version is ${shortlist.taxonomyVersion}; expected ${TAXONOMY_VERSION}`);
if (shortlist.candidates.length !== 96) failures.push(`shortlist has ${shortlist.candidates.length} candidates; expected 96`);
if (new Set(files).size !== files.length) failures.push("shortlist contains repeated source files");

for (const domain of TAXONOMY.domains) {
  const rows = shortlist.candidates.filter(({ pilotDomain }) => pilotDomain === domain);
  if (rows.length !== 12) failures.push(`${domain} has ${rows.length} candidates; expected 12`);
}

for (const candidate of shortlist.candidates) {
  if (!fs.existsSync(path.join(repoRoot, "SourcePapers", candidate.sourceFile))) failures.push(`source file missing: ${candidate.sourceFile}`);
  if (represented.has(candidate.sourceFile)) failures.push(`candidate already represented: ${candidate.sourceFile}`);
  if (!TAXONOMY.domains.includes(candidate.pilotDomain)) failures.push(`invalid pilot domain: ${candidate.pilotDomain}`);
  if (!TAXONOMY.domains.includes(candidate.primaryDomain)) failures.push(`invalid primary domain: ${candidate.primaryDomain}`);
  controlledArray(candidate, "domains", TAXONOMY.domains);
  controlledArray(candidate, "audiences", TAXONOMY.audiences);
  controlledArray(candidate, "sports", TAXONOMY.sports);
  controlledArray(candidate, "populations", TAXONOMY.populations);
  if (!TAXONOMY.studyDesigns.includes(candidate.studyDesign)) failures.push(`${candidate.sourceFile} has invalid study design: ${candidate.studyDesign}`);
  if (!candidate.domains?.includes(candidate.primaryDomain)) failures.push(`${candidate.sourceFile} primary domain is absent from domains`);
  if (!candidate.domains?.includes(candidate.pilotDomain)) failures.push(`${candidate.sourceFile} pilot domain is absent from domains`);
  if (!["title-screened", "full-text-eligible"].includes(candidate.screeningStatus)) failures.push(`unexpected screening status for ${candidate.sourceFile}`);
  if (candidate.allocationBasis === "secondary-title-match") {
    if (candidate.primaryDomain === candidate.pilotDomain) failures.push(`${candidate.sourceFile} is labeled secondary but primary and pilot domains match`);
  } else if (!["primary-title-match", "full-text-screened-primary"].includes(candidate.allocationBasis)) {
    failures.push(`${candidate.sourceFile} has invalid allocation basis: ${candidate.allocationBasis}`);
  } else if (candidate.primaryDomain !== candidate.pilotDomain) {
    failures.push(`${candidate.sourceFile} primary allocation does not match its pilot domain`);
  }

  const screened = screeningBySource.get(candidate.sourceFile);
  if (screened?.decision === "EXCLUDE" || screened?.decision === "DEGRADED") failures.push(`${candidate.sourceFile} was selected despite a ${screened.decision} decision`);
  if (candidate.screeningStatus === "full-text-eligible") {
    if (screened?.decision !== "INCLUDE") failures.push(`${candidate.sourceFile} is full-text eligible without an INCLUDE decision`);
    if (candidate.metadataSource !== "full-text-screening") failures.push(`${candidate.sourceFile} full-text metadata source is incorrect`);
    if (candidate.screeningBatch !== screened?.screeningBatch) failures.push(`${candidate.sourceFile} screening batch is incorrect`);
    for (const field of ["primaryDomain", "studyDesign"]) if (candidate[field] !== screened?.[field]) failures.push(`${candidate.sourceFile} does not preserve screened ${field}`);
    for (const field of ["domains", "audiences", "sports", "populations"]) if (JSON.stringify(candidate[field]) !== JSON.stringify(screened?.[field])) failures.push(`${candidate.sourceFile} does not preserve screened ${field}`);
  } else if (candidate.metadataSource !== "title-inference") {
    failures.push(`${candidate.sourceFile} title-screened metadata source is incorrect`);
  }
}

for (const screened of screeningRecords.filter(({ decision }) => decision === "INCLUDE")) {
  if (!represented.has(screened.sourceFile) && !files.includes(screened.sourceFile)) failures.push(`unpublished full-text INCLUDE decision was lost from the active pilot: ${screened.sourceFile}`);
  if (represented.has(screened.sourceFile) && files.includes(screened.sourceFile)) failures.push(`published full-text INCLUDE decision remains in the active pilot: ${screened.sourceFile}`);
}

for (const group of manifest.details.duplicateSourceContentGroups) {
  const selectedGroupFiles = group.files.filter((file) => files.includes(file));
  if (selectedGroupFiles.length > 1) failures.push(`duplicate-content candidates selected together: ${selectedGroupFiles.join(", ")}`);
  if (selectedGroupFiles.length && group.files.some((file) => represented.has(file))) failures.push(`selected content is already represented under another filename: ${selectedGroupFiles[0]}`);
}

if (!shortlist.candidates.some(({ populations }) => populations.includes("Female Athletes"))) failures.push("shortlist contains no female-athlete signal");
if (shortlist.candidates.filter(({ populations }) => populations.includes("Youth / Adolescent")).length < 4) failures.push("shortlist contains fewer than four youth/adolescent signals");
if (shortlist.candidates.filter(({ sports }) => sports.some((sport) => sport !== "Mixed / General Sport")).length < 24) failures.push("shortlist contains fewer than 24 named-sport signals");
if (shortlist.candidates.filter(({ populations }) => populations.some((population) => ["Collegiate", "Youth / Adolescent", "Adult / Recreational", "Female Athletes", "Healthy Athletes"].includes(population))).length < 12) failures.push("shortlist contains fewer than 12 underrepresented-population signals");

if (shortlist.screeningCounts?.fullTextEligible !== shortlist.candidates.filter(({ screeningStatus }) => screeningStatus === "full-text-eligible").length) failures.push("full-text screening count is inaccurate");
if (shortlist.screeningCounts?.titleScreened !== shortlist.candidates.filter(({ screeningStatus }) => screeningStatus === "title-screened").length) failures.push("title-screening count is inaccurate");

if (failures.length) {
  console.error(`Pilot shortlist audit failed (${failures.length} issue${failures.length === 1 ? "" : "s"}):`);
  failures.slice(0, 50).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 50) console.error(`- ...and ${failures.length - 50} more`);
  process.exit(1);
}

const secondary = shortlist.candidates.filter(({ allocationBasis }) => allocationBasis === "secondary-title-match").length;
console.log(`Pilot shortlist audit passed: 96 unique, unrepresented, content-deduplicated candidates; 12 per pilot domain; ${shortlist.screeningCounts.fullTextEligible} full-text decisions preserved; ${secondary} secondary-title allocations documented.`);
