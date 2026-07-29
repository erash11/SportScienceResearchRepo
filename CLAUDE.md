# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **deployed React web app** — the **Baylor Athletics Health & Performance Evidence Library**, built for performance, medical, rehabilitation, nutrition, and research staff. It is hosted on GitHub Pages and accessible at:

**`https://erash11.github.io/SportScienceResearchRepo/`**

The app is a single-file React module (`football-research-library.jsx`, retained as a legacy filename) built with Vite. Staff can bookmark the URL and access it from any workstation. Every push to `master` auto-deploys via GitHub Actions.

The adopted product direction and staged sport-agnostic migration are documented in `docs/health-performance-evidence-library-roadmap.md`.

## Agent skills

### Issue tracker

Track implementation work and PRDs in GitHub Issues via the `gh` CLI; external pull requests are not a triage request surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix` workflow labels. See `docs/agents/triage-labels.md`.

### Domain docs

Use the single-context layout: read root `CONTEXT.md` and relevant decisions under `docs/adr/` when present. See `docs/agents/domain.md`.

## Architecture

The primary UI lives in `football-research-library.jsx`. It is a default-exported React functional component using hooks (`useState`, `useEffect`, `React.Fragment`). `evidence-taxonomy.mjs` owns the normalized runtime interface and controlled vocabularies; `paper-taxonomy.json` supplies deterministic legacy metadata. Google Fonts are injected as a DOM side effect at module load time.

There is no router, no state management library, no CSS framework, and no external dependencies beyond React itself. There is no `window.storage` dependency — the component is self-contained.

### Ask the Library prototype

The confirmed product contract is in `docs/ask-the-library-product-contract.md`, canonical language is in `CONTEXT.md`, and durable trade-off decisions are in `docs/adr/`. The isolated interaction prototype lives under `prototypes/ask-library/`; run it with `npm run prototype` and validate its separate production bundle with `npm run prototype:build`.

The congested-week example simulates guided intake, one clarification, a Decision Brief, controlled sharing, review submission, and Use Signals. Non-demo questions download de-identified request packets for the operator-mediated pilot described in `docs/ask-library-pilot/README.md`; the app does not send or store them. It does not authenticate users, call an AI service, or change the deployed public-library entry point. Do not present or deploy it as a production staff workspace.

`ask-library/pilot-core.mjs` is the pilot policy seam. It validates requests and briefs, enforces confidence-gated recommendations, audits claim excerpts through an injected source-text adapter, and scores the confirmed expansion gates. Run `npm run pilot:check` for tests and synthetic fixtures. Run `npm run pilot:audit-source -- <brief.json>` to verify page excerpts against local PDFs with `pdftotext`.

Private pilot requests, briefs, audits, and scorecards belong under `pilot-data/ask-library/private/`, which Git ignores. Never commit participant questions or other private pilot data.

Published Zotero-backed sources are admitted only through the reviewed candidate workflow in
`docs/contracts/zotero-publication-candidate-v1.md`. Their private PDFs remain in Zotero. For original-source
auditing, set `ZOTERO_BRIDGE_COMMAND` to the installed `zotero-bridge.exe`; the pilot CLI resolves the published
paper ID to its versioned Zotero item and reads cached page text.

### Data Architecture

Paper data has a single source:

| Source | Contents |
|--------|----------|
| GitHub `papers.json` (public repo) | All committed papers, fetched at load time |

- **GitHub URL:** `https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/papers.json`
- Browser HTTP cache handles caching automatically — no manual caching needed
- On fetch failure, `fetchFailed = true` and a warning banner is shown

### App Load Sequence

1. Fetch `papers.json` from GitHub; on failure set `fetchFailed = true`, show warning banner
2. Merge each record with `paper-taxonomy.json` and call `normalizePaper(record, metadata)`
3. `setPapers(normalizedData)` → search, filter, export, and render through the normalized interface

## Deployment

| File | Purpose |
|------|---------|
| `vite.config.js` | `base: '/SportScienceResearchRepo/'` required for GitHub Pages sub-path |
| `package.json` | `dev`, `build`, `preview` scripts |
| `index.html` | Vite entry point → `preview-main.jsx` |
| `preview-main.jsx` | Mounts `<HealthPerformanceEvidenceLibrary />` |
| `evidence-taxonomy.mjs` | Controlled vocabularies, deterministic inference, and backward-compatible `normalizePaper` adapter |
| `paper-taxonomy.json` | 549-row taxonomy sidecar; generated legacy rows are marked unreviewed and published pilot rows retain full-text-reviewed provenance |
| `.github/workflows/deploy.yml` | Auto-deploys `dist/` to `gh-pages` branch on every push to `master` |

**To deploy:** just `git push origin master` — Actions handles the rest.

## Adding Papers

- **Batch import (AI agents):** Process selected PDFs from `SourcePapers/`, generate paper objects with the 13-field legacy schema, merge into `papers.json`, then run `npm run taxonomy:build`. IDs must be stable numeric strings; assign from the next unused ID and never reuse a removed ID. Do not use `Date.now()` for batch imports. Run `npm run audit` before publishing.
- **Public submissions:** The site does not expose a submission control. Papers are added through the curated batch-import and review workflow above so the public interface does not imply that a submission will be published automatically.
- **Reviewed Zotero candidates:** Validate with `npm run candidate:check -- <candidate.json>`, record accountable
  approval with `npm run candidate:stage -- <candidate.json> --paper-id <id> --reviewed-by "<name>" --reviewed-on
  <YYYY-MM-DD>`, and apply locally with `npm run candidate:apply -- <publication.json> --published-on
  <YYYY-MM-DD>`. Applying runs audits and rolls back on failure; commit, push, and deploy remain separate actions.

## Paper Data Schema

Each current paper object has exactly 13 persisted fields. The storage keys remain stable and are mapped by the backward-compatible adapter:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique stable numeric string (e.g. `"284"`); gaps are expected after verified deduplication |
| `year` | number | Publication year |
| `citation` | string | Full citation ("Authors. Title. Journal. Year;vol:pages."); displayed in Authors column |
| `doi` | string | DOI string (may be empty) |
| `driveUrl` | string | Google Drive or external link URL (may be empty); rendered as "Open →" |
| `abstract` | string | Summarized abstract |
| `tldr` | string | One-paragraph practitioner summary |
| `methods` | string | Methods used |
| `findings` | string | Key findings |
| `limitations` | string | Study limitations |
| `practicalImplications` | string | Actionable implications for staff |
| `athleteDev` | string | Legacy key; displayed as **Performance Application**. Many existing values retain football-specific context. |
| `rtp` | string | Legacy key; displayed as **Return to Sport Application**. |

## Search and Filter Logic

Full-text search runs across normalized identity, evidence, translation, and taxonomy text. Year remains an exact filter. Domain, audience, sport, population, and study-design controls are multi-select: OR within a dimension and AND across dimensions. Search and every filter reset pagination to page 1.

## Pagination

50 papers per page. Global row numbers (page 2 starts at row 51). `getPaginationPages(current, total)` returns page numbers with `"..."` ellipsis.

## Table Layout

The table uses an **expandable-row pattern** — no horizontal scrolling:

**Compact view (always visible) — 4 columns:**
| Column | Key | Notes |
|--------|-----|-------|
| Paper Title | derived via `extractTitle(citation)` | Text between 1st and 2nd `. ` in citation string |
| Year | `year` | Blue badge |
| TL;DR | `tldr` | Quick practitioner summary |
| Authors | `citation` | Full citation + DOI + Open → link |

Table `minWidth` is 820px — fits without horizontal scrolling on any standard desktop.

**Expanded detail (click row to toggle):** Inline 3-column grid showing Abstract, Methods, Findings, Limitations, Practical Implications, Performance Application, and Return to Sport Application. `expandedRows` (a `Set`) tracks open rows. Clicking "Open →" calls `e.stopPropagation()`.

`extractTitle` is defined before the `filtered` derived value (required — `const` is not hoisted).

## Brand / Style Constants

All styles are inline. Key brand values:
- **Baylor green gradient:** `#003A2B → #00563F → #1B7A5A` (hero header)
- **Interactive blue:** `#1565C0` (links, sort indicators, year badges, expanded-row labels)
- **Export red:** `#C62828` (CSV export button)
- **Page background:** `#FAF8F5`; alternating row: `#FAF7F2`; expanded row: `#EEF4FF` / `#E8F0FE`
- **Fonts:** `'DM Serif Display'` (headings), `'DM Sans'` (body)

