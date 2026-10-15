# CareFlow — Editorial Soft Glass Mobile Redesign

Status: **IMPLEMENTED ON FEATURE BRANCH · QA PENDING**. Browser prototype only; not native or clinically approved.

## Source of truth and process

Target: `prototype/` (47 registered screens; F1–F12). Workspace: [uiux-ai-workspace](https://github.com/Ngh1aa/uiux-ai-workspace). Used the relevant documented `mobile-web-preview` route: project-truth inventory → platform-aware design system → reuse existing renderer/state owners → browser QA/handoff. Canonical navigation, guards, data ownership and Vietnamese copy remain in `model.js`, `app.js`, `strings.vi.js`. The target's `docs/screen-flow-matrix.md` is the route inventory. Never replace it with the icon selection or placeholder data shown in visual references.

## Image reference analysis (three user-provided mobile images)

1. Booking reference: neutral/white canvas; oversized black heading; low-detail image placeholder behind stacked appointment card; floating translucent frosted information panel; blue chips; circular trailing action; translucent rounded nav.
2. Blue welcome reference: electric-blue hero, low-opacity circular accent, white bottom sheet, large editorial headline, pill buttons with circular action.
3. Home reference: charcoal headline at display scale, greeting and avatar, white rounded search/control shapes, grayscale cards, one electric-blue emphasis, suspended floating nav.

These images are **art-direction evidence**, not validated clinical design, icons, labels, content, realistic physician cards, or tested end-user flow. Do not recreate unsupported doctor names, old appointment dates, lorem ipsum, confusing duplicate login CTAs or unlabeled icons.

## Design decisions

| Element | Direction / token |
|---|---|
| Base canvas | `#F2F2F2` neutral |
| Elevated surface | `#FFFFFF` with soft low-contrast elevation |
| Ink | `#242424` |
| Supporting text | `#57575F` |
| Action blue | `#075FE8` (contrast-driven adjustment from brighter image blue) |
| Focus / link | `#0754CA` |
| Decorative lines | `#DCDCE0` |
| Inputs | `#76767B` border; no implicit success/error based only on color |
| Primary typeface | Existing, locally served Be Vietnam Pro |
| Headline | 34px baseline; display 38–39px only where useful |
| Card radius | 30px, appointment 34px, pill controls 999px |
| Translucency | One translucent bottom nav and an appointment overlay; reduced-transparency fallback |
| Accessibility | Keep labelled controls, semantic state text, min 44px hit target, focus rings, 200% text layout and reduced-motion treatment |

`design/tokens.json` owns design decisions. `prototype/styles.css` owns previous foundation and contrast-check-compatible semantic color variables. `prototype/editorial-soft-glass.css` owns the incremental style migration. `prototype/views.js` adds welcome layout/home editorial hierarchy without changing application state. `prototype/app.js` exposes `data-screen` on the phone shell for route-aware visual treatment.

## Screen/state coverage

| Routes | Themed components and behavioral invariants |
|---|---|
| A1–A3 | Blue/welcome surface, authentication sheet and readable account/profile forms; OTP/consent untouched |
| B1 | Editorial home heading, original signed-in identity, prominent booking CTA, active visit card + next step |
| C1–C9 | Headline, accessible radio selection, urgency-warning isolation, slot grid, pending confirmation |
| D1–D4 | Appointment card, filters, next-step hub, receipt/QR, reschedule/cancel confirmation |
| E1–E3 | Next actions, timeline, queue/arrival progress |
| F1–F4 | Labs, document rows, booking/upload form, readiness status |
| G1–G5 | Video preflight, waiting, calling, recovery, dark contrast in simulated call |
| H1–H7 | Payment and receipt/result cards with status + semantic text |
| I1–I5 | Aftercare, follow-up tasks, styled messaging and urgent warning |
| J1 | Follow-up entry / booking context |
| K1–K5 | Notifications, profile, history, settings, support and disclosure panels |

No route/role/flow was intentionally removed, remapped or added. The 4 existing patient tabs remain Trang chủ / Lịch hẹn / Hồ sơ / Hỗ trợ. Their icons are product semantics, not copied from the references.

## QA gates / release boundary

- Syntax: `npm run check`.
- Model: `npm run test:model` (no test shortcuts).
- Semantic contrast: `node check-contrast.cjs` plus rendered state/axe review.
- Browser: `npm run test:e2e` with Playwright Chromium and WebKit.
- Capture/review: A1/B1/D1/D2/C3/C4/C7/G3/G4/H2/H6/I1/K2, and representative remaining routes. 360/390/430 CSS px, small-height viewport, 200% browser large-text mode, desktop guided view, `/Patient-Journey-App/prototype/` subpath, Back/reload, keyboard focus.
- Must not conceal the next action at 360px, overflow clinical details, obscure bottom controls, change the clinical warning, create simulated successful payment/medical advice, or imply native verification.
- Verify screenshot pixels and repair visual issues; green syntax/model CI alone is insufficient.

At document creation there is **no fresh browser capture or Playwright PASS evidence for this branch**. Do not merge/deploy until checks and visual review are complete.
