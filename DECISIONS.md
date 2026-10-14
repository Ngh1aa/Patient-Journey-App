# Nhật ký Quyết định Thiết kế & Kỹ thuật (CareFlow v2 DECISIONS.md)

Tài liệu này ghi nhận các quyết định kiến trúc, lựa chọn mặc định an toàn và các điểm điều chỉnh theo tài liệu đặc tả CareFlow v2.

---

## 1. Quyết định về Nền tảng & Stack (Phase 1)
* **Quyết định:** Tái sử dụng 100% stack Vanilla JS/CSS/HTML trong thư mục `prototype/`, không tạo framework hay scaffold mới.
* **Lý do:** Tuân thủ nguyên tắc không phá vỡ cấu trúc có sẵn và giữ tính tương thích với bộ kiểm tra deterministic `node prototype/tests.cjs` (26/26 tests).

## 2. Quyết định về Typography & Font Tokens (v2)
* **Quyết định:** Áp dụng bảng cỡ chữ v2 với font stack Apple / System-UI (`Inter`, `SF Pro Display`, `SF Pro Text`, sans-serif):
  * Display: 28px / 36px / 700
  * H1: 24px / 32px / 700
  * H2: 20px / 28px / 700
  * H3: 17px / 24px / 700
  * Body: 17px / 24px / 400
  * Body nhỏ: 15px / 22px / 400
  * Label: 15px / 20px / 600
  * Caption: 13px / 18px / 400
* **Quy tắc:** Không chữ nào nhỏ hơn 13px; nội dung y tế và nút hành động tối thiểu 15px; text-wrap tự nhiên không cắt cụt.

## 3. Quyết định về Bo góc & Đổ bóng (v2)
* **Quyết định:** Thiết lập các biến CSS:
  * `--radius-control: 14px;` (cho button, input)
  * `--radius-card: 20px;` (cho standard card)
  * `--radius-hero: 24px;` (cho appointment hero card)
  * `--radius-sheet: 28px;` (cho bottom sheet, 2 góc trên)
  * `--radius-pill: 999px;` (cho status chip, floating tab bar)
  * `--shadow-card: 0 4px 20px rgba(18, 59, 99, 0.08);`
  * `--shadow-bottom-bar: 0 8px 30px rgba(18, 59, 99, 0.15);`

## 4. Quyết định về Màu sắc & Tương phản WCAG 2.1 AA (v2)
* **Quyết định:**
  * Tab inactive: sử dụng `#5E7285` (đạt 4.97:1 trên nền trắng, vượt chuẩn 4.5:1).
  * Warning tag: điều chỉnh từ `#986A00` sang `#8A5F00` trên nền `#FFF4D6` để đạt 5.15:1 (vượt chuẩn 4.5:1 của WCAG AA).
  * Placeholder / gợi ý input: `--color-text-500` (`#6F8294`) chỉ dùng cho placeholder, không dùng cho nội dung cần đọc.
  * Tỷ lệ màu Accent (`#0A67D1`): duy trì dưới 10% diện tích màn hình để tạo cảm giác trang nhã, tin cậy.

## 5. Quyết định về Thanh Tab dưới Nổi (Floating Pill Tab Bar)
* **Quyết định:** Thanh tab nổi dạng viên thuốc (`border-radius: 999px`), cách mép 12px hai bên, cách đáy 12px + safe-area, cao 68px, nền trắng có bóng nổi.
* **Quy tắc đệm:** Mọi màn hình có thanh tab đều có `padding-bottom: 100px` để không che khuất nội dung hay nút chính.
* **Ẩn thanh tab:** Ở các màn A1, A2, và C1 đến C6 để giữ độ tập trung cho người bệnh.

## 6. Quyết định về An toàn Y tế & Cảnh báo Nguy cơ (C3)
* **Quyết định:**
  * Đặt cờ `[MEDICAL REVIEW REQUIRED]` trong mã nguồn và giao diện.
  * Số cấp cứu đọc từ `config.EMERGENCY_NUMBER` (mặc định: `115`).
  * Nút "Tôi vẫn muốn đặt lịch": mở bảng xác nhận có checkbox bắt buộc *"Tôi xác nhận triệu chứng đã ổn định và chịu trách nhiệm tiếp tục đặt lịch hẹn"*; chỉ khi tick mới mở khóa nút tiếp tục, và lưu cờ `safetyAcknowledged = true`.
  * Không có nút Back tự do thoát khỏi C3 mà không qua xác nhận.

## 7. Quyết định về Tính năng ngoài MVP & Chống Nút chết (Mục 1.6)
* **Quyết định:** Xây dựng component `FeatureSoonSheet` (bảng trượt) hiển thị:
  * Tiêu đề: *"Tính năng này sẽ sớm có"*
  * Nội dung: Giải thích đây là bản mô phỏng
  * Nút chính: *"Gọi phòng khám (1900 6868)"*
  * Nút phụ: *"Để sau"*
* **Áp dụng:** Toàn bộ 13 trạng thái ở D2 đều có nút chính hoạt động (các nút ngoài MVP như check-in, số thứ tự, phòng chờ video, thử lại khi rớt mạng đều kích hoạt FeatureSoonSheet hoặc kịch bản khôi phục, không có nút chết).

## 8. Quyết định về Máy trạng thái Cuộc hẹn (`canTransition`)
* **Quyết định:** Cài đặt hàm `canTransition(from, to)` chặt chẽ theo Bảng 2.1 của đặc tả v2:
  * `pending` -> `confirmed`, `cancelled`
  * `confirmed` -> `reminder`, `online-waiting`, `cancelled`
  * `reminder` -> `arrived`, `no-show`, `cancelled`
  * `arrived` -> `waiting`
  * `waiting` -> `delayed`, `results-pending`, `reviewed`
  * `delayed` -> `waiting`, `cancelled`
  * `online-waiting` -> `waiting`, `connection-failed`
  * `connection-failed` -> `online-waiting`, `cancelled`
  * `results-pending` -> `results-ready`
  * `results-ready` -> `reviewed`
  * `no-show`, `cancelled` -> đặt lại bằng lịch mới
  * `reviewed` -> kết thúc
* **Format thời gian chuẩn:** Hàm `formatAppointmentDateTime(iso)` chuẩn hóa: `09:30 · Thứ bảy, 20/06`.

## 9. Bảng điều khiển Demo (Demo Controls)
* **Quyết định:** Mở bảng điều khiển ẩn bằng cách chạm 3 lần (triple tap) vào tiêu đề của B1 (`Xin chào...`). Cung cấp menu chuyển nhanh 12 trạng thái lịch, toggle offline, toggle slot collision, toggle lỗi mạng và reset mock data.
