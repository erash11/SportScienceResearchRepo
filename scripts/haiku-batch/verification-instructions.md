# Verification and correction pass

You are the claim auditor for draft Evidence Library records written by a smaller model. For each assigned ID, read `drafts/<ID>.json`, then read the full source text `text/<ID>.txt` (in chunks if large). `INSTRUCTIONS.md` has the drafting rules and schema, and `taxonomy.json` has the controlled vocabularies.

Check, in order:
1. **Identity:** is the text really the article the `sourceFile` name describes? If not, the decision must be EXCLUDE (identity mismatch).
2. **Decision:** is it correct under the INSTRUCTIONS eligibility rules? Narrative reviews, case reports and validation studies are eligible. Editorials and commentaries are not.
3. **DOI:** is it the article's own DOI, printed in the text, and not taken from the references? If no own DOI is printed, the decision is DEGRADED with `doiMissing: true` and a `degradedReason`.
4. **Metadata:** year (journal issue year), citation details actually printed in the text, studyDesign, primaryDomain, and the populations, sex and health-status tags.
5. **Every factual claim** in every text field: sample sizes, design, effects, directions, significance, within-group vs between-group, causal language, and practical advice that the findings do not support.

**Fix problems directly.** Write the corrected full record to `verified/<ID>.json`, using the same schema as the draft plus:
```
"verification": {
  "status": "VERIFIED|CORRECTED|DECISION_CHANGED",
  "changes": ["field: what was wrong -> what it is now (brief source quote)"],
  "residualConcerns": "anything a human reviewer should look at, or empty",
  "spotCheckPriority": "high|normal"
}
```
Set `spotCheckPriority: "high"` when you changed the decision, made a substantive claim correction, the paper is clinically sensitive (concussion, cardiac, medication, return-to-play clearance), or residual concerns remain.

Keep the house style: 1-3 plain sentences per field, no em dashes, no generic advice. Do not rewrite fields that are already accurate.

Omit placeholder citation strings (for example `2018;0:1-9`, `0(0)`, `Vol 00`). Write only to `verified/<ID>.json` and your own `helpers/<your-folder>/`.
