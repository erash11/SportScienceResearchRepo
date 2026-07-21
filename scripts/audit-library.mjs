import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const papersPath = path.join(root, "papers.json");
const sourceDir = path.join(root, "SourcePapers");
const manifestPath = path.join(root, "docs", "library-coverage-manifest.json");
const sourceUrlMarker = "/SourcePapers/";
const expectedFields = [
  "id",
  "year",
  "citation",
  "doi",
  "driveUrl",
  "abstract",
  "tldr",
  "methods",
  "findings",
  "limitations",
  "practicalImplications",
  "athleteDev",
  "rtp",
];
const requiredNonBlankFields = expectedFields.filter((field) => field !== "doi");
const args = new Set(process.argv.slice(2));
const deep = args.has("--deep") || args.has("--write");
const write = args.has("--write");
const check = args.has("--check");

function normalizeName(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function sourceNameFromUrl(url) {
  const raw = String(url ?? "").split("/").pop();
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw.replace(/%20/gi, " ");
  }
}

function groupBy(values, keyFor) {
  const groups = new Map();
  for (const value of values) {
    const key = keyFor(value);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(value);
  }
  return groups;
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const papers = JSON.parse(fs.readFileSync(papersPath, "utf8"));
const sourceFiles = fs.readdirSync(sourceDir).filter((name) => /\.pdf$/i.test(name)).sort();
const sourceFileByNormalizedName = new Map(sourceFiles.map((name) => [normalizeName(name), name]));
const localRows = papers.filter((paper) => String(paper.driveUrl).includes(sourceUrlMarker));
const externalRows = papers.filter((paper) => !String(paper.driveUrl).includes(sourceUrlMarker));
const localReferenceGroups = groupBy(localRows, (paper) => normalizeName(sourceNameFromUrl(paper.driveUrl)));
const repeatedLocalReferences = [...localReferenceGroups.entries()]
  .filter(([, rows]) => rows.length > 1)
  .map(([sourceName, rows]) => ({ sourceName, ids: rows.map((row) => row.id) }));
const unresolvedLocalReferences = [...localReferenceGroups.entries()]
  .filter(([sourceName]) => !sourceFileByNormalizedName.has(sourceName))
  .map(([sourceName, rows]) => ({ sourceName, ids: rows.map((row) => row.id) }));
const resolvedLocalNames = new Set(
  [...localReferenceGroups.keys()].filter((name) => sourceFileByNormalizedName.has(name)),
);
const duplicateIds = [...groupBy(papers, (paper) => String(paper.id)).entries()]
  .filter(([, rows]) => rows.length > 1)
  .map(([id, rows]) => ({ id, count: rows.length }));
const missingRequiredFields = papers.flatMap((paper) =>
  requiredNonBlankFields
    .filter((field) => !(field in paper) || paper[field] == null || String(paper[field]).trim() === "")
    .map((field) => ({ id: paper.id, field })),
);
const schemaMismatches = papers
  .filter((paper) => {
    const keys = Object.keys(paper).sort();
    return JSON.stringify(keys) !== JSON.stringify([...expectedFields].sort());
  })
  .map((paper) => ({ id: paper.id, fields: Object.keys(paper).sort() }));

const manifest = {
  generatedAt: new Date().toISOString(),
  sourceOfTruth: "papers.json + SourcePapers/",
  counts: {
    publishedRows: papers.length,
    uniqueIds: new Set(papers.map((paper) => String(paper.id))).size,
    localSourceRows: localRows.length,
    externalOrInternalRows: externalRows.length,
    sourcePdfFiles: sourceFiles.length,
    distinctLocalSourceFilesRepresented: resolvedLocalNames.size,
    unrepresentedSourcePdfFiles: sourceFiles.length - resolvedLocalNames.size,
    repeatedLocalReferenceGroups: repeatedLocalReferences.length,
    unresolvedLocalReferences: unresolvedLocalReferences.length,
    missingRequiredFields: missingRequiredFields.length,
    schemaMismatches: schemaMismatches.length,
    nextUnusedId: String(Math.max(...papers.map((paper) => Number(paper.id))) + 1),
  },
  qualityGates: {
    duplicateIds: duplicateIds.length === 0 ? "PASS" : "FAIL",
    repeatedLocalReferences: repeatedLocalReferences.length === 0 ? "PASS" : "FAIL",
    unresolvedLocalReferences: unresolvedLocalReferences.length === 0 ? "PASS" : "FAIL",
    requiredFields: missingRequiredFields.length === 0 ? "PASS" : "FAIL",
    schema: schemaMismatches.length === 0 ? "PASS" : "FAIL",
  },
  details: {
    duplicateIds,
    repeatedLocalReferences,
    unresolvedLocalReferences,
    missingRequiredFields,
    schemaMismatches,
    externalOrInternalRows: externalRows.map((paper) => ({ id: paper.id, driveUrl: paper.driveUrl })),
  },
};

if (deep) {
  const sourceHashByName = new Map();
  const sourceFilesByHash = new Map();
  for (const name of sourceFiles) {
    const hash = sha256(path.join(sourceDir, name));
    sourceHashByName.set(normalizeName(name), hash);
    if (!sourceFilesByHash.has(hash)) sourceFilesByHash.set(hash, []);
    sourceFilesByHash.get(hash).push(name);
  }
  const representedHashes = new Set(
    [...resolvedLocalNames].map((name) => sourceHashByName.get(name)).filter(Boolean),
  );
  const duplicateContentGroups = [...sourceFilesByHash.entries()]
    .filter(([, names]) => names.length > 1)
    .map(([hash, names]) => ({ sha256: hash, files: names }));
  manifest.counts.uniqueSourcePdfContents = sourceFilesByHash.size;
  manifest.counts.duplicateSourceContentGroups = duplicateContentGroups.length;
  manifest.counts.distinctSourceContentsRepresented = representedHashes.size;
  manifest.counts.unrepresentedUniqueSourceContents = sourceFilesByHash.size - representedHashes.size;
  manifest.details.duplicateSourceContentGroups = duplicateContentGroups;
}

if (write) {
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote ${path.relative(root, manifestPath)}`);
}

console.log(JSON.stringify({ counts: manifest.counts, qualityGates: manifest.qualityGates }, null, 2));

if (check && Object.values(manifest.qualityGates).some((status) => status !== "PASS")) {
  process.exitCode = 1;
}
