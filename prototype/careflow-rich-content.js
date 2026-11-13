/* Rich patient content: presentation and synthetic demo only. Existing state transitions remain in model/app. */
(function install(root) {
  'use strict';
  const UI = root.CareFlowUI, COPY = root.CareFlowCopy, A = COPY.ui;
  const DEMO = Object.freeze({
    doctor: 'Dr. Trần Thu Hà',
    specialty: 'General internal medicine',
    clinic: 'CareFlow Clinic',
    address: '45 Nguyễn Thị Minh Khai, District 1',
    code: 'CF-1017-0042',
    record: 'HS-000128',
    fee: '350,000 VND',
    hotline: '1900 0000',
    lastVisit: '02/10/2026',
    lastDose: 'No medication information yet',
  });
  const H = (x) => String(x == null ? '' : x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const mode = (v) => UI.modeText(v.mode);
  const supportPortrait = () => '<img class="cf-support-portrait" src="assets/images/unsplash/doctor-cutout.webp" width="1349" height="1166" alt="" aria-hidden="true" decoding="async">';
  const active = (s) => s.visits.filter(v=>!['completed','cancelled','no-show'].includes(v.status)).sort((a,b)=>(a.date+'T'+a.slot).localeCompare(b.date+'T'+b.slot));
  const counts = (s) => ({a:active(s).length, done:s.visits.filter(v=>v.status==='completed').length, cancelled:s.visits.filter(v=>['cancelled','no-show'].includes(v.status)).length, notices:s.notifications.filter(n=>!n.read).length});
  const tone = (v) => UI.status(v.status).tone;
  const greeting = () => { const hour=Number(new Intl.DateTimeFormat('en-GB',{hour:'numeric',hourCycle:'h23',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date())); return hour<11?'Good morning':hour<18?'Good afternoon':'Good evening'; };
  const monthShort = (m) => new Intl.DateTimeFormat('en-GB',{month:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2000,Number(m)-1,1)));
  const firstName = (name) => { const parts=String(name||'there').trim().split(/\s+/); return parts.length>1?parts.slice(-2).join(' '):parts[0]; };
  const action = (label,to,variant='secondary')=>`<button type="button" class="btn ${variant}" ${UI.buttonAttrs(variant)} data-action="go" data-to="${H(to)}"><span>${H(label)}</span>${root.CareFlowIcon(to==='K5'||to==='I1'?'message-circle':'arrow-right',18)}</button>`;
  const pill = (label,cls='info')=>`<span class="chip ${cls}" data-cf-component="status" data-cf-tone="${cls}">${root.CareFlowIcon(cls==='success'?'check-circle':cls==='warning'?'clock':'info',16)}${H(label)}</span>`;
  const section = (title,html,extra='')=>`<section class="rich-section ${extra}" ${UI.cardAttrs('section')}><h2 class="rich-heading">${H(title)}</h2>${html}</section>`;
  const empty = (title,copy,to='C1')=>`<div class="rich-empty cf-stack" data-cf-card="surface" data-cf-state="empty">${UI.illustration('calendar')}<strong>${H(title)}</strong><p>${H(copy)}</p><button type="button" class="btn secondary" ${UI.buttonAttrs('secondary')} data-action="book-nav">Book an appointment</button></div>`;
  const labImage = lab => /MRI|\bCT\b|X.quang|X-?ray|scan|ultrasound|imaging|chụp|siêu âm/i.test(lab.name) ? 'imaging-suite.png' : 'unsplash/laboratory.webp';
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
    return `<nav class="cf-detail-shortcuts" aria-label="Visit tools">${[
      ['calendar','Visits','D1'],
      [v.mode==='online'?'video':'map-pin',preparing?'Prepare':'History',preparing?preparation:'K3'],
      ['document-check','Tests','F1'],['headphones','Support','K5']
    ].map(([icon,label,to])=>`<button type="button" data-action="go" data-to="${to}" data-id="${H(v.id)}"><span aria-hidden="true">${h.I(icon,22)}</span><small>${label}</small></button>`).join('')}</nav>`;
  }
  function collection(key,u,items,options={}) {
    const current=u.collections?.[key]||{};
    const selected=current.filter||'all';
    const query=current.query||'';
    const filters=options.filters||[];
    return `<section class="cf-collection" data-collection="${H(key)}" data-filter="${H(selected)}" aria-label="List of ${H(options.label||'content')}">
      ${options.search?`<div class="cf-collection-search"><label${options.compactSearch?' class="sr-only"':''} for="search-${key}">${H(options.search)}</label><span class="cf-search-control"><span class="cf-search-icon" aria-hidden="true">${root.CareFlowIcon('search',20)}</span><input id="search-${key}" type="search" data-collection-search value="${H(query)}" placeholder="${H(options.placeholder||'Enter a keyword')}" autocomplete="off"></span></div>`:''}
      ${filters.length?`<div class="rich-filter-chips cf-collection-filters" role="group" aria-label="Filter ${H(options.label||'content')}">${filters.map(([value,label])=>`<button type="button" data-collection-filter="${H(value)}" aria-pressed="${value===selected}">${H(label)}</button>`).join('')}</div>`:''}
      <div class="cf-collection-meta"><span data-collection-count role="status" aria-live="polite">${items.length} ${H(items.length===1?String(options.label||'items').replace(/s$/,''):(options.label||'items'))}</span><button type="button" data-collection-reset hidden>Clear filters</button></div>
      <div class="cf-collection-items">${items.map(item=>`<div data-collection-item data-category="${H(item.category)}" data-search="${H(item.search)}">${item.html}</div>`).join('')}</div>
      <div class="cf-collection-empty" hidden><strong>No matching content found</strong><p>Try another keyword or clear filters to see everything.</p><button type="button" class="btn secondary" ${UI.buttonAttrs('secondary')} data-collection-reset>Clear filters</button></div></section>`;
  }
  function homeHeader(s,p) {
    const soon=active(s)[0];
    const ticket=soon?`<div class="cf-hdr-ticket-date"><strong>${H(soon.date.slice(-2))}</strong><small>${monthShort(soon.date.slice(5,7))}</small></div><div class="cf-hdr-ticket-info" id="home-next-visit"><small>Next appointment</small><strong>${H(soon.slot)} · ${mode(soon)}</strong><span class="cf-home-appointment-status">${UI.badge(soon.status)}</span><small class="cf-home-appointment-info">${H(root.CareFlowModel.profile(s,soon.patientId)?.name)} · ${H(soon.id)}</small></div><button type="button" class="cf-hdr-ticket-arrow cf-home-appointment-button" ${UI.buttonAttrs('primary')} data-action="open-visit" data-id="${H(soon.id)}" aria-label="View appointment details" aria-describedby="home-next-visit">${root.CareFlowIcon('arrow-right',20)}</button>`:`<span class="cf-hdr-ticket-date" aria-hidden="true">${root.CareFlowIcon('calendar',28)}</span><div class="cf-hdr-ticket-info"><strong>You have no upcoming appointments</strong><small>Choose a convenient time to get started.</small></div><button type="button" class="cf-hdr-ticket-arrow" ${UI.buttonAttrs('primary')} data-action="book-nav" aria-label="Book an appointment">${root.CareFlowIcon('plus',22)}</button>`;
    return `<div class="screen-intro cf-hdr-topline"><span class="cf-hdr-wordmark">CareFlow<span>+</span></span></div><div class="cf-hdr-home-intro"><div><p>${greeting()},</p><h1 id="screen-title" tabindex="-1" aria-label="${H(p?.name||'there')}">${H(firstName(p?.name))}</h1><p>Care, starting today.</p></div><span class="cf-hdr-home-portrait" aria-hidden="true">${root.CareFlowAvatar(p?.id||'account',72)}<span class="cf-hdr-portrait-mark">${root.CareFlowIcon('heart-pulse',20)}</span></span></div><section class="cf-home-appointment cf-hdr-floating-ticket" aria-label="Next appointment">${ticket}</section>`;
  }
  function home(s,v,h,u={}) {
    const soon=active(s)[0];
    const completed=s.visits.filter(item=>item.status==='completed'&&h.M.canViewResults(s,item)).sort((a,b)=>b.date.localeCompare(a.date))[0];
    const results=s.visits.reduce((total,item)=>total+item.labs.filter(lab=>['available','awaiting-review','reviewed'].includes(lab.status)).length,0);
    const heading=(title,to,label='View all')=>UI.sectionHeader(title,{to,label,action:'go'});
    const overview=`<section class="cf-home-overview" ${UI.cardAttrs('section')}>${heading('Care overview','K3')}<div class="cf-metric-grid">${[[active(s).length,'Appointments','D1','go','calendar'],[s.profiles.length,'Profiles','K2','go','users'],[results,'Results','H7','care-entry','document-check']].map(([value,label,to,act,icon])=>`<button type="button" class="cf-metric" ${UI.cardAttrs('surface')} data-action="${act}" data-to="${to}">${h.I(icon,22)}<strong>${value||'—'}</strong><span>${label}</span><small>${value?'Saved':'None yet'}</small></button>`).join('')}</div></section>`;
    const shortcuts=[['calendar','Appointments','go','D1'],['heart-pulse','Follow-up','care-entry','I1'],['pill','Prescriptions','go','M1'],['document-check','Results','care-entry','H7']];
    const quick=`<section class="cf-home-quick" ${UI.cardAttrs('surface')}><h2>Quick access</h2><nav class="cf-home-quick-grid home-quick-actions" aria-label="Quick actions">${shortcuts.map(([icon,label,act,to])=>`<button type="button" data-action="${act}" data-to="${to}"><span class="cf-quick-icon">${h.I(icon,24)}</span><small>${label}</small></button>`).join('')}</nav></section>`;
    const personal=`<section ${UI.cardAttrs('section')}>${heading('Your information','K2')}<div class="cf-bento"><section class="cf-profile-card" ${UI.cardAttrs('surface')}><h3>Saved profiles</h3>${UI.profileSummary(s.profiles)}<details class="cf-profile-details"><summary>View profiles ${h.I('chevron-right',16)}</summary><ul>${s.profiles.map(person=>`<li>${H(person.name)}</li>`).join('')}</ul></details>${action('Manage profiles','K2')}</section><section class="cf-question-card" ${UI.cardAttrs('surface')}><h3>Ask the clinic</h3><p>What do you need to know?</p>${[['document','Documents to bring'],['calendar','Change appointment time']].map(([symbol,label])=>`<button type="button" ${UI.buttonAttrs('secondary')} data-action="go" data-to="K5">${h.I(symbol,18)}${label}</button>`).join('')}</section></div></section>`;
    const guideItems=[
      {category:'onsite',title:'Before your visit',description:'Documents, prescriptions and previous results',steps:['Check the name, date and time in your appointment details.','Gather your ID and any medical documents you have.','Ask the clinic about any special instructions before you arrive.'],cta:'View appointments',to:'D1'},
      {category:'online',title:'Joining an online visit',description:'Connection, camera and a private space',steps:['Choose a quiet place with a stable connection.','Open your online appointment to check your camera and microphone.','Follow the check-in status in your appointment details.'],cta:'Find online appointments',to:'D1'},
      {category:'aftercare',title:'Finding information after your visit',description:'Results, advice and questions for the clinic',steps:['Open the completed visit for the right person.','View the documents the clinic has shared.','Send a question if anything provided is unclear.'],cta:'Open visit history',to:'K3'}
    ];
    const guides=`<section class="cf-home-tips-section" ${UI.cardAttrs('section')}>${heading('Visit guide','K5','Ask the clinic')}${collection('guides',u,guideItems.map(g=>({category:g.category,search:g.title+' '+g.description,html:`<details class="cf-home-tip-card" ${UI.cardAttrs('surface')}><summary><span class="cf-guide-icon">${h.I(g.category==='online'?'video':g.category==='aftercare'?'document-check':'document',24)}</span><span class="cf-guide-copy"><strong>${H(g.title)}</strong><small>${H(g.description)}</small></span><span class="cf-guide-toggle">${h.I('chevron-right',18)}</span></summary><div class="cf-guide-body"><ol>${g.steps.map(step=>`<li>${H(step)}</li>`).join('')}</ol><button type="button" class="btn secondary" ${UI.buttonAttrs('secondary')} data-action="guide-open" data-to="${g.to}" data-category="${g.category}">${g.cta} ${h.I('arrow-right',16)}</button></div></details>`})),{label:'guides',filters:[['all','All'],['onsite','In person'],['online','Online'],['aftercare','Aftercare']]})}</section>`;
    const next=soon?`<section ${UI.cardAttrs('section')}>${heading('To do','D1')}<div class="cf-photo-grid">${photoCard({title:'Prepare for your visit',description:'Documents and details to check',layout:'topic',icon:'document',to:soon.mode==='online'?(['confirmed','reminder','online-wait'].includes(soon.status)?'G1':'D2'):'E1',id:soon.id})}${photoCard({title:soon.mode==='online'?'Check your connection':'Visit date and time',description:soon.mode==='online'?'Network, camera and audio':dateTextLite(soon.date)+' · '+soon.slot,layout:'photo',to:soon.mode==='online'?(['confirmed','reminder','online-wait'].includes(soon.status)?'G1':'D2'):'D2',id:soon.id})}</div></section>`:`<section class="cf-split" ${UI.cardAttrs('surface')} data-cf-mesh="feature">${UI.illustration('clinic')}<div class="cf-stack"><h3>Getting ready for a visit</h3><p>Check your documents and details before you arrive.</p>${UI.actionButton('View guide',{action:'open-guide',icon:'document'})}</div></section>`;
    const care=`<section ${UI.cardAttrs('section')}>${heading('Aftercare','K3','Visit history')}<article class="cf-home-care-card cf-stack" ${UI.cardAttrs('surface')}${completed?' data-cf-mesh="result"':''}><div class="cf-split"><div class="cf-stack"><h3>${completed?'After your visit':'Your documents, all in one place'}</h3><p>${completed?H(completed.summary?.note||'Review the advice and documents the clinic has shared.'):'Advice and results will appear once the clinic updates them.'}</p></div>${UI.illustration('result')}</div>${completed?visitAction('View advice',completed,'H6','secondary'):action('View visit history','K3')}</article></section>`;
    const help=`<section class="cf-help-strip cf-help-with-portrait" ${UI.cardAttrs('surface')} data-cf-mesh="feature"><div class="cf-stack"><span class="cf-card-kicker">${h.I('message-circle',18)}Remote support</span><h3>Need more help?</h3><p>Send a question or request a callback.</p>${action('Contact','K5')}</div>${supportPortrait()}</section>`;
    return `<div class="cf-home-content cf-stack">${overview}${quick}${help}${next}${personal}${care}${guides}</div>`;
  }
    function dateTextLite(iso) { const match=String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/); return match?match[3]+'/'+match[2]:'Visit date'; }
  const visitAction = (label, v, to, variant = 'secondary', purpose = '') =>
    `<button type="button" class="btn ${variant}" ${UI.buttonAttrs(variant)} data-action="go" data-to="${H(to)}" data-id="${H(v.id)}"${purpose ? ` data-purpose="${H(purpose)}"` : ''}>${variant==='inverse'?'':root.CareFlowIcon(({D3:'calendar',D4:'cross',G1:'video',E1:'document',C1:'calendar-plus'})[to]||'arrow-right',18)}<span>${H(label)}</span></button>`;
  const clinician = v => v?.clinician || {name:DEMO.doctor,specialty:DEMO.specialty,initials:'TH'};
  function appointmentTabs(s,u) {
    const c=counts(s);
    return `<div class="segments rich-appt-tabs" role="group" aria-label="Appointment status">${[['upcoming','Upcoming',c.a],['past','Past',c.done],['cancelled','Cancelled',c.cancelled]].map(([key,label,count])=>`<button type="button" data-cf-component="tab" data-cf-variant="segmented" class="btn ${u.filter===key?'selected':'text'}" data-action="filter" data-filter="${key}" aria-pressed="${u.filter===key}" aria-label="${label} (${count})">${label}<span class="cf-tab-count">${count}</span></button>`).join('')}</div>`;
  }
  function appointmentCalendar(s,u,h) {
    const visits=u.filter==='past'?s.visits.filter(v=>v.status==='completed'):u.filter==='cancelled'?s.visits.filter(v=>['cancelled','no-show'].includes(v.status)):active(s);
    const dates=[...new Set(visits.map(v=>v.date))].sort();
    const selected=dates.includes(u.appointmentDate)?u.appointmentDate:'';
    return `${dates.length?`<div class="cf-hdr-calendar-heading"><span>${h.I('calendar',18)}Dates with appointments</span><small>${visits.length} ${u.filter==='past'?(visits.length===1?'past visit':'past visits'):u.filter==='cancelled'?'cancelled':'upcoming'}</small></div><div class="cf-hdr-date-rail" role="group" aria-label="Filter by date"><button type="button" data-appointment-date="" aria-pressed="${!selected}"><span>${h.I('calendar',20)}</span><small>All</small></button>${dates.map(date=>`<button type="button" data-appointment-date="${H(date)}" aria-label="${H(h.dateText({date}))}" aria-pressed="${selected===date}"><strong>${H(date.slice(-2))}</strong><small>${monthShort(date.slice(5,7))}</small></button>`).join('')}</div>`:''}${appointmentTabs(s,u)}`;
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
    const secondary=done||stopped?visitAction(A.rebook,v,'C1','secondary','rebook'):(h.M.TRANSITIONS[v.status]||[]).includes('cancelled')?visitAction(pending?'Cancel':'Reschedule',v,pending?'D4':'D3'):'';
    return `<article data-cf-component="appointment" data-cf-variant="card" ${UI.cardAttrs('surface')} class="rich-appt-card state-${H(tone(v))}${featured?' cf-appt-featured':''}" aria-label="${H(doctor.name+' · '+h.dateText(v))}">

      <div class="cf-appointment-caption">
      <div class="rich-appt-top"><button type="button" class="cf-appt-open" data-action="open-visit" data-id="${H(v.id)}" aria-label="Appointment details, ${H(doctor.name)}"><span class="cf-clinician-avatar" aria-hidden="true">${root.CareFlowAvatar(doctor.name,44)}</span><span class="cf-clinician-copy"><strong>${H(doctor.name)}</strong><small>${H(doctor.specialty)} · ${UI.modeText(v.mode)}</small></span></button>${UI.badge(v.status)}</div>
      <div class="cf-appt-facts"><p>${h.I('user',15)}<span>${H(person?.name||'No profile')}</span></p><p>${h.I('calendar',15)}<strong>${H(h.dateText(v).replace('/'+v.date.slice(0,4),''))} · ${H(v.slot||'Time awaiting confirmation')}</strong></p><p>${h.I(online?'video':'map-pin',15)}<span>${online?'Online · check your device before the visit':'At the clinic · see location in details'}</span></p></div>
      <p class="cf-appt-reason"><span>Reason for visit</span>${H(v.reason||'Not provided')}</p>
      ${pending?'<p class="cf-appt-note">This request is awaiting clinic confirmation. You don’t need to attend yet.</p>':''}
      <div class="rich-appt-actions">${secondary}${primary}</div></div>
    </article>`;
  }

  function appointments(s,u,h) {
    const waiting=v=>['pending','mode-review'].includes(v.status);
    const completed=s.visits.filter(v=>v.status==='completed').sort((a,b)=>b.date.localeCompare(a.date));
    const upcoming=active(s).filter(v=>!waiting(v));
    let groups=u.filter==='past'?[['Completed',completed,'past']]:u.filter==='cancelled'?[['Cancelled / No-show',s.visits.filter(v=>['cancelled','no-show'].includes(v.status)),'cancelled']]:[['Upcoming',upcoming,'upcoming'],['Awaiting confirmation',active(s).filter(waiting),'pending'],['Recently completed',completed.slice(0,2),'recent']];
    if(u.appointmentGroup) groups=groups.filter(([, ,key])=>key===u.appointmentGroup);
    const person=s.profiles.find(p=>p.id===u.appointmentPerson);
    const personFilter=u.appointmentPerson||'all';
    const hasVisits=groups.some(([,visits])=>visits.length);
    const emptyCopy=u.filter==='past'?'Information will appear here after a visit is completed.':u.filter==='cancelled'?'You have no cancelled appointments. See active appointments in the Upcoming tab.':'Choose a suitable time to book for yourself or a family member.';
    const modeFilter=u.appointmentMode||'all';
    const recentCard=v=>{const doctor=clinician(v);return `<button type="button" class="cf-appointment-history" ${UI.cardAttrs('row')} data-action="go" data-to="H7" data-id="${H(v.id)}"><strong>${H(v.date.split('-').reverse().join('/'))}</strong><small>${H(doctor.name)} · ${H(doctor.specialty)}</small>${UI.badge('completed')}</button>`;};
    return `<div class="cf-appointments"><div class="cf-hdr-list-toolbar"><h2>Your appointments</h2><button type="button" class="cf-hdr-filter" data-action="appointment-filters" aria-expanded="${!!u.appointmentFilters}" aria-controls="appointment-filters" aria-label="Filter appointments">${h.I('settings',18)}Filters<span data-appointment-filter-count hidden></span></button></div><label class="cf-appointment-search" for="appointment-search">Search appointments<input id="appointment-search" type="search" data-appointment-search value="${H(u.appointmentQuery||'')}" placeholder="Patient, doctor, reason, appointment code…" autocomplete="off"></label><div id="appointment-filters" class="cf-appointment-filter-panel"${u.appointmentFilters?'':' hidden'}>
      <details class="rich-person-picker" data-person="${H(personFilter)}"><summary>${root.CareFlowAvatar(person?.id||'account',32)}<span>${H(person?.name||'All profiles')}</span>${h.I('chevron-right',18)}</summary><div class="rich-person-options" role="group" aria-label="Filter by patient"><button type="button" data-appointment-person="all" aria-pressed="${personFilter==='all'}">All profiles</button>${s.profiles.map(p=>`<button type="button" data-appointment-person="${H(p.id)}" aria-pressed="${personFilter===p.id}">${H(p.name)}</button>`).join('')}</div></details>
      <div class="rich-filter-chips" role="group" aria-label="Filter by visit type">${[['all','All'],['onsite','In person'],['online',COPY.common.online]].map(([key,label])=>`<button type="button" data-cf-component="tab" data-cf-variant="segmented" data-visit-filter="${key}" aria-pressed="${key===modeFilter}">${label}</button>`).join('')}</div></div>
      ${u.appointmentGroup?`<button type="button" class="btn text cf-appt-show-all" data-action="filter" data-filter="upcoming">${h.I('chevron-left',16)} All upcoming</button>`:''}
      <div class="cf-appointment-filter-summary"><span data-appointment-count role="status" aria-live="polite"></span><button type="button" data-appointment-reset hidden>Clear filters</button></div><div class="rich-appointment-list">${groups.filter(([,visits])=>visits.length).map(([title,visits,key])=>`<section class="rich-appointment-group"><div class="cf-appointment-section-head"><h2 class="rich-heading">${H(title)}</h2>${u.appointmentGroup?'':`<button type="button" data-action="${key==='recent'?'filter':'appointment-group'}" ${key==='recent'?'data-filter="past"':`data-group="${key}"`} aria-label="View all ${H(title.toLocaleLowerCase('en-GB'))}">View all ${h.I('chevron-right',14)}</button>`}</div><div class="${key==='recent'?'cf-appointment-history-grid':'cf-appointment-cards'}">${visits.map((v,i)=>`<div class="rich-filterable" data-date="${H(v.date)}" data-mode="${v.mode}" data-person="${H(v.patientId)}" data-search="${H([v.id,h.M.profile(s,v.patientId)?.name,clinician(v).name,v.reason,h.dateText(v)].join(' '))}">${key==='recent'?recentCard(v):appointmentCard(s,v,h,key==='upcoming'&&i===0)}</div>`).join('')}</div></section>`).join('')||empty(u.filter==='upcoming'?'No upcoming appointments':u.filter==='past'?'No completed visits yet':'No cancelled appointments',emptyCopy)}</div>
      <div class="rich-filter-empty" role="status" hidden><strong>No matching appointments</strong><p>Try another profile or visit type to find your appointments.</p><button type="button" class="btn secondary" data-appointment-reset>Clear filters</button></div>
      ${hasVisits?'<button type="button" class="btn primary rich-new-booking" data-action="book-nav">Book a new appointment</button>':''}</div>`;
  }
  function patient(s,d,h) {
    const relation = p => root.CareFlowProduct ? root.CareFlowProduct.relationLabel(p.relation) : p.relation==='self'?'Self':p.relation==='mother'?'Mother':'Family member';
    const choices = s.profiles.map(p=>`<label class="choice patient-choice rich-patient-choice ${d?.patientId===p.id?'selected':''}" ${UI.cardAttrs('tonal')}>
      <input type="radio" name="${H(h.C.patient)}" value="${H(p.id)}"${d?.patientId===p.id?' checked':''}>
      <span class="choice-visual">${root.CareFlowAvatar(p.id,46)}</span>
      <span class="choice-copy"><strong>${H(p.name)}</strong><small>${relation(p)}</small><span class="rich-profile-meta">Date of birth · ${H(p.dob?.split('-').reverse().join('/')||'Not updated')}</span></span>
    </label>`).join('');
    const selected=h.M.profile(s,d?.patientId);
    return h.form('patient',`<section class="patient-group"><div class="group-heading"><h2>Patient</h2><span>${s.profiles.length} ${s.profiles.length===1?'profile':'profiles'}</span></div><fieldset class="choices"><legend class="sr-only">Who is the appointment for?</legend>${choices}</fieldset><p class="cf-patient-hint">The appointment will be saved to the selected profile.</p><button class="btn secondary add-relative-inline" ${UI.buttonAttrs('secondary')} type="button" data-action="profile-add-booking">${h.I('plus',18)}Add a family member</button><details class="cf-profile-privacy"><summary>${h.I('shield',18)}Access to results ${h.I('chevron-down',16)}</summary><p>Booking for someone does not give you access to their results. The patient must grant access separately.</p></details></section>`,selected?'Continue with '+firstName(selected.name):'Continue');
  }
  function visitExtras(s,v,h) {
    const steps=v.mode==='online'?[['pending','Booked'],['confirmed','Clinic confirmed'],['online-wait','Waiting for the doctor'],[v.status==='unreachable'?'unreachable':'calling',v.status==='unreachable'?'Waiting to reconnect':'Doctor calling'],['in-consult','In consultation'],['completed','Completed']]:[['pending','Booked'],['confirmed','Clinic confirmed'],['arrived','Arrived'],['received','Checked in'],['ready','Ready'],['in-consult','In consultation'],['completed','Completed']];
    let idx=steps.findIndex(z=>z[0]===v.status);
    if(['reminder','pre-lab'].includes(v.status))idx=1;
    if(idx<0)idx=0;
    const stopped=['cancelled','no-show'].includes(v.status);
    const onlineReady=['confirmed','reminder','online-wait'].includes(v.status);
    const preparationAction=v.mode==='online'
      ? onlineReady?visitAction('Test your device for the online visit',v,'G1','secondary'):'<p class="cf-card-subtitle">Follow the next step in your appointment details before checking your connection.</p>'
      : visitAction('View pre-visit guide',v,'E1','secondary');
    const preparationSection=stopped||v.status==='completed'?'':section('What to prepare',`<div class="cf-preparation-list"><p>${h.I('document',20)}<span><strong>Documents and records</strong><small>ID, prescriptions and previous results, if any.</small></span></p><p>${h.I(v.mode==='online'?'video':'map-pin',20)}<span><strong>${v.mode==='online'?'Device and connection':'Time and location'}</strong><small>${v.mode==='online'?'Open your appointment details and check your camera and microphone before the appointment.':'Check the directions. Contact the clinic if you don’t have the address yet.'}</small></span></p><p>${h.I('info',20)}<span><strong>Special pre-visit instructions</strong><small>Ask the clinic; don’t change your diet or current medication on your own.</small></span></p></div>${preparationAction}`,'rich-prepare');
    return section('Visit progress',`<ol class="rich-progress-steps">${steps.map(([id,label],i)=>`<li class="${stopped?'later':i<idx?'done':i===idx?'current':'later'}"${!stopped&&i===idx?' aria-current="step"':''}><span>${!stopped&&i<idx?'✓':i+1}</span><strong>${H(label)}</strong></li>`).join('')}</ol><p class="rich-subnote">${['cancelled','no-show'].includes(v.status)?'This visit has stopped. The remaining steps will not take place.':'Steps may vary depending on your situation and the clinic’s instructions.'}</p>`,'rich-detailed-progress')+
      preparationSection+
      section('Information provided',`<div class="rich-detail-block"><strong>Symptoms</strong><p>${H(v.reason||'None yet')}</p><strong>Medical notes</strong><p>${H(v.medicalHistory||'Not provided')}</p></div>`,'rich-declared')+
      (v.labs.length?section('Related tests',`<div class="rich-lab-summary">${v.labs.map(l=>`<div>${pill(h.VI.labs[l.status],l.status==='reviewed'?'success':'warning')}<strong>${H(l.name)}</strong></div>`).join('')}${action('View diagnostics','F1','text')}</div>`):section('Related tests',`<div class="rich-detail-block"><p>No diagnostic tests have been ordered for this visit.</p>${action('View details','F1','text')}</div>`))+
      `<div class="rich-policy">${h.I('info',18)}Rescheduling or cancelling depends on the clinic’s confirmation status. ${action('View support','K5','text')}</div>`;
  }
  const initials = name => String(name||'').trim().split(/\s+/).slice(-2).map(x=>x[0]).join('').toLocaleUpperCase('en-GB');
  const relation = p => root.CareFlowProduct ? root.CareFlowProduct.relationLabel(p.relation) : p.relation==='self'?'Self':p.relation==='mother'?'Mother':p.relation==='child'?'Child':'Family member';
  function referenceSection(title,html,h,actionName='',attributes='',extra='',linkLabel='View all') {
    return `<section class="cf-reference-section ${extra}" ${UI.cardAttrs('surface')}><div class="cf-reference-section-head"><h2>${H(title)}</h2>${actionName?`<button type="button" data-action="${actionName}" ${attributes} aria-label="${H(linkLabel==='View all'?linkLabel+' '+title.toLocaleLowerCase('en-GB'):linkLabel)}">${H(linkLabel)} ${h.I('chevron-right',15)}</button>`:''}</div>${html}</section>`;
  }
  function profileHeader(s,h) {
    const p=h.M.accountProfile(s),relatives=s.profiles.filter(x=>x.relation!=='self');
    return `<div class="cf-profile-masthead-account"><div class="cf-hdr-id-card"><div class="cf-hdr-id-top"><span>PERSONAL PROFILE</span>${h.I('heart-pulse',20)}</div><div class="cf-hdr-id-person"><div><strong>${H(p?.name||'No account yet')}</strong><span>Self</span></div><span class="cf-hdr-id-avatar" aria-hidden="true">${root.CareFlowAvatar(p?.id||'account',52)}</span></div><div class="cf-hdr-id-bottom"><div><small>Date of birth</small><strong>${H(p?.dob?p.dob.split('-').reverse().join('/'):'Not updated')}</strong></div><span class="cf-hdr-id-monogram" aria-hidden="true">CF<span>+</span></span></div></div><button type="button" class="cf-hdr-family-dock" data-action="${relatives.length?'profile-relatives':'profile-add-relative'}"><span class="cf-hdr-family-avatars" aria-hidden="true">${[p,...relatives.slice(0,1)].filter(Boolean).map(person=>root.CareFlowAvatar(person.id,28)).join('')}</span><span><strong>${relatives.length?`${relatives.length} ${relatives.length===1?'family member':'family members'}`:'Add a family member'}</strong><small>Manage together, book easily</small></span>${h.I('chevron-right',18)}</button></div>`;
  }
  function supportHeader(s,h) {
    const careVisit=s.visits.find(v=>v.status==='completed'&&h.M.canViewResults(s,v));
    return `<div class="screen-intro"><h1 id="screen-title" tabindex="-1">Support</h1></div><div class="cf-hdr-support-hero"><div class="cf-hdr-support-copy"><h2>Connect with<br>the clinic.</h2><p>Your appointments,<br>profile and results.</p></div>${supportPortrait()}<span class="cf-hdr-support-bubble" aria-hidden="true">${h.I('message-circle',24)}</span></div><div class="cf-hdr-contact-dock"><button type="button" class="cf-support-message" ${UI.buttonAttrs('secondary')} aria-label="Message the clinic" data-action="${careVisit?'go':'support-compose'}"${careVisit?` data-to="I5" data-id="${H(careVisit.id)}"`:''}>Message ${h.I('arrow-right',18)}</button><button type="button" class="cf-support-callback" aria-label="Request a callback" data-action="clinic-call">${h.I('phone',20)}<span>Call me back</span>${s.requests.some(r=>r.type==='callback'&&r.status==='waiting')?'<small>Awaiting response</small>':''}</button></div>`;
  }
  function profile(s,u,h) {
    const p=h.M.accountProfile(s),relatives=s.profiles.filter(x=>x.relation!=='self');
    const personal=[['Full name',p?.name],['Phone number',p?.phone?p.phone.slice(0,3)+' ••• '+p.phone.slice(-3):'Not updated']];
    const details=`<div class="rich-profile-details cf-reference-card"><dl class="cf-personal-facts">${personal.map(([label,value])=>`<div><dt>${H(label)}</dt><dd>${H(value||'Not updated')}</dd></div>`).join('')}</dl><div class="cf-profile-allergy">${h.I('shield',20)}<div><small>Allergies</small><strong>${H(p?.allergies||'Not declared')}</strong></div><button type="button" class="btn secondary" ${UI.buttonAttrs('secondary')} data-action="go" data-to="K6">Edit details</button></div></div>`;
    const add=`<details class="rich-add-person add-relative cf-relative-add" id="profile-add-relative"><summary>${h.I('plus',18)} Add a family member</summary>${h.form('relative',h.field('name','Full name')+h.field('dob','Date of birth','','date',{max:h.M.localDate()}),'Save profile')}</details>`;
    const relativeCards=`${relatives.length?'':'<div class="cf-relative-empty"><strong>No family member profiles yet</strong><p>Add a profile to book on someone’s behalf when needed.</p></div>'}<div class="rich-settings-links cf-relative-grid">${relatives.map(person=>`<button type="button" class="cf-relative-card" data-action="profile-relative" data-id="${H(person.id)}"><span class="cf-reference-avatar" aria-hidden="true">${root.CareFlowAvatar(person.id,44)}</span><span><strong>${H(person.name)}</strong><small>${relation(person)}</small></span>${h.I('chevron-right',16)}</button>`).join('')}${add}</div>`;
    const settings=`<div class="rich-settings-links cf-reference-card cf-settings-list">${[['bell','Notifications',s.settings.reminders?'On':'Off','reminders'],['globe','Language','English','language'],['shield','Security and privacy','','privatePreview']].map(([icon,label,value,focus])=>`<button type="button" data-action="${focus==='language'?'settings-language':'settings-open'}" data-focus="${focus}">${h.I(icon,20)}<strong>${label}</strong>${value?`<small>${H(value)}</small>`:''}${h.I('chevron-right',16)}</button>`).join('')}</div>`;
    const ins=p&&s.insurance?.[p.id];
    const records=`<div class="rich-settings-links cf-reference-card cf-records-list"><button type="button" data-action="go" data-to="K11">${h.I('shield',20)}<strong>Insurance</strong><small>${ins?(ins.validTo>h.M.localDate()?'Valid':'Expired'):'Not added'}</small>${h.I('chevron-right',16)}</button><button type="button" data-action="go" data-to="M1">${h.I('pill',20)}<strong>Prescriptions</strong><small>${(root.CareFlowProduct?.rxFor(s)||[]).length||'None yet'}</small>${h.I('chevron-right',16)}</button><button type="button" data-action="go" data-to="K3">${h.I('clock',20)}<strong>Visit history</strong>${h.I('chevron-right',16)}</button></div>`;
    return `<div class="cf-profile-content">${referenceSection('Personal information',details,h,'profile-details','','','View profile')}${referenceSection('Family members',relativeCards,h,relatives.length?'profile-relatives':'','','', 'View list')}${referenceSection('Insurance and visit records',records,h)}${referenceSection('Settings',settings,h)}<button type="button" class="btn danger rich-danger-logout" ${UI.buttonAttrs('danger')} data-action="confirm-logout">${h.I('log-out',18)}Sign out</button></div>`;
  }
  function aftercare(v,h) {
    if(v.status!=='completed') return '';
    return `<section class="rich-section rich-aftercare-sample" ${UI.cardAttrs('section')} aria-label="Aftercare">${UI.illustration('result')}<h2 class="rich-heading">What to do after your visit</h2>
      <p class="rich-subnote">Save your questions and check the documents for this visit.</p>
      <ol class="rich-sample-instructions"><li>Review the visit summary, prescription and results the clinic has shared above.</li><li>If documents are missing or anything is unclear, send the clinic a question.</li><li>Note any changes in your health to discuss next time you get in touch.</li></ol>
      ${action('Log a health update','I3','text')}
      ${action('Ask the clinic','I1','secondary')}</section>`;
  }
  const supportMessages = s => s.messages.filter(m=>root.CareFlowModel.canViewResults(s,s.visits.find(v=>v.id===m.visitId)));
  function support(s,u,h) {
    const waiting=s.requests.find(x=>x.status==='waiting');
    const messages=supportMessages(s);
    const careVisit=s.visits.find(v=>v.status==='completed'&&h.M.canViewResults(s,v));
    const topics=['Reschedule or cancel','Profile information','Payment','Results','Prescription','Online visit','Other'];
    const selected=u.forms.support?.supportTopic||topics[0];
    const contactMode=u.forms.support?.contactMode||'call';
    const contactLabels={call:'Phone call',message:'Message',zalo:'Zalo'};
    const helpContent=`<div class="rich-support-form"><div class="field"><label for="supportTopic">Topic</label><select id="supportTopic" name="supportTopic">${topics.map(topic=>`<option${topic===selected?' selected':''}>${H(topic)}</option>`).join('')}</select></div>
      ${h.textarea('support','Details','',{placeholder:'What can the clinic help you with?',maxlength:'500'})}
      <details class="cf-contact-preference"><summary><span>Get a reply by</span><strong data-contact-mode-label>${contactLabels[contactMode]}</strong>${h.I('chevron-down',16)}</summary><fieldset class="rich-contact-methods"><legend>How should the clinic contact you?</legend>${Object.entries(contactLabels).map(([value,label])=>`<label><input type="radio" name="contactMode" value="${value}"${value===contactMode?' checked':''}> ${label}</label>`).join('')}</fieldset></details></div>`;
    const quick=`<div class="cf-support-topics"><p>Ask about</p><div>${[['Visits','Reschedule or cancel','calendar'],['Profile','Profile information','user'],['Payment','Payment','document'],['Results','Results','document-check']].map(([label,topic,icon])=>`<button type="button" ${UI.buttonAttrs('secondary')} data-action="support-topic" data-topic="${H(topic)}">${h.I(icon,20)}${label}</button>`).join('')}${careVisit?`<button type="button" ${UI.buttonAttrs('secondary')} data-action="go" data-to="I1" data-id="${H(careVisit.id)}" aria-label="Ask the clinic">Ask about a visit ${h.I('arrow-right',16)}</button>`:''}</div></div><button type="button" class="cf-hdr-request-row cf-support-requests" data-action="support-requests">${h.I('document',22)}<span><strong>Sent requests</strong><small>${s.requests.length?`${s.requests.length} ${s.requests.length===1?'request':'requests'} · ${s.requests.filter(r=>r.status==='waiting').length} waiting`:'No pending requests'}</small></span>${h.I('chevron-right',18)}</button>`;
    const faqs=[['How to join an online visit','Open your online appointment, check your device and follow the instructions in your appointment details.'],['What should I bring to my visit?','Bring ID, prescriptions and previous results if you have them. See more guidance in your appointment details.'],['How do I reschedule or cancel?','Open Appointments → Appointment details to reschedule or cancel, depending on the current status. A new time must be confirmed by the clinic.'],['When will my results be ready?','It depends on the test. Check the Results section or ask the clinic.'],['Need help with payment?','Choose the Payment topic and send a request so the clinic can check your visit.']];
    const faqList=`<div class="rich-faqs cf-reference-card">${faqs.slice(0,u.supportFaqs?faqs.length:3).map(([question,answer])=>`<details class="faq"><summary>${H(question)}${h.I('chevron-right',16)}</summary><p>${H(answer)}</p></details>`).join('')}</div>`;
    const previews=messages.length?`<div class="rich-settings-links">${messages.slice(u.supportMessagesAll?-messages.length:-1).reverse().map(message=>`<div class="rich-message-preview cf-reference-card"><span class="cf-reference-avatar" aria-hidden="true">${message.from==='staff'?'CL':H(initials(h.M.profile(s,message.patientId)?.name||h.M.accountProfile(s)?.name))}</span><div><strong>${message.from==='staff'?'Clinic':'You'}</strong><p>${H(message.text)}</p></div></div>`).join('')}</div>`:`<div class="cf-reference-card cf-message-empty"><p>No messages yet. You can send a request above.</p></div>`;
    return `<div class="cf-support-content">${UI.emergencyCard({compact:true})}${referenceSection('Quick contact',quick,h,'','','cf-support-contact-section')}${referenceSection('Frequently asked questions',faqList,h,'support-faqs','','',u.supportFaqs?'Show less':'Show more')}${referenceSection('Send a request',`<div class="cf-reference-card cf-support-request-card">${h.form('support',helpContent,'Send request','secondary')}</div>${waiting?`<aside class="rich-support-request" role="status"><strong>Waiting for the clinic to respond</strong><p>${H(waiting.type==='callback'?'Callback request':waiting.topic||'Support ticket')}</p></aside>`:''}`,h)}${messages.length?referenceSection('Recent messages',previews,h,'support-messages'):'<p class="cf-support-message-empty">No messages yet. Replies will appear when the clinic responds.</p>'}</div>`;
  }
  const preparationItems = v => [
    ['details','Checked the patient, date and time are correct'],
    ['documents','Prepared ID and any medical documents I have'],
    ['access',v.mode==='online'?'Prepared my connection, camera and a private space':'Checked the location and how to get to the clinic'],
  ];
  function visitTools(s,v,u,h,kind='prepare') {
    if(!v || ['cancelled','no-show'].includes(v.status)) return '';
    const person=h.M.profile(s,v.patientId);
    const items=preparationItems(v),checked=u.preparation?.[v.id]||{};
    const title=kind==='prepare'?'Ready for your visit':'Questions for next time';
    const noteId='visit-note-'+v.id;
    return `<div class="cf-visit-tools" data-visit-tools="${H(v.id)}">${UI.card(
      `<div class="cf-card-header"><h2>${title}</h2>${kind==='prepare'?`<span class="cf-preparation-progress" data-preparation-count role="status" aria-live="polite">${items.filter(([key])=>checked[key]).length}/${items.length} prepared</span>`:''}</div>
      <p class="cf-card-subtitle">${H(person?.name)} · ${H(dateTextLite(v.date))} · ${H(v.id)}</p>
      ${kind==='prepare'?`<fieldset class="cf-preparation-checks"><legend class="sr-only">Preparation checklist for this visit</legend>${items.map(([key,text])=>`<label><input type="checkbox" data-preparation="${key}" data-visit="${H(v.id)}"${checked[key]?' checked':''}><span>${H(text)}</span></label>`).join('')}</fieldset>`:''}
      <div class="cf-private-note"><label for="${H(noteId)}">Your private notes</label><textarea id="${H(noteId)}" data-visit-note="${H(v.id)}" maxlength="1000" rows="3" placeholder="What you want to ask or remember…" aria-describedby="${H(noteId)}-hint">${H(u.visitNotes?.[v.id]||'')}</textarea><small id="${H(noteId)}-hint">Saved only in this browser session; not sent to the clinic.</small><span class="cf-local-feedback" data-note-feedback role="status" aria-live="polite"></span></div>
      <div class="cf-card-utility-actions">${kind==='prepare'?`<button type="button" class="btn secondary" ${UI.buttonAttrs('secondary')} data-action="save-calendar" data-id="${H(v.id)}">${h.I('calendar-plus',18)}Save to my calendar</button>`:''}${visitAction(kind==='prepare'?'Ask the clinic':'Ask a post-visit question',v,kind==='prepare'?'K5':'I1','text')}</div><span class="cf-local-feedback" data-calendar-feedback role="status" aria-live="polite"></span>`, 'cf-preparation-card', 'tonal')}</div>`;
  }
  function journeyCompanion(id,s,v,u,h) {
    if(['C1','C7'].includes(id))return '';
    if(['D2','E1','G1'].includes(id))return v?.status==='completed'?(h.M.canViewResults(s,v)?visitTools(s,v,u,h,'notes'):''):visitTools(s,v,u,h);
    if(['H6','I3','I5'].includes(id)&&h.M.canViewResults(s,v))return visitTools(s,v,u,h,'notes');
    const bookingGuides={
      C1:{title:'Information for the right profile',steps:['The appointment is saved for the patient you choose at this step.','You can add a family member before continuing.','Access to results depends on each profile’s permissions.']},
      C2:{title:'Help the clinic prepare',steps:['Say when it started and why you want to be seen.','Note any recent changes you have noticed.','Add current medications or relevant medical information, if any.']},
      C6:{title:'Prepare for your visit type',steps:['In person: check the location when you receive your appointment details.','Online: you need a device, a connection and a private space.','The clinic may review the visit type based on the information you send.']},
      C7:{title:'After choosing a time',steps:['Double-check your preferred date and time slot.','Review all the details at the final confirmation step before sending.','Watch your appointment details for confirmation from the clinic.']},
    };
    const guide=bookingGuides[id];
    if(guide&&s.draft)return UI.card(`<h2 class="cf-icon-heading">${h.I(id==='C6'?'video':id==='C7'?'calendar':'shield',20)}<span>${guide.title}</span></h2><ol>${guide.steps.map(step=>`<li>${H(step)}</li>`).join('')}</ol>`,'cf-journey-summary','tonal');
    if(['F3','F4'].includes(id))return UI.card(`<h2>${id==='F3'?'Check before choosing a time':'Prepare your results file'}</h2><ol>${(id==='F3'?['Check the test name and patient are correct.','The time you choose is a preference for the coordinator to arrange.','Ask the clinic if you have not received specific preparation instructions.']:['Choose a PDF, JPG or PNG file, up to 10 MB.','Check the image is clear, all pages are included and it is for the right patient.','The clinic must check the file before updating results.']).map(text=>`<li>${text}</li>`).join('')}</ol>${visitAction('Review test orders',v,'F2','text')}`,'cf-journey-summary','tonal');
    if(['H2','H3','H4','H5'].includes(id))return UI.card(`<h2>Charge details</h2>${UI.facts([['Visit',v.id],['Status',h.VI.payments[v.payment.status]||'No information yet'],['Amount',h.C.unknownFee]],H)}<p class="cf-card-subtitle">Need to verify a charge? The clinic is responsible for reconciliation and sharing details. Choices in this prototype do not create real transactions.</p>${visitAction('Ask about payment',v,'K5','secondary')}`,'cf-journey-summary','tonal');
    if(id==='K4')return UI.card(`<h2>Data on this device</h2><p>Notes, checklists and choices are kept in the current browser session. Signing out ends the session and clears your saved private items.</p>${action('View current profile','K2','secondary')}`,'cf-journey-summary','tonal');
    return '';
  }
  root.CareFlowRich = {cardArt,photoCard,detailShortcuts,collection,labImage,appointmentCard,homeHeader,home,appointments,patient,visitExtras,profile,support,aftercare,appointmentTabs,appointmentCalendar,clinician,profileHeader,supportHeader,supportMessages,visitTools,journeyCompanion,preparationItems,DEMO};
})(window);
