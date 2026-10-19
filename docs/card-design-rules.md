# Card design rules v2

## Hiện hành — áp dụng toàn app, 19/10/2026

Người dùng đã yêu cầu “áp dụng bộ design system đó vô tất cả các màn”. Yêu cầu này cho phép triển khai toàn bộ47 màn bệnh nhân và nền tảng dùng chung của15 route bác sĩ đang hoạt động; không còn dừng ở bước duyệt component/Home. Chỉ sửa presentation, giữ model, dữ liệu, routes, guards và transitions. Nhánh `redesign/cards-v2`; chưa commit/push/merge trong đợt này, chỉ merge khi nhận đúng “chốt”.

- Primary#0B1220, navy#001D57 cho chữ/icon/link; bốn pastel xanh dương/xanh lá. Tất cả CSS đang được hai entrypoint tải lấy màu qua token; CSS archive không tải vẫn là tài liệu lịch sử.
- Cùng role dùng cùng typography; Plus Jakarta Sans tự lưu tại dự án. Card24/16px, inset16–20px, nhịp4/8. Section là nhóm nội dung, không tự thêm shell card quanh từng nhóm.
- Một primary trong nội dung của màn. FAB đặt lịch và modal có phạm vi tương tác riêng. Một renderer navigation,4 destination+booking; badge chỉ theo unread visit update thật trong state.
- Hero/header/lịch hẹn dùng mesh xanh; completed/results dùng mint. Chỉ các vùng nổi bật có mesh. Không thêm ảnh stock vào hồ sơ/bác sĩ có tên; minh họa SVG không được hiểu là kết quả, danh tính hay cơ sở y tế đã xác minh.
- Bốn nhóm stepper dùng chung giữ đủ C1–C9 và các nhánh sàng lọc. Lịch hẹn/tab, facts/QR, support requests, lọc/tìm kiếm, checklist/ghi chú riêng giữ event/model hiện có.
- Confirmed=blue, completed=green, pending=orange, cancelled=danger; luôn có chữ/icon. Loading=primary pha trắng+spinner; disabled=gray+lock; native focus/pressed/selected/error/empty giữ nguyên chức năng.

