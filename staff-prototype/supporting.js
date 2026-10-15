/* CareFlow supporting showcase screens: synthetic UI only. */
(function installSupporting(root){
  'use strict';
  const R={
    '/requests':'Yêu cầu đặt lịch','/booking/new':'Tạo lịch khám',
    '/checkin':'Tiếp nhận bệnh nhân','/queue':'Hàng chờ khám',
    '/clinical/orders':'Tạo chỉ định','/clinical/prescription':'Đơn thuốc',
    '/clinical/review':'Xem lại buổi khám','/welcome':'Chọn không gian'
  };
  const routeNames=()=>R;
  const panel=(content,cls='')=>`<section class="panel support-panel ${cls}">${content}</section>`;
  const hero=(k,title,desc,actions='')=>`<header class="support-hero"><div><div class="eyebrow">${k}</div><h1>${title}</h1><p>${desc}</p></div><div class="support-hero-actions">${actions}</div></header>`;
  const formField=(id,label,content,hint='')=>`<label class="support-field" for="${id}"><span class="support-label">${label}</span>${content}${hint?`<small>${hint}</small>`:''}</label>`;
  const empty=msg=>`<div class="support-empty">${msg}</div>`;
  function page(path,x){
    const {data,ui,people,person,appt,e,icon,pill,statePill,resultPill,btn,appointmentsTable}=x;
    if(!R[path])return null;
    if(path==='/requests'){
      const match=(ui.requestFilter||'all');
      const list=data.appointments.filter(a=>['pending','review','unreachable'].includes(a.status));
      const visible=list.filter(a=>match==='all'||a.status===match);
      return `<section class="screen support-screen">${hero('ĐIỀU PHỐI LỊCH KHÁM','Yêu cầu đặt lịch','Tất cả yêu cầu cần được kiểm tra trước khi chuyển sang trạng thái tiếp theo.',btn(`${icon('plus',17)} Tạo lịch`,'go','btn-primary','data-to="/booking/new"'))}
        <div class="support-metrics"><div>${icon('clock',19)}<strong>${list.filter(a=>a.status==='pending').length}</strong><span>Chờ xác nhận</span></div><div>${icon('shield',19)}<strong>${list.filter(a=>a.status==='review').length}</strong><span>Cần xem xét chuyên môn</span></div><div>${icon('message',19)}<strong>${list.filter(a=>a.status==='unreachable').length}</strong><span>Chưa liên hệ được</span></div></div>
        ${panel(`<div class="panel-head"><div><h2>Danh sách cần xử lý</h2><p>Chọn một dòng để mở phiếu và thực hiện hành động phù hợp</p></div><div class="segmented" role="group" aria-label="Lọc yêu cầu">${[['all','Tất cả'],['pending','Chờ xác nhận'],['review','Cần xem xét'],['unreachable','Gọi lại']].map(([v,t])=>`<button class="${match===v?'selected':''}" data-action="request-filter" data-value="${v}" aria-pressed="${match===v}">${t}</button>`).join('')}</div></div>${appointmentsTable(visible)}<div class="panel-foot"><span>${visible.length} / ${list.length} yêu cầu</span><span>Thao tác chỉ thay đổi dữ liệu minh họa</span></div>`)}</section>`;
    }
    if(path==='/booking/new'){
      const options=people.map(p=>`<option value="${e(p.id)}">${e(p.name)} · ${e(p.code)}</option>`).join('');
      return `<section class="screen support-screen">${hero('LỄ TÂN · TẠO YÊU CẦU','Tạo lịch khám','Một luồng đơn giản để giới thiệu thao tác tạo lịch tại quầy, với kiểm tra trùng giờ demo.',btn(`${icon('left',16)} Danh sách yêu cầu`,'go','btn-outline','data-to="/requests"'))}
      <div class="support-two-col">${panel(`<div class="panel-head"><div><h2>Thông tin cuộc hẹn</h2><p>Điền thông tin và kiểm tra trước khi gửi</p></div>${pill('Bản demo','info')}</div><div class="support-form">
      ${formField('new-patient','Bệnh nhân',`<select id="new-patient">${options}</select>`)}
      <div class="support-form-grid">${formField('new-mode','Hình thức khám',`<select id="new-mode"><option>Tại phòng khám</option><option>Khám online</option></select>`)}${formField('new-doctor','Bác sĩ phụ trách',`<select id="new-doctor"><option>BS. Nguyễn Văn An</option><option>BS. Trần Phương Linh</option></select>`)}</div>
      <div class="support-form-grid">${formField('new-date','Ngày khám',`<input id="new-date" value="15/10/2026" readonly>`, 'Dùng ngày giả lập cố định trong bản portfolio')}${formField('new-slot','Giờ khám',`<select id="new-slot">${['08:00','09:00','09:30','10:00','13:30','14:30','15:00','15:30'].map(t=>`<option ${t==='14:30'?'selected':''}>${t}</option>`).join('')}</select>`)}</div>
      ${formField('new-reason','Ghi chú lịch hẹn',`<input id="new-reason" maxlength="100" value="Yêu cầu khám minh họa" placeholder="Lý do liên hệ">`,'Không nhập dữ liệu sức khỏe thật')}
      <div class="support-form-actions">${btn('Quay lại','go','btn-outline','data-to="/requests"')}${btn(`${icon('check',17)} Gửi yêu cầu demo`,'create-booking','btn-primary')}</div></div>`,'support-form-panel')}
      ${panel(`<div class="support-guide-icon">${icon('shield',25)}</div><h2>Quy trình được thể hiện</h2><ol class="support-steps"><li>Chọn hồ sơ có sẵn</li><li>Chọn hình thức, bác sĩ, giờ trống</li><li>Gửi yêu cầu với trạng thái chờ xác nhận</li><li>Mở phiếu và xác nhận qua drawer</li></ol><div class="support-note">${icon('info',17)} Hệ thống chỉ kiểm tra các lịch demo có cùng bác sĩ và giờ. Không có lịch khám thật.</div>`,'support-guidance')}</div></section>`;
    }
    if(path==='/checkin'){
      const rows=data.appointments.filter(a=>['pending','confirmed','arrived','ready','in-consult','completed'].includes(a.status)).sort((a,b)=>a.time.localeCompare(b.time));
      return `<section class="screen support-screen">${hero('TIẾP NHẬN TẠI QUẦY','Tiếp nhận bệnh nhân','Xem phiếu khám, xác nhận bệnh nhân đã đến và bàn giao sang hàng chờ.',btn(`${icon('users',17)} Xem hàng chờ`,'go','btn-primary','data-to="/queue"'))}
      <div class="support-metrics"><div>${icon('calendar',19)}<strong>${rows.filter(a=>a.status==='confirmed').length}</strong><span>Đợi đến khám</span></div><div>${icon('check',19)}<strong>${rows.filter(a=>a.status==='arrived').length}</strong><span>Đã đến quầy</span></div><div>${icon('activity',19)}<strong>${rows.filter(a=>['ready','in-consult'].includes(a.status)).length}</strong><span>Trong hàng chờ</span></div></div>
      ${panel(`<div class="panel-head"><div><h2>Phiếu khám hôm nay</h2><p>Mọi trạng thái đều là dữ liệu minh họa</p></div>${pill('15/10/2026','info')}</div><div class="support-list">${rows.map(a=>`<article class="support-patient-row"><div class="support-patient-main">${x.avatar(person(a.personId))}<div><strong>${e(person(a.personId).name)}</strong><small>${e(a.code)} · ${e(a.time)} · ${e(a.mode)}</small></div></div>${statePill(a)}<div class="support-row-actions">${btn('Phiếu khám','open-appointment','btn-soft',`data-id="${e(a.id)}"`)}${a.status==='confirmed'?btn('Báo đã đến','checkin-patient','btn-primary',`data-id="${e(a.id)}"`):a.status==='arrived'?btn('Sẵn sàng khám','ready-patient','btn-primary',`data-id="${e(a.id)}"`):''}</div></article>`).join('')}</div><div class="panel-foot"><span>Cần xác nhận lịch trước khi tiếp nhận</span><span>${rows.length} phiếu khám</span></div>`)}</section>`;
    }
    if(path==='/queue'){
      const stages=[['arrived','Đã đến · chờ tiếp nhận'],['ready','Sẵn sàng khám'],['in-consult','Đang khám']];
      return `<section class="screen support-screen">${hero('DÒNG CÔNG VIỆC','Hàng chờ khám','Tổ chức lượt khám theo trạng thái, ưu tiên và người phụ trách.',btn(`${icon('calendar',17)} Tiếp nhận`,'go','btn-primary','data-to="/checkin"'))}
      <div class="support-kanban">${stages.map(([status,label])=>{const items=data.appointments.filter(a=>a.status===status).sort((a,b)=>a.time.localeCompare(b.time));return `<section class="support-lane"><div class="support-lane-head"><h2>${label}</h2><strong>${items.length.toString().padStart(2,'0')}</strong></div><div class="support-lane-items">${items.length?items.map(a=>`<article class="support-queue-card"><div class="support-ticket">${e(a.code)} <span>${e(a.time)}</span></div><div class="support-patient-main">${x.avatar(person(a.personId))}<div><strong>${e(person(a.personId).name)}</strong><small>${e(a.doctor)}</small></div></div><div class="support-queue-status">${statePill(a)}</div><div class="support-card-actions">${btn('Chi tiết','open-appointment','btn-outline',`data-id="${e(a.id)}"`)}${status==='arrived'?btn('Sẵn sàng','ready-patient','btn-soft',`data-id="${e(a.id)}"`):status==='ready'?btn('Mở khám','start-consult','btn-soft',`data-id="${e(a.id)}"`):btn('Buổi khám','go','btn-soft',`data-to="/encounters/${e(a.id)}"`)}</div></article>`).join(''):empty('Chưa có bệnh nhân ở bước này.')}</div></section>`}).join('')}</div><p class="support-footnote">Thay đổi trạng thái bằng hành động xác nhận; không tự dịch chuyển bệnh nhân theo thời gian giả định.</p></section>`;
    }
    if(path==='/clinical/orders'){
      const rows=data.results.filter(r=>r.doctor.includes('Nguyễn Văn An'));
      const doctorPatientIds=new Set(data.appointments.filter(a=>a.doctor.includes('Nguyễn Văn An')).map(a=>a.personId));
      const assignedPeople=people.filter(p=>doctorPatientIds.has(p.id));
      return `<section class="screen support-screen">${hero('CẬN LÂM SÀNG','Chỉ định cận lâm sàng','Tổng hợp phiếu chỉ định và kết quả liên quan đến các lượt khám của bác sĩ.',btn(`${icon('beaker',17)} Xem kết quả`,'go','btn-primary','data-to="/results"'))}
      <div class="support-two-col">${panel(`<div class="panel-head"><div><h2>Danh sách chỉ định</h2><p>Theo dõi trạng thái chỉ định và kết quả đã tiếp nhận</p></div>${pill(rows.length+' mục','info')}</div><div class="support-list">${rows.map(r=>`<div class="support-patient-row"><div class="support-patient-main"><span class="support-icon">${icon('beaker',19)}</span><div><strong>${e(r.title)}</strong><small>${e(person(r.personId).name)} · ${e(r.code)}</small></div></div>${resultPill(r)}${btn('Kết quả','show-result','btn-soft',`data-id="${e(r.id)}"`)}</div>`).join('')}</div>`)}
      ${panel(`<div class="panel-head"><div><h2>Dự thảo chỉ định</h2><p>Ghi nhận nội dung trước khi chuyển bộ phận thực hiện</p></div></div><div class="support-form">
      ${formField('order-person','Hồ sơ bệnh nhân',`<select id="order-person">${assignedPeople.map(p=>`<option value="${e(p.id)}">${e(p.name)}</option>`).join('')}</select>`)}
      ${formField('order-type','Loại yêu cầu',`<select id="order-type"><option value="Xét nghiệm">Xét nghiệm</option><option value="Chẩn đoán hình ảnh">Chẩn đoán hình ảnh</option></select>`)}
      ${formField('order-title','Nội dung chỉ định',`<input id="order-title" maxlength="80" placeholder="Nhập nội dung cần chỉ định">`)}
      <div class="support-note">${icon('shield',17)} Dự thảo nội bộ chưa được chuyển đến khoa xét nghiệm hoặc chẩn đoán hình ảnh.</div>${btn(`${icon('plus',17)} Lưu dự thảo chỉ định`,'create-lab-order','btn-primary btn-full')}</div>`,'support-form-panel')}</div></section>`;
    }
    if(path==='/clinical/prescription'){
      const a=data.appointments.find(v=>v.id===ui.consultId)||data.appointments.find(v=>v.status==='in-consult')||data.appointments[0];
      const notes=(data.prescriptions||{})[a.id]||'';
      return `<section class="screen support-screen">${hero('HỒ SƠ KHÁM BỆNH','Đơn thuốc','Kiểm tra tình trạng đơn thuốc và lưu ghi chú phục vụ hoàn thiện hồ sơ khám.',btn(`${icon('left',17)} Về buổi khám`,'go','btn-outline',`data-to="/encounters/${e(a.id)}"`))}
      <div class="support-two-col">${panel(`<div class="panel-head"><div><h2>Thông tin lượt khám</h2><p>${e(a.code)} · ${e(a.doctor)}</p></div>${statePill(a)}</div><div class="support-patient-main">${x.avatar(person(a.personId))}<div><strong>${e(person(a.personId).name)}</strong><small>${e(a.reason)} · ${e(a.time)}</small></div></div><div class="support-rule"></div><div class="support-document"><span>TÌNH TRẠNG ĐƠN THUỐC</span><h2>Chưa kê đơn</h2><p>Chưa có thuốc nào được ghi nhận cho lượt khám này.</p><div class="support-rx-metadata"><div><span>Hồ sơ</span><strong>${e(person(a.personId).code)}</strong></div><div><span>Lượt khám</span><strong>${e(a.code)}</strong></div></div></div>`,'support-document-panel')}
      ${panel(`<div class="panel-head"><div><h2>Ghi chú hồ sơ</h2><p>Ghi nhận thông tin liên quan trước khi hoàn tất</p></div></div><div class="support-form">${formField('rx-note','Nội dung ghi chú',`<textarea id="rx-note" rows="5" maxlength="500" placeholder="Nhập ghi chú cần lưu vào hồ sơ...">${e(notes)}</textarea>`,'Chỉ lưu ghi chú nội bộ; không phải nội dung kê đơn')}<div class="support-note">${icon('shield',17)} Chưa kết nối hệ thống kê đơn hoặc ký số.</div>${btn(`${icon('file',17)} Lưu ghi chú`,'save-rx','btn-primary btn-full')}</div>`,'support-form-panel')}</div></section>`;
    }
    if(path==='/clinical/review'){
      const a=data.appointments.find(v=>v.id===ui.consultId)||data.appointments.find(v=>v.status==='in-consult')||data.appointments[0];
      const d=data.drafts[a.id]||{};
      return `<section class="screen support-screen">${hero('HỒ SƠ KHÁM BỆNH','Rà soát hồ sơ khám','Đối chiếu ghi nhận lâm sàng, chỉ định và kế hoạch xử trí trước khi hoàn tất.',btn(`${icon('edit',17)} Quay lại ghi nhận`,'go','btn-outline',`data-to="/encounters/${e(a.id)}"`))}
      <div class="support-review-grid">${panel(`<div class="panel-head"><div><h2>Thông tin buổi khám</h2><p>${e(a.code)} · ${e(a.time)}</p></div>${statePill(a)}</div><div class="support-patient-main">${x.avatar(person(a.personId))}<div><strong>${e(person(a.personId).name)}</strong><small>${e(a.doctor)}</small></div></div><div class="support-rule"></div>${[['Lý do khám',a.reason],['Triệu chứng và khám thực thể',d.symptom],['Nhận định lâm sàng',d.assessment],['Kế hoạch xử trí',d.plan]].map(([k,v])=>`<div class="support-review-item"><span>${k}</span><p>${e(v||'Chưa có thông tin trong bản nháp')}</p></div>`).join('')}<div class="support-form-actions">${btn('Tiếp tục chỉnh sửa','go','btn-outline',`data-to="/encounters/${e(a.id)}"`)}${btn(a.status==='completed'?'Đã hoàn tất':`${icon('check',17)} Hoàn tất hồ sơ`,'review-sign','btn-primary',`data-id="${e(a.id)}" ${a.status==='completed'?'disabled':''}`)}</div>`)}
      ${panel(`<h2>Kiểm tra trước khi hoàn tất</h2><div class="support-check-list"><div>${icon('check',16)} Đúng hồ sơ và lượt khám</div><div>${icon('check',16)} Nội dung đã được người thực hiện xem lại</div><div>${icon('check',16)} Đã rà soát nội dung ghi nhận</div></div><div class="support-note">${icon('info',17)} Thao tác hoàn tất hồ sơ chưa đồng nghĩa với ký số hoặc trả kết quả cho người bệnh.</div>`,'support-guidance')}</div></section>`;
    }
    if(path==='/welcome'){
      return `<section class="screen support-screen"><div class="support-welcome"><div class="support-welcome-copy"><div class="support-welcome-badge">${icon('heart',18)} CAREFLOW CLINIC · PORTFOLIO</div><h1>Chăm sóc kết nối,<br><em>trải nghiệm liền mạch.</em></h1><p>Khám phá một không gian quản lý phòng khám được thiết kế để nhân viên và bác sĩ tập trung vào đúng công việc.</p><div class="support-role-cards"><button data-action="role" data-role="reception"><span class="support-role-icon">${icon('users',24)}</span><span><strong>Không gian lễ tân</strong><small>Yêu cầu, lịch khám và tiếp nhận</small></span>${icon('arrow',20)}</button><button data-action="role" data-role="doctor"><span class="support-role-icon">${icon('clipboard',24)}</span><span><strong>Không gian bác sĩ</strong><small>Buổi khám, kết quả và chỉ định</small></span>${icon('arrow',20)}</button><button data-action="role" data-role="nurse"><span class="support-role-icon">${icon('activity',24)}</span><span><strong>Không gian điều dưỡng</strong><small>Tiếp nhận, chuẩn bị khám và bàn giao</small></span>${icon('arrow',20)}</button></div><p class="support-disclaimer">Dữ liệu minh họa. Đây không phải màn đăng nhập hoặc phần mềm y tế thật.</p></div><div class="support-welcome-art"><div class="support-floating-card"><span>CARE JOURNEY</span><strong>01 — Tiếp nhận</strong><i></i><strong>02 — Khám</strong><i></i><strong>03 — Theo dõi</strong></div><div class="support-orb"></div><div class="support-orb-small"></div></div></div></section>`;
    }
  }
  function action(b,x){
    const k=b.dataset.action, id=b.dataset.id, v=b.dataset.value;
    const {data,ui,person,save,notify,render,go,openAppointment}=x;
    if(k==='request-filter'){ui.requestFilter=v;render();return true}
    if(k==='create-booking'){
      const get=id=>document.getElementById(id)?.value;
      const personId=get('new-patient'),time=get('new-slot'),doctor=get('new-doctor'),mode=get('new-mode'),reason=(get('new-reason')||'').trim();
      if(!personId||!reason){notify('Vui lòng chọn bệnh nhân và nhập ghi chú lịch.');return true}
      if(data.appointments.some(a=>a.doctor===doctor&&a.time===time&&a.status!=='cancelled')){notify('Khung giờ này đã có lịch với bác sĩ đã chọn. Hãy chọn giờ khác.');return true}
      const n=String(Date.now()).slice(-6);
      const a={id:'a-new-'+n,code:'PK-DEMO-'+n,personId,time,mode,status:'pending',owner:'Lễ tân',doctor,reason,history:'Yêu cầu mới · demo',date:'15/10/2026'};
      data.appointments.push(a);save();openAppointment(a.id);return true
    }
    if(k==='checkin-patient'){const a=data.appointments.find(a=>a.id===id);if(!a||a.status!=='confirmed'){notify('Lịch cần được xác nhận trước khi báo đã đến.');return true}a.status='arrived';a.owner='Lễ tân';save();notify('Đã ghi nhận bệnh nhân đến phòng khám (demo).');return true}
    if(k==='ready-patient'){const a=data.appointments.find(a=>a.id===id);if(!a||a.status!=='arrived'){notify('Bệnh nhân chưa được ghi nhận đã đến.');return true}a.status='ready';a.owner='Bác sĩ';save();notify('Đã chuyển bệnh nhân sang hàng chờ khám (demo).');return true}
    if(k==='create-lab-order'){
      const p=document.getElementById('order-person')?.value, type=document.getElementById('order-type')?.value, title=document.getElementById('order-title')?.value.trim();
      if(!p||!title){notify('Vui lòng điền tên yêu cầu minh họa.');return true}
      const n=String(Date.now()).slice(-6);data.results.unshift({id:'r-new-'+n,personId:p,title,type,date:'15/10/2026',status:'waiting',doctor:'BS. Nguyễn Văn An',code:'XN-DEMO-'+n});save();notify('Đã thêm yêu cầu minh họa ở trạng thái chờ thực hiện.');return true
    }
    if(k==='save-rx'){const a=data.appointments.find(a=>a.id===ui.consultId)||data.appointments[0];data.prescriptions??={};data.prescriptions[a.id]=document.getElementById('rx-note')?.value||'';save();notify('Đã lưu ghi chú nháp trong phiên demo.');return true}
    return false;
  }
  root.CareFlowSupporting={page,action,routeNames};
})(window);
