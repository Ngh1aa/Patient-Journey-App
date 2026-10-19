# CareFlow+ — H2 + D1/D2, ngày 19/10/2026

**Đã triển khai nhóm A, nav F phương án A, hướng dẫn khẩn cấp D1/D2 và nội dung H6. Dừng để người dùng xem ảnh trước khi sang đợt tiếp.** Không mở rộng sang B/C/D3+ ngoài các sửa chữa cần thiết cho A và những bổ sung được chỉ định trong tin nhắn duyệt H1.

## Xem trước

- [Nav ba trạng thái](nav-three-states.png): Home được chọn; Lịch hẹn được chọn có cập nhật chưa đọc; Hồ sơ được chọn và nút + đang nhấn/có focus.
- [C3 chọn Có hoặc chưa rõ](states/C3-warning-visible.png); [Hỗ trợ có Gọi115 trực tiếp](states/K5-emergency-visible.png).
- [Thẻ H6 sau khi thay nội dung](states/H6-aftercare-card.png); [lịch bottom sheet](states/C7-calendar-sheet.png); [chọn chủ đề](states/K5-topic-sheet.png).
- [47 màn và lỗi cụ thể còn lại](screens.md); [bốn contact sheet](all-screens-1.png), [2](all-screens-2.png), [3](all-screens-3.png), [4](all-screens-4.png).

Local: http://127.0.0.1:4186/prototype/?journey=F1&branch=default#/home. Gallery dùng cùng nav: http://127.0.0.1:4186/design/preview.html.

## A — đã sửa nguyên nhân

| Mục | Thay đổi và kiểm tra |
|---|---|
| A1 | Không xóa home indicator. Sửa vùng đặt CTA: bỏ cơ chế sticky đáy âm cũ; footer của booking bám phone frame và nằm ngoài vùng cuộn. Desktop giữ20px dưới footer cho indicator; mobile dùng safe-area thực tế. C1/C6/Home không được báo là đã tái hiện thanh đen lạ nếu chưa có bằng chứng; lỗi clip CTA ở C8 được xử lý bởi cùng cơ chế. |
| A2 | Footer vẫn thuộc đúng form, không clone nút hoặc tạo submit logic thứ hai. `ResizeObserver` đo chiều cao footer, kể cả khi báo lỗi; dành vùng riêng tương ứng bằng chiều cao đó trong scroll viewport. Có nền fade từ trong suốt sang nền màn. Kiểm tra footer bắt đầu ở hoặc sau đáy vùng cuộn, không đè các trường nhập. |
| A3 | Bỏ rule reset padding của mọi card bên trong form; chỉ reset các container form thực sự. C6 có padding16px, không cắt nội dung; mô tả không còn cách mép đáy3,5px. Nhãn Khám tại phòng khám được cân dòng, tránh dòng cuối chỉ một chữ. |
| A4 | Header booking sticky ở đỉnh vùng cuộn, giữ nguyên toàn bộ header thay vì để phần mô tả cuối bị cắt. Thu gọn progress/context, chuyển hồ sơ+Đổi vào hàng tiến trình; các màn chính giảm từ khoảng304px xuống khoảng203px ở390px. Chữ lớn có chế độ thu gọn header có chủ ý sau khi cuộn; kiểm tra riêng trên cả hai engine. Chưa đổi tên bước D3 ở đợt này. |
| A5 | Thay phần hiển thị native date/topic/time/file bằng control dùng chung: lịch theo tháng với chọn nhanh năm/tháng, chọn chủ đề, chọn giờ/phút và nút chọn tệp. Giữ input ngữ nghĩa gốc cùng value/validation/FormData. Bổ sung counter mọi textarea và bỏ tay kéo resize. Modal dùng vòng đời dialog/focus hiện có; sửa thêm trường hợp WebKit trả input.type về text và focus sau khi đóng. |
| A6 | Một lớp section chịu trách nhiệm gutter/gap; bỏ margin/gap và inner padding cộng dồn. Sửa selector form hỗ trợ đang nhắm sai chiều DOM. Khoảng từ tiêu đề tới control đầu hiện khoảng21–25px thay vì33–69px theo cùng phép đo H1; Gửi yêu cầu giảm69,4px xuống21,4px. |

Native controls vẫn tồn tại làm nguồn giá trị cho form nhưng không còn giao diện trình duyệt trong vùng app của47 màn đã chụp. Các control trong bảng reviewer ngoài phone frame không thuộc UI bệnh nhân.

## F — nav phương án A

