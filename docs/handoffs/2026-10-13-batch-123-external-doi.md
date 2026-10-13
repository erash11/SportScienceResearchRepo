# Handoff: batch 123-130 (external-DOI re-screen of 72 papers)

Date: 2026-10-13 (Mac). Branch `batch-123-staged`. Draft PR #29. Not merged.

## What was done
- Eric chose option 1 from `docs/doi-lookup/2026-10-12-accepted-dois.json`: re-screen the 72 accepted DOIs.
- Workdir (outside the repo): `~/Library/Caches/sportsci-batch-123/`. Contains `inputs.json`, `text/`, `drafts/`,
  `verified/`, `review.json`, `assembled.json`. Reuse the same layout for the next external-DOI batch.
- Drafted by Haiku 5.5 (9 agents x 8 papers). Claim-audited by Opus 5.5 (9 agents x 8 papers).
- Result: 68 INCLUDE (IDs 1927-1994), 3 DEGRADED, 1 EXCLUDE. Published rows 1,894 -> 1,962. Next unused ID 1995.
- `npm run synthesis:apply`, `taxonomy:build`, `audit:manifest`, `audit` all pass.
- `npm run pilot:shortlist` was NOT run on purpose (CLAUDE.md: regenerate the queue only when intended). The audit passes without it.

## Changes to scripts (committed on this branch)
- `scripts/haiku-batch/validate.py`: an INCLUDE DOI that equals the input's `externalDoi` skips the "DOI printed in text" check. The published-DOI duplicate check still applies.
- `scripts/haiku-batch/assemble.py`: for an external DOI, `sourceVerification.doiVerification` carries the Crossref provenance note, not "printed in local PDF text".
- Old DEGRADED entries for the 72 papers were removed from `docs/pilot-screening/`. `batch-85-brain-health-psychology.json` was deleted: its only record (a hyperbaric oxygen review) is replaced by batch-123 Q29.

## Addendum used for drafting and auditing (verbatim)
Source: `INSTRUCTIONS.md` and `VERIFY.md` in the workdir. Not in the repo's shared `scripts/haiku-batch/` instruction files.

## Batch 123 addendum: external DOI (overrides the DOI rules above for this batch only)
- Each input in `inputs.json` has `externalDoi`, `crossrefTitle` and `crossrefYear`. These came from a Crossref title match on the filename (2026-10-12). The DOI is NOT printed in the PDF text, so these records were DEGRADED before.
- Identity first: if the title and authors in the PDF text match `crossrefTitle`, it is the same article. Then set `paper.doi` to `externalDoi` (lowercase), `doiMissing` to false, and decide INCLUDE or EXCLUDE by the normal rules. Do NOT mark DEGRADED for "DOI not printed in text".
- If the PDF text is a different article from `crossrefTitle` and from the filename, EXCLUDE with reason (a) source identity mismatch. Do not use `externalDoi`.
- Year: use the year printed in the PDF (normal rule). If it differs from `crossrefYear`, keep the PDF year and say so in `limitations`.
- Every record in this batch keeps `externalDoi` as its DOI only when identity matches. Never invent a DOI.

## Batch 123 addendum: external DOI (overrides the DOI rule above for this batch only)
- Each input in `inputs.json` has `externalDoi`, `crossrefTitle` and `crossrefYear` (Crossref title match on the filename, 2026-10-12). The DOI is not printed in the text, so the DOI check is: the PDF title and authors must match `crossrefTitle`. If they match, `paper.doi` must equal `externalDoi` and `doiMissing` must be false.
- If the PDF is a different article, the decision must be EXCLUDE (identity mismatch) and `paper.doi` must be cleared.
- If the PDF year differs from `crossrefYear`, keep the PDF year, state the difference in `residualConcerns`, and set `spotCheckPriority` to "high".

## What went wrong with the accepted DOIs (6 of 72)
The Crossref title match was made on the filename, not the paper. Six of the 72 DOIs were wrong. Each was caught in
drafting or audit and set to DEGRADED with the DOI cleared, or kept with a flag:
- Preprint DOI: Q02 (paper ID 1976). OSF preprint DOI for a published JOSPT manuscript. Kept, flagged.
- Correction notice: Q60 (paper ID 1951). Used the DOI printed in the article instead.
- Other journal's printing of the same statement: Q25 (paper ID 1942). Kept, flagged.
- Same-title item in another journal: Q20. DOI cleared, DEGRADED.
- DOI of a different paper by the same authors: Q35. DOI cleared, DEGRADED.
- Book chapter with the same title: Q45. DOI cleared, DEGRADED. Crossref suggests 10.1249/jsr.0000000000000418 (unconfirmed).
- Also flagged: Q31 (paper ID 1981). arXiv preprint vs the journal version of the same paper. Kept.

Lesson: title and author match is not enough. Check the journal or container-title too.

## Independent check (after audit)
All 68 INCLUDE DOIs were checked in Crossref `works/{doi}` for first-author surname and journal.
- 58 match. 4 are journal abbreviations (fine). 3 citations lack a journal name (1939, 1946, 1974).
- 3 DOI problems: 1942, 1976, 1981. Results are in `docs/pilot-screening/batches-123-130-review.md`.
- Script: session scratchpad `crossref_check.py` (not in the repo). Re-create if needed: one request per DOI at 1 s intervals, retry on 429 and 5xx.

## Known gaps
- Q08: the source is a case report with no printed abstract. The abstract field was written by the batch owner from the Introduction and results. Logged in `verification.changes`. It skipped the Opus pass for that field.
- Paper year: some accepted manuscripts print no year. The year then comes from Crossref and is flagged in `limitations`.
- Several records have internal table/text conflicts, flagged in `residualConcerns`.

## Zotero findings (new sources)
- `zotero-research-library-pp-cli sync` ran on 2026-10-13. It writes a cache at `~/.local/share/zotero-research-library-pp-cli/data.db` (read it with sqlite3 in read-only mode).
- Zotero MCP tools (`mcp__zotero__*`) return "MCP tenant gate is not configured". The CLI works.
- Upper bound: 880 journal articles have a PDF attachment, a DOI, and no match in `papers.json` or in any screening file. Matching is on DOI only. Some of the 880 may already be on disk under a different filename (about 50 published rows have no DOI). Treat 880 as an upper bound.
- The admission route is `docs/contracts/zotero-publication-candidate-v1.md`. It uses the bridge at `~/DEV/ZoteroInjestion` (Python, `uv`, `.venv` present on the Mac). It needs Zotero credentials (`ZOTERO_API_KEY`, `ZOTERO_USER_ID`, or the config file). Without them `zotero-bridge doctor` fails. Setting them is an operator step. Do not paste keys into chat or into this repo.
- Windows laptop: hands-off since 2026-10-08. The bridge does not run there.

## Next actions
1. Eric: review PR #29 and the flagged paper IDs (see STATUS). Merging publishes the records.
2. Eric: decide the new-sources route (STATUS, Open questions): Mac bridge pilot of 10 papers, or park Zotero and fix `docs/needs-eric.md` section 1 first.
3. Confirm the unconfirmed DOI `10.26603/ijspt20200326` at doi.org (not in this batch).
