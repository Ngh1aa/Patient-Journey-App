/* CareFlow patient journey demos — synthetic-only role-safe clinician views. */
(function installClinicalJourneys(root){
  'use strict';
  const doctor='Nguyễn Văn An';
  const isDoctor=a=>a?.doctor?.includes(doctor);
  const tasks=x=>x.data.doctorTasks||[];
  const P=(x,id)=>x.person(id);
  const taskState=t=>t.done?'Đã xử lý':'Chưa xử lý';
  const options=[
    {value:'follow',label:'Theo dõi triệu chứng',owner:'Bác sĩ',next:'Theo dõi đáp ứng và tái đánh giá khi cần',route:'/doctor/followups'},
    {value:'explain',label:'Hẹn giải thích kết quả',owner:'Điều phối',next:'Liên hệ đề xuất lịch trao đổi kết quả',route:'/doctor/followups'},
    {value:'more',label:'Xem xét chỉ định bổ sung',owner:'Bác sĩ',next:'Xem xét chỉ định cận lâm sàng tiếp theo',route:'/clinical/orders'},
    {value:'notify',label:'Bàn giao thông báo',owner:'Điều phối',next:'Điều phối liên hệ thông tin kết quả',route:'/doctor/followups'}
  ];
  function status(x,a){return x.pill({'review':'Cần xem xét','ready':'Sẵn sàng khám','in-consult':'Đang khám','unreachable':'Chưa liên hệ được','completed':'Hoàn tất hồ sơ'}[a.status]||a.status,a.status==='review'?'warning':a.status==='ready'?'success':a.status==='unreachable'?'danger':'info')}
  function reviewable(x){return x.data.appointments.filter(a=>isDoctor(a)&&a.status==='review'&&a.owner==='Bác sĩ')}
  function handoffs(x){return x.data.appointments.filter(a=>isDoctor(a)&&a.status==='review'&&a.owner==='Điều phối')}
  function online(x){return x.data.appointments.filter(a=>isDoctor(a)&&a.mode.toLowerCase().includes('online'))}
  function patientRow(x,a,href,copy){const p=P(x,a.personId);return `<div class="journey-person-row">${x.avatar(p)}<div class="journey-person-main"><strong>${x.e(p.name)}</strong><span>${x.e(a.code)} · ${x.e(a.time)} · ${x.e(a.mode)}</span></div>${status(x,a)}<a href="#${href}" class="journey-circle-link" aria-label="${x.e(copy)}: ${x.e(p.name)}" title="${x.e(copy)}">${x.icon('arrow',18)}</a></div>`}
  function summary(x){
    const pending=reviewable(x),pendingHandoffs=handoffs(x),items=tasks(x).filter(t=>!t.done),onlineCases=online(x);
    return `<div class="doctor-journey-summary" aria-label="Ưu tiên công việc bác sĩ">
      <section class="doctor-surface doctor-decision-card"><div class="doctor-section-head"><div><span class="doctor-overline">CẦN QUYẾT ĐỊNH</span><h2>Yêu cầu xem xét trước khám</h2><p>Bác sĩ rà soát rồi bàn giao điều phối, không xác nhận lịch thay lễ tân.</p></div>${x.pill(pending.length+' cần xử lý',pending.length?'warning':'success')}</div>
      <div class="journey-card-body">${pending.length?pending.map(a=>patientRow(x,a,`/doctor/review/${x.e(a.id)}`,'Xem xét yêu cầu')).join(''):`<p class="journey-empty">Không có yêu cầu chờ bác sĩ. ${pendingHandoffs.length} yêu cầu đã bàn giao điều phối.</p>`}</div><div class="journey-card-footer"><span>${pendingHandoffs.length} yêu cầu chờ điều phối</span>${pending.length?'Hành động tiếp theo: xem xét':'Đã rà soát hết'}</div></section>
      <section class="doctor-surface doctor-online-card"><div class="doctor-section-head"><div><span class="doctor-overline">KHÁM TRỰC TUYẾN</span><h2>Kết nối & bàn giao</h2><p>Chuẩn bị buổi khám hoặc điều phối khi không liên hệ được.</p></div>${x.pill(onlineCases.length+' lượt','info')}</div>
      <div class="journey-card-body">${onlineCases.slice(0,2).map(a=>patientRow(x,a,`/doctor/online/${x.e(a.id)}`,'Xem tình trạng kết nối')).join('')||'<p class="journey-empty">Không có lịch khám trực tuyến.</p>'}</div><div class="journey-card-footer"><span>Phân công: bác sĩ / điều phối</span><a href="#/doctor/followups">Công việc liên quan ${x.icon('arrow',16)}</a></div></section>
      <section class="doctor-surface doctor-aftercare-card"><div class="doctor-section-head"><div><span class="doctor-overline">SAU KHÁM</span><h2>Tiếp tục chăm sóc</h2><p>Việc cần phản hồi, người phụ trách và bước tiếp theo.</p></div>${x.pill(items.length+' việc','info')}</div>
      <div class="journey-card-body">${items.slice(0,2).map(t=>`<div class="journey-task-mini"><strong>${x.e(t.title)}</strong><span>${x.e(P(x,t.personId).name)} · ${x.e(t.owner)} · Hạn ${x.e(t.due)}</span></div>`).join('')||'<p class="journey-empty">Không có công việc cần xử lý.</p>'}</div><div class="journey-card-footer"><span>Trạng thái được cập nhật sau khi bàn giao</span><a href="#/doctor/followups">Mở theo dõi ${x.icon('arrow',16)}</a></div></section>
    </div>`;
  }
  function triage(path,x){
    const a=x.data.appointments.find(v=>v.id===path.split('/').pop()&&isDoctor(v)&&v.status==='review');
    if(!a)return `<section class="screen doctor-screen"><h1>Không có yêu cầu cần xem xét</h1><a href="#/doctor">Trở về dashboard</a></section>`;
    const p=P(x,a.personId),entry=x.data.doctorReviews?.[a.id],done=a.owner==='Điều phối';
    return `<section class="screen doctor-screen doctor-journey-page"><div class="doctor-kicker">TRƯỚC KHÁM / CẦN XEM XÉT</div><div class="doctor-heading"><div class="doctor-heading-grid"><div><h1>Xem xét yêu cầu khám</h1><p>Rà soát thông tin và gửi đề xuất đến bộ phận điều phối. Không thay thế sàng lọc cấp cứu.</p></div></div></div>
    <div class="journey-page-grid"><section class="doctor-surface journey-panel"><div class="doctor-overline">HỒ SƠ YÊU CẦU</div><h2>${x.e(p.name)}</h2><div class="journey-facts"><div><span>Mã phiếu</span><strong>${x.e(a.code)}</strong></div><div><span>Lý do khám</span><strong>${x.e(a.reason)}</strong></div><div><span>Hình thức hiện tại</span><strong>${x.e(a.mode)}</strong></div><div><span>Đang giữ việc</span><strong>${x.e(a.owner)}</strong></div></div>${status(x,a)}
      <div class="journey-warning"><strong>Lưu ý sàng lọc</strong><p>Thông tin ban đầu chưa đủ để loại trừ nguy cơ. Trường hợp nghi ngờ cấp cứu cần thực hiện theo quy trình chuyên môn của cơ sở.</p></div><a class="journey-text-link" href="#/patients/${x.e(p.id)}">Mở hồ sơ người bệnh ${x.icon('arrow',16)}</a></section>
    <section class="doctor-surface journey-panel"><div class="doctor-overline">QUYẾT ĐỊNH / BÀN GIAO</div><h2>${done?'Đã gửi đề xuất':'Ghi nhận đề xuất cho điều phối'}</h2>${done?`<div class="journey-confirm"><strong>Đang chờ điều phối</strong><p>${x.e(entry?.decision||'Đã ghi nhận yêu cầu xem xét.')}</p><span>Người phụ trách: Điều phối · Chưa xác nhận lịch</span></div>`:`<label class="journey-field">Hướng xử lý đề xuất<select id="journey-triage-decision"><option value="">Chọn hướng xử lý</option><option value="Yêu cầu bổ sung thông tin">Yêu cầu bổ sung thông tin</option><option value="Đề nghị điều phối khám trực tiếp">Đề nghị điều phối khám trực tiếp</option><option value="Đề nghị điều phối khám trực tuyến">Đề nghị điều phối khám trực tuyến</option></select></label><label class="journey-field">Ghi chú bàn giao<textarea id="journey-triage-note" rows="4" maxlength="400" placeholder="Nội dung cần điều phối xác minh..."></textarea></label>${x.btn('Bàn giao cho điều phối','doc-triage-handoff','btn-primary',`data-id="${x.e(a.id)}"`)}`}<p class="journey-footnote">Đề xuất không tự thay đổi hình thức khám, xác nhận lịch hoặc gửi thông báo cho người bệnh.</p></section></div></section>`;
  }
  function onlinePage(path,x){
    const a=x.data.appointments.find(v=>v.id===path.split('/').pop()&&isDoctor(v)&&v.mode.toLowerCase().includes('online'));
    if(!a)return `<section class="screen doctor-screen"><h1>Không có lịch trực tuyến phù hợp</h1><a href="#/doctor">Trở về dashboard</a></section>`;
    const p=P(x,a.personId),d=x.data.onlineVisits?.[a.id]||{},connected=d.connection==='connected',handoff=d.connection==='handoff';
    return `<section class="screen doctor-screen doctor-journey-page"><div class="doctor-kicker">KHÁM TRỰC TUYẾN / KẾT NỐI</div><div class="doctor-heading"><div class="doctor-heading-grid"><div><h1>Chuẩn bị buổi khám trực tuyến</h1><p>Ghi nhận trạng thái kết nối; chuyển điều phối khi cần liên hệ lại hoặc đổi hình thức.</p></div></div></div>
      <div class="journey-page-grid"><section class="doctor-surface journey-panel"><div class="doctor-overline">THÔNG TIN BUỔI KHÁM</div><h2>${x.e(p.name)}</h2><div class="journey-facts"><div><span>Giờ hẹn</span><strong>${x.e(a.time)} · ${x.e(a.date)}</strong></div><div><span>Trạng thái lượt khám</span><strong>${x.e(a.status==='ready'?'Sẵn sàng kết nối':a.status==='unreachable'?'Chưa liên hệ được':a.status)}</strong></div><div><span>Phụ trách</span><strong>${x.e(a.owner)}</strong></div><div><span>Kết nối</span><strong>${connected?'Đã xác nhận kết nối':handoff?'Đã bàn giao':'Chưa kết nối'}</strong></div></div><a class="journey-text-link" href="#/patients/${x.e(p.id)}">Xem hồ sơ người bệnh ${x.icon('arrow',16)}</a></section>
      <section class="doctor-surface journey-panel"><div class="doctor-overline">BƯỚC TIẾP THEO</div><h2>${connected?'Sẵn sàng bắt đầu khám':handoff?'Đang chờ điều phối':'Xử lý kết nối'}</h2>
      ${connected?`<p class="journey-confirm">Đã mô phỏng kết nối thành công. Chưa thực hiện cuộc gọi thật.</p>${x.btn('Bắt đầu khám trực tuyến','start-consult','btn-primary',`data-id="${x.e(a.id)}"`)}`:handoff?`<p class="journey-confirm">Đã bàn giao cho Điều phối: ${x.e(d.choice)}. Chưa đổi lịch hoặc gửi thông báo thật.</p><a href="#/doctor/followups" class="journey-text-link">Xem công việc theo dõi ${x.icon('arrow',16)}</a>`:`${a.status==='ready'?x.btn('Mô phỏng đã kết nối','doc-online-connect','btn-primary',`data-id="${x.e(a.id)}"`):''}<label class="journey-field">Trường hợp không thể kết nối<select id="journey-online-choice"><option value="Gọi lại và hỗ trợ kết nối">Gọi lại và hỗ trợ kết nối</option><option value="Đề nghị hẹn trực tuyến lần khác">Đề nghị hẹn trực tuyến lần khác</option><option value="Đề nghị chuyển khám trực tiếp">Đề nghị chuyển khám trực tiếp</option></select></label>${x.btn('Bàn giao xử lý kết nối','doc-online-handoff','btn-soft',`data-id="${x.e(a.id)}"`)}`}<p class="journey-footnote">Mô phỏng trạng thái giao tiếp, không tạo cuộc gọi video hoặc đổi lịch thực tế.</p></section></div></section>`;
  }
  function followups(x){
    const active=tasks(x).filter(t=>!t.done);
    return `<section class="screen doctor-screen">${`<div class="doctor-heading"><div class="doctor-kicker">SAU KHÁM / BÀN GIAO</div><div class="doctor-heading-grid"><div><h1>Theo dõi sau khám</h1><p>Thông tin người bệnh, người phụ trách, thời hạn và bước cần thực hiện.</p></div></div></div>`}
    <div class="doctor-followups-grid"><section class="doctor-surface"><div class="doctor-section-head"><div><span class="doctor-overline">CÔNG VIỆC THEO HỒ SƠ</span><h2>${active.length} việc đang chờ xử lý</h2></div>${x.pill(active.length+' chưa xong','info')}</div>
    <div class="journey-task-list">${tasks(x).map(t=>`<article class="journey-task-entry ${t.done?'is-done':''}"><div class="journey-task-meta"><span>${x.e(t.category||'Theo dõi')}</span>${x.pill(taskState(t),t.done?'success':'warning')}</div><h3>${x.e(t.title)}</h3><p>${x.e(t.desc)}</p><dl><div><dt>Người bệnh</dt><dd>${x.e(P(x,t.personId).name)}</dd></div><div><dt>Người phụ trách</dt><dd>${x.e(t.owner)}</dd></div><div><dt>Hạn xử lý</dt><dd>${x.e(t.due)}</dd></div><div><dt>Bước tiếp theo</dt><dd>${x.e(t.next)}</dd></div></dl><div class="journey-task-actions"><a class="journey-text-link" href="#${x.e(t.route)}">Xem nội dung ${x.icon('arrow',16)}</a>${t.owner==='Bác sĩ'?x.btn(t.done?'Mở lại':'Đánh dấu đã xử lý','doc-task-toggle','btn-soft',`data-id="${x.e(t.id)}"`):`<span class="journey-assignee">Đang chờ ${x.e(t.owner)}</span>`}</div></article>`).join('')}</div></section>
    <aside class="doctor-followups-side"><section class="doctor-surface doctor-followups-summary"><div class="doctor-overline">PHÂN CÔNG THEO DÕI</div><div class="doctor-followups-mini"><span>Bác sĩ phụ trách</span><strong>${active.filter(t=>t.owner==='Bác sĩ').length}</strong></div><div class="doctor-followups-mini"><span>Đã bàn giao điều phối</span><strong>${active.filter(t=>t.owner!=='Bác sĩ').length}</strong></div><div class="doctor-divider"></div><a href="#/results" class="journey-text-link">Kết quả cận lâm sàng ${x.icon('arrow',16)}</a></section></aside></div></section>`;
  }
  function afterResult(r,x){
    const related=x.data.appointments.find(a=>a.personId===r.personId&&isDoctor(a)&&a.status==='in-consult');
    const saved=x.data.resultNexts?.[r.id], can=r.status==='reviewed';
    return `<div class="journey-result-next"><div class="doctor-overline">SAU KHI BÁC SĨ XEM KẾT QUẢ</div><h3>Bước xử lý tiếp theo</h3>${saved?`<p class="journey-confirm">Đã bàn giao: ${x.e(saved.label)} · ${x.e(saved.owner)}</p>`:`<label class="journey-field">Chọn bước tiếp theo<select id="journey-result-choice" ${can?'':'disabled'}>${options.map(t=>`<option value="${t.value}">${x.e(t.label)}</option>`).join('')}</select></label>${x.btn('Ghi nhận bước tiếp theo','doc-result-next','btn-soft',`data-id="${x.e(r.id)}" ${can?'':'disabled'}`)}`}<small>${can?'Chỉ lưu công việc nội bộ, không gửi thông báo thật.':'Cần đánh dấu đã xem trước khi chọn bước tiếp theo.'}</small>${related?`<a class="journey-text-link" href="#/encounters/${x.e(related.id)}">Trở về buổi khám ${x.icon('arrow',16)}</a>`:''}</div>`;
  }
  function addTask(x,t){x.data.doctorTasks??=[];const existing=x.data.doctorTasks.find(p=>p.id===t.id);if(existing)Object.assign(existing,t);else x.data.doctorTasks.unshift(t)}
  function action(node,x){
    const name=node.dataset.action,id=node.dataset.id;
    if(name==='doc-triage-handoff'){
      const a=x.data.appointments.find(a=>a.id===id&&isDoctor(a)&&a.status==='review'&&a.owner==='Bác sĩ');
      const choice=document.getElementById('journey-triage-decision')?.value,note=document.getElementById('journey-triage-note')?.value.trim();
      if(!a)return true;
      if(!choice||!note){x.notify('Vui lòng chọn hướng xử lý và nhập ghi chú bàn giao.');return true}
      x.data.doctorReviews??={};x.data.doctorReviews[id]={decision:choice,note,at:'15/10/2026'};
      a.owner='Điều phối';addTask(x,{id:'review-'+id,title:'Tiếp nhận đề xuất trước khám',desc:note,category:'Trước khám',personId:a.personId,owner:'Điều phối',due:'15/10/2026',next:choice,route:'/doctor/review/'+id,done:false});
      x.save();x.go('/doctor/review/'+id);x.notify('Đã chuyển yêu cầu cho bộ phận điều phối.');return true;
    }
    if(name==='doc-online-connect'){
      const a=x.data.appointments.find(a=>a.id===id&&isDoctor(a)&&a.status==='ready'&&a.mode.toLowerCase().includes('online'));
      if(!a){x.notify('Chưa đủ điều kiện chuẩn bị phiên trực tuyến.');return true}
      x.data.onlineVisits??={};x.data.onlineVisits[id]={connection:'connected'};
      x.save();x.render();return true;
    }
    if(name==='doc-online-handoff'){
      const a=x.data.appointments.find(a=>a.id===id&&isDoctor(a)&&a.mode.toLowerCase().includes('online'));
      if(!a||a.status==='completed')return true;
      const choice=document.getElementById('journey-online-choice')?.value||'Gọi lại và hỗ trợ kết nối';
      a.status='unreachable';a.owner='Điều phối';x.data.onlineVisits??={};x.data.onlineVisits[id]={connection:'handoff',choice};
      addTask(x,{id:(id==='a-041'?'case-a-041':'online-'+id),title:'Hỗ trợ lịch khám trực tuyến',desc:'Không thể kết nối theo lịch; chờ điều phối xác nhận phương án.',category:'Kết nối',personId:a.personId,owner:'Điều phối',due:'15/10/2026',next:choice,route:'/doctor/online/'+id,done:false});
      x.save();x.render();x.notify('Đã bàn giao xử lý kết nối cho điều phối.');return true;
    }
    if(name==='doc-result-next'){
      const r=x.data.results.find(r=>r.id===id&&r.status==='reviewed'&&r.doctor.includes(doctor));
      if(!r){x.notify('Cần bác sĩ xem kết quả trước khi ghi nhận bước tiếp theo.');return true}
      const choice=document.getElementById('journey-result-choice')?.value||'follow';
      const opt=options.find(o=>o.value===choice)||options[0];
      x.data.resultNexts??={};x.data.resultNexts[id]={choice,label:opt.label,owner:opt.owner};
      addTask(x,{id:'result-'+id,sourceResult:id,title:opt.label,desc:'Kết quả '+r.title+' · '+r.code,category:'Sau cận lâm sàng',personId:r.personId,owner:opt.owner,due:'16/10/2026',next:opt.next,route:opt.route,done:false});
      x.save();x.render();x.notify('Đã ghi nhận và phân công bước xử lý kết quả.');return true;
    }
    return false;
  }
  function page(path,x){if(path.startsWith('/doctor/review/'))return triage(path,x);if(path.startsWith('/doctor/online/'))return onlinePage(path,x);return null}
  root.CareFlowJourneys={summary,followups,afterResult,page,action};
})(window);
