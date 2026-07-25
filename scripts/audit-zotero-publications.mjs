import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  candidateConflicts,
  publishedPaperFromPublication,
  taxonomyRecordFromPublication,
  validateZoteroPublication,
} from "../library/publication-candidate.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicationDir = path.join(repoRoot, "docs", "zotero-synthesis");
const papers = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "papers.json"), "utf8"),
);
const taxonomy = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "paper-taxonomy.json"), "utf8"),
);
const paperById = new Map(papers.map((paper) => [String(paper.id), paper]));
const taxonomyById = new Map(
  taxonomy.records.map((record) => [String(record.id), record]),
);
const publications = fs.existsSync(publicationDir)
  ? fs
    .readdirSync(publicationDir)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .sort()
    .map((name) => ({
      file: name,
      value: JSON.parse(
        fs.readFileSync(path.join(publicationDir, name), "utf8"),
      ),
    }))
  : [];
const failures = [];

for (const { file, value } of publications) {
  const validation = validateZoteroPublication(value);
  failures.push(...validation.errors.map((error) => `${file}: ${error}`));
  const conflicts = candidateConflicts(
    value.candidate,
    papers.filter(
      (paper) => String(paper.id) !== String(value.libraryReview?.paperId),
    ),
    publications
      .filter((entry) => entry.file !== file)
      .map((entry) => entry.value),
  );
  failures.push(...conflicts.map((conflict) => `${file}: ${conflict}`));

  const paperId = String(value.libraryReview?.paperId || "");
  if (value.status === "STAGED") {
    if (paperById.has(paperId)) {
      failures.push(`${file}: staged paper ID ${paperId} already exists.`);
    }
    continue;
  }
  const expectedPaper = publishedPaperFromPublication(value);
  if (JSON.stringify(paperById.get(paperId)) !== JSON.stringify(expectedPaper)) {
    failures.push(`${file}: published paper ${paperId} differs from papers.json.`);
  }
  const expectedTaxonomy = taxonomyRecordFromPublication(value);
  if (
    JSON.stringify(taxonomyById.get(paperId))
    !== JSON.stringify(expectedTaxonomy)
  ) {
    failures.push(
      `${file}: published taxonomy ${paperId} differs from paper-taxonomy.json.`,
    );
  }
}

if (failures.length) {
  console.error(
    `Zotero publication audit failed (${failures.length} issue`
    + `${failures.length === 1 ? "" : "s"}):`,
  );
  failures.slice(0, 50).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 50) {
    console.error(`- ...and ${failures.length - 50} more`);
  }
  process.exit(1);
}

const published = publications.filter((entry) => entry.value.status === "PUBLISHED");
const staged = publications.filter((entry) => entry.value.status === "STAGED");
console.log(
  `Zotero publication audit passed: ${published.length} published, `
  + `${staged.length} staged candidate${staged.length === 1 ? "" : "s"}.`,
);
