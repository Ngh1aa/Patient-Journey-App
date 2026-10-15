# CareFlow mobile — nghiên cứu 3 ảnh tham chiếu và Design Contract 2026

> Trạng thái: DESIGN HYPOTHESIS / browser prototype. Được nghiên cứu từ 3 ảnh người dùng cung cấp **App Mobile 7.png (lịch khám)**, **App Mobile 8.png (onboarding)** và **App Mobile 9.png (home)**, đối chiếu trực tiếp với mã `prototype/` trên main. Không phải kiểm chứng người dùng, không phải native app hoặc chứng nhận WCAG.

## 1. Nguồn chân lý, phạm vi, rủi ro

- Source of truth hành trình: `docs/screen-flow-matrix.md` (47 màn; F1–F12), `docs/13-patient-journey-source.md`, `prototype/model.js` (guards và transitions), `prototype/strings.vi.js` (copy), `prototype/views.js` và `prototype/app.js` (renderer/routing).
- Quy trình nghiên cứu: `Ngh1aa/uiux-ai-workspace/AGENTS.md`, `skills_UIUX/mobile-app-design/SKILL.md`, `mobile-web-preview/SKILL.md`, `design-reference-research-and-benchmark/SKILL.md`, `reference-extraction-and-design-audit/SKILL.md`, `visual-design-direction/SKILL.md`, `design-system-and-components/SKILL.md`. Bằng chứng nền và actual rendering phải tách bạch.
- Đây là **browser prototype**. Không đưa dữ liệu thật, đặt lịch thật, OTP/SMS thật, thu phí thật, video/nhận xét lâm sàng thật. Giữ trạng thái và hành động đúng nghĩa; không tạo bác sĩ, giá, địa chỉ, kết quả hoặc trạng thái đã xác nhận giả.
- Giữ Be Vietnam Pro self-hosted và kiến trúc HTML/CSS/JS hiện có. Phong cách ảnh thuộc loại **visual concept**; không chứng minh hiệu quả hay sao chép UX mù quáng.
- Ngữ cảnh: người bệnh và người thân, có thể căng thẳng, đọc trên màn 320–390px, dùng cỡ chữ lớn. Rõ ràng/đáng tin phải được ưu tiên trước glassmorphism.

## 2. Tách 3 mẫu thành nguyên lý (source → ADOPT / ADAPT / REJECT)

| Mẫu | Bằng chứng trực quan quan sát được | Chuyển giao | Không chuyển nguyên xi |
|---|---|---|---|
| 7 — Chọn lịch khám | Nền trắng, headline đen lớn 2 dòng; 1 card xám lớn R~60 trong ảnh kích thước 945px; card chân nổi trắng bán trong suốt; chip ngày/giờ xanh, CTA tròn đen, bookmark viền nét mảnh | ADOPT: layout phân lớp; phiếu lịch cần thời gian, địa điểm, người khám, trạng thái và hành động chính rõ. ADAPT: mô hình `visit-card` hiện có, không bịa bác sĩ | REJECT: khối ảnh bác sĩ giả / placeholder xám chiếm nửa card; text `Khoa Abc`, `Quận Abc`, ngày 2023; nút bookmark không có semantics; glass blur mạnh sau text |
| 8 — Onboarding | Nền xanh saturated + mảng tròn cùng tông; logo trắng; panel trắng lớn neo dưới; headline đen; action viên thuốc | ADOPT: branded blue surface/white bottom sheet ở entry. ADAPT: CareFlow thực tế dùng SĐT → OTP, không giả có đăng ký bằng luồng mới | REJECT: Lorem ipsum, hai CTA cạnh tranh, khoảng trống hero vô chức năng, câu `chưa có tài khoản? đăng nhập ngay` mâu thuẫn |
| 9 — Home | Nền xám gần #EFEFEF, lời chào/định danh, tiêu đề display lớn, search pill trắng, nhóm quick action pill, card grid và dock xám mờ | ADOPT: welcome, large type có nhịp, shortcut chức năng và dock nổi. ADAPT: nút tra cứu phải mở trang hợp lệ; shortcut theo IA app; compact home hero | REJECT: card trống xám như skeleton permanent, icon-only navigation, câu Good Morning cố định, tiêu đề chiếm phần lớn viewport, thiếu lịch sắp tới/action |

### Bảng màu trích từ ảnh (ảnh raster, không phải token gốc)

