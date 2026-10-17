# CareFlow+ Cards V3 — TODO

## Wave A — Foundations và Home

- [x] Đồng bộ semantic tokens cho mobile và doctor card mà không thay đổi luồng nghiệp vụ.
- [x] Làm lại hierarchy Home theo thứ tự ưu tiên: lịch gần nhất → việc cần làm → tổng quan → shortcut → sau khám; giảm CTA trùng và copy dài bằng compact pass.
- [x] Chuẩn hóa hero, metric, bento shortcut, task/list và empty state trên Home ở shared visual layer.

## Wave B — Patient journey và lịch hẹn

- [ ] Chuyển C1–C9, D1–D4, E1–E3 sang card variant phù hợp: choice, facts, status, list và danger alert.
- [ ] Chuẩn hóa tab Sắp tới/Đã khám/Đã hủy và empty copy theo từng ngữ cảnh.
- [ ] Giữ cảnh báo an toàn, quyền truy cập, QR và 115 không bị làm mờ hoặc đổi nghiệp vụ.

## Wave C — Lab, online care, aftercare và support

- [x] Rút gọn list kết quả, chỉ định, đơn thuốc và follow-up ở shared rich-content layer; giữ metadata đủ để quyết định.
- [ ] Chuẩn hóa checklist, upload, payment, online preflight và trạng thái retry/loading/error.

## Wave D — Doctor desktop

- [ ] Đồng bộ encounter, decision, result, agenda, online handoff và follow-up theo cùng density/token.
- [ ] Giảm decorative/stat card; ưu tiên bệnh nhân, lượt khám, giờ, trạng thái, owner và action kế tiếp.

## Verification

- [ ] Chạy syntax/model/card token checks sau mỗi wave.
- [ ] Inspect localhost ở mobile 320/375/390px, large-text và desktop 1280px.
- [ ] Cập nhật `docs/card-audit.md` trạng thái sau từng wave; không merge `main` nếu chưa có tin nhắn “chốt”.
