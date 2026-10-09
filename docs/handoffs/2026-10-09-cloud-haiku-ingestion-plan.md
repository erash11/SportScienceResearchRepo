# Cloud session: state check and Haiku ingestion plan (2026-10-09)

Cloud session (claude.ai/code). This file carries this session's analysis and decisions to local sessions. Run `git pull` or `dev-sync` locally to bring it in.

## State verified 2026-10-09
- Nothing changed since the 2026-09-25 checkpoint. `npm run audit` and `npm run pilot:check` both pass. The repository has no open GitHub issues.
- 712 published records. Next unused ID is 744. About 1,530 unique local PDFs remain unrepresented. The Batch 19 queue has 96 candidates, none of them full-text screened.
- Domain coverage is skewed. Training & Performance has 564 records and American Football has 266. Nutrition has 56 and Athlete Wellbeing has 35.
- This checkout has no record of a real Ask the Library pilot. The decision from 2026-09-25 (run the pilot first, or build an automated agent) is still open.
- The STATUS note that says `CLAUDE.md` and the roadmap are stale is itself out of date. Both already show 712 records and Batch 18.

## Recommended direction
- **Ask the Library:** run the concierge pilot, with an automated, Evidence-Library-only drafter behind the operator step. Every claim still goes through `pilot:audit-source` and a recorded human claim audit. This stays within ADR 0010 and tests utility and draft integrity at the same time. `ZoteroInjestion`'s `zotero-bridge ground` (evidence packs with applicability checks and thin/sufficient coverage) is the retrieval pattern to reuse. It currently indexes Zotero, not `papers.json` plus `SourcePapers/`.
- Still waiting on Eric: a pilot lead, three participants across at least two disciplines, and an owner for intake and review cadence.

## Haiku 5.5 ingestion plan
- Estimated cost for the full backlog (about 21M input and 4M output tokens; papers average about 14k tokens):

  | Model | Cost | With Batch API |
  |---|---|---|
  | Haiku 5.5 | ~$4 | ~$2 |
  | Sonnet 5.5 | ~$80 | ~$40 |
  | Opus 5.5 | ~$165 | ~$80 |

  Cost is not the constraint. Claim fidelity is (ADR 0009).
- Pipeline:
  1. Haiku screens and drafts the 13-field record.
  2. An automated claim check runs against the source text.
  3. Flagged papers, systematic reviews, consensus statements, and low-confidence calls escalate to Sonnet 5.5.
  4. The existing audits and a human spot-check of each batch are the final gate.
- **Calibration first:** run Haiku blind on 24 papers that are already published (3 per domain) and score it against the human-reviewed records. Scoring covers the decision, study design, population, and claim accuracy.
- How to run it: Haiku subagents in a Claude Code session need no setup. A Batch API script needs an `ANTHROPIC_API_KEY`, but it is cheapest and runs unattended.
- Review throughput, not drafting, will set the publishing pace.

## Session continuity
- `claude --teleport` (or **Open in > Terminal** on claude.ai/code) pulls a cloud conversation into the local terminal as a one-way copy. It needs a clean tree, the branch pushed, and the same claude.ai login. `/resume` does not list cloud sessions. Teleported or cloud transcripts do not reach local memory or `global-memory` on their own. Committed handoffs like this one are the durable path.
- Eric chose to have cloud work pushed straight to `master`.

## Next
1. Haiku calibration test (in progress this session). Results go to `docs/haiku-calibration/`.
2. Depending on the results, scale ingestion with Haiku, or with Sonnet as the drafter.

## Session outcome (closeout, 2026-10-09)

**Done**
- **Haiku 5.5 calibration passed.** Haiku was run blind on 32 already-decided papers. It caught all 6 source mix-ups and matched study design 22/22. The Opus judge rated 20 of its 22 drafts publishable as written, against 1 of 22 for the published records. Results are in `docs/haiku-calibration/`.
- **Batches 19-26 are staged in draft PR #9** (branch `batch-19-26-staged`). The batch screened all 96 queue papers: 80 INCLUDE (IDs 744-823), 12 EXCLUDE and 4 DEGRADED. Haiku drafted each record and Opus corrected it against the source text (79 of 96 records were corrected).
  - The branch also fixes published records 540 and 467.
  - The shortlist builder and audit now handle the exhausted Athlete Wellbeing title pool. The next queue has 90 candidates.
  - Every audit, the pilot check and the build pass.
  - The review list is `docs/pilot-screening/batches-19-26-review.md` on that branch.
- **Reusable pipeline added:** `scripts/haiku-batch/` (prepare, validate, assemble, plus both instruction sets).
- **/goal prompt for finishing the project:** `docs/agents/goal-finish-library-and-ask.md`. The 1,274-character short prompt is at the top of the file.

**Decisions**
- Haiku 5.5 drafts and Opus 5.5 audits every claim. Rationale: the calibration showed fewer critical errors than the existing human-reviewed records.
- Batch data reaches `master` only through PRs, because `master` deploys the public site. Docs and handoffs are pushed to `master` directly (Eric's choice).
- At most 12 drafter and 12 verifier subagents run in parallel (Eric approved going above 5).

**Next**
1. Eric reviews PR #9: 7 scope calls, 4 wrong PDFs, 4 missing DOIs, 41 spot checks. Merging the PR publishes the batch.
2. Start a fresh session with the /goal prompt. This session has unsubscribed from PR #9 and cancelled its check-in.

**Files created or modified this session** (repo-relative)
- On `master`:
  - `docs/STATUS.md`
  - `docs/handoffs/2026-10-09-cloud-haiku-ingestion-plan.md`
  - `docs/haiku-calibration/` (README, drafts, judgments, instructions, keys, scores)
  - `docs/agents/goal-finish-library-and-ask.md`
  - `scripts/haiku-batch/` (`README.md`, `prepare.py`, `validate.py`, `assemble.py`, `drafting-instructions.md`, `verification-instructions.md`)
- On `batch-19-26-staged`:
  - `docs/pilot-screening/batch-19..26-*.json`
  - `docs/pilot-synthesis/batch-19..26.json`
  - `docs/pilot-synthesis/batch-03.json` and `batch-10.json` (the corrections)
  - `papers.json`, `paper-taxonomy.json`, `docs/library-coverage-manifest.json`
  - `docs/pilot-expansion-shortlist.{json,md}`
  - `scripts/build-pilot-shortlist.mjs`, `scripts/audit-pilot-shortlist.mjs`
  - `docs/pilot-screening/batches-19-26-review.md`

**Memory note.** This cloud container has no `~/.claude/global-memory` or Tier A memory. On the next local session, record the decision "Haiku-draft + Opus-audit is the ingestion pipeline" in MEMORY.md.
