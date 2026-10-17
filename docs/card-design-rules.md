# CareFlow+ — Quy tắc thiết kế card v2

> **Loại bằng chứng:** desk research từ Apple HIG, Material Design 3, Nielsen Norman Group và WCAG 2.1; chưa phải usability test với người bệnh. Cập nhật 17/10/2026. Quy tắc áp dụng cho prototype web mô phỏng mobile và desktop, **không** khẳng định native iOS.
>
> **Thứ tự thiết kế:** Quy tắc trong tài liệu → audit toàn bộ màn → design tokens → component contract → chuyển đổi từng nhóm màn → QA. Không dùng luật này làm lý do bỏ cảnh báo nguy hiểm hay thay đổi luồng y tế.

| ID | Quy tắc và bằng chứng | Áp dụng cụ thể cho CareFlow+ | Nguồn |
|---|---|---|---|
| R01 | Card là nhóm thông tin ngắn, liên quan **một đối tượng/nhiệm vụ**; không nhồi nhiều ý rời rạc. | Một card lịch hẹn = người đi khám, bác sĩ, ngày giờ, trạng thái, hành động kế tiếp. Không làm card chỉ có icon và lời khuyên chung. | [NN/g — Cards: UI-Component Definition](https://www.nngroup.com/articles/cards-component/) |
| R02 | Card đưa thông tin tóm tắt rồi đến trang chi tiết; lựa chọn loại card theo cách người dùng đọc dữ liệu. | Bảng lịch/xét nghiệm/thuốc dùng hàng 72–88px để dễ quét; hero chỉ cho ưu tiên quan trọng nhất; không ép mọi nhóm thành ô vuông. | [NN/g — Cards](https://www.nngroup.com/articles/cards-component/), [Apple — Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) |
| R03 | Các card có thể filled, outlined, elevated; elevation/border giúp nhận biết ranh giới. | Dùng một set variant: hero navy, surface white outlined, secondary tinted, list row, compact banner. Chỉ dùng shadow nhẹ khi cần phân tầng. | [Material Design 3 — Cards](https://m3.material.io/components/cards/overview), [Android official Material Card guidance](https://developer.android.com/develop/ui/compose/components/card) |
| R04 | Hành động quan trọng nhất phải nổi bật; custom button có trạng thái nhấn. | Mỗi card tối đa một primary. Secondary cho điều chỉnh; tertiary có chevron + hit-area đầy đủ; hủy/đăng xuất có phân biệt, hủy phải xác nhận theo flow gốc. | [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) |
| R05 | Vùng chạm đủ rộng; Apple khuyến nghị ít nhất 44×44 pt. WCAG 2.1 SC 2.5.5 đề xuất 44×44 CSS px tại **AAA**, không phải AA. | Prototype web đặt target `min-inline-size`/`min-block-size:44px`; test hit-area mobile; desktop giữ cùng kích thước tối thiểu cho thao tác chính. | [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [WCAG 2.1 — Target Size (AAA)](https://www.w3.org/WAI/WCAG21/Understanding/target-size) |
| R06 | Text thường tối thiểu 4.5:1 và text lớn tối thiểu 3:1 với nền (WCAG 2.1 AA). | Navy/text-on-brand là cặp token; body/muted được đo trên white/tint; không dựa opacity ngẫu nhiên. Token nhạt được dùng cho border/decor chứ không cho chữ nhỏ. | [WCAG 2.1 — Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) |
| R07 | Không được dùng màu đơn độc để truyền tải trạng thái. | 'Đang chờ', 'Hoàn tất', 'Cần xem', 'Lỗi tải dữ liệu' luôn có nhãn + tín hiệu (biểu tượng/hình dạng) bên cạnh màu có nghĩa. | [WCAG 2.1 — Use of Color](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color) |
| R08 | List có phân cấp; disclosure để đi sâu nội dung, info action không thay navigation. | Chevron chỉ trên hàng có route thật; một CTA `Xem tất cả` cùng hàng tiêu đề khi có dữ liệu vượt preview; không để chevron trang trí. | [Apple HIG — Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) |
| R09 | Card chỉ nên có nội dung kết nối với mục tiêu; mật độ tốt nhưng không lặp CTA. | Section header + container duy nhất, bên trong 1–n subcard/row; Home ưu tiên lịch kế tiếp → việc cần làm → lối tắt → chăm sóc; desktop ưu tiên lượt cần xử lý. | [NN/g — Cards](https://www.nngroup.com/articles/cards-component/), [Android Material Card guidance](https://developer.android.com/develop/ui/compose/components/card) |
| R10 | Cần hiển thị loading/error/empty bằng nội dung hướng dẫn và đường phục hồi; tính nhất quán của component giữ nghĩa. | Contract cho data/empty/loading/error/zero/unread/pressed. Prototype hiện đồng bộ dữ liệu mô phỏng tại client: skeleton/error chỉ render khi trạng thái thật được kích hoạt/QA scenario, không giả vờ có backend. | [WCAG 2.1 — Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages), [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) |
| R11 | Resize/reflow không được mất thông tin hay hành động. | Card title tối đa 2 dòng **ở chế độ chữ thường**; ở large-text cho phép bung chiều cao và bọc dòng để không làm mất nội dung y tế, không ép ellipsis trên cảnh báo/đơn thuốc. | [WCAG 2.1 — Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow), [WCAG 2.1 — Resize Text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text) |
| R12 | Chức năng card phải hiện diện qua semantic HTML, trạng thái bàn phím/focus dễ nhận biết. | Buttons thật, links thật, semantic heading và section, focus-visible; keyboard route test; desktop không biến card thành clickable `div`. | [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [WCAG 2.1 — Name Role Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value) |

## Quyết định thiết kế mang tính sản phẩm, **không phải số do các nguồn trên bắt buộc**

- **Kiểu chữ duy nhất:** `Be Vietnam Pro` cho cả heading + body mobile/desktop (hai vai trò typography trên cùng một font family, font-weight khác nhau). Desktop hiện dùng Plus Jakarta Sans, cần migration có kiểm thử screenshot.
- **Scale:** section heading 17/24 semibold; card heading 16/23 semibold; body 14/22 regular; supporting 12/18 medium; prominent metric 30/36 bold. Large text override ưu tiên đọc được hơn line-clamp.
- **Spacing:** 4/8/12/16/20/24/32; screen horizontal 20 mobile, 24 desktop grid gap; padding 16/20; card radius 22, inner radius 14. Đây là lựa chọn thống nhất CareFlow, không phải quy định Apple/Google.
- **Màu:** primary `#001D57`, white `#FFFFFF`, page `#EEF3F9`, tint `#EDF4FC`; text primary `#0D2344`, text secondary `#405875`; sắc thái success/warning/danger chỉ dùng khi nghĩa của trạng thái đúng.
- **Format:** `T5, 17/10 · 09:30` cho ngày giờ; `3` thay vì `03` cho số lượng.
- **Section contract:** một heading row bên ngoài, một container bọc toàn nhóm bên trong. Riêng cảnh báo cấp cứu/permission/error, cấu trúc có thể đặc thù vì an toàn nhưng vẫn có vùng container rõ ràng.
- **Mật độ:** tránh hai card giống nhau/CTA lặp. Dữ liệu đồng loại dùng list row 72–88px; card chỉ giữ summary và next action. Empty tab Đã hủy: “Bạn chưa hủy lịch nào” + `Xem lịch sắp tới` **secondary**; không đẩy hành động đặt lịch như primary ở mọi empty state.

## Thành phần và states phải có

| Component | Dữ liệu thật (trong demo) | Empty/Zero | Loading | Error/retry | Unread | Pressed |
|---|---|---|---|---|---|---|
| AppointmentCard | người, bác sĩ, giờ, hình thức, trạng thái, next action | hướng dẫn tùy tab | skeleton | một retry khi load được kích hoạt | status label | CSS active |
| MetricStrip | 3 KPI có timeframe, nguồn | số 0 + giải thích, màu dịu | skeleton | retry | dot khi >0 | CSS active |
| QuickAction | nhãn cụ thể, số khi có | CTA tùy context, không diễn giả | skeleton | retry | badge >0 | CSS active |
| Result/PrescriptionList | trạng thái, thời gian, item | hướng dẫn xem sau khám | skeleton | retry | 'Mới' khi unread thật | CSS active |
| DoctorWorkQueue | ca, người chịu trách nhiệm, SLA/giờ, next action | danh sách trống đúng nhánh | skeleton | retry | chưa đọc/chưa xem | CSS active |

**Ranh giới:** dữ liệu bệnh nhân, thuốc, kết quả và thao tác lâm sàng vẫn là dữ liệu mô phỏng. Không tự tạo trạng thái y tế thật hoặc thêm nghiệp vụ ngoài flow. “Tất cả 7 states” nghĩa là **component contract hỗ trợ** trạng thái tương ứng, không phải màn hình nào cũng hiển thị skeleton/error dù không có server.

## Nguồn thiết kế đã đọc

- Apple Developer, *Buttons*; *Lists and tables*.
- Google, *Material Design 3 Cards* / official Android *Card*.
- Nielsen Norman Group, *Cards: UI-Component Definition*.
- W3C WCAG 2.1, SC 1.4.1, 1.4.3, 1.4.10, 1.4.4, 2.5.5 (AAA), 4.1.3.

**Trạng thái:** RESEARCH_COMPLETE (desk evidence đã đọc trực tiếp từ Apple HIG Lists and tables/Buttons, Material Design 3 Cards, NN/g Cards và W3C WCAG 2.1 Contrast/Reflow). Visual/user research & WCAG full conformance: NOT_VERIFIED.
