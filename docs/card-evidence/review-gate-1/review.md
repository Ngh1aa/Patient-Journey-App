# CareFlow+ — rà soát bước H1, ngày 19/10/2026

**Kết luận: còn lỗi hiển thị, tương tác và thứ bậc. Chưa sửa giao diện. Dừng chờ duyệt bước 1 theo yêu cầu mới.** Báo cáo này thay tiêu chí nghiệm thu của đợt rollout trước; kết quả kiểm tra cũ không chứng minh đã đạt A–G mới.

## Phạm vi và bằng chứng

- Đọc quy trình UIUX Factory và source hiện có; đối chiếu 47 screen ID chính thức trong `prototype/model.js`, không rút còn 17 màn ví dụ. Phạm vi hiện tại là mobile `prototype/`; chưa sửa staff.
- Chromium: rà DOM cả 47 màn ở 390px; kiểm tra 17 màn trọng điểm tại 360/390px và khung desktop 1440px, ở đầu trang, cuộn 120px, 320px và cuối trang. WebKit: kiểm tra bổ sung C1/C2/C6/C7/C8/K2/K5 ở 390px. Tổng cộng 58 tổ hợp màn/kích thước/engine cho kiểm tra cuộn.
- Đã mở xem các ảnh chụp trọng điểm của đợt này và bốn contact sheet toàn 47 màn từ đợt trước. Contact sheet cũ là bằng chứng bổ trợ, không phải lần chụp mới.
- [Dữ liệu đo mới](audit.json), [đối chiếu từng màn A–G](screens.md), [23 cặp tương phản token](contrast.txt). Chromium ghi nhận 0 JavaScript page errors trong lượt rà; đây không phải chứng nhận toàn bộ flow hay mọi trạng thái.
- SHA-256 của 12 file product trọng yếu giống trước/sau kiểm tra. Chỉ thêm hồ sơ rà soát trong thư mục này; không commit/push/merge. Nhánh `redesign/cards-v2`; main vẫn `25dfe12208299b2d40ecf1c4f59441302c1ba9c5`.
- Fixture và thao tác kiểm tra chạy trong browser cô lập; không thay dữ liệu phiên đang mở của người dùng.

## A1–A6: nguyên nhân và mức xác nhận

| Mục | Kết luận | Nguyên nhân / bằng chứng | Hướng sửa sau duyệt |
|---|---|---|---|
| A1 Thanh đen | **Tái hiện một phần**, chưa đủ bằng chứng quy cùng nguyên nhân cho mọi màn | C8 có nút đen bị vượt đáy vùng cuộn khoảng **12,7px ở 360px**, **27,3px trong khung desktop** khi chưa cuộn. C1/C6 và Home rỗng chưa tái hiện thanh đen lạ ở các vị trí đã đo. `.home-indicator` đang `display:none` ở mobile ≤640px; không thể kết luận đó là thủ phạm trên mobile. Desktop vẫn có indicator riêng. | Kiểm tra cả vùng clip của CTA và safe-area; xử lý phần tử thực sự bị cắt. Không xóa indicator theo phỏng đoán. |
| A2 CTA đè nội dung | **Xác nhận** | C2: thanh CTA che lựa chọn mức độ, dòng gợi ý hoặc trường bệnh sử tùy vị trí cuộn; C7: che khung giờ 14:00/15:30. C8: che phần đồng ý gửi. CSS cũ `.phone .form-actions` còn `position:sticky; bottom:-20px; z-index:3`; CSS mới đổi nền/padding nhưng không thay cơ chế bám đáy. Chưa có vùng dự phòng theo chiều cao CTA thực tế và lớp fade. | Một cơ chế CTA dùng chung, bỏ đáy âm, lớp nền mờ và khoảng cuộn đủ theo chiều cao đo được. |
| A3 Chữ thẻ Nơi khám sát mép | **Xác nhận sát mép**, chưa thấy glyph vượt card trong mẫu đã đo | Dòng mô tả C6 chỉ cách đáy khoảng **3,5px**, mép trái nội dung khoảng **1px**. Root cause quan trọng: rule `.form-body :is([data-cf-card],...) {padding:0}` ở `design/components.css:539` có specificity cao hơn rule padding của `.cf-mode-choice` ở dòng 614. Vì choice cũng là card trong form, padding dự kiến bị xóa. Card vẫn `overflow:hidden`. | Giới hạn rule reset ở đúng container; giữ padding riêng của choice thay vì thêm override nối tiếp. |
| A4 Header bị cuộn cắt | **Xác nhận** | `.screen-masthead` nằm trong `#phone-content` thuộc vùng cuộn, computed `position:static`. Tên màn và nút quay lại/chuông được đưa vào header này. Khi cuộn, cả khối biến mất dần. C2/C6/C7/C8 cao khoảng **304px**, chiếm **38% vùng cuộn mobile**; C5 khoảng345px. | Header cố định hoặc thu gọn có chủ ý; thu gọn person context/stepper theo C4. |
| A5 Control native | **Còn tồn tại** | 47 màn hiện có **6 input date, 1 time, 1 file, 1 select và 18 textarea**, nằm trên19 màn. `field()` đưa thẳng `type=date/time/file`; Chủ đề là `select`; textarea còn `resize:vertical`, chưa có counter dùng chung. | Custom presentation cho date/topic/file/time khi áp dụng, giữ semantic input và keyboard access; textarea vẫn là input ngữ nghĩa nhưng bỏ tay kéo, thêm counter. Không đánh đồng textarea với việc phải bỏ HTML input. |
| A6 Khoảng trắng dưới tiêu đề | **Xác nhận** | Khoảng đo từ cuối dòng tiêu đề tới đầu control nội dung: Thông tin cá nhân **53,4px**, Người thân **33,4px**, Cài đặt **49,4px**, Liên hệ nhanh **33,4px**, Gửi yêu cầu **69,4px**, FAQ **49,4px**. `referenceSection` lồng card: header44px + margin-bottom12px + grid-gap12px + inner-padding16px; một số form còn padding/field margin. Nội dung thụt thêm16px so với tiêu đề. Không thấy một `min-height:40px` đơn lẻ gây toàn bộ lỗi. | Chỉ một lớp chịu trách nhiệm gutter và khoảng cách section; bỏ margin/gap và padding lồng trùng. |

