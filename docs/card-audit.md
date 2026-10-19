# Card audit v2

## Hiện hành — rollout toàn bộ màn, 19/10/2026

Đã bật bộ dùng chung ở cả patient/staff theo yêu cầu mới. Kiểm kê canonical47 screen IDs,15 staff routes, không cắt nhánh an toàn để khớp stepper4 nhóm. [Bảng trước/sau từng card theo screen/card/type/issues/priority](card-evidence/all-screens/card-before-after.md) nối với [before](card-evidence/all-screens-before/inventory.json), [after](card-evidence/all-screens-after/inventory.json) và [desktop](card-evidence/all-screens/inventory.json). DOM instances không được gọi là số component.

Nhóm đã xử lý: A1–A3 auth; B1 Home; C1–C9 booking; D1–D4 appointment/ticket; E1–E3 arrival; F1–F4 labs; G1–G5 online; H1–H7 completion/payment/results; I1–I5 aftercare; J1 follow-up; K1–K5 notifications/profile/history/settings/support. Desktop dùng cùng type/color/button/status/card primitives, giữ các hàng công việc và cột khám bệnh.

Home bỏ các booking entry lặp, bỏ metric00, đưa lịch tiếp theo lên trước, đổi profile/question sang hai anatomy riêng, dùng guide disclosure và artwork có slot. Các bảng kết quả kỹ thuật, contrast và giới hạn xem [review hiện tại](card-evidence/all-screens/review.md).

---

Các mục phía dưới là lịch sử của các đợt trước; mốc chờ duyệt và phạm vi cũ đã được yêu cầu mới thay thế.


## Đợt hiện tại — tích hợp navigation và sửa component, 19/10/2026

Đã tích hợp navbar dùng chung vào app theo yêu cầu mới. Bảng47màn/161vùng bên dưới vẫn là baseline card layout; đợt này không tuyên bố đã thay hết card/Home. Các sửa đúng owner: primary Next/Continue, selected-state chips, avatar overlap, labelled button examples, confirmed/completed tone và navigation. Huy hiệu dùng notification state hiện có, không thêm fake count.

| Vị trí | Lỗi trước | Sửa / evidence |
|---|---|---|
| DS stepper và samples | Next secondary blue, Continue primary black | Cùng primary; mẫu độc lập không đánh đổi semantic hierarchy để khớp gallery count |
| DS profile | Avatar28px overlap8px che chữ |32px/overlap4px/border2px; inner text bounds không chạm avatar sau |
| DS button examples | Hai pills state như action | Static figcaptions dưới default/loading/locked; loading có spinner |
| DS empty/loading/error/ready filter | Selected chỉ đậm hơn | Selected black/white, idle white/gray outline, ARIA pressed |
| Shared status | Confirmed/completed đều green | Confirmed blue/info, completed green/success; model values không đổi |
| App bottom nav | Caption ẩn, nút+navy/gray ring, chỉ outline icons | Component shared; black raised+white border, labels, selected filled/navy/blue, idle muted; unread updates count |
| DS guide footer | Source đã đúng Đ, nhỏ nên khó đọc | Unicode U+0110 giữ nguyên; body14/500. Designer labels giữ riêng DS |

Report và captures: [navigation-integration/review.md](card-evidence/navigation-integration/review.md). App render scope vẫn giữ47screen IDs và toàn bộ guards; không ghép tiêu đề “Thanh điều hướng” vào màn thật. Model/visit data không có diff.

## Audit hiện hành — sửa6 lỗi và giới hạn màu, 19/10/2026

Đã rà lại47 patient states và161 card/section/form theo tiêu chí mới **trước khi sửa component**: [từng dòng kiểm kê](card-evidence/blue-green-before/audit.md), [checks/typography JSON](card-evidence/blue-green-before/inventory.json), [72 file nguồn](card-evidence/blue-green-before/source-inventory.json). Mỗi dòng có vị trí/selector, type, lỗi cụ thể và ưu tiên; các kiểm tra trạng thái/copy/visual chưa đủ bằng chứng vẫn ghi REVIEW. Không gọi đây là full WCAG audit.

Kết quả mới chính xác hơn: B1 có**4 lối vào booking trong nội dung**, cộng+ thành5; B1/H6 có2 primary controls theo data contract.30 vùng card/group chứa primary nền navy thay vì màu mới;34 vùng chứa stock image.75 linear gradients cần review vị trí/vai trò. Chỉ**1 vùng metric ở B1** chứa số00 riêng lẻ; đã bỏ false positives của phút `:00`. Chuyển hồ sơ trong flow booking không tính nhầm thành lối bắt đầu booking mới. Các con số group có thể chồng lặp, không phải số defect độc lập.

### Sáu lỗi trên Design System trước sửa

| Yêu cầu / vị trí | Trước / lỗi và nguyên nhân | Sau trong bộ component | Ưu tiên |
|---|---|---|---|
|1. Xem tất cả, cạnh Thông tin của bạn | FAIL: sectionHeader dùng actionButton nên sinh pill nền blue như CTA | Link thật tới route K2, navy+arrow, không nền, focus/target44 |P1|
|2. Hồ sơ đã lưu / Hỏi phòng khám, cặp bento frame1 | FAIL: cùng illustration/title/body/pill; số2 thành metric đứng riêng | Avatar stack+count+disclosure; thẻ hỏi có suggestions mở ô soạn riêng, không share cùng anatomy |P1|
|3. Calendar empty state frame3 và artwork frame1 | FAIL về nhận diện: giấy trắng không stroke trên card trắng nên mất mảng; ảnh nhỏ96px bị cảm giác cắt | Vẽ lại cùng canvas/nét/palette, outline giấy, backplate blue; slot cố định và empty160px |P1|
|4. Nhãn lịch, mã phiếu, body gradient | Pair cũ có kiểm nhưng palette thay đổi nên cần đo lại, không suy ra PASS từ lần trước |20 cặp ghi số cụ thể; text on pastel navy/ink, min5.024:1 toàn tập, min9.454:1 cho các cặp text/pastel |P1|
|5. Chưa thể tiếp tục / Đang gửi yêu cầu, frame2 | FAIL: selector disabled phủ cùng nền xám cả busy | Khóa xám+icon khóa, busy primary mờ+white+spinner; chỉ render một biến thể primary tại một thời điểm |P1|
|6. Booking lặp / primary budget | B1 có4 entries trong content; DS frame2 có nhiều ví dụ primary cùng lúc | DS tối đa1 primary/khung; frame1 không có booking CTA, frame2 chỉ+, frame3 empty chỉ1 entry. Sản phẩm còn OPEN trước Home approval |P1|

### Checklist mục4 và phạm vi sau sửa

Header/chuông và xanh dương mesh: candidate PASS; nav có label và+khác list: PASS; section link: PASS cho collection, omit khi chỉ1 nhóm; bento có profile/question/facts/guide/state khác vai trò: PASS trong specimen; số00: không render trên candidate; artwork không stock/cắt: kiểm geometry và ảnh thực; normal type/tab/stepper/insets và states: kiểm Chromium/WebKit. Toàn bộ47 màn sản phẩm tiếp tục **OPEN**, không coi DS là đã hoàn thành Home hoặc các màn còn lại.

