# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **deployed React web app** — the **Baylor Athletics Health & Performance Evidence Library**, built for performance, medical, rehabilitation, nutrition, and research staff. It is hosted on GitHub Pages and accessible at:

**`https://erash11.github.io/SportScienceResearchRepo/`**

The app is a single-file React module (`football-research-library.jsx`, retained as a legacy filename) built with Vite. Staff can bookmark the URL and access it from any workstation. Every push to `master` auto-deploys via GitHub Actions.

The adopted product direction and staged sport-agnostic migration are documented in `docs/health-performance-evidence-library-roadmap.md`.

## Architecture

The primary UI lives in `football-research-library.jsx`. It is a default-exported React functional component using hooks (`useState`, `useEffect`, `React.Fragment`). `evidence-taxonomy.mjs` owns the normalized runtime interface and controlled vocabularies; `paper-taxonomy.json` supplies deterministic legacy metadata. Google Fonts are injected as a DOM side effect at module load time.

There is no router, no state management library, no CSS framework, and no external dependencies beyond React itself. There is no `window.storage` dependency — the component is self-contained.

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
| `paper-taxonomy.json` | 477-row taxonomy sidecar; generated legacy rows are marked unreviewed and published pilot rows retain full-text-reviewed provenance |
| `.github/workflows/deploy.yml` | Auto-deploys `dist/` to `gh-pages` branch on every push to `master` |

**To deploy:** just `git push origin master` — Actions handles the rest.

## Adding Papers

- **Batch import (AI agents):** Process selected PDFs from `SourcePapers/`, generate paper objects with the 13-field legacy schema, merge into `papers.json`, then run `npm run taxonomy:build`. IDs must be stable numeric strings; assign from the next unused ID and never reuse a removed ID. Do not use `Date.now()` for batch imports. Run `npm run audit` before publishing.
- **Staff submissions:** Via Google Form (link in the app's "Submit a Paper" button). Eric manually reviews responses and adds them to `papers.json`. See `SUBMIT_FORM_URL` constant at the top of `football-research-library.jsx`.

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

Current state: **477 canonical published rows** in `papers.json` (highest assigned stable ID 503, with verified duplicate IDs removed and never reused). `session.md` preserves the April batch-import checkpoint, but its processed/remaining counts are superseded by `docs/library-coverage-manifest.json`.

- 8 Baylor internal entries, 1 DOI-backed external entry, and 468 local source-backed entries
- 468 distinct local source PDFs represented; no repeated or unresolved local source references
- 2,155 local PDFs contain 2,125 unique file contents because 30 filename pairs are byte-identical
- 464 unique source contents represented; 1,661 unique source contents remain unrepresented
- Pilot Batches 01–06 published 70 full-text-reviewed records and excluded 2 verified source-identity mismatches; screening and synthesis provenance are preserved under `docs/pilot-screening/` and `docs/pilot-synthesis/`
- All audit gates pass: unique IDs, source identity, link resolution, required fields, and schema consistency
- Historical batch pattern: 10 agents × 5 PDFs each → `docs/batch_rX_aY.json` → merge → commit/push
- Next unused ID: **504**; preserve existing IDs during cleanup
- driveUrl pattern: `BASE_URL + encodeURIComponent(filename)` where `BASE_URL` = `https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/SourcePapers/`

Run `npm run audit` for publication, taxonomy, full-text-screening, synthesis, and pilot-queue gates. Full-text decisions belong in versioned JSON batches under `docs/pilot-screening/`; publication-ready records belong under `docs/pilot-synthesis/`. Run `npm run audit:screening` after screening, `npm run audit:synthesis` after authoring synthesis records, and `npm run synthesis:apply` to merge verified records into `papers.json`. Run `npm run audit:manifest` after corpus or publication changes to regenerate the deep content-hash manifest. Run `npm run taxonomy:build` after changing `papers.json`, and `npm run pilot:shortlist` only when intentionally regenerating the Phase 4 queue from title inference plus reviewed screening overrides.

### Batch Import — Known Filename Issues
- **Curly apostrophes (U+2019):** Some source filenames contain `'` — agents use PowerShell wildcard copy workaround
- **`%c2%a0` literal chars in filenames:** `%` gets double-encoded to `%25` in driveUrl — preserve encoding as-is
- **Duplicate-content files:** A few pairs share identical content with slightly different filenames — both kept; note in abstract
- **Unreadable PDFs:** Mark as `SOURCE FILE UNREADABLE` in abstract (e.g., ID 155 has invisible char in filename)
