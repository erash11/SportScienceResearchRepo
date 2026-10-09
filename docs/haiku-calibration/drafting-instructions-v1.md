# Evidence Library screening + synthesis task

You screen one sports-science PDF and, if eligible, write a library record for Baylor Athletics performance, medical, rehab, nutrition and research staff.

Inputs per paper: an ID, the expected `sourceFile` name (the filename it was catalogued under), and extracted full text at `text/<ID>.txt` (read it in chunks if large). Controlled vocabularies are in `taxonomy.json`. Use ONLY those exact values. Base everything ONLY on the extracted text; never use outside knowledge of the paper.

## Decision
- `INCLUDE`: the text is the paper the filename names, and it is original research or a systematic review / meta-analysis / consensus statement relevant to athlete health & performance.
- `EXCLUDE`: (a) source identity mismatch: the text is a different article from what the filename names; or (b) not eligible (editorial, commentary, no original methods or systematic synthesis). Give `exclusionReason`.
- `DEGRADED`: a required element cannot be verified (e.g. text unreadable or truncated, critical sections missing). Give `degradedReason`.
Check identity carefully: compare the filename's title with the title in the text.

## Output
Write a single JSON object to `haiku/<ID>.json`:
```
{
 "id": "<ID>", "sourceFile": "...",
 "decision": "INCLUDE|EXCLUDE|DEGRADED",
 "exclusionReason": "" , "degradedReason": "",
 "identityCheck": "one sentence: title found in text vs filename",
 "confidence": "high|medium|low",
 "studyDesign": "<one studyDesigns value>",
 "primaryDomain": "<one domains value>", "domains": [...], "audiences": [...], "sports": [...], "populations": [...],
 "paper": {
   "year": 2020, "citation": "Authors. Title. Journal. Year;vol(issue):pages.", "doi": "",
   "abstract": "", "tldr": "", "methods": "", "findings": "", "limitations": "",
   "practicalImplications": "", "athleteDev": "", "rtp": ""
 }
}
```
For EXCLUDE/DEGRADED, taxonomy fields and `paper` may be null.

## Writing standard (critical)
- Every claim must be directly supported by the text. Report sample sizes, designs and effects accurately. No invented numbers.
- Distinguish association from causation; do not overstate observational or small-sample findings.
- Each field 1-3 plain sentences. `tldr`: one practitioner sentence or two. `athleteDev` = Performance Application. `rtp` = Return to Sport Application; if the study does not inform return to sport, say what it cannot be used for.
- `doi`: only if printed in the text, else "".
