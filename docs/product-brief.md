# CareFlow — Product brief và kế hoạch thực thi

Ngày 15/10/2026. Browser prototype, HTML/CSS/JavaScript. Baseline main 8f26983; 24 màn và 26 model assertions PASS trước thay đổi.

## Vấn đề và đối tượng
Bệnh nhân đặt và theo dõi khám trên điện thoại cần biết lịch nào, ai đang xử lý, việc tiếp theo. Baseline trộn trạng thái kết quả với lượt khám, sai ID mới và chưa đủ nhánh. Sự mơ hồ có thể khiến hiểu nhầm đặt lịch/thanh toán đã hoàn tất.
Primary: người tự đặt khám, ít quen công nghệ, cần đọc nhanh khi đang lo lắng; dùng màn 360/390px và chữ lớn. Secondary: người đặt hộ, chỉ có quyền đặt, không tự có quyền xem kết quả. Nhân viên/quản trị không thuộc app.

## JTBD
- Khi đặt khám lần đầu, tôi muốn kiểm tra người khám và giờ trước khi gửi để tránh đặt nhầm.
- Khi đến ngày hẹn, tôi muốn biết phòng khám đang xử lý bước nào để không phải đoán.
- Khi có kết quả hoặc phí khám, tôi muốn thấy trạng thái và việc tiếp theo để không bỏ sót.
Functional: hoàn thành F1–F12. Emotional: giảm sự không chắc chắn. Social: chăm sóc người thân nhưng tôn trọng quyền riêng tư.

## Nguồn, khoảng trống, thẩm quyền
VERIFIED: file đính kèm lưu nguyên văn ở 13-patient-journey-source.md; source app; research/08 và 09; design/tokens.json; prototype/IMPLEMENTATION-11-12.md.
MISSING: file 14/15, báo cáo Deep Research UX Writing, bản gốc file 11/12 (chỉ có dẫn chiếu/ghi chú triển khai). Không tự nhận các file này đã được đọc. Đã tìm tên/nội dung trong hai checkout và attachment folder hiện có.
Workflow: uiux-ai-workspace START-HERE → AGENTS → CONTRACT-OWNERSHIP → manifest → mobile-web-preview. Manifest lưu ngoài target work/careflow-manifest.json, release authority từ yêu cầu trực tiếp của người dùng, merge có điều kiện QA.

## Ràng buộc và quyết định
Giữ stack buildless và test dependencies. Dùng canonical model.js cho toàn bộ transition; app.js điều phối; render helpers tái sử dụng; strings.vi.js sở hữu patient copy. Hash routes để chạy GitHub Pages subpath và reload/Back. D2 trung tâm 1 lượt. Mỗi lượt có payment/labs/care/communication riêng; lượt mới liên kết lịch cũ. Không lưu PHI thật; state phiên demo cục bộ có reset, không backend. Lớp đánh giá bên ngoài khung có cảnh báo luôn hiện trên mobile. OTP, kết nối cuộc gọi, thanh toán và cập nhật nhân viên là synthetic và không đại diện giao dịch thật.
Soft Float: nền xanh xám, blue #0A67D1, card R24, CTA R26, tab R34; Be Vietnam Pro self-hosted; giảm bóng, nhấn hierarchy của một việc chính. Không đưa ID nội bộ vào patient UI.

## P1 → P2 → P3
P1: registry 47 route, copy/state foundation, A–E/J/K1/K5, safety/mode-review, reschedule/cancel/history. P2: F/G/H, lab communication, online recovery, payment guards/receipt/refund. P3: I/K2–K4, context/permissions, settings, conversations, complete QA/regression and handoff.
Mọi màn có form/data/action tương ứng; không dùng title-only scaffold. Medical copy, giá, bảo hiểm, địa chỉ, số phòng khám và refund policy phải được chủ chuyên môn duyệt; không tạo chỉ dẫn điều trị/thuốc.

## Chỉ số nghiệm thu (technical, không phải outcome)
Baseline 24 màn/26 model assertions. Target: 47/47 route, 12/12 flow với nhánh ngoại lệ, zero unhandled JS/critical a11y/overflow ở matrix yêu cầu. Chromium+WebKit thực chạy, WebKit Windows nếu runner không có thì CI Linux là gate. Screenshot review riêng với test logic. DIRECT_USER, native runtime, clinical approval UNKNOWN. Không suy ra conversion/task success của người thật.

## Scope
Must: tất cả 47 màn/F1–F12, copy/state/navigation/component/QA/PR. Out: backend thật, native build/store, dịch vụ y tế/OTP/video/payment thật. Hifi giữ làm reference cũ, prototype là renderer chuẩn. Không coi code/green CI là chứng cứ production healthcare.
