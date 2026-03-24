# Football Sport Science Research Library

## Project Overview

A searchable, shared-access web application that serves as a centralized repository for peer-reviewed research, internal research documents, and evidence-based frameworks relevant to Baylor Football. Built as a React artifact with persistent shared storage so all staff see the same library in real time.

This project was adapted from an NBA Sports Science Research artifact originally created by Dr. Brandon Pentheny (PhD, RSCC, CPSS) and redesigned for football sport science at Baylor.

## The Problem

Sport science research gets read once and then sits in someone's inbox or Google Drive folder. Staff across S&C, athletic training, nutrition, and coaching have no easy way to find, reference, or build on research that has already been reviewed by the department. When staff turn over, the knowledge leaves with them. On top of that, research papers are written for an academic audience, and the gap between what a study says and what a practitioner should do with it is rarely bridged in a way that is accessible to the people who need it most.

## The Solution

A horizontally scrollable data table with 10 columns per paper, including two football-specific application columns. Every paper includes a plain-language TLDR, practical implications, and direct connections to both athlete development and return-to-play decision-making.

### Key Features

- Full-text search across all fields (citation, abstract, TLDR, findings, methods, and all application columns)
- Year-based filtering with sortable column headers
- CSV export for offline access and sharing
- Staff upload form allowing any team member to contribute new research
- Shared persistent storage so all additions are visible to the entire team
- Pagination (50 papers/page) with global row numbers
- Pending queue: staff-submitted papers are visible immediately with a `⏳ PENDING` tag while awaiting GitHub commit
- Pending Panel with one-click `papers.json` download for Eric to commit to GitHub
- Fetch failure banner if GitHub is unreachable (pending queue papers still display)

### Table Columns

1. **#** - Global row number
2. **Citation & DOI** - Full citation with links to source document
3. **Year** - Publication year
4. **Summarized Abstract** - Condensed version of the paper's abstract
5. **TL;DR** - Plain-language summary for non-research staff
6. **Methods Used** - Study design, tools, and statistical approaches
7. **Findings** - Key results, effect sizes, and primary outcomes
8. **Limitations** - Generalizability concerns and methodological caveats
9. **Practical Implications** - Actionable steps for practitioners
10. **Football Athlete Development** - Connections to player development workflows
11. **Football Return to Play** - Connections to RTP decision-making

## Pre-Loaded Research (8 Internal Papers)

| # | Title | Category |
|---|-------|----------|
| 1 | The Gridiron Blueprint: DEXA Data in Football Analytics | Body Composition |
| 2 | Evidence-Based Physical Evaluation Framework for Incoming Athletes | Force Plate / Testing |
| 3 | SpeedSig: Validated GPS Biomechanics Platform | Biomechanics / GPS |
| 4 | NIRS-Enhanced RTP Framework (MOXY Monitor) | Injury Prevention / RTP |
| 5 | S2 Cognition in College Football | Cognitive Performance |
| 6 | Exogen Wearable Resistance Training Review | Wearable Technology |
| 7 | L5-S1 Rehab Protocol: Post-Microdiscectomy DL | Injury Prevention / RTP |
| 8 | Gridiron Blueprint: Actionable Summary for Coaches and Dietitians | Nutrition / Coaching |

All internal papers were sourced from the Baylor Applied Performance Google Drive. 2,183 additional peer-reviewed papers from `SourcePapers/` are being batch-imported via AI agents.

## Technical Details

| Component | Specification |
|-----------|---------------|
| Framework | React (functional components with hooks) |
| Styling | Inline CSS (no external dependencies) |
| Typography | DM Serif Display (headings), DM Sans (body) |
| Primary data store | GitHub public repo (`erash11/SportScienceResearchRepo`, `master` branch, `papers.json`) |
| Pending queue storage | `window.storage` key `fb-research-lib-pending-v1` (shared: true) |
| Retired storage key | `fb-research-lib-v2` (cleared to `"[]"` on first load after migration) |
| Data format | JSON array of paper objects (12-field schema) |
| File format | Single .jsx file |
| Hosting | Claude.ai artifact rendering engine |
| Capacity | Unlimited (GitHub-backed); pending queue ~50–100 papers max |
| Pagination | 50 papers per page, global row numbers |

## Workflows

### Staff Adds a Paper
1. Staff submits "+ Add Paper" form → saved to pending queue → visible immediately with `⏳ PENDING` tag
2. Eric sees the pending badge, opens Pending Panel, clicks "Download papers.json for GitHub"
3. Eric opens `github.com/erash11/SportScienceResearchRepo`, replaces `papers.json`, commits
4. On next app load: auto-dedup removes the committed paper from the pending queue

### Monthly Batch Import (Eric + AI Agents)
1. AI agents process PDFs from `SourcePapers/` → generate paper objects (12-field schema)
2. Eric merges new objects into `papers.json` on GitHub and commits
3. App picks up new papers on next load — no in-app action needed

## Deliverables

| File | Description |
|------|-------------|
| `football-research-library.jsx` | The React application |
| `papers.json` | Authoritative paper data (committed to GitHub, fetched on every load) |
| `SourcePapers/` | 2,183 source PDFs for batch AI import |
| `FB_Research_Library_Project_Summary.docx` | Executive project summary document |
| `FB_Research_Library_App_Spec_Sheet.docx` | Full application specification sheet |
| `docs/superpowers/specs/2026-03-24-scaled-research-library-design.md` | Architecture design spec |
| `docs/superpowers/plans/2026-03-24-scaled-research-library.md` | Implementation plan |
| `summary.md` | This file |

## Target Audience

- Strength and Conditioning staff
- Athletic Training and Sports Medicine staff
- Sports Dietitians and Nutrition staff
- Applied Sport Science staff and embedded researchers (B.A.I.R.)
- Coaching staff (primarily via the TLDR and Practical Implications columns)
- Graduate assistants and PhD students working within Athletics

## Next Steps

1. Complete batch AI import of 2,183 PDFs from `SourcePapers/` into `papers.json`
2. Distribute the shared artifact link to all staff
3. Establish a monthly cadence for adding new research (20+ papers/month)
4. Consider integration with Performance School curriculum
5. Evaluate expanding the format to cover additional sports

---

**Department:** Applied Performance, Baylor University Athletics
**Lead:** Eric Rash, Director of Applied Performance
**Date:** March 2026
