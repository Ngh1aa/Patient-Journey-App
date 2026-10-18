# Card audit v2

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
