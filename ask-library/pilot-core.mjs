export const PILOT_SCHEMA_VERSION = 1;
export const CONFIDENCE_TIERS = Object.freeze([
  "Higher",
  "Moderate",
  "Limited",
  "Coverage Gap",
]);
export const DECISION_EFFECTS = Object.freeze([
  "informed",
  "confirmed",
  "changed",
  "not-yet",
  "no-effect",
]);
export const CONFIDENCE_CALIBRATIONS = Object.freeze([
  "too-cautious",
  "about-right",
  "too-confident",
]);
export const TIME_TO_UNDERSTANDING = Object.freeze([
  "under-2",
  "2-to-5",
  "over-5",
]);

const REQUEST_CONTEXT_FIELDS = Object.freeze([
  "population",
  "sport",
  "phase",
  "outcome",
  "constraints",
]);

const STATEMENT_COLLECTIONS = Object.freeze([
  "actions",
  "monitoring",
  "guardrails",
  "limitations",
  "whatCouldChange",
]);

const CONTEXT_LABELS = Object.freeze({
  population: "Population",
  sport: "Sport or setting",
  phase: "Phase",
  outcome: "Intended outcome",
  constraints: "Operational constraints",
});

const PUBLISHED_SOURCE_BASE =
  "https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/SourcePapers/";

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isIsoDate(value) {
  if (!cleanString(value)) return false;
  return !Number.isNaN(Date.parse(value));
}

function pushRequiredString(errors, value, path, minimum = 1) {
  const text = cleanString(value);
  if (text.length < minimum) {
    errors.push(`${path} must contain at least ${minimum} characters.`);
  }
}

function validateStatement(errors, statement, path, claimIds, { allowEmpty = false } = {}) {
  if (statement === null && allowEmpty) return;
  if (!isObject(statement)) {
    errors.push(`${path} must be an object with text and claimIds.`);
    return;
  }

  pushRequiredString(errors, statement.text, `${path}.text`, 5);
  if (!Array.isArray(statement.claimIds) || statement.claimIds.length === 0) {
    errors.push(`${path}.claimIds must identify at least one supporting claim.`);
    return;
  }

  for (const claimId of statement.claimIds) {
    if (!claimIds.has(claimId)) {
      errors.push(`${path}.claimIds references unknown claim "${claimId}".`);
    }
  }
}

export function createPilotId(prefix, now = new Date(), random = Math.random) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.floor(random() * 0x100000)
    .toString(16)
    .padStart(5, "0")
    .toUpperCase();
  return `${prefix}-${date}-${suffix}`;
}

export function createBriefRequest(
  form,
  {
    now = new Date(),
    requestId = createPilotId("ATL-R", now),
  } = {},
) {
  const decisionContext = Object.fromEntries(
    REQUEST_CONTEXT_FIELDS.map((field) => [field, cleanString(form?.[field])]),
  );

  return {
    schemaVersion: PILOT_SCHEMA_VERSION,
    requestId,
    createdAt: now.toISOString(),
    practicalQuestion: cleanString(form?.question ?? form?.practicalQuestion),
    decisionContext,
    deidentifiedAttestation: form?.deidentifiedAttestation === true,
    pilotStatus: "received",
  };
}