Evidence before: [Design System cũ](card-evidence/blue-green-before/design-system.png). Evidence after, test và20pair ratios: [review mới](card-evidence/blue-green/review.md). Các audit và số liệu bên dưới là lịch sử của các brief trước.

## Lịch sử — pastel foundation gate đầu, 19/10/2026

The latest user brief replaces the heavy navy/photo draft with white + pastel mesh + navy accents. **Step1 inventory recorded before Step2 CSS edits.** Current gate: shared foundation candidate; Home and B–G await approval. This section does not mark the old product UI as migrated.

- [Every screen and card/section/form row](card-evidence/pastel-foundation-before/audit.md):47 canonical patient states /161 rendered instances. Each row has screen, position/card selector, type, specific DOM findings and priority; unresolved visual/copy/contrast/state reviews are named, not marked PASS.
- [Machine-readable checks and actual typography](card-evidence/pastel-foundation-before/inventory.json), [all72 tracked prototype files with kind/hash/scan scope](card-evidence/pastel-foundation-before/source-inventory.json).
- Global issues: B1 has3 detected booking entries in content before counting +;34 card/group instances include stock images across22 screens;75 linear-gradient instances need composition review, not automatic deletion;4 nested/group instances contain00. These are findings per DOM instance and may overlap; they are not counts of independent defects.
- Navigation captions are explicitly `hidden` in the current app.js. Nav is visible in34 canonical states; all applicable screens need visible captions when migrated. Non-nav booking/safety/call screens retain their flow-specific controls.
- Reference1: large opaque navy photo captions need lighter grouping and less repetition. Reference2: four shortcuts + promotional booking repeat the same task; portrait stock conflicts with the new image rule. Reference3:00 metrics, orbit collage, empty appointment and extra booking CTA lack clear prioritization. These observations are from the supplied crops, not newly captured production evidence.

### Checklist coverage before migration

| Rule group from user §3 | Before finding / review status | Owning component or screen |
|---|---|---|
| Header/bell, remove repeated logo | Current header/content composition differs across routes; REVIEW individual identity/back/error contexts | app.js + views.js; candidate header ready for review |
| Nav labels, + vs appointment list | FAIL where nav appears: captions hidden; preserve distinct routes | shared navigation candidate; app integration pending |
| Section title + Xem tất cả | REVIEW each collection vs single item; do not add a meaningless link to forms/status notices | sectionHeader; B1 first |
| Mixed bento roles | Current B1 has metric/network/media/CTA but stock and repeated booking compete; REVIEW content grouping, not force bento onto safety/call forms | each screen composition |
| Max1–2 booking entries | FAIL B1 (3 content entries +nav); route buttons inside booking itself are progression, not duplicate booking entries | B1 |
| Empty state, no00 | FAIL B1 nested/group counts include00; every empty fixture and filtered-zero state reviewed during migration | empty/metric/card |
| Imagery and palette |22 screens contain stock imagery; REVIEW replacement with coherent illustration; don't infer actual clinician identity | illustrations/media |
| Wrap, typography, no(demo), natural Vietnamese | Type sizes recorded per card in JSON; unrendered long/large/expanded states REVIEW, not blanket PASS | type tokens + composition |
| Default/pressed/disabled/error/loading/empty | Foundation specimen testable; actual flow state bindings REVIEW until corresponding screen | shared components + existing state model |

### After Step2 (component candidate only)

`design/preview.html` uses the existing tokens/components/ui owners, with opt-in pastel scope and an isolated interaction harness. Existing prototype/staff screens are not opted in. Candidate states/contrast/responsive evidence and seven-sign review are recorded in [photo-led-review.md](photo-led-review.md). Home screen audit remains **OPEN — user review required**.

## Historical audit evidence (prior navy iterations)

Baseline 2026-10-18T09:05:12.233Z; 62 representative screens, 154 rendered card/section instances.

47 canonical patient +15 desktop doctor routes. Reception/nursing/wave3 legacy không load trong doctor-only index: kiểm kê tĩnh, không phục hồi vai trò. Canonical fixture là default evidence; expanded/error/filter states kiểm riêng.

## Trước thay đổi (ghi trước UI)

