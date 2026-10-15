# CareFlow design system và handoff

SYNTHETIC/CONCEPT browser prototype. Nguồn: design/tokens.json, prototype/styles.css, ghi chú IMPLEMENTATION-11-12.md, file13. Bản visual reference-led 2026: [nghiên cứu ba ảnh và quyết định 47 màn](uiux/mobile-reference-style-study-2026.md). File11 gốc không có trong checkout.

## Typography và geometry
Be Vietnam Pro self-hosted Regular/SemiBold/Bold với glyph tiếng Việt (SIL OFL, license kèm assets/fonts). Body 16px, form 16px, CTA15px, utility heading30px (home display 30–42px), status12px; large text nhân 2 mọi font size trong phone. 44px minimum hit targets, CTA52px. Khoảng cách 4/8/12/16/20/24/32/40/48px. Card R30, appointment R32, input R20, CTA pill R999, tab dock R999. Shadow nhẹ chỉ cho container nổi có ý nghĩa. Màu action #005CE8, nền #F2F2F3, text #171719; tab có đủ bốn nhãn. WCAG contrast/reflow là technical QA, không tuyên bố chứng nhận accessibility.

## Owners và contracts
| Component | Owner | Variants / behavior |
|---|---|---|
| App shell / header / four tabs | index.html, app.js render | safe area, mobile full viewport / desktop centered phone; auth/video hides tabs; Back hash history |
| Phiếu khám, visitCard, details | views.js | đúng patientId/id/date/mode/status; D2 hub; QR contains CAREFLOW-DEMO:id only |
| Timeline / status chip | views.js + model.TRANSITIONS | nhãn và owner từ strings.vi.js, màu không là tín hiệu duy nhất |
| Form / choices / slots / check | views.js | labels, selected/focus/error/disabled/loading; no native browser validation message mismatch |
| Dialog | index.html + app.js | native dialog focus trap, Escape/dismiss, focus return, cancel confirmation |
| Lab cards / paths | views.js F1-F4 | ordered→scheduled→available→awaiting-review→reviewed; result notification independent |
| Payment / receipt | views.js H2-H5 | separate visit.payment, no real account/QR or made-up fee; staff reconciliation/refund |
| Conversation / report / tracking | views.js I1-I5 | context keyed by visitId/patientId; 3 reasons and urgent route |
| Empty / recovery / offline | views helpers + router guard | every unavailable context has return action; drafts retained offline |

## Thẩm quyền và clinical gates
OTP 123456 không gửi SMS. Synthetic fixtures do người đánh giá chọn, không có server health records. Camera/micro/video là trạng thái, không request media. Chuyển khoản chỉ tạo pending. Patient không có nút staff trong khung. Giá, ngân hàng, địa chỉ/hotline phòng khám, hoàn tiền, thuốc/hướng dẫn/xét nghiệm phải clinic approve. Không đưa thuốc hay chẩn đoán tạo sinh vào UI.

## Asset inventory
- Icon SVG: trích nguyên họ icon có sẵn từ prototype/app.js baseline, không đổi family.
- Be Vietnam Pro: google/fonts/ofl/bevietnampro (OFL.txt kèm).
- QR encoder: kazuhikoarase/qrcode-generator js/dist/qrcode.js, MIT license kèm vendor. Thư viện nhỏ vendored để mã xác nhận scan được, không dùng QR giả; không thêm network runtime/dependency manager package.
- Không có media/ảnh bệnh nhân bên ngoài hoặc tracking analytics.

## Platform limits
iOS/Android ở đây là browser presentation. Không có native permission, app push, SMS/Zalo delivery, camera test, VoiceOver/TalkBack/device evidence. Native pt/dp/sp, SDK/min OS và store submission ngoài phạm vi. DARK theme chỉ reference cũ, không phải chế độ đã triển khai.
