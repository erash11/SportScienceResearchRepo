# STATUS

Read this first. Update it before ending every session.

<!-- Verified against the pulled master branch, current manifest, audit commands, pilot
     files, GitHub issue state, and Pages status on 2026-09-25 (Windows). Detailed handoff:
     docs/handoffs/2026-09-25-evidence-library-batch18-ask-library.md (closeout addendum
     updated 2026-09-26, including the completed SecondBrain vault push). -->

## Where everything lives

| What | Where |
|---|---|
| Drive outputs | `~/Library/CloudStorage/GoogleDrive-eric.rash11@gmail.com/My Drive/00_Primary_Storage_Drive/01_PROJECTS/_STALLED/2023-09-12_SportScienceResearchRepo` (Windows: `G:\My Drive\00_Primary_Storage_Drive\01_PROJECTS\_STALLED\2023-09-12_SportScienceResearchRepo`) |

## Current state
- 2026-10-13 (Mac): Batch 123-130 STAGED (branch `batch-123-staged`, DRAFT PR, NOT merged). Re-screen of the 72 DOI
  candidates from 2026-10-12 (Eric chose option 1). Result: 68 INCLUDE (IDs 1927-1994), 3 DEGRADED, 1 EXCLUDE.
  Pipeline: Haiku 5.5 draft, Opus 5.5 claim audit (all 72 CORRECTED or VERIFIED). `npm run audit` passes.
  Published rows 1,894 -> 1,962. Next unused ID: **1995**. Eric must check before merge, in
  `docs/pilot-screening/batches-123-130-review.md`: DOI conflicts (Q02 preprint DOI, Q25 DOI is the other journal's
  printing, Q31 journal vs preprint, Q60 printed DOI used instead of the accepted one), decision changes (Q11
  DEGRADED-to-INCLUDE relevance call, Q29 EXCLUDE-to-INCLUDE), DEGRADED (Q20 wrong DOI cleared, Q35 and Q45 DOI
  blank; Crossref suggests 10.1249/jsr.0000000000000418 for Q45, unconfirmed).
- 2026-10-12 (Mac): DEGRADED DOI lookup (Crossref). 72 DOIs accepted in `docs/doi-lookup/2026-10-12-accepted-dois.json`
  (doi.org confirmed 61; 11 publisher 403 or 202 kept). 1 unconfirmed (network error). 6 CHECK_BY_HAND and 11 NO_MATCH
  listed in `docs/doi-lookup/2026-10-12-degraded-doi-candidates.json`. Screening decisions NOT changed. Accepted DOIs
  still need a new screening and synthesis pass before publishing.
- 2026-10-12 (Mac): Backlog is EMPTY. `python3 scripts/haiku-batch/backlog.py` reports 0 unscreened PDFs
  (2,155 PDFs on disk, 1,732 screening decisions, 1,894 papers.json rows, max ID 1926). The "82 left" note
  below is stale: those 82 were batch 115-121, now merged. Next unused ID: **1927**.
- 2026-10-11 (Mac): Batch 122 MERGED (PR #28). Q22 is ID 1926. Next unused ID: **1927**.
  Previously staged: Q22 promoted from DEGRADED to INCLUDE
  (ID 1926, injury history and CMJ, Monitoring & Technology). Old DEGRADED entry removed from batch-13. The other 22
  files in the 23-paper set were duplicates of published or screened papers and were not added. All audits pass.
- 2026-10-11 (Mac): Batch 115-121 MERGED (PR #27, merge 2146133). IDs 1864-1925 live. Next unused ID: **1926**.
  Previously staged; 82 PDFs drafted (Haiku 5.5) and
  claim-audited (Opus 5.5). 62 INCLUDE, IDs 1864-1925; 14 EXCLUDE; 6 DEGRADED. Q03 = EXCLUDE (duplicate of ID 1068).
  All `npm run audit` gates pass. Eric must decide the flagged items in `docs/pilot-screening/batches-115-121-review.md`
  before merge (Q50 wrong PDF, Q63 200 vs 300 trials, Q65 anti-doping policy, Q39 judgment call, Q51 table conflict).
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
- Eric: review the draft PR for `batch-123-staged` against `docs/pilot-screening/batches-123-130-review.md` and
  decide the flagged items before merge. Merging publishes the records.
- New sources (Zotero), not started. `zotero-research-library-pp-cli sync` ran 2026-10-13. 880 Zotero journal
  articles have a PDF attached and a DOI, and are not in `papers.json` or any screening file. Admission needs the
  candidate workflow (`docs/contracts/zotero-publication-candidate-v1.md`), which needs `zotero-bridge`. That
  bridge is not on this Mac (Windows only). Zotero MCP tools return "tenant gate is not configured".
- Clear `docs/needs-eric.md` section 1 (24 wrong PDFs) and section 2 (21 DEGRADED) when Eric has time.
  Before any new batch, check for open `batch-*-staged` branches (see Gotchas).
- After the backlog: update the roadmap, then hand Eric the pilot launch checklist (goal E).
- Still Eric's: name a pilot lead, pick 3 staff across 2+ disciplines, record human claim audits.

## Open questions
- ANSWERED 2026-10-13 (Eric): option 1. The 72 accepted DOIs went through the batch pipeline (batch 123-130, staged).
- New sources: Zotero route or not? Needs `zotero-bridge`, which runs only on Windows. Decide where the Zotero step runs before any Zotero item is admitted.
- Unconfirmed DOI `10.26603/ijspt20200326` (Criteria-based return to sprinting) is not in batch 123. Still needs a check at doi.org.
- Confirm the one unconfirmed DOI, `10.26603/ijspt20200326` (Criteria-based return to sprinting progression), because the doi.org check failed with a network error.
- Replace the 24 wrong PDFs in `docs/needs-eric.md` section 1. Each needs the correct article downloaded into `SourcePapers/` under the same filename.
- ANSWERED 2026-10-10: Q66 and Q94 from Batch 100 (sports medicine opinion pieces, "Current Opinion" framework) stay EXCLUDE. Same rule as all opinion pieces. EXCLUDE records are not in the library. Audit notes are in the Batch 100 workdir (`~/Library/Caches/sportsci-batch-100/verified/`).
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
