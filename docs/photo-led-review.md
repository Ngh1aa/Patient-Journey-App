# Photo-led CareFlow — review và QA

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
