/* CareFlow supporting showcase screens: synthetic UI only. */
(function installSupporting(root){
  'use strict';
  const A=root.CareFlowCopy.ui;
  const R={
    '/requests':'Booking requests','/booking/new':'Create appointment',
    '/checkin':'Patient check-in','/queue':'Visit queue',
    '/clinical/orders':'Create order','/clinical/prescription':'Prescription',
    '/clinical/review':A.reviewEncounter,'/welcome':'Choose workspace'
  };
  const routeNames=()=>R;
  const panel=(content,cls='')=>`<section class="panel support-panel ${cls}" ${root.CareFlowUI.cardAttrs('surface')}>${content}</section>`;
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
      return `<section class="screen support-screen">${hero('APPOINTMENT COORDINATION','Booking requests','Every request must be checked before moving to the next status.',btn(`${icon('plus',17)} Create appointment`,'go','btn-primary','data-to="/booking/new"'))}
        <div class="support-metrics"><div>${icon('clock',19)}<strong>${list.filter(a=>a.status==='pending').length}</strong><span>Awaiting confirmation</span></div><div>${icon('shield',19)}<strong>${list.filter(a=>a.status==='review').length}</strong><span>Needs clinical review</span></div><div>${icon('message',19)}<strong>${list.filter(a=>a.status==='unreachable').length}</strong><span>Not yet reached</span></div></div>
        ${panel(`<div class="panel-head"><div><h2>To-do list</h2><p>Select a row to open it and take the appropriate action</p></div><div class="segmented" role="group" aria-label="Filter requests">${[['all','All'],['pending','Awaiting confirmation'],['review','Needs review'],['unreachable','Callback']].map(([v,t])=>`<button class="${match===v?'selected':''}" data-action="request-filter" data-value="${v}" aria-pressed="${match===v}">${t}</button>`).join('')}</div></div>${appointmentsTable(visible)}<div class="panel-foot"><span>${visible.length} / ${list.length} request${list.length===1?'':'s'}</span><span>Actions only change sample data</span></div>`)}</section>`;
    }
    if(path==='/booking/new'){
      const options=people.map(p=>`<option value="${e(p.id)}">${e(p.name)} · ${e(p.code)}</option>`).join('');
      return `<section class="screen support-screen">${hero('RECEPTION · NEW REQUEST','Create appointment','A simple flow showing how reception creates an appointment, with a demo double-booking check.',btn(`${icon('left',16)} Request list`,'go','btn-outline','data-to="/requests"'))}
      <div class="support-two-col">${panel(`<div class="panel-head"><div><h2>Appointment details</h2><p>Fill in the details and check before sending</p></div>${pill('Demo','info')}</div><div class="support-form">
      ${formField('new-patient','Patient',`<select id="new-patient">${options}</select>`)}
      <div class="support-form-grid">${formField('new-mode','Visit type',`<select id="new-mode"><option>In person</option><option>Online visit</option></select>`)}${formField('new-doctor','Assigned doctor',`<select id="new-doctor"><option>Dr. Nguyễn Văn An</option><option>Dr. Trần Phương Linh</option></select>`)}</div>
      <div class="support-form-grid">${formField('new-date','Visit date',`<input id="new-date" value="15/10/2026" readonly>`, 'Uses a fixed simulated date in the portfolio')}${formField('new-slot','Time',`<select id="new-slot">${['08:00','09:00','09:30','10:00','13:30','14:30','15:00','15:30'].map(t=>`<option ${t==='14:30'?'selected':''}>${t}</option>`).join('')}</select>`)}</div>
      ${formField('new-reason','Appointment note',`<input id="new-reason" maxlength="100" value="Sample visit request" placeholder="Reason for contact">`,'Do not enter real health data')}
      <div class="support-form-actions">${btn('Back','go','btn-outline','data-to="/requests"')}${btn(`${icon('check',17)} Send demo request`,'create-booking','btn-primary')}</div></div>`,'support-form-panel')}
      ${panel(`<div class="support-guide-icon">${icon('shield',25)}</div><h2>Workflow shown</h2><ol class="support-steps"><li>Choose an existing record</li><li>Choose visit type, doctor and a free slot</li><li>Send the request with status awaiting confirmation</li><li>Open it and confirm in the drawer</li></ol><div class="support-note">${icon('info',17)} The system only checks demo appointments with the same doctor and time. There are no real appointments.</div>`,'support-guidance')}</div></section>`;
    }
    if(path==='/checkin'){
      const rows=data.appointments.filter(a=>['pending','confirmed','arrived','ready','in-consult','completed'].includes(a.status)).sort((a,b)=>a.time.localeCompare(b.time));
      return `<section class="screen support-screen">${hero('FRONT-DESK CHECK-IN','Patient check-in','View appointments, confirm patient arrival and hand over to the queue.',btn(`${icon('users',17)} View queue`,'go','btn-primary','data-to="/queue"'))}
      <div class="support-metrics"><div>${icon('calendar',19)}<strong>${rows.filter(a=>a.status==='confirmed').length}</strong><span>Expected</span></div><div>${icon('check',19)}<strong>${rows.filter(a=>a.status==='arrived').length}</strong><span>At the desk</span></div><div>${icon('activity',19)}<strong>${rows.filter(a=>['ready','in-consult'].includes(a.status)).length}</strong><span>In the queue</span></div></div>
      ${panel(`<div class="panel-head"><div><h2>Today’s appointments</h2><p>All statuses are sample data</p></div>${pill('15/10/2026','info')}</div><div class="support-list">${rows.map(a=>`<article class="support-patient-row"><div class="support-patient-main">${x.avatar(person(a.personId))}<div><strong>${e(person(a.personId).name)}</strong><small>${e(a.code)} · ${e(a.time)} · ${e(a.mode)}</small></div></div>${statePill(a)}<div class="support-row-actions">${btn('Appointment','open-appointment','btn-soft',`data-id="${e(a.id)}"`)}${a.status==='confirmed'?btn('Check in','checkin-patient','btn-primary',`data-id="${e(a.id)}"`):a.status==='arrived'?btn('Ready to be seen','ready-patient','btn-primary',`data-id="${e(a.id)}"`):''}</div></article>`).join('')}</div><div class="panel-foot"><span>Confirm the appointment before check-in</span><span>${rows.length} appointment${rows.length===1?'':'s'}</span></div>`)}</section>`;
    }
    if(path==='/queue'){
      const stages=[['arrived','Arrived · awaiting check-in'],['ready','Ready to be seen'],['in-consult','In consultation']];
      return `<section class="screen support-screen">${hero('WORKFLOW','Visit queue','Organise visits by status, priority and owner.',btn(`${icon('calendar',17)} Check-in`,'go','btn-primary','data-to="/checkin"'))}
      <div class="support-kanban">${stages.map(([status,label])=>{const items=data.appointments.filter(a=>a.status===status).sort((a,b)=>a.time.localeCompare(b.time));return `<section class="support-lane"><div class="support-lane-head"><h2>${label}</h2><strong>${items.length.toString().padStart(2,'0')}</strong></div><div class="support-lane-items">${items.length?items.map(a=>`<article class="support-queue-card"><div class="support-ticket">${e(a.code)} <span>${e(a.time)}</span></div><div class="support-patient-main">${x.avatar(person(a.personId))}<div><strong>${e(person(a.personId).name)}</strong><small>${e(a.doctor)}</small></div></div><div class="support-queue-status">${statePill(a)}</div><div class="support-card-actions">${btn('Details','open-appointment','btn-outline',`data-id="${e(a.id)}"`)}${status==='arrived'?btn('Ready','ready-patient','btn-soft',`data-id="${e(a.id)}"`):status==='ready'?btn('Open visit','start-consult','btn-soft',`data-id="${e(a.id)}"`):btn('Consultation','go','btn-soft',`data-to="/encounters/${e(a.id)}"`)}</div></article>`).join(''):empty('No patients at this step.')}</div></section>`}).join('')}</div><p class="support-footnote">Status changes through confirmation actions; patients do not move automatically over simulated time.</p></section>`;
    }
    if(path==='/clinical/orders'){
      const rows=data.results.filter(r=>r.doctor.includes('Nguyễn Văn An'));
      const doctorPatientIds=new Set(data.appointments.filter(a=>a.doctor.includes('Nguyễn Văn An')).map(a=>a.personId));
      const assignedPeople=people.filter(p=>doctorPatientIds.has(p.id));
      return `<section class="screen support-screen">${hero('DIAGNOSTICS','Diagnostic orders','Orders and results related to the doctor’s visits.',btn(`${icon('beaker',17)} View results`,'go','btn-primary','data-to="/results"'))}
      <div class="support-two-col">${panel(`<div class="panel-head"><div><h2>Order list</h2><p>Track order status and received results</p></div>${pill(rows.length+(rows.length===1?' item':' items'),'info')}</div><div class="support-list">${rows.map(r=>`<div class="support-patient-row"><div class="support-patient-main"><span class="support-icon">${icon('beaker',19)}</span><div><strong>${e(r.title)}</strong><small>${e(person(r.personId).name)} · ${e(r.code)}</small></div></div>${resultPill(r)}${btn('Result','show-result','btn-soft',`data-id="${e(r.id)}"`)}</div>`).join('')}</div>`)}
      ${panel(`<div class="panel-head"><div><h2>Draft order</h2><p>Record the details before sending to the performing department</p></div></div><div class="support-form">
      ${formField('order-person','Patient record',`<select id="order-person">${assignedPeople.map(p=>`<option value="${e(p.id)}">${e(p.name)}</option>`).join('')}</select>`)}
      ${formField('order-type','Request type',`<select id="order-type"><option value="Lab test">Lab test</option><option value="Imaging">Imaging</option></select>`)}
      ${formField('order-title','Order details',`<input id="order-title" maxlength="80" placeholder="Enter what to order">`)}
      <div class="support-note">${icon('shield',17)} The internal draft has not been sent to the laboratory or imaging department.</div>${btn(`${icon('plus',17)} Save draft order`,'create-lab-order','btn-primary btn-full')}</div>`,'support-form-panel')}</div></section>`;
    }
    if(path==='/clinical/prescription'){
      const a=data.appointments.find(v=>v.id===ui.consultId)||data.appointments.find(v=>v.status==='in-consult')||data.appointments[0];
      const notes=(data.prescriptions||{})[a.id]||'';
      return `<section class="screen support-screen">${hero('VISIT RECORD','Prescription','Check the prescription status and save notes to help complete the visit record.',btn(`${icon('left',17)} Back to consultation`,'go','btn-outline',`data-to="/encounters/${e(a.id)}"`))}
      <div class="support-two-col">${panel(`<div class="panel-head"><div><h2>Visit information</h2><p>${e(a.code)} · ${e(a.doctor)}</p></div>${statePill(a)}</div><div class="support-patient-main">${x.avatar(person(a.personId))}<div><strong>${e(person(a.personId).name)}</strong><small>${e(a.reason)} · ${e(a.time)}</small></div></div><div class="support-rule"></div><div class="support-document"><span>PRESCRIPTION STATUS</span><h2>Not prescribed</h2><p>No medication has been recorded for this visit.</p><div class="support-rx-metadata"><div><span>Record</span><strong>${e(person(a.personId).code)}</strong></div><div><span>Visit</span><strong>${e(a.code)}</strong></div></div></div>`,'support-document-panel')}
      ${panel(`<div class="panel-head"><div><h2>Record notes</h2><p>Record relevant information before completing</p></div></div><div class="support-form">${formField('rx-note','Note',`<textarea id="rx-note" rows="5" maxlength="500" placeholder="Enter a note to save to the record...">${e(notes)}</textarea>`,'Saves an internal note only; this is not a prescription')}<div class="support-note">${icon('shield',17)} Not connected to a prescribing or digital signature system.</div>${btn(`${icon('file',17)} Save note`,'save-rx','btn-primary btn-full')}</div>`,'support-form-panel')}</div></section>`;
    }
    if(path==='/clinical/review'){
      const a=data.appointments.find(v=>v.id===ui.consultId)||data.appointments.find(v=>v.status==='in-consult')||data.appointments[0];
      const d=data.drafts[a.id]||{};
      return `<section class="screen support-screen">${hero('VISIT RECORD','Review visit record','Check clinical notes, orders and the management plan before completing.',btn(`${icon('edit',17)} Back to notes`,'go','btn-outline',`data-to="/encounters/${e(a.id)}"`))}
      <div class="support-review-grid">${panel(`<div class="panel-head"><div><h2>Consultation details</h2><p>${e(a.code)} · ${e(a.time)}</p></div>${statePill(a)}</div><div class="support-patient-main">${x.avatar(person(a.personId))}<div><strong>${e(person(a.personId).name)}</strong><small>${e(a.doctor)}</small></div></div><div class="support-rule"></div>${[['Reason for visit',a.reason],['Symptoms and physical examination',d.symptom],['Clinical assessment',d.assessment],['Management plan',d.plan]].map(([k,v])=>`<div class="support-review-item"><span>${k}</span><p>${e(v||'Nothing in the draft yet')}</p></div>`).join('')}<div class="support-form-actions">${btn('Continue editing','go','btn-outline',`data-to="/encounters/${e(a.id)}"`)}${btn(a.status==='completed'?'Completed':`${icon('check',17)} Complete record`,'review-sign','btn-primary',`data-id="${e(a.id)}" ${a.status==='completed'?'disabled':''}`)}</div>`)}
      ${panel(`<h2>Checks before completing</h2><div class="support-check-list"><div>${icon('check',16)} Correct record and visit</div><div>${icon('check',16)} Content reviewed by the author</div><div>${icon('check',16)} Recorded notes reviewed</div></div><div class="support-note">${icon('info',17)} Completing the record does not mean it is digitally signed or released to the patient.</div>`,'support-guidance')}</div></section>`;
    }
    if(path==='/welcome'){
      return `<section class="screen support-screen"><div class="support-welcome"><div class="support-welcome-copy"><div class="support-welcome-badge">${icon('heart',18)} CAREFLOW CLINIC · PORTFOLIO</div><h1>Connected care,<br><em>a seamless experience.</em></h1><p>Explore a clinic workspace designed to help staff and doctors focus on the right work.</p><div class="support-role-cards"><button data-action="role" data-role="reception"><span class="support-role-icon">${icon('users',24)}</span><span><strong>Reception workspace</strong><small>Requests, appointments and check-in</small></span>${icon('arrow',20)}</button><button data-action="role" data-role="doctor"><span class="support-role-icon">${icon('clipboard',24)}</span><span><strong>Doctor workspace</strong><small>Consultations, results and orders</small></span>${icon('arrow',20)}</button><button data-action="role" data-role="nurse"><span class="support-role-icon">${icon('activity',24)}</span><span><strong>Nursing workspace</strong><small>Check-in, visit preparation and handover</small></span>${icon('arrow',20)}</button></div><p class="support-disclaimer">Sample data. This is not a sign-in screen or real medical software.</p></div><div class="support-welcome-art"><div class="support-floating-card"><span>CARE JOURNEY</span><strong>01 — Check-in</strong><i></i><strong>02 — Consultation</strong><i></i><strong>03 — Follow-up</strong></div><div class="support-orb"></div><div class="support-orb-small"></div></div></div></section>`;
    }
  }
  function action(b,x){
    const k=b.dataset.action, id=b.dataset.id, v=b.dataset.value;
    const {data,ui,person,save,notify,render,go,openAppointment}=x;
    if(k==='request-filter'){ui.requestFilter=v;render();return true}
    if(k==='create-booking'){
      const get=id=>document.getElementById(id)?.value;
      const personId=get('new-patient'),time=get('new-slot'),doctor=get('new-doctor'),mode=get('new-mode'),reason=(get('new-reason')||'').trim();
      if(!personId||!reason){notify('Please choose a patient and enter an appointment note.');return true}
      if(data.appointments.some(a=>a.doctor===doctor&&a.time===time&&a.status!=='cancelled')){notify('This time slot is already booked with the selected doctor. Choose another time.');return true}
      const n=String(Date.now()).slice(-6);
      const a={id:'a-new-'+n,code:'PK-DEMO-'+n,personId,time,mode,status:'pending',owner:'reception',doctor,reason,history:'New request · demo',date:'15/10/2026'};
      data.appointments.push(a);save();openAppointment(a.id);return true
    }
    if(k==='checkin-patient'){const a=data.appointments.find(a=>a.id===id);if(!a||a.status!=='confirmed'){notify('The appointment must be confirmed before check-in.');return true}a.status='arrived';a.owner='reception';save();notify('Patient arrival recorded (demo).');return true}
    if(k==='ready-patient'){const a=data.appointments.find(a=>a.id===id);if(!a||a.status!=='arrived'){notify('The patient has not been checked in yet.');return true}a.status='ready';a.owner='doctor';save();notify('Patient moved to the visit queue (demo).');return true}
    if(k==='create-lab-order'){
      const p=document.getElementById('order-person')?.value, type=document.getElementById('order-type')?.value, title=document.getElementById('order-title')?.value.trim();
      if(!p||!title){notify('Please enter the order details.');return true}
      const n=String(Date.now()).slice(-6);data.results.unshift({id:'r-new-'+n,personId:p,title,type,date:'15/10/2026',status:'waiting',doctor:'Dr. Nguyễn Văn An',code:'XN-DEMO-'+n});save();notify('Order recorded with status awaiting test.');return true
    }
    if(k==='save-rx'){const a=data.appointments.find(a=>a.id===ui.consultId)||data.appointments[0];data.prescriptions??={};data.prescriptions[a.id]=document.getElementById('rx-note')?.value||'';save();notify('Note saved in this session.');return true}
    return false;
  }
  root.CareFlowSupporting={page,action,routeNames};
})(window);
