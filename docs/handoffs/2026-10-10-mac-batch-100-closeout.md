# Mac session: Batch 100 merged, Q66/Q94 decision, closeout (2026-10-10)

## What happened
- Batch 100 ran on the Mac. 12 Haiku drafters, then 11 Opus audit groups (Group 8 ran earlier).
- Workdir (not in git): `~/Library/Caches/sportsci-batch-100/`.
- Batch files are in git: `docs/pilot-screening/batch-107-*.json` to `batch-114-*.json`.
- Synthesis files: `docs/pilot-synthesis/batch-107.json` to `batch-114.json`.
- Review doc: `docs/pilot-screening/batches-107-114-review.md`.
- PR #25 merged to `master` as `9926764`. 76 INCLUDE records, IDs 1788 to 1863.
- Library: 1,831 rows. Next unused ID: 1864.
- Backlog: 82 unscreened PDFs (`python3 scripts/haiku-batch/backlog.py`).

## Decisions made (with reasons)
- Batch numbers 107 to 114. Batch 99 already used 99 to 106. A first run with 100 collided and was redone.
- Q05 coded EXCLUDE (duplicate). Same DOI as ID 1804 (Q04).
- Q66 changed from INCLUDE to EXCLUDE (sports medicine opinion piece).
- Q94 EXCLUDE (framework "Current Opinion" piece, no original data). Borderline, because it has about 80 references.
- Eric decided on 2026-10-10: keep Q66 and Q94 as EXCLUDE. Both were already EXCLUDE in PR #25. PR #26 added only the STATUS note. Merged as `3209b4d`.
- 14 EXCLUDE records had no domain. They were filed under Sports Medicine & Injury (batch 108). Not yet reviewed by Eric.
- Q74 `sourceFile` set to the exact catalogued name (it has private-use characters).

## Files created or changed this session
- Repo: `docs/STATUS.md`, `docs/handoffs/2026-10-10-mac-batch-100-closeout.md` (this file).
- Repo: `papers.json`, `paper-taxonomy.json`, `docs/library-coverage-manifest.json`, `docs/pilot-expansion-shortlist.json` and `.md`, `docs/needs-eric.md`.
- Config repos: `~/.claude` (session transcripts), `~/.claude/global-memory` (errors log, transcript).

## Next actions, most important first
1. Run the next batch from ID 1864 when Eric says so. Use the same steps as batch 100. First-batch argument: 115.
2. Eric to review the spot-check list: Q05, Q13, Q14, Q16, Q38, Q13 DOI (missing from text), and the 14 domain-less EXCLUDE records.
3. Eric's open decisions are in `docs/STATUS.md` under Open questions.

## Mid-flight / open
- Q13 is DEGRADED because its own DOI is not printed in the text.
- The 36 high-priority spot checks are listed in `docs/pilot-screening/batches-107-114-review.md`.
- Shortlist is 72 candidates. Athlete Wellbeing has none.
