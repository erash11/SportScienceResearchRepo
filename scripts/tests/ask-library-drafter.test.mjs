import assert from "node:assert/strict";
import test from "node:test";
import {
  buildEvidencePack,
  finalizeDraft,
  locateExcerpt,
  parseComposerJson,
  rankRecords,
  tokenize,
} from "../../ask-library/drafter.mjs";

const BASE = "https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/SourcePapers/";
const papers = [
  { id: "10", year: 2021, citation: "Smith A. Fixture congestion and match running. Sports Med. 2021;1:1-2.", doi: "10.1/a", driveUrl: `${BASE}${encodeURIComponent("congestion.pdf")}`, tldr: "Fixture congestion did not reduce total distance.", abstract: "", findings: "", practicalImplications: "", athleteDev: "", rtp: "" },
  { id: "11", year: 2020, citation: "Jones B. Sleep and recovery in rugby. J Sports Sci. 2020;2:3-4.", doi: "10.1/b", driveUrl: `${BASE}${encodeURIComponent("sleep.pdf")}`, tldr: "Sleep extension improved recovery markers.", abstract: "", findings: "", practicalImplications: "", athleteDev: "", rtp: "" },
  { id: "12", year: 2019, citation: "Lee C. Congestion review held in Zotero. Sports Med. 2019;3:5-6.", doi: "10.1/c", driveUrl: "https://doi.org/10.1/c", tldr: "Fixture congestion and injury.", abstract: "", findings: "", practicalImplications: "", athleteDev: "", rtp: "" },
];
const papersById = new Map(papers.map((paper) => [paper.id, paper]));
const pages = {
  "congestion.pdf": ["Abstract. Fixture congestion had no impact on total distance cov-\nered in professional male soccer players across 14 studies.", "Results continued here with nothing else of note for the claim."],
  "sleep.pdf": ["Sleep extension of 90 minutes improved perceived recovery in 12 rugby players."],
};
const readPage = async (file, page) => pages[file]?.[page - 1] ?? "";
const pageCount = async (file) => pages[file]?.length ?? 0;
const request = {
  requestId: "ATL-R-20261009-TEST1",
  practicalQuestion: "How should we manage fixture congestion between two matches?",
  decisionContext: { population: "Collegiate", sport: "Soccer", phase: "In season", outcome: "Readiness", constraints: "" },
};

function draft(overrides = {}) {
  return {
    evidenceConfidence: { tier: "Moderate", rationale: "One direct review with limited transfer to collegiate athletes.", dimensions: {} },
    bottomLine: { text: "Total distance may hold under congestion.", claimIds: ["C1"] },
    recommendedDirection: { text: "Plan recovery-first sessions between matches.", claimIds: ["C1"] },
    actions: [{ title: "Recover", text: "Prioritize recovery between matches.", claimIds: ["C1", "C2"] }],
    monitoring: [],
    guardrails: [{ text: "Distance alone does not show recovery.", claimIds: ["C1"] }],
    limitations: [{ text: "Professional male soccer only.", claimIds: ["C1"] }],
    whatCouldChange: [{ text: "Collegiate data could change this.", claimIds: ["C1"] }],
    evidenceTension: null,
    claims: [
      { id: "C1", text: "Congestion did not affect pooled total distance.", evidence: [{ libraryId: "10", page: 2, excerpt: "Fixture congestion had no impact on total distance covered in professional male soccer players" }] },
      { id: "C2", text: "An invented claim with an invented quote.", evidence: [{ libraryId: "10", page: 1, excerpt: "congestion doubled injury rates in every study we reviewed here" }] },
    ],
    coverageGaps: [],
    ...overrides,
  };
}

test("locateExcerpt matches exact text and realigns hyphenated line breaks", () => {
  assert.equal(locateExcerpt("The quick brown fox jumps over the lazy dog", "quick brown fox jumps over")?.method, "exact");
  const realigned = locateExcerpt(pages["congestion.pdf"][0], "Fixture congestion had no impact on total distance covered in professional");
  assert.equal(realigned?.method, "realigned");
  assert.match(realigned.excerpt, /cov- ered/);
  assert.equal(locateExcerpt("Some unrelated page text about sleep", "fixture congestion doubled injury rates"), null);
});

