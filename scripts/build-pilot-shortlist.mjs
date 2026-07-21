import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inferTaxonomy, TAXONOMY, TAXONOMY_VERSION } from "../evidence-taxonomy.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(repoRoot, "SourcePapers");
const screeningDir = path.join(repoRoot, "docs", "pilot-screening");
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "docs", "library-coverage-manifest.json"), "utf8"));
const papers = JSON.parse(fs.readFileSync(path.join(repoRoot, "papers.json"), "utf8"));
const targetPerDomain = 12;

function localFilename(url) {
  const marker = "/SourcePapers/";
  const index = String(url || "").indexOf(marker);
  return index === -1 ? null : decodeURIComponent(String(url).slice(index + marker.length));
}

function cleanTitle(filename) {
  return filename.replace(/\.pdf$/i, "").replace(/\s+/g, " ").trim();
}

function loadScreeningRecords() {
  if (!fs.existsSync(screeningDir)) return [];
  return fs.readdirSync(screeningDir)
    .filter((file) => file.toLowerCase().endsWith(".json"))
    .sort()
    .flatMap((file) => {
      const batch = JSON.parse(fs.readFileSync(path.join(screeningDir, file), "utf8"));
      return (batch.records || []).map((record) => ({ ...record, screeningBatch: batch.batchId }));
    });
}

function evidencePriority(title, taxonomy) {
  let score = 0;
  if (/systematic review|meta-analysis|meta analysis/i.test(title)) score += 12;
  if (/consensus|position statement|guideline/i.test(title)) score += 10;
  if (/randomi[sz]ed|controlled trial/i.test(title)) score += 9;
  if (/cohort|prospective|retrospective|longitudinal/i.test(title)) score += 7;
  if (/case-control/i.test(title)) score += 6;
  if (/validity|reliability|validation|measurement propert/i.test(title)) score += 6;
  if (/cross-sectional/i.test(title)) score += 4;
  if (/female|women|youth|adolescen|colleg|professional|elite/i.test(title)) score += 3;
  if (taxonomy.sports.some((sport) => sport !== "Mixed / General Sport")) score += 2;
  if (taxonomy.populations.some((population) => !["Mixed / Unspecified", "Male Athletes"].includes(population))) score += 2;
  if (/protocol|editorial|commentary|letter to|corrigendum|erratum/i.test(title)) score -= 15;
  if (/case report/i.test(title)) score -= 4;
  return score;
}

const screeningRecords = loadScreeningRecords();
const screeningBySource = new Map(screeningRecords.map((record) => [record.sourceFile, record]));
const represented = new Set(papers.map(({ driveUrl, sourceUrl }) => localFilename(sourceUrl || driveUrl)).filter(Boolean));
const groupedFiles = new Set();
const canonicalCandidates = new Set();

for (const group of manifest.details.duplicateSourceContentGroups) {
  group.files.forEach((file) => groupedFiles.add(file));
  if (group.files.some((file) => represented.has(file))) continue;
  const screenedFiles = group.files.filter((file) => screeningBySource.has(file));
  const preferred = screenedFiles[0] || [...group.files].sort((a, b) => b.length - a.length || a.localeCompare(b))[0];
  canonicalCandidates.add(preferred);
}

for (const filename of fs.readdirSync(sourceDir).filter((file) => file.toLowerCase().endsWith(".pdf"))) {
  if (!represented.has(filename) && !groupedFiles.has(filename)) canonicalCandidates.add(filename);
}

const candidates = [...canonicalCandidates].map((sourceFile) => {
  const title = cleanTitle(sourceFile);
  const inferred = inferTaxonomy({ citation: title });
  const screened = screeningBySource.get(sourceFile);
  if (screened?.decision === "EXCLUDE" || screened?.decision === "DEGRADED") return null;
  const taxonomy = screened?.decision === "INCLUDE" ? {
    domains: screened.domains,
    audiences: screened.audiences,
    sports: screened.sports,
    populations: screened.populations,
    studyDesign: screened.studyDesign,
  } : inferred;
  return {
    sourceFile,
    title,
    ...taxonomy,
    primaryDomain: screened?.decision === "INCLUDE" ? screened.primaryDomain : taxonomy.domains[0],
    priorityScore: evidencePriority(title, taxonomy),
    screeningStatus: screened?.decision === "INCLUDE" ? "full-text-eligible" : "title-screened",
    metadataSource: screened?.decision === "INCLUDE" ? "full-text-screening" : "title-inference",
    screeningBatch: screened?.screeningBatch,
    synthesisCaution: screened?.synthesisCaution,
  };
}).filter((candidate) => candidate && candidate.priorityScore >= 0);