export function validateBriefRequest(request) {
  const errors = [];

  if (!isObject(request)) {
    return { valid: false, errors: ["Request must be a JSON object."] };
  }

  if (request.schemaVersion !== PILOT_SCHEMA_VERSION) {
    errors.push(`schemaVersion must equal ${PILOT_SCHEMA_VERSION}.`);
  }

  pushRequiredString(errors, request.requestId, "requestId", 8);
  if (!isIsoDate(request.createdAt)) {
    errors.push("createdAt must be an ISO-compatible date.");
  }
  pushRequiredString(errors, request.practicalQuestion, "practicalQuestion", 15);

  if (cleanString(request.practicalQuestion).length > 600) {
    errors.push("practicalQuestion must not exceed 600 characters.");
  }

  if (!isObject(request.decisionContext)) {
    errors.push("decisionContext must be an object.");
  } else {
    for (const field of REQUEST_CONTEXT_FIELDS) {
      if (typeof request.decisionContext[field] !== "string") {
        errors.push(`decisionContext.${field} must be a string.`);
      } else if (request.decisionContext[field].length > 300) {
        errors.push(`decisionContext.${field} must not exceed 300 characters.`);
      }
    }
  }

  if (request.deidentifiedAttestation !== true) {
    errors.push("deidentifiedAttestation must be true.");
  }

  if (request.pilotStatus !== "received") {
    errors.push('pilotStatus must equal "received".');
  }

  return { valid: errors.length === 0, errors };
}

