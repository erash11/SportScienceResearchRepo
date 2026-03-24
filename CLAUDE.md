# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **standalone React component** — a research paper library browser built for Baylor Applied Sport Science staff. There is no build system, no package.json, and no backend. The single file `football-research-library.jsx` is designed to be embedded in a host application that provides the `window.storage` API.

## Architecture

The entire application lives in one file: `football-research-library.jsx`. It is a default-exported React functional component using hooks (`useState`, `useEffect`, `useCallback`, `useRef`). Google Fonts are injected as a DOM side effect at module load time (not inside the component), so fonts load as soon as the module is imported.

There is no router, no state management library, no CSS framework, and no external dependencies beyond React itself.

## `window.storage` API

The component uses `window.storage`, a **custom async API provided by the host application** — it is NOT the browser's `localStorage`. Any modifications must use this API contract:

```js
// Read (shared=true means shared across all staff users)
const result = await window.storage.get("key", true);
// result.value is a JSON string or null

// Write
await window.storage.set("key", JSON.stringify(data), true);
```

The storage key is `"fb-research-lib-v2"`. The version suffix is intentional — increment it (e.g., `v3`) if the data schema changes in a breaking way, which will trigger a fresh load from `DEFAULT_PAPERS` for all users.

## Paper Data Schema

Each paper object has exactly 12 fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique; use `Date.now().toString()` for new entries |
| `year` | number | Publication year |
| `citation` | string | Full citation text (displayed as primary label) |
| `doi` | string | DOI string (may be empty) |
| `driveUrl` | string | Google Drive or external link URL |
| `abstract` | string | Summarized abstract |
| `tldr` | string | One-paragraph practitioner summary |
| `methods` | string | Methods used |
| `findings` | string | Key findings |
| `limitations` | string | Study limitations |
| `practicalImplications` | string | Actionable implications for staff |
| `athleteDev` | string | Football athlete development applications |
| `rtp` | string | Football return-to-play applications |

## Default Papers

`DEFAULT_PAPERS` (top of file, lines 3–116) contains 8 hardcoded papers from Baylor Applied Sport Science (all 2025). These load into storage on first run when storage is empty. To add a permanent baseline paper, append to `DEFAULT_PAPERS`. To add a paper at runtime, use the "+ Add Paper" UI which calls `handleUpload`.

## Search and Filter Logic

Full-text search runs across: `citation`, `abstract`, `tldr`, `findings`, `practicalImplications`, `athleteDev`, `rtp`, `methods`, `doi`. Year filter is exact match. Both are applied in the `filtered` derived array (line 157).

## Brand / Style Constants

All styles are inline. Key brand values:
- **Baylor green gradient:** `#003A2B → #00563F → #1B7A5A` (hero header)
- **Interactive blue:** `#1565C0` (links, sort indicators, year badges)
- **Destructive/export red:** `#C62828` (remove button, CSV export)
- **Page background:** `#FAF8F5`; alternating row: `#FAF7F2`
- **Fonts:** `'DM Serif Display'` (headings), `'DM Sans'` (all body text)

Three style objects are reused across table cells — `th` (header), `td` (data cell), `inp` (form input) — defined at lines 211–213.
