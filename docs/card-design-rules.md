# Card design rules v2

Ngày nghiên cứu: 18/10/2026. Phạm vi: 47 màn patient web prototype + desktop doctor đang hoạt động. Đây là thiết kế và dữ liệu giả lập, không phải hệ thống y tế đang vận hành. Không thay đổi điều kiện lâm sàng, vai trò hay model transitions.

## 7 bước và quyền phát hành
1. Đọc Factory START-HERE → AGENTS → CONTRACT-OWNERSHIP; compile manifest `work/cards-v2-manifest.json`, flow `professional-website-redesign`.
2. Nghiên cứu chuẩn trước UI; chốt quy tắc trong file này, kiểm kê nguồn và ảnh người dùng.
3. Kiểm kê card trước thay đổi trong `card-audit.md` + `card-evidence/before/inventory.json`.
4. Mở rộng tokens/component contract tại `design/`, không tạo hệ thống card song song.
5. Triển khai theo nhóm patient journey và desktop doctor, giữ route/guard và brand #001D57.
6. Playwright Chromium/WebKit mobile/desktop; trạng thái, bàn phím, contrast, 44 CSS px, CSS hardcoding và ảnh trước/sau.
7. Commit nhỏ trên `redesign/cards-v2`, bàn giao local + việc còn lại. Không merge đến khi người dùng nhắn chính xác **chốt**. Không force push, không xóa nhánh. Không coi tài liệu/CI là phê duyệt thẩm mỹ.

