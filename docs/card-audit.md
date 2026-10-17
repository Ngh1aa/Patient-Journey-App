# CareFlow+ — Card audit (snapshot **TRƯỚC** thiết kế lại)

Ngày audit: 2026-10-17. Chụp source tại main `257c8989bf8aaf9a0c73f89e56231547e1452a2f` và nhánh `redesign/cards-v2` trước khi chỉnh UI. Căn cứ `docs/screen-inventory.json` (47 màn), `prototype/views.js`, `prototype/careflow-rich-content.js`, `prototype/careflow-experience.js`, `staff-prototype/app.js`, `staff-prototype/doctor-showcase.js`, `staff-prototype/doctor-journeys.js`, `staff-prototype/supporting.js` và thiết kế tham khảo do người dùng gửi.

> **Phạm vi:** Bảng liệt kê card theo **component pattern/slot per screen**, kể cả card render có điều kiện; không đếm các **instance** sinh lặp theo số lượt khám. Các hàng `Render pattern` là kiểm kê tĩnh invocation bổ sung, không có nghĩa từng invocation là card độc lập ngoài DOM. Các thẻ nhiều trạng thái cần audit trình duyệt sau khi render — `UNKNOWN` cho đến QA. Desktop công khai là **doctor-only**; các route lễ tân cũ là redirect, không sửa thành role mới.

### Định nghĩa severity

- **P0** — an toàn/sàng lọc, quyền truy cập, nghiệp vụ bác sĩ, payment/call, unread clinical hoặc lỗi thông tin quan trọng.
- **P1** — readability, hierarchy, content không hữu ích, CTA và mật độ trên màn quan trọng.
- **P2** — chuẩn hóa token/spacing, states chưa có nguồn kích hoạt, phụ trợ.

### Ma trận kiểm kê card theo screen/pattern