- Nền SVG có rãnh Bezier lõm thật, dùng `drop-shadow` theo path; bỏ nền/bóng hình chữ nhật của lớp nav cũ. Đã mở xem ảnh để kiểm tra rãnh, viền và vòng focus không bị cắt.
- Nút giữa56px, nền token primary#0B1220, dấu+24px trắng, viền trắng4px; có pressed/focus. Gọi đúng action booking cũ, không đổi flow.
- Mỗi bên hai tab; icon24px. Chỉ tab đang chọn có nhãn12px bên cạnh icon trong pill xanh. Idle chỉ hiện icon viền; vẫn giữ tên truy cập đủ cho tất cả5 mục.
- Badge Lịch hẹn dùng unique unread D2 visit updates trong model. Kiểm tra đọc thông báo xóa badge và không tạo số đếm giả.
- Kiểm tra320/360/390px và khung1440px; hit area các mục ít nhất44px; có khoảng safe-area dưới.

## D1/D2 và H6

C3 chọn Có hoặc chưa rõ đổi sang nền/viền cảnh báo và hiện ngay khối hướng dẫn có link `tel:115`, trước khi tiếp tục. Chọn Không sẽ ẩn khối này; nền lựa chọn cũ được cập nhật đúng radio hiện tại. K5 luôn hiển thị khối khẩn cấp ở đầu nội dung, không đặt sau disclosure. Không tự động gọi điện trong kiểm thử; chỉ xác minh đường gọi và UI.

H6 đổi thành Việc cần làm sau buổi khám: xem tài liệu đã chia sẻ, hỏi phòng khám khi thiếu thông tin và ghi cập nhật để trao đổi. Không bịa đơn thuốc, liều hoặc chỉ định. Kết luận/đơn thuốc rỗng vẫn phản ánh đúng model; đã chụp thêm trạng thái có kết luận được chia sẻ. Chuỗi Mẫu chăm sóc sau khám, Nội dung minh họa và Thuốc A đã bỏ khỏi active patient JS.

## Kiểm tra và giới hạn bằng chứng

- **130 unique browser cases PASS,0 FAIL,0 SKIP**, Chromium/WebKit. [Kết quả hợp nhất](browser-validation.json).
- Full journey run:96 PASS/8 FAIL;8 lỗi là assertion cũ đòi5 DOM children của nav và tính semantic input ẩn1px là target. Sửa assertion để kiểm5 control thật, aria-label mới và chỉ tính target truy cập được. Rerun8/8 PASS. Giữ cả [run gốc](journeys-results.json) và [rerun](journeys-recheck.json), không xóa dấu vết thất bại.
- [H2/nav26 cases](h2-results.json) gồm CTA, header khi cuộn/chữ lớn, warning chọn/bỏ chọn, keyboard/modal/focus return, DOB calendar, topic/time/file values và unread badge. [Rerun spacing](spacing-recheck.json) xác minh thêm Gửi yêu cầu không còn gap40px.
- Model49/49 PASS; syntax checks PASS;7/7 source contract checks PASS; active presentation không thêm raw color ngoài token owner.
- Chụp mới47 màn +37 trạng thái bổ sung, trong đó33 ảnh thuộc khám online/thanh toán/hậu khám. Mở xem cả contact sheet và ảnh trọng điểm. [Capture ledger](capture.json):0 page errors,0 horizontal overflow,0 native control hiển thị ở47 mẫu chính, không có target nhỏ trong scanner của capture. Đây không phải chứng nhận mọi biến thể đều đạt WCAG.
- [Computed contrast](elementary-sanity.json):62 route gồm47 patient/15 staff,52 hover/focus variants,0 findings. Không có UI staff nào được thiết kế lại trong đợt này; lượt kiểm tra bổ sung do dùng chung owner UI/tokens.
- [23 cặp token](contrast.txt): trắng/primary18,723:1; trắng/loading14,424:1; navy/blue12,164:1 và10,602:1; navy/mint12,992:1 và11,592:1; muted/white5,348:1; danger/danger-surface6,023:1. Input border3,723:1 đạt ngưỡng phi văn bản3:1, không dùng làm bằng chứng chữ thường4,5:1.
- G1 camera-denied dùng API stub trong browser kiểm tra cô lập để kích hoạt nhánh lỗi/recovery; không khẳng định đã kiểm phần cứng. Các trạng thái cuộc gọi/thu tiền/nhân viên trả lời là model của prototype, không phải dịch vụ video/ngân hàng hay phản hồi thật. Chưa kiểm native iOS/VoiceOver hoặc người dùng thật.

## Lỗi thực tế còn lại ngoài phạm vi đợt này

