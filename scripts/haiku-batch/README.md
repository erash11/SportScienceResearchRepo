# Haiku batch pipeline

Full-text screening and synthesis at scale. Claude Haiku 5.5 drafts each record and Claude Opus 5.5 audits every claim against the source text. The calibration that supports this split is in `docs/haiku-calibration/`. The first production run was Batches 19-26 (PR #9).

1. `python3 scripts/haiku-batch/prepare.py <workdir>`. Use `--files list.txt` to pass explicit source filenames, for example backlog files from `docs/library-coverage-manifest.json`. This step extracts text, page counts and DOI candidates, and copies the instructions into the workdir.
2. Drafting: run Haiku subagents of 8 papers each. Each one follows `<workdir>/INSTRUCTIONS.md` and writes `drafts/<ID>.json`.
3. Verification: run Opus subagents of 8 papers each. Each one follows `<workdir>/VERIFY.md` and writes `verified/<ID>.json`, with corrections made in place and a `verification` block. Give each agent its own helper folder, because shared scratch folders collided in the first run.
4. `python3 scripts/haiku-batch/validate.py <workdir>`. This checks IDs, filenames, DOIs printed in the text, taxonomy values and required fields.
5. `python3 scripts/haiku-batch/assemble.py <workdir> <date> <next-id> <first-batch-no>`. This produces one screening batch and one synthesis batch per domain (`assembled.json`) plus `review.json`.
6. Write the assembled files into `docs/`, then run `npm run synthesis:apply`, `taxonomy:build`, `audit:manifest`, `pilot:shortlist` and `audit`. Open a draft PR with a review list. Merging the PR publishes the records.

Notes:
- `node_modules` and `dist` are committed with Windows binaries. To build on Linux, run `npm ci`, then restore both directories before you commit.
- Crossref and PubMed are blocked in cloud sessions. A missing DOI means DEGRADED until the DOI is verified another way.
