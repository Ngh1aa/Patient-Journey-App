/* CareFlow desktop portfolio: clinical coordination, schedule changes and nursing.
 * Synthetic state only; no real patient information or clinical integrations. */
(function installCareFlowWave3(root){
  'use strict';
  const routeLabels={
    '/nursing':'Tổng quan điều dưỡng','/nursing/prepare':'Chuẩn bị khám','/nursing/followups':'Theo dõi sau khám'
  };
  const allowed=new Set(['pending','confirmed','unreachable']);
  const cancelReasons=['Bệnh nhân yêu cầu hủy','Không thể đến theo lịch','Cần đổi phương án khám','Lý do khác'];
  const options=['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
  const panel=(content,additional='')=>`<section class="panel wave-panel ${additional}">${content}</section>`;
  const heading=(k,title,desc)=>`<div class="wave-heading"><div class="eyebrow">${k}</div><h1>${title}</h1><p>${desc}</p></div>`;
  function initTasks(data){
    data.nursingTasks??=[
      {id:'nt-01',personId:'p-001',title:'Chuẩn bị hồ sơ trước lượt khám',subtitle:'Đối chiếu thông tin lịch hẹn',kind:'prepare',done:false},
      {id:'nt-02',personId:'p-003',title:'Theo dõi kết quả cần bàn giao',subtitle:'Chuyển bác sĩ xem, không tự công bố',kind:'results',done:false},
      {id:'nt-03',personId:'p-005',title:'Kiểm tra lịch gọi lại',subtitle:'Cuộc gọi chưa kết nối',kind:'callback',done:false},
      {id:'nt-04',personId:'p-007',title:'Chuẩn bị bệnh nhân đến khám',subtitle:'Kiểm tra lượt khám trước khi bàn giao',kind:'prepare',done:false}
    ];
    return data.nursingTasks;
  }
  const listPerson=(a,x)=>`<span class="wave-person">${x.avatar(x.person(a.personId))}<span><strong>${x.e(x.person(a.personId).name)}</strong><small>${x.e(a.time)} · ${x.e(a.code)}</small></span></span>`;
  function schedulePage(id,x){
    const {data,ui,e,btn,pill,icon,person,statePill,appt}=x;
    const a=data.appointments.find(a=>a.id===id);
    if(!a)return `<section class="screen wave-screen">${heading('QUẢN LÝ LỊCH','Không tìm thấy phiếu khám','Mã lịch hẹn không tồn tại trong phiên demo.')}${btn('Về danh sách yêu cầu','go','btn-primary','data-to="/requests"')}</section>`;
    const p=person(a.personId),modifiable=allowed.has(a.status);
    const pending=ui.schedulePending?.id===a.id?ui.schedulePending:null;
    const history=(data.scheduleHistory||[]).filter(v=>v.id===a.id).slice().reverse();
    return `<section class="screen wave-screen">
      <div class="wave-crumb"><button data-action="go" data-to="/requests">${icon('left',17)} Danh sách yêu cầu</button><span>/</span><strong>${e(a.code)}</strong></div>
      ${heading('ĐIỀU PHỐI LỊCH KHÁM','Quản lý thay đổi lịch','Mỗi thao tác đổi giờ hoặc hủy lịch có lý do, xác nhận và trạng thái kết quả rõ ràng.')}
      <div class="wave-schedule-grid">
        ${panel(`<div class="wave-panel-head"><div><span class="eyebrow">PHIẾU KHÁM ${e(a.code)}</span><h2>${e(p.name)}</h2><p>${e(a.date)} · ${e(a.doctor)}</p></div>${statePill(a)}</div>
          <div class="wave-detail-tiles"><div><span>Thời gian hiện tại</span><strong>${e(a.time)}</strong></div><div><span>Hình thức</span><strong>${e(a.mode)}</strong></div><div><span>Phụ trách</span><strong>${e(a.owner)}</strong></div></div>
          ${!modifiable?`<div class="wave-warning">${icon('shield',18)} ${a.status==='cancelled'?'Lịch đã hủy. Bạn chỉ có thể xem lịch sử, không thể khôi phục bằng cách xác nhận lại.':'Lượt khám đang ở trạng thái không cho phép đổi hoặc hủy tại quầy. Vui lòng xử lý theo quy trình phù hợp.'}</div>`:''}
          ${modifiable?`<div class="wave-form-layout"><section><h3>${icon('calendar',18)} Đổi thời gian</h3><p>Giữ nguyên bác sĩ và hình thức, chọn một giờ khác trong ngày demo.</p><label class="wave-label" for="wave-time">Giờ khám mới</label><select id="wave-time">${options.map(t=>`<option value="${t}" ${a.time===t?'selected':''}>${t}</option>`).join('')}</select><label class="wave-label" for="wave-reschedule-reason">Lý do thay đổi</label><textarea id="wave-reschedule-reason" rows="2" maxlength="160" placeholder="Ví dụ: Bệnh nhân đề nghị đổi khung giờ"></textarea>${btn('Kiểm tra đổi giờ','wave-propose-reschedule','btn-primary',`data-id="${e(a.id)}"`)}</section><section class="wave-cancel-panel"><h3>${icon('clock',18)} Hủy lịch hẹn</h3><p>Hủy lịch cần ghi nhận lý do và xác nhận trước khi cập nhật.</p><label class="wave-label" for="wave-cancel-reason">Lý do hủy</label><select id="wave-cancel-reason"><option value="">Chọn lý do hủy</option>${cancelReasons.map(reason=>`<option value="${e(reason)}">${e(reason)}</option>`).join('')}</select>${btn('Tiếp tục hủy lịch','wave-propose-cancel','btn-outline',`data-id="${e(a.id)}"`)}</section></div>`:''}
          ${pending?`<div class="wave-confirm" role="region" aria-label="Xác nhận thay đổi"><div class="wave-confirm-icon">${icon('shield',22)}</div><div><div class="eyebrow">XÁC NHẬN LẦN CUỐI</div><h3>${pending.kind==='cancel'?'Hủy lịch khám này?':'Đổi giờ khám?'}</h3><p>${pending.kind==='cancel'?`Lịch ${e(a.time)} sẽ chuyển sang trạng thái Đã hủy.`:`Thay đổi ${e(a.time)} → ${e(pending.time)} và yêu cầu xác nhận lại.`}</p><p><strong>Lý do:</strong> ${e(pending.reason)}</p></div><div class="wave-confirm-actions">${btn('Quay lại','wave-discard','btn-outline')}${btn(pending.kind==='cancel'?'Xác nhận hủy lịch':'Xác nhận đổi giờ','wave-commit','btn-primary',`data-id="${e(a.id)}"`)}</div></div>`:''}
        `,'wave-schedule-main')}
        ${panel(`<div class="wave-panel-head"><div><h2>Nhật ký thay đổi</h2><p>Các thao tác của phiên demo</p></div>${icon('clipboard',20)}</div><div class="wave-history">${history.length?history.map(h=>`<div class="wave-history-item"><span class="wave-dot"></span><div><strong>${e(h.kind==='cancel'?'Đã hủy lịch':'Đã đổi giờ')}</strong><small>${e(h.kind==='cancel'?h.before:h.before+' → '+h.after)} · ${e(h.reason)}</small></div></div>`).join(''):`<div class="wave-empty">Chưa có thay đổi nào được ghi lại.</div>`}</div><div class="wave-note">${icon('info',17)} Việc đổi và hủy ở đây chỉ thay đổi dữ liệu trong phiên trình diễn, không gửi thông báo cho bệnh nhân.</div>`,'wave-side-panel')}
      </div>
    </section>`;
  }
  function nursingNav(x){
    return `<div class="wave-inline-nav">${[['/nursing','Tổng quan'],['/nursing/prepare','Chuẩn bị khám'],['/nursing/followups','Theo dõi sau khám']].map(([route,label])=>`<a href="#${route}" class="${location.hash==='#'+route?'selected':''}">${x.e(label)}</a>`).join('')}</div>`;
  }
  function nursingHome(x){
    const {data,e,icon,pill,btn,person,resultPill}=x;
    const tasks=initTasks(data),arrived=data.appointments.filter(a=>a.status==='arrived'),ready=data.appointments.filter(a=>a.status==='ready'),open=tasks.filter(t=>!t.done);
    return `<section class="screen wave-screen wave-nursing">
    ${heading('CAREFLOW / NURSING DESK','Điều dưỡng & điều phối','Một trung tâm công việc yên tĩnh, rõ mức ưu tiên và dễ bàn giao trong ngày.')}
    ${nursingNav(x)}
    <div class="wave-nurse-stats">
      <div class="wave-nurse-stat"><span class="wave-stat-icon">${icon('users',22)}</span><small>Chờ chuẩn bị</small><strong>${String(arrived.length).padStart(2,'0')}</strong><span>Đã tới quầy</span></div>
      <div class="wave-nurse-stat"><span class="wave-stat-icon">${icon('check',22)}</span><small>Sẵn sàng khám</small><strong>${String(ready.length).padStart(2,'0')}</strong><span>Đã chuyển bác sĩ</span></div>
      <div class="wave-nurse-stat"><span class="wave-stat-icon">${icon('clipboard',22)}</span><small>Việc cần xử lý</small><strong>${String(open.length).padStart(2,'0')}</strong><span>Trong phiên demo</span></div>
    </div>
    <div class="wave-nurse-layout">
      ${panel(`<div class="wave-panel-head"><div><span class="eyebrow">01 / HÀNG CHỜ</span><h2>Chuẩn bị trước khám</h2><p>Tiếp nhận → rà soát → sẵn sàng</p></div>${btn('Mở hàng chờ','go','btn-soft','data-to="/nursing/prepare"')}</div><div class="wave-nurse-items">${arrived.concat(ready).length?arrived.concat(ready).map(a=>`<div class="wave-nurse-item">${listPerson(a,x)}${x.statePill(a)}${a.status==='arrived'?btn('Sẵn sàng','ready-patient','btn-primary',`data-id="${e(a.id)}"`):btn('Xem phiếu','open-appointment','btn-soft',`data-id="${e(a.id)}"`)}</div>`).join(''):`<div class="wave-empty">Không có bệnh nhân đang chờ chuẩn bị.</div>`}</div>`)}
      ${panel(`<div class="wave-panel-head"><div><span class="eyebrow">02 / VIỆC ƯU TIÊN</span><h2>Công việc cần theo dõi</h2><p>Chọn việc để xử lý hoặc bàn giao</p></div>${btn('Xem tất cả','go','btn-soft','data-to="/nursing/followups"')}</div><div class="wave-task-list">${open.slice(0,4).map(t=>`<div class="wave-task"><span class="wave-task-glyph">${icon(t.kind==='results'?'beaker':'clipboard',19)}</span><div><strong>${e(t.title)}</strong><small>${e(person(t.personId).name)} · ${e(t.subtitle)}</small></div>${btn('Chi tiết','go','btn-soft','data-to="/nursing/followups"')}</div>`).join('')}</div>`)}
    </div></section>`;
  }
  function nursingPrepare(x){
    const {data,e,icon,btn}=x;
    const rows=data.appointments.filter(a=>['arrived','ready','in-consult'].includes(a.status)).sort((a,b)=>a.time.localeCompare(b.time));
    return `<section class="screen wave-screen wave-nursing">
      ${heading('NURSING / PRE-VISIT','Chuẩn bị trước buổi khám','Từng bước rõ trạng thái; điều dưỡng chỉ bàn giao, không thực hiện thay hành động ký khám.')}
      ${nursingNav(x)}
      ${panel(`<div class="wave-panel-head"><div><h2>Danh sách tiếp nhận</h2><p>Phân biệt đã đến, sẵn sàng và đang khám</p></div>${pillCount(rows.length,x)}</div><div class="wave-table-wrap"><table class="wave-table"><thead><tr><th>Bệnh nhân</th><th>Lịch hẹn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${rows.length?rows.map(a=>`<tr><td>${listPerson(a,x)}</td><td>${e(a.doctor)}<small>${e(a.mode)}</small></td><td>${x.statePill(a)}</td><td>${a.status==='arrived'?btn('Chuyển sẵn sàng','ready-patient','btn-primary',`data-id="${e(a.id)}"`):btn('Chi tiết','open-appointment','btn-soft',`data-id="${e(a.id)}"`)}</td></tr>`).join(''):`<tr><td colspan="4" class="wave-empty">Chưa có lượt cần chuẩn bị.</td></tr>`}</tbody></table></div>`)}
      <div class="wave-note">${icon('shield',17)} Đây là các trạng thái điều phối demo. Không có ghi nhận dấu hiệu sinh tồn hay dữ liệu sức khỏe thật.</div>
    </section>`;
  }
  function pillCount(n,x){return x.pill(n+' lượt','info')}
  function nursingFollowups(x){
    const {data,e,icon,btn,person}=x,tasks=initTasks(data);
    const filter=x.ui.nursingFilter||'all';
    const rows=tasks.filter(t=>filter==='all'||(filter==='open'?!t.done:t.done));
    return `<section class="screen wave-screen wave-nursing">
      ${heading('NURSING / FOLLOW-UP','Theo dõi & bàn giao','Chỉ đánh dấu tiến độ công việc nội bộ; không mô phỏng đã liên hệ hoặc đã đưa ra hướng dẫn y tế.')}
      ${nursingNav(x)}
      ${panel(`<div class="wave-panel-head"><div><h2>Công việc sau tiếp nhận</h2><p>Trạng thái được giữ khi đổi trang hoặc tải lại trong cùng phiên</p></div><div class="segmented" role="group" aria-label="Lọc công việc">${[['all','Tất cả'],['open','Chưa xong'],['done','Đã xử lý']].map(([v,t])=>`<button data-action="wave-task-filter" data-value="${v}" class="${filter===v?'selected':''}" aria-pressed="${filter===v}">${t}</button>`).join('')}</div></div>
      <div class="wave-task-list wave-followup-list">${rows.length?rows.map(t=>`<article class="wave-task ${t.done?'is-done':''}"><span class="wave-task-glyph">${icon(t.done?'check':t.kind==='callback'?'message':'clipboard',20)}</span><div><span class="eyebrow">${e(t.kind==='callback'?'LIÊN HỆ LẠI':t.kind==='results'?'KẾT QUẢ':'CHUẨN BỊ')}</span><strong>${e(t.title)}</strong><small>${e(person(t.personId).name)} · ${e(t.subtitle)}</small></div>${x.pill(t.done?'Đã xử lý':'Cần xử lý',t.done?'success':'warning')}${btn(t.done?'Mở lại việc':'Đánh dấu xử lý', 'wave-task-toggle', t.done?'btn-outline':'btn-soft',`data-id="${e(t.id)}"`)}</article>`).join(''):`<div class="wave-empty">Không có việc phù hợp bộ lọc. Hãy chọn một trạng thái khác.</div>`}</div><div class="wave-panel-foot"><span>${rows.length} công việc</span><span>Thông tin minh họa · Không có cuộc gọi hoặc thông báo thật</span></div>`)}
      </section>`;
  }
  function page(path,x){
    if(path.startsWith('/schedule/'))return schedulePage(path.split('/')[2],x);
    if(path==='/nursing')return nursingHome(x);
    if(path==='/nursing/prepare')return nursingPrepare(x);
    if(path==='/nursing/followups')return nursingFollowups(x);
    return null;
  }
  function action(b,x){
    const {data,ui,notify,render,save,go}=x,kind=b.dataset.action,id=b.dataset.id;
    if(kind==='wave-open-schedule'){ui.schedulePending=null;go('/schedule/'+id);return true}
    if(kind==='wave-discard'){ui.schedulePending=null;render();return true}
    if(kind==='wave-propose-reschedule'||kind==='wave-propose-cancel'){
      const a=data.appointments.find(a=>a.id===id);
      if(!a||!allowed.has(a.status)){notify('Lịch không đủ điều kiện đổi hoặc hủy.');return true}
      const isCancel=kind==='wave-propose-cancel';
      const time=document.getElementById('wave-time')?.value;
      const reason=(document.getElementById(isCancel?'wave-cancel-reason':'wave-reschedule-reason')?.value||'').trim();
      if(!reason){notify('Vui lòng chọn hoặc nhập lý do trước khi tiếp tục.');return true}
      if(!isCancel&&time===a.time){notify('Hãy chọn giờ mới khác giờ hiện tại.');return true}
      if(!isCancel&&data.appointments.some(other=>other.id!==id&&other.doctor===a.doctor&&other.date===a.date&&other.time===time&&other.status!=='cancelled')){notify('Giờ đã chọn có lịch khác của cùng bác sĩ. Vui lòng đổi khung giờ.');return true}
      ui.schedulePending={id,kind:isCancel?'cancel':'reschedule',reason,time:time||null};render();return true;
    }
    if(kind==='wave-commit'){
      const a=data.appointments.find(a=>a.id===id),pending=ui.schedulePending;
      if(!a||!pending||pending.id!==id||!allowed.has(a.status)){ui.schedulePending=null;notify('Yêu cầu thay đổi không còn hợp lệ.');return true}
      if(pending.kind==='reschedule'&&data.appointments.some(other=>other.id!==id&&other.doctor===a.doctor&&other.date===a.date&&other.time===pending.time&&other.status!=='cancelled')){ui.schedulePending=null;notify('Giờ mới không còn trống. Vui lòng chọn lại.');return true}
      data.scheduleHistory??=[];
      data.scheduleHistory.push({id,kind:pending.kind,before:a.time,after:pending.kind==='reschedule'?pending.time:null,reason:pending.reason});
      if(pending.kind==='cancel'){a.status='cancelled';a.owner='Lễ tân';}
      else{a.time=pending.time;a.status='pending';a.owner='Lễ tân';}
      const message=pending.kind==='cancel'?'Đã hủy lịch trong bản demo.':'Đã đổi giờ. Lịch chuyển về chờ xác nhận lại.';
      ui.schedulePending=null;save();notify(message);return true;
    }
    if(kind==='wave-task-filter'){ui.nursingFilter=b.dataset.value;render();return true}
    if(kind==='wave-task-toggle'){const t=initTasks(data).find(x=>x.id===id);if(!t)return true;t.done=!t.done;save();notify(t.done?'Đã đánh dấu xử lý trong demo.':'Đã mở lại việc trong demo.');return true}
    return false;
  }
  root.CareFlowWave3={page,action,routeLabels};
})(window);
