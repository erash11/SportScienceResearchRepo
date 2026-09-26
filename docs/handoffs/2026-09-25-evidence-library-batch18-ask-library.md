# Evidence Library Batch 18 and Ask the Library checkpoint — 2026-09-25

## Work and reason

Eric asked for a current assessment of SportScienceResearchRepo, then asked to publish more papers from the existing shortlist and continue Ask the Library. He also asked for a subagent to clamp the Codex Companion `SessionEnd` hook timeout to three seconds.

The pulled repository began at 707 published records, 17 full-text-screening/synthesis batches, and an operator-run Ask the Library prototype. The repository's STATUS, roadmap, and CLAUDE.md still described the older 549-record/12-batch checkpoint. The public Evidence Library and isolated Ask prototype have separate product roles; the existing decision in `docs/adr/0010-run-a-concierge-pilot-before-building-the-secure-workspace.md` calls for a real staff pilot before an authenticated self-service workspace.

## Decisions and completed work

- Used the current 96-candidate shortlist as Eric directed. Full-text screened original shortlist positions 1–6. Published five eligible papers as stable IDs 739–743 in Batch 18. Excluded *The Dark Side of College Football* because it is an editorial without original methods or a systematic synthesis. The sleep-loss paper's DOI was absent from its local PDF and was checked against PubMed PMID 18076267.
- Source-grounded summaries distinguish observational associations and practice surveys from causal intervention evidence. The five published records cover acute sleep loss in weightlifters, soccer match-day priming, ACWR and rugby injuries, GPS load around soccer injury, and hamstring-programming practice in European soccer.
- Ran `npm run audit:screening`, `npm run synthesis:apply`, `npm run taxonomy:build`, `npm run audit:manifest`, `npm run pilot:shortlist`, `npm run audit`, `npm run pilot:check`, and `npm run build`. The final audit reported 712 published records, 600 local-source records, 112 internal/external records, 18 screening/synthesis batches, 202 INCLUDE, 6 EXCLUDE, 2 DEGRADED, and 103 reviewed Zotero publications. The next unused stable ID is 744. The refreshed shortlist remains 96 title-screened candidates, 12 per domain. The build passed. GitHub Pages deployment for commit `e4905b8` reported success.
- No real Ask pilot request, brief, feedback, audit, or scorecard files were found in this Windows checkout's Git-ignored private pilot folders. This does not prove no pilot occurred elsewhere. Ask the Library's 14 pilot-core tests and synthetic examples passed, but an automated source-grounded agent is not present in the repo.
- A subagent changed only `C:\Users\eric_rash\.codex\plugins\cache\openai-codex\codex\1.0.6\hooks\hooks.json`: `SessionEnd` timeout 5 to 3 seconds. PowerShell JSON parsing passed. The plugin cache may be replaced on update; the timeout cap does not diagnose the lifecycle script's delay.
- Another concurrent session committed the Batch 18 screening, synthesis, paper data, taxonomy, coverage manifest, and initial STATUS refresh as `7db3c25`. This session then pushed the regenerated shortlist and current documentation as `e4905b8`. The DEV router checkpoint was pushed as `4a69b73`.

## Files created or modified

All paths below are absolute Windows paths. The paper PDFs were already in `SourcePapers`; no PDF was added in this session.

