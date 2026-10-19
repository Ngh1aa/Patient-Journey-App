# Photo-led CareFlow — review và QA

## Hiện hành — toàn bộ màn dùng Design System, 19/10/2026

Đã chuyển47 màn bệnh nhân và15 route bác sĩ đang hoạt động sang bộ dùng chung. Card không còn phụ thuộc ảnh stock/nền navy; header, nav, type, nút, tab, stepper, badge, facts, forms và artwork dùng cùng tokens. Checklist7 dấu hiệu của đợt hiện tại, vị trí và vai trò cụ thể: [all-screens/review.md](card-evidence/all-screens/review.md). Bằng chứng trước: [all-screens-before/audit.md](card-evidence/all-screens-before/audit.md); sau: [all-screens-after/audit.md](card-evidence/all-screens-after/audit.md).

---

Các mục phía dưới là lịch sử của các đợt trước; mốc chờ duyệt và phạm vi cũ đã được yêu cầu mới thay thế.


## Đợt đang hoạt động — điều hướng đã gắn vào app, 19/10/2026

Navbar hiện có trong `/prototype/`, không chỉ DS. Mẫu Next/Continue, avatar, state filters, button captions/spinner, confirmed/completed tones và guide footer được sửa theo phản hồi mới. Single navigation renderer giữ route/actions, badge dựa unread visit updates. Primary background đã dùng shared black token ở các consumer hiện có, không đổi clinical flow.

Scope/evidence và kết quả kiểm mới: [navigation-integration/review.md](card-evidence/navigation-integration/review.md). Bố cục Home và các page card chưa migrate toàn bộ; không dùng cập nhật navbar làm bằng chứng hoàn tất47màn. Các phần “bản duyệt” bên dưới là lịch sử của những vòng trước.

## Bản duyệt đang hoạt động — blue/green Design System, 19/10/2026

Đã xử lý6 lỗi người dùng chỉ ra trong **bộ component**, với primary#0B1220, chỉ4 pastel xanh dương/xanh lá, section link không nền, avatar+count và quick-question có hai anatomy khác nhau, artwork outline có slot cố định, khóa/loading tách biệt. Mỗi khung có tối đa1primary; trạng thái busy thay thế default chứ không thêm primary thứ2.

**Chờ duyệt bước2**, chưa làm Home/B–G. Nội dung/logic sản phẩm không có diff. Rà soát47màn/161vùng và các giới hạn còn OPEN xem [card-audit.md](card-audit.md). Evidence, bảng20pair contrast và7 dấu hiệu: [blue-green/review.md](card-evidence/blue-green/review.md). Palette cũ và kết quả QA phía dưới là lịch sử; không dùng làm số liệu cho bản mới.

## Lịch sử — bản pastel foundations đầu, 19/10/2026

**Mốc bàn giao: bước2, chờ người dùng duyệt bộ component.** Link `/design/preview.html`; sản phẩm tại `/prototype/` chưa được bật theme pastel. Chỉ sau khi duyệt mới làm Trang chủ và dừng tiếp để duyệt Trang chủ; B–G vẫn OPEN. Nhánh `redesign/cards-v2`, chưa merge main. Không coi bộ component hay ảnh ghép là redesign47 màn đã hoàn thành.

### Đã sửa trong phạm vi bộ dùng chung

