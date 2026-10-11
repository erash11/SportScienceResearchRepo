# STATUS

Read this first. Update it before ending every session.

<!-- Verified against the pulled master branch, current manifest, audit commands, pilot
     files, GitHub issue state, and Pages status on 2026-09-25 (Windows). Detailed handoff:
     docs/handoffs/2026-09-25-evidence-library-batch18-ask-library.md (closeout addendum
     updated 2026-09-26, including the completed SecondBrain vault push). -->

## Current state
- 2026-10-10 (Mac): Batches 96-100 merged. Batch 100 (batches 107-114) landed with 76 records, IDs 1788-1863
  (Q05 was a duplicate of Q04 and is EXCLUDE). Library is 1,831 rows on master. Next unused ID: **1864**.
  All `npm run audit` gates pass. Shortlist now 72 candidates; Athlete Wellbeing has 0 candidates.
- Backlog: **82 unscreened unique PDFs** remain (`python3 scripts/haiku-batch/backlog.py`, checked 2026-10-10).
  Pipeline: `scripts/haiku-batch/` (Haiku 5.5 drafts, Opus 5.5 claim audit).
- Ask the Library drafter merged (PR #12): `npm run pilot:draft -- <request.json>`. Stress-test eval in
  `docs/ask-library-eval/`: 0 critical integrity failures, 12/12 useful. Known limitation: briefs are long.
- Operator actions for Eric: `docs/needs-eric.md` (18 wrong PDFs, 52 DEGRADED mostly missing DOIs, scope calls,
  9 legacy DOI collisions). Latest handoff: `docs/handoffs/2026-10-10-cloud-batches-88-95.md`.

## Next
- Continue the backlog (82 PDFs left) from ID 1864, same commands as the handoffs. Check for open
  `batch-*-staged` branches first (see Gotchas).
- After the backlog: update the roadmap, then hand Eric the pilot launch checklist (goal E).
- Still Eric's: name a pilot lead, pick 3 staff across 2+ disciplines, record human claim audits.

## Open questions
- ANSWERED 2026-10-10: Q66 and Q94 from Batch 100 (sports medicine opinion pieces, "Current Opinion" framework) stay EXCLUDE. Same rule as all opinion pieces. Reason logged in `docs/pilot-screening/batch-108-sports-medicine-injury.json` (not in the library).
- Batch 99 shortlist gate: RESOLVED. Option B was taken (gate kept at 22, builder swap pass in 77cc584, PR #24 merged).
  Note: the gate was lowered once before (Batch 96, 24 to 22). Watch the named-sport pool; it is near the floor.
- Has a real concierge pilot occurred on another machine or outside this checkout?
- Who will lead the pilot and own the recurring evidence intake/review cadence?
- Unpublish ID for Batch 80 Q37 (sleep-monitoring review with mismatched citations, published at low confidence)?
  See `docs/pilot-screening/batches-80-87-review.md`.
- Keep including anti-doping lab-method papers with no athlete participants (Batch 72 Q52, Q72)?
- Decided 2026-10-10 (Eric): study protocols without results stay OUT of the library. Batch 88 Q03 and Q84
  stay EXCLUDE. Other Batch 88-95 calls (Q39 ACLR protein review included, Q19 and Q72 excluded, Q80 framework
  editorial) are in `docs/pilot-screening/batches-88-95-review.md`.

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