- `C:\Users\eric_rash\Desktop\DEV\SportScienceResearchRepo\docs\pilot-screening\batch-18-training-performance.json`
- `C:\Users\eric_rash\Desktop\DEV\SportScienceResearchRepo\docs\pilot-synthesis\batch-18.json`
- `C:\Users\eric_rash\Desktop\DEV\SportScienceResearchRepo\papers.json`
- `C:\Users\eric_rash\Desktop\DEV\SportScienceResearchRepo\paper-taxonomy.json`
- `C:\Users\eric_rash\Desktop\DEV\SportScienceResearchRepo\docs\library-coverage-manifest.json`
- `C:\Users\eric_rash\Desktop\DEV\SportScienceResearchRepo\docs\pilot-expansion-shortlist.json`
- `C:\Users\eric_rash\Desktop\DEV\SportScienceResearchRepo\docs\pilot-expansion-shortlist.md`
- `C:\Users\eric_rash\Desktop\DEV\SportScienceResearchRepo\docs\STATUS.md`
- `C:\Users\eric_rash\Desktop\DEV\SportScienceResearchRepo\docs\health-performance-evidence-library-roadmap.md`
- `C:\Users\eric_rash\Desktop\DEV\SportScienceResearchRepo\CLAUDE.md`
- `C:\Users\eric_rash\Desktop\DEV\docs\STATUS.md`
- `C:\Users\eric_rash\.codex\plugins\cache\openai-codex\codex\1.0.6\hooks\hooks.json`
- `C:\Users\eric_rash\Desktop\DEV\SportScienceResearchRepo\docs\handoffs\2026-09-25-evidence-library-batch18-ask-library.md` (this handoff)

## Next actions

1. Await Eric's answer on Ask the Library: run the approved three-person/nine-question concierge pilot first, or proceed directly to automated source-grounded agent development. The choice changes the next implementation and the current ADR favors the pilot.
2. If running the pilot, identify the lead and three staff across at least two disciplines; use real de-identified questions, original-source claim audits, and the approved utility/integrity scorecard. Do not infer pilot success from tests or synthetic examples.
3. Screen Batch 19 from the regenerated shortlist; verify source identity and full text, synthesize only INCLUDE decisions, and run all publication audits before pushing.
4. After Ask direction is settled, update this handoff and `docs/STATUS.md` with the chosen implementation path.

## Closeout checks

The 2026-09-25 DEV sweep checked 147 discovered Git repos under the DEV root and its Football and SpecialRequests groups; none was dirty or ahead/behind upstream at that moment. `~/.claude/skills` was clean. `~/.claude` and `~/.claude/global-memory` contained changes from other sessions that closeout will commit and push. The global-memory transcript error log was zero bytes, and today's transcript existed and was recently modified. No background PowerShell jobs were reported; the latest Evidence Library deployment workflow completed successfully.

## Closeout addendum — 2026-09-26

- The Sep 25 closeout swept 147 DEV repos and found none dirty or unpushed. A Sep 26 repeat gave the same result. `SportScienceResearchRepo`, DEV, `~/.claude` (`b0d67e6`), and `~/.claude/global-memory` (`bedf7d5`) were pushed; `~/.claude/skills` was clean. The project handoff was pushed in `68b97f5`, and the DEV router link in `a7915f7`.
- The Windows dev-docs harvest succeeded for 143 project repos. Today's Sep 25 transcript was present and current during closeout. There is no Sep 26 Claude transcript yet; the resumed work is in Codex.
- After the first error-log check, the detached `memsearch-sync` worker produced `ENOBUFS` because its log output exceeded Node's default 1 MiB `spawnSync` buffer. `C:\Users\eric_rash\.claude\hooks\memsearch-sync.js` now sets a 32 MiB buffer and passes `node --check`. A direct worker retry did not repeat `ENOBUFS`, but hit the existing 600-second timeout (transient streak 1/6). `C:\Users\eric_rash\.claude\global-memory\transcripts\.errors.log` retains the original 86-byte error; indexing completion remains unverified.
- A separate SCN sprint-course Tier A note at `C:\Users\eric_rash\.claude\projects\C--Users-eric-rash-Desktop-DEV\memory\project_scn-sprint-course.md` reports SecondBrain vault commit `23d0ad0` left unpushed on the Mac. GitHub's `erash11/SecondBrain` repository does not contain that commit as of Sep 26. No Windows `SecondBrain` checkout was found at the expected user-home or Drive paths, so this machine cannot push that local Mac commit. The vault itself contains the course's durable library entries; push the Mac checkout before relying on cross-machine access.