export function validateDecisionBrief(brief) {
  const errors = [];
  const warnings = [];

  if (!isObject(brief)) {
    return { valid: false, errors: ["Brief must be a JSON object."], warnings };
  }

  if (brief.schemaVersion !== PILOT_SCHEMA_VERSION) {
    errors.push(`schemaVersion must equal ${PILOT_SCHEMA_VERSION}.`);
  }

  pushRequiredString(errors, brief.briefId, "briefId", 8);
  pushRequiredString(errors, brief.requestId, "requestId", 8);
  if (!Number.isInteger(brief.version) || brief.version < 1) {
    errors.push("version must be a positive integer.");
  }
  if (!isIsoDate(brief.createdAt)) {
    errors.push("createdAt must be an ISO-compatible date.");
  }
  if (brief.status !== "On-Demand") {
    errors.push('status must equal "On-Demand" for the concierge pilot.');
  }
  if (brief.reviewStatus !== "Not Expert-Reviewed") {
    errors.push('reviewStatus must equal "Not Expert-Reviewed" for an On-Demand pilot brief.');
  }
  pushRequiredString(errors, brief.practicalQuestion, "practicalQuestion", 15);

  if (!isObject(brief.decisionContext)) {
    errors.push("decisionContext must be an object.");
  }

  const tier = brief.evidenceConfidence?.tier;
  const isCoverageGap = tier === "Coverage Gap";
  if (!CONFIDENCE_TIERS.includes(tier)) {
    errors.push(`evidenceConfidence.tier must be one of: ${CONFIDENCE_TIERS.join(", ")}.`);
  }
  pushRequiredString(errors, brief.evidenceConfidence?.rationale, "evidenceConfidence.rationale", 20);

  const sources = Array.isArray(brief.sources) ? brief.sources : [];
  const claims = Array.isArray(brief.claims) ? brief.claims : [];
  if (!Array.isArray(brief.sources)) {
    errors.push("sources must be an array.");
  }
  if (!Array.isArray(brief.claims) || (!isCoverageGap && claims.length === 0)) {
    errors.push("claims must contain at least one source-grounded claim.");
  }

  const claimIds = new Set();
  const sourceIds = new Set();

  for (const [index, source] of sources.entries()) {
    const path = `sources[${index}]`;
    pushRequiredString(errors, source?.libraryId, `${path}.libraryId`);
    pushRequiredString(errors, source?.sourceFile, `${path}.sourceFile`, 5);
    pushRequiredString(errors, source?.citation, `${path}.citation`, 10);
    if (!Number.isInteger(source?.year)) {
      errors.push(`${path}.year must be an integer.`);
    }
    if (source?.fullTextReviewed !== true) {
      errors.push(`${path}.fullTextReviewed must be true.`);
    }
    if (sourceIds.has(source?.libraryId)) {
      errors.push(`${path}.libraryId duplicates another source.`);
    }
    sourceIds.add(source?.libraryId);
  }

  for (const [index, claim] of claims.entries()) {
    const path = `claims[${index}]`;
    pushRequiredString(errors, claim?.id, `${path}.id`);
    pushRequiredString(errors, claim?.text, `${path}.text`, 10);
    if (claimIds.has(claim?.id)) {
      errors.push(`${path}.id duplicates another claim.`);
    }
    claimIds.add(claim?.id);

    if (!Array.isArray(claim?.evidence) || claim.evidence.length === 0) {
      errors.push(`${path}.evidence must contain at least one original-source excerpt.`);
      continue;
    }

    for (const [evidenceIndex, evidence] of claim.evidence.entries()) {
      const evidencePath = `${path}.evidence[${evidenceIndex}]`;
      if (!sourceIds.has(evidence?.libraryId)) {
        errors.push(`${evidencePath}.libraryId references an unknown source.`);
      }
      if (!Number.isInteger(evidence?.page) || evidence.page < 1) {
        errors.push(`${evidencePath}.page must be a positive integer.`);
      }
      pushRequiredString(errors, evidence?.excerpt, `${evidencePath}.excerpt`, 5);
    }
  }

  const validateBriefStatement = (statement, path) => {
    if (isCoverageGap && isObject(statement) && Array.isArray(statement.claimIds) && statement.claimIds.length === 0) {
      pushRequiredString(errors, statement.text, `${path}.text`, 5);
      return;
    }
    validateStatement(errors, statement, path, claimIds);
  };

  validateBriefStatement(brief.bottomLine, "bottomLine");

  const recommendationAllowed = tier === "Higher" || tier === "Moderate";
  if (recommendationAllowed) {
    validateBriefStatement(brief.recommendedDirection, "recommendedDirection");
  } else if (brief.recommendedDirection !== null) {
    errors.push("recommendedDirection must be null for Limited confidence or a Coverage Gap.");
  }

  for (const collection of STATEMENT_COLLECTIONS) {
    if (!Array.isArray(brief[collection])) {
      errors.push(`${collection} must be an array.`);
      continue;
    }
    for (const [index, statement] of brief[collection].entries()) {
      validateBriefStatement(statement, `${collection}[${index}]`);
    }
  }

  if (brief.evidenceTension !== null) {
    validateBriefStatement(brief.evidenceTension, "evidenceTension");
    if (tier === "Higher") {
      errors.push("Evidence Tension prevents Higher confidence.");
    }
  }

  if (tier === "Coverage Gap" && sources.length > 0) {
    warnings.push("Coverage Gap briefs may list relevant leads, but those sources cannot support a recommendation.");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function prepareBriefForDelivery(brief) {
  const validation = validateDecisionBrief(brief);
  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors,
      warnings: validation.warnings,
      brief: null,
    };
  }

  const claims = brief.claims ?? [];
  const sourceViews = brief.sources.map((source) => {
    const sourceClaims = claims
      .filter((claim) => claim.evidence.some((evidence) => evidence.libraryId === source.libraryId))
      .map((claim) => ({
        id: claim.id,
        text: claim.text,
        evidence: claim.evidence
          .filter((evidence) => evidence.libraryId === source.libraryId)
          .map((evidence) => ({
            page: evidence.page,
            excerpt: evidence.excerpt,
          })),
      }));

    return {
      ...source,
      url: cleanString(source.url)
        || `${PUBLISHED_SOURCE_BASE}${encodeURIComponent(source.sourceFile)}`,
      doiUrl: cleanString(source.doi) ? `https://doi.org/${cleanString(source.doi)}` : "",
      claims: sourceClaims,
    };
  });

  const contextItems = REQUEST_CONTEXT_FIELDS
    .map((field) => ({
      field,
      label: CONTEXT_LABELS[field],
      value: cleanString(brief.decisionContext?.[field]),
    }))
    .filter((item) => item.value);

  return {
    valid: true,
    errors: [],
    warnings: validation.warnings,
    brief: {
      ...brief,
      contextItems,
      sources: sourceViews,
      sourceCount: sourceViews.length,
      isCoverageGap: brief.evidenceConfidence.tier === "Coverage Gap",
      hasRecommendedDirection: brief.recommendedDirection !== null,
    },
  };
}

