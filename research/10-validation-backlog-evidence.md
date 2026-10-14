# 10 — Stakeholder validation, release gates and research backlog

**Date:** 15/10/2026. **Status:** OPEN / action plan. Các câu hỏi chưa trả lời không được tự đóng bằng UX inference. Mục đích là quản lý độ chắc chắn trước thiết kế cao cấp và xây app.

## A. 13 câu hỏi quyết định để khóa nghiệp vụ
| ID | Priority | Screens | Câu hỏi cần có người xác nhận | Người quyết định | Bằng chứng đầu ra | Quy tắc release gate |
|---|---|---|---|---|---|---|
| Q01 | P0 Critical | C2/C3 | Bộ câu hỏi sàng lọc và dấu hiệu nguy hiểm cụ thể nào được phép hỏi? Nếu vẫn muốn khám thì ai phê duyệt? | Medical director | Bộ rules versioned, copy warning & handoff SOP | Không đưa C2/C3 live |
| Q02 | P0 Critical | C1/G1/F2 | Ai được đặt hộ? Loại giấy tờ/thời hạn/tuổi và từng scope READ_RESULT, BOOK, PAY, NOTIFY là gì? | Legal + Clinic Ops | Proxy policy + escalation, revoke tests | Không mở hồ sơ người khác |
| Q03 | P0 Critical | E2/E3/E4 | Danh mục dịch vụ nào phòng khám đủ điều kiện khám từ xa? Khi không liên hệ được, liên hệ bằng kênh nào? | Medical director + IT | Danh mục telehealth và fallback approved | Không bật khám online đại trà |
| Q04 | P0 Critical | F2/F3 | Kết quả nào được công bố trước bác sĩ xem? Ai approve? Khi lab gửi muộn sau ký/khóa thì sao? | Medical + EMR | Release policy, audit & addendum | Không tự công bố kết quả |
| Q05 | P0 Critical | F1 | Thế nào là đã thu, thu hộ nhà thuốc, miễn phí, hoàn tiền, hoãn với lý do/ngày hẹn? | Finance + Legal | Ledger states, reconciliation/refund rules | Không tự mark paid |
| Q06 | P0 | A2 | Trường bắt buộc tạo hồ sơ là gì, rà trùng qua những thuộc tính nào, ai xử lý trường hợp trùng? | Front desk + IT | Identity/dedup spec | Không merge tự động |
| Q07 | P0 | D2/E1 | Số tiếp nhận và số vào phòng khám định nghĩa thế nào? Có API real-time hay chỉ quầy cập nhật? | Operations + HIS vendor | Queue API contract + update timestamp | Không hiển thị ETA không có nguồn |
| Q08 | P0 | D2/F2 | Ai ký/khóa encounter? Trước hoặc sau cận lâm sàng? Cơ chế sửa sau ký thế nào? | Medical + EMR | Encounter signature versioning | Không gộp trạng thái đã khám/đã hoàn tất |
| Q09 | P0 | F4/E4 | Ai giữ cuộc gọi lại, SLA ngoài giờ, khi nào escalated/closed? | Care Coordinator | Callback roles, SLA, expiry/escalation | Không hứa giờ không thực tế |
| Q10 | P0 | D3/C4 | Chính sách hủy/đổi/no-show, ghi lý do khi bệnh nhân không cung cấp và cách link lịch tái khám? | Reception + Clinic Ops | Cancel/no-show rules, rebook reference | Không làm mất lịch sử |
| Q11 | P0 | G2/A1 | SMS/Zalo/ZNS message chứa những trường nào, deep link hết hạn khi nào, logout/revoke xử lý sao? | Privacy + IT | Notification templates/permission checks | Không để lộ PHI |
| Q12 | P1 | G3/A1 | Cần lưu trữ consent và log ra sao, thông báo xử lý dữ liệu/đồng ý riêng thế nào, thời hạn dữ liệu? | Legal/Privacy | DPA/retention schedule, rights workflow | Không coi checkbox mặc định đủ luật |
| Q13 | P1 | B1/E1 | Kênh đặt lịch hiện tại (hotline/Zalo/trực tiếp) và mức smartphone thành thạo theo nhóm tuổi ra sao? | UX Research + Ops | Đo baseline + segment screen usability | Không chốt IA theo giả định duy nhất |