- CSS variables đúng palette mới, mesh2 vệt radial; navy dùng cho chữ/nút/nav thay các khối lớn. Trắng là nền chính; không có thẻ navy trong specimen. Tỉ lệ60/30/10 là định hướng composition, chưa đo tỷ lệ pixel.
- Một font Plus Jakarta Sans local; vai trò page24/section18/card16/number36/body14/meta13/status12. Cỡ tiêu đề thẻ không phụ thuộc h2/h3. Card lớn24/small16, nhịp4/8, inset16–20; nút giới hạn chiều rộng, không tràn card hai cột.
- Minh họa phẳng SVG token-owned cho lịch/phòng khám/hồ sơ/hỗ trợ; không stock, không suy ra danh tính bác sĩ/phòng khám từ ảnh. Không dùng công cụ cắt ảnh hay lấp mọi form bằng ảnh.
- Header có tiêu đề/chuông và unread từ dữ liệu. Nav có nhãn; + viền xám mở booking, Lịch hẹn dành cho danh sách. Tabs hỗ trợ bàn phím; stepper4 nhóm, nhãn một dòng. Chữ200% chuyển bento/stepper/nav sang bố cục phù hợp, không cắt chữ.
- Nút chính/phụ/nguy hiểm/disabled/loading; error+Thử lại, empty+action, ready; pressed/current có ARIA. Trạng thái hủy đỏ nhạt có nhãn/icon. Thẻ trạng thái cao theo nội dung, bỏ min-height gây trắng dư.
- Giữ API card/button/status hiện có, thêm primitives trong `design/ui.js`; harness `preview.js` không ghi session/patient data. `prototype/model.js`, `app.js`, `views.js`, rich content và staff renderers không có diff trong đợt này.

### QA và evidence

| Kiểm tra | Kết quả / giới hạn |
|---|---|
| Candidate browser checks |20/20 PASS, Chromium/WebKit;360/390/768/1440, inset/target/nav labels, stepper/tab keyboard, recovery, zero persistence, escaping, theme isolation |
| Related existing flows |18/18 PASS, Chromium/WebKit: appointment/profile/booking loading+slot error, cross-role status, staff keyboard/large/empty and representative axe; combined run38/38 |
| Chữ200% |PASS candidate360px, tăng các type token đúng2×; không overflow trang, nút không cắt, nhãn step không wrap. Đây là web large-text harness, chưa phải native iOS Dynamic Type |
| Contrast |14 exact pairs, min**5.024:1**. Navy trên white +4 pastel extremes; muted trên white/page; primary và5 semantic tones. Không suy ra mọi tổ hợp tùy ý đều đạt; muted không dùng trên mesh |
| Axe |0 violations trong tags WCAG2A/AA/2.1AA trên specimen rỗng/tải/lỗi/có dữ liệu, cả2 engine. Không chứng nhận đầy đủ WCAG hay native screen reader |
| Source/syntax/model |npm run check + preview.js syntax PASS; model49/49 PASS; shared component CSS0 màu literal, màu nằm tại tokens.css;4 source contract checks PASS |
| Captures |8 ảnh actual trong `card-evidence/pastel-foundation/`:4 widths +mobile card +200% +error +focus/nav. Đã mở xem desktop/default, mobile,200%, error vàfocus/nav |
| Product source |Main vẫn25dfe12208299b2d40ecf1c4f59441302c1ba9c5; không đổi model/clinical guards/47 routes. Legacy CSS còn màu literal và chưa migrate trước duyệt |

Artifacts: [final candidate results](card-evidence/pastel-foundation/foundations-final-results.json), [combined regression results](card-evidence/pastel-foundation/browser-results.json), [contrast](card-evidence/pastel-foundation/contrast.json), [capture report](card-evidence/pastel-foundation/capture-report.json), [source gate](card-evidence/pastel-foundation/source-contract.json). Máy host ghi UTC18/10; báo cáo dùng ngày19/10 theo client Asia/Bangkok. Số PASS không phải người dùng đã duyệt thẩm mỹ.

### Checklist review ảnh — đủ7 dấu hiệu

Scope: `/design/preview.html`,3 frame component ở360/390/1440 và360 chữ200%; trạng thái rỗng/tải/lỗi/ready; các ảnh link bên dưới. Không áp kết luận này cho47 màn ứng dụng chưa migrate.

