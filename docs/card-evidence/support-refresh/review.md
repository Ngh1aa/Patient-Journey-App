# Hỗ trợ, ảnh tách nền và nav — bản nháp local, 19/10/2026

## Phạm vi

- Giữ nhánh `redesign/cards-v2`, không commit/push/merge main.
- Tách nền ảnh chân dung Unsplash đang có trong thư viện, gắn vào thẻ liên hệ có hành động trên Trang chủ và Hỗ trợ. Không thêm banner chỉ để trang trí.
- Nav dùng chung giữ icon-only, nút + đen, badge và safe area; đường SVG có thêm hai góc dưới bo 24 đơn vị trong viewBox390×88. Kích thước góc hiển thị thay đổi theo kích thước nav.
- Hỗ trợ: Header → Khẩn cấp → Liên hệ nhanh bento → FAQ → Form. Tin nhắn gần đây chỉ thành một section khi có dữ liệu; khi rỗng dùng một dòng gợi ý.

## Phát hiện và kết quả

| Hạng mục | Trước, đo tại390px | Sau |
|---|---|---|
| Khẩn cấp |174.78px cao, nền/viền/chữ/nút cùng đỏ |68px cao; nút Gọi115 đen đặc, `tel:115` trực tiếp; cảnh báo có icon, nền đỏ riêng |
| Hai khối đầu |0px khoảng cách |Parent grid gap16px; áp dụng giữa mọi section cấp đầu |
| Banner hỗ trợ |Có minh họa, không có hành động |Bỏ; ảnh nằm trong thẻ Nhắn tin có hành động |
| Liên hệ |Ba thẻ cùng khuôn |Một thẻ nhắn tin lớn bên trái; gọi lại/hỏi phòng khám bên phải |
| Header |Câu hỏi chung |Giờ hỗ trợ chưa được cập nhật; khi có yêu cầu chờ thì hiển thị trạng thái đó |
| CTA |Form là nút chính,115 dạng viền |115 là nút chính duy nhất trong nội dung; form dùng nút phụ; + nav có phạm vi riêng |

Trạng thái giờ trực/SLA không tồn tại trong model hiện tại. Không đưa “Đang trực”, “đang mở” hay “~15 phút” lên UI như dữ liệu thật. Không gán chân dung stock cho tên bác sĩ của lượt khám hoặc tài khoản.

## Ảnh

- Nguồn: [Usman Yousaf / Unsplash](https://unsplash.com/photos/pTrhfmj2jDA), nguồn gốc đã có trong `prototype/assets/images/unsplash/sources.json`.
- Đầu vào: `doctor-portrait.webp`; đầu ra app: `doctor-cutout.webp`, WebP có alpha,142152bytes. PNG trung gian giữ ngoài repo, bản gốc công cụ vẫn được giữ nguyên.
- Built-in imagegen thực hiện background extraction, sau đó Sharp có sẵn chỉ mã hóa WebP; không thêm dependency vào app. Đây là ảnh phái sinh được xử lý bằng AI, không phải ảnh nhân viên phòng khám đã xác minh.
- Prompt đã dùng: “Use case: background-extraction. Edit target: the supplied existing licensed Unsplash photograph by Usman Yousaf, a man in glasses with folded arms and a stethoscope. Remove ONLY the gray background and deliver a clean actual transparent-background PNG cutout. Preserve the exact man's face, glasses, hair, skin texture, stethoscope, blue shirt, white coat, folded arms, pose, colors, and lighting. Do not beautify, redraw, change identity, add objects, text, shadows or floor. Keep his entire visible head and both shoulders/arms inside the canvas with a small transparent margin around the hair and sides. Crop away excessive empty transparent sides, retaining his complete existing lower torso up to the photograph's lower boundary. This is a decorative photographic asset for small medical app cards, not a depiction of a named clinic employee.”

## Kiểm tra

- `browser-results.json`:52/52 trường hợp PASS trên Chromium/WebKit: nav, Trang chủ, H2 form/header và Hỗ trợ mới. Bao gồm320/360/390/1440px, chữ lớn, vùng bấm, axe ở Hỗ trợ/nav, gọi lại không trùng, tin nhắn chuyển đúng route và giữ dữ liệu yêu cầu.
- Sau polish ảnh Trang chủ và copy gọi lại: `final-results.json`32/32 PASS,0FAIL/0SKIP. Lượt rộng hơn ban đầu phát hiện hai lỗi assertion H6 cũ còn đòi nội dung thuốc mẫu đã bỏ ở H2; cập nhật bài kiểm tra để xác nhận checklist sau khám, đúng lượt khám và dữ liệu không đổi khi mở theo dõi. Không đưa thuốc mẫu trở lại sản phẩm. Các kết quả lỗi trước sửa vẫn được giữ trong `final-before-test-update.json` và `aftercare-rerun.json`.
- `source-contract.json`:7 kiểm tra nguồn; `contrast.txt`:tỉ lệ các cặp token. Đây không phải chứng nhận WCAG toàn app.
- `after-capture.json`:ảnh và đo bố cục trên bốn chiều rộng, không có page error/overflow ngang trong lượt capture. Xem ảnh trước/sau390px,320px, desktop và chữ lớn; form/FAQ có thể cuộn đến, nav không phủ viewport nội dung.

## Chạy và giới hạn

Từ root repo: `$env:PORT='4186'; node prototype/preview-server.cjs`.
Xem `/prototype/?journey=F1&branch=default#/support` và `/prototype/#/home`.

Giữ nguyên model, dữ liệu và handler nghiệp vụ. Các vấn đề G4 ghi chú cuộc gọi, H4 xác nhận chuyển khoản và các bước D3/D6/D7 đã ghi ở review H2 trước vẫn nằm ngoài đợt này.
