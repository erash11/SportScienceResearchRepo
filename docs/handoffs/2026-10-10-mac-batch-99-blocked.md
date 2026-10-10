# Mac session: Batch 99 (assembled, NOT merged, shortlist gate blocked) (2026-10-10)

Picked up after Batch 98 (merged, PR #23). This was the third batch of Eric's "do 3 more batches" request.

## What happened
- Branch `batch-99-staged` from master. Workdir: `~/Library/Caches/sportsci-batch-99`.
- 12 Haiku drafters, then 12 Opus auditors (8 papers each). Group 1 re-read Q05 in full, since the drafter read only part of it.
- Validation found one duplicate: Q42 = ID 617 (same DOI 10.1007/s40279-019-01218-2). Coded EXCLUDE (duplicate).
- `assemble.py` produced 8 domain batches (99-106): 76 INCLUDE (IDs 1712-1787), 10 DEGRADED, 10 EXCLUDE.
- `synthesis:apply` added 76 papers. Library would be 1,755 rows. `taxonomy:build` and `audit:manifest` ran.
- All audits pass EXCEPT the shortlist audit.

## BLOCKED: shortlist named-sport gate
- `pilot:shortlist` regenerated the shortlist: 81 candidates, 17 named-sport.
- Gate (`scripts/audit-pilot-shortlist.mjs`, floor 22) fails: "fewer than 22 named-sport signals".
- The pool count fell to 23 named-sport after this batch, so the gate cannot be met by normal rebuilds.
- I did NOT lower the gate again. Eric approved a lower gate once for Batch 96 (24 -> 22). Going lower
  is a quality decision for Eric.
- Batch files, papers.json and paper-taxonomy.json are committed on the branch. The PR is NOT open.

## Decisions needed from Eric (2 options)
- **A. Lower the named-sport gate again (to 17) and merge.** Fast. Shortlist gets thinner.
- **B. Keep the gate at 22 and add named-sport candidates to the shortlist builder** (builder change, then rebuild). Slower. Keeps the rule.
I'd go with B, since the gate has now been lowered once already.

## To resume after Eric decides
1. Apply A or B. Then `npm run pilot:shortlist` (if B, after the builder change) and `npm run audit`.
2. Open a PR from `batch-99-staged` to master and merge it (standing instruction).
3. Next unused ID after merge: 1788.
