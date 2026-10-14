# 07 — Patient Journey: user flows, branching and failure recovery v0.2

**Date:** 15/10/2026 • **Status:** DRAFT design specification; clinical/legal/operations validation required. 9 luồng F01–F09 được phân rã từ flow CareFlow người dùng cung cấp; KHÔNG phải SOP đã phê duyệt.

**Quy ước:** Entry → điều kiện → success/failure path → owner → event; các event analytics chỉ ghi ID mờ danh tính, không đưa bệnh/tình trạng vào telemetry. Screen mapping A1–G3 như tài liệu 05/06.

## F01. Đặt lịch cho bản thân không có cảnh báo

**Screen path:** A1/A2 → B1 → C1 → C2 → C4 → C5 → C6 → D2

| Thuộc tính | Nội dung |
|---|---|
| Điều kiện bắt đầu | Đã xác thực và có hồ sơ hợp lệ, chưa có dấu hiệu nguy hiểm theo bộ tiêu chí do cơ sở duyệt |
| Kết thúc thành công | Backend trả appointmentId + trạng thái confirmed (hoặc pending-confirmation thật) cùng bản ghi patientId, hình thức, giờ, điểm khám |
| Ngoại lệ / recovery | Hết slot trước lúc xác nhận → giữ thông tin khác và quay C4; OTP hết hạn → A1; mạng lỗi → không tự hiển thị C6; đặt trùng gần thời điểm → hiển thị lựa chọn xác nhận rõ |
| Bên giữ việc (owner) | Clinic scheduling; công cụ bệnh nhân chỉ gửi yêu cầu |
| Analytics (đề xuất) | `booking_started; patient_selected; screening_completed; slot_selected; booking_submit; booking_confirmed/failed` |
| Chưa xác minh & cách kiểm tra | Thử với bệnh nhân 55+ và first-time user; đo nhầm ngày, nhầm hình thức; policy giữ slot cần IT |

## F02. Đặt hộ người thân

**Screen path:** B1 → C1 (+G1 nếu chưa liên kết) → C2 → C4 → C5 → C6

| Thuộc tính | Nội dung |
|---|---|
| Điều kiện bắt đầu | Actor đăng nhập; có/đăng ký quyền đặt hộ cho subject; quyền đọc hồ sơ KHÔNG suy ra từ quyền đặt hộ |
| Kết thúc thành công | Appointment.patientId = subjectId; createdBy=actorId; confirmation cho actor/subject theo policy |
| Ngoại lệ / recovery | Thiếu bằng chứng đại diện → review hoặc staff hỗ trợ; hết quyền trong lúc đặt → ngừng và giải thích; nhân thân chưa đăng ký → flow thêm hồ sơ + rà trùng |
| Bên giữ việc (owner) | Identity/proxy verification do clinic + legal chốt |
| Analytics (đề xuất) | `proxy_booking_started; proxy_verification_required; wrong_person_prevented; proxy_booking_confirmed` |
| Chưa xác minh & cách kiểm tra | Điều tra người chăm sóc cao tuổi, phụ huynh; phân biệt đặt hộ vs xem kết quả |

## F03. Sàng lọc dấu hiệu nguy hiểm

**Screen path:** C1 → C2 → C3 → gọi cấp cứu / gọi cơ sở / hỗ trợ của nhân viên

| Thuộc tính | Nội dung |
|---|---|
| Điều kiện bắt đầu | Bộ câu hỏi và tiêu chí high-risk được bác sĩ duyệt; app KHÔNG xác định chẩn đoán |
| Kết thúc thành công | Thông điệp hành động phù hợp, người dùng có đường liên hệ rõ; log chỉ tối thiểu theo policy; không tự động coi đã khám |
| Ngoại lệ / recovery | Không gọi được → phương án khẩn cấp dự phòng phù hợp địa điểm theo hướng dẫn duyệt; bệnh nhân vẫn muốn khám online → yêu cầu staff/clinician đánh giá, không tự chấp nhận; nhầm chạm quay lại không xóa thông tin quan trọng |
| Bên giữ việc (owner) | Medical director quyết định nội dung/routing; điều phối viên hỗ trợ |
| Analytics (đề xuất) | `high_risk_screen_shown; help_call_tapped; clinic_contact_tapped; staff_review_requested (chỉ dữ liệu không định danh)` |
| Chưa xác minh & cách kiểm tra | Clinical safety simulation; không đưa triệu chứng bệnh thật vào analytics |

## F04. Khám trực tiếp + CLS trước khám

**Screen path:** D2 → E1 → (F3/F2 nếu CLS trước khám) → D2 → F2

