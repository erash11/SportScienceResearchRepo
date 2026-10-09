# Ask the Library drafter evaluation

Goal D: run `npm run pilot:draft` on all 12 questions in `docs/ask-library-pilot/examples/stress-test-question-bank.json`, have a separate Opus claim audit judge every brief, and iterate until there are **0 unresolved critical integrity failures** and **at least 80% of briefs are rated useful**.

- Requests: `requests/` (one `ATL-R-20261009-<question>.json` per question; synthetic stress-test questions, no participant data).
- Audit rubric: `AUDIT-INSTRUCTIONS.md` and `audit-output-schema.md`. Each brief was audited by a fresh Claude Opus 5.5 agent that read the original PDF pages and did not see the drafter's prompts.
- Per-iteration results: `iteration-N/README.md` (built by `summarize.py`), with the briefs, drafter logs and audit JSON.

## Results

| Iteration | Drafter | Gates passed | Critical failures | Useful | Notes |
|---|---|---|---|---|---|
| 1 | v1.0: retrieval, one composer call, excerpt verification and gating | 12/12 | 3 (3 briefs) | 11/12 (92%) | Failures: an omitted confound, a finding applied to the group the authors steered away from, an inverted wellness scale. |
| 2 | v1.1: prompt rules for caveats, scales, provenance, strict claim removal | 12/12 | 10 (6 briefs) | 8/12 (67%) | Worse. False "no evidence" statements about content outside the passages shown, dropped comparators and conditions, cited background presented as own results, tiers too high. |
| 3 (void) | v1.2 with a layout-only verifier | not audited | | | Two-column PDFs broke verification; see `iteration-3-void/README.md`. |
| **3** | **v1.2: full-text critic pass, verification against layout and reading-order text** | **12/12** | **0** | **12/12 (100%)** | All briefs scored 4/5. 314 claims, 309 supported, 5 minor, none overstated or unsupported. |

Both targets are met at iteration 3. Library: the 946-record state on the batch PR branches (`ATL_LIBRARY_ROOT`), so some cited records go live only when PRs #9-#11 merge.

## What made the difference

1. **A second, full-text critic pass.** The composer sees query-selected passages; the critic sees every page of each cited source and checks attribution (own result vs cited prior work), comparators, author conditions, scale direction, significance, "no evidence" statements and the tier.
2. **Verification against both `pdftotext -layout` and reading-order text.** Layout mode interleaves the columns of two-column articles. `pilot:audit-source` now accepts an excerpt found in either extraction of the same page.
3. **Deterministic gates after the model.** Any claim with an excerpt that cannot be found is removed, statements that lose all support are removed, and the confidence rules (ADR 0005, 0006) are re-applied. If nothing survives, the brief becomes a Coverage Gap.

## Known limitations (for the human claim auditor)

- Briefs are long (22 to 39 claims). They meet the usefulness bar in audit, but the two-minute reading target is at risk; the Operational View should lead with the bottom line, tier and actions.
- When a claim is removed, a statement can keep wording that depended on it if the statement still cites another claim. Auditors found several such sentences; all were accurate against the source, but they are not traced.
- Keyword-matched leads (records whose original text is not accessible) are often off-topic. They support no claim and are labelled as unchecked.
- The tier was Limited for 11 of 12 questions. That is defensible for this library, but staff should expect options more often than a Recommended Direction.
- Each brief takes two Opus calls (about 3 to 6 minutes). A named human claim auditor must still confirm interpretation fidelity before delivery.