| ID / dấu hiệu | Kết luận | Vị trí trên giao diện và vai trò / bằng chứng |
|---|---|---|
| AI-01 neon cạnh tranh |không xuất hiện|[Desktop3 frame](card-evidence/pastel-foundation/components-1440.png): pastel sáng, navy cho tiêu đề/nút/nav; màu trạng thái dùng nghĩa pending/success/cancelled. Không có neon/high-chroma blocks trong scope đã xem |
| AI-02 dark/glow/bloom |không xuất hiện|Header, thẻ và nav đều nền sáng trong desktop/mobile. Shadow nhẹ ở frame/nav chỉ phân lớp, không hiệu ứng phát sáng hoặc ngụ ý trạng thái |
| AI-03 emoji thay icon |không xuất hiện|Chuông, lịch, nút, status vànav dùng registry SVG cùng nét; [focus/navigation](card-evidence/pastel-foundation/focus-navigation-column.png). Không dùng emoji làm action |
| AI-04 gradient tím mặc định |có mục đích rõ|[Frame1](card-evidence/pastel-foundation/card-column-390.png): header+hero baby blue/lavender định hướng; thẻ chuẩn bị lavender/peach nhấn nội dung hỗ trợ. Frame3 mint/blue cho mẫu kết quả. Có nguồn từ brief của người dùng;14pairs và foreground navy bảo đảm chữ rõ; không rải gradient vào tất cả thẻ |
| AI-05 card/nested card |có mục đích rõ|Frame1 phân biệt lịch hẹn(date/status/action), hồ sơ(count), hỗ trợ(message), chuẩn bị(guide). Frame2 là component showcase với section mẫu, không phải đề xuất đưa tất cả nút vào Trang chủ. Frame3 chuyển trạng thái cùng1 đối tượng. Không có shell card bên trong card chỉ để viền; [mobile](card-evidence/pastel-foundation/card-column-390.png) |
| AI-06 thanh màu cạnh/trái nhiều màu |không xuất hiện|Cả3frame, nav vàtab không dùng rainbow left strips. Selected tab/nav có label và ARIA; màu không thay nhãn |
| AI-07 status dot không rõ nguồn |có mục đích rõ|Headerframe1 có số unread từ fixture notification.read; không dot online. Badge có nhãn/icon từ CareFlowUI.status + strings, không suy ra trạng thái lâm sàng từ màu. Các biến thể pending/cancelled/completed trong frame2/3 được gắn nhãn mẫu component; [error/state](card-evidence/pastel-foundation/error-column.png). Tích hợp dữ liệu từng màn chờ duyệt |

### Phần còn lại / chưa thống nhất

1. Chờ duyệt bộ component, sau đó mới Home: bớt booking lặp, bỏ00, thay ảnh, sắp xếp hero/overview/quick/profile/support theo nhiệm vụ. Không lấy toàn bộ specimen làm1màn Home.
2. Sau Home được duyệt mới B→G; mapping4group booking giữ nguyên clinical branches, status, ID vàQR thật từ model. Luồng dữ liệu không bị giản lược để khớp reference.
3. Audit cấp màn/card còn REVIEW cho copy/vai trò/section action/wrap/long content/từngstate trong ledger;47fixture không bằng bao phủ mọi biến thể. Staff không nằm trong đợt pastel mobile mới và vẫn dùng draft hiện tại.
4. Legacy CSS/token proposals lịch sử trong tokens.json còn khác CSS runtime; candidate đọc tokens.css, metadata cũ giữ như archive. Migrate dần khi duyệt màn, không tự cleanup rộng lúc foundation review.
5. Native iOS/VoiceOver, usability với người dùng thật và cải thiện kết quả nghiệp vụ: UNKNOWN.

Local preview đang dùng cổng4186. Khởi động lại từ thư mục repo khi cần:

```powershell
$env:PORT='4186'
node prototype/preview-server.cjs
```

## Lịch sử bản navy (đã được brief pastel mới thay thế về định hướng)

## Bản đang xem — navy reference cards, 19/10/2026

Hai ảnh crop mới của người dùng là visual constraint. Đã thay cấu trúc card theo sáu anatomy: metric, avatar orbit, portrait, overlapping schedule/paper, icon topic và compact CTA. Gradient navy `#001D57 → #16386C → #264F86`; light wash xanh dùng cho giấy/thông tin. Các card thông tin, form, clinical result, notice và staff data dùng cùng token/type/radius/inset; trạng thái nguy hiểm/cảnh báo giữ semantic mapping.

