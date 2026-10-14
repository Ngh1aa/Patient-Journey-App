# Module E & F — Pháp lý Việt Nam và kỹ thuật ảnh hưởng UX
_Ngày kiểm tra nguồn 15/10/2026. Tài liệu thiết kế, không phải tư vấn y khoa/pháp lý. Chính sách và điều kiện áp dụng cần luật sư + người phụ trách chuyên môn xác nhận._

## E. Văn bản / ràng buộc
| Văn bản | Thời điểm / trạng thái | FACT xác định | Tác động thiết kế | Tin cậy / nguồn |
|---|---|---|---|---|
| Luật Khám bệnh, chữa bệnh 15/2023/QH15 | ban hành 09/01/2023; áp dụng từ 01/01/2024 | khuôn khổ khám chữa bệnh, quyền người bệnh, hồ sơ | nội dung lâm sàng, quyền người bệnh, phân vai và lịch sử | Cao; https://vanban.chinhphu.vn/?pageid=27160&docid=207768 |
| Nghị định 96/2023/NĐ-CP | 30/12/2023; hướng dẫn luật | quy định chi tiết theo phạm vi | xác nhận danh mục hoạt động cơ sở, tư vấn từ xa | Cao về sự tồn tại; https://vanban.chinhphu.vn/ |
| Thông tư 30/2023/TT-BYT | ban hành 30/12/2023, có hiệu lực 01/01/2024; danh mục bệnh/tình trạng khám từ xa | quy định danh mục bệnh, tình trạng bệnh được khám từ xa; việc cơ sở được phép triển khai phải thẩm định theo quy định áp dụng | chỉ cung cấp tính năng telehealth khi đơn vị đủ điều kiện; protocol chuyển trực tiếp | Cao; cơ sở dữ liệu quốc gia hiển thị còn hiệu lực; https://vbpl.vn/boyte/Pages/vbpq-thuoctinh.aspx?ItemID=178262 |
| Thông tư 13/2025/TT-BYT | ban hành 06/06/2025; có hiệu lực 21/07/2025; cơ sở dữ liệu quốc gia hiển thị còn hiệu lực | yêu cầu lộ trình/đảm bảo khả năng lưu trữ, triển khai EMR | user app là mặt xem/tra cứu, không mặc nhiên là hệ thống EMR pháp lý | Cao về ngày và tình trạng; https://vbpl.vn/boyte/Pages/vbpq-thuoctinh.aspx?ItemID=178219 |
| Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 | hiệu lực 01/01/2026 | luật mới về bảo vệ dữ liệu cá nhân | thông báo và cơ sở xử lý, rights center, proxy, xử lý yêu cầu | Cao; https://vbpl.vn/tw/Pages/vbpq-thuoctinh.aspx?ItemID=179252 |
| Nghị định 356/2025/NĐ-CP | ban hành 31/12/2025; hiệu lực 01/01/2026; Điều 42 quy định NĐ13/2023 hết hiệu lực cùng ngày | chi tiết thi hành Luật bảo vệ dữ liệu cá nhân | không dựa chỉ trên consent checkbox để coi đã hợp lệ; thiết kế privacy record | Cao về hiệu lực và văn bản; https://vbpl.vn/bocongan/Pages/vbpq-thuoctinh.aspx?ItemID=187276 ; https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-356-2025-nd-cp-468371.htm |
| Luật Giao dịch điện tử 20/2023/QH15 | hiệu lực 01/07/2024 | khuôn khổ giao dịch điện tử | log và chứng cứ xác nhận, lựa chọn ký số phù hợp nghiệp vụ | Cao; https://vanban.chinhphu.vn/ |
| Luật Quảng cáo và sửa đổi 2025 | tồn tại luật sửa đổi năm 2025, nội dung điều khoản áp dụng cần legal xác minh | nội dung quảng cáo dịch vụ y tế chịu quy định riêng | loại trừ claim chữa khỏi bệnh/giám định sai, kiểm duyệt banner và push quảng cáo | Trung bình, điều khoản hiện hành liên quan chi tiết: **chưa xác minh**; https://vanban.chinhphu.vn/ |

**Không tự kết luận** luật mới yêu cầu một checkbox giống nhau cho mọi nghiệp vụ. Privacy-by-design: công bố người xử lý và mục đích, phân quyền hồ sơ người thân, xác thực trước khi xem dữ liệu nhạy cảm, log ai xem, lựa chọn kênh nhắc lịch, tối thiểu hóa thông tin trong push. Retention, đồng ý khám trực tuyến, tư vấn bên thứ ba và giấy tờ đại diện phải xác nhận từng trường hợp với legal/compliance.

**Không gắn chỉ báo “đã ký/khóa” của backend lên bệnh nhân như giấy chứng nhận chuyên môn**; ký/khóa thuộc cán bộ có quyền. Các kết quả về sau phải được bổ sung có dấu vết, không sửa lịch sử im lặng.

