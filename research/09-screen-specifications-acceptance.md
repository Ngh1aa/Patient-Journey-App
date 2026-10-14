# 09 — Mobile screen acceptance criteria (23/23) v0.2

**Ngày:** 15/10/2026. **Trạng thái:** thiết kế đề xuất; mọi nội dung y tế/pháp lý phải được duyệt; chưa test usability. **P0**: lõi MVP; **P0 Critical**: rủi ro cao; **P1**: có thể triển khai theo đợt nhưng cần đánh giá yêu cầu pháp lý và khả năng thông báo. Việc gắn P1 cho G2/G3 không có nghĩa được hoãn các chức năng privacy/accessibility bắt buộc.

## A. Acceptance criteria by screen
| ID | Screen | Priority | Thông tin hiển thị | Primary CTA | Failure/empty states | Acceptance test (bước kiểm tra) | Research/evidence | Owner để xác nhận |
|---|---|---|---|---|---|---|---|---|
| A1 | Chào mừng & đăng nhập | P0 | SĐT, OTP, hỗ trợ | Tiếp tục | OTP không đến, số sai, khóa tạm | OTP được nhập/dán cả chuỗi; lỗi nằm cạnh trường; không lộ hồ sơ trước auth; hotline một chạm | Apple Security Code AutoFill/WCAG | Auth/Clinic |
| A2 | Tạo hồ sơ lần đầu | P0 | Họ tên/định danh tối thiểu theo quy trình, liên hệ | Tạo hồ sơ | rà trùng, thiếu dữ liệu, mạng mất | thể hiện trường bắt buộc; gợi ý trùng KHÔNG trộn tự động; sau tạo có server id | UMC/Clinic intake | Registration |
| B1 | Trang chủ | P0 | Lịch tiếp theo, người khám, next action, hỗ trợ | Xem lịch khám | không có lịch, nhiều người thân, stale | thẻ lịch có người/ngày giờ/hình thức; hotline nổi bật; không hiển thị ETA giả | NHS App / MyChart | Scheduling |
| C1 | Ai đi khám? | P0 | Tôi/người thân đã liên kết, scope | Tiếp tục | chưa có hồ sơ, chưa đủ quyền, đã thu hồi | trên C2–C6 giữ badge người khám; thay người xóa dữ liệu triệu chứng cũ của người trước | NHS proxy | Identity |
| C2 | Lý do khám & sàng lọc | P0 | Lý do, hỏi theo cấu hình bác sĩ | Tiếp tục (khi không có cảnh báo) | bỏ sót câu, cảnh báo, rớt mạng | khi trigger cảnh báo route C3; không tự đưa ra chẩn đoán; hỏi dễ đọc, có thể xem lại | Clinic flow / clinical review | Clinical |
| C3 | Cảnh báo nguy hiểm | P0 Critical | Lời cảnh báo duyệt bởi lâm sàng và phương án hỗ trợ | Gọi hỗ trợ khẩn cấp | hotline ngoài giờ, muốn khám tiếp | CTA trợ giúp nổi trội, đọc được bằng screen reader; không có nút tự xác nhận đủ điều kiện online | TT 30/2023; clinical safety | Medical director |
| C4 | Hình thức, ngày & giờ | P0 | Khám trực tiếp/online đủ điều kiện, ngày, slot, điểm khám | Chọn giờ này | hết lịch, slot đổi, hình thức không hợp lệ | giờ có timezone & cơ sở; kiểm tra lại slot server trước C6; lưu các trường khác nếu slot mất | Doctolib/Zocdoc | Scheduling |
| C5 | Xác nhận đặt lịch | P0 | Ai, lý do, hình thức, ngày giờ, phí, điều khoản áp dụng | Xác nhận đặt lịch | network timeout, booking duplicate | review đổi từng mục; không thể xác nhận sai người do context cũ; không báo thành công khi chưa có appointmentId | NHS/UMC/Clinic flow | Scheduling |
| C6 | Đặt lịch xong | P0 | appointmentId, giờ, hướng dẫn & trạng thái | Xem lịch hẹn | gửi nhắc lịch thất bại | chỉ hiện khi server confirm; lỗi SMS/Zalo không xóa booking; mở D2 chính xác | MyChart/NHS | Scheduling |
| D1 | Danh sách lịch | P0 | Lịch sắp tới/cũ/đã hủy, người khám | Xem chi tiết | trống, danh sách offline, nhiều người | lọc/nhóm dễ hiểu; trạng thái bằng chữ; không lẫn cancelled với upcoming | NHS/MyChart | Scheduling |
| D2 | Chi tiết lịch & timeline | P0 | Trạng thái, owner role, next action, lịch sử chính | Hành động kế tiếp | không có queue live, task pending | không gộp appointment vs encounter vs result; mỗi trạng thái có timestamp/“chưa cập nhật” | FHIR Appointment/Encounter | Clinic IT |
| D3 | Hủy / đổi lịch | P0 | Chính sách, lý do, ảnh hưởng phí, thời gian mới | Xác nhận hủy / đổi | sát giờ, refund, server conflict | reason/history lưu theo policy; hủy/đổi chỉ báo thành công khi server ack; lưu liên kết lịch mới | Doctolib/Clinic flow | Scheduling/Finance |
| E1 | Check-in & số thứ tự | P0 | Check-in trạng thái, STT tiếp nhận / STT khám | Xem lượt khám | queue mất kết nối, đến sai cơ sở | 2 loại số có nhãn khác nhau; nếu backend không có số real-time thì nói rõ; offline fallback đến quầy | MyChart/Medpro/YouMed | Front desk |
| E2 | Chuẩn bị khám online | P0 | Giờ hẹn, kiểm tra mic/cam/mạng, “đang chờ phòng khám gọi” | Sẵn sàng tham gia | thiếu quyền, app không mở camera, đến muộn | giải thích permission, thử lại, đường gọi phòng khám; không tự động mở camera trước đồng ý | MyChart/Apple permissions | Telehealth |
| E3 | Khám video | P0 | Tình trạng kết nối, controls mic/camera, thời lượng nếu có | Bật/tắt micro | rớt video, app background, staff disconnect | control dễ bấm; kết thúc call ≠ signed encounter; không lưu record media nếu chưa có policy riêng | Telehealth SDK / Clinic flow | Telehealth |
| E4 | Chưa kết nối được | P0 | Phân biệt unreachable vs lost connection, help | Thử lại / Yêu cầu gọi lại | không có callback owner, không nhận được cuộc gọi | hỗ trợ qua điện thoại/hẹn lại; callback chỉ xác nhận khi backend nhận; không thông báo “đã khám” | Clinic flow / SDK docs | Coordinator |
| F1 | Thanh toán | P0 Critical | invoice, số tiền, mã, QR/trạng thái, lịch sử | Thanh toán | hoãn, hoàn, đối soát trễ, QR thiếu nội dung | paid chỉ khi backend xác nhận; not_required/deferred tách; mã giao dịch chống trùng | VietQR/MoMo/VNPay | Finance |
| F2 | Kết luận, đơn, kết quả | P0 Critical | bác sĩ, ngày, trạng thái review/release, file được quyền xem | Xem kết quả được chia sẻ | đã có kết quả chưa bác sĩ xem, proxy thiếu quyền | phân biệt result available/reviewed/released/informed; không sinh diễn giải xét nghiệm AI | NHS/MyChart/FHIR DiagnosticReport | Medical/Privacy |
| F3 | Xét nghiệm cần làm | P0 | order, địa điểm, thời gian, trạng thái, hướng dẫn đã duyệt | Xem hướng dẫn | kết quả đến trễ, lab đổi lịch, chưa làm | mỗi xét nghiệm có state riêng; không mặc định nhịn ăn; kết quả về sau khám liên kết encounter | FHIR ServiceRequest/Clinic flow | Lab/Clinic |
| F4 | Hỏi phòng khám | P0 | số hotline, kênh và giờ hỗ trợ, ticket callback | Gọi phòng khám | ngoài giờ, không liên hệ được, callback quá hạn | phone CTA chính; yêu cầu gọi lại có trạng thái và owner/SLA theo policy, không hứa giờ chưa chốt | Clinic care workflow | Coordinator |
| G1 | Hồ sơ & người thân | P0 | hồ sơ tôi, người thân, scope và xác thực | Chọn người khám | người đại diện bị revoke, liên kết sai | đặt hộ khác xem PHI; khi chuyển profile có context banner; chặn khi không đủ scope | NHS proxy | Identity/Privacy |
| G2 | Thông báo | P1 | nhắc lịch / công việc/ cập nhật tối thiểu | Xem thông báo | deep link login, link expired, sai quyền | sau login quay đúng route; không lộ triệu chứng/thuốc/kết quả trên lock-screen | FCM/APNs/NHS | Notifications |
| G3 | Cài đặt | P1 | kênh liên hệ, trợ năng, quyền riêng tư, pháp lý | Lưu thay đổi | mất kết nối, đổi số, revoke | setting persisted; có lựa chọn font và trợ năng; contact/consent history theo policy | Apple/WCAG/Privacy law | Accounts |

