export const TAXONOMY_VERSION = "1.0.0";

export const TAXONOMY = Object.freeze({
  domains: Object.freeze([
    "Training & Performance",
    "Sports Medicine & Injury",
    "Rehabilitation & Return to Sport",
    "Recovery & Readiness",
    "Nutrition & Hydration",
    "Brain Health & Psychology",
    "Athlete Wellbeing",
    "Monitoring & Technology",
  ]),
  audiences: Object.freeze([
    "Performance",
    "Athletic Training",
    "Sports Medicine",
    "Rehabilitation",
    "Nutrition",
    "Research & Analytics",
    "Coaching",
  ]),
  sports: Object.freeze([
    "Mixed / General Sport",
    "American Football",
    "Soccer",
    "Basketball",
    "Baseball / Softball",
    "Rugby",
    "Volleyball",
    "Track & Field",
    "Swimming & Diving",
    "Gymnastics",
    "Tennis",
    "Golf",
    "Ice Hockey",
    "Combat Sports",
    "Endurance Sport",
    "Other Sport",
  ]),
  populations: Object.freeze([
    "Professional / Elite",
    "Collegiate",
    "Youth / Adolescent",
    "Adult / Recreational",
    "Female Athletes",
    "Male Athletes",
    "Injured Athletes",
    "Healthy Athletes",
    "Mixed / Unspecified",
  ]),
  studyDesigns: Object.freeze([
    "Systematic Review / Meta-analysis",
    "Randomized Controlled Trial",
    "Cohort Study",
    "Cross-sectional Study",
    "Case-control Study",
    "Consensus / Position Statement",
    "Narrative Review",
    "Case Report / Case Series",
    "Laboratory / Experimental Study",
    "Qualitative Study",
    "Methodological / Validation Study",
    "Internal Evidence Synthesis",
    "Other",
  ]),
});

const DOMAIN_RULES = [
  {
    value: "Training & Performance",
    patterns: [/\btraining\b/i, /\bperformance\b/i, /\bstrength\b/i, /\bpower\b/i, /\bsprint/i, /\bspeed\b/i, /\bagility\b/i, /\bjump/i, /\bconditioning\b/i, /\bendurance\b/i, /\bhypertroph/i, /\bneuromuscular\b/i],
  },
  {
    value: "Sports Medicine & Injury",
    patterns: [/\binjur/i, /\bpain\b/i, /\bsurger/i, /\bconcussion/i, /\bfracture/i, /\btendon/i, /\bligament/i, /\bhamstring/i, /\bACL\b|anterior cruciate/i, /\bdiagnos/i, /\bpatholog/i, /\billness\b/i, /\bmedical\b/i, /\borthop/i, /\bmusculoskeletal\b/i, /\bsprain/i, /\bbone mineral density\b/i],
  },
  {
    value: "Rehabilitation & Return to Sport",
    patterns: [/\brehab/i, /return.to.(sport|play|participation)/i, /\bpost.?operative\b/i, /\breconstruct/i, /\brecondition/i, /\breinjur/i, /\btreatment\b/i, /\btherapy\b/i, /\bgraft\b/i],
  },
  {
    value: "Recovery & Readiness",
    patterns: [/\brecover/i, /\bfatigue\b/i, /\breadiness\b/i, /\bsleep\b/i, /\bworkload\b/i, /\bwellness\b/i, /\bovertrain/i, /\bsoreness\b/i, /heart.rate.variability|\bhrv\b/i, /\bcircadian\b/i, /\btravel\b/i, /\bjet lag\b/i, /cold.water immersion|\bcryotherap/i],
  },
  {
    value: "Nutrition & Hydration",
    patterns: [/\bnutrition/i, /\bdiet/i, /\bprotein\b/i, /\bcarbohydrate/i, /\bhydrat/i, /\bcreatine\b/i, /\bcaffeine\b/i, /vitamin/i, /25-hydroxyvitamin|vitamin d/i, /\bsupplement/i, /\benergy availability\b/i, /\bbody composition\b/i],
  },
  {
    value: "Brain Health & Psychology",
    patterns: [/\bconcussion/i, /\bhead impact/i, /\bbrain\b/i, /\bneuro/i, /\bcognit/i, /\bpsycholog/i, /\bmental health\b/i, /\banxiety\b/i, /\bdepress/i, /\bmotivation\b/i],
  },
  {
    value: "Athlete Wellbeing",
    patterns: [
      /\bwellbeing\b|\bwell-being\b/i,
      /\bburnout\b/i,
      /\bquality of life\b/i,
      /\bmental health\b/i,
      /\bathlete identity\b/i,
      /\bpsychosocial\b/i,
      /\b(perceived|psychological|mental) stress\b|\bstress management\b/i,
      /\b(help.?seeking|welfare|safeguard|harass|discrimin)/i,
      /\b(toxic leadership|social support|coach-athlete relationship)/i,
      /\b(retired professional athlete|athlete retirement|career transition)/i,
      /\bhealth-promoting behavio/i,
      /\bculture\b/i,
      /\bcommunication\b/i,
    ],
  },
  {
    value: "Monitoring & Technology",
    patterns: [/\bmonitor/i, /\bGPS\b/i, /\bwearable/i, /\bforce plate/i, /\bacceleromet/i, /\bsensor/i, /\bvalidity\b/i, /\breliability\b/i, /\bmeasurement propert/i, /\bperformance test/i, /\bscreening\b/i, /\bmachine learning\b/i, /\banalytics\b/i, /\btechnology\b/i, /\btesting\b/i],
  },
];