**Coverage:** inventory trước 195 và sau 197 card/section instances trên 62 representative states (47 patient + 15 staff). Đây là instance count theo DOM, không phải số component độc lập. Hai entry point dùng chung design owner; B1/F1/H1/I1/K5 có anatomy mới, các surface/tonal/row/section/media/form families được đối chiếu trong `card-audit.md`. Nội dung/callbacks/role guards không bị thay bằng quảng cáo từ reference.

**Ảnh actual:** `card-evidence/navy-reference/`; collage `outputs/CareFlow-navy-cards-preview.png` ghép từ 7 component chụp trực tiếp trong app, có scale phục vụ đối chiếu; không phải một màn app. Baseline trước đợt này: `card-evidence/navy-reference-before/`. Đã mở ảnh card collection, 4 contact sheets của 47 routes, B1/task/I1/K5, các context photo E1/G1/H6 và ba màn auth. Large text bỏ rotation trên lịch/mini sheets và chuyển grid về một cột.

### Kiểm tra của đợt navy

| Kiểm tra | Kết quả và giới hạn |
|---|---|
| Patient/shared browser | **114/114 PASS**, Chromium/WebKit; filters, zero/unread, notes, appointments, lab ownership, booking/recovery/offline, keyboard, 200% và representative axe |
| Sau visual polish | **12/12 PASS**, Chromium/WebKit; thêm assertion arrow không giao title ở cả network/stack/topic và vẫn kiểm crop/route/type |
| Staff lượt đầu | 15 PASS / 1 timeout WebKit; không gọi đây là all-green |
| Staff online đối soát | **6/6 PASS**, 3 repeats mỗi engine; test bổ sung selected-filter/person/exact-URL trước thao tác kết nối |
| Staff final | **20/20 PASS**, Chromium/WebKit; toàn bộ doctor-card suite + brand/contrast cases |
| Model / syntax | Patient **49/49**, staff **3/3**, syntax PASS; không thay clinical model |
| Contrast | **56 cặp PASS**; chữ trắng/soft-blue trên từng stop navy >=8.25:1 / >=7.21:1. Điểm cuối light wash đã làm sáng để chữ phụ đạt >=4.5:1 |
| Final responsive | **141 captures** = 47 routes × 360/390/1440; 0 page errors, 0 overflow, 0 broken images, 0 undersized tested controls |
| Final 200% | **47 captures**, 360px; cùng 4 nhóm metric trên đều 0 |
| Elementary sanity | **62 routes/states + 52 hover/focus variants**, 0 catastrophic flat/gradient text findings. 7 photo contexts được tách để inspect bằng ảnh, không tính thành automatic contrast PASS |
| Source ownership | Shared owner 0 raw color literals; báo cáo các literals còn trong legacy composition, không khẳng định toàn CSS sạch hardcoding |

Các nhóm test có overlap, không cộng thành tổng unique cases. Không có human study hoặc native-device validation; đây là local browser prototype QA.

Các issue đã sửa trong đợt này:

1. Backdrop filter còn ở caption tạo containing block dù `position:static`, khiến arrow của art card nằm trên title. Bỏ filter trên material đã opaque, để arrow bám card; thêm collision regression.
2. Selector padding dành cho footer `small` bị áp vào mini-sheet, bó hẹp chữ. Thu selector vào `.cf-photo-copy > small`; ảnh sau sửa có nội dung mini-sheet đủ chiều rộng, back sheet được overlap có chủ đích và không phải control.
3. Scan đầu tính màu fill phía sau ảnh auth thành nền chữ, báo 3 false positives. Đã đối chiếu ảnh, sửa media detection trước opaque fill, lưu receipt initial và final. Photo contexts không được suy ra PASS từ CSS fill phía sau ảnh.
4. Staff online timeout mở nhầm support person thay vì prepare person trong một lượt WebKit. Thêm assertions state/person/route để không thao tác khi chưa đúng màn; 6 repeat và final 20 đều PASS. Không sửa clinical state để làm test xanh.

