# Modules G, H, I — Microcopy, đo lường và nghiên cứu sơ cấp
_Ngày truy cập nguồn: 15/10/2026. Các ví dụ chữ là đề xuất UX, chưa được duyệt lâm sàng/pháp lý._

## G. Microcopy cho bệnh nhân

| Internal term | Patient-facing copy | Screen | Lưu ý |
|---|---|---|---|
| Cận lâm sàng | Xét nghiệm và chụp chiếu | F3 | Nêu loại cụ thể (máu, siêu âm...) |
| Tiếp nhận | Đã làm thủ tục tại phòng khám | E1 | Phân biệt đặt lịch thành công |
| Ký/khóa lượt khám | Bác sĩ đã hoàn tất ghi nhận buổi khám | F2 | Không hàm ý mọi kết quả đã sẵn sàng |
| No-show | Bạn chưa đến theo lịch hẹn | D2 | Cho liên hệ/đặt lại; tránh đổ lỗi |
| Hoãn thanh toán | Thanh toán sau | F1 | Hiển thị lý do/hạn thanh toán nếu được phép |
| Awaiting doctor review | Đã có kết quả, đang chờ bác sĩ xem | F2/F3 | Không viết “đã hoàn tất” |
| Không liên hệ được | Phòng khám chưa liên hệ được với bạn | E4/F4 | Cho phép kiểm tra số và yêu cầu gọi lại |
| Không có lịch | Bạn chưa có lịch khám sắp tới | B1/D1 | CTA “Đặt lịch khám” |
| Đổi lịch | Chọn ngày giờ khác | D3 | Giữ thông tin người khám/lý do nếu được |
| Người được khám | Lịch khám này dành cho ai? | C1 | Không ghi chung chung “Người dùng” |
| Đang xử lý giao dịch | Phòng khám đang kiểm tra thanh toán | F1 | Không xác nhận thành công cho đến khi backend xác nhận |

**Mẫu thông báo C3 (chưa được duyệt):** “Một số thông tin bạn vừa chọn có thể cần được hỗ trợ y tế khẩn cấp. Ứng dụng không thể xác định tình trạng của bạn. Hãy liên hệ dịch vụ cấp cứu hoặc cơ sở y tế phù hợp ngay. Bạn vẫn có thể gọi phòng khám để được hướng dẫn.” Hành động/số gọi phải cấu hình cho địa điểm và quy trình bác sĩ duyệt; tránh tự sinh nội dung chẩn đoán hay để “Tiếp tục đặt lịch” làm mặc định.

**Thông báo G2:** “Bạn có cập nhật từ phòng khám. Đăng nhập để xem.” Tránh chứa kết quả xét nghiệm, thuốc, bệnh lý, ngày sinh đầy đủ trong lock-screen. Link mở đúng mục sau xác thực, kiểm tra người được khám và quyền đại diện.

