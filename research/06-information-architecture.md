# 06 — CareFlow Information Architecture & Navigation v0.2

> **DRAFT / DESIGN PROPOSAL** • 15/10/2026 • Patient mobile iOS/Android • 23 màn hình A1–G3. Chưa xác nhận với vận hành/pháp lý/bác sĩ; không thay thế hướng dẫn chuyên môn. Ký hiệu **[SOURCE]**, **[FLOW]** (nguồn nghiệp vụ do chủ dự án cung cấp), **[DESIGN]**, **[NEEDS VALIDATION]**.

## A. Nguyên tắc sản phẩm
1. **Một đối tượng trung tâm = một người được khám (patient context)**. Mỗi lịch/đơn thuốc/kết quả gắn patientId; trên màn cho thấy tên/người được khám. Người đăng nhập khác với người đi khám.
2. **Một hành động chính cho mỗi màn**; hành động hệ thống đa bước có tiêu đề tiến trình + Back + Lưu bản nháp khi phù hợp.
3. **Ai đang giữ việc / bước tiếp theo**: hiển thị role và trạng thái do hệ thống xác nhận, không tự suy đoán thời gian hoặc người xử lý.
4. **Luôn có hỗ trợ thực tế**: Gọi phòng khám từ A1, B1, C3, C5–C6, D2, E1–E4, F1–F4. Tránh nút nổi che CTA y tế và điều khiển cuộc gọi.
5. **Dữ liệu nhạy cảm**: xác thực và authorization khi mở kết quả, hồ sơ người thân; ẩn PHI khỏi push/lock-screen; deep link mở lại đúng screen sau xác minh.
6. **Lộ trình mobile rõ ràng**: bottom tabs để di chuyển giữa khu vực cấp cao, không dùng tabs làm nút hành động. [Apple Tab Bars — updated 08/06/2026](https://developer.apple.com/design/human-interface-guidelines/tab-bars).

## B. Sơ đồ thông tin

\`\`\`mermaid
flowchart TD
    START([Mở CareFlow]) --> AUTH[A1 Đăng nhập / OTP]
    AUTH -->|Hồ sơ chưa có| A2[A2 Tạo hồ sơ ban đầu]
    AUTH --> HOME[B1 Trang chủ]
    A2 --> HOME

    HOME --> T1[Tab Trang chủ B1]
    HOME --> T2[Tab Lịch khám D1]
    HOME --> T3[Tab Hồ sơ G1]
    HOME --> T4[Tab Thông báo G2]

    T1 --> C1[C1 Ai đi khám?]
    C1 --> C2[C2 Lý do khám / sàng lọc]
    C2 -->|Có dấu hiệu cảnh báo| C3[C3 Cảnh báo & liên hệ hỗ trợ]
    C2 -->|Không cảnh báo / được hướng dẫn tiếp| C4[C4 Hình thức + ngày giờ]
    C4 --> C5[C5 Kiểm tra & xác nhận]
    C5 --> C6[C6 Đặt lịch thành công]
    C6 --> D2[D2 Chi tiết lịch]

    T2 --> D2
    D2 --> D3[D3 Hủy / đổi lịch]
    D2 --> E1[E1 Check-in & số thứ tự]
    D2 --> E2[E2 Chuẩn bị khám online]
    E2 --> E3[E3 Cuộc gọi video]
    E2 --> E4[E4 Chưa kết nối được]
    E3 --> E4
    E4 -->|Nhân viên hẹn lại / hỗ trợ| D2

    D2 --> F1[F1 Thanh toán]
    D2 --> F2[F2 Kết luận / đơn / kết quả]
    D2 --> F3[F3 Xét nghiệm cần làm]
    F2 --> F4[F4 Hỏi phòng khám]
    F3 --> F4
    T3 --> C1
    T4 --> D2
    T4 --> F2
    T3 --> G3[G3 Cài đặt]
\`\`\`

**Giới hạn của 23 màn:** đây là information architecture của *patient app*, không phải danh sách màn staff. Staff console (tiếp nhận, điều dưỡng, bác sĩ, thu ngân) và backend phải tồn tại bên ngoài 23 màn để phát sinh, cập nhật, ký, bàn giao các trạng thái. Không giả định app bệnh nhân được quyền tự ký/khóa lượt khám.

## C. Điều hướng tab và cấu trúc vị trí
| Khu vực | Entry | Chức năng/chốt hành vi | Chỉ báo |
|---|---|---|---|
| Trang chủ | B1 | Một lịch gần nhất, người được khám, trạng thái hiện tại, bước kế tiếp, “Đặt lịch” và “Gọi phòng khám” | Khi có nhiều người thân: tên người trên từng thẻ |
| Lịch khám | D1 | Sắp tới / đã qua / hủy; mọi biến đổi mở D2, không chỉnh trực tiếp trên danh sách | Không đếm hẹn đã hủy là sắp tới |
| Hồ sơ | G1 | Hồ sơ của tôi, hồ sơ liên kết, quyền được cấp, thiết lập profile, chuyển G3 | Banner “Đang xem hồ sơ của ...” trong ngữ cảnh thay mặt |
| Thông báo | G2 | Thông báo y tế tối thiểu, reminder, yêu cầu gọi lại | Badge chỉ là tín hiệu bổ sung, không chứa thông tin bệnh lý |

**Không đặt** “Đặt lịch” là tab thứ năm: đây là tác vụ đi từ B1/C1; một floating action button có thể test nhưng không coi là bắt buộc. **Tab bar nổi 4 mục** là mỹ thuật đề xuất, test khi font scale và keyboard; platform implementation có thể dùng tab bar native trên iOS và navigation bar tương ứng Android.

## D. Màn hình và điều hướng
| ID | Vai trò | Entry | Exit chính | Phụ / trạng thái |
|---|---|---|---|---|
| A1 | Login/OTP | start, deep link bị chặn | A2 hoặc B1 / route sau xác thực | resend, đổi SĐT, gọi |
| A2 | Xác lập hồ sơ | A1, C1 khi chưa có hồ sơ | B1 hoặc C1 | kiểm trùng, thiếu trường |
| B1 | Home | đăng nhập/tab | C1, D2, D1 | zero state, hotline |
| C1 | Chọn người đi khám | B1/G1 | C2 | thêm người, verify proxy; giữ ngữ cảnh rõ |
| C2 | Lý do & sàng lọc | C1 | C3 hoặc C4 | chưa hoàn tất, quyền bác sĩ |
| C3 | Warning | C2 | hỗ trợ thực tế / staff hướng dẫn | không tự coi warning là chẩn đoán |
| C4 | Hình thức + ngày giờ | C2 | C5 | empty slots, expired slots, đổi hình thức |
| C5 | Review | C4 | C6 | edit -> C1/C2/C4, consent theo luật/policy |
| C6 | Booking confirmed | C5 | D2, B1 | gửi xác nhận, lỗi notification không rollback |
| D1 | Lịch hẹn | tab | D2 | trống/lọc |
| D2 | Chi tiết / state | D1/B1/C6/G2 | D3/E1/E2/F1/F2/F3 | owner role, next action, hotline |
| D3 | Cancel/reschedule | D2 | D2/C4 | reason, policy, history |
| E1 | Check-in & queue | D2 | D2 | STT tiếp nhận ≠ STT khám; offline/manual support |
| E2 | Preflight online | D2 | E3/E4 | device permission, doctor-initiated call |
| E3 | Consultation | E2, incoming call | D2/F2/E4 | camera/mic, reconnect, privacy |
| E4 | Connection issues | E2/E3 | retry/callback/direct visit | phân biệt không liên hệ và rớt mạng |
| F1 | Payment | D2 | D2 | miễn phí, pending verification, paid, deferred, refund |
| F2 | Summary/results | D2/G2 | F3/F4/D2 | outcome; results available vs doctor reviewed vs communicated |
| F3 | Ordered tests | D2/F2 | F2/D2 | instructions controlled by clinic, appointment/test statuses |
| F4 | Contact/callback | global support, F2/F3/E4 | quay lại màn trước | ticket, reason, contact attempts, state |
| G1 | Profiles/proxy | tab | C1/G3 | revoke/permission history, actions by delegated scope |
| G2 | Notifications | tab/push | D2/F2/F4 | auth before revealing |
| G3 | Settings | G1 | G1 | accessibility, privacy, channels, help |

## E. Cross-cutting invariants
- **Routing identity:** deep link must contain opaque appointment/resource identifier, not raw patient name/symptom. Backend kiểm quyền *mỗi lần* gọi API. Không cho mở resource của profile khác sau khi chuyển account.
- **No-connection:** giữ pending local UI request only when safe; không “đặt lịch xong” / “đã thanh toán” / “đã hủy” nếu server chưa acknowledge. Hiện retry state và gọi phòng khám.
- **Status age:** nếu lượt khám/queue không refresh được, hiển thị “Thông tin chưa cập nhật”; không tự vẽ vị trí/chờ bao lâu.
- **Mode availability:** chỉ hiển thị khám online khi cơ sở và loại khám được người có thẩm quyền duyệt (không suy diễn từ danh mục).
- **Emergency:** mọi nội dung, route và mức khẩn cấp C2/C3 do clinician duyệt. Không chuyển bệnh nhân nghi nguy hiểm vào flow tự phục vụ một cách im lặng.
- **Proxy:** quyền tạo lịch, xem kết quả, xem đơn, nhận thông báo và thực hiện thanh toán tách scope.
- **Screen readers:** heading, name, status, CTA và person-context được đọc rõ, thứ tự focus hợp lý; không dùng màu đơn độc.

## F. Nguồn làm căn cứ và trạng thái
- **[SOURCE/Cao]** [NHS family and carer access](https://www.nhs.uk/nhs-app/help/profile/family-and-carer-access/) — banner và quyền truy cập đại diện theo phạm vi, tham khảo cho G1/C1; NHS áp dụng điều kiện GP riêng, KHÔNG mặc định áp dụng y nguyên ở Việt Nam.
- **[SOURCE/Cao]** [NHS step-by-step guide, updated 02/07/2026](https://digital.nhs.uk/services/nhs-app/toolkit/step-by-step-guide) — dấu hiệu “acting on behalf of”.
- **[SOURCE/Cao]** [Apple tab bar, updated 08/06/2026](https://developer.apple.com/design/human-interface-guidelines/tab-bars) — navigation không phải action.
- **[SOURCE/Cao]** [WCAG 2.2 — target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): AA 24×24 CSS px hoặc ngoại lệ; mobile iOS 44pt/Android 48dp là target design thường dùng, KHÔNG đồng nhất với ngưỡng WCAG.
- **[FLOW]** Chi tiết nghiệp vụ 4 giai đoạn được người đặt bài cung cấp; chưa phải SOP ký duyệt.
- **[DESIGN]** IA, mapping 23 screens, tab 4 mục và các logic routing được biên soạn cho CareFlow; phải kiểm thử trên prototype.

**Quyết định chờ chốt:** số hồ sơ tối đa, bảo lãnh/người giám hộ, hotline ngoài giờ, offline fallback, app đồng bộ queue tới mức nào, push sau logout, quyền xem kết quả trước bác sĩ duyệt, có màn onboarding riêng hay dùng A1.