Two style objects reused across cells — `th` (header), `td` (data cell).

## Batch Import Progress

Current state: **549 canonical published rows** in `papers.json` (highest assigned stable ID 575, with verified duplicate IDs removed and never reused). `session.md` preserves the April batch-import checkpoint, but its processed/remaining counts are superseded by `docs/library-coverage-manifest.json`.

- 8 Baylor internal entries, 1 DOI-backed external entry, and 540 local source-backed entries
- 540 distinct local source PDFs represented; no repeated or unresolved local source references
- 2,155 local PDFs contain 2,125 unique file contents because 30 filename pairs are byte-identical
- 536 unique source contents represented; 1,589 unique source contents remain unrepresented
- Pilot Batches 01–12 published 142 full-text-reviewed records and excluded 2 verified source-identity mismatches; screening and synthesis provenance are preserved under `docs/pilot-screening/` and `docs/pilot-synthesis/`
- All audit gates pass: unique IDs, source identity, link resolution, required fields, and schema consistency
- Historical batch pattern: 10 agents × 5 PDFs each → `docs/batch_rX_aY.json` → merge → commit/push
- Next unused ID: **576**; preserve existing IDs during cleanup
- driveUrl pattern: `BASE_URL + encodeURIComponent(filename)` where `BASE_URL` = `https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/SourcePapers/`

