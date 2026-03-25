# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **standalone React component** — a research paper library browser built for Baylor Applied Sport Science staff. There is no build system, no package.json, and no backend. The single file `football-research-library.jsx` is designed to be embedded in a host application that provides the `window.storage` API.

## Architecture

The entire application lives in one file: `football-research-library.jsx`. It is a default-exported React functional component using hooks (`useState`, `useEffect`, `useCallback`, `useRef`, `React.Fragment`). Google Fonts are injected as a DOM side effect at module load time (not inside the component), so fonts load as soon as the module is imported.

There is no router, no state management library, no CSS framework, and no external dependencies beyond React itself.

### Data Architecture

Paper data is stored in two sources, merged at load time:

| Source | Contents | Capacity |
|--------|----------|----------|
| GitHub `papers.json` (public repo) | All permanently committed papers | Unlimited |
| `window.storage` key `fb-research-lib-pending-v1` | Papers submitted via in-app form, not yet committed to GitHub | ~50–100 papers |

- **GitHub URL:** `https://raw.githubusercontent.com/erash11/SportScienceResearchRepo/master/papers.json`
- **No window.storage cache** for GitHub data — the browser's built-in HTTP cache handles this automatically
- Papers have a runtime-only `source` field (`"github"` or `"pending"`) that is never persisted or exported

### App Load Sequence

1. Fetch `papers.json` from GitHub; on failure set `fetchFailed = true`, show warning banner
2. Migrate legacy `fb-research-lib-v2` key if it parses to a non-empty array (write to pending, then write `"[]"` to old key)
3. Load pending queue from `fb-research-lib-pending-v1`
4. Dedup: if `fetchFailed = false`, remove pending papers whose `id` exists in GitHub papers and write back
5. Merge: GitHub papers first, remaining pending papers appended; render paginated table

## `window.storage` API

The component uses `window.storage`, a **custom async API provided by the host application** — it is NOT the browser's `localStorage`. Any modifications must use this API contract:

```js
// Read (shared=true means shared across all staff users)
const result = await window.storage.get("key", true);
// result.value is a JSON string or null

// Write
await window.storage.set("key", JSON.stringify(data), true);
```

**There is no delete method.** The retired `fb-research-lib-v2` key is cleared by writing `"[]"` to it (sentinel value), not deleted.

### Storage Keys

| Key | Purpose | Status |
|-----|---------|--------|
| `fb-research-lib-v2` | Old bulk storage | **Retired** — migration writes `"[]"` on first load |
| `fb-research-lib-pending-v1` | Pending queue (in-app form submissions only) | **Active** |

## Paper Data Schema

Each paper object has exactly 12 persisted fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique; use `Date.now().toString()` for new entries |
| `year` | number | Publication year |
| `citation` | string | Full citation text ("Authors. Title. Journal. Year;vol:pages."); displayed in Authors column |
| `doi` | string | DOI string (may be empty) |
| `driveUrl` | string | Google Drive or external link URL (may be empty); rendered as "Open →" link inside the Authors cell |
| `abstract` | string | Summarized abstract |
| `tldr` | string | One-paragraph practitioner summary |
| `methods` | string | Methods used |
| `findings` | string | Key findings |
| `limitations` | string | Study limitations |
| `practicalImplications` | string | Actionable implications for staff |
| `athleteDev` | string | Football athlete development applications |
| `rtp` | string | Football return-to-play applications |

A runtime-only `source` field (`"github"` or `"pending"`) is added after load and stripped before any export. Never persist or commit this field.

**ID constraint:** Paper `id` values must be preserved exactly when committing pending papers to GitHub. Deduplication matches on `id` string equality — a regenerated ID will cause the pending paper to persist in the queue indefinitely.

## Adding Papers

- **Batch import (AI agents):** Process PDFs from `SourcePapers/`, generate paper objects with the 12-field schema, merge into `papers.json`, commit to GitHub. IDs must be unique strings (sequential integers work; do not use `Date.now()` for batch imports as it produces near-identical values).
- **In-app form:** Staff use the "+ Add Paper" UI → paper saved to `fb-research-lib-pending-v1` → visible to all staff immediately with `⏳ PENDING` tag → Eric downloads merged `papers.json` from the Pending Panel and commits to GitHub → auto-dedup removes it from the queue on next load.

## Search and Filter Logic

Full-text search runs across: `citation`, `abstract`, `tldr`, `findings`, `practicalImplications`, `athleteDev`, `rtp`, `methods`, `doi`. Year filter is exact match. Both are applied in the `filtered` derived array. Search and filter changes reset pagination to page 1.

## Pagination

50 papers per page. Global row numbers (page 2 starts at row 51). `getPaginationPages(current, total)` returns an array of page numbers with `"..."` ellipsis for large sets.

## Table Layout

The table uses an **expandable-row pattern** to avoid horizontal scrolling:

**Compact view (always visible) — 4 columns:**
| Column | Key | Notes |
|--------|-----|-------|
| Paper Title | derived via `extractTitle(citation)` | Text between 1st and 2nd `. ` in citation string |
| Year | `year` | Blue badge |
| TL;DR | `tldr` | Quick practitioner summary |
| Authors | `citation` | Full citation + DOI + Open → link |

Table `minWidth` is 820px — fits without horizontal scrolling on any standard desktop.

**Expanded detail (click row to toggle):** Inline 3-column grid showing Abstract, Methods, Findings, Limitations, Practical Implications, Football Athlete Dev, Return to Play. Expansion state is tracked in `expandedRows` (a `Set` in component state). The expand indicator (▼/▲) appears above the row number. Clicking "Open →" or "Remove" calls `e.stopPropagation()` to avoid toggling the row.

`extractTitle` is a pure helper defined before the `filtered` derived value (required — `const` is not hoisted).

## Brand / Style Constants

All styles are inline. Key brand values:
- **Baylor green gradient:** `#003A2B → #00563F → #1B7A5A` (hero header)
- **Interactive blue:** `#1565C0` (links, sort indicators, year badges, expanded-row section labels)
- **Destructive/export red:** `#C62828` (remove button, CSV export)
- **Page background:** `#FAF8F5`; alternating row: `#FAF7F2`; expanded row: `#EEF4FF` / `#E8F0FE`
- **Fonts:** `'DM Serif Display'` (headings), `'DM Sans'` (all body text)

Three style objects are reused across table cells — `th` (header), `td` (data cell), `inp` (form input).

## Batch Import Progress

See `session.md` for full details. Current state: **283 papers** in `papers.json` (IDs 1–283), pushed to `master`.

- Rounds 1–5 complete (IDs 9–283)
- Round 6 (IDs 284–333) not yet processed — usage limit hit, resets March 27, 2026 at 3pm CT
- ~316 football papers still remaining after round 6 is done
- Batch agent pattern: 10 parallel agents × 5 PDFs each → `docs/batch_rX_aY.json` → merge → commit/push
- Next ID to assign: **284**
