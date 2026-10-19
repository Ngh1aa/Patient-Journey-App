# CareFlow Design System

## Release authorization —19/10/2026

Người dùng đã yêu cầu trực tiếp “merge lên main cho mình nhé” sau khi xem bản polish8 nhóm. Yêu cầu mới thay thế điều kiện giữ bản nháp/chờ từ “chốt” trong các ghi chú lịch sử phía dưới. Đợt phát hành này phải tích hợp main mới nhất, giữ bộ shared design system hiện hành và qua kiểm tra trước khi merge; không force-push hoặc xóa nhánh.

## Active — H2 review, 19/10/2026

The latest user request integrates the current work into the local draft and changes navigation to icon-only tabs, superseding option A. H1 is approved; the current batch covers patient display fixes A, navigation F, safety D1/D2 and meaningful H6 aftercare copy. Further screen batches remain subject to staged review. Both entrypoints already enable `data-cf-theme="pastel"`; staff composition is not redesigned in this batch. All changes remain on `redesign/cards-v2`; no merge into `main` is authorized before the exact release approval `chốt`.

Navigation uses a real SVG concave background, a56px black booking action and24px icons without visible captions, including the selected tab. All five controls retain their accessible names through `aria-label`; selected tabs retain their filled navy icon and pastel background. Booking footers stay associated with their forms; their measured height is reserved in the scroll viewport. Calendar/topic/time/file presentation enhances the existing form values through the shared UI owner and existing modal lifecycle.

Latest local refinement: the navigation SVG also rounds its two lower corners. Support replaces the decorative banner with actionable contact bento, a compact emergency row with a black115 action, FAQ before the request form, and16px section gaps. Home and Support reuse one alpha WebP portrait derived from the existing licensed Unsplash photo. Availability/SLA is not invented; current header uses request state or a missing-hours message. [Support/image review](../docs/card-evidence/support-refresh/review.md).

Current polish supersedes the support composition above: a wide messaging card, callback and request history, topic chips, truthful request-state header, visible contact preference and synchronized prefill counters. Profile uses compact facts, distinct allergy update, real add-relative empty state and targeted settings actions; booking groups profile guidance and date/time rather than duplicating cards. [Eight-card review and verification](../docs/card-evidence/card-polish/review.md).

Approved future decisions: D3 keeps four steps (step4 will be Lịch hẹn; C7/C8 remain distinct child screens; C2/C3 share the step name). D6 pending copy will be Bác sĩ do phòng khám sắp xếp. D7 permits assumed prototype location/policy/response-time copy, documented as assumptions. These decisions do not authorize merge or completion of later stages. H2 evidence: [review](../docs/card-evidence/review-gate-2/review.md).

Patient compositions keep appointment facts/status/clinician/QR, four booking groups with clinical safety branches, profile/avatar/count, question prompts, checklists, documents, support forms, filters and history. Staff keeps work queues/tables and clinical columns. Active CSS colors come from tokens; unused historical styles/proposals remain archived. Plus Jakarta Sans is served locally on both surfaces.

`applyActionHierarchy(container)` synchronizes journey presentation classes with semantic button variants and keeps one strongest content action. It does not disable/change actions, selected records or transitions. Persistent booking navigation and modal dialogs have separate scopes. Follow-up no longer duplicates the same rebook control in hero and footer.

Preview: `/prototype/?scenario=upcoming#/home`, `/staff-prototype/#/doctor`, gallery `/design/preview.html`. Run `$env:PORT='4186'; node prototype/preview-server.cjs` from the repository. Evidence: [rollout review](../docs/card-evidence/all-screens/review.md). No main merge; wait for exact “chốt”.

---

Các mục phía dưới là lịch sử của các đợt trước; mốc chờ duyệt và phạm vi cũ đã được yêu cầu mới thay thế.


## Active candidate — blue/green foundations, 19/10/2026

**Navigation is now integrated into the app**, following the user's latest request. `prototype/app.js` calls the same `CareFlowUI.navigation` as the Design System. The black raised booking action, icon-only tabs with accessible names, filled selected icons, muted idle icons and unread visit-update count are live in the local prototype. Primary controls use the shared black token; confirmed now maps to blue/info while completed stays green/success. Other page layouts remain the existing draft.

