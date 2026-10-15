# CareFlow — Luồng người dùng và danh sách màn hình (bản làm lại theo đúng sơ đồ)

> **Thay thế** danh sách màn hình và luồng trong file 08 (mục 3, 15), file 10 và mục 14 của tài liệu thiết kế. Phong cách giao diện giữ theo file 11, giọng điệu theo file 12 (kèm các đổi tên ở mục 0.2), cấu trúc nội dung từng màn nằm ở file 14 và 15.
>
> **Nguồn sự thật duy nhất:** sơ đồ "Hành trình bệnh nhân tại phòng khám". Mọi luồng dưới đây đi theo từng nhánh của sơ đồ; mục 5 là bảng đối chiếu để kiểm tra không sót nhánh nào.

---

## 0. Cách dùng

### 0.1 Thứ tự ưu tiên khi mâu thuẫn
File 13, 14, 15 (luồng, màn hình, nội dung) > file 11 (hình thức) > file 12 (câu chữ chung) > file 09 > file 10 > file 08.

### 0.2 Đổi tên so với file 12
| Cũ | Mới |
|---|---|
| Trực tiếp / Trực tuyến | **Tại phòng khám / Khám online** |
| Check-in | **Báo đã đến** |
| Thẻ xác nhận lịch | **Phiếu khám** (có mã và QR) |
| Bản mẫu, Bản mô phỏng (trong app) | Bỏ; chỉ dùng "Bản demo" ở phần bao quanh khung điện thoại |
| Thanh toán viện phí | **Phí khám** |

### 0.3 Cái gì là việc của nhân viên
App bệnh nhân không có màn hình cho các bước sau; app chỉ hiển thị kết quả của chúng dưới dạng **trạng thái** hoặc **thông báo**: rà trùng hồ sơ, tiếp nhận, sẵn sàng khám, ký/khóa lượt khám, điều phối điều dưỡng đặt hẹn, tạo việc gọi lại, thu hộ qua nhà thuốc, ghi nhận không đến, thực hiện hoàn tiền. Cần một công cụ riêng cho nhân viên (ngoài phạm vi các file này).

---

## 1. Nguyên tắc dựng luồng

1. **Đi đúng thứ tự của sơ đồ:** liên hệ > thông tin ban đầu > rà trùng hồ sơ > cảnh báo nguy hiểm > hình thức khám > lịch > khám > sau khám.
2. **Mỗi nhánh có màn hình hoặc trạng thái riêng**, không gộp nhánh làm mất ý của sơ đồ (ví dụ "vẫn muốn khám" khác với "không có dấu hiệu").
3. **Luôn trả lời ba câu của sơ đồ:** đang ở đâu, ai đang giữ việc, bước tiếp theo là gì.
4. **Mọi ngoại lệ có đường ra:** hủy, không đến, không liên hệ được, thanh toán hoãn, hoàn tiền đều có màn hình hoặc nút tiếp theo.
5. **Vòng lặp tái khám quay về đầu quy trình** nhưng giữ hồ sơ cũ, không bắt nhập lại.

---

## 2. Điều hướng

Thanh tab nổi 4 mục: **Trang chủ · Lịch hẹn · Hồ sơ · Hỗ trợ.**

| Tab | Chứa |
|---|---|
| Trang chủ | Phiếu khám sắp tới, việc cần làm (xét nghiệm, thanh toán, theo dõi, tái khám), nút Đặt lịch khám |
| Lịch hẹn | Danh sách lịch (sắp tới, đã khám, đã hủy) và mọi thứ bên trong một lượt khám |
| Hồ sơ | Hồ sơ bệnh nhân, người thân, lịch sử khám, cài đặt |
| Hỗ trợ | Gọi phòng khám, hỏi phòng khám (sau khám), câu hỏi thường gặp |

