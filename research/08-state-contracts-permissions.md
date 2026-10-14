# 08 — State contracts, ownership, permissions & edge cases v0.2

**Date:** 15/10/2026 • **Status:** proposed cross-platform UX/backend contract, **NOT** clinic-approved. These are CareFlow-specific **DESIGN** enums; not exact FHIR status enumerations, not legal requirements. Every status needs backend owner and confirmed transition.

## 1. Không dùng một “journeyStatus” cho tất cả
Bản ghi đề xuất: `appointment` lịch hẹn; `encounter` lượt khám; `queue` hàng đợi; `video_session` lần liên hệ; `diagnostic_order` chỉ định; `diagnostic_result` kết quả; `payment` nghĩa vụ/giao dịch; `communication` việc truyền đạt; `followup_task` công việc sau khám; `proxy_access` quyền đại diện. Một lịch có thể có nhiều tác vụ kết quả và thanh toán độc lập; ký lượt khám không đóng mọi tác vụ hậu khám.

## 2. State contracts
| Aggregate | Enum được đề xuất | Transitions/guard quan trọng | Screen | Source of truth | Owner |
|---|---|---|---|---|---|
| Booking draft | draft / screening / selecting-slot / submitting / submitted / failed | submitted khi server trả acceptance; failed không được hiện “đã đặt” | C1–C6 | booking service | patient scheduling |
| Appointment | requested / confirmed / rescheduled / checked_in / cancelled / no_show / completed | không xóa hẹn cũ khi đổi; no_show chỉ staff hoặc rule approved xác lập; “completed” không đại diện kết quả xét nghiệm | D1–D3, C6 | PMS/HIS | scheduling + front desk |
| Screening disposition | not_started / in_progress / no_flag / possible_urgent / awaiting_staff_decision / resolved_by_staff | possible_urgent → C3 & help; chỉ staff clinically approved mới quyết định có tiếp tục booking; không lưu chẩn đoán suy luận | C2–C4 | validated clinical workflow | clinician |
| Check-in/queue | not_arrived / waiting_checkin / checked_in / waiting_clinic / called / in_room / skipped / closed | code check-in thành công không suy ra ready; có 2 số STT và timestamp/sync-state, ETA là trường tùy chọn | E1/D2 | local queue backend | reception |
| Encounter | not_started / in_progress / signed / amended | signed do qualified staff; app thoát video không tự sign; amended có timestamp/audit/version | D2, F2 | EMR | doctor |
| Virtual contact attempt | preflight / waiting_outbound / connecting / connected / call_dropped / unreachable / callback_pending / rescheduled / switched_in_person | unreachable ≠ call_dropped; staff initiated vs user join; callback cần owner & confirmation | E2–E4 | telehealth + staff tasks | doctor/nurse |
| Diagnostic order | ordered / scheduled / waiting_execution / performed / cancelled | chỉ định bởi authorized staff; kỳ vọng kết quả là phép đo/policy riêng | F3/D2 | LIS/RIS/EMR | clinician + lab |
| Diagnostic result | not_available / result_available / awaiting_doctor_review / reviewed / approved_for_release / released | review ≠ release; patient access theo legal/medical policy (không mặc định block) | F2/F3/G2 | LIS/EMR | lab + doctor |
| Communication status | not_requested / pending / attempted / unreachable / delivered / acknowledged / failed | SMS delivered không đồng nghĩa bệnh nhân đã đọc/hiểu; gọi lại khi unreachable theo policy | F2/F4/G2 | CRM/telephony | care coordinator |
| Payment obligation | not_required / unpaid / payment_in_progress / pending_reconciliation / paid / deferred / refund_pending / refunded / failed | QR được mở ≠ paid; deferred cần reason+due date; refunded không xóa invoice gốc | F1/D2 | finance ledger / PSP + reconciliation | cashier/accounting |
| Follow-up | assigned / active / waiting_patient / escalated / done / cancelled | staff assigned, SLA, outcome; nếu khẩn phải escalate theo clinical rule | F4/G2 | task service | nurse/coordinator/doctor |
| Proxy | none / requested / under_review / active / suspended / revoked / expired | scope `BOOK`/ `VIEW_RESULT` / `PAY` / `NOTIFY` / `MANAGE` riêng, revoke được kiểm quyền lập tức | C1/G1/F2 | identity & access | clinic verified delegate |

