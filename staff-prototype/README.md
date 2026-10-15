# CareFlow Doctor — Desktop Portfolio

**Purpose:** A polished single-role desktop UI/UX prototype for a physician, created as a design portfolio showcase, not a deployed medical system. The user-facing site is **doctor-only**; reception, nursing, role picker and related routes redirect to the doctor's homepage. The patient mobile prototype is unchanged.

## Design direction

**Premium Neo-Minimal Healthcare / Bold Editorial / Selective Soft Glass.** Inspired by the three user-provided mobile screenshots: large typographic contrasts, generous spacing, royal-blue highlights, pill controls and a floating frosted journey visual. Clinical workflows keep opaque reading surfaces and legible controls. It intentionally translates, rather than copies, mobile compositions for desktop.

Brand source: `../design/tokens.json` (#0A67D1, #F2F6FB, Be Vietnam Pro). Doctor-only presentation layer: `doctor-showcase.js` + `doctor-showcase.css`.

## Active screens

- `#/doctor` — doctor's personal dashboard (entry)
- `#/doctor/schedule` — physician appointment agenda
- `#/doctor/queue` — patient list by visit status
- `#/patients` and `#/patients/:id` — assigned patient directory and patient record
- `#/visits/:id` — read-only visit details (no receptionist privileges)
- `#/encounters/:id` — clinical documentation workspace
- `#/results` — results inbox, review status, linked patient record
- `#/clinical/orders` — synthetic draft laboratory orders
- `#/clinical/prescription` — prescription layout and internal draft, **not medication prescribing**
- `#/clinical/review` — review/finish synthetic encounter (not real signing)
- `#/doctor/followups` — internal follow-up tasks, no actual patient contact

All patient/clinical data is fictitious. All save/review/task actions write to sessionStorage only. No real clinic connection, clinical decisions, video, billing, electronic signature or prescription dispensing.

## Evidence and QA

```sh
node --check staff-prototype/app.js
node --check staff-prototype/doctor-showcase.js
node --test staff-prototype/test.cjs
node prototype/node_modules/@playwright/test/cli.js test --config=staff-prototype/playwright.config.cjs
```

Active Playwright suite: `doctor.spec.cjs` at 1280, 1440, 1920px. Older `browser.spec.cjs`, `visual.spec.cjs`, `supporting.spec.cjs`, and `wave3.spec.cjs` are historical multi-role tests, intentionally excluded because the public showcase is doctor-only.

## Design handoff

Use UIUX Factory from https://github.com/Ngh1aa/uiux-ai-workspace, respecting its Flow OS, design-system contracts and screenshot-based visual QA. The existing HTML/CSS/JS stack remains intentionally unchanged. The standalone prototype deploys under GitHub Pages at `staff-prototype/`.
