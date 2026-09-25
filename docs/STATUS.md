# STATUS

Read this first. Update it before ending every session.

<!-- Verified against the pulled master branch, current manifest, audit commands, pilot
     files, GitHub issue state, and Pages status on 2026-09-25 (Windows). -->

## Current state
- Baylor Athletics Health & Performance Evidence Library. Shared language lives in
  `CONTEXT.md`; durable trade-offs live in `docs/adr/`.
- The public Evidence Library has 707 published records: 595 local-source records and
  112 internal or external records. `SourcePapers/` holds 2,155 PDFs; 1,560 filenames
  remain unrepresented. The next unused stable ID is 739. The most recent content
  commits on 2026-08-01 published 55 reviewed local-source records and pilot batch 17.
- Full-text screening and synthesis cover 17 batches: 204 screening decisions
  (197 INCLUDE, 5 EXCLUDE, 2 DEGRADED), with 197 source-grounded records published.
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
- The roadmap and `CLAUDE.md` batch-progress sections still describe the older
  549-record, 12-batch checkpoint; use the manifest and audits for current counts.

## Next
- Run the planned 14-day, three-person/nine-question concierge pilot with a named lead
  and recorded claim audits. Score Decision Utility and Evidence Integrity against the
  approved gates before investing in an authenticated self-service workspace.
- Continue full-text screening from the current 96-candidate queue, then synthesize
  and publish only audited INCLUDE records. Prioritize the remaining corpus by Baylor
  decision needs and establish named intake, review, and publishing ownership.
- Refresh the roadmap and `CLAUDE.md` progress/count sections from the current
  manifest so future work does not restart at Batch 13 or reuse ID 576.

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