### Checklist review ảnh — đủ 7 dấu hiệu

Scope manual: B1 metric/orbit/tasks/gallery/aftercare, F1, H1/I1, K2/K5 ở 390px populated; A1–A3/E1/G1/H6 context photos; staff dashboard ở 1440px. Contact sheets và checks responsive bổ sung phạm vi, không thay thế manual review từng pixel ở mọi interaction state.

| ID / dấu hiệu | Kết luận | Route / viewport / state + vị trí | Vai trò và evidence |
|---|---|---|---|
| AI-01 neon cạnh tranh | không xuất hiện | B1/F1/I1/K2/K5, 390px populated; staff 1440px | UI dùng navy/blue wash; semantic status có text. Ảnh người/ống nghiệm không phải UI accent. |
| AI-02 dark/glow/aurora | có mục đích rõ | B1 task topic/banner và I1 topic; G3/G4 call states trong contact sheet | Navy nhấn một tác vụ và pairing chữ trắng; dark call tách cuộc gọi. Không thêm glow/aurora. |
| AI-03 emoji thay icon | không xuất hiện | Metric/orbit/task/CTA, form, nav và staff controls trong scope | Cùng SVG stroke family, decorative art aria-hidden; control có tên và route thật. |
| AI-04 gradient tím–indigo mặc định | không xuất hiện | B1/F1/K2, footer ảnh và shared staff cards trong scope | Active palette không peach/lilac/tím. Gradient **navy** do user yêu cầu có role=CTA/topic/wayfinding; blue wash=light paper/depth; contrast có token và rendered check. |
| AI-05 card lồng/card mọi block | có mục đích rõ | B1 metric/orbit/stack; D1/F1 object cards; K2/staff data | Mỗi card một subject/action; stack con là minh họa aria-hidden hoặc schedule facts thật, không nested button. Rows/dividers và section shells vẫn giữ, không thêm shell quanh từng fact. |
| AI-06 thanh trái nhiều màu | không xuất hiện | D1/F1 filters và staff task/data cards trong captures | Selected navy một mapping; không thêm rainbow bars để lấp trống. |
| AI-07 status dot không state | có mục đích rõ | D1/D2 badges, K1 unread, G4 live state, staff priority/status | Label/count đọc từ model, dots không suy ra bác sĩ stock đang online. Avatar orbit là illustration; không có online count/99% claims. |

Không còn finding “cần sửa” mở trong scope trên. Tính đẹp và mức giống reference là agent heuristic, chưa có xác nhận sở thích từ người dùng sau đợt này.

**Local:** http://127.0.0.1:4186/prototype/?scenario=appointments#/home — lệnh từ repo root: `$env:PORT='4186'; node prototype/preview-server.cjs`. Staff: http://127.0.0.1:4186/staff-prototype/#/doctor. Nhánh `redesign/cards-v2`; không merge trước đúng từ **chốt**.

---

## Lịch sử: editorial pastel theo reference Docthea

Đã thay hướng navy caption bằng nền sáng, hero pastel có stock portrait, typography nhẹ hơn và các task surface xen card ảnh. Reference là ảnh người dùng gửi ngày 18/10; không phải website production được chứng minh hiệu quả. Toàn bộ nội dung model/route/safety giữ nguyên. Thay đổi này áp dụng cho patient prototype; màu pastel được scope vào `.phone`, không đổi dashboard staff.

- B1: hero với CTA đặt lịch, ảnh bác sĩ riêng bên phải; phiếu hẹn trắng với CTA navy pill; summary pastel, task note có icon xen card ảnh.
- D1/K3: cover bối cảnh gọn hơn, white caption giữ bác sĩ/trạng thái/lý do/CTA; nút xem phiếu đồng nhất với home.
- F1: masthead pastel, search/filter nguyên chức năng; các media caption trên toàn patient dùng chữ tối trên nền trắng .96 thay navy glass.
- K2: avatar trong banner pastel; bỏ request cover và illustration ẩn không còn dùng ở home/profile.
- Giữ Plus Jakarta Sans, navy #001D57, nút `+` với viền xám, 44–48px targets và hệ thống semantic status. Không thêm dependency hoặc ảnh AI; dùng lại ảnh thật có provenance.

