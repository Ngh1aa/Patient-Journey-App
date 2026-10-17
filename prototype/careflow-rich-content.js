/* Rich patient content: presentation and synthetic demo only. Existing state transitions remain in model/app. */
(function install(root) {
  'use strict';
  const UI = root.CareFlowUI, COPY = root.CareFlowCopy, A = COPY.ui;
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
  const mode = (v) => UI.modeText(v.mode);
  const active = (s) => s.visits.filter(v=>!['completed','cancelled','no-show'].includes(v.status)).sort((a,b)=>(a.date+'T'+a.slot).localeCompare(b.date+'T'+b.slot));
  const counts = (s) => ({a:active(s).length, done:s.visits.filter(v=>v.status==='completed').length, cancelled:s.visits.filter(v=>['cancelled','no-show'].includes(v.status)).length, notices:s.notifications.filter(n=>!n.read).length});
  const tone = (v) => UI.status(v.status).tone;
  const greeting = () => { const hour=Number(new Intl.DateTimeFormat('en-GB',{hour:'numeric',hourCycle:'h23',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date())); return hour<11?'Chào buổi sáng':hour<18?'Chào buổi chiều':'Chào buổi tối'; };
  const firstName = (name) => { const parts=String(name||'bạn').trim().split(/\s+/); return parts.length>1?parts.slice(-2).join(' '):parts[0]; };
  const action = (label,to,variant='secondary')=>`<button type="button" class="btn ${variant}" ${UI.buttonAttrs(variant)} data-action="go" data-to="${H(to)}"><span>${H(label)}</span></button>`;
  const pill = (label,cls='info')=>`<span class="chip ${cls}" data-cf-component="status" data-cf-tone="${cls}">${H(label)}</span>`;
  const section = (title,html,extra='')=>`<section class="rich-section ${extra}"><h2 class="rich-heading">${H(title)}</h2>${html}</section>`;
  const empty = (title,copy,to='C1')=>`<div class="rich-empty"><span aria-hidden="true">✧</span><strong>${H(title)}</strong><p>${H(copy)}</p><button type="button" class="btn primary" ${UI.buttonAttrs('primary')} data-action="book-nav">Đặt lịch khám</button><small>Bạn từng khám tại đây? Có thể chọn bác sĩ quen khi phòng khám hỗ trợ.</small></div>`;
  function homeHeader(s,p) {
  const soon=active(s)[0];
  const name=firstName(p?.name);
  const days=soon?Math.round((Date.parse(soon.date+'T12:00:00+07:00')-Date.parse(root.CareFlowModel.localDate()+'T12:00:00+07:00'))/86400000):0;
  const lead=soon?(days>0?`Lịch khám tiếp theo còn ${days} ngày.`:days===0?'Bạn có lịch khám hôm nay.':'Lịch hẹn đã qua giờ. Mở phiếu để xem cập nhật.'):'Hôm nay bạn chưa có lịch khám.';
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
        ${shortcuts.map(([icon,label,actionName,to],i)=>`<button type="button" class="${i===0?'cf-quick-primary':'cf-quick-secondary'}" data-action="${actionName}"${to?` data-to="${to}"`:''} aria-label="${H(i===0?'Đặt lịch khám':label)}"><span class="cf-quick-icon">${root.CareFlowIcon(icon,24)}</span>${i===0?`<span class="cf-quick-primary-copy"><strong>Đặt lịch khám</strong><small>Chọn người khám và thời gian</small></span>${root.CareFlowIcon('arrow-right',20)}`:`<small>${H(label)}</small>`}</button>`).join('')}
      </nav>
    </section>
  </div>`;
}
  function home(s,v,h) {
  const visits=active(s);
  const soon=visits[0];
  const completed=s.visits.filter(x=>x.status==='completed').sort((a,b)=>b.date.localeCompare(a.date))[0];
  const taskCards=soon?[
    {icon:'document',title:'Chuẩn bị thông tin',detail:'Họ tên · triệu chứng',actionName:'open-visit',id:soon.id},
    {icon:soon.mode==='online'?'video':'calendar',title:soon.mode==='online'?'Chuẩn bị khám trực tuyến':'Xem lịch hẹn',detail:soon.mode==='online'?'Mạng · camera · âm thanh':`${dateTextLite(soon.date)} · ${soon.slot||'Chờ giờ'}`,actionName:soon.mode==='online'?'open-visit':'go',id:soon.mode==='online'?soon.id:null,to:soon.mode==='online'?null:'D1'}
  ]:[
    {icon:'document',title:'Chuẩn bị thông tin',detail:'Họ tên · triệu chứng',actionName:'book-nav'},
    {icon:'calendar-plus',title:'Đặt lịch khám',detail:'Chọn bác sĩ và giờ khám',actionName:'book-nav'}
  ];
  if (completed) taskCards[1]={icon:'clock',title:'Thuốc A · mẫu',detail:'Giờ minh họa · 20:00',actionName:'go',id:completed.id,to:'H6'};
  const sectionHead=(title,to)=>`<div class="cf-home-section-head"><h2>${H(title)}</h2><button type="button" ${UI.buttonAttrs('text')} data-action="${to==='C1'?'book-nav':'go'}"${to==='C1'?'':` data-to="${to}"${to==='H6'&&completed?` data-id="${H(completed.id)}"`:to==='D2'&&soon?` data-id="${H(soon.id)}"`:''}`}>${title==='Việc cần làm'?(soon?A.viewVisit:A.newBooking):title==='Chăm sóc sau khám'?(completed?'Xem lời dặn':'Lịch sử'):title==='Mẹo sức khỏe'?'Hỏi phòng khám':title==='Cần giúp?'?'Liên hệ':'Xem tất cả'} ${h.I('chevron-right',16)}</button></div>`;
  let html='<section class="rich-hero cf-home-appointment" aria-label="Lịch khám sắp tới">';
  html+=sectionHead('Lịch khám sắp tới','D1');
  html+='<div class="cf-home-appointment-card">';
  if(soon){
    const online=soon.mode==='online';
    html+=`<button type="button" class="visit-card cf-home-appointment-summary" data-action="open-visit" data-id="${H(soon.id)}"><span class="cf-home-appointment-info">
      <span class="cf-home-appointment-avatar">${root.CareFlowAvatar(clinician(soon).name,44)}</span>
      <span class="cf-home-appointment-doctor"><strong>${H(clinician(soon).name)}</strong><small>${H(clinician(soon).specialty)} · ${UI.modeText(soon.mode)}</small></span>
    </span><span class="cf-home-appointment-summary-meta"><strong>${H(h.dateText(soon))} · ${H(soon.slot||'Chờ xác nhận giờ')}</strong><span class="cf-home-appointment-status">${h.status(soon)}</span></span></button>
    <div class="cf-home-appointment-footer"><button type="button" class="cf-home-appointment-button" ${UI.buttonAttrs('inverse')} data-action="go" data-to="${online&&!['pending','mode-review'].includes(soon.status)?h.M.nextAction(soon)[0]:'D2'}" data-id="${H(soon.id)}">${online&&!['pending','mode-review'].includes(soon.status)?'Vào phòng chờ':A.viewVisit}</button></div>`;
  }else{
    html+=`<div class="cf-home-empty"><p>Bạn chưa có lịch khám sắp tới.</p><button type="button" class="cf-home-appointment-button" ${UI.buttonAttrs('inverse')} data-action="book-nav">Đặt lịch khám</button></div>`;
  }
  html+='</div></section>';
  html+=`<section class="rich-section cf-home-task-section">${sectionHead('Việc cần làm',soon?'D2':'C1')}
    <div class="cf-home-card-grid">${taskCards.map(t=>`<button type="button" class="cf-home-task-card" data-action="${t.actionName}"${t.to?` data-to="${H(t.to)}"`:''}${t.id?` data-id="${H(t.id)}"`:''}>
       <span class="cf-home-card-icon">${h.I(t.icon,22)}</span><strong>${H(t.title)}</strong><small>${H(t.detail)}</small>
    </button>`).join('')}</div>
  </section>`;
  html+=`<section class="rich-section cf-home-care-section">${sectionHead('Chăm sóc sau khám',completed?'H6':'K3')}
    <div class="cf-home-care-card">${completed?`
      <div class="cf-home-care-title"><div><strong>Lần khám ${H(dateTextLite(completed.date))}</strong><small>${H(clinician(completed).name)} · ${H(clinician(completed).specialty)}</small></div><span class="cf-home-sample-label">Demo</span></div>
      <p>2 lời dặn · 1 đơn thuốc mẫu</p>
      <div class="cf-home-care-foot"><small>Lời dặn và đơn thuốc (dữ liệu minh họa)</small>${visitAction('Xem lời dặn',completed,'H6','primary')}</div>`:`
      <div class="cf-home-care-title"><div><strong>Chưa có thông tin sau khám</strong><small>Lời dặn và đơn thuốc sẽ xuất hiện khi có kết quả được cập nhật.</small></div></div>
      ${action('Xem lịch sử khám','K3','secondary')}`}</div>
  </section>`;
  html+=`<section class="rich-section cf-home-tips-section">${sectionHead('Mẹo sức khỏe','K5')}
    <div class="cf-home-card-grid cf-home-tips">
      <details class="cf-home-tip-card"><summary><strong>Chuẩn bị trước khi khám</strong><small>Giấy tờ, đơn thuốc, kết quả cũ</small><span>Đọc thêm ${h.I('chevron-right',15)}</span></summary><p>Chuẩn bị những thông tin bạn đã có. Nếu cần hướng dẫn riêng, hãy liên hệ phòng khám.</p></details>
      <details class="cf-home-tip-card"><summary><strong>Vào phòng khám trực tuyến</strong><small>Mạng, camera, âm thanh</small><span>Đọc thêm ${h.I('chevron-right',15)}</span></summary><p>Kiểm tra kết nối và thiết bị trước giờ hẹn. Mở phiếu lịch khám để xem hướng dẫn tham gia.</p></details>
    </div>
  </section>`;
  html+=`<section class="rich-section cf-home-help-section">${sectionHead('Cần giúp?','K5')}
    <div class="cf-home-support"><div><strong>Hỗ trợ 7:30–19:00</strong><small>Gọi lại hoặc nhắn tin cho phòng khám (demo)</small></div><button type="button" data-action="go" data-to="K5">Liên hệ</button></div>
  </section>`;
  return html;
}
    function dateTextLite(iso) { const d=new Date(iso+'T12:00:00+07:00'); return Number.isNaN(d.getTime())?'Ngày khám':new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',timeZone:'Asia/Ho_Chi_Minh'}).format(d); }
  const visitAction = (label, v, to, variant = 'secondary', purpose = '') =>
    `<button type="button" class="btn ${variant}" ${UI.buttonAttrs(variant)} data-action="go" data-to="${H(to)}" data-id="${H(v.id)}"${purpose ? ` data-purpose="${H(purpose)}"` : ''}>${H(label)}</button>`;
  const clinician = v => v?.clinician || {name:DEMO.doctor,specialty:DEMO.specialty,initials:'TH'};
  function appointmentTabs(s,u) {
    const c=counts(s);
    return `<div class="segments rich-appt-tabs" role="group" aria-label="Trạng thái lịch">${[['upcoming','Sắp tới',c.a],['past','Đã khám',c.done],['cancelled','Đã hủy',c.cancelled]].map(([key,label,count])=>`<button type="button" data-cf-component="tab" data-cf-variant="segmented" class="btn ${u.filter===key?'selected':'text'}" data-action="filter" data-filter="${key}" aria-pressed="${u.filter===key}" aria-label="${label} (${count})">${label}</button>`).join('')}</div>`;
  }
  function appointmentCard(s,v,h,featured=false) {
    const doctor=clinician(v);
    const person=h.M.profile(s,v.patientId);
    const done=v.status==='completed';
    const pending=['pending','mode-review'].includes(v.status);
    const stopped=['cancelled','no-show'].includes(v.status);
    const online=v.mode==='online';
    const badge=UI.status(v.status).label;
    const primary=done?visitAction(A.viewResults,v,'H7','inverse'):visitAction(online&&!pending&&!stopped?'Vào phòng chờ':A.viewVisit,v,online&&!pending&&!stopped?h.M.nextAction(v)[0]:'D2','inverse');
    const secondary=done||stopped?visitAction(A.rebook,v,'C1','secondary','rebook'):(h.M.TRANSITIONS[v.status]||[]).includes('cancelled')?visitAction(pending?'Hủy lịch':'Đổi lịch',v,pending?'D4':'D3'):'';
    return `<article data-cf-component="appointment" data-cf-variant="card" class="rich-appt-card state-${H(tone(v))}${featured?' cf-appt-featured':''}" aria-label="${H(doctor.name+' · '+h.dateText(v))}">
      <div class="rich-appt-top"><button type="button" class="cf-appt-open" data-action="open-visit" data-id="${H(v.id)}" aria-label="Chi tiết lịch ${H(doctor.name)}"><span class="cf-clinician-avatar" aria-hidden="true">${root.CareFlowAvatar(doctor.name,44)}</span><span class="cf-clinician-copy"><strong>${H(doctor.name)}</strong><small>${H(doctor.specialty)} · ${UI.modeText(v.mode)}</small></span></button><span data-cf-component="status" data-cf-tone="${tone(v)}" class="cf-appt-badge${pending?' is-pending':''}">${H(badge)}</span></div>
      ${person&&person.id!==h.M.accountProfile(s)?.id?`<p class="rich-appt-person">Khám cho ${H(person.name)}</p>`:''}
      <div class="rich-appt-date">${h.I('calendar',15)}<strong>${H(h.dateText(v).replace('/'+v.date.slice(0,4),''))} · ${H(v.slot||'Chờ xác nhận giờ')}</strong></div>
      <div class="rich-appt-actions">${secondary}${primary}</div>
    </article>`;
  }
  function appointments(s,u,h) {
    const waiting=v=>['pending','mode-review'].includes(v.status);
    const completed=s.visits.filter(v=>v.status==='completed').sort((a,b)=>b.date.localeCompare(a.date));
    const upcoming=active(s).filter(v=>!waiting(v));
    let groups=u.filter==='past'?[['Đã khám',completed,'past']]:u.filter==='cancelled'?[['Đã hủy / Chưa đến khám',s.visits.filter(v=>['cancelled','no-show'].includes(v.status)),'cancelled']]:[['Sắp tới',upcoming,'upcoming'],['Chờ xác nhận',active(s).filter(waiting),'pending'],['Đã khám gần đây',completed.slice(0,2),'recent']];
    if(u.appointmentGroup) groups=groups.filter(([, ,key])=>key===u.appointmentGroup);
    const person=s.profiles.find(p=>p.relation==='self')||s.profiles[0];
    const recentCard=v=>{const doctor=clinician(v);return `<button type="button" class="cf-appointment-history" data-action="go" data-to="H7" data-id="${H(v.id)}"><strong>${H(v.date.split('-').reverse().join('/'))}</strong><small>${H(doctor.name)} · ${H(doctor.specialty)}</small><span class="cf-appt-badge">Hoàn tất</span></button>`;};
    return `<div class="cf-appointments"><div id="appointment-filters" class="cf-appointment-filter-panel"${u.appointmentFilters?'':' hidden'}>
      <details class="rich-person-picker"><summary>${root.CareFlowAvatar(person?.id||'account',32)}<span>Tất cả hồ sơ</span>${h.I('chevron-right',18)}</summary><div class="rich-person-options" role="group" aria-label="Lọc theo người đi khám"><button type="button" data-appointment-person="all" aria-pressed="true">Tất cả hồ sơ</button>${s.profiles.map(p=>`<button type="button" data-appointment-person="${H(p.id)}" aria-pressed="false">${H(p.name)}</button>`).join('')}</div></details>
      <div class="rich-filter-chips" role="group" aria-label="Lọc hình thức">${[['all','Tất cả'],['onsite','Tại phòng khám'],['online',COPY.common.online]].map(([key,label])=>`<button type="button" data-cf-component="tab" data-cf-variant="segmented" data-visit-filter="${key}" aria-pressed="${key==='all'}">${label}</button>`).join('')}</div></div>
      ${u.appointmentGroup?`<button type="button" class="btn text cf-appt-show-all" data-action="filter" data-filter="upcoming">${h.I('chevron-left',16)} Tất cả lịch sắp tới</button>`:''}
      <div class="rich-appointment-list">${groups.filter(([,visits])=>visits.length).map(([title,visits,key])=>`<section class="rich-appointment-group"><div class="cf-appointment-section-head"><h2 class="rich-heading">${H(title)}</h2>${u.appointmentGroup?'':`<button type="button" data-action="${key==='recent'?'filter':'appointment-group'}" ${key==='recent'?'data-filter="past"':`data-group="${key}"`} aria-label="Xem tất cả ${H(title.toLocaleLowerCase('vi-VN'))}">Xem tất cả ${h.I('chevron-right',14)}</button>`}</div><div class="${key==='recent'?'cf-appointment-history-grid':'cf-appointment-cards'}">${visits.map((v,i)=>`<div class="rich-filterable" data-mode="${v.mode}" data-person="${H(v.patientId)}">${key==='recent'?recentCard(v):appointmentCard(s,v,h,key==='upcoming'&&i===0)}</div>`).join('')}</div></section>`).join('')||empty(u.filter==='upcoming'?'Chưa có lịch sắp tới':u.filter==='past'?'Chưa có lượt khám đã hoàn tất':'Chưa có lịch đã hủy','Bạn có thể đặt lịch mới hoặc đặt lại với bác sĩ quen.')}</div>
      <div class="rich-filter-empty" role="status" hidden>Không có lịch phù hợp. Hãy thử bộ lọc khác.</div>
      <button type="button" class="btn primary rich-new-booking" ${UI.buttonAttrs('primary')} data-action="book-nav">${H(A.newBooking)}</button></div>`;
  }
  function patient(s,d,h) {
    const relation = p => p.relation==='self'?'Bản thân':p.relation==='mother'?'Mẹ':'Người thân';
    const choices = s.profiles.map(p=>`<label class="choice patient-choice rich-patient-choice ${d?.patientId===p.id?'selected':''}">
      <input type="radio" name="${H(h.C.patient)}" value="${H(p.id)}"${d?.patientId===p.id?' checked':''}>
      <span class="choice-visual">${root.CareFlowAvatar(p.id,46)}</span>
      <span class="choice-copy"><strong>${H(p.name)}</strong><small>${relation(p)}</small><span class="rich-profile-meta">Ngày sinh · ${H(p.dob?.split('-').reverse().join('/')||'Chưa cập nhật')}</span></span>
      <span class="rich-select-indicator" aria-hidden="true">${d?.patientId===p.id?'✓':''}</span>
    </label>${d?.patientId===p.id?`<button class="btn secondary add-relative-inline" ${UI.buttonAttrs('secondary')} type="button" data-action="go" data-to="K2">+ Thêm hồ sơ</button>`:''}`).join('');
    const selected=h.M.profile(s,d?.patientId);
    return h.form('patient',`<section class="patient-group"><div class="group-heading"><h2>Người đi khám</h2><span>${s.profiles.length}</span></div><fieldset class="choices"><legend class="sr-only">Ai sẽ đi khám?</legend>${choices}</fieldset></section>`,selected?'Tiếp tục với '+firstName(selected.name):'Tiếp tục')+
      `<p class="rich-subnote">Chọn đúng người đi khám để thông tin và lịch hẹn được lưu vào đúng hồ sơ.</p>`;
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
  const initials = name => String(name||'').trim().split(/\s+/).slice(-2).map(x=>x[0]).join('').toLocaleUpperCase('vi-VN');
  const relation = p => p.relation==='self'?'Bản thân':p.relation==='mother'?'Mẹ':p.relation==='child'?'Con':'Người thân';
  function referenceSection(title,html,h,actionName='',attributes='',extra='') {
    return `<section class="cf-reference-section ${extra}"><div class="cf-reference-section-head"><h2>${H(title)}</h2>${actionName?`<button type="button" data-action="${actionName}" ${attributes} aria-label="Xem tất cả ${H(title.toLocaleLowerCase('vi-VN'))}">Xem tất cả ${h.I('chevron-right',15)}</button>`:''}</div>${html}</section>`;
  }
  function profileHeader(s,h) {
    const p=h.M.accountProfile(s),count=s.profiles.filter(x=>x.relation!=='self').length;
    return `<div class="cf-profile-masthead-account"><span class="cf-reference-avatar" aria-hidden="true">${H(initials(p?.name))}</span><div><strong>${H(p?.name||'Chưa có tài khoản')}</strong><small>Hồ sơ của bạn · ${count} người thân</small></div></div>`;
  }
  function profile(s,u,h) {
    const p=h.M.accountProfile(s),relatives=s.profiles.filter(x=>x.relation!=='self');
    const personal=[['Họ tên',p?.name],['Số điện thoại',p?.phone?p.phone.slice(0,3)+' ••• '+p.phone.slice(-3):'Chưa cập nhật'],['Dị ứng',p?.allergies||'Chưa khai báo']];
    const details=`<dl class="rich-profile-details cf-reference-card" data-cf-component="facts">${personal.map(([label,value])=>`<div><dt class="sr-only">${H(label)}</dt><dd><button type="button" data-action="profile-details" aria-label="Xem ${H(label.toLocaleLowerCase('vi-VN'))}"><span><small>${H(label)}</small><strong>${H(value||'Chưa cập nhật')}</strong></span>${h.I('chevron-right',16)}</button></dd></div>`).join('')}</dl>`;
    const add=`<details class="rich-add-person add-relative cf-relative-add" id="profile-add-relative"><summary>${h.I('plus',18)} Thêm người thân</summary>${h.form('relative',h.field('name','Họ và tên')+h.field('dob','Ngày sinh','','date',{max:h.M.localDate()}),'Lưu hồ sơ')}</details>`;
    const relativeCards=`<div class="rich-settings-links cf-relative-grid">${relatives.map(person=>`<button type="button" class="cf-relative-card" data-action="profile-relative" data-id="${H(person.id)}"><span class="cf-reference-avatar" aria-hidden="true">${H(initials(person.name))}</span><span><strong>${H(person.name)}</strong><small>${relation(person)}</small></span></button>`).join('')}${add}</div>`;
    const settings=`<div class="rich-settings-links cf-reference-card cf-settings-list">${[['Thông báo',s.settings.reminders?'Đang bật':'Đang tắt'],['Ngôn ngữ','Tiếng Việt'],['Bảo mật và quyền riêng tư','']].map(([label,value])=>`<button type="button" data-action="go" data-to="K4"><strong>${label}</strong>${value?`<small>${H(value)}</small>`:''}${h.I('chevron-right',16)}</button>`).join('')}</div>`;
    return `<div class="cf-profile-content">${referenceSection('Thông tin cá nhân',details,h,'profile-details')}${referenceSection('Người thân',relativeCards,h,'profile-relatives')}${referenceSection('Cài đặt',settings,h,'go','data-to="K4"')}<button type="button" class="rich-danger-logout" data-action="confirm-logout">Đăng xuất</button></div>`;
  }
  function aftercare(v,h) {
    if(v.status!=='completed') return '';
    return `<section class="rich-section rich-aftercare-sample" aria-label="Nội dung sau khám minh họa"><h2 class="rich-heading">Mẫu chăm sóc sau khám</h2>
      <p class="rich-subnote">Nội dung minh họa, không phải đơn thuốc của bạn.</p>
      <div class="rich-care-facts"><span>2 lời dặn mẫu</span><span>1 đơn thuốc mẫu</span></div>
      <div class="rich-med-line"><div><strong>Thuốc A</strong><small>Giờ mẫu · 20:00</small></div><label class="check"><input type="checkbox"><span>Đã uống (mẫu)</span></label></div>
      <ol class="rich-sample-instructions"><li>Xem lại hướng dẫn đã được bác sĩ cung cấp.</li><li>Hỏi phòng khám nếu có điều chưa rõ.</li></ol>
      ${action('Hỏi phòng khám','I1','primary')}</section>`;
  }
  const supportMessages = s => s.messages.filter(m=>root.CareFlowModel.canViewResults(s,s.visits.find(v=>v.id===m.visitId)));
  function support(s,u,h) {
    const waiting=s.requests.find(x=>x.status==='waiting');
    const messages=supportMessages(s);
    const careVisit=s.visits.find(v=>v.status==='completed'&&h.M.canViewResults(s,v));
    const topics=['Đổi hoặc hủy lịch','Thông tin hồ sơ','Thanh toán','Kết quả','Đơn thuốc','Khám trực tuyến','Khác'];
    const selected=u.forms.support?.supportTopic||topics[0];
    const helpContent=`<div class="rich-support-form"><div class="field"><label for="supportTopic">Chủ đề</label><select id="supportTopic" name="supportTopic">${topics.map(topic=>`<option${topic===selected?' selected':''}>${H(topic)}</option>`).join('')}</select></div>
      ${h.textarea('support','Nội dung','',{placeholder:'Bạn cần phòng khám hỗ trợ điều gì?',maxlength:'500'})}
      <details class="cf-contact-preference"><summary>Cách nhận phản hồi ${h.I('chevron-right',14)}</summary><fieldset class="rich-contact-methods"><legend>Phòng khám nên liên hệ qua</legend><label><input type="radio" name="contactMode" value="call" checked> Gọi điện</label><label><input type="radio" name="contactMode" value="message"> Tin nhắn</label><label><input type="radio" name="contactMode" value="zalo"> Zalo (demo)</label></fieldset></details></div>`;
    const quick=`<div class="support-grid rich-contact-grid"><button type="button" data-action="clinic-call">${h.I('phone',22)}<strong>Gọi lại</strong></button><button type="button" data-action="${careVisit?'go':'support-compose'}"${careVisit?` data-to="I5" data-id="${H(careVisit.id)}"`:''}>${h.I('message-circle',22)}<strong>Nhắn tin</strong></button><button type="button" data-action="${careVisit?'go':'support-compose'}"${careVisit?` data-to="I1" data-id="${H(careVisit.id)}"`:''}>${h.I('info',22)}<strong>Hỏi phòng khám</strong></button></div>`;
    const faqs=[['Cách vào phòng khám trực tuyến','Mở lịch khám trực tuyến, kiểm tra thiết bị và làm theo hướng dẫn trên phiếu khám.'],['Cần mang gì khi đi khám?','Mang giấy tờ tùy thân, đơn thuốc và kết quả cũ nếu có. Xem thêm hướng dẫn trên phiếu khám.'],['Đổi hoặc hủy lịch thế nào?','Mở Lịch hẹn → Phiếu khám để chọn đổi hoặc hủy theo trạng thái hiện tại. Lịch thay thế cần phòng khám xác nhận.'],['Khi nào có kết quả?','Thời gian tùy từng xét nghiệm. Theo dõi mục Kết quả hoặc hỏi phòng khám.'],['Cần hỗ trợ thanh toán?','Chọn chủ đề Thanh toán và gửi yêu cầu để phòng khám kiểm tra lượt khám của bạn.']];
    const faqList=`<div class="rich-faqs cf-reference-card">${faqs.slice(0,u.supportFaqs?faqs.length:3).map(([question,answer])=>`<details class="faq"><summary>${H(question)}${h.I('chevron-right',16)}</summary><p>${H(answer)}</p></details>`).join('')}</div>`;
    const previews=messages.length?`<div class="rich-settings-links">${messages.slice(u.supportMessagesAll?-messages.length:-1).reverse().map(message=>`<div class="rich-message-preview cf-reference-card"><span class="cf-reference-avatar" aria-hidden="true">${message.from==='staff'?'PK':H(initials(h.M.profile(s,message.patientId)?.name||h.M.accountProfile(s)?.name))}</span><div><strong>${message.from==='staff'?'Phòng khám':'Bạn'}</strong><p>${H(message.text)}</p></div></div>`).join('')}</div>`:`<div class="cf-reference-card cf-message-empty"><p>Chưa có tin nhắn. Bạn có thể gửi yêu cầu ở trên.</p></div>`;
    return `<div class="cf-support-content">${referenceSection('Liên hệ nhanh',quick,h,'support-channels')}${referenceSection('Gửi yêu cầu',`<div class="cf-reference-card cf-support-request-card">${h.form('support',helpContent,'Gửi yêu cầu','primary')}</div>`,h,'support-requests')}${waiting?`<aside class="rich-support-request" role="status"><strong>Đang chờ phòng khám tiếp nhận</strong><p>${H(waiting.type==='callback'?'Yêu cầu gọi lại':waiting.topic||'Yêu cầu hỗ trợ')}</p></aside>`:''}${referenceSection('Câu hỏi thường gặp',faqList,h,'support-faqs')}${referenceSection('Tin nhắn gần đây',previews,h,'support-messages')}<details class="rich-emergency cf-support-emergency"><summary>${h.I('warning',18)} Cần trợ giúp khẩn cấp?</summary><p>Gọi cấp cứu <strong>115</strong> hoặc đến cơ sở y tế gần nhất. Đừng chờ phản hồi qua ứng dụng.</p><button class="btn secondary" type="button" data-action="emergency">Gọi 115 / Xem hướng dẫn</button></details></div>`;
  }
  root.CareFlowRich = {homeHeader,home,appointments,patient,visitExtras,profile,support,aftercare,appointmentTabs,clinician,profileHeader,supportMessages,DEMO};
})(window);