**Quy tắc điều hướng:** một lượt khám là trung tâm. Từ Phiếu khám (D2) người dùng đi tới mọi việc liên quan (đổi, hủy, báo đã đến, xét nghiệm, thanh toán, kết quả, tái khám). Các thông báo đều mở thẳng đúng màn trong lượt khám đó.

---

## 3. Mô hình trạng thái theo sơ đồ

Một lượt khám có **một trạng thái chính** và các **việc kèm theo** (thanh toán, xét nghiệm) mỗi việc có trạng thái riêng.

### 3.1 Trạng thái chính

| # | Mã | Nhãn hiển thị | Nút "Đang chờ" | Nhánh sơ đồ |
|---|---|---|---|---|
| 1 | pending | Chờ phòng khám xác nhận | Lễ tân xử lý | Xác nhận lịch |
| 2 | mode-review | Phòng khám đang xem hình thức khám | Bác sĩ, lễ tân xem xét | Vẫn muốn khám sau cảnh báo |
| 3 | confirmed | Đã xác nhận | Đang chờ bạn | Gửi xác nhận lịch cho bệnh nhân |
| 4 | pre-lab | Cần xét nghiệm trước khám | Đang chờ bạn | Cận lâm sàng trước khám |
| 5 | reminder | Sắp đến giờ khám | Đang chờ bạn | Đến ngày hẹn |
| 6 | arrived | Bạn đã đến | Lễ tân xử lý | Bệnh nhân đến |
| 7 | received | Phòng khám đã nhận bạn | Lễ tân xử lý | Tiếp nhận |
| 8 | ready | Sẵn sàng khám | Bác sĩ chuẩn bị gọi bạn | Sẵn sàng khám |
| 9 | in-consult | Đang khám | Bác sĩ khám | Bác sĩ khám |
| 10 | online-wait | Chờ bác sĩ gọi | Bác sĩ, điều dưỡng | Liên hệ trực tuyến, chờ gọi |
| 11 | calling | Bác sĩ đang gọi bạn | Đang chờ bạn | Bác sĩ hoặc điều dưỡng gọi |
| 12 | unreachable | Chưa liên hệ được | Lễ tân gọi lại | Không liên hệ được, tạo việc gọi lại |
| 13 | completed | Hoàn tất buổi khám | | Ký, khóa lượt khám |
| 14 | cancelled | Đã hủy | | Bệnh nhân hủy lịch |
| 15 | no-show | Chưa đến khám | | Không đến |

### 3.2 Việc kèm theo

| Việc | Trạng thái |
|---|---|
| Phí khám | Không phát sinh phí · Chưa thanh toán · Chờ xác nhận chuyển khoản · Đã thanh toán · Thanh toán sau (hẹn ngày) · Chờ thanh toán tại quầy hoặc nhà thuốc · Đang hoàn tiền · Đã hoàn tiền |
| Xét nghiệm, chụp chiếu | Đã chỉ định · Chờ thực hiện · Có kết quả · Chờ bác sĩ xem · Bác sĩ đã xem |
| Chăm sóc sau khám | Đang theo dõi · Đã nhận phản hồi · Đến hạn tái khám |

### 3.3 Chuyển trạng thái chính hợp lệ

| Từ | Sang |
|---|---|
| (gửi đặt lịch) | pending (bình thường) hoặc mode-review (đi qua cảnh báo nguy hiểm) |
| mode-review | pending (phòng khám chốt hình thức), cancelled |
| pending | confirmed, cancelled |
| confirmed | pre-lab (nếu phải làm xét nghiệm trước), reminder, cancelled |
| pre-lab | confirmed (khi đã có kết quả hoặc bác sĩ cho khám trước), cancelled |
| reminder | arrived, online-wait (nếu khám online), no-show, cancelled |
| arrived | received |
| received | ready |
| ready | in-consult |
| in-consult | completed |
| online-wait | calling, unreachable |
| calling | in-consult (nối được), unreachable (không nhận) |
| unreachable | online-wait (hẹn lại), cancelled (chuyển sang lịch tại phòng khám hoặc hẹn lịch online mới), confirmed (lịch mới) |
| no-show, cancelled | (đặt lại bằng một lượt khám mới) |
| completed | (kết thúc; tái khám tạo lượt khám mới) |

