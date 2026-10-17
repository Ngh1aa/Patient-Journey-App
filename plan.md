# CareFlow+ Cards V3 — Plan redesign toàn bộ card

## Mục tiêu

Thiết kế lại toàn bộ card của prototype bệnh nhân (`prototype/`) và workspace bác sĩ (`staff-prototype/`) trên nhánh `redesign/cards-v2`. Mục tiêu trực tiếp là giảm cảm giác trống trải, giảm chữ thừa, sửa phối màu nhạt/không đồng nhất và đưa các card về đúng thứ bậc hành động. Không đổi flow nghiệp vụ, dữ liệu mô phỏng, quyền truy cập hoặc các cảnh báo an toàn.

## Bằng chứng nghiên cứu và quyết định chuyển hóa

- **Apple HIG — Lists and tables**: row/list phù hợp cho dữ liệu đồng loại; copy trong mỗi row phải ngắn để dễ đọc và scan, nội dung dài nên mở ở detail view. Áp dụng: lịch hẹn, kết quả, công việc và danh sách hồ sơ dùng compact list row; card chỉ giữ title, metadata cốt lõi, status và action kế tiếp.
- **Apple HIG — Buttons**: vùng chạm tối thiểu 44×44 pt, custom button cần press state, chỉ nên có một hoặc hai action nổi bật trong một view. Áp dụng: mỗi card tối đa một primary CTA; CTA phụ chuyển thành secondary/tertiary có icon; mọi nút có hit-area và pressed/focus rõ.
- **Material Design 3 — Cards**: card dùng để gom một chủ đề với hierarchy rõ giữa media/title/supporting text/action; elevated, filled và outlined là các mức nhấn khác nhau. Áp dụng: hero navy chỉ cho việc quan trọng nhất; surface trắng cho dữ liệu; tint xanh cho nhóm phụ; outlined cho lựa chọn; không dùng cùng một kiểu card cho mọi loại dữ liệu.
- **Nielsen Norman Group — Cards: UI-Component Definition**: card phù hợp cho nhóm thông tin ngắn, liên quan, thường khác loại và cần summary/link; không nên dùng như một lớp trang trí thay cho list. Áp dụng: rút gọn contextual tile thành một câu lợi ích + một hành động; bỏ paragraph giải thích khỏi card và đưa vào disclosure/detail.
- **W3C WCAG 2.1 SC 1.4.3 / 1.4.10**: chữ thường tối thiểu 4.5:1, nội dung phải reflow ở 320 CSS px không mất thông tin hoặc action. Áp dụng: token hóa màu chữ/status, không dùng opacity để làm nội dung khó đọc; card desktop chuyển cột; mobile 320px chuyển grid thành list và không ép ellipsis với cảnh báo lâm sàng.

## Art direction đã chọn

**Calm Clinical / compact editorial**: nền xanh xám rất nhạt, surface trắng, navy `#001D57` làm anchor, một màu tint xanh làm grouping và trạng thái chỉ xuất hiện khi có nghĩa. Card nổi bằng viền + shadow nhẹ, không dùng nhiều gradient hoặc ảnh trang trí trong các màn tác vụ.

### V4 reset sau review giao diện

Các lớp visual cũ tạo cảm giác card bị ghép từ nhiều hệ thống: nhiều radius, nhiều accent xanh, panel/card/list cùng có shadow và copy cạnh tranh nhau. V4 không tiếp tục chỉnh từng màu lẻ; `design/cards-v2.css` được dùng như lớp cuối để reset toàn bộ card family về cùng anatomy: surface, list-row, choice, empty, alert và hero. Các nhóm dữ liệu lặp được ép về row density; ảnh chỉ còn giữ ở hero/context card, không dùng để trang trí cho task card.

### Nguyên tắc thị giác

1. Một section có một header và một container; container có rhythm rõ, không để card rời.
2. Mỗi card có một chủ đề, một dữ liệu chính, metadata ngắn và một next action.
3. Giảm copy theo công thức `label ngắn → giá trị → trạng thái → action`; paragraph dài chuyển thành disclosure.
4. Phân cấp bằng nền và spacing, không bằng nhiều màu accent.
5. Hero chỉ xuất hiện ở Home/next appointment; list row dùng cho dữ liệu lặp; bento chỉ dành cho shortcut.
6. Desktop bác sĩ ưu tiên công việc hiện tại, quyết định cần xử lý, kết quả chưa xem và lịch trong ngày; không thêm hero marketing/stat giả.

## Phạm vi triển khai theo wave

### Wave A — Foundations và Home

- Đồng bộ `design/cards-v2.css` với `design/tokens.json`.
- Chốt 5 card variants: hero, surface, tint, list-row, alert.
- Rút gọn Home: appointment hero, 3 metric, quick actions 2×2, task list và aftercare.
- Loại bỏ duplicate CTA và các tile chỉ có icon + đoạn mô tả.

### Wave B — Patient journey và appointment flow

- Chuẩn hóa C1–C9, D1–D4, E1–E3 thành choice/list/status card theo đúng nhiệm vụ.
- Tabs Sắp tới/Đã khám/Đã hủy dùng compact segmented control; empty state có copy riêng và CTA nhẹ.
- Facts list dùng label/value hai cột ở mobile rộng, một cột ở 320px/large text.
- Giữ nguyên danger/safety card và 115, chỉ cải thiện hierarchy không làm mờ cảnh báo.

### Wave C — Lab, online care, aftercare và support

- Chuyển lab/result/prescription thành list row 72–88px.
- Tách status khỏi explanatory copy; status luôn có text + icon/shape, không dựa màu.
- Checklist, upload, payment và online preflight dùng task card ngắn với trạng thái rõ.

### Wave D — Doctor desktop

- Dùng cùng token và semantic variants nhưng giữ topology dashboard nhiều cột.
- Chuẩn hóa encounter, decision, result, agenda, online handoff và follow-up thành các surface có density đồng nhất.
- Giảm decorative/stat card; mỗi row giữ patient, visit/time, status, owner và action.

## Acceptance và giới hạn

- Không merge vào `main`; commit theo từng wave trên `redesign/cards-v2`.
- Chạy localhost và inspect mobile 320/375/390px, desktop 1280px, large-text.
- Pass syntax/model/card token checks trước mỗi commit.
- Visual QA đầy đủ 47 màn và native iOS/Android vẫn là UNKNOWN vì đây là browser prototype; không tuyên bố clinical approval hoặc user research.