## 3. Vai trò tối thiểu và đường phân quyền
| Hành động | Patient (self) | Người đặt hộ | Lễ tân | Điều dưỡng/điều phối | Bác sĩ | Thu ngân |
|---|---|---|---|---|---|---|
| Tạo/đổi/hủy lịch | Có theo policy | Chỉ scope BOOK | Có | Có theo phân công | theo quy trình | không mặc định |
| Xem thông tin chuẩn bị khám | Có | Nếu cho phép | Có theo nhiệm vụ | Có | Có | không mặc định |
| Xem kết quả/đơn | Có theo release | Chỉ VIEW_RESULT hợp lệ | chỉ dữ liệu cần thiết | chỉ theo nhiệm vụ | Có theo thẩm quyền | không mặc định |
| Chỉ định xét nghiệm/đổi chẩn đoán | Không | Không | Không | chỉ theo phạm vi chuyên môn được phép | Có theo thẩm quyền | Không |
| Ký/khóa lượt khám | Không | Không | Không | Không mặc định | Có theo phân công | Không |
| Đánh dấu đã thu/hoàn tiền | Không | Không | Không mặc định | Không | Không | Theo quyền tài chính |
| Giao/đóng callback | request only | nếu quyền hợp lệ | tùy policy | Có | Có khi điều trị | Không |

**Lưu ý:** ma trận là *hypothesis thiết kế* chứ không phải tư vấn pháp lý/phân công bắt buộc; quyền cụ thể phụ thuộc SOP, pháp luật, chức danh và cơ sở.

## 4. Thông tin hiển thị cho bệnh nhân
| Source state | Copy gợi ý | Thông tin kèm theo | Hành động chính |
|---|---|---|---|
| requested | Phòng khám đang xác nhận lịch | giờ yêu cầu, người được khám | Gọi phòng khám |
| confirmed | Lịch khám đã được xác nhận | giờ, địa điểm/link tham gia, người khám | Xem hướng dẫn |
| checked_in | Đã làm thủ tục | thời điểm check-in | Xem số chờ |
| waiting_clinic | Đang chờ đến lượt khám | STT được backend xác thực, thời gian cập nhật | Theo dõi |
| waiting_outbound | Đang chờ cuộc gọi từ phòng khám | thời gian hẹn, trạng thái thiết bị | Kiểm tra thiết bị |
| unreachable | Phòng khám chưa liên hệ được với bạn | số điện thoại liên hệ đã che bớt | Yêu cầu gọi lại |
| call_dropped | Cuộc gọi đã bị gián đoạn | bảo toàn thông tin lần khám | Thử kết nối lại |
| result_available | Đã có kết quả | trạng thái hiển thị theo policy | Xem tình trạng |
| awaiting_doctor_review | Đang chờ bác sĩ xem kết quả | không tự diễn giải bất thường | Hỏi phòng khám |
| reviewed | Bác sĩ đã xem kết quả | “Đã thông báo” là trạng thái khác | Xem thông tin được công bố |
| pending_reconciliation | Đang xác nhận thanh toán | mã giao dịch che một phần | Kiểm tra lại |
| deferred | Thanh toán sau | ngày hẹn thu (nếu có) | Xem chi tiết |
| not_required | Không phát sinh phí | lý do theo policy | Về chi tiết lịch |