Khi chuyển sang lịch mới (hẹn online lần khác, chuyển tại phòng khám, tái khám), lượt cũ ghi lý do và lượt mới liên kết với lượt cũ.

---

## 4. Các luồng người dùng

Ký hiệu: `→` bước kế tiếp; `⟨…⟩` điều kiện rẽ nhánh; `[Nxx]` nút ở màn đó.

### F1. Lần đầu dùng app, chưa có hồ sơ, đặt lịch khám tại phòng khám
`A1 Đăng nhập (SĐT, OTP)` → rà trùng hồ sơ ⟨không có⟩ → `A3 Tạo hồ sơ bệnh nhân` → `B1 Trang chủ` → `[Đặt lịch khám]` → `C1 Ai đi khám` → `C2 Lý do khám` → `C3 Dấu hiệu nguy hiểm` ⟨không có⟩ → `C6 Hình thức khám: Tại phòng khám` → `C7 Ngày giờ` → `C8 Kiểm tra và gửi` → `C9 Phiếu khám (Chờ xác nhận)`.

### F2. Đã có hồ sơ
`A1` → rà trùng hồ sơ ⟨tìm thấy⟩ → `A2 Xác nhận hồ sơ cũ (xác nhận, cập nhật thông tin mới)` → `B1` → C1 … C9 như F1.

### F3. Có dấu hiệu nguy hiểm
`C3` ⟨có dấu hiệu⟩ → `C4 Khuyến cáo nhập viện hoặc cấp cứu (giải thích nguy cơ, hướng xử trí)` →
- ⟨đi cấp cứu⟩ [Gọi cấp cứu / Chỉ đường] → kết thúc luồng đặt lịch.
- ⟨vẫn muốn khám⟩ [Tôi hiểu và vẫn muốn khám] → `C5 Phòng khám sẽ xác nhận hình thức phù hợp (Tại phòng khám hay Khám online)` → `C7 Ngày giờ` → `C8` → `C9 Phiếu khám` ở trạng thái **mode-review**.
- Phòng khám chốt hình thức → thông báo → trạng thái **pending** hoặc **confirmed** kèm hình thức đã chốt, bệnh nhân có thể xem lý do.

### F4. Ngày khám tại phòng khám (không có xét nghiệm trước)
`C9` → phòng khám xác nhận → **confirmed** → `D2` + `E1 Chuẩn bị trước khi đến (giờ đến, giấy tờ, phí theo gói hoặc không thu phí)` → nhắc lịch (1 ngày, 2 giờ) → **reminder** → `E2 Báo đã đến` → **arrived** → `E3 Theo dõi lượt khám` (**received** → **ready** → **in-consult**) → **completed** → `H1 Buổi khám đã hoàn tất`.

### F5. Có xét nghiệm trước khám
`D2` ⟨phòng khám yêu cầu⟩ trạng thái **pre-lab** → `F1 Danh sách chỉ định` → `F2 Chi tiết` →
- ⟨đã có yêu cầu hoặc đã tham khảo bác sĩ⟩ → `F3 Đặt hẹn xét nghiệm` (điều dưỡng điều phối, bệnh nhân chọn giờ hoặc chờ điều dưỡng liên hệ) → bệnh nhân thực hiện → `F4 Đính kèm kết quả` → quay lại `D2`.
- ⟨đã có kết quả từ nơi khác⟩ → `F4` → quay lại `D2`.
- Có kết quả → hai lối: **quay lại lượt khám hiện tại** hoặc **để bác sĩ xem trong buổi khám** (chọn ở `F2`).