const SPORT_RULES = [
  ["Soccer", [/\bsoccer\b/i, /association football/i, /\bFIFA\b/i, /\bUEFA\b/i]],
  ["American Football", [/american(-style)? football/i, /\bNFL\b/i, /national football league/i, /\bNCAA football\b/i, /\bgridiron\b/i, /canadian football league|\bCFL\b/i]],
  ["Basketball", [/\bbasketball\b/i, /\bNBA\b/i, /\bWNBA\b/i]],
  ["Baseball / Softball", [/\bbaseball\b/i, /\bsoftball\b/i, /\bMLB\b/i]],
  ["Rugby", [/\brugby\b/i]],
  ["Volleyball", [/\bvolleyball\b/i]],
  ["Track & Field", [/track and field/i, /track & field/i, /\bthrower/i, /\bjumper/i, /\bsprinter/i]],
  ["Swimming & Diving", [/\bswimm/i, /\bdiving\b/i]],
  ["Gymnastics", [/\bgymnast/i, /acrobatics and tumbling/i]],
  ["Tennis", [/\btennis\b/i, /\bracquet\b/i]],
  ["Golf", [/\bgolf/i]],
  ["Ice Hockey", [/\bice hockey\b/i, /\bhockey player/i, /\bNHL\b/i]],
  ["Combat Sports", [/combat sport/i, /martial art/i, /\bboxing\b/i, /\bwrestl/i, /\bjudo\b/i]],
  ["Endurance Sport", [/\bmarathon\b/i, /\btriathlon\b/i, /distance run/i, /\bcycli/i, /cross.?country/i]],
];

const POPULATION_RULES = [
  ["Professional / Elite", [/\bprofessional\b/i, /\belite\b/i, /world.?class/i, /\bNFL\b|\bNBA\b|\bWNBA\b|\bMLB\b|\bNHL\b/i]],
  ["Collegiate", [/\bcolleg/i, /\buniversity athlete/i, /\bNCAA\b/i]],
  ["Youth / Adolescent", [/\byouth\b/i, /\badolescen/i, /\bteen/i, /high school/i, /\bchildren\b/i, /\bpediatric\b/i]],
  ["Adult / Recreational", [/\brecreational\b/i, /\bactive adult/i, /\badult athlete/i]],
  ["Female Athletes", [/\bfemales?\b/i, /\bwomen\b/i, /\bwoman\b/i, /\bgirls\b/i]],
  ["Male Athletes", [/\bmales?\b/i, /\bmen\b/i, /\bman\b/i, /\bboys\b/i]],
  ["Injured Athletes", [/\binjured\b/i, /\binjury\b/i, /\bsurger/i, /\brehabilitat/i, /return.to.(sport|play)/i, /\bpatient/i]],
  ["Healthy Athletes", [/\bhealthy\b/i, /\buninjured\b/i, /\basymptomatic\b/i]],
];

