/* Rich patient content: presentation and synthetic demo only. Existing state transitions remain in model/app. */
(function install(root) {
  'use strict';
  const DEMO = Object.freeze({
    doctor: 'BS. Trần Thu Hà',
    specialty: 'Nội tổng quát',
    clinic: 'Phòng khám CareFlow',
    address: '45 Nguyễn Thị Minh Khai, Q.1',
    code: 'CF-1017-0042',
    record: 'HS-000128',
    fee: '350.000đ',
    hotline: '1900 0000',
    lastVisit: '02/10/2026',
    lastDose: '20:00 · Thuốc A',
  });
  const H = (x) => String(x == null ? '' : x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const mode = (v) => v.mode === 'online' ? 'Trực tuyến' : 'Trực tiếp';
  const active = (s) => s.visits.filter(v=>!['completed','cancelled','no-show'].includes(v.status));
  const counts = (s) => ({a:active(s).length, done:s.visits.filter(v=>v.status==='completed').length, cancelled:s.visits.filter(v=>['cancelled','no-show'].includes(v.status)).length, notices:s.notifications.filter(n=>!n.read).length});
  const tone = (v) => ['pending','mode-review','unreachable'].includes(v.status)?'warning':['cancelled','no-show'].includes(v.status)?'danger':['completed','confirmed','ready'].includes(v.status)?'success':'info';
  const greeting = () => { const hour=Number(new Intl.DateTimeFormat('en-GB',{hour:'numeric',hourCycle:'h23',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date())); return hour<11?'Chào buổi sáng':hour<18?'Chào buổi chiều':'Chào buổi tối'; };
  const firstName = (name) => { const parts=String(name||'bạn').trim().split(/\s+/); return parts.length>1?parts.slice(-2).join(' '):parts[0]; };
  const action = (label,to,variant='secondary')=>`<button type="button" class="btn ${variant}" data-action="go" data-to="${H(to)}"><span>${H(label)}</span></button>`;
  const pill = (label,cls='info')=>`<span class="chip ${cls}">${H(label)}</span>`;
  const section = (title,html,extra='')=>`<section class="rich-section ${extra}"><h2 class="rich-heading">${H(title)}</h2>${html}</section>`;
  const empty = (title,copy,to='C1')=>`<div class="rich-empty"><span aria-hidden="true">✧</span><strong>${H(title)}</strong><p>${H(copy)}</p><button type="button" class="btn primary" data-action="book-nav">Đặt lịch khám</button><small>Bạn từng khám tại đây? Có thể chọn bác sĩ quen khi phòng khám hỗ trợ.</small></div>`;
  function homeHeader(s,p) {
  const soon=active(s)[0];
  const name=firstName(p?.name);
  const lead=soon?`Lịch khám tiếp theo: ${dateTextLite(soon.date)} · ${soon.slot||'Chờ xác nhận giờ'}.`:'Hôm nay bạn chưa có lịch khám.';
  const shortcuts=[
    ['calendar-plus','Đặt lịch','begin',null],
    ['calendar','Lịch hẹn','go','D1'],
    ['document-check','Kết quả','go','H7'],
    ['headphones','Hỗ trợ','go','K5']
  ];
  return `<div class="rich-home-head cf-home-head">
    <div class="rich-greeting"><div><h1 id="screen-title" tabindex="-1">${greeting()}, ${H(name)}</h1><p>${H(lead)}</p></div><span class="avatar">${root.CareFlowAvatar(p?.id||'account',48)}</span></div>
    <section class="cf-home-quick" aria-label="Truy cập nhanh"><h2>Truy cập nhanh</h2>
      <nav class="cf-home-quick-grid home-quick-actions" aria-label="Thao tác nhanh">
        ${shortcuts.map(([icon,label,actionName,to])=>`<button type="button" data-action="${actionName}"${to?` data-to="${to}"`:''} aria-label="${H(label)}"><span class="cf-quick-icon">${root.CareFlowIcon(icon,25)}</span><small>${H(label)}</small></button>`).join('')}
      </nav>
    </section>
  </div>`;
}
  function home(s,v,h) {
  const visits=active(s);
  const soon=visits[0];
  const completed=s.visits.find(x=>x.status==='completed');
  const taskCards=soon?[
    {icon:'document',title:'Chuẩn bị thông tin',detail:'Triệu chứng · giấy tờ',actionName:'open-visit',id:soon.id},
    {icon:soon.mode==='online'?'video':'calendar',title:soon.mode==='online'?'Chuẩn bị khám online':'Xem lịch hẹn',detail:soon.mode==='online'?'Mạng · camera · âm thanh':`${dateTextLite(soon.date)} · ${soon.slot||'Chờ giờ'}`,actionName:soon.mode==='online'?'open-visit':'go',id:soon.mode==='online'?soon.id:null,to:soon.mode==='online'?null:'D1'}
  ]:[
    {icon:'document',title:'Chuẩn bị thông tin',detail:'Họ tên · triệu chứng',actionName:'book-nav'},
    {icon:'calendar-plus',title:'Đặt lịch khám',detail:'Chọn bác sĩ và giờ khám',actionName:'book-nav'}
  ];
  const sectionHead=(title,to)=>`<div class="cf-home-section-head"><h2>${H(title)}</h2><button type="button" data-action="${to==='C1'?'book-nav':'go'}"${to==='C1'?'':` data-to="${to}"`}>${title==='Việc cần làm'?(soon?'Xem chi tiết':'Đặt lịch'):title==='Chăm sóc sau khám'?(completed?'Xem lời dặn':'Lịch sử'):title==='Mẹo sức khỏe'?'Hỏi phòng khám':title==='Cần giúp?'?'Liên hệ':'Xem tất cả'} ${h.I('chevron-right',16)}</button></div>`;
  let html='<section class="rich-hero cf-home-appointment" aria-label="Lịch khám sắp tới">';
  html+=sectionHead('Lịch khám sắp tới','D1');
  if(soon){
    const online=soon.mode==='online';
    html+=`<button type="button" class="visit-card cf-home-appointment-summary" data-action="open-visit" data-id="${H(soon.id)}"><span class="cf-home-appointment-info">
      <span class="cf-home-appointment-avatar">${root.CareFlowAvatar('doctor-ha',44)}</span>
      <span class="cf-home-appointment-doctor"><strong>${H(DEMO.doctor)}</strong><small>${H(DEMO.specialty)} · ${online?'Khám online':'Khám trực tiếp'}</small></span>
    </span><span class="cf-home-appointment-summary-meta"><strong>${H(h.dateText(soon))} · ${H(soon.slot||'Chờ xác nhận giờ')}</strong><span class="cf-home-appointment-status">${h.status(soon)}</span></span></button>
    <div class="cf-home-appointment-footer"><button type="button" class="cf-home-appointment-button" data-action="open-visit" data-id="${H(soon.id)}">Xem lịch</button></div>`;
  }else{
    html+=`<div class="cf-home-empty"><p>Bạn chưa có lịch khám sắp tới.</p><button type="button" class="cf-home-appointment-button" data-action="book-nav">Đặt lịch khám</button></div>`;
  }
  html+='</section>';
  html+=`<section class="rich-section cf-home-task-section">${sectionHead('Việc cần làm',soon?'D2':'C1')}
    <div class="cf-home-card-grid">${taskCards.map(t=>`<button type="button" class="cf-home-task-card" data-action="${t.actionName}"${t.to?` data-to="${H(t.to)}"`:''}${t.id?` data-id="${H(t.id)}"`:''}>
       <span class="cf-home-card-icon">${h.I(t.icon,22)}</span><strong>${H(t.title)}</strong><small>${H(t.detail)}</small>
    </button>`).join('')}</div>
  </section>`;
  html+=`<section class="rich-section cf-home-care-section">${sectionHead('Chăm sóc sau khám',completed?'H6':'K3')}
    <div class="cf-home-care-card">${completed?`
      <div class="cf-home-care-title"><div><strong>Lần khám ${H(dateTextLite(completed.date))}</strong><small>${H(DEMO.doctor)} · ${H(DEMO.specialty)}</small></div><span class="cf-home-sample-label">Demo</span></div>
      <p>Thông tin sau khám có thể xem trong phiếu khám.</p>
      <div class="cf-home-care-foot"><small>Lời dặn và đơn thuốc (dữ liệu minh họa)</small>${action('Xem lời dặn','H6','primary')}</div>`:`
      <div class="cf-home-care-title"><div><strong>Chưa có thông tin sau khám</strong><small>Lời dặn và đơn thuốc sẽ xuất hiện khi có kết quả được cập nhật.</small></div></div>
      ${action('Xem lịch sử khám','K3','secondary')}`}</div>
  </section>`;
  html+=`<section class="rich-section cf-home-tips-section">${sectionHead('Mẹo sức khỏe','K5')}
    <div class="cf-home-card-grid cf-home-tips">
      <details class="cf-home-tip-card"><summary><strong>Chuẩn bị trước khi khám</strong><small>Giấy tờ, đơn thuốc, kết quả cũ</small><span>Đọc thêm ${h.I('chevron-right',15)}</span></summary><p>Chuẩn bị những thông tin bạn đã có. Nếu cần hướng dẫn riêng, hãy liên hệ phòng khám.</p></details>
      <details class="cf-home-tip-card"><summary><strong>Vào phòng khám online</strong><small>Mạng, camera, âm thanh</small><span>Đọc thêm ${h.I('chevron-right',15)}</span></summary><p>Kiểm tra kết nối và thiết bị trước giờ hẹn. Mở phiếu lịch khám để xem hướng dẫn tham gia.</p></details>
    </div>
  </section>`;
  html+=`<section class="rich-section cf-home-help-section">${sectionHead('Cần giúp?','K5')}
    <div class="cf-home-support"><div><strong>Hỗ trợ 7:30–19:00</strong><small>Gọi lại hoặc nhắn tin cho phòng khám (demo)</small></div><button type="button" data-action="go" data-to="K5">Liên hệ</button></div>
  </section>`;
  return html;
}
    function dateTextLite(iso) { const d=new Date(iso+'T12:00:00+07:00'); return Number.isNaN(d.getTime())?'Ngày khám':new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',timeZone:'Asia/Ho_Chi_Minh'}).format(d); }
  function appointmentCard(s,v,h) {
    const profile=h.M.profile(s,v.patientId);
    const speciality=`${DEMO.doctor} · ${DEMO.specialty}`;
    return `<article class="rich-appt-card state-${H(tone(v))}"><div class="rich-appt-date"><strong>${H(v.slot||'—')} · ${H(h.dateText(v))}</strong>${pill(mode(v), 'info')}</div><div class="rich-appt-doctor">${root.CareFlowAvatar('doctor-ha',44)}<div><strong>${H(speciality)}</strong><small>Người khám: ${H(profile?.name||'Chưa chọn')} (${profile?.relation==='self'?'Bản thân':'Người thân'})</small></div></div><p class="rich-appt-place">${v.mode==='online'?'Hướng dẫn vào phòng khám sẽ có trước giờ khám (demo).':DEMO.clinic+' · '+DEMO.address}</p><div class="rich-appt-meta"><small>Mã ${H(v.id)}</small><small>${v.payment?.amount ? H(v.payment.amount.toLocaleString('vi-VN'))+'đ' : 'Phí dự kiến '+DEMO.fee+' (demo)'}</small></div><div class="rich-appt-status">${h.status(v)}<small>${v.feePlan==='pending'?'Phòng khám sẽ thông báo phí chính thức.':'Xem phiếu để biết phí.'}</small></div><div class="rich-appt-actions"><button class="btn primary" type="button" data-action="open-visit" data-id="${H(v.id)}">Chi tiết</button>${['pending','confirmed','reminder','pre-lab'].includes(v.status)?`<button type="button" class="btn secondary" data-action="open-visit" data-id="${H(v.id)}">Đổi lịch / Hủy</button>`:''}</div></article>`;
  }
  function appointments(s,u,h) {
  const c=counts(s);
  const filters=[['upcoming','Sắp tới',c.a],['past','Đã khám',c.done],['cancelled','Đã hủy',c.cancelled]];
  const visits=s.visits.filter(v=>u.filter==='past'?v.status==='completed':u.filter==='cancelled'?['cancelled','no-show'].includes(v.status):!['completed','cancelled','no-show'].includes(v.status));
  const person=s.profiles.find(p=>p.relation==='self')||s.profiles[0];
  return `<details class="rich-person-picker"><summary>${root.CareFlowAvatar(person?.id||'account',32)}<span>${H(firstName(person?.name))} · tất cả hồ sơ</span>${h.I('chevron-right',18)}</summary><div class="rich-person-options" role="group" aria-label="Lọc theo người đi khám"><button type="button" data-appointment-person="all">Tất cả hồ sơ</button>${s.profiles.map(p=>`<button type="button" data-appointment-person="${H(p.id)}">${H(p.name)}</button>`).join('')}</div></details>
    <div class="segments rich-appt-tabs" role="group" aria-label="Trạng thái lịch">${filters.map(([key,label,count])=>`<button type="button" class="btn ${u.filter===key?'selected':'text'}" data-action="filter" data-filter="${key}" aria-pressed="${u.filter===key}">${H(label)} (${count})</button>`).join('')}</div>
    <div class="rich-filter-chips" role="group" aria-label="Lọc hình thức"><button type="button" data-visit-filter="all" aria-pressed="true">Tất cả</button><button type="button" data-visit-filter="onsite">Trực tiếp</button><button type="button" data-visit-filter="online">Trực tuyến</button><button type="button" data-visit-filter="person">Theo người khám</button></div>
    <div class="rich-appointment-list">${visits.length?visits.map(v=>`<div class="rich-filterable" data-mode="${v.mode}" data-person="${H(v.patientId)}">${appointmentCard(s,v,h)}</div>`).join(''):empty(u.filter==='upcoming'?'Chưa có lịch sắp tới':u.filter==='past'?'Chưa có lượt khám đã hoàn tất':'Chưa có lịch đã hủy','Bạn có thể đặt lịch mới hoặc đặt lại với bác sĩ quen.')}</div>
    <div class="rich-filter-empty" hidden>Không có lịch phù hợp. Hãy thử bộ lọc khác.</div>
    ${u.filter==='upcoming'?`<div class="rich-rebook-tip"><strong>Đặt lại với bác sĩ quen</strong><small>${H(DEMO.doctor)} · ${H(DEMO.specialty)} (thông tin demo)</small><button data-action="begin" type="button">Đặt lịch mới ↗</button></div>`:''}
    <button type="button" class="btn text" data-action="go" data-to="K3">Tìm lịch hẹn cũ →</button>`;
}
  function patient(s,d,h) {
  const choices = s.profiles.map((p,i) => {
    const selected=d?.patientId===p.id;
    const relation=p.relation==='self'?'Bản thân':p.relation==='mother'?'Mẹ':'Người thân';
    const date=p.dob?p.dob.split('-').reverse().join('/'):'Chưa cập nhật';
    const year=p.dob?p.dob.slice(0,4):'—';
    return `<label class="choice patient-choice rich-patient-choice ${selected?'selected':''}">
      <input type="radio" name="${H(h.C.patient)}" value="${H(p.id)}"${selected?' checked':''}>
      <span class="choice-visual">${root.CareFlowAvatar(p.id,46)}</span>
      <span class="choice-copy"><strong>${H(p.name)}</strong>
        <small>${H(relation)} · Sinh năm ${H(year)} · Giới tính chưa cập nhật</small>
        <span class="rich-profile-meta">Ngày sinh · ${H(date)}</span>
        <span class="rich-profile-meta">Mã hồ sơ ${p.relation==='self'?DEMO.record:'HS-00012'+(8+i)}</span>
        <span class="rich-profile-meta">${p.canViewResults?'Đã xác thực':'Cần bổ sung quyền xem kết quả'}</span>
        <span class="rich-profile-meta">${p.relation==='self'?'Khám gần nhất '+DEMO.lastVisit+' · BHYT demo':'Lần khám & BHYT: chờ đối chiếu'}</span>
      </span><span class="rich-select-indicator" aria-hidden="true">${selected?'✓':''}</span>
    </label>${selected?`<button class="btn secondary add-relative-inline" type="button" data-action="go" data-to="K2">+ Thêm người khám</button>`:''}`;
  }).join('');
  const selected=h.M.profile(s,d?.patientId);
  const form=h.form('patient',`<section class="patient-group"><div class="group-heading"><h2>Hồ sơ đã lưu</h2><span>${s.profiles.length}</span></div><fieldset class="choices"><legend class="sr-only">Ai sẽ đi khám?</legend>${choices}</fieldset><div class="rich-profile-hint">${h.I('info',18)}<p>Phòng khám sẽ đối chiếu thông tin trước khi tạo hồ sơ mới để tránh trùng lặp.</p></div></section>`,selected?'Tiếp tục với '+firstName(selected.name):'Tiếp tục');
  return `${form}<div class="rich-add-person rich-add-person-link"><strong>Thêm người mới</strong><p>Bước 1: họ tên, ngày sinh · Bước 2: thông tin y tế và BHYT khi phòng khám hỗ trợ.</p><button type="button" class="btn secondary" data-action="go" data-to="K2">${h.I('plus',20)} Quản lý và thêm người thân</button><small class="rich-subnote">Hệ thống sẽ kiểm tra thông tin để tránh tạo hồ sơ trùng.</small></div>${s.profiles.some(x=>!x.canViewResults)?`<aside class="rich-warning-note">${pill('Cần bổ sung','warning')} Hồ sơ người thân chưa được cấp quyền xem kết quả. ${action('Liên hệ','K5','text')}</aside>`:''}`;
}
  function visitExtras(s,v,h) {
    const steps=[['pending','Đã đặt'],['confirmed','Phòng khám xác nhận'],['arrived','Đến phòng khám'],['received','Tiếp nhận'],['ready','Sẵn sàng khám'],['in-consult','Đang khám'],['completed','Hoàn tất']];
    let idx=steps.findIndex(z=>z[0]===v.status);
    if(['reminder','pre-lab'].includes(v.status))idx=1;
    if(idx<0)idx=v.status==='online-wait'?2:0;
    return section('Tiến trình lượt khám',`<ol class="rich-progress-steps">${steps.map(([id,label],i)=>`<li class="${i<idx?'done':i===idx?'current':'later'}"><span>${i<idx?'✓':i+1}</span><strong>${H(label)}</strong></li>`).join('')}</ol><p class="rich-subnote">${['cancelled','no-show'].includes(v.status)?'Lượt khám đã dừng. Các bước còn lại không được thực hiện.':'Các bước thay đổi theo tình huống và hướng dẫn của phòng khám.'}</p>`,'rich-detailed-progress')+
      section('Cần chuẩn bị',`<div class="rich-mini-grid"><div><strong>${h.I('document',18)} Giấy tờ</strong><small>CCCD, BHYT nếu có</small></div><div><strong>${h.I('clipboard',18)} Kết quả cũ</strong><small>Mang theo kết quả gần nhất</small></div><div><strong>${h.I('clock',18)} Nhịn ăn?</strong><small>Hỏi phòng khám trước, không tự nhịn ăn.</small></div></div>${action('Xem hướng dẫn trước khám','E1','text')}`,'rich-prepare')+
      section('Thông tin đã khai',`<div class="rich-detail-block"><strong>Triệu chứng</strong><p>${H(v.reason||'Chưa có')}</p><strong>Ghi chú y tế</strong><p>${H(v.medicalHistory||'Chưa cung cấp')}</p></div>`,'rich-declared')+
      (v.labs.length?section('Chỉ định liên quan',`<div class="rich-lab-summary">${v.labs.map(l=>`<div>${pill(h.VI.labs[l.status],l.status==='reviewed'?'success':'warning')}<strong>${H(l.name)}</strong></div>`).join('')}${action('Xem cận lâm sàng','F1','text')}</div>`):section('Chỉ định liên quan',`<div class="rich-detail-block"><p>Chưa có chỉ định cận lâm sàng trong lượt khám này.</p>${action('Xem chi tiết','F1','text')}</div>`))+
      `<div class="rich-policy">${h.I('info',18)}Đổi hoặc hủy lịch phụ thuộc trạng thái xác nhận của phòng khám. ${action('Xem hỗ trợ','K5','text')}</div>`;
  }
  function profile(s,u,h) {
    const p=h.M.accountProfile(s), c=counts(s), count=s.profiles.length;
    return `<div class="rich-profile-hero"><div class="rich-profile-account">${root.CareFlowAvatar(p?.id||'account',68)}<div><strong>${H(p?.name||'Chưa có tài khoản')}</strong><small>Mã ${H(DEMO.record)} · Hồ sơ chính</small><small>${H(p?.phone ? p.phone.slice(0,3)+'••••'+p.phone.slice(-3) : 'Chưa có số liên hệ')}</small>${pill('Đã xác thực (demo)','success')}</div></div><div class="rich-progress-label"><strong>Hồ sơ hoàn thiện 80% (demo)</strong><small>Thiếu thông tin BHYT</small></div><div class="rich-progress-bar"><span style="width:80%"></span></div>${action('Nhờ hỗ trợ bổ sung','K5','secondary')}</div>
    <section class="profile-bento rich-profile-bento" aria-label="Tiện ích hồ sơ">
      ${h.row('Người thân',Math.max(0,count-1)+' người thân','C1','user')}
      ${h.row('Kết quả khám',c.done+' lượt có kết quả','H7','document-check')}
      ${h.row('Đơn thuốc và lời dặn','2 lời dặn mẫu','H6','pill')}
      <div class="rich-insurance" aria-label="Bảo hiểm chưa kết nối">${h.I('shield',22)}<strong>Bảo hiểm</strong><small>Chưa kết nối BHYT (demo)</small><button type="button" data-action="go" data-to="K5">Hỏi cách kết nối ↗</button></div>
    </section>
    ${section('Thông tin cá nhân',`<div class="rich-edit-list">${[['Họ và tên',p?.name],['Ngày sinh',p?.dob?.split('-').reverse().join('/')],['Giới tính','Chưa cập nhật'],['CCCD','•••• 4821 (demo)'],['Địa chỉ','Chưa cập nhật'],['Liên hệ khẩn cấp','Chưa cập nhật']].map(([k,v])=>`<div><span><strong>${H(k)}</strong><small>${H(v||'Chưa cập nhật')}</small></span><button type="button" data-action="go" data-to="K5">Yêu cầu sửa</button></div>`).join('')}</div>`)}
    ${section('Tiền sử và lưu ý y tế',`<div class="rich-medical-pills">${['Dị ứng: chưa khai','Bệnh nền: chưa khai','Thuốc đang dùng: chưa khai','Nhóm máu: chưa khai'].map(t=>pill(t,'info')).join('')}</div><p class="rich-subnote">Thông tin này giúp bác sĩ khám an toàn hơn. Hãy xác nhận trực tiếp với phòng khám.</p>`)}
    ${section('Người thân',`<div class="rich-settings-links">${s.profiles.filter(x=>x.relation!=='self').map(p=>h.row(p.name,'Hồ sơ đã lưu · '+(p.canViewResults?'Có quyền xem kết quả':'Chờ xác minh'),'C1','user')).join('')||'<p>Chưa có người thân.</p>'}</div><details class="rich-add-person add-relative"><summary>${h.I('plus',20)} Thêm người thân</summary>${h.form('relative',h.field('name','Họ và tên')+h.field('dob','Ngày sinh','','date',{max:h.M.localDate()}),'Lưu hồ sơ')}</details>`)}
    ${section('Lịch sử khám và cài đặt',`${h.row('Lịch sử khám',c.done+' lượt đã hoàn tất','K3','calendar')}${h.row('Cài đặt','Nhắc lịch, quyền riêng tư','K4','settings')}`)}
    ${section('Cài đặt tài khoản',`<div class="rich-settings-links">${h.row('Nhắc lịch khám',s.settings.reminders?'Đang bật':'Đang tắt','K4','bell')}${h.row('Ngôn ngữ','Tiếng Việt','K4','document')}${h.row('Bảo mật & quyền riêng tư',s.settings.privatePreview?'Đang ẩn nội dung nhạy cảm':'Xem nội dung đầy đủ','K4','shield')}</div><small class="rich-subnote">CareFlow+ Demo · v3.0 · Quyền riêng tư và điều khoản: nhờ phòng khám cung cấp.</small>`)}
    <button type="button" class="rich-danger-logout" data-action="confirm-logout">${h.I('arrow-right',18)} Đăng xuất</button>`;
  }
  function support(s,u,h) {
  const clock=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date());
  const minutes=Number(clock.slice(0,2))*60+Number(clock.slice(-2));
  const withinDemoHours=minutes>=450 && minutes<1140;
  const waiting=s.requests.find(x=>x.status==='waiting');
  const topics=['Lịch hẹn','Thanh toán','Kết quả','Đơn thuốc','Khám online','Khác'];
  const helpContent=`<div class="rich-support-form">
    <div class="rich-topic-grid" role="group" aria-label="Chủ đề cần hỗ trợ">${topics.map((topic,i)=>`<button type="button" data-support-topic="${H(topic)}" aria-pressed="${i===0}">${H(topic)}</button>`).join('')}</div>
    <input type="hidden" name="supportTopic" id="supportTopic" value="Lịch hẹn">
    ${h.textarea('support','Bạn cần hỗ trợ việc gì?','',{placeholder:'Mô tả ngắn điều bạn cần, ví dụ: tôi muốn đổi lịch sang tuần sau.',maxlength:'500'})}
    <div class="rich-counter" aria-live="polite"><span id="support-count">0</span>/500 ký tự</div>
    <fieldset class="rich-contact-methods"><legend>Phòng khám nên liên hệ qua</legend>
      <label><input type="radio" name="contactMode" value="call" checked> Gọi điện</label>
      <label><input type="radio" name="contactMode" value="zalo"> Zalo (demo)</label>
      <label><input type="radio" name="contactMode" value="message"> Tin nhắn</label>
    </fieldset></div>`;
  return `<div class="rich-support-hero">
      <div class="rich-hotline-label">${pill(withinDemoHours?'Trong khung giờ hỗ trợ (demo)':'Ngoài giờ hỗ trợ (demo)',withinDemoHours?'success':'warning')}<small>7:30–19:00 · giờ minh họa</small></div>
      <strong>Hotline ${H(DEMO.hotline)}</strong>
      <p>Số minh họa, chưa kết nối tổng đài. Không dùng số này để liên hệ thật.</p>
      <button type="button" class="btn secondary" disabled aria-label="Hotline demo chưa kết nối">${h.I('phone',18)} Gọi ngay · Chưa kết nối</button>
    </div>
    ${section('Kênh liên hệ',`<div class="support-grid rich-contact-grid">
      <button type="button" data-action="go" data-to="I5">${h.I('message-circle',25)}<strong>Nhắn tin</strong><small>Trong ứng dụng</small></button>
      <button type="button" disabled aria-label="Zalo chưa kết nối">${h.I('message-circle',25)}<strong>Zalo</strong><small>Chưa kết nối</small></button>
      <button type="button" data-action="clinic-call">${h.I('phone',25)}<strong>Gọi lại</strong><small>Gửi yêu cầu demo</small></button></div><button type="button" class="btn text" data-action="go" data-to="I1">Hỏi phòng khám về chăm sóc sau khám →</button>`)}
    ${section('Gửi yêu cầu hỗ trợ',h.form('support',helpContent,'Gửi yêu cầu','primary'))}
    ${waiting?`<aside class="rich-support-request">${pill('Đang xử lý (demo)','warning')}<p>${H(waiting.type==='callback'?'Yêu cầu gọi lại':'Yêu cầu hỗ trợ')} · Phòng khám chưa phản hồi</p></aside>`:''}
    ${section('Câu hỏi thường gặp',`<div class="rich-faqs">${[
      ['Làm sao đổi lịch?','Lịch chỉ được xác nhận sau khi phòng khám kiểm tra. Mở Lịch hẹn → Chi tiết để xem lựa chọn phù hợp.'],
      ['Vào phòng khám online thế nào?','Mở lịch trực tuyến, kiểm tra thiết bị và làm theo hướng dẫn trên màn hình.'],
      ['Khi nào có kết quả?','Thời gian tùy từng xét nghiệm. Theo dõi mục Kết quả hoặc hỏi phòng khám.'],
      ['Cần hỗ trợ thanh toán?','Gửi yêu cầu ở mục trên để được hướng dẫn theo tình trạng lượt khám.']
    ].map(([q,a])=>`<details class="faq"><summary>${H(q)}</summary><p>${H(a)}</p></details>`).join('')}</div>`)}
    <aside class="rich-emergency"><strong>${h.I('warning',20)} Có dấu hiệu nguy hiểm?</strong><p>Gọi cấp cứu <strong>115</strong> hoặc đến cơ sở y tế gần nhất. Đừng chờ phản hồi qua ứng dụng.</p><button class="btn secondary" type="button" data-action="emergency">${h.I('phone',17)} Gọi 115 / Xem hướng dẫn</button></aside>`;
}
  root.CareFlowRich = {homeHeader,home,appointments,patient,visitExtras,profile,support,DEMO};
})(window);