## B. Phương pháp lấp khoảng trống
| Workstream | Việc làm | Evidence bắt buộc | Không đủ để kết luận |
|---|---|---|---|
| Clinic walk-through | Đi cùng nhân viên qua một ca mẫu: tiếp nhận → điều dưỡng → lab → bác sĩ → thu phí → hậu khám | shadowing note vô danh, timestamp, role/status, sơ đồ handoff | chỉ kể lại SOP mà không quan sát |
| Legal/Medical workshop | Review Q01–Q05, Q08, Q11, Q12; chốt văn bản & owner có thẩm quyền | versioned rules, sign-off, source doc ID, thời gian hiệu lực | AI viết copy hoặc developer tự quyết định |
| UX field interviews | 5 nhóm: bệnh nhân, đặt hộ, lễ tân, điều dưỡng, bác sĩ; ưu tiên đa tuổi & mức dùng smartphone | transcript đã gỡ danh tính, quote, participant matrix, thematic synthesis | giả định từ benchmark nước ngoài |
| Usability prototype | test 23 màn theo task D01–D10 (xem 09), ưu tiên C1/C3/E4/F1/F2 | session log, errors, task success, comprehension, SUS/UMUX-lite với nguồn và công thức | số SUS đơn lẻ hoặc test với đội thiết kế |
| Accessibility | iOS VoiceOver/Dynamic Type; Android TalkBack/font scale, contrast; haptic/motion reduced | annotated issues theo màn, máy/OS/version | chỉ chạy plugin Figma |
| Technical feasibility | xung đột lịch, slot locking, callback, PSP reconciliation, Zalo deep link, HIS read permissions | API notes, error taxonomy, UI fallback specs, mock responses | mock giao diện đẹp nhưng API không hỗ trợ |

## C. Decision register (template)
Mỗi quyết định giữ 9 trường:
1. `decision_id`
2. `scope (screen + flow + state)`
3. `decision`
4. `options_considered`
5. `source (URL + phiên bản/đường dẫn SOP + ngày)`
6. `authority / approver`
7. `decided_at`
8. `valid_until / review_trigger`
9. `risk_if_wrong + rollback`.

Nếu chưa có phê duyệt, dùng `status: NEEDS_VALIDATION`, không điền tên người và ngày bịa.

## D. Thứ tự nghiên cứu trước wireframe
**Vòng 0 (blocker)**: thảo luận 5 nhóm câu hỏi critical Q01–Q05; khóa nội dung C3, đại diện và trạng thái kết quả.
**Vòng 1 (IA + low-fi)**: dựng navigation 06, flows 07, cards/status 08, 23 màn 09. Những màn chưa có SOP dùng placeholder “requires medical review”, không có lời chỉ dẫn điều trị thật.
**Vòng 2 (usability)**: 24–30 phiên được đề xuất để so sánh nhiều nhóm (con số phân bổ sơ bộ, không bảo đảm thống kê); thử kịch bản critical trước; ghi n theo từng cohort.
**Vòng 3 (technical/prototype)**: hội thảo HIS/EMR/LIS/PSP và kiểm thử mạng yếu, out-of-order callbacks, invalid proxy; điều chỉnh design.
**Vòng 4 (sign-off)**: clinic Ops, medical, legal, privacy, security, QA cùng xác nhận những phần thuộc trách nhiệm của mình. Nghiên cứu ≠ chứng nhận tính an toàn.

