# CareFlow Doctor — Desktop Portfolio

**Purpose:** A single-role desktop UI/UX prototype for a physician, created as a design portfolio showcase, not a deployed medical system. The user-facing site is **doctor-only**; reception, nursing, role picker and related routes redirect to the doctor's homepage. The patient app lives in `../prototype/`; the two renderers share vocabulary and a component contract, with separate synthetic session data.

## Design direction

**Calm Clinical / task-first workspace.** Preserve the current navy brand, sidebar and physician workflows. The overview reading order is current encounter → decision → unreviewed results → daily agenda; online handoff and aftercare follow. Clinical workflows use opaque reading surfaces and legible controls. The overview has no marketing hero, decorative orb or statistic cards above the work.

Runtime component sources: `../design/ui.js`, `../design/components.css`, and `../prototype/strings.vi.js`; documented in `../docs/design-system.md`. Current navy is #001D57; Card redesign v2 uses the shared Plus Jakarta Sans font across doctor and patient role surfaces. Existing `btn` and `pill` helpers emit named component variants; page styles own composition only.

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

Active Playwright suites: `doctor.spec.cjs` and `doctor-cards.spec.cjs` at 1280,1440,1920px. The card suite also exercises320–1920px pressure widths,200% text, long content, filtered/true empty states, offline local filtering, keyboard focus and axe. Older `browser.spec.cjs`, `visual.spec.cjs`, `supporting.spec.cjs`, and `wave3.spec.cjs` are historical multi-role tests, intentionally excluded because the public showcase is doctor-only.

To run only the dashboard card journeys: append `doctor-cards.spec.cjs --project=chromium-1440` to the Playwright command above. The dashboard uses the existing synthetic session model; filtering is synchronous, so no artificial loading/server-error lifecycle is shown. Visit/result/decision actions lead to the existing guarded routes. The live call and clinical backend remain simulated.

## Design handoff

Use UIUX Factory from https://github.com/Ngh1aa/uiux-ai-workspace, respecting its Flow OS, design-system contracts and screenshot-based visual QA. The existing HTML/CSS/JS stack remains intentionally unchanged. The standalone prototype deploys under GitHub Pages at `staff-prototype/`.

## Doctor typography & density refresh

- Fonts: Plus Jakarta Sans, bundled local fonts and a shared token family; no Google Fonts request. System fallback always available; no font binaries committed.
- Icon system: curated 35 Lucide SVG icons bundled as `doctor-icons.js`, under the Lucide ISC license (`LUCIDE-LICENSE.txt`). Use icons for navigation, actions and operational metrics; no icons attached to page/section headings.
- Density: compact overview heading, visible current encounter action, condensed clinical forms, compact schedule and an upcoming-visit subcard; follow-up shows actual results/tasks counts.
- Terminology: bệnh nhân, lượt khám, khám lâm sàng, cận lâm sàng, nhận định lâm sàng, kế hoạch xử trí, hoàn tất hồ sơ. Global header is free of demo badges; a discreet footer makes the portfolio nature explicit.
- Preserve clinical boundaries: no real prescriptions, results release, medical recommendations or EHR integration. 


## Clinical Command Center — cross-screen showcase

The desktop dashboard prioritizes `current encounter → ready handoff → physician review → unreviewed result → aftercare`. The view follows the three operating questions: **where is the patient, who owns the work, and what is the next action?**

Demo journeys (synthetic only, stored in sessionStorage):

1. **Pre-visit review**: `a-021` → `#/doctor/review/a-021` → doctor records a routing proposal and note → ownership changes to Coordination; no reception booking confirmation is performed.
2. **In-person**: `a-027` starts at **ready** (reception and nursing intake represented as an existing handoff) → `#/encounters/a-027` → document symptom, assessment and plan → `#/results` review `r-04` → record a follow-up decision → encounter completion → `#/doctor/followups`.
3. **Online connected**: `a-040` → `#/doctor/online/a-040` → simulate established connection → start encounter. Without a successful connection, `start-consult` is blocked.
4. **Online unreachable**: `a-041` → `#/doctor/online/a-041` → select follow-up/callback/reschedule request → Coordination receives a task. No actual call or booking change.
5. **Aftercare**: `#/doctor/followups` shows patient, owner, deadline, status and next step. Only physician-owned tasks can be marked complete by the doctor.

Safe transitions: only **ready** (or an already in-progress encounter) may open a new consultation; confirmed/arrived do not bypass reception and nursing handoff. Completion requires nonempty clinical symptom/exam, assessment, plan and review of any results currently waiting for the physician. All transitions re-check eligibility in the event handler, not only in the UI.

**Portfolio boundary:** this is a local interaction prototype; it does not triage medical emergencies, prescribe, sign EHR records, send messages, call patients or confirm bookings. Shared presentation does not imply live synchronization with the patient prototype.
