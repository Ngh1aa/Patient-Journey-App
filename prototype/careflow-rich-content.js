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
  const labImage = lab => /MRI|CT|X.quang|chụp|siêu âm/i.test(lab.name) ? 'imaging-suite.png' : 'laboratory.webp';
  function collection(key,u,items,options={}) {
    const current=u.collections?.[key]||{};
    const selected=current.filter||'all';
    const query=current.query||'';
    const filters=options.filters||[];
    return `<section class="cf-collection" data-collection="${H(key)}" data-filter="${H(selected)}" aria-label="Danh sách ${H(options.label||'nội dung')}">
      ${options.search?`<div class="cf-collection-search"><label for="search-${key}">${H(options.search)}</label><input id="search-${key}" type="search" data-collection-search value="${H(query)}" placeholder="${H(options.placeholder||'Nhập từ khóa')}" autocomplete="off"></div>`:''}
      ${filters.length?`<div class="rich-filter-chips cf-collection-filters" role="group" aria-label="Phân loại ${H(options.label||'nội dung')}">${filters.map(([value,label])=>`<button type="button" data-collection-filter="${H(value)}" aria-pressed="${value===selected}">${H(label)}</button>`).join('')}</div>`:''}
      <div class="cf-collection-meta"><span data-collection-count role="status" aria-live="polite">${items.length} ${H(options.label||'mục')}</span><button type="button" data-collection-reset hidden>Xóa bộ lọc</button></div>
      <div class="cf-collection-items">${items.map(item=>`<div data-collection-item data-category="${H(item.category)}" data-search="${H(item.search)}">${item.html}</div>`).join('')}</div>
      <div class="cf-collection-empty" hidden><strong>Không tìm thấy nội dung phù hợp</strong><p>Thử từ khóa khác hoặc xóa bộ lọc để xem tất cả.</p><button type="button" class="btn secondary" ${UI.buttonAttrs('secondary')} data-collection-reset>Xóa bộ lọc</button></div></section>`;
  }
  function homeHeader(s,p) {
    return `<div class="rich-home-head cf-home-head"><div class="rich-greeting"><div><p>${greeting()},</p><h1 id="screen-title" tabindex="-1">${H(p?.name || 'bạn')}</h1></div></div></div>`;
  }
  function home(s,v,h,u={}) {
  const visits=active(s);
  const soon=visits[0];
  const completed=s.visits.filter(x=>x.status==='completed'&&h.M.canViewResults(s,x)).sort((a,b)=>b.date.localeCompare(a.date))[0];
  const taskCards=soon?[
    {icon:'document',title:'Chuẩn bị cho buổi khám',detail:'Giấy tờ · thông tin cần kiểm tra',actionName:'go',id:soon.id,to:'E1'},
    {icon:soon.mode==='online'?'video':'calendar',title:soon.mode==='online'?'Chuẩn bị khám online':'Xem lịch hẹn',detail:soon.mode==='online'?'Mạng · camera · âm thanh':`${dateTextLite(soon.date)} · ${soon.slot||'Chờ giờ'}`,actionName:soon.mode==='online'?'open-visit':'go',id:soon.mode==='online'?soon.id:null,to:soon.mode==='online'?null:'D1'}
  ]:[
    {icon:'document',title:'Chuẩn bị đi khám',detail:'Xem giấy tờ và thông tin cần mang',actionName:'open-guide'},
    {icon:'calendar-plus',title:'Đặt lịch khám',detail:'Chọn bác sĩ và giờ khám',actionName:'book-nav'}
  ];
  if (completed) taskCards[1]={icon:'document-check',title:'Xem lại buổi khám',detail:`${dateTextLite(completed.date)} · Lời dặn và tài liệu`,actionName:'go',id:completed.id,to:'H6'};
  const sectionHead=(title,to)=>`<div class="cf-home-section-head"><h2>${H(title)}</h2><button type="button" data-action="${to==='C1'?'book-nav':'go'}"${to==='C1'?'':` data-to="${to}"${to==='H6'&&completed?` data-id="${H(completed.id)}"`:to==='D2'&&soon?` data-id="${H(soon.id)}"`:''}`}>${title==='Việc cần làm'?(soon?'Xem chi tiết':'Đặt lịch'):title==='Chăm sóc sau khám'?(completed?'Xem lời dặn':'Lịch sử'):title==='Cẩm nang đi khám'?'Hỏi phòng khám':title==='Cần giúp?'?'Liên hệ':'Xem tất cả'} ${h.I('chevron-right',16)}</button></div>`;
  const results=s.visits.reduce((total,item)=>total+item.labs.filter(l=>['available','awaiting-review','reviewed'].includes(l.status)).length,0);
  const shortcuts=[['user','Đặt lịch','begin','','Chọn hồ sơ'],['heart-pulse','Theo dõi','care-entry','I1',visits.length ? visits.length+' lịch khám' : 'Chưa có lịch'],['pill','Đơn thuốc','care-entry','H6',completed?'Lần khám '+dateTextLite(completed.date):'Chưa có đơn'],['document-check','Kết quả','care-entry','H7',results?results+' kết quả':'Chưa có kết quả']];
  let html=`<section class="cf-home-appointment cf2-section" aria-label="Lịch khám sắp tới"><header class="cf2-section-header"><h2 class="cf2-section-title">Lịch khám sắp tới</h2></header><div class="cf-home-appointment-card">
    <img class="appointment-object" src="./assets/images/stethoscope.png" alt="" width="1536" height="1024">
    ${soon?`<button type="button" class="visit-card cf-home-appointment-summary" data-action="open-visit" data-id="${H(soon.id)}"><small class="ref-appointment-label">Lịch hẹn tiếp theo</small><strong class="ref-appointment-day">${H(soon.date.slice(8))}</strong><span class="ref-appointment-date">${H(h.dateText(soon))}</span><strong class="ref-appointment-time">${H(soon.slot)}</strong><span class="cf-home-appointment-info"><span class="cf-home-appointment-avatar">${root.CareFlowAvatar(clinician(soon).name,44)}</span><span>${H(clinician(soon).name)}</span></span><span class="cf-home-appointment-status">${h.status(soon)}</span></button><div class="cf-home-appointment-footer"><button type="button" class="cf-home-appointment-button" ${UI.buttonAttrs('inverse')} aria-label="${A.viewVisit}" data-action="go" data-to="D2" data-id="${H(soon.id)}">${A.viewVisit}</button></div>`:`<div class="cf-home-empty"><small>Lịch hẹn tiếp theo</small><h2>Chăm sóc bạn,<br>từ hôm nay.</h2><p>Bạn chưa có lịch khám sắp tới.</p><button type="button" class="cf-home-appointment-button" data-action="book-nav">Đặt lịch ${h.I('arrow-right',16)}</button></div>`}
    </div></section>
    <section class="ref-overview cf2-section" aria-label="Tổng quan chăm sóc"><header class="ref-section-heading cf2-section-header"><h2 class="cf2-section-title">Tổng quan chăm sóc</h2><span>Của bạn</span></header><div class="ref-overview-grid cf2-section-container">${[[active(s).length,'Lịch hẹn','calendar'],[s.profiles.length,'Hồ sơ','user'],[results,'Kết quả','document-check']].map(([value,label,icon])=>`<button type="button" data-action="${label==='Kết quả'?'care-entry':'go'}" data-to="${label==='Lịch hẹn'?'D1':label==='Hồ sơ'?'K2':'H7'}"><small>${label}</small><strong data-zero="${Number(value)===0}">${root.CareFlowCardsV2?.count(value)??String(value)}</strong><span>${h.I(icon,16)}<span>${label==='Lịch hẹn'?(Number(value)===0?'Chưa có lịch':'Sắp tới'):label==='Hồ sơ'?'Đã lưu':(Number(value)===0?'Chưa có':'Có kết quả')}</span></span></button>`).join('')}</div></section>
    <section class="cf-home-quick cf2-section" aria-label="Truy cập nhanh"><header class="cf2-section-header"><h2 class="cf2-section-title">Truy cập nhanh</h2></header><nav class="cf-home-quick-grid cf2-section-container home-quick-actions" aria-label="Thao tác nhanh">${shortcuts.map(([icon,label,actionName,to,hint],i)=>`<button type="button" class="${i===0?'cf-quick-primary':'cf-quick-secondary'}" data-action="${actionName}"${to?` data-to="${to}"`:''} aria-label="${i===0?'Đặt lịch khám':label}"><span class="cf-quick-icon">${h.I(icon,23)}</span><small>${label}</small><span class="cf2-quick-hint">${H(hint)}</span></button>`).join('')}</nav></section>
    <section class="ref-discover cf2-section"><div class="ref-section-heading cf2-section-header"><h2>Chăm sóc phù hợp với bạn</h2><button type="button" data-action="book-nav" aria-label="Khám phá dịch vụ">${h.I('arrow-right',18)}</button></div><button type="button" class="ref-discover-image cf2-section-container" data-action="book-nav"><img src="./assets/images/imaging-suite.png" width="1536" height="1024" alt="Không gian chẩn đoán hình ảnh minh họa" loading="lazy"><span><strong>Chủ động thăm khám</strong><small>Kết nối với đội ngũ chăm sóc</small></span><span class="ref-round-arrow">${h.I('arrow-right',18)}</span></button></section>`;
  html+=`<section class="rich-section cf-home-task-section">${sectionHead('Việc cần làm',soon?'D2':'C1')}
    <div class="cf-home-card-grid cf2-section-container">${taskCards.map(t=>`<button type="button" class="cf-home-task-card" data-action="${t.actionName}"${t.to?` data-to="${H(t.to)}"`:''}${t.id?` data-id="${H(t.id)}"`:''}>
       <span class="cf-home-card-icon">${h.I(t.icon,22)}</span><span class="cf-task-copy"><strong>${H(t.title)}</strong><small>${H(t.detail)}</small></span><span class="cf-task-arrow">${h.I('chevron-right',18)}</span>
    </button>`).join('')}</div>
  </section>`;
  html+=`<section class="rich-section cf-home-care-section">${sectionHead('Chăm sóc sau khám',completed?'H6':'K3')}
    <div class="cf-home-care-card cf2-section-container">${completed?`
      <div class="cf-home-care-title"><div><strong>Lần khám ${H(dateTextLite(completed.date))}</strong><small>${H(clinician(completed).name)} · ${H(clinician(completed).specialty)}</small></div><span class="cf-home-sample-label">Đã khám</span></div>
      <p>${H(completed.summary?.note||'Xem thông tin bác sĩ đã chia sẻ và hỏi lại khi cần.')}</p>
      <div class="cf-home-care-foot"><small>Lời dặn và đơn thuốc (dữ liệu minh họa)</small>${visitAction('Xem lời dặn',completed,'H6','primary')}</div>`:`
      <div class="cf-home-care-title"><div><strong>Chưa có thông tin sau khám</strong><small>Lời dặn và đơn thuốc sẽ xuất hiện khi có kết quả được cập nhật.</small></div></div>
      ${action('Xem lịch sử khám','K3','secondary')}`}</div>
  </section>`;
  const guides=[
    {category:'onsite',title:'Chuẩn bị trước khi khám',description:'Giấy tờ, đơn thuốc và kết quả cũ',icon:'document',steps:['Kiểm tra họ tên, ngày và giờ trên phiếu khám.','Chuẩn bị giấy tờ và tài liệu y tế bạn đang có.','Hỏi phòng khám về yêu cầu riêng trước khi đến.'],cta:'Xem lịch hẹn',to:'D1'},
    {category:'online',title:'Vào phòng khám online',description:'Kết nối, camera và không gian riêng tư',icon:'video',steps:['Chọn nơi yên tĩnh và có kết nối ổn định.','Mở lịch khám online để kiểm tra camera, micro.','Làm theo trạng thái tiếp nhận trên phiếu khám.'],cta:'Tìm lịch khám online',to:'D1'},
    {category:'aftercare',title:'Tìm lại thông tin sau khám',description:'Kết quả, lời dặn và câu hỏi cho phòng khám',icon:'document-check',steps:['Mở lượt khám đã hoàn tất của đúng người.','Xem tài liệu phòng khám đã chia sẻ.','Gửi câu hỏi nếu bạn chưa hiểu nội dung được cung cấp.'],cta:'Mở lịch sử khám',to:'K3'}
  ];
  html+=`<section class="rich-section cf-home-tips-section">${sectionHead('Cẩm nang đi khám','K5')}
    ${collection('guides',u,guides.map(g=>({category:g.category,search:g.title+' '+g.description,html:`<details class="cf-home-tip-card"><summary><span class="cf-guide-icon">${h.I(g.icon,22)}</span><span class="cf-guide-copy"><strong>${H(g.title)}</strong><small>${H(g.description)}</small></span><span class="cf-guide-toggle">${h.I('chevron-right',18)}</span></summary><div class="cf-guide-body"><ol>${g.steps.map(step=>`<li>${H(step)}</li>`).join('')}</ol><button type="button" class="btn secondary" ${UI.buttonAttrs('secondary')} data-action="guide-open" data-to="${g.to}" data-category="${g.category}">${g.cta} ${h.I('arrow-right',16)}</button></div></details>`})),{label:'hướng dẫn',filters:[['all','Tất cả'],['onsite','Đi khám'],['online','Online'],['aftercare','Sau khám']]})}
  </section>`;
  html+=`<section class="rich-section cf-home-help-section">${sectionHead('Cần giúp?','K5')}
    <div class="cf-home-support cf2-section-container"><div><strong>Hỗ trợ 7:30–19:00</strong><small>Gọi lại hoặc nhắn tin cho phòng khám (demo)</small></div><button type="button" data-action="go" data-to="K5">Liên hệ</button></div>
  </section>`;
  return html;
}
    function dateTextLite(iso) { const d=new Date(iso+'T12:00:00+07:00'); return Number.isNaN(d.getTime())?'Ngày khám':new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',timeZone:'Asia/Ho_Chi_Minh'}).format(d); }
  const visitAction = (label, v, to, variant = 'secondary', purpose = '') =>
    `<button type="button" class="btn ${variant}" ${UI.buttonAttrs(variant)} data-action="go" data-to="${H(to)}" data-id="${H(v.id)}"${purpose ? ` data-purpose="${H(purpose)}"` : ''}>${H(label)}</button>`;
  const clinician = v => v?.clinician || {name:DEMO.doctor,specialty:DEMO.specialty,initials:'TH'};
  function appointmentTabs(s,u) {
    const c=counts(s);
    return `<div class="segments rich-appt-tabs" role="group" aria-label="Trạng thái lịch">${[['upcoming','Sắp tới',c.a],['past','Đã khám',c.done],['cancelled','Đã hủy',c.cancelled]].map(([key,label,count])=>`<button type="button" data-cf-component="tab" data-cf-variant="segmented" class="btn ${u.filter===key?'selected':'text'}" data-action="filter" data-filter="${key}" aria-pressed="${u.filter===key}" aria-label="${label} (${count})">${label}<span class="cf-tab-count">${count}</span></button>`).join('')}</div>`;
  }
  function appointmentCard(s,v,h,featured=false) {
    const doctor=clinician(v);
    const person=h.M.profile(s,v.patientId);
    const done=v.status==='completed';
    const pending=['pending','mode-review'].includes(v.status);
    const stopped=['cancelled','no-show'].includes(v.status);
    const online=v.mode==='online';
    const badge=UI.status(v.status).label;
    const primary=done?visitAction(A.viewResults,v,'H7','inverse'):visitAction(A.viewVisit,v,'D2','inverse');
    const secondary=done||stopped?visitAction(A.rebook,v,'C1','secondary','rebook'):(h.M.TRANSITIONS[v.status]||[]).includes('cancelled')?visitAction(pending?'Hủy lịch':'Đổi lịch',v,pending?'D4':'D3'):'';
    return `<article data-cf-component="appointment" data-cf-variant="card" class="rich-appt-card state-${H(tone(v))}${featured?' cf-appt-featured':''}" aria-label="${H(doctor.name+' · '+h.dateText(v))}">
      <div class="rich-appt-top"><button type="button" class="cf-appt-open" data-action="open-visit" data-id="${H(v.id)}" aria-label="Chi tiết lịch ${H(doctor.name)}"><span class="cf-clinician-avatar" aria-hidden="true">${root.CareFlowAvatar(doctor.name,44)}</span><span class="cf-clinician-copy"><strong>${H(doctor.name)}</strong><small>${H(doctor.specialty)} · ${UI.modeText(v.mode)}</small></span></button><span data-cf-component="status" data-cf-tone="${tone(v)}" class="cf-appt-badge is-${tone(v)}${pending?' is-pending':''}">${H(badge)}</span></div>
      <div class="cf-appt-facts"><p>${h.I('user',15)}<span>${H(person?.name||'Chưa có hồ sơ')}</span></p><p>${h.I('calendar',15)}<strong>${H(h.dateText(v).replace('/'+v.date.slice(0,4),''))} · ${H(v.slot||'Chờ xác nhận giờ')}</strong></p><p>${h.I(online?'video':'map-pin',15)}<span>${online?'Trực tuyến · mở phiếu để kiểm tra thiết bị':'Tại phòng khám · xem địa điểm trên phiếu'}</span></p></div>
      <p class="cf-appt-reason"><span>Lý do khám</span>${H(v.reason||'Chưa cung cấp thông tin')}</p>
      ${pending?'<p class="cf-appt-note">Yêu cầu đang chờ phòng khám xác nhận. Bạn chưa cần vào khám.</p>':''}
      <div class="rich-appt-actions">${secondary}${primary}</div>
    </article>`;
  }
  function appointments(s,u,h) {
    const waiting=v=>['pending','mode-review'].includes(v.status);
    const completed=s.visits.filter(v=>v.status==='completed').sort((a,b)=>b.date.localeCompare(a.date));
    const upcoming=active(s).filter(v=>!waiting(v));
    let groups=u.filter==='past'?[['Đã khám',completed,'past']]:u.filter==='cancelled'?[['Đã hủy / Chưa đến khám',s.visits.filter(v=>['cancelled','no-show'].includes(v.status)),'cancelled']]:[['Sắp tới',upcoming,'upcoming'],['Chờ xác nhận',active(s).filter(waiting),'pending'],['Đã khám gần đây',completed.slice(0,2),'recent']];
    if(u.appointmentGroup) groups=groups.filter(([, ,key])=>key===u.appointmentGroup);
    const person=s.profiles.find(p=>p.id===u.appointmentPerson);
    const personFilter=u.appointmentPerson||'all';
    const modeFilter=u.appointmentMode||'all';
    const recentCard=v=>{const doctor=clinician(v);return `<button type="button" class="cf-appointment-history" data-action="go" data-to="H7" data-id="${H(v.id)}"><strong>${H(v.date.split('-').reverse().join('/'))}</strong><small>${H(doctor.name)} · ${H(doctor.specialty)}</small><span class="cf-appt-badge">Hoàn tất</span></button>`;};
    const visibleGroups=groups.filter(([,visits])=>visits.length);
    const isEmpty=visibleGroups.length===0;
    const noVisitTitle=u.filter==='upcoming'?'Chưa có lịch sắp tới':u.filter==='past'?'Chưa có lượt khám đã hoàn tất':'Chưa có lịch đã hủy';
    const noVisitLead=u.filter==='upcoming'?'Chọn giờ thăm khám cho bản thân hoặc người thân. Lịch hẹn của bạn sẽ được lưu tại đây để dễ theo dõi.':u.filter==='past'?'Khi buổi khám hoàn tất, thông tin sẽ được lưu tại đây để bạn xem lại.':'Bạn chưa hủy lịch nào. Lịch sắp tới vẫn được lưu ở tab Sắp tới.';
    const emptyState=`<section class="cf-appt-empty" aria-label="${H(noVisitTitle)}">
      <div class="cf-appt-empty-top"><span class="cf-appt-empty-icon">${h.I('calendar-plus',27)}</span><span class="cf-appt-empty-mark">${u.filter==='upcoming'?'BẮT ĐẦU CHĂM SÓC':'LỊCH KHÁM CỦA BẠN'}</span></div>
      <h2>${H(noVisitTitle)}</h2><p>${H(noVisitLead)}</p>
      <button type="button" class="cf-appt-empty-cta${u.filter==='upcoming'?'':' cf2-empty-secondary'}" data-action="${u.filter==='upcoming'?'book-nav':'filter'}"${u.filter==='upcoming'?'':' data-filter="upcoming"'}>${u.filter==='upcoming'?'Đặt lịch khám':'Xem lịch sắp tới'} ${h.I('arrow-right',18)}</button>
      </section>${u.filter==='upcoming'?`<div class="cf-appt-steps" aria-label="Quy trình đặt lịch">
        <span class="cf-appt-steps-title">3 BƯỚC ĐẶT LỊCH</span>
        <div><span><b>01</b>Chọn người khám</span><span><b>02</b>Chọn ngày giờ</span><span><b>03</b>Gửi yêu cầu</span></div>
      </div>`:''}`;
    return `<div class="cf-appointments"><div id="appointment-filters" class="cf-appointment-filter-panel"${u.appointmentFilters?'':' hidden'}>
      <details class="rich-person-picker" data-person="${H(personFilter)}"><summary>${root.CareFlowAvatar(person?.id||'account',32)}<span>${H(person?.name||'Tất cả hồ sơ')}</span>${h.I('chevron-right',18)}</summary><div class="rich-person-options" role="group" aria-label="Lọc theo người đi khám"><button type="button" data-appointment-person="all" aria-pressed="${personFilter==='all'}">Tất cả hồ sơ</button>${s.profiles.map(p=>`<button type="button" data-appointment-person="${H(p.id)}" aria-pressed="${personFilter===p.id}">${H(p.name)}</button>`).join('')}</div></details>
      <div class="rich-filter-chips" role="group" aria-label="Lọc hình thức">${[['all','Tất cả'],['onsite','Tại phòng khám'],['online',COPY.common.online]].map(([key,label])=>`<button type="button" data-cf-component="tab" data-cf-variant="segmented" data-visit-filter="${key}" aria-pressed="${key===modeFilter}">${label}</button>`).join('')}</div></div>
      ${u.appointmentGroup?`<button type="button" class="btn text cf-appt-show-all" data-action="filter" data-filter="upcoming">${h.I('chevron-left',16)} Tất cả lịch sắp tới</button>`:''}
      <div class="cf-appointment-filter-summary"><span data-appointment-count role="status" aria-live="polite"></span><button type="button" data-appointment-reset hidden>Xóa bộ lọc</button></div><div class="rich-appointment-list">${visibleGroups.map(([title,visits,key])=>`<section class="rich-appointment-group"><div class="cf-appointment-section-head"><h2 class="rich-heading">${H(title)}</h2>${u.appointmentGroup?'':`<button type="button" data-action="${key==='recent'?'filter':'appointment-group'}" ${key==='recent'?'data-filter="past"':`data-group="${key}"`} aria-label="Xem tất cả ${H(title.toLocaleLowerCase('vi-VN'))}">Xem tất cả ${h.I('chevron-right',14)}</button>`}</div><div class="${key==='recent'?'cf-appointment-history-grid':'cf-appointment-cards'}">${visits.map((v,i)=>`<div class="rich-filterable" data-mode="${v.mode}" data-person="${H(v.patientId)}">${key==='recent'?recentCard(v):appointmentCard(s,v,h,key==='upcoming'&&i===0)}</div>`).join('')}</div></section>`).join('')||emptyState}</div>
      <div class="rich-filter-empty" role="status" hidden><strong>Không có lịch phù hợp</strong><p>Thử hồ sơ hoặc hình thức khác để tìm lịch của bạn.</p><button type="button" class="btn secondary" data-appointment-reset>Xóa bộ lọc</button></div>
      ${isEmpty?'':`<button type="button" class="btn primary rich-new-booking" data-action="book-nav">Đặt lịch khám mới</button>`}</div>`;
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
    const steps=v.mode==='online'?[['pending','Đã đặt'],['confirmed','Phòng khám xác nhận'],['online-wait','Chờ bác sĩ gọi'],[v.status==='unreachable'?'unreachable':'calling',v.status==='unreachable'?'Chờ kết nối lại':'Bác sĩ gọi'],['in-consult','Đang khám'],['completed','Hoàn tất']]:[['pending','Đã đặt'],['confirmed','Phòng khám xác nhận'],['arrived','Đến phòng khám'],['received','Tiếp nhận'],['ready','Sẵn sàng khám'],['in-consult','Đang khám'],['completed','Hoàn tất']];
    let idx=steps.findIndex(z=>z[0]===v.status);
    if(['reminder','pre-lab'].includes(v.status))idx=1;
    if(idx<0)idx=0;
    const stopped=['cancelled','no-show'].includes(v.status);
    return section('Tiến trình lượt khám',`<ol class="rich-progress-steps">${steps.map(([id,label],i)=>`<li class="${stopped?'later':i<idx?'done':i===idx?'current':'later'}"${!stopped&&i===idx?' aria-current="step"':''}><span>${!stopped&&i<idx?'✓':i+1}</span><strong>${H(label)}</strong></li>`).join('')}</ol><p class="rich-subnote">${['cancelled','no-show'].includes(v.status)?'Lượt khám đã dừng. Các bước còn lại không được thực hiện.':'Các bước thay đổi theo tình huống và hướng dẫn của phòng khám.'}</p>`,'rich-detailed-progress')+
      section('Cần chuẩn bị',`<div class="cf-preparation-list"><p>${h.I('document',20)}<span><strong>Giấy tờ và hồ sơ</strong><small>Giấy tờ tùy thân, đơn thuốc và kết quả cũ nếu có.</small></span></p><p>${h.I(v.mode==='online'?'video':'map-pin',20)}<span><strong>${v.mode==='online'?'Thiết bị và kết nối':'Thời gian và địa điểm'}</strong><small>${v.mode==='online'?'Mở phiếu khám và kiểm tra camera, micro trước giờ hẹn.':'Kiểm tra hướng dẫn đến khám. Liên hệ phòng khám nếu chưa có địa chỉ.'}</small></span></p><p>${h.I('info',20)}<span><strong>Yêu cầu riêng trước khám</strong><small>Hỏi phòng khám; không tự thay đổi ăn uống hay thuốc đang dùng.</small></span></p></div>${visitAction('Xem hướng dẫn trước khám',v,'E1','secondary')}`,'rich-prepare')+
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
      <div class="rich-care-facts"><span>Tài liệu minh họa</span><span>Chưa có đơn thuốc thật</span></div>
      <details class="cf-sample-medication"><summary>Xem thử cách ghi nhận dùng thuốc</summary><div class="rich-med-line"><div><strong>Thuốc A · minh họa</strong><small>Giờ mẫu · 20:00</small></div><label class="check"><input type="checkbox"><span>Đã uống (mẫu)</span></label></div></details>
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
    return `<div class="cf-support-content"><figure class="cf-context-photo"><img src="./assets/images/clinic-reception.webp" alt="Khu tiếp đón minh họa" width="1200" height="800" loading="lazy"><figcaption>Hỗ trợ từ lúc đặt lịch đến sau buổi khám</figcaption></figure>${referenceSection('Liên hệ nhanh',quick,h,'support-channels')}${referenceSection('Gửi yêu cầu',`<div class="cf-reference-card cf-support-request-card">${h.form('support',helpContent,'Gửi yêu cầu','primary')}</div>`,h,'support-requests')}${waiting?`<aside class="rich-support-request" role="status"><strong>Đang chờ phòng khám tiếp nhận</strong><p>${H(waiting.type==='callback'?'Yêu cầu gọi lại':waiting.topic||'Yêu cầu hỗ trợ')}</p></aside>`:''}${referenceSection('Câu hỏi thường gặp',faqList,h,'support-faqs')}${referenceSection('Tin nhắn gần đây',previews,h,'support-messages')}<details class="rich-emergency cf-support-emergency"><summary>${h.I('warning',18)} Cần trợ giúp khẩn cấp?</summary><p>Gọi cấp cứu <strong>115</strong> hoặc đến cơ sở y tế gần nhất. Đừng chờ phản hồi qua ứng dụng.</p><button class="btn secondary" type="button" data-action="emergency">Gọi 115 / Xem hướng dẫn</button></details></div>`;
  }
  root.CareFlowRich = {collection,labImage,appointmentCard,homeHeader,home,appointments,patient,visitExtras,profile,support,aftercare,appointmentTabs,clinician,profileHeader,supportMessages,DEMO};
})(window);
