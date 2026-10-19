# Photo-led CareFlow — hướng sửa theo ảnh người dùng

## Hiện tại — toàn bộ card theo reference navy, 19/10/2026

Hai crop người dùng gửi `df745a9b...png` / `3934c010...png` khóa anatomy: metric + gradient pillar, avatar orbit, portrait, overlapping appointment sheets, icon/category poster, compact CTA banner. Phải thực thi các anatomy này trên dữ liệu thật của prototype, không chỉ đổi màu bản pastel. Reference là visual constraint, không phải bằng chứng usability hoặc dữ liệu y tế.

Before inventory: `card-evidence/navy-reference-before/inventory.json` — 62 states, 195 card/section instances, 0 measured overflow. Working tree chứa bản editorial-pastel từ đợt trước; giữ thay đổi này và Factory edits ngoài target, không reset hoặc merge. Tiếp tục `redesign/cards-v2`.

| Card family / user job | Transfer từ reference / role | Giá trị và composition proof trước code | Rollout |
|---|---|---|---|
| Metric / nhìn lượng việc | Số lớn, nền pillar, label nhỏ | Số lịch/hồ sơ/kết quả thực; title 18, value 36, metadata 13; hai cột 1:1 ở home, 200% một cột | B1 summary, staff stats |
| Connection / biết nơi liên hệ | Avatar quanh tâm, copy ở dưới | 3 stock/care image crops chỉ làm minh họa; không gán tên bác sĩ/online; orbit 120px, circle 30–48px; một named action tới K5 | B1, K5 |
| Portrait / nhận biết bối cảnh | Người bên phải, copy trái | Stock portrait hiện có, no-cut x350..600/y30..315; giữ proof cover46%top và 200% contain; đổi nền sang blue/navy wash | B1, media utility |
| Schedule / xem lịch thật | Hai sheet chồng lệch | `.cf-home-schedule` và clinician info là nội dung thật, chỉ nghiêng 2–3deg; CTA riêng, không nested button; 200% bỏ transform | B1, D1 date area, F2 schedule |
| Topic / chọn một việc | Gradient poster + nhóm icon | Navy #001D57 → #264F86, white/soft blue text; icon 20–24px trong white circles; màu không gán status | Discovery/task/aftercare/support tiles |
| Utility / nhập hoặc đọc dữ liệu | White panel, soft blue gradient góc đáy | Form/facts có nền sáng ổn định, h2 18/body14/inset16, không đẩy ảnh vào chỗ nhập; row có divider, section không thêm khung | Tất cả patient/staff surface/tonal/media/form/notice families |

Page proofs: **B1** = metric/orbit pair → real overlapping appointment → quick actions → portrait/discovery; **F1/D1** = task header/search/filter → media object + readable facts/CTA; **K2/staff** = identity gradient/header → row/data cards. Mỗi nhóm dùng chung tokens/radius/typography nhưng không ép mọi trang thành cùng một hero.

Shared palette: #001D57 brand, #16386C midpoint, #264F86 end; light wash #F5F8FE → #E1EAF7 → #D2DFF1. Heading/body dùng dark ink trên light wash, white chỉ trên navy. White fields/warnings giữ semantic contrast. Radius 20px, inset16/20px, gap12/16px, targets>=44px. Không pastel peach/lilac trong active styles. CTA/banner dùng navy có vai trò; không thêm glow, hạt bụi, rating hoặc fake success.