function textOf(values) {
  return values.flat(Infinity).filter(Boolean).join(" ").replace(/\s+/g, " ");
}

function orderedUnique(values, vocabulary) {
  const set = new Set(values);
  return vocabulary.filter((value) => set.has(value));
}

function suppliedArray(value, vocabulary) {
  if (value == null) return null;
  const values = Array.isArray(value) ? value : [value];
  const controlled = orderedUnique(values, vocabulary);
  return controlled.length ? controlled : null;
}

function rankedDomains(text) {
  const scored = DOMAIN_RULES.map((rule) => ({
    value: rule.value,
    score: rule.patterns.reduce((sum, pattern) => sum + (pattern.test(text) ? 1 : 0), 0),
  })).filter(({ score }) => score > 0);

  scored.sort((a, b) => b.score - a.score || TAXONOMY.domains.indexOf(a.value) - TAXONOMY.domains.indexOf(b.value));
  return scored.length ? scored.slice(0, 3).map(({ value }) => value) : ["Training & Performance"];
}

function inferStudyDesign(text, sourceUrl = "") {
  if (/docs\.google\.com\/document/i.test(sourceUrl)) return "Internal Evidence Synthesis";
  if (/systematic review|meta-analysis|meta analysis/i.test(text)) return "Systematic Review / Meta-analysis";
  if (/consensus statement|position statement|clinical practice guideline|expert consensus/i.test(text)) return "Consensus / Position Statement";
  if (/randomi[sz]ed controlled|\bRCT\b/i.test(text)) return "Randomized Controlled Trial";
  if (/case-control|case control/i.test(text)) return "Case-control Study";
  if (/case report|case series/i.test(text)) return "Case Report / Case Series";
  if (/cross-sectional|cross sectional/i.test(text)) return "Cross-sectional Study";
  if (/cohort|longitudinal|prospective study|retrospective study/i.test(text)) return "Cohort Study";
  if (/qualitative|interview study|focus group/i.test(text)) return "Qualitative Study";
  if (/validat|reliability|agreement|measurement propert|diagnostic accuracy/i.test(text)) return "Methodological / Validation Study";
  if (/laboratory|experimental study|controlled experiment|biomechanical analysis/i.test(text)) return "Laboratory / Experimental Study";
  if (/narrative review|literature review|scoping review|clinical review/i.test(text)) return "Narrative Review";
  return "Other";
}

export function inferTaxonomy(record = {}) {
  const evidenceText = textOf([
    record.citation,
    record.abstract,
    record.methods,
    record.findings,
    record.tldr,
    record.summary,
  ]);
  const fullText = textOf([
    evidenceText,
    record.practicalImplications,
    record.athleteDev,
    record.rtp,
    record.translation?.practicalImplications,
    record.translation?.applications?.performance,
    record.translation?.applications?.returnToSport,
  ]);

  const domains = rankedDomains(fullText);
  const sports = SPORT_RULES.filter(([, patterns]) => patterns.some((pattern) => pattern.test(evidenceText))).map(([value]) => value);
  const populations = POPULATION_RULES.filter(([, patterns]) => patterns.some((pattern) => pattern.test(evidenceText))).map(([value]) => value);
  const studyDesign = inferStudyDesign(evidenceText, record.sourceUrl || record.driveUrl || "");

  const audiences = new Set();
  if (domains.some((value) => ["Training & Performance", "Recovery & Readiness", "Monitoring & Technology"].includes(value))) audiences.add("Performance");
  if (domains.includes("Sports Medicine & Injury")) { audiences.add("Athletic Training"); audiences.add("Sports Medicine"); }
  if (domains.includes("Rehabilitation & Return to Sport")) { audiences.add("Athletic Training"); audiences.add("Rehabilitation"); }
  if (domains.includes("Nutrition & Hydration")) audiences.add("Nutrition");
  if (domains.some((value) => ["Brain Health & Psychology", "Athlete Wellbeing"].includes(value))) audiences.add("Sports Medicine");
  if (domains.includes("Monitoring & Technology") || ["Systematic Review / Meta-analysis", "Methodological / Validation Study"].includes(studyDesign)) audiences.add("Research & Analytics");
  if (/\bcoach/i.test(fullText) || /\bpractice design\b/i.test(fullText)) audiences.add("Coaching");
  if (!audiences.size) audiences.add("Performance");

  return {
    domains,
    audiences: orderedUnique([...audiences], TAXONOMY.audiences),
    sports: sports.length ? orderedUnique(sports, TAXONOMY.sports) : ["Mixed / General Sport"],
    populations: populations.length ? orderedUnique(populations, TAXONOMY.populations) : ["Mixed / Unspecified"],
    studyDesign,
  };
}

