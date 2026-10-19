# Navigation integration và sửa component — 19/10/2026

Theo yêu cầu trực tiếp mới nhất, **navbar đã gắn vào app**. Link xem nhanh: `/prototype/?scenario=upcoming#/home`; Design System: `/design/preview.html`. Không yêu cầu thêm một lần duyệt để tích hợp phần nav đã được chỉ định. Bố cục Home và các trang/card khác chưa được migrate toàn bộ.

## Thay đổi đã thực hiện

| Hạng mục | Thay đổi / owner | Evidence |
|---|---|---|
| Primary consistency | `--cf-primary` chung#0B1220; shared button rule đọc token, không navy gradient. Next và Continue cùng primary. DS có nhiều mẫu độc lập để so sánh, không hạ Next xuống secondary để khớp gallery count | `design/tokens.css`, `components.css`, `preview.js` |
| Avatar bị che chữ |32px/overlap4px/white border2px; initials nằm trong span riêng; đo text-right trước avatar kế tiếp | [Card column390](card-column-390.png) |
| Mặc định/Đang tải giả action | Bỏ hai pill state-switcher; figcaptions nhỏ dưới default/loading/locked. Loading luôn có spinner, busy/disabled semantics | [Button examples](loading-locked-column.png) |
| State filter | Selected black/white, idle white/gray outline; retained `aria-pressed` and working empty/loading/error/ready controls | [Desktop](components-1440.png) |
| Confirmed vs completed | `CareFlowUI.status('confirmed')`→info/blue, completed→success/green. Copy, state enum, transitions và permissions không đổi. Badge DS dùng check/record icon | Same shared owner applies to existing consumer styles |
| Designer labels | Frame labels, component explanations và heading Thanh điều hướng chỉ có ởDS; product render nhận items từnavigation, không nhận wrapper heading/copy | App nav test asserts no “Thanh điều hướng” text |
| Đánh dấu | Source đã là Đ U+0110; giữ đúng chính tả và tăng footer thành body14/500 cho rõ nét | `preview.js` `.cf-guide-note`, [card](card-column-390.png) |

## Navbar đang chạy trong app

- One renderer `CareFlowUI.navigation(current,{unread,routeFor,contentOnly})` cho DS và app. `app.js` vẫn dùng activeTab/routeFor và action `book-nav` hiện có; không thay guard hoặc draft-resume logic. Legacy template nav riêng đã được bỏ khỏi render.
- Booking circle56px, dấu+trắng26px, nền#0B1220, white border4px, nhô16px khỏi thanh và nhãn “Đặt lịch”. Circle neo vào thanh thay vì chiều cao label nên chữ200% không bị che.
- Active tab: SVG filled từ registry hiện có, navy, text700 và blue pill. Idle: outline/muted#5B6B8C. Labels11px bình thường, tăng theo large-text setting; touch targets≥44×44 CSSpx. White bar/shadow nhẹ, padding safe-area và scroll reservation gồm safe-area.
- Appointment badge đếm unique visitId từ notifications chưa đọc, screenD2 và visit còn tồn tại; không đếm result/message notifications thành lịch mới. Cap hiển thị99+, accessible description đọc số thật. Chỉ mở tab Lịch hẹn không tự mark read; các action đọc notification hiện có quyết định reset/persist.
- App/navbar tự ẩn theo điều kiện auth/booking/call hiện có. Không hiển thị bottom tabs trên login hoặc4-step booking đang diễn ra.

Actual screenshots: [Home390](app-home-390.png), [nav close-up](app-nav-390.png), [appointments](app-appointments-390.png), [profile](app-profile-390.png), [support](app-support-390.png);360/1440 variants cùng thư mục. Ảnh app dùng fixture trong browser context riêng, không reset dữ liệu tab của người dùng.

## Kiểm tra và giới hạn

