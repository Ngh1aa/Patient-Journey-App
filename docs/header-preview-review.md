# Header draft — 20/10/2026

## Revision 2 — structural redesign (before implementation)

The user rejected revision 1 as mostly a copy change. Revision 2 replaces the composition, not the palette. Previous validation below belongs to revision 1 and does not certify this revision. The original draft kept product code/session state untouched; runtime integration is recorded separately below.

| Page | New visible decision object | Structural change | Interaction / constraint |
|---|---|---|---|
| B1 | Next-visit ticket | Open greeting with a large neutral account portrait; appointment ribbon overlaps the header/content boundary. Remove the duplicate appointment card below. | One visit arrow, useful quick access in content. No invented health score or progress rings. |
| D1 | Actual appointment dates | White calendar workspace with a mint date rail and flat underlined status tabs, rather than another large blue rounded banner. | Real fixture dates filter the list; selected date can clear. Preserve mode filtering and keyboard tabs. |
| K2 | Patient identity card | Full-width blue identity panel with full name, birth date and square portrait; related-profile access is an attached mint strip. | Open the fixture-relative listing. No fabricated record/insurance number or barcode. |
| K5 | Contact choice | Asymmetric photo-led blue hero; the already approved decorative doctor cutout occupies the right side. Message/callback controls form a contact dock below it. | Existing local preview dialogs only. No fake online indicator, named doctor or SLA. |
| A3 | Named account-creation progress | Three connected numbered/completed nodes and a small identity preview above the form. | Back/next preserve the preview-only boundary; submit never creates an app account. |

Same semantic tokens, font and 44px CSS touch targets. The prior user's reference direction permits a restrained photo cutout and blue/green fields; no new stock or model image is introduced. Numeric counts/statuses/date indicators must come from the existing fixture/local preview state.

Scope: B1, D1, K2, K5 and A3 header proposals, reviewed locally at `/design/preview.html?view=headers`. The application renderer, model, data and navigation are unchanged. This was the original preview-only boundary. On 20/10/2026 the user explicitly requested merging these reviewed headers into main, authorizing runtime integration, validation and release.

## Grounding and ownership

Read Factory START-HERE, AGENTS, CONTRACT-OWNERSHIP and the previously resolved professional redesign manifest. Read the bounded mobile browser preview/navigation/component and visual QA guidance. The current Factory manifest compiler cannot start because its available Python runtimes lack `pydantic`; a new generated routing receipt is NOT_RUN, not a Factory PASS. The prior manifest is historical routing context only. Existing unrelated Factory edits are untouched.

Active page owner remains `design/preview.js`; the query selects a separate composition in the existing review harness. Shared tokens, status, facts, tabs, button attributes, icons, avatar and model fixtures are reused. `header-preview.css` is loaded only by the design review page, never product entrypoints.

## Design contract before implementation

Audience: owner reviewing five existing patient headers. Intended impression: immediately know where I am and what is useful here. Direction: clear, calm, connected. Blue/green/white, Plus Jakarta Sans and navy/black roles remain approved constraints.

| Screen | Entry question / first anchor | Composition | Action | Data / media |
|---|---|---|---|---|
| B1 | What comes next? / friendly account name | Greeting and avatar, next-visit context | Bell, appointment card below | Existing account and appointment fixture; neutral avatar |
| D1 | Which appointment? / title and tabs | Title/subtitle, tabs; filter in list toolbar | Tabs, filter with applied count | Counts and cards from one fixture |
| K2 | Whose information? / full name | Title, identity row, relative link | Bell, relatives | Existing account and relative count |
| K5 | How can I get help? / clear contact direction | Title, actionable explanatory subtitle | Contact options below | No invented office hours, live status or response SLA |
| A3 | What step am I on? / step title | Back left, named 3-step progress; form below | Back, local preview submit | Local form values; no authentication or profile mutation |

Shared geometry: 44px minimum control hit areas, 20px header gutters (16px narrow-page adaptation), 24px main titles, 16px task title in compact auth navigation, 4/8 spacing rhythm. Status bar and header share one soft background; preserve the simulated island/home indicator. Three composition families: greeting, destination/context, compact task progress. No extra photos or decorative status dots are needed for header comprehension.