| Màn hình | Tên card | Loại | Vấn đề (trước) | Mức ưu tiên | File tạo card | Trạng thái sau |
|---|---|---|---|---|---|---|
| A1 — Đăng nhập (SĐT và OTP) | Đăng nhập/OTP | Form container | Label và phản hồi lỗi cần thống nhất | P2 | views.js + rich-content.js | **Chưa sửa** |
| A2 — Xác nhận hồ sơ cũ | Xác nhận hồ sơ tìm thấy | Profile selection | Thiếu contract empty/error/loading | P2 | views.js + rich-content.js | **Chưa sửa** |
| A3 — Tạo hồ sơ bệnh nhân | Tạo hồ sơ mới | Form container | Số liệu hỗ trợ và hướng dẫn chưa chuẩn | P2 | views.js + rich-content.js | **Chưa sửa** |
| B1 — Trang chủ | Lịch khám kế tiếp | Hero | Khối thông tin và hành động cần phân tầng | P1 | views.js + rich-content.js | **Chưa sửa** |
| B1 — Trang chủ | Tổng quan chăm sóc | 3-metric | Số liệu 03/02/00 và cách hiển thị zero chưa đồng bộ | P1 | views.js + rich-content.js | **Chưa sửa** |
| B1 — Trang chủ | Truy cập nhanh | Bento | Icon-only + caption nhỏ; nhãn Đặt lịch trùng hành động | P1 | views.js + rich-content.js | **Chưa sửa** |
| B1 — Trang chủ | Việc cần làm | Task/list | Thẻ có độ dài và CTA chưa đồng đều | P1 | views.js + rich-content.js | **Chưa sửa** |
| B1 — Trang chủ | Chăm sóc sau khám | Aftercare | Dữ liệu summary chưa liên kết nhất quán | P1 | views.js + rich-content.js | **Chưa sửa** |
| B1 — Trang chủ | Cẩm nang đi khám | Editorial tiles | Tối đa hai dòng, thiếu states contract | P1 | views.js + rich-content.js | **Chưa sửa** |
| B1 — Trang chủ | Cần giúp? | Help banner | CTA lặp dễ tạo nhiễu | P1 | views.js + rich-content.js | **Chưa sửa** |
| B1 — Trang chủ | Phụ trợ · Tiện ích dành cho bạn | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| C1 — Ai đi khám | Chọn người đi khám | Patient carousel | Thông tin ngày sinh/quyền cần rõ ràng | P2 | views.js + rich-content.js | **Chưa sửa** |
| C1 — Ai đi khám | Phụ trợ · Chọn đúng người đi khám | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| C2 — Lý do khám và triệu chứng | Lý do khám | Form card | Nhiều section nhỏ, thiếu container đồng nhất | P2 | views.js + rich-content.js | **Chưa sửa** |
| C2 — Lý do khám và triệu chứng | Phụ trợ · Giúp bác sĩ hiểu rõ hơn | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| C3 — Dấu hiệu nguy hiểm | Sàng lọc nguy hiểm | Safety alert | P0, không làm mờ cảnh báo để đạt thẩm mỹ | P0 | views.js + rich-content.js | **Chưa sửa** |
| C4 — Khuyến cáo nhập viện, cấp cứu | Khuyến cáo cấp cứu | Danger card | P0, giữ nguyên đường cấp cứu 115 | P0 | views.js + rich-content.js | **Chưa sửa** |
| C5 — Phòng khám xác nhận hình thức khám | Kiểm tra hình thức khám | Status/review | Trạng thái đang chờ cần dễ hiểu | P2 | views.js + rich-content.js | **Chưa sửa** |
| C5 — Phòng khám xác nhận hình thức khám | Phụ trợ · Điều gì diễn ra tiếp theo? | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| C6 — Chọn hình thức khám | Khám trực tiếp / trực tuyến | Choice cards | Chú thích lợi ích còn chung chung | P2 | views.js + rich-content.js | **Chưa sửa** |
| C6 — Chọn hình thức khám | Phụ trợ · Chọn hình thức phù hợp | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| C7 — Chọn ngày giờ | Lịch ngày và giờ | Slot grid | Các slot cần hit-area ≥44 | P2 | views.js + rich-content.js | **Chưa sửa** |
| C7 — Chọn ngày giờ | Phụ trợ · Trước khi chọn giờ | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| C8 — Kiểm tra và gửi yêu cầu | Thông tin xác nhận | Facts list | Đã có sửa xuống dòng, cần chuẩn hóa token và nhãn | P1 | views.js + rich-content.js | **Chưa sửa** |
| C8 — Kiểm tra và gửi yêu cầu | Render pattern · 1 card() / 0 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| C8 — Kiểm tra và gửi yêu cầu | Phụ trợ · Sau khi gửi yêu cầu | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| C9 — Đã gửi, Phiếu khám | Phiếu khám vừa gửi | Ticket/status | Tình trạng đặt lịch ≠ đã xác nhận | P1 | views.js + rich-content.js | **Chưa sửa** |
| C9 — Đã gửi, Phiếu khám | Render pattern · 1 card() / 0 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| C9 — Đã gửi, Phiếu khám | Phụ trợ · Bạn có thể làm ngay | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| D1 — Lịch hẹn | Sắp tới/Đã khám/Đã hủy | Segmented status | Mật độ/tên tab/counter cần nhất quán | P1 | views.js + rich-content.js | **Chưa sửa** |
| D1 — Lịch hẹn | Lịch hẹn trống | Empty state | CTA đặt lịch lặp trên tab Đã hủy; copy cần đúng bối cảnh | P1 | views.js + rich-content.js | **Chưa sửa** |
| D1 — Lịch hẹn | Danh sách lịch hẹn | Appointment list | Tối ưu việc tìm theo bác sĩ/ngày/giờ | P1 | views.js + rich-content.js | **Chưa sửa** |
| D1 — Lịch hẹn | Phụ trợ · Quản lý dễ dàng hơn | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| D2 — Phiếu khám (chi tiết lượt khám) | Trạng thái lượt khám | Status hero | Các trạng thái có thể chuyển cần phân cấp | P1 | views.js + rich-content.js | **Chưa sửa** |
| D2 — Phiếu khám (chi tiết lượt khám) | Phiếu khám/mã QR | Ticket | Nhiều nội dung cạnh tranh CTA | P1 | views.js + rich-content.js | **Chưa sửa** |
| D2 — Phiếu khám (chi tiết lượt khám) | Render pattern · 2 card() / 2 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| D3 — Đổi lịch | Đổi lịch | Facts/action | Thiếu nhóm card quyết định mới | P2 | views.js + rich-content.js | **Chưa sửa** |
| D3 — Đổi lịch | Render pattern · 1 card() / 0 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| D3 — Đổi lịch | Phụ trợ · Cần lưu ý | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| D4 — Hủy lịch | Hủy lịch | Danger review | Hành động nguy hiểm phải xác nhận | P0 | views.js + rich-content.js | **Chưa sửa** |
| D4 — Hủy lịch | Phụ trợ · Trước khi quyết định | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| E1 — Chuẩn bị trước khi đến | Chuẩn bị trước khám | Checklist | Checklist trạng thái session-local | P2 | views.js + rich-content.js | **Chưa sửa** |
| E1 — Chuẩn bị trước khi đến | Render pattern · 1 card() / 0 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| E1 — Chuẩn bị trước khi đến | Phụ trợ · Sẵn sàng cho lịch hẹn | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| E2 — Báo đã đến | Check-in / QR | QR/status | QR không đồng nghĩa đã tiếp nhận | P2 | views.js + rich-content.js | **Chưa sửa** |
| E2 — Báo đã đến | Render pattern · 1 card() / 0 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| E2 — Báo đã đến | Phụ trợ · Sau khi báo đã đến | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| E3 — Theo dõi lượt khám | Hàng chờ | Queue card | Thông tin lượt/next action cần nổi bật | P2 | views.js + rich-content.js | **Chưa sửa** |
| E3 — Theo dõi lượt khám | Render pattern · 1 card() / 2 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| E3 — Theo dõi lượt khám | Phụ trợ · Giữ thông tin trong tầm tay | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| F1 — Xét nghiệm, chụp chiếu | Danh sách chỉ định | Lab list | List items thiếu category owner trạng thái | P2 | views.js + rich-content.js | **Chưa sửa** |
| F1 — Xét nghiệm, chụp chiếu | Render pattern · 0 card() / 0 section() / 1 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| F1 — Xét nghiệm, chụp chiếu | Phụ trợ · Cần chuẩn bị đúng hướng dẫn | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| F2 — Chi tiết chỉ định | Chi tiết chỉ định | Result detail | Thuật ngữ và cảnh báo cần tách rõ | P2 | views.js + rich-content.js | **Chưa sửa** |
| F2 — Chi tiết chỉ định | Render pattern · 3 card() / 1 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| F2 — Chi tiết chỉ định | Phụ trợ · Hiểu kết quả theo đúng ngữ cảnh | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| F3 — Đặt hẹn xét nghiệm | Lịch xét nghiệm | Slot/choice | Thiếu phân tầng trạng thái lịch | P2 | views.js + rich-content.js | **Chưa sửa** |
| F3 — Đặt hẹn xét nghiệm | Phụ trợ · Trước ngày hẹn | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| F4 — Đính kèm kết quả | Đính kèm kết quả | Document upload | Privacy note/hit area | P2 | views.js + rich-content.js | **Chưa sửa** |
| F4 — Đính kèm kết quả | Phụ trợ · Bảo vệ thông tin cá nhân | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| G1 — Chuẩn bị khám online | Kiểm tra thiết bị | Preflight/checklist | Thiếu tương phản trạng thái từng bước | P2 | views.js + rich-content.js | **Chưa sửa** |
| G1 — Chuẩn bị khám online | Render pattern · 1 card() / 0 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| G1 — Chuẩn bị khám online | Phụ trợ · Sẵn sàng kết nối | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| G2 — Chờ bác sĩ gọi | Phòng chờ online | Wait/status | Cần thời gian/đường hỗ trợ | P2 | views.js + rich-content.js | **Chưa sửa** |
| G2 — Chờ bác sĩ gọi | Render pattern · 1 card() / 0 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| G2 — Chờ bác sĩ gọi | Phụ trợ · Không bỏ lỡ cuộc gọi | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| G3 — Bác sĩ đang gọi | Cuộc gọi đến | Live-call | Không áp đặt thông tin trang trí | P0 | views.js + rich-content.js | **Chưa sửa** |
| G4 — Đang khám online | Đang gọi | Live-call | Không áp đặt thông tin trang trí | P0 | views.js + rich-content.js | **Chưa sửa** |
| G5 — Chưa liên hệ được | Không liên hệ được | Recovery | Trình tự liên hệ lại/hỗ trợ | P2 | views.js + rich-content.js | **Chưa sửa** |
| G5 — Chưa liên hệ được | Phụ trợ · Bạn vẫn có cách tiếp tục | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| H1 — Buổi khám đã hoàn tất | Khám hoàn tất | Completion hero | CTA tiếp theo chưa mạnh | P2 | views.js + rich-content.js | **Chưa sửa** |
| H1 — Buổi khám đã hoàn tất | Render pattern · 1 card() / 0 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| H1 — Buổi khám đã hoàn tất | Phụ trợ · Giữ lại thông tin cần thiết | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| H2 — Thanh toán | Tình trạng phí | Payment facts | Phân biệt thanh toán và xác nhận | P0 | views.js + rich-content.js | **Chưa sửa** |
| H2 — Thanh toán | Render pattern · 1 card() / 0 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| H2 — Thanh toán | Phụ trợ · Kiểm tra trước khi trả | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| H3 — Thanh toán sau | Thanh toán sau | Payment status | Tránh giả vờ đã thanh toán | P0 | views.js + rich-content.js | **Chưa sửa** |
| H3 — Thanh toán sau | Phụ trợ · Giữ lại phiếu khám | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| H4 — Chuyển khoản QR | Chuyển khoản | Transfer/instructions | P0 giữ disclaimer và không thực hiện giao dịch | P0 | views.js + rich-content.js | **Chưa sửa** |
| H4 — Chuyển khoản QR | Render pattern · 1 card() / 0 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| H5 — Biên lai và hoàn tiền | Biên lai | Receipt | Empty/unknown state cần rõ | P2 | views.js + rich-content.js | **Chưa sửa** |
| H5 — Biên lai và hoàn tiền | Render pattern · 2 card() / 1 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| H5 — Biên lai và hoàn tiền | Phụ trợ · Bạn có thể kiểm tra | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| H6 — Kết luận và đơn thuốc | Kết luận và đơn thuốc | Summary/documents | Dùng danh sách rõ theo loại tài liệu | P2 | views.js + rich-content.js | **Chưa sửa** |
| H6 — Kết luận và đơn thuốc | Render pattern · 1 card() / 3 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| H6 — Kết luận và đơn thuốc | Phụ trợ · Những bước tiếp theo | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| H7 — Kết quả và việc tiếp theo | Kết quả và bước tiếp | Results/next steps | Phân tách trạng thái kết quả và hành động | P2 | views.js + rich-content.js | **Chưa sửa** |
| H7 — Kết quả và việc tiếp theo | Render pattern · 1 card() / 0 section() / 1 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| H7 — Kết quả và việc tiếp theo | Phụ trợ · Thông tin bạn cần | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| I1 — Hỏi phòng khám | Liên hệ sau khám | Help/actions | Không lặp icon chung chung | P2 | views.js + rich-content.js | **Chưa sửa** |
| I1 — Hỏi phòng khám | Render pattern · 0 card() / 1 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| I1 — Hỏi phòng khám | Phụ trợ · Chọn đúng kênh hỗ trợ | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| I2 — Gửi phản hồi (ba lý do) | Gửi phản hồi | Feedback form | Thông điệp cần rõ lý do | P2 | views.js + rich-content.js | **Chưa sửa** |
| I2 — Gửi phản hồi (ba lý do) | Phụ trợ · Viết ngắn gọn, dễ xử lý | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| I3 — Theo dõi triệu chứng | Theo dõi triệu chứng | Follow-up checklist | Không đưa lời khuyên chữa bệnh | P2 | views.js + rich-content.js | **Chưa sửa** |
| I3 — Theo dõi triệu chứng | Render pattern · 1 card() / 1 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| I3 — Theo dõi triệu chứng | Phụ trợ · Ghi nhận để trao đổi | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| I4 — Chuyển chuyên khoa | Chuyển chuyên khoa | Referral status | Thiếu ngày/đơn vị chịu trách nhiệm | P2 | views.js + rich-content.js | **Chưa sửa** |
| I4 — Chuyển chuyên khoa | Render pattern · 1 card() / 0 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| I4 — Chuyển chuyên khoa | Phụ trợ · Trước lượt khám tiếp theo | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| I5 — Tin nhắn với điều phối viên | Tin nhắn | Conversation list | Unread không giả định khi zero | P2 | views.js + rich-content.js | **Chưa sửa** |
| I5 — Tin nhắn với điều phối viên | Phụ trợ · Để nhận phản hồi rõ ràng | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| J1 — Đặt lịch tái khám | Đặt tái khám | Rebook details | Thông tin người/giờ cần nhất quán | P2 | views.js + rich-content.js | **Chưa sửa** |
| J1 — Đặt lịch tái khám | Render pattern · 1 card() / 1 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| J1 — Đặt lịch tái khám | Phụ trợ · Chuẩn bị cho lần gặp tiếp theo | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| K1 — Thông báo | Thông báo | Notification list | Trạng thái chưa đọc/badge thật | P2 | views.js + rich-content.js | **Chưa sửa** |
| K1 — Thông báo | Render pattern · 0 card() / 0 section() / 1 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| K1 — Thông báo | Phụ trợ · Quản lý cập nhật | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| K2 — Hồ sơ và người thân | Hồ sơ gia đình | Profile rows | Card chỉ icon + mô tả, hành động tertiary lẫn text | P1 | views.js + rich-content.js | **Chưa sửa** |
| K3 — Lịch sử khám | Lịch sử khám | History list | Cần trạng thái, ngày và bác sĩ | P2 | views.js + rich-content.js | **Chưa sửa** |
| K3 — Lịch sử khám | Render pattern · 0 card() / 0 section() / 1 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| K3 — Lịch sử khám | Phụ trợ · Tìm lại nội dung quan trọng | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| K4 — Cài đặt | Cài đặt | Settings list | Đăng xuất/danger phải nhận diện như nút | P1 | views.js + rich-content.js | **Chưa sửa** |
| K4 — Cài đặt | Render pattern · 0 card() / 1 section() / 0 collection() | Conditional/shared card template | Các nhánh trạng thái cần kiểm riêng; CSS hiện phân tán theo nhiều file | P2 | views.js (static invocation inventory) | **Chưa sửa** |
| K4 — Cài đặt | Phụ trợ · Bạn kiểm soát điều gì? | Contextual tiles / disclosure | Icon + mô tả chung; CTA text-only; section container có nhiều thẻ rời | P1 | careflow-experience.js | **Chưa sửa** |
| K5 — Hỗ trợ | Kênh hỗ trợ | Contact cards | Một số thẻ còn chung chung và lặp CTA | P2 | views.js + rich-content.js | **Chưa sửa** |
| Doctor /doctor | Buổi khám đang thực hiện | Hero/action | Cần kiểm tra priority và CTA | P1 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /doctor | Yêu cầu trước khám | Inbox/review | Người phụ trách, trạng thái, next action | P0 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /doctor | Kết quả cận lâm sàng | Result list | Trạng thái review và cần xem | P0 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /doctor | Lịch khám trong ngày | Agenda/table | Header và dữ liệu nhiều cột, phải phản hồi responsive | P1 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /doctor/schedule | Lịch khám tuần | Agenda/calendar | Mật độ ngày/slot | P1 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /doctor/queue | Danh sách khám | Queue/list | Nhận diện trạng thái tiếp nhận | P1 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /doctor/followups | Công việc theo dõi | Task list | Owner/deadline/next action | P1 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /patients | Danh sách bệnh nhân | Patient list | Mật độ tìm/lọc; privacy | P1 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /patients/:id | Hồ sơ bệnh nhân | Profile panels | Thông tin nhiều lớp cần nhóm rõ | P1 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /visits/:id | Thông tin lượt khám | Encounter facts | Bảo vệ nguồn dữ liệu demo | P1 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /encounters/:id | Khám lâm sàng | Clinical form panels | Chữ và hướng dẫn nhiều cấp | P0 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /results | Hộp thư kết quả | Results inbox | Đã xem/chưa xem | P0 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /clinical/orders | Chỉ định cận lâm sàng | Order panels | Draft vs ordered phải phân biệt | P1 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /clinical/prescription | Đơn thuốc | Prescription panels | Không giả vờ toa thuốc thật | P0 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /clinical/review | Rà soát hồ sơ khám | Review panels | Action xác nhận chưa ký thật | P0 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /doctor/review/:id | Rà soát yêu cầu | Review/handoff | Người sở hữu, trạng thái | P0 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |
| Doctor /doctor/online/:id | Phiên trực tuyến | Call status | P0: không giả vờ gọi thật | P0 | staff-prototype/{app,doctor-showcase,doctor-journeys,supporting}.js | **Chưa sửa** |

