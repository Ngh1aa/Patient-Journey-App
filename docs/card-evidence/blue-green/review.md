# Design System xanh dương / xanh lá — 19/10/2026

Mốc: **bước2, chờ người dùng duyệt**. Xem `/design/preview.html`. Đây là3 khung component, không phải3 màn sản phẩm đã triển khai. Chưa làm Home và các màn tiếp theo; không đổi model, data hay route guards. Nhánh `redesign/cards-v2`; chưa commit/push/merge đợt sửa này.

## Sáu sửa đổi và anatomy

1. Section header: “Xem tất cả” là link thật đến route, navy+arrow, không background/pill; vùng chạm44px.
2. Hồ sơ: avatar initials từ tên thật trong fixture xếp chồng cạnh số lượng, disclosure mở danh sách. Hỏi phòng khám: hai câu hỏi gợi ý mở ô soạn có thể sửa, xem trước bằng textContent và đóng; ghi rõ chưa gửi, không lưu session hay gửi mạng.
3. Bộ hình: viewBox200×180, nét2.5, blue/green backplate và giấy trắng có viền. Slot cố định128px (120px beside text),160px empty; mọi shape trong viewBox và hình nằm trong inset thẻ. Không có photo stock hoặc cắt ghép. Nguyên nhân hình cũ như mất nét là white-on-white không outline, không phải cần cắt thêm.
4. Primary#0B1220/white; body trên pastel navy hoặc#1F2A44. Chữ phụ chỉ trên nền sáng.20 cặp exact được đo từ computed styles; canvas chuẩn hóa màu color-mix của loading thành RGB trước tính relative luminance.
5. Locked xám+icon khóa/no shadow, busy nền primary pha10%white+white text+spinner. Loading thay default, không thêm primary thứ2. Chữ không bị làm mờ cùng background.
6. Mỗi khung tối đa1 primary. Khung1 không có booking CTA, khung2 chỉ+secondary blue, khung3 chỉ1 entry khi rỗng. Candidate không lặp booking trong welcome/quick/banner. Sản phẩm cũ có4 content entries ởB1 còn chờ Home approval.

Các card không dùng chung một mẫu: appointment có status/date/time/ID/action; profile là identity stack+disclosure; question là entry cho ô soạn; guide là checklist tương tác với hình đặt bên trái; completed là file/context/action; empty có hình lớn, mô tả và next action. Shared tokens/surface vẫn tái sử dụng. Checklist chỉ tự nhắc trong specimen, không cập nhật bệnh án hoặc gửi phòng khám.

## Contrast — số liệu từng cặp

Nguồn máy đọc: [contrast.json](contrast.json). Các giá trị thập phân dưới đây làm tròn để hiển thị; test so với ngưỡng bằng số gốc, không làm tròn. Yêu cầu normal≥4.5:1, large≥3:1; tất cả các cặp ở đây vượt4.5. Chưa phải chứng nhận toàn bộ WCAG/native iOS.

| Chữ / nền | Màu chữ | Màu nền được resolve | Tỉ lệ |
|---|---|---|---:|
| Navy / trắng |#001D57|#FFFFFF|15.989:1|
| Body ink / trắng |#1F2A44|#FFFFFF|14.257:1|
| Secondary / trắng |#5B6B8C|#FFFFFF|5.348:1|
| Secondary / nền màn |#5B6B8C|#F5F8FD|5.024:1|
| Primary label / primary |#FFFFFF|#0B1220|18.723:1|
| Loading label / primary pha10%trắng |#FFFFFF|#232A36|14.424:1|
| Locked label / gray surface |#5B667B|#EEF1F5|5.104:1|
| Navy / baby blue |#001D57|#CFE2FF|12.164:1|
| Body ink / baby blue |#1F2A44|#CFE2FF|10.846:1|
| Navy / blue deep |#001D57|#B9D4FF|10.602:1|
| Body ink / blue deep |#1F2A44|#B9D4FF|9.454:1|
| Navy / mint |#001D57|#CDEFE4|12.992:1|
| Body ink / mint |#1F2A44|#CDEFE4|11.584:1|
| Navy / mint deep |#001D57|#B5E6D3|11.592:1|
| Body ink / mint deep |#1F2A44|#B5E6D3|10.336:1|
| Success / success surface |#176044|#CDEFE4|6.109:1|
| Pending / pending surface |#754700|#FFE9CC|6.690:1|
| Cancelled / danger surface |#A32632|#FFE3E3|6.023:1|
| Info / info surface |#001D57|#CFE2FF|12.164:1|
| Neutral / neutral surface |#5B6B8C|#F5F8FD|5.024:1|

Mesh uses blue/green/white stops only; pairing navy/ink against every pastel extreme avoids relying on one arbitrary sampled point in a gradient. Source labels “Lịch hẹn tiếp theo”, visit ID and gradient descriptions inherit navy/ink; metadata is not rendered in white or secondary gray over mesh. Orange/red are semantic states only, each with icon and text. No purple/peach decoration remains in the candidate token/component/illustration owners.

## QA scope và artifacts