| Screen | Card / selector | Type | Issues / decision | Priority |
|---|---|---|---|---|
| patient A1 | Không có card; giữ màn tập trung | focused | Không thêm card lấp chỗ trống | KEEP |
| patient A2 | Không có card; giữ màn tập trung | focused | Không thêm card lấp chỗ trống | KEEP |
| patient A3 | Không có card; giữ màn tập trung | focused | Không thêm card lấp chỗ trống | KEEP |
| patient B1 | 19 / `visit-card cf-home-appointment-summary` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Tổng quan chăm sóc / `ref-overview` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Truy cập nhanh / `cf-home-quick` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Chăm sóc phù hợp với bạn / `ref-discover` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Việc cần làm / `rich-section cf-home-task-section` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Chuẩn bị cho buổi khám / `cf-home-task-card` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Xem lịch hẹn / `cf-home-task-card` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Chăm sóc sau khám / `rich-section cf-home-care-section` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Chưa có thông tin sau khám / `cf-home-care-card` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Cẩm nang đi khám / `rich-section cf-home-tips-section` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Chuẩn bị trước khi khámGiấy tờ, đơn thuốc và kết quả cũ / `cf-home-tip-card` | disclosure | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Vào phòng khám onlineKết nối, camera và không gian riêng tư / `cf-home-tip-card` | disclosure | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Tìm lại thông tin sau khámKết quả, lời dặn và câu hỏi cho phòng khám / `cf-home-tip-card` | disclosure | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient B1 | Cần giúp? / `rich-section cf-home-help-section` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient C1 | Nguyễn Minh Anh / `choice patient-choice rich-patient-choice selected` | choice | Giữ native selection; thống nhất min-width, target và selected surface. | P2 |
| patient C1 | Trần Thị Mai / `choice patient-choice rich-patient-choice ` | choice | Giữ native selection; thống nhất min-width, target và selected surface. | P2 |
| patient C2 | Không có card; giữ màn tập trung | focused | Không thêm card lấp chỗ trống | KEEP |
| patient C3 | Không, tiếp tục đặt lịch / `choice selected ` | choice | Giữ native selection; thống nhất min-width, target và selected surface. | P2 |
| patient C3 | Có hoặc chưa rõ / `choice  ` | choice | Giữ native selection; thống nhất min-width, target và selected surface. | P2 |
| patient C4 | Phòng khám cần đánh giá tình trạng và hình thức khám phù hợp cho bạn. / `note danger` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient C5 | Yêu cầu của bạn chưa phải lịch khám đã được xác nhận. / `note warning` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient C6 | Tại phòng khám / `choice selected ` | choice | Giữ native selection; thống nhất min-width, target và selected surface. | P2 |
| patient C6 | Khám online / `choice  ` | choice | Giữ native selection; thống nhất min-width, target và selected surface. | P2 |
| patient C6 | Phòng khám sẽ kiểm tra hình thức phù hợp trước khi xác nhận. / `note info` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient C7 | Không có card; giữ màn tập trung | focused | Không thêm card lấp chỗ trống | KEEP |
| patient C8 | Người đi khámNguyễn Minh AnhNgày khámThứ Hai, 19/10/2026Giờ khám09:00Hình thứcTại phòng khámLý  / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient C9 | CF-0001 / `card ticket` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D1 | BS. Trần Thu Hà / `rich-appt-card state-success cf-appt-featured` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Đang chờ bạn / `card next-step` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | CF-1017-0042 / `card ticket` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Bệnh viện Nhân dân 115 / `facility-card` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Phòng khám sẽ thông báo trước khi thu phí / `note info` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient D2 | Thông tin liên quan / `section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Xét nghiệm, chụp chiếu / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Phí khám và biên lai / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Kết luận và đơn thuốc / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Kết quả và việc tiếp theo / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Trao đổi sau khám / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Các bước của lượt khám / `section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Tiến trình lượt khám / `rich-section rich-detailed-progress` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Cần chuẩn bị / `rich-section rich-prepare` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Thông tin đã khai / `rich-section rich-declared` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D2 | Chỉ định liên quan / `rich-section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D3 | Bác sĩBS. Trần Thu Hà · Nội tổng quátNgười đi khámNguyễn Minh AnhNgày khámThứ Hai, 19/10/2026Gi / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient D4 | Tôi bận vào thời gian này / `choice selected ` | choice | Giữ native selection; thống nhất min-width, target và selected surface. | P2 |
| patient D4 | Tôi muốn chọn ngày khác / `choice  ` | choice | Giữ native selection; thống nhất min-width, target và selected surface. | P2 |
| patient D4 | Lý do khác / `choice  ` | choice | Giữ native selection; thống nhất min-width, target và selected surface. | P2 |
| patient D4 | Nếu có khoản phí đã thu, phòng khám sẽ kiểm tra chính sách áp dụng. / `note info` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient E1 | Giờ hẹn08:00 · Thứ Hai, 19/10/2026Giờ nên có mặtChưa có hướng dẫn thời gian đến riêngGiấy tờ cầ / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient E1 | Bạn có thể hỏi phòng khám nếu chưa nhận được hướng dẫn. / `note info` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient E2 | Bác sĩBS. Trần Thu Hà · Nội tổng quátNgười đi khámNguyễn Minh AnhNgày khámThứ Hai, 19/10/2026Gi / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient E2 | Sau khi báo đã đến, bạn hãy chờ lễ tân hướng dẫn. / `note info` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient E3 | Bạn đã đến / `card center` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient E3 | Số thứ tự / `section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient E3 | Bạn hãy ở khu vực chờ để nghe hướng dẫn. Thời gian chờ có thể thay đổi. / `note info` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient E3 | Các bước của lượt khám / `section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient F1 | Xét nghiệm theo chỉ định / `cf-lab-card` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient F2 | Xét nghiệm theo chỉ định / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient F2 | Hướng dẫn chuẩn bị / `section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient F2 | Quay lại lượt khám hiện tại / `choice selected ` | choice | Giữ native selection; thống nhất min-width, target và selected surface. | P2 |
| patient F2 | Để bác sĩ xem trong buổi khám / `choice  ` | choice | Giữ native selection; thống nhất min-width, target và selected surface. | P2 |
| patient F3 | Không có card; giữ màn tập trung | focused | Không thêm card lấp chỗ trống | KEEP |
| patient F4 | Không có card; giữ màn tập trung | focused | Không thêm card lấp chỗ trống | KEEP |
| patient G1 | Chưa kiểm tra / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient G1 | Chọn nơi riêng tư, yên tĩnh. Chỉ bật camera và micro khi bạn đồng ý. / `note info` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient G1 | Bạn có thể vào phòng chờ khi phòng khám mở lượt khám. Hãy xem cập nhật trong phiếu khám. / `note info` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient G2 | Chờ bác sĩ gọi / `card center` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient G3 | Không có card; giữ màn tập trung | focused | Không thêm card lấp chỗ trống | KEEP |
| patient G4 | Không có card; giữ màn tập trung | focused | Không thêm card lấp chỗ trống | KEEP |
| patient G5 | Đang chờ phòng khám liên hệ lại / `note info` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient G5 | Phòng khám sẽ sắp xếp gọi lại. Bạn cũng có thể chọn lịch phù hợp hơn. / `note warning` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient H1 | Hoàn tất buổi khámNguyễn Minh Anh · Thứ Hai, 19/10/2026 / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H1 | Bác sĩ đã ký và hoàn tất hồ sơ buổi khám / `note info` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient H1 | Kết luận và đơn thuốc / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H1 | Xét nghiệm sau khám / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H1 | Hỏi phòng khám / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H1 | Đặt lịch tái khám / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H2 | Phòng khám sẽ thông báo / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H2 | Số tiền và thông tin nhận tiền sẽ do phòng khám cung cấp. / `note info` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient H3 | Không có card; giữ màn tập trung | focused | Không thêm card lấp chỗ trống | KEEP |
| patient H4 | Chưa có mã thanh toán / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H4 | Phòng khám chưa cung cấp tài khoản và số tiền. Bạn đừng chuyển tiền khi chưa kiểm tra đủ thông  / `note warning` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient H5 | Biên lai / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H6 | Kết luận buổi khám / `section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H6 | Chưa có tài liệu được phòng khám chia sẻ. / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H6 | Đơn thuốc / `section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H6 | Hướng dẫn chăm sóc / `section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H6 | Mẫu chăm sóc sau khám / `rich-section rich-aftercare-sample` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient H7 | Thông báo kết quảĐã gửi thông báoGiải thích kết quảChưa ghi nhận đã giải thích / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient I1 | Lượt đã khám / `section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient I1 | Nguyễn Minh Anh / `choice selected ` | choice | Giữ native selection; thống nhất min-width, target và selected surface. | P2 |
| patient I1 | Phản hồi về đơn thuốc / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient I1 | Hỏi lại, dùng thuốc / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient I1 | Triệu chứng mới, chưa cải thiện / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient I1 | Theo dõi triệu chứng / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient I1 | Chuyển chuyên khoa / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient I1 | Tin nhắn với phòng khám / `row` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient I2 | Tin nhắn không thay thế kênh cấp cứu. Không chờ phản hồi nếu cần trợ giúp khẩn cấp. / `note warning` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient I3 | Theo dõi triệu chứng / `section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient I4 | Phòng khám đang sắp xếp hướng dẫn chuyển chuyên khoa. / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient I5 | Không có card; giữ màn tập trung | focused | Không thêm card lấp chỗ trống | KEEP |
| patient J1 | Bác sĩBS. Trần Thu Hà · Nội tổng quátNgười đi khámNguyễn Minh AnhNgày khámThứ Hai, 19/10/2026Gi / `card ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient J1 | Ngày gợi ý từ phòng khám / `section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient K1 | Có cập nhật về lượt khám / `notification row ` | action | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient K1 | Nội dung sức khỏe không xuất hiện trong bản xem trước. / `note info` | notice | Giữ context; kiểm contrast và recovery; không thêm CTA giả. | P2 |
| patient K2 | Thông tin cá nhân / `cf-reference-section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient K2 | Người thân / `cf-reference-section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient K2 | Cài đặt / `cf-reference-section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient K3 | BS. Trần Thu Hà / `rich-appt-card state-success` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient K4 | Quyền riêng tư / `section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient K5 | Liên hệ nhanh / `cf-reference-section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient K5 | Gửi yêu cầu / `cf-reference-section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient K5 | Câu hỏi thường gặp / `cf-reference-section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| patient K5 | Tin nhắn gần đây / `cf-reference-section ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | Buổi khám đang thực hiện / `doctor-surface doctor-now` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | Yêu cầu trước khám / `doctor-surface doctor-decision-card` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | Kết quả cận lâm sàng / `doctor-surface doctor-labs-today` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | Công thức máu / `doctor-result-item` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | Tổng phân tích nước tiểu / `doctor-result-item` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | Lịch khám trong ngày / `doctor-surface doctor-today` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | 08:45 / `doctor-agenda-row` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | 09:00 / `doctor-agenda-row` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | 09:30 / `doctor-agenda-row` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | 10:30 / `doctor-agenda-row` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | 11:45 / `doctor-agenda-row` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | 14:00 / `doctor-agenda-row` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | 14:30 / `doctor-agenda-row` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | Kết nối buổi khám / `doctor-surface doctor-online-card` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | Công việc theo hồ sơ / `doctor-surface doctor-aftercare-card` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | Rà soát kết quả cận lâm sàng / `doctor-task-item ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor | Theo dõi sau tái khám / `doctor-task-item ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor/schedule | 12 — 18 tháng 10, 2026 / `doctor-surface doctor-schedule-main` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor/schedule | BS. Nguyễn Văn An / `doctor-surface doctor-schedule-summary` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor/schedule | Phạm Gia Huy / `doctor-surface doctor-next-visit` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor/queue | Lượt khám hôm nay / `doctor-surface` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /patients | 7 hồ sơ được hiển thị / `doctor-surface` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /patients/p-001 | MAHỒ SƠ BỆNH NHÂN · BN-2041Nguyễn Minh Anh29 tuổi · Nữ · 09•• ••• 123Đã từng khám Xem lịch khám / `profile-banner` | content | Rendered horizontal overflow; sửa min-width/flex wrapping. | P1 |
| doctor /patients/p-001 | Thông tin cơ bản / `panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /patients/p-001 | Tổng quan chăm sóc / `panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /patients/p-001 | Ghi chú hồ sơ / `panel note-panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /visits/a-027 | Phạm Gia Huy / `doctor-surface doctor-result-preview` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /visits/a-027 | Hồ sơ & kết quả / `doctor-surface doctor-result-preview` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /encounters/a-033 | Danh sách khám / `panel consult-queue` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /encounters/a-033 | Khám lâm sàngCận lâm sàngKết quảĐơn thuốcLý do khám (người bệnh cung cấp)Tái khámTriệu chứng và / `panel consult-editor` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /encounters/a-033 | Thông tin liên quan / `panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /encounters/a-033 | Rà soát ghi nhận / `panel followup-panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /results | Danh sách kết quả / `doctor-surface` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /results | Công thức máu / `doctor-surface doctor-result-preview` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /clinical/orders | Danh sách chỉ định / `panel support-panel ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /clinical/orders | Dự thảo chỉ định / `panel support-panel support-form-panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /clinical/prescription | Thông tin lượt khám / `panel support-panel support-document-panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /clinical/prescription | Ghi chú hồ sơ / `panel support-panel support-form-panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /clinical/review | Thông tin buổi khám / `panel support-panel ` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /clinical/review | Kiểm tra trước khi hoàn tất / `panel support-panel support-guidance` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor/followups | 3 việc đang chờ xử lý / `doctor-surface` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor/followups | 2 / `doctor-surface doctor-followups-summary` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor/review/a-021 | Trần Quốc Bảo / `doctor-surface journey-panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor/review/a-021 | Ghi nhận đề xuất cho điều phối / `doctor-surface journey-panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor/online/a-040 | Hoàng Nhật Nam / `doctor-surface journey-panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor/online/a-040 | Xử lý kết nối / `doctor-surface journey-panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor/online/a-041 | Mai Khánh Vy / `doctor-surface journey-panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |
| doctor /doctor/online/a-041 | Xử lý kết nối / `doctor-surface journey-panel` | content | Chưa có shared card contract; chuẩn hoá surface, spacing và hierarchy. | P2 |

## Sau thay đổi

62 representative screens; 189 card/section instances. Các instance tăng do thêm tiện ích theo ngữ cảnh, không nhân bản screen. Không còn scrollWidth overflow trong inventory default này; states mở rộng kiểm riêng.

| Screen | Card / selector | Type | Issues sau / kiểm tra | Priority |
|---|---|---|---|---|
| patient A1 | Sức khỏe của bạn luôn là ưu tiên hàng đầu.Đăng nhập bằng số điện thoại để đặt lịch, xem hướng d / `auth-panel auth-start` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient A2 | Đây có phải hồ sơ của bạn?Kiểm tra thông tin để tiếp tục với hồ sơ đã có.Họ và tênNgày sinhSố đ / `auth-panel auth-profile` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient A3 | Tạo hồ sơ của bạnThông tin giúp phòng khám tiếp nhận đúng người.Họ và tênNgày sinhSố điện thoại / `auth-panel auth-profile` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | 19 / `visit-card cf-home-appointment-summary` | action | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient B1 | Tổng quan chăm sóc / `ref-overview` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | Truy cập nhanh / `cf-home-quick` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | Chăm sóc phù hợp với bạn / `ref-discover` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | Việc cần làm / `rich-section cf-home-task-section` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | Chuẩn bị cho buổi khám / `cf-home-task-card` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | Xem lịch hẹn / `cf-home-task-card` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | Chăm sóc sau khám / `rich-section cf-home-care-section` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | Chưa có thông tin sau khám / `cf-home-care-card` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | Cẩm nang đi khám / `rich-section cf-home-tips-section` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | Chuẩn bị trước khi khámGiấy tờ, đơn thuốc và kết quả cũ / `cf-home-tip-card` | disclosure | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | Vào phòng khám onlineKết nối, camera và không gian riêng tư / `cf-home-tip-card` | disclosure | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | Tìm lại thông tin sau khámKết quả, lời dặn và câu hỏi cho phòng khám / `cf-home-tip-card` | disclosure | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient B1 | Cần giúp? / `rich-section cf-home-help-section` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient C1 | Nguyễn Minh Anh / `choice patient-choice rich-patient-choice selected` | choice | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient C1 | Trần Thị Mai / `choice patient-choice rich-patient-choice ` | choice | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient C1 | Thông tin theo đúng hồ sơ / `card cf-journey-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient C2 | Ghi thông tin để phòng khám chuẩn bị / `card cf-journey-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient C3 | Không, tiếp tục đặt lịch / `choice selected ` | choice | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient C3 | Có hoặc chưa rõ / `choice  ` | choice | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient C4 | Phòng khám cần đánh giá tình trạng và hình thức khám phù hợp cho bạn. / `note danger` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient C5 | Yêu cầu của bạn chưa phải lịch khám đã được xác nhận. / `note warning` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient C6 | Tại phòng khám / `choice selected ` | choice | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient C6 | Khám online / `choice  ` | choice | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient C6 | Phòng khám sẽ kiểm tra hình thức phù hợp trước khi xác nhận. / `note info` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient C6 | Chuẩn bị theo hình thức khám / `card cf-journey-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient C7 | Sau khi chọn giờ khám / `card cf-journey-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient C8 | Người đi khámNguyễn Minh AnhNgày khámThứ Hai, 19/10/2026Giờ khám09:00Hình thứcTại phòng khámLý  / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient C9 | CF-0001 / `card ticket` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D1 | BS. Trần Thu Hà / `rich-appt-card state-success cf-appt-featured` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Đang chờ bạn / `card next-step` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | CF-1017-0042 / `card ticket` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Bệnh viện Nhân dân 115 / `facility-card` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Phòng khám sẽ thông báo trước khi thu phí / `note info` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient D2 | Thông tin liên quan / `section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Xét nghiệm, chụp chiếu / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Phí khám và biên lai / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Kết luận và đơn thuốc / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Kết quả và việc tiếp theo / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Trao đổi sau khám / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Các bước của lượt khám / `section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Tiến trình lượt khám / `rich-section rich-detailed-progress` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Cần chuẩn bị / `rich-section rich-prepare` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Thông tin đã khai / `rich-section rich-declared` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Chỉ định liên quan / `rich-section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D2 | Sẵn sàng cho buổi khám / `card cf-preparation-card` | content | Checklist/ghi chú riêng theo visitId, lưu phiên; có feedback và calendar action. | RESOLVED / P2 |
| patient D3 | Bác sĩBS. Trần Thu Hà · Nội tổng quátNgười đi khámNguyễn Minh AnhNgày khámThứ Hai, 19/10/2026Gi / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D4 | Tôi bận vào thời gian này / `choice selected ` | choice | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D4 | Tôi muốn chọn ngày khác / `choice  ` | choice | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D4 | Lý do khác / `choice  ` | choice | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient D4 | Nếu có khoản phí đã thu, phòng khám sẽ kiểm tra chính sách áp dụng. / `note info` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient E1 | Giờ hẹn08:00 · Thứ Hai, 19/10/2026Giờ nên có mặtChưa có hướng dẫn thời gian đến riêngGiấy tờ cầ / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient E1 | Bạn có thể hỏi phòng khám nếu chưa nhận được hướng dẫn. / `note info` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient E1 | Sẵn sàng cho buổi khám / `card cf-preparation-card` | content | Checklist/ghi chú riêng theo visitId, lưu phiên; có feedback và calendar action. | RESOLVED / P2 |
| patient E2 | CF-1017-0042 / `checkin-qr-panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient E2 | Bác sĩBS. Trần Thu Hà · Nội tổng quátNgười đi khámNguyễn Minh AnhNgày khámThứ Hai, 19/10/2026Gi / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient E2 | Sau khi báo đã đến, bạn hãy chờ lễ tân hướng dẫn. / `note info` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient E3 | Bạn đã đến / `card center` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient E3 | Số thứ tự / `section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient E3 | Bạn hãy ở khu vực chờ để nghe hướng dẫn. Thời gian chờ có thể thay đổi. / `note info` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient E3 | Các bước của lượt khám / `section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient F1 | Xét nghiệm theo chỉ định / `cf-lab-card` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient F2 | Xét nghiệm theo chỉ định / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient F2 | Hướng dẫn chuẩn bị / `section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient F2 | Quay lại lượt khám hiện tại / `choice selected ` | choice | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient F2 | Để bác sĩ xem trong buổi khám / `choice  ` | choice | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient F3 | Kiểm tra trước khi chọn lịch / `card cf-journey-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient F4 | Chuẩn bị tệp kết quả / `card cf-journey-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient G1 | Chưa kiểm tra / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient G1 | Chọn nơi riêng tư, yên tĩnh. Chỉ bật camera và micro khi bạn đồng ý. / `note info` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient G1 | Bạn có thể vào phòng chờ khi phòng khám mở lượt khám. Hãy xem cập nhật trong phiếu khám. / `note info` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient G1 | Sẵn sàng cho buổi khám / `card cf-preparation-card` | content | Checklist/ghi chú riêng theo visitId, lưu phiên; có feedback và calendar action. | RESOLVED / P2 |
| patient G2 | Chờ bác sĩ gọi / `card center` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient G3 | Focused screen, không card | focused | KEEP luồng trọng tâm, không padding nội dung giả | KEEP |
| patient G4 | Focused screen, không card | focused | KEEP luồng trọng tâm, không padding nội dung giả | KEEP |
| patient G5 | Đang chờ phòng khám liên hệ lại / `note info` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient G5 | Phòng khám sẽ sắp xếp gọi lại. Bạn cũng có thể chọn lịch phù hợp hơn. / `note warning` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient H1 | Hoàn tất buổi khámNguyễn Minh Anh · Thứ Hai, 19/10/2026 / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H1 | Bác sĩ đã ký và hoàn tất hồ sơ buổi khám / `note info` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient H1 | Kết luận và đơn thuốc / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H1 | Xét nghiệm sau khám / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H1 | Hỏi phòng khám / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H1 | Đặt lịch tái khám / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H2 | Phòng khám sẽ thông báo / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H2 | Số tiền và thông tin nhận tiền sẽ do phòng khám cung cấp. / `note info` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient H2 | Thông tin khoản thu / `card cf-journey-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H3 | Thông tin khoản thu / `card cf-journey-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H4 | Chưa có mã thanh toán / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H4 | Phòng khám chưa cung cấp tài khoản và số tiền. Bạn đừng chuyển tiền khi chưa kiểm tra đủ thông  / `note warning` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient H4 | Thông tin khoản thu / `card cf-journey-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H5 | Biên lai / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H5 | Thông tin khoản thu / `card cf-journey-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H6 | Kết luận buổi khám / `section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H6 | Chưa có tài liệu được phòng khám chia sẻ. / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H6 | Đơn thuốc / `section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H6 | Hướng dẫn chăm sóc / `section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H6 | Mẫu chăm sóc sau khám / `rich-section rich-aftercare-sample` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H6 | Câu hỏi cho lần trao đổi tới / `card cf-preparation-card` | content | Checklist/ghi chú riêng theo visitId, lưu phiên; có feedback và calendar action. | RESOLVED / P2 |
| patient H7 | Xét nghiệm theo chỉ định / `cf-result-card` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient H7 | Thông báo kết quảĐã gửi thông báoGiải thích kết quảChưa ghi nhận đã giải thích / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient I1 | Lượt đã khám / `section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient I1 | Nguyễn Minh Anh / `choice selected ` | choice | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient I1 | Phản hồi về đơn thuốc / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient I1 | Hỏi lại, dùng thuốc / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient I1 | Triệu chứng mới, chưa cải thiện / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient I1 | Theo dõi triệu chứng / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient I1 | Chuyển chuyên khoa / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient I1 | Tin nhắn với phòng khám / `row` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient I2 | Tin nhắn không thay thế kênh cấp cứu. Không chờ phản hồi nếu cần trợ giúp khẩn cấp. / `note warning` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient I3 | Theo dõi triệu chứng / `section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient I3 | Câu hỏi cho lần trao đổi tới / `card cf-preparation-card` | content | Checklist/ghi chú riêng theo visitId, lưu phiên; có feedback và calendar action. | RESOLVED / P2 |
| patient I4 | Phòng khám đang sắp xếp hướng dẫn chuyển chuyên khoa. / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient I5 | Câu hỏi cho lần trao đổi tới / `card cf-preparation-card` | content | Checklist/ghi chú riêng theo visitId, lưu phiên; có feedback và calendar action. | RESOLVED / P2 |
| patient J1 | Bác sĩBS. Trần Thu Hà · Nội tổng quátNgười đi khámNguyễn Minh AnhNgày khámThứ Hai, 19/10/2026Gi / `card ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient J1 | Ngày gợi ý từ phòng khám / `section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient K1 | Có cập nhật về lượt khám / `notification row ` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient K1 | Nội dung sức khỏe không xuất hiện trong bản xem trước. / `note info` | notice | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| patient K2 | Thông tin cá nhân / `cf-reference-section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient K2 | Người thân / `cf-reference-section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient K2 | Cài đặt / `cf-reference-section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient K3 | BS. Trần Thu Hà / `rich-appt-card state-success` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient K4 | Quyền riêng tư / `section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient K4 | Dữ liệu trên thiết bị này / `card cf-journey-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient K5 | Liên hệ nhanh / `cf-reference-section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient K5 | Gửi yêu cầu / `cf-reference-section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient K5 | Câu hỏi thường gặp / `cf-reference-section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| patient K5 | Tin nhắn gần đây / `cf-reference-section ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor | Buổi khám đang thực hiện / `doctor-surface doctor-now` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor | Yêu cầu trước khám / `doctor-surface doctor-decision-card` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor | Kết quả cận lâm sàng / `doctor-surface doctor-labs-today` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor | Công thức máu / `doctor-result-item` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor | Tổng phân tích nước tiểu / `doctor-result-item` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor | Lịch khám trong ngày / `doctor-surface doctor-today` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor | 08:45 / `doctor-agenda-row` | content | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| doctor /doctor | 09:00 / `doctor-agenda-row` | content | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| doctor /doctor | 09:30 / `doctor-agenda-row` | content | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| doctor /doctor | 10:30 / `doctor-agenda-row` | content | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| doctor /doctor | 11:45 / `doctor-agenda-row` | content | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| doctor /doctor | 14:00 / `doctor-agenda-row` | content | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| doctor /doctor | 14:30 / `doctor-agenda-row` | content | Giữ owner notice/flow hiện có; không đổi thành card chỉ để phủ component count. | KEEP |
| doctor /doctor | Kết nối buổi khám / `doctor-surface doctor-online-card` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor | Công việc theo hồ sơ / `doctor-surface doctor-aftercare-card` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor | Rà soát kết quả cận lâm sàng / `doctor-task-item ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor | Theo dõi sau tái khám / `doctor-task-item ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/schedule | 12 — 18 tháng 10, 2026 / `doctor-surface doctor-schedule-main` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/schedule | BS. Nguyễn Văn An / `doctor-surface doctor-schedule-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/schedule | Phạm Gia Huy / `doctor-surface doctor-next-visit` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/queue | Lượt khám hôm nay / `doctor-surface` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /patients | 7 hồ sơ được hiển thị / `doctor-surface` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /patients | Nguyễn Minh Anh / `doctor-directory-row` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /patients | Trần Quốc Bảo / `doctor-directory-row` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /patients | Phạm Gia Huy / `doctor-directory-row` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /patients | Võ Thanh Tùng / `doctor-directory-row` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /patients | Bùi Lan Chi / `doctor-directory-row` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /patients | Hoàng Nhật Nam / `doctor-directory-row` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /patients | Mai Khánh Vy / `doctor-directory-row` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /patients/p-001 | MAHỒ SƠ BỆNH NHÂN · BN-2041Nguyễn Minh Anh29 tuổi · Nữ · 09•• ••• 123Đã từng khám Xem lịch khám / `profile-banner` | content | Đã loại decorative orb gây scrollWidth dư; content giữ nguyên. | RESOLVED / P1 |
| doctor /patients/p-001 | Thông tin cơ bản / `panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /patients/p-001 | Tổng quan chăm sóc / `panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /patients/p-001 | Ghi chú hồ sơ / `panel note-panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /visits/a-027 | Phạm Gia Huy / `doctor-surface doctor-result-preview` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /visits/a-027 | Hồ sơ & kết quả / `doctor-surface doctor-result-preview` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /encounters/a-033 | Danh sách khám / `panel consult-queue` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /encounters/a-033 | Khám lâm sàngCận lâm sàngKết quảĐơn thuốcLý do khám (người bệnh cung cấp)Tái khámTriệu chứng và / `panel consult-editor` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /encounters/a-033 | Thông tin liên quan / `panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /encounters/a-033 | Rà soát ghi nhận / `panel followup-panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /results | Danh sách kết quả / `doctor-surface` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /results | Công thức máu / `doctor-lab-row selected` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /results | X-quang ngực / `doctor-lab-row ` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /results | Tổng phân tích nước tiểu / `doctor-lab-row ` | action | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /results | Công thức máu / `doctor-surface doctor-result-preview` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /clinical/orders | Danh sách chỉ định / `panel support-panel ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /clinical/orders | Dự thảo chỉ định / `panel support-panel support-form-panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /clinical/prescription | Thông tin lượt khám / `panel support-panel support-document-panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /clinical/prescription | Ghi chú hồ sơ / `panel support-panel support-form-panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /clinical/review | Thông tin buổi khám / `panel support-panel ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /clinical/review | Kiểm tra trước khi hoàn tất / `panel support-panel support-guidance` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/followups | 3 việc đang chờ xử lý / `doctor-surface` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/followups | Theo dõi sau tái khám / `journey-task-entry ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/followups | Liên hệ lại phiên khám trực tuyến / `journey-task-entry ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/followups | Rà soát kết quả cận lâm sàng / `journey-task-entry ` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/followups | 2 / `doctor-surface doctor-followups-summary` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/review/a-021 | Trần Quốc Bảo / `doctor-surface journey-panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/review/a-021 | Ghi nhận đề xuất cho điều phối / `doctor-surface journey-panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/online/a-040 | Hoàng Nhật Nam / `doctor-surface journey-panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/online/a-040 | Xử lý kết nối / `doctor-surface journey-panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/online/a-041 | Mai Khánh Vy / `doctor-surface journey-panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |
| doctor /doctor/online/a-041 | Xử lý kết nối / `doctor-surface journey-panel` | content | Shared card/row/section owner; không overflow trong snapshot default. | RESOLVED / P2 |

