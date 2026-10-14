# CareFlow — UX / Digital Health Research

**Sản phẩm:** CareFlow — Patient Journey & Clinic Care App  
**Đối tượng:** ứng dụng bệnh nhân iOS/Android ở phòng khám Việt Nam, bao gồm người bệnh nhiều lứa tuổi và người đặt hộ.  
**Ngày đối chiếu nguồn:** 15/10/2026 (Asia/Ho_Chi_Minh).  
**Giai đoạn:** nghiên cứu trước thiết kế (secondary research + kế hoạch nghiên cứu sơ cấp).  
**Trạng thái:** DRAFT — chưa thử nghiệm người dùng, chưa có phê duyệt lâm sàng/pháp lý; KHÔNG phải SOP phòng khám, không phải khẳng định compliance.

## Các tài liệu
1. [01 — Đối chuẩn ứng dụng & mẫu chức năng (A, C)](01-benchmark-patterns.md).
2. [02 — iOS, trợ năng, nguồn thị giác (B, D)](02-accessibility-assets.md).
3. [03 — Pháp lý và tích hợp kỹ thuật (E, F)](03-legal-tech.md).
4. [04 — Ngôn ngữ, metrics, nghiên cứu sơ cấp (G, H, I)](04-content-testing-primary.md).
5. [05 — Ma trận 23 màn hình, phát hiện và khoảng trống](05-screen-evidence-matrix.md).

## Quy ước về bằng chứng
- **FACT**: thông tin có từ nguồn liên kết; chỉ xem là xác minh với đúng phạm vi mô tả; công khai trên trang giới thiệu không đồng nghĩa đã kiểm thử app.
- **INFERENCE**: suy luận thiết kế từ nhiều nguồn, không được nhầm là số liệu quan sát.
- **RECOMMENDATION**: giải pháp đề xuất, cần usability test và rà soát nghiệp vụ.
- **UNVERIFIED**: chưa xác minh; không thay thế bằng giá trị đoán.
- **Tin cậy Cao**: cơ quan ban hành / chính chủ / chuẩn kỹ thuật; **Trung bình**: phân tích giao diện hoặc suy luận có đối chiếu; **Thấp**: đánh giá của một người dùng hoặc điều chưa thực nghiệm.

**Quy tắc đặc biệt:** số bước booking tính bằng màn hình hoàn thành một lượt, từ mở đặt lịch đến xác nhận, CHƯA ĐƯỢC ĐO trong bất kỳ app nào ở bảng; KHÔNG suy diễn từ số bước hướng dẫn chính thức. Số 70% bệnh nhân là giả định đầu vào của dự án, không phải khảo sát đại diện. Tất cả ảnh màn hình chỉ cung cấp liên kết về nguồn công khai, không sao chép tài nguyên của bên thứ ba.

## Nguyên tắc bắt buộc khi thiết kế
1. Thông tin người đang khám luôn nổi bật, tránh nhập/chọn sai hồ sơ khi đặt hộ.
2. Cảnh báo nguy cơ sức khỏe phải có lối chuyển sang hỗ trợ thực tế; không dự đoán chẩn đoán.
3. Trạng thái nghiệp vụ phải tách: lịch xác nhận, check-in, chờ khám, đang khám, bác sĩ xem kết quả, đã truyền đạt, thanh toán và follow-up.
4. Gọi phòng khám phải tiếp cận ngay ở các màn quan trọng; không chỉ giấu trong cài đặt.
5. Không dùng màu làm tín hiệu trạng thái duy nhất, có văn bản và khả năng screen reader.
6. Không coi việc bấm nút chuyển khoản/hiện QR là đã thanh toán; cần xác nhận backend/đối soát.
7. Lịch nhắc qua SMS/Zalo chỉ chứa thông tin tối thiểu, mở đúng màn sau xác thực.
8. Không lưu thông tin bệnh nhân thật vào file nghiên cứu hoặc GitHub công khai.

## Cấu trúc 23 màn
A1–A2: khởi động; B1: trang chủ; C1–C6: đặt lịch/sàng lọc; D1–D3: lịch hẹn; E1–E4: check-in/telehealth; F1–F4: hậu khám; G1–G3: hồ sơ, thông báo, cài đặt.

## Chuỗi kiểm duyệt trước triển khai
- **Product/Operations:** chốt các trạng thái và SLA; trách nhiệm của từng vai trò.
- **Medical:** bộ câu hỏi sàng lọc và hướng dẫn trong tình huống nguy cấp, phạm vi khám từ xa, diễn giải xét nghiệm/đơn thuốc.
- **Legal/Privacy:** xử lý dữ liệu sức khỏe, đại diện hợp pháp, consent, retention, kênh thông báo.
- **Engineering:** HIS/EMR API, thanh toán có callback, đặt lịch tránh race, video fallback và audit log.
- **UX Research:** phỏng vấn/quan sát thực tế; đo first-click, task success, comprehension và accessibility.