# CareFlow+ Cards V2 — Progress & local preview

**Branch:** `redesign/cards-v2`. **PR:** https://github.com/Ngh1aa/Patient-Journey-App/pull/46 (DRAFT). **Release policy:** giữ `main` không đổi, không auto-merge, chỉ merge khi người dùng nhắn chính xác **“chốt”**.

## Đợt 0 — Research + pre-code audit (đã thực hiện)

- [x] `docs/card-design-rules.md`: 12 quy tắc Apple/Material/NNg/WCAG, hạn chế y tế.
- [x] `docs/card-audit.md`: 133 card/pattern slots trên 47 mobile + 17 doctor route patterns.
- [x] Xác minh codebase `prototype/` + `staff-prototype/` và bảo toàn doctor-only scope.
- [x] Căn cứ UIUX Factory: `AGENTS.md`, `START-HERE.md`, contract ownership, design-system, accessibility, mobile preview, dashboard.

## Đợt 1 — Shared foundation + Home/doctor key cards (đang review)

- [x] `design/cards-v2.css`: **duy nhất nguồn runtime v2** cho màu, typography, spacing, radius, button/section/card/state.
- [x] `design/cards-v2.js`: dùng chung data/empty/loading/error/zero/unread/pressed, metric format, section/card HTML; không chạm state nghiệp vụ.
- [x] Import shared CSS/JS vào mobile/doctor.
- [x] Mobile Home: hero heading, tổng quan bỏ leading zero, lối tắt 2×2 kèm thông tin đúng fixture, container section; nội dung gia đình có số hồ sơ.
- [x] Mobile `section()`: dùng header + container chung, không thêm medical behavior.
- [x] D1 empty tabs: Sắp tới vẫn có CTA đặt; Đã khám/Đã hủy đổi sang secondary 'Xem lịch sắp tới'.
- [x] Desktop doctor: Be Vietnam Pro family, tokenized surfaces, card empty và unread statuses; không đổi role/guards/workflow.
- [ ] Hoàn tất migration *mọi* template đặc biệt, tokens legacy CSS, user states, visual QA, a11y và sự đồng ý người dùng.

## Đợt 2 — Contextual cards mobile (đã triển khai, cần review)

- [x] Các tile hướng dẫn/hỗ trợ trong `prototype/careflow-experience.js` dùng `cf2-card`, `cf2-grid` và `cf2-section`; vẫn giữ nguyên action routing và nội dung an toàn.
- [x] `prototype/careflow-experience.css` chuyển màu, radius, spacing, typography, focus và hit-area chính sang token `--cf2-*`; không thêm dữ liệu lâm sàng.
- [x] Kiểm tra trực tiếp Home mobile ở `#/home` và Doctor dashboard ở `#/doctor` trên localhost; nội dung thật/empty state vẫn hiển thị được.
- [ ] Chưa hoàn tất migration toàn bộ CSS legacy còn lại; chưa có visual matrix cho đủ 47 màn mobile và mọi desktop route.

## Đợt 3 — Compact editorial visual pass (đã triển khai, cần review)

- [x] Đồng bộ page/surface/text/border/shadow/radius/spacing token trong `design/cards-v2.css` và `design/tokens.json`.
- [x] Rút gọn Home và appointment rich cards bằng line-clamp, task rail density và compact list spacing; không cắt nội dung safety/critical.
- [x] Áp dụng surface language chung cho các doctor dashboard card legacy; kiểm tra trực tiếp `#/home`, `#/appointments`, `#/doctor` trên HTTPS preview.
- [ ] Chưa migrate hết hardcoded literals trong legacy CSS; chưa rà đủ mọi route/state.

## Chạy trên máy bạn (từ repository root)

```powershell
git fetch origin
git switch redesign/cards-v2
npm ci --prefix prototype
npx --prefix prototype playwright install chromium webkit
node prototype/preview-server.cjs
```

Mở trong trình duyệt:

- Mobile: http://127.0.0.1:4175/prototype/index.html?scenario=empty#/home
- Mobile lịch có dữ liệu: http://127.0.0.1:4175/prototype/index.html?scenario=appointments#/appointments
- Desktop bác sĩ: http://127.0.0.1:4175/staff-prototype/index.html#/doctor

Dùng tab terminal khác để kiểm thử:

```powershell
npm run check --prefix prototype
npm run test:model --prefix prototype
npm run test:e2e --prefix prototype
node --test staff-prototype/test.cjs
node prototype/node_modules/@playwright/test/cli.js test --config=staff-prototype/playwright.config.cjs
```

**Với nhánh chưa merge:** GitHub Pages mặc định `main` sẽ **không** cập nhật. Dùng localhost hoặc screenshot/evidence từ CI PR; không dùng link public main để đánh giá V2.

## Evidence & hạn chế

- CI GitHub PR chạy Chromium/WebKit patient routes và dashboard bác sĩ trên runner localhost; trạng thái từng run xem trực tiếp trên PR #46.
- Môi trường hiện tại không thể clone trực tiếp bằng Git vì DNS `github.com` không phân giải; không ghi câu **'đã chạy localhost độc lập'**.
- Toàn app còn hardcoded values ở CSS legacy, khảo sát từng trang/DOM card chưa hoàn tất; cần tiếp tục wave 2+.
- Không có real backend, dữ liệu khám và kết quả hoàn toàn synthetic. Các trạng thái loading/error trong thư viện là presentation contract, không giả mạo network request.
- Hai font vai trò heading/body cùng family Be Vietnam Pro. Chữ 200% phải ưu tiên không clip và không mất thông tin cấp cứu.
- **Chưa bàn giao** bản design tất cả card, chưa đủ cơ sở gọi hoàn thành.