## Lỗi xuyên hệ thống được chứng minh trong source

| Loại | Dấu hiệu source | Mức | Hướng sửa |
|---|---|---|---|
| Hardcode màu / font / radius | `prototype/styles.css`, `solid-navy-polish.css`, `careflow-rich-content.css`, `careflow-experience.css`, `staff-prototype/*css` có nhiều literal. `design/tokens.json` hiện primary `#075FE8` cũ. | P1 | Một nguồn token CSS mới; migration theo component, grep tồn đọng. |
| Hai font mobile/doctor | Mobile dùng local Be Vietnam Pro; doctor CSS/HTML nạp Plus Jakarta Sans. | P1 | Cùng family Be Vietnam Pro; typography roles qua token. |
| Section/container lệch contract | `cf-home-appointment`, `ref-overview`, `rich-section`, `cfx-section` xen kẽ nhiều shape; CSS nhiều layers override. | P1 | Dùng `cf2-section` header + `cf2-section-container`, tránh nested visual borders. |
| Card thiếu actionable data | `cfx-tile` phụ trợ icon + title + mô tả; ví dụ screenshot Hồ sơ gia đình. | P1 | Đưa tên hồ sơ, số lượng liên quan, trạng thái thực từ model; không tạo dữ liệu giả mới. |
| Empty có CTA quá mạnh | `cf-appt-empty` của tab Đã hủy vẫn nút primary Đặt lịch khám. | P1 | Copy theo tab, secondary action về tab lịch hợp lý. |
| Zero/leading zero | Home metric render `03`, `02`, `00`. | P1 | `Intl.NumberFormat('vi-VN')`, 0 có nhãn 'Chưa có'. |
| Bố cục desktop | Nhiều `doctor-surface` và `panel` có spacing/heading khác nhau; dashboard doctor-only. | P1 | Bảo toàn đọc ưu tiên lâm sàng, migrate reusable card wrappers. |
| Loading/error | Model hiện chạy local sync; chưa có remote pending/error API. | P2 | Reusable state component + test QA injection, không giả mạo server. |