Nguồn và cách áp dụng: [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) cho phân cấp action và vùng chạm; [Material3 — Navigation bar](https://m3.material.io/components/navigation-bar/overview) cho icon+nhãn+selected state; [NN/g — Cards](https://www.nngroup.com/articles/cards-component/) cho một subject và action rõ mỗi card; [WCAG2.1 SC1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) cho4.5:1 chữ thường/3:1 chữ lớn. Đây là quyết định triển khai web, không tuyên bố là component native iOS/Material hay chứng nhận WCAG.

Nguồn thực tế của dự án và QA: [all-screens/review.md](card-evidence/all-screens/review.md), [audit](card-audit.md), [tokens](../design/tokens.css).

---

Các mục phía dưới là lịch sử của các đợt trước; mốc chờ duyệt và phạm vi cũ đã được yêu cầu mới thay thế.


## Cập nhật đang áp dụng — điều hướng vào app, 19/10/2026

Theo yêu cầu mới, tích hợp thanh điều hướng dùng chung vào prototype; không đợi một lần duyệt DS khác cho phần này. Mọi thay đổi chỉ thuộc presentation: renderer nav, primary token, status tone và mẫu DS; không sửa model/data/clinical guards.

- Next/Continue cùng primary#0B1220. Trên DS, mẫu default/loading/locked có caption nhỏ dưới nút, không có hai pill “Mặc định/Đang tải” giả action. Specimen được phép đặt các mẫu độc lập cạnh nhau, không hạ Next thành secondary chỉ để khớp số primary trong một gallery.
- Booking giữa thanh: circle56px nền primary, dấu+trắng26px, border trắng4px, nhô16px; nhãn “Đặt lịch”. Circle neo vào thanh, không neo vào label để không che chữ khi200%.
- Tab selected dùng glyph filled từ registry hiện có, navy + font700 + blue pill. Idle outline/muted#5B6B8C. Label11px (large text tăng theo setting), mỗi tab hit-area≥44×44 CSSpx. White bar/shadow/safe-area; reserve scroll space để CTA dưới không bị che.
- Badge lịch hẹn chỉ đếm unique visitId có unread D2 notification và visit tồn tại. Mở list không tự read; cơ chế đọc notification hiện có quyết định reset. Accessible description nói “lịch hẹn có cập nhật chưa đọc”, không gọi mọi notification là lịch mới.
- Confirmed=info blue; completed=success green. Copy và state values giữ nguyên; DS có check icon/record icon tương ứng.
- Avatar32px overlap4px, white border2px, chữ nằm trọn; guide “Đánh dấu” đúng U+0110, footer body14/500 tăng legibility. Designer labels chỉ trong DS, không ghép vào product nav.

QA và phạm vi bàn giao: [navigation-integration/review.md](card-evidence/navigation-integration/review.md). Các quy tắc/bằng chứng của những vòng trước ở dưới là lịch sử khi khác với cập nhật này.

## Quy tắc hiện hành — bản sửa xanh dương/xanh lá, 19/10/2026

Yêu cầu mới nhất thay thế palette và nút của bản pastel đầu. Giữ mốc: audit → Design System → **chờ duyệt bước2** → Home → **chờ duyệt Home** → các màn còn lại theo thứ tự người dùng. Không đổi dữ liệu/logic, không merge trước đúng từ **chốt**.

- Primary duy nhất: nền `--cf-primary` =#0B1220, chữ trắng; tối đa1/màn. Loading vẫn là primary, nền trộn90% primary với trắng và spinner; không opacity cả nút làm chữ trắng thành xám. Khóa dùng nền xám/chữ xám/icon khóa riêng, không shadow.
- Navy#001D57 cho tiêu đề, icon, active tab/nav và link. Chữ nhỏ trên pastel dùng navy hoặc#1F2A44. “Xem tất cả” là link+arrow không nền, vẫn có vùng chạm44px và focus rõ.
- Pastel trang trí chỉ#CFE2FF/#B9D4FF/#CDEFE4/#B5E6D3. Hero/header/appointment=2 vệt xanh dương; completed/result=2 vệt xanh lá; một featured card có thể blue→green. Không lavender/peach/pink trong artwork/mesh/badge trang trí. Cam/đỏ chỉ semantic pending/cancel/danger, có text+icon.
- Tối đa1–2 booking entries kể cả+, không nhân bản cùng action trong welcome/quick/gallery. Nav+ dùng nền blue và viền xám, không biến thành primary thứ2; tab Lịch hẹn vẫn chỉ mở danh sách.
- Profile: avatar stack + count liền nhau, disclosure thông tin người đi khám. Question: nút gợi ý → editable draft. Không dùng cùng motif artwork/title/body/pill cho hai nhiệm vụ. Các card khác phân biệt appointment facts, preparation guide, empty state và completed content.
- Illustration: một canvas200×180, nét2.5, nền xanh và giấy trắng có stroke; slot cố định128px/120px beside text và160px empty. Không cố định chiều cao nội dung thẻ, không absolute-position cắt hình. Mọi shape nằm trong viewBox; minh họa không gắn danh tính hay xác nhận trạng thái thật.
- Tiêu đề balanced, không truncate; tab/stepper một dòng. 200% dùng local horizontal scrolling cho tab/stepper để không giảm chữ hoặc cắt nhãn. Những controls khác reflow theo nội dung, lề16/20 và typography/radius giữ nguyên.

Áp dụng trong candidate opt-in tại `design/preview.html` trước; chưa migrate47 màn sản phẩm. Nguồn primary, giới hạn AA/native và preservation contract từ nghiên cứu phía dưới giữ nguyên. Tỉ lệ từng cặp màu hiện hành xem [báo cáo xanh dương/xanh lá](card-evidence/blue-green/review.md).

## Lịch sử — brief pastel đầu và các mốc duyệt

This section supersedes the historical navy-gradient, stock-photo and hidden-nav-caption decisions below for the new candidate. User authority: audit → shared foundations → **stop for Step 2 approval** → Home → **stop for Home approval** → B–G. Stay on `redesign/cards-v2`; do not merge before exact **chốt**. No product flow/model edits during the foundation review.

- Palette exactly follows the user's navy/baby blue/lavender/peach/mint and screen/text/border values in `design/tokens.css`, opt-in `data-cf-theme="pastel"`. No literal color in component CSS/SVG markup. Status surfaces supplement the supplied palette with pale orange/red and contrast-safe foregrounds.
- 60/30/10 is a composition target, not a claimed measured pixel ratio. Maximum one navy card; mesh hero +2–3 purposeful highlights; remaining surfaces white. Use two soft radial spots rather than a directional linear gradient. Color roles: navy=action/type/navigation, pastel=section emphasis, semantic fills=named states.
- Unified text roles and insets; card headings share16px even when semantics require h2 vs h3. Section18, page24, number36, body14, metadata13/status12. Keep all copy selectable, grow height with content, no line-clamping medical/state information.
- Visible nav labels, booking + has a gray ring; appointments tab opens a list. Maximum two booking entries including +. Header title/bell, no duplicate product logo. Shared primitives cannot grant appointment confirmation, live availability, refunds or results release.
- Use consistent flat SVG illustrations/icons for this candidate. User's detailed rule against stock montage/Western doctor stock takes precedence over the general introductory Unsplash request. No inferred ethnicity labels in automated audit; existing photos are flagged for review. Do not insert illustrations into every field or critical warning just to occupy space.
- Empty copy + real next action, no padded00. Status has label/icon, orange pending/mint success/red cancellation. Button roles: primary navy, secondary pastel, danger white with pale red outline/icon. Pressed uses native/ARIA state; loading/locked disabled; error names recovery. No fake delay for synchronous filters.
- Four booking groups are presentation only: profile / disease+safety / mode / review+date-time. Preserve C3/C4/C5 clinical checks and all47 canonical screen IDs. No fake QR, visit ID, fee, clinic promise, rating or medical claim from reference imagery.

### Refreshed primary research and resulting decisions

| Source | Decision applied to the candidate | Verification boundary |
|---|---|---|
| [Factory START-HERE](https://github.com/Ngh1aa/uiux-ai-workspace/blob/main/START-HERE.md), fetched19/10 through GitHub; local AGENTS/CONTRACT + resolved professional-website-redesign flow | Recover existing branch/task contract, audit actual target before edits, stage the change and provide rendered evidence | Factory routing is not user approval |
| [WCAG2.1 contrast minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html), reopened19/10 | Test all candidate body/meta/button/status pairs at least4.5:1; navy text over every pastel mesh extreme, secondary gray on white/light only | Pair calculations and axe do not certify all WCAG |
| [NN/g empty states](https://www.nngroup.com/articles/empty-state-interface-design/), reopened19/10 | Explain missing content and offer a next action; no00 placeholder statistics | Empty/loading/error specimen is isolated; product state binding is a later per-screen step |
| Apple HIG, Material3 cards, NN/g cards and WCAG research linked below from the earlier audit | Keep44 CSSpx web touch goal, grouped task content, adaptive text and visible selected state; avoid cards around every paragraph | Previously read sources reused; no claim these standards prescribe the user's aesthetic tokens |

Current before evidence:47 seeded patient states,161 card/section/form instances,72 tracked prototype files (binary files inventoried, textual files statically scanned). A DOM scan is not a full semantic/visual review of every state; REVIEW items remain explicit in the ledger. Screen-specific scoring and visual checks continue only after each approval gate.

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

Variants: surface để chứa đối tượng; tonal cho tiện ích liên quan; inverse chỉ phiếu khám ưu tiên; row cho danh sách scan nhanh. Card padding không cộng dồn khi card nằm trong card; không dùng shadow cho tất cả. Primary booking nav có icon +, lõi filled navy, vòng xám và accessible name “Đặt lịch khám”; caption ẩn theo yêu cầu cập nhật18/10; current tab nhẹ hơn để không cạnh tranh. Không glow/pulse trang trí.

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
