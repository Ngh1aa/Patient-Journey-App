# CareFlow design system và handoff

Giao diện hiện tại: **Calm Clinical**, chuyển bố cục từ hai ảnh tham khảo ngày 16/10/2026, giữ màu xanh `#075FE8`. Mã nguồn dùng chung cho 47 màn trong `prototype/views.js`; foundation ở `styles.css`, layout hiện tại ở `editorial-soft-glass.css`, auth ở `auth-editorial.css`.

Browser prototype với dữ liệu thử nghiệm. Đây là quyết định thiết kế từ yêu cầu người dùng và source audit; chưa có nghiên cứu người dùng hoặc phê duyệt lâm sàng mới.

## Typography và geometry
Be Vietnam Pro self-hosted Regular/SemiBold/Bold với glyph tiếng Việt (SIL OFL, license kèm assets/fonts). Body/form 16px, CTA15px, heading29px, status11px; large text nhân 2 mọi font size trong phone. 44px minimum hit targets, CTA52px. Khoảng cách 4/8/12/16/20/24/32/40/48px. Card R26, input R16, CTA pill, nav R30. Lịch khám có ngày/giờ tách nhóm, thông tin chi tiết hai cột và lý do khám chiếm trọn hàng; chữ lớn chuyển về một cột. Shadow nhẹ chỉ cho container nổi có ý nghĩa. WCAG contrast/reflow là technical QA, không tuyên bố chứng nhận accessibility.

## Owners và contracts
| Component | Owner | Variants / behavior |
|---|---|---|
| App shell / header / 4 destinations + booking action | index.html, app.js render | safe area, mobile full viewport / desktop centered phone; auth/video hides tabs; Back hash history; Trang chủ · Lịch hẹn · [+ Đặt lịch] · Hồ sơ · Hỗ trợ; central action resumes the unsent draft |
| Phiếu khám, visitCard, details | views.js | đúng patientId/id/date/mode/status; D2 hub; QR contains CAREFLOW-DEMO:id only |
| Timeline / status chip | views.js + model.TRANSITIONS | nhãn và owner từ strings.vi.js, màu không là tín hiệu duy nhất |
| Form / choices / slots / check | views.js + app.js | labels, selected/focus/error/disabled/loading; 5-stage booking progress, 5 quick dates synced to the real date field; form cache restored on Back/reload |
| Dialog | index.html + app.js | native dialog focus trap, Escape/dismiss, focus return, cancel confirmation |
| Lab cards / paths | views.js F1-F4 | ordered→scheduled→available→awaiting-review→reviewed; result notification independent |
| Payment / receipt | views.js H2-H5 | separate visit.payment, no real account/QR or made-up fee; staff reconciliation/refund |
| Conversation / report / tracking | views.js I1-I5 | context keyed by visitId/patientId; 3 reasons and urgent route |
| Empty / recovery / offline | views helpers + router guard | every unavailable context has return action; drafts retained offline |

## Thẩm quyền và clinical gates
OTP 123456 không gửi SMS. Synthetic fixtures do người đánh giá chọn, không có server health records. Video và dịch vụ khám chưa kết nối backend; chỉ kiểm tra camera/micro khi người đánh giá chủ động yêu cầu và trình duyệt cấp quyền. Chuyển khoản chỉ tạo pending. Patient không có nút staff trong khung. Giá, ngân hàng, địa chỉ/hotline phòng khám, hoàn tiền, thuốc/hướng dẫn/xét nghiệm phải clinic approve. Không đưa thuốc hay chẩn đoán tạo sinh vào UI.

## Asset inventory
- Icon SVG: trích nguyên họ icon có sẵn từ prototype/app.js baseline, không đổi family.
- Be Vietnam Pro: google/fonts/ofl/bevietnampro (OFL.txt kèm).
- QR encoder: kazuhikoarase/qrcode-generator js/dist/qrcode.js, MIT license kèm vendor. Thư viện nhỏ vendored để mã xác nhận scan được, không dùng QR giả; không thêm network runtime/dependency manager package.
- Không có media/ảnh bệnh nhân bên ngoài hoặc tracking analytics.

## Platform limits
iOS/Android ở đây là browser presentation. Không có native permission, app push, SMS/Zalo delivery, camera test, VoiceOver/TalkBack/device evidence. Native pt/dp/sp, SDK/min OS và store submission ngoài phạm vi. DARK theme chỉ reference cũ, không phải chế độ đã triển khai.

## Reference layout decisions — 16/10/2026

- Trang chủ dùng vùng xanh chuyển sáng, lời chào nhỏ, thông điệp hai dòng và một lịch gần nhất. Các lịch còn lại mở từ Lịch hẹn. Nhóm tiện ích hai cột dùng chức năng có thật trong prototype, không thêm bác sĩ/chuyên khoa giả.
- Thanh điều hướng có 5 vùng bấm >=44px. Bốn tab giữ nhãn; nút tạo lịch là action có dấu + xanh nổi ở giữa, không phải một tab trống. Khi đang đặt lịch, nút này trở lại bước và nội dung đang nhập.
- Đặt lịch có 5 mục: người khám → lý do (bao gồm sàng lọc) → hình thức → ngày giờ → xác nhận. Các màn C3–C5 và guard an toàn vẫn độc lập.
- Card lịch có người khám, cụm ngày/giờ, hình thức, trạng thái và hành động mở phiếu. Phiếu D2 chia thông tin, tác vụ và lịch sử thành từng nhóm; lưới tác vụ chuyển một cột khi chữ lớn.
- Đã gửi yêu cầu: thông báo nhận yêu cầu màu xanh. Chờ xác nhận/xem xét: chip vàng có nhãn. Đã xác nhận: chip xanh lá có nhãn. Không dùng màu để thay cho chữ.
- Status bar trong frame desktop có SVG sóng, Wi-Fi và pin. Mobile dùng thanh hệ thống của thiết bị; không giả lập quyền hệ điều hành.
- Reviewer controls nằm ngoài viewport ứng dụng, có hàng riêng trên mobile để không che nút đăng nhập. Kiểm tra trực tiếp bằng click, không bỏ qua hit testing.

Nguồn quy trình: `uiux-ai-workspace` với flow `mobile-web-preview`, các skill mobile-app-design, mobile-navigation-and-state-ux và mobile-design-system-and-handoff. Thẩm quyền hiện tại: sửa local và browser QA; chưa publish bản thiết kế này.