### F6. Hủy lịch, không đến, đặt lại
- `D2 → D4 Hủy lịch` (chọn lý do, lưu lịch sử) → **cancelled** → `[Đặt lịch mới]`.
- Không đến: hết giờ hẹn mà chưa báo đã đến → **no-show** → thông báo "Bạn chưa đến khám" → `D2` với `[Đặt lại]` (dùng lại hồ sơ và lý do cũ) → `C7`.
- Đổi lịch: `D2 → D3 Đổi lịch` → chọn giờ mới → phòng khám xác nhận lại.

### F7. Khám online, kết nối thành công
`C6 Khám online` → … → `C9` → **confirmed** → `G1 Chuẩn bị khám online (link, hướng dẫn tham gia, kiểm tra thiết bị, đường truyền)` → nhắc lịch → đến giờ **online-wait** → `G2 Chờ bác sĩ gọi` → bác sĩ hoặc điều dưỡng gọi **calling** → `G3 Cuộc gọi đến` ⟨nhận⟩ → `G4 Đang khám online (khám, tư vấn, kê đơn)` → **completed** → `H1`.
Nhánh nhỏ: bệnh nhân hủy `D4` (lý do, lưu hồ sơ), hoặc đặt lịch mới khi cần.

### F8. Khám online, không liên hệ được
`G3` ⟨không nhận hoặc hết thời gian⟩ → **unreachable** (trạng thái: "chưa truyền đạt", phòng khám tạo việc gọi lại) → `G5 Chưa liên hệ được` →
- `[Chờ phòng khám gọi lại]` giữ nguyên.
- `[Hẹn online lần khác]` → chọn thời gian phù hợp → `C7` → xác nhận lịch mới → **confirmed**.
- `[Chuyển sang khám tại phòng khám]` → tư vấn đến phòng khám → `C7` (hình thức Tại phòng khám) → xác nhận lịch mới.

### F9. Sau khám: thu phí
`H1` → `H2 Thanh toán` →
- ⟨phí theo gói hoặc không thu phí⟩: hiển thị "Không phát sinh phí" → `H5` (xem như đã hoàn tất).
- ⟨tiền mặt⟩ "Thanh toán tại quầy" → trạng thái "Chờ thanh toán tại quầy" → nhân viên thu → **Đã thanh toán** → `H5 Biên lai`.
- ⟨chuyển khoản⟩ → QR → `[Tôi đã chuyển khoản]` → **Chờ xác nhận chuyển khoản** → **Đã thanh toán** → `H5`.
- ⟨thu hộ qua nhà thuốc⟩ → "Chờ thanh toán tại nhà thuốc" → nhà thuốc thu hộ → **Đã thanh toán** → `H5`.
- ⟨hoãn thanh toán⟩ `H3` (ghi lý do, hẹn thời gian) → **Thanh toán sau**; đến hạn nhắc.
- ⟨hoàn tiền theo chính sách⟩ `H5` hiển thị **Đang hoàn tiền** (có lý do) → **Đã hoàn tiền**.

### F10. Xét nghiệm sau khám
Bác sĩ chỉ định → **Đã chỉ định** → `F1`, `F2` → `F3 Đặt hẹn` → **Chờ thực hiện** → thực hiện → **Có kết quả** → **Chờ bác sĩ xem** → **Bác sĩ đã xem** → thông báo (SMS, Zalo, app) → `H6 Kết quả và việc tiếp theo`, từ đó rẽ:
- **Thuốc, điều trị kèm hướng dẫn** → `H5`... mục "Kết luận và đơn thuốc" (`H5`).
- **Xét nghiệm khác** → quay lại `F1`.
- **Hẹn lịch giải thích kết quả, không thu phí** → `C7` có nhãn "Miễn phí".
- **Không liên hệ được để báo kết quả** → trạng thái "Chưa truyền đạt", phòng khám gọi lại; app hiển thị nhắc "Phòng khám đang cố liên hệ với bạn".

