// Ask the Library drafter core: retrieval, evidence packs, and draft finalization.
//
// The composer (an LLM) is injected by the CLI. Everything here is deterministic so the
// integrity rules (ADR 0002, 0006, 0009) are enforced in code rather than trusted to the model:
// only published local-source records can support claims, every excerpt must be found in the
// original page text, unsupported claims and statements are removed, and confidence gating is
// re-applied after removal.

import { CONFIDENCE_TIERS, validateDecisionBrief } from "./pilot-core.mjs";

export const DRAFTER_VERSION = "1.2.0";

const STOPWORDS = new Set(
  ("a about above after again against all am an and any are as at be because been before being below between both but by "
    + "can could did do does doing down during each few for from further had has have having he her here hers him his how i if "
    + "in into is it its itself just me more most my no nor not now of off on once only or other our ours out over own same she "
    + "should so some such than that the their theirs them then there these they this those through to too under until up very "
    + "was we were what when where which while who whom why will with would you your yours staff athlete athletes collegiate "
    + "decide deciding decision should how what when which whether").split(/\s+/),
);

export function tokenize(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token))
    .map(stem);
}

// Light suffix stripping so "jumps", "jumping" and "jump" share a term.
function stem(token) {
  return token
    .replace(/(ations|ation|ings|ing|ies|ied|ers|er|ed|es|s)$/u, "")
    .slice(0, 12) || token;
}

export function extractTitle(citation) {
  const parts = String(citation ?? "").split(". ");
  return parts.length > 1 ? parts[1] : String(citation ?? "");
}

export function localSourceFile(paper) {
  const url = String(paper?.driveUrl ?? paper?.sourceUrl ?? "");
  const marker = "/SourcePapers/";
  const index = url.indexOf(marker);
  return index === -1 ? "" : decodeURIComponent(url.slice(index + marker.length));
}

export function requestQueryText(request) {
  const context = request?.decisionContext ?? {};
  return [
    request?.practicalQuestion,
    request?.practicalQuestion,
    context.outcome,
    context.phase,
    context.population,
    context.sport,
  ].filter(Boolean).join(" ");
}

class Bm25 {
  constructor(documents, { k1 = 1.4, b = 0.75 } = {}) {
    this.k1 = k1;
    this.b = b;
    this.docs = documents.map((tokens) => {
      const tf = new Map();
      for (const token of tokens) tf.set(token, (tf.get(token) ?? 0) + 1);
      return { tf, length: tokens.length };
    });
    this.avgLength = this.docs.reduce((sum, doc) => sum + doc.length, 0) / Math.max(1, this.docs.length);
    this.df = new Map();
    for (const doc of this.docs) for (const token of doc.tf.keys()) this.df.set(token, (this.df.get(token) ?? 0) + 1);
  }

  idf(token) {
    const n = this.docs.length;
    const df = this.df.get(token) ?? 0;
    return Math.log(1 + (n - df + 0.5) / (df + 0.5));
  }

  score(index, queryTokens) {
    const doc = this.docs[index];
    let total = 0;
    for (const token of new Set(queryTokens)) {
      const tf = doc.tf.get(token);
      if (!tf) continue;
      const norm = tf * (this.k1 + 1) / (tf + this.k1 * (1 - this.b + this.b * doc.length / this.avgLength));
      total += this.idf(token) * norm;
    }
    return total;
  }
}

function recordText(paper, taxonomy) {
  const title = extractTitle(paper.citation);
  return [
    title, title, title,
    paper.tldr, paper.abstract, paper.findings, paper.practicalImplications, paper.athleteDev, paper.rtp,
    ...(taxonomy?.domains ?? []), ...(taxonomy?.populations ?? []), ...(taxonomy?.sports ?? []),
    taxonomy?.studyDesign ?? "",
  ].join(" ");
}

