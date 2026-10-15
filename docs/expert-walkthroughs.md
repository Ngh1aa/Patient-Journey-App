# 5 scenario-based expert walkthroughs

SYNTHETIC/CONCEPT, không phải 5 người tham gia. Nhận định từ source audit, browser E2E và ảnh đã chụp. Không có interview, quote, task-success rate hay business impact.

| Kịch bản | Quan sát từ thực thi | Vấn đề/root cause | Sửa và bằng chứng |
|---|---|---|---|
| 1. Người lần đầu, cần đọc rõ và nhập sai SĐT | F1 nhập3 chữ số → lỗi cạnh field → sửa → OTP → A3 → C9 pending | Baseline24 màn thiếu A3/ID mới và gửi thành confirmed | Registry47, validation, pending; F1/F2 E2E, font200% reflow |
| 2. Người đặt hộ cho mẹ | Đặt lịch được, F1/H6/H7 bị chặn; reload vẫn chặn | Quyền đặt và quyền xem dễ bị đánh đồng | patient-bound permission, guard direct link; proxy E2E và revoke |
| 3. Có nguy cơ, vẫn muốn gặp bác sĩ | C4→C5→C9 mode-review, staff chốt mới pending | Baseline chặn hoàn toàn và thiếu nhánh xin xem xét | Sticky risk theo patient và guard; F3a/b E2E |
| 4. Không nghe được cuộc gọi online | G3→G5, chờ gọi lại giữ lịch; đổi online/tại phòng khám tạo lượt khác | Dễ làm mất lịch cũ hoặc tự hoàn tất buổi khám khi rời call | Linked visits, separate callback/completion; F7/F8 và leave-call E2E |
| 5. Sau khám có phí, kết quả và phản hồi | Transfer pending cần staff, doctor review chưa có notice; phản hồi triệu chứng urgent mở C4 | D2 CTA ban đầu dưới fold (P2); guard yêu cầu đã gửi chặn nhầm urgent aftercare (P1) trong regression | Đưa next-step lên đầu, guard phân biệt ngữ cảnh C4; D2 visible360, F9/F10/F11 và urgent regression |

P0/P1/P2 trong bảng là mức độ của vấn đề đã quan sát trong quá trình làm; trạng thái retest cuối xem qa-results.md. Không suy ra hiệu quả với bệnh nhân thật từ các bài kiểm tra kỹ thuật này.
