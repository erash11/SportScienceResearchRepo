# Cloud session: merge backlog PRs and publish Batches 72-87 (2026-10-09)

Picked up from `docs/handoffs/2026-10-09-cloud-backlog-and-drafter.md` and the goal in
`docs/agents/goal-finish-library-and-ask.md`. Eric's instructions this session: continue the backlog, then
"merge PRs as you go", then pause after the current batch and close out.

## What happened
- Merged in order: #9, #10, #11 (Batches 19-42), then opened and merged #13 (43-49), #14 (50-56), #15 (57-63),
  #16 (64-71), the drafter #12, #17 (72-79) and #18 (80-87). Each staged branch had master merged in first
  (only `docs/needs-eric.md` conflicted; master's copy was taken, then regenerated) and `npm run audit` passed
  before merging. All Pages deploys succeeded.
- Library: 712 -> 1,381 records. Next unused ID 1414. Backlog left: 658 unscreened unique PDFs.
- Batch 72-79: 76 INCLUDE, 18 EXCLUDE, 2 DEGRADED. Batch 80-87: 49 INCLUDE, 41 EXCLUDE (29 are the PFATS
  "Pro Football Sports Science Research Update" newsletter digests), 6 DEGRADED.

## Decisions (and why)
- Newsletter digests are EXCLUDE (b): each issue reprints other studies' abstracts and has no methods of its own.
- Duplicate articles are EXCLUDE with a duplicate reason, both against published records (Batch 72 Q53 = ID 664)
  and within a batch (pre-proofs and byte-identical copies). `validate.py` only catches the first case, so
  drafters' duplicate flags must be acted on before assembly.
- Anti-doping lab-method papers are INCLUDE, following the Batch 64-71 precedent (open question for Eric).
- Clinical commentaries with Level of Evidence 5 and no search are EXCLUDE (b).
- Reviews that describe a database search are coded Systematic Review / Meta-analysis, even when the authors call
  them narrative.

## Files changed this session (all on master)
- `papers.json`, `paper-taxonomy.json`, `docs/library-coverage-manifest.json`, `docs/pilot-expansion-shortlist.*`
- `docs/pilot-screening/batch-72..87-*.json`, `docs/pilot-synthesis/batch-72..87.json`
- `docs/pilot-screening/batches-72-79-review.md`, `docs/pilot-screening/batches-80-87-review.md`
- `docs/needs-eric.md`, `docs/STATUS.md`, `CLAUDE.md` (counts), this handoff

## To resume (Batch 88, IDs from 1414)
```
git checkout -b batch-88-95-staged origin/master
python3 scripts/haiku-batch/backlog.py <work>/list.txt --count 96
python3 scripts/haiku-batch/prepare.py <work> --files <work>/list.txt
# 12 Haiku drafters (8 IDs each, own helpers/gN folder), then 12 Opus auditors (helpers/vN)
# set each input's pilotDomain from verified primaryDomain, then:
python3 scripts/haiku-batch/validate.py <work>
python3 scripts/haiku-batch/assemble.py <work> <date> 1414 88
# write assembled.json entries to docs/, then review_md.py, needs_eric.py, and
# npm run synthesis:apply, taxonomy:build, audit:manifest, pilot:shortlist, audit, pilot:check
```
Then open a PR to master and merge it (Eric's standing instruction).

## Open
- Eric's calls listed in `docs/STATUS.md` Open questions and the two new review files.
- After the backlog: roadmap update and the pilot launch checklist (pilot lead, 3 staff across 2+ disciplines,
  recorded human claim audits).
