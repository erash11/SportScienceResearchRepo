# Baylor Athletics Health & Performance Evidence Library

## Project Overview

A searchable, shared-access web application that serves as Baylor Athletics' centralized repository for peer-reviewed research, internal research documents, and evidence-based frameworks spanning athlete health and performance.

This project was adapted from an NBA Sports Science Research artifact originally created by Dr. Brandon Pentheny (PhD, RSCC, CPSS). It began as a football sport-science library and was adopted as the Baylor Athletics Health & Performance Evidence Library on July 21, 2026.

## The Problem

Sport science research gets read once and then sits in someone's inbox or Google Drive folder. Staff across S&C, athletic training, nutrition, and coaching have no easy way to find, reference, or build on research that has already been reviewed by the department. When staff turn over, the knowledge leaves with them. On top of that, research papers are written for an academic audience, and the gap between what a study says and what a practitioner should do with it is rarely bridged in a way that is accessible to the people who need it most.

## The Solution

An expandable evidence table that gives each paper a plain-language TLDR, methods, findings, limitations, practical implications, performance application, and return-to-sport application. The public identity is sport-agnostic while the current football-specific application content is preserved during the staged data migration.

### Key Features

- Full-text search across all fields (citation, abstract, TLDR, findings, methods, and all application columns)
- Year, domain, audience, sport, population, and study-design filtering with sortable column headers
- CSV export for offline access and sharing
- Curated publication workflow so every new paper is reviewed before it appears in the library
- GitHub-backed shared data so published additions are visible to the entire team
- Pagination (50 papers/page) with global row numbers
- Expandable rows that keep the main table compact while exposing full evidence details
- Fetch failure banner if GitHub is unreachable

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
10. **Performance Application** - Connections to athlete development and performance workflows
11. **Return to Sport Application** - Connections to rehabilitation and return-to-sport decision-making

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

All internal papers were sourced from the Baylor Applied Performance Google Drive. The local `SourcePapers/` corpus contains 2,155 PDFs representing 2,125 unique file contents. After the July 21, 2026 cleanup and the first eight reviewed pilot batches, the library contains 501 canonical rows: 492 distinct local source PDFs, eight Baylor internal documents, and one DOI-backed external paper. By file content, 488 unique local sources are represented and 1,637 remain unrepresented. The pilot has published 94 full-text-reviewed papers and excluded two mislabeled sources.

## Technical Details

| Component | Specification |
|-----------|---------------|
| Framework | React (functional components with hooks) |
| Styling | Inline CSS (no CSS framework) |
| Typography | Baylor Bears and self-hosted DIN Pro fonts |
| Primary data store | GitHub public repo (`erash11/SportScienceResearchRepo`, `master` branch, `papers.json`) |
| Public submission intake | Not exposed; papers enter through the curated review and publication workflow |
| Data format | JSON array of paper objects (13-field legacy schema) |
| File format | Single .jsx file |
| Hosting | GitHub Pages via Vite and GitHub Actions |
| Capacity | GitHub-backed; current application fetches the full JSON dataset at load time |
| Pagination | 50 papers per page, global row numbers |

## Workflows

### Curated Paper Addition
1. A candidate paper is placed in `SourcePapers/` or otherwise selected for review
2. Eric and the AI-assisted review workflow create and verify a schema-valid paper record
3. The approved record is merged into `papers.json` and committed
4. The application loads the new record after deployment/cache refresh

### Monthly Batch Import (Eric + AI Agents)
1. AI agents process selected PDFs from `SourcePapers/` → generate schema-valid paper objects
2. Eric merges new objects into `papers.json` on GitHub and commits
3. App picks up new papers on next load — no in-app action needed

## Deliverables

| File | Description |
|------|-------------|
| `football-research-library.jsx` | The React application; legacy filename retained during the staged migration |
| `papers.json` | Authoritative paper data (committed to GitHub, fetched on every load) |
| `SourcePapers/` | 2,155 source PDFs available for curated batch import |
| `FB_Research_Library_Project_Summary.docx` | Executive project summary document |
| `FB_Research_Library_App_Spec_Sheet.docx` | Full application specification sheet |
| `docs/superpowers/specs/2026-03-24-scaled-research-library-design.md` | Architecture design spec |
| `docs/superpowers/plans/2026-03-24-scaled-research-library.md` | Implementation plan |
| `docs/health-performance-evidence-library-roadmap.md` | Adopted product direction and staged sport-agnostic roadmap |
| `summary.md` | This file |

## Target Audience

- Strength and conditioning and sport-performance staff
- Athletic training, sports medicine, and rehabilitation staff
- Sports dietitians and nutrition staff
- Applied sport science staff and embedded researchers (B.A.I.R.)
- Mental health, wellbeing, and other Health & Performance partners as coverage grows
- Coaching staff (primarily via the TLDR and Practical Implications columns)
- Graduate assistants and PhD students working within Athletics

## Next Steps

1. Use the automated audit and coverage manifest as the publication gate for every future batch
2. Full-text screen Batch 09 from the replenished 96-paper queue in `docs/pilot-expansion-shortlist.md`
3. Convert only audited INCLUDE decisions into versioned records under `docs/pilot-synthesis/`
4. Replace rules-based legacy taxonomy with staff-reviewed overrides as issues are identified
5. Publish only candidates that pass source, eligibility, taxonomy, extraction, synthesis, and duplicate gates
6. Resume prioritized backfill batches and establish a separate monthly new-research cadence
7. Pilot the library with representatives from performance, medicine, athletic training, rehabilitation, and nutrition

---

**Department:** Applied Performance, Baylor University Athletics
**Lead:** Eric Rash, Director of Applied Performance
**Updated:** July 21, 2026
