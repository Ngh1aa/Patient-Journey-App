# Card redesign v2 — review ảnh và trạng thái

> Hướng photo-led mới theo ảnh user và kết quả hiện tại: [photo-led-review.md](photo-led-review.md). Tài liệu dưới đây giữ lịch sử đợt trước.

Review ngày18/10/2026. Đây là kiểm tra của agent trên ảnh render/source; không phải phiên usability test hoặc xác nhận native iOS. Người dùng chưa nhắn “chốt”; không có merge/publication.

## Phạm vi và artifact
- Baseline:62 representative screen states,154 card/section instances. After: cập nhật trong `card-audit.md`; đếm instance, không đồng nhất với component count.
- Patient:47 canonical screens, model guards và12 journey families; runtime renderer `prototype/views.js` + `careflow-rich-content.js`.
- Doctor:15 active route representatives; receptionist/nursing/wave3 source legacy không được bật lại.
- Before/after: `card-evidence/before/`, `card-evidence/after/`; default viewport390 patient/1440 doctor. Ma trận patient360/390/1440 là141captures, report đính kèm riêng. Expanded checklist, guide, zero search, unread, form errors, large text được kiểm trong browser tests.

## 7 dấu hiệu trong tài liệu người dùng

| Dấu hiệu | Kết luận | Vị trí trên giao diện / evidence | Vai trò và quyết định |
|---|---|---|---|
|1. Neon cạnh tranh | không xuất hiện | B1 appointment/nav;D1;E1;doctor dashboard | Navy #001D57 nhận diện và ưu tiên booking; xanh/amber/đỏ chỉ gắn status có nhãn. Màu hồng trong ảnh pipette là ảnh thật, không phải UI accent. |
|2. Dark mode/glow trang trí | có mục đích rõ | B1 next appointment;G4 call stage;patient photo overlay | Surface tối phân biệt đối tượng ưu tiên/cuộc gọi, overlay phục vụ đọc chữ trên ảnh. Glow profile-banner cũ đã loại vì không mang thông tin và tạo scrollWidth dư; không cấm dark mode. |
|3. Emoji dùng làm icon/nav | không xuất hiện | Patient quick access/nav;doctor sidebar/action | Dùng bộ SVG hiện có, có accessible name; biểu tượng trang trí không được dùng thay nhãn tác vụ. |
|4. Purple gradient mọi nơi | không xuất hiện | Shared card surfaces;D1/F1/H7;doctor surfaces | Không dùng purple như default theme. Gradient overlay ảnh còn lại có vai trò tương phản, không coi mọi gradient là lỗi. |
|5. Card cho mọi block/nested card | có mục đích rõ | E1 prep;F1 lab;doctor results/tasks;C1–C7 guidance | Surface cho một subject hoặc tiện ích độc lập; section trong suốt; rows cho danh sách đồng nhất. Dữ liệu facts label/value không bọc thêm card. Direct desktop headers không cộng padding hai lần. |
|6. Multicolored side tabs trên mọi block | không xuất hiện | B1 guide filters;D1 status/mode filters;doctor results/followups/agenda | Các filter hiện tại dùng một màu selected có nhãn + pressed, không phải nhiều side tab màu cạnh tranh. Nếu dùng side tab màu trong tương lai phải giải thích phân loại/ý nghĩa, không cấm phong cách tuyệt đối. |
|7. Status dots không mang nghĩa | có mục đích rõ | B1 notification count;K1 unread text;D2 next step;doctor results/task owners | Unread lấy từ n.read; badge lấy từ UI.status/domain; progress dựa visit history; người phụ trách/bước tiếp lấy từ model. Không thêm “Online/đã đồng bộ” giả. Clinical transitions vẫn kiểm lại ở action handler. |

Không còn mục “cần sửa” từ7 dấu hiệu trên trong các ảnh đại diện đã xem. Đây là phạm vi review ảnh cụ thể, không phải khẳng định mọi pixel/mọi dữ liệu tương lai đều đạt.