## F. Tích hợp
| Tích hợp | Ưu | Rủi ro UX / kiểm tra | Chi phí (15/10/2026) | Nguồn / tin cậy |
|---|---|---|---|---|
| SMS Brandname OTP | phủ người không có Zalo; người lớn tuổi quen SMS | chuyển ứng dụng; resend, SIM/roaming; không đưa PHI vào tin | **Chưa xác minh** theo nhà cung cấp/hợp đồng | https://developers.google.com/identity/sms-retriever/overview (Cao về autofill) |
| Zalo ZNS / Template Message | kênh quen người Việt, nhắc lịch & deep link | duyệt template, opt-in/căn cứ gửi, dùng điện thoại không có Zalo, thay đổi sản phẩm | **Chưa xác minh** | https://developers.zalo.me/ (Trung bình) |
| VietQR / NAPAS | QR quen thuộc, thuận tiện chuyển khoản | QR không xác nhận đã thu; cần webhooks/bank reconciliation và idempotency | **Chưa xác minh** | https://vietqr.io/ ; https://napas.com.vn/ (Cao mô hình) |
| MoMo | trả qua ví | redirect mất phiên, phụ thuộc app; phải kiểm tra callback backend | **Chưa xác minh** | https://developers.momo.vn/ (Cao tài liệu) |
| VNPay | kênh ngân hàng/QR | khác scheme, trạng thái “đang xử lý” cần polling | **Chưa xác minh** | https://sandbox.vnpayment.vn/apis/ (Trung bình) |
| ZaloPay | quen Zalo ecosystem | app switch/cancel/webhook; luôn có fallback | **Chưa xác minh** | https://docs.zalopay.vn/ (Cao tài liệu) |
| Agora Video SDK | SDK video/mobile/điều kiện mạng đa dạng | cần đo bitrate, quality change, reconnect; quyền camera/micro | **Chưa xác minh** | https://www.agora.io/en/pricing/ (Cao tài liệu) |
| Twilio Video | SDK video, hội nghị | kiểm tra trạng thái sản phẩm/region/cước hiện hành trước chọn, không coi tính năng cũ là đang bán | **Chưa xác minh** | https://www.twilio.com/docs/video (Trung bình) |
| Zoom Video SDK | SDK, nền tảng lớn | cần kiểm soát identity, policy PHI, data region | **Chưa xác minh** | https://developers.zoom.us/docs/video-sdk/ (Cao tài liệu) |
| 100ms | SDK real-time video | mức phù hợp/policy/độ sẵn có 2026 **chưa xác minh** | **Chưa xác minh** | https://www.100ms.live/ (Thấp) |
| Jitsi | open source/self-host có kiểm soát | chi phí vận hành/cân bằng tải/hỗ trợ mạng yếu; audit privacy | open source, tổng chi phí **chưa xác minh** | https://jitsi.org/ ; https://github.com/jitsi/jitsi-meet (Cao dự án) |
| Push + universal/app links | điều hướng đúng lịch/kết quả | thông báo không lộ tình trạng sức khỏe, auth sau mở, link hết hạn, không mở sai người | phụ thuộc FCM/APNs/backend | https://firebase.google.com/docs/cloud-messaging ; https://developer.apple.com/documentation/xcode/supporting-universal-links (Cao) |
| HIS/EMR/PMS integration | đồng bộ lịch, số chờ, kết quả, trả phí | không giả lập real-time nếu cơ sở không có API; mapping id và trạng thái, audit | **Chưa xác minh** | https://www.hl7.org/fhir/ (Cao chuẩn tham khảo; không xác nhận vendor hỗ trợ) |

## State contracts (đề xuất, chưa được phòng khám ký duyệt)
- **Appointment:** draft → pending-confirmation → confirmed → checked-in → waiting → in-consultation → encounter-signed; cancelled / no-show / rescheduled lưu audit.
- **Test:** ordered → awaiting-procedure → result-available → awaiting-doctor-review → reviewed → communicating/patient-notified → acknowledged (nếu có bằng chứng nhận). “Reviewed” KHÔNG đồng nghĩa “patient informed”.
- **Payment:** not-required / pending / pending-reconciliation / paid / deferred-with-reason / refund-requested / refunded / failed. Không thu phí KHÔNG đồng nghĩa đã trả tiền.
- **Telehealth:** scheduled → preflight → waiting → connecting → connected / temporarily-disconnected / unreachable → callback-pending / switched-in-person / rescheduled. Unreachable KHÔNG giống connected call dropped.
- **Follow-up task:** created → assigned(owner) → in-progress → waiting-for-patient → escalated → completed; có dấu thời hạn và outcome.
- **Family access:** self / proxy verified / proxy pending / revoked; người đặt lịch KHÔNG tự động có quyền xem xét nghiệm của người thân.

Screen implications: C2/C3 an toàn; A1/G1/G3 privacy, đại diện; D2/E1/E4 status; F1 reconciliation; F2/F3 doctor review; F4 callback; G2 push tối thiểu. Nội dung lâm sàng và pháp lý đều cần ký duyệt trước sử dụng thật.