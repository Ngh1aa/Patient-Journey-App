# CareFlow Authentication — Blue Editorial Design Contract

## Evidence and scope

Visual reference: the user-supplied bright-blue CareFlow welcome screen, reviewed as **visual reference, not UX/clinical evidence**. Workflow: `Ngh1aa/uiux-ai-workspace` → `mobile-web-preview`, `mobile-navigation-and-state-ux`, `mobile-design-system-and-handoff`, `mobile-prototype-and-qa`.

Platform is an interactive browser prototype (HTML/CSS/JS), **not** a native iOS/Android application. Canonical source of truth is `prototype/model.js` + `app.js` + `strings.vi.js`. No live SMS/medical network.

## Visual anatomy

- Electric-blue (`#0866FF`) full-bleed authentication canvas and header with white CareFlow wordmark.
- Three compact progress rails: stage 1 phone, stage 2 OTP, stage 3 identity/profile. These indicate interface progress, not clinical/real network state.
- White circular right-arrow in the header **focuses the next required form field**; it does not bypass validation or change auth state.
- Giant subtle darker-blue circular motif, behind a large bottom white rounded sheet. Decoration has `aria-hidden`.
- Editorial heading, short Vietnamese supporting copy, naturally labelled inputs, single primary action in a soft pill with a blue circular arrow.
- Keep additional support actions separate and clearly named; no fake account creation/login pair or lorem ipsum.
- A2 and A3 shorten the blue hero to prioritize multi-field forms and scroll accessibility.

## Screen and state contract

| Route | State | Primary input/action | Result |
|---|---|---|---|
| A1 login | phone pending | 10-digit phone → Nhận mã xác nhận | stays A1, displays OTP entry |
| A1 OTP | entered, empty, wrong, offline, missing consent | OTP+consent → Xác nhận và tiếp tục | existing account → A2, new account → A3, errors remain inline |
| A2 match | returning profile | editable identity fields → xác nhận | signed-in home or deep-link continuation |
| A2 alternative | wrong profile | Không phải hồ sơ của tôi | A3, no implicit identity merge |
| A3 new profile | new profile | name + valid birth date → Tạo hồ sơ | home; errors remain in form |

Progress, arrow focus, auth visuals and copy are presentation-only. Real patient-state transitions, validation, guards, error messages, and navigation use the existing handler/model. Back/reload/retry and draft ownership remain unchanged.

## Implementation

- `prototype/auth-editorial.css`: dedicated shared auth layer, 360/390/430px + 200% font, keyboard scroll and short-device fallbacks.
- `prototype/views.js`: reusable `authVisual` + `authPanel`, A1/A2/A3 compositions.
- `prototype/app.js`: auth stage indicators, explicit header-arrow focus behavior.
- `prototype/index.html`: semantic progress decoration and action control.
- `prototype/strings.vi.js`: truthful local-language A1 copy.
- `prototype/browser-tests/auth-editorial.spec.cjs`: actual OTP/profile navigation and responsive checks.
- Do not change `prototype/model.js` for stylistic reasons.

## QA/release

Run `npm --prefix prototype run test:all` (syntax, model, contrast, Chromium/WebKit). Inspect real A1 default/OTP, A2 returning, A3 new, validation, narrow devices, 200% text, keyboard, subpath and reduced motion. Release only after CI success + visual evidence. `main`/Pages stay unchanged while this work is in a feature-branch PR. UI review, clinical approval, real user studies, native testing and production integration remain separately scoped.
