/* CareFlow: self-contained DOM low-fi explorer. All data and responses are simulated. */
(function CareFlowWireframeApp(){
  "use strict";
  const M=window.CareFlowModel;
  if(!M) throw new Error("Thiếu model.js");
  let m=M.initial();
  let ui={current:"A1",scenario:"self",notice:"",phone:"0900000000",otp:"123456",fullName:"Người dùng mẫu",reason:"",choice:"",bookingOutcome:"success",cancelReason:"",lastHelpFrom:"B1",videoMic:true,videoCamera:true,largeText:false};
  const groups=[
    {name:"Bắt đầu",items:[["A1","Chào mừng / OTP"],["A2","Tạo hồ sơ"],["B1","Trang chủ"]]},
    {name:"Đặt lịch & sàng lọc",items:[["C1","Ai đi khám?"],["C2","Lý do & sàng lọc"],["C3","Cảnh báo nguy hiểm"],["C4","Ngày, giờ, hình thức"],["C5","Xác nhận"],["C6","Đặt lịch xong"]]},
    {name:"Quản lý lịch",items:[["D1","Danh sách lịch"],["D2","Chi tiết lịch"],["D3","Hủy / đổi lịch"]]},
    {name:"Trong lượt khám",items:[["E1","Check-in / STT"],["E2","Chuẩn bị online"],["E3","Khám video"],["E4","Chưa kết nối"]]},
    {name:"Sau khám",items:[["F1","Thanh toán"],["F2","Đơn / kết quả"],["F3","Xét nghiệm cần làm"],["F4","Hỏi phòng khám"]]},
    {name:"Tài khoản",items:[["G1","Hồ sơ / người thân"],["G2","Thông báo"],["G3","Cài đặt"]]}
  ];
  const description={
    A1:["Xác thực bằng số điện thoại và OTP mẫu.","OTP autofill, hỗ trợ khi không nhận mã."],
    A2:["Tạo hồ sơ tối thiểu lần đầu.","Không tự gộp hồ sơ bị nghi trùng."],
    B1:["Hành động và lịch gần nhất rõ ràng.","Hiển thị đúng người khám và hotline."],
    C1:["Chọn đúng người được khám.","Đặt hộ khác với xem dữ liệu y tế."],
    C2:["Lý do khám và sàng lọc theo người.","Chỉ dùng lựa chọn mô phỏng, không có quy tắc chẩn đoán."],
    C3:["Chặn tự đặt lịch khi cần đánh giá nguy cơ.","Nội dung thật cần bác sĩ duyệt; không chẩn đoán."],
    C4:["Chọn hình thức, ngày giờ và điểm khám.","Slot chỉ là dữ liệu mô phỏng, phải kiểm tra server."],
    C5:["Xác nhận thông tin trước khi ghi lịch.","Server unknown không được báo thành công."],
    C6:["Xác nhận lịch chỉ khi có record thành công.","Có mã và thông tin người được khám."],
    D1:["Danh sách lịch theo trạng thái.","Lịch bị hủy tách khỏi lịch sắp đến."],
    D2:["Tình trạng hiện tại, ai giữ việc, bước tiếp theo.","Trạng thái lịch khác trạng thái xét nghiệm."],
    D3:["Hủy / đổi lịch kèm ghi lịch sử.","Không báo đã hủy khi chưa có xác nhận."],
    E1:["Tình trạng tiếp nhận, số thứ tự.","Số tiếp nhận khác số chờ khám."],
    E2:["Kiểm tra camera, micro và mạng trước khám.","Bác sĩ/điều dưỡng là bên chủ động liên hệ."],
    E3:["Vùng video và nút điều khiển.","Thoát video không ký/khóa lượt khám."],
    E4:["Nhánh không liên hệ được hoặc mất mạng.","Có phương án gọi lại/đặt lại."],
    F1:["Thanh toán theo các trạng thái độc lập.","QR không đồng nghĩa đã thanh toán."],
    F2:["Tình trạng kết quả và đơn thuốc.","Quyền xem của người thân được kiểm tra."],
    F3:["Các xét nghiệm đang cần thực hiện.","Hướng dẫn từng loại chỉ dùng bản clinic duyệt."],
    F4:["Hotline và yêu cầu gọi lại.","Không hứa SLA khi chưa được cơ sở xác nhận."],
    G1:["Hồ sơ người bệnh và phạm vi đặt hộ.","Đặt hộ không mặc định xem kết quả."],
    G2:["Thông báo tối thiểu có deep link đúng đối tượng.","Không lộ dữ liệu sức khỏe trên lockscreen."],
    G3:["Cài đặt trợ năng và quyền riêng tư.","Điều khiển cỡ chữ ở bản mẫu, policy chờ duyệt."]
  };
  const $=(id)=>document.getElementById(id);
  function esc(x){return String(x==null?"":x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");}
  function person(){return m.person==="self"?"Tôi (hồ sơ mẫu)":"Mẹ (hồ sơ mẫu)";}
  function status(text,kind=""){return `<span class="tag ${kind}">${esc(text)}</span>`;}
  function btn(text,action,variant="primary",value="",disabled=false){return `<button type="button" class="${variant}" data-action="${esc(action)}" data-value="${esc(value)}" ${disabled?"disabled":""}>${esc(text)}</button>`;}
  function box(title,body,type=""){return `<section class="box ${type}">${title?`<div class="box-title">${esc(title)}</div>`:""}${body}</section>`;}
  function p(txt,cl=""){return `<p class="${cl}">${esc(txt)}</p>`;}
  function heading(title,lead="",step=""){return `${step?`<div class="mini-step">${esc(step)}</div>`:""}<h2>${esc(title)}</h2>${lead?`<p class="lead">${esc(lead)}</p>`:""}`;}
  function context(){return `<div class="context"><span>Người đi khám: <strong>${esc(person())}</strong></span><button class="text-link" type="button" data-action="goC1">Đổi</button></div>`;}
  function help(){return `${btn("Gọi / hỏi phòng khám","openHelp","secondary")}${p("Bản mẫu không gọi điện thật; cần cấu hình hotline chính thức.","hint")}`;}
  function apt(){return m.appointment||{id:"DEMO-FIXTURE",patientId:"patient-self",mode:"onsite",slot:"09:00",status:"confirmed"};}
  function back(){return btn("← Quay lại","goBack","tertiary");}
  function currentBookingOk(){return m.appointment && M.mayEnter(m,"C6");}

  function screenBody(id){
    switch(id){
      case "A1":
        return heading("Đăng nhập CareFlow","Đặt lịch, theo dõi lượt khám và liên hệ phòng khám.","A1 · BẮT ĐẦU")
        +box("Số điện thoại",`<label class="field-label" for="phone-input">Số điện thoại</label><input id="phone-input" type="tel" autocomplete="tel" data-field="phone" value="${esc(ui.phone)}" placeholder="09xxxxxxxx" /><label class="field-label" for="otp-input">Mã OTP</label><input id="otp-input" inputmode="numeric" type="text" maxlength="6" autocomplete="one-time-code" data-field="otp" value="${esc(ui.otp)}" /><p class="hint">Bản demo: dùng mã 123456, không gửi SMS.</p>`)
        +btn("Tiếp tục","login")+btn("Tạo hồ sơ mới","goA2","secondary")+help();
      case "A2":
        return heading("Tạo hồ sơ bệnh nhân","Chỉ nhập thông tin cần thiết để bắt đầu.","A2 · HỒ SƠ")
        +box("Thông tin mẫu",`<label class="field-label" for="name-input">Họ và tên</label><input id="name-input" data-field="fullName" value="${esc(ui.fullName)}" /><div class="callout">Cần quy tắc rà trùng và bộ trường bắt buộc do phòng khám xác nhận trước triển khai thật.</div>`)
        +btn("Tạo hồ sơ (mô phỏng)","createProfile")+back();
      case "B1":
        return heading("Chào bạn 👋","Mọi việc quan trọng cho lần khám tiếp theo.","B1 · TRANG CHỦ")
        +box("Lịch khám sắp tới",`<div class="row">${status(m.appointment?"Lịch demo đã xác nhận":"Lịch minh họa")}${status("Trực tiếp")}</div><h3>${esc(m.appointment?person():"Chưa có lịch được tạo ở bản demo")}</h3><p class="muted">${m.appointment?"20/10/2026 · "+esc(m.appointment.slot):"Đặt lịch để xem trạng thái tại đây."}</p>${btn("Xem chi tiết lịch","goD2","secondary")}`)
        +btn("＋ Đặt lịch khám","startBooking")
        +box("Lối tắt",`${btn("Hồ sơ và người thân","goG1","secondary")}${btn("Kết quả / đơn thuốc","goF2","secondary")}`)
        +help();
      case "C1":
        return heading("Ai đi khám?","Chọn đúng người được khám trước khi nhập lý do.","C1 · BƯỚC 1/4")
        +`<button class="choice ${m.person==="self"?"selected":""}" data-action="selectPerson" data-value="self"><strong>○ Tôi</strong><small>Đặt lịch cho chính mình</small></button>`
        +`<button class="choice ${m.person==="relative"?"selected":""}" data-action="selectPerson" data-value="relative"><strong>○ Mẹ (hồ sơ mẫu)</strong><small>Đã liên kết · Quyền đặt lịch ${m.canBookRelative?"đã có":"đã thu hồi"}</small></button>`
        +box("Quyền người thân",`${p("Được đặt hộ không đồng nghĩa được phép xem kết quả xét nghiệm.","hint")}${btn("Kiểm tra quyền người thân","goG1","secondary")}`,"dashed")
        +btn("Tiếp tục","nextPerson")+back();
      case "C2":
        return heading("Lý do khám","Một vài thông tin để phòng khám chuẩn bị. Bộ câu hỏi chính thức cần bác sĩ duyệt.","C2 · BƯỚC 2/4")
        +context()
        +`<label class="field-label" for="reason-input">Lý do khám (mẫu)</label><textarea id="reason-input" data-field="reason" placeholder="Nhập mô tả ngắn (không dùng thông tin sức khỏe thật)">${esc(ui.reason)}</textarea>`
        +box("Sàng lọc — chỉ mô phỏng tương tác",`<p class="hint">Hai lựa chọn bên dưới là dữ liệu kịch bản kiểm thử, không phải câu hỏi sàng lọc lâm sàng.</p><button class="choice ${ui.choice==="normal"?"selected":""}" data-action="chooseScreening" data-value="normal"><strong>○ Không kích hoạt cảnh báo mô phỏng</strong><small>Đi tiếp chọn hình thức khám</small></button><button class="choice ${ui.choice==="warning"?"selected":""}" data-action="chooseScreening" data-value="warning"><strong>○ Kích hoạt cảnh báo mô phỏng</strong><small>Chuyển màn C3 để kiểm tra an toàn</small></button>`)
        +btn("Tiếp tục","nextScreening")+back();
      case "C3":
        return heading("Cần hỗ trợ từ nhân viên y tế","Màn cảnh báo là bản phác thảo giao diện, không phải công cụ đánh giá sức khỏe.","C3 · CẢNH BÁO")
        +box("⚠️ Quy trình đặt lịch tự động tạm dừng",`<p>Trong tình huống được đánh dấu, hệ thống cần chuyển sang hướng dẫn hỗ trợ do chuyên môn phê duyệt.</p><p class="hint">Không đưa lời khuyên chẩn đoán và không tự xác định bệnh nhân có thể khám trực tuyến.</p>`,"warning")
        +btn("Hỗ trợ khẩn cấp (chưa cấu hình)","emergencyPlaceholder")
        +btn("Gọi phòng khám (chưa cấu hình)","openHelp","secondary")
        +btn("Xem lại thông tin đã nhập","goC2","tertiary")
        +box("Yêu cầu phê duyệt",p("Thông điệp cảnh báo, số điện thoại khẩn cấp và quy tắc nhân viên xử lý phải được phòng khám xác nhận.","hint"),"dashed");
      case "C4":
        return heading("Chọn lịch khám","Các ngày giờ dưới đây hoàn toàn giả lập.","C4 · BƯỚC 3/4")
        +context()
        +box("Hình thức khám",`<button class="choice ${m.mode==="onsite"?"selected":""}" data-action="chooseMode" data-value="onsite"><strong>Khám trực tiếp</strong><small>Đến phòng khám</small></button><button class="choice ${m.mode==="online"?"selected":""}" data-action="chooseMode" data-value="online"><strong>Khám trực tuyến</strong><small>Chỉ nếu đủ điều kiện theo phòng khám</small></button>`)
        +box("Ngày 20/10/2026 · Slot mô phỏng",`<button class="choice ${m.slot==="09:00"?"selected":""}" data-action="chooseSlot" data-value="09:00"><strong>09:00</strong><small>Khung giờ mẫu</small></button><button class="choice ${m.slot==="14:30"?"selected":""}" data-action="chooseSlot" data-value="14:30"><strong>14:30</strong><small>Khung giờ mẫu</small></button>${m.slotUnavailable?`<p class="notice note-error">Khung giờ trước đó không còn trống. Vui lòng chọn giờ khác.</p>`:""}`)
        +btn("Tiếp tục","nextSlot","primary","",!m.slot)+back();
      case "C5":
        return heading("Kiểm tra thông tin","Xác nhận đúng người khám và lịch trước khi gửi.","C5 · BƯỚC 4/4")
        +context()
        +box("Thông tin đặt lịch",`<dl class="review"><dt>Người được khám</dt><dd>${esc(person())}</dd><dt>Hình thức</dt><dd>${m.mode==="online"?"Khám trực tuyến":"Khám trực tiếp"}</dd><dt>Ngày / giờ</dt><dd>20/10/2026 · ${esc(m.slot||"Chưa chọn")}</dd><dt>Lý do</dt><dd>${esc(ui.reason||"Chưa có ghi chú")}</dd><dt>Chi phí</dt><dd>Chờ phòng khám xác nhận (mẫu)</dd></dl>${btn("Chỉnh người khám","goC1","secondary")}${btn("Đổi ngày giờ","goC4","secondary")}`)
        +(m.bookingError==="SLOT_UNAVAILABLE"?box("Giờ khám không còn trống",p("Hệ thống không tạo lịch. Hãy chọn khung giờ khác.")+btn("Chọn giờ khác","goC4"),"warning"):"")
        +(m.bookingPending?box("Chưa xác định đã đặt thành công",p("Không nhấn gửi lần nữa cho tới khi kiểm tra kết quả gửi trước đó.")+btn("Kiểm tra trạng thái yêu cầu","checkUnknown"),"warning"):"")
        +btn("Xác nhận đặt lịch","confirmBooking","primary","",!!m.bookingPending||!m.slot)
        +`<p class="hint">Mọi phản hồi trên bản mẫu là giả lập; không phát sinh lịch thật.</p>`+back();
      case "C6":
        if(!currentBookingOk())return heading("Chưa có lịch được xác nhận","Màn thành công chỉ xuất hiện khi nhận xác nhận của hệ thống.","C6 · TRẠNG THÁI ĐƯỢC BẢO VỆ")
          +box("Không thể hiển thị thành công",p("Hãy hoàn thành các bước đặt lịch trước; không hiển thị mã lịch giả như đã đặt thật.","hint"),"dashed")
          +btn("Bắt đầu đặt lịch","startBooking");
        return heading("Đặt lịch thành công","Hệ thống mô phỏng đã xác nhận yêu cầu.","C6 · ĐÃ XÁC NHẬN")
          +box("✓ Lịch demo đã được tạo",`<div class="big-num">${esc(m.appointment.id)}</div><p><strong>${esc(person())}</strong></p><p>20/10/2026 · ${esc(m.appointment.slot)} · ${m.appointment.mode==="onsite"?"Tại phòng khám":"Online"}</p>${status("Confirmed · Demo","success")}`,"emphasis")
          +btn("Xem chi tiết lịch","goD2")+btn("Về trang chủ","goB1","secondary")+help();
      case "D1":
        return heading("Lịch hẹn của tôi","Theo dõi lịch sắp tới và lịch đã qua.","D1 · LỊCH HẸN")
          +box(m.appointment?"Lịch đã tạo (mẫu)":"Lịch hiển thị minh họa",`<p><strong>${esc(m.appointment?person():"Hồ sơ mẫu")}</strong></p><p>20/10/2026 · ${esc(apt().slot)} </p>${status(m.lastAppointmentCancelled?"Đã hủy":apt().status)}${btn("Xem lịch hẹn","goD2","secondary")}`)
          +btn("Đặt lịch mới","startBooking")+help();
      case "D2":
        return heading("Chi tiết lịch khám","Bước tiếp theo và bộ phận đang xử lý.","D2 · CHI TIẾT LỊCH")
          +box("Lượt khám (mẫu)",`<div class="row"><strong>${esc(m.appointment?person():"Người bệnh mẫu")}</strong>${status(m.lastAppointmentCancelled?"Đã hủy":"Đã xác nhận")}</div><p class="muted">20/10/2026 · ${esc(apt().slot)}</p><div class="timeline"><div>Đã có lịch<small>Bộ phận: đặt lịch</small></div><div class="current">${m.queue==="checked_in"?"Đã tiếp nhận":"Chờ đến phòng khám"}<small>Bộ phận: lễ tân</small></div><div>Chờ bác sĩ khám<small>Chưa đến bước này (mô phỏng)</small></div></div>`)
          +btn("Check-in và số thứ tự","goE1","secondary")
          +btn("Chuẩn bị khám trực tuyến","goE2","secondary")
          +btn("Thanh toán","goF1","secondary")
          +btn("Xem kết quả / đơn thuốc","goF2","secondary")
          +btn("Hủy hoặc đổi lịch","goD3","secondary")+help();
      case "D3":
        return heading("Hủy hoặc đổi lịch","Mọi thay đổi cần được hệ thống phòng khám xác nhận.","D3 · THAY ĐỔI")
          +box("Lịch hiện tại",`<p>20/10/2026 · ${esc(apt().slot)} · ${esc(person())}</p><label class="field-label" for="cancel-reason">Lý do hủy (mô phỏng)</label><input id="cancel-reason" data-field="cancelReason" value="${esc(ui.cancelReason)}" placeholder="Chọn / nhập lý do" />`)
          +btn("Đổi ngày giờ","goC4","secondary")+btn("Gửi yêu cầu hủy (demo)","cancelAppointment")
          +p("Bản thực cần lưu lý do, history, policy phí, thời hạn hủy.","hint")+back();
      case "E1":
        return heading("Check-in tại phòng khám","Xem bạn đã làm thủ tục chưa và đang chờ bước nào.","E1 · TRỰC TIẾP")
          +context()
          +box("Trạng thái tiếp nhận",`${status(m.queue==="checked_in"?"Đã tiếp nhận":"Chưa check-in")}<div class="two"><div><span class="meta">Số tiếp nhận</span><span class="big-num">A012</span></div><div><span class="meta">Số chờ khám</span><span class="big-num">05</span></div></div><p class="hint">Hai số trên là dữ liệu minh họa, không phải hàng đợi thực tế.</p>`)
          +btn("Đánh dấu check-in (demo)","checkin")+btn("Xem chi tiết lịch","goD2","secondary")+help();
      case "E2":
        return heading("Chuẩn bị khám online","Bác sĩ hoặc điều dưỡng sẽ liên hệ theo lịch.","E2 · KIỂM TRA THIẾT BỊ")
          +context()
          +box("Trước khi tham gia",`<p>□ Có kết nối Internet</p><p>□ Cho phép camera và micro</p><p>□ Đang ở nơi yên tĩnh, riêng tư</p><div class="wire photo">[ VÙNG XEM CAMERA — DEMO ]</div><p class="hint">Kiểm tra quyền thật chỉ thực hiện khi tích hợp SDK.</p>`)
          +btn("Tôi đã sẵn sàng (mẫu)","joinVideo")
          +btn("Không tham gia được","goE4","secondary")+help();
      case "E3":
        return heading("Buổi khám trực tuyến","Video chỉ là vùng giữ chỗ, không ghi âm / ghi hình.","E3 · KHÁM VIDEO")
          +`<div class="placeholder-video">[ VIDEO PLACEHOLDER ]<br>Không có cuộc gọi thật</div>`
          +`<div class="video-controls">${btn(ui.videoMic?"Tắt micro":"Bật micro","toggleMic","secondary")}${btn(ui.videoCamera?"Tắt camera":"Bật camera","toggleCamera","secondary")}</div>`
          +btn("Mô phỏng mất kết nối","dropCall","secondary")
          +btn("Kết thúc xem bản mẫu","endVideo","tertiary");
      case "E4":
        return heading("Chưa kết nối được","Bạn vẫn có thể chọn phương án liên hệ phòng khám.","E4 · XỬ LÝ NGOẠI LỆ")
          +box("Không thể tiếp tục cuộc gọi",`${status(m.video==="dropped"?"Cuộc gọi bị gián đoạn":"Chưa liên hệ được")}<p>Thông tin lịch hẹn vẫn được giữ lại (bản mẫu).</p><p class="hint">Cần phân biệt cuộc gọi rớt mạng và phòng khám không liên hệ được.</p>`,"warning")
          +btn("Thử kết nối lại","retryVideo")
          +btn("Yêu cầu phòng khám gọi lại","goF4","secondary")
          +btn("Xem lịch / chuyển khám trực tiếp","goD2","secondary")+help();
      case "F1":
        return heading("Thanh toán","Số tiền và QR dưới đây chỉ là vùng giữ chỗ.","F1 · VIỆN PHÍ")
          +box("Khoản thanh toán minh họa",`<div class="row"><span>Khám bệnh (mẫu)</span><strong>— đ</strong></div><p class="hint">Không đưa số tiền giả như báo giá thực tế.</p><div class="qr">[ QR PLACEHOLDER ]<br>Không quét</div>${status(m.payment==="pending_reconciliation"?"Đang xác nhận":m.payment==="paid"?"Đã xác nhận":"Chưa thanh toán")}`)
          +btn("Mô phỏng đã quét QR","beginPayment")
          +p("Quét QR ≠ đã trả. Chỉ hệ thống đối soát được xác nhận thành công.","hint")+help();
      case "F2":
        return heading("Đơn thuốc & kết quả","Thông tin chỉ hiển thị trong phạm vi được phép.","F2 · SAU KHÁM")
          +context()
          +box("Kết quả xét nghiệm",`${status(m.result==="reviewed"?"Bác sĩ đã xem":"Chờ bác sĩ xem")}<p class="hint">Bác sĩ đã xem khác với bệnh nhân đã được truyền đạt thông tin.</p><div class="wire photo">[ KẾT QUẢ GIẢ LẬP, KHÔNG CÓ GIÁ TRỊ Y TẾ ]</div>${btn("Xem tài liệu (demo)","viewResult","secondary")}`)
          +box("Đơn thuốc / kết luận",p("Nội dung kết luận chỉ xuất hiện khi người có thẩm quyền đã phát hành và người xem có quyền truy cập.","hint"),"dashed")
          +btn("Xét nghiệm cần làm","goF3","secondary")+btn("Hỏi phòng khám","openHelp","secondary");
      case "F3":
        return heading("Xét nghiệm cần làm","Theo dõi trạng thái chỉ định và chuẩn bị.","F3 · CẬN LÂM SÀNG")
          +context()
          +box("Chỉ định mẫu",`<p><strong>Xét nghiệm A (placeholder)</strong></p><div class="timeline"><div>Đã chỉ định</div><div class="current">Chờ thực hiện</div><div>Có kết quả</div><div>Bác sĩ xem</div></div><p class="hint">Hướng dẫn chuẩn bị cụ thể phải do phòng khám phê duyệt.</p>`)
          +btn("Xem kết quả và đơn thuốc","goF2","secondary")+help();
      case "F4":
        return heading("Liên hệ phòng khám","Bản mẫu chưa cấu hình số điện thoại của cơ sở.","F4 · HỖ TRỢ")
          +box("Gọi phòng khám",`${p("Số hotline thực tế: chưa cấu hình", "muted")}${btn("Xem số hotline (chưa cấu hình)","callPlaceholder","secondary")}`)
          +box("Yêu cầu gọi lại",`${status(m.callback==="pending"?"Đã nhận yêu cầu (demo)":"Chưa gửi yêu cầu")}<p>Đội phụ trách: điều phối viên (theo quy trình dự kiến).</p>${btn("Gửi yêu cầu gọi lại (demo)","requestCallback")}`)
          +back();
      case "G1":
        return heading("Hồ sơ & người thân","Xem người đã liên kết và quyền thao tác.","G1 · HỒ SƠ")
          +box("Hồ sơ của tôi",`<p><strong>Tôi (mẫu)</strong></p>${status("Chủ hồ sơ")}${btn("Đặt lịch cho tôi","bookSelf","secondary")}`)
          +box("Hồ sơ người thân",`<p><strong>Mẹ (mẫu)</strong></p>${status(m.canBookRelative?"Có quyền đặt hộ":"Không có quyền đặt hộ")}${status(m.canViewRelativeResults?"Được xem kết quả":"Không được xem kết quả")}<div class="callout">Quyền đặt lịch và xem hồ sơ là hai quyền khác nhau.</div>${btn("Đặt lịch cho mẹ","bookRelative","secondary")}${btn("Mô phỏng thu hồi / cấp quyền đặt hộ","toggleRelativeBook","tertiary")}`)
          +btn("Cài đặt","goG3","secondary");
      case "G2":
        return heading("Thông báo","Thông báo không hiển thị thông tin y tế nhạy cảm trên màn khóa.","G2 · THÔNG BÁO")
          +box("Cập nhật lịch hẹn",`<p>Có cập nhật từ phòng khám (mẫu).</p>${btn("Mở chi tiết lịch","goD2","secondary")}`)
          +box("Có kết quả từ phòng khám",`<p>Đăng nhập để xem nội dung được phép (mẫu).</p>${btn("Mở kết quả với quyền hiện tại","notificationResult","secondary")}`)
          +help();
      case "G3":
        return heading("Cài đặt","Hiển thị, hỗ trợ, thông báo và quyền riêng tư.","G3 · CÀI ĐẶT")
          +box("Khả năng tiếp cận",`${btn(ui.largeText?"Tắt chữ lớn mẫu":"Bật chữ lớn mẫu","toggleLargeText","secondary")}<p class="hint">Bản sản phẩm thật dùng Dynamic Type / font scaling theo iOS/Android.</p>`)
          +box("Quyền riêng tư",`<p class="hint">Phân quyền người thân · lịch sử đồng ý · kênh nhắc lịch — cần xác nhận với privacy/legal.</p>${btn("Quản lý hồ sơ người thân","goG1","secondary")}`)
          +help();
      default:
        return heading("Không tìm thấy màn hình","ID không hợp lệ.")+btn("Về trang chủ","goB1");
    }
  }
  function tabFooter(){
    if(["A1","A2","C1","C2","C3","C4","C5","C6","E2","E3","E4"].includes(ui.current))return "";
    const tabs=[["B1","⌂","Trang chủ"],["D1","▤","Lịch khám"],["G1","◯","Hồ sơ"],["G2","◇","Thông báo"]];
    return `<nav class="phone-footer" aria-label="Điều hướng chính">${tabs.map(x=>`<button type="button" data-screen="${x[0]}" class="${ui.current===x[0]?"active":""}"><span aria-hidden="true">${x[1]}</span>${x[2]}</button>`).join("")}</nav>`;
  }
  function scenarioButtons(){
    return [
      ["self","01 · Tự đặt lịch"],
      ["proxy","02 · Đặt hộ người thân"],
      ["warning","03 · Có cảnh báo"],
      ["slot","04 · Giờ khám đã hết"],
      ["unknown","05 · Mất phản hồi mạng"]
    ].map(s=>`<button type="button" class="scenario" data-scenario="${s[0]}">${s[1]}</button>`).join("");
  }
  function renderMenus(){
    $("scenario-menu").innerHTML=scenarioButtons();
    $("screen-menu").innerHTML=groups.map(g=>`<div class="group-label">${esc(g.name)}</div>${g.items.map(s=>`<button type="button" class="screen-nav ${ui.current===s[0]?"active":""}" data-screen="${s[0]}" ${ui.current===s[0]?'aria-current="page"':""}><span class="code-label">${s[0]}</span>${esc(s[1])}</button>`).join("")}`).join("");
  }
  function render(){
    renderMenus();
    $("phone-content").innerHTML=(ui.notice?`<div class="notice ${/không|lỗi|thiếu|tạm|hết|chưa/i.test(ui.notice)?"note-error":""}" role="status">${esc(ui.notice)}</div>`:"")+screenBody(ui.current);
    $("phone-screen-tag").textContent=ui.current;
    $("phone-footer").innerHTML=tabFooter();
    $("demo-outcome").value=ui.bookingOutcome;
    const d=description[ui.current]||["",""];
    $("inspector-content").innerHTML=`<div class="tag">SCREEN ${esc(ui.current)}</div><dl><dt>Mục tiêu</dt><dd>${esc(d[0])}</dd><dt>Điều kiện / rủi ro</dt><dd>${esc(d[1])}</dd><dt>Người được khám</dt><dd>${esc(person())}</dd><dt>Sàng lọc mô phỏng</dt><dd>${esc(m.screening||"Chưa chọn")}${m.risk?" (đang khóa đặt lịch)":""}</dd><dt>Kết quả booking</dt><dd>${esc(m.appointment?"Confirmed demo: "+m.appointment.id:(m.bookingPending?"Chưa rõ, chờ kiểm tra":"Chưa được xác nhận"))}</dd><dt>Thanh toán mẫu</dt><dd>${esc(m.payment)}</dd></dl><p class="small muted">Các nhãn và trạng thái là mô phỏng thiết kế, không kết nối phòng khám.</p>`;
    $("phone-frame").classList.toggle("danger-mode",ui.current==="C3");
    $("announcer").textContent=`${ui.current}: ${d[0]} ${ui.notice}`;
  }
  function nav(screen){
    ui.notice="";
    if((m.risk&&["C4","C5","C6"].includes(screen))|| (screen==="C6"&&!M.mayEnter(m,"C6")&&m.risk)){
      ui.notice="Đã có cảnh báo: phải có nhân viên y tế xem xét trước khi tiếp tục.";
      ui.current="C3";render();return;
    }
    if(!M.SCREENS.includes(screen)){ui.notice="Không tìm thấy màn hình.";render();return;}
    ui.current=screen;
    render();
    $("phone-main").scrollTop=0;
    $("phone-main").focus({preventScroll:true});
  }
  function resetScenario(id){
    m=M.initial();
    ui={...ui,current:"A1",scenario:id,notice:"",phone:"0900000000",otp:"123456",reason:"",choice:"",bookingOutcome:"success",cancelReason:"",lastHelpFrom:"B1",videoMic:true,videoCamera:true};
    if(id==="proxy"){M.choosePerson(m,"relative");ui.current="C1";ui.notice="Kịch bản: đặt lịch cho mẹ. Kiểm tra quyền đặt hộ và quyền xem kết quả.";}
    if(id==="warning"){ui.current="C2";ui.choice="warning";ui.notice="Kịch bản: chọn lựa chọn cảnh báo, sau đó thử quay lại và tiếp tục đặt lịch.";}
    if(id==="slot"||id==="unknown"){M.screening(m,"normal");m.slot="09:00";ui.current="C5";ui.bookingOutcome=id==="slot"?"slot_unavailable":"network_unknown";ui.notice=id==="slot"?"Kịch bản: hệ thống báo giờ khám đã hết.":"Kịch bản: phản hồi đặt lịch chưa rõ (mất mạng).";}
    if(id==="self"){ui.notice="Đăng nhập với số mẫu và OTP 123456, sau đó chọn Đặt lịch khám.";}
    render();
  }
  function show(msg){ui.notice=msg;render();}
  function handle(action,value){
    switch(action){
      case "login":
        if(!/^0\d{9,10}$/.test(ui.phone)||ui.otp!=="123456")return show("Số điện thoại mẫu hoặc OTP không hợp lệ. Mã demo: 123456.");
        return nav("B1");
      case "goA2":return nav("A2");
      case "createProfile":return nav("B1");
      case "startBooking":if(m.risk)return nav("C3");m=M.initial();ui.reason="";ui.choice="";return nav("C1");
      case "selectPerson":M.choosePerson(m,value);ui.reason="";ui.choice="";return show("Đã chọn "+person()+". Thông tin lý do khám trước đó đã được xóa.");
      case "nextPerson":if(!M.canBook(m))return show("Chưa có quyền đặt lịch cho hồ sơ người thân này. Hãy liên hệ phòng khám.");return nav("C2");
      case "chooseScreening":ui.choice=value;return render();
      case "nextScreening":
        m.reason=ui.reason;
        {const r=M.screening(m,ui.choice);if(!r.ok)return show("Vui lòng chọn một tình huống mô phỏng.");return nav(r.next);}
      case "chooseMode":m.mode=value;return render();
      case "chooseSlot":m.slot=value;m.slotUnavailable=false;m.bookingError="";if(ui.bookingOutcome==="slot_unavailable")ui.bookingOutcome="success";return render();
      case "nextSlot":if(!m.slot)return show("Vui lòng chọn giờ khám.");return nav("C5");
      case "confirmBooking":
        {const r=M.attemptBooking(m,ui.bookingOutcome);
          if(r.ok)return nav("C6");
          if(r.code==="SLOT_UNAVAILABLE")return show("Giờ khám vừa hết. Chưa có lịch nào được tạo.");
          if(r.code==="UNCONFIRMED_REQUEST")return show("Chưa rõ yêu cầu đã đến máy chủ. Cần kiểm tra trước khi thử lại.");
          if(r.code==="CLINICAL_REVIEW_REQUIRED")return nav("C3");
          if(r.code==="NO_BOOK_PERMISSION")return show("Không có quyền đặt lịch cho hồ sơ người thân.");
          return show("Chưa thể xác nhận đặt lịch: "+r.code);}
      case "checkUnknown":
        {const r=M.resolveUnknown(m,false);if(r.ok){ui.bookingOutcome="success";return show("Mô phỏng: máy chủ chưa ghi nhận lịch. Có thể thử gửi lại sau khi kiểm tra.");}return show("Không có yêu cầu đang chờ kiểm tra.");}
      case "goBack":
        return nav(({A2:"A1",C1:"B1",C2:"C1",C4:"C2",C5:"C4",F4:ui.lastHelpFrom,D3:"D2"}[ui.current])||"B1");
      case "openHelp":ui.lastHelpFrom=ui.current;return nav("F4");
      case "callPlaceholder":return show("Bản demo không được cấu hình hotline và không thực hiện cuộc gọi thật.");
      case "emergencyPlaceholder":return show("Chế độ demo không gọi cấp cứu. Nội dung, địa chỉ và đường liên hệ khẩn cấp thực tế phải được người phụ trách chuyên môn cấu hình, phê duyệt.");
      case "goC1":return nav("C1");
      case "goC2":return nav("C2");
      case "goC4":return nav("C4");
      case "goB1":return nav("B1");
      case "goD2":return nav("D2");
      case "goD3":return nav("D3");
      case "goE1":return nav("E1");
      case "goE2":return nav("E2");
      case "goE4":m.video="unreachable";return nav("E4");
      case "goF1":return nav("F1");
      case "goF2":return nav("F2");
      case "goF3":return nav("F3");
      case "goF4":ui.lastHelpFrom=ui.current;return nav("F4");
      case "goG1":return nav("G1");
      case "goG3":return nav("G3");
      case "cancelAppointment":
        if(!ui.cancelReason.trim())return show("Vui lòng nhập lý do hủy trong bản mẫu.");
        m.lastAppointmentCancelled=true;
        if(m.appointment)m.appointment.status="cancelled";
        return show("Đã mô phỏng hủy và ghi lý do. Phần mềm thật cần xác nhận từ máy chủ.");
      case "checkin":m.queue="checked_in";return show("Check-in đã được mô phỏng. Hai loại số thứ tự vẫn tách biệt.");
      case "joinVideo":m.video="connected";return nav("E3");
      case "toggleMic":ui.videoMic=!ui.videoMic;return render();
      case "toggleCamera":ui.videoCamera=!ui.videoCamera;return render();
      case "dropCall":m.video="dropped";return nav("E4");
      case "retryVideo":m.video="waiting";return nav("E2");
      case "endVideo":return nav("D2");
      case "beginPayment":M.startPayment(m);return show("Đang xác nhận thanh toán. Quét QR không tự thành đã thu.");
      case "viewResult":
        if(!M.canViewResults(m))return show("Hồ sơ người thân chưa có quyền xem kết quả. Thông tin được giữ riêng tư.");
        return show("Đây là bản mẫu không có kết quả y tế thật. Trạng thái hiện tại: "+m.result);
      case "notificationResult":
        if(!M.canViewResults(m))return show("Không có quyền xem kết quả của hồ sơ này. Không thể mở từ thông báo.");
        return nav("F2");
      case "requestCallback":M.requestCallback(m);return show("Đã nhận yêu cầu gọi lại trong bản mô phỏng. Không có ticket thật.");
      case "bookSelf":M.choosePerson(m,"self");ui.choice="";ui.reason="";return nav("C1");
      case "bookRelative":M.choosePerson(m,"relative");ui.choice="";ui.reason="";return nav("C1");
      case "toggleRelativeBook":m.canBookRelative=!m.canBookRelative;return render();
      case "toggleLargeText":ui.largeText=!ui.largeText;document.body.classList.toggle("large-text",ui.largeText);return render();
      case "runSmokeTests":return runSmokeTests();
      default:return show("Hành động chưa được mô phỏng: "+action);
    }
  }
  function runSmokeTests(){
    const cases=[];
    function assert(name,fn){try{if(!fn())throw Error("Assertion failed");cases.push([name,true]);}catch(e){cases.push([name,false]);}}
    assert("Có đủ 23 màn hình",()=>M.SCREENS.length===23);
    assert("Đặt lịch bình thường",()=>{let s=M.initial();M.screening(s,"normal");return M.attemptBooking(s).ok;});
    assert("Đặt hộ đúng patientId",()=>{let s=M.initial();M.choosePerson(s,"relative");M.screening(s,"normal");s.slot="14:30";return M.attemptBooking(s).appointment?.patientId==="patient-relative";});
    assert("Đặt hộ không tự xem kết quả",()=>{let s=M.initial();M.choosePerson(s,"relative");return !M.canViewResults(s);});
    assert("Đã thu hồi quyền đặt hộ bị chặn",()=>{let s=M.initial();M.choosePerson(s,"relative");s.canBookRelative=false;M.screening(s,"normal");s.slot="09:00";return M.attemptBooking(s).code==="NO_BOOK_PERMISSION";});
    assert("Có cảnh báo không mở C4/C6",()=>{let s=M.initial();M.screening(s,"warning");return !M.mayEnter(s,"C4")&&!M.mayEnter(s,"C6");});
    assert("Có cảnh báo không gửi booking",()=>{let s=M.initial();M.screening(s,"warning");return M.attemptBooking(s).code==="CLINICAL_REVIEW_REQUIRED";});
    assert("Quay lại đổi câu trả lời không bỏ qua cảnh báo",()=>{let s=M.initial();M.screening(s,"warning");return M.screening(s,"normal").next==="C3";});
    assert("Hết slot không tạo appointment",()=>{let s=M.initial();M.screening(s,"normal");return M.attemptBooking(s,"slot_unavailable").code==="SLOT_UNAVAILABLE"&&!s.appointment;});
    assert("Mất mạng không hiện thành công",()=>{let s=M.initial();M.screening(s,"normal");M.attemptBooking(s,"network_unknown");return !s.appointment&&!M.mayEnter(s,"C6");});
    assert("Không gửi booking trùng khi chưa rõ",()=>{let s=M.initial();M.screening(s,"normal");M.attemptBooking(s,"network_unknown");return M.attemptBooking(s).code==="UNCONFIRMED_REQUEST";});
    assert("Chuyển người xóa dữ liệu sàng lọc",()=>{let s=M.initial();M.screening(s,"warning");s.reason="test";M.choosePerson(s,"relative");return !s.risk&&s.reason==="";});
    assert("QR không đồng nghĩa đã thu",()=>{let s=M.initial();M.startPayment(s);return s.payment==="pending_reconciliation";});
    assert("Doctor review không đồng nghĩa informed",()=>{let s=M.initial();M.doctorReviewed(s);return s.communication==="pending";});
    assert("Deep link sai người bị chặn",()=>!M.mayOpenResultLink(M.initial(),"patient-relative"));
    const success=cases.filter(x=>x[1]).length;
    $("qa-results").innerHTML=`<p class="tag">${success}/${cases.length} PASS</p>`+cases.map(x=>`<p class="${x[1]?"qa-pass":"qa-fail"}">${x[1]?"✓":"✗"} ${esc(x[0])}</p>`).join("");
    $("announcer").textContent=`Kiểm thử ${success} trên ${cases.length} đạt`;
  }
  document.addEventListener("click",(e)=>{
    const el=e.target.closest("[data-action],[data-screen],[data-scenario]");
    if(!el)return;
    if(el.dataset.scenario)return resetScenario(el.dataset.scenario);
    if(el.dataset.screen)return nav(el.dataset.screen);
    if(el.dataset.action)return handle(el.dataset.action,el.dataset.value);
  });
  document.addEventListener("input",(e)=>{
    if(e.target.dataset.field){
      const f=e.target.dataset.field;
      if(Object.prototype.hasOwnProperty.call(ui,f))ui[f]=e.target.value;
    }
  });
  $("demo-outcome").addEventListener("change",e=>{ui.bookingOutcome=e.target.value;});
  resetScenario("self");
})();
