# Design System rollout — 19/10/2026

## Phạm vi và authority

- 47 patient screens từ model;15 active staff routes. Các route khác/legacy redirects không được tính thành UI mới.
- Chỉ presentation. Không sửa prototype/model.js, journey transitions, authorization, payments/labs/care state contracts. Không thêm dependency, backend, clinical policy hay kết quả y khoa.
- Nhánh redesign/cards-v2; main giữ25dfe12208299b2d40ecf1c4f59441302c1ba9c5. Không commit/push/merge trong đợt này. User phải nhắn đúng “chốt” trước merge.
- Request all-screen đã thay các mốc chờ duyệt component và Home trước đó.

## Thay đổi theo nhóm

| Nhóm | Áp dụng |
|---|---|
| Auth | Minh họa phòng khám đồng bộ, form OTP/hồ sơ thật, CTA đen; bỏ overlay ảnh cũ che artwork |
| Home | Lịch tiếp theo → tổng quan → quick access → việc cần làm → profile/question bento → aftercare/guide/help;1–2booking entry kể cả FAB, không 00 |
| Booking | Chung stepper 4 nhóm, input/choice/date/slot/facts/actions; giữ nhánh C3/C4/C5 và flow đủ 47 ID |
| Appointment/ticket | Tab một dòng; tìm/lọc có nhãn, avatar trung tính, doctor/patient/date/mode/reason/status, management trước QR và hướng dẫn |
| Labs/results | Artwork tài liệu phẳng; loại bỏ photo overlay; tên chỉ định, trạng thái, tệp và action giữ đúng visit/lab |
| Online | Camera/mic checks, call controls và recovery giữ logic; foreground/background được kiểm lại trên theme sáng |
| Profile/support | Identity rõ, người thân grid, question/contact actions, request form/history, FAQ disclosure, logout outline có icon |
| History/settings | Filter có pressed state rõ, facts theo role, settings/empty/form actions thống nhất |
| Desktop | Cùng token/type/action hierarchy, giữ tables/queue/clinical columns; font local, không gọi Google Fonts |

## Kiểm tra

**Browser: 370/374 PASS, 4 SKIP, 0 FAIL** trên Chromium/WebKit, không flaky. [Kết quả hợp nhất](browser-validation.json), [full run](base-results.json), [targeted rerun](recheck-results.json). Full run có364 PASS/6 FAIL/4 SKIP: sáu assertion đòi nút disabled đen trái với yêu cầu disabled xám. Assertion đã tách enabled/disabled, rerun6 route-matrix cases cùng2 auth artwork occlusion cases:8/8 PASS. Không bỏ kiểm tra hay đổi UI về đen cho nút disabled để lấy PASS.4 SKIP chỉ là before/after legacy-server cases cần CAREFLOW_BASELINE_URL; không phải màn hiện tại bị bỏ qua.

Model49/49, staff source3/3, syntax PASS;7/7 source gates. Capture141 lượt47 màn×360/390/1440 và47 lượt chữ200% ở360px:0 page errors,0 overflow,0 ảnh lỗi,0 target dưới ngưỡng của scanner. Computed contrast62 route +51 hover/focus variants:0 findings,0 variable-media contexts;23 token pairs đạt mục tiêu. Có mở xem actual captures, không chỉ tạo ảnh.

- [Ảnh tổng hợp 1](contact-1.png), [2](contact-2.png), [3](contact-3.png), [4](contact-4.png), [47 ảnh màn](screens/).
- [Before/after từng card](card-before-after.md), [source contract](source-contract.json), [23 cặp token](contrast.txt), [computed contrast toàn 62 route +interaction variants](elementary-sanity.json).
- Normal text 4.5:1, large text 3:1. White/primary18.723:1; loading14.424; navy/blue12.164; muted/white5.348; muted/page5.024; completed6.109; waiting6.690; cancelled6.023. Input border/white3.723:1. Gradient scan dùng conservative compositing màu, không thay thế pixel inspection hay chứng nhận đầy đủ WCAG.
- Mở xem contact sheets 47 màn và các màn đại diện ở 360/390/1440, large text 200%, DS và desktop. Native iOS/VoiceOver, người dùng thật và product outcome chưa được kiểm định.

## Review ảnh —7 dấu hiệu

Không dùng checklist này để khẳng định ai/AI là tác giả. Style có thể hợp lệ khi có vai trò rõ.

| Dấu hiệu | Kết luận | Vị trí và vai trò |
|---|---|---|
| AI-01 neon cạnh tranh | không xuất hiện | Header, Home, lịch hẹn và profile dùng 4 pastel sáng; cam/đỏ chỉ dùng cho trạng thái/cảnh báo |
| AI-02 dark/glow/bloom | không xuất hiện | Canvas/card trắng xanh; nav shadow phân lớp; primary/FAB đen biểu thị action, không có các mảng glow trang trí |
| AI-03 emoji thay icon | không xuất hiện | Quick access, nav, form labels, status và help dùng SVG registry; artwork là bộ vector chung |
| AI-04 gradient mặc định | có mục đích rõ | Header/appointment dẫn đọc xanh dương; Home aftercare/completed xanh lá; support/follow-up blue→green. Không có tím/hồng/peach trong palette đang chạy |
| AI-05 card/nested card | có mục đích rõ | B1 tách date/facts, metric, profile/count, question, guide; C* form/selection; D* ticket/QR; staff giữ row/table. Không thêm card shell chỉ để viền quanh section |
| AI-06 thanh màu cạnh/trái nhiều màu | không xuất hiện | Patient không có rainbow strips. Staff selected row/progress dùng navy theo selection, không nhiều accent cạnh tranh |
| AI-07 status dot không rõ nguồn | có mục đích rõ | Nav Lịch hẹn đếm unique unreadD2visit updates; notification read state thật; confirmed blue vàcompleted green có icon+label. Các dot call là trạng thái phiên mô phỏng, không phải thông báo bác sĩ đang online thật |

## Giới hạn còn lại

- Các token proposal/CSS archive không tải và ảnh stock cũ được giữ để không xóa tài sản/lịch sử.13 stylesheet đang được entrypoints tải lấy màu từ tokens; không còn color literal trong active presentation owners.
- Đây là prototype local, không phải native iOS hay hệ thống bệnh viện production. Không suy ra backend/payment/clinical validation từ UI tests.
- Tỉ lệ60/30/10 là định hướng thị giác, chưa đo tỷ lệ diện tích pixel. Không coi model fixture, kiểm thử tự động hay nhận xét của agent là nghiên cứu người dùng.

## Localhost

Chạy trong thư mục repository:

```powershell
$env:PORT='4186'
node prototype/preview-server.cjs
```

Patient: http://127.0.0.1:4186/prototype/?scenario=upcoming#/home
Doctor: http://127.0.0.1:4186/staff-prototype/#/doctor
Design System: http://127.0.0.1:4186/design/preview.html
