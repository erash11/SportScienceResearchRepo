# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **deployed React web app** — a research paper library browser built for Baylor Applied Sport Science staff. It is hosted on GitHub Pages and accessible at:

**`https://erash11.github.io/SportScienceResearchRepo/`**

The app is a single-file React component (`football-research-library.jsx`) built with Vite. Staff can bookmark the URL and access it from any workstation. Every push to `master` auto-deploys via GitHub Actions.

## Architecture

The entire application lives in one file: `football-research-library.jsx`. It is a default-exported React functional component using hooks (`useState`, `useEffect`, `React.Fragment`). Google Fonts are injected as a DOM side effect at module load time.

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
2. `setPapers(data)` → render paginated table

## Deployment

| File | Purpose |
|------|---------|
| `vite.config.js` | `base: '/SportScienceResearchRepo/'` required for GitHub Pages sub-path |
| `package.json` | `dev`, `build`, `preview` scripts |
| `index.html` | Vite entry point → `preview-main.jsx` |
| `preview-main.jsx` | Mounts `<FootballResearchLibrary />` |
| `.github/workflows/deploy.yml` | Auto-deploys `dist/` to `gh-pages` branch on every push to `master` |

**To deploy:** just `git push origin master` — Actions handles the rest.

## Adding Papers

- **Batch import (AI agents):** Process PDFs from `SourcePapers/`, generate paper objects with the 12-field schema, merge into `papers.json`, commit to GitHub. IDs must be unique strings (sequential integers). Do not use `Date.now()` for batch imports.
- **Staff submissions:** Via Google Form (link in the app's "Submit a Paper" button). Eric manually reviews responses and adds them to `papers.json`. See `SUBMIT_FORM_URL` constant at the top of `football-research-library.jsx`.

## Paper Data Schema

Each paper object has exactly 12 persisted fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique sequential integer string (e.g. `"284"`) |
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
| `athleteDev` | string | Football athlete development applications |
| `rtp` | string | Football return-to-play applications |

## Search and Filter Logic

Full-text search runs across: `citation`, `abstract`, `tldr`, `findings`, `practicalImplications`, `athleteDev`, `rtp`, `methods`, `doi`. Year filter is exact match. Both reset pagination to page 1.

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

**Expanded detail (click row to toggle):** Inline 3-column grid showing Abstract, Methods, Findings, Limitations, Practical Implications, Football Athlete Dev, Return to Play. `expandedRows` (a `Set`) tracks open rows. Clicking "Open →" calls `e.stopPropagation()`.

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

See `session.md` for full details. Current state: **433 papers** in `papers.json` (IDs 1–433).

- Rounds 1–8 complete (IDs 9–433)
- ~275 football papers still remaining after known filename skips (rounds 9–14 approx.)
- Batch agent pattern: 10 parallel agents × 5 PDFs each → `docs/batch_rX_aY.json` → merge → commit/push
- Next ID to assign: **434**
- driveUrl pattern: `BASE_URL + encodeURIComponent(filename)` where `BASE_URL` = `https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/SourcePapers/`

### Batch Import — Known Filename Issues
- **Curly apostrophes (U+2019):** Some source filenames contain `'` — agents use PowerShell wildcard copy workaround
- **`%c2%a0` literal chars in filenames:** `%` gets double-encoded to `%25` in driveUrl — preserve encoding as-is
- **Duplicate-content files:** A few pairs share identical content with slightly different filenames — both kept; note in abstract
- **Unreadable PDFs:** Mark as `SOURCE FILE UNREADABLE` in abstract (e.g., ID 155 has invisible char in filename)
