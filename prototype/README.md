# CareFlow v3 — 47-screen mobile browser prototype

Run from the repository root: `node prototype/preview-server.cjs`, then open http://127.0.0.1:4175/prototype/index.html. No build step or bundler is needed. See docs/product-brief.md and docs/screen-flow-matrix.md.

## Experience
Start at A1 and enter the test phone number 0900000000 and the test code 123456. Data lives only in sessionStorage. The Demo bar is always shown outside the phone frame. The review tools let you load sample profiles/appointments, go to a route and apply valid staff events. Choosing a screen does not bypass its guards. Use Reset to clear the session.

New profile: A1→A3; the “Existing profile” fixture: A1→A2. Appointment details (D2) is the hub. Staff updates (confirming and reminding appointments, check-in, the doctor calling/ending a visit, lab review, reconciliation/refunds) are kept outside the patient UI. There are no real transactions and no approved medical guidance.

## Source owners
- model.js: the 47-screen registry, pure state guards, fixtures, permissions.
- strings.vi.js: shared patient copy (now English; the file name is kept so existing references keep working), with external demo copy kept separate.
- views.js/icons.js: component helpers and composed screens, reusing the existing icon family.
- app.js: hash navigation, forms, session, controlled simulator.
- styles.css: semantic tokens, 360/390px, 200% text, focus and safe areas.
- tests.cjs + browser-tests/journeys.spec.cjs: state and browser acceptance.
- legacy-tests/: old contracts from before file13, kept for reference; not part of the current suite.

## Testing
`npm ci`, `npx playwright install chromium webkit`, `npm run test:all`. The config starts a Node HTTP server alongside the tests and serves both the root and the /Patient-Journey-App subpath. Playwright Chromium/WebKit is browser QA and does not prove native iOS/Android behaviour. The model checks and the screenshot/accessibility/flow gates are independent.