State inventory mở rộng: empty/zero/unread/pressed và stored actions trong `cards-v2.spec.cjs`, model flow trong `journeys.spec.cjs`, clinical owner trong doctor suites. Source appendix giữ cả legacy; không tuyên bố mọi latent legacy role đã render.
## Source appendix

Bao gồm legacy không load; source references không phải runtime evidence.

- `prototype\app.js`: `journey-panel`, `offsetTop-panel`
- `prototype\careflow-rich-content.js`: `cf-appointment-cards`, `cf-appointment-filter-panel`, `cf-home-appointment-card`, `cf-home-card-grid`, `cf-home-card-icon`, `cf-home-care-card`, `cf-home-task-card`, `cf-home-tip-card`, `cf-reference-card`, `cf-relative-card`, `cf-support-request-card`, `rich-appt-card`, `visit-card`
- `prototype\views.js`: `auth-panel`, `auth-panel-content`, `cf-card-actions`, `cf-card-kicker`, `cf-lab-card`, `cf-result-card`, `checkin-qr-panel`, `facility-card`, `visit-card`, `visit-card-top`
- `staff-prototype\app.js`: `calendar-panel`, `consult-panel`, `consult-subpanel`, `dialog-card`, `followup-panel`, `metric-card`, `note-panel`, `notification-panel`, `profile-panel`, `subpanel-heading`, `tabpanel`
- `staff-prototype\doctor-journeys.js`: `doctor-aftercare-card`, `doctor-card-actions`, `doctor-card-footer`, `doctor-card-footnote`, `doctor-card-list`, `doctor-decision-card`, `doctor-online-card`, `doctor-surface`, `journey-panel`
- `staff-prototype\doctor-showcase.js`: `doctor-card-actions`, `doctor-card-count`, `doctor-card-empty`, `doctor-card-filters`, `doctor-card-heading`, `doctor-card-list`, `doctor-surface`
- `staff-prototype\supporting.js`: `support-card-actions`, `support-document-panel`, `support-floating-card`, `support-form-panel`, `support-panel`, `support-queue-card`, `support-role-cards`
- `staff-prototype\wave3.js`: `wave-cancel-panel`, `wave-discard`, `wave-panel`, `wave-panel-foot`, `wave-panel-head`, `wave-side-panel`

