/* CareFlow Doctor-Only Portfolio. Synthetic clinical UI / no medical decision support. */
(function installDoctorShowcase(root){
  'use strict';
  const UI=root.CareFlowUI, COPY=root.CareFlowCopy, A=COPY.ui;
  const allowed=['/doctor','/doctor/schedule','/doctor/queue','/doctor/followups','/patients','/results','/clinical/orders','/clinical/prescription','/clinical/review'];
  const texts={'/doctor':'Overview','/doctor/schedule':'Schedule','/doctor/queue':'Visit list','/doctor/followups':'Follow-up tasks','/patients':'Patients','/results':'Results','/clinical/orders':'Orders','/clinical/prescription':'Prescription','/clinical/review':A.reviewEncounter};
  const icons={pulse:'activity',calendar:'calendar',users:'users',clipboard:'clipboard',beaker:'beaker',check:'check'};
  const clinicalDoctor='Nguyễn Văn An';
  function permitted(path){
    if(allowed.includes(path))return true;
    if(path.startsWith('/patients/')||path.startsWith('/encounters/')||path.startsWith('/visits/')||path.startsWith('/doctor/review/')||path.startsWith('/doctor/online/'))return true;
    return false;
  }
  const esc=s=>String(s??'');
  const label=(x,s)=>x.e(s);
  function yours(x){return x.data.appointments.filter(a=>a.doctor.includes(clinicalDoctor)&&a.status!=='cancelled').sort((a,b)=>a.time.localeCompare(b.time))}
  function results(x){return x.data.results.filter(r=>r.doctor.includes(clinicalDoctor))}
  function intro(k,t,d,actions=''){return `<div class="doctor-heading"><div class="doctor-kicker">${k}</div><div class="doctor-heading-grid"><div><h1>${t}</h1><p>${d}</p></div><div class="doctor-heading-actions">${actions}</div></div></div>`}
  function iconRound(x,glyph){return `<span class="doctor-icon">${x.icon(glyph,20)}</span>`}
  function stepLabel(x,a){return x.statePill(a)}
  function actionFor(a,x){
    if(a.status==='in-consult')return x.btn(`${x.e(A.continueConsult)} ${x.icon('arrow',16)}`,'go','btn-primary',`data-to="/encounters/${x.e(a.id)}"`);
    if(a.status==='ready'&&a.mode.toLowerCase().includes('online'))return x.btn('Open online session','go','btn-primary',`data-to="/doctor/online/${x.e(a.id)}"`);
    if(a.status==='ready')return x.btn(`${x.e(A.startConsult)} ${x.icon('arrow',16)}`,'start-consult','btn-primary',`data-id="${x.e(a.id)}"`);
    if(a.status==='review')return x.btn(A.reviewRequest,'go','btn-soft',`data-to="/doctor/review/${x.e(a.id)}"`);
    if(a.status==='unreachable'&&a.mode.toLowerCase().includes('online'))return x.btn('View handover','go','btn-soft',`data-to="/doctor/online/${x.e(a.id)}"`);
    if(['confirmed','arrived'].includes(a.status))return x.btn(A.viewVisit,'go','btn-soft',`data-to="/visits/${x.e(a.id)}"`);
    if(a.status==='completed')return x.btn('Review consultation','go','btn-soft',`data-to="/encounters/${x.e(a.id)}"`);
    return x.btn(A.viewPatient,'open-patient','btn-soft',`data-id="${x.e(a.personId)}"`);
  }
  function row(x,a,compact=false){
    const p=x.person(a.personId);
    return `<div data-cf-component="appointment" data-cf-variant="row" class="doctor-appointment ${compact?'is-compact':''}">
       <div class="doctor-appointment-time"><strong>${x.e(a.time)}</strong><small>${x.e(a.date)}</small></div>
       ${x.avatar(p)}<div class="doctor-appointment-person"><strong>${x.e(p.name)}</strong><span>${x.e(p.code)} · ${x.e(UI.modeText(a.mode))} · Assigned to: ${x.e(x.ownerLabel(a.owner))}</span></div>
       <div class="doctor-appointment-status">${stepLabel(x,a)}</div>
       <div class="doctor-appointment-action">${actionFor(a,x)}</div></div>`
  }
  // Dashboard filters are view state. Clinical data and role guards stay in the existing model.
  const dashboardChoices={
    decision:['mine','handoff','all'], result:['ready','waiting','reviewed'],
    online:['all','prepare','support'], taskOwner:['mine','delegated','all'],
    taskStatus:['open','done','all'], agendaStatus:['all','in-consult','ready','review','pending','unreachable','completed'],
    agendaMode:['all','onsite','online','undecided'], agendaSort:['asc','desc']
  };
  function dashboardState(x){return x.ui.docDashboard??={}}
  function filterButtons(x,key,items,legend){
    const value=dashboardState(x)[key]||dashboardChoices[key][0];
    return `<div class="doctor-card-filters" role="group" aria-label="${x.e(legend)}">${items.map(([id,title,count])=>`<button type="button" data-cf-component="tab" data-cf-variant="filter" data-action="doc-dashboard-filter" data-group="${key}" data-value="${id}" aria-pressed="${value===id}">${x.e(title)}${count==null?'':` <span class="doctor-filter-count">${count}</span>`}</button>`).join('')}</div>`;
  }
  function selectFilter(x,key,title,items){
    const value=dashboardState(x)[key]||dashboardChoices[key][0];
    return `<label class="doctor-control"><span>${x.e(title)}</span><select data-dashboard-field="${key}">${items.map(([id,text])=>`<option value="${id}" ${value===id?'selected':''}>${x.e(text)}</option>`).join('')}</select></label>`;
  }
  function cardHeading(x,number,title,detail,count,id){return `<header class="doctor-card-heading"><div><span class="doctor-overline">${number}</span><h2 id="${id}">${title}</h2>${detail?`<p>${x.e(detail)}</p>`:''}</div>${count==null?'':`<span class="doctor-card-count" aria-label="${count} item${count===1?'':'s'}">${count}</span>`}</header>`}
  function emptyCard(x,title,detail,reset=false,actions=''){return `<div class="doctor-card-empty" data-cf-state="empty"><strong>${x.e(title)}</strong><p>${x.e(detail)}</p>${reset?x.btn('Clear filters','doc-dashboard-reset','btn-soft'):''}${actions}</div>`}
  function encounterCard(x,visits){
    const active=visits.filter(a=>a.status==='in-consult');
    const doing=active.find(a=>a.id===dashboardState(x).currentEncounter)||active[0];
    if(!doing)return `<section class="doctor-surface doctor-now" ${UI.cardAttrs('surface')} data-priority="current" aria-labelledby="current-encounter-title">${cardHeading(x,'01 / IN CONSULTATION','Consultation in progress','',null,'current-encounter-title')}${emptyCard(x,'No consultation in progress','Choose a ready visit from the visit list to start.',false,x.btn(A.viewQueue,'go','btn-secondary','data-to="/doctor/queue"'))}</section>`;
    const p=x.person(doing.personId),draft=x.data.drafts?.[doing.id]||{},fields=[['symptom','Symptoms'],['assessment','Assessment'],['plan','Management plan']];
    const complete=fields.filter(([key])=>String(draft[key]||'').trim()).length;
    const unread=results(x).filter(r=>r.personId===p.id&&r.status==='ready');
    return `<section class="doctor-surface doctor-now" ${UI.cardAttrs('surface')} data-priority="current" aria-labelledby="current-encounter-title">
      ${cardHeading(x,'01 / IN CONSULTATION','Consultation in progress','',null,'current-encounter-title')}
      ${active.length>1?`<label class="doctor-control doctor-encounter-picker"><span>Choose a consultation to continue · ${active.length} not completed</span><select data-dashboard-field="currentEncounter">${active.map(a=>`<option value="${x.e(a.id)}" ${a.id===doing.id?'selected':''}>${x.e(x.person(a.personId).name)} · ${x.e(a.code)}</option>`).join('')}</select></label>`:''}
      <div class="doctor-encounter-layout"><div class="doctor-encounter-context">
        <div class="doctor-now-person">${x.avatar(p,'large')}<div><h3>${x.e(p.name)}</h3><p>${x.e(p.code)} · ${p.age} years · ${x.e(p.gender)}</p></div>${stepLabel(x,doing)}</div>
        ${UI.facts([['Visit',doing.code],['Appointment time',doing.time+' · '+doing.date],['Visit type',UI.modeText(doing.mode)],['Assigned to',x.ownerLabel(doing.owner)]],x.e,'doctor-current-facts')}
        <dl class="doctor-context-note"><div><dt>Reason for visit</dt><dd>${x.e(doing.reason||'Not recorded')}</dd></div><div><dt>Recorded information</dt><dd>${x.e(doing.history||'No additional information')}</dd></div></dl>
      </div><div class="doctor-encounter-record"><div class="doctor-record-heading"><h3>Consultation notes</h3><span>${complete}/3 sections filled</span></div>
        <ul class="doctor-record-checklist">${fields.map(([key,title])=>`<li>${x.icon(String(draft[key]||'').trim()?'check':'file',16)}<span>${title}</span><span>${String(draft[key]||'').trim()?'Filled':'Empty'}</span></li>`).join('')}</ul>
        <p class="doctor-record-note">${unread.length?`${unread.length} related result${unread.length===1?'':'s'} not reviewed.`:'No unreviewed related results.'} ${complete===3?'Review the content before completing.':'Keep completing the notes during the consultation.'}</p>
        <div class="doctor-card-actions">${actionFor(doing,x)}${x.btn(A.viewPatient,'open-patient','btn-secondary',`data-id="${x.e(p.id)}"`)}</div>
      </div></div></section>`;
  }
  function resultCard(x){
    const all=results(x),state=dashboardState(x),filter=state.result||'ready',list=all.filter(r=>r.status===filter);
    return `<section class="doctor-surface doctor-labs-today" ${UI.cardAttrs('surface')} data-priority="results" aria-labelledby="pending-results-title">${cardHeading(x,'03 / RESULTS','Diagnostic results','Open a result to view it and mark it as reviewed.',all.filter(r=>r.status==='ready').length,'pending-results-title')}
      ${filterButtons(x,'result',[['ready','Not reviewed',all.filter(r=>r.status==='ready').length],['waiting','Awaiting test',all.filter(r=>r.status==='waiting').length],['reviewed','Reviewed',all.filter(r=>r.status==='reviewed').length]],'Filter results on overview')}
      <div class="doctor-card-list">${list.map(r=>`<article class="doctor-result-item" ${UI.cardAttrs('row')} data-result-id="${x.e(r.id)}"><div class="doctor-item-eyebrow"><span>${x.e(r.type)} · ${x.e(r.code)}</span>${x.resultPill(r)}</div><h3>${x.e(r.title)}</h3><p>${x.e(x.person(r.personId).name)} · ${x.e(x.person(r.personId).code)}</p><div class="doctor-item-bottom"><span>Recorded ${x.e(r.date)}</span>${x.btn('View result','show-result','btn-soft',`data-id="${x.e(r.id)}" aria-label="View result ${x.e(r.title)} for ${x.e(x.person(r.personId).name)}"`)}</div></article>`).join('')||emptyCard(x,filter==='ready'?'No unreviewed results':filter==='waiting'?'No tests awaiting':'No reviewed results yet','Switch groups to see other items.')}</div>
    </section>`;
  }
  const normalizeSearch=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLocaleLowerCase('en-GB').trim();
  function agendaCard(x,visits){
    const state=dashboardState(x),query=normalizeSearch(state.agendaSearch),status=state.agendaStatus||'all',mode=state.agendaMode||'all',desc=state.agendaSort==='desc';
    const modeKey=a=>a.mode.toLowerCase().includes('online')?'online':a.mode==='Visit type not confirmed'?'undecided':'onsite';
    const list=visits.filter(a=>{const p=x.person(a.personId);return (!query||normalizeSearch([p.name,p.code,a.code].join(' ')).includes(query))&&(status==='all'||a.status===status)&&(mode==='all'||modeKey(a)===mode)}).sort((a,b)=>(desc?-1:1)*a.time.localeCompare(b.time));
    const filtered=query||status!=='all'||mode!=='all';
    return `<section class="doctor-surface doctor-today" ${UI.cardAttrs('surface')} data-priority="schedule" aria-labelledby="daily-agenda-title">${cardHeading(x,'04 / TODAY’S SCHEDULE','Today’s schedule',`Date ${visits[0]?.date||'no appointments'} · Only assigned visits are shown`,visits.length,'daily-agenda-title')}
      <div class="doctor-agenda-toolbar"><label class="doctor-control doctor-agenda-search"><span>Search visits</span><span class="doctor-search-field">${x.icon('search',18)}<input id="doctor-agenda-search" type="text" inputmode="search" data-dashboard-search placeholder="Patient name, record or visit code" value="${x.e(state.agendaSearch||'')}" autocomplete="off"></span></label>
      ${selectFilter(x,'agendaStatus','Status',[['all','All statuses'],...['in-consult','ready','review','pending','unreachable','completed'].map(id=>[id,UI.status(id).label])])}
      ${selectFilter(x,'agendaMode','Visit type',[['all','All visit types'],['onsite','In person'],['online','Online visit'],['undecided','Visit type not confirmed']])}${selectFilter(x,'agendaSort','Sort by time',[['asc','Earliest first'],['desc','Latest first']])}</div>
      <div class="doctor-agenda-feedback"><p id="doctor-agenda-count" role="status">Showing ${list.length}/${visits.length} visits</p>${filtered?x.btn('Clear filters','doc-dashboard-reset','btn-soft'):''}</div>
      ${list.length?`<table class="doctor-agenda-table"><caption class="sr-only">Assigned appointments on ${x.e(visits[0]?.date||'')}</caption><thead><tr><th scope="col" aria-sort="${desc?'descending':'ascending'}">Appointment time</th><th scope="col">Patient / Visit</th><th scope="col">Visit type</th><th scope="col">Status / Assigned to</th><th scope="col">Actions</th></tr></thead><tbody>${list.map(a=>{const p=x.person(a.personId);return `<tr class="doctor-agenda-row" data-visit-id="${x.e(a.id)}" data-cf-component="appointment" data-cf-variant="agenda"><td data-label="Appointment time"><strong>${x.e(a.time)}</strong></td><td class="doctor-agenda-person" data-label="Patient / Visit"><strong>${x.e(p.name)}</strong><span>${x.e(p.code)} · ${x.e(a.code)}</span><span>${x.e(a.reason||'No reason for visit recorded')}</span></td><td data-label="Visit type">${x.e(UI.modeText(a.mode))}</td><td data-label="Status / Assigned to">${stepLabel(x,a)}<span>Assigned to: ${x.e(x.ownerLabel(a.owner))}</span></td><td class="doctor-agenda-actions" data-label="Actions">${actionFor(a,x)}</td></tr>`}).join('')}</tbody></table>`:emptyCard(x,visits.length?'No matching visits found':'No appointments yet',visits.length?'Try another name or record code, or clear the filters.':'Assigned visits will appear here.',Boolean(filtered))}
    </section>`;
  }
  function dashboard(x){
    const visits=yours(x),helpers={filterButtons,selectFilter,cardHeading,emptyCard,state:dashboardState(x)};
    return `<section class="screen doctor-screen doctor-home">
      ${intro('DOCTOR WORKSPACE','Consultation overview','Dr. Nguyễn Văn An · Scheduled date: '+(visits[0]?.date||'No appointments'),x.btn(A.viewSchedule,'go','btn-secondary','data-to="/doctor/schedule"'))}
      <div class="doctor-priority-grid">${encounterCard(x,visits)}${root.CareFlowJourneys.summary(x,'decision',helpers)}${resultCard(x)}${agendaCard(x,visits)}</div>
      <div class="doctor-secondary-grid">${root.CareFlowJourneys.summary(x,'online',helpers)}${root.CareFlowJourneys.summary(x,'aftercare',helpers)}</div>
    </section>`;
  }
  function restoreDashboardFocus(selector){document.querySelector(selector)?.focus({preventScroll:true})}
  function input(event,x){
    if(root.CareFlowJourneys.filterInput(event,x))return true;
    if(!event.target.matches('[data-dashboard-search]'))return false;
    const pos=event.target.selectionStart;
    dashboardState(x).agendaSearch=event.target.value;x.render();
    const field=document.getElementById('doctor-agenda-search');field?.focus({preventScroll:true});if(field&&field.type==='text')field.setSelectionRange(pos,pos);return true;
  }
  function change(event,x){
    if(root.CareFlowJourneys.filterInput(event,x))return true;
    const key=event.target.dataset.dashboardField,value=event.target.value;
    if(key==='currentEncounter'&&yours(x).some(a=>a.id===value&&a.status==='in-consult')){dashboardState(x)[key]=value;x.render();restoreDashboardFocus('[data-dashboard-field="currentEncounter"]');return true}
    if(!dashboardChoices[key]?.includes(value))return false;
    dashboardState(x)[key]=value;x.render();restoreDashboardFocus(`[data-dashboard-field="${key}"]`);return true;
  }
  function schedule(x){
    const active=Number.isInteger(x.ui.docDay)?x.ui.docDay:3;
    const dates=['12/10','13/10','14/10','15/10','16/10','17/10','18/10'];
    const week=Number.isInteger(x.ui.dayOffset)?x.ui.dayOffset:0;
    const base=week===0;
    const todays=base&&active===3?yours(x):[];
    return `<section class="screen doctor-screen">
      ${intro('SCHEDULE / WEEK','My schedule','A focused schedule for consultations; choose a day to see the coordinated visits.',x.btn(`${x.icon('users',16)} Visit list`,'go','btn-primary','data-to="/doctor/queue"'))}
      <div class="doctor-schedule-layout">
        <section class="doctor-surface doctor-schedule-main" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">APPOINTMENTS / WEEK</span><h2>${base?'12 — 18 October 2026':`Week ${week>0?'+':''}${week} · No appointments`}</h2></div><div class="doctor-week-controls">
        <button class="doctor-icon-button" data-action="previous-week" aria-label="Previous week">${x.icon('left',17)}</button>
        <button class="doctor-week-today" data-action="doc-today">This week</button>
        <button class="doctor-icon-button" data-action="next-week" aria-label="Next week">${x.icon('right',17)}</button></div></div>
        <div class="doctor-week-days">${dates.map((d,i)=>`<button class="doctor-day ${active===i?'selected':''}" data-action="doc-day" data-value="${i}" aria-pressed="${active===i}"><small>${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</small><strong>${d.split('/')[0]}</strong><span>${base&&i===3?(n=>n+(n===1?' appt':' appts'))(yours(x).length):'—'}</span></button>`).join('')}</div>
        <div class="doctor-section-head doctor-agenda-subhead"><div><span class="doctor-overline">VISIT LIST</span><h2>${base?dates[active]+'/2026':'Another week'}</h2></div><span class="doctor-count">${todays.length.toString().padStart(2,'0')} visit${todays.length===1?'':'s'}</span></div>
        <div class="doctor-today-list">${todays.length?todays.map(a=>row(x,a)).join(''):`<div class="doctor-empty">${x.icon('calendar',31)}<strong>No appointments</strong><p>Choose 15/10 or return to this week to see scheduled visits.</p>${x.btn('Go to a scheduled day','doc-today','btn-soft')}</div>`}</div>
        </section>
        <aside class="doctor-schedule-aside"><section class="doctor-surface doctor-schedule-summary" ${UI.cardAttrs('surface')}><div class="doctor-overline">ASSIGNED DOCTOR</div><h2>Dr. Nguyễn Văn An</h2><p>Assigned doctor · CareFlow Clinic</p><div class="doctor-divider"></div><div class="doctor-sum"><span>Scheduled visits</span><strong>${yours(x).length}</strong></div><div class="doctor-sum"><span>In consultation</span><strong>${yours(x).filter(a=>a.status==='in-consult').length}</strong></div><div class="doctor-sum"><span>Completed</span><strong>${yours(x).filter(a=>a.status==='completed').length}</strong></div></section><section class="doctor-surface doctor-next-visit" ${UI.cardAttrs('surface')}><div class="doctor-overline">NEXT VISIT</div>${(()=>{const a=yours(x).find(a=>['ready','arrived','confirmed'].includes(a.status));return a?`<div class="doctor-next-patient">${x.avatar(x.person(a.personId))}<div><strong>${x.e(x.person(a.personId).name)}</strong><span>${x.e(a.time)} · ${x.e(UI.modeText(a.mode))}</span></div></div><div class="doctor-next-action">${stepLabel(x,a)}${actionFor(a,x)}</div>`:'<p class="doctor-next-none">No visits waiting.</p>'})()}</section><section class="doctor-tip"><span>${x.icon('info',20)}</span><p>The schedule updates as visits are checked in. Confirming and adjusting appointments is handled by reception.</p></section></aside>
      </div></section>`;
  }
  function queue(x){
    const f=x.ui.docQueueFilter||'all';
    const visits=yours(x), display=visits.filter(a=>f==='all'||(f==='ready'?['ready','arrived','confirmed'].includes(a.status):f==='in-consult'?a.status==='in-consult':a.status==='completed'));
    return `<section class="screen doctor-screen">${intro('VISIT LIST / TODAY','Visit list','Track patients who are waiting, in consultation and completed.') }
      <section class="doctor-surface" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">VISITS</span><h2>Today’s visits</h2><p>Choose a patient to continue with the right step</p></div><div class="doctor-filter" role="group" aria-label="Filter visit list">${[['all','All'],['ready','Ready'],['in-consult','In consultation'],['completed','Completed']].map(([value,t])=>`<button data-cf-component="tab" data-cf-variant="segmented" data-action="doc-filter-queue" data-value="${value}" aria-pressed="${f===value}" class="${f===value?'selected':''}">${t}</button>`).join('')}</div></div><div class="doctor-today-list">${display.length?display.map(a=>row(x,a)).join(''):`<div class="doctor-empty">${x.icon('users',28)}<strong>No matching visits</strong><p>Try another filter to continue.</p>${x.btn('View all visits','doc-filter-queue','btn-soft','data-value="all"')}</div>`}</div></section></section>`;
  }
  function patients(x){
    const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLocaleLowerCase('en-GB');
    const search=fold(x.ui.docSearch);
    const ids=new Set(yours(x).map(a=>a.personId));
    const people=x.people.filter(p=>ids.has(p.id)&&(fold(p.name).includes(search)||fold(p.code).includes(search)));
    return `<section class="screen doctor-screen">${intro('RECORDS / PATIENTS','Patient record','Patients on the doctor’s schedule. Access history and related results.')}
      <section class="doctor-surface" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">SCHEDULED PATIENTS</span><h2>${people.length} record${people.length===1?'':'s'} shown</h2></div><label class="doctor-search">${x.icon('search',18)}<input id="doctor-search" data-search="doctor-patients" placeholder="Search patients, record codes…" value="${x.e(x.ui.docSearch||'')}" aria-label="Search patients"></label></div>
      <div class="doctor-directory">${people.length?people.map(p=>{const a=yours(x).find(a=>a.personId===p.id);return `<article class="doctor-directory-row" ${UI.cardAttrs('row')}>${x.avatar(p,'large')}<div><strong>${x.e(p.name)}</strong><span>${x.e(p.code)} · ${p.age} years · ${x.e(p.gender)}</span></div><div class="doctor-directory-status">${stepLabel(x,a)}</div><button class="doctor-directory-open" data-action="open-patient" data-id="${x.e(p.id)}" aria-label="Open record for ${x.e(p.name)}">${x.icon('arrow',19)}</button></article>`}).join(''):`<div class="doctor-empty">No matching patients found.</div>`}</div></section></section>`;
  }
  function resultsPage(x){
    const all=results(x),filter=x.ui.docResultFilter||'all',list=all.filter(r=>filter==='all'||r.status===filter);
    let selected=all.find(r=>r.id===x.ui.resultSelected)||all[0];if(!selected){return `<section class="screen doctor-screen">${intro('RESULTS / DIAGNOSTICS','Diagnostic results','No results to view yet.')}</section>`}
    return `<section class="screen doctor-screen">${intro('RESULTS / DIAGNOSTICS','Diagnostic results','Track status, view document details and mark as reviewed — results are not released automatically.')}
     <div class="doctor-results-grid"><section class="doctor-surface" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">RESULT FORMS</span><h2>Results list</h2></div><div class="doctor-filter" role="group" aria-label="Result status">${[['all','All'],['ready','To review'],['reviewed','Reviewed']].map(([v,t])=>`<button data-cf-component="tab" data-cf-variant="segmented" data-action="doc-result-filter" data-value="${v}" aria-pressed="${filter===v}" class="${filter===v?'selected':''}">${t}</button>`).join('')}</div></div>
      <div class="doctor-lab-list">${list.length?list.map(r=>`<button class="doctor-lab-row ${r.id===selected.id?'selected':''}" ${UI.cardAttrs('row')} data-action="select-result" data-id="${x.e(r.id)}">${iconRound(x,'beaker')}<span><strong>${x.e(r.title)}</strong><small>${x.e(x.person(r.personId).name)} · ${x.e(r.date)}</small></span>${x.resultPill(r)}${x.icon('chevron',16)}</button>`).join(''):`<div class="doctor-empty">No matching results.</div>`}</div></section>
      <section class="doctor-surface doctor-result-preview" ${UI.cardAttrs('surface')}><div class="doctor-overline">RESULT INFORMATION</div><div class="doctor-result-banner">${iconRound(x,'file')}${x.resultPill(selected)}</div><h2>${x.e(selected.title)}</h2><p>${x.e(selected.type)} · ${x.e(selected.code)}</p><div class="doctor-divider"></div>
      ${UI.facts([['Patient',x.person(selected.personId).name],['Date recorded',selected.date],['Assigned doctor',selected.doctor],['Status',UI.status(selected.status,'result').label]],x.e,'doctor-result-facts')}
      <div class="doctor-tip">${x.icon('info',17)}<span>The reviewed status is an internal record; it does not mean the result has been released to the patient.</span></div>
      ${x.btn(selected.status==='ready'?`${x.icon('check',17)} Mark as reviewed`:selected.status==='reviewed'?'Result reviewed':'Awaiting test','review-result','btn-primary doctor-result-action',`data-id="${x.e(selected.id)}" ${selected.status==='ready'?'':'disabled'}`)}
      ${root.CareFlowJourneys?.afterResult(selected,x)||''}
      ${x.btn(A.viewPatient,'open-patient','btn-soft doctor-result-action',`data-id="${x.e(selected.personId)}"`)}
      </section></div></section>`;
  }
  function followups(x){return root.CareFlowJourneys?.followups(x)||''}

  function visit(path,x){
    const id=path.split('/')[2],a=x.data.appointments.find(v=>v.id===id&&v.doctor.includes('Nguyễn Văn An'));
    if(!a)return `<section class="screen doctor-screen">${intro('DETAILS / VISIT','Visit not found','Only visits on the doctor’s schedule are shown.')}${x.btn('Back to my schedule','go','btn-primary','data-to="/doctor/schedule"')}</section>`;
    const p=x.person(a.personId);
    return `<section class="screen doctor-screen">
     ${intro('DETAILS / VISIT','Visit information','View the coordinated details. Rescheduling, cancelling and confirming appointments are not part of the doctor’s role.',x.btn('Back to visit list','go','btn-soft','data-to="/doctor/queue"'))}
     <div class="doctor-results-grid"><section class="doctor-surface doctor-result-preview" ${UI.cardAttrs('surface')}><div class="doctor-result-banner">${x.avatar(p,'large')}${stepLabel(x,a)}</div><h2>${x.e(p.name)}</h2><p>${x.e(p.code)} · ${p.age} years · ${x.e(p.gender)}</p><div class="doctor-divider"></div>
     ${UI.facts([['Ref. code',a.code],['Time',a.time+' · '+a.date],['Visit type',UI.modeText(a.mode)],['Reason for visit',a.reason],['Doctor',a.doctor],['Status',UI.status(a.status).label]],x.e,'doctor-result-facts')}
     <div class="doctor-tip">${x.icon('info',17)}<span>Appointment details are view-only here; rescheduling or cancelling is handled by reception.</span></div>
     ${actionFor(a,x)}</section><section class="doctor-surface doctor-result-preview" ${UI.cardAttrs('surface')}><div class="doctor-overline">RELATED RECORD</div><h2>Record & results</h2><p>Links to information related to this visit</p><div class="doctor-divider"></div>
     ${x.btn(A.viewPatient,'open-patient','btn-soft doctor-result-action',`data-id="${x.e(p.id)}"`)}
     ${x.btn(A.viewResults,'go','btn-soft doctor-result-action','data-to="/results"')}
     ${x.btn(A.viewSchedule,'go','btn-soft doctor-result-action','data-to="/doctor/schedule"')}
     </section></div></section>`;
  }
  function page(path,x){
    const journey=root.CareFlowJourneys?.page(path,x);if(journey!=null)return journey;
    if(path.startsWith('/visits/'))return visit(path,x);
    if(path==='/doctor')return dashboard(x);
    if(path==='/doctor/schedule')return schedule(x);
    if(path==='/doctor/queue')return queue(x);
    if(path==='/doctor/followups')return followups(x);
    if(path==='/patients')return patients(x);
    if(path==='/results')return resultsPage(x);
    return null;
  }
  function action(node,x){
    if(root.CareFlowJourneys?.action(node,x))return true;
    const name=node.dataset.action;
    if(name==='doc-dashboard-filter'){
      const key=node.dataset.group,value=node.dataset.value;
      if(dashboardChoices[key]?.includes(value)){dashboardState(x)[key]=value;x.render();restoreDashboardFocus(`[data-action="doc-dashboard-filter"][data-group="${key}"][data-value="${value}"]`);if(key==='agendaSort')restoreDashboardFocus('.doctor-agenda-table thead button')}
      return true;
    }
    if(name==='doc-dashboard-reset'){Object.assign(dashboardState(x),{agendaSearch:'',agendaStatus:'all',agendaMode:'all'});x.render();restoreDashboardFocus('#doctor-agenda-search');return true}

    if(name==='doc-day'){x.ui.docDay=Number(node.dataset.value);x.render();return true}
    if(name==='doc-today'){x.ui.docDay=3;x.ui.dayOffset=0;x.render();return true}
    if(name==='doc-filter-queue'){x.ui.docQueueFilter=node.dataset.value;x.render();return true}
    if(name==='doc-result-filter'){x.ui.docResultFilter=node.dataset.value;x.render();return true}
    if(name==='doc-task-toggle'){const task=x.data.doctorTasks?.find(t=>t.id===node.dataset.id);if(task?.owner==='doctor'){task.done=!task.done;x.save();x.notify(task.done?'Task marked as done.':'Task reopened.')}else x.notify('This task belongs to another team.');return true}
    return false;
  }
  root.CareFlowDoctor={page,action,input,change,permitted,texts};
})(window);
