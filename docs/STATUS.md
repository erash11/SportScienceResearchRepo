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
- 2026-10-13 (Mac): Library candidate step for three Zotero papers. Paper Briefs saved through the bridge:
  IHXYT82G (Stahl 2020), VVSYTGU4 (Staton 2026), H54I3EL2 (Macadam 2017). Briefs now carry the "Why it was
  promoted" text (drafter's reading, Eric to adjust). Candidates rebuilt and pass `candidate:check`. STAGED 2026-10-13 by Eric Rash
  (`docs/zotero-synthesis/zotero-publication-*.json`): IHXYT82G = 1995, VVSYTGU4 = 1996, H54I3EL2 = 1997. NOT applied
  to `papers.json`; `candidate:apply` and merge are still open. NEY6YYVZ = 1998 (staged 2026-10-13). Next unused ID after staging: **1999**.
  NEY6YYVZ (Mokha 2026, American Football joint power) is 1998, staged. Its brief has an unresolved Kruskal-Wallis
  vs F-statistic mismatch; check the PDF before merge. Zotero DOI and date were added by Eric. Five papers already in the library (IDs 667, 487, 584, 577, 585) were not re-added.
  SLIXJHBF (WKP858A4) PDF is still missing on this Mac.
- 2026-10-13 (Mac): Batch 123-130 STAGED (branch `batch-123-staged`, DRAFT PR, NOT merged). Re-screen of the 72 DOI
  candidates from 2026-10-12 (Eric chose option 1). Result: 68 INCLUDE (IDs 1927-1994), 3 DEGRADED, 1 EXCLUDE.
  Pipeline: Haiku 5.5 draft, Opus 5.5 claim audit (all 72 audited; 67 CORRECTED, 3 DECISION_CHANGED, 2 VERIFIED).
  `npm run audit` passes. Published rows 1,894 -> 1,962. Next unused ID: **1995**.
  Crossref check of the 68 INCLUDE DOIs: 58 match on author and journal; 3 DOI problems (IDs 1942, 1976, 1981);
  3 citations missing a journal name (1939, 1946, 1974); rest are abbreviations. Eric must check before merge, in
  `docs/pilot-screening/batches-123-130-review.md`. Paper IDs:
  - DOI problems: 1942 (Q25, other journal's printing), 1976 (Q02, OSF preprint DOI), 1981 (Q31, arXiv vs journal). FIXED 2026-10-13 (Codex review R2): 1942 to the CSMR DOI, 1976 to the JOSPT DOI (year 2021), 1981 to the arXiv v1 DOI.
  - Codex review R1 fixed 2026-10-13: `scripts/haiku-batch/validate.py` accepts a Crossref-sourced DOI only with a recorded identity check (title, author, journal, same DOI). Batch 123 cache: 10 external DOIs still lack the check (Q02 and Q25 now corrected in the repo; Q31 is an arXiv DOI not printed in its PDF; Q05, Q09, Q41, Q42, Q44, Q47, Q48 need a reviewer check).
  - Printed DOI used instead of accepted one: 1951 (Q60, correction-notice DOI).
  - Decision changes: 1956 (Q11, EXCLUDE to INCLUDE, practitioner survey) and 1971 (Q29, EXCLUDE to INCLUDE, concussion review).
  - Borderline: 1958 (Q16, labelled "special communication").
  - DEGRADED: Q20 (wrong DOI cleared), Q35 and Q45 (DOI blank; Crossref suggests 10.1249/jsr.0000000000000418 for Q45, unconfirmed).
  - Handoff (addendum text, DOI failure patterns, Zotero findings): `docs/handoffs/2026-10-13-batch-123-external-doi.md`.
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
  bridge is a Python project at `~/DEV/ZoteroInjestion` (`.venv` already present; it runs on this Mac). It has no
  Zotero credentials yet, so `doctor` fails with ConfigurationError. Setting them is Eric's step (do not paste the key
  into chat). Zotero MCP tools return "tenant gate is not configured". Windows laptop stays hands-off, so the bridge
  does not run there.
- Clear `docs/needs-eric.md` section 1 (24 wrong PDFs) and section 2 (21 DEGRADED) when Eric has time.
  Before any new batch, check for open `batch-*-staged` branches (see Gotchas).
- After the backlog: update the roadmap, then hand Eric the pilot launch checklist (goal E).
- Still Eric's: name a pilot lead, pick 3 staff across 2+ disciplines, record human claim audits.

## Open questions
- ANSWERED 2026-10-13 (Eric): option 1. The 72 accepted DOIs went through the batch pipeline (batch 123-130, staged).
- New sources: pick one. (1) Mac bridge, pilot 10 papers first (recommended): Eric sets the bridge's Zotero key once,
  then the bridge's batch and Paper Brief steps run on 10 papers to check cost and quality before any scale-up.
  (2) Park Zotero and first fix `docs/needs-eric.md` section 1 (24 wrong PDFs), since those block re-screens too.
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
