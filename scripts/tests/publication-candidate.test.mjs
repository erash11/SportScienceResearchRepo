import assert from "node:assert/strict";
import test from "node:test";

import {
  approvePublicationCandidate,
  assertZoteroSourceIdentity,
  candidateConflicts,
  expectedEvidenceLibraryId,
  nextEvidenceLibraryId,
  parseZoteroSourceLocator,
  publicationPaperIdConflicts,
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

test("accepts schema-compatible fields in any JSON object order", () => {
  const value = candidate();
  const reordered = Object.fromEntries(Object.entries(value).reverse());
  reordered.source = Object.fromEntries(Object.entries(value.source).reverse());
  reordered.paper = Object.fromEntries(Object.entries(value.paper).reverse());
  assert.deepEqual(validatePublicationCandidate(reordered), {
    valid: true,
    errors: [],
  });
});

test("rejects private source URLs, non-string DOIs, and non-RFC3339 timestamps", () => {
  const value = candidate();
  value.publicSourceUrl = "https://127.0.0.1/private.pdf";
  value.preparedAt = "July 24, 2026";
  value.source.doi = 1000;
  value.paper.doi = 1000;
  const result = validatePublicationCandidate(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /valid public URL/);
  assert.match(result.errors.join("\n"), /RFC 3339/);
  assert.match(result.errors.join("\n"), /source\.doi must be a string/);
  assert.match(result.errors.join("\n"), /paper\.doi must be a string/);
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

test("detects citation conflicts with another staged candidate", () => {
  const stagedCandidate = candidate();
  stagedCandidate.candidateId = "zotero-PAPER2-v11";
  stagedCandidate.source.itemKey = "PAPER2";
  stagedCandidate.source.itemVersion = 11;
  stagedCandidate.source.doi = "10.1000/other";
  stagedCandidate.paper.doi = "10.1000/other";
  const staged = approvePublicationCandidate(stagedCandidate, {
    paperId: "576",
    reviewedBy: "Eric Rash",
    reviewedOn: "2026-07-24",
  });
  const conflicts = candidateConflicts(candidate(), [], [staged]);
  assert.equal(conflicts.length, 1);
  assert.match(conflicts[0], /Citation already belongs/);
});

test("reserves stable IDs across staged publications", () => {
  const staged = approvePublicationCandidate(candidate(), {
    paperId: "576",
    reviewedBy: "Eric Rash",
    reviewedOn: "2026-07-24",
  });
  const duplicate = {
    ...staged,
    publicationId: "zotero-publication-PAPER2-v11",
  };
  assert.equal(nextEvidenceLibraryId([{ id: "575" }], [staged]), "577");
  assert.match(
    publicationPaperIdConflicts([staged, duplicate]).join("\n"),
    /reserved by both/,
  );
});

test("re-staging a candidate preserves its reserved ID", () => {
  const staged = approvePublicationCandidate(candidate(), {
    paperId: "576",
    reviewedBy: "Eric Rash",
    reviewedOn: "2026-07-24",
  });
  const laterCandidate = candidate();
  laterCandidate.candidateId = "zotero-PAPER2-v11";
  laterCandidate.source.itemKey = "PAPER2";
  laterCandidate.source.itemVersion = 11;
  const later = approvePublicationCandidate(laterCandidate, {
    paperId: "577",
    reviewedBy: "Eric Rash",
    reviewedOn: "2026-07-25",
  });

  assert.equal(
    expectedEvidenceLibraryId(candidate(), [{ id: "575" }], [staged, later]),
    "576",
  );
  const newCandidate = candidate();
  newCandidate.candidateId = "zotero-PAPER3-v12";
  assert.equal(
    expectedEvidenceLibraryId(newCandidate, [{ id: "575" }], [staged, later]),
    "578",
  );
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
  const locator = "zotero:PAPER1@10#ATTACH1";
  assert.equal(zoteroSourceLocator(publication), locator);
  assert.deepEqual(parseZoteroSourceLocator(locator), {
    itemKey: "PAPER1",
    itemVersion: 10,
    attachmentKey: "ATTACH1",
  });
  assert.deepEqual(
    assertZoteroSourceIdentity(locator, {
      key: "PAPER1",
      version: 10,
      attachments: [{ key: "ATTACH1" }],
    }),
    {
      itemKey: "PAPER1",
      itemVersion: 10,
      attachmentKey: "ATTACH1",
    },
  );
  assert.throws(
    () => assertZoteroSourceIdentity(locator, {
      key: "PAPER1",
      version: 11,
      attachments: [{ key: "ATTACH1" }],
    }),
    /no longer matches published version/,
  );
});
