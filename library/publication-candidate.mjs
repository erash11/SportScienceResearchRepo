import { TAXONOMY } from "../evidence-taxonomy.mjs";

export const PUBLICATION_CANDIDATE_SCHEMA_VERSION =
  "ask-library-publication-candidate.v1";
export const ZOTERO_PUBLICATION_SCHEMA_VERSION =
  "ask-library-zotero-publication.v1";
export const READY_FOR_LIBRARY_REVIEW = "READY_FOR_LIBRARY_REVIEW";
export const PAPER_FIELDS = Object.freeze([
  "year",
  "citation",
  "doi",
  "abstract",
  "tldr",
  "methods",
  "findings",
  "limitations",
  "practicalImplications",
  "athleteDev",
  "rtp",
]);

const CANDIDATE_FIELDS = Object.freeze([
  "schemaVersion",
  "candidateId",
  "status",
  "preparedAt",
  "preparedBy",
  "publicSourceUrl",
  "source",
  "evidenceReview",
  "paper",
  "taxonomy",
]);
const SOURCE_FIELDS = Object.freeze([
  "kind",
  "itemKey",
  "itemVersion",
  "attachmentKey",
  "pageCount",
  "title",
  "doi",
  "year",
]);
const EVIDENCE_REVIEW_FIELDS = Object.freeze([
  "artifactType",
  "paperBriefPath",
  "paperBriefSha256",
  "fullTextReviewed",
  "evidenceLocatorPages",
]);
const TAXONOMY_FIELDS = Object.freeze([
  "domains",
  "audiences",
  "sports",
  "populations",
  "studyDesign",
]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function exactFields(value, expected) {
  return isObject(value)
    && JSON.stringify(Object.keys(value)) === JSON.stringify(expected);
}

function pushString(errors, value, path, minimum = 1) {
  if (cleanString(value).length < minimum) {
    errors.push(`${path} must contain at least ${minimum} characters.`);
  }
}

function normalizedIdentity(value) {
  return cleanString(value).toLocaleLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function normalizeDoi(value) {
  return cleanString(value)
    .toLocaleLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "")
    .replace(/[ .]+$/, "");
}

function validateControlledList(errors, value, path, vocabulary) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${path} must contain at least one controlled value.`);
    return;
  }
  if (new Set(value).size !== value.length) {
    errors.push(`${path} must not contain duplicate values.`);
  }
  for (const entry of value) {
    if (!vocabulary.includes(entry)) {
      errors.push(`${path} contains an unsupported value: ${entry}.`);
    }
  }
}

export function validatePublicationCandidate(candidate) {
  const errors = [];
  if (!isObject(candidate)) {
    return { valid: false, errors: ["Candidate must be a JSON object."] };
  }
  if (!exactFields(candidate, CANDIDATE_FIELDS)) {
    errors.push("Candidate has unexpected fields or field order.");
  }
  if (candidate.schemaVersion !== PUBLICATION_CANDIDATE_SCHEMA_VERSION) {
    errors.push(
      `schemaVersion must equal ${PUBLICATION_CANDIDATE_SCHEMA_VERSION}.`,
    );
  }
  if (candidate.status !== READY_FOR_LIBRARY_REVIEW) {
    errors.push(`status must equal ${READY_FOR_LIBRARY_REVIEW}.`);
  }
  pushString(errors, candidate.candidateId, "candidateId", 12);
  if (Number.isNaN(Date.parse(candidate.preparedAt))) {
    errors.push("preparedAt must be an ISO-compatible timestamp.");
  }
  pushString(errors, candidate.preparedBy, "preparedBy", 2);
  try {
    const url = new URL(candidate.publicSourceUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      errors.push("publicSourceUrl must use HTTP or HTTPS.");
    }
  } catch {
    errors.push("publicSourceUrl must be a valid public URL.");
  }

  const source = candidate.source;
  if (!exactFields(source, SOURCE_FIELDS)) {
    errors.push("source has unexpected fields or field order.");
  } else {
    if (source.kind !== "zotero") errors.push('source.kind must equal "zotero".');
    if (!/^[A-Z0-9]{6,16}$/i.test(cleanString(source.itemKey))) {
      errors.push("source.itemKey must be a Zotero item key.");
    }
    if (!Number.isInteger(source.itemVersion) || source.itemVersion < 1) {
      errors.push("source.itemVersion must be a positive integer.");
    }
    pushString(errors, source.attachmentKey, "source.attachmentKey", 6);
    if (!Number.isInteger(source.pageCount) || source.pageCount < 1) {
      errors.push("source.pageCount must be a positive integer.");
    }
    pushString(errors, source.title, "source.title", 5);
    if (!Number.isInteger(source.year) || source.year < 1900 || source.year > 2100) {
      errors.push("source.year must be a plausible publication year.");
    }
    const expectedId = `zotero-${source.itemKey}-v${source.itemVersion}`;
    if (candidate.candidateId !== expectedId) {
      errors.push(`candidateId must equal ${expectedId}.`);
    }
  }

  const evidence = candidate.evidenceReview;
  if (!exactFields(evidence, EVIDENCE_REVIEW_FIELDS)) {
    errors.push("evidenceReview has unexpected fields or field order.");
  } else {
    if (evidence.artifactType !== "paper-brief") {
      errors.push('evidenceReview.artifactType must equal "paper-brief".');
    }
    pushString(
      errors,
      evidence.paperBriefPath,
      "evidenceReview.paperBriefPath",
      10,
    );
    if (!/^[a-f0-9]{64}$/i.test(cleanString(evidence.paperBriefSha256))) {
      errors.push("evidenceReview.paperBriefSha256 must be a SHA-256 hash.");
    }
    if (evidence.fullTextReviewed !== true) {
      errors.push("evidenceReview.fullTextReviewed must be true.");
    }
    if (
      !Array.isArray(evidence.evidenceLocatorPages)
      || evidence.evidenceLocatorPages.length === 0
    ) {
      errors.push(
        "evidenceReview.evidenceLocatorPages must contain at least one page.",
      );
    } else {
      if (
        new Set(evidence.evidenceLocatorPages).size
        !== evidence.evidenceLocatorPages.length
      ) {
        errors.push(
          "evidenceReview.evidenceLocatorPages must not contain duplicates.",
        );
      }
      for (const page of evidence.evidenceLocatorPages) {
        if (
          !Number.isInteger(page)
          || page < 1
          || page > Number(source?.pageCount || 0)
        ) {
          errors.push(
            `evidenceReview.evidenceLocatorPages contains invalid page ${page}.`,
          );
        }
      }
    }
  }

  const paper = candidate.paper;
  if (!exactFields(paper, PAPER_FIELDS)) {
    errors.push("paper has unexpected fields or field order.");
  } else {
    if (!Number.isInteger(paper.year) || paper.year < 1900 || paper.year > 2100) {
      errors.push("paper.year must be a plausible publication year.");
    }
    for (const field of PAPER_FIELDS.filter(
      (name) => !["year", "doi"].includes(name),
    )) {
      pushString(errors, paper[field], `paper.${field}`, field === "citation" ? 10 : 20);
    }
    if (source && paper.year !== source.year) {
      errors.push("paper.year must match source.year.");
    }
    if (source && normalizeDoi(paper.doi) !== normalizeDoi(source.doi)) {
      errors.push("paper.doi must match source.doi.");
    }
    if (
      source
      && !normalizedIdentity(paper.citation).includes(
        normalizedIdentity(source.title),
      )
    ) {
      errors.push("paper.citation must contain source.title.");
    }
  }

  const taxonomy = candidate.taxonomy;
  if (!exactFields(taxonomy, TAXONOMY_FIELDS)) {
    errors.push("taxonomy has unexpected fields or field order.");
  } else {
    validateControlledList(errors, taxonomy.domains, "taxonomy.domains", TAXONOMY.domains);
    validateControlledList(
      errors,
      taxonomy.audiences,
      "taxonomy.audiences",
      TAXONOMY.audiences,
    );
    validateControlledList(errors, taxonomy.sports, "taxonomy.sports", TAXONOMY.sports);
    validateControlledList(
      errors,
      taxonomy.populations,
      "taxonomy.populations",
      TAXONOMY.populations,
    );
    if (!TAXONOMY.studyDesigns.includes(taxonomy.studyDesign)) {
      errors.push(
        `taxonomy.studyDesign contains an unsupported value: ${taxonomy.studyDesign}.`,
      );
    }
  }
  return { valid: errors.length === 0, errors };
}

export function candidateConflicts(candidate, papers, publications = []) {
  const conflicts = [];
  const doi = normalizeDoi(candidate?.paper?.doi);
  const citation = normalizedIdentity(candidate?.paper?.citation || "");
  for (const paper of papers || []) {
    if (doi && normalizeDoi(paper.doi) === doi) {
      conflicts.push(`DOI already belongs to Evidence Library ID ${paper.id}.`);
    }
    if (citation && normalizedIdentity(paper.citation) === citation) {
      conflicts.push(`Citation already belongs to Evidence Library ID ${paper.id}.`);
    }
  }
  for (const publication of publications || []) {
    if (publication?.candidate?.candidateId === candidate?.candidateId) continue;
    if (
      publication?.candidate?.source?.itemKey
      === candidate?.source?.itemKey
    ) {
      conflicts.push(
        `Zotero item ${candidate.source.itemKey} already has a staged publication.`,
      );
    }
    if (
      doi
      && normalizeDoi(publication?.candidate?.paper?.doi) === doi
    ) {
      conflicts.push(
        `DOI already belongs to publication ${publication.publicationId}.`,
      );
    }
  }
  return [...new Set(conflicts)];
}

export function approvePublicationCandidate(
  candidate,
  {
    paperId,
    reviewedBy,
    reviewedOn,
  },
) {
  const validation = validatePublicationCandidate(candidate);
  if (!validation.valid) {
    throw new Error(
      `Candidate validation failed:\n- ${validation.errors.join("\n- ")}`,
    );
  }
  const normalizedId = cleanString(paperId);
  if (!/^[1-9]\d*$/.test(normalizedId)) {
    throw new Error("paperId must be a positive numeric string.");
  }
  if (cleanString(reviewedBy).length < 2) {
    throw new Error("reviewedBy must name the accountable library reviewer.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanString(reviewedOn))) {
    throw new Error("reviewedOn must use YYYY-MM-DD.");
  }
  return {
    schemaVersion: ZOTERO_PUBLICATION_SCHEMA_VERSION,
    publicationId: `zotero-publication-${candidate.source.itemKey}-v${candidate.source.itemVersion}`,
    status: "STAGED",
    libraryReview: {
      paperId: normalizedId,
      reviewedBy: cleanString(reviewedBy),
      reviewedOn: cleanString(reviewedOn),
    },
    publication: {
      status: "STAGED",
      publishedOn: null,
    },
    candidate,
  };
}

export function validateZoteroPublication(publication) {
  const errors = [];
  if (!isObject(publication)) {
    return { valid: false, errors: ["Publication must be a JSON object."] };
  }
  if (publication.schemaVersion !== ZOTERO_PUBLICATION_SCHEMA_VERSION) {
    errors.push(
      `schemaVersion must equal ${ZOTERO_PUBLICATION_SCHEMA_VERSION}.`,
    );
  }
  const candidateValidation = validatePublicationCandidate(publication.candidate);
  errors.push(...candidateValidation.errors.map((error) => `candidate.${error}`));
  const expectedId = publication.candidate
    ? `zotero-publication-${publication.candidate.source.itemKey}-v${publication.candidate.source.itemVersion}`
    : "";
  if (publication.publicationId !== expectedId) {
    errors.push(`publicationId must equal ${expectedId}.`);
  }
  if (!["STAGED", "PUBLISHED"].includes(publication.status)) {
    errors.push('status must equal "STAGED" or "PUBLISHED".');
  }
  if (!/^[1-9]\d*$/.test(cleanString(publication.libraryReview?.paperId))) {
    errors.push("libraryReview.paperId must be a positive numeric string.");
  }
  pushString(
    errors,
    publication.libraryReview?.reviewedBy,
    "libraryReview.reviewedBy",
    2,
  );
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanString(publication.libraryReview?.reviewedOn))) {
    errors.push("libraryReview.reviewedOn must use YYYY-MM-DD.");
  }
  if (publication.publication?.status !== publication.status) {
    errors.push("publication.status must match status.");
  }
  if (
    publication.status === "PUBLISHED"
    && !/^\d{4}-\d{2}-\d{2}$/.test(
      cleanString(publication.publication?.publishedOn),
    )
  ) {
    errors.push("publication.publishedOn must use YYYY-MM-DD when published.");
  }
  if (
    publication.status === "STAGED"
    && publication.publication?.publishedOn !== null
  ) {
    errors.push("publication.publishedOn must be null while staged.");
  }
  return { valid: errors.length === 0, errors };
}

export function publishedPaperFromPublication(publication) {
  const candidate = publication.candidate;
  return {
    id: String(publication.libraryReview.paperId),
    year: candidate.paper.year,
    citation: candidate.paper.citation,
    doi: candidate.paper.doi,
    driveUrl: candidate.publicSourceUrl,
    abstract: candidate.paper.abstract,
    tldr: candidate.paper.tldr,
    methods: candidate.paper.methods,
    findings: candidate.paper.findings,
    limitations: candidate.paper.limitations,
    practicalImplications: candidate.paper.practicalImplications,
    athleteDev: candidate.paper.athleteDev,
    rtp: candidate.paper.rtp,
  };
}

export function taxonomyRecordFromPublication(publication) {
  return {
    id: String(publication.libraryReview.paperId),
    ...publication.candidate.taxonomy,
    sourceVerification: "Verified Zotero full text",
    reviewStatus: "Full-text reviewed and published",
    taxonomySource: "zotero-paper-brief",
  };
}

export function zoteroSourceLocator(publication) {
  return `zotero:${publication.candidate.source.itemKey}`;
}
