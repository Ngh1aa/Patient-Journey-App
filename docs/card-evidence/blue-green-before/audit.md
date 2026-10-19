# Kiểm kê trước theme pastel — 19/10/2026

Phạm vi: toàn bộ 47 screen IDs trong model.js; mỗi card/section/form hiển thị ở fixture chuẩn có một dòng. Không tính DOM instance là số component. Các trạng thái bổ sung và đánh giá thẩm mỹ ghi REVIEW, không suy ra PASS từ DOM. Ảnh stock được đánh dấu cần duyệt, không tự suy đoán sắc tộc từ ảnh.

## Kiểm tra cấp màn

| Screen | Route | Card/section/form | Lối đặt lịch trong nội dung (chưa gồm +) | Ảnh stock | Quyết định |
|---|---|---:|---:|---:|---|
| A1 · Đăng nhập (SĐT và OTP) | /login | 2 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| A2 · Xác nhận hồ sơ cũ | /profile-match | 2 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| A3 · Tạo hồ sơ bệnh nhân | /profile-new | 2 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| B1 · Trang chủ | /home | 21 | 4 | 11 | P1: cộng nút + sẽ vượt tối đa 2 lối đặt lịch |
| C1 · Ai đi khám | /book/patient | 4 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| C2 · Lý do khám và triệu chứng | /book/reason | 2 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| C3 · Dấu hiệu nguy hiểm | /book/safety | 3 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| C4 · Khuyến cáo nhập viện, cấp cứu | /book/alert | 1 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| C5 · Phòng khám xác nhận hình thức khám | /book/mode-review | 2 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| C6 · Chọn hình thức khám | /book/mode | 5 | 0 | 2 | REVIEW header/nav/section/flow ở giai đoạn màn |
| C7 · Chọn ngày giờ | /book/slot | 2 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| C8 · Kiểm tra và gửi yêu cầu | /book/review | 2 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| C9 · Đã gửi, Phiếu khám | /book/done/:id | 1 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| D1 · Lịch hẹn | /appointments | 1 | 1 | 2 | REVIEW header/nav/section/flow ở giai đoạn màn |
| D2 · Phiếu khám (chi tiết lượt khám) | /appointments/:id | 16 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| D3 · Đổi lịch | /appointments/:id/reschedule | 1 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| D4 · Hủy lịch | /appointments/:id/cancel | 5 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| E1 · Chuẩn bị trước khi đến | /appointments/:id/prepare | 3 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| E2 · Báo đã đến | /appointments/:id/arrive | 3 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| E3 · Theo dõi lượt khám | /appointments/:id/visit | 4 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| F1 · Xét nghiệm, chụp chiếu | /appointments/:id/labs | 3 | 0 | 4 | REVIEW header/nav/section/flow ở giai đoạn màn |
| F2 · Chi tiết chỉ định | /appointments/:id/labs/:labId | 5 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| F3 · Đặt hẹn xét nghiệm | /appointments/:id/labs/:labId/book | 2 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| F4 · Đính kèm kết quả | /appointments/:id/labs/:labId/upload | 2 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| G1 · Chuẩn bị khám online | /appointments/:id/online-prepare | 4 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| G2 · Chờ bác sĩ gọi | /appointments/:id/online-wait | 1 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| G3 · Bác sĩ đang gọi | /appointments/:id/incoming | 0 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| G4 · Đang khám online | /appointments/:id/call | 0 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| G5 · Chưa liên hệ được | /appointments/:id/unreachable | 2 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| H1 · Buổi khám đã hoàn tất | /appointments/:id/completed | 6 | 1 | 4 | REVIEW header/nav/section/flow ở giai đoạn màn |
| H2 · Thanh toán | /appointments/:id/pay | 3 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| H3 · Thanh toán sau | /appointments/:id/pay-later | 2 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| H4 · Chuyển khoản QR | /appointments/:id/pay/transfer | 3 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| H5 · Biên lai và hoàn tiền | /appointments/:id/receipt | 2 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| H6 · Kết luận và đơn thuốc | /appointments/:id/summary | 6 | 1 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| H7 · Kết quả và việc tiếp theo | /appointments/:id/results | 2 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| I1 · Hỏi phòng khám | /care | 8 | 0 | 7 | REVIEW header/nav/section/flow ở giai đoạn màn |
| I2 · Gửi phản hồi (ba lý do) | /care/report?reason= | 2 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| I3 · Theo dõi triệu chứng | /care/follow-up | 3 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| I4 · Chuyển chuyên khoa | /care/referral/:id | 2 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| I5 · Tin nhắn với điều phối viên | /care/messages | 2 | 1 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| J1 · Đặt lịch tái khám | /followup/:id | 3 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| K1 · Thông báo | /notifications | 2 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| K2 · Hồ sơ và người thân | /profile | 4 | 0 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| K3 · Lịch sử khám | /profile/history | 1 | 1 | 1 | REVIEW header/nav/section/flow ở giai đoạn màn |
| K4 · Cài đặt | /settings | 3 | 0 | 0 | REVIEW header/nav/section/flow ở giai đoạn màn |
| K5 · Hỗ trợ | /support | 6 | 0 | 3 | REVIEW header/nav/section/flow ở giai đoạn màn |

