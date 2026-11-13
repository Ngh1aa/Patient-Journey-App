/* CareFlow desktop portfolio: clinical coordination, schedule changes and nursing.
 * Synthetic state only; no real patient information or clinical integrations. */
(function installCareFlowWave3(root){
  'use strict';
  const routeLabels={
    '/nursing':'Nursing overview','/nursing/prepare':'Visit preparation','/nursing/followups':'Post-visit follow-up'
  };
  const allowed=new Set(['pending','confirmed','unreachable']);
  const cancelReasons=['Patient requested cancellation','Unable to attend as scheduled','Visit plan needs to change','Other reason'];
  const options=['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
  const panel=(content,additional='')=>`<section class="panel wave-panel ${additional}">${content}</section>`;
  const heading=(k,title,desc)=>`<div class="wave-heading"><div class="eyebrow">${k}</div><h1>${title}</h1><p>${desc}</p></div>`;
  function initTasks(data){
    data.nursingTasks??=[
      {id:'nt-01',personId:'p-001',title:'Prepare the record before the visit',subtitle:'Check appointment details',kind:'prepare',done:false},
      {id:'nt-02',personId:'p-003',title:'Track results to hand over',subtitle:'Pass to the doctor for review; do not release',kind:'results',done:false},
      {id:'nt-03',personId:'p-005',title:'Check callback schedule',subtitle:'Call not connected',kind:'callback',done:false},
      {id:'nt-04',personId:'p-007',title:'Prepare arriving patient',subtitle:'Check the visit before handover',kind:'prepare',done:false}
    ];
    return data.nursingTasks;
  }
  const listPerson=(a,x)=>`<span class="wave-person">${x.avatar(x.person(a.personId))}<span><strong>${x.e(x.person(a.personId).name)}</strong><small>${x.e(a.time)} · ${x.e(a.code)}</small></span></span>`;
  function schedulePage(id,x){
    const {data,ui,e,btn,pill,icon,person,statePill,appt}=x;
    const a=data.appointments.find(a=>a.id===id);
    if(!a)return `<section class="screen wave-screen">${heading('MANAGE APPOINTMENTS','Appointment not found','This appointment code does not exist.')}${btn('Back to request list','go','btn-primary','data-to="/requests"')}</section>`;
    const p=person(a.personId),modifiable=allowed.has(a.status);
    const pending=ui.schedulePending?.id===a.id?ui.schedulePending:null;
    const history=(data.scheduleHistory||[]).filter(v=>v.id===a.id).slice().reverse();
    return `<section class="screen wave-screen">
      <div class="wave-crumb"><button data-action="go" data-to="/requests">${icon('left',17)} Request list</button><span>/</span><strong>${e(a.code)}</strong></div>
      ${heading('APPOINTMENT COORDINATION','Manage appointment changes','Every reschedule or cancellation has a reason, a confirmation and a clear outcome.')}
      <div class="wave-schedule-grid">
        ${panel(`<div class="wave-panel-head"><div><span class="eyebrow">APPOINTMENT ${e(a.code)}</span><h2>${e(p.name)}</h2><p>${e(a.date)} · ${e(a.doctor)}</p></div>${statePill(a)}</div>
          <div class="wave-detail-tiles"><div><span>Current time</span><strong>${e(a.time)}</strong></div><div><span>Visit type</span><strong>${e(a.mode)}</strong></div><div><span>Assigned to</span><strong>${e(x.ownerLabel(a.owner))}</strong></div></div>
          ${!modifiable?`<div class="wave-warning">${icon('shield',18)} ${a.status==='cancelled'?'Appointment cancelled. You can only view the history; it cannot be restored by confirming again.':'This visit’s status does not allow rescheduling or cancelling at the desk. Please follow the appropriate process.'}</div>`:''}
          ${modifiable?`<div class="wave-form-layout"><section><h3>${icon('calendar',18)} Change time</h3><p>Keep the same doctor and visit type; choose another time on the same day.</p><label class="wave-label" for="wave-time">New time</label><select id="wave-time">${options.map(t=>`<option value="${t}" ${a.time===t?'selected':''}>${t}</option>`).join('')}</select><label class="wave-label" for="wave-reschedule-reason">Reason for change</label><textarea id="wave-reschedule-reason" rows="2" maxlength="160" placeholder="e.g. Patient asked for a different time"></textarea>${btn('Check new time','wave-propose-reschedule','btn-primary',`data-id="${e(a.id)}"`)}</section><section class="wave-cancel-panel"><h3>${icon('clock',18)} Cancel appointment</h3><p>Cancelling requires a reason and confirmation before updating.</p><label class="wave-label" for="wave-cancel-reason">Reason for cancellation</label><select id="wave-cancel-reason"><option value="">Choose a reason</option>${cancelReasons.map(reason=>`<option value="${e(reason)}">${e(reason)}</option>`).join('')}</select>${btn('Continue cancelling','wave-propose-cancel','btn-outline',`data-id="${e(a.id)}"`)}</section></div>`:''}
          ${pending?`<div class="wave-confirm" role="region" aria-label="Confirm change"><div class="wave-confirm-icon">${icon('shield',22)}</div><div><div class="eyebrow">FINAL CONFIRMATION</div><h3>${pending.kind==='cancel'?'Cancel this appointment?':'Change appointment time?'}</h3><p>${pending.kind==='cancel'?`The ${e(a.time)} appointment will change to Cancelled.`:`Change ${e(a.time)} → ${e(pending.time)} and request reconfirmation.`}</p><p><strong>Reason:</strong> ${e(pending.reason)}</p></div><div class="wave-confirm-actions">${btn('Back','wave-discard','btn-outline')}${btn(pending.kind==='cancel'?'Confirm cancellation':'Confirm new time','wave-commit','btn-primary',`data-id="${e(a.id)}"`)}</div></div>`:''}
        `,'wave-schedule-main')}
        ${panel(`<div class="wave-panel-head"><div><h2>Change log</h2><p>Actions on this appointment</p></div>${icon('clipboard',20)}</div><div class="wave-history">${history.length?history.map(h=>`<div class="wave-history-item"><span class="wave-dot"></span><div><strong>${e(h.kind==='cancel'?'Appointment cancelled':'Time changed')}</strong><small>${e(h.kind==='cancel'?h.before:h.before+' → '+h.after)} · ${e(h.reason)}</small></div></div>`).join(''):`<div class="wave-empty">No changes recorded yet.</div>`}</div><div class="wave-note">${icon('info',17)} Rescheduling or cancelling here updates the clinic schedule; reception contacts the patient.</div>`,'wave-side-panel')}
      </div>
    </section>`;
  }
  function nursingNav(x){
    return `<div class="wave-inline-nav">${[['/nursing','Overview'],['/nursing/prepare','Visit preparation'],['/nursing/followups','Post-visit follow-up']].map(([route,label])=>`<a href="#${route}" class="${location.hash==='#'+route?'selected':''}">${x.e(label)}</a>`).join('')}</div>`;
  }
  function nursingHome(x){
    const {data,e,icon,pill,btn,person,resultPill}=x;
    const tasks=initTasks(data),arrived=data.appointments.filter(a=>a.status==='arrived'),ready=data.appointments.filter(a=>a.status==='ready'),open=tasks.filter(t=>!t.done);
    return `<section class="screen wave-screen wave-nursing">
    ${heading('CAREFLOW / NURSING DESK','Nursing & coordination','A calm task hub with clear priorities and easy handovers through the day.')}
    ${nursingNav(x)}
    <div class="wave-nurse-stats">
      <div class="wave-nurse-stat"><span class="wave-stat-icon">${icon('users',22)}</span><small>Awaiting preparation</small><strong>${String(arrived.length).padStart(2,'0')}</strong><span>At the desk</span></div>
      <div class="wave-nurse-stat"><span class="wave-stat-icon">${icon('check',22)}</span><small>Ready to be seen</small><strong>${String(ready.length).padStart(2,'0')}</strong><span>Passed to doctor</span></div>
      <div class="wave-nurse-stat"><span class="wave-stat-icon">${icon('clipboard',22)}</span><small>Open tasks</small><strong>${String(open.length).padStart(2,'0')}</strong><span>Assigned to the team</span></div>
    </div>
    <div class="wave-nurse-layout">
      ${panel(`<div class="wave-panel-head"><div><span class="eyebrow">01 / QUEUE</span><h2>Pre-visit preparation</h2><p>Check-in → review → ready</p></div>${btn('Open queue','go','btn-soft','data-to="/nursing/prepare"')}</div><div class="wave-nurse-items">${arrived.concat(ready).length?arrived.concat(ready).map(a=>`<div class="wave-nurse-item">${listPerson(a,x)}${x.statePill(a)}${a.status==='arrived'?btn('Ready','ready-patient','btn-primary',`data-id="${e(a.id)}"`):btn('View appointment','open-appointment','btn-soft',`data-id="${e(a.id)}"`)}</div>`).join(''):`<div class="wave-empty">No patients awaiting preparation.</div>`}</div>`)}
      ${panel(`<div class="wave-panel-head"><div><span class="eyebrow">02 / PRIORITY TASKS</span><h2>Tasks to follow up</h2><p>Choose a task to handle or hand over</p></div>${btn('View all','go','btn-soft','data-to="/nursing/followups"')}</div><div class="wave-task-list">${open.slice(0,4).map(t=>`<div class="wave-task"><span class="wave-task-glyph">${icon(t.kind==='results'?'beaker':'clipboard',19)}</span><div><strong>${e(t.title)}</strong><small>${e(person(t.personId).name)} · ${e(t.subtitle)}</small></div>${btn('Details','go','btn-soft','data-to="/nursing/followups"')}</div>`).join('')}</div>`)}
    </div></section>`;
  }
  function nursingPrepare(x){
    const {data,e,icon,btn}=x;
    const rows=data.appointments.filter(a=>['arrived','ready','in-consult'].includes(a.status)).sort((a,b)=>a.time.localeCompare(b.time));
    return `<section class="screen wave-screen wave-nursing">
      ${heading('NURSING / PRE-VISIT','Preparing for the visit','Each step has a clear status; nurses only hand over and do not sign off visits.')}
      ${nursingNav(x)}
      ${panel(`<div class="wave-panel-head"><div><h2>Check-in list</h2><p>Distinguishes arrived, ready and in consultation</p></div>${pillCount(rows.length,x)}</div><div class="wave-table-wrap"><table class="wave-table"><thead><tr><th>Patient</th><th>Appointment</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows.length?rows.map(a=>`<tr><td>${listPerson(a,x)}</td><td>${e(a.doctor)}<small>${e(a.mode)}</small></td><td>${x.statePill(a)}</td><td>${a.status==='arrived'?btn('Mark ready','ready-patient','btn-primary',`data-id="${e(a.id)}"`):btn('Details','open-appointment','btn-soft',`data-id="${e(a.id)}"`)}</td></tr>`).join(''):`<tr><td colspan="4" class="wave-empty">No visits to prepare.</td></tr>`}</tbody></table></div>`)}
      <div class="wave-note">${icon('shield',17)} These are coordination statuses only; vital signs are recorded in the visit record.</div>
    </section>`;
  }
  function pillCount(n,x){return x.pill(n+(n===1?' visit':' visits'),'info')}
  function nursingFollowups(x){
    const {data,e,icon,btn,person}=x,tasks=initTasks(data);
    const filter=x.ui.nursingFilter||'all';
    const rows=tasks.filter(t=>filter==='all'||(filter==='open'?!t.done:t.done));
    return `<section class="screen wave-screen wave-nursing">
      ${heading('NURSING / FOLLOW-UP','Follow-up & handover','Only marks internal task progress; it does not contact the patient or give medical advice.')}
      ${nursingNav(x)}
      ${panel(`<div class="wave-panel-head"><div><h2>Post-check-in tasks</h2><p>Status is saved as you work</p></div><div class="segmented" role="group" aria-label="Filter tasks">${[['all','All'],['open','Not done'],['done','Done']].map(([v,t])=>`<button data-action="wave-task-filter" data-value="${v}" class="${filter===v?'selected':''}" aria-pressed="${filter===v}">${t}</button>`).join('')}</div></div>
      <div class="wave-task-list wave-followup-list">${rows.length?rows.map(t=>`<article class="wave-task ${t.done?'is-done':''}"><span class="wave-task-glyph">${icon(t.done?'check':t.kind==='callback'?'message':'clipboard',20)}</span><div><span class="eyebrow">${e(t.kind==='callback'?'CALLBACK':t.kind==='results'?'RESULTS':'PREPARATION')}</span><strong>${e(t.title)}</strong><small>${e(person(t.personId).name)} · ${e(t.subtitle)}</small></div>${x.pill(t.done?'Done':'To do',t.done?'success':'warning')}${btn(t.done?'Reopen task':'Mark done', 'wave-task-toggle', t.done?'btn-outline':'btn-soft',`data-id="${e(t.id)}"`)}</article>`).join(''):`<div class="wave-empty">No tasks match the filter. Choose another status.</div>`}</div><div class="wave-panel-foot"><span>${rows.length} task${rows.length===1?'':'s'}</span><span>Internal tasks · Patients are not notified automatically</span></div>`)}
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
      if(!a||!allowed.has(a.status)){notify('This appointment cannot be rescheduled or cancelled.');return true}
      const isCancel=kind==='wave-propose-cancel';
      const time=document.getElementById('wave-time')?.value;
      const reason=(document.getElementById(isCancel?'wave-cancel-reason':'wave-reschedule-reason')?.value||'').trim();
      if(!reason){notify('Please choose or enter a reason before continuing.');return true}
      if(!isCancel&&time===a.time){notify('Choose a new time different from the current one.');return true}
      if(!isCancel&&data.appointments.some(other=>other.id!==id&&other.doctor===a.doctor&&other.date===a.date&&other.time===time&&other.status!=='cancelled')){notify('The selected time clashes with another appointment for the same doctor. Please choose another slot.');return true}
      ui.schedulePending={id,kind:isCancel?'cancel':'reschedule',reason,time:time||null};render();return true;
    }
    if(kind==='wave-commit'){
      const a=data.appointments.find(a=>a.id===id),pending=ui.schedulePending;
      if(!a||!pending||pending.id!==id||!allowed.has(a.status)){ui.schedulePending=null;notify('The change request is no longer valid.');return true}
      if(pending.kind==='reschedule'&&data.appointments.some(other=>other.id!==id&&other.doctor===a.doctor&&other.date===a.date&&other.time===pending.time&&other.status!=='cancelled')){ui.schedulePending=null;notify('The new time is no longer free. Please choose again.');return true}
      data.scheduleHistory??=[];
      data.scheduleHistory.push({id,kind:pending.kind,before:a.time,after:pending.kind==='reschedule'?pending.time:null,reason:pending.reason});
      if(pending.kind==='cancel'){a.status='cancelled';a.owner='reception';}
      else{a.time=pending.time;a.status='pending';a.owner='reception';}
      const message=pending.kind==='cancel'?'Appointment cancelled.':'Time changed. The appointment is awaiting reconfirmation.';
      ui.schedulePending=null;save();notify(message);return true;
    }
    if(kind==='wave-task-filter'){ui.nursingFilter=b.dataset.value;render();return true}
    if(kind==='wave-task-toggle'){const t=initTasks(data).find(x=>x.id===id);if(!t)return true;t.done=!t.done;save();notify(t.done?'Marked as done.':'Task reopened.');return true}
    return false;
  }
  root.CareFlowWave3={page,action,routeLabels};
})(window);
