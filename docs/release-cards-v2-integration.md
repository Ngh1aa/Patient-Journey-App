# Cards V2 integration — 19/10/2026

The user's direct request to merge into main on 19/10/2026 authorizes this release and supersedes the earlier draft hold. Historical audit and evidence documents retain their original scope and dates.

## Runtime ownership

- Active design system: `design/tokens.css`, `design/components.css`, `design/ui.js`.
- Patient and doctor entrypoints retain the reviewed blue/green presentation, black primary CTA and icon-only navigation.
- `design/cards-v2.*`, `prototype/careflow-experience.*` and `prototype/appointment-layout-repair.css` are earlier Wave 1 implementations retained from main for history. The current entrypoints do not load these parallel presentation layers.
- Upstream appointment empty-state guidance is carried forward by tab, while keeping the shared empty component. Booking fact labels and values remain stacked within bento cells.
- Main's added browser tests now target the active shared components, preserving checks for booking, appointment facts, overflow, real local photo assets and per-visit checklist persistence.
- Source QA checks both the active shared contract and the archived Wave 1 token diagnostic. Archived token diagnostics are not evidence of active rendered accessibility.

## Release checks

Post-integration checks are recorded below when complete. Earlier `docs/card-evidence/card-polish/` results belong to the reviewed draft before this main integration; they are not relabeled as release results.

## Existing limitations

The app is still a prototype with synthetic patient, clinic, video and payment services. Existing clinical-flow and payment backlog remains documented in `docs/card-evidence/card-polish/review.md`; this integration does not claim to implement those unrelated changes.