Nguồn chính: `prototype/solid-navy-polish.css:108,234,555`; `design/components.css:469,535–547,567,613–616`; `prototype/views.js:45–58,730`; `prototype/careflow-rich-content.js:161–200`. Số dòng trỏ tới working tree hiện tại, chưa commit.

Ảnh đối chiếu: [C2 sau cuộn](C2-390-scroll.png), [C6 sát mép](C6-390-top.png), [C8 đầu trang](C8-390-top.png), [Hồ sơ dư khoảng cách](K2-390-top.png), [Home rỗng](B1-empty-390.png). Các số clip lớn của form Hồ sơ/Hỗ trợ khi form nằm ngoài viewport chỉ là vị trí ngoài màn hình, **không tự động tính thành lỗi cắt**.

## B–G: đã đúng và còn thiếu

| Nhóm | Đã có / đạt phần đã kiểm | Còn phải sửa |
|---|---|---|
| B1 Link section | Link đã bỏ nền, chữ navy, hit-height44px ở các section chuẩn. | Form Gửi yêu cầu vẫn có Xem tất cả; nhiều section dùng nhãn/chevron khác yêu cầu thống nhất. |
| B2–B3 Lựa chọn/chip | Collection chips đang chọn đen/trắng, chưa chọn trắng/viền nhạt. Date có `aria-pressed`. | Choice viền1px thay vì1,5px; CSS `.selected` có thể giữ nền ở lựa chọn cũ khi radio đổi. C3 chọn cảnh báo nhưng lựa chọn Không vẫn xanh; symptom chip không có `aria-pressed` và gõ Đau đầu không cập nhật trạng thái. Symptom/date/slot khác hình dạng. |
| B4–B6 Icon/minh họa/label | Có icon registry và bộ SVG cùng nét. | Quick access khác Contact về khung icon/kích thước. C6 dùng khung200×180, chưa vuông; label Chủ đề không có icon trong khi field khác có. |
| B7–B9 Căn lề/rỗng/danh sách | Có empty appointment với lời gợi ý và nút. | Lề section lệch16px như A6; empty message chỉ là một đoạn, relative/history dùng cấu trúc khác. FAQ không có leading icon, cẩm nang có. |
| B10–B11 Cấp hành động/bóng | Có token text-button và shadow, có mesh xanh lá có ý nghĩa ở aftercare. | Text-button trong app còn nền/viền pill; Home profile có hai lối Xem hồ sơ/Quản lý; nhiều nút xanh cùng độ nổi. Card production reset `box-shadow:none`, nên token shadow chưa được áp đúng lớp. |
| C1–C3 Home và mật độ | Đã có hero, metrics, quick access, contextual care, profile/question, guides/help. | Home có khoảng8 nhóm, fixture có lịch có19 instance gắn card (gồm cả card lồng, không phải19 section). Chuẩn bị/aftercare/support lặp; cẩm nang chỉ3 mục vẫn4 chip và số đếm. Cần rút còn4–5 khối và đổi vai trò/layout, không chỉ giảm margin. |
| C4–C6 Header/art/search | Có stepper4 nhóm và tìm/lọc Lịch hẹn. | Header cao như A4; artwork dùng lại nhiều vai trò. Khi lịch rỗng vẫn có search, dòng 0 lịch hẹn, số0 cả3 tab và hai CTA đặt lịch trong nội dung, cộng FAB. |
| D1–D2 An toàn, **P0** | C4 đã có cảnh báo và đường tới hộp hướng dẫn; chưa mất toàn bộ luồng cảnh báo. | C3 chọn Có hoặc chưa rõ **chưa hiện hướng dẫn/đường gọi ngay**. Hỗ trợ bọc khẩn cấp trong `details` đóng; **0 link `tel:115` hiển thị trực tiếp** tại C3 đã chọn/K5. Không đạt vị trí và độ nổi theo yêu cầu mới. [C3](C3-warning-selected.png), [Hỗ trợ](K5-emergency.png). |
| D3–D4 Bước/ngày | C2 và C3 hiện cùng index2/4; ngày ở facts có weekday. | Step4 còn tên Kiểm tra, dùng chung C7 chọn giờ/C8 xem lại; header hai màn bước2 khác tên. Home date rút gọn, facts có weekday, history/native date khác định dạng. **Chưa chọn thay người dùng phương án4 hay5 bước**; hỏi tại chốt H3 trước khi đổi. |
| D5–D6 Mã/bác sĩ | Trạng thái pending hiển thị là chờ xác nhận. | Fixture CF-1017-0042 khác booking mới CF-0001. `clinician()` fallback bác sĩ mẫu, `details()` hiển thị với mọi visit có status, nên C9 pending có tên bác sĩ chưa được chọn. Khi sửa chỉ chuẩn hóa display, không tùy tiện đổi ID dữ liệu/route. |
| D7–D10 Xem lại/thành công | C8 có ngày/giờ/profile/reason/mode và consent; C9 **đã có tiêu đề**, không cần thêm trùng. | C8 thiếu địa điểm/kết nối và chính sách/thời gian phản hồi được xác nhận. CTA gửi còn icon check. C9 primary chưa full-width, thiếu link Home, FAB còn hiện. C6 hai thông điệp xác nhận hình thức lặp. Không tự bịa chính sách phòng khám khi triển khai. |
| D11–D12 Hồ sơ/nơi khám | Không lộ nguyên số điện thoại; có hồ sơ và người thân. | Ngày sinh có trong model nhưng chưa có trong summary; giới tính cần kiểm tra data, BHYT chưa có dòng trạng thái. D12 trùng nguyên nhân A3. |
| E Chi tiết | Thẻ mã lượt hiện nhãn trái/mã phải, phù hợp một trong hai phương án cho phép; facts đã chia cột. | Lề/đường kẻ cần kiểm cùng role sau A/B; nav label/badge hiện11px dưới chuẩn mới12px. Hint còn khác cấu trúc note/disclosure. Hit44 có nền tảng nhưng chưa kết luận mọi link/biến thể đều đạt ở mọi trạng thái. |
| F Nav | Nút + **56px**, nền đen/viền trắng4px; aria-label đủ, có selected icon và unread badge từ state; có safe-area. | Nền hiện là khối bo góc thường, **chưa có rãnh SVG/mask**, shadow không theo notch. Cả5 nhãn luôn hiện dưới icon11px; yêu cầu mới là chỉ selected label12px bên cạnh icon. Icon thường22px, cần24px. Chưa chụp3 trạng thái của nav mới vì nav mới chưa được triển khai. |
| G Nội dung/trạng thái | Visual runtime dùng SVG phẳng, không cần đưa ảnh stock trở lại; có nền tảng pressed/focus/disabled/loading và empty ở DS. | H6 còn Mẫu chăm sóc sau khám/Nội dung minh họa/Thuốc A. Khi thay cần dùng empty đúng dữ liệu, không bỏ cảnh báo rồi biến mẫu thành dữ liệu thật. Gói rà này chưa kiểm lại mọi tổ hợp empty/loading/error của47 màn: **UNKNOWN**, không ghi PASS toàn bộ. |

