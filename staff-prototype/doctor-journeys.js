/* CareFlow patient journey demos — synthetic-only role-safe clinician views. */
(function installClinicalJourneys(root){
  'use strict';
  const UI=root.CareFlowUI, COPY=root.CareFlowCopy, A=COPY.ui;
  const doctor='Nguyễn Văn An';
  const isDoctor=a=>a?.doctor?.includes(doctor);
  const tasks=x=>x.data.doctorTasks||[];
  const P=(x,id)=>x.person(id);
  const taskState=t=>t.done?'Done':'Open';
  const options=[
    {value:'follow',label:'Monitor symptoms',owner:'doctor',next:'Monitor response and reassess as needed',route:'/doctor/followups'},
    {value:'explain',label:'Book a results discussion',owner:'coordinator',next:'Contact the patient to propose a results discussion',route:'/doctor/followups'},
    {value:'more',label:'Consider further orders',owner:'doctor',next:'Consider further diagnostic orders',route:'/clinical/orders'},
    {value:'notify',label:'Hand over notification',owner:'coordinator',next:'Coordinator contacts the patient about the result',route:'/doctor/followups'}
  ];
  function status(x,a){return x.statePill(a)}
  function reviewable(x){return x.data.appointments.filter(a=>isDoctor(a)&&a.status==='review'&&a.owner==='doctor')}
  function handoffs(x){return x.data.appointments.filter(a=>isDoctor(a)&&a.status==='review'&&a.owner==='coordinator')}
  function online(x){return x.data.appointments.filter(a=>isDoctor(a)&&a.mode.toLowerCase().includes('online'))}
  function summary(x,section='all',view){
    // The dashboard composes existing journey data, destinations and guarded actions.
    if(!view)return '';
    const {state,filterButtons,selectFilter,cardHeading,emptyCard}=view;
    if(section==='decision'){
      const mine=reviewable(x),delegated=handoffs(x),filter=state.decision||'mine';
      const list=filter==='mine'?mine:filter==='handoff'?delegated:[...mine,...delegated];
      return `<section class="doctor-surface doctor-decision-card" ${UI.cardAttrs('surface')} data-priority="decisions" aria-labelledby="doctor-decision-title">
        ${cardHeading(x,'02 / DECISIONS NEEDED','Pre-visit requests','Review requests and send a recommendation to the coordinator.',mine.length,'doctor-decision-title')}
        ${filterButtons(x,'decision',[['mine','Awaiting doctor',mine.length],['handoff','Handed over',delegated.length],['all','All',mine.length+delegated.length]],'Filter pre-visit requests')}
        <div class="doctor-card-list">${list.map(a=>{const p=P(x,a.personId),entry=x.data.doctorReviews?.[a.id],isHandoff=a.owner==='coordinator';return `<article class="doctor-decision-item" data-decision-id="${x.e(a.id)}"><div class="doctor-item-identity">${x.avatar(p)}<div><h3>${x.e(p.name)}</h3><p>${x.e(p.code)} · ${x.e(a.code)}</p></div></div>
          ${UI.facts([['Appointment time',a.time+' · '+a.date],['Visit type',UI.modeText(a.mode)],['Reason for visit',a.reason||'Not recorded'],['Assigned to',x.ownerLabel(a.owner)]],x.e,'doctor-decision-facts')}
          <div class="doctor-decision-note"><strong>${isHandoff?'Recommendation handed over':'Information to review'}</strong><p>${x.e(isHandoff?(entry?.decision||'Awaiting coordinator pickup'):(a.history||'Visit type not yet confirmed.'))}</p>${isHandoff&&entry?.note?`<p>${x.e(entry.note)}</p>`:''}</div>
          <div class="doctor-item-bottom">${status(x,a)}${x.btn(isHandoff?'View handover':A.reviewRequest,'go','btn-secondary',`data-to="/doctor/review/${x.e(a.id)}"`)}</div></article>`}).join('')||emptyCard(x,filter==='handoff'?'No handed-over requests yet':'No requests awaiting the doctor','Switch groups to see other requests.')}</div>
        <footer class="doctor-card-footnote">The coordinator picks up the recommendation; the appointment is not confirmed automatically.</footer></section>`;
    }
    if(section==='online'){
      const all=online(x).sort((a,b)=>a.time.localeCompare(b.time));
      const needsSupport=a=>a.status==='unreachable'||x.data.onlineVisits?.[a.id]?.connection==='handoff';
      const prepare=a=>a.status==='ready'&&!needsSupport(a);
      const filter=state.online||'all',list=all.filter(a=>filter==='all'||(filter==='prepare'?prepare(a):needsSupport(a)));
      return `<section class="doctor-surface doctor-online-card" ${UI.cardAttrs('surface')} aria-labelledby="doctor-online-title">${cardHeading(x,'ONLINE SESSIONS','Visit connection','Check the connection before starting the visit.',all.length,'doctor-online-title')}
        ${filterButtons(x,'online',[['all','All',all.length],['prepare','Prepare',all.filter(prepare).length],['support','Needs support',all.filter(needsSupport).length]],'Filter online sessions')}
        <div class="doctor-card-list">${list.map(a=>{const p=P(x,a.personId),connection=x.data.onlineVisits?.[a.id],connected=connection?.connection==='connected',support=needsSupport(a),active=a.status==='in-consult',complete=a.status==='completed';return `<article class="doctor-online-item" data-online-id="${x.e(a.id)}"><div class="doctor-online-time"><strong>${x.e(a.time)}</strong><span>Appointment time</span></div><div class="doctor-online-content"><h3>${x.e(p.name)}</h3><p>${x.e(p.code)} · ${x.e(a.code)}</p><p>Date ${x.e(a.date)}</p><p>${x.e(a.reason||'No reason for visit recorded')}</p><div class="doctor-connection"><span class="doctor-connection-dot ${support?'needs-support':connected?'is-connected':''}" aria-hidden="true"></span><strong>${complete?'Consultation completed':active?'Consultation in progress':support?'Needs coordinator support':connected?'Connection confirmed':'Connection not confirmed'}</strong></div><p>Assigned to: ${x.e(x.ownerLabel(a.owner))}${connection?.choice?' · '+x.e(connection.choice):''}</p><div class="doctor-card-actions">${x.btn(complete?'Review consultation':active?A.continueConsult:support?'View handling options':connected?'Start online visit':'Prepare connection',connected&&prepare(a)?'start-consult':'go','btn-secondary',connected&&prepare(a)?`data-id="${x.e(a.id)}"`:`data-to="${complete||active?'/encounters/':'/doctor/online/'}${x.e(a.id)}"`)}</div></div></article>`}).join('')||emptyCard(x,'No matching sessions','Try another group to see online appointments.')}</div>
        <footer class="doctor-card-footnote">The connection is simulated in the prototype; no real call is made.</footer></section>`;
    }
    if(section==='aftercare'){
      const all=tasks(x),owner=state.taskOwner||'mine',statusFilter=state.taskStatus||'open';
      const inState=t=>statusFilter==='all'||(statusFilter==='done'?t.done:!t.done);
      const norm=d=>{const [day,month,year]=String(d||'').split('/').map(Number);return year*10000+month*100+day||0};
      const list=all.filter(t=>inState(t)&&(owner==='all'||(owner==='mine'?t.owner==='doctor':t.owner!=='doctor'))).sort((a,b)=>norm(a.due)-norm(b.due));
      return `<section class="doctor-surface doctor-aftercare-card" ${UI.cardAttrs('surface')} aria-labelledby="doctor-aftercare-title">${cardHeading(x,'AFTER THE VISIT / FOLLOW-UP','Record tasks','Sorted by due date; every task has an owner.',all.filter(t=>!t.done).length,'doctor-aftercare-title')}
        <div class="doctor-task-toolbar">${filterButtons(x,'taskOwner',[['mine','Doctor’s',all.filter(t=>inState(t)&&t.owner==='doctor').length],['delegated','Delegated',all.filter(t=>inState(t)&&t.owner!=='doctor').length],['all','All',all.filter(inState).length]],'Filter by task owner')}${selectFilter(x,'taskStatus','Task status',[['open','Open'],['done','Done'],['all','All statuses']])}</div>
        <div class="doctor-card-list">${list.map(t=>{const p=P(x,t.personId),result=t.sourceResult&&x.data.results.find(r=>r.id===t.sourceResult&&isDoctor(r));const targetLabel=result?'View result':t.route?.startsWith('/patients/')?A.viewPatient:t.route?.startsWith('/doctor/online/')?'View online session':t.route?.startsWith('/doctor/review/')?'View handover':t.route==='/clinical/orders'?'View orders':'View follow-up tasks';return `<article class="doctor-task-item ${t.done?'is-done':''}" ${UI.cardAttrs('row')} data-task-id="${x.e(t.id)}"><div class="doctor-item-eyebrow"><span>${x.e(t.category||'Follow-up')}</span>${x.pill(taskState(t),t.done?'success':'neutral')}</div><h3>${x.e(t.title)}</h3><p>${x.e(p.name)} · ${x.e(p.code)}</p>
          ${t.desc&&(!result||result.status!=='reviewed')?`<p>${x.e(t.desc)}</p>`:''}${UI.facts([['Due',t.due||'No due date'],['Assigned to',x.ownerLabel(t.owner)]],x.e,'doctor-task-facts')}
          <p class="doctor-task-next"><strong>Next step</strong>${x.e(t.next||t.desc||'Open the record to review the task.')}</p><div class="doctor-card-actions">${x.btn(targetLabel,result?'show-result':'go','btn-secondary',result?`data-id="${x.e(result.id)}"`:`data-to="${x.e(t.route||'/doctor/followups')}"`)}${t.owner==='doctor'?x.btn(t.done?'Reopen task':'Mark as done','doc-task-toggle','btn-soft',`data-id="${x.e(t.id)}"`):`<span class="doctor-task-owner-note">Waiting for ${x.e(x.ownerLabel(t.owner))}</span>`}</div></article>`}).join('')||emptyCard(x,'No matching tasks','Try another status or owner.')}</div>
        <footer class="doctor-card-footer"><a href="#/doctor/followups" ${UI.buttonAttrs('text')}>${x.e(A.viewFollowups)} ${x.icon('arrow',16)}</a></footer></section>`;
    }
    return '';
  }

  function triage(path,x){
    const a=x.data.appointments.find(v=>v.id===path.split('/').pop()&&isDoctor(v)&&v.status==='review');
    if(!a)return `<section class="screen doctor-screen"><h1>No requests to review</h1><a href="#/doctor">Back to overview</a></section>`;
    const p=P(x,a.personId),entry=x.data.doctorReviews?.[a.id],done=a.owner==='coordinator';
    return `<section class="screen doctor-screen doctor-journey-page"><div class="doctor-kicker">PRE-VISIT / REVIEW NEEDED</div><div class="doctor-heading"><div class="doctor-heading-grid"><div><h1>Review visit request</h1><p>Review the information and send a recommendation to the coordination team. This does not replace emergency triage.</p></div></div></div>
    <div class="journey-page-grid"><section class="doctor-surface journey-panel" ${UI.cardAttrs('surface')}><div class="doctor-overline">REQUEST RECORD</div><h2>${x.e(p.name)}</h2>${UI.facts([['Visit code',a.code],['Reason for visit',a.reason],['Visit type',UI.modeText(a.mode)],['Assigned to',x.ownerLabel(a.owner)]],x.e,'journey-facts')}${status(x,a)}
      <div class="journey-warning"><strong>Triage note</strong><p>The initial information is not enough to rule out risk. Suspected emergencies must follow the facility’s clinical procedures.</p></div><a class="journey-text-link" ${UI.buttonAttrs('text')} href="#/patients/${x.e(p.id)}">${x.e(A.viewPatient)} ${x.icon('arrow',16)}</a></section>
    <section class="doctor-surface journey-panel" ${UI.cardAttrs('surface')}><div class="doctor-overline">DECISION / HANDOVER</div><h2>${done?'Recommendation sent':'Record a recommendation for the coordinator'}</h2>${done?`<div class="journey-confirm"><strong>Awaiting coordinator</strong><p>${x.e(entry?.decision||'Review request recorded.')}</p><span>Assigned to: Coordinator · Appointment not confirmed</span></div>`:`<label class="journey-field">Recommended approach<select id="journey-triage-decision"><option value="">Choose an approach</option><option value="Request more information">Request more information</option><option value="Ask coordinator to arrange an in-person visit">Ask coordinator to arrange an in-person visit</option><option value="Ask coordinator to arrange an online visit">Ask coordinator to arrange an online visit</option></select></label><label class="journey-field">Handover note<textarea id="journey-triage-note" rows="4" maxlength="400" placeholder="What the coordinator needs to verify..."></textarea></label>${x.btn('Hand over to coordinator','doc-triage-handoff','btn-primary',`data-id="${x.e(a.id)}"`)}`}<p class="journey-footnote">A recommendation does not change the visit type, confirm the appointment or notify the patient.</p></section></div></section>`;
  }
  function onlinePage(path,x){
    const a=x.data.appointments.find(v=>v.id===path.split('/').pop()&&isDoctor(v)&&v.mode.toLowerCase().includes('online'));
    if(!a)return `<section class="screen doctor-screen"><h1>No matching online appointment</h1><a href="#/doctor">Back to overview</a></section>`;
    const p=P(x,a.personId),d=x.data.onlineVisits?.[a.id]||{},connected=d.connection==='connected',handoff=d.connection==='handoff';
    return `<section class="screen doctor-screen doctor-journey-page"><div class="doctor-kicker">ONLINE VISIT / CONNECTION</div><div class="doctor-heading"><div class="doctor-heading-grid"><div><h1>Prepare the online visit</h1><p>Record the connection status; hand over to the coordinator if a callback or a change of visit type is needed.</p></div></div></div>
      <div class="journey-page-grid"><section class="doctor-surface journey-panel" ${UI.cardAttrs('surface')}><div class="doctor-overline">CONSULTATION DETAILS</div><h2>${x.e(p.name)}</h2>${UI.facts([['Appointment time',a.time+' · '+a.date],['Visit status',UI.status(a.status).label],['Assigned to',x.ownerLabel(a.owner)],['Connection',connected?'Connection confirmed':handoff?'Handed over':'Not connected']],x.e,'journey-facts')}<a class="journey-text-link" ${UI.buttonAttrs('text')} href="#/patients/${x.e(p.id)}">${x.e(A.viewPatient)} ${x.icon('arrow',16)}</a></section>
      <section class="doctor-surface journey-panel" ${UI.cardAttrs('surface')}><div class="doctor-overline">NEXT STEP</div><h2>${connected?'Ready to start':handoff?'Awaiting coordinator':'Resolve connection'}</h2>
      ${connected?`<p class="journey-confirm">A successful connection was simulated. No real call has been made.</p>${x.btn('Start online visit','start-consult','btn-primary',`data-id="${x.e(a.id)}"`)}`:handoff?`<p class="journey-confirm">Handed over to Coordinator: ${x.e(d.choice)}. No appointment changed and no real notification sent.</p><a href="#/doctor/followups" class="journey-text-link" ${UI.buttonAttrs('text')}>View follow-up tasks ${x.icon('arrow',16)}</a>`:`${a.status==='ready'?x.btn('Simulate connected','doc-online-connect','btn-primary',`data-id="${x.e(a.id)}"`):''}<label class="journey-field">If the connection fails<select id="journey-online-choice"><option value="Call back and help connect">Call back and help connect</option><option value="Propose another online appointment">Propose another online appointment</option><option value="Propose switching to in person">Propose switching to in person</option></select></label>${x.btn('Hand over connection issue','doc-online-handoff','btn-soft',`data-id="${x.e(a.id)}"`)}`}<p class="journey-footnote">Simulates the communication status; no real video call or rescheduling.</p></section></div></section>`;
  }
  const fold = value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLocaleLowerCase('en-GB');
  function followups(x){
    const filter=x.ui.followupFilter||{status:'all',owner:'all',query:''};
    const displayed=tasks(x).filter(t=>(filter.status==='all'||(filter.status==='done')===t.done)&&(filter.owner==='all'||(filter.owner==='mine')===(t.owner==='doctor'))&&fold([t.title,t.desc,P(x,t.personId).name,x.ownerLabel(t.owner),t.category].join(' ')).includes(fold(filter.query).trim()));
    const active=tasks(x).filter(t=>!t.done);
    const byDue=[...active].sort((a,b)=>{const norm=d=>{const [day,month,year]=d.split('/').map(Number);return year*10000+month*100+day};return norm(a.due)-norm(b.due)});
    return `<section class="screen doctor-screen">${`<div class="doctor-heading"><div class="doctor-kicker">AFTER THE VISIT / HANDOVER</div><div class="doctor-heading-grid"><div><h1>Post-visit follow-up</h1><p>Patient, owner, due date and the next step.</p></div></div></div>`}
    <div class="doctor-followups-grid"><section class="doctor-surface" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">RECORD TASKS</span><h2>${active.length} open task${active.length===1?'':'s'}</h2></div>${x.pill(active.length+' not done','info')}</div>
    <div class="cf-task-controls"><label>Search tasks<input id="followup-query" type="search" data-followup-query value="${x.e(filter.query)}" placeholder="Patient, content, owner…"></label><label>Status<select data-followup-field="status">${[['all','All'],['open','Open'],['done','Done']].map(([key,label])=>`<option value="${key}"${filter.status===key?' selected':''}>${label}</option>`).join('')}</select></label><label>Assigned to<select data-followup-field="owner">${[['all','All'],['mine','Doctor'],['delegated','Coordinator']].map(([key,label])=>`<option value="${key}"${filter.owner===key?' selected':''}>${label}</option>`).join('')}</select></label></div><p class="cf-local-feedback" role="status">Showing ${displayed.length}/${tasks(x).length} tasks</p><div class="journey-task-list">${displayed.map(t=>`<article class="journey-task-entry ${t.done?'is-done':''}" ${UI.cardAttrs('row')}><div class="journey-task-meta"><span>${x.e(t.category||'Follow-up')}</span>${x.pill(taskState(t),t.done?'success':'warning')}</div><h3>${x.e(t.title)}</h3><p>${x.e(t.desc)}</p><dl data-cf-component="facts"><div><dt>Patient</dt><dd>${x.e(P(x,t.personId).name)}</dd></div><div><dt>Assigned to</dt><dd>${x.e(x.ownerLabel(t.owner))}</dd></div><div><dt>Due</dt><dd>${x.e(t.due)}</dd></div><div><dt>Next step</dt><dd>${x.e(t.next)}</dd></div></dl><div class="journey-task-actions"><a class="journey-text-link" ${UI.buttonAttrs('text')} href="#${x.e(t.route)}">View details ${x.icon('arrow',16)}</a>${t.owner==='doctor'?x.btn(t.done?'Reopen':'Mark as done','doc-task-toggle','btn-soft',`data-id="${x.e(t.id)}"`):`<span class="journey-assignee">Waiting for ${x.e(x.ownerLabel(t.owner))}</span>`}</div></article>`).join('')||`<div class="doctor-card-empty" data-cf-state="empty"><strong>No matching tasks</strong><p>Try another keyword or reset the filters.</p>${x.btn('Clear filters','doc-followup-reset','btn-soft')}</div>`}</div></section>
    <aside class="doctor-followups-side"><section class="doctor-surface doctor-followups-summary" ${UI.cardAttrs('surface')}><div class="doctor-overline">FOLLOW-UP ASSIGNMENT</div><div class="doctor-followups-mini"><span>Doctor’s tasks</span><strong>${active.filter(t=>t.owner==='doctor').length}</strong></div><div class="doctor-followups-mini"><span>Handed to coordinator</span><strong>${active.filter(t=>t.owner!=='doctor').length}</strong></div><div class="doctor-divider"></div><div class="doctor-overline">DUE SOON</div><div class="journey-deadline-list">${byDue.slice(0,4).map(t=>`<div class="journey-deadline-item"><span class="journey-deadline-date">${x.e(t.due)}</span><strong>${x.e(t.title)}</strong><small>${x.e(P(x,t.personId).name)} · ${x.e(x.ownerLabel(t.owner))}</small></div>`).join('')||'<p class="journey-empty">No open tasks.</p>'}</div><a href="#/results" class="journey-text-link" ${UI.buttonAttrs('text')}>Diagnostic results ${x.icon('arrow',16)}</a></section></aside></div></section>`;
  }
  function afterResult(r,x){
    const related=x.data.appointments.find(a=>a.personId===r.personId&&isDoctor(a)&&a.status==='in-consult');
    const saved=x.data.resultNexts?.[r.id], can=r.status==='reviewed';
    return `<div class="journey-result-next"><div class="doctor-overline">AFTER THE DOCTOR REVIEWS THE RESULT</div><h3>Next action</h3>${saved?`<p class="journey-confirm">Handed over: ${x.e(saved.label)} · ${x.e(x.ownerLabel(saved.owner))}</p>`:`<label class="journey-field">Choose the next step<select id="journey-result-choice" ${can?'':'disabled'}>${options.map(t=>`<option value="${t.value}">${x.e(t.label)}</option>`).join('')}</select></label>${x.btn('Record next step','doc-result-next','btn-soft',`data-id="${x.e(r.id)}" ${can?'':'disabled'}`)}`}<small>${can?'Saves an internal task only; no real notification is sent.':'Mark the result as reviewed before choosing the next step.'}</small>${related?`<a class="journey-text-link" ${UI.buttonAttrs('text')} href="#/encounters/${x.e(related.id)}">Back to consultation ${x.icon('arrow',16)}</a>`:''}</div>`;
  }
  function addTask(x,t){x.data.doctorTasks??=[];const existing=x.data.doctorTasks.find(p=>p.id===t.id);if(existing)Object.assign(existing,t);else x.data.doctorTasks.unshift(t)}
  function action(node,x){
    const name=node.dataset.action,id=node.dataset.id;
    if(name==='doc-followup-reset'){x.ui.followupFilter={status:'all',owner:'all',query:''};x.render();document.getElementById('followup-query')?.focus();return true}
    if(name==='doc-triage-handoff'){
      const a=x.data.appointments.find(a=>a.id===id&&isDoctor(a)&&a.status==='review'&&a.owner==='doctor');
      const choice=document.getElementById('journey-triage-decision')?.value,note=document.getElementById('journey-triage-note')?.value.trim();
      if(!a)return true;
      if(!choice||!note){x.notify('Please choose an approach and enter a handover note.');return true}
      x.data.doctorReviews??={};x.data.doctorReviews[id]={decision:choice,note,at:'15/10/2026'};
      a.owner='coordinator';addTask(x,{id:'review-'+id,title:'Pick up pre-visit recommendation',desc:note,category:'Pre-visit',personId:a.personId,owner:'coordinator',due:'15/10/2026',next:choice,route:'/doctor/review/'+id,done:false});
      x.save();x.go('/doctor/review/'+id);x.notify('Request passed to the coordination team.');return true;
    }
    if(name==='doc-online-connect'){
      const a=x.data.appointments.find(a=>a.id===id&&isDoctor(a)&&a.status==='ready'&&a.mode.toLowerCase().includes('online'));
      if(!a){x.notify('The online session cannot be prepared yet.');return true}
      x.data.onlineVisits??={};x.data.onlineVisits[id]={connection:'connected'};
      x.save();x.render();return true;
    }
    if(name==='doc-online-handoff'){
      const a=x.data.appointments.find(a=>a.id===id&&isDoctor(a)&&a.mode.toLowerCase().includes('online'));
      if(!a||a.status==='completed')return true;
      const choice=document.getElementById('journey-online-choice')?.value||'Call back and help connect';
      a.status='unreachable';a.owner='coordinator';x.data.onlineVisits??={};x.data.onlineVisits[id]={connection:'handoff',choice};
      addTask(x,{id:(id==='a-041'?'case-a-041':'online-'+id),title:'Online appointment support',desc:'Could not connect as scheduled; awaiting the coordinator’s plan.',category:'Connection',personId:a.personId,owner:'coordinator',due:'15/10/2026',next:choice,route:'/doctor/online/'+id,done:false});
      x.save();x.render();x.notify('Connection issue handed over to the coordinator.');return true;
    }
    if(name==='doc-result-next'){
      const r=x.data.results.find(r=>r.id===id&&r.status==='reviewed'&&r.doctor.includes(doctor));
      if(!r){x.notify('The doctor must review the result before recording the next step.');return true}
      const choice=document.getElementById('journey-result-choice')?.value||'follow';
      const opt=options.find(o=>o.value===choice)||options[0];
      x.data.resultNexts??={};x.data.resultNexts[id]={choice,label:opt.label,owner:opt.owner};
      addTask(x,{id:'result-'+id,sourceResult:id,title:opt.label,desc:'Result '+r.title+' · '+r.code,category:'After diagnostics',personId:r.personId,owner:opt.owner,due:'16/10/2026',next:opt.next,route:opt.route,done:false});
      x.save();x.render();x.notify('Result next step recorded and assigned.');return true;
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