- [Component + navigation](component-navigation-results.json):42/42 PASS, Chromium/WebKit,320–1440 cho app và360–1440 choDS. Includes unread deduplication/read persistence, actual selected glyph/color, visible labels, booking vs list, draft resume, touch/insets, avatar text visibility, sample captions/spinner and generic states.
- [Final large/selection checks](large-selection-results.json):6/6 PASS sau khi circle được neo vào navbar và preview selection re-render glyph. Check labels below the circle at200%, content outside overlay, keyboard/current state and auth nav hiding.
- [Broad existing regression](regression-results.json):64/66 passed initially; two failures were the old `.chip.success` selector still requiring confirmed=green. Updated the test to assert the new explicit info tone and distinguish pending by label/tone/background. No product guard/state change was used to satisfy an obsolete color assertion. [Final navigation/clinical rerun](final-navigation-clinical-results.json):**32/32 PASS** owns acceptance after that correction. These suites overlap; do not add them up as unique tests.
- Model49/49 PASS; npm run check / design preview syntax PASS. Source gate4 checks PASS, shared component CSS0 raw color literals. [Source contract](source-contract.json).
- [Elementary sanity](elementary-sanity.json):62 route states (47 patient/15 doctor),52 hover/focus variants,0 catastrophic flat/gradient text findings;7 media contexts require visual inspection. This is a bounded sanity scan, not WCAG AA certification. Media styles/photos were not changed in this task.
- Axe: DS generic states and integrated nav checked for WCAG2A/AA/2.1AA tags. Native Safari safe-area behavior, native VoiceOver and patient usability outcomes are not verified by these desktop-engine checks.
- [Captures](capture-report.json):20 actual screenshots across DS/app views; no page overflow reported in captured scope. Mobile, large-text, nav close-up, profile initials and state examples opened for visual inspection. Final media includes the raised circle beyond nav bounds, rather than clipping it in an element-only screenshot.

## Contrast of the changed roles

Computed exact-pair data: [contrast.json](contrast.json). All20 theme pairs remain≥4.5, min5.024:1. The table below identifies the roles changed or reused here; values rounded for display only.

| Role | Foreground / background | Ratio |
|---|---|---:|
| Primary / booking + / badge |#FFFFFF /#0B1220|18.723:1|
| Loading control |#FFFFFF / resolved#232A36|14.424:1|
| Active nav and confirmed DS badge |#001D57 /#CFE2FF|12.164:1|
| Idle nav |#5B6B8C /#FFFFFF|5.348:1|
| Completed DS badge |#176044 /#CDEFE4|6.109:1|
| Locked control |#5B667B /#EEF1F5|5.104:1|

## Checklist7 dấu hiệu

Scope: changed DS primitives and integrated navbar; phone bodies in screenshots still include the earlier card draft. Do not infer all-page redesign approval from this scope.

| ID | Kết luận | Vị trí / vai trò / bằng chứng |
|---|---|---|
| AI-01 neon cạnh tranh |không xuất hiện|Nav uses one black action, blue selected pill and muted idle. DS state selector black/white, no neon emphasis; named statuses have explicit copy |
| AI-02 dark/glow trang trí |không xuất hiện|Black is a control background, no new dark card/glow/bloom. White bar shadow distinguishes floating navigation from content |
| AI-03 emoji thay icon |không xuất hiện|Active/idle glyphs from existing SVG registry; no emoji. Text labels and accessible names identify destinations |
| AI-04 purple gradients |không xuất hiện|Changed component theme remains blue/green; selected navigation blue signals current destination, not decoration. Primary controls use flat black |
| AI-05 card mọi nơi |có mục đích rõ|DS figures expose different control states rather than pretend to be product tasks. Navbar is one persistent wayfinding region; no new card wrappers injected into app pages. Remaining old page/card issues stay in the separate audit |
| AI-06 rainbow sidebars |không xuất hiện|No side strips. Current tab uses filled glyph+text weight+pill and aria-current, not color alone |
| AI-07 decorative status/dot |có mục đích rõ|Appointment badge reads existing unread D2 update data; no fake online dot. Confirmed vs completed has different text/tone, and DS icon meaning. Figure captions are descriptions, not fake actionable statuses |

## Remaining scope

Full Home/card layout and the staged page migration remain open; old stock images/00 metrics have not been removed by installing the nav. DS-only profile/quick-question layouts are not claimed as deployed app profile/support pages. No branch commit/push/merge; remain on `redesign/cards-v2`. Wait for exact **chốt** before merge.

Local server currently runs on4186. From repository root, restart when needed:

```powershell
$env:PORT='4186'
node prototype/preview-server.cjs
```

Report date uses client19/10/2026; browser JSON timestamps use host UTC.
