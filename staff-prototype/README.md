# CareFlow Clinic — 16-surface desktop portfolio prototype

This is a standalone, buildless HTML/CSS/JS **synthetic interactive prototype** added alongside (not instead of) the existing 47-screen patient mobile browser prototype.

## Preview

From the repository root:

```sh
node prototype/preview-server.cjs
# http://127.0.0.1:4175/staff-prototype/index.html
```

GitHub Pages-compatible project subpath: `/Patient-Journey-App/staff-prototype/index.html`.

The app has **eight core surfaces and eight supporting surfaces**:

| ID | Surface | Entry route |
|---|---|---|
| W01 | Reception overview | `#/reception` |
| W02 | Appointment calendar | `#/calendar` |
| W03 | Patient directory | `#/patients` |
| W04 | Patient profile | `#/patients/p-001` |
| W05 | Appointment detail drawer | `#/appointments/a-018` |
| W06 | Doctor overview | `#/doctor` |
| W07 | Consultation workspace | `#/encounters/a-018` |
| W08 | Lab results | `#/results` |

**Portfolio extension (supporting pages, W09/W10/W14/W15/W29/W30/W31/W44):**

| ID | Page | Entry route |
|---|---|---|
| W09 | Booking requests | `#/requests` |
| W10 | Create booking | `#/booking/new` |
| W14 | Reception check-in | `#/checkin` |
| W15 | Live queue | `#/queue` |
| W29 | Lab order draft & tracking | `#/clinical/orders` |
| W30 | Prescription layout & internal draft | `#/clinical/prescription` |
| W31 | Review & finish encounter | `#/clinical/review` |
| W44 | Portfolio role chooser (no real login) | `#/welcome` |

The supporting pages use `supporting.js` and `supporting.css` alongside existing shared state, routing and brand tokens. W10 can create a mock appointment, which W05 can confirm, W14 can check in, and W15 can advance to a doctor. W29 adds mock order metadata. W30 deliberately does **not** suggest medications, doses or valid prescriptions. W31 uses existing guarded encounter-completion demonstration. Only synthetic browser-session data is used.

Interactive demos: appointment confirm/reschedule, directory search/profile details, calendar navigation, doctor consultation draft/sign, result review, notifications, role switching, and reset. State is local to the browser session and **not synchronized to the patient prototype or a server**. Buttons that would imply a clinical, financial, or communication action remain simulated and labelled appropriately. No real patient data, emergency triage, prescription, diagnosis engine, SMS, EHR, signature, or payment service exists.

## Design source and method

- CareFlow `design/tokens.json` light semantics and Be Vietnam Pro installed at `prototype/assets/fonts/` (relative references, no font duplication).
- [UIUX Factory START-HERE](https://github.com/Ngh1aa/uiux-ai-workspace/blob/main/START-HERE.md), `AGENTS.md`, `docs/CONTRACT-OWNERSHIP.md` and `professional-website-redesign` stage structure.
- Relevant skills: design-system-and-components, information-architecture, interaction-patterns-and-form-ux, data-tables-and-enterprise-ux, complex-workflow-and-progress-ux, ui-craft-and-visual-qa, accessibility and UX writing.

Goal: present a convincing **portfolio showcase**, not production clinic software. Any clinical workflow, authorization, service integration, and legal/compliance approval remains outside this demo.

## Validation

```sh
node --check staff-prototype/app.js
node --test staff-prototype/test.cjs
node prototype/node_modules/@playwright/test/cli.js test --config=staff-prototype/playwright.config.cjs
```

If Playwright dependencies are available from the patient prototype, the staff browser test can be run with the repo's Node/Playwright toolchain. Inspect 1280, 1440, and 1920px screenshot compositions and the keyboard-flow evidence as a separate visual QA gate.