## Đợt chỉnh nháp typography/layout18/10 — sau card-v2

Giữ nguyên inventory62screen states ở trên; bảng sau ghi delta trước/sau của các nhóm sửa lần này, không cộng thành component count mới. Kiểm tra responsive mới trên47route patient và3widths lưu tại `card-evidence/draft-refinement/`.

| Screen | Card | Type | Trước / issues | Sau | Priority |
|---|---|---|---|---|---|
| B1 + shared nav | Đặt lịch | action | Nhãn hiện làm nút chiếm nhiều ngang; user muốn icon-only | Circle56px,gray ring3px,navy,accessible name; keyboard/pressed | RESOLVED/P1 |
| B1 | Cẩm nang | expandable guide | Text-only, inset wrapper/summary không cùng owner | Photo56×72,copy linh hoạt,summary20px,body mở có CTA hoạt động | RESOLVED/P1 |
| B1 | Dịch vụ | media action | Ảnh thiết bị chiếm toàn nền, nội dung ở overlay | Bác sĩ stock bên trái,copy/CTA bên phải; mặt không bị chữ đè | RESOLVED/P2 |
| C1,K2 | Account | profile | Avatar illustration/initials, không có ảnh người thật | Avatar stock mẫu nhất quán ở home/chọn người/profile; người chưa có ảnh giữ fallback | RESOLVED/P2 |
| C6 | Hình thức khám | choice | Ảnh chung tách khỏi2option | Thumbnail đúng onsite/online đặt trong option; giữ native radio/flow | RESOLVED/P2 |
| D1,D2 | Lịch/phiếu | appointment | Ảnh generic, ảnh đầu phiếu quá cao; CTA có nguy cơ wrap khi thêm icon | Ảnh theo mode; hero200px; cùng role CTA48px với home ở cỡ chữ thường | RESOLVED/P1 |
| E1,G1,K5,H6 | Chuẩn bị/online/hỗ trợ/sau khám | contextual media | Ít ảnh hoặc lặp ảnh generate | Unsplash theo đúng ngữ cảnh, không đổi hướng dẫn y tế hoặc giả danh cơ sở | RESOLVED/P2 |
| K2 | Thông tin cá nhân | fact rows | Shared facts2cols làm tên/giá trị hẹp; inset lồng |1col,rows/rules,không thêm shell/cardpadding lồng | RESOLVED/P1 |
| All47patient routes | Heading/body/CTA | shared roles | Font-size rời10–17px cùng chức năng | Semantic tokens + cùng font; page26/section18/card16/body14/caption13/control15,scale200% | RESOLVED/P1 |