### QA của đúng đợt này

| Kiểm tra | Kết quả hiện tại |
|---|---|
| Nhóm home/type/photo/reference | **56/56 PASS**, Chromium/WebKit |
| Final sau đồng bộ primary CTA | **24/24 PASS**, Chromium/WebKit; gồm crop hero/gallery, chọn hình thức, đúng visit/lab, chữ dài, status, loading/recovery, project subpath/font và axe 16 states mỗi engine |
| Patient model / syntax / shared source gate | **49/49 PASS** / PASS / PASS; shared component không có raw color literal, legacy literals vẫn được báo cáo |
| Contrast tokens | **50 cặp PASS**; chữ phụ trên pastel peach 4.70:1; caption trắng .96 trên ảnh đen 5.78:1 với chữ phụ, 13.01:1 với chữ chính |
| Responsive | **47 × 360/390/1440 = 141 captures**; D1/K3 được chụp lại sau đổi primary CTA, metrics hợp nhất theo screen/width |
| Chữ 200% | **47 màn tại 360px**; 0 overflow, 0 ảnh lỗi, 0 page errors, 0 undersized tested controls |

56 và 24 là hai lượt có overlap, không cộng thành số test unique. Lượt capture chữ lớn ban đầu bị chờ native lazy images ngoài viewport; đã dừng và sửa capture helper để tải ảnh eager trong QA page, rồi chạy lại đủ 47 màn. Không đổi lazy loading của app để che lỗi capture. Các test mới không xóa assertions về flow, label, visit, trạng thái hoặc keyboard; chỉ thay các expectation về màu/type role theo reference mới và thêm crop/copy-overlap cho hero.

### Checklist 7 dấu hiệu của giao diện hiện tại

| Dấu hiệu | Kết luận | Vị trí và vai trò |
|---|---|---|
| Neon cạnh tranh | không xuất hiện | B1/F1/K2: pastel chỉ là nền; navy giữ CTA/navigation. |
| Dark/glow tùy tiện | có mục đích rõ | G3/G4 nền tối phục vụ cuộc gọi; các card thông tin sáng, không glow. |
| Emoji thay icon | không xuất hiện | SVG cùng stroke family ở hero, task note, shortcuts và forms. |
| Purple gradient mặc định | có mục đích rõ | Lilac trong hero B1, masthead F1 và banner K2 lấy trực tiếp từ reference; không gán cho trạng thái hoặc mọi form. |
| Mọi thứ đều card lồng | có mục đích rõ | B1 xen hero/task note/media; profile dùng rows. Clinical fields/facts không thêm card lồng mới. |
| Side tabs nhiều màu | không xuất hiện | Bộ lọc D1/F1 và guide dùng một selected accent + pressed label. |
| Status dots không có nghĩa | có mục đích rõ | D1/D2/K1 và G4: label/count/live state từ model, không tạo online count từ stock portraits. |

Không còn finding “cần sửa” từ checklist này trong các ảnh đã review; đây là agent heuristic, không phải user study hoặc chứng nhận WCAG toàn app.

Ảnh mới: `card-evidence/editorial-pastel/`; preview `outputs/CareFlow-editorial-preview.png`. Đã mở kiểm các proof B1/F1/K2, ảnh large-text B1 và 4 contact sheets bao phủ 47 route. Main giữ nguyên, không merge trước đúng từ **chốt**. Chưa kiểm native device hoặc với bệnh nhân thật.

---

## Lịch sử: đợt photo-led navy trước reference Docthea

Ngày18/10/2026. Bản nháp thực thi theo ảnh người dùng, thay hướng side-by-side/white cards của commitc1013ad. Local trên nhánh `redesign/cards-v2`; main chưa được merge. Đây là review của agent trên source/ảnh/DOM, không phải usability study với bệnh nhân hoặc kiểm native iOS.