## Kiểm nghiệm vẫn thiếu trước khi xác nhận 'ĐẠT'

- [ ] 47 route mobile: data, empty, 0, unread, selected, large text, CSS viewport 320/360/390/430.
- [ ] 17 route/route pattern desktop: dashboard, queue, schedule, patient, encounter, results, clinical, doctor handoff ở 1280/1440/1920.
- [ ] Bằng chứng screenshot trước/sau; axe a11y, keyboard focus, 44px hit targets, contrast.
- [ ] Đếm DOM card/section bằng browser script (kiểm kê tĩnh chưa thay cho visual DOM).
- [ ] Grep hardcode CSS và exception log từng giá trị còn lại.
- [ ] Cập nhật cột 'Trạng thái sau' theo từng đợt, không tự đánh dấu DONE.

Tổng **133 card/pattern audit rows** (47 mobile screens + 17 doctor route patterns). Đã kiểm kê trước khi sửa mã giao diện; QA thực tế NOT_RUN tại bước này.

## Đợt chuyển đổi V2 — kiểm kê SAU (wave 1, source inspection)

> Wave 1 là **PARTIAL**, không xác nhận 133 hàng đã sửa hết. Trạng thái theo source; bằng chứng Playwright phải gắn SHA tại lúc chạy. Không đổi kết quả baseline bảng trên.

