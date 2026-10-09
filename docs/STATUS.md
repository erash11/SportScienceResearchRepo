# STATUS

Read this first. Update it before ending every session.

<!-- Verified against the pulled master branch, current manifest, audit commands, pilot
     files, GitHub issue state, and Pages status on 2026-09-25 (Windows). Detailed handoff:
     docs/handoffs/2026-09-25-evidence-library-batch18-ask-library.md (closeout addendum
     updated 2026-09-26, including the completed SecondBrain vault push). -->

## Current state
- 2026-10-09 (cloud): the public library has 1,332 records (Batches 19-79 published). The bullets below
  dated 2026-09-25 are the pre-backlog baseline. Haiku 5.5 drafting with an Opus claim audit is the ingestion
  pipeline (`scripts/haiku-batch/`).
- Baylor Athletics Health & Performance Evidence Library. Shared language lives in
  `CONTEXT.md`; durable trade-offs live in `docs/adr/`.
- The public Evidence Library has 712 published records: 600 local-source records and
  112 internal or external records. `SourcePapers/` holds 2,155 PDFs; 1,555 filenames
  remain unrepresented. The next unused stable ID is 744. Batch 18 published five
  screened records on 2026-09-25 and excluded one editorial.
- Full-text screening and synthesis cover 18 batches: 210 screening decisions
  (202 INCLUDE, 6 EXCLUDE, 2 DEGRADED), with 202 source-grounded records published.
  The replenished shortlist has 96 unrepresented candidates, 12 per domain.
- The reviewed Zotero publication workflow has 103 published records and no staged
  candidates. `npm run audit` passed all publication, taxonomy, screening, synthesis,
  shortlist, and Zotero gates on 2026-09-25.
- **Ask the Library** is the product built on top of it: a Baylor-staff-only workspace that
  turns a Practical Question plus optional de-identified context into a structured,
  source-grounded Decision Brief. Product contract confirmed 2026-07-22; interaction
  prototype approved 2026-07-23 (`docs/ask-the-library-product-contract.md`).
- The operator-mediated Ask the Library concierge pilot is implemented and documented;
  issue #1 closed 2026-07-23. `npm run pilot:check` passed all 14 tests and synthetic
  examples on 2026-09-25. This local checkout has no real requests, briefs, feedback,
  audits, or scorecard in its Git-ignored pilot folders; that does not rule out activity
  elsewhere. The pilot has not been established as completed or successful.
- GitHub Pages reports the public site built, and the latest deployment workflow
  succeeded. The current branch is clean against `origin/master` after pull.
- Roadmap and `CLAUDE.md` progress sections are current (712 records, Batch 18) as of
  2026-10-09.

## Next
- **Backlog run active (cloud session, 2026-10-09).** Goal and rules: `docs/agents/goal-finish-library-and-ask.md`.
  Eric's instruction (2026-10-09): merge batch PRs as they go. Pipeline: `scripts/haiku-batch/` (Haiku 5.5 drafts, Opus 5.5 claim audit), 96 PDFs per batch.
- **Published on master (2026-10-09):** Batches 19-79 via PRs #9-#11 and #13-#17. The library has 1,332 records;
  next unused ID 1365. `npm run audit` and `pilot:check` pass on master. Review files: `docs/pilot-screening/batches-*-review.md`.
- **Backlog left:** 754 unscreened backlog PDFs (`python3 scripts/haiku-batch/backlog.py`). Batches 80-87 are being drafted
  on branch `batch-80-87-staged` (IDs from 1365).
- `docs/needs-eric.md`: the single list of operator actions: wrong PDFs on disk, DEGRADED records needing a DOI, scope
  calls, and published records that share a DOI.
- **Ask the Library drafter merged (PR #12):** `npm run pilot:draft -- <request.json>`. Evaluated on the 12-question
  stress-test bank with an independent Opus claim audit (`docs/ask-library-eval/`). Iteration 3 (v1.2, full-text
  critic pass): 0 critical integrity failures, 12/12 briefs rated useful, all 12 pass `pilot:brief` and
  `pilot:audit-source`. Known limitation: briefs are long.
- Still Eric's: name a pilot lead, pick 3 staff across 2+ disciplines, record human claim audits.

## Open questions
- Has a real concierge pilot occurred on another machine or outside this checkout?
- Who will lead the pilot and own the recurring evidence intake/review cadence?

## Gotchas
- The public Evidence Library stays openly accessible; the Ask the Library workspace
  requires authenticated Baylor staff access.
- Athlete names, medical records, clinical notes, PHI and any identifying athlete data are
  prohibited as Decision Context. Context must be de-identified.
- A Decision Brief informs professional judgment. It does not diagnose, prescribe, make
  clearance decisions, or become Baylor policy.