## Thay đổi nhìn thấy

- Plus Jakarta Sans self-hosted (có Vietnamese subset), nguồn đúng `Description_Font.txt` và Google Fonts/OFL.
- Card điều hướng: ảnh tràn khung, caption navy mờ full-width ở đáy, arrow trắng hình tròn bên phải. Một card là một named control, không nested button.
- Home: lịch gọn, count/icon summary,4quick actions, gallery1feature+2tiles; tác vụ/hướng dẫn/sau khám có ảnh overlay.
- D1/K3: appointment photo cover + clinician/status/facts/actions trên caption. Không che tên/ngày hoặc đổi status để làm đẹp.
- D2/F2: hero260px + overlapping sheet,4icon shortcuts có route thật. F1/H7: chỉ định/kết quả dùng ảnh với action giữ đúng labId.
- C6:2photo radio choices; các form khác dùng panel/icon label và thanh CTA có circle arrow. E3/G2: waiting photo card vẫn hiển thị status thật, không bịa số thứ tự/thời gian.
- K2: account image banner + avatar stock mẫu; K5: care-team image +3contact icons. I1/H1/J1: photo actions cho câu hỏi/tài liệu/tái khám theo lượt đã chọn.
- Warning, finance, inputs và records giữ surface dễ đọc; không thêm rating, giá, bác sĩ đang online hoặc chỉ định không có trong model.

## Checklist7dấu hiệu, gắn với ảnh hiện tại

| Dấu hiệu | Kết luận | Vị trí giao diện | Vai trò / lý do |
|---|---|---|---|
|1. Neon cạnh tranh | không xuất hiện | B1,D1,F1,C6,navbar | Navy#001D57 cho CTA/wayfinding; màu trong ảnh là màu chụp, không phải nhiều UI accents tranh ưu tiên. |
|2. Dark/glow thiếu mục đích | có mục đích rõ | Media footers;B1 appointment;G3/G4 | Caption tối tách chữ khỏi ảnh; call stage tập trung cuộc gọi. Không thêm glow/pulse vô nghĩa. |
|3. Emoji thay icon | không xuất hiện | Quick access,detail shortcuts,form labels,search | Cùng bộ SVGstroke; có nhãn; arrow trang trí trong named control. |
|4. Purple gradient default | không xuất hiện | Gallery,F1/H7,D1/K3 | Navy material/ảnh có lý do tương phản, không dùng purple như default và không cấm gradient/blur tuyệt đối. |
|5. Mọi thứ thành card/card lồng | có mục đích rõ | Gallery object cards;appointment;form panel;profile rows | Card ảnh gom một đối tượng/tác vụ. Facts/fields không bọc tiếp nhiều card; row/section vẫn dùng cho dữ liệu đồng dạng. |
|6. Side tabs nhiều màu không lý do | không xuất hiện | D1 filters;F1/H7 filters;B1 guide filters | Selected state một accent có text/pressed; category không được tô rainbow ngẫu nhiên. |
|7. Status dots không mang nghĩa | có mục đích rõ | D1/D2 badges;K1 unread;G4live-dot;header count | Model/state thực quyết định label/count; live-dot đi kèm trạng thái cuộc gọi. Không gán stock photo thành bác sĩ online. |

Không có finding “cần sửa” còn mở từ7dấu hiệu trong các ảnh đã kiểm. Đây là kết luận của phạm vi review hiện tại; không phải lệnh cấm phong cách hoặc chứng nhận mọi trạng thái/dữ liệu tương lai.

## Ảnh/crop và tương phản

