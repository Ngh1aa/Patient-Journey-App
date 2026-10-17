/* CareFlow Doctor-Only Portfolio. Synthetic clinical UI / no medical decision support. */
(function installDoctorShowcase(root){
  'use strict';
  const UI=root.CareFlowUI, COPY=root.CareFlowCopy, A=COPY.ui;
  const allowed=['/doctor','/doctor/schedule','/doctor/queue','/doctor/followups','/patients','/results','/clinical/orders','/clinical/prescription','/clinical/review'];
  const texts={'/doctor':'Tổng quan','/doctor/schedule':'Lịch khám','/doctor/queue':'Danh sách khám','/doctor/followups':'Công việc theo dõi','/patients':'Bệnh nhân','/results':'Kết quả','/clinical/orders':'Chỉ định','/clinical/prescription':'Đơn thuốc','/clinical/review':A.reviewEncounter};
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
    if(a.status==='ready'&&a.mode.toLowerCase().includes('online'))return x.btn('Mở phiên trực tuyến','go','btn-primary',`data-to="/doctor/online/${x.e(a.id)}"`);
    if(a.status==='ready')return x.btn(`${x.e(A.startConsult)} ${x.icon('arrow',16)}`,'start-consult','btn-primary',`data-id="${x.e(a.id)}"`);
    if(a.status==='review')return x.btn(A.reviewRequest,'go','btn-soft',`data-to="/doctor/review/${x.e(a.id)}"`);
    if(a.status==='unreachable'&&a.mode.toLowerCase().includes('online'))return x.btn('Xem bàn giao','go','btn-soft',`data-to="/doctor/online/${x.e(a.id)}"`);
    if(['confirmed','arrived'].includes(a.status))return x.btn(A.viewVisit,'go','btn-soft',`data-to="/visits/${x.e(a.id)}"`);
    if(a.status==='completed')return x.btn('Xem lại buổi khám','go','btn-soft',`data-to="/encounters/${x.e(a.id)}"`);
    return x.btn(A.viewPatient,'open-patient','btn-soft',`data-id="${x.e(a.personId)}"`);
  }
  function row(x,a,compact=false){
    const p=x.person(a.personId);
    return `<div data-cf-component="appointment" data-cf-variant="row" class="doctor-appointment ${compact?'is-compact':''}">
       <div class="doctor-appointment-time"><strong>${x.e(a.time)}</strong><small>${x.e(a.date)}</small></div>
       ${x.avatar(p)}<div class="doctor-appointment-person"><strong>${x.e(p.name)}</strong><span>${x.e(p.code)} · ${x.e(UI.modeText(a.mode))} · Phụ trách: ${x.e(a.owner)}</span></div>
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
  function cardHeading(x,number,title,detail,count,id){return `<header class="doctor-card-heading"><div><span class="doctor-overline">${number}</span><h2 id="${id}">${title}</h2>${detail?`<p>${x.e(detail)}</p>`:''}</div>${count==null?'':`<span class="doctor-card-count" aria-label="${count} mục">${count}</span>`}</header>`}
  function emptyCard(x,title,detail,reset=false,actions=''){return `<div class="doctor-card-empty cf2-state" data-cf2-state="empty" role="status"><strong>${x.e(title)}</strong><p>${x.e(detail)}</p>${reset?x.btn('Xóa bộ lọc','doc-dashboard-reset','btn-soft'):''}${actions}</div>`}
  function encounterCard(x,visits){
    const active=visits.filter(a=>a.status==='in-consult');
    const doing=active.find(a=>a.id===dashboardState(x).currentEncounter)||active[0];
    if(!doing)return `<section class="doctor-surface doctor-now" data-priority="current" aria-labelledby="current-encounter-title">${cardHeading(x,'01 / ĐANG KHÁM','Buổi khám đang thực hiện','',null,'current-encounter-title')}${emptyCard(x,'Chưa có buổi khám đang thực hiện','Chọn lượt sẵn sàng trong danh sách khám để bắt đầu.',false,x.btn(A.viewQueue,'go','btn-secondary','data-to="/doctor/queue"'))}</section>`;
    const p=x.person(doing.personId),draft=x.data.drafts?.[doing.id]||{},fields=[['symptom','Triệu chứng'],['assessment','Nhận định'],['plan','Kế hoạch xử trí']];
    const complete=fields.filter(([key])=>String(draft[key]||'').trim()).length;
    const unread=results(x).filter(r=>r.personId===p.id&&r.status==='ready');
    return `<section class="doctor-surface doctor-now" data-priority="current" aria-labelledby="current-encounter-title">
      ${cardHeading(x,'01 / ĐANG KHÁM','Buổi khám đang thực hiện','',null,'current-encounter-title')}
      ${active.length>1?`<label class="doctor-control doctor-encounter-picker"><span>Chọn buổi khám cần tiếp tục · ${active.length} buổi chưa hoàn tất</span><select data-dashboard-field="currentEncounter">${active.map(a=>`<option value="${x.e(a.id)}" ${a.id===doing.id?'selected':''}>${x.e(x.person(a.personId).name)} · ${x.e(a.code)}</option>`).join('')}</select></label>`:''}
      <div class="doctor-encounter-layout"><div class="doctor-encounter-context">
        <div class="doctor-now-person">${x.avatar(p,'large')}<div><h3>${x.e(p.name)}</h3><p>${x.e(p.code)} · ${p.age} tuổi · ${x.e(p.gender)}</p></div>${stepLabel(x,doing)}</div>
        ${UI.facts([['Lượt khám',doing.code],['Giờ hẹn',doing.time+' · '+doing.date],['Hình thức',UI.modeText(doing.mode)],['Người phụ trách',doing.owner]],x.e,'doctor-current-facts')}
        <dl class="doctor-context-note"><div><dt>Lý do khám</dt><dd>${x.e(doing.reason||'Chưa có ghi nhận')}</dd></div><div><dt>Thông tin đã ghi nhận</dt><dd>${x.e(doing.history||'Chưa có thông tin bổ sung')}</dd></div></dl>
      </div><div class="doctor-encounter-record"><div class="doctor-record-heading"><h3>Ghi nhận buổi khám</h3><span>${complete}/3 mục đã điền</span></div>
        <ul class="doctor-record-checklist">${fields.map(([key,title])=>`<li>${x.icon(String(draft[key]||'').trim()?'check':'file',16)}<span>${title}</span><span>${String(draft[key]||'').trim()?'Đã điền':'Chưa điền'}</span></li>`).join('')}</ul>
        <p class="doctor-record-note">${unread.length?`${unread.length} kết quả liên quan chưa xem.`:'Không có kết quả liên quan chưa xem.'} ${complete===3?'Cần rà soát nội dung trước khi hoàn tất.':'Tiếp tục hoàn thiện ghi nhận trong buổi khám.'}</p>
        <div class="doctor-card-actions">${actionFor(doing,x)}${x.btn(A.viewPatient,'open-patient','btn-secondary',`data-id="${x.e(p.id)}"`)}</div>
      </div></div></section>`;
  }
  function resultCard(x){
    const all=results(x),state=dashboardState(x),filter=state.result||'ready',list=all.filter(r=>r.status===filter);
    return `<section class="doctor-surface doctor-labs-today" data-priority="results" aria-labelledby="pending-results-title">${cardHeading(x,'03 / KẾT QUẢ','Kết quả cận lâm sàng','Mở phiếu để xem và ghi nhận đã xem.',all.filter(r=>r.status==='ready').length,'pending-results-title')}
      ${filterButtons(x,'result',[['ready','Chưa xem',all.filter(r=>r.status==='ready').length],['waiting','Chờ thực hiện',all.filter(r=>r.status==='waiting').length],['reviewed','Đã xem',all.filter(r=>r.status==='reviewed').length]],'Lọc kết quả trên tổng quan')}
      <div class="doctor-card-list">${list.map(r=>`<article class="doctor-result-item" data-cf2-state="${r.status==='ready'?'unread':'data'}" data-result-id="${x.e(r.id)}"><div class="doctor-item-eyebrow"><span>${x.e(r.type)} · ${x.e(r.code)}</span>${x.resultPill(r)}</div><h3>${x.e(r.title)}</h3><p>${x.e(x.person(r.personId).name)} · ${x.e(x.person(r.personId).code)}</p><div class="doctor-item-bottom"><span>Ghi nhận ${x.e(r.date)}</span>${x.btn('Xem kết quả','show-result','btn-soft',`data-id="${x.e(r.id)}" aria-label="Xem kết quả ${x.e(r.title)} của ${x.e(x.person(r.personId).name)}"`)}</div></article>`).join('')||emptyCard(x,filter==='ready'?'Không có kết quả chưa xem':filter==='waiting'?'Không có phiếu chờ thực hiện':'Chưa có kết quả đã xem','Có thể chuyển nhóm để xem các phiếu khác.')}</div>
    </section>`;
  }
  const normalizeSearch=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLocaleLowerCase('vi').trim();
  function agendaCard(x,visits){
    const state=dashboardState(x),query=normalizeSearch(state.agendaSearch),status=state.agendaStatus||'all',mode=state.agendaMode||'all',desc=state.agendaSort==='desc';
    const modeKey=a=>a.mode.toLowerCase().includes('online')?'online':a.mode==='Chờ chốt hình thức'?'undecided':'onsite';
    const list=visits.filter(a=>{const p=x.person(a.personId);return (!query||normalizeSearch([p.name,p.code,a.code].join(' ')).includes(query))&&(status==='all'||a.status===status)&&(mode==='all'||modeKey(a)===mode)}).sort((a,b)=>(desc?-1:1)*a.time.localeCompare(b.time));
    const filtered=query||status!=='all'||mode!=='all';
    return `<section class="doctor-surface doctor-today" data-priority="schedule" aria-labelledby="daily-agenda-title">${cardHeading(x,'04 / LỊCH TRONG NGÀY','Lịch khám trong ngày',`Ngày ${visits[0]?.date||'chưa có lịch'} · Chỉ hiển thị lượt được phân công`,visits.length,'daily-agenda-title')}
      <div class="doctor-agenda-toolbar"><label class="doctor-control doctor-agenda-search"><span>Tìm lượt khám</span><span class="doctor-search-field">${x.icon('search',18)}<input id="doctor-agenda-search" type="text" inputmode="search" data-dashboard-search placeholder="Tên bệnh nhân, mã hồ sơ hoặc mã lượt" value="${x.e(state.agendaSearch||'')}" autocomplete="off"></span></label>
      ${selectFilter(x,'agendaStatus','Trạng thái',[['all','Tất cả trạng thái'],...['in-consult','ready','review','pending','unreachable','completed'].map(id=>[id,UI.status(id).label])])}
      ${selectFilter(x,'agendaMode','Hình thức',[['all','Tất cả hình thức'],['onsite','Tại phòng khám'],['online','Khám trực tuyến'],['undecided','Chờ chốt hình thức']])}${selectFilter(x,'agendaSort','Sắp xếp giờ hẹn',[['asc','Sớm đến muộn'],['desc','Muộn đến sớm']])}</div>
      <div class="doctor-agenda-feedback"><p id="doctor-agenda-count" role="status">Hiển thị ${list.length}/${visits.length} lượt khám</p>${filtered?x.btn('Xóa bộ lọc','doc-dashboard-reset','btn-soft'):''}</div>
      ${list.length?`<table class="doctor-agenda-table"><caption class="sr-only">Lịch khám được phân công ngày ${x.e(visits[0]?.date||'')}</caption><thead><tr><th scope="col" aria-sort="${desc?'descending':'ascending'}">Giờ hẹn</th><th scope="col">Bệnh nhân / Lượt khám</th><th scope="col">Hình thức</th><th scope="col">Trạng thái / Phụ trách</th><th scope="col">Thao tác</th></tr></thead><tbody>${list.map(a=>{const p=x.person(a.personId);return `<tr class="doctor-agenda-row" data-visit-id="${x.e(a.id)}" data-cf-component="appointment" data-cf-variant="agenda"><td data-label="Giờ hẹn"><strong>${x.e(a.time)}</strong></td><td class="doctor-agenda-person" data-label="Bệnh nhân / Lượt khám"><strong>${x.e(p.name)}</strong><span>${x.e(p.code)} · ${x.e(a.code)}</span><span>${x.e(a.reason||'Chưa ghi nhận lý do khám')}</span></td><td data-label="Hình thức">${x.e(UI.modeText(a.mode))}</td><td data-label="Trạng thái / Phụ trách">${stepLabel(x,a)}<span>Phụ trách: ${x.e(a.owner)}</span></td><td class="doctor-agenda-actions" data-label="Thao tác">${actionFor(a,x)}</td></tr>`}).join('')}</tbody></table>`:emptyCard(x,visits.length?'Không tìm thấy lượt khám phù hợp':'Chưa có lịch khám',visits.length?'Thử tên, mã hồ sơ khác hoặc xóa bộ lọc.':'Các lượt được phân công sẽ xuất hiện tại đây.',Boolean(filtered))}
    </section>`;
  }
  function dashboard(x){
    const visits=yours(x),helpers={filterButtons,selectFilter,cardHeading,emptyCard,state:dashboardState(x)};
    return `<section class="screen doctor-screen doctor-home">
      ${intro('KHÔNG GIAN BÁC SĨ','Tổng quan khám bệnh','BS. Nguyễn Văn An · Ngày theo lịch: '+(visits[0]?.date||'Chưa có lịch'),x.btn(A.viewSchedule,'go','btn-secondary','data-to="/doctor/schedule"'))}
      <div class="doctor-priority-grid">${encounterCard(x,visits)}${root.CareFlowJourneys.summary(x,'decision',helpers)}${resultCard(x)}${agendaCard(x,visits)}</div>
      <div class="doctor-secondary-grid">${root.CareFlowJourneys.summary(x,'online',helpers)}${root.CareFlowJourneys.summary(x,'aftercare',helpers)}</div>
    </section>`;
  }
  function restoreDashboardFocus(selector){document.querySelector(selector)?.focus({preventScroll:true})}
  function input(event,x){
    if(!event.target.matches('[data-dashboard-search]'))return false;
    const pos=event.target.selectionStart;
    dashboardState(x).agendaSearch=event.target.value;x.render();
    const field=document.getElementById('doctor-agenda-search');field?.focus({preventScroll:true});if(field&&field.type==='text')field.setSelectionRange(pos,pos);return true;
  }
  function change(event,x){
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
      ${intro('LỊCH KHÁM / TUẦN','Lịch khám của tôi','Một lịch trình tập trung cho buổi khám; chọn ngày để xem các lượt đã được điều phối.',x.btn(`${x.icon('users',16)} Danh sách khám`,'go','btn-primary','data-to="/doctor/queue"'))}
      <div class="doctor-schedule-layout">
        <section class="doctor-surface doctor-schedule-main"><div class="doctor-section-head"><div><span class="doctor-overline">LỊCH HẸN / TUẦN</span><h2>${base?'12 — 18 tháng 10, 2026':`Tuần ${week>0?'+':''}${week} · Chưa có lịch hẹn`}</h2></div><div class="doctor-week-controls">
        <button class="doctor-icon-button" data-action="previous-week" aria-label="Tuần trước">${x.icon('left',17)}</button>
        <button class="doctor-week-today" data-action="doc-today">Tuần hiện tại</button>
        <button class="doctor-icon-button" data-action="next-week" aria-label="Tuần sau">${x.icon('right',17)}</button></div></div>
        <div class="doctor-week-days">${dates.map((d,i)=>`<button class="doctor-day ${active===i?'selected':''}" data-action="doc-day" data-value="${i}" aria-pressed="${active===i}"><small>${['T2','T3','T4','T5','T6','T7','CN'][i]}</small><strong>${d.split('/')[0]}</strong><span>${base&&i===3?yours(x).length+' lịch':'—'}</span></button>`).join('')}</div>
        <div class="doctor-section-head doctor-agenda-subhead"><div><span class="doctor-overline">DANH SÁCH LƯỢT KHÁM</span><h2>${base?dates[active]+'/2026':'Tuần khác'}</h2></div><span class="doctor-count">${todays.length} lượt</span></div>
        <div class="doctor-today-list">${todays.length?todays.map(a=>row(x,a)).join(''):`<div class="doctor-empty">${x.icon('calendar',31)}<strong>Không có lịch khám</strong><p>Chọn ngày 15/10 hoặc quay lại tuần hiện tại để xem các lượt khám đã được xếp lịch.</p>${x.btn('Về ngày có lịch','doc-today','btn-soft')}</div>`}</div>
        </section>
        <aside class="doctor-schedule-aside"><section class="doctor-surface doctor-schedule-summary"><div class="doctor-overline">BÁC SĨ PHỤ TRÁCH</div><h2>BS. Nguyễn Văn An</h2><p>Bác sĩ phụ trách · CareFlow Clinic</p><div class="doctor-divider"></div><div class="doctor-sum"><span>Tổng lượt theo lịch</span><strong>${yours(x).length}</strong></div><div class="doctor-sum"><span>Đang khám</span><strong>${yours(x).filter(a=>a.status==='in-consult').length}</strong></div><div class="doctor-sum"><span>Đã hoàn tất</span><strong>${yours(x).filter(a=>a.status==='completed').length}</strong></div></section><section class="doctor-surface doctor-next-visit"><div class="doctor-overline">LƯỢT KHÁM TIẾP THEO</div>${(()=>{const a=yours(x).find(a=>['ready','arrived','confirmed'].includes(a.status));return a?`<div class="doctor-next-patient">${x.avatar(x.person(a.personId))}<div><strong>${x.e(x.person(a.personId).name)}</strong><span>${x.e(a.time)} · ${x.e(UI.modeText(a.mode))}</span></div></div><div class="doctor-next-action">${stepLabel(x,a)}${actionFor(a,x)}</div>`:'<p class="doctor-next-none">Không có lượt đang chờ tiếp nhận.</p>'})()}</section><section class="doctor-tip"><span>${x.icon('info',20)}</span><p>Lịch được cập nhật theo các lượt đã tiếp nhận. Việc xác nhận và điều chỉnh lịch thuộc bộ phận tiếp đón.</p></section></aside>
      </div></section>`;
  }
  function queue(x){
    const f=x.ui.docQueueFilter||'all';
    const visits=yours(x), display=visits.filter(a=>f==='all'||(f==='ready'?['ready','arrived','confirmed'].includes(a.status):f==='in-consult'?a.status==='in-consult':a.status==='completed'));
    return `<section class="screen doctor-screen">${intro('DANH SÁCH KHÁM / HÔM NAY','Danh sách khám','Theo dõi bệnh nhân đang chờ, trong buổi khám và những lượt đã hoàn tất.') }
      <section class="doctor-surface"><div class="doctor-section-head"><div><span class="doctor-overline">LƯỢT KHÁM</span><h2>Lượt khám hôm nay</h2><p>Chọn bệnh nhân để tiếp tục bước phù hợp</p></div><div class="doctor-filter" role="group" aria-label="Lọc danh sách khám">${[['all','Tất cả'],['ready','Sẵn sàng'],['in-consult','Đang khám'],['completed','Hoàn tất']].map(([value,t])=>`<button data-cf-component="tab" data-cf-variant="segmented" data-action="doc-filter-queue" data-value="${value}" aria-pressed="${f===value}" class="${f===value?'selected':''}">${t}</button>`).join('')}</div></div><div class="doctor-today-list">${display.length?display.map(a=>row(x,a)).join(''):`<div class="doctor-empty">${x.icon('users',28)}<strong>Chưa có lượt phù hợp</strong><p>Thử bộ lọc khác để tiếp tục.</p></div>`}</div></section></section>`;
  }
  function patients(x){
    const search=(x.ui.docSearch||'').toLocaleLowerCase('vi');
    const ids=new Set(yours(x).map(a=>a.personId));
    const people=x.people.filter(p=>ids.has(p.id)&&(p.name.toLocaleLowerCase('vi').includes(search)||p.code.toLowerCase().includes(search)));
    return `<section class="screen doctor-screen">${intro('HỒ SƠ / BỆNH NHÂN','Hồ sơ bệnh nhân','Danh sách bệnh nhân trong lịch của bác sĩ. Truy cập lịch sử và các kết quả liên quan.')}
      <section class="doctor-surface"><div class="doctor-section-head"><div><span class="doctor-overline">BỆNH NHÂN THEO LỊCH</span><h2>${people.length} hồ sơ được hiển thị</h2></div><label class="doctor-search">${x.icon('search',18)}<input id="doctor-search" data-search="doctor-patients" placeholder="Tìm bệnh nhân, mã hồ sơ…" value="${x.e(x.ui.docSearch||'')}" aria-label="Tìm bệnh nhân"></label></div>
      <div class="doctor-directory">${people.length?people.map(p=>{const a=yours(x).find(a=>a.personId===p.id);return `<article class="doctor-directory-row">${x.avatar(p,'large')}<div><strong>${x.e(p.name)}</strong><span>${x.e(p.code)} · ${p.age} tuổi · ${x.e(p.gender)}</span></div><div class="doctor-directory-status">${stepLabel(x,a)}</div><button class="doctor-directory-open" data-action="open-patient" data-id="${x.e(p.id)}" aria-label="Mở hồ sơ ${x.e(p.name)}">${x.icon('arrow',19)}</button></article>`}).join(''):`<div class="doctor-empty cf2-state" data-cf2-state="empty" role="status"><strong>Không tìm thấy hồ sơ phù hợp</strong><p>Kiểm tra lại tên hoặc mã hồ sơ đã nhập.</p></div>`}</div></section></section>`;
  }
  function resultsPage(x){
    const all=results(x),filter=x.ui.docResultFilter||'all',list=all.filter(r=>filter==='all'||r.status===filter);
    let selected=all.find(r=>r.id===x.ui.resultSelected)||all[0];if(!selected){return `<section class="screen doctor-screen">${intro('KẾT QUẢ / CẬN LÂM SÀNG','Kết quả cận lâm sàng','Chưa có kết quả để xem.')}</section>`}
    return `<section class="screen doctor-screen">${intro('KẾT QUẢ / CẬN LÂM SÀNG','Kết quả cận lâm sàng','Theo dõi trạng thái, xem thông tin tài liệu và ghi nhận đã xem — không tự công bố kết quả.')}
     <div class="doctor-results-grid"><section class="doctor-surface"><div class="doctor-section-head"><div><span class="doctor-overline">PHIẾU KẾT QUẢ</span><h2>Danh sách kết quả</h2></div><div class="doctor-filter" role="group" aria-label="Trạng thái kết quả">${[['all','Tất cả'],['ready','Cần xem'],['reviewed','Đã xem']].map(([v,t])=>`<button data-cf-component="tab" data-cf-variant="segmented" data-action="doc-result-filter" data-value="${v}" aria-pressed="${filter===v}" class="${filter===v?'selected':''}">${t}</button>`).join('')}</div></div>
      <div class="doctor-lab-list">${list.length?list.map(r=>`<button class="doctor-lab-row ${r.id===selected.id?'selected':''}" data-cf2-state="${r.status==='ready'?'unread':'data'}" data-action="select-result" data-id="${x.e(r.id)}">${iconRound(x,'beaker')}<span><strong>${x.e(r.title)}</strong><small>${x.e(x.person(r.personId).name)} · ${x.e(r.date)}</small></span>${x.resultPill(r)}${x.icon('chevron',16)}</button>`).join(''):`<div class="doctor-empty cf2-state" data-cf2-state="empty" role="status"><strong>Chưa có kết quả trong bộ lọc</strong><p>Chọn trạng thái khác để xem phiếu liên quan.</p></div>`}</div></section>
      <section class="doctor-surface doctor-result-preview"><div class="doctor-overline">THÔNG TIN KẾT QUẢ</div><div class="doctor-result-banner">${iconRound(x,'file')}${x.resultPill(selected)}</div><h2>${x.e(selected.title)}</h2><p>${x.e(selected.type)} · ${x.e(selected.code)}</p><div class="doctor-divider"></div>
      ${UI.facts([['Bệnh nhân',x.person(selected.personId).name],['Ngày ghi nhận',selected.date],['Bác sĩ phụ trách',selected.doctor],['Trạng thái',UI.status(selected.status,'result').label]],x.e,'doctor-result-facts')}
      <div class="doctor-tip">${x.icon('info',17)}<span>Trạng thái đã xem là ghi nhận nội bộ, không đồng nghĩa đã trả kết quả cho người bệnh.</span></div>
      ${x.btn(selected.status==='ready'?`${x.icon('check',17)} Đánh dấu đã xem`:selected.status==='reviewed'?'Đã xem kết quả':'Chờ thực hiện','review-result','btn-primary doctor-result-action',`data-id="${x.e(selected.id)}" ${selected.status==='ready'?'':'disabled'}`)}
      ${root.CareFlowJourneys?.afterResult(selected,x)||''}
      ${x.btn(A.viewPatient,'open-patient','btn-soft doctor-result-action',`data-id="${x.e(selected.personId)}"`)}
      </section></div></section>`;
  }
  function followups(x){return root.CareFlowJourneys?.followups(x)||''}

  function visit(path,x){
    const id=path.split('/')[2],a=x.data.appointments.find(v=>v.id===id&&v.doctor.includes('Nguyễn Văn An'));
    if(!a)return `<section class="screen doctor-screen">${intro('CHI TIẾT / LƯỢT KHÁM','Không tìm thấy lượt khám','Chỉ hiển thị các lượt khám thuộc lịch của bác sĩ.')}${x.btn('Về lịch của tôi','go','btn-primary','data-to="/doctor/schedule"')}</section>`;
    const p=x.person(a.personId);
    return `<section class="screen doctor-screen">
     ${intro('CHI TIẾT / LƯỢT KHÁM','Thông tin lượt khám','Xem chi tiết đã được điều phối. Thao tác đổi/hủy và xác nhận lịch không thuộc vai trò bác sĩ.',x.btn('Về danh sách khám','go','btn-soft','data-to="/doctor/queue"'))}
     <div class="doctor-results-grid"><section class="doctor-surface doctor-result-preview"><div class="doctor-result-banner">${x.avatar(p,'large')}${stepLabel(x,a)}</div><h2>${x.e(p.name)}</h2><p>${x.e(p.code)} · ${p.age} tuổi · ${x.e(p.gender)}</p><div class="doctor-divider"></div>
     ${UI.facts([['Mã phiếu',a.code],['Giờ khám',a.time+' · '+a.date],['Hình thức',UI.modeText(a.mode)],['Lý do khám',a.reason],['Bác sĩ',a.doctor],['Trạng thái',UI.status(a.status).label]],x.e,'doctor-result-facts')}
     <div class="doctor-tip">${x.icon('info',17)}<span>Thông tin lịch hẹn chỉ được xem tại đây; thao tác đổi hoặc hủy lịch thuộc bộ phận tiếp đón.</span></div>
     ${actionFor(a,x)}</section><section class="doctor-surface doctor-result-preview"><div class="doctor-overline">HỒ SƠ LIÊN QUAN</div><h2>Hồ sơ & kết quả</h2><p>Liên kết tới các thông tin liên quan của lượt khám</p><div class="doctor-divider"></div>
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
    if(name==='doc-task-toggle'){const task=x.data.doctorTasks?.find(t=>t.id===node.dataset.id);if(task?.owner==='Bác sĩ'){task.done=!task.done;x.save();x.notify(task.done?'Đã đánh dấu công việc đã xử lý.':'Đã đưa công việc về trạng thái cần xử lý.')}else x.notify('Công việc thuộc bộ phận phụ trách khác.');return true}
    return false;
  }
  root.CareFlowDoctor={page,action,input,change,permitted,texts};
})(window);
