# Nội dung cần phê duyệt và giới hạn tích hợp

Chế độ bàn giao: browser prototype, không có dịch vụ thật. Không cho phép dùng dữ liệu bệnh nhân thật trong sessionStorage. Quyền truy cập được kiểm tra trong browser để minh họa UX; backend phải xác thực và phân quyền lại độc lập trước khi dùng thật.

| Màn | Nội dung/tích hợp chưa có | Owner trước production | Hành vi prototype |
|---|---|---|---|
| A1/A2 | SMS OTP, rà trùng server, định danh | Identity/Reception | OTP thử123456, fixture hồ sơ cũ, không gửi SMS |
| C3/C4 | Danh sách dấu hiệu, triage/hướng dẫn cấp cứu được duyệt | Medical director | Một câu hỏi về nhu cầu trợ giúp khẩn cấp; không chẩn đoán; cảnh báo không thể bị tự bỏ; cuộc gọi/chỉ đường mở thông báo giới hạn, không gọi/đưa tới cơ sở giả |
| C5/C9/D2 | Booking backend, slot inventory và staff review | Scheduling | pending/mode-review; staff events có guard nằm ngoài phone |
| E1/E3 | Địa chỉ, giấy tờ, giờ đến, số thứ tự và ETA | Reception | Chưa cung cấp; không bịa số hàng đợi hay hứa giờ |
| F1-F4 | Tên/hướng dẫn xét nghiệm, upload storage và lab integration | Lab/Medical | Chỉ định có trạng thái; tệp chỉ lưu metadata ở phiên, không upload bytes; không sinh hướng dẫn nhịn ăn |
| G1-G5 | Thiết bị, camera/micro và video provider | Telehealth/Privacy | Controls đổi state, không request quyền thiết bị hoặc kết nối người thật |
| H2-H5 | Giá, ngân hàng, thu tiền, biên lai chính thức, chính sách hoàn tiền | Finance/Clinic | Không QR chuyển tiền, không số tiền bịa; “đã chuyển” chỉ pending; biên lai trong môi trường thử có mã RC, không có giá trị giao dịch |
| H6/H7 | Kết luận, đơn thuốc và diễn giải kết quả | Treating clinician | Empty state hợp lệ chờ tài liệu được chia sẻ, không dựng toa thuốc/diagnosis; review/notification/explanation tách riêng |
| I1-I5/J1 | Phản hồi thực, clinical escalation, chuyên khoa, ngày tái khám | Care coordinator/Medical | Lưu vào phiên, staff event/notification riêng; không hứa thời gian phản hồi; không đưa hướng dẫn điều trị tự sinh |
| K1/K4/K5 | Push/SMS/Zalo delivery, consent/legal/contact/hours | Privacy/Operations | Generic notification preview, local preferences, chưa có số phòng khám để gọi |

Thiếu trong source được truy cập: file14/15, bản gốc11/12, Deep Research UX Writing. Nội dung bổ sung là quyết định thiết kế/audit, không phải phát hiện từ nghiên cứu bệnh nhân.

Tham khảo primary cho số cấp cứu 115: https://soyte.hanoi.gov.vn/hoat-dong-cua-nganh/xuyen-tet-hon-60-don-vi-thuong-truc-cap-cuu-115-phuc-vu-nhan-dan-2849260217223713116.htm . Đây không phải sự phê duyệt nội dung triage của CareFlow.
