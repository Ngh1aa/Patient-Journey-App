/* CareFlow first Hi-Fi wave: all content/medical triage/scheduling are simulated. */
(function careflowHiFiApp(){
  "use strict";
  const M=window.CareFlowModel;
  if(!M)throw new Error("Missing CareFlow model");
  let s=M.initial();
  let ui={screen:"A1",phone:"0900000000",otp:"123456",reason:"",screeningChoice:"",outcome:"success",toast:"",theme:"light",large:false,scene:"normal",last:"B1",date:"20",authenticated:false};
  const screens=[["A1","Đăng nhập"],["B1","Trang chủ"],["C1","Ai đi khám"],["C2","Lý do & sàng lọc"],["C4","Chọn ngày giờ"],["C5","Xác nhận lịch"],["C6","Đặt lịch xong"],["D2","Chi tiết lịch"],["C3","Cảnh báo (safety)"]];
  const $=id=>document.getElementById(id);
  const clean=t=>String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
  function ico(name){
    const defs={
      logo:'<path d="M12 3v18M3 12h18"/><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" opacity=".5"/>',
      phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19 19 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1.1.35 2.2.73 3.25a2 2 0 0 1-.45 2.1L8.1 10.3a16 16 0 0 0 5.6 5.6l1.25-1.28a2 2 0 0 1 2.1-.45c1.05.38 2.14.63 3.25.73a2 2 0 0 1 1.7 2z"/>',
      calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 15h3M8 18h5"/>',
      clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
      user:'<circle cx="12" cy="8" r="4"/><path d="M5 21c0-4 3.2-7 7-7s7 3 7 7"/>',
      users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 7a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1"/>',
      check:'<path d="M5 12l5 5L20 7"/>',
      checkCircle:'<circle cx="12" cy="12" r="10"/><path d="M7 12l3.5 3.5L17.5 8.5"/>',
      shield:'<path d="M12 2l8 4v6c0 5-3.5 8.3-8 10-4.5-1.7-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/>',
      arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
      chevron:'<path d="M9 18l6-6-6-6"/>',
      back:'<path d="M15 18l-6-6 6-6"/>',
      warning:'<path d="M10.4 3.5a2 2 0 0 1 3.2 0l9 15a2 2 0 0 1-1.6 3H3a2 2 0 0 1-1.6-3z"/><path d="M12 9v5M12 18h.01"/>',
      home:'<path d="M3 11L12 3l9 8v10H3V11z"/><path d="M9 21v-7h6v7"/>',
      bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
      file:'<path d="M5 2h9l5 5v15H5z"/><path d="M14 2v5h5M8 12h8M8 16h8"/>',
      hospital:'<path d="M4 22V6h16v16M9 22v-5h6v5M12 8v6M9 11h6"/><path d="M7 6V3h10v3"/>',
      video:'<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-4v12l-6-4"/>',
      heart:'<path d="M20.8 5.7c-2.6-2.6-5.8-1.5-8.8 1.5C9 4.2 5.8 3.1 3.2 5.7c-2.4 2.5-1.7 6 1.4 9L12 22l7.4-7.3c3.1-3 3.8-6.5 1.4-9z"/>',
      edit:'<path d="M3 21l4-.7L20 7.3 16.7 4 3.7 17zM14.8 5.8l3.4 3.4"/>',
      info:'<circle cx="12" cy="12" r="10"/><path d="M12 10v7M12 7h.01"/>',
      spark:'<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>',
      support:'<circle cx="12" cy="12" r="9"/><path d="M8 9a4 4 0 0 1 8 0c0 3-4 3-4 6M12 19h.01"/>',
      location:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>'
    };
    return `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${defs[name]||defs.info}</svg>`;
  }
  const btn=(label,action,kind="primary",extra="")=>`<button type="button" class="btn ${kind}" data-action="${action}" ${extra}>${clean(label)} ${ico("arrow")}</button>`;
  const logo=()=>`<span class="logo-mini"><span>✳</span>CareFlow</span>`;
  const call=()=>`<button type="button" class="icon-btn" aria-label="Gọi phòng khám (chưa có số thực)" data-action="contact">${ico("phone")}</button>`;
  const head=(title,back="B1")=>`<div class="breadcrumb"><button type="button" class="icon-btn" aria-label="Quay lại" data-action="navigate" data-to="${back}">${ico("back")}</button><strong>${clean(title)}</strong>${call()}</div>`;
  const progress=(n)=>`<div class="steps" role="progressbar" aria-label="Tiến độ đặt lịch" aria-valuemin="1" aria-valuemax="4" aria-valuenow="${n}">${[1,2,3,4].map(i=>`<span class="${i<=n?"active":""}"></span>`).join("")}</div>`;
  const person=()=>s.person==="self"?"Nguyễn An (hồ sơ mẫu)":"Trần Hoa (người thân mẫu)";
  const context=()=>`<div class="person-context"><div class="row"><span class="mini-icon">${ico("user")}</span><div><small>Đang đặt lịch cho</small><strong>${person()}</strong></div></div><button type="button" class="link-btn" data-action="navigate" data-to="C1">Đổi</button></div>`;
  const card=(title,inner,klass="")=>`<section class="card ${klass}"><h3 class="card-title">${title}</h3>${inner}</section>`;
  const bottom=(body)=>{ $("cf-bottom").innerHTML=body; };
  const toastHtml=()=>ui.toast?`<div class="app-toast ${/không|lỗi|chưa|cảnh báo|hết/i.test(ui.toast)?"error":""}" role="status">${clean(ui.toast)}</div>`:"";
  function tabBar(active){
    const items=[["B1","home","Trang chủ"],["D2","calendar","Lịch hẹn"],["X","file","Hồ sơ"],["Y","bell","Thông báo"]];
    return `<nav class="tabbar" aria-label="Điều hướng chính">${items.map(([id,ic,txt])=>`<button type="button" ${id==="X"||id==="Y"?"disabled title='Có trong giai đoạn sau'":`data-action="navigate" data-to="${id}"`} class="${id===active?"active":""}" ${id===active?'aria-current="page"':""}>${ico(ic)}<span>${txt}</span></button>`).join("")}</nav>`;
  }
  function screen(){
    const t=ui.screen;
    if(t==="A1"){
      bottom(`<div class="stack">${btn("Đăng nhập","login")}<button type="button" class="link-btn" data-action="contact">Cần hỗ trợ đăng nhập? Liên hệ phòng khám</button></div>`);
      return `<div class="p-page greeting">${toastHtml()}<div class="top-row">${logo()}${call()}</div><div class="hero-mark">${ico("heart")}</div><p class="eyebrow">ĐỒNG HÀNH CÙNG SỨC KHỎE</p><h1 class="page-title">Chăm sóc sức khỏe<br>thật nhẹ nhàng.</h1><p class="page-lead">Đặt lịch, theo dõi buổi khám và luôn có cách liên hệ với phòng khám.</p>
      <div class="field-group"><label for="phone" class="field-label">Số điện thoại</label><input class="text-field" id="phone" type="tel" inputmode="tel" autocomplete="tel" data-field="phone" value="${clean(ui.phone)}" placeholder="Số điện thoại của bạn"></div>
      <div class="field-group"><label for="otp" class="field-label">Mã xác nhận (OTP)</label><input class="text-field" id="otp" type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="6" data-field="otp" value="${clean(ui.otp)}" placeholder="6 chữ số"></div>
      <p class="micro">Bản mô phỏng: nhập OTP <strong>123456</strong>. Không gửi SMS thật.</p>
      <div class="divider"></div><div class="auth-benefit"><span class="mini-icon">${ico("calendar")}</span><div><strong>Đặt khám nhanh</strong><p>Chọn người thân, thời gian và hình thức khám.</p></div></div>
      <div class="auth-benefit"><span class="mini-icon">${ico("shield")}</span><div><strong>Thông tin đúng người</strong><p>Quyền đặt hộ và quyền xem hồ sơ được tách riêng.</p></div></div></div>`;
    }
    if(t==="B1"){
      bottom(tabBar("B1"));
      return `<div class="p-page">${toastHtml()}<div class="top-row">${logo()}${call()}</div><p class="eyebrow">XIN CHÀO, BẠN AN 👋</p><h1 class="page-title">Hôm nay bạn thế nào?</h1><p class="page-lead">Quản lý hành trình khám trong một nơi.</p>
      <div class="home-hero"><span class="badge neutral">✳ CareFlow đồng hành</span><h2>Đặt lịch khám<br>theo cách của bạn</h2><p>Chỉ một vài bước đơn giản. Có thể đặt cho bản thân hoặc người thân.</p><button type="button" class="hero-btn" data-action="begin">Đặt lịch ngay →</button></div>
      <div class="section-label"><h3>Lịch khám của bạn</h3><span class="badge neutral">${s.appointment?"1 lịch mẫu":"Chưa có lịch"}</span></div>
      ${s.appointment?`<section class="card appointment-card"><div class="row top"><div class="appt-date"><small>THÁNG 10</small><strong>20</strong></div><div style="flex:1"><span class="badge success">${ico("checkCircle")} Đã xác nhận</span><h4>Khám bệnh · ${person()}</h4><p>Thứ Ba, 20/10/2026 · ${clean(s.appointment.slot)}</p></div></div><div class="divider"></div>${btn("Xem chi tiết lịch khám","navigate","secondary",'data-to="D2"')}</section>`:
      `<section class="card appointment-card"><div class="row"><span class="mini-icon">${ico("calendar")}</span><div><h4 class="mt-0">Chưa có lịch hẹn sắp tới</h4><p>Bạn có thể bắt đầu đặt lịch ngay.</p></div></div></section>`}
      <div class="section-label"><h3>Dịch vụ nhanh</h3></div><div class="quick-grid"><button type="button" class="quick-action" data-action="begin"><span class="mini-icon">${ico("calendar")}</span>Đặt lịch khám</button><button type="button" class="quick-action" data-action="contact"><span class="mini-icon">${ico("support")}</span>Hỏi phòng khám</button></div></div>`;
    }
    if(t==="C1"){
      bottom(btn("Tiếp tục","nextPerson"));
      return `<div class="p-page">${toastHtml()}${head("Đặt lịch khám")}${progress(1)}<p class="eyebrow">BƯỚC 1 TRÊN 4</p><h1 class="page-title">Ai sẽ đi khám?</h1><p class="page-lead">Chọn hồ sơ người được khám. Thông tin này sẽ đi cùng suốt quá trình đặt lịch.</p>
      <button class="person-option ${s.person==="self"?"selected":""}" aria-pressed="${s.person==="self"}" data-action="person" data-value="self"><span class="person-avatar">AN</span><span style="flex:1"><strong>Nguyễn An</strong><small>Tôi · Hồ sơ của bạn</small></span><span class="radio"></span></button>
      <button class="person-option ${s.person==="relative"?"selected":""}" aria-pressed="${s.person==="relative"}" data-action="person" data-value="relative"><span class="person-avatar">TH</span><span style="flex:1"><strong>Trần Hoa</strong><small>Người thân · ${s.canBookRelative?"Có quyền đặt hộ":"Chưa có quyền đặt hộ"}</small></span><span class="radio"></span></button>
      ${card(`<span class="row">${ico("shield")} <span>Quyền riêng tư của người thân</span></span>`,`<p class="card-sub">Bạn có thể đặt lịch thay người thân khi được phép. Quyền đặt hộ không đồng nghĩa có quyền xem kết quả xét nghiệm.</p>`,"info-card")}
      </div>`;
    }
    if(t==="C2"){
      bottom(btn("Tiếp tục","nextScreening"));
      return `<div class="p-page">${toastHtml()}${head("Thông tin khám","C1")}${progress(2)}<p class="eyebrow">BƯỚC 2 TRÊN 4</p><h1 class="page-title">Lý do đi khám</h1><p class="page-lead">Một vài thông tin để phòng khám chuẩn bị tốt hơn cho buổi hẹn.</p>${context()}
      <label for="reason" class="field-label">Bạn muốn phòng khám hỗ trợ về vấn đề gì?</label><textarea id="reason" data-field="reason" class="text-area" placeholder="Nhập mô tả ngắn (chỉ dùng dữ liệu mẫu)">${clean(ui.reason)}</textarea>
      ${card("Kiểm tra thông tin an toàn",`<p class="card-sub">Các lựa chọn dưới đây <strong>chỉ mô phỏng tương tác UX</strong>, không phải bộ câu hỏi sàng lọc y khoa.</p>
      <button class="choice-option ${ui.screeningChoice==="normal"?"selected":""}" aria-pressed="${ui.screeningChoice==="normal"}" data-action="screening" data-value="normal"><span class="mini-icon">${ico("checkCircle")}</span><span style="flex:1"><strong>Không kích hoạt cảnh báo mẫu</strong><small>Tiếp tục chọn ngày khám</small></span><span class="radio"></span></button>
      <button class="choice-option ${ui.screeningChoice==="warning"?"selected":""}" aria-pressed="${ui.screeningChoice==="warning"}" data-action="screening" data-value="warning"><span class="mini-icon">${ico("warning")}</span><span style="flex:1"><strong>Kích hoạt cảnh báo mẫu</strong><small>Mở màn cần hỗ trợ C3</small></span><span class="radio"></span></button>`)}
      <div class="note">${ico("info")} Nội dung sàng lọc chính thức cần bác sĩ phụ trách phê duyệt trước khi dùng thật.</div></div>`;
    }
    if(t==="C3"){
      bottom(`<div class="stack">${btn("Xem cách liên hệ hỗ trợ","contact","danger")}<button class="btn secondary" type="button" data-action="navigate" data-to="C2">Xem lại nội dung (không tự mở khóa)</button></div>`);
      return `<div class="p-page">${toastHtml()}${head("Cần hỗ trợ","C2")}<div class="success-circle" style="background:var(--danger-bg);color:var(--danger)">${ico("warning")}</div><p class="eyebrow center">TÌNH HUỐNG MÔ PHỎNG</p><h1 class="page-title center">Vui lòng liên hệ<br>nhân viên y tế.</h1><p class="page-lead center">Luồng đặt lịch tự động đang tạm dừng vì trạng thái cảnh báo của kịch bản.</p>
      ${card("Không tiếp tục đặt lịch tự động",`<p class="card-sub">Trong sản phẩm thật, nội dung cảnh báo và phương án cấp cứu cần phòng khám xác nhận. Demo không đánh giá bệnh và không thực hiện cuộc gọi.</p>`,"warning-card")}
      <div class="note warning">Trạng thái cảnh báo được giữ lại khi quay về sửa câu trả lời. Chỉ quy trình nhân viên có thẩm quyền mới có thể xác nhận cách xử lý.</div></div>`;
    }
    if(t==="C4"){
      bottom(btn("Tiếp tục","nextSlot","primary",s.slot?"":"disabled"));
      const modes=[["onsite","hospital","Khám tại phòng khám"],["online","video","Khám trực tuyến"]];
      return `<div class="p-page">${toastHtml()}${head("Chọn lịch khám","C2")}${progress(3)}<p class="eyebrow">BƯỚC 3 TRÊN 4</p><h1 class="page-title">Chọn ngày & giờ</h1><p class="page-lead">Chọn hình thức và thời gian phù hợp với bạn.</p>${context()}
      <h3 class="card-title">Hình thức khám</h3><div class="schedule-mode">${modes.map(([v,ic,label])=>`<button type="button" class="${s.mode===v?"selected":""}" aria-pressed="${s.mode===v}" data-action="mode" data-value="${v}">${ico(ic)}${label}</button>`).join("")}</div>
      ${s.mode==="online"?`<div class="note warning">Khám từ xa cần được phòng khám xác nhận điều kiện chuyên môn. Bản demo chưa cho xác nhận lịch trực tuyến.</div>`:""}
      <div class="section-label"><h3>Tháng 10, 2026</h3>${ico("calendar")}</div>
      <div class="date-strip">${[["19","T2",false],["20","T3",true],["21","T4",false],["22","T5",false]].map(([d,w,on])=>`<button class="day ${d===ui.date?"selected":""}" ${on?"":"disabled"} data-action="date" data-value="${d}" aria-pressed="${d===ui.date}"><span>${w}</span><strong>${d}</strong></button>`).join("")}</div>
      <div class="section-label"><h3>Giờ còn trống (demo)</h3></div><div class="slots">${["09:00","09:30","14:30"].map(v=>`<button type="button" class="slot-option ${s.slot===v?"selected":""}" ${v==="09:30"?"disabled":""} aria-pressed="${s.slot===v}" data-action="slot" data-value="${v}">${v}</button>`).join("")}</div>
      ${s.slotUnavailable?`<div class="note warning">Giờ vừa chọn không còn trống. Vui lòng chọn khung giờ khác.</div>`:""}
      ${card("Địa điểm dự kiến",`<p class="card-sub">Phòng khám CareFlow (mẫu). Địa chỉ và lịch hoạt động chính thức chưa được cấu hình.</p>`,"flat")}</div>`;
    }
    if(t==="C5"){
      bottom(`<div class="stack">${btn("Xác nhận đặt lịch","confirm","primary",(!s.slot||s.bookingPending)?"disabled":"")}<button type="button" class="btn ghost" data-action="navigate" data-to="C4">Chỉnh ngày giờ</button></div>`);
      return `<div class="p-page">${toastHtml()}${head("Xác nhận lịch","C4")}${progress(4)}<p class="eyebrow">BƯỚC 4 TRÊN 4</p><h1 class="page-title">Kiểm tra thông tin</h1><p class="page-lead">Vui lòng kiểm tra đúng người và thời gian trước khi xác nhận.</p>
      ${card("Thông tin buổi hẹn",`<div class="review-row"><span class="label">Người được khám</span><span class="value">${person()}</span></div><div class="review-row"><span class="label">Ngày khám</span><span class="value">Thứ Ba, 20/10/2026</span></div><div class="review-row"><span class="label">Giờ khám</span><span class="value">${clean(s.slot||"Chưa chọn")}</span></div><div class="review-row"><span class="label">Hình thức</span><span class="value">${s.mode==="onsite"?"Tại phòng khám":"Khám trực tuyến (chưa duyệt)"}</span></div><div class="review-row"><span class="label">Chi phí</span><span class="value">Phòng khám xác nhận</span></div>`)}
      ${s.bookingError==="SLOT_UNAVAILABLE"?`<div class="error-box"><strong>Khung giờ không còn trống</strong><p>Lịch chưa được tạo. Bạn có thể chọn giờ khác mà không cần nhập lại các thông tin trước.</p></div><button class="btn secondary" type="button" data-action="navigate" data-to="C4">Chọn giờ khác ${ico("arrow")}</button>`:""}
      ${s.bookingPending?`<div class="error-box"><strong>Chưa xác định đã đặt thành công</strong><p>Hệ thống đang chờ kiểm tra yêu cầu trước đó. Không gửi thêm yêu cầu khi chưa rõ kết quả.</p></div>${btn("Kiểm tra trạng thái yêu cầu","verify","secondary")}`:""}
      <p class="helper">Đây là dữ liệu giả. Không có lịch hẹn hay giao dịch được gửi đến phòng khám.</p></div>`;
    }
    if(t==="C6"){
      if(!s.appointment||!M.mayEnter(s,"C6")){bottom(btn("Quay về chọn người khám","begin"));return `<div class="p-page">${toastHtml()}<h1 class="page-title">Chưa có lịch được xác nhận</h1><p class="page-lead">Không thể hiển thị trạng thái hoàn tất khi chưa có phản hồi thành công.</p></div>`;}
      bottom(`<div class="stack">${btn("Xem chi tiết lịch","navigate","primary",'data-to="D2"')}<button class="btn secondary" type="button" data-action="navigate" data-to="B1">Về trang chủ</button></div>`);
      return `<div class="p-page">${toastHtml()}<div class="top-row">${logo()}${call()}</div><div class="success-circle">${ico("checkCircle")}</div><p class="eyebrow center">ĐẶT LỊCH THÀNH CÔNG</p><h1 class="success-title">Lịch khám của bạn<br>đã được xác nhận!</h1><p class="success-body">Thông tin cuộc hẹn mẫu đã được lưu trong bản mô phỏng.</p>
      ${card("Thông tin lịch hẹn",`<span class="badge success">${ico("check")} Đã xác nhận</span><div class="divider"></div><div class="review-row"><span class="label">Mã lịch hẹn</span><span class="value booking-code">${clean(s.appointment.id)}</span></div><div class="review-row"><span class="label">Người khám</span><span class="value">${person()}</span></div><div class="review-row"><span class="label">Ngày giờ</span><span class="value">20/10/2026 · ${clean(s.appointment.slot)}</span></div><div class="review-row"><span class="label">Hình thức</span><span class="value">${s.appointment.mode==="onsite"?"Trực tiếp":"Trực tuyến"}</span></div>`)}
      <div class="note">Bạn có thể mở chi tiết lịch để xem bước tiếp theo. Không có SMS được gửi ở bản demo.</div></div>`;
    }
    if(t==="D2"){
      bottom(tabBar("D2"));
      const a=s.appointment;
      return `<div class="p-page">${toastHtml()}${head("Chi tiết lịch khám","B1")}<p class="eyebrow">LỊCH KHÁM SẮP TỚI</p><h1 class="page-title">Lịch hẹn của bạn</h1><p class="page-lead">Theo dõi lịch trình và biết bước tiếp theo.</p>
      ${card(`<div class="row between"><span>Khám bệnh · ${a?"đã xác nhận":"minh họa"}</span><span class="badge ${a?"success":"neutral"}">${a?"Đã xác nhận":"Demo"}</span></div>`,`<div class="row top" style="margin-top:10px"><span class="appt-date"><small>THÁNG 10</small><strong>20</strong></span><div><strong>${clean(a?person():"Hồ sơ mẫu")}</strong><p class="card-sub">${ico("clock")} 20/10/2026 · ${clean(a?.slot||"09:00")}</p><p class="card-sub">${ico("location")} Phòng khám (chưa cấu hình địa chỉ)</p></div></div>`)}
      ${card("Hành trình buổi khám",`<div class="journey-line"><div class="journey-item done"><strong>Đặt lịch thành công</strong><span>Phòng khám đã ghi nhận lịch mẫu.</span></div><div class="journey-item current"><strong>Chờ đến ngày khám</strong><span>Việc tiếp theo: đến quầy tiếp nhận theo hướng dẫn của phòng khám.</span></div><div class="journey-item"><strong>Tiếp nhận và chờ bác sĩ</strong><span>Bộ phận phụ trách: lễ tân → nhân viên y tế.</span></div></div>`)}
      <button type="button" class="btn secondary" data-action="contact"> ${ico("phone")} Liên hệ phòng khám</button>
      <p class="helper">Mốc trạng thái, địa chỉ và số thứ tự cần lấy từ hệ thống thật; bản thiết kế không tính thời gian chờ ước đoán.</p></div>`;
    }
    bottom("");
    return `<div class="p-page"><h1>Không có màn hình</h1></div>`;
  }
  function render(){
    const title=screens.find(x=>x[0]===ui.screen)?.[1]||ui.screen;
    $("cf-screen").innerHTML=screen();
    $("inspect-title").textContent=title;
    $("inspect-desc").textContent="Screen "+ui.screen+" · High-Fidelity prototype";
    const comp={
      A1:["OTPField","PrimaryButton","ClinicSupportAction"],B1:["HomeHero","AppointmentCard","AccessibleTabBar"],C1:["PersonSelector","ProxyScopeNotice","BookingStepper"],C2:["PersonContext","ScreeningChoice","ClinicalReviewDisclaimer"],C3:["ScreeningAlert","SafetyFallback"],C4:["SlotPicker","ModeSelect","PersonContext"],C5:["AppointmentReview","ServerOutcome","BookingStepper"],C6:["BookingConfirmation","NextAction"],D2:["JourneyTimeline","AppointmentCard","ClinicSupportAction"]};
    $("inspect-components").innerHTML="<ul>"+(comp[ui.screen]||[]).map(c=>"<li>"+clean(c)+"</li>").join("")+"</ul>";
    $("inspect-person").textContent=person();
    $("inspect-state").textContent=s.risk?"Có cảnh báo (demo); cần hỗ trợ":s.appointment?"Đã xác nhận "+s.appointment.id:s.bookingPending?"Chưa xác định kết quả":"Chưa đặt lịch";
    $("screen-list").innerHTML=screens.map(([id,label])=>`<button class="screen-link" type="button" data-screen="${id}" ${ui.screen===id?'aria-current="page"':""}><b>${id}</b><span class="nav-name">${clean(label)}</span></button>`).join("");
    document.documentElement.dataset.theme=ui.theme;
    document.body.classList.toggle("large-text",ui.large);
    $("theme-toggle").setAttribute("aria-pressed",String(ui.theme==="dark"));
    $("font-toggle").setAttribute("aria-pressed",String(ui.large));
    $("live-announcer").textContent=ui.screen+" · "+title+" · "+ui.toast;
  }
  function go(id){
    ui.toast="";
    if(s.risk&&["C4","C5","C6"].includes(id)){ui.screen="C3";ui.toast="Đang có cảnh báo: chưa thể tiếp tục đặt lịch tự động.";}
    else if(id==="C6"&&!M.mayEnter(s,"C6")){ui.screen="C5";ui.toast="Chưa có xác nhận đặt lịch từ hệ thống.";}
    else if(id==="C2"&&!M.canBook(s)){ui.screen="C1";ui.toast="Người thân chưa có quyền đặt hộ.";}
    else if(!screens.some(x=>x[0]===id)){ui.toast="Màn hình chưa được hỗ trợ trong Wave 01.";}
    else ui.screen=id;
    render();$("cf-screen").scrollTop=0;$("cf-screen").focus({preventScroll:true});
  }
  function fresh(scene="normal"){
    s=M.initial();
    ui.screen="A1";ui.screeningChoice="";ui.reason="";ui.toast="";ui.outcome="success";ui.date="20";ui.scene=scene;
    if(scene==="proxy"){M.choosePerson(s,"relative");ui.screen="C1";}
    if(scene==="warning"){ui.screen="C2";ui.screeningChoice="warning";}
    if(scene==="slot"||scene==="unknown"){M.screening(s,"normal");ui.screen="C5";ui.outcome=scene==="slot"?"slot_unavailable":"network_unknown";}
    render();
  }
  function act(action,value,to){
    switch(action){
      case "navigate":return go(to);
      case "contact":ui.toast="Demo chưa cấu hình số hotline và không thực hiện cuộc gọi.";return render();
      case "login":
        if(!/^0\d{9,10}$/.test(ui.phone)||ui.otp!=="123456"){ui.toast="Vui lòng nhập số điện thoại mẫu và mã 123456.";return render();}
        ui.authenticated=true;return go("B1");
      case "begin":
        if(s.risk)return go("C3");
        s=M.initial();ui.reason="";ui.screeningChoice="";ui.outcome="success";return go("C1");
      case "person":{
        const old=s.person;M.choosePerson(s,value);
        if(old!==value){ui.reason="";ui.screeningChoice="";ui.toast="Đã đổi người khám; nội dung sàng lọc cũ đã được làm sạch.";}return render();
      }
      case "nextPerson":
        if(!M.canBook(s)){ui.toast="Chưa có quyền đặt hộ. Hãy liên hệ phòng khám.";return render();}
        return go("C2");
      case "screening":ui.screeningChoice=value;return render();
      case "nextScreening":{
        s.reason=ui.reason;
        const r=M.screening(s,ui.screeningChoice);
        if(!r.ok){ui.toast="Vui lòng chọn tình huống mô phỏng.";return render();}
        return go(r.next);
      }
      case "mode":s.mode=value;return render();
      case "date":ui.date=value;return render();
      case "slot":s.slot=value;s.slotUnavailable=false;s.bookingError="";if(ui.outcome==="slot_unavailable")ui.outcome="success";return render();
      case "nextSlot":
        if(!s.slot){ui.toast="Vui lòng chọn giờ khám.";return render();}
        if(s.mode==="online"){ui.toast="Khám trực tuyến cần được phòng khám xác nhận đủ điều kiện trước khi đặt.";return render();}
        return go("C5");
      case "confirm":{
        if(s.mode==="online"){ui.toast="Chưa cho phép tự xác nhận khám online trong bản demo.";return render();}
        const r=M.attemptBooking(s,ui.outcome);
        if(r.ok)return go("C6");
        if(r.code==="CLINICAL_REVIEW_REQUIRED")return go("C3");
        if(r.code==="SLOT_UNAVAILABLE"){ui.toast="Giờ khám vừa hết. Chưa tạo lịch.";return render();}
        if(r.code==="UNCONFIRMED_REQUEST"){ui.toast="Chưa rõ kết quả đặt lịch. Vui lòng kiểm tra trạng thái.";return render();}
        ui.toast="Không thể xác nhận lịch: "+r.code;return render();
      }
      case "verify":{
        const r=M.resolveUnknown(s,false);
        if(r.ok){ui.outcome="success";ui.toast="Đã kiểm tra: máy chủ mô phỏng chưa ghi nhận lịch. Có thể gửi lại.";return render();}
        ui.toast="Không có yêu cầu đang chờ xác minh.";return render();
      }
      default:ui.toast="Hành động chưa có trong bản demo.";return render();
    }
  }
  document.addEventListener("click",e=>{
    const control=e.target.closest("[data-action],[data-screen],[data-scenario]");
    if(!control)return;
    if(control.dataset.scenario){fresh(control.dataset.scenario);return;}
    if(control.dataset.screen){go(control.dataset.screen);return;}
    act(control.dataset.action,control.dataset.value,control.dataset.to);
  });
  document.addEventListener("input",e=>{
    const field=e.target.dataset.field;if(field==="phone"||field==="otp"||field==="reason")ui[field]=e.target.value;
  });
  $("theme-toggle").addEventListener("click",()=>{ui.theme=ui.theme==="light"?"dark":"light";render();});
  $("font-toggle").addEventListener("click",()=>{ui.large=!ui.large;render();});
  fresh();
})();
