import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inferTaxonomy, TAXONOMY, TAXONOMY_VERSION, normalizePaper } from "../evidence-taxonomy.mjs";
import { taxonomyRecordFromPublication } from "../library/publication-candidate.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const papers = JSON.parse(fs.readFileSync(path.join(repoRoot, "papers.json"), "utf8"));
const sidecar = JSON.parse(fs.readFileSync(path.join(repoRoot, "paper-taxonomy.json"), "utf8"));
const failures = [];

const paperIds = papers.map(({ id }) => String(id));
const taxonomyIds = sidecar.records.map(({ id }) => String(id));
const duplicateTaxonomyIds = taxonomyIds.filter((id, index) => taxonomyIds.indexOf(id) !== index);
const missingIds = paperIds.filter((id) => !taxonomyIds.includes(id));
const extraIds = taxonomyIds.filter((id) => !paperIds.includes(id));

if (sidecar.taxonomyVersion !== TAXONOMY_VERSION) failures.push(`taxonomy version is ${sidecar.taxonomyVersion}; expected ${TAXONOMY_VERSION}`);
if (duplicateTaxonomyIds.length) failures.push(`duplicate taxonomy IDs: ${[...new Set(duplicateTaxonomyIds)].join(", ")}`);
if (missingIds.length) failures.push(`missing taxonomy IDs: ${missingIds.join(", ")}`);
if (extraIds.length) failures.push(`orphan taxonomy IDs: ${extraIds.join(", ")}`);

const metadataById = new Map(sidecar.records.map((record) => [String(record.id), record]));
const screeningDir = path.join(repoRoot, "docs", "pilot-screening");
if (fs.existsSync(screeningDir)) {
  for (const file of fs.readdirSync(screeningDir).filter((name) => name.toLowerCase().endsWith(".json"))) {
    const batch = JSON.parse(fs.readFileSync(path.join(screeningDir, file), "utf8"));
    for (const reviewed of (batch.records || []).filter((record) => record.decision === "INCLUDE" && record.publication?.status === "PUBLISHED")) {
      const metadata = metadataById.get(String(reviewed.publication.paperId));
      if (!metadata) {
        failures.push(`published screening ID ${reviewed.publication.paperId} has no taxonomy record`);
        continue;
      }
      if (metadata.taxonomySource !== "full-text-screening") failures.push(`published screening ID ${reviewed.publication.paperId} is not marked full-text-screening`);
      if (metadata.studyDesign !== reviewed.studyDesign) failures.push(`published screening ID ${reviewed.publication.paperId} lost its reviewed study design`);
      for (const field of ["domains", "audiences", "sports", "populations"]) if (JSON.stringify(metadata[field]) !== JSON.stringify(reviewed[field])) failures.push(`published screening ID ${reviewed.publication.paperId} lost reviewed ${field}`);
    }
  }
}
const zoteroSynthesisDir = path.join(repoRoot, "docs", "zotero-synthesis");
if (fs.existsSync(zoteroSynthesisDir)) {
  for (const file of fs.readdirSync(zoteroSynthesisDir).filter((name) => name.toLowerCase().endsWith(".json"))) {
    const publication = JSON.parse(fs.readFileSync(path.join(zoteroSynthesisDir, file), "utf8"));
    if (publication.status !== "PUBLISHED") continue;
    const paperId = String(publication.libraryReview.paperId);
    const metadata = metadataById.get(paperId);
    const expected = taxonomyRecordFromPublication(publication);
    if (!metadata) {
      failures.push(`published Zotero ID ${paperId} has no taxonomy record`);
    } else if (JSON.stringify(metadata) !== JSON.stringify(expected)) {
      failures.push(`published Zotero ID ${paperId} lost reviewed taxonomy or provenance`);
    }
  }
}
const legacyProbe = normalizePaper(papers[0], metadataById.get(String(papers[0].id)));
if (legacyProbe.evidence.summary !== papers[0].tldr) failures.push("legacy TL;DR did not map to evidence.summary");
if (legacyProbe.translation.applications.performance !== papers[0].athleteDev) failures.push("legacy athleteDev did not map to the performance application");
if (legacyProbe.translation.applications.returnToSport !== papers[0].rtp) failures.push("legacy rtp did not map to the return-to-sport application");