- Ảnh 8 có màu xanh bề mặt phổ biến gần **#0067FF** và một tông tròn sẫm gần **#0061F3** (pixel sampling); ảnh 7/9 dùng **#FFFFFF**, **#EFEFEF**, xám thẻ gần **#BCBCBC** và typography gần đen.
- Quyết định áp dụng là **bản thích nghi**, không copy chính xác mọi pixel. Primary tương tác đề xuất `#086BFF` (trên nền trắng; chữ trên nền xanh = trắng), brand hero `#086BFF`, page `#F2F2F3`, white `#FFFFFF`, ink `#171719`, muted `#5D626A`. Điều chỉnh để pass kiểm tra contrast theo từng pair.
- Medical semantic statuses (danger/warning/success) **không đổi thành màu xanh**; trạng thái phải có text icon/ngữ nghĩa đi kèm, dựa trên model.

## 3. Unified visual DNA

Tên hướng: **CareFlow Soft Minimal Healthcare**.

1. **Bold but readable**: display cỡ lớn dùng cho home/entry; utility/decision screen dùng H1 28–32px, không copy 70px từ ảnh concept.
2. **Airy and purposeful**: khoảng trắng theo nhịp 8/12/16/24/32; cụm action chính gần object liên quan; không để rỗng tạo khoảng cách giả.
3. **Rounded yet disciplined**: R~28 cho card, 22–24 cho chọn lựa, capsule/pill cho CTA & search, dock R999; radius thống nhất theo component role.
4. **Soft depth**: surface xám sáng + white panel, white stroke / inset highlight rất nhẹ; blur chỉ dùng dock hoặc overlay phi văn bản, không dùng sau nội dung lâm sàng dày.
5. **Single blue signature**: xanh cho CTA, selection, marker thực sự; xám/đen cho text và state mặc định. Black arrow circle chỉ là pattern phụ, không thay nhãn hành động.
6. **Trust and clarity**: không placeholder vĩnh viễn; không giấu nhãn nav; không giả link/search; địa điểm, ngày giờ, số người khám, kết quả được render từ state/copy.

## 4. Design token / component contracts

| Vai trò | Quyết định | Áp dụng |
|---|---|---|
| Brand / action | `#086BFF`; hover `#0055DC`; text white | PrimaryButton, selected slot, indicator |
| Page / surface | `#F2F2F3` / `#FFFFFF`; panel gray `#EDEDEF` | Home hero, cards, forms, screens |
| Typography | Be Vietnam Pro 400/600/700; H1 utility 28–32, display home 36–42, section 19–21, body 16, label 14 | All 47 screens; override by font-scale for large text |
| Text | ink `#171719`, secondary `#555B63` | Header, data, labels; no low contrast light-gray action |
| Geometry | card 28–32, field/choice 18–22, CTA 999, dock 999; minimum hit 44 | Existing shared CSS owners |
| Motion | subtle 120–180ms; reduced-motion respects OS | Controls, focus, hover |
| Keyboard/accessibility | visible focus; readable 200% font; inputs ≥ 16px; label nav visible; no horizontal overflow at 320/360/390; voice/QR/backend simulated | Form fields, nav, action sheets, dialogs |

Semantic-pair rule: mỗi surface nền tối có text/icons sáng tương ứng; mọi state hover/active/disabled phải kiểm computed foreground và background. Không đổi màu warning/danger/success một cách trang trí.

### Component-specific anatomy

- `AppShell`: giữ hash navigation, Back, disclosure giới hạn bản demo; status/toolbar không che critical CTA; desktop centered phone, mobile full viewport + safe area.
- `AppointmentCard`: mode + `time` lớn + date + patient + status trong panel phân lớp, với full-card click; không hiển thị tên bác sĩ chưa có trong dữ liệu.
- `WelcomeHome`: greeting/tên, personalized question, tra cứu hợp lệ, shortcut đến lịch sử/tư vấn/hỗ trợ; lịch sắp tới và nút đặt lịch phải ở vị trí dễ tìm.
- `PrimaryButton`: text là bắt buộc (trừ icon button có aria-label); primary brand + secondary white stroke; 52–56px.
- `BottomNavigation`: 4 điểm đến hiện có (Trang chủ / Lịch hẹn / Hồ sơ / Hỗ trợ), với **nhãn luôn hiển thị**; selected có cả text và bg. 5 icon trong mẫu chỉ là minh họa.
- `Form/Choice/Slot`: trắng + border rõ, selected blue outline/tint, focus visible; giữ validation và recovery của model.
- `Risk/Medical/Payment`: alert giữ semantic red/amber; các trạng thái request/pending/paid không đánh tráo.