## Photo-led redesign theo ảnh user — sau commitc1013ad

Bản photo-led giữ62representative states:47patient+15doctor. Inventory thực tế189→195card/section instances,0snapshot overflow; không coi đây là195component độc lập. Nguồn before: `card-evidence/after/inventory.json` và `card-evidence/draft-refinement/`; after: `card-evidence/photo-led/inventory.json`,141responsive captures và47large-text checks. Hướng mới thay text-first/side-by-side theo yêu cầu user.

| Screen | Card | Type | Before / issue | After | Priority |
|---|---|---|---|---|---|
| B1 | Khám phá,hướng dẫn,tasks,sau khám | media/disclosure | White/text-first,ảnh nhỏ cạnh chữ,chiều cao summary | Ảnh full-card,footer material full-width,circle arrow;1feature+2tiles | RESOLVED/P1 |
| D1,K3 | Appointment | multi-action media | Photo thumbnail/tách khỏi title,facts rời | Photo cover,caption clinician/status/facts/actions;lab/visit identity giữ nguyên | RESOLVED/P1 |
| D2,F2 | Detail | photo+sheet | Generic/detail ảnh nhỏ hoặc nhiều card chữ | Hero260px,overlap sheet,4icon actions,next-step rõ | RESOLVED/P1 |
| C6 | Mode | native radio media | Thumbnail64px cạnh copy |2ảnh full-width tile,caption đáy,radio state rõ;200%1cột | RESOLVED/P1 |
| F1,H7 | Lab/result | media object | Image+white content block | Full-width photo+blur caption,arrow dùng đúng labId,upload/filter giữ hoạt động | RESOLVED/P1 |
| E1,E3,G1,G2 | Preparation/waiting | context/waiting media | Trống/white status text | Context photo/overlay,icon chờ,status thật;không bịa queue/ETA | RESOLVED/P2 |
| H1,I1,J1 | Aftercare/navigation | media action | Rows chữ liên tiếp | Photo tiles theo tác vụ thật;followup purpose/care reason được giữ | RESOLVED/P2 |
| K2,K5 | Profile/support | banner+rows | Initials/text-only grouping | Stock account avatar,banner/photo care-team,contact icons,các row dữ liệu scan được | RESOLVED/P2 |
| A,C,D3/D4,F3/F4,H2–H5,I2–I5,K1/K4 | Form/finance/notice | surface/row | Typography rời,CTA đơn điệu | Plus Jakarta,icon labels,form panels,circle-arrow CTA;surface rõ cho dữ liệu/warning | RESOLVED/P2 |
| Doctor15states | Existing cards | existing | Không thuộc yêu cầu mobile photo-led | Không redesign desktop;model/shared-role regressions giữ nguyên | UNCHANGED |

