# Module A & C — Benchmark và pattern library
_Nguồn được kiểm tra: 15/10/2026. Mức tin cậy chỉ nói về thông tin xác minh, KHÔNG phải chất lượng UX tổng thể._

## A. Benchmark 12 ứng dụng / dịch vụ

| App | Chứng cứ về chức năng | Đặt hộ / người ít rành | Check-in / queue | Online / khi mất kết nối | Thanh toán / kết quả | Số màn hình đặt lịch từ đầu đến cuối | Giá trị cho CareFlow | Screenshot công khai & nguồn | Tin cậy |
|---|---|---|---|---|---|---|---|---|
| UMC Care (VN) | đặt lịch, hồ sơ, nhắc lịch | có hồ sơ nhiều thành viên; độ dễ dùng chưa đo | có quy trình khám; hàng đợi real-time chưa xác minh | online & lỗi mạng chưa xác minh | thanh toán, kết quả CLS, hình ảnh, toa | **Chưa xác minh** | thống nhất lịch–kết quả–thanh toán | [App Store](https://apps.apple.com/vn/app/umc-care/id1484775684), [hướng dẫn UMC](https://demobvdaihoc.umc.edu.vn/en/important-information/guide-to-booking-medical-appointments-online) | Cao về danh mục chức năng |
| Medpro (VN) | đặt lịch khám nhiều bệnh viện | đặt hộ cụ thể chưa xác minh | có số thứ tự/đăng ký trước, queue thực tế tùy cơ sở | có dịch vụ trực tuyến ở hệ sinh thái; failure chưa xác minh | có hình thức thanh toán và hoàn hủy tùy tuyến | **Chưa xác minh** | hiển thị rõ số tiếp nhận khác số vào phòng | [App Store](https://apps.apple.com/vn/app/medpro-%C4%91%E1%BA%B7t-l%E1%BB%8Bch-kh%C3%A1m-b%E1%BB%87nh/id1481561748), [website](https://medpro.vn/) | Trung bình |
| YouMed (VN) | đặt bác sĩ/phòng khám, tư vấn từ xa | đặt cho người thân | một review cho thấy STT đăng ký ≠ STT khám | video/chat, recovery chưa xác minh | thanh toán, kết quả tùy cơ sở; cần kiểm chứng | **Chưa xác minh** | cặp nhãn STT khác nhau | [App Store](https://apps.apple.com/vn/app/youmed-%E1%BB%A9ng-d%E1%BB%A5ng-%C4%91%E1%BA%B7t-kh%C3%A1m/id1466077723) | Trung bình (review: thấp) |
| MyVinmec (VN) | đặt lịch, hồ sơ dịch vụ | gia đình/đặt hộ được mô tả | số chờ & check-in chưa xác minh | tư vấn trực tuyến | hồ sơ và kết quả tùy dịch vụ | **Chưa xác minh** | family-centric profile | [App Store](https://apps.apple.com/vn/app/myvinmec/id1494832536) | Cao về tính năng giới thiệu |
| eDoctor (VN) | tư vấn từ xa, chăm sóc sức khỏe | chưa xác minh | chưa xác minh | teleconsultation; khi lỗi chưa xác minh | tùy sản phẩm; chưa xác minh | **Chưa xác minh** | hành trình tư vấn không tại cơ sở | [App Store](https://apps.apple.com/vn/app/edoctor-know-your-health/id1041327503) | Trung bình |
| Jio Health (VN) | dịch vụ và tiếp cận khám bệnh | chưa xác minh | chưa xác minh | chưa xác minh thực tế từng nền tảng | chưa xác minh | **Chưa xác minh** | so sánh định vị chăm sóc liên tục | [App Store](https://apps.apple.com/vn/app/jio-health/id933157797) | Thấp ở các chức năng chi tiết |
| NHS App (UK) | appointment, prescription, results | **proxy access** cần được cơ sở cấp quyền | check-in/queue không phải tính năng phổ quát | không phải lõi video thống nhất | kết quả và toa | **Chưa xác minh** (hướng dẫn có thao tác, không phải số màn end-to-end) | banner “đang thay mặt ai” | [guide](https://digital.nhs.uk/services/nhs-app/toolkit/step-by-step-guide), [family access](https://www.nhs.uk/nhs-app/help/profile/family-and-carer-access/) | Cao |
| MyChart (US) | appointment, eCheck-in, hồ sơ | proxy access | **eCheck-in**, không khẳng định queue real-time | video visit, kiểm tra thiết bị trước | billing, lab results, prescriptions | **Chưa xác minh** | status và khoảng tham chiếu kết quả | [features](https://www.mychart.org/Features), [screenshots](https://apps.apple.com/us/app/mychart/id382952264), [help](https://www.mychart.org/l/en-us/help/?lang=en-us&sub=2) | Cao |
| Doctolib (EU) | booking theo bác sĩ/lý do/slot | thêm người thân; quyền đại diện được xác nhận | không xác minh queue | video phụ thuộc bác sĩ, lỗi chưa xác minh | hồ sơ/thanh toán phụ thuộc quốc gia | **Chưa xác minh** (hướng dẫn mô tả nhiều hành động, không được coi là số screen) | bước chọn ai khám, lý do, thời gian | [how to book](https://doctolibpatient.zendesk.com/hc/de/articles/14141893264924-How-can-I-book-an-appointment-online), [relative](https://doctolibpatient.zendesk.com/hc/de/articles/14142017328412-How-can-I-book-an-appointment-for-my-relative) | Cao |
| Zocdoc (US) | tìm theo lý do, bảo hiểm, bác sĩ | có đặt cho người khác | không xác minh | telehealth tùy nhà cung cấp | thanh toán/kết quả bên phòng khám; chưa xác minh | **Chưa xác minh** | hiển thị slot + chính sách rõ | [how it works](https://www.zocdoc.com/patient-help/en/articles/8724654-how-does-zocdoc-work), [how to book](https://www.zocdoc.com/patient-help/en/articles/8724858-how-do-i-make-an-appointment) | Cao |
| Practo (IN) | khám online theo triệu chứng/chuyên khoa | chưa xác minh | không xác minh | gọi video/audio; recovery chưa xác minh | đơn thuốc sau tư vấn | **Chưa xác minh** | chọn hình thức khi điều kiện phù hợp | [Practo Consult](https://www.practo.com/consult) | Trung bình |
| Teladoc (US) | tư vấn từ xa theo nhu cầu | chưa xác minh | không phù hợp check-in tại cơ sở | video/phone theo dịch vụ; cơ chế mất kết nối chưa xác minh | thông tin sau khám, bảo hiểm tùy vùng | **Chưa xác minh** (mô tả 3 khâu ý niệm, không phải 3 screen) | phương án gọi thay thế | [24/7 Care](https://www.teladochealth.com/individuals/24-7-care) | Trung bình |

**Chỉ tiêu so sánh cần tự audit:** số lần chạm, số màn unique, số trường bắt buộc, lỗi validation, booking cho người thân, chuyển nhánh danger, số bước huỷ/đổi, thời điểm yêu cầu OTP, số lần phải nhập lại. Không có dữ liệu đo trực tiếp: tất cả để **UNVERIFIED**. Điểm yếu nêu trong nghiên cứu này là **gap công khai**, không phải khẳng định app thiết kế kém.

**Ngày hướng dẫn đã biết:** hướng dẫn Doctolib booking cập nhật 16/08/2024, người thân 07/08/2025; hướng dẫn NHS 02/07/2026; bài Zocdoc how-it-works 04/05/2026, how-to-book 12/04/2024; các listing app có ngày cập nhật phiên bản biến động, chưa định ngày phát hành chính xác.

## C. 11 mẫu tương tác — 3–5 nguồn gợi ý mỗi mẫu

Đây là **những đối chuẩn gần bài toán**, không khẳng định cả 3–5 dịch vụ có sẵn chính xác thành phần UI cùng tên. Khi vẽ high-fidelity phải xem screenshot/phiên bản thực và audit riêng.

| Pattern | 3–5 ví dụ tham chiếu (link có trong benchmark) | Lý do / CareFlow screen | Tin cậy |
|---|---|---|---|
| C01. Journey timeline + owner | MyChart (visit), NHS (kết quả), UMC Care (hồ sơ), Medpro (lịch) | B1/D2/F2: label “Đang chờ điều dưỡng”, “Bác sĩ đang xem”; owner thuộc staff side nhưng thể hiện theo ngôn ngữ bệnh nhân | Trung bình — timeline chi tiết chưa xác minh trong từng app |
| C02. Upcoming-appointment card | NHS App, MyChart, UMC Care, YouMed | B1: 1 lịch gần nhất; tên người khám, nơi khám, giờ, CTA check-in/chuẩn bị khám | Cao về use case, trung bình về layout |
| C03. Progressive booking | Doctolib, NHS, Zocdoc, UMC Care, Medpro | C1–C6: chia bước theo người, lý do, cảnh báo, slot, tóm tắt; lưu tiến trình | Cao về các task; số bước chưa đo |
| C04. Fullscreen urgent warning | Teladoc (non-emergency scope), NHS (urgent care routing), MyChart (urgent care/info) | C3: stop state, CTA “Gọi cấp cứu”, “Gọi phòng khám” khi hợp lệ; không tự chẩn đoán | Trung bình — cần clinician signoff |
| C05. Check-in & queue | MyChart (eCheck-in), UMC Care, Medpro, YouMed | E1: phân biệt “số tiếp nhận” và “số chờ khám”, cập nhật real-time chỉ nếu backend cung cấp | Trung bình |
| C06. Virtual waiting room | MyChart (video preflight), Practo (teleconsult), Teladoc (request/call), YouMed | E2/E3: quyền mic/camera, kiểm tra mạng, trạng thái chờ bác sĩ | Cao về need, trung bình về từng UI |
| C07. Unable to connect | MyChart (televisit help), NHS (alternative contact via clinic), Teladoc (telehealth/phone), Practo (audio) | E4: thử lại / gọi phòng khám / xin gọi lại / đổi lịch; có trạng thái callback | Trung bình — failure screens chưa được audit |
| C08. Bank QR payment | VietQR (QR), MoMo (gateway), Medpro (trả phí), MyChart (billing) | F1: QR + mã tham chiếu + hướng dẫn + “Đang xác nhận thanh toán”; không tự đánh dấu thành công | Cao về công nghệ; trung bình về UI |
| C09. Patient-friendly lab results | NHS App, MyChart, UMC Care, YouMed | F2/F3: đơn vị, khoảng tham chiếu nếu được chuyên môn duyệt, thời điểm, “chờ bác sĩ xem” | Cao về dữ liệu, trung bình về copy |
| C10. Switching proxy profiles | NHS App (proxy), MyChart (proxy), Doctolib (relative), MyVinmec (family) | C1/G1: patient-context chip trên mọi bước; phân quyền và xác nhận quyền đại diện | Cao |
| C11. Reminder & deep link | NHS App, MyChart, Zocdoc, Medpro, Zalo Template Message | G2/D2: OTP/auth trước mở dữ liệu, link có expiry, CTA hiển thị đúng lịch hẹn | Cao về patterns, chưa xác minh từng deep link của đối thủ |

### Yêu cầu visual screenshot / bằng chứng
- **App store screenshots**: [UMC](https://apps.apple.com/vn/app/umc-care/id1484775684), [Medpro](https://apps.apple.com/vn/app/medpro-%C4%91%E1%BA%B7t-l%E1%BB%8Bch-kh%C3%A1m-b%E1%BB%87nh/id1481561748), [YouMed](https://apps.apple.com/vn/app/youmed-%E1%BB%A9ng-d%E1%BB%A5ng-%C4%91%E1%BA%B7t-kh%C3%A1m/id1466077723), [MyVinmec](https://apps.apple.com/vn/app/myvinmec/id1494832536), [MyChart](https://apps.apple.com/us/app/mychart/id382952264), [Jio Health](https://apps.apple.com/vn/app/jio-health/id933157797), [eDoctor](https://apps.apple.com/vn/app/edoctor-know-your-health/id1041327503).
- **Hướng dẫn có minh hoạ**: [NHS](https://digital.nhs.uk/services/nhs-app/toolkit/step-by-step-guide), [Doctolib](https://doctolibpatient.zendesk.com/hc/de/articles/14141893264924-How-can-I-book-an-appointment-online), [MyChart help](https://www.mychart.org/l/en-us/help/?lang=en-us&sub=2), [Zocdoc booking](https://www.zocdoc.com/patient-help/en/articles/8724858-how-do-i-make-an-appointment), [Teladoc](https://www.teladochealth.com/individuals/24-7-care), [Practo](https://www.practo.com/consult).
- Hình minh họa hay app listing **không chứng minh** flow hiện hành. Để xác nhận UI thật: cài và audit từng bản cập nhật, lưu timestamp, quốc gia, nền tảng, screen-id và điều kiện truy cập. Không đưa ảnh bên thứ ba vào repo công khai.

## Hành động thiết kế từ benchmark
- **A1/A2:** OTP autofill, bảo mật không đòi full medical history ngay tại login; xác minh trước khi xem dữ liệu nhạy cảm.
- **B1:** lịch tiếp theo, hành động chính, hotline.
- **C1–C6:** chọn người được khám TRƯỚC khi nhập lý do; giảm nhập lại; review C5 là vị trí kiểm tra sai người/sai lịch; C3 dùng medically-approved logic.
- **D1–D3:** nhắc lịch, hủy có reason/history, chi tiết thay đổi và hậu quả hủy.
- **E1–E4:** mã/lượt khám + trình tự hiện tại, telehealth preflight, callback + bảo toàn dữ liệu.
- **F1–F4:** payment reconciliation, kết quả có trạng thái review, hỏi phòng khám và theo dõi response.
- **G1–G3:** proxy, nhắc lịch tối thiểu, privacy/accessibility settings.

## Nguồn gốc
Nguồn link trên được truy cập/đối chiếu 15/10/2026; thời gian công bố riêng được ghi khi có. Tất cả claim chưa đo là UNVERIFIED, không dùng làm KPI baseline.