Sources: [Apple navigation bar composition](https://developer.apple.com/documentation/UIKit/customizing-your-app-s-navigation-bar), [NN/g descriptive headings and scanning](https://www.nngroup.com/articles/layer-cake-pattern-scanning/). Applied as design guidance to a web preview, not a native iOS implementation claim. The screenshot critique and existing app are the direct design baseline.

## Five expert walkthroughs / verification plan

1. Recognize greeting and next appointment without interpreting a generic conversational question.
2. Switch appointment tabs, open mode filter, apply/recover a zero state, inspect selected tab and filter count.
3. Open the real fixture-relative listing, close and restore focus.
4. Find contact entry without assuming clinic availability or generating a real request.
5. Return to authentication step two, continue to the form, inspect required-input feedback, then preview save without modifying application session data.

These are synthetic expert scenarios, not participant research. Validate rendered 320/360/390/1440 views, keyboard, large text, assets, contrast and existing Design System regression. User preference and actual app integration remain pending review.

## Revision 1 — historical rendered review result

Browser evidence: `../../header-preview-evidence/review.json`; desktop board and five individual screen captures in that same local directory. Chromium and WebKit: 320/360/390/1440px, no document overflow, clipped descendants or controls below 44×44 CSS pixels. At 150% text on 360px, no document overflow or clipped descendants. Interaction walkthroughs pass, modal dismissal restores trigger focus, the existing 3-frame Design System still renders, and `careflow.browser.v3` remains absent from session storage.

Axe WCAG 2.1 AA scan of the five-panel review after exercising its states: zero violations on both engines. This is bounded automated browser evidence, not whole-app/native certification. Fixed a 4.06:1 muted-month-label pair by using navy on baby blue (the shared token check reports 12.164:1); widened the date tile in large-text mode. Removed a redundant Support header caption during visual inspection. Current and selected appointment tabs use white and baby blue with navy text.

### Seven-sign screenshot checklist

Scope: the five preview articles at the above viewport sizes; state shown in the local board captures, with interactive tabs/filter/relative/auth paths checked separately.

| Sign | Conclusion | Location and role |
|---|---|---|
| AI-01 competing neon | không xuất hiện | All five `.hpr-phone` frames: approved muted blue/white; navy text, black auth submit. |
| AI-02 dark/glow effects | không xuất hiện | Entire review board; no glow/dark treatment. |
| AI-03 emoji as UI | không xuất hiện | Header, tabs, body controls: existing vector icon owner; simulated system bar uses vector shapes. |
| AI-04 default purple gradient | không xuất hiện | `.hpr-masthead` uses the approved blue mesh to group system/header context; no purple/lavender color added. |
| AI-05 cards everywhere | có mục đích rõ | Body fragments below B1/D1/K2/K5 are context for header scale: one appointment object, visit rows, profile facts, contact group. Header composition varies by greeting/destination/task; no nested decorative cards. |
| AI-06 colored side bars | không xuất hiện | No left-side colored stripes. A3 top progress bars map only to the three named auth steps, with current/completed text semantics. |
| AI-07 undefined status dots | không xuất hiện | No live/online dots; appointment badges map to fixture visit status with text/icon, filter count maps to a selected local filter, step progress maps to local preview step. |

Status: local draft ready for visual review. No integration into application entrypoints, no commit/push/merge, no publication, no human usability validation.

## Revision 2 — current rendered review

Source: current uncommitted `design/header-preview.css` and `design/preview.js` on `design/header-preview`. Current browser evidence is `../../header-preview-evidence-v2/review.json`, `board-1440.png` and `B1/K2/K5-320.png` in that directory. The previous composition/source is retained locally in `../../header-preview-v1/` for comparison.

- Chromium + WebKit at 320/360/390/1440: no document overflow, clipped descendants or visible control below 44×44 CSS pixels. At 150% text on 360px: no clipped text or document overflow; the date rail deliberately scrolls inside its own bounds.
- Actual screenshots inspected: full board, Home and Support at desktop frame size, and Home/Profile/Support at 320px. The ticket extends 40px below the Home header, and the Support contact dock crosses the lower hero boundary. Frame clipping does not clip their controls.
- Tab switching, date selection, mode filtering, composed zero state and reset pass. Relative dialog restores focus. Editing the name updates the identity preview immediately and survives returning from auth step 2. Preview save does not mutate app session storage. Existing three-frame Design System remains intact.
- Axe scan of the visible five-screen board after the interaction paths: zero WCAG 2.1 AA violations on either engine. No console page errors. This remains bounded automated browser/expert evidence, not participant/native QA or whole-app certification.
- No literal CSS colors added; use existing semantic tokens. The approved local Unsplash cutout is decorative, with empty alt; no named clinician, staff identity, live-presence or service SLA is inferred from it.
- Typography roles: page titles 24px, greeting display 30px, identity object name 22px, compact task title 16px; captions are subordinate. Role-specific choices replace a single identical banner rather than claiming every title has the same role.

### Revision 2 screenshot checklist

| ID | Conclusion | Exact reviewed location and rationale |
|---|---|---|
| AI-01 | không xuất hiện | Five `.hpr-phone` frames: no competing neon accents. Blue/mint group context; navy owns text/selection; black owns the visit arrow, messaging and save actions in their respective screens. |
| AI-02 | không xuất hiện | No dark-mode/glow/bloom treatment. The Home ticket and Support dock use the existing restrained elevation token to express overlap. |
| AI-03 | không xuất hiện | All five headers/actions use vector icons from the current app; no emoji navigation or bullets. |
| AI-04 | không xuất hiện | No purple/indigo gradient. Blue is limited to Home greeting, the profile identity object and Support hero; appointments/account setup keep white workspace surfaces. |
| AI-05 | có mục đích rõ | B1 next-visit ticket is a decision object; D1 uses date navigation and visit rows; K2 groups identity/household; K5 contact dock groups two contact actions; A3 shows the identity being created. No repeated title/description/pill template across the five headers. |
| AI-06 | không xuất hiện | No decorative left stripes. A3 uses a single connector with completed/current numbered nodes and named steps. D1 underline denotes selected status tab. |
| AI-07 | không xuất hiện | No online/health dots or fabricated progress percentages. Appointment badges, selected date, mode count and auth progress are bound to existing fixture or local preview state; the small Home heart is explicitly decorative. |

Ready as a local visual proposal. User acceptance and application integration remain pending; no commit, push, merge or publication performed.


## Runtime integration — authorized 20/10/2026

The user requested: “gộp các bản header mới này lên main”. The five reviewed compositions are integrated into the canonical patient renderer, with A1/A2 sharing A3 progress chrome. The product loads its existing shared `components.css`; it never loads `header-preview.css` or preview fixture/event handlers.

- B1: one next-appointment ticket from the actual session, patient/code/status and existing `open-visit` action. Empty state has one booking action. No duplicate appointment card; downstream care sections remain conditional.
- D1: dates derived from the current status group, local horizontal scrolling when needed, flat state tabs, existing person/mode/search filters plus date composition. Clear filters clears date; switching state tab clears stale date. Selected date and filter count persist through reload.
- K2: account identity with actual birth date and attached relatives access; no fabricated identifiers. Existing allergy update, result permissions, relative creation, settings and logout preserved.
- K5: existing decorative doctor image moved to the asymmetric hero. Message/callback dock uses existing I5 or support-compose routes. Emergency 115, topic choices, request history, FAQ and the full form remain. Message is secondary so 115 remains the one primary action on this screen. No fabricated clinic hours or response SLA.
- A1/A2/A3: named three-node progress follows actual OTP/profile state, back navigation and cached edits. Redundant top jump arrow and dot-only progress hidden. The live identity preview uses textContent. Real form submission/validation remains owned by app/model.

`prototype/model.js` and staff behavior remain unchanged. Shared CSS additions are scoped to the patient phone surface. Source checks, 49 model tests, 3 staff structure tests and existing token-contrast checks pass. Browser and release results are recorded after completion; preview results above are not counted as runtime acceptance.

### Seven-sign runtime review

| Sign | Conclusion | Location and purpose |
|---|---|---|
| Neon palette without priority | không xuất hiện | All five headers use the approved blue/mint/white palette; black marks the visit action and emergency action. |
| Decorative gradients/effects | có mục đích rõ | B1 greeting and K5 contact field establish hierarchy; K2 blue identity card distinguishes the account object. D1 stays white for calendar scanning. No decorative animation. |
| Same card template everywhere | không xuất hiện | Ticket, date rail, identity object, contact dock and account progress use different anatomies tied to different tasks. |
| Arbitrary status/metrics | không xuất hiện | Status badges, appointment dates, relatives and request counts come from the actual session. No score, fake availability or doctor assignment in the ticket. |
| Excessive gaps / sparse cards | có mục đích rõ | Header/body overlaps reserve actual layout space, the support dock is functional, and unused duplicate appointment/contact cards are removed. |
| Generic copy / designer text | không xuất hiện | Runtime has task labels and actual session facts; review rationale and synthetic walkthrough notes stay in the design page/docs. |
| Decorative icons / weak CTA | có mục đích rõ | Calendar dates filter, bell opens notifications, ticket opens that visit, family strip opens real relatives, and contact actions retain existing flows. Decorative heart/photo are aria-hidden. |


Runtime contrast correction: inherited muted text on the auth prompt/identity preview measured 4.06:1 on baby blue and 4.34:1 on mint. Both now explicitly use the existing navy token: 12.164:1 on baby blue and 12.992:1 on mint. The OTP/profile interaction regression scans all three real auth steps with axe, rather than inferring their result from the design preview. Ticket action keeps its existing accessible name “Xem phiếu khám”, with the actual visit/patient/status linked through aria-describedby.


Additional runtime filter recovery: a clinic update can move the selected appointment out of the current status group. The date rail normalizes such stale selection to All and the collection owner persists that recovered state. Guide entries that intentionally select online/onsite reset the old date as well. Focused date tests cover composition with mode, person and text, filter count, reload, reset, state-tab switching and clinic-update recovery on both engines.
