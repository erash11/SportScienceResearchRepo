# /goal prompt: finish the library and make Ask the Library pilot-ready

Drafted 2026-10-09 (cloud session). Paste everything below the line into a new Claude Code session.

---

```
/goal Finish the Baylor Health & Performance Evidence Library and make Ask the Library pilot-ready.

Repo: erash11/SportScienceResearchRepo. Read CLAUDE.md, CONTEXT.md, docs/adr/, docs/STATUS.md, the latest
docs/handoffs/ file, docs/haiku-calibration/README.md, scripts/haiku-batch/README.md and
docs/pilot-screening/batches-19-26-review.md first. Then check PR #9 (Batches 19-26): if it is still open,
subscribe to it and work my review comments on it before starting new batches.

DONE MEANS ALL OF THE FOLLOWING ARE TRUE
A. Library backlog cleared: every unique, unrepresented source PDF in SourcePapers/ (about 1,449 at the
   2026-10-09 count; use docs/library-coverage-manifest.json) has a recorded full-text decision
   (INCLUDE / EXCLUDE / DEGRADED) in docs/pilot-screening/. Every INCLUDE is published via
   docs/pilot-synthesis/ + npm run synthesis:apply. `npm run audit` passes.
B. Known defects resolved or handed to me: the wrong-PDF identity mismatches and the DEGRADED
   missing-DOI records are listed in one "needs Eric" file with the exact action for each.
C. Ask the Library drafter built: a script (e.g. `npm run pilot:draft -- <request.json>`) that turns a
   validated ATL-R request packet into an On-Demand / Not Expert-Reviewed Decision Brief, using ONLY
   published Evidence Library records and their source PDFs (ADR 0002, 0009). It must return a
   Coverage Gap rather than unsupported claims. Output must pass `npm run pilot:brief` and
   `npm run pilot:audit-source`.
D. Drafter evaluated: run it on all questions in docs/ask-library-pilot/examples/stress-test-question-bank.json.
   Have a separate Opus claim-audit pass judge every brief for claim fidelity and decision usefulness.
   Write results to docs/ask-library-eval/. Target: zero unresolved critical integrity failures and
   at least 80% of briefs rated useful. Iterate on the drafter until both targets are met or you have a
   documented reason they cannot be.
E. Docs current: STATUS.md, the roadmap, CLAUDE.md counts, and a dated handoff all reflect the final state.

HOW TO WORK THE BACKLOG
- Use the pipeline in scripts/haiku-batch/ (see its README): prepare.py, then Haiku 5.5 drafting
  subagents, then Opus claim-audit subagents, then validate.py, then assemble.py. Fan out up to 12 drafters
  and 12 verifiers in parallel, 8 papers each. Give each agent its own helper-script folder, because
  shared scratch folders caused collisions last time.
- The title-based shortlist is nearly exhausted. For the backlog, build each queue from the manifest's
  unrepresented content groups (one canonical file per group) and pass it with
  `prepare.py <workdir> --files list.txt`. Before assemble.py, set each input's pilotDomain from its verified
  primaryDomain. Keep stable, never-reused IDs; start from the manifest's nextUnusedId.
- validate.py must print OK before assembly. It checks that IDs and filenames match, the DOI is printed in
  the source text, and values come from the taxonomy vocabularies. Also confirm no em dashes are present.
- Batch about 96 papers per PR. Each PR gets a review file listing scope calls, identity mismatches,
  missing DOIs, and high-priority spot checks (clinical topics, decision changes, substantive corrections).
- Do not push batch data straight to master, because master deploys to the public site. Open a draft PR
  per batch, subscribe to it, and keep going on the next batch while I review.
- After each batch: run npm run synthesis:apply, taxonomy:build, audit:manifest, pilot:shortlist (if
  still meaningful), audit, pilot:check, and build. node_modules and dist are committed with Windows
  binaries. If you reinstall for a Linux build, restore both before committing.

BOUNDARIES
- Never publish a claim that is not grounded in the source text. Never invent a DOI, year or citation detail.
- Never put athlete-identifying or private pilot data in the repo (pilot-data/ask-library/private/ only).
- Do not build authentication, cloud hosting, or a self-service workspace (ADR 0010 defers these until
  the pilot passes).
- Paid external lookups (e.g. Firecrawl for missing DOIs) only with my OK. Batch them into one request.
- Push docs and handoffs to master directly. Data and code changes go through draft PRs.

STOP AND ASK ME WHEN
- A batch PR is ready for review (do not wait idle; continue the next batch unless 3 PRs are unmerged).
- A scope or eligibility rule needs changing, or more than 15% of a batch is EXCLUDE for relevance.
- The drafter eval misses targets after 3 iterations.
- Goals A-E are met. Then hand me the pilot launch checklist: I must name a pilot lead, pick 3 staff across
  2+ disciplines, and record human claim audits. Those steps are mine, not yours.

Keep docs/STATUS.md updated after every batch so any local session can pick up from it.
```
