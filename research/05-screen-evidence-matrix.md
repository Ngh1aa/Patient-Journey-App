# Screen Evidence Matrix & Research synthesis
Ngày kiểm tra nguồn 15/10/2026 — xem phần 01–04 để biết links và độ tin cậy theo nguồn. Mỗi recommendation cần được test.

## (a) Ma trận 23 màn hình
| ID | Màn hình | Nguồn/pattern đối chiếu | Khuyến nghị đặc thù | Tin cậy | Chưa xác minh |
|---|---|---|---|---|---|
| A1 | Chào mừng/đăng nhập | Apple one-time-code, NHS | SĐT + OTP autofill, hotline, quyền riêng tư | Cao | kênh OTP của phòng khám |
| A2 | Tạo hồ sơ đầu tiên | UMC/MyChart; WCAG labels | trường bắt buộc tối thiểu, kiểm trùng backend, không thu thập thừa | Trung bình | định danh và đồng ý |
| B1 | Trang chủ | NHS/MyChart upcoming card | thẻ lịch tới cho đúng người, 1 CTA rõ, gọi clinic | Trung bình | lịch real time |
| C1 | Ai đi khám | NHS proxy/Doctolib relative | chọn hồ sơ trước nhập triệu chứng; indicator luôn có | Cao | đại diện hợp pháp |
| C2 | Lý do/sàng lọc | CareFlow clinical workflow, medical review | câu hỏi dễ hiểu, tách nhánh, không tự chẩn đoán | Trung bình | bộ dấu hiệu duyệt |
| C3 | Cảnh báo nguy hiểm | NHS urgent routing, WCAG | full-screen, ưu tiên giúp khẩn cấp và hotline; no false reassurance | Trung bình | policy bác sĩ |
| C4 | Chọn ngày giờ | Doctolib/Zocdoc | slot rõ, timezone, điểm khám, trạng thái slot | Cao | API slot/tạm giữ |
| C5 | Xác nhận đặt lịch | NHS/Medpro | tóm tắt người–lý do–hình thức–thời điểm–phí | Trung bình | phí đầu kỳ, consent |
| C6 | Đặt lịch xong | Doctolib/MyChart | mã hẹn, bước tiếp theo, nhắc lịch và link D2 | Trung bình | SMS/Zalo delivery |
| D1 | Danh sách hẹn | NHS/MyChart | nhóm sắp tới/quá khứ, hủy, trạng thái | Cao | nguồn đồng bộ |
| D2 | Chi tiết hẹn | MyChart/UMC | timeline và next step, owner theo ngôn ngữ bệnh nhân | Trung bình | staff handoff |
| D3 | Hủy/đổi | Doctolib, workflow | lý do, chính sách, log và rebook | Trung bình | cut-off & refund |
| E1 | Check-in/STT | MyChart eCheck-in; Medpro | tách số tiếp nhận/số khám, chờ không suy đoán | Trung bình | hàng đợi realtime |
| E2 | Chuẩn bị khám online | MyChart/telehealth docs | check mic/camera/network, permission & call support | Cao | SDK selected |
| E3 | Video visit | Agora/Zoom/Jitsi | bộ điều khiển lớn, đang kết nối rõ, riêng tư | Trung bình | network testing |
| E4 | Chưa kết nối | telehealth failure patterns | thử lại/gọi/hẹn lại/đến trực tiếp, callback state | Trung bình | owner/SLA |
| F1 | Thanh toán | VietQR/NAPAS/MoMo | QR + mã tham chiếu, trạng thái backend; hoãn và miễn phí riêng | Cao | reconciliation/refund |
| F2 | Kết luận, toa, kết quả | NHS/MyChart/UMC | ngày, bác sĩ, trạng thái review & truyền đạt, link F4 | Trung bình | quyền release kết quả |
| F3 | Xét nghiệm cần làm | lab state contract | chờ thực hiện → có kết quả → bác sĩ xem, chuẩn bị theo chỉ dẫn cơ sở | Trung bình | protocol xét nghiệm |
| F4 | Hỏi phòng khám | clinic operation | gọi ngay / yêu cầu gọi lại; ticket/status/owner | Trung bình | SLA |
| G1 | Hồ sơ/người thân | NHS proxy/MyChart | rõ quyền, chọn hồ sơ, thu hồi, không tự trao quyền xem | Cao | giấy tờ đại diện |
| G2 | Thông báo | Zalo/FCM/APNs | loại thông báo, không lộ PHI, deep link đúng người | Cao | template approval |
| G3 | Cài đặt | Apple accessibility, luật DP | text scaling, theme, privacy controls, hotline | Cao | triển khai rights |