| Screen / card | Tình trạng | File đã đổi | Còn thiếu |
|---|---|---|---|
| B1 — Lịch khám tiếp theo | PARTIAL | `careflow-rich-content.js`, `design/cards-v2.css` | Visual QA hero/media, CTA hierarchy |
| B1 — Tổng quan chăm sóc | CODE_UPDATED | `careflow-rich-content.js` | Đã bỏ leading 0; kiểm số 0, chữ lớn 200% |
| B1 — Truy cập nhanh | CODE_UPDATED | `careflow-rich-content.js`, `design/cards-v2.css` | 2×2 + mô tả theo model; browser screenshot QA |
| B1 — Việc cần làm, Chăm sóc sau khám, Cẩm nang, Hỗ trợ | PARTIAL | shared `cf2-section-container` + CSS | Mật độ nội dung, không CTA lặp trong từng state |
| D1 — Empty Sắp tới/Đã khám/Đã hủy | CODE_UPDATED | `careflow-rich-content.js` | Tab Đã hủy -> thứ cấp 'Xem lịch sắp tới'; regression browser |
| B1/D1 — Hồ sơ gia đình contextual | CODE_UPDATED | `careflow-experience.js` | Count theo hồ sơ thật; bố cục container, role constraints |
| Mobile nhiều route — `section()` | CODE_UPDATED | `views.js` | Shared heading + single container; direct child selectors, a11y/render QA |
| Mobile 36 contextual sections | CODE_UPDATED | `design/cards-v2.js` | 1 inner container; state readability & rendered QA |
| Doctor dashboard — working cards | PARTIAL | `design/cards-v2.css/js`, `doctor-showcase.js` | Chưa chuyển hết cấu trúc header ngoài container; need before/after screenshots |
| Doctor result unread and empty | CODE_UPDATED | `doctor-showcase.js` | `data-cf2-state`, icon/text status QA |
| Mobile/doctor — unified font | CODE_UPDATED | `design/cards-v2.css`, `doctor-polish.css` | Font computed style; old explicit values and fallback audit |
| All other source card patterns | NOT_DONE | — | Chưa được sửa content-by-screen; cần wave 2+ |

