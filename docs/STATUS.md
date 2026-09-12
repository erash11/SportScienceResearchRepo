# STATUS

Read this first. Update it before ending every session.

<!-- Filled 2026-09-12 by dev-sync on Windows, reconstructed from git history, CONTEXT.md
     and docs/ask-the-library-product-contract.md. Before this it was an empty migration
     stub plus a verbatim "Merged from windows copy" block, which was also empty and is
     folded in here. Verify before relying on it. -->

## Current state
- Baylor Athletics Health & Performance Evidence Library. Shared language lives in
  `CONTEXT.md`; durable trade-offs live in `docs/adr/`.
- `SourcePapers/` holds 2,155 entries. The last content commits published 55 reviewed
  SourcePapers records and added reviewed pilot batch 17 (nutrition and hydration).
- **Ask the Library** is the product built on top of it: a Baylor-staff-only workspace that
  turns a Practical Question plus optional de-identified context into a structured,
  source-grounded Decision Brief. Product contract confirmed 2026-07-22; interaction
  prototype approved 2026-07-23 (`docs/ask-the-library-product-contract.md`).
- GitHub Pages workflow updated to Node 24 actions.
- Everything since then (2026-09-09 to 2026-09-12) is migration and sync housekeeping.
  No new content work.

## Next
- Not recorded in the repo. Confirm with Eric: continue review batches, or move the
  Ask the Library prototype forward.

## Open questions
- Where does the Ask the Library prototype stand after the 2026-07-23 approval?

## Gotchas
- The public Evidence Library stays openly accessible; the Ask the Library workspace
  requires authenticated Baylor staff access.
- Athlete names, medical records, clinical notes, PHI and any identifying athlete data are
  prohibited as Decision Context. Context must be de-identified.
- A Decision Brief informs professional judgment. It does not diagnose, prescribe, make
  clearance decisions, or become Baylor policy.
