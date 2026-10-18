# CareFlow design system và handoff

## Shared component contract — patient and doctor

Runtime vocabulary: `prototype/strings.vi.js` (`common`, `ui`, `statuses`, `labs`).
Presentation helpers: `design/ui.js`. Component primitives: `design/components.css`, loaded after the existing page layout styles in both entry points. Keep layout hooks in the existing renderers; do not add per-screen button font sizes or new polish stylesheets.

| Component | Named variants / sizes | Contract |
|---|---|---|
| Button | primary, secondary, inverse, danger, text; md, lg | Existing `btn`, `form`, `visitAction` helpers emit `data-cf-component`, `data-cf-variant`, `data-cf-size`. Default md is 44px on doctor / 48px on patient; lg is 52px for form submission. Height may grow for wrapping/large text. Font is 14px doctor / 15px patient, weight 600, line-height 1.5. |
| Link | text | Keep native anchors for known URLs and buttons for event-driven routing. Text variant has an underline and the same named control type scale; do not abbreviate labels per screen. |
| Tab / filter | underline, segmented | Tabs expose selected state and a labelled panel; arrow keys/Home/End move focus and activate the tab. Independent list filters remain `role=group` with `aria-pressed`. |
| Status | info, warning, success, neutral, danger | Use `CareFlowUI.status(value, domain)`. Visit `ready` means ready to consult; result `ready` means awaiting physician review. Never infer a medical state from color. |
| Appointment | row (doctor), card (patient) | Preserve patient/visit ID, clinician, mode, date/time and state. One clinician has one stable portrait seed. Layout differs by role; action labels and tokens are shared. |
| Label/value | facts | Use `dl/dt/dd`; 13px labels, 14px values, line-height 1.5. Two columns where space permits, one column for large text or narrow clinical context. |

Canonical actions: **Xem hồ sơ bệnh nhân**, **Xem phiếu khám**, **Xem kết quả**, **Xem lịch khám**, **Xem danh sách khám**, **Xem công việc theo dõi**, **Rà soát hồ sơ khám**. Modes are **Tại phòng khám** / **Khám trực tuyến**. Existing stored fixture mode values are retained and normalized for display only.

Doctor overview DOM and reading order: **current encounter → physician decision → unreviewed result → daily agenda**, followed by online handoff and aftercare. No marketing hero or decorative statistic row precedes the work. Every empty group retains its destination. Existing clinical authority/transition guards remain model-owned.

States: visible focus, hover/active, disabled, form `aria-busy` plus submitting label, persistent draft and inline validation/recovery. Loading is attached to the real local submission, with no artificial delay. The patient large-text setting scales shared type to 200%; controls grow and cards/facts stack. Browser tests are technical evidence, not clinical approval or direct-user validation.

Role fonts remain intentional: Be Vietnam Pro self-hosted for patients; Plus Jakarta Sans with system fallback for the doctor workspace. Separate role fonts do not permit per-screen control sizes or vocabulary.

Giao diện hiện tại: **Calm Clinical**, chuyển bố cục từ hai ảnh tham khảo ngày 16/10/2026, dùng navy hiện tại `#001D57`. Mã nguồn dùng chung cho 47 màn trong `prototype/views.js`; foundation ở `styles.css`, layout hiện tại ở `editorial-soft-glass.css`, auth ở `auth-editorial.css`.

Browser prototype với dữ liệu thử nghiệm. Đây là quyết định thiết kế từ yêu cầu người dùng và source audit; chưa có nghiên cứu người dùng hoặc phê duyệt lâm sàng mới.

## Typography và geometry
Be Vietnam Pro self-hosted Regular/SemiBold/Bold với glyph tiếng Việt (SIL OFL, license kèm assets/fonts). Body/form 16px, CTA15px, heading29px, status12px; large text nhân 2 mọi font size trong phone. 44px minimum hit targets, CTA52px. Khoảng cách 4/8/12/16/20/24/32/40/48px. Card R26, input R16, CTA pill, nav R30. Lịch khám có ngày/giờ tách nhóm, thông tin chi tiết hai cột và lý do khám chiếm trọn hàng; chữ lớn chuyển về một cột. Shadow nhẹ chỉ cho container nổi có ý nghĩa. WCAG contrast/reflow là technical QA, không tuyên bố chứng nhận accessibility.

