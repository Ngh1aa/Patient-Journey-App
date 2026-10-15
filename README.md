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

Bản **desktop hi-fi tương tác 8 màn** dành cho lễ tân và bác sĩ nằm trong [staff-prototype](staff-prototype/index.html). Đây là dự án portfolio với dữ liệu giả lập, dùng chung nền tảng màu và Be Vietnam Pro của CareFlow; không có backend, xác thực nhân viên thật hay tích hợp hệ thống y tế.

```sh
node prototype/preview-server.cjs
# http://127.0.0.1:4175/staff-prototype/index.html
```

Các màn W01–W08: Tổng quan lễ tân, lịch tuần, danh sách bệnh nhân, hồ sơ, chi tiết lịch (drawer), tổng quan bác sĩ, buổi khám và kết quả. Có tương tác xác nhận/đổi giờ, tìm kiếm, lưu ghi nhận và xem kết quả, chỉ mô phỏng trong phiên. Xem [hướng dẫn desktop](staff-prototype/README.md) và workflow QA riêng.
