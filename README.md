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

## CareFlow Clinic — Desktop portfolio showcase

Bản **desktop tương tác dành cho bác sĩ** nằm trong [staff-prototype](staff-prototype/index.html). Đây là dự án portfolio với dữ liệu giả lập; không có backend, xác thực nhân viên thật hay tích hợp hệ thống y tế. Desktop và mobile dùng chung nhãn, trạng thái và [component contract](docs/design-system.md); font theo vai trò là Plus Jakarta Sans / Be Vietnam Pro.

```sh
node prototype/preview-server.cjs
# http://127.0.0.1:4175/staff-prototype/index.html
```

Các màn hiện tại gồm Tổng quan bác sĩ, lịch khám, danh sách khám, hồ sơ bệnh nhân, chi tiết lượt khám, buổi khám, kết quả và các bước bàn giao/theo dõi. Tổng quan ưu tiên buổi đang khám → việc cần quyết định → kết quả chưa xem → lịch trong ngày. Tương tác chỉ mô phỏng trong phiên và giữ quyền thao tác của bác sĩ. Xem [hướng dẫn desktop](staff-prototype/README.md) và workflow QA riêng.