### F11. Chăm sóc sau khám
`I1 Hỏi phòng khám` (ba lý do) →
- **Phản hồi về đơn thuốc** (tác dụng phụ, hiệu quả điều trị) → `I2`.
- **Hỏi lại, dùng thuốc** (giải thích thêm, hướng dẫn chăm sóc) → `I2`.
- **Triệu chứng mới, chưa cải thiện** → `I2` ⟨đánh giá mức độ⟩ → tư vấn xử trí → khuyến cáo **tái khám** (`J1`) hoặc **cấp cứu** (`C4`).
- Bác sĩ **giới thiệu chuyên khoa khác** → `I4` (điều phối viên hướng dẫn) → khám chuyên khoa → bệnh nhân gửi lại phản hồi → bổ sung hồ sơ.
- Bác sĩ **bàn giao theo dõi lâm sàng** → `I3 Theo dõi triệu chứng` (nhân viên nhắc, bệnh nhân phản hồi) → điều phối viên cập nhật cho bác sĩ; trao đổi ở `I5 Tin nhắn`.

### F12. Tái khám (vòng lặp)
`H5` hoặc `B1` ⟨đến hạn⟩ → `J1 Đặt lịch tái khám (gợi ý ngày)` → `C7` → xác nhận → nhắc lịch tự động (SMS, Zalo, điện thoại) → **reminder** → khám lại → cập nhật kết quả → tiếp tục theo dõi hoặc quay về `B1` (hồ sơ cũ giữ nguyên, không nhập lại).

---

## 5. Bảng đối chiếu: nhánh sơ đồ gốc → màn hình

| Nhánh sơ đồ | Màn hình hoặc trạng thái |
|---|---|
| Khách liên hệ (điện thoại, Zalo, website, mạng xã hội) | A1 (app thay kênh), K5 Hỗ trợ (gọi, nhắn) |
| Thu thập thông tin ban đầu (họ tên, liên hệ, lý do, triệu chứng, tiền sử) | A1, A3, C2 |
| Rà trùng hồ sơ, cập nhật nếu cần | Hệ thống sau A1; kết quả hiện ở A2 hoặc A3 |
| Đã có hồ sơ: mở hồ sơ cũ, xác nhận, cập nhật | A2 |
| Chưa có: tạo hồ sơ | A3 |
| Có dấu cảnh báo nguy hiểm? | C3 |
| Khuyến cáo nhập viện, cấp cứu, giải thích nguy cơ | C4 |
| Vẫn muốn khám: xác nhận hình thức phù hợp | C5, trạng thái mode-review |
| Hình thức khám? Trực tiếp hoặc trực tuyến | C6 |
| Xác nhận lịch, gửi giờ đến, bàn giao thu phí, gửi xác nhận | C8, C9, D2, E1 |
| Hủy lịch: cập nhật lý do, lưu lịch sử | D4 |
| Không đến: ghi nhận, đặt lại | Trạng thái no-show, D2 |
| Đến ngày hẹn, bệnh nhân đến, tiếp nhận, sẵn sàng khám, bác sĩ khám | E2, E3 |
| Ký, khóa lượt khám | Trạng thái completed, H1 |
| Cần cận lâm sàng trước khám? | Trạng thái pre-lab, F1 đến F4 |
| Đã có yêu cầu, tham khảo bác sĩ, điều phối điều dưỡng đặt hẹn | F2, F3 |
| Bệnh nhân thực hiện, có kết quả, đính kèm hồ sơ | F2, F4 |
| Quay lại lượt khám hiện tại hoặc bác sĩ xem trong buổi khám | F2 (lựa chọn), D2 |
| Online: gửi link, hướng dẫn, kiểm tra thiết bị, nhắc lịch | G1 |
| Online: hủy lịch, lưu lý do, đặt lịch mới | D4, C7 |
| Liên hệ trực tuyến, chờ gọi | G2, G3 |
| Không liên hệ được: giữ trạng thái chưa truyền đạt, tạo việc gọi lại | G5, trạng thái unreachable |
| Kết nối được: khám, tư vấn, kê đơn, ghi hồ sơ | G4, H5 |
| Hẹn online lần khác | G5, C7 |
| Chuyển sang khám tại phòng khám | G5, C7 |
| 4.1 Phương thức: tiền mặt, chuyển khoản, thu hộ nhà thuốc | H2 |
| Đã thu: xuất biên lai | H5 |
| Hoãn thanh toán: ghi lý do, hẹn thời gian | H3 |
| Hoàn tiền: ghi lý do, thực hiện, cập nhật | H5 |
| 4.2 Chuỗi: đã chỉ định đến bác sĩ đã xem | F1, F2 |
| Sau khi bác sĩ xem: thuốc, điều trị, chỉ định thêm, lịch giải thích không thu phí, thông báo | H5, H6, F1, C7 |
| 4.3 Gọi lại: phản hồi đơn thuốc, hỏi dùng thuốc, triệu chứng mới | I1, I2 |
| Chuyển chuyên khoa | I4 |
| Bàn giao theo dõi lâm sàng | I3, I5 |
| 4.4 Tái khám: đặt, xác nhận, nhắc tự động, tái khám, cập nhật | J1, C7, thông báo |
| Vòng lặp quay lại quy trình đầu | J1, B1 |
| Ba nguyên tắc vận hành | Thanh tiến trình, dòng "Đang chờ", nút chính ở D2 |

