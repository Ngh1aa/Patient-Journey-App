/* CareFlow Doctor-Only Portfolio. Synthetic clinical UI / no medical decision support. */
(function installDoctorShowcase(root){
  'use strict';
  const allowed=['/doctor','/doctor/schedule','/doctor/queue','/doctor/followups','/patients','/results','/clinical/orders','/clinical/prescription','/clinical/review'];
  const texts={'/doctor':'Tổng quan','/doctor/schedule':'Lịch của tôi','/doctor/queue':'Danh sách khám','/doctor/followups':'Theo dõi','/patients':'Bệnh nhân','/results':'Kết quả','/clinical/orders':'Chỉ định','/clinical/prescription':'Đơn thuốc','/clinical/review':'Xem lại buổi khám'};
  const icons={pulse:'activity',calendar:'calendar',users:'users',clipboard:'clipboard',beaker:'beaker',check:'check'};
  const clinicalDoctor='Nguyễn Văn An';
  function permitted(path){
    if(allowed.includes(path))return true;
    if(path.startsWith('/patients/')||path.startsWith('/encounters/')||path.startsWith('/visits/'))return true;
    return false;
  }
  const esc=s=>String(s??'');
  const label=(x,s)=>x.e(s);
  function yours(x){return x.data.appointments.filter(a=>a.doctor.includes(clinicalDoctor)&&a.status!=='cancelled').sort((a,b)=>a.time.localeCompare(b.time))}
  function results(x){return x.data.results.filter(r=>r.doctor.includes(clinicalDoctor))}
  function intro(k,t,d,actions=''){return `<div class="doctor-heading"><div class="doctor-kicker">${k}</div><div class="doctor-heading-grid"><div><h1>${t}</h1><p>${d}</p></div><div class="doctor-heading-actions">${actions}</div></div></div>`}
  function iconRound(x,glyph){return `<span class="doctor-icon">${x.icon(glyph,20)}</span>`}
  function stepLabel(x,a){const names={'in-consult':'Đang khám',ready:'Sẵn sàng khám',completed:'Đã hoàn tất',review:'Cần xem xét',pending:'Chờ xác nhận',confirmed:'Đã xác nhận',arrived:'Đã đến',unreachable:'Chưa liên hệ được'};return x.pill(names[a.status]||a.status,{'in-consult':'brand',ready:'success',completed:'success',review:'danger',pending:'warning',confirmed:'info',arrived:'info'}[a.status]||'neutral')}
  function actionFor(a,x){
    if(a.status==='in-consult')return x.btn(`Tiếp tục khám ${x.icon('arrow',16)}`,'go','btn-primary',`data-to="/encounters/${x.e(a.id)}"`);
    if(['ready','arrived','confirmed'].includes(a.status))return x.btn(`Bắt đầu khám ${x.icon('arrow',16)}`,'start-consult','btn-primary',`data-id="${x.e(a.id)}"`);
    if(a.status==='completed')return x.btn('Xem lại buổi khám','go','btn-soft',`data-to="/encounters/${x.e(a.id)}"`);
    return x.btn('Xem hồ sơ','open-patient','btn-soft',`data-id="${x.e(a.personId)}"`);
  }
  function row(x,a,compact=false){
    const p=x.person(a.personId);
    return `<div class="doctor-appointment ${compact?'is-compact':''}">
       <div class="doctor-appointment-time"><strong>${x.e(a.time)}</strong><small>${x.e(a.date)}</small></div>
       ${x.avatar(p)}<div class="doctor-appointment-person"><strong>${x.e(p.name)}</strong><span>${x.e(p.code)} · ${x.e(a.mode)}</span></div>
       <div class="doctor-appointment-status">${stepLabel(x,a)}</div>
       <div class="doctor-appointment-action">${actionFor(a,x)}</div></div>`
  }
  function dashboard(x){
    const visits=yours(x),doing=visits.find(a=>a.status==='in-consult'),ready=visits.filter(a=>a.status==='ready'),newResults=results(x).filter(r=>r.status==='ready');
    const recent=visits.slice(0,4);
    return `<section class="screen doctor-screen doctor-home">
      <div class="doctor-hero">
        <div class="doctor-hero-content"><div class="doctor-hero-top"><span class="doctor-hero-mark">CAREFLOW / CLINIC</span><span class="doctor-hero-date">Thứ Năm, 15 tháng 10 · Lịch khám</span></div>
        <div class="doctor-hero-body"><p class="doctor-hero-eyebrow">WORKSPACE / BÁC SĨ</p><h1>Lịch khám<br><em>hôm nay.</em></h1><p class="doctor-hero-sub">Xin chào bác sĩ An. Theo dõi lịch khám, hồ sơ người bệnh và kết quả cận lâm sàng tại một nơi.</p>
        <div class="doctor-hero-ctas">${x.btn(`Vào buổi khám ${x.icon('arrow',17)}`,'go','btn-hero',`data-to="/encounters/${x.e((doing||ready[0]||visits[0]).id)}"`)}${x.btn('Lịch của tôi','go','btn-hero-quiet','data-to="/doctor/schedule"')}</div></div></div>
        <div class="doctor-hero-art" aria-hidden="true"><div class="doctor-art-ring ring-one"></div><div class="doctor-art-ring ring-two"></div><div class="doctor-art-orb"></div><div class="doctor-art-floating"><span>CARE JOURNEY</span><div>01 <b>Tiếp nhận</b></div><div>02 <b>Khám</b></div><div>03 <b>Theo dõi</b></div></div></div>
      </div>
      <div class="doctor-overview-meta"><span>KHÔNG GIAN LÀM VIỆC</span><span>15/10/2026 · Lịch làm việc của BS. Nguyễn Văn An</span></div>
      <div class="doctor-stat-grid">
        ${[['Lượt khám hôm nay',visits.length.toString().padStart(2,'0'),'calendar','Theo lịch bác sĩ','/doctor/schedule','Xem lịch'],['Sẵn sàng khám',ready.length.toString().padStart(2,'0'),'users','Chờ bác sĩ tiếp nhận','/doctor/queue','Mở danh sách'],['Kết quả chưa xem',newResults.length.toString().padStart(2,'0'),'beaker','Chờ bác sĩ rà soát','/results','Xem kết quả']].map(([t,n,i,d,url,action],idx)=>`<article class="doctor-stat-card doctor-action-card ${idx===1?'is-selected':''}"><div class="doctor-stat-card-head">${iconRound(x,i)}<a class="doctor-icon-link" href="#${url}" aria-label="${action}: ${t}" title="${action}">${x.icon('arrow',17)}</a></div><div class="doctor-stat-main"><div class="doctor-stat-number">${n}</div><strong>${t}</strong><p>${d}</p></div><a class="doctor-card-footer-link" href="#${url}">${action} ${x.icon('arrow',15)}</a></article>`).join('')}
      </div>
      <div class="doctor-dashboard-grid">
        <section class="doctor-surface doctor-today"><div class="doctor-section-head"><div><span class="doctor-overline">TODAY / AGENDA</span><h2>Lịch khám trong ngày</h2><p>Các lượt khám được sắp xếp theo giờ hẹn</p></div><a href="#/doctor/schedule" class="doctor-card-icon-action" aria-label="Xem toàn bộ lịch khám" title="Xem lịch khám">${x.icon('arrow',17)}</a></div><div class="doctor-today-list">${recent.map(a=>row(x,a,true)).join('')}</div></section>
        <div class="doctor-side-stack"><section class="doctor-surface doctor-now"><div class="doctor-section-head"><div><span class="doctor-overline">IN PROGRESS</span><h2>Buổi khám đang thực hiện</h2></div>${doing?`<button class="doctor-card-icon-action" data-action="open-patient" data-id="${x.e(doing.personId)}" aria-label="Mở hồ sơ bệnh nhân đang khám" title="Mở hồ sơ bệnh nhân">${x.icon('user',17)}</button>`:''}</div>${doing?`<div class="doctor-now-person">${x.avatar(x.person(doing.personId),'large')}<div><strong>${x.e(x.person(doing.personId).name)}</strong><span>${x.e(doing.code)} · ${x.e(doing.time)}</span></div></div><p>${x.e(doing.reason)}</p><div class="doctor-now-details"><div><small>Trạng thái</small><strong>Đang khám</strong></div><div><small>Hình thức</small><strong>${x.e(doing.mode)}</strong></div></div><div class="doctor-now-bottom"><span class="doctor-card-hint">${x.icon('clock',14)} Bắt đầu lúc ${x.e(doing.time)}</span>${actionFor(doing,x)}</div>`:`<div class="doctor-blank">Chưa có buổi khám đang diễn ra.</div>${x.btn('Mở danh sách khám','go','btn-soft',`data-to="/doctor/queue"`)}`}</section>
        <section class="doctor-surface doctor-labs-today"><div class="doctor-section-head"><div><span class="doctor-overline">KẾT QUẢ / CẬN LÂM SÀNG</span><h2>Kết quả cần xem</h2></div><a class="doctor-card-icon-action" href="#/results" aria-label="Mở tất cả kết quả cận lâm sàng" title="Mở kết quả">${x.icon('arrow',17)}</a></div>${newResults.slice(0,2).map(r=>`<button class="doctor-lab-mini" data-action="show-result" data-id="${x.e(r.id)}">${iconRound(x,'beaker')}<span><strong>${x.e(r.title)}</strong><small>${x.e(x.person(r.personId).name)}</small></span>${x.icon('arrow',16)}</button>`).join('')||'<p class="doctor-blank">Không có kết quả cần xem.</p>'}<div class="doctor-labs-footer"><span class="doctor-card-hint">${newResults.length} kết quả chờ rà soát</span><a href="#/results" class="doctor-more-link">Tất cả kết quả ${x.icon('arrow',16)}</a></div></section></div>
      </div>
    </section>`;
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
        <div class="doctor-section-head doctor-agenda-subhead"><div><span class="doctor-overline">DANH SÁCH LƯỢT KHÁM</span><h2>${base?dates[active]+'/2026':'Tuần khác'}</h2></div><span class="doctor-count">${todays.length.toString().padStart(2,'0')} lượt</span></div>
        <div class="doctor-today-list">${todays.length?todays.map(a=>row(x,a)).join(''):`<div class="doctor-empty">${x.icon('calendar',31)}<strong>Không có lịch khám</strong><p>Chọn ngày 15/10 hoặc quay lại tuần hiện tại để xem các lượt khám đã được xếp lịch.</p>${x.btn('Về ngày có lịch','doc-today','btn-soft')}</div>`}</div>
        </section>
        <aside class="doctor-schedule-aside"><section class="doctor-surface doctor-schedule-summary"><div class="doctor-overline">BÁC SĨ PHỤ TRÁCH</div><h2>BS. Nguyễn Văn An</h2><p>Bác sĩ phụ trách · CareFlow Clinic</p><div class="doctor-divider"></div><div class="doctor-sum"><span>Tổng lượt theo lịch</span><strong>${yours(x).length}</strong></div><div class="doctor-sum"><span>Đang khám</span><strong>${yours(x).filter(a=>a.status==='in-consult').length}</strong></div><div class="doctor-sum"><span>Đã hoàn tất</span><strong>${yours(x).filter(a=>a.status==='completed').length}</strong></div></section><section class="doctor-surface doctor-next-visit"><div class="doctor-overline">LƯỢT KHÁM TIẾP THEO</div>${(()=>{const a=yours(x).find(a=>['ready','arrived','confirmed'].includes(a.status));return a?`<div class="doctor-next-patient">${x.avatar(x.person(a.personId))}<div><strong>${x.e(x.person(a.personId).name)}</strong><span>${x.e(a.time)} · ${x.e(a.mode)}</span></div></div><div class="doctor-next-action">${stepLabel(x,a)}${actionFor(a,x)}</div>`:'<p class="doctor-next-none">Không có lượt đang chờ tiếp nhận.</p>'})()}</section><section class="doctor-tip"><span>${x.icon('info',20)}</span><p>Lịch được cập nhật theo các lượt đã tiếp nhận. Việc xác nhận và điều chỉnh lịch thuộc bộ phận tiếp đón.</p></section></aside>
      </div></section>`;
  }
  function queue(x){
    const f=x.ui.docQueueFilter||'all';
    const visits=yours(x), display=visits.filter(a=>f==='all'||(f==='ready'?['ready','arrived','confirmed'].includes(a.status):f==='in-consult'?a.status==='in-consult':a.status==='completed'));
    return `<section class="screen doctor-screen">${intro('DANH SÁCH KHÁM / HÔM NAY','Danh sách khám','Theo dõi bệnh nhân đang chờ, trong buổi khám và những lượt đã hoàn tất.') }
      <section class="doctor-surface"><div class="doctor-section-head"><div><span class="doctor-overline">LƯỢT KHÁM</span><h2>Lượt khám hôm nay</h2><p>Chọn bệnh nhân để tiếp tục bước phù hợp</p></div><div class="doctor-filter" role="group" aria-label="Lọc danh sách khám">${[['all','Tất cả'],['ready','Sẵn sàng'],['in-consult','Đang khám'],['completed','Hoàn tất']].map(([value,t])=>`<button data-action="doc-filter-queue" data-value="${value}" aria-pressed="${f===value}" class="${f===value?'selected':''}">${t}</button>`).join('')}</div></div><div class="doctor-today-list">${display.length?display.map(a=>row(x,a)).join(''):`<div class="doctor-empty">${x.icon('users',28)}<strong>Chưa có lượt phù hợp</strong><p>Thử bộ lọc khác để tiếp tục.</p></div>`}</div></section></section>`;
  }
  function patients(x){
    const search=(x.ui.docSearch||'').toLocaleLowerCase('vi');
    const ids=new Set(yours(x).map(a=>a.personId));
    const people=x.people.filter(p=>ids.has(p.id)&&(p.name.toLocaleLowerCase('vi').includes(search)||p.code.toLowerCase().includes(search)));
    return `<section class="screen doctor-screen">${intro('HỒ SƠ / BỆNH NHÂN','Hồ sơ bệnh nhân','Danh sách bệnh nhân trong lịch của bác sĩ. Truy cập lịch sử và các kết quả liên quan.')}
      <section class="doctor-surface"><div class="doctor-section-head"><div><span class="doctor-overline">BỆNH NHÂN THEO LỊCH</span><h2>${people.length} hồ sơ được hiển thị</h2></div><label class="doctor-search">${x.icon('search',18)}<input id="doctor-search" data-search="doctor-patients" placeholder="Tìm bệnh nhân, mã hồ sơ…" value="${x.e(x.ui.docSearch||'')}" aria-label="Tìm bệnh nhân"></label></div>
      <div class="doctor-directory">${people.length?people.map(p=>{const a=yours(x).find(a=>a.personId===p.id);return `<article class="doctor-directory-row">${x.avatar(p,'large')}<div><strong>${x.e(p.name)}</strong><span>${x.e(p.code)} · ${p.age} tuổi · ${x.e(p.gender)}</span></div><div class="doctor-directory-status">${stepLabel(x,a)}</div><button class="doctor-directory-open" data-action="open-patient" data-id="${x.e(p.id)}" aria-label="Mở hồ sơ ${x.e(p.name)}">${x.icon('arrow',19)}</button></article>`}).join(''):`<div class="doctor-empty">Không tìm thấy bệnh nhân phù hợp.</div>`}</div></section></section>`;
  }
  function resultsPage(x){
    const all=results(x),filter=x.ui.docResultFilter||'all',list=all.filter(r=>filter==='all'||r.status===filter);
    let selected=all.find(r=>r.id===x.ui.resultSelected)||all[0];if(!selected){return `<section class="screen doctor-screen">${intro('KẾT QUẢ / CẬN LÂM SÀNG','Kết quả cận lâm sàng','Chưa có kết quả để xem.')}</section>`}
    return `<section class="screen doctor-screen">${intro('KẾT QUẢ / CẬN LÂM SÀNG','Kết quả cận lâm sàng','Theo dõi trạng thái, xem thông tin tài liệu và ghi nhận đã xem — không tự công bố kết quả.')}
     <div class="doctor-results-grid"><section class="doctor-surface"><div class="doctor-section-head"><div><span class="doctor-overline">PHIẾU KẾT QUẢ</span><h2>Danh sách kết quả</h2></div><div class="doctor-filter" role="group" aria-label="Trạng thái kết quả">${[['all','Tất cả'],['ready','Cần xem'],['reviewed','Đã xem']].map(([v,t])=>`<button data-action="doc-result-filter" data-value="${v}" aria-pressed="${filter===v}" class="${filter===v?'selected':''}">${t}</button>`).join('')}</div></div>
      <div class="doctor-lab-list">${list.length?list.map(r=>`<button class="doctor-lab-row ${r.id===selected.id?'selected':''}" data-action="select-result" data-id="${x.e(r.id)}">${iconRound(x,'beaker')}<span><strong>${x.e(r.title)}</strong><small>${x.e(x.person(r.personId).name)} · ${x.e(r.date)}</small></span>${x.resultPill(r)}${x.icon('chevron',16)}</button>`).join(''):`<div class="doctor-empty">Không có kết quả phù hợp.</div>`}</div></section>
      <section class="doctor-surface doctor-result-preview"><div class="doctor-overline">THÔNG TIN KẾT QUẢ</div><div class="doctor-result-banner">${iconRound(x,'file')}${x.resultPill(selected)}</div><h2>${x.e(selected.title)}</h2><p>${x.e(selected.type)} · ${x.e(selected.code)}</p><div class="doctor-divider"></div>
      ${[['Bệnh nhân',x.person(selected.personId).name],['Ngày ghi nhận',selected.date],['Bác sĩ phụ trách',selected.doctor],['Trạng thái',({ready:'Chờ bác sĩ xem',waiting:'Chờ thực hiện',reviewed:'Bác sĩ đã xem'})[selected.status]||selected.status]].map(([k,v])=>`<div class="doctor-result-datum"><span>${k}</span><strong>${x.e(v)}</strong></div>`).join('')}
      <div class="doctor-tip">${x.icon('info',17)}<span>Trạng thái đã xem là ghi nhận nội bộ, không đồng nghĩa đã trả kết quả cho người bệnh.</span></div>
      ${x.btn(selected.status==='ready'?`${x.icon('check',17)} Đánh dấu đã xem`:selected.status==='reviewed'?'Đã xem kết quả':'Chờ thực hiện','review-result','btn-primary doctor-result-action',`data-id="${x.e(selected.id)}" ${selected.status==='ready'?'':'disabled'}`)}
      ${x.btn('Mở hồ sơ bệnh nhân','open-patient','btn-soft doctor-result-action',`data-id="${x.e(selected.personId)}"`)}
      </section></div></section>`;
  }
  function followups(x){
    x.data.doctorTasks??=[{id:'t01',title:'Xem kết quả xét nghiệm đang chờ',desc:'Kiểm tra thông tin trước khi quyết định bước tiếp theo',route:'/results',done:false},{id:'t02',title:'Rà soát hồ sơ tái khám',desc:'Chuẩn bị thông tin cho các lượt khám tiếp theo',route:'/patients',done:false},{id:'t03',title:'Đối chiếu ghi nhận cuối buổi',desc:'Kiểm tra bản nháp và trạng thái hoàn tất',route:'/clinical/review',done:false}];
    const tasks=x.data.doctorTasks;
    return `<section class="screen doctor-screen">${intro('CÔNG VIỆC / THEO DÕI','Theo dõi sau khám','Một danh sách công việc nội bộ, không thay thế trao đổi chuyên môn hoặc liên hệ bệnh nhân.')}
    <div class="doctor-followups-grid"><section class="doctor-surface"><div class="doctor-section-head"><div><span class="doctor-overline">CÔNG VIỆC CỦA BÁC SĨ</span><h2>Việc cần theo dõi</h2><p>${tasks.filter(t=>!t.done).length} việc chưa đánh dấu hoàn tất</p></div>${x.pill(tasks.filter(t=>!t.done).length+' việc chưa xử lý','info')}</div>
    <div class="doctor-task-list">${tasks.map((t,i)=>`<article class="doctor-task ${t.done?'is-done':''}"><span class="doctor-task-count">0${i+1}</span><div><strong>${x.e(t.title)}</strong><span>${x.e(t.desc)}</span></div>${x.pill(t.done?'Đã xử lý':'Cần xem',t.done?'success':'warning')}<div class="doctor-task-actions">${x.btn('Mở nội dung','go','btn-soft',`data-to="${x.e(t.route)}"`)}${x.btn(t.done?'Mở lại':'Đánh dấu đã xử lý','doc-task-toggle','btn-outline',`data-id="${x.e(t.id)}"`)}</div></article>`).join('')}</div></section><aside class="doctor-followups-side"><section class="doctor-surface doctor-followups-summary"><div class="doctor-overline">TÌNH TRẠNG CẦN THEO DÕI</div><div class="doctor-followups-mini"><span>Kết quả chưa xem</span><strong>${results(x).filter(r=>r.status==='ready').length.toString().padStart(2,'0')}</strong></div><div class="doctor-followups-mini"><span>Công việc chưa xử lý</span><strong>${tasks.filter(t=>!t.done).length.toString().padStart(2,'0')}</strong></div><div class="doctor-divider"></div>${x.btn('Mở kết quả cận lâm sàng','go','btn-soft','data-to="/results"')}</section></aside></div></section>`;
  }
  function visit(path,x){
    const id=path.split('/')[2],a=x.data.appointments.find(v=>v.id===id&&v.doctor.includes('Nguyễn Văn An'));
    if(!a)return `<section class="screen doctor-screen">${intro('CHI TIẾT / LƯỢT KHÁM','Không tìm thấy lượt khám','Chỉ hiển thị các lượt khám thuộc lịch của bác sĩ.')}${x.btn('Về lịch của tôi','go','btn-primary','data-to="/doctor/schedule"')}</section>`;
    const p=x.person(a.personId);
    return `<section class="screen doctor-screen">
     ${intro('CHI TIẾT / LƯỢT KHÁM','Thông tin lượt khám','Xem chi tiết đã được điều phối. Thao tác đổi/hủy và xác nhận lịch không thuộc vai trò bác sĩ.',x.btn('Về danh sách khám','go','btn-soft','data-to="/doctor/queue"'))}
     <div class="doctor-results-grid"><section class="doctor-surface doctor-result-preview"><div class="doctor-result-banner">${x.avatar(p,'large')}${stepLabel(x,a)}</div><h2>${x.e(p.name)}</h2><p>${x.e(p.code)} · ${p.age} tuổi · ${x.e(p.gender)}</p><div class="doctor-divider"></div>
     ${[['Mã phiếu',a.code],['Giờ khám',a.time+' · '+a.date],['Hình thức',a.mode],['Lý do khám',a.reason],['Bác sĩ',a.doctor],['Trạng thái',a.status]].map(([k,v])=>`<div class="doctor-result-datum"><span>${k}</span><strong>${x.e(v)}</strong></div>`).join('')}
     <div class="doctor-tip">${x.icon('info',17)}<span>Thông tin lịch hẹn chỉ được xem tại đây; thao tác đổi hoặc hủy lịch thuộc bộ phận tiếp đón.</span></div>
     ${actionFor(a,x)}</section><section class="doctor-surface doctor-result-preview"><div class="doctor-overline">HỒ SƠ LIÊN QUAN</div><h2>Hồ sơ & kết quả</h2><p>Liên kết tới các thông tin liên quan của lượt khám</p><div class="doctor-divider"></div>
     ${x.btn('Xem hồ sơ bệnh nhân','open-patient','btn-soft doctor-result-action',`data-id="${x.e(p.id)}"`)}
     ${x.btn('Danh sách kết quả','go','btn-soft doctor-result-action','data-to="/results"')}
     ${x.btn('Lịch của tôi','go','btn-soft doctor-result-action','data-to="/doctor/schedule"')}
     </section></div></section>`;
  }
  function page(path,x){
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
    const name=node.dataset.action;
    if(name==='doc-day'){x.ui.docDay=Number(node.dataset.value);x.render();return true}
    if(name==='doc-today'){x.ui.docDay=3;x.ui.dayOffset=0;x.render();return true}
    if(name==='doc-filter-queue'){x.ui.docQueueFilter=node.dataset.value;x.render();return true}
    if(name==='doc-result-filter'){x.ui.docResultFilter=node.dataset.value;x.render();return true}
    if(name==='doc-task-toggle'){const task=x.data.doctorTasks?.find(t=>t.id===node.dataset.id);if(task){task.done=!task.done;x.save();x.notify(task.done?'Đã đánh dấu công việc đã xử lý.':'Đã đưa công việc về trạng thái cần xử lý.')}return true}
    return false;
  }
  root.CareFlowDoctor={page,action,permitted,texts};
})(window);