export function createBriefFeedback(
  brief,
  input,
  {
    now = new Date(),
    feedbackId = createPilotId("ATL-F", now),
  } = {},
) {
  const closeoutCompleted = input?.closeoutCompleted === true;
  const clarity = Number(input?.directionClarity);

  return {
    schemaVersion: PILOT_SCHEMA_VERSION,
    feedbackId,
    briefId: cleanString(brief?.briefId),
    requestId: cleanString(brief?.requestId),
    briefVersion: Number(brief?.version),
    participantId: cleanString(input?.participantId).toUpperCase(),
    createdAt: now.toISOString(),
    useful: typeof input?.useful === "boolean" ? input.useful : null,
    decisionEffect: cleanString(input?.decisionEffect),
    decisionNote: cleanString(input?.decisionNote),
    directionClarity: Number.isInteger(clarity) ? clarity : null,
    confidenceCalibration: cleanString(input?.confidenceCalibration),
    missingOrMisapplied: cleanString(input?.missingOrMisapplied),
    timeToUnderstanding: cleanString(input?.timeToUnderstanding),
    participantCloseout: {
      completed: closeoutCompleted,
      wouldReuse:
        closeoutCompleted && typeof input?.wouldReuse === "boolean"
          ? input.wouldReuse
          : null,
      questionTypes: closeoutCompleted ? cleanString(input?.questionTypes) : "",
      largestFriction: closeoutCompleted ? cleanString(input?.largestFriction) : "",
    },
    deidentifiedAttestation: input?.deidentifiedAttestation === true,
    feedbackStatus: "captured",
  };
}

export function validateBriefFeedback(feedback) {
  const errors = [];

  if (!isObject(feedback)) {
    return { valid: false, errors: ["Feedback must be a JSON object."] };
  }

  if (feedback.schemaVersion !== PILOT_SCHEMA_VERSION) {
    errors.push(`schemaVersion must equal ${PILOT_SCHEMA_VERSION}.`);
  }
  pushRequiredString(errors, feedback.feedbackId, "feedbackId", 8);
  pushRequiredString(errors, feedback.briefId, "briefId", 8);
  pushRequiredString(errors, feedback.requestId, "requestId", 8);
  if (!Number.isInteger(feedback.briefVersion) || feedback.briefVersion < 1) {
    errors.push("briefVersion must be a positive integer.");
  }
  if (!/^P\d{2}$/.test(cleanString(feedback.participantId))) {
    errors.push('participantId must use the anonymous format "P01".');
  }
  if (!isIsoDate(feedback.createdAt)) {
    errors.push("createdAt must be an ISO-compatible date.");
  }
  if (typeof feedback.useful !== "boolean") {
    errors.push("useful must be true or false.");
  }
  if (!DECISION_EFFECTS.includes(feedback.decisionEffect)) {
    errors.push(`decisionEffect must be one of: ${DECISION_EFFECTS.join(", ")}.`);
  }
  if (
    ["informed", "confirmed", "changed"].includes(feedback.decisionEffect)
    && cleanString(feedback.decisionNote).length < 10
  ) {
    errors.push("decisionNote must briefly describe the affected decision.");
  }
  if (
    !Number.isInteger(feedback.directionClarity)
    || feedback.directionClarity < 1
    || feedback.directionClarity > 5
  ) {
    errors.push("directionClarity must be an integer from 1 to 5.");
  }
  if (!CONFIDENCE_CALIBRATIONS.includes(feedback.confidenceCalibration)) {
    errors.push(
      `confidenceCalibration must be one of: ${CONFIDENCE_CALIBRATIONS.join(", ")}.`,
    );
  }
  if (!TIME_TO_UNDERSTANDING.includes(feedback.timeToUnderstanding)) {
    errors.push(
      `timeToUnderstanding must be one of: ${TIME_TO_UNDERSTANDING.join(", ")}.`,
    );
  }
  if (cleanString(feedback.decisionNote).length > 600) {
    errors.push("decisionNote must not exceed 600 characters.");
  }
  if (cleanString(feedback.missingOrMisapplied).length > 600) {
    errors.push("missingOrMisapplied must not exceed 600 characters.");
  }

  if (!isObject(feedback.participantCloseout)) {
    errors.push("participantCloseout must be an object.");
  } else if (feedback.participantCloseout.completed === true) {
    if (typeof feedback.participantCloseout.wouldReuse !== "boolean") {
      errors.push("participantCloseout.wouldReuse must be true or false.");
    }
    pushRequiredString(
      errors,
      feedback.participantCloseout.questionTypes,
      "participantCloseout.questionTypes",
      3,
    );
    pushRequiredString(
      errors,
      feedback.participantCloseout.largestFriction,
      "participantCloseout.largestFriction",
      3,
    );
    if (cleanString(feedback.participantCloseout.questionTypes).length > 600) {
      errors.push("participantCloseout.questionTypes must not exceed 600 characters.");
    }
    if (cleanString(feedback.participantCloseout.largestFriction).length > 600) {
      errors.push("participantCloseout.largestFriction must not exceed 600 characters.");
    }
  }

  if (feedback.deidentifiedAttestation !== true) {
    errors.push("deidentifiedAttestation must be true.");
  }
  if (feedback.feedbackStatus !== "captured") {
    errors.push('feedbackStatus must equal "captured".');
  }

  return { valid: errors.length === 0, errors };
}