---

## 6. Danh sách 46 màn hình

Giai đoạn: **P1** = dựng trước (luồng F1 đến F4, F6, F12); **P2** = F5, F7 đến F10; **P3** = F11 và phần còn lại.

| ID | Màn hình | Route | GĐ |
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

---

## 7. Kiểm thử luồng (mỗi mục phải chạy được đến cuối)

- [ ] **F1:** người mới đi từ A1 đến C9, trạng thái pending, phiếu khám có mã.
- [ ] **F2:** bệnh nhân cũ thấy A2 và không phải nhập lại thông tin.
- [ ] **F3a:** chọn dấu hiệu nguy hiểm ra C4; nút Gọi cấp cứu hoạt động; không thể đặt lịch bình thường.
- [ ] **F3b:** "Vẫn muốn khám" đi qua C5 và lịch ở trạng thái mode-review với lý do hiển thị.
- [ ] **F4:** bấm "Báo đã đến" làm trạng thái đi arrived > received > ready > in-consult > completed theo thứ tự.
- [ ] **F5:** trạng thái pre-lab dẫn tới F1 đến F4; có hai lối "quay lại lượt khám" và "để bác sĩ xem trong buổi khám".
- [ ] **F6:** hủy ghi lý do và lưu vào lịch sử; no-show cho phép "Đặt lại" dùng lại hồ sơ.
- [ ] **F7:** online đi qua G1 đến G4; G3 nhận cuộc gọi.
- [ ] **F8:** G3 không nhận dẫn tới G5; cả ba lối (chờ gọi lại, hẹn online lần khác, chuyển tại phòng khám) đều chạy và lịch cũ được liên kết với lịch mới.
- [ ] **F9:** đủ ba phương thức, một trường hợp không phát sinh phí, hoãn thanh toán (có lý do và ngày), hoàn tiền.
- [ ] **F10:** chuỗi 5 trạng thái xét nghiệm đủ; sau "Bác sĩ đã xem" có bốn hành động.
- [ ] **F11:** ba lý do đều có đường đi riêng; có cảnh báo cấp cứu và khuyến cáo tái khám; chuyển chuyên khoa và theo dõi lâm sàng chạy được.
- [ ] **F12:** từ tái khám quay về đầu quy trình, hồ sơ cũ giữ nguyên.
- [ ] Mọi trạng thái trong mục 3.1 có đúng một nút chính hoạt động ở D2.
- [ ] Không còn nút chết, không còn màn hình nào không có lối ra.