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
6. [06 — Information Architecture & Navigation (23 screens)](06-information-architecture.md).
7. [07 — Chín patient user flows, nhánh lỗi & recovery](07-patient-user-flows.md).
8. [08 — State contracts, phân quyền và edge cases](08-state-contracts-permissions.md).
9. [09 — Đặc tả & acceptance criteria cho 23 màn](09-screen-specifications-acceptance.md).
10. [10 — 13 câu hỏi xác nhận, release gate & evidence registry](10-validation-backlog-evidence.md).

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

## Giai đoạn 2 — Bản nghiên cứu chuyển thành đặc tả trước UI
- **06**: phân cấp nội dung, bottom navigation và liên kết màn hình; 1 sơ đồ Mermaid (không phải nhân chứng định lượng).
- **07**: 9 nhiệm vụ F01–F09: đặt lịch bản thân/người thân, sàng lọc, khám trực tiếp, online, thanh toán, kết quả, chăm sóc sau khám, tái khám.
- **08**: hợp đồng trạng thái riêng cho lịch, encounter, xét nghiệm, video, thanh toán, callback & proxy; 15 edge cases mẫu.
- **09**: 23/23 màn, đề xuất CTA, màn lỗi, data và kịch bản kiểm thử D01–D10.
- **10**: backlog 13 câu hỏi có owner và 7 hạng mục đối chiếu nguồn chính thức cập nhật 2026; các blockers P0 Critical phải qua phê duyệt chuyên môn.

**Quyết định:** Chưa thực hiện khảo sát thực địa, chưa kiểm thử ứng dụng đối thủ end-to-end, chưa chốt backend/clinical/legal SOP. Không merge PR trước khi reviewer đồng ý; nhánh chỉ chứa tài liệu, không chứa dữ liệu bệnh nhân.