## E. First design sprint — gói bàn giao thực sự có thể bắt đầu
- Screen hierarchy & prototype paths từ 06 (23 màn).
- Chín end-to-end flows F01–F09 từ 07.
- 12 state aggregates và 15+ edge cases từ 08.
- Screen-level acceptance tests từ 09.
- Bộ UI components cần ưu tiên: PersonSelector, AppointmentCard, JourneyTimeline, StatusBadge, ClinicCallCTA, AppointmentReview, OTPField, ScreeningAlert, QueueStatus, VideoPreflight, VideoFailureRecovery, PaymentStatus, ResultStatus, CallbackTask.
- Không tạo assets/bản vẽ tự động cho nội dung clinical chưa sign-off.

## F. Evidence registry — thông tin vừa xác minh
| Source | Publication/effective date | Verified statement | Link | Ngày truy cập | Confidence |
|---|---|---|---|---|---|
| Apple HIG Tab bars | cập nhật 08/06/2026 | tabs để chuyển khu vực, không làm action | https://developer.apple.com/design/human-interface-guidelines/tab-bars | 15/10/2026 | Cao |
| NHS family access | trang đang hoạt động 2026, ngày xuất bản gốc chưa xác minh | khi acting for profile khác có banner & phân quyền | https://www.nhs.uk/nhs-app/help/profile/family-and-carer-access/ | 15/10/2026 | Cao |
| NHS guide | cập nhật 02/07/2026 | family switching có bước chọn người và banner | https://digital.nhs.uk/services/nhs-app/toolkit/step-by-step-guide | 15/10/2026 | Cao |
| WCAG 2.2 2.5.8 | WCAG 2.2 (2023), trang tham chiếu cập nhật | Level AA ≥24×24 CSS px hoặc ngoại lệ; không đồng nhất với 44pt iOS | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | 15/10/2026 | Cao |
| Bộ Y tế TT30/2023 | 30/12/2023, hiệu lực 01/01/2024 | danh mục bệnh/tình trạng được khám chữa bệnh từ xa; CSDL còn hiệu lực | https://vbpl.vn/boyte/Pages/vbpq-toanvan.aspx?ItemID=178262 | 15/10/2026 | Cao |
| Bộ Y tế TT13/2025 | 06/06/2025, hiệu lực 21/07/2025 | hướng dẫn triển khai EMR; CSDL còn hiệu lực | https://vbpl.vn/boyte/Pages/vbpq-thuoctinh.aspx?ItemID=178219 | 15/10/2026 | Cao |
| Luật 91/2025/QH15 | 26/06/2025, hiệu lực 01/01/2026 | luật dữ liệu cá nhân; CSDL còn hiệu lực | https://vbpl.vn/tw/Pages/vbpq-thuoctinh.aspx?ItemID=179252 | 15/10/2026 | Cao |
| NĐ 356/2025/NĐ-CP | 31/12/2025, hiệu lực 01/01/2026 | nghị định hướng dẫn luật dữ liệu cá nhân; CSDL còn hiệu lực | https://vbpl.vn/bocongan/Pages/vbpq-thuoctinh.aspx?ItemID=187276 | 15/10/2026 | Cao |
| HL7 FHIR R4 Appointment | version 4.0.1 phát hành 2019 | lịch hẹn là mô hình resource riêng | https://hl7.org/fhir/R4/appointment.html | 15/10/2026 | Cao về FHIR, chưa xác minh khả năng tích hợp HIS |
| HL7 FHIR R4 ServiceRequest | version 4.0.1 (2019) | chỉ định khác execution task | https://hl7.org/fhir/R4/servicerequest.html | 15/10/2026 | Cao về FHIR, chưa xác minh local |
| HL7 FHIR R4 DiagnosticReport | version 4.0.1 (2019) | report kết quả tách order | https://hl7.org/fhir/R4/diagnosticreport.html | 15/10/2026 | Cao về FHIR, chưa xác minh local |

**Evidence note:** “Còn hiệu lực” là thông tin theo cơ sở dữ liệu tra cứu ở thời điểm nghiên cứu, chưa thay thế full pháp lý áp dụng theo loại cơ sở. Các tài liệu FHIR cũ hơn 2023 là chuẩn tham chiếu, không phải nghiên cứu thị trường 2026. Số quy định địa phương/cơ sở có thể yêu cầu khác, cần reviewer.