Sources read: [NN/g cards](https://www.nngroup.com/articles/cards-component/) cho grouping theo một subject và action; [WCAG contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) cho foreground/background. Material3 overview chỉ trả shell JavaScript, không dùng làm bằng chứng đã đọc guidance chi tiết. Composition theo ảnh user và current source; numeric scale là working design choice.

Acceptance: tất cả 47 patient routes + 15 staff states được scan visibility/overflow; render 360/390/1440 và 200%; kiểm state controls, filters, exact visit/lab ownership; mở ảnh proof/contact sheets; checklist đủ 7 dấu hiệu theo route/viewport/state; không merge trước đúng từ `chốt`.

## Điều chỉnh theo reference Docthea — 18/10/2026

Reference mới `codex-clipboard-20db6eea-0026-4523-a9e1-ce021ce14d49.png` thay hướng navy caption trước đó. Đây là yêu cầu trực tiếp về style, không phải bằng chứng usability. Giữ flow và navy #001D57, Plus Jakarta Sans; đổi grammar sang editorial sáng, pastel xanh/lilac/peach, typography 400–600, card trắng xen ảnh và CTA pill. Không sao chép thương hiệu, số 99%, xếp hạng hoặc số bác sĩ trong ảnh mẫu.

| Page role / câu hỏi | Composition proof trước code | Chuyển sang mobile / số áp dụng |
|---|---|---|
| B1 — đặt lịch hay tiếp tục việc đang có? | Greeting → hero pastel/copy trái/stock portrait phải/CTA đặt lịch → phiếu hẹn gọn → quick actions/summary → gallery hai cột | Hero tối thiểu 248px; copy 56%, portrait 44%; title 24px/500; chữ lớn chuyển ảnh và copy thành hai hàng, giữ khuôn mặt; CTA 48px. |
| D1/F1 — chọn đúng lượt/chỉ định nào? | Heading sáng → search/filter → ảnh bối cảnh nhỏ hơn → white caption với tên/status/facts/CTA | Không hero quảng cáo lặp; photo header 140–160px, footer không giới hạn cao; gutter/inset 16px, body 14px, meta 13px, section 18px. |
| D2/F2/K2 — thông tin chi tiết và hành động kế tiếp? | Detail ảnh + sheet trắng / profile portrait trong banner pastel → icon shortcuts → thông tin dạng rows | Detail giữ route/actions; profile không dùng cover tối; 4 shortcuts chuyển 2 cột khi chữ lớn; headings cùng role 24/18/16px. |

Signature: nền gần trắng, pastel dành cho hero/khu vực khám phá, ảnh người thật, tiêu đề nhẹ và navy pill; status chỉ dùng semantic tone. So sánh với ảnh chụp đợt trước để đánh giá sự thay đổi composition, không chỉ đổi màu. Đây là hướng user chọn; không yêu cầu duyệt thêm phương án.

Crop contract: `doctor-portrait.webp` (Usman Yousaf, nguồn đã lưu) dùng cover 46% top trong vùng ảnh riêng 45% chiều rộng hero; chữ lớn chuyển thành ảnh contain ở hàng riêng. No-cut head vùng x350..600/y30..315 trên source 1000×667; kiểm geometry giữa vùng đầu và mép copy. Ảnh stock không gán thành BS. Trần Thu Hà. Giữ ảnh NCI trong gallery và inspect lại tại 360/390/1440 và 200%.

Màu working tokens: page #f7f8fa, caption trắng .96, ink #182b49, muted #526176; pastel #e7edfc / #efe8f6 / #f6d8cf chỉ làm nền. Áp dụng trong `.phone` để không đổi dashboard staff. [WCAG contrast minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) làm cơ sở kiểm chữ; chính reference quyết định style. QA cần render ảnh, kiểm crop/insets/CTA và các flow chọn lịch, chỉ định, hỗ trợ hiện có.

## Bằng chứng và ràng buộc trước code

Người dùng yêu cầu đổi mạnh bản nháp ngày18/10: card ảnh phủ toàn diện tích, nội dung trên lớp mờ ở đáy ảnh, icon mũi tên tròn bên phải; nhiều hình ảnh/icon, density gần ba màn ý tưởng. Hai ảnh tham chiếu mới và ảnh tổng hợp ba màn trước đó là ràng buộc thẩm mỹ trực tiếp, thay quyết định side-by-side của đợt trước.

Đã đọc lại START-HERE → AGENTS → CONTRACT-OWNERSHIP của uiux-ai-workspace, dùng flow professional-website-redesign hiện có và active visual-design-direction / asset-media-and-art-direction / visual QA. User chọn composition, vì vậy không tạo ba phương án phong cách cạnh tranh để yêu cầu duyệt lại.

File `Description_Font.txt` ghi Plus Jakarta Sans và ảnh preview chỉ minh họa. [Google Fonts metadata](https://raw.githubusercontent.com/google/fonts/main/ofl/plusjakartasans/METADATA.pb) xác nhận OFL, trục200–800 và subset Vietnamese. Dùng font self-hosted trong prototype, không cài font vào Windows hoặc nhập file .fig.

[Apple HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials) là nguồn tham khảo cho layering; [WCAG contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) yêu cầu4.5:1 với chữ thường. Lớp caption có nền navy đủ đậm, blur hỗ trợ nhận biết chiều sâu chứ không chịu trách nhiệm duy nhất cho tương phản.

## Quyết định chuyển từ reference

| Quan sát ảnh user | ADOPT/ADAPT | Quyết định có thể kiểm bằng ảnh |
|---|---|---|
| Card là ảnh100%, không ảnh nhỏ cạnh copy | ADOPT | Media card có ảnh absolute full-inset, footer overlay đáy, arrow tròn góc phải. |
| Một ảnh lớn + hai ảnh nhỏ | ADOPT | Home khám phá và F1: feature toàn hàng + utilities2cột; chuyển1cột khi chữ200%. |
| Detail ảnh đầu trang và sheet chồng | ADOPT | D2/F2 có hero260px, sheet bo28px chồng lên24px, icon facts và CTA rõ. |
| Icon benefits4cột | ADAPT | Dùng mode/calendar/document/support có tác vụ thật của lượt khám; không bịa đội ngũ/chứng nhận/24h/ratings. |
| Hàng avatar chồng cạnh CTA | ADAPT | Chỉ dùng hồ sơ/ảnh stock được gắn nhãn minh họa; không tạo số lượng bác sĩ hay rating. |
| Blur overlay/gradient | ADOPT | Một footer material navy, white text, icon arrow nền trắng; hiệu ứng phục vụ đọc nội dung trên ảnh. |
| Cancer/chemo/vaccine/surgery/pricing trong demo kit | REJECT | Không đổi mô hình lâm sàng/danh mục dịch vụ chỉ để copy nội dung ảnh mẫu. |

## Page-role composition matrix

| Nhóm | Câu hỏi vào trang | Anchor/top | Decision object / CTA | Mobile |
|---|---|---|---|---|
| B1 home | Lịch tiếp theo và việc cần làm? | Lịch navy gọn + overview icon + gallery ảnh | Phiếu khám, tác vụ theo state, guide mở rộng | Hero180–200px, gallery feature+2tiles, gap12–16 |
| D1,K3 danh sách | Lịch nào/của ai/ở trạng thái gì? | Search/filter + appointment photo card | Ảnh theo mode, overlay bác sĩ/status; lịch/facts/CTA bên dưới | Facts scan được, không thu nhỏ text cho vừa2cột |
| F1,H7 khám phá chỉ định | Cần làm gì với chỉ định/kết quả? | Navy masthead/search + image-led card | Lab photo+caption overlay; upload/details có đúng labId | Một feature, utility tiles2cột; zero state không bịa lab |
| D2,F2 chi tiết | Đang ở bước nào và làm gì tiếp? | Hero photo + overlapping sheet + icon action row | Status/next action/facts/ticket/checklist | Ảnh260px, nội dung không bị nav che, detail CTA đủ44px |
| C1–C9 đặt lịch | Ai/lý do/hình thức/giờ/xác nhận? | Stepper gọn; radio có avatar/media; form panels | Native fields/selection; next CTA có arrow trong circle | Ưu tiên chọn/input; không đặt chữ nhập trên ảnh |
| E1–E3,G1–G5 | Chuẩn bị/đến/chờ/kết nối? | Ảnh bối cảnh + hành trình/icon checkpoint | Ticket, checklist, device/call action | Call/emergency giữ tập trung, không ảnh chặn cảnh báo |
| H1–H6,I1–J1 | Tài liệu, theo dõi, trao đổi lại? | Photo tiles cho tài liệu/chăm sóc + form/card dữ liệu | Kết quả/đơn thuốc/nhắn tin/tái khám có dữ liệu thật từ model | Media ở navigation choices; finance/privacy forms không glass toàn nền |
| K1,K2,K4,K5 | Thông báo/hồ sơ/cài đặt/hỗ trợ? | Profile account banner / contact photo + icon actions | Avatar, rows, state, form/liên hệ | Một subject một group; settings/read states vẫn rõ |
| A1–A3 auth | Xác thực và đúng hồ sơ? | Clinic photo với copy overlay + form sheet | OTP/profile validation hiện có | Không sửa state/flow để làm ảnh đẹp |

## Ba proof trước nhân rộng

1. Home: avatar/header → greeting → lịch ảnh navy180px → overview/quick icons → main photo card +2small image cards → guide ảnh overlay.
2. F1: navy header + title/search/filter → full image lab card220px/footer mờ →2image utility tiles → support/action bar.
3. D2: hero260px → sheet bo góc/doctor/status →4icon action shortcuts → next-step CTA → ticket/facts → progress/checklist.

Signature: ảnh y tế tràn card với footer navy mờ, typography Plus Jakarta Sans, circle arrow màu trắng, navigation + viền xám. Nội dung form/receipt dùng surface để đọc rõ, không phủ ảnh vô nghĩa lên mọi input.

## Tokens và media contract

Giữ brand#001D57. Patient page title24px, section18px, card16px, body14px, caption13px, CTA15px; font400/600/700. Gutter16px trên phone; inset16px; gap12/16px; card radius20–24px; target44px. Large-text vẫn scale200%, không giới hạn chiều cao caption.

Ảnh không mặt (clinic/lab/tools/thiết bị) có thể crop cover theo focal thiết bị. Portrait doctor chỉ dùng card có vùng ảnh riêng phía trên, footer không che mặt, kiểm360/390/1440. Avatar nguồn Michael Dam giữ toàn mặt. Nguồn/license trong sources.json; ảnh stock không đại diện cơ sở/danh tính thật.

## Chấp nhận sau render

- Mở ảnh thật của3proof trước khi nhân rộng.
- Mọi ảnh media phủ100% card; caption/arrow cùng một control có accessible name, không nested button.
- Guide/native details dùng Enter; arrow xoay và nội dung không bị ảnh che.
- Route47/flow/permissions/states giữ nguyên; search/filter/CTA không làm giả số liệu hoặc nhảy qua safety.
- QA Chromium/WebKit,360/390/1440,chữ200%,contrast/footer,44px,ảnh/crop/overflow; checklist7dấu hiệu có vị trí và vai trò.
- Nhánh redesign/cards-v2; không merge main trước “chốt”.


## Bằng chứng sau thực thi

Ba composition proof đã render và mở ảnh kiểm trước khi nhân rộng. Snapshot hiện tại: `card-evidence/photo-led/` (21 ảnh đại diện,4 contact sheets47route,inventory62states). Preview ghép từ ảnh app thật tại `outputs/CareFlow-photo-led-preview.png`.

Đã kiểm crop primary head của NCI care-team tại360/390/1440 bằng ảnh và geometry test; caption không che vùng đầu đã khai báo. Avatar account là stock ảnh minh họa, bác sĩ có tên vẫn dùng avatar cũ để không gán nhầm danh tính. Các ảnh không mặt crop theo subject; appointment có header ảnh220px để không phóng ảnh thành phần trần nhà khi caption dài. Xem `crop-contract.json`.

Lớp caption full-width cần `align-items:stretch` ở flex card; đã sửa root owner sau visual review và thêm assertion width/x của caption. Source helper `photoCard` dùng một named control, không button lồng button.
