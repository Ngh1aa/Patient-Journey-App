# CareFlow Clinic — 8-screen desktop portfolio prototype

This is a standalone, buildless HTML/CSS/JS **synthetic interactive prototype** added alongside (not instead of) the existing 47-screen patient mobile browser prototype.

## Preview

From the repository root:

```sh
node prototype/preview-server.cjs
# http://127.0.0.1:4175/staff-prototype/index.html
```

GitHub Pages-compatible project subpath: `/Patient-Journey-App/staff-prototype/index.html`.

The app has **eight showcase surfaces**:

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
```

If Playwright dependencies are available from the patient prototype, the staff browser test can be run with the repo's Node/Playwright toolchain. Inspect 1280, 1440, and 1920px screenshot compositions and the keyboard-flow evidence as a separate visual QA gate.
