# Baylor Athletics Health & Performance Evidence Library Roadmap

**Adopted:** July 21, 2026
**Status:** Working direction
**Product name:** Baylor Athletics Health & Performance Evidence Library

## Decision

Maintain one shared evidence library for Baylor Athletics Health & Performance staff. Football becomes a searchable context within the library rather than the product identity. Sport-specific exports or views can be added later without splitting the source of truth.

The canonical evidence from the original 433-row library and its football-specific translations is retained. New work broadens the interface and evidence coverage without erasing the context that produced the current collection.

## Product Principles

1. **One evidence base, multiple contexts.** Do not create separate paper stores for each sport or discipline.
2. **Evidence first.** Abstract, methods, findings, and limitations remain distinct from practitioner translation.
3. **Context is metadata.** Sport, population, domain, and audience become filters, not required prose in every summary.
4. **Application notes are optional.** Do not force performance, medical, nutrition, or sport-specific claims when a paper does not support them.
5. **Exports are downstream views.** Future sport- or discipline-specific exports read from the same normalized library.
6. **Verification before volume.** Source identity, schema validity, and link resolution gate each published batch.

## Pre-Cleanup Baseline

The July 21, 2026 read-only audit established:

- 433 published rows: 8 Baylor internal entries and 425 source-backed rows
- 396 distinct local source PDFs represented cleanly
- 1,759 of 2,155 local source PDFs not represented
- 16 duplicated source-file groups producing 27 additional rows
- 2 unresolved source references
- 1 blank return-to-sport value
- Public GitHub Pages deployment healthy with 433 rows loaded

These counts supersede the older filename-filter estimate in `session.md`.

## Trustworthy Baseline Completed

The July 21 cleanup removed 26 verified duplicate rows, repaired the malformed source links, separated two records that had been assigned the wrong shared source, restored the previously unreadable workload paper from its PDF, corrected one DOI/citation, and completed the blank return-to-sport field.

The reproducible manifest at `docs/library-coverage-manifest.json` now reports:

- 407 canonical published rows with 407 unique stable IDs
- 398 local source-backed rows, 8 Baylor internal rows, and 1 DOI-backed external row
- no repeated or unresolved local source references
- no missing required fields or schema mismatches
- 2,155 PDFs representing 2,125 unique file contents
- 394 unique local source contents represented and 1,731 unrepresented
- all five publication quality gates passing

Run `npm run audit` before publication and `npm run audit:manifest` whenever the corpus or published library changes.

## Target Module Shape

The UI should consume a normalized paper interface rather than knowing whether a record came from the legacy schema or a future schema.

### Normalization seam

Introduce one normalization module when the taxonomy is implemented:

```text
papers.json record
      |
      v
normalizePaper(record)
      |
      v
normalized evidence record
      |
      +--> search and filters
      +--> evidence table
      +--> CSV or future sport-specific exports
```

This seam keeps legacy keys such as `athleteDev` and `rtp` behind a small interface. The current UI should not accumulate conditional logic for each schema generation.

### Proposed normalized evidence record

The exact persisted schema will be approved before implementation, but the normalized interface should support:

- identity: ID, citation, DOI, year, source URL
- evidence: abstract, TLDR, methods, findings, limitations
- translation: general practical implications plus optional audience-specific applications
- context: domains, audiences, sports, populations, and study design
- curation: source verification and review status

Suggested filter dimensions:

- **Domain:** performance, sports medicine, rehabilitation, recovery, nutrition, brain health, wellbeing, monitoring/technology
- **Audience:** performance, athletic training, sports medicine, rehabilitation, nutrition, research, coaching
- **Sport context:** general/mixed sport plus named sports where applicable
- **Population:** sex, competitive level, age group, injured/healthy status when reported
- **Study design:** systematic review, randomized trial, cohort, cross-sectional, consensus/position statement, narrative review, case report, other

## Delivery Phases

### Phase 1 — Public Reframe

- Adopt the approved product name across the live UI, browser metadata, exports, and current documentation
- Replace football-only public labels with Performance Application and Return to Sport Application
- Preserve the current persisted schema and all existing content

**Exit condition:** the shared library no longer presents football as the umbrella identity and the existing app builds and loads the canonical dataset.

### Phase 2 — Trustworthy Baseline

- Generate a reproducible source-to-record manifest
- Resolve or document the two broken source references
- Review the 16 duplicated source groups and remove only verified redundant rows
- Complete the blank return-to-sport value or explicitly mark it not applicable
- Add automated checks for IDs, required fields, duplicate source identity, and link construction

**Exit condition:** processed and remaining counts can be reproduced from the repo, and every published row passes the agreed validation checks.

### Phase 3 — Taxonomy and Discovery

- Approve the normalized evidence interface and controlled vocabularies
- Add the normalization module at the data-loading seam
- Backfill domain, audience, sport/population, and study-design metadata for existing records
- Add multi-select filters without weakening current full-text search

**Exit condition:** staff can find evidence by professional need or population without knowing football terminology.

### Phase 4 — Balanced Expansion Pilot

- Select 75–100 unrepresented papers across health and performance domains
- Include cross-sport and underrepresented population evidence intentionally; do not rely only on the existing backlog's distribution
- Process in small audited batches with source, extraction, synthesis, and verification gates
- Publish only after duplicate and schema checks pass

**Exit condition:** the live library contains at least 500 distinct evidence sources and demonstrates useful breadth to both medical and performance staff.

### Phase 5 — Backfill and Operating Cadence

- Prioritize the remaining corpus by domain relevance and evidence value rather than alphabetic order or a football filename filter
- Separate the one-time backlog burn-down from the ongoing new-research cadence
- Pilot with representatives from performance, athletic training/sports medicine, rehabilitation, and nutrition
- Add downstream sport- or discipline-specific exports only when a real staff workflow requires them

**Exit condition:** the library has a repeatable intake, verification, publishing, and review cadence with named ownership.

## Next Decision

Before Phase 3 implementation, approve the controlled domain and audience vocabularies and decide whether the first expansion pilot should be balanced evenly across domains or weighted toward the highest-priority Health & Performance questions.