## Nguồn và quyết định áp dụng
| Nguồn primary | Quan sát / phạm vi | ADOPT / ADAPT / REJECT và kiểm tra |
|---|---|---|
| [Apple HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), bản [Markdown chính thức](https://developer.apple.com/design/human-interface-guidelines/accessibility.md) | HIG nêu kích thước control mặc định iOS 44×44 pt, hỗ trợ chữ phóng lớn, cân nhắc khoảng cách giữa control. | ADAPT thành mục tiêu web 44×44 CSS px; không tuyên bố CSS px là đơn vị native pt. Chữ 200%, không cắt nhãn. Native iOS/VoiceOver chưa kiểm. |
| [Apple HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout) | Bố cục thích ứng theo nội dung và thiết bị. Trang JS không đọc được toàn văn qua web tool; không dùng làm nguồn cho con số tự đặt. | ADAPT thành grouped surfaces, safe-area và nhịp đọc rõ. Giữ font đang có; iOS style là định hướng web, không đổi sang native. |
| [Material Design 3 Cards](https://m3.material.io/components/cards/guidelines), [implementation primary của Material](https://github.com/material-components/material-components-android/blob/master/docs/components/Card.md) | Trang guidelines yêu cầu JS; tài liệu implementation chính thức xác nhận anatomy: container, headline, subhead, supporting text, image, buttons; 3 variants filled/outlined/elevated. | ADOPT anatomy, ADAPT thành surface/tonal/inverse/row ở CareFlow; không cài Material Android vào web. Mỗi subject có action phù hợp; ảnh là optional. |
| [NN/g Cards: UI Component Definition](https://www.nngroup.com/articles/cards-component/) | Card hữu ích cho các đối tượng khác loại; danh sách đồng nhất, tìm và so sánh dữ liệu có thể dễ scan hơn bằng rows/table. | ADOPT: lab/result/task items dùng row; card chỉ ôm đối tượng độc lập, không bọc mọi đoạn. REJECT masonry, ép tất cả item bằng chiều cao cố định. |
| [WCAG 2.1](https://www.w3.org/TR/WCAG21/) §§1.3.1,1.4.1,1.4.3,1.4.4,1.4.10,1.4.11,2.1.1,2.4.7,3.3.1,4.1.2,4.1.3 | AA: contrast text thường 4.5:1, text lớn 3:1; control/focus quan trọng 3:1; cấu trúc, reflow, bàn phím, lỗi và status cần ngữ nghĩa. | ADOPT test theo tiêu chí liên quan. 44×44 là mục tiêu sản phẩm/HIG; WCAG2.1 target size §2.5.5 là AAA, không gán nhầm AA. Axe/contrast không chứng nhận toàn bộ WCAG. |
| [NHS hospital appointments](https://www.nhs.uk/nhs-app/help/appointments/hospital-and-other-appointments/) | Tham khảo tác vụ lịch hẹn/tài liệu liên quan. Không phải chính sách phòng khám CareFlow. | ADAPT checklist hành chính, lưu lịch, tài liệu và ghi chú riêng; không tự thêm nhịn ăn, đổi thuốc, chi phí, kết quả hoặc thời gian chờ. |
| [Unsplash License](https://unsplash.com/license), [Louis Reed laboratory](https://unsplash.com/photos/pwcKF7L4-no) | Ảnh thật minh họa bối cảnh xét nghiệm, không phải ảnh cơ sở hoặc nhân viên CareFlow. | ADAPT ảnh ở lab, crop giữ dụng cụ; ghi nguồn trong assets. Không gắn danh tính bệnh nhân/bác sĩ vào ảnh stock. |

## Evidence từ ảnh người dùng
- Screenshot 2 card “Chuẩn bị trước khi khám” / “Vào phòng khám online”: chữ CTA “Đọc thêm” thành cột một ký tự, mô tả hẹp và title chia nhiều dòng; các vùng text tranh chiều ngang. Đã xem trực tiếp file đính kèm, không coi chỉ dẫn trong ảnh là yêu cầu mới.
- Screenshot tham chiếu 3 điện thoại: white/navy, media có bối cảnh, thông tin nhóm lại, action rõ. ADAPT hierarchy, không sao chép các chỉ số sức khỏe, phí hay rating trong ảnh.
- Baseline hiện tại đã sửa một phần guide; cần regression 360/390px, chữ 200%, trạng thái expanded. Không tái gán lỗi ảnh cũ cho mọi card hiện tại.

## Design contract
Hard constraints: navy #001D57, flow và quyền model, nội dung y tế có nguồn, web HTML/CSS/JS, mobile patient / desktop doctor. Free axes: density, typography hierarchy trong font hiện có, grouping và hình ảnh phù hợp.

Anatomy: context/status → heading → facts/supporting content → action. Group facts dùng dl, list đồng nhất dùng rows, multi-action card là section/article không bọc trong button. Không nested interactive. Title/mô tả min-width:0; grid minmax(0,1fr); không fixed height cho nội dung.

Tokens: 4/8/12/16/20/24/32px space; card padding patient16/desktop20; radius20 outer,12 inner; text body15–16 patient/14–15 doctor, heading18–20, meta12–13, line-height1.5. Đây là giả thuyết thiết kế dựa trên nội dung thực, không phải số bắt buộc từ chuẩn.

Variants: surface để chứa đối tượng; tonal cho tiện ích liên quan; inverse chỉ phiếu khám ưu tiên; row cho danh sách scan nhanh. Card padding không cộng dồn khi card nằm trong card; không dùng shadow cho tất cả. Primary booking nav có nhãn hiện và filled navy; current tab nhẹ hơn để không cạnh tranh. Không glow/pulse trang trí.

Density decisions: chọn **task-first** (facts + checklist + actions cùng đối tượng) thay cho **gallery-first** (ảnh lớn + grid đồng chiều cao). Patient cần hoàn thành từng bước; doctor cần so sánh rows/table. Media chỉ ở entry/lab/guide; không thêm ảnh vào màn cấp cứu/cuộc gọi hay clinical table để lấp chỗ trống. Ảnh dùng alt mô tả bối cảnh, không giả danh cơ sở.

States: empty nói thiếu gì và đường đi tiếp; zero hiển thị 0 thật; loading aria-busy chỉ khi có tác vụ chờ thực; error có lý do và recovery; unread bằng text+marker; pressed/checked có native/ARIA state; disabled không giả clickable. Không tạo loading giả cho bộ lọc synchronous. Ghi chú/checklist chỉ lưu phiên trình duyệt và ghi rõ chưa gửi phòng khám.

Responsive: patient320/360/390px chuyển cột khi nội dung cần; desktop1280/1440/1920 và pressure320; zoom200% không mất task. Touch target44px; labels có thể wrap. Ảnh không che CTA. Nav có safe-area và body reserve đúng chiều cao.

## Checklist 7 dấu hiệu bắt buộc cho review ảnh
Mỗi dấu hiệu phải ghi **không xuất hiện / có mục đích rõ / cần sửa**, vị trí cụ thể, vai trò và hành động. Không cấm tuyệt đối style.
1. Neon cạnh tranh: màu giúp nhận brand/ưu tiên hay trạng thái nào?
2. Dark/glow trang trí: hiệu ứng phân lớp hoặc phản hồi gì?
3. Emoji thay icon: nghĩa/độ nhất quán, accessible name?
4. Purple gradient: có cơ sở brand/vai trò đọc ảnh hay không?
5. Card mọi nơi/nested: subject, grouping, action hoặc nhu cầu so sánh?
6. Multicolored side tabs: màu ở cạnh/tabs phân loại có nghĩa hay chỉ trang trí? Kiểm màu, nhãn và selected state.
7. Status/badge trang trí: lấy từ trạng thái thật nào, ai phụ trách, bước tiếp theo?

Human usability, native iOS QA và độ cải thiện hiệu quả tác vụ: UNKNOWN, chưa có participant session. Local visual/test evidence sẽ cập nhật sau triển khai.