| Mức | Vị trí | Bằng chứng / việc còn lại |
|---|---|---|
| P1 | G4 cuộc gọi | Nhập ghi chú cá nhân, toggle camera hoặc mic làm ghi chú mất vì render thay DOM. `capture.json` ghi `noteLostAfterToggle:true`. Chưa sửa ngoài phạm vi H2. |
| P1 | H4 chuyển khoản | Đã hiện chưa có tài khoản/số tiền/QR nhưng Tôi đã chuyển khoản vẫn bật. Cần quyết định khả năng khai báo khi dữ liệu chưa đủ; chưa đổi payment logic trong đợt UI này. |
| P2 | H2/H5 | Paid/not-required/refunding/refunded vẫn dùng chung tone xanh dương/info với trạng thái chờ; khác chữ nhưng chưa khác icon/tone theo ý nghĩa. |
| P2 | H6/H7/I5 | H6 còn lối hỏi trùng giữa aftercare/footer; H7 một kết quả vẫn có chip/số đếm; empty messages I5 chưa cùng mẫu empty. Thuộc đợt B/C. |

Không giữ nhận định I3 báo Chưa có cập nhật sau khi gửi: rà lại full text và model cho thấy cập nhật đã xuất hiện dưới form. [Ledger47 màn](screens.md) ghi các trạng thái thực sự đã kiểm và các lỗi cụ thể, thay cho UNKNOWN chung chung ở nhóm G/H/I/J. Các màn model đồng bộ không được gắn spinner giả để suy ra có backend loading thật.

## Review ảnh theo7 dấu hiệu

| Dấu hiệu | Kết luận | Vị trí / vai trò |
|---|---|---|
| Neon cạnh tranh | không xuất hiện | Header/card dùng blue/green; cam/đỏ chỉ dùng cho trạng thái/cảnh báo. |
| Dark/glow/bloom | không xuất hiện | Màn nền sáng; nút đen chỉ định action. Shadow nav phân lớp theo rãnh, không phải glow trang trí. |
| Emoji thay icon | không xuất hiện | Nav, form, warning và card dùng SVG registry. |
| Gradient mặc định | có mục đích rõ | Header dẫn đọc xanh dương, aftercare/result xanh lá; không dùng mesh để thay thế dữ liệu trạng thái. |
| Card/nested card | cần sửa | A6 đã bỏ gutter lồng; B1/H6 còn các lối nội dung trùng, cần đợt B/C để rõ vai trò từng card. |
| Thanh màu cạnh nhiều màu | không xuất hiện | Patient không có rainbow strip. Viền đỏ C3/K5 biểu thị khẩn cấp. |
| Status dot không rõ nguồn | có mục đích rõ | Badge nav đếm unread visit updates; live-dot G4 là trạng thái phiên trong model, không phải xác nhận bác sĩ thật online. Tone trạng thái thanh toán còn lỗi riêng nêu trên. |

## Quyết định đã nhận cho đợt kế tiếp

- D3:4 bước; bước4 Lịch hẹn; C7/C8 là hai màn con riêng; C2/C3 dùng chung tên bước.
- D6: pending ghi Bác sĩ do phòng khám sắp xếp, không hiện tên cụ thể.
- D7: được viết địa điểm/chính sách đổi-hủy/thời gian phản hồi giả định cho prototype; phải ghi assumptions trong tài liệu. Chưa áp nội dung này vào app ở H2.

Không cần hỏi lại các lựa chọn này. **Dừng chờ người dùng xem ảnh H2+D1/D2 trước khi triển khai tiếp.** Nhánh `redesign/cards-v2`; không commit/push/merge. Main giữ `25dfe12208299b2d40ecf1c4f59441302c1ba9c5`.

Các owner chính: `design/ui.js`, `design/components.css`, `design/tokens.css`, `prototype/app.js`, `prototype/views.js`, `prototype/careflow-rich-content.js`, `prototype/journey-behaviors.js`; sửa regression tests tương ứng. Không sửa `prototype/model.js`, không thêm dependency.

Chạy local từ root repo bằng PowerShell:

```powershell
$env:PORT='4186'
node prototype/preview-server.cjs
```

## Nguồn bổ sung cho quyết định H2

- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): Escape, giữ focus trong modal và trả focus về nút mở.
- [Cổng thông tin Chính phủ — phản ứng và gọi115 khi cần cấp cứu](https://thanglong.chinhphu.vn/tu-ca-cap-cuu-tren-pho-ai-cung-co-the-tro-thanh-nguoi-giu-nhip-tim-103260318170621866.htm): đối chiếu số gọi; không bổ sung hướng dẫn chẩn đoán hay can thiệp y tế vào app.
- Nền tảng Apple HIG/Material/NNG/WCAG và quy tắc CareFlow trước đó giữ tại [card-design-rules](../../card-design-rules.md). Nguồn không thay thế kiểm thử trình duyệt hoặc duyệt của người dùng.