## B. Nguyên tắc giao diện chung áp dụng 23 màn
- **Header:** chỉ hiển thị danh tính người được khám khi cần; bấm đổi người tại C1/G1 theo quyền. Đưa chỉ báo profile khi đang thao tác thay mặt.
- **Primary CTA:** một hành động chính trên một màn. Nút cao 52pt như design hypothesis, vùng chạm iOS 44pt+/Android 48dp+ theo platform conventions; WCAG 2.2 AA 2.5.8 quy định ≥24×24 CSS px (hoặc ngoại lệ) cho web — các chuẩn đơn vị KHÔNG đồng nhất. Nút cố định bottom không che tab/navigation, safe area hoặc keyboard.
- **Typography:** iOS body baseline 17pt + Dynamic Type; Android sp + font scaling. Text “Ai đi khám”, “Đã xác nhận” và context cần lớn/đậm hơn metadata.
- **Visual tokens:** đề xuất Be Vietnam Pro/Inter với glyph tiếng Việt test thực; blue chính + semantic warning/red; không dùng blue/red làm tín hiệu duy nhất. Contrast chữ nhỏ ≥4.5:1, trạng thái UI non-text ≥3:1 (khi áp dụng).
- **Feedback:** mỗi submit có loading, trường hợp unknown outcome, retry an toàn, success confirmed bởi server.
- **Patient safety:** C3 không chuyển thành checklist nhỏ; mọi lối thoát có sự rõ ràng, hotline và quyền quay lại qua staff.
- **Trust & privacy:** Không đưa PHI vào snackbar/lock-screen push, URL; không cho analytics chứa lý do khám raw text/số ĐT/họ tên.
- **Microcopy:** không dùng 'cận lâm sàng' trong CTA bệnh nhân nếu có thể nói “Xét nghiệm và chụp chiếu”; “No-show” → “Bạn chưa đến theo lịch”; “Ký/khóa” → “Bác sĩ đã hoàn tất ghi nhận buổi khám”. Copy cần review nhân viên.
- **Loading/skeleton:** khi chờ mạng, dùng placeholder bảo toàn chiều cao thẻ; lỗi không trắng màn; gọi hỗ trợ.
- **Notification:** mọi cập nhật sau khám là bản ghi nghiệp vụ cần kiểm quyền trước khi mở.

