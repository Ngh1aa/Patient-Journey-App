# Ma trận rà soát 47 màn — bước H1

Nguồn: model.SCREENS + DOM audit mới ở390px. Mã A1–G trỏ tới yêu cầu và bảng phân tích trong [review.md](review.md).

- Mỗi ô là finding có bằng chứng DOM/source; không phải điểm số.
- `—`: không ghi nhận thêm finding thuộc nhóm đó trong phạm vi đã xem; **không đồng nghĩa PASS mọi trạng thái**.
- `Ẩn theo flow`: nav không hiển thị có chủ ý ở màn này; không áp lỗi rãnh cho phần tử đang ẩn.
- `B11`: card không áp shadow đã có token. `D5`: nằm trong luồng hiển thị visit ID chịu vấn đề định dạng toàn app; không nói bản thân từng ID không hợp lệ.
- Cột Card là số instance có data-cf-card, gồm cả card lồng;0 không có nghĩa màn không có panel.
- `G: UNKNOWN states`: chưa chạy lại mọi nhánh loading/error/empty/disabled cho màn đó trong audit này. Nền tảng state/visual được kiểm ở đợt trước, không dùng nó để cấp PASS yêu cầu mới.

| Screen / tên hiển thị | Card | A Hiển thị | B Thành phần | C Bố cục | D Nội dung/logic | E Chi tiết | F Nav | G Trạng thái/nội dung |
|---|---:|---|---|---|---|---|---|---|
| A1 — Sức khỏe của bạn luôn là ưu tiên hàng đầu. | 1 | — | B11 | — | — | — | Ẩn theo flow | UNKNOWN states |
| A2 — Đây có phải hồ sơ của bạn? | 1 | A5: date/textarea | B11 | — | — | — | Ẩn theo flow | UNKNOWN states |
| A3 — Tạo hồ sơ của bạn | 1 | A5: date/textarea | B11 | — | — | — | Ẩn theo flow | UNKNOWN states |
| B1 — Nguyễn Minh Anh | 19 | — | B8; B10; B11 | C1; C2; C3; C5 | D4; D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| C1 — Ai sẽ đi khám? | 3 | A1: chưa tái hiện; A4 | B2; B11 | C4 | — | — | Ẩn theo flow | UNKNOWN states |
| C2 — Lý do đi khám | 1 | A2; A4; A5: textarea | B3; B11 | C4 | D3 | — | Ẩn theo flow | UNKNOWN states |
| C3 — Trước khi đặt lịch | 2 | A4 | B2; B11 | C4 | D1; D2; D3 | — | Ẩn theo flow | UNKNOWN states |
| C4 — Ưu tiên được hỗ trợ kịp thời | 0 | A4 | — | C4 | D1: có nhánh cảnh báo; C3/K5 chưa đạt | — | Ẩn theo flow | UNKNOWN states |
| C5 — Chờ phòng khám tư vấn | 0 | A4 | — | C4 | — | — | Ẩn theo flow | UNKNOWN states |
| C6 — Nơi khám | 3 | A1: chưa tái hiện; A3; A4 | B2; B5; B11 | C4 | D10; D12 | — | Ẩn theo flow | UNKNOWN states |
| C7 — Chọn giờ hẹn | 1 | A2; A4; A5: date | B3; B11 | C4 | D3; D4 | — | Ẩn theo flow | UNKNOWN states |
| C8 — Kiểm tra lịch hẹn | 1 | A1: một phần; A2; A4 | B11 | C4 | D3; D7; D8 | — | Ẩn theo flow | UNKNOWN states |
| C9 — Đã gửi yêu cầu đặt lịch | 1 | — | B11 | — | D6; D9; D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| D1 — Lịch hẹn | 1 | — | B8; B11 | C6 | D4 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| D2 — Phiếu khám | 15 | A5: textarea | B7; B10; B11 | — | D5 | E: căn lề facts/hints; E: nav label11px | F1/F3/F4 | UNKNOWN states |
| D3 — Đổi lịch khám | 1 | — | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| D4 — Hủy lịch khám | 3 | A5: textarea | B2; B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| E1 — Chuẩn bị trước khi đến | 2 | A5: textarea | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| E2 — Bạn đã đến phòng khám? | 2 | — | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| E3 — Theo dõi lượt khám | 3 | — | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| F1 — Xét nghiệm, chụp chiếu | 3 | — | B11 | C3; C5 | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| F2 — Xét nghiệm theo chỉ định | 4 | — | B2; B11 | — | — | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| F3 — Đặt hẹn xét nghiệm | 1 | A5: date/time | B11 | — | D4; D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| F4 — Đính kèm kết quả | 1 | A5: file | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| G1 — Chuẩn bị khám trực tuyến | 2 | A5: textarea | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| G2 — Chờ bác sĩ gọi | 1 | — | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| G3 — Bác sĩ đang gọi bạn | 0 | — | — | — | D5 | — | Ẩn theo flow | UNKNOWN states |
| G4 — Phòng khám CareFlow | 0 | A5: textarea | — | — | D5 | — | Ẩn theo flow | UNKNOWN states |
| G5 — Chưa liên hệ được với bạn | 0 | — | — | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| H1 — Buổi khám đã hoàn tất | 5 | — | B11 | C5 | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| H2 — Thanh toán phí khám | 2 | — | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| H3 — Hẹn ngày thanh toán | 1 | A5: textarea/date | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| H4 — Chuyển khoản phí khám | 2 | — | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| H5 — Biên lai và hoàn tiền | 2 | — | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| H6 — Kết luận và đơn thuốc | 6 | A5: textarea | B11 | C5 | D5 | E: nav label11px | F1/F3/F4 | G1: nội dung mẫu trên màn thật; UNKNOWN states |
| H7 — Kết quả và việc tiếp theo | 2 | — | B11 | C3; C5 | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| I1 — Bạn muốn hỏi về việc gì? | 8 | — | B2; B11 | C5 | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| I2 — Gửi phản hồi cho phòng khám | 0 | A5: textarea | — | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| I3 — Theo dõi triệu chứng | 2 | A5: textarea | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| I4 — Chuyển chuyên khoa | 1 | A5: textarea | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| I5 — Tin nhắn với phòng khám | 1 | A5: textarea | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| J1 — Đặt lịch tái khám | 3 | — | B11 | — | D5 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| K1 — Thông báo | 1 | — | — | C3 | — | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| K2 — Hồ sơ | 3 | A6; A5: date | B7; B8; B10; B11 | — | D11 | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| K3 — Lịch sử khám | 1 | — | B8; B11 | C3 | — | E: nav label11px | F1/F3/F4 | UNKNOWN states |
| K4 — Cài đặt | 2 | — | B11 | — | — | E: hint chưa đồng bộ; E: nav label11px | F1/F3/F4 | UNKNOWN states |
| K5 — Hỗ trợ | 5 | A6; A5: select-one/textarea | B1; B4; B6; B7; B8; B9; B11 | C5 | D1 | E: nav label11px | F1/F3/F4 | UNKNOWN states |

