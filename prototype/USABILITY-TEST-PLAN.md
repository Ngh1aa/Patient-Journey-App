# CareFlow — Low-Fi Test Plan (manual usability + deterministic checks)

**Ngày soạn:** 15/10/2026 • **Phiên bản:** 0.1 • **Tình trạng:** Bộ kịch bản đã viết, **chưa tuyển người/chưa làm usability testing thực địa**.  
**Đối chiếu:** [23 screens](../research/09-screen-specifications-acceptance.md), [critical medical/permission gates](../research/10-validation-backlog-evidence.md).

## Quy tắc thử nghiệm
- Bản chạy thật chỉ có nhân vật và tình huống giả; không nhập bất kỳ tên/số điện thoại/triệu chứng riêng tư nào. Không dùng người bệnh thật để xác minh lâm sàng.
- Moderator nhắc trước: prototype giả lập, OTP `123456`, không gọi, không thanh toán, không cấp cứu hoặc đặt khám thật.
- Không hướng dẫn bước trong lúc người tham gia làm; hỏi họ dự đoán bước tiếp theo trước khi click; ghi nhầm lẫn và lời diễn giải.
- Mỗi test ghi: role, độ tuổi nhóm, kinh nghiệm smartphone, thiết bị, kết quả, error critical, thời gian, first-click, cần hỗ trợ, quote đã ẩn danh.
- Nhóm thử có người 55+/70+, người đặt hộ và người sử dụng smartphone ít thường xuyên. Số lượng mẫu sẽ chốt sau pilot; không bịa tỉ lệ thành công.

## S1 — Đặt lịch bản thân (A1→B1→C1→C2→C4→C5→C6)
**Setup:** chọn scenario `01 · Tự đặt lịch`; demo number, OTP `123456`.  
**Task:** “Bạn cần đặt một lịch khám cho mình. Hãy hoàn thành từ bước đăng nhập đến trang xác nhận.”  
**Expected:** chọn “Tôi”, không kích hoạt cảnh báo, chọn ngày/giờ, thấy đúng người ở C5, trạng thái chỉ thành công sau submit.  
**Observe:** có dễ hiểu cách bắt đầu không; người tham gia có nhìn review C5 không; phân biệt chọn slot với đã có hẹn.  
**Blocker:** C6 trước khi xác nhận / sai bệnh nhân / trùng lịch.

## S2 — Đặt hộ + hồ sơ khác quyền (C1→C2→C4→C5→C6, G1/F2)
**Setup:** scenario `02 · Đặt hộ người thân`.  
**Task:** “Bạn đặt lịch thay người thân. Sau đó thử mở kết quả xét nghiệm của người đó.”  
**Expected:** booking.patientId tương ứng “Mẹ”; actor vẫn là tài khoản hiện tại; đặt hộ được nếu scope BOOK; xem kết quả bị chặn vì không có VIEW_RESULT.  
**Negative:** G1 → mô phỏng thu hồi BOOK; C1 không cho đặt hộ; đổi người trên C1 xóa lý do/sàng lọc cũ.  
**Blocker:** dữ liệu lý do khám của A xuất hiện khi chuyển sang B; xem được kết quả bằng push/deep link sau khi không còn quyền.

## S3 — Cảnh báo cần trợ giúp (C2→C3; không C4)
**Setup:** scenario `03 · Có cảnh báo`.  
**Task:** “Hãy xem hệ thống xử lý khi có cảnh báo trong bản mẫu. Bạn sẽ làm gì tiếp?”  
**Expected:** màn C3 nổi bật hướng liên hệ trợ giúp; không có đường tự xác nhận đủ điều kiện đặt online.  
**Negative:** trở lại C2 chọn ‘không cảnh báo’, hoặc về Home và thử ‘Đặt lịch’ → vẫn bị chặn cho tới khi có staff workflow (không mô phỏng phê duyệt lâm sàng).  
**Blocker:** đi được C4/C5/C6 sau khi đã bị flag; copy tự chẩn đoán; số khẩn cấp chưa xác minh bị diễn đạt như thật.
**Lưu ý:** chỉ test UX phản ứng và hiểu hành động bằng dữ liệu giả; clinical safety cần đánh giá khác.

## S4 — Giờ khám đã hết (C5→C4)
**Setup:** scenario `04 · Giờ khám đã hết` hoặc chọn phản hồi `slot_unavailable`.  
**Task:** “Bấm xác nhận, sau đó hoàn thành lại khi giờ vừa chọn không còn.”  
**Expected:** không sinh appointment; hiển thị lỗi rõ; quay C4 với người/lý do/hình thức giữ nguyên; chọn slot khác; trạng thái xác nhận cuối chỉ xuất hiện sau server giả lập trả success.  
**Blocker:** lỗi hết giờ nhưng vẫn sang C6, xóa thông tin người khám hoặc tự động đổi giờ mà không hỏi.

## S5 — Gửi booking nhưng không nhận phản hồi (C5)
**Setup:** scenario `05 · Mất phản hồi mạng` hoặc chọn `network_unknown`.  
**Task:** “Bạn bấm xác nhận nhưng mất mạng. Hãy xác định mình đã có lịch hay chưa.”  
**Expected:** hiển thị chưa rõ, không báo đã đặt, gửi lại bị chặn cho tới khi kiểm tra `requestKey`; mô phỏng truy vấn server trả NOT_FOUND mới cho retry.  
**Blocker:** tạo duplicate appointment khi submit lại / báo thành công khi chưa có phản hồi.

## Check bổ sung sau hoàn thiện thiết kế
- **E1:** người tham gia hiểu khác nhau giữa số tiếp nhận và số chờ khám.
- **E2–E4:** không kết nối được và rớt cuộc gọi có mô tả khác; biết chỗ xin gọi lại.
- **F1:** không hiểu quét QR là đã thanh toán.
- **F2/G1/G2:** mở kết quả bị chặn đúng quyền người thân.
- **G3:** chữ lớn không làm che nút, VoiceOver/TalkBack đọc đúng.
- **F4:** tìm được hotline nhưng biết bản mẫu chưa có số thật.

## Mẫu phiếu ghi nhận
| Session ID | Tuổi (nhóm) | Platform | Scenario | First click | Task success | Error (severity) | Help needed | Time | Observation & quote (ẩn danh) | Next design action |
|---|---|---|---|---|---|---|---|---|---|---|
| DEMO-ONLY | 55–69 | Android | S2 | — | NOT TESTED | — | — | — | Chưa có người tham gia | Recruitment |

**Định nghĩa**: Task success = tự đạt đúng màn & trạng thái mong đợi không có chỉ dẫn; critical error = sai người, bypass warning, hiển thị trạng thái booking/payment sai, lộ kết quả ngoài quyền. Không đưa số liệu thành công trừ khi đã có phiên thực.

## Báo cáo tự động vs thực địa
- **Automated model & static inventory:** `node prototype/tests.cjs` — 26 assertion về mô phỏng, bảo vệ trạng thái, đầy đủ màn. Log GitHub Actions nếu workflow đã chạy.
- **Browser interaction test:** cần test tay hoặc dùng công cụ tự động trên Chrome/Safari/iOS/Android; **chưa xác minh** qua kết quả này.
- **Moderated usability:** **NOT STARTED**.
- **Clinical safety review:** **NOT STARTED**.
- **Legal/privacy sign-off:** **NOT STARTED**.
