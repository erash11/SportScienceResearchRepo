# Ask the Library interaction prototype

This isolated prototype explores the confirmed product contract in `docs/ask-the-library-product-contract.md`. It does not change the deployed Evidence Library, authenticate users, call an AI service, or store questions.

## Subject, audience, and job

- **Subject:** evidence-grounded health and performance decision support
- **Audience:** authenticated Baylor Athletics Health & Wellness staff
- **Single job:** turn one practical question into a trustworthy two-minute Decision Brief

## Design plan

### Color

- **Baylor Green** `#154734` — institutional anchor and primary action
- **Pine Shadow** `#0B2B21` — decision emphasis and high-contrast surfaces
- **Baylor Gold** `#FFB81C` — evidence trace and active state
- **Chart Paper** `#F1F4F0` — working surface
- **Graphite** `#202722` — body text
- **Signal Rust** `#A54D2D` — limitations and caution

### Type

- **Baylor Bears** — restrained brand display moments
- **DIN Pro Condensed** — headings, labels, and operational hierarchy
- **DIN Pro** — long-form reading and controls

The prototype reuses the repository's self-hosted Baylor fonts rather than introducing an unrelated visual system.

### Layout

The intake is an asymmetric decision ledger rather than a chat window. The resulting brief follows a single vertical evidence spine from decision to action to source support.

```text
INTAKE                              BRIEF
┌────────────────────┬─────────┐    ┌────────┬────────────────────────┐
│ practical question │ evidence│    │ status │ bottom line            │
│ + decision context │ contract│    │  rail  │ recommended direction  │
│                     │         │    │   │    │ actions + guardrails   │
└────────────────────┴─────────┘    │   └────│ confidence + sources   │
                                    └────────┴────────────────────────┘
```

### Signature

The **evidence spine** is a Baylor-gold trace line connecting the Operational View to confidence rationale and source records. It encodes the product's central promise: a practical direction must remain traceable to evidence.

## Self-critique and revision

The initial split-screen idea risked becoming a generic AI dashboard composed of rounded cards and status pills. The revised direction removes gradients and chat conventions, reduces card chrome, uses squared working-paper surfaces, and spends visual emphasis on one traceability device. Motion is limited to drawing the evidence spine when the brief appears and is disabled when reduced motion is preferred.

## Grounded example

The congested-week example is synthesized from full-text-reviewed published records 448, 455, and 457. The prototype is still an interaction demonstration, not an expert-reviewed Baylor recommendation.

## Run

```powershell
npm run prototype
```

Build the isolated prototype with:

```powershell
npm run prototype:build
```