function inferSourceVerification(sourceUrl) {
  if (/raw\.githubusercontent\.com\/erash11\/SportScienceResearchRepo\/master\/SourcePapers\//i.test(sourceUrl)) return "Verified local PDF";
  if (/docs\.google\.com\/document/i.test(sourceUrl)) return "Baylor internal source";
  if (sourceUrl) return "External source";
  return "Source not verified";
}

export function normalizePaper(record = {}, metadata = {}) {
  const inferred = inferTaxonomy(record);
  const context = record.context || {};
  const applications = record.translation?.applications || record.applications || {};
  const sourceUrl = record.sourceUrl || record.driveUrl || "";
  const domains = suppliedArray(context.domains ?? record.domains ?? metadata.domains, TAXONOMY.domains) || inferred.domains;
  const audiences = suppliedArray(context.audiences ?? record.audiences ?? metadata.audiences, TAXONOMY.audiences) || inferred.audiences;
  const sports = suppliedArray(context.sports ?? record.sports ?? metadata.sports, TAXONOMY.sports) || inferred.sports;
  const populations = suppliedArray(context.populations ?? record.populations ?? metadata.populations, TAXONOMY.populations) || inferred.populations;
  const suppliedDesign = context.studyDesign ?? record.studyDesign ?? metadata.studyDesign;
  const studyDesign = TAXONOMY.studyDesigns.includes(suppliedDesign) ? suppliedDesign : inferred.studyDesign;
  const hasRecordTaxonomy = Boolean(context.domains || record.domains || context.audiences || record.audiences);
  const hasSidecarTaxonomy = Boolean(metadata.domains || metadata.audiences);

  const normalized = {
    id: String(record.id ?? ""),
    citation: record.citation || "",
    doi: record.doi || "",
    year: Number(record.year) || null,
    sourceUrl,
    evidence: {
      abstract: record.evidence?.abstract ?? record.abstract ?? "",
      summary: record.evidence?.summary ?? record.summary ?? record.tldr ?? "",
      methods: record.evidence?.methods ?? record.methods ?? "",
      findings: record.evidence?.findings ?? record.findings ?? "",
      limitations: record.evidence?.limitations ?? record.limitations ?? "",
    },
    translation: {
      practicalImplications: record.translation?.practicalImplications ?? record.practicalImplications ?? "",
      applications: {
        performance: applications.performance ?? applications.athleteDevelopment ?? record.athleteDev ?? "",
        returnToSport: applications.returnToSport ?? record.rtp ?? "",
      },
    },
    context: { domains, audiences, sports, populations, studyDesign },
    curation: {
      sourceVerification: record.curation?.sourceVerification ?? metadata.sourceVerification ?? inferSourceVerification(sourceUrl),
      reviewStatus: record.curation?.reviewStatus ?? metadata.reviewStatus ?? "Published baseline",
      taxonomySource: record.curation?.taxonomySource ?? metadata.taxonomySource ?? (hasRecordTaxonomy ? "record" : hasSidecarTaxonomy ? "sidecar" : "rules-v1-unreviewed"),
    },
  };

  normalized.searchText = textOf([
    normalized.citation,
    normalized.doi,
    Object.values(normalized.evidence),
    normalized.translation.practicalImplications,
    Object.values(normalized.translation.applications),
    normalized.context.domains,
    normalized.context.audiences,
    normalized.context.sports,
    normalized.context.populations,
    normalized.context.studyDesign,
  ]).toLowerCase();

  return normalized;
}