## Từng card / vị trí

| Screen | Vị trí / card | Type | Checklist và lỗi cụ thể | Ưu tiên |
|---|---|---|---|---|
| A1 | 1. Số điện thoại / `auth-panel auth-start` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn; R1: nền nút chính chưa phải #0B1220 | P2 |
| A1 | 2. Số điện thoại / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| A2 | 1. Họ và tên / `auth-panel auth-profile` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn; R1: nền nút chính chưa phải #0B1220 | P2 |
| A2 | 2. Họ và tên / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| A3 | 1. Họ và tên / `auth-panel auth-profile` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn; R1: nền nút chính chưa phải #0B1220 | P2 |
| A3 | 2. Họ và tên / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| B1 | 1. Tổng quan chăm sóc / `ref-overview` | section | ZERO: số 00 thay trạng thái rỗng (không tính phút trong giờ khám); GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P1 |
| B1 | 2. Bạn và phòng khám / `cf-photo-card cf-layout-network cf-home-network` | action | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| B1 | 3. 20 / `visit-card cf-home-appointment-summary` | action | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| B1 | 4. Truy cập nhanh / `cf-home-quick` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| B1 | 5. Chăm sóc phù hợp với bạn / `ref-discover` | section | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| B1 | 6. Chủ động thăm khám / `cf-photo-card cf-layout-photo ref-discover-image cf-photo-featured` | action | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| B1 | 7. Khám tại phòng khám / `cf-photo-card cf-layout-photo ` | action | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| B1 | 8. Khám trực tuyến / `cf-photo-card cf-layout-photo ` | action | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| B1 | 9. Việc cần làm / `rich-section cf-home-task-section` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| B1 | 10. Chuẩn bị cho buổi khám / `cf-photo-card cf-layout-topic cf-home-task-card cf-task-note` | action | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| B1 | 11. Chọn giờ khám / `cf-photo-card cf-layout-stack cf-home-task-card` | action | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| B1 | 12. Chăm sóc sau khám / `rich-section cf-home-care-section` | section | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| B1 | 13. Chưa có thông tin sau khám / `cf-home-care-card cf-photo-panel` | media | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| B1 | 14. Cẩm nang đi khám / `rich-section cf-home-tips-section` | section | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| B1 | 15. Chuẩn bị trước khi khámGiấy tờ, đơn thuốc và kết quả cũ / `cf-home-tip-card cf-guide-media` | surface | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| B1 | 16. Chuẩn bị trước khi khám / `cf-photo-card` | content | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| B1 | 17. Vào phòng khám onlineKết nối, camera và không gian riêng tư / `cf-home-tip-card cf-guide-media` | surface | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| B1 | 18. Vào phòng khám online / `cf-photo-card` | content | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| B1 | 19. Tìm lại thông tin sau khámKết quả, lời dặn và câu hỏi cho phòng khám / `cf-home-tip-card cf-guide-media` | surface | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| B1 | 20. Tìm lại thông tin sau khám / `cf-photo-card` | content | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| B1 | 21. Cần giúp? / `rich-section cf-home-help-section` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| C1 | 1. Người đi khám / `` | form | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; R1: nền nút chính chưa phải #0B1220 | P2 |
| C1 | 2. Nguyễn Minh Anh / `choice patient-choice rich-patient-choice selected` | choice | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| C1 | 3. Trần Thị Mai / `choice patient-choice rich-patient-choice ` | choice | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| C1 | 4. Thông tin theo đúng hồ sơ / `card cf-journey-summary` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| C2 | 1. Triệu chứng hoặc vấn đề cần khám / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| C2 | 2. Ghi thông tin để phòng khám chuẩn bị / `card cf-journey-summary` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| C3 | 1. Trước khi đặt lịch / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| C3 | 2. Không, tiếp tục đặt lịch / `choice selected  ` | choice | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| C3 | 3. Có hoặc chưa rõ / `choice   ` | choice | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| C4 | 1. Phòng khám cần đánh giá tình trạng và hình thức khám phù hợp cho bạn. / `note danger` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| C5 | 1. Yêu cầu của bạn chưa phải lịch khám đã được xác nhận. / `note warning` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| C5 | 2. Tôi hiểu cần chờ phòng khám xem xét / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| C6 | 1. Hình thức / `` | form | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; R1: nền nút chính chưa phải #0B1220 | P2 |
| C6 | 2. Tại phòng khám / `choice selected  cf-mode-choice` | choice | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| C6 | 3. Khám online / `choice   cf-mode-choice` | choice | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| C6 | 4. Phòng khám sẽ kiểm tra hình thức phù hợp trước khi xác nhận. / `note info` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| C6 | 5. Chuẩn bị theo hình thức khám / `card cf-journey-summary` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| C7 | 1. 19 / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| C7 | 2. Sau khi chọn giờ khám / `card cf-journey-summary` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| C8 | 1. Người đi khámNguyễn Minh AnhNgày khámThứ Ba, 20/10/2026Giờ khám09:00Hình thứcTại phòng khámLý do khá / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| C8 | 2. Tôi đồng ý gửi thông tin trên cho phòng khám. / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| C9 | 1. CF-0001 / `card ticket` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| D1 | 1. BS. Trần Thu Hà / `rich-appt-card cf-photo-panel state-success cf-appt-featured` | media | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; R1: nền nút chính chưa phải #0B1220 | P2 |
| D2 | 1. Đang chờ bạn / `card next-step` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn; R1: nền nút chính chưa phải #0B1220 | P2 |
| D2 | 2. CF-1017-0042 / `card ticket` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| D2 | 3. Bệnh viện Nhân dân 115 / `facility-card` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| D2 | 4. Phòng khám sẽ thông báo trước khi thu phí / `note info` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| D2 | 5. Thông tin liên quan / `section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| D2 | 6. Xét nghiệm, chụp chiếu / `row` | action | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| D2 | 7. Phí khám và biên lai / `row` | action | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| D2 | 8. Kết luận và đơn thuốc / `row` | action | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| D2 | 9. Kết quả và việc tiếp theo / `row` | action | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| D2 | 10. Trao đổi sau khám / `row` | action | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| D2 | 11. Các bước của lượt khám / `section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| D2 | 12. Tiến trình lượt khám / `rich-section rich-detailed-progress` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| D2 | 13. Cần chuẩn bị / `rich-section rich-prepare` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| D2 | 14. Thông tin đã khai / `rich-section rich-declared` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| D2 | 15. Chỉ định liên quan / `rich-section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| D2 | 16. Sẵn sàng cho buổi khám / `card cf-preparation-card` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| D3 | 1. Bác sĩBS. Trần Thu Hà · Nội tổng quátNgười đi khámNguyễn Minh AnhNgày khámThứ Ba, 20/10/2026Giờ khám / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| D4 | 1. Lý do hủy / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| D4 | 2. Tôi bận vào thời gian này / `choice selected  ` | choice | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| D4 | 3. Tôi muốn chọn ngày khác / `choice   ` | choice | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| D4 | 4. Lý do khác / `choice   ` | choice | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| D4 | 5. Nếu có khoản phí đã thu, phòng khám sẽ kiểm tra chính sách áp dụng. / `note info` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| E1 | 1. Giờ hẹn08:00 · Thứ Ba, 20/10/2026Giờ nên có mặtChưa có hướng dẫn thời gian đến riêngGiấy tờ cần mang / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| E1 | 2. Bạn có thể hỏi phòng khám nếu chưa nhận được hướng dẫn. / `note info` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| E1 | 3. Sẵn sàng cho buổi khám / `card cf-preparation-card` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| E2 | 1. CF-1017-0042 / `checkin-qr-panel` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| E2 | 2. Bác sĩBS. Trần Thu Hà · Nội tổng quátNgười đi khámNguyễn Minh AnhNgày khámThứ Ba, 20/10/2026Giờ khám / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| E2 | 3. Sau khi báo đã đến, bạn hãy chờ lễ tân hướng dẫn. / `note info` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| E3 | 1. Bạn đã đến / `card center cf-waiting-card cf-photo-panel` | surface | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| E3 | 2. Số thứ tự / `section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| E3 | 3. Bạn hãy ở khu vực chờ để nghe hướng dẫn. Thời gian chờ có thể thay đổi. / `note info` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| E3 | 4. Các bước của lượt khám / `section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| F1 | 1. Xét nghiệm theo chỉ định / `cf-lab-card cf-photo-panel` | media | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| F1 | 2. Hướng dẫn thực hiện / `cf-photo-card cf-layout-topic ` | action | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| F1 | 3. Cần hỗ trợ? / `cf-photo-card cf-layout-network ` | action | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| F2 | 1. Trạng thái chỉ định / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| F2 | 2. Hướng dẫn chuẩn bị / `section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| F2 | 3. Khi có kết quả, bạn muốn / `` | form | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| F2 | 4. Quay lại lượt khám hiện tại / `choice selected  ` | choice | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| F2 | 5. Để bác sĩ xem trong buổi khám / `choice   ` | choice | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| F3 | 1. Ngày mong muốn / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| F3 | 2. Kiểm tra trước khi chọn lịch / `card cf-journey-summary` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| F4 | 1. Tệp kết quả / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| F4 | 2. Chuẩn bị tệp kết quả / `card cf-journey-summary` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| G1 | 1. Chưa kiểm tra / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| G1 | 2. Chọn nơi riêng tư, yên tĩnh. Chỉ bật camera và micro khi bạn đồng ý. / `note info` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| G1 | 3. Bạn có thể vào phòng chờ khi phòng khám mở lượt khám. Hãy xem cập nhật trong phiếu khám. / `note info` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| G1 | 4. Sẵn sàng cho buổi khám / `card cf-preparation-card` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| G2 | 1. Chờ bác sĩ gọi / `card center cf-waiting-card cf-photo-panel` | surface | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| G5 | 1. Đang chờ phòng khám liên hệ lại / `note info` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| G5 | 2. Phòng khám sẽ sắp xếp gọi lại. Bạn cũng có thể chọn lịch phù hợp hơn. / `note warning` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| H1 | 1. Hoàn tất buổi khámNguyễn Minh Anh · Thứ Ba, 20/10/2026 / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H1 | 2. Bác sĩ đã ký và hoàn tất hồ sơ buổi khám / `note info` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| H1 | 3. Chọn giờ khám / `cf-photo-card cf-layout-stack ` | action | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H1 | 4. Xét nghiệm sau khám / `cf-photo-card cf-layout-photo ` | action | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| H1 | 5. Hỏi phòng khám / `cf-photo-card cf-layout-network ` | action | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H1 | 6. Đặt lịch tái khám / `cf-photo-card cf-layout-topic ` | action | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H2 | 1. Phòng khám sẽ thông báo / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H2 | 2. Số tiền và thông tin nhận tiền sẽ do phòng khám cung cấp. / `note info` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| H2 | 3. Thông tin khoản thu / `card cf-journey-summary` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H3 | 1. Lý do thanh toán sau / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| H3 | 2. Thông tin khoản thu / `card cf-journey-summary` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H4 | 1. Chưa có mã thanh toán / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H4 | 2. Phòng khám chưa cung cấp tài khoản và số tiền. Bạn đừng chuyển tiền khi chưa kiểm tra đủ thông tin. / `note warning` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| H4 | 3. Thông tin khoản thu / `card cf-journey-summary` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H5 | 1. Biên lai / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H5 | 2. Thông tin khoản thu / `card cf-journey-summary` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H6 | 1. Kết luận buổi khám / `section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| H6 | 2. Chưa có tài liệu được phòng khám chia sẻ. / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H6 | 3. Đơn thuốc / `section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| H6 | 4. Hướng dẫn chăm sóc / `section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| H6 | 5. Mẫu chăm sóc sau khám / `rich-section rich-aftercare-sample` | section | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; R1: nền nút chính chưa phải #0B1220 | P2 |
| H6 | 6. Câu hỏi cho lần trao đổi tới / `card cf-preparation-card` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| H7 | 1. Xét nghiệm theo chỉ định / `cf-result-card cf-photo-panel` | media | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| H7 | 2. Thông báo kết quảĐã gửi thông báoGiải thích kết quảChưa ghi nhận đã giải thích / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| I1 | 1. Lượt đã khám / `section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| I1 | 2. Nguyễn Minh Anh / `choice selected  ` | choice | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| I1 | 3. Phản hồi về đơn thuốc / `cf-photo-card cf-layout-photo cf-inquiry-tile` | action | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| I1 | 4. Hỏi lại, dùng thuốc / `cf-photo-card cf-layout-network cf-inquiry-tile` | action | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| I1 | 5. Triệu chứng mới, chưa cải thiện / `cf-photo-card cf-layout-topic cf-inquiry-tile` | action | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| I1 | 6. Theo dõi triệu chứng / `cf-photo-card cf-layout-topic ` | action | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| I1 | 7. Chọn giờ khám / `cf-photo-card cf-layout-stack ` | action | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| I1 | 8. Tin nhắn với phòng khám / `cf-photo-card cf-layout-network ` | action | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| I2 | 1. Nội dung cần trao đổi / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| I2 | 2. Tin nhắn không thay thế kênh cấp cứu. Không chờ phản hồi nếu cần trợ giúp khẩn cấp. / `note warning` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| I3 | 1. Hôm nay bạn thấy thế nào? / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| I3 | 2. Theo dõi triệu chứng / `section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| I3 | 3. Câu hỏi cho lần trao đổi tới / `card cf-preparation-card` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| I4 | 1. Phòng khám đang sắp xếp hướng dẫn chuyển chuyên khoa. / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| I4 | 2. Phản hồi sau khi khám chuyên khoa / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| I5 | 1. Tin nhắn của bạn / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| I5 | 2. Câu hỏi cho lần trao đổi tới / `card cf-preparation-card` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| J1 | 1. Gặp lại bác sĩ / `cf-photo-card cf-layout-photo  cf-photo-featured` | action | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới | P2 |
| J1 | 2. Bác sĩBS. Trần Thu Hà · Nội tổng quátNgười đi khámNguyễn Minh AnhNgày khámThứ Ba, 20/10/2026Giờ khám / `card ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| J1 | 3. Ngày gợi ý từ phòng khám / `section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| K1 | 1. Có cập nhật về lượt khám / `notification row ` | action | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| K1 | 2. Nội dung sức khỏe không xuất hiện trong bản xem trước. / `note info` | notice | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| K2 | 1. Thông tin cá nhân / `cf-reference-section ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| K2 | 2. Người thân / `cf-reference-section ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn; R1: nền nút chính chưa phải #0B1220 | P2 |
| K2 | 3. Họ và tên / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| K2 | 4. Cài đặt / `cf-reference-section ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| K3 | 1. BS. Trần Thu Hà / `rich-appt-card cf-photo-panel state-success` | media | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; R1: nền nút chính chưa phải #0B1220 | P2 |
| K4 | 1. Chữ lớn / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| K4 | 2. Quyền riêng tư / `section ` | section | Không phát hiện lỗi zero/overflow/ảnh stock/linear bằng DOM. REVIEW: vai trò, CTA, density, typography, wrap, contrast và trạng thái trong giai đoạn màn. | REVIEW |
| K4 | 3. Dữ liệu trên thiết bị này / `card cf-journey-summary` | tonal | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| K5 | 1. Hỗ trợ từ phòng khám / `cf-support-network` | surface | IMAGE_REVIEW: ảnh stock cần đối chiếu quy tắc hình ảnh mới; GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| K5 | 2. Liên hệ nhanh / `cf-reference-section ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| K5 | 3. Gửi yêu cầu / `cf-reference-section ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn; R1: nền nút chính chưa phải #0B1220 | P2 |
| K5 | 4. Chủ đề / `` | form | R1: nền nút chính chưa phải #0B1220 | P2 |
| K5 | 5. Câu hỏi thường gặp / `cf-reference-section ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |
| K5 | 6. Tin nhắn gần đây / `cf-reference-section ` | surface | GRADIENT: gradient tuyến tính cần đổi mesh nếu là thẻ nhấn | P2 |

## Checklist mục 3 — phạm vi và giới hạn

Header/chuông/logo, nhãn nav, heading+Xem tất cả và giới hạn booking: review cấp màn; không buộc form/cảnh báo y tế thành bento. Vai trò card, icon, wrap một chữ, tiếng Việt và ảnh: review thủ công khi sửa từng màn. Contrast, 44px, pressed/disabled/loading/empty/error cần kiểm riêng trên component và flow. Không đổi guard/dữ liệu để tạo đủ bố cục.

Nguồn: 72 tracked files; 19 binary chỉ kiểm kê, không đọc như văn bản. Xem source-inventory.json để biết loại, hash, scan và số màu literal. Nhiều CSS lịch sử còn hardcode; theme mới dùng variables và sẽ migrate theo mốc duyệt.