**Chuẩn bị trước khám/xét nghiệm:** chỉ hiển thị hướng dẫn chính xác do phòng khám/bác sĩ ban hành cho *từng loại xét nghiệm*; KHÔNG mặc định nhịn ăn cho mọi xét nghiệm. Nguồn nền: [NHS blood tests](https://www.nhs.uk/tests-and-treatments/blood-tests/), [WHO people-centered care](https://www.who.int/health-topics/integrated-people-centred-care). Hướng dẫn chi tiết Bộ Y tế cho từng xét nghiệm của cơ sở: **chưa xác minh**.

## H. Benchmarks và phương pháp test
| Chỉ số | Bằng chứng/giới hạn | Đề xuất đo trong CareFlow | Mức tin cậy |
|---|---|---|---|
| No-show | tổng quan nghiên cứu no-show tồn tại, nhưng tỉ lệ dao động theo khoa/đất nước; **không có baseline đáng tin riêng Việt Nam và phòng khám này** | no_show / appointments_eligible, theo cơ sở, nhóm tuổi, kênh, lead time; phân biệt huỷ sớm, đổi lịch | Cao về định nghĩa nội bộ; số tham chiếu chưa xác minh |
| Booking conversion | **Không tìm được baseline công khai so sánh được** cho app y tế Việt Nam với cùng mẫu số | completed_bookings / started_booking_flows; thêm first-try completion, bỏ bước nào | Cao về metric; baseline chưa xác minh |
| SUS | 10 câu hỏi thang 5 điểm, 0–100; mức 68 thường được dùng như mốc tham khảo, không phải mục tiêu bắt buộc | sau test, cùng bản dịch được kiểm chứng, báo cáo n và phân bố, không coi SUS là success rate | Cao; [MeasuringU](https://measuringu.com/sus/) |
| UMUX-Lite | 2 mục usefulness + ease-of-use; biến đổi thang điểm phụ thuộc cách tính, không so trực tiếp với SUS nếu không giải thích | test sau task, ghi nguyên thang và công thức | Cao; [MeasuringU](https://measuringu.com/umux-lite/) |
| Task success | cần đo định nghĩa rõ ràng | tỷ lệ hoàn thành đúng không nhờ hỗ trợ + time on task + error count + critical safety failures | Cao về phương pháp |
| Telehealth recovery | không có baseline Việt Nam | tỷ lệ phục hồi sau mất kết nối/đổi kênh thành công, thời gian contact được với clinic | Trung bình |

Nguồn H: [NN/g why test with 5 users](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/); [NN/g usability for seniors](https://www.nngroup.com/articles/usability-for-senior-citizens/); [SUS](https://measuringu.com/sus/), [UMUX-Lite](https://measuringu.com/umux-lite/). Các nguồn kinh điển trước 2023 là phương pháp, không phải dữ liệu thị trường 2026.

### Plan usability
- **Tối thiểu đề xuất 24–30 lượt tham gia**, cân bằng độ tuổi 18–34, 35–54, 55–69 và 70+, trải nghiệm smartphone thấp/cao, Android/iOS, thị lực/thính lực/vận động, người đặt hộ. Đây là target tuyển mẫu *đề xuất*, KHÔNG phải cỡ mẫu bảo đảm tính đại diện thống kê.
- Vòng 1 moderated: ở quầy, thiết bị người dùng; vòng 2 remote moderated: screen share, kiểm tra audio, theo tình huống. Không yêu cầu bệnh nhân tiết lộ hồ sơ sức khỏe thật trong bản mẫu.
- **Tasks:** T1 đặt lịch cho mình khi không có cảnh báo; T2 đặt hộ mẹ và kiểm tra đúng hồ sơ; T3 xử lý C3 khi dấu hiệu nguy hiểm được mô phỏng; T4 check-in và hiểu STT; T5 nối video khi camera bị chặn; T6 không kết nối được rồi gọi/hẹn lại; T7 phân biệt “có kết quả/chờ bác sĩ xem”; T8 thanh toán QR nhưng backend chưa xác nhận; T9 đặt tái khám; T10 tìm hotline.
- Thu thập: completion, wrong-profile events, first-click, critical errors, thời gian, comprehension, SUS/UMUX-Lite, ghi lại quote tự nguyện. Không đánh giá bệnh lý thật.
- Tiêu chí nghiệm thu đề xuất: **không** có lỗi nghiêm trọng sàng lọc/sai người/sai hiển thị thanh toán; các ngưỡng phần trăm khác cần xác định sau pilot, không tự bịa.

## I. Nghiên cứu sơ cấp
**Quy tắc đạo đức:** xin phép trước khi ghi, cho phép từ chối, không lưu tên/số điện thoại/triệu chứng thật trong ghi chú công khai, quy trình tuyển mẫu nhờ phòng khám phê duyệt.

### Phỏng vấn bán cấu trúc (5 nhóm)
| Nhóm | Câu hỏi gợi mở, không dẫn dắt | Quan sát |
|---|---|---|
| Bệnh nhân trẻ/trung/cao tuổi | 1. Hãy kể lần đặt lịch gần nhất. 2. Bạn dùng điện thoại/Zalo thế nào? 3. Điều gì khiến bạn gọi thay vì đặt app? 4. Khi đến phòng khám, làm sao biết tới lượt? 5. Khi được gửi kết quả bạn hiểu/trông đợi gì? 6. Bạn cần hỗ trợ ở bước nào? | kiểm tra độ hiểu thuật ngữ, xếp thứ tự thao tác |
| Người nhà đặt hộ | 1. Bạn đang thay ai quản lý khám? 2. Lúc nào phải hỏi người đó? 3. Điều gì hay nhầm ở hồ sơ? 4. Ai nhận OTP/nhắc lịch? 5. Bạn muốn/được phép xem đến mức thông tin nào? 6. Khi người bệnh thu hồi quyền thì bạn kỳ vọng gì? | ranh giới giữa đặt hộ và quyền đọc hồ sơ |
| Lễ tân | 1. Tiếp nhận từ những kênh nào? 2. Cách rà trùng hồ sơ? 3. Case đi muộn/no-show? 4. STT tiếp nhận/STT khám khác nhau thế nào? 5. Thu phí trước khám hoạt động ra sao? 6. Tình huống tắc nghẽn? | shadowing thao tác, handoff |
| Điều dưỡng | 1. Khi nào cần xét nghiệm trước khám? 2. Ai chỉ định/duyệt? 3. Trạng thái kết quả? 4. Ai gọi bệnh nhân không liên hệ được? 5. Theo dõi triệu chứng sau khám ra sao? 6. Khi nào escalated tới bác sĩ? | mô hình chủ sở hữu tác vụ |
| Bác sĩ | 1. Bước nào cần quyết định lâm sàng? 2. Quy tắc khám từ xa phù hợp? 3. Khi nào ký/khóa lượt khám? 4. Kết quả về muộn xử lý sao? 5. Khi nào thông báo kết quả, khi nào hẹn lại? 6. Bàn giao follow-up cho ai? | states, audit, cấp quyền |

### Khảo sát 10 câu (chạy pilot trước)
1. Độ tuổi: 18–34 / 35–54 / 55–69 / 70+ / không muốn trả lời.
2. Thiết bị dùng chính: Android / iPhone / khác.
3. Tần suất dùng ứng dụng điện thoại: hằng ngày / hằng tuần / ít hơn.
4. Kênh đặt khám gần nhất: gọi / Zalo / web / app / trực tiếp / khác.
5. Thường đặt khám cho: bản thân / người thân / cả hai.
6. Khó khăn lớn nhất khi đặt lịch? (chọn tối đa 2; có “khác”).
7. Khi đến phòng khám, cách bạn biết đang ở lượt nào?
8. Nếu bác sĩ online chưa gọi được, bạn mong thao tác nào nhất?
9. Khi có kết quả xét nghiệm, bạn muốn được giải thích bằng cách nào?
10. Trên màn hình lịch khám, thông tin quan trọng nhất là gì? (chọn tối đa 3).

### Checklist quan sát tiếp nhận (mỗi session; không chép PII)
| Mục | Ghi nhận |
|---|---|
| Bệnh nhân dùng kênh nào? | app/Zalo/gọi/trực tiếp, không ghi định danh |
| Mất bao lâu để định danh đúng? | elapsed / lỗi trùng / quay lại |
| Ai đổi trạng thái? | staff role, khi nào |
| Biên lai/số thứ tự phát thế nào? | có phân biệt STT tiếp nhận/khám không |
| Người thân hỗ trợ thế nào? | ai nhận thông báo, ai ký/xác nhận |
| Bệnh nhân cần hỏi lại ở đâu? | câu hỏi, context, màn tương ứng |
| Cận lâm sàng chuyển giao thế nào? | có owner, trạng thái |
| Khi liên hệ thất bại? | callback owner, hạn xử lý |
| Rủi ro riêng tư? | giao tiếp công khai, lộ số điện thoại/bệnh |

### Mẫu note
- Session ID (mã vô danh), ngày, nhóm tuổi, device, vai trò, consent ghi âm (yes/no).
- Nhiệm vụ, lời nói nguyên văn ngắn, hành động quan sát, số bước, thời gian, kết quả, nhầm lẫn/lỗi.
- **FACT observed / PARTICIPANT quote / RESEARCHER INFERENCE / DESIGN IDEA** (4 cột riêng).
- Tầm quan trọng (high/medium/low), screen-id, nghiên cứu cần bổ sung, người phản biện chuyên môn.