- Playwright candidate:28 checks across Chromium/WebKit,360/390/768/1440; large text200%, native/ARIA selection, keyboard tabs,4-step bounds, recoverable error, isolation from patient session, profile disclosure, quick draft, primary budget/color, link appearance, outlined artwork/viewBox/slot, visible insets and44px targets. [Final verified results](final-results.json).
- Axe WCAG2A/AA/2.1AA:0 violations on the component page for empty/loading/error/ready states in both engines. Not every product route/state; no native screen-reader certification.
- Syntax: project npm run check and design/preview.js checked; source contract4 checks PASS; no raw colors in shared component CSS. [Source contract](source-contract.json). Legacy styles still contain literals; not globally migrated before approval.
- Initial test run:8 inset false positives because the query included the newly hidden composer paragraph with a zero bounding box. Fixed the geometry test to inspect visible nodes, and separately checked the composer after opening it. Initial [results](foundations-results.json) preserved; follow-up [results](foundations-final-results.json) and final verified run are separate artifacts. Did not hide a product defect with CSS.
- Visual review then caught a real200% defect: the stepper's intrinsic width expanded its grid parent and clipped the descriptive text/actions under the card's overflow boundary. Fixed min-width/max-width on card grid children and min-width on the stack owner; only the stepper itself scrolls. Added large-text card-boundary checks for headings/paragraphs/metadata/actions, excluding the deliberately scrollable controls. [Earlier passing run before that stronger check](verified-results.json) is not the final acceptance evidence.
-11 actual captures plus [capture metrics](capture-report.json): [desktop](components-1440.png), [mobile card column](card-column-390.png), [profile and draft expanded](profile-question-390.png), [loading vs locked](loading-locked-column.png), [focus/nav](focus-navigation-column.png), [empty/error](error-column.png), [200% cards](card-column-360-large.png), [200% navigation](navigation-360-large.png), and full360/390/768. No page error or page overflow in the captured scope. Visual review includes mobile, large-text, error and loading states.
- 200% preserves the single line of tabs/stepper with local scrolling, not smaller fonts; bottom navigation adapts for large labels. Normal360/390 shows the whole4-step row. Source model/clinical flows unchanged; full product migration remains OPEN.

## Checklist7 dấu hiệu trên ảnh

Scope:3 specimen frames, `/design/preview.html`,360/390/1440, default/error/empty/loading and360 large text. Do not apply these conclusions to47 unchanged product screens.

| Dấu hiệu | Kết luận | Vị trí, vai trò và bằng chứng |
|---|---|---|
| AI-01 neon cạnh tranh |không xuất hiện|[Desktop](components-1440.png): header/hero blue, guide mixed blue-green, completed green. Không high-chroma/neon surfaces; black primary giữ ưu tiên, semantic colors chỉ gắn trạng thái |
| AI-02 dark/glow |không xuất hiện|Không dark-mode/glow/bloom trong3frame. Black chỉ là primary control, không dark card. Shadow nhẹ phân lớp nav/frame; không ngụ ý live/health |
| AI-03 emoji thay icon |không xuất hiện|Nút/nav/badge dùng SVG registry; illustration cùng nét/token. Avatar initials chỉ nhận diện hồ sơ, không thay action icon |
| AI-04 purple-gradient mặc định |không xuất hiện|Không lavender/peach trong candidate token/art. Gradient blue định hướng header/appointment, green nhấn completed, mixed nhấn preparation; chỉ2 vệt, không tuyến tính. Vai trò và contrast nêu trong bảng20 cặp |
| AI-05 mọi block cùng khuôn card |có mục đích rõ|[Mobile](card-column-390.png): appointment facts, profile stack/disclosure, suggested questions và guide checklist khác anatomy; [draft expanded](profile-question-390.png) là form riêng. Surface dùng chung để nhất quán; không nested shell cho mỗi đoạn |
| AI-06 rainbow sidebars |không xuất hiện|Tab/nav/guide không có nhiều thanh màu cạnh trái. Selected state có ARIA+label. [Navigation](focus-navigation-column.png) |
| AI-07 status không nguồn |có mục đích rõ|Header unread đọc notifications fixture; badges dùng CareFlowUI.status/strings. Specimen liệt kê nhiều variant rõ ràng, không giả clinician online. [Loading/locked](loading-locked-column.png) là hai trạng thái control; spinner không được dùng như kết quả gửi thành công |

## Còn lại / điểm cần người dùng duyệt

1. Chờ duyệt palette, button states, card anatomy và artwork ởDesign System. Sau đó dựng Home rồi dừng tiếp để xem; không bỏ mốc này vì browser checks xanh.
2. B1 booking duplicate,00 vàảnh stock vẫn tồn tại trong app cũ; xử lý khi duyệt Home. Tiếp theo: Lịch hẹn → Đặt lịch4bước → Phiếu khám → Hồ sơ → Hỗ trợ → Lịch sử → Cài đặt. Clinical/safety branches và các canonical screens giữ nguyên.
3. Primary/booking budget, section links, image strategy, status states của từng màn vẫn OPEN trong [audit](../../card-audit.md).47seeded fixtures không bao phủ toàn bộ long/offline/error combinations. Không tự áp bento vào cảnh báo cấp cứu, cuộc gọi hay form ngắn.
4. Legacy style/token proposals chưa chuyển đồng loạt; runtime mới dùng CSS variables opt-in. Native iOS/VoiceOver và thử usability với người dùng thật chưa kiểm.

Khởi động local từ thư mục repository khi cần:

```powershell
$env:PORT='4186'
node prototype/preview-server.cjs
```

Local: `http://127.0.0.1:4186/design/preview.html`. Report dùng ngày client19/10/2026; timestamps trong browser JSON lấy từ clock host UTC.