## Route inventory

| ID | Canonical route |
|---|---|
| A1 | `/login` |
| A2 | `/profile-match` |
| A3 | `/profile-new` |
| B1 | `/home` |
| C1 | `/book/patient` |
| C2 | `/book/reason` |
| C3 | `/book/safety` |
| C4 | `/book/alert` |
| C5 | `/book/mode-review` |
| C6 | `/book/mode` |
| C7 | `/book/slot` |
| C8 | `/book/review` |
| C9 | `/book/done/:id` |
| D1 | `/appointments` |
| D2 | `/appointments/:id` |
| D3 | `/appointments/:id/reschedule` |
| D4 | `/appointments/:id/cancel` |
| E1 | `/appointments/:id/prepare` |
| E2 | `/appointments/:id/arrive` |
| E3 | `/appointments/:id/visit` |
| F1 | `/appointments/:id/labs` |
| F2 | `/appointments/:id/labs/:labId` |
| F3 | `/appointments/:id/labs/:labId/book` |
| F4 | `/appointments/:id/labs/:labId/upload` |
| G1 | `/appointments/:id/online-prepare` |
| G2 | `/appointments/:id/online-wait` |
| G3 | `/appointments/:id/incoming` |
| G4 | `/appointments/:id/call` |
| G5 | `/appointments/:id/unreachable` |
| H1 | `/appointments/:id/completed` |
| H2 | `/appointments/:id/pay` |
| H3 | `/appointments/:id/pay-later` |
| H4 | `/appointments/:id/pay/transfer` |
| H5 | `/appointments/:id/receipt` |
| H6 | `/appointments/:id/summary` |
| H7 | `/appointments/:id/results` |
| I1 | `/care` |
| I2 | `/care/report?reason=` |
| I3 | `/care/follow-up` |
| I4 | `/care/referral/:id` |
| I5 | `/care/messages` |
| J1 | `/followup/:id` |
| K1 | `/notifications` |
| K2 | `/profile` |
| K3 | `/profile/history` |
| K4 | `/settings` |
| K5 | `/support` |

## Controls cần thay presentation

| Màn | Control / id |
|---|---|
| A2 | `date#dob`, `textarea#medicalHistory` |
| A3 | `date#dob`, `textarea#medicalHistory` |
| C2 | `textarea#reason`, `textarea#medicalHistory` |
| C7 | `date#date` |
| D2 | `textarea#visit-note-CF-1017-0042` |
| D4 | `textarea#cancelNote` |
| E1 | `textarea#visit-note-CF-1017-0042` |
| F3 | `date#labDate`, `time#labTime` |
| F4 | `file#file` |
| G1 | `textarea#visit-note-CF-0001` |
| G4 | `textarea#call-note-text` |
| H3 | `textarea#deferReason`, `date#dueDate` |
| H6 | `textarea#visit-note-CF-0001` |
| I2 | `textarea#report` |
| I3 | `textarea#tracking`, `textarea#visit-note-CF-0001` |
| I4 | `textarea#referral` |
| I5 | `textarea#message`, `textarea#visit-note-CF-0001` |
| K2 | `date#dob` |
| K5 | `select-one#supportTopic`, `textarea#support` |

File upload/date/time vẫn cần input ngữ nghĩa truy cập được; yêu cầu custom UI không có nghĩa thay chúng bằng phần tử không có keyboard/screen-reader support.
