# Polish 8 nhóm card — bản nháp local, 19/10/2026

## Phạm vi và kết quả

Thực hiện theo tám ảnh người dùng gửi và phần critique đã được yêu cầu triển khai. Giữ nguyên model và chuyển trạng thái nghiệp vụ; không thêm dữ liệu giờ trực, SLA, bác sĩ thật hoặc khả năng chọn ngôn ngữ chưa tồn tại. Giữ nhánh `redesign/cards-v2`; không commit/push/merge main.

| Nhóm | Trước | Sau |
|---|---|---|
|1. Liên hệ nhanh |Bento ba thẻ cao, hai lối hỏi/nhắn gần trùng, lặp thiếu giờ trực |Nhắn tin ngang có ảnh; gọi lại và lịch sử yêu cầu ở hàng dưới; chủ đề là các chip chọn form. Hỏi về lượt khám chỉ xuất hiện khi có lượt đã khám và quyền phù hợp. Trạng thái yêu cầu lấy từ model. |
|2. Form hỗ trợ |Select hiện vòng tròn fallback; điền sẵn có chữ nhưng đếm0; không biết phương thức phản hồi đang chọn |Bổ sung icon chevron-down thật; prefill phát sự kiện input để cập nhật counter/control/cache; hiện phương thức phản hồi trong summary; giảm gap. Header form không có link Xem tất cả mơ hồ; lịch sử nằm ở hành động Yêu cầu đã gửi. |
|3. Thông tin cá nhân |Ba nút cùng mở một modal; khoảng cách lớn |Tên/điện thoại là các hàng nhãn–giá trị; Xem hồ sơ là một hành động rõ. Dị ứng thành hàng riêng với Gửi cập nhật, dùng luồng yêu cầu cập nhật hiện có. Không sửa trực tiếp danh tính. |
|4. Người thân/Cài đặt |Empty state nét đứt; card/row cao; mọi thiết lập mở cùng chỗ; Đăng xuất bị phân loại lại thành nút phụ |Empty state có mục đích và nút thật; danh sách người thân một cột, avatar/tên/quan hệ/chevron đúng hàng. Thông báo và bảo mật mở và focus đúng điều khiển; Ngôn ngữ thông báo chỉ hỗ trợ tiếng Việt. Đăng xuất giữ variant danger qua hierarchy. |
|5. Người đi khám |Số1 thiếu nhãn; add action nhảy theo lựa chọn; chỉ dẫn dư |Nhãn N hồ sơ; một nút Thêm người thân ở vị trí cố định, mở form thêm và giữ draft. Radio/CTA tiếp tục theo người chọn. |
|6. Hướng dẫn hồ sơ |Card3 mục đánh số giống các bước cần làm |Một ghi chú dưới danh sách và disclosure Quyền xem kết quả. Bỏ card hướng dẫn trùng. Không tự cấp quyền xem kết quả khi thêm người thân. |
|7. Sàng lọc |Đáp án chưa chọn đã có màu cảnh báo; câu trả lời trộn hành động tiếp tục |Đáp án mặc định trắng; trạng thái chọn/radio rõ. Nhãn Không cần trợ giúp ngay; nhánh Có hoặc chưa rõ vẫn mở cảnh báo/cấp cứu theo flow hiện có. |
|8. Ngày giờ |Dải ngày/ô ngày như hai nhóm rời; khoảng cách lớn; giờ sáng/chiều trộn |Nhóm ngày có tháng/năm và Chọn ngày khác; giờ chia sáng/chiều, cùng radio/value cũ. Bỏ hai hướng dẫn trùng trên/dưới. Ngày/giờ chọn vẫn đen; chữ lớn cuộn dải ngày tại chỗ, không làm tràn màn. |

## Kiểm tra

- `browser-final.json`:64/64 PASS,0FAIL/0SKIP trên Chromium/WebKit. Bao gồm4 chiều rộng320/360/390/1440,8 nhóm card, các hành động và chữ lớn, profile update/relative permission, safety branch, lựa chọn ngày/giờ và bộ đếm khi khôi phục hành trình.
- Lượt đầu48/64 PASS;16 lỗi còn lại là assertion/cách dựng trạng thái test cũ: nav có SVG nền và icon-only, link kênh hỗ trợ đã bỏ, copy gọi lại mới, kịch bản guide chưa khôi phục session, thêm người thân đã tự quay về bước chọn hồ sơ. Sửa bài kiểm tra để bám hành vi thật rồi chạy lại toàn bộ64; không khôi phục UI cũ để làm test xanh. Giữ `browser-results.json` làm lịch sử.
- `regression.json`:195/200 PASS ở lượt rộng;5 assertion cũ còn yêu cầu không có ảnh và nút đi Hồ sơ cũ. Cập nhật để chỉ cho phép đúng ảnh cutout đã duyệt ở B1/K5 và nút thêm người thân hiện hành. `regression-reflow.json`:8/8 PASS trên hai engine, gồm toàn bộ47 routes tại360/390/chữ lớn và đặt lịch cho người thân vừa thêm.
- **Kết quả hợp nhất:** `validation.json`264/264 test title/project duy nhất PASS,0FAIL/0SKIP. Kết quả chạy lại thay thế đúng case cũ, không cộng số lượt chạy lặp thành case mới. Bao gồm64 case tập trung và200 case journeys/guided/navigation/home.
- `model-tests.txt`:49/49 PASS. `syntax-check.txt`:kiểm tra cú pháp toàn bộ JS app PASS. Không có bước TypeScript/build trong prototype vanilla JS này.
- `source-contract.json`:7/7 PASS; không có màu literal trong CSS đang tải ngoài tokens. `contrast.txt`:23 cặp token; trắng/primary18.723:1, navy/baby-blue12.164:1, navy/mint12.992:1, chữ phụ/trắng5.348:1, danger/danger-surface6.023:1. Cặp viền input/trắng3.723:1 dành cho đường biên, không phải chữ.
- `capture.json`:25 tổ hợp màn/kích thước/chữ lớn, cộng ảnh form, cuối hồ sơ và cảnh báo;0page error,0overflow ngang ở main. Tự xem ảnh K5/K2/C1/C3/C7 tại390px,320px, desktop và chữ lớn. Axe tự động trong các case chỉ bao phủ phần được chọn, không phải chứng nhận WCAG toàn sản phẩm.

## Lưu ý và chạy local

- Card chọn hồ sơ/sàng lọc giữ CTA dock ở đáy; khoảng trống giữa nội dung ngắn và CTA là phần còn lại của viewport, không kéo card để lấp.
- Ảnh bác sĩ tiếp tục là ảnh phái sinh trang trí đã ghi nguồn trong đợt support-refresh, không gắn với tên bác sĩ hoặc tài khoản.
- Chạy từ root repo: `$env:PORT='4186'; node prototype/preview-server.cjs`.
- Xem `/prototype/?journey=F1&branch=default#/support`, `/prototype/#/profile` và luồng đặt lịch từ nút+.
- Các việc G4/H4 và các quyết định D3/D6/D7 ngoài8 nhóm này vẫn giữ trong backlog của review trước; không coi đợt polish này là hoàn thành chúng.
