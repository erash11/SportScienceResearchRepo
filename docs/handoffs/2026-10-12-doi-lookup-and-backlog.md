# Handoff: backlog check and DEGRADED DOI lookup (2026-10-12, Mac)

## What was being worked on
Eric asked to continue processing papers from the backlog.

## Findings
- The PDF backlog is empty. `python3 scripts/haiku-batch/backlog.py` reports 0 unscreened PDFs.
  - 2,155 PDFs on disk (2,125 unique contents).
  - 1,732 screening decisions in `docs/pilot-screening/`.
  - 1,894 rows in `papers.json`. Max ID 1926. Next unused ID: 1927.
- The "82 left" note in STATUS was stale. Those 82 were batch 115-121, merged 10-11.
- `CLAUDE.md` still says 562 unscreened PDFs. That number is stale. It was not changed in this session.

## Decision made (Eric, 2026-10-12)
Option 2 of the DEGRADED list: look up the missing DOIs. Eric then chose option 1: accept the Crossref strong matches as candidate DOIs, with no publication yet.

## What was done
1. Listed DEGRADED records whose `degradedReason` mentions a missing DOI. The filter gave 90 records. `docs/needs-eric.md` section 2 says 88. The 2 extra records came from the keyword filter.
2. Queried Crossref (`query.bibliographic`, top 3, title similarity) for each record's filename. Script: the session scratchpad `doi_lookup.py`. A later version added 429 backoff.
   - 73 STRONG_MATCH (similarity >= 0.90, with DOI).
   - 6 CHECK_BY_HAND (similarity 0.70 to 0.90).
   - 11 NO_MATCH.
3. Checked each STRONG_MATCH DOI at doi.org.
   - 61 returned 200/302/303.
   - 11 returned 403 (publisher bot blocking) or 202. Kept.
   - 1 failed with a network error. Unconfirmed.
4. Result: 72 accepted DOIs.

## Files created or changed
- `docs/doi-lookup/2026-10-12-degraded-doi-candidates.json`. All 90 candidates with status and Crossref data.
- `docs/doi-lookup/2026-10-12-accepted-dois.json`. The 72 accepted DOIs, with `doiVerification` text and the Crossref year.
- `docs/STATUS.md`. Current state, Next, and Open questions updated.

NOT changed: `docs/pilot-screening/*.json` (decisions still DEGRADED), `papers.json`, `docs/needs-eric.md`.

## Why the screening records were not changed
A DEGRADED record has no `sourceVerification` block. A verified DOI lives in `sourceVerification.doi` and `sourceVerification.doiVerification` on a published record. Setting those on a DEGRADED record skips the new screening pass that `needs-eric.md` requires before publishing. So the accepted DOIs are kept in the review file until Eric chooses a path.

## Next actions, most important first
1. Eric chooses option 1 (re-screen the 72 through `scripts/haiku-batch/`) or option 2 (check the 6 CHECK_BY_HAND and 11 NO_MATCH by hand first). See Open questions in STATUS.
2. Confirm the 1 unconfirmed DOI: `10.26603/ijspt20200326`.
3. Replace the 24 wrong PDFs listed in `docs/needs-eric.md` section 1.
4. Check the year on each accepted DOI against its PDF. The year is Crossref's year.

## Open or mid-flight
- The 6 CHECK_BY_HAND and 11 NO_MATCH records are not decided.
- Titles of NO_MATCH items include book chapters and supplement files, such as `BEWARE~1.PDF` and `RESULT~1.PDF`. These may never match Crossref by title.
- The 3 unreadable PDFs listed in `needs-eric.md` section 3 are unchanged.

## Gotchas
- Crossref returns 429 under fast querying. Use at least 1 s between requests, with backoff.
- Publisher sites return 403 to automated HEAD and GET requests. A 403 does not mean the DOI is wrong.
- Only one session should run batch work at a time. Check for open `batch-*-staged` branches before a new batch. None were open on 2026-10-12.
