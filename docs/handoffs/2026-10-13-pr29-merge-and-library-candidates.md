# Handoff: PR #29 merged, library candidates staged (2026-10-13)

## What happened

- Batch 123-130 re-screen of 72 DOI candidates was merged as PR #29 (merge commit `1c914e2`). `papers.json`
  now has 1,962 rows, max ID 1994. `npm run audit` passes on master.
- Codex (cross-provider review, 3 rounds, runner in `~/.claude/skills/claudex-loop/scripts/runner.py`) returned
  REVISE, then REVISE, then APPROVED.
  - R1 (high): `scripts/haiku-batch/validate.py` skipped the in-text DOI check on DOI equality alone. Fixed:
    the skip now needs `externalDoiIdentity` (crossrefDoi equal, titleMatch, authorMatch, journalMatch all true).
  - R2 (medium): DOI/version mismatches on IDs 1942, 1976, 1981. Fixed:
    - 1942 -> `10.1249/jsr.0000000000000589` (Current Sports Medicine Reports, 2019, 18(4)).
    - 1976 -> `10.2519/jospt.2021.9893`, year 2021 (Crossref issued date; PDF downloaded January 2021).
    - 1981 -> `10.48550/arXiv.2407.08508` (arXiv v1, 2024).
  - R3 (medium): 1976 limitation text still said 2020. Fixed in `papers.json` and
    `docs/pilot-synthesis/batch-130.json`.
- Commits on `batch-123-staged` before merge: `61055d9`, `63d3db3`, `5e673bd`, `cc3ecef`, `61d35ea`, `eedcd17`,
  `50affa3`, `3bde7e1`, `a5e9186`. Merge commit on master: `1c914e2`. STATUS commit on master: `5210856`.

## Library candidates (Zotero, via zotero-bridge)

| Paper ID | Zotero key | Paper | Status |
|---|---|---|---|
| 1995 | IHXYT82G | Stahl et al. 2020 (CMJ, NCAA DI vs NAIA) | staged, reviewer Eric Rash, 2026-10-13 |
| 1996 | VVSYTGU4 | Staton et al. 2026 (single-leg CMJ techniques) | staged, same reviewer |
| 1997 | H54I3EL2 | Macadam et al. 2017 (wearable resistance, sprint) | staged, same reviewer |
| 1998 | NEY6YYVZ | Mokha et al. 2026 (position and joint-power symmetry) | staged, same reviewer |

- Staged files: `docs/zotero-synthesis/zotero-publication-{IHXYT82G-v9563,VVSYTGU4-v9558,H54I3EL2-v7904,NEY6YYVZ-v9582}.json`.
- Paper Briefs (vault, `~/SecondBrain/Knowledge/library/research-papers/`): the three promoted briefs and NEY6YYVZ
  (`mokha-2026-american-football-position-does-not-influence-symmetry-in-joint-power-during-high-speed-ru.md`).
- Backups: `scratchpad/brief/vault_backup/` (old untracked NEY6YYVZ brief, H54I3EL2 stub) under the Claude
  session scratchpad, not in any repo.
- None of 1995-1998 is in `papers.json`. Applying is a separate step: `npm run candidate:apply -- <publication json>`.

## Decisions Eric made today

- Option 1 (re-screen) and option 2 (batch pipeline) earlier in the day.
- Reviewer name for staging: Eric Rash.
- Merge of PR #29: approved, after Codex round 3 APPROVED.
- Zotero DOI and date for NEY6YYVZ were added by Eric in the Zotero app. The key stays read-only; the agent
  never wrote to Zotero.

## Next actions (most important first)

1. Eric: decide whether to apply staged candidates 1995-1998 to `papers.json`.
2. Eric (or agent with approval): reviewer check for seven DOIs that lack an identity record. Q05 (1939),
   Q09 (1974), Q41 (1934), Q42 (1946), Q44 (1947), Q47 (1968), Q48 (1948). Each is a citation-format issue, not a
   known wrong DOI.
3. Eric: check 1981's arXiv DOI. The arXiv PDF does not print the DOI, so the validator cannot confirm it from text.
4. Eric: check 1998's Kruskal-Wallis vs F-statistic mismatch against the PDF before any apply.
5. Eric: 1996 year. The paper's citation line prints 2025; the footers and copyright print 2026. The brief uses 2026.
6. Five library papers already published (IDs 667, 487, 584, 577, 585) were not re-added. Their audited versions are
   in the Claude session scratchpad (`brief/out/`), not in the repo.
7. SLIXJHBF (WKP858A4): PDF missing on this Mac. Re-attach in Zotero, then sync.
8. Zotero write access stays off. Do not enable it for the bridge.

## Gotchas

- Bridge `save_paper_brief` refuses to overwrite a brief that was edited by hand after promotion. Re-saving is
  only safe after the file matches the bridge's stored hash, or after the brief is re-saved through the bridge.
- Candidate builds depend on the current Zotero item version. Any Zotero edit bumps the version, and the
  candidate must be rebuilt from a brief saved at that version.
- Bridge `publication-candidate --output` only writes inside `~/Library/Application Support/zotero-research-bridge/publication-candidates`.
- `validate.py` on an already-assembled batch flags every DOI as "already published" because papers.json now holds it.
  That check is for pre-assembly runs only.