## Owners và contracts
| Component | Owner | Variants / behavior |
|---|---|---|
| App shell / header / 4 destinations + booking action | index.html, app.js render | safe area, mobile full viewport / desktop centered phone; auth/video hides tabs; Back hash history; Trang chủ · Lịch hẹn · [+ Đặt lịch] · Hồ sơ · Hỗ trợ; central action resumes the unsent draft |
| Phiếu khám, visitCard, details | views.js | đúng patientId/id/date/mode/status; D2 hub; QR contains CAREFLOW-DEMO:id only |
| Timeline / status chip | views.js + model.TRANSITIONS | nhãn và owner từ strings.vi.js, màu không là tín hiệu duy nhất |
| Form / choices / slots / check | views.js + app.js | labels, selected/focus/error/disabled/loading; 5-stage booking progress, 5 quick dates synced to the real date field; form cache restored on Back/reload |
| Dialog | index.html + app.js | native dialog focus trap, Escape/dismiss, focus return, cancel confirmation |
| Lab cards / paths | views.js F1-F4 | ordered→scheduled→available→awaiting-review→reviewed; result notification independent |
| Payment / receipt | views.js H2-H5 | separate visit.payment, no real account/QR or made-up fee; staff reconciliation/refund |
| Conversation / report / tracking | views.js I1-I5 | context keyed by visitId/patientId; 3 reasons and urgent route |
| Empty / recovery / offline | views helpers + router guard | every unavailable context has return action; drafts retained offline |

## Thẩm quyền và clinical gates
OTP 123456 không gửi SMS. Synthetic fixtures do người đánh giá chọn, không có server health records. Video và dịch vụ khám chưa kết nối backend; chỉ kiểm tra camera/micro khi người đánh giá chủ động yêu cầu và trình duyệt cấp quyền. Chuyển khoản chỉ tạo pending. Patient không có nút staff trong khung. Giá, ngân hàng, địa chỉ/hotline phòng khám, hoàn tiền, thuốc/hướng dẫn/xét nghiệm phải clinic approve. Không đưa thuốc hay chẩn đoán tạo sinh vào UI.

## Asset inventory
- Icon SVG: trích nguyên họ icon có sẵn từ prototype/app.js baseline, không đổi family.
- Be Vietnam Pro: google/fonts/ofl/bevietnampro (OFL.txt kèm).
- QR encoder: kazuhikoarase/qrcode-generator js/dist/qrcode.js, MIT license kèm vendor. Thư viện nhỏ vendored để mã xác nhận scan được, không dùng QR giả; không thêm network runtime/dependency manager package.
- Không có media/ảnh bệnh nhân bên ngoài hoặc tracking analytics.

## Platform limits
iOS/Android ở đây là browser presentation. Không có native permission, app push, SMS/Zalo delivery, camera test, VoiceOver/TalkBack/device evidence. Native pt/dp/sp, SDK/min OS và store submission ngoài phạm vi. DARK theme chỉ reference cũ, không phải chế độ đã triển khai.

## Reference layout decisions — 16/10/2026

- Trang chủ dùng vùng xanh chuyển sáng, lời chào nhỏ, thông điệp hai dòng và một lịch gần nhất. Các lịch còn lại mở từ Lịch hẹn. Nhóm tiện ích hai cột dùng chức năng có thật trong prototype, không thêm bác sĩ/chuyên khoa giả.
- Thanh điều hướng có 5 vùng bấm >=44px. Bốn tab giữ nhãn; nút tạo lịch là action có dấu + xanh nổi ở giữa, không phải một tab trống. Khi đang đặt lịch, nút này trở lại bước và nội dung đang nhập.
- Đặt lịch có 5 mục: người khám → lý do (bao gồm sàng lọc) → hình thức → ngày giờ → xác nhận. Các màn C3–C5 và guard an toàn vẫn độc lập.
- Card lịch có người khám, cụm ngày/giờ, hình thức, trạng thái và hành động mở phiếu. Phiếu D2 chia thông tin, tác vụ và lịch sử thành từng nhóm; lưới tác vụ chuyển một cột khi chữ lớn.
- Đã gửi yêu cầu: thông báo nhận yêu cầu màu xanh. Chờ xác nhận/xem xét: chip vàng có nhãn. Đã xác nhận: chip xanh lá có nhãn. Không dùng màu để thay cho chữ.
- Status bar trong frame desktop có SVG sóng, Wi-Fi và pin. Mobile dùng thanh hệ thống của thiết bị; không giả lập quyền hệ điều hành.
- Reviewer controls nằm ngoài viewport ứng dụng, có hàng riêng trên mobile để không che nút đăng nhập. Kiểm tra trực tiếp bằng click, không bỏ qua hit testing.

