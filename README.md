# CareFlow — Patient Journey App

Browser prototype dành cho bệnh nhân, 47 màn theo danh mục file13, HTML/CSS/JavaScript. Renderer hiện tại ở [prototype](prototype/index.html). Dịch vụ y tế/OTP/video/thu phí đều thử nghiệm; không nhập dữ liệu cá nhân thật.

```sh
npm ci --prefix prototype
node prototype/preview-server.cjs
# http://127.0.0.1:4175/prototype/index.html
npm --prefix prototype run test:all
```

[Danh mục và flow](docs/screen-flow-matrix.md) · [Nguồn file13](docs/13-patient-journey-source.md) · [Product brief](docs/product-brief.md) · [Design system](docs/design-system.md) · [QA](docs/qa-results.md)

File14/15, bản gốc11/12 và Deep Research UX Writing chưa tìm thấy trong hai checkout/attachment được cung cấp. Clinical/legal/ops approval, backend thật, native QA và direct-user validation chưa có. hifi/ và wireframe-board.svg là tài liệu lịch sử trước file13; không dùng danh mục cũ để nghiệm thu hiện tại.

## Bản dùng thử đầy đủ (chỉ thiếu backend)

Mở `prototype/?scenario=demo#/login` (đăng nhập bằng SĐT bất kỳ, mã `123456`) hoặc `?scenario=demo-member#/home` để vào thẳng. Dữ liệu ban đầu lấy từ một file duy nhất, [data/careflow-seed.js](data/careflow-seed.js); mọi thay đổi lưu trong sessionStorage của tab ([data/careflow-store.js](data/careflow-store.js)) nên còn nguyên khi chuyển màn hay tải lại. Nút **Đặt lại dữ liệu demo** (thanh trên cùng hoặc Cài đặt) nạp lại dữ liệu ban đầu.

- Người bệnh: đặt lịch theo chuyên khoa/bác sĩ, giờ và lý do; phiếu khám; đổi lịch; hủy có lý do; sắp tới/đã khám/đã hủy; kết luận và kết quả; đơn thuốc (`#/medications`) với yêu cầu cấp lại; sửa hồ sơ có kiểm tra từng trường (`#/profile/edit`); người thân thêm/xem/sửa/xóa (`#/profile/family`); bảo hiểm (`#/profile/insurance`); yêu cầu hỗ trợ có luồng trao đổi, trả lời, đóng/mở lại (`#/support/tickets`); thông báo đánh dấu đã đọc.
- Phòng khám: `staff-prototype/#/ops/queue` (hàng chờ hôm nay, check-in, bắt đầu và hoàn tất khám, ghi chú nội bộ, tạo việc hoặc hẹn tái khám), `#/ops/tasks` (tạo, sửa, hoàn thành, xóa việc), `#/ops/tickets` (trả lời người bệnh). Hai app dùng chung dữ liệu khi mở trong cùng một tab.
- Mỗi danh sách có trạng thái trống; mã không tồn tại hiện “Không tìm thấy”; tải và lưu có độ trễ mô phỏng. **Tùy chọn → Mô phỏng lỗi kết nối** (hoặc “Mô phỏng lỗi” ở phòng khám) làm lần tải/lưu kế tiếp thất bại, kèm nút Thử lại; dữ liệu không đổi khi lỗi.
- Thuốc, kết quả và ghi chú đều là nội dung minh họa với người bệnh hư cấu; không có thao tác y tế thật nào được thực hiện.

```sh
py -3 -m http.server 8903 --bind 127.0.0.1          # từ thư mục gốc repo
NODE_PATH=<thư mục có playwright> node tests/full-product.e2e.cjs
```

## CareFlow Clinic — Desktop portfolio showcase

Bản **desktop tương tác dành cho bác sĩ** nằm trong [staff-prototype](staff-prototype/index.html). Đây là dự án portfolio với dữ liệu giả lập; không có backend, xác thực nhân viên thật hay tích hợp hệ thống y tế. Desktop và mobile dùng chung nhãn, trạng thái và [component contract](docs/design-system.md); font theo vai trò là Plus Jakarta Sans / Be Vietnam Pro.

```sh
node prototype/preview-server.cjs
# http://127.0.0.1:4175/staff-prototype/index.html
```

Các màn hiện tại gồm Tổng quan bác sĩ, lịch khám, danh sách khám, hồ sơ bệnh nhân, chi tiết lượt khám, buổi khám, kết quả và các bước bàn giao/theo dõi. Tổng quan ưu tiên buổi đang khám → việc cần quyết định → kết quả chưa xem → lịch trong ngày. Tương tác chỉ mô phỏng trong phiên và giữ quyền thao tác của bác sĩ. Xem [hướng dẫn desktop](staff-prototype/README.md) và workflow QA riêng.