// Rank published records for a request. Records without an accessible local source are
// returned separately as leads: ADR 0009 lets them be named but never cited as support.
export function rankRecords(request, papers, taxonomyById = new Map(), { limit = 40, sourceAvailable = () => true } = {}) {
  const queryTokens = tokenize(requestQueryText(request));
  const index = new Bm25(papers.map((paper) => tokenize(recordText(paper, taxonomyById.get(String(paper.id))))));
  const ranked = papers
    .map((paper, i) => ({ paper, score: index.score(i, queryTokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.paper.year ?? 0) - Number(a.paper.year ?? 0));
  const supportable = [];
  const leads = [];
  for (const entry of ranked) {
    const sourceFile = localSourceFile(entry.paper);
    if (sourceFile && sourceAvailable(sourceFile)) {
      if (supportable.length < limit) supportable.push({ ...entry, sourceFile });
    } else if (leads.length < 5) {
      leads.push(entry);
    }
    if (supportable.length >= limit && leads.length >= 5) break;
  }
  return { queryTokens, supportable, leads };
}

// Split a page into overlapping passages of roughly `size` characters.
export function pagePassages(pageText, page, size = 900) {
  const clean = String(pageText ?? "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!clean) return [];
  const passages = [];
  for (let start = 0; start < clean.length; start += Math.floor(size * 0.75)) {
    passages.push({ page, text: clean.slice(start, start + size) });
    if (start + size >= clean.length) break;
  }
  return passages;
}

// Choose the most query-relevant passages from each candidate paper, always keeping the
// opening of page 1 so the composer sees the abstract and study design.
export function buildEvidencePack(candidates, queryTokens, { perPaperChars = 11000, maxPapers = 14 } = {}) {
  const papers = [];
  for (const candidate of candidates) {
    const pages = candidate.pages ?? [];
    if (!pages.length) continue;
    const passages = pages.flatMap((text, i) => pagePassages(text, i + 1));
    const bm25 = new Bm25(passages.map((passage) => tokenize(passage.text)));
    const scored = passages
      .map((passage, i) => ({ ...passage, score: bm25.score(i, queryTokens) }))
      .sort((a, b) => b.score - a.score);
    const chosen = [];
    let used = 0;
    const opening = passages.filter((passage) => passage.page === 1).slice(0, 3);
    for (const passage of [...opening, ...scored]) {
      if (chosen.includes(passage) || chosen.some((c) => c.page === passage.page && c.text === passage.text)) continue;
      if (used + passage.text.length > perPaperChars) continue;
      chosen.push(passage);
      used += passage.text.length;
    }
    chosen.sort((a, b) => a.page - b.page);
    papers.push({
      libraryId: String(candidate.paper.id),
      citation: candidate.paper.citation,
      year: Number(candidate.paper.year),
      provenance: candidate.provenance ?? "Published record",
      studyDesign: candidate.taxonomy?.studyDesign ?? "",
      populations: candidate.taxonomy?.populations ?? [],
      sports: candidate.taxonomy?.sports ?? [],
      recordSummary: candidate.paper.tldr ?? "",
      passages: chosen.map(({ page, text }) => ({ page, text })),
    });
    if (papers.length >= maxPapers) break;
  }
  return papers;
}

export function buildComposerPrompt(request, pack, leads = []) {
  const packText = pack.map((paper) => [
    `=== SOURCE libraryId=${paper.libraryId} ===`,
    `Citation: ${paper.citation}`,
    `Study design (library taxonomy): ${paper.studyDesign || "unknown"}; populations: ${paper.populations.join(", ") || "unspecified"}; sports: ${paper.sports.join(", ") || "unspecified"}`,
    `Library record review status: ${paper.provenance} (this describes the library summary only; the passages below are original source text)`,
    `Library summary (retrieval aid only, NOT citable): ${paper.recordSummary}`,
    ...paper.passages.map((passage) => `--- page ${passage.page} ---\n${passage.text}`),
  ].join("\n")).join("\n\n");
  const leadText = leads.length
    ? leads.map((lead) => `- libraryId=${lead.paper.id}: ${extractTitle(lead.paper.citation)} (original text not accessible; may be named as a lead only)`).join("\n")
    : "(none)";

  return `You draft an Ask the Library Decision Brief for Baylor Athletics staff. It is an On-Demand, Not Expert-Reviewed brief that informs professional judgment. It never diagnoses, prescribes, clears an athlete, or sets policy.

PRACTICAL QUESTION
${request.practicalQuestion}

DECISION CONTEXT (de-identified)
${Object.entries(request.decisionContext ?? {}).map(([key, value]) => `- ${key}: ${value || "(not given)"}`).join("\n")}

EVIDENCE PACK
The only evidence you may use is the original source text below, quoted from published Evidence Library records. Do not use outside knowledge, other papers, or the library summaries as support. Page numbers are PDF pages.

${packText}

LEADS WITHOUT ACCESSIBLE TEXT
${leadText}

HOW TO WRITE THE BRIEF
1. Decide which sources are actually relevant to this question and context. Ignore the rest. Prefer direct evidence over loosely related evidence.
2. Write claims first. Each claim is one factual statement of what a source reports, worded no more strongly than its excerpt. Each claim needs 1-2 evidence items: {libraryId, page, excerpt}. The excerpt must be copied VERBATIM, as one contiguous span of 8 to 45 words, from a single page passage above. No ellipses, no paraphrase, no stitching across passages. Keep the source's hedges, sample, and population in the claim (for example "In 12 professional male soccer players, ...").
3. Do not state a number, threshold, direction, or effect that is not in the excerpt you cite for that claim.
4. Every statement in bottomLine, recommendedDirection, actions, monitoring, guardrails, limitations, whatCouldChange and evidenceTension must list the claimIds that support it, and must not go beyond what those claims say plus plainly labeled professional caution. Practical steps must follow from the cited findings. If a step is only a sensible caution that the evidence does not test, say so ("The evidence does not test X; ...") rather than presenting it as evidence-based.
5. Evidence Confidence tier, one of: Higher, Moderate, Limited, Coverage Gap.
   - Higher: several direct, consistent, good-quality sources that transfer to this context, and no material Evidence Tension.
   - Moderate: some direct evidence, with gaps in consistency, directness or transferability. A Recommended Direction must be conditional.
   - Limited: thin, indirect or conflicting evidence. recommendedDirection MUST be null; present options instead (in actions) without picking one.
   - Coverage Gap: the pack does not contain evidence that addresses the question. Then claims may be empty, recommendedDirection is null, and statements may use claimIds [] to describe what evidence is missing. Do NOT pad a Coverage Gap with weakly related claims, and do NOT answer from general knowledge.
   Material Evidence Tension (sources disagree in a way that matters) prevents Higher. If tension is unresolved by context, use Limited.
6. Be honest about transferability: name the populations actually studied (sex, level, sport) when they differ from the Decision Context.
7. Return-to-sport and clinical questions: the brief may inform criteria and monitoring, but must include a guardrail that progression and clearance decisions stay with the treating clinicians.
8. Keep each source's own conditions and caveats. If the authors say a finding applies only to some athletes, settings or turnarounds, or warn against a use, carry that into the claim and do not apply the finding to the group the authors steer away from. Carry important confounds (for example, one group also received a supplement) into the claim text.
9. Every factual statement in bottomLine, recommendedDirection, actions, monitoring and guardrails must trace to a cited claim. When a statement is professional judgment that the cited evidence does not test, start it with "Professional judgment (not tested by the cited evidence):" so the reader can tell the difference. Do not stretch a finding from one session type, sport or population into a general rule.
10. When the question asks how to quantify or decide (thresholds, formulas, reference values, doses, timing), include the specific values and formulas the sources report, with their population and test conditions, as claims.
11. Check the direction of every scale before describing change (for example, on the Hooper index a higher score means worse wellness; for sprint time lower is better). Say "worsened" or "improved" only when the source's own scale or wording establishes it.
11b. Look actively for Evidence Tension: if sources disagree, or one source reports a benefit another does not find, describe it in evidenceTension rather than leaving it null.
12. In evidenceConfidence and limitations, describe sources by design, sample and population. Do not call any source "unreviewed" or "not full-text reviewed": every claim in this brief is checked against the original text.
13. coverageGaps lists only evidence the library is missing for this question. Do not put scope disclaimers there; put those in guardrails or limitations with claim support.
14. Plain language, short sentences, no em dashes, no markdown inside strings. Aim for a brief a practitioner can read in about two minutes: 2-5 actions, 1-4 monitoring items, 2-4 guardrails, 1-4 limitations, 1-3 whatCouldChange.

OUTPUT
Return ONLY one JSON object, no prose before or after, with exactly these keys:
{
 "evidenceConfidence": {"tier": "...", "rationale": "...", "dimensions": {"sourceReview": "...", "directness": "...", "consistency": "...", "transferability": "..."}},
 "bottomLine": {"text": "...", "claimIds": ["C1"]},
 "recommendedDirection": {"text": "...", "claimIds": ["C1"]} or null,
 "actions": [{"title": "...", "text": "...", "claimIds": ["C1"]}],
 "monitoring": [{"label": "...", "text": "...", "claimIds": ["C1"]}],
 "guardrails": [{"text": "...", "claimIds": ["C1"]}],
 "limitations": [{"text": "...", "claimIds": ["C1"]}],
 "whatCouldChange": [{"text": "...", "claimIds": ["C1"]}],
 "evidenceTension": {"text": "...", "claimIds": ["C1", "C2"]} or null,
 "claims": [{"id": "C1", "text": "...", "evidence": [{"libraryId": "123", "page": 2, "excerpt": "..."}]}],
 "coverageGaps": ["short description of evidence the library lacks for this question"],
 "assumptions": ["assumption made because context was missing, if any"]
}`;
}

// Second pass: a critic sees the draft plus the FULL text of every cited source and returns a corrected
// draft. It targets the failure modes found in evaluation: findings attributed to the wrong study, dropped
// comparators and author caveats, inverted scales, false "no evidence" statements, and inflated tiers.
export function buildCriticPrompt(request, draft, fullSources) {
  const sourceText = fullSources.map((source) => [
    `=== FULL SOURCE libraryId=${source.libraryId} ===`,
    `Citation: ${source.citation}`,
    ...source.pages.map((text, i) => `--- page ${i + 1} ---\n${String(text).replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim()}`),
  ].join("\n")).join("\n\n");
  return `You are the claim auditor for an Ask the Library Decision Brief draft. Another model wrote it from selected passages. You now have the FULL original text of every source it cites. Correct the draft so that every statement is faithful to these sources, then return the corrected draft.

PRACTICAL QUESTION
${request.practicalQuestion}

DECISION CONTEXT
${Object.entries(request.decisionContext ?? {}).map(([key, value]) => `- ${key}: ${value || "(not given)"}`).join("\n")}

DRAFT (JSON)
${JSON.stringify(draft, null, 1)}

FULL SOURCES
${sourceText}

CHECK EVERY CLAIM AND STATEMENT, IN THIS ORDER
1. Attribution: is the finding the source's OWN result, or something the authors cite from earlier studies (introduction or discussion)? If cited, either reword the claim to say "the authors cite earlier work reporting..." or remove it. Never present cited background as the study's own data.
2. Comparator and conditions: name what the result was compared with, the population, sample, session type, dose and timing. If the authors limit a finding to a subgroup or condition (for example "may only concern substitutes", "when rapid restoration is the priority", "if replicable"), the claim and every statement that uses it must carry that condition, and must not apply it to the group the authors steer away from.
3. Scale direction: check how each scale is scored (for example the Hooper index: higher means worse). Fix any statement that reverses improvement and decline.
3b. Truncation: an excerpt must not stop before a clause that changes its meaning (for example "... along with defined stage-specific criteria"). Extend or replace any excerpt whose cut drops a qualifier, and fix any claim or option built on the cut version.
4. Significance: do not describe a non-significant, near-significant or pooled non-significant result as an effect.
5. "No evidence" statements: for any statement that the library, the pack or the sources lack something, search ALL the full source text above. If a source does address it, replace the statement with a claim that reports what the source says (with a verbatim excerpt and page), or delete the statement.
6. Missed key evidence: if a cited source contains numbers, thresholds, timings or criteria that directly answer the question (often in tables), add them as claims with verbatim excerpts and correct page numbers.
7. Duplicates: if two sources report the same study (one reprints the other's abstract), do not count them as independent support.
8. Tier: Higher needs several direct, consistent, good-quality sources that transfer to the context. Moderate needs at least two independent direct sources and a decision process the evidence actually tests; otherwise use Limited. At Limited or Coverage Gap, recommendedDirection must be null and actions must be framed as options. Evidence Tension that the context does not resolve means Limited.
9. Every statement must cite claims that support it. Professional judgment that the evidence does not test must start with "Professional judgment (not tested by the cited evidence):".

EXCERPT RULES
Excerpts must be copied VERBATIM from one page of the full source text above, 8 to 45 words, no ellipses. Use the page number shown in the "--- page N ---" marker.

OUTPUT
Return ONLY the corrected draft as one JSON object with exactly the same keys as the input draft. Keep claim IDs stable where a claim survives; you may add new claims (C20, C21, ...). Plain language, no em dashes.`;
}

export function parseComposerJson(text) {
  const raw = String(text ?? "");
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : raw;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Composer returned no JSON object.");
  return JSON.parse(body.slice(start, end + 1));
}

export function normalizeForMatch(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en-US")
    .trim();
}

// Locate an excerpt on a page. Returns the exact page span (whitespace-collapsed) when the
// excerpt matches either directly or after ignoring punctuation, hyphenation and spacing, so
// the stored excerpt is always real source text that the audit will find.
export function locateExcerpt(pageText, excerpt) {
  const page = String(pageText ?? "").normalize("NFKC").replace(/\s+/g, " ");
  const target = normalizeForMatch(excerpt);
  if (!target || target.split(" ").length < 5) return null;
  if (normalizeForMatch(page).includes(target)) {
    return { excerpt: String(excerpt).trim().replace(/\s+/g, " "), method: "exact" };
  }
  const keep = [];
  let stripped = "";
  for (let i = 0; i < page.length; i += 1) {
    const ch = page[i].toLocaleLowerCase("en-US");
    if (/[a-z0-9]/.test(ch)) {
      stripped += ch;
      keep.push(i);
    }
  }
  const needle = normalizeForMatch(excerpt).replace(/[^a-z0-9]/g, "");
  if (needle.length < 25) return null;
  const at = stripped.indexOf(needle);
  if (at === -1) return null;
  const span = page.slice(keep[at], keep[at + needle.length - 1] + 1).trim();
  return normalizeForMatch(page).includes(normalizeForMatch(span)) ? { excerpt: span, method: "realigned" } : null;
}

function statementList(value) {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
}

function stripDashes(value) {
  if (typeof value === "string") return value.replace(/\s*—\s*/g, ", ").replace(/–/g, "-");
  if (Array.isArray(value)) return value.map(stripDashes);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, stripDashes(v)]));
  return value;
}