## 5. Edge-case acceptance contracts (Given / When / Then)
| Case | Given | When | Then |
|---|---|---|---|
| Wrong-subject deep link | Người dùng đang xem hồ sơ A | Link tới kết quả hồ sơ B | kiểm quyền B, chặn nếu thiếu; không tiết lộ tên/bệnh B |
| Appointment conflict | Slot hiển thị còn chỗ | staff/khách khác đặt trước | C5 thất bại có thông báo, giữ lựa chọn khác và quay C4 |
| Payment not settled | người dùng quét QR | quay lại F1 mà bank chưa callback | pending_reconciliation, KHÔNG paid/biên lai |
| QR double payment | backend nhận 2 thông báo cùng transactionId | xử lý webhook | dùng idempotency, một thanh toán; case khác được chuyển finance xem xét |
| Video device blocked | E2 không có camera/mic | thử tham gia | giải thích permission, trợ giúp và fallback được duyệt |
| Missed doctor call | staff gọi không liên hệ được | vào E4 | hiện đúng unavailable, cho callback/rebook, không gắn “bệnh nhân đã khám” |
| Mid-call drop | E3 từng connected | mất mạng | call_dropped, thử lại và gọi staff; không ký encounter |
| Cancel after cutoff | bệnh nhân bấm huỷ sát giờ | backend không cho auto-cancel | không giả đã hủy; đưa policy/hotline rõ ràng |
| Queue service disconnected | E1 không nhận STT mới | quá thời hạn làm mới | “Thông tin chưa cập nhật” và gọi quầy; không tính ETA giả |
| Lab result after sign | encounter signed | test result về sau | tạo result review task, bản ghi signed vẫn giữ audit |
| Result reviewed but not informed | bác sĩ đã xem | SMS chưa gửi/không liên hệ được | message remains pending/unreachable, tạo callback |
| Proxy revoked | người chăm sóc mất scope | mở kết quả qua push cũ | server 403, giải thích không có quyền, che hoàn toàn PHI |
| Offline booking | mạng ngắt tại Submit | patient quay lại app | kiểm trạng thái transaction/idempotency trước retry; không tạo hai hẹn |
| Follow-up SLA exceeded | ticket chờ staff | quá hạn policy | staff escalation; patient UI không tự đặt cam kết giờ |
| Large text + floating tab | Dynamic Type tăng mạnh | tab và CTA bị đẩy | label không cắt, chuyển cách hiển thị/hỗ trợ, không che CTA |

## 6. Tổ chức dữ liệu & event contract (giả lập phi PII)
```json
{
  "actorId": "opaque-account-id",
  "subjectId": "opaque-patient-id",
  "appointmentId": "opaque-appointment-id",
  "encounterId": "opaque-encounter-id",
  "currentResourceVersion": 5,
  "serverUpdatedAt": "ISO-8601",
  "viewContext": "self|delegated",
  "permissions": ["BOOK", "VIEW_RESULT"],
  "appointmentStatus": "confirmed",
  "queueStatus": "waiting_clinic",
  "paymentStatus": "pending_reconciliation",
  "communicationStatus": "pending",
  "nextAction": { "type": "CONTACT_CLINIC", "label": "Gọi phòng khám" },
  "nextActionOwnerRole": "care-coordinator"
}
```

**SECURITY:** ví dụ cấu trúc phi danh tính, không phải API triển khai; không để ID nguồn người bệnh hay bí mật trong deep link/push/analytics. Consent/screen disclosure và log cần legal/security review.

## 7. Nguồn có kiểm chứng
- [HL7 FHIR R4 Appointment](https://hl7.org/fhir/R4/appointment.html), [ServiceRequest](https://hl7.org/fhir/R4/servicerequest.html), [DiagnosticReport](https://hl7.org/fhir/R4/diagnosticreport.html), [Communication](https://hl7.org/fhir/R4/communication.html) — phân tách loại tài nguyên (SOURCE cao; status enum ở trên là CareFlow proposal).
- [NHS family/proxy](https://www.nhs.uk/nhs-app/help/profile/family-and-carer-access/) — quyền đại diện theo cấp độ, màn switching context (SOURCE cao).
- [Thông tư 13/2025/TT-BYT](https://vbpl.vn/boyte/Pages/vbpq-thuoctinh.aspx?ItemID=178219) — hồ sơ bệnh án điện tử; CSDL ghi còn hiệu lực, 21/07/2025 (SOURCE cao).
- [Luật 91/2025/QH15](https://vbpl.vn/tw/Pages/vbpq-thuoctinh.aspx?ItemID=179252) — dữ liệu cá nhân; CSDL ghi còn hiệu lực từ 01/01/2026 (SOURCE cao).
