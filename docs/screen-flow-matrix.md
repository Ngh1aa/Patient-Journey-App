# Ma trận màn hình và flow

47 màn; bảng ID/route mục 6 là chuẩn. H5 biên lai, H6 kết luận/đơn thuốc, H7 kết quả/việc tiếp theo. Các tham chiếu H5/H6 trong F10/F12 được chuẩn hóa theo chức năng này.

## Cũ → mới

| Cũ | Mới |
|---|---|
| A1 | A1 |
| A2 | A3 (A2 dành xác nhận hồ sơ cũ) |
| B1 | B1 |
| C1 | C1 |
| C2 | C2 + C3 |
| C3 | C4 + C5 |
| C4 | C6 + C7 |
| C5 | C8 |
| C6 | C9 |
| D1 | D1 |
| D2 | D2 |
| D3 | D3 + D4 |
| E1 | E1 + E2 + E3 |
| E2 | G1 |
| E3 | G4 |
| E4 | G5 |
| F1 | H2 + H3 + H4 + H5 |
| F2 | H6 + H7 |
| F3 | F1 + F2 + F3 + F4 |
| F4 | I1 + I2 + I3 + I4 + I5 |
| G1 | K2 + K3 |
| G2 | K1 |
| G3 | K4 |
| H1 | K5 |

## Danh mục chuẩn

| ID | Màn | Route | Giai đoạn |
|---|---|---|---|
| A1 | Đăng nhập (SĐT và OTP) | `/login` | P1 |
| A2 | Xác nhận hồ sơ cũ | `/profile-match` | P1 |
| A3 | Tạo hồ sơ bệnh nhân | `/profile-new` | P1 |
| B1 | Trang chủ | `/home` | P1 |
| C1 | Ai đi khám | `/book/patient` | P1 |
| C2 | Lý do khám và triệu chứng | `/book/reason` | P1 |
| C3 | Dấu hiệu nguy hiểm | `/book/safety` | P1 |
| C4 | Khuyến cáo nhập viện, cấp cứu | `/book/alert` | P1 |
| C5 | Phòng khám xác nhận hình thức khám | `/book/mode-review` | P1 |
| C6 | Chọn hình thức khám | `/book/mode` | P1 |
| C7 | Chọn ngày giờ | `/book/slot` | P1 |
| C8 | Kiểm tra và gửi yêu cầu | `/book/review` | P1 |
| C9 | Đã gửi, Phiếu khám | `/book/done/:id` | P1 |
| D1 | Lịch hẹn | `/appointments` | P1 |
| D2 | Phiếu khám (chi tiết lượt khám) | `/appointments/:id` | P1 |
| D3 | Đổi lịch | `/appointments/:id/reschedule` | P1 |
| D4 | Hủy lịch | `/appointments/:id/cancel` | P1 |
| E1 | Chuẩn bị trước khi đến | `/appointments/:id/prepare` | P1 |
| E2 | Báo đã đến | `/appointments/:id/arrive` | P1 |
| E3 | Theo dõi lượt khám | `/appointments/:id/visit` | P1 |
| F1 | Xét nghiệm, chụp chiếu | `/appointments/:id/labs` | P2 |
| F2 | Chi tiết chỉ định | `/appointments/:id/labs/:labId` | P2 |
| F3 | Đặt hẹn xét nghiệm | `/appointments/:id/labs/:labId/book` | P2 |
| F4 | Đính kèm kết quả | `/appointments/:id/labs/:labId/upload` | P2 |
| G1 | Chuẩn bị khám online | `/appointments/:id/online-prepare` | P2 |
| G2 | Chờ bác sĩ gọi | `/appointments/:id/online-wait` | P2 |
| G3 | Bác sĩ đang gọi | `/appointments/:id/incoming` | P2 |
| G4 | Đang khám online | `/appointments/:id/call` | P2 |
| G5 | Chưa liên hệ được | `/appointments/:id/unreachable` | P2 |
| H1 | Buổi khám đã hoàn tất | `/appointments/:id/completed` | P2 |
| H2 | Thanh toán | `/appointments/:id/pay` | P2 |
| H3 | Thanh toán sau | `/appointments/:id/pay-later` | P2 |
| H4 | Chuyển khoản QR | `/appointments/:id/pay/transfer` | P2 |
| H5 | Biên lai và hoàn tiền | `/appointments/:id/receipt` | P2 |
| H6 | Kết luận và đơn thuốc | `/appointments/:id/summary` | P2 |
| H7 | Kết quả và việc tiếp theo | `/appointments/:id/results` | P2 |
| I1 | Hỏi phòng khám | `/care` | P3 |
| I2 | Gửi phản hồi (ba lý do) | `/care/report?reason=` | P3 |
| I3 | Theo dõi triệu chứng | `/care/follow-up` | P3 |
| I4 | Chuyển chuyên khoa | `/care/referral/:id` | P3 |
| I5 | Tin nhắn với điều phối viên | `/care/messages` | P3 |
| J1 | Đặt lịch tái khám | `/followup/:id` | P1 |
| K1 | Thông báo | `/notifications` | P1 |
| K2 | Hồ sơ và người thân | `/profile` | P3 |
| K3 | Lịch sử khám | `/profile/history` | P3 |
| K4 | Cài đặt | `/settings` | P3 |
| K5 | Hỗ trợ | `/support` | P1 (khung), P2 (đầy đủ) |

## Flow nghiệm thu

F1–F12 và mọi nhánh theo docs/13-patient-journey-source.md mục 4 và 7. Bằng chứng chạy được ghi ở docs/qa-results.md sau kiểm thử. Mọi dịch vụ chỉ SYNTHETIC/CONCEPT; native và DIRECT_USER UNKNOWN.
