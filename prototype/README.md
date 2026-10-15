# CareFlow v3 — 47-screen mobile browser prototype

Chạy từ repository root: `node prototype/preview-server.cjs`; mở http://127.0.0.1:4175/prototype/index.html . Không cần build/bundler. Xem docs/product-brief.md và docs/screen-flow-matrix.md.

## Trải nghiệm
Bắt đầu ở A1, nhập SĐT thử 0900000000, OTP thử123456. Dữ liệu chỉ ở sessionStorage. Thanh Bản demo luôn hiện ngoài phone. Công cụ đánh giá cho phép nạp hồ sơ/lịch thử, đi đến route và áp dụng staff event hợp lệ. Chọn màn không bỏ guard. Đặt lại để xóa phiên.

Hồ sơ mới: A1→A3; fixture Hồ sơ đã có: A1→A2. Phiếu D2 là hub. Staff update xác nhận lịch, nhắc lịch, tiếp nhận, bác sĩ gọi/kết thúc, lab review, đối soát/hoàn tiền được tách ngoài UI bệnh nhân. Không có tác vụ giao dịch thật hoặc hướng dẫn y tế được phê duyệt.

## Source owners
- model.js: 47 registry, pure state guards, fixtures, permission.
- strings.vi.js: Vietnamese copy shared, external demo copy tách riêng.
- views.js/icons.js: component helpers và composed screens, reuse icon family cũ.
- app.js: hash navigation, forms, session, controlled simulator.
- styles.css: semantic tokens, 360/390px, chữ 200%, focus và safe areas.
- tests.cjs + browser-tests/journeys.spec.cjs: state and browser acceptance.
- legacy-tests/: hợp đồng cũ trước file13, giữ tham khảo; không phải suite hiện hành.

## Kiểm thử
`npm ci`, `npx playwright install chromium webkit`, `npm run test:all`. Config dùng Node HTTP server cùng test, chạy root và /Patient-Journey-App subpath. Playwright Chromium/WebKit là browser QA, không chứng minh native iOS/Android. Model và screenshot/accessibility/flow gates độc lập.
