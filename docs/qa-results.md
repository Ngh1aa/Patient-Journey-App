# CareFlow — QA và release evidence

Phạm vi: browser prototype, 47 screens/12 flows theo file13. Nguồn baseline8f26983, snapshot app trước PR3915fb1 (byte hashes trong browser-source-hashes.json). Native, real backend, clinical approval, DIRECT_USER và public deployment tách riêng.

## Các gate
| Gate | Kết quả trước PR | Bằng chứng |
|---|---|---|
| JavaScript syntax | PASS | npm run check (6 app modules) |
| Model contracts | PASS41/41 | tests.cjs; gồm ma trận mọi cạnh sai của15 trạng thái, idempotency, clinical risk, proxy và payment/lab communication guards |
| Color tokens | PASS14/14 pairs | check-contrast.cjs đọc trực tiếp styles.css; không dùng bộ màu hard-code cũ |
| Full browser iteration |91/92 trước sửa WebKit I1 | qa-final.log:91 PASS,1 FAIL trong native select ở font200%; không coi run này là PASS |
| Retest sau sửa I1 | PASS16/16 | qa-retest.log:47 route ×360/390/200% trên cả2 engine, F11 và editable text scaling |
| Axe/current-context follow-up | PASS4/4 |16 representative states trên2 engines + multiple completed visit context; qa-followup.log |
| Captures bổ sung | PASS4/4 ·54 screenshots tổng | Desktop, C7/C9/H6/I1-large, cancel/no-show/offline/transfer-pending; qa-evidence.log |
| Legacy hifi compatibility | PASS20/20 | pinned model-legacy.js, hifi.config.cjs, Chromium/WebKit |
| GitHub PR CI trên toàn bộ suite mới | PENDING | Phải đạt trước merge; local focused retest không thay full CI |
| Post-merge main/app smoke | PENDING | Chỉ thực hiện khi CI đạt và PR merge thành công |
| TypeScript/lint/bundle build | N/A | Buildless HTML/CSS/JS, không có TS/linter/bundler; syntax/model/browser checks là gate |
| Native/VoiceOver/TalkBack/device/user validation | UNKNOWN/NOT_RUN | Không có native build hoặc người tham gia thật |
| Clinical/fees/policies approval | REQUIRED trước dùng thật | clinical-and-service-gates.md |
| Public hosted deployment | UNKNOWN/NOT_REQUESTED | GitHub source/CI không là deployment proof |

## Flow → test coverage
| Flow | Nhánh được kiểm tra bằng UI + controlled staff updates |
|---|---|
| F1 | Login lỗi SĐT, OTP thử, A3, C1→C9 pending, D2/QR |
| F2 | Existing-match A2 prefilled, cập nhật, booking pending |
| F3 | Emergency dialog/exit không gọi thật; cannot bypass; C5→mode-review→staff mode decision→pending |
| F4 | E1→reminder→E2 arrived→received→ready→in-consult→completed, đúng thứ tự |
| F5 | pre-lab→F1/F2/F3/F4; điều dưỡng phối hợp; external result upload thẳng;2 return preferences |
| F6 | Cancel reason+confirmation/history; no-show/rebook; reschedule atomic linked visit |
| F7 | Device state, waiting, incoming, accept, mic/camera, staff complete; rời call không hoàn tất encounter |
| F8 | Decline/missed controlled event; giữ chờ callback; staff gọi lại cùng lượt; online-retry/convert-onsite tạo lượt mới |
| F9 | Counter/pharmacy/transfer pending→staff paid→receipt→refund; deferred reason/date; no-fee |
| F10 |5 lab states, reviewed không tự notified/explained; unreachable; summary/extra lab/explanation-free/contact |
| F11 |3 report reasons, symptoms-urgent C4, tracking/referral/messages, staff follow-up, chọn đúng lượt đã khám |
| F12 | J1→C7→new linked pending visit; giữ patientId và completed history |

## Kích thước và accessibility
Chromium141.0.7390.37, WebKit26.0 chạy thật trên Windows bằng Playwright1.56.1 ở vòng đầu; công cụ hiện hành1.57.0.47 routes ở360px,390px và360px chữ200%; đây là browser emulation, không phải iPhone/Android device certification. Kiểm scrollWidth, vùng chạm44px, forms/labels/error/focus, Back/reload, subpath /Patient-Journey-App/prototype/, no unhandled JS/console errors. Axe WCAG A/AA là phạm vi tự động, không là full WCAG conformance hoặc chứng cứ comprehension.

## Vấn đề đã sửa
- ID cũ và24-screen contract không khớp47-screen journey; migrate, giữ legacy archive.
- Booking auto-confirmed; đổi sang pending/mode-review và staff-controlled guarded transitions.
- D2 primary action dưới fold; đưa next-step lên đầu và assert visible ở360px.
- Guard request đã gửi chặn nhầm C4 urgent aftercare; guard phân biệt ngữ cảnh, regression F11.
- Unknown request có thể bị reset bằng beginBooking; lock request đến khi reconciliation, reject duplicate.
- Text field chưa tăng cùng font roles; set phone base type scale và assert editable font×2.
- WebKit native select gây overflow I1 ở200%; reuse radio choices có wrapping đầy đủ, không che lỗi bằng overflow hidden.
- Skip link xung đột hash router và header Back có thể rời app khi direct link; focus action và tracked in-app history.
- hifi cũ phụ thuộc model thay đổi; pin legacy model, regression20/20.

Ảnh key screens và ngoại lệ được xuất từ browser render thật, không sinh bằng AI. Screenshots/research giả lập không chứng minh dịch vụ y tế thật đã thực hiện. Source services và approvals: clinical-and-service-gates.md.

## CI repair và vòng nghiệm thu cuối

PR: https://github.com/Ngh1aa/Patient-Journey-App/pull/9 . Các bảng phía trên ghi snapshot local trước PR, không là trạng thái CI hiện hành.

Run38708246815 trên c02d88f:93/94 E2E PASS; WebKit Linux crash ở page.reload sau Back, lặp lại ở retry. Không bỏ test hoặc thêm timeout/catch. Playwright maintainer xác nhận regression1.56/1.56.1 và fix1.57: https://github.com/microsoft/playwright/issues/37766 . Test tooling đã nâng và khóa1.57.0; các dependency tương thích đã dedupe. Đây là sửa môi trường engine kiểm thử, không đổi frontend stack. Kết luận cuối chỉ lấy từ toàn bộ CI trên head mới.

Rà soát chức năng bổ sung: K5 mở I1 đúng context sau khám; tạo người thân trong C1 trả về C1 và chọn đúng hồ sơ mới. Regression tests được thêm; tổng hiện có96 E2E cases. Full suite bắt buộc chạy lại với browser build mới, giữ nguyên kiểm tra Back/reload đã crash trước đó. Windows capture mới và Linux CI mới được ghi ở gói handoff; backend/native/clinical approval vẫn UNKNOWN.

Runtime source hiện hành:627d3ccae3d7bb49c9d70763f48f1f9d13b57a1a; browser-source-hashes.json đã tính lại sau sửa K5/relative. Chromium143/WebKit26 build2227 dùng ở vòng1.57. Full current gate gồm96 E2E; kết quả CI có thẩm quyền ở checks PR9, không suy từ các run lịch sử nêu trên.