const selectedFiles = new Set();
const selectionsByDomain = new Map(TAXONOMY.domains.map((domain) => [domain, []]));

function addCandidate(candidate, pilotDomain, allocationBasis) {
  if (selectedFiles.has(candidate.sourceFile)) return false;
  selectedFiles.add(candidate.sourceFile);
  selectionsByDomain.get(pilotDomain).push({ ...candidate, pilotDomain, allocationBasis });
  return true;
}

for (const candidate of candidates.filter(({ screeningStatus }) => screeningStatus === "full-text-eligible")) {
  const rows = selectionsByDomain.get(candidate.primaryDomain);
  if (!rows) throw new Error(`Screened candidate has an invalid primary domain: ${candidate.sourceFile}`);
  if (rows.length >= targetPerDomain) throw new Error(`${candidate.primaryDomain} has more than ${targetPerDomain} full-text-eligible candidates; rebalance the pilot before regenerating.`);
  addCandidate(candidate, candidate.primaryDomain, "full-text-screened-primary");
}

const domainOrder = [...TAXONOMY.domains].sort((a, b) => {
  const count = (domain) => candidates.filter((candidate) => candidate.primaryDomain === domain).length;
  return count(a) - count(b) || TAXONOMY.domains.indexOf(a) - TAXONOMY.domains.indexOf(b);
});

const underrepresentedPopulation = (candidate) => candidate.populations.some((population) => [
  "Collegiate",
  "Youth / Adolescent",
  "Adult / Recreational",
  "Female Athletes",
  "Healthy Athletes",
].includes(population));
const underrepresentedDemographic = (candidate) => candidate.populations.some((population) => ["Female Athletes", "Youth / Adolescent"].includes(population));
const namedSport = (candidate) => candidate.sports.some((sport) => sport !== "Mixed / General Sport");
const primaryStudy = (candidate) => [
  "Randomized Controlled Trial",
  "Cohort Study",
  "Cross-sectional Study",
  "Case-control Study",
  "Case Report / Case Series",
  "Laboratory / Experimental Study",
  "Qualitative Study",
  "Methodological / Validation Study",
].includes(candidate.studyDesign);

function sortCandidates(rows) {
  return rows.sort((a, b) => b.priorityScore - a.priorityScore || a.title.localeCompare(b.title));
}

function fillFromPool(pilotDomain, pool, allocationBasis) {
  const selection = selectionsByDomain.get(pilotDomain);
  const addUntil = (minimum, predicate) => {
    for (const candidate of pool) {
      if (selection.filter(predicate).length >= minimum || selection.length >= targetPerDomain) break;
      if (predicate(candidate)) addCandidate(candidate, pilotDomain, allocationBasis);
    }
  };
  addUntil(1, underrepresentedDemographic);
  addUntil(2, underrepresentedPopulation);
  addUntil(4, namedSport);
  addUntil(4, primaryStudy);
  for (const candidate of pool) {
    if (selection.length >= targetPerDomain) break;
    addCandidate(candidate, pilotDomain, allocationBasis);
  }
}

for (const pilotDomain of domainOrder) {
  const primaryPool = sortCandidates(candidates.filter((candidate) => candidate.primaryDomain === pilotDomain && !selectedFiles.has(candidate.sourceFile)));
  fillFromPool(pilotDomain, primaryPool, "primary-title-match");
  if (selectionsByDomain.get(pilotDomain).length < targetPerDomain) {
    const secondaryPool = sortCandidates(candidates.filter((candidate) => candidate.domains.includes(pilotDomain) && candidate.primaryDomain !== pilotDomain && !selectedFiles.has(candidate.sourceFile)));
    fillFromPool(pilotDomain, secondaryPool, "secondary-title-match");
  }
  if (selectionsByDomain.get(pilotDomain).length < targetPerDomain) {
    throw new Error(`${pilotDomain} produced only ${selectionsByDomain.get(pilotDomain).length} eligible candidates; expected ${targetPerDomain}.`);
  }
}

