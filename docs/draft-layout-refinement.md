# Bản nháp: typography, layout và ảnh thật — 18/10/2026

> Hướng photo-led mới theo ảnh user và kết quả hiện tại: [photo-led-review.md](photo-led-review.md). Tài liệu dưới đây giữ lịch sử đợt trước.

## Cơ sở trước khi sửa UI

Đã đọc lại START-HERE của `Ngh1aa/uiux-ai-workspace`, dùng flow `professional-website-redesign` đã resolve trong `work/cards-v2-manifest.json` và hướng dẫn `asset-media-and-art-direction`. Đây là chỉnh sửa prototype trên `redesign/cards-v2`; main chưa được phép merge trước từ khóa **chốt**.

- [Apple HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography): text styles thống nhất theo vai trò và hỗ trợ chữ lớn. Quyết định: một font Be Vietnam Pro; page title 26, section heading 18, card title 16, body 14, caption 13, control 15 CSS px; tăng theo chế độ chữ lớn hiện có. Không ép mọi cấp heading bằng nhau.
- [Material Design 3 Typography](https://m3.material.io/styles/typography/overview): phân biệt title/body/label. Trang ứng dụng là JavaScript, vì vậy chỉ dùng phân loại vai trò, không nhận là đã đọc toàn bộ guideline chi tiết.
- [NN/g Cards Component](https://www.nngroup.com/articles/cards-component/): card gom một đối tượng, danh sách đồng dạng dùng hàng. Quyết định: lịch hẹn có người khám/thời gian/trạng thái/CTA; hướng dẫn mở rộng tại chỗ; các hàng hồ sơ không thêm card lồng nhau.
- [WCAG 2.1 Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html), [Resize Text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html): kiểm tra 360/390px, chữ lớn và không tràn. Mục tiêu chạm 44 CSS px của prototype là tiêu chí sản phẩm bổ sung, không đồng nhất với chứng nhận toàn bộ WCAG AA.
- [Unsplash Medical](https://unsplash.com/s/photos/medical), [Clinic reception](https://unsplash.com/s/photos/clinic-reception), [Unsplash License](https://unsplash.com/license): ảnh thật lưu local, provenance nằm trong `prototype/assets/images/unsplash/sources.json`. Ảnh stock chỉ minh họa ngữ cảnh và avatar mẫu; không xác nhận danh tính hay cơ sở.

## Thiết kế áp dụng

1. Nút giữa navigation chỉ còn icon +, vòng xám và lõi navy; giữ tên truy cập “Đặt lịch khám”, target 56px, trạng thái focus/pressed.
2. Card nội dung có inset 20px; summary hướng dẫn tự có padding kể cả khi card wrapper không padding. Khoảng icon–chữ 12px, chữ–CTA 16px; không ép chiều cao khiến nội dung bị cắt.
3. Home: lịch kế tiếp nổi bật, tác vụ dạng hàng; dịch vụ dùng ảnh bác sĩ toàn khung bên cạnh nội dung, không đặt chữ lên mặt. Hướng dẫn có thumbnail khác nhau theo mục đích.
4. Đặt lịch: người khám có avatar thật mẫu, chọn hình thức có ảnh phòng khám/online; ngày giờ vẫn ưu tiên chọn slot. Phiếu khám dùng ảnh phòng khám/thiết bị theo hình thức, giảm chiều cao ảnh để đưa bước tiếp theo lên gần đầu trang.
5. Chuẩn bị/online/hỗ trợ có ảnh bối cảnh; cận lâm sàng giữ ảnh đúng loại; sau khám và hồ sơ dùng cấu trúc tài liệu và nhóm thông tin, không tạo các CTA không hoạt động.
6. Màn nguy hiểm, gọi đến, đang khám, xác thực và thanh toán giữ nhiệm vụ chính; không thêm ảnh trang trí làm che cảnh báo hoặc trì hoãn thao tác.
7. Màu phân cấp và trạng thái, hiệu ứng chỉ focus/pressed, card gom một đối tượng, status phải có chữ và hành động tiếp theo. Không cấm tuyệt đối gradient/card/phong cách cụ thể chỉ vì thường gặp ở web AI.

## Kiểm chứng cần chạy sau thay đổi

Kiểm tra nguồn, model, Chromium/WebKit cho navigation/avatar/hướng dẫn/flow bị ảnh hưởng; capture 47 route trên 360/390/1440px; ảnh tải được, typography cùng vai trò, khoảng đệm, không tràn, chữ lớn và CTA ít nhất 44px. Kết quả thực tế cập nhật sau khi chạy, không kế thừa PASS của bản trước.

## Thay đổi đã thực thi

- `design/tokens.css`, `design/components.css`: các vai trò chữ dùng chung, inset card 20px, navigation icon56px/vòng xám3px, profile facts1cột, reflow200%.
- `prototype/solid-navy-polish.css`: thay font-size rời bằng token tại owner hiện có; ảnh bác sĩ + nội dung đặt cạnh nhau; guide thumbnail/text/chevron; phiếu khám giảm ảnh đầu trang từ273/290 xuống200px.
- `prototype/views.js`, `careflow-rich-content.js`, `icons.js`, `app.js`: tái sử dụng renderer/flow hiện có, ảnh thật/avatar mẫu, CTA có icon đúng tác vụ, hướng dẫn mở rộng bằng bàn phím. Không thêm dependency.
- Bổ sung7 ảnh Unsplash vào8 ảnh local có provenance (tính cả lab có sẵn). Ảnh người ở dịch vụ là hình minh họa; không thay avatar minh họa của bác sĩ Trần Thu Hà bằng ảnh nam không đúng danh tính.

## Review 7 dấu hiệu trên ảnh hiện tại

| Dấu hiệu | Kết luận | Vị trí | Vai trò/quyết định |
|---|---|---|---|
| Neon cạnh tranh | không xuất hiện | B1,D1,C6,K2,K5 | Navy ưu tiên CTA, màu ảnh giữ đúng ảnh thật. |
| Dark/glow thiếu lý do | có mục đích rõ | B1 lịch kế tiếp;G3/G4 cuộc gọi | Navy tập trung lịch/call; không thêm glow hay pulse để lấp chỗ trống. |
| Emoji thay icon | không xuất hiện | Navigation;guide;CTA | Bộ SVG hiện có + nhãn tác vụ; icon nav có accessible name. |
| Purple gradient hàng loạt | không xuất hiện | Toàn bộ contact sheets47 màn | Overlay ảnh auth/B1 phục vụ đọc chữ; không cấm gradient tuyệt đối. |
| Card hóa mọi block | có mục đích rõ | D1 lịch;E1 checklist;K2 hồ sơ | Một subject/surface; profile facts thành rows, section không bọc thêm lớp card. |
| Side tabs nhiều màu vô cớ | không xuất hiện | D1 filters;B1 guide filters | Một selected color + nhãn/pressed, không gán màu ngẫu nhiên cho category. |
| Status dots vô nghĩa | có mục đích rõ | B1 thông báo;D1/D2 status;K1 unread | Count/trạng thái lấy model, có chữ; không thêm online/sync giả. |

Review của agent trên ảnh/DOM, không phải nghiên cứu với bệnh nhân hoặc chứng nhận WCAG/native iOS.

## Kiểm tra thực tế và cách mở

- Source syntax và card contract: PASS; shared component owner không có raw color literals. CSS composition cũ vẫn còn literal, xem `card-evidence/draft-refinement/css-source-audit.json`.
- Patient model49 và doctor model3: PASS; contrast34 cặp: PASS.
- Capture mới47 route ×360/390/1440 =141 checks: không page error, overflow, broken image hoặc target dưới44px trong phạm vi probe. Metrics/contact sheets/12ảnh đại diện: `card-evidence/draft-refinement/`.
- Lượt regression92cases ban đầu:91 PASS,1 FAIL do icon làm CTA phiếu khám xuống2dòng. Đã sửa anatomy CTA để cùng role/height với home; giữ assertion hình học.
- Test mới từng gặp lỗi thiết lập: URL journeyF1 là luồng đăng nhập nên không có nav ở phiên sạch; đổi fixture review sang `scenario=appointments`, không thay behavior F1. Với WebKit, test phải cuộn đến ảnh lazy đang hiển thị; ảnh trong filter đóng được kiểm nguồn bytes riêng. Không thay lazy-loading của app để né lỗi test.
- Lượt xác nhận cuối: **26/26 PASS**, Chromium/WebKit, `draft-layout.spec.cjs` + toàn bộ `ui-system.spec.cjs`; có axe, chữ200%, geometry CTA và asset/provenance. Digest tại `card-evidence/draft-refinement/qa-summary.json`. Hai lượt có overlap, không cộng thành tổng test duy nhất.

Link preview có sẵn dữ liệu mẫu: `http://127.0.0.1:4186/prototype/?scenario=appointments#/home`. Link journeyF1 hiện có tiếp tục dùng phiên/luồng của nó; không đổi routing hoặc guards.

Chạy lại từ root repo bằng PowerShell:

```powershell
$env:PORT='4186'
node prototype/preview-server.cjs
```

Không merge main. Không push hoặc deploy trong lần chỉnh nháp này.