test("finalizeDraft removes unverifiable claims, corrects pages, and validates", async () => {
  const { brief, validation } = await finalizeDraft({ draft: draft(), request, papersById, readPage, pageCount, briefId: "ATL-B-20261009-TEST1", createdAt: "2026-10-09T00:00:00.000Z" });
  assert.equal(validation.valid, true, validation.errors.join("; "));
  assert.deepEqual(brief.claims.map((claim) => claim.id), ["C1"]);
  assert.equal(brief.claims[0].evidence[0].page, 1);
  assert.deepEqual(brief.actions[0].claimIds, ["C1"]);
  assert.deepEqual(brief.sources.map((source) => source.libraryId), ["10"]);
  assert.equal(brief.status, "On-Demand");
  assert.equal(brief.reviewStatus, "Not Expert-Reviewed");
});

test("finalizeDraft turns a brief with no verified claims into a Coverage Gap", async () => {
  const bad = draft({ claims: [draft().claims[1]] });
  const { brief, validation } = await finalizeDraft({ draft: bad, request, papersById, readPage, pageCount, briefId: "ATL-B-20261009-TEST2", createdAt: "2026-10-09T00:00:00.000Z" });
  assert.equal(validation.valid, true, validation.errors.join("; "));
  assert.equal(brief.evidenceConfidence.tier, "Coverage Gap");
  assert.equal(brief.recommendedDirection, null);
  assert.equal(brief.claims.length, 0);
  assert.equal(brief.sources.length, 0);
});

test("finalizeDraft rejects evidence from records without an accessible original source", async () => {
  const zotero = draft({ claims: [{ id: "C1", text: "Congestion raised injury risk in one review.", evidence: [{ libraryId: "12", page: 1, excerpt: "Fixture congestion and injury in a review of many studies" }] }] });
  const { brief } = await finalizeDraft({ draft: zotero, request, papersById, readPage, pageCount, briefId: "ATL-B-20261009-TEST3", createdAt: "2026-10-09T00:00:00.000Z" });
  assert.equal(brief.evidenceConfidence.tier, "Coverage Gap");
});

test("finalizeDraft enforces confidence gating", async () => {
  const higher = draft({ evidenceConfidence: { tier: "Higher", rationale: "Several consistent direct sources were found.", dimensions: {} }, evidenceTension: { text: "Sources disagree on sprint distance.", claimIds: ["C1"] } });
  const tension = await finalizeDraft({ draft: higher, request, papersById, readPage, pageCount, briefId: "ATL-B-20261009-TEST4", createdAt: "2026-10-09T00:00:00.000Z" });
  assert.equal(tension.brief.evidenceConfidence.tier, "Moderate");
  const limited = draft({ evidenceConfidence: { tier: "Limited", rationale: "Only indirect evidence was located for this question.", dimensions: {} } });
  const gated = await finalizeDraft({ draft: limited, request, papersById, readPage, pageCount, briefId: "ATL-B-20261009-TEST5", createdAt: "2026-10-09T00:00:00.000Z" });
  assert.equal(gated.brief.recommendedDirection, null);
  assert.equal(gated.validation.valid, true, gated.validation.errors.join("; "));
});

test("rankRecords keeps inaccessible records as leads only", () => {
  const { supportable, leads } = rankRecords(request, papers, new Map(), { sourceAvailable: () => true });
  assert.ok(supportable.some((entry) => entry.paper.id === "10"));
  assert.ok(leads.some((entry) => entry.paper.id === "12"));
  assert.ok(!supportable.some((entry) => entry.paper.id === "12"));
});

test("buildEvidencePack keeps page numbers and parseComposerJson tolerates fences", () => {
  const pack = buildEvidencePack([{ paper: papers[0], pages: pages["congestion.pdf"] }], tokenize("fixture congestion distance"));
  assert.equal(pack[0].passages[0].page, 1);
  assert.deepEqual(parseComposerJson("Here:\n```json\n{\"a\":1}\n```"), { a: 1 });
});