const selected = TAXONOMY.domains.flatMap((domain) => selectionsByDomain.get(domain));
const output = {
  schemaVersion: 2,
  taxonomyVersion: TAXONOMY_VERSION,
  selectionStrategy: {
    targetPapers: selected.length,
    allocation: `${targetPerDomain} candidates per controlled pilot domain; strongest-domain matches are used before documented secondary-title matches.`,
    evidencePriority: "Reviews, consensus statements, trials, longitudinal designs, and measurement studies rank ahead of lower-signal title matches.",
    diversityPriority: "Each domain attempts to reserve places for named-sport evidence, underrepresented population signals, and identifiable primary studies.",
    screenedPaperPolicy: "Every full-text INCLUDE decision remains selected under its reviewed primary domain; EXCLUDE and DEGRADED records are not selectable.",
    status: "Mixed screening queue — full-text-eligible records are synthesis-ready; title-screened records still require source, eligibility, taxonomy, extraction, and synthesis review.",
  },
  screeningCounts: {
    fullTextEligible: selected.filter(({ screeningStatus }) => screeningStatus === "full-text-eligible").length,
    titleScreened: selected.filter(({ screeningStatus }) => screeningStatus === "title-screened").length,
  },
  domainCounts: Object.fromEntries(TAXONOMY.domains.map((domain) => [domain, selected.filter(({ pilotDomain }) => pilotDomain === domain).length])),
  candidates: selected.map((candidate, index) => ({
    queueOrder: index + 1,
    pilotDomain: candidate.pilotDomain,
    primaryDomain: candidate.primaryDomain,
    allocationBasis: candidate.allocationBasis,
    domains: candidate.domains,
    audiences: candidate.audiences,
    sports: candidate.sports,
    populations: candidate.populations,
    studyDesign: candidate.studyDesign,
    priorityScore: candidate.priorityScore,
    title: candidate.title,
    sourceFile: candidate.sourceFile,
    screeningStatus: candidate.screeningStatus,
    metadataSource: candidate.metadataSource,
    ...(candidate.screeningBatch ? { screeningBatch: candidate.screeningBatch } : {}),
    ...(candidate.synthesisCaution ? { synthesisCaution: candidate.synthesisCaution } : {}),
  })),
};

const jsonPath = path.join(repoRoot, "docs", "pilot-expansion-shortlist.json");
fs.writeFileSync(jsonPath, `${JSON.stringify(output, null, 2)}\n`);

const lines = [
  "# Balanced Expansion Pilot Screening Queue",
  "",
  `This queue contains ${selected.length} unrepresented, content-deduplicated local PDFs: ${targetPerDomain} allocated to each controlled pilot domain.`,
  "",
  `**Screening progress:** ${output.screeningCounts.fullTextEligible} full-text eligible; ${output.screeningCounts.titleScreened} awaiting full-text review.`,
  "",
  "> Primary-domain matches are used first. A secondary-title match is allowed only where the primary title pool is too sparse to fill a balanced domain, and is labeled below.",
  "",
  ...TAXONOMY.domains.flatMap((domain) => [
    `## ${domain}`,
    "",
    ...output.candidates.filter(({ pilotDomain }) => pilotDomain === domain).map(({ queueOrder, title, studyDesign, sourceFile, screeningStatus, allocationBasis, primaryDomain }) => {
      const status = screeningStatus === "full-text-eligible" ? "FULL TEXT: INCLUDE" : "TITLE SCREENED";
      const allocation = allocationBasis === "secondary-title-match" ? `; secondary match, primary: ${primaryDomain}` : "";
      return `${queueOrder}. **${title}** — ${studyDesign} — ${status}${allocation}<br>\n   \`${sourceFile}\``;
    }),
    "",
  ]),
];
const markdownPath = path.join(repoRoot, "docs", "pilot-expansion-shortlist.md");
fs.writeFileSync(markdownPath, `${lines.slice(0, -1).join("\n")}\n`);

console.log(`Wrote ${selected.length} balanced pilot candidates (${output.screeningCounts.fullTextEligible} full-text eligible) to ${path.relative(repoRoot, jsonPath)} and ${path.relative(repoRoot, markdownPath)}.`);
