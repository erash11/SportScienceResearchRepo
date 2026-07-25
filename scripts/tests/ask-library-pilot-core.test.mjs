import assert from "node:assert/strict";
import test from "node:test";
import {
  auditDecisionBrief,
  createBriefFeedback,
  createBriefRequest,
  evaluatePilot,
  prepareBriefForDelivery,
  validateBriefFeedback,
  validateBriefRequest,
  validateDecisionBrief,
} from "../../ask-library/pilot-core.mjs";

const request = createBriefRequest(
  {
    question: "How should we adjust training during a congested competition week?",
    population: "Collegiate starters",
    sport: "Team sport",
    phase: "Between competitions (<96 hours)",
    outcome: "Preserve readiness",
    constraints: "Travel",
    deidentifiedAttestation: true,
  },
  {
    now: new Date("2026-08-03T14:00:00.000Z"),
    requestId: "ATL-R-20260803-TEST1",
  },
);

const brief = {
  schemaVersion: 1,
  briefId: "ATL-B-20260803-TEST1",
  requestId: request.requestId,
  version: 1,
  createdAt: "2026-08-03T16:00:00.000Z",
  status: "On-Demand",
  reviewStatus: "Not Expert-Reviewed",
  practicalQuestion: request.practicalQuestion,
  decisionContext: request.decisionContext,
  evidenceConfidence: {
    tier: "Moderate",
    rationale: "One directly relevant review is supported by broader recovery evidence.",
  },
  bottomLine: { text: "Use a recovery-priority plan.", claimIds: ["C1"] },
  recommendedDirection: { text: "Remove nonessential load.", claimIds: ["C1"] },
  actions: [{ text: "Separate exposure groups.", claimIds: ["C1"] }],
  monitoring: [{ text: "Use multiple within-athlete signals.", claimIds: ["C1"] }],
  guardrails: [{ text: "Do not use one universal threshold.", claimIds: ["C1"] }],
  limitations: [{ text: "Transferability to collegiate teams is uncertain.", claimIds: ["C1"] }],
  whatCouldChange: [{ text: "Direct collegiate evidence could change the direction.", claimIds: ["C1"] }],
  evidenceTension: { text: "Total distance may be stable while other outcomes vary.", claimIds: ["C1"] },
  sources: [
    {
      libraryId: "448",
      sourceFile: "fixture.pdf",
      citation: "Example citation for the fixture-congestion source.",
      year: 2021,
      fullTextReviewed: true,
    },
  ],
  claims: [
    {
      id: "C1",
      text: "Fixture congestion had no impact on total distance covered.",
      evidence: [
        {
          libraryId: "448",
          page: 1,
          excerpt: "Fixture congestion had no impact on total distance covered",
        },
      ],
    },
  ],
};

test("creates a valid de-identified pilot request", () => {
  assert.deepEqual(validateBriefRequest(request), { valid: true, errors: [] });
  assert.equal(request.deidentifiedAttestation, true);
});

test("rejects requests without the de-identification attestation", () => {
  const result = validateBriefRequest({ ...request, deidentifiedAttestation: false });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /deidentifiedAttestation/);
});

