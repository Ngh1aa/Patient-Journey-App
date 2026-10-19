# Card v2 — QA và chạy local

> Hướng photo-led mới theo ảnh user và kết quả hiện tại: [photo-led-review.md](photo-led-review.md). Tài liệu dưới đây giữ lịch sử đợt trước.

Ngày18/10/2026; nhánh redesign/cards-v2; main vẫn ở25dfe12208299b2d40ecf1c4f59441302c1ba9c5. Local only, chưa push/PR/merge. Chờ đúng từ “chốt” trước khi merge.

Bản nháp chỉnh tiếp ngày18/10 (icon-only navigation, ảnh Unsplash, typography/layout) có kết quả riêng tại [draft-layout-refinement.md](draft-layout-refinement.md) và `card-evidence/draft-refinement/qa-summary.json`. Các số liệu dưới đây là baseline card-v2 trước lần chỉnh nháp đó.

## Kết quả
| Kiểm tra | Kết quả / phạm vi |
|---|---|
| JavaScript syntax | PASS: npm --prefix prototype run check + node --check các doctor entrypoints |
| Patient model |49/49 PASS |
| Doctor model |3/3 PASS |
| Doctor Playwright toàn bộ |132 PASS; Chromium1280/1440/1920, WebKit1440; pressure320–1920 và chữ200% trong tests |
| Doctor sau sửa touch/calendar |12 PASS; responsive composition, schedule, geometry trên4 projects |
| Patient toàn bộ lần đầu |301 PASS,7 FAIL,2 SKIP. Đây không phải một lần chạy toàn bộ xanh; giữ log gốc trong evidence. Các finding đã giải quyết bên dưới. |
| Patient hồi quy nhóm thay đổi |46 PASS,4 SKIP có điều kiện baseline rõ ràng; cả Chromium và WebKit |
| Card v2 mới + ngữ cảnh |22 PASS; per-visit persistence, logout, ICS, bộ lọc,44px,320–1440,200%,offline,đúng route online/aftercare |
| Accessibility16 states ×2 engines |2 matrix tests PASS sau sửa đường tokens; không axe violation và không console errors trong16 states/engine; không chứng nhận WCAG đầy đủ |
| Contrast |34 cặp token PASS; text>=4.5:1, focus/input boundary>=3:1; input boundary3.72:1 |
| Screenshot matrix |141 checks/47 màn×3 widths360/390/1440:0 page errors,0 overflow,0 broken images,0 undersized tested controls |
| Desktop touch |28 route×viewport checks ở375/1440:0 controls dưới44 CSS px trong phạm vi probe |
| CSS source gate |PASS;0 raw color literals ở shared component owner; legacy composition literals được liệt kê trong css-audit.json |

## Đối soát các lỗi lần chạy đầu
- Test cũ kỳ vọng booking caption ẩn và hero #10213c: cập nhật theo yêu cầu nhãn luôn hiện và navy #001D57, giữ và tăng assertions khác; nhóm hồi quy46 PASS.
- CSS @import relative khiến axe fetch nhầm `/prototype/tokens.css`: sửa root asset loading ở cả HTML entrypoints, tải `../design/tokens.css` trước components. Không thêm file alias, không bỏ console assertion. Axe matrix16states ở Chromium/WebKit đã chạy lại PASS.
- Utility trước/sau lịch sử cần hai server cổng4176/4175: nay chỉ chạy khi có CAREFLOW_BASELINE_URL; current baseURL lấy từ Playwright config.4 cases SKIP khi không có baseline lịch sử. Baseline/card audit v2 đã capture riêng trong docs.
- Có một worker không tìm được test title do thay title khi lượt test còn chạy: hoàn tất sửa rồi chạy lại toàn bộ nhóm liên quan, cả hai engines đều PASS. Không coi lỗi vận hành này là lỗi người dùng.

Log lần đầu, log sửa và digest tại `card-evidence/qa-results.json` cùng các `.txt`. Không cộng các lượt trùng nhau thành tổng số test duy nhất.

## Chạy local
Từ root repo trong PowerShell:

```powershell
$env:PORT='4186'
node .\prototype\preview-server.cjs
```

Patient showcase: http://127.0.0.1:4186/prototype/?journey=F1&branch=default#/appointments
Patient home: http://127.0.0.1:4186/prototype/?scenario=upcoming#/home
Doctor: http://127.0.0.1:4186/staff-prototype/#/doctor

## Chạy kiểm tra lại

```powershell
npm --prefix prototype run check
npm --prefix prototype run test:model
node --test staff-prototype/test.cjs
node design/check-card-contract.cjs
node prototype/check-contrast.cjs
$env:PORT='4186'
node prototype/node_modules/@playwright/test/cli.js test -c prototype/playwright.config.cjs --workers=2
node prototype/node_modules/@playwright/test/cli.js test -c staff-prototype/playwright.config.cjs --workers=2
```

Grep đã thực hiện: `rg -n '#[a-fA-F0-9]{3,8}|rgba?\(' design/components.css`;0 matches. Xem thống kê pixel/color literals theo file trong css-audit.json. Không có TypeScript/lint/build script riêng ở buildless project; syntax/model/browser là các kiểm tra phù hợp hiện tại.

## Việc còn lại / giới hạn
- Chưa có phản hồi người dùng thật, native iOS hoặc screen reader thủ công; HIG44pt là định hướng, browser gate dùng44 CSS px.
- Nội dung lâm sàng/phí/địa điểm thiếu dữ liệu không được bịa bổ sung. Prototype lưu phiên, không gọi/tạo giao dịch/gửi dữ liệu thật.
- Legacy composition CSS còn giá trị hardcode; card foundation dùng semantic tokens. Không mở rộng thành rewrite toàn bộ stylesheet để có con số0 giả.
- Chưa push/PR/merge/deploy; không có cấp quyền release từ kết quả QA. Chỉ merge main sau khi người dùng nhắn chính xác “chốt”.