Run `npm run audit` for publication, taxonomy, full-text-screening, synthesis, and pilot-queue gates. Full-text decisions belong in versioned JSON batches under `docs/pilot-screening/`; publication-ready records belong under `docs/pilot-synthesis/`. Run `npm run audit:screening` after screening, `npm run audit:synthesis` after authoring synthesis records, and `npm run synthesis:apply` to merge verified records into `papers.json`. Run `npm run audit:manifest` after corpus or publication changes to regenerate the deep content-hash manifest. Run `npm run taxonomy:build` after changing `papers.json`, and `npm run pilot:shortlist` only when intentionally regenerating the Phase 4 queue from title inference plus reviewed screening overrides.

## Ask the Library Pilot

The isolated concierge-pilot interface starts by double-clicking `START-ASK-THE-LIBRARY.cmd` or running `npm run pilot:start`; it is not part of the public GitHub Pages build. **Open practice answer** always opens the canned congested-week example. It does not process the question entered on the main page. For a real pilot question, use **Save question for Codex**, which creates a de-identified `ATL-R-*.json` request packet.

When a pilot request is attached to a Codex task or supplied by exact local path:

1. Validate it with `npm run pilot:request -- <request.json>`.
2. Draft an On-Demand / Not Expert-Reviewed brief under `pilot-data/ask-library/private/briefs/`.
3. Use only admissible Evidence Library sources, with claim-level excerpts and page locations. Return a Coverage Gap rather than inventing support.
4. Validate the brief with `npm run pilot:brief -- <brief.json>`.
5. Check every excerpt against its original source with `npm run pilot:audit-source -- <brief.json>`.
6. Report the brief path and gate results. A named human claim auditor must still confirm interpretation fidelity before delivery.

The structured question-bank JSON is a copy source, not a request packet and not a brief. Do not try to open it in the prototype. **Choose finished answer file** accepts only the finished brief JSON after validation, source-excerpt audit, and the recorded human claim audit. The plain-language button does not change the operator requirement; the browser does not independently prove that the audits occurred.

After the original participant reviews the brief, the prototype downloads anonymous feedback JSON. Validate it with `npm run pilot:feedback -- <feedback.json>`. A separate Domain Reviewer is required only for later promotion to a Reviewed Brief; normal pilot delivery remains On-Demand / Not Expert-Reviewed. Private pilot files belong only under the Git-ignored `pilot-data/ask-library/private/` tree.

### Batch Import — Known Filename Issues
- **Curly apostrophes (U+2019):** Some source filenames contain `'` — agents use PowerShell wildcard copy workaround
- **`%c2%a0` literal chars in filenames:** `%` gets double-encoded to `%25` in driveUrl — preserve encoding as-is
- **Duplicate-content files:** A few pairs share identical content with slightly different filenames — both kept; note in abstract
- **Unreadable PDFs:** Mark as `SOURCE FILE UNREADABLE` in abstract (e.g., ID 155 has invisible char in filename)
