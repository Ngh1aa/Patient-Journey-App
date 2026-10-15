# CareFlow Design System — v0.1 (foundation for Hi-Fi)
**Date:** 15/10/2026 • **Type:** mobile iOS/Android patient app • **Status:** DRAFT; no clinical/legal/user sign-off.

## Source and intent
The [23-screen low-fidelity prototype](../prototype/README.md), [screen acceptance contract](../research/09-screen-specifications-acceptance.md), [model rules](../research/08-state-contracts-permissions.md) and [research on Apple HIG/WCAG](../research/02-accessibility-assets.md) are the inputs. This design document is a **proposal**, not a certified guideline.

The machine-readable [tokens.json](tokens.json) is the single proposed source for candidate values, not a statement that all screens have been accessibility tested. Contrast ratios below are computed for exact pairs; do not infer contrast of all component states.

## Visual foundations
| Category | Proposal | Rationale / validation |
|---|---|---|
| Primary | Blue `#155EEF`, white `#FFFFFF` on primary | contrast **5.41:1**, passes WCAG 2.2 AA normal text pair |
| Body | `#101828` on `#FFFFFF` | **17.75:1** |
| Secondary | `#475467` on `#FFFFFF` | **7.69:1** |
| Link | `#0B4A9E` on `#FFFFFF` | **8.44:1** |
| Danger CTA | white on `#B42318` | **6.57:1**; never rely only on red |
| Dark primary | `#0B1220` on `#7FB2FF` | **8.66:1**, re-check on actual device |
| Font | Be Vietnam Pro / Noto Sans / system | Vietnamese diacritics, legal license in research/02 |
| Body size | 17pt (iOS baseline) / dynamic font scaling | large text & minimum/maximum layout tests |
| Controls | 52pt suggested primary height; >=44pt iOS target and >=48dp Android | 52 high doesn't ensure adequate width or spacing |
| Cards | radius 20, padding 16–20 | visual choice, not normative Apple HIG |
| Nav | 4 bottom tabs: Home / Lịch / Hồ sơ / Thông báo | platform-specific native layout where possible |
| Motion | short, purposeful; Reduce Motion honored | no animation as sole signal |

WCAG mobile guidance: [WCAG 2.2 target size understanding](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (web CSS pixels), [WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). iOS points / Android dp **are not equal** to CSS px.

## Figma component inventory (proposed names, anatomy, states)
| Component name | Anatomy | Variants / states | Usage | Accessibility contract |
|---|---|---|---|---|
| `CF/AppShell` | top area, content scroll, navigation, safe-area inset | tab / task / full-screen alert; keyboard up; large type | all A1–G3 | focus returns to heading, tab bar never overlays action |
| `CF/Button` | label, leading icon optional, progress | primary/secondary/tertiary; default/pressed/disabled/loading/error | all | >=44pt iOS, >=48dp Android; loading announced |
| `CF/ClinicCall` | icon + “Gọi phòng khám”, availability hint | inline / header / strong action, hotline missing/available | A1/B1/C3/E4/F4 | phone number configured by clinic; action not deceptive |
| `CF/PersonContext` | name, “đang đặt cho”, edit affordance | self/delegated/expired, compact/expanded | C1–C6/D2/F2/G1 | announce chosen patient to screen reader, no stale data after switch |
| `CF/PersonSelector` | avatar placeholder, person label, permission badges | selected/unselected/pending authorization/revoked | C1/G1 | distinguish BOOK from VIEW_RESULT |
| `CF/AppointmentCard` | person, date, mode, location, confirmed status, CTA | upcoming/awaiting confirmation/canceled/no-show/empty/stale | B1/D1/D2 | “confirmed” only if authoritative backend says so |
| `CF/BookingProgress` | current step, back, save/resume | step 1..4 / warning-stop / expired-slot | C1–C5 | does not turn C3 into routine backtracked step |
| `CF/ScreeningAlert` | clear warning, clinician-approved message, help action | risk flagged / help unavailable / staff review needed | C3 | no unapproved advice; never present continue-to-online as primary |
| `CF/SlotPicker` | mode, date, slots, clinic site | available/selected/expired/unavailable/loading | C4/C5 | time plus date, no silent reschedule |
| `CF/JourneyStatus` | label, owner role, update timestamp, next action | confirmed/check-in/waiting/consulting/signed/unavailable | D2 | multiple independent status types, don't claim real-time without data |
| `CF/QueueCard` | check-in state, registration number, consultation queue number | available/stale/manual check-in | E1 | two numbers labeled separately, no fabricated ETA |
| `CF/VideoPreflight` | connection, mic, camera permission, contact | ready/denied/device missing/offline | E2/E3 | visible alternative help; hardware permissions not auto-granted |
| `CF/VideoRecovery` | failure reason, retry, request callback, change appointment | not-contacted/call-dropped/staff-unavailable | E4 | separate user unreachable and disconnected states |
| `CF/PaymentStatus` | amount, reference, payment channel, payment state | not-required/unpaid/processing/pending reconciliation/paid/deferred/refunding | F1 | no payment success based on QR scanning alone |
| `CF/ResultCard` | test, collected date, doctor review, release state, link | ordered/result-available/awaiting review/reviewed/released/no-permission | F2/F3 | reviewed != communicated, no auto-diagnosis |
| `CF/CallbackTask` | reason, owner role, status, next contact | submitted/assigned/attempted/unreachable/closed | F4/G2 | real SLA only if signed off by clinic |
| `CF/AccessibleTabBar` | 4 items with icon + text | current/idle/badge/reflow large text | B1/D1/G1/G2 | semantic labels, no color-only state |

**States are mandatory component variants, not decorative color badges.** All placeholders must be visibly marked mock in the prototype until API backed.

## Mobile handoff rules
1. Design at minimum iPhone compact width and common Android 360–412 dp, plus larger Dynamic Type, portrait and landscape.
2. Never hardcode a maximum two lines for critical warning, patient identity, status and action labels.
3. Test sticky bottom actions with soft keyboard, safe areas, visible browser UI and phone gesture bar.
4. RTL not a current target, but Vietnamese line break and tone marks must be correct.
5. Separate `actorId`, `patientId`, consent, scope and permissions; never rely on client-only filters to hide another person's result.
6. Use icon+text on navigation/action controls; status accessibility announcement must not spam.
7. Dark mode uses semantic role mappings in tokens, not numerical inversion.

## First Hi-Fi screen sprint (once risks reviewed)
- **Wave 1:** A1, B1, C1, C2, C4, C5, C6, D2. Treat C3 as clinical-placeholder only until the actual warning content is approved.
- **Wave 2:** D1, D3, E1, E2–E4, F4 with clinic operation sign-off.
- **Wave 3:** F1–F3, G1–G3 with finance, privacy and results-release policy sign-off.
- Every design handoff has variants: default, loading, empty, error, accessibility large text, unauthorized where relevant.

## Current validation status
| Gate | Status |
|---|---|
| Existing low-fi 23 screens | Done |
| Existing model checks | 26 / 26 passed on prior CI |
| Cross-engine browser QA | **PASS** — 22/22 automated mobile Chromium/WebKit checks, [successful run](https://github.com/Ngh1aa/Patient-Journey-App/actions/runs/38633759469), fix merged in PR #4 |
| Contrasts for the 8 documented color pairs | Computed, values above |
| Targeted automated axe scan | **0 violations in A1, C1, C3, C5 across two browser engines; NOT a complete WCAG audit** |
| Moderated usability with patients | NOT DONE |
| Medical / legal / clinic sign-off | NOT DONE |
| High-Fidelity design screens | NOT STARTED |

