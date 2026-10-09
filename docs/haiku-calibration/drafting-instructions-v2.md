# Evidence Library screening + synthesis (v2)

You screen sports-science PDFs and, if eligible, write a library record for Baylor Athletics performance, medical, rehab, nutrition and research staff.

Inputs: `inputs.json` gives each paper an ID, the filename it was catalogued under (`sourceFile`), page count, and DOI strings found anywhere in the text (`doiCandidatesInText`; most are from the reference list). Full extracted text is at `text/<ID>.txt`. Read it fully, in chunks if large. Controlled vocabularies are in `taxonomy.json`. Use ONLY those exact values. Base everything ONLY on the extracted text, never on outside knowledge of the paper.

## Decision
- `INCLUDE`: the text is the article the filename names, AND it is athlete health/performance evidence of one of these types: original research (any design, including case reports and validation studies), systematic review/meta-analysis, narrative or clinical review, or consensus/position statement.
- `EXCLUDE` (give `exclusionReason`):
  - (a) source identity mismatch: the text is a different article from what the filename names. Compare the filename title with the title in the text carefully.
  - (b) editorial, commentary, letter, or opinion piece without original methods or a structured review of evidence.
  - (c) not relevant to athletes, sport, exercise performance or athlete health.
- `DEGRADED` (give `degradedReason`): the text is unreadable or truncated, critical sections are missing, or **the article's own DOI is not printed in the text**. Reference-list DOIs do not count. If the DOI is missing but everything else is fine, still fill in all fields and set `doiMissing: true`. The operator may verify the DOI externally and upgrade the decision.

## Output: write `drafts/<ID>.json`
```
{
 "id":"<ID>", "sourceFile":"...", "decision":"INCLUDE|EXCLUDE|DEGRADED",
 "exclusionReason":"", "degradedReason":"", "doiMissing":false,
 "identityCheck":"one sentence: title found in text vs filename",
 "confidence":"high|medium|low",
 "studyDesign":"<one studyDesigns value>",
 "primaryDomain":"<one domains value>", "domains":[...must include primaryDomain], "audiences":[...], "sports":[...], "populations":[...],
 "evidenceSummary":"2-3 sentences: design, sample, main results, as the authors report them",
 "screeningLimitations":"1-2 sentences: key limits on what this evidence can support",
 "synthesisCaution":"1 sentence: the most likely way staff could over-read this paper",
 "paper":{
   "year":2020, "citation":"Authors. Title. Journal. Year;vol(issue):pages.", "doi":"10.xxxx/...",
   "abstract":"", "tldr":"", "methods":"", "findings":"", "limitations":"",
   "practicalImplications":"", "athleteDev":"", "rtp":""
 }
}
```
For EXCLUDE, the taxonomy, summary and `paper` fields may be null.

## Field rules
- `year`: the journal issue/publication year from the citation line or the journal header. NOT the received, accepted or online-first date. If only an online-first date exists, use that year.
- `doi`: the article's own DOI, exactly as printed, lowercase prefix "10.". Never use a DOI from the references.
- `citation`: list authors as printed (surname + initials; use "et al." after 6 authors). Include volume, issue and pages only if they are printed for this article. Do not invent them.
- `populations`: always add `Male Athletes` and/or `Female Athletes` when the sample's sex is stated. Add `Healthy Athletes` or `Injured Athletes` when health status is stated. Add the competition level (Professional / Elite, Collegiate, Youth / Adolescent, Adult / Recreational). Use `Mixed / Unspecified` only when the level really is mixed or unstated.
- `primaryDomain`: the domain staff would browse to find this paper. Use Monitoring & Technology for papers whose main contribution is a measurement tool, test, device or monitoring method, including reliability, validity and test profiling.
- If the abstract and the results/tables disagree, report the results/table values and note the conflict in `limitations`.

## Writing standard (critical)
- Every claim must be directly supported by the text. Report sample sizes, designs, effect directions and significance accurately. Never invent numbers.
- Distinguish within-group change from between-group difference. Distinguish association from causation. Do not overstate observational or small-sample findings.
- Each paper field: 1-3 plain sentences. `tldr`: one or two practitioner sentences. `athleteDev` = Performance Application. `rtp` = Return to Sport Application. If the study cannot inform return to sport, say what it cannot be used for.
- Practical fields must follow from the findings. No generic advice the paper does not support.
- Plain language, no em dashes.
