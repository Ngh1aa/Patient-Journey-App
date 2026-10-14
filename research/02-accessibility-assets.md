# Module B & D — iOS, khả năng tiếp cận, tài nguyên (15/10/2026)
## B. Bằng chứng vs giả định
| Đề tài | Nguồn/FACT | Áp dụng | Đánh giá giả định | Mức tin cậy |
|---|---|---|---|---|
| Cỡ chữ | [Apple typography](https://developer.apple.com/design/human-interface-guidelines/typography), [Dynamic Type](https://developer.apple.com/documentation/uikit/uifont/scaling_fonts_automatically) | Body 17 pt điểm khởi đầu, hỗ trợ Dynamic Type và không cắt nội dung; tách cỡ typography trên Android theo sp | **17 pt được ủng hộ** là baseline iOS, không khóa cố định | Cao |
| Touch target | [Apple Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [Material accessibility](https://m3.material.io/foundations/accessible-design/overview) | Mục tiêu ≥44×44 pt iOS, ≥48×48 dp Android; khoảng cách và vùng chạm riêng cho icon | Nút cao 52 pt phù hợp vùng chạm, không thay yêu cầu chiều rộng | Cao |
| Tương phản | [WCAG contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) | chữ nhỏ 4.5:1, chữ lớn 3:1, đồ họa điều khiển 3:1; test text xanh trên nền trắng bằng giá trị thực | xanh dương thương hiệu chưa chứng minh là đủ contrast | Cao |
| Cards bo góc | [Apple design](https://developer.apple.com/design/human-interface-guidelines), [Material 3](https://m3.material.io/) | card chứa một nhóm thông tin, padding nhất quán; tránh toàn màn hình phủ card gây nhiễu | Radius 20 **là lựa chọn thẩm mỹ**, không có chuẩn bắt buộc | Trung bình |
| Floating tab | [Apple tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars), [Material Navigation Bar](https://m3.material.io/components/navigation-bar/overview) | 4 mục Home / Lịch khám / Hồ sơ / Thông báo; CTA hotline không chiếm chỗ tab | 4 mục có thể hợp lý; thanh **nổi** cần kiểm tra accessibility, safe-area, bàn phím | Trung bình |
| Bottom sheets | [Apple sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) | công việc ngắn; nội dung quan trọng dài hoặc cảnh báo nguy cấp dùng screen riêng; có nút đóng rõ và thao tác back | Không mặc định dùng sheet thay screen | Cao/trung bình |
| Dark mode | [Apple dark mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) | token semantic tách light/dark; contrast độc lập, không chỉ đảo màu | nên hỗ trợ theo thiết bị | Cao |
| Motion | [Apple motion](https://developer.apple.com/design/human-interface-guidelines/motion) | chuyển động phản hồi ngắn, không để animation che thông tin, hỗ trợ Reduce Motion | Không mô phỏng iOS animation từng pixel trên Android | Cao |
| OTP | [Apple one-time code](https://developer.apple.com/documentation/securitycodeautofill), [Android SMS Retriever](https://developers.google.com/identity/sms-retriever/overview) | autofill, paste trọn OTP, resend có thông báo, đổi số, giới hạn yêu cầu; không lộ số đầy đủ | OTP phải có phương án support khi SIM không nhận | Cao |
| Older adults | [NN/g older adults](https://www.nngroup.com/articles/usability-for-senior-citizens/), [WCAG forms labels](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) | label luôn hiện, mỗi màn 1 mục tiêu, câu ngắn và thông báo lỗi gần trường | cần test thực tế với nhiều độ tuổi | Trung bình |

**Đề xuất token thử nghiệm (NOT guideline):** #155EEF dùng cho nút chính chữ trắng; #0B4A9E cho link/text xanh; trắng #FFFFFF; text chính #101828; card #FFFFFF trên canvas #F5F8FC; radius 20; vertical touch 52pt. Phải kiểm tra contrast và thị giác thực tế, không coi màu được chứng nhận. Thanh tab nổi không chứa action nguy cấp; “Gọi phòng khám” phải có mặt ở lỗi mạng, đặt lịch, hồ sơ hậu khám.

## D. Nguồn tài nguyên và licensing
| Tên | Giấy phép/điều khoản chính chủ | Thương mại | Attribution | Tiếng Việt | Link | Tin cậy |
|---|---|---|---|---|---|---|
| Be Vietnam Pro | SIL OFL 1.1 | Có | thường không phải hiển thị với người dùng; lưu license khi phân phối font | Có | https://github.com/bettergui/BeVietnamPro | Cao |
| Inter | SIL OFL 1.1 | Có | lưu license | có subset Latin extended; **cần test dấu tổ hợp thực tế** | https://github.com/rsms/inter | Cao |
| Noto Sans | SIL OFL 1.1 | Có | lưu license | Có | https://fonts.google.com/noto/specimen/Noto+Sans | Cao |
| Roboto | Apache 2.0 (kiểm tra phiên bản được phân phối) | Có | lưu NOTICE/license phù hợp | Có qua Google Fonts subset phù hợp | https://fonts.google.com/specimen/Roboto | Cao |
| Phosphor Icons | MIT | Có | giữ thông báo MIT trong bundle/phân phối nguồn | biểu tượng không áp dụng | https://github.com/phosphor-icons/core | Cao |
| Lucide | ISC | Có | giữ license phù hợp | n/a | https://lucide.dev/license | Cao |
| Material Symbols | Apache 2.0 | Có | giữ bản quyền & giấy phép | n/a | https://fonts.google.com/icons | Cao |
| Unsplash | Unsplash License: quyền dùng thương mại, có giới hạn resale/competing services | Có theo điều khoản | không bắt buộc nhưng khuyến khích | n/a | https://unsplash.com/license | Cao |
| Pexels | Pexels License, hạn chế gắn nhãn endorsement/nhãn hiệu | Có theo điều khoản | không bắt buộc nhưng khuyến khích | n/a | https://www.pexels.com/license/ | Cao |
| unDraw | license riêng cho illustration | có cho sản phẩm thông thường, giới hạn phân phối lại | thường không yêu cầu, kiểm tra điều khoản | n/a | https://undraw.co/license | Cao |
| Figma Community UI Kit | **phụ thuộc giấy phép từng kit**, không mặc định free/commercial | Chưa xác minh cho bất kỳ kit cụ thể | tùy kit | tùy kit | https://www.figma.com/community | Cao về yêu cầu rà soát, thấp cho kit chưa chọn |

Khuyến nghị: ưu tiên Be Vietnam Pro / Noto Sans, Lucide/Phosphor; tránh illustration mang tính chẩn đoán; chỉ thêm asset đã kiểm tra legal/license vào library.

## Screen implications
- A1/A2: Dynamic Type, OTP auto-fill, label/validation.
- B1, D2: cards và CTA rõ, status có text; floating tab không che sticky actions.
- C3: không dùng sheet nhỏ cho cảnh báo; screen có vùng thông báo và hành động khẩn cấp.
- C4–C6: mỗi screen 1 tác vụ, review thông tin.
- E1–E4: contrast, screen reader status, video controls lớn, thiết bị yếu vẫn có CTA gọi.
- F1–F4: text không phụ thuộc màu, không ẩn nội dung quan trọng khi text scale 200%.
- G1–G3: tăng cỡ chữ, giảm motion, theme, chỉnh kênh liên hệ.

Đường dẫn trên đối chiếu 15/10/2026. Các trang hướng dẫn thay đổi liên tục; ngày công bố cụ thể không xác minh được: **chưa xác minh**.