## (b) 10 phát hiện ưu tiên
1. Bối cảnh khám đa kênh đòi app thể hiện đúng tiến độ, không chỉ đặt lịch (INFERENCE, high).
2. Tách **đặt hộ** và quyền đọc/sửa hồ sơ; chọn đúng người ngay bước C1 (FACT NHS proxy + RECOMMENDATION).
3. C3 là safety-critical, không thử nghiệm quyết định y tế bằng copy AI (RECOMMENDATION, critical).
4. Check-in / số tiếp nhận / số đang chờ khám khác nhau, không gộp STT (INFERENCE, high).
5. Lỗi video có recovery offline/hotline/callback, không chỉ nút retry (RECOMMENDATION, high).
6. Kết quả có, bác sĩ xem và bệnh nhân được thông báo là ba sự kiện độc lập (flow FACT từ yêu cầu nghiệp vụ, high).
7. Hiện mã QR không phải đã trả tiền, cần backend reconciliation (FACT kỹ thuật, critical).
8. Font 17pt và nút 52pt phù hợp baseline nhưng dynamic type/touch area/contrast quan trọng hơn độ bo 20 (FACT+RECOMMENDATION).
9. Nền tảng pháp lý dữ liệu cá nhân Việt Nam đổi từ 01/01/2026; không chỉ dựa NĐ 13/2023 (FACT, critical).
10. Không có evidence định lượng local để chốt số bước/chuyển đổi/no-show nên phải nghiên cứu tại phòng khám (UNVERIFIED, critical).

## (c) Khoảng trống và nghiên cứu lấp
| Gap | Tại sao | Phương pháp | Người xác nhận |
|---|---|---|---|
| End-to-end clicks benchmark | không truy cập account/booking thực, các cơ sở khác nhau | audit có timestamp 8–12 app trên máy thật | UX |
| Hành vi bệnh nhân Việt Nam nhiều tuổi | chưa có primary data | phỏng vấn phân tầng + usability test tại quầy | UX + clinic |
| Rà trùng/identity & family proxy | dễ nhập/chọn sai người | interview lễ tân, legal review đại diện | Product + legal |
| C3 dấu hiệu nguy cấp | quyết định chuyên môn | clinical workshop & simulated safety testing | Medical director |
| Queue/số thứ tự hiện thực | hệ thống phòng khám có thể không realtime | walkthrough HIS/PMS API | Operations + IT |
| Kết quả được công bố khi nào | review khác release | bác sĩ + legal + EMR vendor | Medical/Legal |
| Fee/refund/store receipts | có nhiều đường thu phí | đối soát ca thực tế không chứa PII | Finance |
| Video low bandwidth | mỗi SDK/điện thoại khác nhau | test 3G/4G, packet loss, blocked permissions | Mobile team |
| Baseline booking/no-show | không có số chính chủ | event instrumentation, 4–8 tuần pilot rồi đo | Analytics |
| Chi phí tích hợp, SMS/ZNS SDK | phụ thuộc volume/contract/data region | lấy báo giá + DPA + pilot | Procurement |
| App marketing/clinical content | thay đổi quy định/phạm vi dịch vụ | legal review trước release | Legal |
| Mức tiếp cận & trợ năng thực | guideline ≠ usability test | VoiceOver/TalkBack, 200% text, seniors | UX |

## (d) Danh mục nguồn theo module
A: https://apps.apple.com/vn/app/umc-care/id1484775684 ; https://medpro.vn/ ; https://apps.apple.com/vn/app/youmed-%E1%BB%A9ng-d%E1%BB%A5ng-%C4%91%E1%BA%B7t-kh%C3%A1m/id1466077723 ; https://apps.apple.com/vn/app/myvinmec/id1494832536 ; https://www.nhs.uk/nhs-app/ ; https://www.mychart.org/Features ; https://doctolibpatient.zendesk.com/hc/de/articles/14141893264924-How-can-I-book-an-appointment-online ; https://www.zocdoc.com/patient-help/en/articles/8724858-how-do-i-make-an-appointment ; https://www.practo.com/consult ; https://www.teladochealth.com/individuals/24-7-care
B: https://developer.apple.com/design/human-interface-guidelines/ ; https://www.w3.org/TR/WCAG22/ ; https://m3.material.io/ ; https://www.nngroup.com/articles/usability-for-senior-citizens/
C: xem bảng C01–C11 ở 01-benchmark-patterns.md
D: https://github.com/bettergui/BeVietnamPro ; https://github.com/rsms/inter ; https://fonts.google.com/noto/specimen/Noto+Sans ; https://lucide.dev/license ; https://github.com/phosphor-icons/core ; https://fonts.google.com/icons ; https://unsplash.com/license ; https://www.pexels.com/license/ ; https://undraw.co/license ; https://www.figma.com/community
E: https://vanban.chinhphu.vn/ ; https://vbpl.vn/
F: https://developers.zalo.me/ ; https://vietqr.io/ ; https://napas.com.vn/ ; https://developers.momo.vn/ ; https://sandbox.vnpayment.vn/apis/ ; https://docs.zalopay.vn/ ; https://www.agora.io/en/pricing/ ; https://www.twilio.com/docs/video ; https://developers.zoom.us/docs/video-sdk/ ; https://www.100ms.live/ ; https://jitsi.org/ ; https://firebase.google.com/docs/cloud-messaging ; https://www.hl7.org/fhir/
G: https://www.nhs.uk/tests-and-treatments/blood-tests/ ; https://www.who.int/health-topics/integrated-people-centred-care
H: https://measuringu.com/sus/ ; https://measuringu.com/umux-lite/ ; https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/
I: kế hoạch phỏng vấn/khảo sát do nhóm thiết kế biên soạn; chưa có dữ liệu người tham gia, không gắn nhãn “đã nghiên cứu thực địa”.

**Ngày truy cập:** 15/10/2026. **Publication date:** nếu nguồn không ghi rõ hoặc chưa kiểm được ngày ban hành của một trang động thì **chưa xác minh**, không dùng ngày truy cập thay ngày xuất bản.