Current specimen correction: Next and Continue share the primary variant. The Design System places default/loading/locked examples in separate labelled figures; those captions are not clickable state selectors. Multi-example specimens do not represent a product screen's primary-action budget. The state filter remains interactive with a black selected chip and white outlined alternatives. Avatar circles32px overlap4px with a2px white border and inner text; the guide footer is14px/500 and contains Unicode Đ (U+0110).

Review at `/design/preview.html`. Full Home/page composition is still pending its stage. Do not interpret the component specimen or navigation integration as an implemented Home or all B–G screens.

`tokens.css` is the runtime color/type/space owner; `components.css` owns presentation; `ui.js` extends the existing card/button/status contract. The candidate activates only under `data-cf-theme="pastel"`. `preview.js` is an isolated interaction harness with existing model fixtures; it does not persist patient/session data. No dependency added. Earlier `tokens.json` proposals and the v0.1 text below are historical, not the active CSS values.

Current correction: primary action is `--cf-primary` (#0B1220), maximum one per screen. Navy is the heading/icon/selected-navigation/link accent. The decorative palette contains only the two blues and two greens from the user brief; orange/red are reserved for semantic states. `--cf-primary-loading` mixes90% primary with white rather than reducing text opacity; locked controls use separate gray tokens and a lock icon. `sectionHeader` renders a background-free link using the canonical route. Profile card uses stacked initial avatars + adjacent count and an expandable names list; question card uses suggestions that open an editable, explicitly unsent draft. They share surface tokens, not identical content anatomy.

| Primitive | API / hook | Responsibility |
|---|---|---|
| Card | `card`, `cardAttrs`, `data-cf-mesh="hero/feature/result"` | White surface; highlights only when content has a distinct role |
| Button | `actionButton(label,{variant,icon,action,to,disabled,busy,pressed})`, existing `buttonAttrs` | Escaped labels and event data; icon + visible button shape; no business handler inside UI library |
| Header | `header({title,subtitle,unread})` | Title + bell links to existing K1 action; unread count only when supplied by model |
| Section | `sectionHeader(title,{label,action,to})` | Consistent heading and shaped “Xem tất cả”; omit action for one item |
| Navigation | `navigation(current,{unread,routeFor,contentOnly})`, `appointmentUpdateCount(state)` | Single renderer for app/DS; existing routes, real deduplicated unread D2 updates; list distinct from booking/resume |
| Tabs | `tabs(items,selected,id)` | ARIA tab contract; host supplies panels, selection and keyboard behavior |
| Stepper | `stepper(current)` | Four visual groups; non-clickable progress; clinical branching stays in model |
| Status | `badge(value,domain)`, existing `status` | Existing copy/mapping; cancellation has a pale red candidate badge; no status inferred from photo |
| Illustration | `illustration(calendar/clinic/support/profile/result)` | Outlined decorative token-colored SVG in a fixed slot; no fake clinician/facility identity |
| Profile summary | `profileSummary(profiles)` | Up to2 overlapping avatars; adjacent real count, no stand-alone metric or stock portraits |

Type roles: page24 / section18 / card16 / number36 / body14 / metadata13 / status12 CSS px, one local Plus Jakarta Sans. Radius24 large /16 small /pill; gutters16 and spacing4/8. Candidate text on mesh uses navy or ink; muted text is reserved for white/light surfaces. Native pt is not equal to CSS px. Review harness includes a200% text toggle and explicit reflow adaptations. Tabs/stepper stay on one line, with local horizontal scrolling at200% instead of shrinking labels. Illustrations occupy fixed128px slots (120px beside text;160px for an empty state), with a visible paper outline and all artwork inside its viewBox.

Source and before ledger: `docs/card-design-rules.md`, `docs/card-audit.md`, `docs/card-evidence/pastel-foundation-before/`. Verification and seven-sign review: `docs/photo-led-review.md`.

## Historical v0.1 proposal (superseded for current web candidate)
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

