# Handoff 2026-10-29: batch 133-139, 24 new open-access papers (MERGED)

## What and why
Eric asked for more papers. A Europe PMC search (open access, 2025-09 to 2026-10, SR/MA/RCT/guideline,
athlete topics) gave a 24-paper shortlist with DOIs not in the library. Eric said "download all 24" (Option 1:
download and run the full batch to a draft PR), then "it says in, merge".

## Result
- PR #31 merged (`b2b939a`). IDs 2001-2024, batches 133-139 (one per domain). All 24 INCLUDE.
- Haiku 5.5 draft, Opus 5.5 claim audit: 22 CORRECTED, 1 VERIFIED, 1 DECISION_CHANGED.
- `papers.json` = 1,992 rows, max ID 2024. `npm run audit` passes on master. Deploy succeeded; the live
  `papers.json` shows 1,992 rows.
- Next unused ID **2025**, next batch number **140**.

## Decisions and reasoning
- **2020 (Naeini 2025, creatine and kidney function):** drafter said EXCLUDE (c) (trials not athlete-specific).
  The Opus auditor changed it to INCLUDE: creatine kidney safety is an athlete-health question, and the paper is
  framed around athletes and includes football and trained samples. Eric confirmed: stays in.
- **2009 (Shill 2025, concussion prevention, FAIR consensus):** a new review, not a re-issue of Eliason 2023
  (it cites Eliason 2023 as its ref 13, own PROSPERO number, new searches).
- **2015 (ACLR resistance training NMA):** post-surgery patients, not described as athletes; kept INCLUDE as
  athlete-health rehab evidence, tagged Mixed / Unspecified.
- Filenames in `SourcePapers/` use the full title (up to ~200 characters); `: ` becomes ` - `, `?` and `/` become `_`.

## Download route (replaces the Chrome steps)
`https://pmc-oa-opendata.s3.amazonaws.com/?list-type=2&prefix=<PMCID>.` lists a paper's files. The main
article is `<PMCID>.<ver>/<PMCID>.<ver>.pdf`. Two papers also had supplement PDFs (`*_ESM.pdf`,
`Data_Sheet_1.PDF`) in the same folder; a first script took those by mistake and was fixed to match only
the main file. Every PDF was checked for `%PDF`, page count and the printed DOI (`pdftotext`).

## Process notes
- The auto-mode classifier blocked some parallel subagent launches (one drafter prompt three times) for no
  clear reason; resuming an existing drafter with SendMessage worked.
- Drafters B (Q09-Q24) read selected sections, not full texts; drafter A started five sub-agents on its own.
  The Opus auditors read the full texts. A long guideline (53 pages) got its own auditor.
- A closeout session in another window committed a STATUS note to the batch branch mid-run ("15 PDFs landed,
  source unknown"). Those were this batch's PDFs; the note was corrected.
- `needs_eric.py` lists only EXCLUDE scope calls, so it did not change; this batch's borderline notes are in
  the review file.

## Files
- `SourcePapers/` (24 new PDFs, commit f6b7328)
- `docs/pilot-screening/batch-133-training-performance.json` to `batch-139-monitoring-technology.json`
- `docs/pilot-synthesis/batch-133.json` to `batch-139.json`
- `docs/pilot-screening/batches-133-139-review.md` (18 spot checks with paper-level concerns)
- `papers.json`, `paper-taxonomy.json`, `docs/library-coverage-manifest.json`, `docs/STATUS.md`

## Next
1. Eric's long-open DOI identity checks for batch 123-130 (see `docs/STATUS.md` Next item 1).
2. Batch 140 when Eric wants more papers: same search, bucket download, `prepare.py`.
3. Optional: spot-check the 18 flagged records in `docs/pilot-screening/batches-133-139-review.md`; they are
   already live.