| Thuộc tính | Nội dung |
|---|---|
| Điều kiện bắt đầu | Lịch tại cơ sở confirmed; CLS trước khám phải có yêu cầu/tham khảo bác sĩ và staff điều phối |
| Kết thúc thành công | Check-in thành công; STT được trả theo đúng loại; CLS có trạng thái kết quả; bác sĩ đọc và ký theo thẩm quyền |
| Ngoại lệ / recovery | Bệnh nhân đến muộn / vắng; check-in mạng yếu hoặc sai cơ sở; phòng xét nghiệm trả chậm → không xóa lượt khám; số tiếp nhận ≠ số khám, backend có thể chưa trả STT |
| Bên giữ việc (owner) | Lễ tân → điều dưỡng → kỹ thuật viên → bác sĩ; patient app chỉ hiển thị |
| Analytics (đề xuất) | `checkin_opened; checkin_completed; queue_status_viewed; previsit_test_instructions_opened` |
| Chưa xác minh & cách kiểm tra | Quan sát chuyển giao tại quầy; đo cách staff phát STT và thời điểm lưu kết quả |

## F05. Khám trực tuyến: chờ bác sĩ chủ động liên hệ

**Screen path:** D2 → E2 → E3 hoặc E4 → D2/F2

| Thuộc tính | Nội dung |
|---|---|
| Điều kiện bắt đầu | Có lịch online hợp lệ theo danh mục và policy; thời gian & phương thức liên hệ đã xác nhận |
| Kết thúc thành công | Bệnh nhân kết nối cuộc gọi, tham gia trao đổi; bác sĩ ghi nhận và hoàn tất encounter ở hệ thống y tế |
| Ngoại lệ / recovery | Không liên hệ được (never reached) khác rớt mạng (lost connection); denied mic/camera → hướng dẫn và audio/call fallback theo policy; missed call → create callback task; không tự ký lượt khi user thoát video; có thể hẹn online lại hoặc chuyển trực tiếp qua staff |
| Bên giữ việc (owner) | Bác sĩ/điều dưỡng chủ động liên hệ; điều phối viên chăm sóc ngoại lệ |
| Analytics (đề xuất) | `preflight_started; permission_error; call_connected; call_dropped; patient_unreachable; callback_requested; alternate_channel_selected` |
| Chưa xác minh & cách kiểm tra | Test mạng kém, OS permission denied, app background, missed call sau tắt màn |

## F06. Thanh toán và đối soát

**Screen path:** D2 → F1 → D2

| Thuộc tính | Nội dung |
|---|---|
| Điều kiện bắt đầu | Có nghĩa vụ phí hoặc đánh dấu miễn phí theo quy tắc clinic; có invoice/paymentIntentId và mức thu do backend phát |
| Kết thúc thành công | Webhook/đối soát xác nhận PAID cùng biên lai; nếu miễn phí hiển thị NOT_REQUIRED, không giả là paid |
| Ngoại lệ / recovery | QR generated nhưng không trả → pending; payer nhập sai nội dung → manual review; timeout → vẫn pending; hoãn thanh toán ghi reason+due-date theo policy; hoàn tiền cần policy, status và bằng chứng giao dịch |
| Bên giữ việc (owner) | Finance staff/system of record; không cho bệnh nhân tự bấm đánh dấu Đã thu |
| Analytics (đề xuất) | `payment_viewed; payment_method_selected; return_from_payment; payment_status_received; support_payment_tapped` |
| Chưa xác minh & cách kiểm tra | Xác nhận rule thu phí trước/ sau khám, đối soát nhà thuốc thu hộ |

## F07. Kết quả xét nghiệm và thông báo

**Screen path:** D2 → F3 → F2 → G2 → F2/F4

| Thuộc tính | Nội dung |
|---|---|
| Điều kiện bắt đầu | Có ServiceRequest/Result gắn đúng patient + encounter; thông báo và quyền release cấu hình theo cơ sở |
| Kết thúc thành công | Bệnh nhân nhìn thấy trạng thái đúng: ordered → awaiting → result-available → doctor-review → communication; app không tự công bố thông tin bị giới hạn |
| Ngoại lệ / recovery | Bác sĩ đã xem ≠ bệnh nhân đã được truyền đạt; không gửi toàn bộ kết quả trong SMS/Zalo; bác sĩ chỉ định thêm CLS → tạo order mới; không liên hệ được → callback pending; kết quả bất thường cần policy riêng |
| Bên giữ việc (owner) | Kỹ thuật viên/Lab → bác sĩ → điều phối viên |
| Analytics (đề xuất) | `test_status_viewed; result_access_authorized; result_viewed; clinic_contact_tapped` |
| Chưa xác minh & cách kiểm tra | Phỏng vấn bác sĩ về release policy và diễn giải, không thêm interpret tự động |

## F08. Chăm sóc sau khám / giới thiệu chuyên khoa

**Screen path:** F2 → F4 → D2 / G2 → F4

