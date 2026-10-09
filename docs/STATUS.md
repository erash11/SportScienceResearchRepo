# STATUS

Read this first. Update it before ending every session.

<!-- Verified against the pulled master branch, current manifest, audit commands, pilot
     files, GitHub issue state, and Pages status on 2026-09-25 (Windows). Detailed handoff:
     docs/handoffs/2026-09-25-evidence-library-batch18-ask-library.md (closeout addendum
     updated 2026-09-26, including the completed SecondBrain vault push). -->

## Current state
- 2026-10-09 (cloud): Batches 19-26 (80 papers, IDs 744-823) are staged in draft PR #9 and waiting on
  Eric's review. The public site still shows 712 records until the PR is merged. Haiku 5.5 drafting
  with an Opus claim audit is the ingestion pipeline (`scripts/haiku-batch/`).
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
- **Backlog run in progress (cloud session, 2026-10-09).** Goal and rules: `docs/agents/goal-finish-library-and-ask.md`.
  Work queue: every unscreened unique PDF in the manifest backlog (1,427 at start), 96 per batch, drafted by Haiku 5.5
  and claim-audited by Opus 5.5 (`scripts/haiku-batch/`).
- Open batch PRs (merge in order; each is stacked on the previous one):
  - #9 Batches 19-26: 80 INCLUDE, IDs 744-823. Review `docs/pilot-screening/batches-19-26-review.md`.
  - #10 Batches 27-34: 81 INCLUDE, IDs 824-904 (first manifest-backlog batch). Review `docs/pilot-screening/batches-27-34-review.md`.
  - #11 Batches 35-42: 73 INCLUDE, IDs 905-977. Review `docs/pilot-screening/batches-35-42-review.md`.
  - After all three merge: 946 records, next unused ID 978, 1,235 backlog PDFs left (of 1,427).
- **Staged without a PR** (no 4th PR while 3 are unmerged), stacked in order on #11:
  - `batch-43-49-staged`: 81 INCLUDE, IDs 978-1059 (1017 unused).
  - `batch-50-56-staged`: 79 INCLUDE, IDs 1060-1138.
  - `batch-57-64-staged` (Batches 57-63): 85 INCLUDE, IDs 1139-1223.
  - Open a PR for each staged branch as earlier PRs merge, in order.
- With everything staged: 1,191 records. Backlog left: about 850 of 1,427. Batches 64+ are in progress.
- `docs/needs-eric.md` (on the batch PR branches): the single list of operator actions: wrong PDFs on disk, DEGRADED
  records needing a DOI, scope reversals, and published records that share a DOI.
- **Ask the Library drafter: draft PR #12** (`npm run pilot:draft -- <request.json>`). Evaluated on the 12-question
  stress-test bank with an independent Opus claim audit (`docs/ask-library-eval/` on that branch). Iteration 3 (v1.2,
  full-text critic pass): 0 critical integrity failures, 12/12 briefs rated useful, all 12 pass `pilot:brief` and
  `pilot:audit-source`. Iterations 1 and 2: 3 and 10 critical failures. Known limitation: briefs are long.
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