### Hardcoded token debt (chưa đạt user acceptance)

Static grep trước redesign phát hiện nhiều literal hex trong các CSS cũ (ví dụ mobile `solid-navy-polish.css` 218 lượt literal, `careflow-rich-content.css` 155; desktop `styles.css` 337, `doctor-navy-theme.css` 217, `doctor-showcase.css` 202). `design/tokens.json` là legacy spec với màu primary cũ; **runtime V2 canonical** là `design/cards-v2.css`. Toàn bộ giá trị mới trong styles V2 dùng `--cf2-*`, tuy nhiên việc loại bỏ TẤT CẢ literal của legacy chưa hoàn tất. Không được tick checklist này.

### QA status

- JavaScript source of `cards-v2.js`, `views.js`, `careflow-rich-content.js`, `doctor-showcase.js` đã qua parser JS khi commit. **Đây không phải bằng chứng browser visual pass.**
- CI chạy localhost preview qua GitHub Actions, nhưng máy/container hội thoại hiện không truy cập DNS GitHub để checkout nên **chưa chạy localhost độc lập tại đây**. CI source `main` không được cập nhật.
- Follow-up: đọc actual CI run status của PR #46, fix tận gốc; mobile 320–430 CSS px + large text, desktop 1280/1440/1920, contrast/focus, states, screenshots.