test("enforces confidence-gated recommendations", () => {
  assert.equal(validateDecisionBrief(brief).valid, true);
  const result = validateDecisionBrief({
    ...brief,
    evidenceConfidence: { tier: "Limited", rationale: brief.evidenceConfidence.rationale },
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /recommendedDirection must be null/);
});

test("permits an honest Coverage Gap without source-grounded claims", () => {
  const coverageGap = {
    ...brief,
    evidenceConfidence: {
      tier: "Coverage Gap",
      rationale: "The accessible Evidence Library sources do not directly address this decision context.",
    },
    bottomLine: {
      text: "The library does not contain enough directly relevant evidence to support a direction.",
      claimIds: [],
    },
    recommendedDirection: null,
    actions: [],
    monitoring: [],
    guardrails: [],
    limitations: [
      {
        text: "Relevant original source text was not available for synthesis.",
        claimIds: [],
      },
    ],
    whatCouldChange: [
      {
        text: "Adding directly relevant full-text evidence could enable a future brief.",
        claimIds: [],
      },
    ],
    evidenceTension: null,
    sources: [],
    claims: [],
  };
  assert.equal(validateDecisionBrief(coverageGap).valid, true);
});

test("returns validation errors instead of throwing on malformed collections", () => {
  const result = validateDecisionBrief({
    ...brief,
    sources: {},
    claims: {},
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /sources must be an array/);
  assert.match(result.errors.join(" "), /claims must contain/);
});

test("prepares a validated brief for generic delivery", () => {
  const result = prepareBriefForDelivery(brief);
  assert.equal(result.valid, true);
  assert.equal(result.brief.sourceCount, 1);
  assert.equal(result.brief.sources[0].claims[0].id, "C1");
  assert.match(result.brief.sources[0].url, /fixture\.pdf$/);
  assert.deepEqual(
    result.brief.contextItems.map((item) => item.label),
    [
      "Population",
      "Sport or setting",
      "Phase",
      "Intended outcome",
      "Operational constraints",
    ],
  );
});

test("rejects an invalid brief before delivery", () => {
  const result = prepareBriefForDelivery({ ...brief, recommendedDirection: null });
  assert.equal(result.valid, false);
  assert.equal(result.brief, null);
  assert.match(result.errors.join(" "), /recommendedDirection/);
});

test("prevents Higher confidence when Evidence Tension is present", () => {
  const result = validateDecisionBrief({
    ...brief,
    evidenceConfidence: { tier: "Higher", rationale: brief.evidenceConfidence.rationale },
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /Evidence Tension prevents Higher confidence/);
});

test("audits claim excerpts through the source-text adapter", async () => {
  const papers = [
    {
      id: "448",
      citation: brief.sources[0].citation,
      driveUrl: "https://example.test/SourcePapers/fixture.pdf",
    },
  ];
  const result = await auditDecisionBrief(brief, {
    papers,
    readSourcePage: async () => "Fixture congestion had no impact on total distance covered.",
  });
  assert.equal(result.valid, true);
  assert.equal(result.excerptsChecked, 1);
});

test("audits a Zotero-backed source through injected source adapters", async () => {
  const zoteroBrief = {
    ...brief,
    sources: [
      {
        ...brief.sources[0],
        sourceFile: "zotero:PAPER1",
      },
    ],
  };
  const papers = [
    {
      id: "448",
      citation: brief.sources[0].citation,
      driveUrl: "https://doi.org/10.1000/example",
    },
  ];
  const result = await auditDecisionBrief(zoteroBrief, {
    papers,
    resolveLibrarySource: async () => "zotero:PAPER1",
    readSourcePage: async (locator) => {
      assert.equal(locator, "zotero:PAPER1");
      return "Fixture congestion had no impact on total distance covered.";
    },
  });
  assert.equal(result.valid, true);
  assert.equal(result.excerptsChecked, 1);
});

test("fails the source audit when an excerpt cannot be located", async () => {
  const papers = [
    {
      id: "448",
      citation: brief.sources[0].citation,
      driveUrl: "https://example.test/SourcePapers/fixture.pdf",
    },
  ];
  const result = await auditDecisionBrief(brief, {
    papers,
    readSourcePage: async () => "Different source text.",
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /excerpt was not found/);
});

test("creates schema-valid anonymous feedback tied to the brief", () => {
  const feedback = createBriefFeedback(
    brief,
    {
      participantId: "p01",
      useful: true,
      decisionEffect: "confirmed",
      decisionNote: "Confirmed the planned reduction in nonessential field work.",
      directionClarity: "5",
      confidenceCalibration: "about-right",
      missingOrMisapplied: "Nothing material.",
      timeToUnderstanding: "under-2",
      closeoutCompleted: false,
      deidentifiedAttestation: true,
    },
    {
      now: new Date("2026-08-05T18:00:00.000Z"),
      feedbackId: "ATL-F-20260805-TEST1",
    },
  );

  assert.equal(feedback.participantId, "P01");
  assert.equal(feedback.briefId, brief.briefId);
  assert.deepEqual(validateBriefFeedback(feedback), { valid: true, errors: [] });
});

test("requires decision detail and complete third-brief closeout feedback", () => {
  const feedback = createBriefFeedback(
    brief,
    {
      participantId: "P01",
      useful: true,
      decisionEffect: "changed",
      decisionNote: "",
      directionClarity: 4,
      confidenceCalibration: "about-right",
      timeToUnderstanding: "2-to-5",
      closeoutCompleted: true,
      wouldReuse: null,
      questionTypes: "",
      largestFriction: "",
      deidentifiedAttestation: true,
    },
    {
      now: new Date("2026-08-05T18:00:00.000Z"),
      feedbackId: "ATL-F-20260805-TEST2",
    },
  );
  const result = validateBriefFeedback(feedback);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /decisionNote/);
  assert.match(result.errors.join(" "), /wouldReuse/);
  assert.match(result.errors.join(" "), /questionTypes/);
  assert.match(result.errors.join(" "), /largestFriction/);
});

test("evaluates the confirmed pilot expansion gates", () => {
  const scorecard = {
    pilot: { startedOn: "2026-08-03", endedOn: "2026-08-16" },
    participants: [
      { participantId: "P01", function: "Performance", wouldReuse: true },
      { participantId: "P02", function: "Athletic Medicine", wouldReuse: true },
      { participantId: "P03", function: "Performance", wouldReuse: false },
    ],
    requests: Array.from({ length: 9 }, (_, index) => ({
      requestId: `R${index + 1}`,
      participantId: `P0${Math.floor(index / 3) + 1}`,
    })),
    briefs: Array.from({ length: 9 }, (_, index) => ({
      briefId: `B${index + 1}`,
      requestId: `R${index + 1}`,
    })),
    audits: Array.from({ length: 9 }, (_, index) => ({
      briefId: `B${index + 1}`,
      criticalFailures: 0,
    })),
    useSignals: Array.from({ length: 9 }, (_, index) => ({
      briefId: `B${index + 1}`,
      useful: index < 7,
      decisionEffect: index === 0 ? "confirmed" : "not-yet",
    })),
  };

  const result = evaluatePilot(scorecard);
  assert.equal(result.expansionWarranted, true);
  assert.equal(result.gates.every((gate) => gate.pass), true);
});