## 5. Page-role composition matrix

| Roles / IDs | Câu hỏi người dùng | First anchor / anatomy | CTA chính |
|---|---|---|---|
| Entry A1–A3 | Bắt đầu/khôi phục hồ sơ thế nào? | Blue brand hero + white authentication/profile sheet; không giả onboarding đã hoàn thành | Nhận mã / Xác nhận / Tạo hồ sơ |
| Home B1 | Tiếp theo tôi cần làm gì? | Welcome + search/shortcuts, sau đó upcoming appointment + next step | Đặt lịch khám |
| Booking C1–C9 | Tôi đặt cho ai, khi nào, phù hợp không? | Utility headline + context + progressive choice/date/slot + confirmation | Tiếp tục / Gửi yêu cầu |
| Appointments D1–D4 | Lịch và trạng thái nào? | Filter pills + appointment cards + detail panel/QR | Xem / Đổi / Hủy |
| Visit preparation E1–E3 | Trước và khi đến phải làm gì? | Task/timeline + status + next-action | Xác nhận đến |
| Labs F1–F4 | Chỉ định nào, kết quả ở đâu? | Lab status/data cards + action | Chọn / Đính kèm |
| Online G1–G5 | Kết nối và khôi phục ra sao? | Preflight/queue/call states; media-specific dark surface exception | Vào phòng / Thử lại |
| Completion/payment H1–H7 | Đã thanh toán/kết quả chưa? | Progress, amount/status evidence, receipt/results | Thanh toán hoặc xem chi tiết |
| Care I1–I5 | Tôi nhờ ai hỗ trợ? | Context + message/action forms, urgency guard | Gửi |
| Rebook/followup J1 | Có cần tái khám? | Linked visit context, available slot decision | Đặt lịch |
| Account/support K1–K5 | Tôi tìm thông tin hoặc hỗ trợ ở đâu? | Person cards, notice list, settings, contact | Xem / Liên hệ |

Các role dùng **chung tokens/components, khác composition theo việc phải làm**; không biến 47 trang thành cùng 1 hero card trống.

## 6. Existing-state audit / ưu tiên sửa

Qua source inspection trên main (chưa phải QA render):
- CSS đã có một đuôi `/* 2026 visual refresh — inspired by App Mobile 7/8/9 */` chủ yếu override; cần thay bằng design contract có tokens, semantic states và responsive gates.
- B1 vẫn chứa `Good Morning,` cố định, `dashboard-search` là `div role=search` **không có interaction**, hai quick-action cùng trỏ đến support, gây sai kỳ vọng.
- `.visit-card::before` là khối gradient xám giả-placeholder, có thể che text/thiếu chứng cứ từ dữ liệu bác sĩ; remove.
- `.bottom-nav a span { display: none }` khiến 4 icon điều hướng mất nhãn; trong healthcare không nên áp dụng ảnh icon-only.
- Không có onboarding mới độc lập trong registry; A1 là OTP entry; chỉ có thể diễn giải visual blue hero trên chính flow A1.
- `Be Vietnam Pro`, 44px targets, states/guards và 47 route đã tồn tại nên **giữ nguyên**; không thay bằng static screenshot.

## 7. Verification plan / không tuyên bố quá mức

- [ ] Code/syntax, tests model, contrast, full E2E Playwright theo `prototype/package.json`.
- [ ] Screenshot actual at 320/360/390/430 and desktop 1440, typography normal/200%, scroll/keyboard/safe area.
- [ ] All 47 route elementary visual sanity; 5 representative families: auth, home, booking, visit card, medical/online.
- [ ] All focus/hover/disabled/selected/empty/error/success, zero content hidden behind dock, zero fake CTA.
- [ ] Human/native/clinical approval remain UNKNOWN/NOT_RUN until specifically supplied.

### Phạm vi triển khai
Nhánh này thay đổi **visual system + thực chức năng vài shortcut + trình bày**; giữ nguyên business model/permissions và giả lập đã ghi trong docs. Không tự merge/main hoặc khẳng định deployment đã cập nhật trước khi có CI/browser evidence.