function normalizeExcerpt(value) {
  return cleanString(value)
    .normalize("NFKC")
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en-US");
}

export async function auditDecisionBrief(
  brief,
  {
    papers,
    readSourcePage,
  },
) {
  const structural = validateDecisionBrief(brief);
  const errors = [...structural.errors];
  const warnings = [...structural.warnings];
  const paperById = new Map((papers ?? []).map((paper) => [String(paper.id), paper]));

  if (!structural.valid) {
    return { valid: false, errors, warnings, excerptsChecked: 0 };
  }
  if (typeof readSourcePage !== "function") {
    return {
      valid: false,
      errors: ["readSourcePage adapter is required for original-source auditing."],
      warnings,
      excerptsChecked: 0,
    };
  }

  for (const source of brief.sources) {
    const paper = paperById.get(String(source.libraryId));
    if (!paper) {
      errors.push(`Library source ${source.libraryId} does not exist in papers.json.`);
      continue;
    }
    if (cleanString(paper.citation) !== cleanString(source.citation)) {
      errors.push(`Library source ${source.libraryId} citation does not match papers.json.`);
    }
    const decodedUrl = decodeURIComponent(cleanString(paper.driveUrl));
    if (!decodedUrl.endsWith(source.sourceFile)) {
      errors.push(`Library source ${source.libraryId} sourceFile does not match its published reference.`);
    }
  }

  let excerptsChecked = 0;
  for (const claim of brief.claims) {
    for (const evidence of claim.evidence) {
      const source = brief.sources.find((item) => item.libraryId === evidence.libraryId);
      if (!source) continue;

      try {
        const pageText = await readSourcePage(source.sourceFile, evidence.page);
        excerptsChecked += 1;
        if (!normalizeExcerpt(pageText).includes(normalizeExcerpt(evidence.excerpt))) {
          errors.push(
            `Claim ${claim.id} excerpt was not found on page ${evidence.page} of source ${evidence.libraryId}.`,
          );
        }
      } catch (error) {
        errors.push(`Could not read source ${evidence.libraryId}, page ${evidence.page}: ${error.message}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    excerptsChecked,
  };
}

function calendarDaysBetween(start, end) {
  const milliseconds = Date.parse(end) - Date.parse(start);
  return Math.floor(milliseconds / 86_400_000) + 1;
}

export function evaluatePilot(scorecard) {
  const participants = Array.isArray(scorecard?.participants) ? scorecard.participants : [];
  const requests = Array.isArray(scorecard?.requests) ? scorecard.requests : [];
  const briefs = Array.isArray(scorecard?.briefs) ? scorecard.briefs : [];
  const audits = Array.isArray(scorecard?.audits) ? scorecard.audits : [];
  const useSignals = Array.isArray(scorecard?.useSignals) ? scorecard.useSignals : [];
  const functions = new Set(participants.map((participant) => cleanString(participant.function)).filter(Boolean));
  const participantIds = new Set(participants.map((participant) => participant.participantId));
  const requestIds = new Set(requests.map((request) => request.requestId));
  const briefIds = new Set(briefs.map((brief) => brief.briefId));
  const requestsPerParticipant = new Map(
    participants.map((participant) => [
      participant.participantId,
      requests.filter((request) => request.participantId === participant.participantId).length,
    ]),
  );
  const auditedBriefIds = new Set(audits.map((audit) => audit.briefId));
  const criticalFailures = audits.reduce(
    (total, audit) => total + Number(audit.criticalFailures ?? 0),
    0,
  );
  const usefulCount = useSignals.filter((signal) => signal.useful === true).length;
  const reuseCount = participants.filter((participant) => participant.wouldReuse === true).length;
  const influencedCount = useSignals.filter(
    (signal) =>
      signal.influencedDecision === "yes"
      || ["informed", "confirmed", "changed"].includes(signal.decisionEffect),
  ).length;
  const pilotDays = calendarDaysBetween(scorecard?.pilot?.startedOn, scorecard?.pilot?.endedOn);

  const gates = [
    {
      id: "duration",
      label: "Two-week pilot",
      pass: Number.isFinite(pilotDays) && pilotDays >= 14,
      observed: `${Number.isFinite(pilotDays) ? pilotDays : 0} days`,
      required: "14 days",
    },
    {
      id: "participants",
      label: "Three participating staff",
      pass: participants.length === 3 && participantIds.size === 3,
      observed: participants.length,
      required: 3,
    },
    {
      id: "functions",
      label: "At least two functional disciplines",
      pass: functions.size >= 2,
      observed: functions.size,
      required: 2,
    },
    {
      id: "questions",
      label: "Nine real Practical Questions, three per participant",
      pass:
        requests.length === 9
        && requestIds.size === 9
        && briefs.length === 9
        && briefIds.size === 9
        && [...requestsPerParticipant.values()].every((count) => count === 3)
        && briefs.every((brief) => requestIds.has(brief.requestId)),
      observed: `${requests.length} requests / ${briefs.length} briefs`,
      required: "9 / 9",
    },
    {
      id: "audits",
      label: "Every brief audited",
      pass: briefs.length >= 9 && briefs.every((brief) => auditedBriefIds.has(brief.briefId)),
      observed: `${auditedBriefIds.size} audited`,
      required: "all 9",
    },
    {
      id: "integrity",
      label: "No unresolved critical Evidence Integrity failure",
      pass: criticalFailures === 0,
      observed: criticalFailures,
      required: 0,
    },
    {
      id: "useful",
      label: "At least seven briefs useful",
      pass: usefulCount >= 7,
      observed: usefulCount,
      required: 7,
    },
    {
      id: "reuse",
      label: "At least two participants would reuse",
      pass: reuseCount >= 2,
      observed: reuseCount,
      required: 2,
    },
    {
      id: "decision",
      label: "At least one brief informed or confirmed a decision",
      pass: influencedCount >= 1,
      observed: influencedCount,
      required: 1,
    },
  ];

  return {
    expansionWarranted: gates.every((gate) => gate.pass),
    gates,
  };
}
