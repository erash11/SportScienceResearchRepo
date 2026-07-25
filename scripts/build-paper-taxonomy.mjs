import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inferTaxonomy, TAXONOMY_VERSION } from "../evidence-taxonomy.mjs";
import { taxonomyRecordFromPublication } from "../library/publication-candidate.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const papers = JSON.parse(fs.readFileSync(path.join(repoRoot, "papers.json"), "utf8"));
const outputPath = path.join(repoRoot, "paper-taxonomy.json");
const screeningDir = path.join(repoRoot, "docs", "pilot-screening");
const zoteroSynthesisDir = path.join(repoRoot, "docs", "zotero-synthesis");
const reviewedByPaperId = new Map();
const zoteroReviewedByPaperId = new Map();

if (fs.existsSync(screeningDir)) {
  for (const file of fs.readdirSync(screeningDir).filter((name) => name.toLowerCase().endsWith(".json"))) {
    const batch = JSON.parse(fs.readFileSync(path.join(screeningDir, file), "utf8"));
    for (const record of batch.records || []) {
      if (record.decision === "INCLUDE" && record.publication?.status === "PUBLISHED") reviewedByPaperId.set(String(record.publication.paperId), record);
    }
  }
}

if (fs.existsSync(zoteroSynthesisDir)) {
  for (const file of fs.readdirSync(zoteroSynthesisDir).filter((name) => name.toLowerCase().endsWith(".json"))) {
    const publication = JSON.parse(fs.readFileSync(path.join(zoteroSynthesisDir, file), "utf8"));
    if (publication.status === "PUBLISHED") {
      zoteroReviewedByPaperId.set(
        String(publication.libraryReview.paperId),
        publication,
      );
    }
  }
}

const output = {
  schemaVersion: 1,
  taxonomyVersion: TAXONOMY_VERSION,
  method: "rules-v1-with-reviewed-full-text-overrides",
  note: "Deterministic discovery metadata for the legacy baseline, with reviewed local-PDF and Zotero Paper Brief overrides.",
  records: papers
    .map((paper) => {
      const zoteroReviewed = zoteroReviewedByPaperId.get(String(paper.id));
      if (zoteroReviewed) {
        return taxonomyRecordFromPublication(zoteroReviewed);
      }
      const reviewed = reviewedByPaperId.get(String(paper.id));
      return reviewed ? {
        id: String(paper.id),
        domains: reviewed.domains,
        audiences: reviewed.audiences,
        sports: reviewed.sports,
        populations: reviewed.populations,
        studyDesign: reviewed.studyDesign,
        sourceVerification: "Verified local PDF",
        reviewStatus: "Full-text screened and published",
        taxonomySource: "full-text-screening",
      } : { id: String(paper.id), ...inferTaxonomy(paper), taxonomySource: "rules-v1-unreviewed" };
    })
    .sort((a, b) => Number(a.id) - Number(b.id)),
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${output.records.length} taxonomy records to ${path.relative(repoRoot, outputPath)}`);
