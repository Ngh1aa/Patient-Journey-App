/* CareFlow Clinic — clinic operations (today's queue, visit handling, notes,
 * follow-ups, tasks and support replies). Reads and writes the same
 * sessionStorage state as the patient app (data/careflow-store.js), so a
 * check-in here is what the patient sees on their visit ticket in the same tab.
 * Every action is simulated: no real clinic system, signature or prescription. */
(function (root) {
  'use strict';
  const Store = root.CareFlowStore, M = root.CareFlowModel, UI = root.CareFlowUI;
  let st = Store.load();
  const ops = { gate: { path: null, state: 'ready' }, modal: null, error: null, retry: null, queueFilter: 'all', taskFilter: 'open', ticketFilter: 'active', forms: {} };
  const persist = () => { try { Store.save(st); } catch { /* storage blocked */ } };
  persist();
  root.addEventListener('pageshow', (e) => { if (e.persisted) { st = Store.load(); ctxRender(); } });
  let lastCtx = null;
  const ctxRender = () => lastCtx?.render();

  const ROUTES = [
    [/^\/ops\/queue$/, 'Today’s queue'],
    [/^\/ops\/visits\/[^/]+$/, 'Visit handling'],
    [/^\/ops\/patients\/[^/]+$/, 'Patient record'],
    [/^\/ops\/tasks$/, 'Tasks'],
    [/^\/ops\/tasks\/new$/, 'New task'],
    [/^\/ops\/tasks\/[^/]+$/, 'Edit task'],
    [/^\/ops\/tickets$/, 'Support tickets'],
    [/^\/ops\/tickets\/[^/]+$/, 'Ticket details'],
  ];
  const permitted = (path) => ROUTES.some(([re]) => re.test(path.split('?')[0]));
  const title = (path) => ROUTES.find(([re]) => re.test(path.split('?')[0]))?.[1];

  /* ---------- helpers ---------- */
  const e = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  const today = () => M.localDate();
  const dmy = (d) => d ? d.split('-').reverse().join('/') : '—';
  const stamp = (iso) => { try { return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(iso)); } catch { return ''; } };
  const person = (id) => {
    const a = st.profiles.find((p) => p.id === id);
    if (a) return { id: a.id, name: a.name, dob: a.dob, phone: a.phone, code: 'CF-' + a.id.toUpperCase(), scope: 'account', relation: a.relation };
    const c = st.clinic.patients.find((p) => p.id === id);
    return c ? { ...c, scope: 'clinic' } : null;
  };
  const allPatients = () => [...st.profiles.map((p) => person(p.id)), ...st.clinic.patients.map((p) => person(p.id))];
  const findVisit = (id) => {
    const a = st.visits.find((v) => v.id === id);
    if (a) return { v: a, scope: 'account' };
    const c = st.clinic.visits.find((v) => v.id === id);
    return c ? { v: c, scope: 'clinic' } : null;
  };
  const visitsOf = (pid) => [...st.visits, ...st.clinic.visits].filter((v) => v.patientId === pid).sort((a, b) => (b.date + b.slot).localeCompare(a.date + a.slot));
  const proxy = (scope) => scope === 'account' ? st : { visits: st.clinic.visits, notifications: [], settings: st.settings };
  const tone = (status) => ({ warning: 'warning', success: 'success', info: 'info', neutral: 'neutral' }[UI.status(status).tone] || 'neutral');
  const statusPill = (x, v) => x.pill(UI.status(v.status).label, tone(v.status));
  const isOnline = (v) => v.mode === 'online';
  const ASSIGNEES = ['Reception', 'Nurse', 'Doctor', 'Coordinator'];
  const SLOTS = ['08:00', '09:00', '10:30', '14:00', '15:30'];
  const PRIORITY = { high: ['High priority', 'warning'], normal: ['Normal', 'neutral'] };
  const TICKET = { open: ['Awaiting reply', 'warning'], answered: ['Answered', 'info'], closed: ['Closed', 'neutral'] };

  /** Next operational step for a visit, as [label, action] or null. */
  function nextStep(v) {
    switch (v.status) {
      case 'pending': return ['Confirm booking', 'ops-confirm'];
      case 'confirmed': case 'reminder': return [isOnline(v) ? 'Open online waiting room' : 'Check in', 'ops-checkin'];
      case 'arrived': return ['Receive', 'ops-checkin'];
      case 'received': case 'ready': case 'online-wait': return ['Start consultation', 'ops-start'];
      case 'in-consult': return ['Complete visit', 'ops-complete'];
      default: return null;
    }
  }
  const PATHS = {
    'ops-confirm': () => ['confirmed'],
    'ops-checkin': (v) => isOnline(v) ? ({ confirmed: ['reminder', 'online-wait'], reminder: ['online-wait'] }[v.status] || []) : ({ confirmed: ['reminder', 'arrived', 'received'], reminder: ['arrived', 'received'], arrived: ['received'] }[v.status] || []),
    'ops-start': (v) => ({ received: ['ready', 'in-consult'], ready: ['in-consult'], 'online-wait': ['calling', 'in-consult'] }[v.status] || []),
    'ops-complete': (v) => v.status === 'in-consult' ? ['completed'] : [],
    'ops-noshow': (v) => ({ confirmed: ['reminder', 'no-show'], reminder: ['no-show'] }[v.status] || []),
  };
  const PATIENT_MESSAGE = {
    'ops-confirm': ['The clinic confirmed your appointment', 'Your appointment is confirmed. Open your appointment details to prepare.', 'D2'],
    'ops-checkin': ['The clinic has checked you in', 'You’re checked in. Follow your visit in your appointment details.', 'D2'],
    'ops-start': ['Your doctor has started the consultation', 'Your consultation is in progress.', 'D2'],
    'ops-complete': ['Your visit is complete', 'The clinic will share your visit documents when they’re ready.', 'H1'],
    'ops-noshow': ['The clinic recorded that you did not attend', 'You can rebook in the app.', 'D2'],
  };
  function notifyPatient(n) { st.notifications.unshift({ id: Store.uid('n'), read: false, at: new Date().toISOString(), ...n }); }
  function applySteps(action, id) {
    const found = findVisit(id);
    if (!found) return { ok: false, message: 'Visit not found.' };
    const { v, scope } = found, steps = PATHS[action](v);
    if (!steps.length) return { ok: false, message: 'The current status doesn’t allow this action. Please reload the page.' };
    const before = st.notifications.length;
    for (const to of steps) {
      const r = M.transition(proxy(scope), v.id, to, 'staff', action === 'ops-noshow' ? 'Did not attend as scheduled' : '');
      if (!r.ok) return { ok: false, message: 'Couldn’t change the status (' + r.code + ').' };
    }
    if (scope === 'account') {
      st.notifications.splice(0, st.notifications.length - before);
      const [t, b, screen] = PATIENT_MESSAGE[action];
      notifyPatient({ visitId: v.id, patientId: v.patientId, screen, title: t, body: b });
    }
    if (action === 'ops-complete') v.signedBy = v.clinician?.name || 'Attending doctor';
    return { ok: true };
  }

  /* ---------- simulated network ---------- */
  function gateView(path, x) {
    if (ops.gate.path !== path) { ops.gate.path = path; load(x); }
    if (ops.gate.state === 'loading') return `<section class="screen doctor-screen ops-screen">${heading('CLINIC OPERATIONS', title(path), '')}<div class="ops-skeleton" aria-busy="true" data-cf-state="loading"><span class="sr-only">Loading data…</span>${'<div class="ops-skeleton-row"><span></span><span></span><span></span></div>'.repeat(4)}</div></section>`;
    if (ops.gate.state === 'error') return `<section class="screen doctor-screen ops-screen">${heading('CLINIC OPERATIONS', title(path), '')}<div class="ops-load-error doctor-surface" role="alert" data-cf-state="error"><h2>Couldn’t load data</h2><p>The connection to the demo server was interrupted. Data in this session is unchanged.</p>${x.btn('Try again', 'ops-retry-load', 'btn-primary')}</div></section>`;
    return null;
  }
  function load(x) {
    ops.gate.state = 'loading';
    const path = ops.gate.path;
    Store.request(null, { delay: 380 }).then(() => { if (ops.gate.path === path) { ops.gate.state = 'ready'; x.render(); } })
      .catch(() => { if (ops.gate.path === path) { ops.gate.state = 'error'; x.render(); } });
  }
  function run(x, trigger, fn, { done, go, alertIn } = {}) {
    if (trigger) { trigger.disabled = true; trigger.setAttribute('aria-busy', 'true'); trigger.dataset.label = trigger.innerHTML; trigger.textContent = 'Saving…'; }
    ops.error = null;
    const again = () => run(x, null, fn, { done, go, alertIn: null });
    return Store.request(() => fn()).then((r) => {
      if (r && r.ok === false) throw Object.assign(new Error(r.message), { code: 'RULE' });
      persist();
      ops.modal = null;
      if (go) { ops.gate.path = null; x.go(go); }
      if (done) x.notify(done); else x.render();
    }).catch((err) => {
      if (trigger?.isConnected) { trigger.disabled = false; trigger.removeAttribute('aria-busy'); trigger.innerHTML = trigger.dataset.label; }
      const message = err.message || 'Something unexpected went wrong.';
      if (alertIn?.isConnected) { alertIn.innerHTML = `<div class="ops-inline-error" role="alert" data-cf-state="error"><strong>Not saved</strong><p>${e(message)}</p>${err.code === 'RULE' ? '' : x.btn('Try again', 'ops-resubmit', 'btn-secondary', `data-form="${e(alertIn.closest('form')?.dataset.opsForm || '')}"`)}</div>`; return; }
      ops.modal = null;
      ops.error = { message, retry: err.code !== 'RULE' };
      ops.retry = again;
      x.render();
      document.querySelector('.ops-banner')?.focus();
    });
  }

  /* ---------- markup ---------- */
  function heading(kicker, h1, desc, actions = '') {
    return `<div class="doctor-heading"><div class="doctor-kicker">${e(kicker)}</div><div class="doctor-heading-grid"><div><h1>${e(h1)}</h1>${desc ? `<p>${e(desc)}</p>` : ''}</div>${actions ? `<div class="ops-heading-actions">${actions}</div>` : ''}</div></div>`;
  }
  function subnav(path) {
    const items = [['/ops/queue', 'Today’s queue'], ['/ops/tasks', 'Tasks'], ['/ops/tickets', 'Support tickets']];
    const open = { '/ops/tasks': st.clinic.tasks.filter((t) => t.status === 'open').length, '/ops/tickets': (st.tickets || []).filter((t) => t.status === 'open').length };
    const on = Store.failNext.get();
    return `<div class="ops-toolbar"><nav class="ops-subnav" aria-label="Clinic operations">${items.map(([p, l]) => `<a href="#${p}" class="${path.startsWith(p) ? 'active' : ''}"${path.startsWith(p) ? ' aria-current="page"' : ''}>${e(l)}${open[p] ? `<span>${open[p]}</span>` : ''}</a>`).join('')}</nav><button type="button" class="ops-fail-toggle" data-action="ops-fail-toggle" aria-pressed="${on}">${on ? 'Simulated error: on' : 'Simulate connection error'}</button></div>`;
  }
  function banner(x) {
    if (!ops.error) return '';
    return `<div class="ops-banner" role="alert" tabindex="-1" data-cf-state="error"><div><strong>Couldn’t complete</strong><p>${e(ops.error.message)}</p></div>${ops.error.retry ? x.btn('Try again', 'ops-retry', 'btn-secondary') : ''}${x.btn('Close', 'ops-dismiss-error', 'btn-outline')}</div>`;
  }
  function modal(x) {
    const m = ops.modal;
    if (!m) return '';
    const map = {
      complete: ['Complete this visit?', 'The visit will move to Completed and the patient will be notified. This is a simulated action; it creates no real signature or medical record.', 'Complete visit', 'ops-complete-confirm'],
      noshow: ['Record no-show?', 'The patient will see the appointment as a no-show and can rebook.', 'Record no-show', 'ops-noshow-confirm'],
      'delete-task': ['Delete this task?', 'The task will be removed from the clinic’s list in this demo session.', 'Delete task', 'ops-task-delete-confirm'],
      'delete-note': ['Delete note?', 'The internal note will be removed from the visit.', 'Delete note', 'ops-note-delete-confirm'],
      'close-ticket': ['Close support ticket?', 'The patient can still reopen the ticket if needed.', 'Close ticket', 'ops-ticket-close-confirm'],
    };
    const [t, body, cta, action] = map[m.type];
    return `<div class="modal-overlay" data-action="ops-close-modal"><div class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="ops-modal-title"><h2 id="ops-modal-title">${e(t)}</h2><p>${e(body)}</p><div class="dialog-actions">${x.btn('Back', 'ops-close-modal', 'btn-outline')}${x.btn(cta, action, 'btn-primary', `data-id="${e(m.id)}" data-note="${e(m.note || '')}"`)}</div></div></div>`;
  }
  const field = (name, label, control, hint = '') => `<label class="ops-field" data-field="${name}"><span>${e(label)}</span>${control}${hint ? `<small>${e(hint)}</small>` : ''}<em class="ops-error" data-error-for="${name}" aria-live="polite"></em></label>`;
  const inputC = (name, value = '', type = 'text', extra = '') => `<input name="${name}" id="ops-${name}" type="${type}" value="${e(value)}" aria-describedby="ops-${name}-err" ${extra}>`;
  const selectC = (name, value, options, extra = '') => `<select name="${name}" id="ops-${name}" ${extra}>${options.map(([v, l]) => `<option value="${e(v)}"${String(v) === String(value) ? ' selected' : ''}>${e(l)}</option>`).join('')}</select>`;
  const areaC = (name, value = '', extra = '') => `<textarea name="${name}" id="ops-${name}" rows="3" ${extra}>${e(value)}</textarea>`;
  const formWrap = (name, html, cta, x, extra = '') => `<form class="ops-form" data-ops-form="${name}" novalidate>${html}<div class="ops-form-alert" data-form-alert></div><div class="ops-form-actions">${extra}<button type="submit" class="btn btn-primary" ${UI.buttonAttrs('btn-primary')}>${e(cta)}</button></div></form>`;
  const emptyBox = (t, d, action = '') => `<div class="ops-empty" data-cf-state="empty"><strong>${e(t)}</strong><p>${e(d)}</p>${action}</div>`;
  const notFound = (x, t, back, label) => `<section class="screen doctor-screen ops-screen" data-cf-state="not-found">${heading('CLINIC OPERATIONS', 'Not found', '')}${emptyBox(t, 'This ID doesn’t exist or was deleted in this demo session.', `<a class="btn btn-primary" ${UI.buttonAttrs('btn-primary')} href="#${back}">${e(label)}</a>`)}</section>`;
  const link = (href, label) => `<a class="text-link" href="#${href}">${e(label)}</a>`;

  /* ---------- pages ---------- */
  function queuePage(x, path) {
    const all = [...st.visits, ...st.clinic.visits].filter((v) => v.date === today()).sort((a, b) => a.slot.localeCompare(b.slot));
    const groups = { waiting: ['pending', 'confirmed', 'reminder'], inclinic: ['arrived', 'received', 'ready', 'online-wait', 'calling', 'in-consult'], done: ['completed', 'cancelled', 'no-show', 'unreachable'] };
    const f = ops.queueFilter;
    const list = f === 'all' ? all : all.filter((v) => groups[f].includes(v.status));
    const count = (k) => all.filter((v) => groups[k].includes(v.status)).length;
    const rows = list.map((v) => {
      const p = person(v.patientId), step = nextStep(v);
      return `<tr data-visit="${e(v.id)}"><td class="mono">${e(v.slot)}</td><td><a class="text-link" href="#/ops/patients/${e(v.patientId)}">${e(p?.name || 'Unknown')}</a><small class="ops-sub">${e(v.id)}, ${isOnline(v) ? 'Online' : 'In person'}</small></td><td>${e(v.reason)}</td><td>${e(v.clinician?.name || '')}</td><td>${statusPill(x, v)}</td><td><div class="ops-row-actions">${step ? x.btn(step[0], step[1], 'btn-primary', `data-id="${e(v.id)}"`) : ''}<a class="btn btn-secondary" ${UI.buttonAttrs('btn-secondary')} href="#/ops/visits/${e(v.id)}">Details</a></div></td></tr>`;
    }).join('');
    const filters = [['all', 'All', all.length], ['waiting', 'Expected', count('waiting')], ['inclinic', 'In clinic', count('inclinic')], ['done', 'Done', count('done')]];
    return `<section class="screen doctor-screen ops-screen">${heading('CLINIC OPERATIONS', 'Today’s queue', 'Check in, start and complete visits. Patients see updates in the app straight away in the same session.')}${subnav(path)}${banner(x)}
      <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">${e(dmy(today()))}</span><h2>${all.length} ${all.length === 1 ? 'visit' : 'visits'} today</h2></div></div>
      <div class="ops-filters" role="group" aria-label="Filter queue">${filters.map(([k, l, n]) => `<button type="button" data-action="ops-queue-filter" data-value="${k}" aria-pressed="${f === k}">${e(l)} <span>${n}</span></button>`).join('')}</div>
      ${list.length ? `<div class="table-scroll"><table class="data-table ops-table"><thead><tr><th>Time</th><th>Patient</th><th>Reason for visit</th><th>Doctor</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${rows}</tbody></table></div>`
        : emptyBox(all.length ? 'No visits in this group' : 'No visits today yet', all.length ? 'Choose another group to see the other visits.' : 'Confirmed appointments for today will appear here.')}</section>${modal(x)}</section>`;
  }
  function visitPage(x, path, id) {
    const found = findVisit(id);
    if (!found) return notFound(x, 'Visit not found', '/ops/queue', 'Back to queue');
    const { v } = found, p = person(v.patientId), step = nextStep(v);
    const canNoShow = ['confirmed', 'reminder'].includes(v.status);
    const notes = (v.staffNotes || []).slice().reverse();
    const tasks = st.clinic.tasks.filter((t) => t.visitId === v.id);
    const f = ops.forms;
    return `<section class="screen doctor-screen ops-screen">${heading('CLINIC OPERATIONS', 'Visit ' + v.id, (p?.name || '') + ', ' + dmy(v.date) + ', ' + v.slot, `${link('/ops/queue', '← Today’s queue')}`)}${subnav('/ops/queue')}${banner(x)}
      <div class="ops-grid">
        <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">STATUS</span><h2>${e(UI.status(v.status).label)}</h2></div>${statusPill(x, v)}</div>
          <dl class="ops-facts"><div><dt>Patient</dt><dd><a class="text-link" href="#/ops/patients/${e(v.patientId)}">${e(p?.name || 'Unknown')}</a></dd></div><div><dt>Doctor</dt><dd>${e(v.clinician?.name || '—')}, ${e(v.clinician?.specialty || '')}</dd></div><div><dt>Visit type</dt><dd>${isOnline(v) ? 'Online visit' : 'In person'}</dd></div><div><dt>Reason for visit</dt><dd>${e(v.reason)}</dd></div>${v.cancelReason ? `<div><dt>Cancellation reason</dt><dd>${e(v.cancelReason)}</dd></div>` : ''}</dl>
          <div class="ops-actions">${step ? x.btn(step[0], step[1], 'btn-primary', `data-id="${e(v.id)}"`) : `<p class="ops-muted">This visit has no further steps.</p>`}${canNoShow ? x.btn('Record no-show', 'ops-noshow', 'btn-outline', `data-id="${e(v.id)}"`) : ''}</div>
          <h3 class="ops-h3">Progress</h3><ol class="ops-timeline">${v.history.map((h) => `<li><strong>${e(UI.status(h.status).label)}</strong><small>${e(stamp(h.at))}, ${h.actor === 'staff' ? 'Clinic' : 'Patient'}</small></li>`).join('')}</ol>
        </section>
        <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">INTERNAL NOTES</span><h2>${notes.length} ${notes.length === 1 ? 'note' : 'notes'}</h2></div></div>
          <p class="ops-muted">Visible to clinic staff only. Don’t record diagnoses or treatment orders in the demo.</p>
          ${formWrap('note', `<input type="hidden" name="visitId" value="${e(v.id)}">` + field('note', 'Add a note', areaC('note', f.note?.note || '', 'maxlength="1000"')), 'Save note', x)}
          ${notes.length ? `<ul class="ops-notes">${notes.map((n) => `<li><p>${e(n.text)}</p><small>${e(n.author)}, ${e(stamp(n.at))}</small>${x.btn('Delete', 'ops-note-delete', 'btn-outline ops-small', `data-id="${e(v.id)}" data-note="${e(n.id)}"`)}</li>`).join('')}</ul>` : emptyBox('No notes yet', 'Record operational details such as missing paperwork or support needs.')}
        </section>
      </div>
      <div class="ops-grid">
        <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">AFTER-VISIT FOLLOW-UP</span><h2>New task</h2></div></div>
          ${formWrap('task', `<input type="hidden" name="visitId" value="${e(v.id)}"><input type="hidden" name="patientId" value="${e(v.patientId)}">` + taskFields(f.task || { title: '', due: M.localDate(1), assignee: 'Reception', priority: 'normal', note: '' }), 'Create task', x)}
          ${tasks.length ? `<ul class="ops-mini-list">${tasks.map((t) => `<li><a class="text-link" href="#/ops/tasks/${e(t.id)}">${e(t.title)}</a> ${x.pill(t.status === 'done' ? 'Done' : 'Open', t.status === 'done' ? 'success' : 'warning')}</li>`).join('')}</ul>` : ''}
        </section>
        <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">FOLLOW-UP VISIT</span><h2>Book the next visit</h2></div></div>
          <p class="ops-muted">The appointment is created as Confirmed${found.scope === 'account' ? ' and appears straight away in the patient’s app' : ''}.</p>
          ${formWrap('followup', `<input type="hidden" name="visitId" value="${e(v.id)}">` + `<div class="ops-pair">${field('date', 'Follow-up date', inputC('date', f.followup?.date || M.localDate(7), 'date', `min="${M.localDate(1)}" required`))}${field('slot', 'Time', selectC('slot', f.followup?.slot || '09:00', SLOTS.map((s) => [s, s])))}</div>` + field('mode', 'Visit type', selectC('mode', f.followup?.mode || v.mode, [['onsite', 'In person'], ['online', 'Online']])) + field('reason', 'Reason', inputC('reason', f.followup?.reason || 'Follow-up as advised by the doctor', 'text', 'maxlength="120" required')), 'Schedule follow-up', x)}
        </section>
      </div>${modal(x)}</section>`;
  }
  function taskFields(t) {
    return field('title', 'Task title', inputC('title', t.title, 'text', 'maxlength="80" required')) +
      `<div class="ops-pair">${field('due', 'Due date', inputC('due', t.due, 'date', 'required'))}${field('assignee', 'Assigned to', selectC('assignee', t.assignee, ASSIGNEES.map((a) => [a, a])))}</div>` +
      field('priority', 'Priority', selectC('priority', t.priority, [['normal', 'Normal'], ['high', 'High priority']])) +
      field('note', 'Note', areaC('note', t.note, 'maxlength="300"'));
  }
  function patientPage(x, path, id) {
    const p = person(id);
    if (!p) return notFound(x, 'Patient not found', '/ops/queue', 'Back to queue');
    const visits = visitsOf(id), tasks = st.clinic.tasks.filter((t) => t.patientId === id);
    const ins = p.scope === 'account' ? st.insurance?.[id] : null;
    const rx = (st.prescriptions || []).filter((r) => r.patientId === id);
    return `<section class="screen doctor-screen ops-screen">${heading('CLINIC OPERATIONS', p.name, (p.code || '') + ', born ' + dmy(p.dob))}${subnav('/ops/queue')}${banner(x)}
      <div class="ops-grid">
        <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">ADMINISTRATIVE DETAILS</span><h2>Contact</h2></div></div>
          <dl class="ops-facts"><div><dt>Phone number</dt><dd>${e(p.phone ? p.phone.slice(0, 3) + ' ••• ' + p.phone.slice(-3) : 'Not provided')}</dd></div><div><dt>Insurance</dt><dd>${ins ? e(ins.number + ', expires ' + dmy(ins.validTo)) : 'Not provided'}</dd></div><div><dt>Record source</dt><dd>${p.scope === 'account' ? 'Patient’s CareFlow+ account' : 'Clinic record'}</dd></div></dl>
          ${rx.length ? `<h3 class="ops-h3">Sample prescriptions</h3><ul class="ops-mini-list">${rx.map((r) => `<li>${e(r.name)} ${r.refill?.status === 'requested' ? x.pill('Refill awaiting review', 'warning') : ''}</li>`).join('')}</ul>` : ''}
        </section>
        <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">RELATED TASKS</span><h2>${tasks.filter((t) => t.status === 'open').length} open ${tasks.filter((t) => t.status === 'open').length === 1 ? 'task' : 'tasks'}</h2></div><a class="btn btn-secondary" ${UI.buttonAttrs('btn-secondary')} href="#/ops/tasks/new?patient=${e(id)}">Create task</a></div>
          ${tasks.length ? `<ul class="ops-mini-list">${tasks.map((t) => `<li><a class="text-link" href="#/ops/tasks/${e(t.id)}">${e(t.title)}</a> ${x.pill(t.status === 'done' ? 'Done' : 'Due ' + dmy(t.due), t.status === 'done' ? 'success' : 'warning')}</li>`).join('')}</ul>` : emptyBox('No related tasks', 'Create a task to remind reception or a nurse to contact the patient.')}
        </section>
      </div>
      <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">VISITS</span><h2>${visits.length} ${visits.length === 1 ? 'visit' : 'visits'}</h2></div></div>
        ${visits.length ? `<div class="table-scroll"><table class="data-table ops-table"><thead><tr><th>Date</th><th>Time</th><th>Doctor</th><th>Reason</th><th>Status</th><th><span class="sr-only">Open</span></th></tr></thead><tbody>${visits.map((v) => `<tr><td>${e(dmy(v.date))}</td><td class="mono">${e(v.slot)}</td><td>${e(v.clinician?.name || '')}</td><td>${e(v.reason)}</td><td>${statusPill(x, v)}</td><td><a class="btn btn-secondary" ${UI.buttonAttrs('btn-secondary')} href="#/ops/visits/${e(v.id)}">Open</a></td></tr>`).join('')}</tbody></table></div>` : emptyBox('No visits yet', 'This patient has no appointments.')}
      </section></section>`;
  }
  function tasksPage(x, path) {
    const f = ops.taskFilter, all = st.clinic.tasks;
    const list = all.filter((t) => f === 'all' || t.status === f).sort((a, b) => a.due.localeCompare(b.due));
    return `<section class="screen doctor-screen ops-screen">${heading('CLINIC OPERATIONS', 'Tasks', 'After-visit follow-ups, call-backs and medication refill requests from patients.', `<a class="btn btn-primary" ${UI.buttonAttrs('btn-primary')} href="#/ops/tasks/new">New task</a>`)}${subnav(path)}${banner(x)}
      <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}>
      <div class="ops-filters" role="group" aria-label="Filter tasks">${[['open', 'Open'], ['done', 'Done'], ['all', 'All']].map(([k, l]) => `<button type="button" data-action="ops-task-filter" data-value="${k}" aria-pressed="${f === k}">${l} <span>${k === 'all' ? all.length : all.filter((t) => t.status === k).length}</span></button>`).join('')}</div>
      ${list.length ? `<ul class="ops-task-list">${list.map((t) => { const p = person(t.patientId); const overdue = t.status === 'open' && t.due < today(); return `<li class="ops-task ${t.status === 'done' ? 'is-done' : ''}" data-task="${e(t.id)}"><div class="ops-task-main"><div class="ops-task-meta">${x.pill(PRIORITY[t.priority]?.[0] || 'Normal', PRIORITY[t.priority]?.[1] || 'neutral')}${t.status === 'done' ? x.pill('Done', 'success') : overdue ? x.pill('Overdue', 'warning') : ''}${t.source === 'refill' ? x.pill('Refill request', 'info') : ''}</div><h3>${e(t.title)}</h3><p>${p ? `<a class="text-link" href="#/ops/patients/${e(p.id)}">${e(p.name)}</a>, ` : ''}${e(t.assignee)}, due ${e(dmy(t.due))}</p>${t.note ? `<p class="ops-muted">${e(t.note)}</p>` : ''}</div><div class="ops-task-actions">${t.status === 'open' ? x.btn('Mark done', 'ops-task-done', 'btn-primary', `data-id="${e(t.id)}"`) : x.btn('Reopen', 'ops-task-reopen', 'btn-secondary', `data-id="${e(t.id)}"`)}<a class="btn btn-secondary" ${UI.buttonAttrs('btn-secondary')} href="#/ops/tasks/${e(t.id)}">Edit</a>${x.btn('Delete', 'ops-task-delete', 'btn-outline', `data-id="${e(t.id)}"`)}</div></li>`; }).join('')}</ul>`
        : emptyBox(f === 'open' ? 'No open tasks' : f === 'done' ? 'No completed tasks yet' : 'No tasks yet', 'Create a new task or add one from a visit page.', `<a class="btn btn-primary" ${UI.buttonAttrs('btn-primary')} href="#/ops/tasks/new">New task</a>`)}
      </section>${modal(x)}</section>`;
  }
  function taskForm(x, path, id) {
    const editing = id !== 'new';
    const t = editing ? st.clinic.tasks.find((k) => k.id === id) : null;
    if (editing && !t) return notFound(x, 'Task not found', '/ops/tasks', 'Back to tasks');
    const preset = new URLSearchParams(location.hash.split('?')[1] || '').get('patient') || '';
    const v = ops.forms.taskEdit || t || { title: '', due: M.localDate(1), assignee: 'Reception', priority: 'normal', note: '', patientId: preset };
    return `<section class="screen doctor-screen ops-screen">${heading('CLINIC OPERATIONS', editing ? 'Edit task' : 'New task', editing ? t.id : 'Assign work to reception, nurses or coordinators.', link('/ops/tasks', '← Tasks'))}${subnav('/ops/tasks')}${banner(x)}
      <section class="doctor-surface ops-panel ops-narrow" ${UI.cardAttrs('surface')}>${formWrap('taskEdit', `<input type="hidden" name="taskId" value="${e(t?.id || '')}">` + field('patientId', 'Patient', selectC('patientId', v.patientId || '', [['', 'No patient'], ...allPatients().map((p) => [p.id, p.name])])) + taskFields(v) + (editing ? field('status', 'Status', selectC('status', v.status, [['open', 'Open'], ['done', 'Done']])) : ''), editing ? 'Save changes' : 'Create task', x, `<a class="btn btn-outline" ${UI.buttonAttrs('btn-outline')} href="#/ops/tasks" data-action="ops-cancel-form" data-form="taskEdit">Cancel</a>`)}</section></section>`;
  }
  function ticketsPage(x, path) {
    const f = ops.ticketFilter, all = (st.tickets || []).slice().sort((a, b) => (b.thread.at(-1)?.at || '').localeCompare(a.thread.at(-1)?.at || ''));
    const list = all.filter((t) => f === 'active' ? t.status !== 'closed' : t.status === 'closed');
    return `<section class="screen doctor-screen ops-screen">${heading('CLINIC OPERATIONS', 'Support tickets', 'Questions patients send from the app. Replies here appear straight away in the patient’s Support section.')}${subnav(path)}${banner(x)}
      <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="ops-filters" role="group" aria-label="Filter tickets">${[['active', 'Open'], ['closed', 'Closed']].map(([k, l]) => `<button type="button" data-action="ops-ticket-filter" data-value="${k}" aria-pressed="${f === k}">${l} <span>${all.filter((t) => k === 'active' ? t.status !== 'closed' : t.status === 'closed').length}</span></button>`).join('')}</div>
      ${list.length ? `<div class="table-scroll"><table class="data-table ops-table"><thead><tr><th>ID</th><th>Subject</th><th>Topic</th><th>Updated</th><th>Status</th><th><span class="sr-only">Open</span></th></tr></thead><tbody>${list.map((t) => `<tr><td class="mono">${e(t.id)}</td><td>${e(t.subject)}</td><td>${e(t.topic)}</td><td>${e(stamp(t.thread.at(-1)?.at || t.createdAt))}</td><td>${x.pill(TICKET[t.status][0], TICKET[t.status][1])}</td><td><a class="btn btn-secondary" ${UI.buttonAttrs('btn-secondary')} href="#/ops/tickets/${e(t.id)}">Open</a></td></tr>`).join('')}</tbody></table></div>`
        : emptyBox(f === 'active' ? 'No open tickets' : 'No closed tickets yet', 'New tickets from the patient app will appear here.')}</section></section>`;
  }
  function ticketPage(x, path, id) {
    const t = (st.tickets || []).find((k) => k.id === id);
    if (!t) return notFound(x, 'Ticket not found', '/ops/tickets', 'Back to tickets');
    const owner = st.profiles.find((p) => p.relation === 'self');
    return `<section class="screen doctor-screen ops-screen">${heading('CLINIC OPERATIONS', t.subject, t.id + ', ' + t.topic, link('/ops/tickets', '← Support tickets'))}${subnav('/ops/tickets')}${banner(x)}
      <section class="doctor-surface ops-panel ops-narrow" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">${e(owner?.name || 'Patient')}</span><h2>Conversation</h2></div>${x.pill(TICKET[t.status][0], TICKET[t.status][1])}</div>
        <ol class="ops-thread">${t.thread.map((m) => `<li class="${m.from === 'staff' ? 'is-staff' : ''}"><small>${e(m.from === 'staff' ? m.author || 'Clinic' : owner?.name || 'Patient')}, ${e(stamp(m.at))}</small><p>${e(m.text)}</p></li>`).join('')}</ol>
        ${t.status === 'closed' ? `<p class="ops-muted">Ticket closed${t.closeReason ? ': ' + e(t.closeReason) : ''}. The patient can reopen it.</p>` : formWrap('reply', `<input type="hidden" name="ticketId" value="${e(t.id)}">` + field('reply', 'Reply to patient', areaC('reply', ops.forms.reply?.reply || '', 'maxlength="1000"'), 'Don’t send diagnoses or treatment advice through this channel.'), 'Send reply', x, x.btn('Close ticket', 'ops-ticket-close', 'btn-outline', `data-id="${e(t.id)}"`))}
      </section>${modal(x)}</section>`;
  }
  function page(path, x) {
    path = path.split('?')[0];
    if (!permitted(path)) return null;
    lastCtx = x;
    const loading = gateView(path, x);
    if (loading) return loading;
    const [, , kind, id] = path.split('/');
    if (kind === 'queue') return queuePage(x, path);
    if (kind === 'visits') return visitPage(x, path, decodeURIComponent(id));
    if (kind === 'patients') return patientPage(x, path, decodeURIComponent(id));
    if (kind === 'tasks') return id ? taskForm(x, path, decodeURIComponent(id)) : tasksPage(x, path);
    if (kind === 'tickets') return id ? ticketPage(x, path, decodeURIComponent(id)) : ticketsPage(x, path);
    return null;
  }

  /* ---------- validation + submit ---------- */
  const RULES = {
    note: { note: (v) => !v.trim() ? 'Enter a note.' : '' },
    task: { title: (v) => v.trim().length < 3 ? 'Task title must be at least 3 characters.' : '', due: (v) => !M.validDate(v) ? 'Choose a due date.' : '' },
    taskEdit: { title: (v) => v.trim().length < 3 ? 'Task title must be at least 3 characters.' : '', due: (v) => !M.validDate(v) ? 'Choose a due date.' : '' },
    followup: { date: (v) => !M.validDate(v) ? 'Choose a follow-up date.' : v <= today() ? 'Follow-up date must be after today.' : '', reason: (v) => !v.trim() ? 'Enter a reason for the follow-up.' : '' },
    reply: { reply: (v) => !v.trim() ? 'Enter a reply.' : '' },
  };
  function validate(form, only) {
    const rules = RULES[form.dataset.opsForm] || {}, data = new FormData(form);
    let first = null;
    for (const [name, rule] of Object.entries(rules)) {
      if (only && only !== name) continue;
      const msg = rule(String(data.get(name) || ''));
      const slot = form.querySelector(`[data-error-for="${name}"]`);
      if (slot) slot.textContent = msg;
      const el = form.elements[name];
      if (el) msg ? el.setAttribute('aria-invalid', 'true') : el.removeAttribute('aria-invalid');
      if (msg && !first) first = el;
    }
    if (first && !only) first.focus();
    return !first;
  }
  document.addEventListener('focusout', (ev) => { const form = ev.target.closest?.('form[data-ops-form]'); if (form && ev.target.name && (ev.target.value || ev.target.getAttribute('aria-invalid'))) validate(form, ev.target.name); });
  document.addEventListener('input', (ev) => {
    const form = ev.target.closest?.('form[data-ops-form]');
    if (!form) return;
    ops.forms[form.dataset.opsForm] = Object.fromEntries(new FormData(form));
    if (ev.target.getAttribute('aria-invalid')) validate(form, ev.target.name);
  });
  document.addEventListener('submit', (ev) => {
    const form = ev.target.closest('form[data-ops-form]');
    if (!form || !lastCtx) return;
    ev.preventDefault();
    if (!validate(form)) return;
    const x = lastCtx, d = Object.fromEntries(new FormData(form)), name = form.dataset.opsForm;
    const cta = form.querySelector('[type=submit]'), alertIn = form.querySelector('[data-form-alert]');
    const clear = () => { delete ops.forms[name]; };
    if (name === 'note') return run(x, cta, () => { const f = findVisit(d.visitId); if (!f) return { ok: false, message: 'This visit no longer exists.' }; (f.v.staffNotes ??= []).push({ id: Store.uid('note'), text: d.note.trim(), author: st.clinic.staffName, at: new Date().toISOString() }); clear(); }, { done: 'Internal note saved', alertIn });
    if (name === 'task') return run(x, cta, () => { st.clinic.tasks.unshift({ id: 'TK-' + (++st.clinic.sequence.task), title: d.title.trim(), patientId: d.patientId, visitId: d.visitId, due: d.due, priority: d.priority, assignee: d.assignee, note: d.note.trim(), status: 'open', createdAt: new Date().toISOString() }); clear(); }, { done: 'Task created', alertIn });
    if (name === 'taskEdit') return run(x, cta, () => {
      const fields = { title: d.title.trim(), patientId: d.patientId, due: d.due, priority: d.priority, assignee: d.assignee, note: d.note.trim() };
      if (d.taskId) { const t = st.clinic.tasks.find((k) => k.id === d.taskId); if (!t) return { ok: false, message: 'This task no longer exists.' }; const wasOpen = t.status === 'open'; Object.assign(t, fields, { status: d.status || t.status }); if (wasOpen && t.status === 'done') onTaskDone(t); }
      else st.clinic.tasks.unshift({ id: 'TK-' + (++st.clinic.sequence.task), ...fields, visitId: null, status: 'open', createdAt: new Date().toISOString() });
      clear();
    }, { done: d.taskId ? 'Task saved' : 'Task created', go: '/ops/tasks', alertIn });
    if (name === 'followup') return run(x, cta, () => {
      const f = findVisit(d.visitId); if (!f) return { ok: false, message: 'This visit no longer exists.' };
      const at = new Date().toISOString(), scope = f.scope;
      const id = scope === 'account' ? 'CF-' + String(++st.sequence).padStart(4, '0') : 'PK-0' + (++st.clinic.sequence.visit);
      const v = { ...structuredClone(f.v), id, date: d.date, slot: d.slot, mode: d.mode, reason: d.reason.trim(), status: 'confirmed', purpose: 'followup', previousId: f.v.id, labs: [], staffNotes: [], cancelReason: '', rescheduledTo: null, createdAt: at,
        payment: { status: 'unpaid', amount: null, reason: '', dueDate: '', history: [] }, care: { status: 'monitoring', referral: null }, communication: { result: 'pending', explanation: 'pending', callback: 'none' },
        history: [{ status: 'pending', at, actor: 'staff' }, { status: 'confirmed', at, actor: 'staff' }] };
      for (const k of ['lockedAt', 'signedAt', 'signedBy', 'summary']) delete v[k];
      (scope === 'account' ? st.visits : st.clinic.visits).push(v);
      if (scope === 'account') notifyPatient({ visitId: id, patientId: v.patientId, screen: 'D2', title: 'The clinic booked a follow-up visit', body: dmy(d.date) + ', ' + d.slot + ' with ' + (v.clinician?.name || 'your attending doctor') + '.' });
      clear();
    }, { done: 'Follow-up scheduled', alertIn });
    if (name === 'reply') return run(x, cta, () => {
      const t = (st.tickets || []).find((k) => k.id === d.ticketId); if (!t || t.status === 'closed') return { ok: false, message: 'This ticket is closed.' };
      t.thread.push({ from: 'staff', author: st.clinic.staffName, text: d.reply.trim(), at: new Date().toISOString() }); t.status = 'answered';
      notifyPatient({ ticketId: t.id, screen: 'T2', title: 'The clinic replied to ticket ' + t.id, body: 'Open the ticket to see the reply.' });
      clear();
    }, { done: 'Reply sent to patient', alertIn });
  });
  function onTaskDone(t) {
    t.completedAt = new Date().toISOString();
    if (t.source !== 'refill') return;
    const r = (st.prescriptions || []).find((k) => k.id === t.rxId);
    if (r?.refill?.status === 'requested') {
      r.refill = { ...r.refill, status: 'reviewed', reviewedAt: t.completedAt };
      (r.refillHistory ??= []).push({ status: 'reviewed', at: t.completedAt });
      notifyPatient({ rxId: r.id, screen: 'M2', title: 'The clinic reviewed your refill request', body: r.name + '. This is a simulation; no new prescription has been issued.' });
    }
  }

  /* ---------- actions ---------- */
  function action(b, x) {
    lastCtx = x;
    const a = b.dataset.action, id = b.dataset.id;
    const simple = { 'ops-confirm': 'Appointment confirmed', 'ops-checkin': 'Patient checked in', 'ops-start': 'Consultation started' };
    if (simple[a]) { run(x, b, () => applySteps(a, id), { done: simple[a] }); return true; }
    if (a === 'ops-complete') { ops.modal = { type: 'complete', id }; x.render(); document.querySelector('#ops-modal-title')?.closest('.dialog-card')?.querySelector('.btn-primary')?.focus(); return true; }
    if (a === 'ops-noshow') { ops.modal = { type: 'noshow', id }; x.render(); return true; }
    if (a === 'ops-complete-confirm') { run(x, b, () => applySteps('ops-complete', id), { done: 'Visit completed' }); return true; }
    if (a === 'ops-noshow-confirm') { run(x, b, () => applySteps('ops-noshow', id), { done: 'No-show recorded' }); return true; }
    if (a === 'ops-close-modal') { ops.modal = null; x.render(); return true; }
    if (a === 'ops-queue-filter') { ops.queueFilter = b.dataset.value; x.render(); return true; }
    if (a === 'ops-task-filter') { ops.taskFilter = b.dataset.value; x.render(); return true; }
    if (a === 'ops-ticket-filter') { ops.ticketFilter = b.dataset.value; x.render(); return true; }
    if (a === 'ops-retry-load') { load(x); x.render(); return true; }
    if (a === 'ops-retry') { ops.error = null; ops.retry?.(); return true; }
    if (a === 'ops-dismiss-error') { ops.error = null; x.render(); return true; }
    if (a === 'ops-resubmit') { document.querySelector(`form[data-ops-form="${b.dataset.form}"]`)?.requestSubmit(); return true; }
    if (a === 'ops-cancel-form') { delete ops.forms[b.dataset.form]; x.go('/ops/tasks'); return true; }
    if (a === 'ops-task-done') { run(x, b, () => { const t = st.clinic.tasks.find((k) => k.id === id); if (!t) return { ok: false, message: 'This task no longer exists.' }; t.status = 'done'; onTaskDone(t); }, { done: 'Task marked done' }); return true; }
    if (a === 'ops-task-reopen') { run(x, b, () => { const t = st.clinic.tasks.find((k) => k.id === id); if (!t) return { ok: false, message: 'This task no longer exists.' }; t.status = 'open'; }, { done: 'Task reopened' }); return true; }
    if (a === 'ops-task-delete') { ops.modal = { type: 'delete-task', id }; x.render(); return true; }
    if (a === 'ops-task-delete-confirm') { run(x, b, () => { const i = st.clinic.tasks.findIndex((k) => k.id === id); if (i < 0) return { ok: false, message: 'This task no longer exists.' }; st.clinic.tasks.splice(i, 1); }, { done: 'Task deleted', go: location.hash.startsWith('#/ops/tasks/') ? '/ops/tasks' : undefined }); return true; }
    if (a === 'ops-note-delete') { ops.modal = { type: 'delete-note', id, note: b.dataset.note }; x.render(); return true; }
    if (a === 'ops-note-delete-confirm') { run(x, b, () => { const f = findVisit(id); const i = f?.v.staffNotes?.findIndex((n) => n.id === b.dataset.note) ?? -1; if (i < 0) return { ok: false, message: 'This note no longer exists.' }; f.v.staffNotes.splice(i, 1); }, { done: 'Note deleted' }); return true; }
    if (a === 'ops-ticket-close') { ops.modal = { type: 'close-ticket', id }; x.render(); return true; }
    if (a === 'ops-ticket-close-confirm') { run(x, b, () => { const t = (st.tickets || []).find((k) => k.id === id); if (!t) return { ok: false, message: 'This ticket no longer exists.' }; t.status = 'closed'; t.closeReason = 'Closed by the clinic'; }, { done: 'Ticket closed' }); return true; }
    if (a === 'ops-fail-toggle') { Store.failNext.set(!Store.failNext.get()); x.notify(Store.failNext.get() ? 'The next save or load will hit a simulated connection error' : 'Simulated error turned off'); return true; }
    if (a === 'confirm-reset') { st = Store.reset(); ops.forms = {}; ops.error = null; ops.gate.path = null; return false; }
    return false;
  }
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && ops.modal) { ops.modal = null; ctxRender(); } });
  /** Header entry: compact link plus the simulated-failure switch. */
  function headerLinks() {
    return `<a class="ops-header-link" href="#/ops/queue" title="Clinic operations: queue, tasks, support tickets">Operations</a>`;
  }
  root.CareFlowClinicOps = { permitted, page, action, title, headerLinks };
})(window);
