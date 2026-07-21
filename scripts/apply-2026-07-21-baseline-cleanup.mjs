import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const papersPath = path.join(root, "papers.json");
const sourceDir = path.join(root, "SourcePapers");
const baseUrl = "https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/SourcePapers/";

// Same-PDF duplicates verified by source identity and citation. The lowest stable ID is retained.
const duplicateGroups = [
  { keep: "111", remove: ["284"] },
  { keep: "118", remove: ["119"] },
  { keep: "174", remove: ["175"] },
  { keep: "189", remove: ["288"] },
  { keep: "223", remove: ["289"] },
  { keep: "231", remove: ["290", "334", "384"] },
  { keep: "243", remove: ["291", "335", "385"] },
  { keep: "249", remove: ["293", "337", "386"] },
  { keep: "277", remove: ["295", "338", "387"] },
  { keep: "298", remove: ["339", "388"] },
  { keep: "299", remove: ["340", "389"] },
  { keep: "305", remove: ["341", "390"] },
  { keep: "329", remove: ["330"] },
  { keep: "366", remove: ["391"] },
  { keep: "382", remove: ["392"] },
];

const sourceFiles = fs.readdirSync(sourceDir);
function findSource(pattern) {
  const matches = sourceFiles.filter((name) => pattern.test(name));
  if (matches.length !== 1) throw new Error(`Expected one source match for ${pattern}; found ${matches.length}`);
  return matches[0];
}
function sourceUrl(filename) {
  return `${baseUrl}${encodeURIComponent(filename)}`;
}

let papers = JSON.parse(fs.readFileSync(papersPath, "utf8"));
const byId = new Map(papers.map((paper) => [String(paper.id), paper]));
const requiredIds = ["155", "223", "248", "252", "299", "354"];
for (const id of requiredIds) {
  if (!byId.has(id)) throw new Error(`Required cleanup record ${id} is missing`);
}

const removeIds = new Set(duplicateGroups.flatMap((group) => group.remove));
for (const group of duplicateGroups) {
  if (!byId.has(group.keep)) throw new Error(`Canonical record ${group.keep} is missing`);
}

Object.assign(byId.get("155"), {
  year: 2020,
  citation: "Li RT, Salata MJ, Rambhia S, Sheehan J, Voos JE. Does Overexertion Correlate With Increased Injury? The Relationship Between Player Workload and Soft Tissue Injury in Professional American Football Players Using Wearable Technology. Sports Health. 2020;12(1):66-73. doi:10.1177/1941738119868477.",
  doi: "10.1177/1941738119868477",
  driveUrl: sourceUrl(findSource(/^Does Overexertion Correlate With Increased Injury/)),
  abstract: "This case-control study examined whether changes in practice workload were associated with lower-extremity soft tissue injury in professional American football. GPS and triaxial accelerometry data from preseason and regular-season practices from 2014 through 2016 were linked with clinical injury records. Workload during the injury week was compared with the prior four-week average and with time- and position-matched uninjured controls.",
  tldr: "Abrupt workload increases, especially during preseason, were associated with soft tissue injury in this professional football cohort. Monitoring workload can help staff identify unusually rapid progressions, but the observed acute:chronic ratio should be treated as contextual evidence rather than a universal injury threshold.",
  methods: "The authors recorded 136 lower-extremity injuries across three seasons and analyzed 101 injuries with complete GPS and clinical data. Acute workload was the injury week's practice load; chronic workload was the mean of the preceding four weeks. Each injury was compared with an uninjured player from the same position and week using matched-pairs testing, with subgroup analyses by training period and injury type.",
  findings: "Injured players increased workload by 111% over their prior-month average versus 73% in matched controls (P=0.032). An acute:chronic workload ratio above 1.6 occurred in 64.6% of injured players and 43.1% of controls (P=0.004), corresponding to approximately 1.5 times greater injury likelihood. The association was most apparent during higher-load preseason periods.",
  limitations: "This retrospective observational study came from one professional football organization and cannot establish that workload spikes caused injury. Practice GPS data did not capture every exposure, 35 recorded injuries lacked complete data, and subgroup sizes were limited. The 1.6 ratio is cohort-specific and should not be applied as a universal decision threshold.",
  practicalImplications: "Use wearable data to flag rapid week-to-week increases while considering position, training phase, chronic preparation, and clinical context. Build preseason load progressively and investigate large deviations rather than prescribing one ratio cutoff. Workload monitoring should support, not replace, multidisciplinary judgment.",
  athleteDev: "Develop position-specific chronic workload capacity before the highest-demand preseason periods. Progress volume and intensity deliberately, and pair GPS trends with exposure history, strength, recovery, and athlete response when adjusting practice plans.",
  rtp: "Returning athletes may be especially vulnerable to abrupt exposure changes. Progress practice volume and intensity relative to recent preparation and clinical response; this study supports monitoring the ramp but did not directly test a return-to-sport protocol.",
});

byId.get("223").driveUrl = sourceUrl(findSource(/^Fantasy football points capture performance declines/));

// ID 248 is a valid paper, but the matching local PDF is absent; use its DOI instead of the wrong commentary PDF.
byId.get("248").driveUrl = "https://doi.org/10.1136/bjsports-2015-095359";

// ID 252 has its own matching PDF; ID 294 remains linked to the separate commentary it summarizes.
byId.get("252").driveUrl = sourceUrl(findSource(/^Recommendations for hamstring injury prevention/));

Object.assign(byId.get("299"), {
  year: 2023,
  citation: "Dupont MM, Fourman MS, Iyer S, Qureshi SA, Sheha ED, Rhie-Lee J, Dowdell J. Impact of Lumbar Disk Herniation on Performance Outcomes and New Contracts in the National Football League. Clin Spine Surg. 2023;36(4):E139-E144. doi:10.1097/BSD.0000000000001389.",
  doi: "10.1097/BSD.0000000000001389",
});

byId.get("354").rtp = "Not directly applicable to return-to-sport decision-making; this paper evaluates roster construction and resource allocation rather than rehabilitation or athlete clearance.";

papers = papers.filter((paper) => !removeIds.has(String(paper.id)));
if (papers.length !== 407) throw new Error(`Expected 407 rows after cleanup; found ${papers.length}`);
if (new Set(papers.map((paper) => String(paper.id))).size !== papers.length) throw new Error("Duplicate IDs remain");

fs.writeFileSync(papersPath, `${JSON.stringify(papers, null, 2)}\n`, "utf8");
console.log(`Updated papers.json: removed ${removeIds.size} verified duplicate rows; ${papers.length} rows remain.`);
