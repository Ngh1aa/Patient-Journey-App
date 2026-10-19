# CareFlow+ — đối chiếu 47 màn sau H2

Rà lại từ renderer/model thật, không giới hạn17 màn. Tất cả47 màn được chụp mới ở390px; mở xem bốn contact sheet. Bộ kiểm tra reflow47 màn chạy Chromium/WebKit ở360/390px và360px chữ lớn.

Các cột dưới ghi chính xác mẫu/trạng thái đã chạy, không cấp PASS cho mọi tổ hợp chưa được dựng. Những mục B/C/D5+ chưa tới đợt vẫn được giữ trong backlog. G/H/I/J có thêm33 capture trạng thái; tổng37 capture bổ sung gồm cả safety/calendar/topic.

| Màn / tiêu đề | Mẫu và trạng thái đã xem | Kết quả / lỗi thực tế còn lại |
|---|---|---|
| A1 — An tâm hơn. | [Mặc định](screens/A1.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| A2 — An tâm hơn. | [Mặc định](screens/A2.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| A3 — An tâm hơn. | [Mặc định](screens/A3.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| B1 — Nguyễn Minh Anh | [Mặc định](screens/B1.png) | C1–C3: Home còn nhiều nhóm/lối vào trùng, chưa tới đợt rút gọn. |
| C1 — Ai sẽ đi khám? | [Mặc định](screens/C1.png) | A1 chưa tái hiện thanh đen lạ; footer hiện được dành vùng riêng. |
| C2 — Lý do đi khám | [Mặc định](screens/C2.png) | B3: chip triệu chứng vẫn chưa đồng bộ hai chiều; D3 tên bước xử lý đợt sau. |
| C3 — Trước khi đặt lịch | [Mặc định](screens/C3.png); [C3-warning-visible](states/C3-warning-visible.png) | D1/D2 đã sửa. D3 tên bước chung xử lý đợt sau. |
| C4 — Ưu tiên được hỗ trợ kịp thời | [Mặc định](screens/C4.png) | Nhánh cảnh báo hiện có được giữ nguyên; không đổi clinical flow. |
| C5 — Chờ phòng khám tư vấn | [Mặc định](screens/C5.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| C6 — Nơi khám | [Mặc định](screens/C6.png) | A3 đã có padding16px; B5 khung minh họa vuông làm ở đợt B; D10 thông điệp còn lặp. |
| C7 — Chọn giờ hẹn | [Mặc định](screens/C7.png); [C7-calendar-sheet](states/C7-calendar-sheet.png) | A2/A4/A5 đã sửa; D3 tên bước4 còn Kiểm tra tới đợt kế tiếp. |
| C8 — Kiểm tra lịch hẹn | [Mặc định](screens/C8.png) | A1/A2/A4 đã sửa; D7/D8 nội dung xem lại/icon gửi còn trong backlog. |
| C9 — Đã gửi yêu cầu đặt lịch | [Mặc định](screens/C9.png) | D6 pending còn tên bác sĩ fallback; D9 bố cục thành công chưa làm đợt này. |
| D1 — Lịch hẹn | [Mặc định](screens/D1.png) | C6: search/tab zero-count còn hiện khi không có lịch; chưa tới đợt C. |
| D2 — Phiếu khám | [Mặc định](screens/D2.png) | D5: mã CF-1017-0042 cùng tồn tại với CF-0001; đợt D5 chưa làm. |
| D3 — Đổi lịch khám | [Mặc định](screens/D3.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| D4 — Hủy lịch khám | [Mặc định](screens/D4.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| E1 — Chuẩn bị trước khi đến | [Mặc định](screens/E1.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| E2 — Bạn đã đến phòng khám? | [Mặc định](screens/E2.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| E3 — Theo dõi lượt khám | [Mặc định](screens/E3.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| F1 — Xét nghiệm, chụp chiếu | [Mặc định](screens/F1.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| F2 — Xét nghiệm theo chỉ định | [Mặc định](screens/F2.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| F3 — Đặt hẹn xét nghiệm | [Mặc định](screens/F3.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| F4 — Đính kèm kết quả | [Mặc định](screens/F4.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| G1 — Chuẩn bị khám trực tuyến | [Mặc định](screens/G1.png); [G1-camera-unavailable](states/G1-camera-unavailable.png); [G1-device-ready](states/G1-device-ready.png) | P2: hoàn tất chuẩn bị là xác nhận của người dùng; chưa phải chứng minh camera/mạng hoạt động. |
| G2 — Chờ bác sĩ gọi | [Mặc định](screens/G2.png); [G2-waiting](states/G2-waiting.png) | P2: trạng thái chờ có recovery; khoảng trống lớn còn thuộc đợt C. |
| G3 — Nguyễn Minh Anh | [Mặc định](screens/G3.png); [G3-incoming](states/G3-incoming.png) | Header cuộc gọi vẫn dùng chrome cũ, khác header màn thông thường; đợt đồng nhất B/C chưa làm. |
| G4 — Nguyễn Minh Anh | [Mặc định](screens/G4.png); [G4-camera-mic-off](states/G4-camera-mic-off.png) | P1: ghi chú cá nhân bị mất khi bật/tắt camera hoặc micro vì render thay DOM. |
| G5 — Chưa liên hệ được với bạn | [Mặc định](screens/G5.png); [G5-missed-call](states/G5-missed-call.png); [G5-callback-request](states/G5-callback-request.png) | Callback giữ đúng visit; không tạo lịch mới. Layout/recovery chưa rút gọn đợt C. |
| H1 — Buổi khám đã hoàn tất | [Mặc định](screens/H1.png); [H1-completed](states/H1-completed.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| H2 — Thanh toán phí khám | [Mặc định](screens/H2.png); [H2-unpaid](states/H2-unpaid.png); [H2-paid](states/H2-paid.png); [H2-no-fee](states/H2-no-fee.png) | P2: nhãn Đã thanh toán/Không phát sinh phí còn cùng màu xanh dương + info với trạng thái chờ. |
| H3 — Hẹn ngày thanh toán | [Mặc định](screens/H3.png); [H3-validation-error](states/H3-validation-error.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| H4 — Chuyển khoản phí khám | [Mặc định](screens/H4.png); [H4-bank-details-missing](states/H4-bank-details-missing.png) | P1: nút Tôi đã chuyển khoản vẫn bật khi chưa có tài khoản/số tiền/QR. |
| H5 — Biên lai và hoàn tiền | [Mặc định](screens/H5.png); [H5-transfer-pending](states/H5-transfer-pending.png); [H5-paid](states/H5-paid.png); [H5-refunding](states/H5-refunding.png); [H5-refunded](states/H5-refunded.png) | P2: pending/paid/refunding/refunded phân biệt bằng chữ, nhưng tone/icon còn dùng chung info. |
| H6 — Kết luận và đơn thuốc | [Mặc định](screens/H6.png); [H6-no-summary](states/H6-no-summary.png); [H6-aftercare](states/H6-aftercare.png); [H6-summary-shared](states/H6-summary-shared.png) | Đã bỏ nội dung mẫu/thuốc giả; B10/C: còn hai lối Hỏi phòng khám ở aftercare/footer. |
| H7 — Kết quả và việc tiếp theo | [Mặc định](screens/H7.png); [H7-empty-results](states/H7-empty-results.png); [H7-reviewed-results](states/H7-reviewed-results.png); [H7-awaiting-review](states/H7-awaiting-review.png) | P2: một kết quả vẫn có bộ lọc/số đếm; empty đã được xem bằng fixture communication pending. |
| I1 — Bạn muốn hỏi về việc gì? | [Mặc định](screens/I1.png); [I1-topic-selection](states/I1-topic-selection.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| I2 — Gửi phản hồi cho phòng khám | [Mặc định](screens/I2.png); [I2-validation-error](states/I2-validation-error.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| I3 — Theo dõi triệu chứng | [Mặc định](screens/I3.png); [I3-empty-tracking](states/I3-empty-tracking.png); [I3-update-received](states/I3-update-received.png) | Cập nhật thực sự xuất hiện phía dưới form; không ghi nhận lỗi Chưa có cập nhật sau gửi. |
| I4 — Chuyển chuyên khoa | [Mặc định](screens/I4.png); [I4-referral-waiting](states/I4-referral-waiting.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| I5 — Tin nhắn với phòng khám | [Mặc định](screens/I5.png); [I5-feedback-received](states/I5-feedback-received.png); [I5-empty-messages](states/I5-empty-messages.png); [I5-message-sent](states/I5-message-sent.png); [I5-staff-reply](states/I5-staff-reply.png) | B8/C: empty chỉ là đoạn gợi ý + form, chưa cùng mẫu empty khác; khoảng trắng còn nhiều. |
| J1 — Đặt lịch tái khám | [Mặc định](screens/J1.png); [J1-follow-up](states/J1-follow-up.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| K1 — Thông báo | [Mặc định](screens/K1.png) | C3: một thông báo vẫn có bộ lọc/số đếm. |
| K2 — Hồ sơ | [Mặc định](screens/K2.png) | A6 đã giảm khoảng cách và bỏ gutter lồng; D11 thông tin cá nhân bổ sung ở đợt sau. |
| K3 — Lịch sử khám | [Mặc định](screens/K3.png) | B8/C3: empty/filter vẫn cần đợt thống nhất thành phần/bố cục. |
| K4 — Cài đặt | [Mặc định](screens/K4.png) | Không ghi nhận thêm lỗi hiển thị trong mẫu đã chụp; các tiêu chí dùng chung B/C/D/E chưa tới đợt vẫn theo H1. |
| K5 — Hỗ trợ | [Mặc định](screens/K5.png); [K5-emergency-visible](states/K5-emergency-visible.png); [K5-topic-sheet](states/K5-topic-sheet.png) | A5/A6/D1 đã sửa; B1 link trên Gửi yêu cầu/B4 quick contact chưa làm đợt này. |

## Phân biệt trạng thái và bằng chứng

- G1: nhánh camera bị từ chối được kích hoạt bằng stub `getUserMedia` trong browser kiểm tra cô lập, để xác minh UI lỗi/recovery. Không coi đây là kiểm thử camera/thiết bị thật.
- G2/G3/G4/G5: waiting/incoming/declined/in-call/camera-off/mic-off/callback dùng model và action hiện có. Không có dịch vụ video thật hay trạng thái online của bác sĩ thật.
- H2/H5: unpaid,paid,not-required,transfer-pending,refunding,refunded đi qua model transition đang dùng cho reviewer. Không xác nhận có giao dịch tiền thật.
- H6: đã xem chưa có kết luận và kết luận được chia sẻ bằng model; đơn thuốc vẫn là empty đúng dữ liệu, không tự bịa tên thuốc/liều.
- H7: empty/awaiting-review/reviewed là các fixture riêng; empty reset communication về pending để không tạo mâu thuẫn giả giữa Không có kết quả và Đã thông báo.
- I2/I3/I5: validation,feedback received,tracking update,message sent,staff reply đều được chụp. I3 update có ở phía dưới form; I5 staff reply qua model, không phải phản hồi của người thật.
- Loading: các màn G/H/I không có một loading-network state bền vững riêng trong model đồng bộ. Không dựng spinner giả rồi ghi PASS cho kết nối backend chưa tồn tại. Booking busy presentation vẫn giữ; đối chiếu trạng thái thực tế thay vì gắn UNKNOWN cho cả màn.
- Source of truth cho issue G4: `capture.json` có `noteLostAfterToggle:true`; thao tác nhập note rồi toggle thực sự làm giá trị mất.