## Các lỗi cụ thể đã sửa
| Trước | Root cause | Sau | Kiểm chứng |
|---|---|---|---|
| Ảnh người dùng: title/description/CTA thành cột hẹp | Các vùng ngang tranh width; không có minmax và progressive disclosure | Guide summary: thumbnail + text co giãn + chevron; body mở theo Enter; task card chia rows | card-usability 360/390/1440, screenshots |
| E1 label/value bị chia thành nhiều cột ký tự | Parent facts2cols + mỗi item vẫn có layout label/value ngang | Mỗi item stack label trên value; large text1col | cards-v2 facts width + captureE1 |
| Booking chỉ là dấu cộng nhạt | Không có nhãn hiện, active tab tranh mức nhấn | Theo yêu cầu mới: icon + với vòng xám, filled navy, caption ẩn nhưng giữ accessible name; năm destinations giữ nguyên | cards-v2 nav320/360/390/1440 + offline200% |
| Doctor patient search tràn ở375px; tên dài hẹp | Container padding cộng dồn và flex item nhường width cho badge | Shared padding owner; search min-width0; avatar/name/action grid + status hàng riêng | doctor responsive matrix + touch audit |
| Profile banner scrollWidth dư | Decorative pseudo orb đặt ra ngoài mép | Loại orb không có ý nghĩa; giữ nội dung và action | card inventory after no overflow |
| Calendar ngày chạm hẹp trên phone | Ép7 ngày vào chiều ngang còn lại sau sidebar | Min44px; rail cuộn nội bộ khi cần, native focus tự đưa ngày vào view | doctor schedule test + touch audit |
| CTA chọn người không đổi nhãn theo radio | Caption chỉ tính khi render theo draft đã submit | updatePatientAction cập nhật caption từ selection hiện tại | clinical-layout selection assertion |

## State/interaction coverage
| State | Behavior thật | Evidence owner |
|---|---|---|
| Empty / zero | Zero count là0 thật; empty nói thiếu gì và có reset/destination | card-usability,reference-content,doctor-cards,cards-v2 |
| Loading | aria-busy trên tác vụ pending; không thêm spinner cho filter đồng bộ | ui-system,journeys; shared button state CSS |
| Error | Form error có label/recovery; offline giữ checklist/notes cục bộ | journeys,cards-v2 offline200% |
| Unread | K1 text Chưa đọc/Đã đọc + bulk read; count dựa model | card-usability,journeys |
| Pressed / selected | Native checkbox/radio + aria-pressed filter, focus visible | cards-v2,doctor-cards,clinical-layout |
| Disabled / owner | Completion chỉ cho bác sĩ sở hữu; chưa review không cho bàn giao result | doctor,doctor-cards,ui-system |
| Persistence | Per-visit preparation/notes; logout và fixture reset xóa stores; không tạo requests | cards-v2; app action source |

## Nguồn nội dung và giới hạn
- Checklist/ghi chú là công cụ hành chính do người dùng tự đánh dấu; chưa gửi phòng khám.
- `.ics` chỉ gồm giờ hẹn và mã hành chính, không xuất symptom/patient name/private notes.
- Phí, địa chỉ chưa được cung cấp và yêu cầu chuẩn bị riêng tiếp tục hiển thị UNKNOWN/chờ phòng khám; không tạo dữ liệu lâm sàng để lấp khoảng trống.
- Ảnh lab mới là [Louis Reed / Unsplash](https://unsplash.com/photos/pwcKF7L4-no), file nén trong repo, nguồn/license tại `prototype/assets/images/unsplash/sources.json`. Các ảnh minh họa đã có không được đổi nhãn thành ảnh cơ sở thật.
- HIG pt chuyển thành mục tiêu44 CSS px cho web; chưa kiểm native iOS, VoiceOver/NVDA hoặc người dùng thật. Axe/contrast/manual screenshot checks không phải chứng nhận WCAG toàn diện.
- Legacy composition CSS còn literals; source audit liệt kê theo file. Shared card component không còn raw color literals, tokens là owner mới. Không tuyên bố đã xóa mọi legacy CSS.

## Factory và release
Đã đọc START-HERE → AGENTS → CONTRACT-OWNERSHIP; compile external manifest `work/cards-v2-manifest.json` theo flow professional-website-redesign, authority branch_write. Routed research/design/implementation/QA resources được dùng cho source-first inventory, component ownership, thực thi và kiểm tra ảnh. Tài liệu và manifest không tự cấp gate PASS hoặc phê duyệt thẩm mỹ; human validation UNKNOWN.

Nhánh `redesign/cards-v2`; commit nhóm research → shared design → patient → doctor → responsive/state fixes → evidence. Không commit main, không merge, không force push, không xóa nhánh. Chỉ merge sau đúng từ **chốt** của người dùng; không dùng README/skill để vượt điều kiện này.
