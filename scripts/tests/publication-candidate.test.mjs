import assert from "node:assert/strict";
import test from "node:test";

import {
  approvePublicationCandidate,
  candidateConflicts,
  publishedPaperFromPublication,
  taxonomyRecordFromPublication,
  validatePublicationCandidate,
  validateZoteroPublication,
  zoteroSourceLocator,
} from "../../library/publication-candidate.mjs";

function candidate() {
  return {
    schemaVersion: "ask-library-publication-candidate.v1",
    candidateId: "zotero-PAPER1-v10",
    status: "READY_FOR_LIBRARY_REVIEW",
    preparedAt: "2026-07-24T12:00:00Z",
    preparedBy: "Integration test",
    publicSourceUrl: "https://doi.org/10.1000/example",
    source: {
      kind: "zotero",
      itemKey: "PAPER1",
      itemVersion: 10,
      attachmentKey: "ATTACH1",
      pageCount: 8,
      title: "Training Load and Return to Play",
      doi: "10.1000/example",
      year: 2024,
    },
    evidenceReview: {
      artifactType: "paper-brief",
      paperBriefPath: "Knowledge/library/research-papers/example.md",
      paperBriefSha256: "a".repeat(64),
      fullTextReviewed: true,
      evidenceLocatorPages: [3, 5],
    },
    paper: {
      year: 2024,
      citation: (
        "Researcher A. Training Load and Return to Play. "
        + "Journal of Testing. 2024. https://doi.org/10.1000/example"
      ),
      doi: "10.1000/example",
      abstract: "A prospective study of training load and return-to-play outcomes.",
      tldr: "Training load was associated with the measured outcome in this cohort.",
      methods: "The study used a prospective cohort design with repeated load monitoring.",
      findings: "Training load was associated with the measured outcome in the study sample.",
      limitations: "The single-site observational design limits causal and broad inference.",
      practicalImplications: "Use load trends as context alongside clinical and athlete information.",
      athleteDev: "Use repeated measures to inform individualized performance planning.",
      rtp: "Use load exposure as one part of a broader return-to-sport decision process.",
    },
    taxonomy: {
      domains: ["Training & Performance"],
      audiences: ["Performance"],
      sports: ["Mixed / General Sport"],
      populations: ["Collegiate"],
      studyDesign: "Cohort Study",
    },
  };
}

test("validates the producer-compatible candidate interface", () => {
  assert.deepEqual(validatePublicationCandidate(candidate()), {
    valid: true,
    errors: [],
  });
});

test("rejects unsupported taxonomy and invalid locator pages", () => {
  const value = candidate();
  value.taxonomy.sports = ["Quidditch"];
  value.evidenceReview.evidenceLocatorPages = [9];
  const result = validatePublicationCandidate(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /unsupported value/);
  assert.match(result.errors.join("\n"), /invalid page 9/);
});

test("detects DOI and citation conflicts before staging", () => {
  const value = candidate();
  const conflicts = candidateConflicts(value, [
    {
      id: "12",
      doi: "https://doi.org/10.1000/example",
      citation: value.paper.citation,
    },
  ]);
  assert.equal(conflicts.length, 2);
});

test("approves, validates, and maps a staged candidate", () => {
  const publication = approvePublicationCandidate(candidate(), {
    paperId: "576",
    reviewedBy: "Eric Rash",
    reviewedOn: "2026-07-24",
  });
  assert.deepEqual(validateZoteroPublication(publication), {
    valid: true,
    errors: [],
  });
  assert.equal(publishedPaperFromPublication(publication).id, "576");
  assert.equal(
    taxonomyRecordFromPublication(publication).taxonomySource,
    "zotero-paper-brief",
  );
  assert.equal(zoteroSourceLocator(publication), "zotero:PAPER1");
});