const futureProbe = normalizePaper({
  id: "future-probe",
  citation: "Future schema probe",
  year: 2026,
  sourceUrl: "https://example.org/probe.pdf",
  evidence: { summary: "Future summary" },
  translation: { applications: { performance: "Future performance application", returnToSport: "Future return-to-sport application" } },
  context: {
    domains: ["Nutrition & Hydration"],
    audiences: ["Nutrition"],
    sports: ["Mixed / General Sport"],
    populations: ["Mixed / Unspecified"],
    studyDesign: "Narrative Review",
  },
}, {
  domains: ["Training & Performance"],
  audiences: ["Performance"],
});
if (futureProbe.context.domains[0] !== "Nutrition & Hydration" || futureProbe.context.audiences[0] !== "Nutrition") failures.push("future record taxonomy did not take precedence over sidecar metadata");
if (futureProbe.evidence.summary !== "Future summary") failures.push("future evidence summary did not survive normalization");
if (futureProbe.translation.applications.performance !== "Future performance application") failures.push("future performance application did not survive normalization");

const rankedDomainProbe = inferTaxonomy({ citation: "Wearable monitoring technology for training performance" });
if (rankedDomainProbe.domains[0] !== "Monitoring & Technology") failures.push("inferred domains are not preserving evidence-strength order");
const physicalStressProbe = inferTaxonomy({ citation: "Heat stress and bone stress injury in athletes" });
if (physicalStressProbe.domains.includes("Athlete Wellbeing")) failures.push("physical stress was misclassified as Athlete Wellbeing");
const wellbeingProbe = inferTaxonomy({ citation: "Athlete mental health help-seeking and wellbeing" });
if (!wellbeingProbe.domains.includes("Athlete Wellbeing")) failures.push("mental-health wellbeing evidence did not map to Athlete Wellbeing");
const ageGroupProbe = inferTaxonomy({ citation: "Recovery in under-20 male soccer players" });
if (!ageGroupProbe.populations.includes("Youth / Adolescent")) failures.push("under-20 evidence did not map to Youth / Adolescent");
const sexDifferenceProbe = inferTaxonomy({ citation: "Heart rate variability in concussed college athletes: biological sex differences" });
if (!sexDifferenceProbe.populations.includes("Female Athletes")) failures.push("biological sex-difference evidence did not map to Female Athletes");

const distributions = {
  domains: Object.fromEntries(TAXONOMY.domains.map((value) => [value, 0])),
  audiences: Object.fromEntries(TAXONOMY.audiences.map((value) => [value, 0])),
  sports: Object.fromEntries(TAXONOMY.sports.map((value) => [value, 0])),
  populations: Object.fromEntries(TAXONOMY.populations.map((value) => [value, 0])),
  studyDesigns: Object.fromEntries(TAXONOMY.studyDesigns.map((value) => [value, 0])),
};

for (const paper of papers) {
  const metadata = metadataById.get(String(paper.id));
  if (!metadata) continue;
  const normalized = normalizePaper(paper, metadata);
  const dimensions = [
    ["domains", normalized.context.domains, TAXONOMY.domains],
    ["audiences", normalized.context.audiences, TAXONOMY.audiences],
    ["sports", normalized.context.sports, TAXONOMY.sports],
    ["populations", normalized.context.populations, TAXONOMY.populations],
  ];

  for (const [name, values, vocabulary] of dimensions) {
    if (!Array.isArray(values) || !values.length) failures.push(`ID ${paper.id} has no ${name}`);
    for (const value of values || []) {
      if (!vocabulary.includes(value)) failures.push(`ID ${paper.id} has invalid ${name} value: ${value}`);
      else distributions[name][value] += 1;
    }
  }

  if (!TAXONOMY.studyDesigns.includes(normalized.context.studyDesign)) failures.push(`ID ${paper.id} has invalid study design: ${normalized.context.studyDesign}`);
  else distributions.studyDesigns[normalized.context.studyDesign] += 1;
}

if (failures.length) {
  console.error(`Taxonomy audit failed (${failures.length} issue${failures.length === 1 ? "" : "s"}):`);
  failures.slice(0, 50).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 50) console.error(`- ...and ${failures.length - 50} more`);
  process.exit(1);
}

console.log(`Taxonomy audit passed: ${papers.length} published rows normalized against taxonomy v${TAXONOMY_VERSION}.`);
for (const [dimension, counts] of Object.entries(distributions)) {
  const populated = Object.entries(counts).filter(([, count]) => count > 0).map(([value, count]) => `${value}=${count}`).join("; ");
  console.log(`${dimension}: ${populated}`);
}