| Thuộc tính | Nội dung |
|---|---|
| Điều kiện bắt đầu | Bệnh nhân phản hồi đơn thuốc/hướng dẫn/triệu chứng mới; hoặc bác sĩ giao nhiệm vụ lâm sàng/giới thiệu chuyên khoa |
| Kết thúc thành công | Có ticket owner và next-contact; bác sĩ nhận phản hồi khi cần; không mất vòng theo dõi; referral outcome gắn hồ sơ theo quyền |
| Ngoại lệ / recovery | Dấu hiệu nguy cấp → route bác sĩ duyệt; không liên hệ được → giữ chưa truyền đạt và callback; quá SLA → escalate; patient trả lời ngoài giờ → thông tin thời gian hỗ trợ thực tế |
| Bên giữ việc (owner) | Điều phối viên/điều dưỡng; bác sĩ khi cần đánh giá chuyên môn |
| Analytics (đề xuất) | `followup_contact_opened; callback_submitted; callback_acknowledged; care_task_status_viewed` |
| Chưa xác minh & cách kiểm tra | Quan sát bàn giao thực tế và thỏa thuận giờ/SLA chính thức |

## F09. Tái khám vòng chăm sóc

**Screen path:** F2 / D2 / G2 → C1 (đúng patient) → C2 (sàng lọc lại theo policy) → C4–C6 → D2

| Thuộc tính | Nội dung |
|---|---|
| Điều kiện bắt đầu | Có lời dặn tái khám hoặc nhu cầu mới; quyền đặt hộ vẫn hợp lệ |
| Kết thúc thành công | Lịch mới có parentEncounterId/revisit linkage; nhắc lịch; cập nhật tiếp chu kỳ chăm sóc |
| Ngoại lệ / recovery | Không tự bỏ qua sàng lọc nếu thiếu chỉ dẫn y tế; lịch cũ chưa thanh toán có policy độc lập; no-show/huỷ phải lưu reason/history và link rebook |
| Bên giữ việc (owner) | Bệnh nhân/điều phối viên lập lịch; bác sĩ quyết định nội dung tái khám |
| Analytics (đề xuất) | `rebook_started; rebook_confirmed; reminder_opened; revisit_checked_in` |
| Chưa xác minh & cách kiểm tra | Phỏng vấn nhân viên về tái khám không thu phí sau kết quả |

## Cross-flow rules — chống sai nghiệp vụ

1. **Tách patient và actor** trong booking, result, notification, payment: một account có nhiều subject nhưng không mặc định có quyền tương đương.
2. **Chỉ server xác nhận trạng thái cuối**: successful appointment, payment completed, cancel completed, eCheckin success. UI optimistic chỉ áp dụng trạng thái có thể đảo và không ảnh hưởng an toàn.
3. **Bản ghi mới không ghi đè lịch sử:** rebook tạo appointment mới link lịch cũ; refund tạo giao dịch mới; test mới có order mới; cập nhật kết quả có version/audit.
4. **C3 là giao diện nguy cơ cao:** không thể mở luồng online/in-person tự phục vụ dựa trên một nút “Tôi vẫn muốn khám” nếu không có policy clinician sign-off.
5. **E4 giữ ngữ cảnh:** lưu các bước preflight, thông tin slot, callback; không lặp câu hỏi triệu chứng.
6. **F2/F3 tách review/release/notification:** kết quả tồn tại không đồng nghĩa được công bố; role authorized quyết định thời điểm.
7. **F4 owner và SLA:** bệnh nhân nhìn thấy “Phòng khám đã nhận yêu cầu” chỉ sau server acknowledge; không hiển thị tên cá nhân staff nếu chưa được phép.
8. **Giải pháp hỗ trợ:** hotline hiện ở error state và phần hỗ trợ; cấu hình số điện thoại theo địa điểm và giờ làm việc thực.

## Tham chiếu bên ngoài (cấp độ khái niệm, không phải local SOP)

- [NHS Family & Carer Access](https://www.nhs.uk/nhs-app/help/profile/family-and-carer-access/) — phân quyền/acting for khác với chỉ tạo lịch (SOURCE cao).
- [Thông tư 30/2023/TT-BYT](https://vbpl.vn/boyte/Pages/vbpq-toanvan.aspx?ItemID=178262) — khám chữa bệnh từ xa trong danh mục, đang có hiệu lực theo CSDL (SOURCE cao; review pháp lý chuyên sâu vẫn bắt buộc).
- [HL7 FHIR Appointment R4](https://hl7.org/fhir/R4/appointment.html), [ServiceRequest R4](https://hl7.org/fhir/R4/servicerequest.html), [DiagnosticReport R4](https://hl7.org/fhir/R4/diagnosticreport.html): tách appointment/order/result; không khẳng định HIS của phòng khám hỗ trợ FHIR (SOURCE cao, applicability chưa xác minh).

**Next:** map sang bản ghi trạng thái và acceptance criteria ở tài liệu 08.