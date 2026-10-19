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
    lastDose: 'Chưa có thông tin dùng thuốc',
  });
  const H = (x) => String(x == null ? '' : x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const mode = (v) => UI.modeText(v.mode);
  const supportPortrait = () => '<img class="cf-support-portrait" src="assets/images/unsplash/doctor-cutout.webp" width="1349" height="1166" alt="" aria-hidden="true" decoding="async">';
  const active = (s) => s.visits.filter(v=>!['completed','cancelled','no-show'].includes(v.status)).sort((a,b)=>(a.date+'T'+a.slot).localeCompare(b.date+'T'+b.slot));
  const counts = (s) => ({a:active(s).length, done:s.visits.filter(v=>v.status==='completed').length, cancelled:s.visits.filter(v=>['cancelled','no-show'].includes(v.status)).length, notices:s.notifications.filter(n=>!n.read).length});
  const tone = (v) => UI.status(v.status).tone;
  const greeting = () => { const hour=Number(new Intl.DateTimeFormat('en-GB',{hour:'numeric',hourCycle:'h23',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date())); return hour<11?'Chào buổi sáng':hour<18?'Chào buổi chiều':'Chào buổi tối'; };
  const firstName = (name) => { const parts=String(name||'bạn').trim().split(/\s+/); return parts.length>1?parts.slice(-2).join(' '):parts[0]; };
  const action = (label,to,variant='secondary')=>`<button type="button" class="btn ${variant}" ${UI.buttonAttrs(variant)} data-action="go" data-to="${H(to)}"><span>${H(label)}</span>${root.CareFlowIcon(to==='K5'||to==='I1'?'message-circle':'arrow-right',18)}</button>`;
  const pill = (label,cls='info')=>`<span class="chip ${cls}" data-cf-component="status" data-cf-tone="${cls}">${root.CareFlowIcon(cls==='success'?'check-circle':cls==='warning'?'clock':'info',16)}${H(label)}</span>`;
  const section = (title,html,extra='')=>`<section class="rich-section ${extra}" ${UI.cardAttrs('section')}><h2 class="rich-heading">${H(title)}</h2>${html}</section>`;
  const empty = (title,copy,to='C1')=>`<div class="rich-empty cf-stack" data-cf-card="surface" data-cf-state="empty">${UI.illustration('calendar')}<strong>${H(title)}</strong><p>${H(copy)}</p><button type="button" class="btn secondary" ${UI.buttonAttrs('secondary')} data-action="book-nav">Đặt lịch khám</button></div>`;
  const labImage = lab => /MRI|CT|X.quang|chụp|siêu âm/i.test(lab.name) ? 'imaging-suite.png' : 'unsplash/laboratory.webp';
  // Shared image/caption/action anatomy; note tiles omit the image for a quiet task surface.
  // An arrow is decorative inside the single named control, never a nested button.
  function cardArt(kind) {
    return UI.illustration(({network:'support',stack:'result',topic:'profile'})[kind]||'clinic');
  }
  function photoCard({title,description='',actionName='go',to='',id='',labId='',category='',reason='',purpose='',icon='',classes='',featured=false,layout='photo'}) {
    const kind = ({network:'support',stack:'result',topic:'profile'})[layout] || (/F|H7/.test(to)?'result':/J|D1/.test(to)?'calendar':'clinic');
    const artwork = layout==='topic' ? root.CareFlowIcon(icon||'document',28) : UI.illustration(kind);
    return `<button type="button" class="cf-action-tile cf-layout-${H(layout)} ${H(classes)}" ${UI.cardAttrs('surface')} data-cf-layout="${H(layout)}"${featured?' data-cf-mesh="feature"':''} data-action="${H(actionName)}"${to?` data-to="${H(to)}"`:''}${id?` data-id="${H(id)}"`:''}${labId?` data-lab="${H(labId)}"`:''}${category?` data-category="${H(category)}"`:''}${reason?` data-reason="${H(reason)}"`:''}${purpose?` data-purpose="${H(purpose)}"`:''}><span class="cf-action-art" aria-hidden="true">${artwork}</span><span class="cf-action-copy"><strong>${H(title)}</strong>${description?`<small>${H(description)}</small>`:''}</span><span class="cf-action-arrow" aria-hidden="true">${root.CareFlowIcon('arrow-right',18)}</span></button>`;
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
    return `<div class="screen-intro cf-home-head"><h1 id="screen-title" tabindex="-1">${H(p?.name || 'bạn')}</h1><p>${greeting()}, hôm nay bạn thế nào?</p></div>`;
  }
  function home(s,v,h,u={}) {
    const soon=active(s)[0];
    const completed=s.visits.filter(item=>item.status==='completed'&&h.M.canViewResults(s,item)).sort((a,b)=>b.date.localeCompare(a.date))[0];
    const results=s.visits.reduce((total,item)=>total+item.labs.filter(lab=>['available','awaiting-review','reviewed'].includes(lab.status)).length,0);
    const heading=(title,to,label='Xem tất cả')=>UI.sectionHeader(title,{to,label,action:'go'});
    const hero=`<section class="cf-home-appointment cf-stack" ${UI.cardAttrs('surface')} data-cf-mesh="hero" aria-label="Lịch hẹn tiếp theo"><div class="cf-split"><div class="cf-stack"><small>Lịch hẹn tiếp theo</small><h2>${soon?'Sẵn sàng cho buổi khám':'Chọn thời gian cho sức khỏe'}</h2>${soon?`<span class="cf-home-appointment-status">${h.status(soon)}</span>`:'<p>Bạn chưa có lịch sắp tới. Chọn ngày phù hợp để bắt đầu.</p>'}</div>${UI.illustration('calendar')}</div>${soon?`<div class="cf-home-appointment-info"><span class="cf-home-appointment-avatar">${root.CareFlowAvatar(clinician(soon).name,44)}</span><span><strong>${H(clinician(soon).name)}</strong><small>${H(clinician(soon).specialty)}</small></span></div>`:''}${soon?UI.facts([['Ngày khám',dateTextLite(soon.date)+'/'+soon.date.slice(0,4)],['Giờ khám',soon.slot],['Người đi khám',h.M.profile(s,soon.patientId)?.name],['Hình thức',mode(soon)]],H):''}<div class="cf-card-footer">${soon?`<small>${H(soon.id)}</small><button type="button" class="btn primary cf-home-appointment-button" ${UI.buttonAttrs('primary')} data-action="open-visit" data-id="${H(soon.id)}">${A.viewVisit} ${h.I('arrow-right',18)}</button>`:`<button type="button" class="btn primary" ${UI.buttonAttrs('primary')} data-action="book-nav">Đặt lịch khám ${h.I('arrow-right',18)}</button>`}</div></section>`;
    const overview=`<section class="cf-home-overview" ${UI.cardAttrs('section')}>${heading('Tổng quan chăm sóc','K3')}<div class="cf-metric-grid">${[[active(s).length,'Lịch hẹn','D1','go','calendar'],[s.profiles.length,'Hồ sơ','K2','go','users'],[results,'Kết quả','H7','care-entry','document-check']].map(([value,label,to,act,icon])=>`<button type="button" class="cf-metric" ${UI.cardAttrs('surface')} data-action="${act}" data-to="${to}">${h.I(icon,22)}<strong>${value||'—'}</strong><span>${label}</span><small>${value?'Đang lưu':'Chưa có'}</small></button>`).join('')}</div></section>`;
    const shortcuts=[['calendar','Lịch hẹn','go','D1'],['heart-pulse','Theo dõi','care-entry','I1'],['pill','Đơn thuốc','care-entry','H6'],['document-check','Kết quả','care-entry','H7']];
    const quick=`<section class="cf-home-quick" ${UI.cardAttrs('surface')}><h2>Truy cập nhanh</h2><nav class="cf-home-quick-grid home-quick-actions" aria-label="Thao tác nhanh">${shortcuts.map(([icon,label,act,to])=>`<button type="button" data-action="${act}" data-to="${to}"><span class="cf-quick-icon">${h.I(icon,24)}</span><small>${label}</small></button>`).join('')}</nav></section>`;
    const personal=`<section ${UI.cardAttrs('section')}>${heading('Thông tin của bạn','K2')}<div class="cf-bento"><section class="cf-profile-card" ${UI.cardAttrs('surface')}><h3>Hồ sơ đã lưu</h3>${UI.profileSummary(s.profiles)}<details class="cf-profile-details"><summary>Xem hồ sơ ${h.I('chevron-right',16)}</summary><ul>${s.profiles.map(person=>`<li>${H(person.name)}</li>`).join('')}</ul></details>${action('Quản lý hồ sơ','K2')}</section><section class="cf-question-card" ${UI.cardAttrs('surface')}><h3>Hỏi phòng khám</h3><p>Bạn cần biết gì?</p>${['Giấy tờ đi khám','Đổi giờ hẹn'].map(label=>`<button type="button" ${UI.buttonAttrs('secondary')} data-action="go" data-to="K5">${h.I(label.startsWith('Giấy')?'document':'calendar',18)}${label}</button>`).join('')}</section></div></section>`;
    const guideItems=[
      {category:'onsite',title:'Chuẩn bị trước khi khám',description:'Giấy tờ, đơn thuốc và kết quả cũ',steps:['Kiểm tra họ tên, ngày và giờ trên phiếu khám.','Chuẩn bị giấy tờ và tài liệu y tế bạn đang có.','Hỏi phòng khám về yêu cầu riêng trước khi đến.'],cta:'Xem lịch hẹn',to:'D1'},
      {category:'online',title:'Vào phòng khám online',description:'Kết nối, camera và không gian riêng tư',steps:['Chọn nơi yên tĩnh và có kết nối ổn định.','Mở lịch khám online để kiểm tra camera, micro.','Làm theo trạng thái tiếp nhận trên phiếu khám.'],cta:'Tìm lịch khám online',to:'D1'},
      {category:'aftercare',title:'Tìm lại thông tin sau khám',description:'Kết quả, lời dặn và câu hỏi cho phòng khám',steps:['Mở lượt khám đã hoàn tất của đúng người.','Xem tài liệu phòng khám đã chia sẻ.','Gửi câu hỏi nếu bạn chưa hiểu nội dung được cung cấp.'],cta:'Mở lịch sử khám',to:'K3'}
    ];
    const guides=`<section class="cf-home-tips-section" ${UI.cardAttrs('section')}>${heading('Cẩm nang đi khám','K5','Hỏi phòng khám')}${collection('guides',u,guideItems.map(g=>({category:g.category,search:g.title+' '+g.description,html:`<details class="cf-home-tip-card" ${UI.cardAttrs('surface')}><summary><span class="cf-guide-icon">${h.I(g.category==='online'?'video':g.category==='aftercare'?'document-check':'document',24)}</span><span class="cf-guide-copy"><strong>${H(g.title)}</strong><small>${H(g.description)}</small></span><span class="cf-guide-toggle">${h.I('chevron-right',18)}</span></summary><div class="cf-guide-body"><ol>${g.steps.map(step=>`<li>${H(step)}</li>`).join('')}</ol><button type="button" class="btn secondary" ${UI.buttonAttrs('secondary')} data-action="guide-open" data-to="${g.to}" data-category="${g.category}">${g.cta} ${h.I('arrow-right',16)}</button></div></details>`})),{label:'hướng dẫn',filters:[['all','Tất cả'],['onsite','Đi khám'],['online','Online'],['aftercare','Sau khám']]})}</section>`;
    const next=soon?`<section ${UI.cardAttrs('section')}>${heading('Việc cần làm','D1')}<div class="cf-photo-grid">${photoCard({title:'Chuẩn bị cho buổi khám',description:'Giấy tờ và thông tin cần kiểm tra',layout:'topic',icon:'document',to:soon.mode==='online'?(['confirmed','reminder','online-wait'].includes(soon.status)?'G1':'D2'):'E1',id:soon.id})}${photoCard({title:soon.mode==='online'?'Kiểm tra kết nối':'Ngày và giờ khám',description:soon.mode==='online'?'Mạng, camera và âm thanh':dateTextLite(soon.date)+' · '+soon.slot,layout:'photo',to:soon.mode==='online'?(['confirmed','reminder','online-wait'].includes(soon.status)?'G1':'D2'):'D2',id:soon.id})}</div></section>`:`<section class="cf-split" ${UI.cardAttrs('surface')} data-cf-mesh="feature">${UI.illustration('clinic')}<div class="cf-stack"><h3>Chuẩn bị đi khám</h3><p>Kiểm tra giấy tờ và thông tin trước khi đến.</p>${UI.actionButton('Xem hướng dẫn',{action:'open-guide',icon:'document'})}</div></section>`;
    const care=`<section ${UI.cardAttrs('section')}>${heading('Chăm sóc sau khám','K3','Lịch sử khám')}<article class="cf-home-care-card cf-stack" ${UI.cardAttrs('surface')}${completed?' data-cf-mesh="result"':''}><div class="cf-split"><div class="cf-stack"><h3>${completed?'Thông tin sau buổi khám':'Tài liệu luôn ở đúng nơi'}</h3><p>${completed?H(completed.summary?.note||'Xem lại lời dặn và tài liệu phòng khám đã chia sẻ.'):'Lời dặn và kết quả sẽ xuất hiện sau khi phòng khám cập nhật.'}</p></div>${UI.illustration('result')}</div>${completed?visitAction('Xem lời dặn',completed,'H6','secondary'):action('Xem lịch sử khám','K3')}</article></section>`;
    const help=`<section class="cf-help-strip cf-help-with-portrait" ${UI.cardAttrs('surface')} data-cf-mesh="feature"><div class="cf-stack"><span class="cf-card-kicker">${h.I('message-circle',18)}Hỗ trợ từ xa</span><h3>Cần hỗ trợ thêm?</h3><p>Gửi câu hỏi hoặc yêu cầu gọi lại.</p>${action('Liên hệ','K5')}</div>${supportPortrait()}</section>`;
    return `<div class="cf-home-content cf-stack">${hero}${overview}${quick}${help}${next}${personal}${care}${guides}</div>`;
  }
    function dateTextLite(iso) { const match=String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/); return match?match[3]+'/'+match[2]:'Ngày khám'; }
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
    const primary=done?visitAction(A.viewResults,v,'H7','secondary'):visitAction(A.viewVisit,v,'D2','secondary');
    const secondary=done||stopped?visitAction(A.rebook,v,'C1','secondary','rebook'):(h.M.TRANSITIONS[v.status]||[]).includes('cancelled')?visitAction(pending?'Hủy lịch':'Đổi lịch',v,pending?'D4':'D3'):'';
    return `<article data-cf-component="appointment" data-cf-variant="card" ${UI.cardAttrs('surface')} class="rich-appt-card state-${H(tone(v))}${featured?' cf-appt-featured':''}" aria-label="${H(doctor.name+' · '+h.dateText(v))}">

      <div class="cf-appointment-caption">
      <div class="rich-appt-top"><button type="button" class="cf-appt-open" data-action="open-visit" data-id="${H(v.id)}" aria-label="Chi tiết lịch ${H(doctor.name)}"><span class="cf-clinician-avatar" aria-hidden="true">${root.CareFlowAvatar(doctor.name,44)}</span><span class="cf-clinician-copy"><strong>${H(doctor.name)}</strong><small>${H(doctor.specialty)} · ${UI.modeText(v.mode)}</small></span></button>${UI.badge(v.status)}</div>
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
    const hasVisits=groups.some(([,visits])=>visits.length);
    const emptyCopy=u.filter==='past'?'Thông tin sẽ xuất hiện ở đây sau khi buổi khám hoàn tất.':u.filter==='cancelled'?'Bạn chưa có lịch đã hủy. Xem lịch còn hiệu lực ở tab Sắp tới.':'Chọn khung giờ phù hợp để đặt lịch cho bạn hoặc người thân.';
    const modeFilter=u.appointmentMode||'all';
    const recentCard=v=>{const doctor=clinician(v);return `<button type="button" class="cf-appointment-history" ${UI.cardAttrs('row')} data-action="go" data-to="H7" data-id="${H(v.id)}"><strong>${H(v.date.split('-').reverse().join('/'))}</strong><small>${H(doctor.name)} · ${H(doctor.specialty)}</small>${UI.badge('completed')}</button>`;};
    return `<div class="cf-appointments"><label class="cf-appointment-search" for="appointment-search">Tìm lịch hẹn<input id="appointment-search" type="search" data-appointment-search value="${H(u.appointmentQuery||'')}" placeholder="Người khám, bác sĩ, lý do, mã phiếu…" autocomplete="off"></label><div id="appointment-filters" class="cf-appointment-filter-panel"${u.appointmentFilters?'':' hidden'}>
      <details class="rich-person-picker" data-person="${H(personFilter)}"><summary>${root.CareFlowAvatar(person?.id||'account',32)}<span>${H(person?.name||'Tất cả hồ sơ')}</span>${h.I('chevron-right',18)}</summary><div class="rich-person-options" role="group" aria-label="Lọc theo người đi khám"><button type="button" data-appointment-person="all" aria-pressed="${personFilter==='all'}">Tất cả hồ sơ</button>${s.profiles.map(p=>`<button type="button" data-appointment-person="${H(p.id)}" aria-pressed="${personFilter===p.id}">${H(p.name)}</button>`).join('')}</div></details>
      <div class="rich-filter-chips" role="group" aria-label="Lọc hình thức">${[['all','Tất cả'],['onsite','Tại phòng khám'],['online',COPY.common.online]].map(([key,label])=>`<button type="button" data-cf-component="tab" data-cf-variant="segmented" data-visit-filter="${key}" aria-pressed="${key===modeFilter}">${label}</button>`).join('')}</div></div>
      ${u.appointmentGroup?`<button type="button" class="btn text cf-appt-show-all" data-action="filter" data-filter="upcoming">${h.I('chevron-left',16)} Tất cả lịch sắp tới</button>`:''}
      <div class="cf-appointment-filter-summary"><span data-appointment-count role="status" aria-live="polite"></span><button type="button" data-appointment-reset hidden>Xóa bộ lọc</button></div><div class="rich-appointment-list">${groups.filter(([,visits])=>visits.length).map(([title,visits,key])=>`<section class="rich-appointment-group"><div class="cf-appointment-section-head"><h2 class="rich-heading">${H(title)}</h2>${u.appointmentGroup?'':`<button type="button" data-action="${key==='recent'?'filter':'appointment-group'}" ${key==='recent'?'data-filter="past"':`data-group="${key}"`} aria-label="Xem tất cả ${H(title.toLocaleLowerCase('vi-VN'))}">Xem tất cả ${h.I('chevron-right',14)}</button>`}</div><div class="${key==='recent'?'cf-appointment-history-grid':'cf-appointment-cards'}">${visits.map((v,i)=>`<div class="rich-filterable" data-mode="${v.mode}" data-person="${H(v.patientId)}" data-search="${H([v.id,h.M.profile(s,v.patientId)?.name,clinician(v).name,v.reason,h.dateText(v)].join(' '))}">${key==='recent'?recentCard(v):appointmentCard(s,v,h,key==='upcoming'&&i===0)}</div>`).join('')}</div></section>`).join('')||empty(u.filter==='upcoming'?'Chưa có lịch sắp tới':u.filter==='past'?'Chưa có lượt khám đã hoàn tất':'Chưa có lịch đã hủy',emptyCopy)}</div>
      <div class="rich-filter-empty" role="status" hidden><strong>Không có lịch phù hợp</strong><p>Thử hồ sơ hoặc hình thức khác để tìm lịch của bạn.</p><button type="button" class="btn secondary" data-appointment-reset>Xóa bộ lọc</button></div>
      ${hasVisits?'<button type="button" class="btn primary rich-new-booking" data-action="book-nav">Đặt lịch khám mới</button>':''}</div>`;
  }
  function patient(s,d,h) {
    const relation = p => p.relation==='self'?'Bản thân':p.relation==='mother'?'Mẹ':'Người thân';
    const choices = s.profiles.map(p=>`<label class="choice patient-choice rich-patient-choice ${d?.patientId===p.id?'selected':''}" ${UI.cardAttrs('tonal')}>
      <input type="radio" name="${H(h.C.patient)}" value="${H(p.id)}"${d?.patientId===p.id?' checked':''}>
      <span class="choice-visual">${root.CareFlowAvatar(p.id,46)}</span>
      <span class="choice-copy"><strong>${H(p.name)}</strong><small>${relation(p)}</small><span class="rich-profile-meta">Ngày sinh · ${H(p.dob?.split('-').reverse().join('/')||'Chưa cập nhật')}</span></span>
    </label>`).join('');
    const selected=h.M.profile(s,d?.patientId);
    return h.form('patient',`<section class="patient-group"><div class="group-heading"><h2>Người đi khám</h2><span>${s.profiles.length} hồ sơ</span></div><fieldset class="choices"><legend class="sr-only">Ai sẽ đi khám?</legend>${choices}</fieldset><p class="cf-patient-hint">Lịch hẹn sẽ được lưu vào hồ sơ đã chọn.</p><button class="btn secondary add-relative-inline" ${UI.buttonAttrs('secondary')} type="button" data-action="profile-add-booking">${h.I('plus',18)}Thêm người thân</button><details class="cf-profile-privacy"><summary>${h.I('shield',18)}Quyền xem kết quả ${h.I('chevron-down',16)}</summary><p>Đặt lịch hộ không tự cấp quyền xem kết quả. Người được khám cần cho phép riêng.</p></details></section>`,selected?'Tiếp tục với '+firstName(selected.name):'Tiếp tục');
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
  function referenceSection(title,html,h,actionName='',attributes='',extra='',linkLabel='Xem tất cả') {
    return `<section class="cf-reference-section ${extra}" ${UI.cardAttrs('surface')}><div class="cf-reference-section-head"><h2>${H(title)}</h2>${actionName?`<button type="button" data-action="${actionName}" ${attributes} aria-label="${H(linkLabel==='Xem tất cả'?linkLabel+' '+title.toLocaleLowerCase('vi-VN'):linkLabel)}">${H(linkLabel)} ${h.I('chevron-right',15)}</button>`:''}</div>${html}</section>`;
  }
  function profileHeader(s,h) {
    const p=h.M.accountProfile(s),count=s.profiles.filter(x=>x.relation!=='self').length;
    return `<div class="cf-profile-masthead-account"><div class="cf-profile-banner-content"><span class="cf-reference-avatar" aria-hidden="true">${root.CareFlowAvatar(p?.id||'account',64)}</span><div><strong>${H(p?.name||'Chưa có tài khoản')}</strong><small>Hồ sơ của bạn · ${count} người thân</small></div></div></div>`;
  }
  function profile(s,u,h) {
    const p=h.M.accountProfile(s),relatives=s.profiles.filter(x=>x.relation!=='self');
    const personal=[['Họ tên',p?.name],['Số điện thoại',p?.phone?p.phone.slice(0,3)+' ••• '+p.phone.slice(-3):'Chưa cập nhật']];
    const details=`<div class="rich-profile-details cf-reference-card"><dl class="cf-personal-facts">${personal.map(([label,value])=>`<div><dt>${H(label)}</dt><dd>${H(value||'Chưa cập nhật')}</dd></div>`).join('')}</dl><div class="cf-profile-allergy">${h.I('shield',20)}<div><small>Dị ứng</small><strong>${H(p?.allergies||'Chưa khai báo')}</strong></div><button type="button" class="btn secondary" ${UI.buttonAttrs('secondary')} data-action="profile-update">Gửi cập nhật</button></div></div>`;
    const add=`<details class="rich-add-person add-relative cf-relative-add" id="profile-add-relative"><summary>${h.I('plus',18)} Thêm người thân</summary>${h.form('relative',h.field('name','Họ và tên')+h.field('dob','Ngày sinh','','date',{max:h.M.localDate()}),'Lưu hồ sơ')}</details>`;
    const relativeCards=`${relatives.length?'':'<div class="cf-relative-empty"><strong>Chưa có hồ sơ người thân</strong><p>Thêm hồ sơ để đặt lịch hộ khi cần.</p></div>'}<div class="rich-settings-links cf-relative-grid">${relatives.map(person=>`<button type="button" class="cf-relative-card" data-action="profile-relative" data-id="${H(person.id)}"><span class="cf-reference-avatar" aria-hidden="true">${root.CareFlowAvatar(person.id,44)}</span><span><strong>${H(person.name)}</strong><small>${relation(person)}</small></span>${h.I('chevron-right',16)}</button>`).join('')}${add}</div>`;
    const settings=`<div class="rich-settings-links cf-reference-card cf-settings-list">${[['bell','Thông báo',s.settings.reminders?'Đang bật':'Đang tắt','reminders'],['globe','Ngôn ngữ','Tiếng Việt','language'],['shield','Bảo mật và quyền riêng tư','','privatePreview']].map(([icon,label,value,focus])=>`<button type="button" data-action="${focus==='language'?'settings-language':'settings-open'}" data-focus="${focus}">${h.I(icon,20)}<strong>${label}</strong>${value?`<small>${H(value)}</small>`:''}${h.I('chevron-right',16)}</button>`).join('')}</div>`;
    return `<div class="cf-profile-content">${referenceSection('Thông tin cá nhân',details,h,'profile-details','','','Xem hồ sơ')}${referenceSection('Người thân',relativeCards,h,relatives.length>1?'profile-relatives':'','','', 'Danh sách')}${referenceSection('Cài đặt',settings,h)}<button type="button" class="btn danger rich-danger-logout" ${UI.buttonAttrs('danger')} data-action="confirm-logout">${h.I('log-out',18)}Đăng xuất</button></div>`;
  }
  function aftercare(v,h) {
    if(v.status!=='completed') return '';
    return `<section class="rich-section rich-aftercare-sample" ${UI.cardAttrs('section')} aria-label="Chăm sóc sau buổi khám">${UI.illustration('result')}<h2 class="rich-heading">Việc cần làm sau buổi khám</h2>
      <p class="rich-subnote">Lưu câu hỏi và kiểm tra tài liệu của lượt khám này.</p>
      <ol class="rich-sample-instructions"><li>Xem kết luận, đơn thuốc và kết quả đã được phòng khám chia sẻ ở trên.</li><li>Nếu chưa có tài liệu hoặc còn điều chưa rõ, gửi câu hỏi cho phòng khám.</li><li>Ghi lại thay đổi sức khỏe để trao đổi trong lần liên hệ tiếp theo.</li></ol>
      ${action('Ghi cập nhật sức khỏe','I3','text')}
      ${action('Hỏi phòng khám','I1','secondary')}</section>`;
  }
  const supportMessages = s => s.messages.filter(m=>root.CareFlowModel.canViewResults(s,s.visits.find(v=>v.id===m.visitId)));
  function support(s,u,h) {
    const waiting=s.requests.find(x=>x.status==='waiting');
    const messages=supportMessages(s);
    const careVisit=s.visits.find(v=>v.status==='completed'&&h.M.canViewResults(s,v));
    const topics=['Đổi hoặc hủy lịch','Thông tin hồ sơ','Thanh toán','Kết quả','Đơn thuốc','Khám trực tuyến','Khác'];
    const selected=u.forms.support?.supportTopic||topics[0];
    const contactMode=u.forms.support?.contactMode||'call';
    const contactLabels={call:'Gọi điện',message:'Tin nhắn',zalo:'Zalo'};
    const helpContent=`<div class="rich-support-form"><div class="field"><label for="supportTopic">Chủ đề</label><select id="supportTopic" name="supportTopic">${topics.map(topic=>`<option${topic===selected?' selected':''}>${H(topic)}</option>`).join('')}</select></div>
      ${h.textarea('support','Nội dung','',{placeholder:'Bạn cần phòng khám hỗ trợ điều gì?',maxlength:'500'})}
      <details class="cf-contact-preference"><summary><span>Nhận phản hồi qua</span><strong data-contact-mode-label>${contactLabels[contactMode]}</strong>${h.I('chevron-down',16)}</summary><fieldset class="rich-contact-methods"><legend>Phòng khám nên liên hệ qua</legend>${Object.entries(contactLabels).map(([value,label])=>`<label><input type="radio" name="contactMode" value="${value}"${value===contactMode?' checked':''}> ${label}</label>`).join('')}</fieldset></details></div>`;
    const quick=`<div class="rich-contact-grid cf-support-bento"><button type="button" class="cf-support-message" aria-label="Nhắn tin cho phòng khám" data-action="${careVisit?'go':'support-compose'}"${careVisit?` data-to="I5" data-id="${H(careVisit.id)}"`:''}><span class="cf-support-tile-icon" aria-hidden="true">${h.I('message-circle',24)}</span><strong>Nhắn tin cho phòng khám</strong><span class="cf-support-tile-description">${careVisit?'Trao đổi về buổi khám, xem phản hồi.':'Gửi câu hỏi qua form hỗ trợ bên dưới.'}</span><span class="cf-support-chat-link">${careVisit?'Mở trò chuyện':'Viết câu hỏi'} ${h.I('arrow-right',18)}</span>${supportPortrait()}</button><button type="button" class="cf-support-callback" aria-label="Gọi lại" data-action="clinic-call"><span class="cf-support-tile-icon" aria-hidden="true">${h.I('phone',22)}</span><strong>Nhờ gọi lại</strong><span class="cf-support-tile-description">${s.requests.some(r=>r.type==='callback'&&r.status==='waiting')?'Đã gửi · Chờ tiếp nhận':'Gửi yêu cầu để phòng khám liên hệ.'}</span></button><button type="button" class="cf-support-requests" data-action="support-requests"><span class="cf-support-tile-icon" aria-hidden="true">${h.I('document',22)}</span><strong>Yêu cầu đã gửi</strong><span class="cf-support-tile-description">${s.requests.length?`${s.requests.length} yêu cầu · ${s.requests.filter(r=>r.status==='waiting').length} đang chờ`:'Chưa có yêu cầu'}</span></button></div><div class="cf-support-topics"><p>Bạn cần hỏi về</p><div>${[['Lịch hẹn','Đổi hoặc hủy lịch'],['Hồ sơ','Thông tin hồ sơ'],['Thanh toán','Thanh toán'],['Kết quả','Kết quả']].map(([label,topic])=>`<button type="button" ${UI.buttonAttrs('secondary')} data-action="support-topic" data-topic="${H(topic)}">${label}</button>`).join('')}${careVisit?`<button type="button" ${UI.buttonAttrs('secondary')} data-action="go" data-to="I1" data-id="${H(careVisit.id)}" aria-label="Hỏi phòng khám">Hỏi về lượt khám ${h.I('arrow-right',16)}</button>`:''}</div></div>`;
    const faqs=[['Cách vào phòng khám trực tuyến','Mở lịch khám trực tuyến, kiểm tra thiết bị và làm theo hướng dẫn trên phiếu khám.'],['Cần mang gì khi đi khám?','Mang giấy tờ tùy thân, đơn thuốc và kết quả cũ nếu có. Xem thêm hướng dẫn trên phiếu khám.'],['Đổi hoặc hủy lịch thế nào?','Mở Lịch hẹn → Phiếu khám để chọn đổi hoặc hủy theo trạng thái hiện tại. Lịch thay thế cần phòng khám xác nhận.'],['Khi nào có kết quả?','Thời gian tùy từng xét nghiệm. Theo dõi mục Kết quả hoặc hỏi phòng khám.'],['Cần hỗ trợ thanh toán?','Chọn chủ đề Thanh toán và gửi yêu cầu để phòng khám kiểm tra lượt khám của bạn.']];
    const faqList=`<div class="rich-faqs cf-reference-card">${faqs.slice(0,u.supportFaqs?faqs.length:3).map(([question,answer])=>`<details class="faq"><summary>${H(question)}${h.I('chevron-right',16)}</summary><p>${H(answer)}</p></details>`).join('')}</div>`;
    const previews=messages.length?`<div class="rich-settings-links">${messages.slice(u.supportMessagesAll?-messages.length:-1).reverse().map(message=>`<div class="rich-message-preview cf-reference-card"><span class="cf-reference-avatar" aria-hidden="true">${message.from==='staff'?'PK':H(initials(h.M.profile(s,message.patientId)?.name||h.M.accountProfile(s)?.name))}</span><div><strong>${message.from==='staff'?'Phòng khám':'Bạn'}</strong><p>${H(message.text)}</p></div></div>`).join('')}</div>`:`<div class="cf-reference-card cf-message-empty"><p>Chưa có tin nhắn. Bạn có thể gửi yêu cầu ở trên.</p></div>`;
    return `<div class="cf-support-content">${UI.emergencyCard({compact:true})}${referenceSection('Liên hệ nhanh',quick,h,'','','cf-support-contact-section')}${referenceSection('Câu hỏi thường gặp',faqList,h,'support-faqs','','',u.supportFaqs?'Thu gọn':'Xem thêm')}${referenceSection('Gửi yêu cầu',`<div class="cf-reference-card cf-support-request-card">${h.form('support',helpContent,'Gửi yêu cầu','secondary')}</div>${waiting?`<aside class="rich-support-request" role="status"><strong>Đang chờ phòng khám tiếp nhận</strong><p>${H(waiting.type==='callback'?'Yêu cầu gọi lại':waiting.topic||'Yêu cầu hỗ trợ')}</p></aside>`:''}`,h)}${messages.length?referenceSection('Tin nhắn gần đây',previews,h,'support-messages'):'<p class="cf-support-message-empty">Chưa có tin nhắn. Phản hồi sẽ xuất hiện khi phòng khám trả lời.</p>'}</div>`;
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
    if(['C1','C7'].includes(id))return '';
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