- Primary clinician head trong ảnh NCIcare-team có no-cut zone và geometry regression tại360/390/1440. Đã mở ảnh thật sau render; caption nằm dưới vùng đầu đã khai báo. Khi chữ200%, feature image chuyển sang flow/contain để không ép crop khuôn mặt.
- Account avatar: Michael Dam stock, title “Ảnh đại diện minh họa”, không xác nhận danh tính. Avatar bác sĩ có tên không bị thay bằng ảnh người khác.
- Footer background `rgba(6,27,58,.78)` vẫn đọc được nếu không có backdrop blur. Trên pixel ảnh trắng (trường hợp sáng nhất): white text8.58:1, secondary text7.26:1. Arrow navy/white và status tones kiểm riêng.
- Appendix: `card-evidence/photo-led/crop-contract.json`, `contrast.txt`, `css-source-audit.json`. Không tuyên bố mọi legacy CSS literal đã được xóa.

## Kết quả chạy thực tế

| Kiểm tra | Kết quả |
|---|---|
| Syntax | PASS; npm --prefix prototype run check |
| Patient / doctor model |49/49 +3/3 PASS |
| Contrast |36cặp PASS, gồm2cặp composited media caption mới |
| Source contract |PASS; shared component owner0raw color literals |
| Initial browser regression |133PASS/5FAIL trên138cases; giữ phân biệt với lượt đã sửa phía dưới |
| Rerun các nhóm liên quan |60/60PASS, Chromium/WebKit; card-usability,draft-layout,reference-content,photo-led |
| Crop/material/font/axe cuối |14/14PASS; ảnh full-card/full-width caption, primary head crop, mode selection,visit/lab identity;16representative a11y states mỗi engine;project subpath và font thật |
| Responsive captures |47route×360/390/1440=141checks:0page errors,0overflow,0broken images,0undersized tested controls |
| Chữ200% |47route ở360px:0page errors,0overflow,0broken images,0undersized tested controls |
| Inventory |62representative states (47patient+15doctor),189→195card/section instances; không đồng nhất instance count với số component |

Các lượt test có overlap; không cộng60và14thành tổng unique cases, không gọi138lượt đầu là một lần chạy toàn bộ xanh. Initial findings đã xử lý:

1. Gallery và task empty cùng gọi open-guide làm selector cũ trùng: gallery onsite nay mở bộ lọc onsite rõ ràng; task giữ disclosure hướng dẫn. Không xóa assertion về focus/open.
2. Account banner có cả cover và avatar: test nhắm đúng `.cf-avatar-photo`, giữ alt/title assertions.
3. Expectation card nền trắng được thay bằng media variant/background và image assertion theo yêu cầu mới; các assertions đúng clinician/visit/filter giữ nguyên.
4. Visual review thấy summary kế thừa `align-items:center` làm caption co ngang: sửa flex owner thành stretch và thêm kiểm caption width/x ở cả hai engines.

## File và phạm vi

Owners: `design/ui.js`, `tokens.css`, `components.css`; `prototype/views.js`, `careflow-rich-content.js`, `icons.js`, `styles.css`, `solid-navy-polish.css`. `app.js` chỉ mở rộng guide category filter cho onsite, không sửa model/clinical transitions. Không thêm dependency. Các doctor routes được giữ nguyên, có model/shared-role regression.

Ảnh cũ/mới: baseline `card-evidence/draft-refinement/`, current `card-evidence/photo-led/` và `outputs/CareFlow-photo-led-preview.png`. Inventory JSON chứa toàn bộ62states, các contact sheets chứa47route patient.

## Xem local

- Home: http://127.0.0.1:4186/prototype/?scenario=appointments#/home
- Chỉ định: http://127.0.0.1:4186/prototype/?scenario=pre-lab#/appointments/CF-0001/labs
- Phiếu khám: http://127.0.0.1:4186/prototype/?scenario=appointments#/appointments/CF-SAMPLE-01

Các link này chủ động dùng fixture minh họa. JourneyF1 gốc tiếp tục giữ luồng đăng nhập/booking và session đã có.

Chạy lại từ root repository:

```powershell
$env:PORT='4186'
node prototype/preview-server.cjs
```

Không push/deploy/merge trong lần chỉnh này. Chỉ xét merge main sau đúng từ **chốt** của người dùng.
