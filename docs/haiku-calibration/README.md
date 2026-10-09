# Haiku 5.5 calibration (2026-10-09)

Can Haiku 5.5 do full-text screening and synthesis to the library's standard? It was tested blind on 32 papers that had already been decided: 24 published INCLUDE records (3 per domain) and all 8 EXCLUDE/DEGRADED decisions. Haiku saw only the filename and the extracted text (`drafting-instructions-v1.md`). Opus judges then checked every claim against the source text. Each judge saw the Haiku draft and the published record as an unlabeled A/B pair (`judge-instructions.md`; `judge-blind-key.json` unblinds them).

## Results

| Check | Result |
|---|---|
| Source mix-ups caught (PDF holds a different article) | 6/6 |
| Editorial correctly excluded | 1/1 |
| Overall decision agreement | 28/32 (all 4 disagreements explained below) |
| Study design (both INCLUDE) | 22/22 |
| Primary domain | 16/22 (borderline calls such as Training vs Monitoring) |
| DOI | 21/22 (the miss: the DOI is not printed in the PDF, and the instructions forbid outside lookup) |
| Year | 16/22 (all 6 misses: online/accepted year instead of issue year) |
| Population tags, mean Jaccard | 0.45 (Haiku omits sex and health-status tags) |
| Judge verdict, Haiku drafts | 20 publishable, 2 minor edits, 1 critical error |
| Judge verdict, published records | 1 publishable, 21 minor edits, 2 critical errors |
| Judged better | Haiku 21, tie 1, published 0 (of 22) |

Critical errors:
- Haiku, C12: called a randomized two-group study "single-group" in one phrase.
- Published, C09: repeats the abstract's "athlete type did not affect scores", which Table 6 contradicts.
- Published, C25: miscounts the individual studies.

Caveat: Haiku drafts are about 40% longer (2,908 vs 2,073 characters), and judges may favor detail. The critical-error rate is the more robust signal.

## The four decision disagreements
- C16 and C19 (narrative reviews): Haiku excluded them because instructions v1 wrongly listed only original research, systematic reviews and consensus statements as eligible. That was an instruction defect. The library includes narrative reviews.
- C05: the published decision is DEGRADED by house rule (no DOI in the PDF). Haiku included it because v1 did not state this rule.
- C24: the published decision is DEGRADED because `pdftotext` failed on Windows. It extracts cleanly on Linux, so Haiku's INCLUDE is defensible.

## Instruction fixes for v2
1. Narrative reviews and clinical reviews are eligible.
2. A missing DOI means DEGRADED unless the DOI is verified elsewhere. Alternatively, flag it for operator lookup.
3. Year is the journal issue or publication year, not the received, accepted or online-first date.
4. Always tag sex (Male/Female Athletes) and health status (Healthy/Injured) when the paper states them.
5. Keep the paper's own results tables over its abstract when they conflict, and note the conflict. Haiku already did this on C12, C14 and C24.

## Recommendation
Haiku 5.5 meets the bar as the drafter. Keep the v2 instructions, the existing audits, an automated claim check, and a human spot-check of each batch.