## Tương phản đo lại

23 cặp token đạt ngưỡng tương ứng. Cặp chữ chính:

| Chữ / nền | Tỉ lệ |
|---|---:|
| Trắng / primary #0B1220 | 18,723:1 |
| Trắng / primary loading | 14,424:1 |
| Navy / baby blue #CFE2FF | 12,164:1 |
| Navy / blue #B9D4FF | 10,602:1 |
| Navy / mint #CDEFE4 | 12,992:1 |
| Navy / mint #B5E6D3 | 11,592:1 |
| #1F2A44 / baby blue | 10,846:1 |
| Chữ phụ / trắng | 5,348:1 |
| Chữ phụ / nền màn | 5,024:1 |
| Success / nền success | 6,109:1 |
| Warning / nền warning | 6,690:1 |
| Danger / nền danger | 6,023:1 |

Input border/white3,723:1 là kiểm tra thành phần phi văn bản, ngưỡng3:1; không được gọi là chữ thường đạt4,5:1. Token pair pass không thay thế kiểm tra màu thực tế sau compositing, clipping hoặc trạng thái chọn sai.

## Điểm dừng và bước kế tiếp

Đúng H1: **chờ người dùng duyệt báo cáo trước khi sửa code UI**. Sau duyệt mới làm A+F; chụp nav3 trạng thái và kiểm tra rãnh/bóng/safe-area rồi dừng lần nữa. D1–D4 làm ở chốt tiếp theo như thứ tự người dùng chỉ định; D1/D2 vẫn được đánh dấu P0 trong backlog.

Local đang phục vụ tại http://127.0.0.1:4186/prototype/#/home. Khi cần khởi động lại, chạy từ root repo trong PowerShell:

```powershell
$env:PORT='4186'
node prototype/preview-server.cjs
```

Chưa thực hiện H2–H8. Chưa thay đổi UI, nghiệp vụ hoặc quyết định số bước đặt lịch trong đợt rà này.