Chi tiết7AI-sign checklist,crop/contrast và đối soát test: `photo-led-review.md`.

## Delta hiện tại — reference Docthea / editorial pastel

| Screen | Card | Type | Before / issue | After | Priority |
|---|---|---|---|---|---|
| B1 | Welcome / lịch tiếp theo | hero + task | Chưa có hero người thật; dark card chiếm ưu tiên | Hero pastel copy/portrait tách vùng, CTA đặt lịch; phiếu hẹn trắng + navy pill | RESOLVED/P1 |
| B1 | Việc cần làm / khám phá | note + media | Mọi action dùng cùng ảnh/blur footer tối | Note pastel/icon xen photo tile; caption sáng, arrow/nav giữ functional labels | RESOLVED/P2 |
| D1,K3 | Appointment | multi-action media | Navy caption dài, inverse CTA trên white direction | Cover gọn 160px; white caption + dark text; primary CTA cùng home | RESOLVED/P1 |
| F1,H7,C6,H1,I1,J1 | Lab/result/mode/navigation | media | Dark/glass lặp qua page roles | White .96 captions; F1 pastel task header, giữ filter/selected/labId | RESOLVED/P2 |
| K2 | Account | banner + rows | Photo cover tối không còn phù hợp reference | Pastel/stock avatar, personal-data rows; bỏ cover request ẩn | RESOLVED/P2 |
| A,C,D,E,G,H,I,K | Shared surfaces/states | utility | Cần kiểm tác động token patient | 47 route × 3 widths + 47 large-text captures, semantic status/flows giữ nguyên | VERIFIED/QA |