## C. Task-based handoff cho thiết kế Figma
1. Vẽ **screen map 23 màn** theo 06, dùng F01–F09 làm đường nối.
2. Tạo **component states** theo 08: appointment/status chip, next action, identity selector, contact hotline, callback ticket, queue card, payment status, test result card, OTP.
3. Tạo wireframe P0 theo tuyến: A1→C1→C2→C3/C4→C5→C6→D2, sau đó E1/E2–E4, F1–F4.
4. Mọi màn có 3–5 trạng thái mẫu: normal, loading, empty, error, accessibility-large text; các màn critical thêm not-authorized & unexpected-outcome.
5. Viết test case ở cột Acceptance vào Figma annotation; không gọi UI “validated” nếu mới review nội bộ.

## D. Nguồn đã xác minh (truy cập 15/10/2026)
- [NHS proxy — banner “acting for”](https://www.nhs.uk/nhs-app/help/profile/family-and-carer-access/).
- [Apple tab bar — updated 08/06/2026](https://developer.apple.com/design/human-interface-guidelines/tab-bars).
- [WCAG 2.2 target size AA](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- [FHIR Appointment](https://hl7.org/fhir/R4/appointment.html), [FHIR DiagnosticReport](https://hl7.org/fhir/R4/diagnosticreport.html).
- Nội dung workflow từ người đặt bài (FLOW), chưa xác thực với nhân viên y tế.

## E. Kịch bản demo tối thiểu sau wireframe
- D01: Người cao tuổi lần đầu đặt lịch cho mình, nhầm số điện thoại OTP.
- D02: Người nhà đặt hộ và liên tục chuyển hồ sơ (không mở dữ liệu ngoài quyền).
- D03: Mô phỏng dấu hiệu cảnh báo; phải tìm được kênh hỗ trợ, không đặt trực tuyến sai quy trình.
- D04: Slot vừa hết ở bước xác nhận; hệ thống không tạo 2 lịch.
- D05: Đến khám với 2 loại số; bệnh nhân mô tả đúng mình đang đợi gì.
- D06: Từ online preflight đến rớt cuộc gọi rồi xin gọi lại.
- D07: Xem QR chưa trả tiền và phân biệt trạng thái pending/paid/deferred.
- D08: Có kết quả nhưng chưa bác sĩ xem, sau đó được chia sẻ; người dùng giải thích đúng các trạng thái.
- D09: Thông báo mở đúng profile sau đăng nhập.
- D10: Large text + VoiceOver/TalkBack, gọi phòng khám trong tối đa vài hành động (số bước ngưỡng do pilot chốt).
