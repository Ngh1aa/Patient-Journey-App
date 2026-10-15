# Vietnamese UX Writing — audit trực tiếp

Evidence class: SOURCE_AUDIT + DESIGN_DECISION, không phải Deep Research hoặc DIRECT_USER. Đối chiếu baseline8f26983 prototype/app.js, prototype/strings.vi.js và index.html với file13 mới. Bản gốc11/12 và báo cáo Deep Research chưa truy cập được.

| Nguồn/quan sát | Quyết định | Nơi áp dụng | Kiểm chứng |
|---|---|---|---|
| app.js có tên “Nguyễn Minh Anh — Tôi (hồ sơ mẫu)” và người thân tương tự | Tách fixtures khỏi lời nói với bệnh nhân, chỉ tên + quyền | C1, K2 và context | jargon assertion trên47 route |
| strings.vi.js có “Sẵn sàng check-in”, “Bạn có thể check-in” | Dùng Báo đã đến theo tình huống đến phòng khám | E2, D2 reminder | F4 E2E, state arrived |
| Copy cũ có phí350.000đ, giờ mở cửa và thời gian trả lời dạng placeholder | Không dùng giả định làm giá/chính sách thật; chờ phòng khám cung cấp | E1/H2/H4/K5 | visual/screen audit; clinical-and-service-gates |
| Cũ dùng24 ID, F1 là phí và F2 gộp kết quả/đơn | Copy tách theo nhiệm vụ và route mới | F1-F4/G1-G5/H1-H7/I1-I5 | inventory exact47, all-route render |
| Mục0.2 file13 đổi tên hình thức/phiếu/phí | Tại phòng khám / Khám online; Phiếu khám; Phí khám | shared common/status/action copy | unit copy assertion và route E2E |
| Unknown outcome dễ bị hiểu là gửi chưa thành công và gửi lại | Nói rõ chưa xác định, yêu cầu kiểm tra trước; giữ thông tin | C8 | unknown-found/missing/duplicate tests |
| “Bác sĩ đã xem” không đồng nghĩa bệnh nhân nhận thông tin | Hai dòng “Thông báo kết quả”, “Giải thích kết quả” tách | H7 | F10 review/notice/explained sequence |
| Draft H7 lead mang giọng mô tả spec “Phân biệt kết quả...” | Viết thành nhiệm vụ người dùng: “Theo dõi kết quả xét nghiệm và hướng dẫn tiếp theo từ phòng khám.” | H7.lead | screenshot/review + centralized copy |
| Giả lập tài khoản/OTP/cuộc gọi/tiền không được giống giao dịch thật | Thanh Bản demo luôn ngoài phone, OTP và thao tác service có thông báo giới hạn; không QR nhận tiền giả | demo object/index shell/dialog | mobile/desktop screenshots, paid guard |

## Voice và reuse
Bạn – phòng khám. Nhãn checkbox có thể dùng Tôi để thể hiện lựa chọn của bệnh nhân. CTA nói hành động: Gửi yêu cầu đặt lịch, Báo đã đến, Đặt lịch mới, Gửi phản hồi. Không hứa thời gian; không đổ lỗi; không tạo lời dặn thuốc hoặc diễn giải y khoa. Lỗi có vấn đề + bước tiếp theo, gắn aria-invalid/field-error.

strings.vi.js sở hữu common/errors/statuses/payments/labs/actions/screen/feedback; demo có namespace riêng. Registry ID/title/route lấy từ file13; UI không hiển thị ID kỹ thuật của màn. Mã lượt khám CF là đối tượng bệnh nhân cần dùng, khác với ID màn A1–K5.

## Chưa được xác nhận
Ngôn ngữ có dễ hiểu với người lớn tuổi hay không, hiểu đúng clinical warnings và comprehension về phí cần usability study thật. Bài kiểm tra đọc text/axe/overflow không chứng minh hiểu hoặc hiệu quả điều trị. Tất cả clinical, fees, bảo hiểm, consent và refund policy phải owner duyệt trước triển khai thật.