// Turn a composer draft into a brief that satisfies the pilot contract. `readPage(sourceFile,
// page)` returns original page text. Any claim whose excerpts cannot be found is removed, and
// statements that lose all support are removed with it.
export async function finalizeDraft({ draft, request, papersById, readPage, pageCount, briefId, createdAt, leads = [], composer = {}, libraryReview = () => "" }) {
  const notes = [];
  const draftClean = stripDashes(draft ?? {});
  const keptClaims = [];
  const usedSources = new Map();

  for (const claim of statementList(draftClean.claims)) {
    const evidence = [];
    for (const item of statementList(claim.evidence)) {
      const paper = papersById.get(String(item.libraryId));
      const sourceFile = paper ? localSourceFile(paper) : "";
      if (!paper || !sourceFile) {
        notes.push(`Removed evidence for ${claim.id}: library record ${item.libraryId} has no accessible original source.`);
        continue;
      }
      const pagesToTry = [Number(item.page)];
      const total = await pageCount(sourceFile);
      for (let p = 1; p <= total; p += 1) if (p !== Number(item.page)) pagesToTry.push(p);
      let found = null;
      for (const page of pagesToTry) {
        if (!Number.isInteger(page) || page < 1 || page > total) continue;
        const located = locateExcerpt(await readPage(sourceFile, page), item.excerpt);
        if (located) {
          found = { libraryId: String(paper.id), page, excerpt: located.excerpt };
          if (page !== Number(item.page)) notes.push(`Corrected page for ${claim.id} excerpt from ${item.page} to ${page}.`);
          if (located.method === "realigned") notes.push(`Realigned ${claim.id} excerpt to exact source text.`);
          break;
        }
      }
      if (!found) {
        notes.push(`Removed unverifiable excerpt for ${claim.id} (library ${item.libraryId}, page ${item.page}).`);
        continue;
      }
      evidence.push(found);
      usedSources.set(String(paper.id), { paper, sourceFile });
    }
    const proposed = statementList(claim.evidence).length;
    if (evidence.length && evidence.length < proposed) {
      // The claim text may rest on the excerpt that failed, so a partly verified claim is removed.
      notes.push(`Removed claim ${claim.id}: ${proposed - evidence.length} of ${proposed} excerpts could not be verified.`);
    } else if (evidence.length && String(claim.text ?? "").trim().length >= 10) {
      keptClaims.push({ id: String(claim.id), text: String(claim.text).trim(), evidence });
    } else if (!evidence.length) {
      notes.push(`Removed claim ${claim.id}: no verified original-source excerpt.`);
    }
  }

  const keptIds = new Set(keptClaims.map((claim) => claim.id));
  let tier = CONFIDENCE_TIERS.includes(draftClean.evidenceConfidence?.tier) ? draftClean.evidenceConfidence.tier : "Limited";
  const removedClaims = statementList(draftClean.claims).length - keptClaims.length;
  if (!keptClaims.length) {
    if (tier !== "Coverage Gap") notes.push(`No verified claims remained; tier changed from ${tier} to Coverage Gap.`);
    tier = "Coverage Gap";
  }
  const isGap = tier === "Coverage Gap";

  const unsupportedGapNotes = [];
  const fixStatement = (statement, label, { keepTitle = false } = {}) => {
    if (!statement || typeof statement !== "object") return null;
    const text = String(statement.text ?? "").trim();
    if (text.length < 5) return null;
    const ids = (Array.isArray(statement.claimIds) ? statement.claimIds : []).map(String);
    const kept = ids.filter((id) => keptIds.has(id));
    if (!ids.length && isGap) return { ...(keepTitle ? pick(statement) : {}), text, claimIds: [] };
    if (!ids.length) {
      unsupportedGapNotes.push(text);
      notes.push(`Moved ${label} to coverageGaps: it cites no claim.`);
      return null;
    }
    if (!kept.length) {
      notes.push(`Removed ${label}: none of its supporting claims survived verification.`);
      return null;
    }
    if (kept.length < ids.length) notes.push(`Dropped unverified claim references from ${label}.`);
    return { ...(keepTitle ? pick(statement) : {}), text, claimIds: kept };
  };
  const pick = (statement) => Object.fromEntries(["title", "label"].filter((key) => statement[key]).map((key) => [key, String(statement[key])]));
  const fixList = (list, label) => statementList(list)
    .map((statement, i) => fixStatement(statement, `${label}[${i}]`, { keepTitle: true }))
    .filter(Boolean);

  let evidenceTension = fixStatement(draftClean.evidenceTension, "evidenceTension");
  if (isGap) evidenceTension = evidenceTension && evidenceTension.claimIds.length ? evidenceTension : null;
  if (evidenceTension && tier === "Higher") {
    tier = "Moderate";
    notes.push("Evidence Tension present; tier lowered from Higher to Moderate.");
  }
  let recommendedDirection = null;
  if (tier === "Higher" || tier === "Moderate") {
    recommendedDirection = fixStatement(draftClean.recommendedDirection, "recommendedDirection");
    if (!recommendedDirection) {
      notes.push(`Recommended Direction lost its support; tier lowered from ${tier} to Limited.`);
      tier = "Limited";
    }
  } else if (draftClean.recommendedDirection) {
    notes.push("Recommended Direction removed because the tier does not permit one.");
  }

  let bottomLine = fixStatement(draftClean.bottomLine, "bottomLine");
  if (!bottomLine) {
    bottomLine = keptClaims.length
      ? { text: "The library holds only partial evidence for this question; see the claims and limitations before acting.", claimIds: keptClaims.map((claim) => claim.id) }
      : { text: "The Evidence Library does not contain source-verified evidence that addresses this question.", claimIds: [] };
    notes.push("bottomLine was rebuilt after verification.");
  }

  const limitations = fixList(draftClean.limitations, "limitations");
  const whatCouldChange = fixList(draftClean.whatCouldChange, "whatCouldChange");
  const actions = fixList(draftClean.actions, "actions");
  const monitoring = fixList(draftClean.monitoring, "monitoring");
  const guardrails = fixList(draftClean.guardrails, "guardrails");
  const coverageGaps = [...new Set([
    ...(Array.isArray(draftClean.coverageGaps) ? draftClean.coverageGaps : []).map(String).filter(Boolean),
    ...unsupportedGapNotes,
  ])];
  if (isGap) {
    for (const gap of coverageGaps) {
      if (!limitations.some((item) => item.text === gap) && gap.length >= 5) limitations.push({ text: gap, claimIds: [] });
    }
  }

  const sources = [...usedSources.values()]
    .filter(({ paper }) => keptClaims.some((claim) => claim.evidence.some((e) => e.libraryId === String(paper.id))))
    .map(({ paper, sourceFile }) => ({
      libraryId: String(paper.id),
      sourceFile,
      citation: paper.citation,
      year: Number(paper.year),
      doi: paper.doi ?? "",
      // Every excerpt below was matched against this source's original page text for this brief.
      fullTextReviewed: true,
      libraryRecordReview: libraryReview(paper),
    }));

  const rationale = String(draftClean.evidenceConfidence?.rationale ?? "").trim();
  const brief = {
    schemaVersion: 1,
    briefId,
    requestId: request.requestId,
    version: 1,
    createdAt,
    status: "On-Demand",
    reviewStatus: "Not Expert-Reviewed",
    practicalQuestion: request.practicalQuestion,
    decisionContext: request.decisionContext,
    evidenceConfidence: {
      tier,
      rationale: rationale.length >= 20 ? rationale : "Confidence reflects the amount, directness and consistency of source-verified evidence found in the library.",
      dimensions: draftClean.evidenceConfidence?.dimensions ?? {},
    },
    bottomLine,
    recommendedDirection,
    actions,
    monitoring,
    guardrails,
    limitations,
    whatCouldChange,
    evidenceTension,
    sources,
    claims: keptClaims,
    assumptions: (Array.isArray(draftClean.assumptions) ? draftClean.assumptions : []).map(String).filter(Boolean),
    coverageGaps,
    leads: leads.map((lead) => ({ libraryId: String(lead.paper.id), citation: lead.paper.citation, note: "Possible lead found by keyword match; not checked for relevance, and its original text was not accessible, so it supports no claim." })),
    drafter: {
      version: DRAFTER_VERSION,
      ...composer,
      claimsProposed: statementList(draftClean.claims).length,
      claimsRemoved: removedClaims,
      notes,
    },
  };

  const validation = validateDecisionBrief(brief);
  return { brief, validation, notes };
}
