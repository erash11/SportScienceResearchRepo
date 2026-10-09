# STATUS

Read this first. Update it before ending every session.

<!-- Verified against the pulled master branch, current manifest, audit commands, pilot
     files, GitHub issue state, and Pages status on 2026-09-25 (Windows). Detailed handoff:
     docs/handoffs/2026-09-25-evidence-library-batch18-ask-library.md (closeout addendum
     updated 2026-09-26, including the completed SecondBrain vault push). -->

## Current state
- 2026-10-09 (cloud): the public Evidence Library has **1,381 records** (Batches 19-87 published via PRs #9-#11
  and #13-#18). Next unused ID 1414. `npm run audit` and `pilot:check` pass on master; every Pages deploy succeeded.
- Backlog: **658 unscreened unique PDFs** remain (`python3 scripts/haiku-batch/backlog.py`), about 7 batches of 96.
  Pipeline: `scripts/haiku-batch/` (Haiku 5.5 drafts, Opus 5.5 claim audit). Run paused by Eric at Batch 87.
- Ask the Library drafter merged (PR #12): `npm run pilot:draft -- <request.json>`. Stress-test eval in
  `docs/ask-library-eval/`: 0 critical integrity failures, 12/12 useful. Known limitation: briefs are long.
- Operator actions for Eric: `docs/needs-eric.md` (15 wrong PDFs, 45 DEGRADED mostly missing DOIs, scope calls,
  9 legacy DOI collisions). Latest handoff: `docs/handoffs/2026-10-09-cloud-merge-and-batches-72-87.md`.

## Next
- Resume the backlog from Batch 88 (IDs from 1414): see the handoff for the exact commands. Eric's standing
  instruction is to merge batch PRs as they go.
- After the backlog: update the roadmap, then hand Eric the pilot launch checklist (goal E).
- Still Eric's: name a pilot lead, pick 3 staff across 2+ disciplines, record human claim audits.

## Open questions
- Has a real concierge pilot occurred on another machine or outside this checkout?
- Who will lead the pilot and own the recurring evidence intake/review cadence?
- Unpublish ID for Batch 80 Q37 (sleep-monitoring review with mismatched citations, published at low confidence)?
  See `docs/pilot-screening/batches-80-87-review.md`.
- Keep including anti-doping lab-method papers with no athlete participants (Batch 72 Q52, Q72)?

## Gotchas
- Only one session should run the backlog at a time; two sessions would assign the same IDs. Check for open
  `batch-*-staged` branches before starting.
- `node_modules` and `dist` are committed with Windows binaries. Build on Linux only in a scratch copy.
- The public Evidence Library stays openly accessible; the Ask the Library workspace
  requires authenticated Baylor staff access.
- Athlete names, medical records, clinical notes, PHI and any identifying athlete data are
  prohibited as Decision Context. Context must be de-identified.
- A Decision Brief informs professional judgment. It does not diagnose, prescribe, make
  clearance decisions, or become Baylor policy.
