# Photo-led CareFlow — hướng sửa theo ảnh người dùng

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
