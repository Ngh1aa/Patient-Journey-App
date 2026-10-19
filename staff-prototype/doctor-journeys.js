/* CareFlow patient journey demos — synthetic-only role-safe clinician views. */
(function installClinicalJourneys(root){
  'use strict';
  const UI=root.CareFlowUI, COPY=root.CareFlowCopy, A=COPY.ui;
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
  function status(x,a){return x.statePill(a)}
  function reviewable(x){return x.data.appointments.filter(a=>isDoctor(a)&&a.status==='review'&&a.owner==='Bác sĩ')}
  function handoffs(x){return x.data.appointments.filter(a=>isDoctor(a)&&a.status==='review'&&a.owner==='Điều phối')}
  function online(x){return x.data.appointments.filter(a=>isDoctor(a)&&a.mode.toLowerCase().includes('online'))}
  function summary(x,section='all',view){
    // The dashboard composes existing journey data, destinations and guarded actions.
    if(!view)return '';
    const {state,filterButtons,selectFilter,cardHeading,emptyCard}=view;
    if(section==='decision'){
      const mine=reviewable(x),delegated=handoffs(x),filter=state.decision||'mine';
      const list=filter==='mine'?mine:filter==='handoff'?delegated:[...mine,...delegated];
      return `<section class="doctor-surface doctor-decision-card" ${UI.cardAttrs('surface')} data-priority="decisions" aria-labelledby="doctor-decision-title">
        ${cardHeading(x,'02 / CẦN QUYẾT ĐỊNH','Yêu cầu trước khám','Rà soát yêu cầu và gửi đề xuất cho điều phối.',mine.length,'doctor-decision-title')}
        ${filterButtons(x,'decision',[['mine','Chờ bác sĩ',mine.length],['handoff','Đã bàn giao',delegated.length],['all','Tất cả',mine.length+delegated.length]],'Lọc yêu cầu trước khám')}
        <div class="doctor-card-list">${list.map(a=>{const p=P(x,a.personId),entry=x.data.doctorReviews?.[a.id],isHandoff=a.owner==='Điều phối';return `<article class="doctor-decision-item" data-decision-id="${x.e(a.id)}"><div class="doctor-item-identity">${x.avatar(p)}<div><h3>${x.e(p.name)}</h3><p>${x.e(p.code)} · ${x.e(a.code)}</p></div></div>
          ${UI.facts([['Giờ hẹn',a.time+' · '+a.date],['Hình thức',UI.modeText(a.mode)],['Lý do khám',a.reason||'Chưa ghi nhận'],['Phụ trách',a.owner]],x.e,'doctor-decision-facts')}
          <div class="doctor-decision-note"><strong>${isHandoff?'Đề xuất đã bàn giao':'Thông tin cần rà soát'}</strong><p>${x.e(isHandoff?(entry?.decision||'Đang chờ điều phối tiếp nhận'):(a.history||'Chưa chốt hình thức khám.'))}</p>${isHandoff&&entry?.note?`<p>${x.e(entry.note)}</p>`:''}</div>
          <div class="doctor-item-bottom">${status(x,a)}${x.btn(isHandoff?'Xem bàn giao':A.reviewRequest,'go','btn-secondary',`data-to="/doctor/review/${x.e(a.id)}"`)}</div></article>`}).join('')||emptyCard(x,filter==='handoff'?'Chưa có yêu cầu đã bàn giao':'Không có yêu cầu chờ bác sĩ','Có thể chuyển nhóm để xem các yêu cầu khác.')}</div>
        <footer class="doctor-card-footnote">Điều phối tiếp nhận đề xuất; lịch khám chưa được tự động xác nhận.</footer></section>`;
    }
    if(section==='online'){
      const all=online(x).sort((a,b)=>a.time.localeCompare(b.time));
      const needsSupport=a=>a.status==='unreachable'||x.data.onlineVisits?.[a.id]?.connection==='handoff';
      const prepare=a=>a.status==='ready'&&!needsSupport(a);
      const filter=state.online||'all',list=all.filter(a=>filter==='all'||(filter==='prepare'?prepare(a):needsSupport(a)));
      return `<section class="doctor-surface doctor-online-card" ${UI.cardAttrs('surface')} aria-labelledby="doctor-online-title">${cardHeading(x,'PHIÊN TRỰC TUYẾN','Kết nối buổi khám','Kiểm tra kết nối trước khi bắt đầu khám.',all.length,'doctor-online-title')}
        ${filterButtons(x,'online',[['all','Tất cả',all.length],['prepare','Chuẩn bị',all.filter(prepare).length],['support','Cần hỗ trợ',all.filter(needsSupport).length]],'Lọc phiên khám trực tuyến')}
        <div class="doctor-card-list">${list.map(a=>{const p=P(x,a.personId),connection=x.data.onlineVisits?.[a.id],connected=connection?.connection==='connected',support=needsSupport(a),active=a.status==='in-consult',complete=a.status==='completed';return `<article class="doctor-online-item" data-online-id="${x.e(a.id)}"><div class="doctor-online-time"><strong>${x.e(a.time)}</strong><span>Giờ hẹn</span></div><div class="doctor-online-content"><h3>${x.e(p.name)}</h3><p>${x.e(p.code)} · ${x.e(a.code)}</p><p>Ngày ${x.e(a.date)}</p><p>${x.e(a.reason||'Chưa có ghi nhận lý do khám')}</p><div class="doctor-connection"><span class="doctor-connection-dot ${support?'needs-support':connected?'is-connected':''}" aria-hidden="true"></span><strong>${complete?'Buổi khám đã hoàn tất':active?'Buổi khám đang thực hiện':support?'Cần điều phối hỗ trợ':connected?'Đã xác nhận kết nối':'Chưa xác nhận kết nối'}</strong></div><p>Phụ trách: ${x.e(a.owner)}${connection?.choice?' · '+x.e(connection.choice):''}</p><div class="doctor-card-actions">${x.btn(complete?'Xem lại buổi khám':active?A.continueConsult:support?'Xem phương án xử lý':connected?'Bắt đầu khám trực tuyến':'Chuẩn bị kết nối',connected&&prepare(a)?'start-consult':'go','btn-secondary',connected&&prepare(a)?`data-id="${x.e(a.id)}"`:`data-to="${complete||active?'/encounters/':'/doctor/online/'}${x.e(a.id)}"`)}</div></div></article>`}).join('')||emptyCard(x,'Không có phiên phù hợp','Thử nhóm khác để xem lịch khám trực tuyến.')}</div>
        <footer class="doctor-card-footnote">Kết nối được mô phỏng trong prototype; không tạo cuộc gọi thật.</footer></section>`;
    }
    if(section==='aftercare'){
      const all=tasks(x),owner=state.taskOwner||'mine',statusFilter=state.taskStatus||'open';
      const inState=t=>statusFilter==='all'||(statusFilter==='done'?t.done:!t.done);
      const norm=d=>{const [day,month,year]=String(d||'').split('/').map(Number);return year*10000+month*100+day||0};
      const list=all.filter(t=>inState(t)&&(owner==='all'||(owner==='mine'?t.owner==='Bác sĩ':t.owner!=='Bác sĩ'))).sort((a,b)=>norm(a.due)-norm(b.due));
      return `<section class="doctor-surface doctor-aftercare-card" ${UI.cardAttrs('surface')} aria-labelledby="doctor-aftercare-title">${cardHeading(x,'SAU KHÁM / THEO DÕI','Công việc theo hồ sơ','Sắp xếp theo hạn xử lý; mỗi việc có người phụ trách.',all.filter(t=>!t.done).length,'doctor-aftercare-title')}
        <div class="doctor-task-toolbar">${filterButtons(x,'taskOwner',[['mine','Của bác sĩ',all.filter(t=>inState(t)&&t.owner==='Bác sĩ').length],['delegated','Đã giao',all.filter(t=>inState(t)&&t.owner!=='Bác sĩ').length],['all','Tất cả',all.filter(inState).length]],'Lọc người phụ trách công việc')}${selectFilter(x,'taskStatus','Trạng thái công việc',[['open','Chưa xử lý'],['done','Đã xử lý'],['all','Tất cả trạng thái']])}</div>
        <div class="doctor-card-list">${list.map(t=>{const p=P(x,t.personId),result=t.sourceResult&&x.data.results.find(r=>r.id===t.sourceResult&&isDoctor(r));const targetLabel=result?'Xem kết quả':t.route?.startsWith('/patients/')?A.viewPatient:t.route?.startsWith('/doctor/online/')?'Xem phiên trực tuyến':t.route?.startsWith('/doctor/review/')?'Xem bàn giao':t.route==='/clinical/orders'?'Xem chỉ định':'Xem công việc theo dõi';return `<article class="doctor-task-item ${t.done?'is-done':''}" ${UI.cardAttrs('row')} data-task-id="${x.e(t.id)}"><div class="doctor-item-eyebrow"><span>${x.e(t.category||'Theo dõi')}</span>${x.pill(taskState(t),t.done?'success':'neutral')}</div><h3>${x.e(t.title)}</h3><p>${x.e(p.name)} · ${x.e(p.code)}</p>
          ${t.desc&&(!result||result.status!=='reviewed')?`<p>${x.e(t.desc)}</p>`:''}${UI.facts([['Hạn xử lý',t.due||'Chưa có thời hạn'],['Phụ trách',t.owner]],x.e,'doctor-task-facts')}
          <p class="doctor-task-next"><strong>Bước tiếp theo</strong>${x.e(t.next||t.desc||'Mở hồ sơ để rà soát công việc.')}</p><div class="doctor-card-actions">${x.btn(targetLabel,result?'show-result':'go','btn-secondary',result?`data-id="${x.e(result.id)}"`:`data-to="${x.e(t.route||'/doctor/followups')}"`)}${t.owner==='Bác sĩ'?x.btn(t.done?'Mở lại công việc':'Đánh dấu đã xử lý','doc-task-toggle','btn-soft',`data-id="${x.e(t.id)}"`):`<span class="doctor-task-owner-note">Chờ ${x.e(t.owner)} xử lý</span>`}</div></article>`}).join('')||emptyCard(x,'Không có công việc phù hợp','Thử trạng thái hoặc người phụ trách khác.')}</div>
        <footer class="doctor-card-footer"><a href="#/doctor/followups" ${UI.buttonAttrs('text')}>${x.e(A.viewFollowups)} ${x.icon('arrow',16)}</a></footer></section>`;
    }
    return '';
  }

  function triage(path,x){
    const a=x.data.appointments.find(v=>v.id===path.split('/').pop()&&isDoctor(v)&&v.status==='review');
    if(!a)return `<section class="screen doctor-screen"><h1>Không có yêu cầu cần xem xét</h1><a href="#/doctor">Về tổng quan</a></section>`;
    const p=P(x,a.personId),entry=x.data.doctorReviews?.[a.id],done=a.owner==='Điều phối';
    return `<section class="screen doctor-screen doctor-journey-page"><div class="doctor-kicker">TRƯỚC KHÁM / CẦN XEM XÉT</div><div class="doctor-heading"><div class="doctor-heading-grid"><div><h1>Xem xét yêu cầu khám</h1><p>Rà soát thông tin và gửi đề xuất đến bộ phận điều phối. Không thay thế sàng lọc cấp cứu.</p></div></div></div>
    <div class="journey-page-grid"><section class="doctor-surface journey-panel" ${UI.cardAttrs('surface')}><div class="doctor-overline">HỒ SƠ YÊU CẦU</div><h2>${x.e(p.name)}</h2>${UI.facts([['Mã lượt khám',a.code],['Lý do khám',a.reason],['Hình thức',UI.modeText(a.mode)],['Người phụ trách',a.owner]],x.e,'journey-facts')}${status(x,a)}
      <div class="journey-warning"><strong>Lưu ý sàng lọc</strong><p>Thông tin ban đầu chưa đủ để loại trừ nguy cơ. Trường hợp nghi ngờ cấp cứu cần thực hiện theo quy trình chuyên môn của cơ sở.</p></div><a class="journey-text-link" ${UI.buttonAttrs('text')} href="#/patients/${x.e(p.id)}">${x.e(A.viewPatient)} ${x.icon('arrow',16)}</a></section>
    <section class="doctor-surface journey-panel" ${UI.cardAttrs('surface')}><div class="doctor-overline">QUYẾT ĐỊNH / BÀN GIAO</div><h2>${done?'Đã gửi đề xuất':'Ghi nhận đề xuất cho điều phối'}</h2>${done?`<div class="journey-confirm"><strong>Đang chờ điều phối</strong><p>${x.e(entry?.decision||'Đã ghi nhận yêu cầu xem xét.')}</p><span>Người phụ trách: Điều phối · Chưa xác nhận lịch</span></div>`:`<label class="journey-field">Hướng xử lý đề xuất<select id="journey-triage-decision"><option value="">Chọn hướng xử lý</option><option value="Yêu cầu bổ sung thông tin">Yêu cầu bổ sung thông tin</option><option value="Đề nghị điều phối khám trực tiếp">Đề nghị điều phối khám trực tiếp</option><option value="Đề nghị điều phối khám trực tuyến">Đề nghị điều phối khám trực tuyến</option></select></label><label class="journey-field">Ghi chú bàn giao<textarea id="journey-triage-note" rows="4" maxlength="400" placeholder="Nội dung cần điều phối xác minh..."></textarea></label>${x.btn('Bàn giao cho điều phối','doc-triage-handoff','btn-primary',`data-id="${x.e(a.id)}"`)}`}<p class="journey-footnote">Đề xuất không tự thay đổi hình thức khám, xác nhận lịch hoặc gửi thông báo cho người bệnh.</p></section></div></section>`;
  }
  function onlinePage(path,x){
    const a=x.data.appointments.find(v=>v.id===path.split('/').pop()&&isDoctor(v)&&v.mode.toLowerCase().includes('online'));
    if(!a)return `<section class="screen doctor-screen"><h1>Không có lịch trực tuyến phù hợp</h1><a href="#/doctor">Về tổng quan</a></section>`;
    const p=P(x,a.personId),d=x.data.onlineVisits?.[a.id]||{},connected=d.connection==='connected',handoff=d.connection==='handoff';
    return `<section class="screen doctor-screen doctor-journey-page"><div class="doctor-kicker">KHÁM TRỰC TUYẾN / KẾT NỐI</div><div class="doctor-heading"><div class="doctor-heading-grid"><div><h1>Chuẩn bị buổi khám trực tuyến</h1><p>Ghi nhận trạng thái kết nối; chuyển điều phối khi cần liên hệ lại hoặc đổi hình thức.</p></div></div></div>
      <div class="journey-page-grid"><section class="doctor-surface journey-panel" ${UI.cardAttrs('surface')}><div class="doctor-overline">THÔNG TIN BUỔI KHÁM</div><h2>${x.e(p.name)}</h2>${UI.facts([['Giờ hẹn',a.time+' · '+a.date],['Trạng thái lượt khám',UI.status(a.status).label],['Người phụ trách',a.owner],['Kết nối',connected?'Đã xác nhận kết nối':handoff?'Đã bàn giao':'Chưa kết nối']],x.e,'journey-facts')}<a class="journey-text-link" ${UI.buttonAttrs('text')} href="#/patients/${x.e(p.id)}">${x.e(A.viewPatient)} ${x.icon('arrow',16)}</a></section>
      <section class="doctor-surface journey-panel" ${UI.cardAttrs('surface')}><div class="doctor-overline">BƯỚC TIẾP THEO</div><h2>${connected?'Sẵn sàng bắt đầu khám':handoff?'Đang chờ điều phối':'Xử lý kết nối'}</h2>
      ${connected?`<p class="journey-confirm">Đã mô phỏng kết nối thành công. Chưa thực hiện cuộc gọi thật.</p>${x.btn('Bắt đầu khám trực tuyến','start-consult','btn-primary',`data-id="${x.e(a.id)}"`)}`:handoff?`<p class="journey-confirm">Đã bàn giao cho Điều phối: ${x.e(d.choice)}. Chưa đổi lịch hoặc gửi thông báo thật.</p><a href="#/doctor/followups" class="journey-text-link" ${UI.buttonAttrs('text')}>Xem công việc theo dõi ${x.icon('arrow',16)}</a>`:`${a.status==='ready'?x.btn('Mô phỏng đã kết nối','doc-online-connect','btn-primary',`data-id="${x.e(a.id)}"`):''}<label class="journey-field">Trường hợp không thể kết nối<select id="journey-online-choice"><option value="Gọi lại và hỗ trợ kết nối">Gọi lại và hỗ trợ kết nối</option><option value="Đề nghị hẹn trực tuyến lần khác">Đề nghị hẹn trực tuyến lần khác</option><option value="Đề nghị chuyển khám trực tiếp">Đề nghị chuyển khám trực tiếp</option></select></label>${x.btn('Bàn giao xử lý kết nối','doc-online-handoff','btn-soft',`data-id="${x.e(a.id)}"`)}`}<p class="journey-footnote">Mô phỏng trạng thái giao tiếp, không tạo cuộc gọi video hoặc đổi lịch thực tế.</p></section></div></section>`;
  }
  const fold = value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLocaleLowerCase('vi');
  function followups(x){
    const filter=x.ui.followupFilter||{status:'all',owner:'all',query:''};
    const displayed=tasks(x).filter(t=>(filter.status==='all'||(filter.status==='done')===t.done)&&(filter.owner==='all'||(filter.owner==='mine')===(t.owner==='Bác sĩ'))&&fold([t.title,t.desc,P(x,t.personId).name,t.owner,t.category].join(' ')).includes(fold(filter.query).trim()));
    const active=tasks(x).filter(t=>!t.done);
    const byDue=[...active].sort((a,b)=>{const norm=d=>{const [day,month,year]=d.split('/').map(Number);return year*10000+month*100+day};return norm(a.due)-norm(b.due)});
    return `<section class="screen doctor-screen">${`<div class="doctor-heading"><div class="doctor-kicker">SAU KHÁM / BÀN GIAO</div><div class="doctor-heading-grid"><div><h1>Theo dõi sau khám</h1><p>Thông tin người bệnh, người phụ trách, thời hạn và bước cần thực hiện.</p></div></div></div>`}
    <div class="doctor-followups-grid"><section class="doctor-surface" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">CÔNG VIỆC THEO HỒ SƠ</span><h2>${active.length} việc đang chờ xử lý</h2></div>${x.pill(active.length+' chưa xong','info')}</div>
    <div class="cf-task-controls"><label>Tìm công việc<input id="followup-query" type="search" data-followup-query value="${x.e(filter.query)}" placeholder="Bệnh nhân, nội dung, người phụ trách…"></label><label>Trạng thái<select data-followup-field="status">${[['all','Tất cả'],['open','Chưa xử lý'],['done','Đã xử lý']].map(([key,label])=>`<option value="${key}"${filter.status===key?' selected':''}>${label}</option>`).join('')}</select></label><label>Phụ trách<select data-followup-field="owner">${[['all','Tất cả'],['mine','Bác sĩ'],['delegated','Điều phối']].map(([key,label])=>`<option value="${key}"${filter.owner===key?' selected':''}>${label}</option>`).join('')}</select></label></div><p class="cf-local-feedback" role="status">Hiển thị ${displayed.length}/${tasks(x).length} công việc</p><div class="journey-task-list">${displayed.map(t=>`<article class="journey-task-entry ${t.done?'is-done':''}" ${UI.cardAttrs('row')}><div class="journey-task-meta"><span>${x.e(t.category||'Theo dõi')}</span>${x.pill(taskState(t),t.done?'success':'warning')}</div><h3>${x.e(t.title)}</h3><p>${x.e(t.desc)}</p><dl data-cf-component="facts"><div><dt>Bệnh nhân</dt><dd>${x.e(P(x,t.personId).name)}</dd></div><div><dt>Người phụ trách</dt><dd>${x.e(t.owner)}</dd></div><div><dt>Hạn xử lý</dt><dd>${x.e(t.due)}</dd></div><div><dt>Bước tiếp theo</dt><dd>${x.e(t.next)}</dd></div></dl><div class="journey-task-actions"><a class="journey-text-link" ${UI.buttonAttrs('text')} href="#${x.e(t.route)}">Xem nội dung ${x.icon('arrow',16)}</a>${t.owner==='Bác sĩ'?x.btn(t.done?'Mở lại':'Đánh dấu đã xử lý','doc-task-toggle','btn-soft',`data-id="${x.e(t.id)}"`):`<span class="journey-assignee">Đang chờ ${x.e(t.owner)}</span>`}</div></article>`).join('')||`<div class="doctor-card-empty" data-cf-state="empty"><strong>Không có công việc phù hợp</strong><p>Thử từ khóa khác hoặc đặt lại bộ lọc.</p>${x.btn('Xóa bộ lọc','doc-followup-reset','btn-soft')}</div>`}</div></section>
    <aside class="doctor-followups-side"><section class="doctor-surface doctor-followups-summary" ${UI.cardAttrs('surface')}><div class="doctor-overline">PHÂN CÔNG THEO DÕI</div><div class="doctor-followups-mini"><span>Bác sĩ phụ trách</span><strong>${active.filter(t=>t.owner==='Bác sĩ').length}</strong></div><div class="doctor-followups-mini"><span>Đã bàn giao điều phối</span><strong>${active.filter(t=>t.owner!=='Bác sĩ').length}</strong></div><div class="doctor-divider"></div><div class="doctor-overline">SẮP ĐẾN HẠN</div><div class="journey-deadline-list">${byDue.slice(0,4).map(t=>`<div class="journey-deadline-item"><span class="journey-deadline-date">${x.e(t.due)}</span><strong>${x.e(t.title)}</strong><small>${x.e(P(x,t.personId).name)} · ${x.e(t.owner)}</small></div>`).join('')||'<p class="journey-empty">Không có công việc đang chờ.</p>'}</div><a href="#/results" class="journey-text-link" ${UI.buttonAttrs('text')}>Kết quả cận lâm sàng ${x.icon('arrow',16)}</a></section></aside></div></section>`;
  }
  function afterResult(r,x){
    const related=x.data.appointments.find(a=>a.personId===r.personId&&isDoctor(a)&&a.status==='in-consult');
    const saved=x.data.resultNexts?.[r.id], can=r.status==='reviewed';
    return `<div class="journey-result-next"><div class="doctor-overline">SAU KHI BÁC SĨ XEM KẾT QUẢ</div><h3>Bước xử lý tiếp theo</h3>${saved?`<p class="journey-confirm">Đã bàn giao: ${x.e(saved.label)} · ${x.e(saved.owner)}</p>`:`<label class="journey-field">Chọn bước tiếp theo<select id="journey-result-choice" ${can?'':'disabled'}>${options.map(t=>`<option value="${t.value}">${x.e(t.label)}</option>`).join('')}</select></label>${x.btn('Ghi nhận bước tiếp theo','doc-result-next','btn-soft',`data-id="${x.e(r.id)}" ${can?'':'disabled'}`)}`}<small>${can?'Chỉ lưu công việc nội bộ, không gửi thông báo thật.':'Cần đánh dấu đã xem trước khi chọn bước tiếp theo.'}</small>${related?`<a class="journey-text-link" ${UI.buttonAttrs('text')} href="#/encounters/${x.e(related.id)}">Trở về buổi khám ${x.icon('arrow',16)}</a>`:''}</div>`;
  }
  function addTask(x,t){x.data.doctorTasks??=[];const existing=x.data.doctorTasks.find(p=>p.id===t.id);if(existing)Object.assign(existing,t);else x.data.doctorTasks.unshift(t)}
  function action(node,x){
    const name=node.dataset.action,id=node.dataset.id;
    if(name==='doc-followup-reset'){x.ui.followupFilter={status:'all',owner:'all',query:''};x.render();document.getElementById('followup-query')?.focus();return true}
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
  function filterInput(event,x){
    if(!event.target.matches('[data-followup-query],[data-followup-field]'))return false;
    const el=event.target,key=el.dataset.followupField||'query',caret=el.selectionStart;
    const values={status:['all','open','done'],owner:['all','mine','delegated']};
    if(key!=='query'&&!values[key]?.includes(el.value))return false;
    x.ui.followupFilter??={status:'all',owner:'all',query:''};
    x.ui.followupFilter[key]=el.value;
    x.render();
    const field=document.querySelector(key==='query'?'[data-followup-query]':`[data-followup-field="${key}"]`);
    field?.focus({preventScroll:true});
    if(key==='query'&&caret!=null)field?.setSelectionRange(caret,caret);
    return true;
  }
  root.CareFlowJourneys={summary,followups,afterResult,page,action,filterInput};
})(window);