Nguồn quy trình: `uiux-ai-workspace` với flow `mobile-web-preview`, các skill mobile-app-design, mobile-navigation-and-state-ux và mobile-design-system-and-handoff. Thẩm quyền hiện tại: sửa local và browser QA; chưa publish bản thiết kế này.
# Doctor dashboard: object-specific card variants

The `/doctor` dashboard reuses canonical button/status/facts components and the existing journey model. Each surface has a distinct job:

| Variant / source owner | Content and action contract |
| --- | --- |
| Encounter workspace / `doctor-showcase.js` | Assigned patient, visit ID, appointment time, reason/history, actual draft completeness; continue encounter or open patient. A selector preserves access when multiple encounters remain open. |
| Decision brief / `doctor-journeys.js` | Request, reason, owner and saved handoff detail; filter doctor-owned/delegated/all; open the guarded review route. |
| Result register / `doctor-showcase.js` | Type/code, patient, record date and state; filter unread/waiting/reviewed; open exact result. Opening does not mark reviewed. |
| Appointment agenda / `doctor-showcase.js` | Search name/patient/visit ID without requiring accents; combine state/mode filters and time sort; contextual guarded action per row. |
| Online session / `doctor-journeys.js` | Appointment time/date, identity, reason, named connection state and owner; separate preparation from support/handoff. Ready appointment does not imply a connected call. |
| Accountable task / `doctor-journeys.js` | Category, patient, due date, owner, next step and exact destination; filter owner/status; doctor-owned tasks can complete/reopen; delegated tasks expose no completion control. |

`data-cf-component="tab" data-cf-variant="filter"` is a set of native toggle buttons with `aria-pressed`, not a tabpanel. `data-cf-component="appointment" data-cf-variant="agenda"` is a semantic table row that reflows into labelled records at800px. Filters restore focus/search caret after render and persist during hash navigation; they reset on reload. Clinical edits retain the existing session persistence.

Dashboard style ownership stays in `doctor-content-grid.css` (page topology) and `doctor-journeys.css` (object anatomy). Surfaces follow content height,14px corner radius and16px padding; existing brand/font/control sizes remain. Facts have at most two columns and stack when large text needs space. No new library, photo, chart or fake live metric is required.


## Card v2 shared contract (18/10/2026)

Canonical foundations: `design/tokens.css`, imported by `design/components.css`. Both patient and doctor reuse `CareFlowUI.card(content, classes, variant)` or `cardAttrs(variant)` for existing semantic templates. No DOM post-processor or parallel renderer. Only trusted markup is accepted as content; plain text is escaped by each existing renderer.

| Variant | Role | Composition |
|---|---|---|
| surface | Independent appointment, lab, profile or work surface | Opaque surface, hairline boundary,20px radius;16px patient/20px doctor padding |
| tonal | Administrative utility, private checklist or booking guidance | Paired muted surface/text, same padding; no decorative shadow |
| row | Repeated result, task or patient record | Divider and predictable alignment; no additional outer card |
| section | Section heading + its content | Transparent shell, no repeated border/padding |
| inverse | Reserved next-appointment composition | Navy plus white foreground; booking nav uses same brand emphasis |

Preserve existing `data-cf-component` for button/status/appointment/facts; `data-cf-card` owns surfaces only. Facts labels sit above values to avoid four competing narrow columns on mobile. Direct desktop section/card headings do not add a second layer of padding.

Patient `u.preparation[visitId]` and `u.visitNotes[visitId]` are session-only view data. No clinical transition, message or request is created by checking/typing. Logout clears these two stores. Calendar export contains appointment time and administrative code, excludes symptoms, private notes and patient name. `u.appointmentQuery` composes with existing mode/person filters and persists across reload.

Doctor followup filters are view state only; completion still checks owner==='Bác sĩ' in the original action. Real clinical state remains in each model, with no cross-app backend synchronization. Loading uses aria-busy only for genuine pending work; synchronous filtering has no fake spinner. For visual state contracts, see `card-design-rules.md` and browser `cards-v2.spec.cjs`/`ui-system.spec.cjs`.

Source-only gate: `node design/check-card-contract.cjs`. This reports remaining legacy composition hardcoding rather than claiming that the whole CSS tree has zero literals. Decorative hairline `--cf-line` is distinct from3:1 input boundary `--cf-input-line`. Native point/device and screen-reader verification remain separate from browser CSS pixels/axe.