Không lập lại inventory component để tăng số lượng: đây là thay presentation trên inventory đã có. Scope patient, không redesign staff trong đợt style này. Evidence: `card-evidence/editorial-pastel/`.

## Hiện tại — toàn bộ card navy reference, 19/10/2026

Before: `navy-reference-before/inventory.json`, 195 instances/62states. After: `navy-reference/inventory.json`, 197 instances/62states, 0 snapshot overflow. Shared surface rollout bao phủ patient và staff; table liệt kê family owners, JSON giữ từng screen/card/type/actions để đối chiếu đầy đủ.

| Screen | Card | Type | Before / issue | After | Priority |
|---|---|---|---|---|---|
| B1 | Overview/network | metric/action | Summary ngang, chưa có orbit | Count thực cỡ lớn + navy field; orbit stock minh họa + K5 named action | RESOLVED/P1 |
| B1,D1,F2 | Lịch/phiếu | schedule/data | Facts phẳng, không có layered-paper grammar | Schedule/clinician sheets trên B1; paper data cards D1/F2 giữ facts/CTA/visit | RESOLVED/P1 |
| B1,F1,H1,I1 | Task/help/aftercare | topic/stack/network | Chủ yếu photo/footer giống nhau | Sáu anatomy dùng theo task; art không có fake controls, IDs/reason/lab giữ nguyên | RESOLVED/P1 |
| B1/J1/H1/I1,guide | Photo navigation | media | Caption sáng/pastel | Navy gradient/white caption + circle arrow; crop NCI vẫn kiểm bằng geometry/ảnh | RESOLVED/P2 |
| F1,H7,C6,E3,G2 | Clinical object/mode/waiting | media/choice | White caption rời | Paper/blue wash + trạng thái thật; radio native và actions đầy đủ | RESOLVED/P2 |
| K2,K5 | Account/support | identity/network | Pastel banner/photo header | Blue gradient banner, avatar; support network + contact actions/form | RESOLVED/P2 |
| A,C,D,E,F,G,H,I,K | Ordinary cards, QR, empty, form | surface/tonal | Owner styles khác nhau | Shared white-paper/blue gradient, unified type/insets/CTA. Notice giữ semantic mapping vì severity, rows/sections không thêm shell | RESOLVED/P1 |
| Staff 15states | Doctor/panel/result/profile | surface/tonal/row | Chưa kế thừa navy-paper grammar | Shared card wash/gradient CTA, summary metric treatment; clinical forms/tables vẫn dùng data layout | RESOLVED/P2 |
| B1,F1,H1,I1 | Arrow/mini-sheet | craft | Caption filter tạo containing block; footer padding ăn vào art text | Bỏ filter vô ích, thu selector, thêm arrow/title collision assertion và inspect ảnh sau sửa | RESOLVED/P1 |

QA không chứng minh user preference: các giá trị từ reference là quyết định thiết kế; số liệu nội dung từ model. Chi tiết 114/12 patient runs, staff reruns và 7-dấu-hiệu checklist: `photo-led-review.md`.
# Bổ sung đợt polish8 nhóm —19/10/2026

Theo tám ảnh người dùng gửi: cập nhật Hỗ trợ, form, thông tin cá nhân, người thân/cài đặt, chọn người đi khám, hướng dẫn quyền hồ sơ, lựa chọn sàng lọc và ngày/giờ. Bảng trước/sau, nguồn và kiểm tra chi tiết: [review card-polish](card-evidence/card-polish/review.md). Kết quả64 kiểm tra tập trung PASS; hợp nhất hồi quy264/264 case trình duyệt PASS,49/49 model PASS. Không thay thế các kết luận UNKNOWN/backlog ngoài phạm vi này.
