# CareFlow — triển khai 11 Soft Float & 12 UI Copy (24 màn)

**Nguồn yêu cầu người dùng:** `11-visual-style-and-layouts(1).md` và `12-ui-copy-vi.md`, cung cấp ngày 15/10/2026.  
**Phạm vi:** browser mobile preview, HTML/CSS/JavaScript; không phải native app/production healthcare.

## Quy tắc ưu tiên
1. **File 12** là nguồn nội dung tiếng Việt cho bệnh nhân, với placeholder `[...]` chưa được phê duyệt.
2. **File 11** điều khiển bo góc, bóng, mẫu giao diện, không được thay đổi logic khám/đặt lịch hoặc thẩm quyền lâm sàng.
3. Bảo vệ bệnh nhân cao hơn sự tiện lợi demo: nội dung C3 trong file 12 có nút tiếp tục sau tự xác nhận, nhưng người bệnh không thể tự bỏ cờ nguy hiểm. Mẫu vẫn hiển thị giải thích/xác nhận như yêu cầu và giữ luồng đặt lịch tự động khóa tới khi nhân viên có chuyên môn xử lý.

## Cấu trúc
| Đường dẫn | Trách nhiệm |
|---|---|
| `prototype/strings.vi.js` | Bảng nội dung tập trung cho các màn A1–H1; trạng thái, lỗi, thông báo |
| `prototype/styles.css` | Soft Float token áp dụng riêng cho mockup điện thoại: nền `#F2F6FB`, hero xanh `#0A67D1`, thẻ R24, hero R28, nút R26, tab nổi R34, vùng an toàn, Be Vietnam Pro |
| `prototype/app.js` | Màn và trạng thái tương tác cho 24 mã màn, luồng thanh toán/chăm sóc/hồ sơ mô phỏng |
| `prototype/model.js` | Danh mục 24 màn và guard khám, đặt hộ, kết quả; không phải clinical decision engine |
| `prototype/index.html` | Giữ nguyên ba cột màn hình lớn; mobile có menu chọn 24 màn |
| `prototype/browser-tests/soft-float.spec.cjs` | Luồng kiểm thử responsive, an toàn C3, ngày giờ, xét nghiệm, video, thanh toán, ngôn ngữ |
| `prototype/wireframe-board.svg` | Danh mục 24 màn, thêm H1 |

## Ma trận màn
| ID | Mục tiêu | Thành phần/chi tiết Soft Float |
|---|---|---|
| A1 | Đăng nhập | OTP 6 vị trí, nút viên thuốc, gọi phòng khám |
| A2 | Tạo hồ sơ | Form nhãn cố định, nút chính Tạo hồ sơ |
| B1 | Trang chủ | Thẻ hero lịch sắp tới, người khám, việc cần làm |
| C1 | Chọn người khám | Thẻ chọn người, phân quyền đặt hộ |
| C2 | Lý do & an toàn | Chip lý do, câu hỏi dạng mô phỏng không chẩn đoán |
| C3 | Cảnh báo | Thông tin chờ bác sĩ duyệt, nút cấp cứu mô phỏng, guard nghiêm ngặt |
| C4 | Ngày giờ | Dải ngày được tạo theo ngày hiện tại, chip chọn giờ, mode |
| C5 | Xác nhận | 5 trường thông tin, checkbox điều khoản, trạng thái lỗi |
| C6 | Đặt lịch xong | Tách pending/confirmed, mã lịch mẫu |
| D1 | Danh sách lịch | Bộ lọc, thẻ lịch, trạng thái |
| D2 | Chi tiết | Timeline, vai trò phụ trách, CTA theo status |
| D3 | Đổi/hủy | Lý do, xác nhận modal hai bước |
| E1 | Check-in | Số thứ tự nổi bật, tình trạng quầy/đến lượt |
| E2 | Thiết bị | Kiểm tra camera, micro, mạng và phòng chờ |
| E3 | Video | Khung đen mô phỏng, bật/tắt thiết bị, chuyển gọi thoại |
| E4 | Mất kết nối | Thử lại, gọi lại, đổi online/trực tiếp |
| F1 | Thanh toán | QR mẫu, thu tại quầy/nhà thuốc, chờ đối soát, hoãn thanh toán |
| F2 | Kết quả | Phân quyền kết quả, đơn thuốc và trạng thái bác sĩ xem |
| F3 | Xét nghiệm | Timeline chỉ định, đặt hẹn, thông tin chuẩn bị placeholder |
| F4 | Hỏi phòng khám | Chat/báo triệu chứng/gọi lại theo hồ sơ |
| G1 | Hồ sơ | Danh sách người thân, chọn hồ sơ và quyền |
| G2 | Thông báo | Mở đúng lịch/kết quả theo quyền |
| G3 | Cài đặt | Cỡ chữ, nhóm tùy chọn và công tắc |
| H1 | Hỗ trợ | Hero hỗ trợ, liên hệ, câu hỏi thường gặp |

## Quy tắc không suy diễn
- **Không có** SMS OTP, video call, gọi cấp cứu, QR thanh toán, kết nối bệnh án hay người dùng thật.
- Không lưu trữ hoặc gửi thông tin y tế của người dùng thực tế. Tất cả dữ liệu trong preview là dữ liệu tạo sẵn.
- `[Tên xét nghiệm]`, `[Phí dự kiến]`, `[Chính sách đổi, hủy]`, `[Số điện thoại phòng khám]`, `[Dấu hiệu cảnh báo]`, SLA gọi lại và thông báo giờ làm việc **chưa xác minh**.
- Phải có đánh giá lâm sàng, vận hành, tài chính và pháp lý trước khi dùng trên bệnh nhân.
- Việc kiểm thử trình duyệt giả lập không tương đương kiểm thử thiết bị thật / kiểm thử khả dụng với bệnh nhân.

## Nghiệm thu trước merge
- Syntax check và Model tests; không tự dỡ bỏ safety guards chỉ để có PASS.
- Color contrast kiểm tra màu thực tế cho các cặp được định nghĩa; không đánh đồng với full WCAG.
- Chromium và WebKit mobile, 360 × 800 và 390 × 844, modal/call/switch patient/giờ hết/mạng lỗi.
- Chụp ảnh và review thực tế giao diện, không chỉ xét workflow xanh.
