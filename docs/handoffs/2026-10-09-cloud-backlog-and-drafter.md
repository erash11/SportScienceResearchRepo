# Cloud session: backlog run and Ask the Library drafter (2026-10-09)

Cloud session (claude.ai/code), started from the /goal prompt in `docs/agents/goal-finish-library-and-ask.md`. This file is the durable record; `docs/STATUS.md` has the live state.

## State at handoff
- **Batch PRs (merge in order; each is stacked on the previous one):**
  - #9 Batches 19-26 (title shortlist): 80 INCLUDE, IDs 744-823.
  - #10 Batches 27-34 (first manifest-backlog batch): 81 INCLUDE, IDs 824-904.
  - #11 Batches 35-42: 73 INCLUDE, IDs 905-977.
  - After all three merge: 946 records, next unused ID 978.
- **Backlog:** 1,427 unscreened unique PDFs at the start of this session. 192 screened in #10 and #11; 1,235 remain. Batches beyond #11 are staged on stacked branches (`batch-43-50-staged` and later). No new PR is opened while 3 are unmerged.
- **Drafter:** PR #12, branch `ask-library-drafter`. `npm run pilot:draft -- <request.json>`. Evaluation is in `docs/ask-library-eval/`. Iteration 3 has 0 critical integrity failures and 12/12 briefs rated useful.
- **Needs Eric:** `docs/needs-eric.md`: wrong PDFs on disk, DEGRADED records (mostly missing DOIs), scope reversals, and legacy DOI collisions.

## Decisions made in this session
- Backlog queues come from `scripts/haiku-batch/backlog.py`: one canonical file per unrepresented content group, in filename order.
- Scoping reviews with a described systematic search are coded Systematic Review / Meta-analysis, following library precedent.
- A DOI that is already published means a duplicate article under another filename. It becomes EXCLUDE (duplicate). Two such duplicates were caught: IDs 644 and 111.
- EXCLUDE records with no verified domain are filed in the Training & Performance batch.
- `pilot:audit-source` accepts an excerpt found in either the layout or the reading-order `pdftotext` extraction of the page. Layout mode interleaves two-column articles.
- Drafted IDs that were never published (ID 905 in Batch 34) may be reassigned. Published IDs are never reused.

## Gotchas
- The Workflow runner caps concurrency at 2 agents on a 4-CPU container. Launch drafters and auditors as parallel background subagents instead (12 at a time worked).
- Build on Linux in a scratch copy (`tar` the repo without SourcePapers, node_modules and dist, then `npm ci` and `npm run build`). The committed Windows `node_modules` and `dist` stay untouched.
- Some PDFs exist twice under filenames that differ only in Unicode punctuation (curly apostrophes, U+2010 hyphens). Keep `sourceFile` byte-identical to `inputs.json`.

## Next
1. Eric reviews and merges #9, #10 and #11, then #12.
2. Open PRs for the staged batches as merges free slots, and continue the backlog until it is empty.
3. When the backlog is done: update the roadmap and the `CLAUDE.md` counts, and hand over the pilot launch checklist.
