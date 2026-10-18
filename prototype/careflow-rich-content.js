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
  const action = (label,to,variant='secondary')=>`<button type="button" class="btn ${variant}" ${UI.buttonAttrs(variant)} data-action="go" data-to="${H(to)}"><span>${H(label)}</span>${root.CareFlowIcon(to==='K5'||to==='I1'?'message-circle':'arrow-right',18)}</button>`;
  const pill = (label,cls='info')=>`<span class="chip ${cls}" data-cf-component="status" data-cf-tone="${cls}">${H(label)}</span>`;
  const section = (title,html,extra='')=>`<section class="rich-section ${extra}" ${UI.cardAttrs('section')}><h2 class="rich-heading">${H(title)}</h2>${html}</section>`;
  const empty = (title,copy,to='C1')=>`<div class="rich-empty"><span aria-hidden="true">✧</span><strong>${H(title)}</strong><p>${H(copy)}</p><button type="button" class="btn primary" ${UI.buttonAttrs('primary')} data-action="book-nav">Đặt lịch khám</button><small>Bạn từng khám tại đây? Có thể chọn bác sĩ quen khi phòng khám hỗ trợ.</small></div>`;
  const labImage = lab => /MRI|CT|X.quang|chụp|siêu âm/i.test(lab.name) ? 'imaging-suite.png' : 'unsplash/laboratory.webp';
  // Shared image/caption/action anatomy; note tiles omit the image for a quiet task surface.
  // An arrow is decorative inside the single named control, never a nested button.
  function cardArt(kind) {
    if(kind==='network')return `<span class="cf-card-art cf-orbit-art" aria-hidden="true"><span class="cf-orbit-ring"></span><span class="cf-orbit-person cf-orbit-center"><img src="./assets/images/unsplash/doctor-portrait.webp" width="1000" height="667" alt="" loading="lazy"></span><span class="cf-orbit-person cf-orbit-account"><img src="./assets/images/unsplash/account-portrait.webp" width="400" height="600" alt="" loading="lazy"></span><span class="cf-orbit-person cf-orbit-team"><img src="./assets/images/unsplash/care-team.webp" width="1200" height="782" alt="" loading="lazy"></span><span class="cf-orbit-node cf-orbit-calendar">${root.CareFlowIcon('calendar',18)}</span><span class="cf-orbit-node cf-orbit-phone">${root.CareFlowIcon('message-circle',18)}</span></span>`;
    if(kind==='stack')return `<span class="cf-card-art cf-stack-art" aria-hidden="true"><span class="cf-mini-sheet cf-mini-sheet-back">${root.CareFlowIcon('calendar',20)}<strong>Chọn giờ khám</strong><small>Ngày và giờ phù hợp</small></span><span class="cf-mini-sheet cf-mini-sheet-front">${root.CareFlowIcon('document-check',20)}<strong>Theo dõi phiếu hẹn</strong><small>Cập nhật từ phòng khám</small></span></span>`;
    if(kind==='topic')return `<span class="cf-card-art cf-topic-art" aria-hidden="true">${['document','calendar','shield'].map(name=>`<span>${root.CareFlowIcon(name,24)}</span>`).join('')}</span>`;
    return '';
  }
  function photoCard({title,description='',image,actionName='go',to='',id='',labId='',category='',reason='',purpose='',icon='',classes='',featured=false,layout='photo'}) {
    const art=cardArt(layout);
    return `<button type="button" class="cf-photo-card cf-layout-${H(layout)} ${H(classes)}${featured?' cf-photo-featured':''}" ${UI.cardAttrs(image&&!art?'media':'surface')} data-cf-layout="${H(layout)}" data-action="${H(actionName)}"${to?` data-to="${H(to)}"`:''}${id?` data-id="${H(id)}"`:''}${labId?` data-lab="${H(labId)}"`:''}${category?` data-category="${H(category)}"`:''}${reason?` data-reason="${H(reason)}"`:''}${purpose?` data-purpose="${H(purpose)}"`:''}>${art|| (image?`<img class="cf-photo-image" src="./assets/images/${H(image)}" width="1200" height="800" alt="" loading="lazy">`:"")}<span class="cf-photo-content"><span class="cf-photo-copy">${icon?`<span class="cf-photo-label" aria-hidden="true">${root.CareFlowIcon(icon,18)}</span>`:''}<strong>${H(title)}</strong>${description?`<small>${H(description)}</small>`:''}</span><span class="cf-photo-arrow" aria-hidden="true">${root.CareFlowIcon('arrow-right',18)}</span></span></button>`;
  }
  function detailShortcuts(v,h) {
    const preparing=!['completed','cancelled','no-show'].includes(v.status);
    const preparation=v.mode==='onsite'?'E1':['confirmed','reminder','online-wait'].includes(v.status)?'G1':'D1';
    return `<nav class="cf-detail-shortcuts" aria-label="Tiện ích lượt khám">${[
      ['calendar','Lịch hẹn','D1'],
      [v.mode==='online'?'video':'map-pin',preparing?'Chuẩn bị':'Lịch sử',preparing?preparation:'K3'],
      ['document-check','Chỉ định','F1'],['headphones','Hỗ trợ','K5']
    ].map(([icon,label,to])=>`<button type="button" data-action="go" data-to="${to}" data-id="${H(v.id)}"><span aria-hidden="true">${h.I(icon,22)}</span><small>${label}</small></button>`).join('')}</nav>`;
  }
  function collection(key,u,items,options={}) {
    const current=u.collections?.[key]||{};
    const selected=current.filter||'all';
    const query=current.query||'';
    const filters=options.filters||[];
    return `<section class="cf-collection" data-collection="${H(key)}" data-filter="${H(selected)}" aria-label="Danh sách ${H(options.label||'nội dung')}">
      ${options.search?`<div class="cf-collection-search"><label${options.compactSearch?' class="sr-only"':''} for="search-${key}">${H(options.search)}</label><span class="cf-search-control"><span class="cf-search-icon" aria-hidden="true">${root.CareFlowIcon('search',20)}</span><input id="search-${key}" type="search" data-collection-search value="${H(query)}" placeholder="${H(options.placeholder||'Nhập từ khóa')}" autocomplete="off"></span></div>`:''}
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
    {icon:'document',title:'Chuẩn bị cho buổi khám',detail:'Giấy tờ · thông tin cần kiểm tra',actionName:'go',id:soon.id,to:soon.mode==='online'?(['confirmed','reminder','online-wait'].includes(soon.status)?'G1':'D2'):'E1'},
    {icon:soon.mode==='online'?'video':'calendar',title:soon.mode==='online'?'Chuẩn bị khám online':'Xem lịch hẹn',detail:soon.mode==='online'?'Mạng · camera · âm thanh':`${dateTextLite(soon.date)} · ${soon.slot||'Chờ giờ'}`,actionName:soon.mode==='online'?'open-visit':'go',id:soon.mode==='online'?soon.id:null,to:soon.mode==='online'?null:'D1'}
  ]:[
    {icon:'document',title:'Chuẩn bị đi khám',detail:'Xem giấy tờ và thông tin cần mang',actionName:'open-guide'},
    {icon:'calendar-plus',title:'Đặt lịch khám',detail:'Chọn bác sĩ và giờ khám',actionName:'book-nav'}
  ];
  if (completed) taskCards[1]={icon:'document-check',title:'Xem lại buổi khám',detail:`${dateTextLite(completed.date)} · Lời dặn và tài liệu`,actionName:'go',id:completed.id,to:'H6'};
  const sectionHead=(title,to)=>`<div class="cf-home-section-head"><h2>${H(title)}</h2><button type="button" data-action="${to==='C1'?'book-nav':'go'}"${to==='C1'?'':` data-to="${to}"${to==='H6'&&completed?` data-id="${H(completed.id)}"`:to==='D2'&&soon?` data-id="${H(soon.id)}"`:''}`}>${title==='Việc cần làm'?(soon?'Xem chi tiết':'Đặt lịch'):title==='Chăm sóc sau khám'?(completed?'Xem lời dặn':'Lịch sử'):title==='Cẩm nang đi khám'?'Hỏi phòng khám':title==='Cần giúp?'?'Liên hệ':'Xem tất cả'} ${h.I('chevron-right',16)}</button></div>`;
  const shortcuts=[['stethoscope','Đặt lịch','begin',''],['heart-pulse','Theo dõi','care-entry','I1'],['pill','Đơn thuốc','care-entry','H6'],['document-check','Kết quả','care-entry','H7']];
  const results=s.visits.reduce((total,item)=>total+item.labs.filter(l=>['available','awaiting-review','reviewed'].includes(l.status)).length,0);
  const welcome=`<section class="cf-welcome-feature" aria-labelledby="welcome-heading"><div class="cf-welcome-copy"><span class="cf-welcome-eyebrow">${h.I('heart-pulse',16)} Chăm sóc mỗi ngày</span><h2 id="welcome-heading">Sức khỏe của bạn,<br>được kết nối.</h2><p>Đặt lịch, theo dõi buổi khám và tìm lại thông tin ở cùng một nơi.</p><button type="button" class="btn primary" ${UI.buttonAttrs('primary')} data-action="book-nav">Đặt lịch khám ${h.I('arrow-right',18)}</button></div><div class="cf-welcome-portrait" aria-hidden="true"><img src="./assets/images/unsplash/doctor-portrait.webp" width="1000" height="667" alt="" fetchpriority="high"></div></section>`;
  const overview=`<section class="ref-overview" ${UI.cardAttrs('section')} data-cf-layout="metric" aria-label="Tổng quan chăm sóc"><div class="ref-section-heading"><h2>Tổng quan chăm sóc</h2><span>Của bạn</span></div><div class="ref-overview-grid">${[[active(s).length,'Lịch hẹn','calendar'],[s.profiles.length,'Hồ sơ','users'],[results,'Kết quả','document-check']].map(([value,label,icon])=>`<button type="button" data-action="${label==='Kết quả'?'care-entry':'go'}" data-to="${label==='Lịch hẹn'?'D1':label==='Hồ sơ'?'K2':'H7'}"><small>${label}</small><strong>${String(value).padStart(2,'0')}</strong><span>${h.I(icon,16)}<span>${label==='Lịch hẹn'?'Sắp tới':label==='Hồ sơ'?'Đã lưu':'Có kết quả'}</span></span></button>`).join('')}</div></section>`;
  let html=`<div class="cf-bento-lead">${overview}${photoCard({title:'Bạn và phòng khám',description:'Trao đổi, đặt câu hỏi và nhận hỗ trợ',to:'K5',layout:'network',classes:'cf-home-network'})}</div>
    <section class="cf-home-appointment" aria-label="Lịch khám sắp tới"><div class="cf-home-appointment-card">
    ${soon?`<button type="button" class="visit-card cf-home-appointment-summary" data-action="open-visit" data-id="${H(soon.id)}"><small class="ref-appointment-label">Lịch hẹn tiếp theo</small><span class="cf-home-schedule"><strong class="ref-appointment-day">${H(soon.date.slice(8))}</strong><span><span class="ref-appointment-date">${H(h.dateText(soon))}</span><strong class="ref-appointment-time">${H(soon.slot)}</strong></span></span><span class="cf-home-appointment-info"><span class="cf-home-appointment-avatar">${root.CareFlowAvatar(clinician(soon).name,44)}</span><span>${H(clinician(soon).name)}</span></span><span class="cf-home-appointment-status">${h.status(soon)}</span></button><div class="cf-home-appointment-footer"><button type="button" class="cf-home-appointment-button" ${UI.buttonAttrs('primary')} aria-label="${A.viewVisit}" data-action="go" data-to="D2" data-id="${H(soon.id)}">${A.viewVisit} ${h.I('arrow-right',18)}</button></div>`:`<div class="cf-home-empty"><small>Lịch hẹn tiếp theo</small><h2>Chăm sóc bạn,<br>từ hôm nay.</h2><p>Bạn chưa có lịch khám sắp tới.</p><button type="button" class="cf-home-appointment-button" data-action="book-nav">Đặt lịch ${h.I('arrow-right',16)}</button></div>`}
    </div></section>

    <section class="cf-home-quick" ${UI.cardAttrs('surface')} aria-label="Truy cập nhanh"><h2>Truy cập nhanh</h2><nav class="cf-home-quick-grid home-quick-actions" aria-label="Thao tác nhanh">${shortcuts.map(([icon,label,actionName,to],i)=>`<button type="button" class="${i===0?'cf-quick-primary':'cf-quick-secondary'}" data-action="${actionName}"${to?` data-to="${to}"`:''} aria-label="${i===0?'Đặt lịch khám':label}"><span class="cf-quick-icon">${h.I(icon,23)}</span><small>${label}</small></button>`).join('')}</nav></section>
    ${welcome}
    <section class="ref-discover" ${UI.cardAttrs('section')}><div class="ref-section-heading"><h2>Chăm sóc phù hợp với bạn</h2><button type="button" data-action="book-nav" aria-label="Khám phá dịch vụ">${h.I('arrow-right',18)}</button></div><div class="cf-discovery-grid">${photoCard({title:'Chủ động thăm khám',description:'Chọn hồ sơ và giờ hẹn phù hợp',image:'unsplash/care-team.webp',actionName:'book-nav',classes:'ref-discover-image',featured:true})}${photoCard({title:'Khám tại phòng khám',description:'Xem lịch hẹn của bạn',image:'unsplash/clinic.webp',actionName:'guide-open',to:'D1',category:'onsite',icon:'map-pin'})}${photoCard({title:'Khám trực tuyến',description:'Mạng, camera & âm thanh',image:'unsplash/consultation.webp',actionName:'guide-open',to:'D1',category:'online',icon:'video'})}</div></section>`;
  html+=`<section class="rich-section cf-home-task-section" ${UI.cardAttrs('section')}>${sectionHead('Việc cần làm',soon?'D2':'C1')}
    <div class="cf-home-card-grid">${taskCards.map((t,index)=>photoCard({title:t.title,description:t.detail,image:index===0?'':t.icon==='video'?'unsplash/consultation.webp':t.icon==='document-check'?'unsplash/medical-tools.webp':'unsplash/doctor-care.webp',actionName:t.actionName,to:t.to,id:t.id,icon:t.icon,classes:'cf-home-task-card'+(index===0?' cf-task-note':''),layout:index===0?'topic':'stack'})).join('')}</div>
  </section>`;
  html+=`<section class="rich-section cf-home-care-section" ${UI.cardAttrs('section')}>${sectionHead('Chăm sóc sau khám',completed?'H6':'K3')}
    <div class="cf-home-care-card cf-photo-panel" ${UI.cardAttrs('media')}><img class="cf-photo-image" src="./assets/images/unsplash/medical-tools.webp" alt="" width="1200" height="800" loading="lazy"><div class="cf-photo-panel-content">${completed?`
      <div class="cf-home-care-title"><div><strong>Lần khám ${H(dateTextLite(completed.date))}</strong><small>${H(clinician(completed).name)} · ${H(clinician(completed).specialty)}</small></div><span class="cf-home-sample-label">Đã khám</span></div>
      <p>${H(completed.summary?.note||'Xem thông tin bác sĩ đã chia sẻ và hỏi lại khi cần.')}</p>
      <div class="cf-home-care-foot"><small>Lời dặn và đơn thuốc (dữ liệu minh họa)</small>${visitAction('Xem lời dặn',completed,'H6','inverse')}</div>`:`
      <div class="cf-home-care-title"><div><strong>Chưa có thông tin sau khám</strong><small>Lời dặn và đơn thuốc sẽ xuất hiện khi có kết quả được cập nhật.</small></div></div>
      ${action('Xem lịch sử khám','K3','secondary')}`}</div></div>
  </section>`;
  const guides=[
    {category:'onsite',title:'Chuẩn bị trước khi khám',description:'Giấy tờ, đơn thuốc và kết quả cũ',icon:'document',steps:['Kiểm tra họ tên, ngày và giờ trên phiếu khám.','Chuẩn bị giấy tờ và tài liệu y tế bạn đang có.','Hỏi phòng khám về yêu cầu riêng trước khi đến.'],cta:'Xem lịch hẹn',to:'D1'},
    {category:'online',title:'Vào phòng khám online',description:'Kết nối, camera và không gian riêng tư',icon:'video',steps:['Chọn nơi yên tĩnh và có kết nối ổn định.','Mở lịch khám online để kiểm tra camera, micro.','Làm theo trạng thái tiếp nhận trên phiếu khám.'],cta:'Tìm lịch khám online',to:'D1'},
    {category:'aftercare',title:'Tìm lại thông tin sau khám',description:'Kết quả, lời dặn và câu hỏi cho phòng khám',icon:'document-check',steps:['Mở lượt khám đã hoàn tất của đúng người.','Xem tài liệu phòng khám đã chia sẻ.','Gửi câu hỏi nếu bạn chưa hiểu nội dung được cung cấp.'],cta:'Mở lịch sử khám',to:'K3'}
  ];
  html+=`<section class="rich-section cf-home-tips-section" ${UI.cardAttrs('section')}>${sectionHead('Cẩm nang đi khám','K5')}
    ${collection('guides',u,guides.map(g=>({category:g.category,search:g.title+' '+g.description,html:`<details class="cf-home-tip-card cf-guide-media" ${UI.cardAttrs('surface')}><summary class="cf-photo-card"><img class="cf-photo-image" src="./assets/images/unsplash/${({onsite:'clinic',online:'consultation',aftercare:'medical-tools'})[g.category]}.webp" width="1200" height="800" alt="" loading="lazy"><span class="cf-photo-content"><span class="cf-photo-copy cf-guide-copy"><strong>${H(g.title)}</strong><small>${H(g.description)}</small></span><span class="cf-photo-arrow cf-guide-toggle" aria-hidden="true">${h.I('arrow-right',18)}</span></span></summary><div class="cf-guide-body"><ol>${g.steps.map(step=>`<li>${H(step)}</li>`).join('')}</ol><button type="button" class="btn secondary" ${UI.buttonAttrs('secondary')} data-action="guide-open" data-to="${g.to}" data-category="${g.category}">${g.cta} ${h.I('arrow-right',16)}</button></div></details>`})),{label:'hướng dẫn',filters:[['all','Tất cả'],['onsite','Đi khám'],['online','Online'],['aftercare','Sau khám']]})}
  </section>`;
  html+=`<section class="rich-section cf-home-help-section" ${UI.cardAttrs('section')}>${sectionHead('Cần giúp?','K5')}
    <div class="cf-home-support"><div><strong>Phòng khám đồng hành</strong><small>Gửi câu hỏi hoặc yêu cầu gọi lại.</small></div><button type="button" data-action="go" data-to="K5">Liên hệ ${h.I('message-circle',18)}</button></div>
  </section>`;
  return html;
}
    function dateTextLite(iso) { const d=new Date(iso+'T12:00:00+07:00'); return Number.isNaN(d.getTime())?'Ngày khám':new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',timeZone:'Asia/Ho_Chi_Minh'}).format(d); }
  const visitAction = (label, v, to, variant = 'secondary', purpose = '') =>
    `<button type="button" class="btn ${variant}" ${UI.buttonAttrs(variant)} data-action="go" data-to="${H(to)}" data-id="${H(v.id)}"${purpose ? ` data-purpose="${H(purpose)}"` : ''}>${variant==='inverse'?'':root.CareFlowIcon(({D3:'calendar',D4:'cross',G1:'video',E1:'document',C1:'calendar-plus'})[to]||'arrow-right',18)}<span>${H(label)}</span></button>`;
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
    const primary=done?visitAction(A.viewResults,v,'H7','primary'):visitAction(A.viewVisit,v,'D2','primary');
    const secondary=done||stopped?visitAction(A.rebook,v,'C1','secondary','rebook'):(h.M.TRANSITIONS[v.status]||[]).includes('cancelled')?visitAction(pending?'Hủy lịch':'Đổi lịch',v,pending?'D4':'D3'):'';
    return `<article data-cf-component="appointment" data-cf-variant="card" ${UI.cardAttrs('media')} class="rich-appt-card cf-photo-panel state-${H(tone(v))}${featured?' cf-appt-featured':''}" aria-label="${H(doctor.name+' · '+h.dateText(v))}">
      <img class="cf-photo-image" src="./assets/images/unsplash/${done?'medical-tools':online?'consultation':'clinic'}.webp" alt="" width="1200" height="800" loading="lazy">
      <div class="cf-appointment-caption">
      <div class="rich-appt-top"><button type="button" class="cf-appt-open" data-action="open-visit" data-id="${H(v.id)}" aria-label="Chi tiết lịch ${H(doctor.name)}"><span class="cf-clinician-avatar" aria-hidden="true">${root.CareFlowAvatar(doctor.name,44)}</span><span class="cf-clinician-copy"><strong>${H(doctor.name)}</strong><small>${H(doctor.specialty)} · ${UI.modeText(v.mode)}</small></span></button><span data-cf-component="status" data-cf-tone="${tone(v)}" class="cf-appt-badge is-${tone(v)}${pending?' is-pending':''}">${H(badge)}</span></div>
      <div class="cf-appt-facts"><p>${h.I('user',15)}<span>${H(person?.name||'Chưa có hồ sơ')}</span></p><p>${h.I('calendar',15)}<strong>${H(h.dateText(v).replace('/'+v.date.slice(0,4),''))} · ${H(v.slot||'Chờ xác nhận giờ')}</strong></p><p>${h.I(online?'video':'map-pin',15)}<span>${online?'Trực tuyến · kiểm tra thiết bị trước giờ khám':'Tại phòng khám · xem địa điểm trên phiếu'}</span></p></div>
      <p class="cf-appt-reason"><span>Lý do khám</span>${H(v.reason||'Chưa cung cấp thông tin')}</p>
      ${pending?'<p class="cf-appt-note">Yêu cầu đang chờ phòng khám xác nhận. Bạn chưa cần vào khám.</p>':''}
      <div class="rich-appt-actions">${secondary}${primary}</div></div>
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
    const recentCard=v=>{const doctor=clinician(v);return `<button type="button" class="cf-appointment-history" ${UI.cardAttrs('row')} data-action="go" data-to="H7" data-id="${H(v.id)}"><strong>${H(v.date.split('-').reverse().join('/'))}</strong><small>${H(doctor.name)} · ${H(doctor.specialty)}</small><span class="cf-appt-badge">Hoàn tất</span></button>`;};
    return `<div class="cf-appointments"><label class="cf-appointment-search" for="appointment-search">Tìm lịch hẹn<input id="appointment-search" type="search" data-appointment-search value="${H(u.appointmentQuery||'')}" placeholder="Người khám, bác sĩ, lý do, mã phiếu…" autocomplete="off"></label><div id="appointment-filters" class="cf-appointment-filter-panel"${u.appointmentFilters?'':' hidden'}>
      <details class="rich-person-picker" data-person="${H(personFilter)}"><summary>${root.CareFlowAvatar(person?.id||'account',32)}<span>${H(person?.name||'Tất cả hồ sơ')}</span>${h.I('chevron-right',18)}</summary><div class="rich-person-options" role="group" aria-label="Lọc theo người đi khám"><button type="button" data-appointment-person="all" aria-pressed="${personFilter==='all'}">Tất cả hồ sơ</button>${s.profiles.map(p=>`<button type="button" data-appointment-person="${H(p.id)}" aria-pressed="${personFilter===p.id}">${H(p.name)}</button>`).join('')}</div></details>
      <div class="rich-filter-chips" role="group" aria-label="Lọc hình thức">${[['all','Tất cả'],['onsite','Tại phòng khám'],['online',COPY.common.online]].map(([key,label])=>`<button type="button" data-cf-component="tab" data-cf-variant="segmented" data-visit-filter="${key}" aria-pressed="${key===modeFilter}">${label}</button>`).join('')}</div></div>
      ${u.appointmentGroup?`<button type="button" class="btn text cf-appt-show-all" data-action="filter" data-filter="upcoming">${h.I('chevron-left',16)} Tất cả lịch sắp tới</button>`:''}
      <div class="cf-appointment-filter-summary"><span data-appointment-count role="status" aria-live="polite"></span><button type="button" data-appointment-reset hidden>Xóa bộ lọc</button></div><div class="rich-appointment-list">${groups.filter(([,visits])=>visits.length).map(([title,visits,key])=>`<section class="rich-appointment-group"><div class="cf-appointment-section-head"><h2 class="rich-heading">${H(title)}</h2>${u.appointmentGroup?'':`<button type="button" data-action="${key==='recent'?'filter':'appointment-group'}" ${key==='recent'?'data-filter="past"':`data-group="${key}"`} aria-label="Xem tất cả ${H(title.toLocaleLowerCase('vi-VN'))}">Xem tất cả ${h.I('chevron-right',14)}</button>`}</div><div class="${key==='recent'?'cf-appointment-history-grid':'cf-appointment-cards'}">${visits.map((v,i)=>`<div class="rich-filterable" data-mode="${v.mode}" data-person="${H(v.patientId)}" data-search="${H([v.id,h.M.profile(s,v.patientId)?.name,clinician(v).name,v.reason,h.dateText(v)].join(' '))}">${key==='recent'?recentCard(v):appointmentCard(s,v,h,key==='upcoming'&&i===0)}</div>`).join('')}</div></section>`).join('')||empty(u.filter==='upcoming'?'Chưa có lịch sắp tới':u.filter==='past'?'Chưa có lượt khám đã hoàn tất':'Chưa có lịch đã hủy','Bạn có thể đặt lịch mới hoặc đặt lại với bác sĩ quen.')}</div>
      <div class="rich-filter-empty" role="status" hidden><strong>Không có lịch phù hợp</strong><p>Thử hồ sơ hoặc hình thức khác để tìm lịch của bạn.</p><button type="button" class="btn secondary" data-appointment-reset>Xóa bộ lọc</button></div>
      <button type="button" class="btn primary rich-new-booking" data-action="book-nav">Đặt lịch khám mới</button></div>`;
  }
  function patient(s,d,h) {
    const relation = p => p.relation==='self'?'Bản thân':p.relation==='mother'?'Mẹ':'Người thân';
    const choices = s.profiles.map(p=>`<label class="choice patient-choice rich-patient-choice ${d?.patientId===p.id?'selected':''}" ${UI.cardAttrs('tonal')}>
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
    const onlineReady=['confirmed','reminder','online-wait'].includes(v.status);
    const preparationAction=v.mode==='online'
      ? onlineReady?visitAction('Kiểm tra thiết bị khám online',v,'G1','secondary'):'<p class="cf-card-subtitle">Theo dõi bước tiếp theo trên phiếu khám trước khi kiểm tra kết nối.</p>'
      : visitAction('Xem hướng dẫn trước khám',v,'E1','secondary');
    const preparationSection=stopped||v.status==='completed'?'':section('Cần chuẩn bị',`<div class="cf-preparation-list"><p>${h.I('document',20)}<span><strong>Giấy tờ và hồ sơ</strong><small>Giấy tờ tùy thân, đơn thuốc và kết quả cũ nếu có.</small></span></p><p>${h.I(v.mode==='online'?'video':'map-pin',20)}<span><strong>${v.mode==='online'?'Thiết bị và kết nối':'Thời gian và địa điểm'}</strong><small>${v.mode==='online'?'Mở phiếu khám và kiểm tra camera, micro trước giờ hẹn.':'Kiểm tra hướng dẫn đến khám. Liên hệ phòng khám nếu chưa có địa chỉ.'}</small></span></p><p>${h.I('info',20)}<span><strong>Yêu cầu riêng trước khám</strong><small>Hỏi phòng khám; không tự thay đổi ăn uống hay thuốc đang dùng.</small></span></p></div>${preparationAction}`,'rich-prepare');
    return section('Tiến trình lượt khám',`<ol class="rich-progress-steps">${steps.map(([id,label],i)=>`<li class="${stopped?'later':i<idx?'done':i===idx?'current':'later'}"${!stopped&&i===idx?' aria-current="step"':''}><span>${!stopped&&i<idx?'✓':i+1}</span><strong>${H(label)}</strong></li>`).join('')}</ol><p class="rich-subnote">${['cancelled','no-show'].includes(v.status)?'Lượt khám đã dừng. Các bước còn lại không được thực hiện.':'Các bước thay đổi theo tình huống và hướng dẫn của phòng khám.'}</p>`,'rich-detailed-progress')+
      preparationSection+
      section('Thông tin đã khai',`<div class="rich-detail-block"><strong>Triệu chứng</strong><p>${H(v.reason||'Chưa có')}</p><strong>Ghi chú y tế</strong><p>${H(v.medicalHistory||'Chưa cung cấp')}</p></div>`,'rich-declared')+
      (v.labs.length?section('Chỉ định liên quan',`<div class="rich-lab-summary">${v.labs.map(l=>`<div>${pill(h.VI.labs[l.status],l.status==='reviewed'?'success':'warning')}<strong>${H(l.name)}</strong></div>`).join('')}${action('Xem cận lâm sàng','F1','text')}</div>`):section('Chỉ định liên quan',`<div class="rich-detail-block"><p>Chưa có chỉ định cận lâm sàng trong lượt khám này.</p>${action('Xem chi tiết','F1','text')}</div>`))+
      `<div class="rich-policy">${h.I('info',18)}Đổi hoặc hủy lịch phụ thuộc trạng thái xác nhận của phòng khám. ${action('Xem hỗ trợ','K5','text')}</div>`;
  }
  const initials = name => String(name||'').trim().split(/\s+/).slice(-2).map(x=>x[0]).join('').toLocaleUpperCase('vi-VN');
  const relation = p => p.relation==='self'?'Bản thân':p.relation==='mother'?'Mẹ':p.relation==='child'?'Con':'Người thân';
  function referenceSection(title,html,h,actionName='',attributes='',extra='') {
    return `<section class="cf-reference-section ${extra}" ${UI.cardAttrs('surface')}><div class="cf-reference-section-head"><h2>${H(title)}</h2>${actionName?`<button type="button" data-action="${actionName}" ${attributes} aria-label="Xem tất cả ${H(title.toLocaleLowerCase('vi-VN'))}">Xem tất cả ${h.I('chevron-right',15)}</button>`:''}</div>${html}</section>`;
  }
  function profileHeader(s,h) {
    const p=h.M.accountProfile(s),count=s.profiles.filter(x=>x.relation!=='self').length;
    return `<div class="cf-profile-masthead-account"><div class="cf-profile-banner-content"><span class="cf-reference-avatar" aria-hidden="true">${root.CareFlowAvatar(p?.id||'account',64)}</span><div><strong>${H(p?.name||'Chưa có tài khoản')}</strong><small>Hồ sơ của bạn · ${count} người thân</small></div></div></div>`;
  }
  function profile(s,u,h) {
    const p=h.M.accountProfile(s),relatives=s.profiles.filter(x=>x.relation!=='self');
    const personal=[['Họ tên',p?.name],['Số điện thoại',p?.phone?p.phone.slice(0,3)+' ••• '+p.phone.slice(-3):'Chưa cập nhật'],['Dị ứng',p?.allergies||'Chưa khai báo']];
    const details=`<dl class="rich-profile-details cf-reference-card" data-cf-component="facts">${personal.map(([label,value])=>`<div><dt class="sr-only">${H(label)}</dt><dd><button type="button" data-action="profile-details" aria-label="Xem ${H(label.toLocaleLowerCase('vi-VN'))}"><span><small>${H(label)}</small><strong>${H(value||'Chưa cập nhật')}</strong></span>${h.I('chevron-right',16)}</button></dd></div>`).join('')}</dl>`;
    const add=`<details class="rich-add-person add-relative cf-relative-add" id="profile-add-relative"><summary>${h.I('plus',18)} Thêm người thân</summary>${h.form('relative',h.field('name','Họ và tên')+h.field('dob','Ngày sinh','','date',{max:h.M.localDate()}),'Lưu hồ sơ')}</details>`;
    const relativeCards=`<div class="rich-settings-links cf-relative-grid">${relatives.map(person=>`<button type="button" class="cf-relative-card" data-action="profile-relative" data-id="${H(person.id)}"><span class="cf-reference-avatar" aria-hidden="true">${root.CareFlowAvatar(person.id,44)}</span><span><strong>${H(person.name)}</strong><small>${relation(person)}</small></span></button>`).join('')}${add}</div>`;
    const settings=`<div class="rich-settings-links cf-reference-card cf-settings-list">${[['Thông báo',s.settings.reminders?'Đang bật':'Đang tắt'],['Ngôn ngữ','Tiếng Việt'],['Bảo mật và quyền riêng tư','']].map(([label,value])=>`<button type="button" data-action="go" data-to="K4"><strong>${label}</strong>${value?`<small>${H(value)}</small>`:''}${h.I('chevron-right',16)}</button>`).join('')}</div>`;
    return `<div class="cf-profile-content">${referenceSection('Thông tin cá nhân',details,h,'profile-details')}${referenceSection('Người thân',relativeCards,h,'profile-relatives')}${referenceSection('Cài đặt',settings,h,'go','data-to="K4"')}<button type="button" class="rich-danger-logout" data-action="confirm-logout">Đăng xuất</button></div>`;
  }
  function aftercare(v,h) {
    if(v.status!=='completed') return '';
    return `<section class="rich-section rich-aftercare-sample" ${UI.cardAttrs('section')} aria-label="Nội dung sau khám minh họa"><figure class="cf-context-photo cf-aftercare-photo"><img src="./assets/images/unsplash/medical-tools.webp" alt="Ống nghe y tế minh họa" width="1000" height="667" loading="lazy"><figcaption>Lưu lại câu hỏi, xem lại hướng dẫn sau buổi khám</figcaption></figure><h2 class="rich-heading">Mẫu chăm sóc sau khám</h2>
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
    return `<div class="cf-support-content"><section class="cf-support-network" ${UI.cardAttrs('surface')}>${cardArt('network')}<div><h2>Hỗ trợ từ phòng khám</h2><p>Đồng hành từ lúc đặt lịch đến sau buổi khám.</p></div></section>${referenceSection('Liên hệ nhanh',quick,h,'support-channels')}${referenceSection('Gửi yêu cầu',`<div class="cf-reference-card cf-support-request-card">${h.form('support',helpContent,'Gửi yêu cầu','primary')}</div>`,h,'support-requests')}${waiting?`<aside class="rich-support-request" role="status"><strong>Đang chờ phòng khám tiếp nhận</strong><p>${H(waiting.type==='callback'?'Yêu cầu gọi lại':waiting.topic||'Yêu cầu hỗ trợ')}</p></aside>`:''}${referenceSection('Câu hỏi thường gặp',faqList,h,'support-faqs')}${referenceSection('Tin nhắn gần đây',previews,h,'support-messages')}<details class="rich-emergency cf-support-emergency"><summary>${h.I('warning',18)} Cần trợ giúp khẩn cấp?</summary><p>Gọi cấp cứu <strong>115</strong> hoặc đến cơ sở y tế gần nhất. Đừng chờ phản hồi qua ứng dụng.</p><button class="btn secondary" type="button" data-action="emergency">Gọi 115 / Xem hướng dẫn</button></details></div>`;
  }
  const preparationItems = v => [
    ['details','Đã kiểm tra đúng người, ngày và giờ khám'],
    ['documents','Đã chuẩn bị giấy tờ và tài liệu y tế đang có'],
    ['access',v.mode==='online'?'Đã chuẩn bị mạng, camera và không gian riêng tư':'Đã kiểm tra địa điểm và cách đến phòng khám'],
  ];
  function visitTools(s,v,u,h,kind='prepare') {
    if(!v || ['cancelled','no-show'].includes(v.status)) return '';
    const person=h.M.profile(s,v.patientId);
    const items=preparationItems(v),checked=u.preparation?.[v.id]||{};
    const title=kind==='prepare'?'Sẵn sàng cho buổi khám':'Câu hỏi cho lần trao đổi tới';
    const noteId='visit-note-'+v.id;
    return `<div class="cf-visit-tools" data-visit-tools="${H(v.id)}">${UI.card(
      `<div class="cf-card-header"><h2>${title}</h2>${kind==='prepare'?`<span class="cf-preparation-progress" data-preparation-count role="status" aria-live="polite">${items.filter(([key])=>checked[key]).length}/${items.length} đã chuẩn bị</span>`:''}</div>
      <p class="cf-card-subtitle">${H(person?.name)} · ${H(dateTextLite(v.date))} · ${H(v.id)}</p>
      ${kind==='prepare'?`<fieldset class="cf-preparation-checks"><legend class="sr-only">Checklist chuẩn bị riêng cho lượt khám</legend>${items.map(([key,text])=>`<label><input type="checkbox" data-preparation="${key}" data-visit="${H(v.id)}"${checked[key]?' checked':''}><span>${H(text)}</span></label>`).join('')}</fieldset>`:''}
      <div class="cf-private-note"><label for="${H(noteId)}">Ghi chú riêng của bạn</label><textarea id="${H(noteId)}" data-visit-note="${H(v.id)}" maxlength="1000" rows="3" placeholder="Điều bạn muốn hỏi hoặc cần nhớ…" aria-describedby="${H(noteId)}-hint">${H(u.visitNotes?.[v.id]||'')}</textarea><small id="${H(noteId)}-hint">Chỉ lưu trong phiên trình duyệt này; chưa gửi cho phòng khám.</small><span class="cf-local-feedback" data-note-feedback role="status" aria-live="polite"></span></div>
      <div class="cf-card-utility-actions">${kind==='prepare'?`<button type="button" class="btn secondary" ${UI.buttonAttrs('secondary')} data-action="save-calendar" data-id="${H(v.id)}">${h.I('calendar-plus',18)}Lưu lịch cá nhân</button>`:''}${visitAction(kind==='prepare'?'Hỏi phòng khám':'Gửi câu hỏi sau khám',v,kind==='prepare'?'K5':'I1','text')}</div><span class="cf-local-feedback" data-calendar-feedback role="status" aria-live="polite"></span>`, 'cf-preparation-card', 'tonal')}</div>`;
  }
  function journeyCompanion(id,s,v,u,h) {
    if(['D2','E1','G1'].includes(id))return v?.status==='completed'?(h.M.canViewResults(s,v)?visitTools(s,v,u,h,'notes'):''):visitTools(s,v,u,h);
    if(['H6','I3','I5'].includes(id)&&h.M.canViewResults(s,v))return visitTools(s,v,u,h,'notes');
    const bookingGuides={
      C1:{title:'Thông tin theo đúng hồ sơ',steps:['Lịch hẹn được lưu cho người đi khám bạn chọn ở bước này.','Có thể thêm người thân trước khi tiếp tục.','Quyền xem kết quả phụ thuộc quyền truy cập của từng hồ sơ.']},
      C2:{title:'Ghi thông tin để phòng khám chuẩn bị',steps:['Nêu thời điểm bắt đầu và điều khiến bạn muốn đi khám.','Ghi những thay đổi bạn nhận thấy gần đây.','Bổ sung thuốc đang dùng hoặc thông tin y tế liên quan nếu có.']},
      C6:{title:'Chuẩn bị theo hình thức khám',steps:['Tại phòng khám: kiểm tra địa điểm khi nhận phiếu khám.','Trực tuyến: cần thiết bị, mạng và không gian riêng tư.','Phòng khám có thể xem xét lại hình thức dựa trên thông tin bạn gửi.']},
      C7:{title:'Sau khi chọn giờ khám',steps:['Kiểm tra lại ngày và khung giờ mong muốn.','Xem toàn bộ thông tin ở bước xác nhận cuối trước khi gửi.','Theo dõi phiếu khám để nhận xác nhận từ phòng khám.']},
    };
    const guide=bookingGuides[id];
    if(guide&&s.draft)return UI.card(`<h2 class="cf-icon-heading">${h.I(id==='C6'?'video':id==='C7'?'calendar':'shield',20)}<span>${guide.title}</span></h2><ol>${guide.steps.map(step=>`<li>${H(step)}</li>`).join('')}</ol>`,'cf-journey-summary','tonal');
    if(['F3','F4'].includes(id))return UI.card(`<h2>${id==='F3'?'Kiểm tra trước khi chọn lịch':'Chuẩn bị tệp kết quả'}</h2><ol>${(id==='F3'?['Đối chiếu đúng tên chỉ định và người đi khám.','Giờ bạn chọn là mong muốn để điều phối sắp xếp.','Hỏi phòng khám nếu chưa có hướng dẫn chuẩn bị riêng.']:['Chọn tệp PDF, JPG hoặc PNG, tối đa 10 MB.','Kiểm tra ảnh rõ, đủ trang và đúng người đi khám.','Tệp cần được phòng khám kiểm tra trước khi cập nhật kết quả.']).map(text=>`<li>${text}</li>`).join('')}</ol>${visitAction('Xem lại chỉ định',v,'F2','text')}`,'cf-journey-summary','tonal');
    if(['H2','H3','H4','H5'].includes(id))return UI.card(`<h2>Thông tin khoản thu</h2>${UI.facts([['Lượt khám',v.id],['Trạng thái',h.VI.payments[v.payment.status]||'Chưa có thông tin'],['Số tiền',h.C.unknownFee]],H)}<p class="cf-card-subtitle">Cần xác minh khoản thu? Phòng khám phụ trách đối soát và chia sẻ thông tin. Lựa chọn trong prototype chưa tạo giao dịch thật.</p>${visitAction('Hỏi về thanh toán',v,'K5','secondary')}`,'cf-journey-summary','tonal');
    if(id==='K4')return UI.card(`<h2>Dữ liệu trên thiết bị này</h2><p>Ghi chú, checklist và lựa chọn được giữ trong phiên trình duyệt hiện tại. Đăng xuất sẽ kết thúc phiên và xóa các mục riêng đã lưu.</p>${action('Xem hồ sơ đang sử dụng','K2','secondary')}`,'cf-journey-summary','tonal');
    return '';
  }
  root.CareFlowRich = {cardArt,photoCard,detailShortcuts,collection,labImage,appointmentCard,homeHeader,home,appointments,patient,visitExtras,profile,support,aftercare,appointmentTabs,clinician,profileHeader,supportMessages,visitTools,journeyCompanion,preparationItems,DEMO};
})(window);
