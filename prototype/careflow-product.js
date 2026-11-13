/* CareFlow product layer: medications, profile/family/insurance editing, support
 * tickets, simulated loading/error states and demo reset. Data comes from
 * data/careflow-seed.js and is kept in sessionStorage through app.js.
 * No backend: every "send" is stored in this browser tab only. */
(function (root) {
  'use strict';
  const M = root.CareFlowModel, UI = root.CareFlowUI, Store = root.CareFlowStore, Seed = root.CareFlowSeed;
  const App = () => root.CareFlowApp;
  const esc = (x) => String(x ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  const I = (name, size = 20) => root.CareFlowIcon(name, size).replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
  const attrs = (o) => Object.entries(o || {}).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => ` ${k}="${esc(v)}"`).join('');

  /* ---------- screen registry (appended to the 47-screen inventory at runtime) ---------- */
  const SCREENS = [
    { id: 'M1', title: 'Prescriptions', route: '/medications', tab: 'B1' },
    { id: 'M3', title: 'Request a refill', route: '/medications/:rxId/refill', tab: 'B1' },
    { id: 'M2', title: 'Medication details', route: '/medications/:rxId', tab: 'B1' },
    { id: 'K6', title: 'Edit personal details', route: '/profile/edit', tab: 'K2' },
    { id: 'K7', title: 'Family members', route: '/profile/family', tab: 'K2' },
    { id: 'K8', title: 'Add family member', route: '/profile/family/new', tab: 'K2' },
    { id: 'K10', title: 'Edit family member', route: '/profile/family/:personId/edit', tab: 'K2' },
    { id: 'K9', title: 'Family member profile', route: '/profile/family/:personId', tab: 'K2' },
    { id: 'K11', title: 'Insurance', route: '/profile/insurance', tab: 'K2' },
    { id: 'K12', title: 'Edit insurance details', route: '/profile/insurance/edit', tab: 'K2' },
    { id: 'T1', title: 'Support tickets', route: '/support/tickets', tab: 'K5' },
    { id: 'T3', title: 'New support ticket', route: '/support/tickets/new', tab: 'K5' },
    { id: 'T2', title: 'Ticket details', route: '/support/tickets/:ticketId', tab: 'K5' },
  ];
  const byId = Object.fromEntries(SCREENS.map((x) => [x.id, x]));
  for (const x of SCREENS) if (!M.SCREENS.some((y) => y.id === x.id)) M.SCREENS.push({ id: x.id, title: x.title, route: x.route, phase: 'Demo' });
  const has = (id) => !!byId[id];
  const tabFor = (id) => byId[id]?.tab;

  /* ---------- shared vocabulary ---------- */
  const RELATIONS = [['mother', 'Mother'], ['father', 'Father'], ['spouse', 'Spouse'], ['child', 'Child'], ['sibling', 'Sibling'], ['relative', 'Other relative']];
  const relationLabel = (r) => r === 'self' ? 'Self' : (RELATIONS.find(([k]) => k === r)?.[1] || 'Family member');
  const TOPICS = ['Reschedule or cancel', 'Profile information', 'Payment', 'Results', 'Prescription', 'Online visit', 'Other'];
  const TICKET_STATUS = { open: ['Awaiting clinic', 'warning'], answered: ['Clinic replied', 'info'], closed: ['Closed', 'neutral'] };
  const REFILL_STATUS = { requested: ['Refill requested', 'warning'], reviewed: ['Reviewed by clinic', 'success'], cancelled: ['Request cancelled', 'neutral'] };
  const INSURANCE_TYPES = [['bhyt', 'Public health insurance'], ['private', 'Private health insurance']];
  const today = () => M.localDate();
  const dmy = (d) => d ? d.split('-').reverse().join('/') : 'Not provided';
  const stamp = (iso) => { try { return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(iso)); } catch { return ''; } };
  const pill = (label, tone = 'info') => `<span class="chip ${tone}" data-cf-component="status" data-cf-tone="${tone}">${I(tone === 'success' ? 'check-circle' : tone === 'warning' ? 'clock' : tone === 'danger' ? 'warning' : 'info', 16)}${esc(label)}</span>`;
  const note = (text, type = 'info') => `<div class="note ${type}">${I(type === 'danger' || type === 'warning' ? 'warning' : 'info', 19)}<p>${esc(text)}</p></div>`;
  const button = (label, action, data = {}, variant = 'secondary', icon = '') => `<button type="button" class="btn ${variant}" ${UI.buttonAttrs(variant)} data-action="${action}"${attrs(data)}>${icon ? I(icon, 18) : ''}<span>${esc(label)}</span></button>`;
  const nav = (label, to, params = {}, variant = 'secondary', icon = '') => button(label, 'p-nav', { 'data-to': to, ...Object.fromEntries(Object.entries(params).map(([k, v]) => ['data-p-' + k, v])) }, variant, icon);
  const prow = (title, hint, to, params = {}, icon = 'document', trailing = '') => `<button type="button" class="row cf-product-row" ${UI.cardAttrs('row')} data-action="p-nav" data-to="${to}"${attrs(Object.fromEntries(Object.entries(params).map(([k, v]) => ['data-p-' + k, v])))}><span class="row-icon">${I(icon)}</span><span class="row-text"><strong>${esc(title)}</strong>${hint ? `<small>${esc(hint)}</small>` : ''}${trailing ? `<span class="cf-row-badges">${trailing}</span>` : ''}</span><span class="row-arrow">${I('chevron-right', 18)}</span></button>`;
  const empty = (title, lead, action = '') => `<div class="empty" data-cf-card="surface" data-cf-state="empty">${UI.illustration('result')}<h2>${esc(title)}</h2>${lead ? `<p>${esc(lead)}</p>` : ''}${action}</div>`;
  const facts = (rows) => `<dl class="details" data-cf-component="facts">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v || 'Not provided')}</dd></div>`).join('')}</dl>`;
  const section = (title, html, icon = 'document', extra = '') => `<section class="section ${extra}" ${UI.cardAttrs('section')}><h2 class="section-heading">${I(icon, 18)}<span>${esc(title)}</span></h2>${html}</section>`;
  const segmented = (key, value, options) => `<div class="cf-segmented" role="group" aria-label="Filter list">${options.map(([v, label, count]) => `<button type="button" data-action="p-filter" data-key="${key}" data-value="${v}" aria-pressed="${v === value}">${esc(label)}${count !== undefined ? `<span>${count}</span>` : ''}</button>`).join('')}</div>`;

  /* ---------- form helpers with inline validation ---------- */
  const fieldMsg = (id) => `<p class="field-message" id="${id}-error" data-error-for="${id}" aria-live="polite"></p>`;
  const input = (id, label, value = '', type = 'text', extra = {}, hint = '') => `<div class="field" data-field="${id}"><label for="${id}"><span>${esc(label)}</span>${extra.required ? '<em class="cf-required" aria-hidden="true">*</em>' : ''}</label>${hint ? `<small class="field-hint" id="${id}-hint">${esc(hint)}</small>` : ''}<input id="${id}" name="${id}" type="${type}" value="${esc(value)}" aria-describedby="${hint ? id + '-hint ' : ''}${id}-error"${attrs(extra)}>${fieldMsg(id)}</div>`;
  const area = (id, label, value = '', extra = {}, hint = '') => `<div class="field" data-field="${id}"><label for="${id}"><span>${esc(label)}</span>${extra.required ? '<em class="cf-required" aria-hidden="true">*</em>' : ''}</label>${hint ? `<small class="field-hint" id="${id}-hint">${esc(hint)}</small>` : ''}<textarea id="${id}" name="${id}" rows="${extra.rows || 4}" aria-describedby="${hint ? id + '-hint ' : ''}${id}-error"${attrs({ ...extra, rows: undefined })}>${esc(value)}</textarea>${fieldMsg(id)}</div>`;
  const select = (id, label, value, options, extra = {}) => `<div class="field" data-field="${id}"><label for="${id}"><span>${esc(label)}</span>${extra.required ? '<em class="cf-required" aria-hidden="true">*</em>' : ''}</label><select id="${id}" name="${id}" aria-describedby="${id}-error"${attrs(extra)}>${options.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(value) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>${fieldMsg(id)}</div>`;
  const radios = (id, legend, value, options) => `<fieldset class="cf-radio-set" data-field="${id}" aria-describedby="${id}-error"><legend>${esc(legend)}<em class="cf-required" aria-hidden="true">*</em></legend>${options.map(([v, l]) => `<label class="cf-radio"><input type="radio" name="${id}" value="${esc(v)}"${v === value ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('')}${fieldMsg(id)}</fieldset>`;
  const checkbox = (id, label, checked = false) => `<div class="field cf-check-field" data-field="${id}"><label class="check"><input id="${id}" name="${id}" type="checkbox" aria-describedby="${id}-error"${checked ? ' checked' : ''}><span>${esc(label)}</span></label>${fieldMsg(id)}</div>`;
  const pform = (name, html, cta, { cancel = '', variant = 'primary' } = {}) => `<form data-form="${name}" data-product-form novalidate><div class="form-body">${html}</div><div class="form-actions"><div class="cf-form-alert" data-form-alert role="alert"></div><p class="field-error" id="form-error" role="alert"></p><button class="btn ${variant}" ${UI.buttonAttrs(variant, 'lg')} type="submit"><span>${esc(cta)}</span>${I('check-circle', 20)}</button>${cancel}</div></form>`;

  const RULES = {
    name: (v) => !v.trim() ? 'Enter the full name.' : v.trim().length < 2 ? 'Full name must be at least 2 characters.' : v.trim().length > 60 ? 'Full name can be up to 60 characters.' : /[0-9@#$%^&*_=+<>{}[\]]/.test(v) ? 'Full name can only contain letters and spaces.' : '',
    dob: (v) => !v ? 'Choose a date of birth.' : !M.validDate(v) ? 'Date of birth is not valid.' : v > today() ? 'Date of birth cannot be in the future.' : v < '1900-01-01' ? 'Date of birth is not valid.' : '',
    phone: (v) => !v.trim() ? 'Enter a phone number.' : !/^0\d{9}$/.test(v.replace(/\s/g, '')) ? 'Phone number must be 10 digits starting with 0.' : '',
    phoneOptional: (v) => v.trim() && !/^0\d{9}$/.test(v.replace(/\s/g, '')) ? 'Phone number must be 10 digits starting with 0.' : '',
    email: (v) => v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Enter a valid email, e.g. name@example.com.' : '',
    max: (n) => (v) => v.length > n ? `Up to ${n} characters.` : '',
    required: (msg) => (v) => !String(v).trim() ? msg : '',
  };
  const VALIDATORS = {
    'profile-edit': { name: RULES.name, dob: RULES.dob, phone: RULES.phone, email: RULES.email, address: RULES.max(120), allergies: RULES.max(200), medicalHistory: RULES.max(500) },
    'family-edit': { name: RULES.name, dob: RULES.dob, relation: RULES.required('Choose a relationship.'), phone: RULES.phoneOptional },
    insurance: {
      type: RULES.required('Choose an insurance type.'),
      number: (v, f) => { const x = v.trim().toUpperCase(); if (!x) return 'Enter the insurance card number.'; if (f.get('type') === 'bhyt' && !/^[A-Z]{2}\d{13}$/.test(x)) return 'A health insurance card number has 2 letters and 13 digits (15 characters).'; if (f.get('type') !== 'bhyt' && !/^[A-Z0-9-]{6,20}$/.test(x)) return 'Policy number must be 6–20 letters, digits or hyphens.'; return ''; },
      holder: RULES.name,
      facility: (v, f) => f.get('type') === 'bhyt' && !v.trim() ? 'Enter your registered primary care facility.' : v.length > 120 ? 'Up to 120 characters.' : '',
      validFrom: (v, f) => v && !M.validDate(v) ? 'Start date is not valid.' : v && f.get('validTo') && v >= f.get('validTo') ? 'Start date must be before the expiry date.' : '',
      validTo: (v) => !v ? 'Choose an expiry date.' : !M.validDate(v) ? 'Expiry date is not valid.' : v <= today() ? 'This card has expired. Enter a card that is still valid.' : '',
    },
    refill: { supply: RULES.required('Choose how much medication you have left.'), pickup: RULES.required('Choose how the clinic should contact you.'), refillNote: RULES.max(300), ack: (v) => v !== 'on' ? 'Please confirm before sending.' : '' },
    'ticket-new': { topic: RULES.required('Choose a topic.'), subject: (v) => !v.trim() ? 'Enter a short subject.' : v.trim().length < 5 ? 'Subject must be at least 5 characters.' : v.length > 80 ? 'Subject can be up to 80 characters.' : '', body: (v) => !v.trim() ? 'Describe what you need help with.' : v.trim().length < 10 ? 'Please write at least 10 characters so the clinic understands.' : v.length > 1000 ? 'Up to 1000 characters.' : '' },
    'ticket-reply': { reply: (v) => !v.trim() ? 'Enter your reply.' : v.length > 1000 ? 'Up to 1000 characters.' : '' },
  };
  function setFieldError(form, name, message) {
    const slot = form.querySelector(`[data-error-for="${CSS.escape(name)}"]`);
    if (slot) slot.textContent = message || '';
    form.querySelectorAll(`[name="${CSS.escape(name)}"]`).forEach((el) => message ? el.setAttribute('aria-invalid', 'true') : el.removeAttribute('aria-invalid'));
    form.querySelector(`[data-field="${CSS.escape(name)}"]`)?.classList.toggle('has-error', !!message);
    const control = document.getElementById(name + '-control');
    if (control && form.contains(control)) message ? control.setAttribute('aria-invalid', 'true') : control.removeAttribute('aria-invalid');
  }
  function validate(form, only) {
    const rules = VALIDATORS[form.dataset.form];
    if (!rules) return true;
    const data = new FormData(form);
    let first = null;
    for (const [name, rule] of Object.entries(rules)) {
      if (only && name !== only) continue;
      const message = rule(String(data.get(name) ?? ''), data);
      setFieldError(form, name, message);
      if (message && !first) first = name;
    }
    if (!only) {
      const summary = form.querySelector('#form-error');
      if (summary) summary.textContent = first ? 'Please check the highlighted fields.' : '';
      if (first) form.querySelector(`[name="${CSS.escape(first)}"]`)?.focus();
    }
    return !first;
  }

  /* ---------- simulated loading / error gate ---------- */
  const gate = { hash: null, state: 'ready' };
  const GATED = new Set(['D1', 'K1', 'M1', 'M2', 'K7', 'K9', 'K11', 'T1', 'T2']);
  const gatedFor = (id, s) => GATED.has(id) && (has(id) || s.seeded);
  function startLoad() {
    gate.state = 'loading';
    const hash = gate.hash;
    Store.request(null, { delay: 380 }).then(() => { if (gate.hash === hash) { gate.state = 'ready'; App().render(); } })
      .catch(() => { if (gate.hash === hash) { gate.state = 'error'; App().render(); } });
  }
  /** Returns placeholder markup while a screen "loads", or null when content can render. */
  function gateView(id, s) {
    if (!gatedFor(id, s)) { gate.hash = null; return null; }
    if (gate.hash !== location.hash) { gate.hash = location.hash; startLoad(); }
    if (gate.state === 'ready') return null;
    const title = byId[id]?.title || M.SCREENS.find((x) => x.id === id)?.title || 'CareFlow';
    const intro = `<div class="screen-intro"><h1 id="screen-title" tabindex="-1">${esc(title)}</h1><p></p></div>`;
    if (gate.state === 'error') return `<div class="screen-masthead">${intro}</div><div class="cf-load-error" data-cf-state="error" role="alert">${I('warning', 28)}<h2>Couldn’t load data</h2><p>The connection to the demo server was interrupted. Your data is still safe in this session.</p>${button('Try again', 'p-retry-load', {}, 'primary', 'refresh')}</div>`;
    return `<div class="screen-masthead">${intro}</div><div class="cf-skeleton" data-cf-state="loading" aria-busy="true" aria-label="Loading"><span class="sr-only">Loading data…</span>${'<div class="cf-skeleton-card"><span></span><span></span><span></span></div>'.repeat(3)}</div>`;
  }

  /* ---------- data helpers ---------- */
  const st = () => App().state;
  const visibleProfiles = (s) => s.profiles.filter((p) => p.relation === 'self' || p.canViewResults);
  const rxFor = (s) => (s.prescriptions || []).filter((r) => visibleProfiles(s).some((p) => p.id === r.patientId));
  const rxEnded = (r) => r.status !== 'active' || r.endDate < today();
  const refillsUsed = (r) => r.refillsUsed || 0;
  const ticket = (s, id) => (s.tickets || []).find((t) => t.id === id);
  const nextTicketId = (s) => 'HT-' + (Math.max(1000, ...(s.tickets || []).map((t) => Number(t.id.replace(/\D/g, '')) || 0)) + 1);
  const pushNotice = (s, n) => s.notifications.unshift({ id: Store.uid('n'), read: false, at: new Date().toISOString(), ...n });
  const account = (s) => M.accountProfile(s);
  const param = (k) => App().ui.params?.[k];

  /* ---------- screens ---------- */
  function head(title, lead = '') { return `<div class="screen-intro"><h1 id="screen-title" tabindex="-1">${esc(title)}</h1><p>${esc(lead)}</p></div>`; }
  function notFound(title, lead, back, backLabel) {
    return { heading: 'Not found', lead: '', body: `<div data-cf-state="not-found">${empty(title, lead, nav(backLabel, back, {}, 'primary'))}</div>` };
  }
  function medsList(s, u) {
    const all = rxFor(s), filter = u.rxFilter || 'active';
    const active = all.filter((r) => !rxEnded(r)), ended = all.filter(rxEnded);
    const list = filter === 'active' ? active : ended;
    const card = (r) => {
      const person = M.profile(s, r.patientId);
      const refill = r.refill && REFILL_STATUS[r.refill.status];
      return `<article class="cf-rx-card" ${UI.cardAttrs('surface')} data-rx="${esc(r.id)}"><button type="button" class="cf-rx-open" data-action="p-nav" data-to="M2" data-p-rx-id="${esc(r.id)}" ><span class="cf-rx-icon" aria-hidden="true">${I('pill', 24)}</span><span class="cf-rx-copy"><strong>${esc(r.name)}</strong><small>${esc(r.form)}, ${esc(r.quantity)}</small><small>${esc(person?.name || '')}</small><small>${esc(dmy(r.startDate))} – ${esc(dmy(r.endDate))}</small></span>${I('chevron-right', 18)}</button><div class="cf-rx-meta">${rxEnded(r) ? pill('Ended', 'neutral') : pill('Active', 'success')}${refill ? pill(refill[0], refill[1]) : ''}</div></article>`;
    };
    return {
      heading: 'Prescriptions', lead: 'Medications prescribed at your visits and at visits of family members you can view.',
      body: segmented('rxFilter', filter, [['active', 'Active', active.length], ['ended', 'Ended', ended.length]]) +
        (list.length ? `<div class="cf-rx-list">${list.map(card).join('')}</div>` : empty(filter === 'active' ? 'No active medications' : 'No ended prescriptions yet', filter === 'active' ? 'Prescriptions appear here when the clinic shares them after a visit.' : 'Prescriptions that have ended are kept here.', nav('View appointments', 'D1'))) +
        note('Sample information in this demo. Don’t change how you take your medication on your own; ask your doctor or pharmacist if needed.'),
    };
  }
  function medDetail(s, u) {
    const r = rxFor(s).find((x) => x.id === param('rxId'));
    if (!r) return notFound('Prescription not found', 'This prescription doesn’t exist or you don’t have permission to view it.', 'M1', 'Back to prescriptions');
    const person = M.profile(s, r.patientId), visit = s.visits.find((v) => v.id === r.visitId);
    const left = Math.max(0, (r.refillsAllowed || 0) - refillsUsed(r));
    let refill = '';
    if (r.refill?.status === 'requested') refill = `<div class="cf-refill-status">${pill(REFILL_STATUS.requested[0], 'warning')}<p>Sent ${esc(stamp(r.refill.at))}. The clinic will review it and contact you ${esc(r.refill.pickup === 'call' ? 'by phone' : 'via the clinic pharmacy')}.</p>${r.refill.note ? `<p class="cf-quote">“${esc(r.refill.note)}”</p>` : ''}${button('Cancel refill request', 'rx-cancel-refill', { 'data-id': r.id }, 'text danger-text', 'cross')}</div>`;
    else if (r.refill?.status === 'reviewed') refill = `<div class="cf-refill-status">${pill(REFILL_STATUS.reviewed[0], 'success')}<p>The clinic reviewed your request on ${esc(stamp(r.refill.reviewedAt))}. This is a simulation; no new prescription has been issued.</p></div>`;
    if (!rxEnded(r) && r.refill?.status !== 'requested') refill += left ? nav('Request a refill', 'M3', { 'rx-id': r.id }, 'primary', 'refresh') + `<p class="hint">${left} ${left === 1 ? 'refill' : 'refills'} left on this prescription.</p>` : note('No refills left on this prescription. Book a follow-up so your doctor can review it.');
    if (rxEnded(r)) refill += note('This prescription has ended. If you need to continue, ask the clinic or book a follow-up.') + nav('Ask the clinic about this', 'T3', { topic: 'Prescription', rx: r.id });
    return {
      heading: r.name, lead: `${r.form}, ${r.quantity}`,
      body: `<section class="card cf-rx-hero" ${UI.cardAttrs('tonal')}><span class="cf-rx-icon" aria-hidden="true">${I('pill', 28)}</span><div>${rxEnded(r) ? pill('Ended', 'neutral') : pill('Active', 'success')}<p class="eyebrow">Prescription ${esc(r.id)}</p></div></section>` +
        section('Prescription details', facts([['Patient', person?.name], ['Prescriber', r.prescriber], ['Duration', dmy(r.startDate) + ' – ' + dmy(r.endDate)], ['Directions', r.instructions]]) + (visit ? prow('Visit ' + visit.id, dmy(visit.date) + ', ' + (visit.clinician?.name || ''), 'D2', { 'visit-id': visit.id }, 'calendar') : ''), 'pill') +
        section('Refills', refill, 'refresh') +
        (r.refillHistory?.length ? section('Request history', `<ol class="timeline">${r.refillHistory.slice().reverse().map((h) => `<li><span class="timeline-dot"></span><div><strong>${esc(REFILL_STATUS[h.status]?.[0] || h.status)}</strong><small>${esc(stamp(h.at))}</small></div></li>`).join('')}</ol>`, 'clock') : '') +
        note('Sample information. Don’t use it to start, stop or change a dose on your own.', 'warning'),
    };
  }
  function refillForm(s, u) {
    const r = rxFor(s).find((x) => x.id === param('rxId'));
    if (!r) return notFound('Prescription not found', 'A request can’t be made for this prescription.', 'M1', 'Back to prescriptions');
    if (rxEnded(r) || r.refill?.status === 'requested') return { heading: 'Request a refill', lead: r.name, body: note(r.refill?.status === 'requested' ? 'This prescription already has a request awaiting clinic review.' : 'This prescription has ended, so a refill can’t be requested.', 'warning') + nav('View prescription', 'M2', { 'rx-id': r.id }, 'primary') };
    const f = u.forms.refill || {};
    return {
      heading: 'Request a refill', lead: r.name + ', for ' + (M.profile(s, r.patientId)?.name || ''),
      body: pform('refill',
        radios('supply', 'About how much medication do you have left?', f.supply || '', [['lt3', 'Less than 3 days'], ['3to7', '3–7 days'], ['out', 'None left']]) +
        radios('pickup', 'How should the clinic contact you?', f.pickup || '', [['pharmacy', 'Clinic pharmacy'], ['call', 'Call me']]) +
        area('refillNote', 'Note for the clinic (optional)', f.refillNote || '', { maxlength: '300', rows: 3 }, 'For example, when you can take a call.') +
        checkbox('ack', 'I understand a doctor must review this request and it is not a new prescription.', f.ack === true),
        'Send request', { cancel: button('Cancel', 'p-form-cancel', { 'data-form': 'refill', 'data-to': 'M2', 'data-p-rx-id': r.id }, 'text') }),
    };
  }
  function profileEdit(s, u) {
    const p = account(s);
    if (!p) return notFound('No profile yet', 'Create a profile before editing.', 'K2', 'Back to profile');
    const f = { ...p, ...(u.forms['profile-edit'] || {}) };
    return {
      heading: 'Edit personal details', lead: 'Keep your details up to date so the clinic can contact you and prepare for your visit.',
      body: pform('profile-edit',
        input('name', 'Full name', f.name, 'text', { autocomplete: 'name', required: true, maxlength: '60' }) +
        input('dob', 'Date of birth', f.dob, 'date', { max: today(), required: true }) +
        input('phone', 'Phone number', f.phone, 'tel', { inputmode: 'tel', autocomplete: 'tel', required: true }, '10 digits, e.g. 0901234567.') +
        input('email', 'Email (optional)', f.email, 'email', { autocomplete: 'email' }) +
        input('address', 'Contact address (optional)', f.address, 'text', { autocomplete: 'street-address', maxlength: '120' }) +
        area('allergies', 'Known allergies', f.allergies, { maxlength: '200', rows: 2 }, 'Write “None recorded” if you don’t know of any allergies.') +
        area('medicalHistory', 'Health notes', f.medicalHistory, { maxlength: '500', rows: 3 }),
        'Save changes', { cancel: button('Cancel', 'p-form-cancel', { 'data-form': 'profile-edit', 'data-to': 'K2' }, 'text') }),
    };
  }
  function familyList(s) {
    const people = s.profiles.filter((p) => p.relation !== 'self');
    return {
      heading: 'Family members', lead: 'Manage family members’ profiles to book on their behalf.',
      body: (people.length ? `<div class="list cf-family-list">${people.map((p) => prow(p.name, relationLabel(p.relation) + ', born ' + dmy(p.dob), 'K9', { 'person-id': p.id }, 'user', p.canViewResults ? '' : `<span class="cf-row-tag">Can’t view results</span>`)).join('')}</div>` : empty('No family members yet', 'Add a profile to book and track appointments for a family member.')) +
        nav('Add family member', 'K8', {}, 'primary', 'plus'),
    };
  }
  function familyForm(s, u, editing) {
    const p = editing ? s.profiles.find((x) => x.id === param('personId') && x.relation !== 'self') : null;
    if (editing && !p) return notFound('Profile not found', 'This family member’s profile doesn’t exist or has been deleted.', 'K7', 'Back to family members');
    const key = 'family-edit';
    const f = { name: '', dob: '', relation: '', phone: '', ...(p || {}), ...(u.forms[key] || {}) };
    return {
      heading: editing ? 'Edit family member' : 'Add family member', lead: editing ? p.name : 'Basic details help the clinic identify the right patient.',
      body: pform(key,
        `<input type="hidden" name="personId" value="${esc(p?.id || '')}">` +
        input('name', 'Full name', f.name, 'text', { required: true, maxlength: '60', autocomplete: 'off' }) +
        input('dob', 'Date of birth', f.dob, 'date', { max: today(), required: true }) +
        select('relation', 'Relationship to you', f.relation, [['', 'Choose a relationship'], ...RELATIONS], { required: true }) +
        input('phone', 'Their phone number (optional)', f.phone, 'tel', { inputmode: 'tel' }) +
        note('The clinic confirms whether you can view a family member’s results; this can’t be changed in the app.'),
        editing ? 'Save changes' : 'Add profile', { cancel: button('Cancel', 'p-form-cancel', { 'data-form': key, 'data-to': editing ? 'K9' : 'K7', 'data-p-person-id': p?.id || '' }, 'text') }),
    };
  }
  function familyDetail(s) {
    const p = s.profiles.find((x) => x.id === param('personId') && x.relation !== 'self');
    if (!p) return notFound('Profile not found', 'This family member’s profile doesn’t exist or has been deleted.', 'K7', 'Back to family members');
    const visits = s.visits.filter((v) => v.patientId === p.id).sort((a, b) => b.date.localeCompare(a.date));
    return {
      heading: p.name, lead: relationLabel(p.relation),
      body: section('Details', facts([['Full name', p.name], ['Date of birth', dmy(p.dob)], ['Relationship', relationLabel(p.relation)], ['Phone number', p.phone || 'Not provided'], ['Results access', p.canViewResults ? 'Allowed' : 'Not granted']]), 'user') +
        `<div class="cf-action-row">${nav('Edit details', 'K10', { 'person-id': p.id }, 'secondary', 'document')}${button('Book for this person', 'profile-book-relative', { 'data-id': p.id }, 'primary', 'calendar')}</div>` +
        section('Appointments', visits.length ? `<div class="list">${visits.map((v) => prow(v.slot + ' on ' + dmy(v.date), (v.clinician?.name || '') + ', ' + UI.status(v.status).label.toLocaleLowerCase('en-GB'), 'D2', { 'visit-id': v.id }, 'calendar')).join('')}</div>` : `<p class="hint">No appointments for this person yet.</p>`, 'calendar') +
        button('Delete family member', 'family-delete', { 'data-id': p.id }, 'text danger-text', 'cross'),
    };
  }
  function insuranceView(s) {
    const p = account(s), ins = p && s.insurance?.[p.id];
    if (!ins) return { heading: 'Insurance', lead: 'Insurance details help the clinic prepare paperwork before your visit.', body: empty('No insurance details yet', 'Add a health insurance card or private policy so the clinic can check it before your visit.', nav('Add insurance', 'K12', {}, 'primary', 'plus')) };
    const expired = ins.validTo <= today(), soon = !expired && ins.validTo <= M.localDate(30);
    return {
      heading: 'Insurance', lead: 'Details you have provided. The clinic will check them against your original card at your visit.',
      body: `<section class="card cf-insurance-card" ${UI.cardAttrs('tonal')}><span class="eyebrow">${esc(INSURANCE_TYPES.find(([k]) => k === ins.type)?.[1] || 'Insurance')}</span><strong class="cf-insurance-number">${esc(ins.number)}</strong><span>${esc(ins.holder)}</span>${expired ? pill('Expired', 'danger') : soon ? pill('Expiring soon', 'warning') : pill('Valid', 'success')}</section>` +
        section('Details', facts([['Primary care facility', ins.facility || 'Not applicable'], ['Valid from', dmy(ins.validFrom)], ['Expires', dmy(ins.validTo)], ['Last updated', stamp(ins.updatedAt)]]), 'shield') +
        `<div class="cf-action-row">${nav('Edit insurance details', 'K12', {}, 'primary', 'document')}${button('Remove insurance details', 'insurance-remove', {}, 'text danger-text', 'cross')}</div>` +
        note('The demo does not verify cards with the insurer.'),
    };
  }
  function insuranceForm(s, u) {
    const p = account(s);
    if (!p) return notFound('No profile yet', 'Create a profile first.', 'K2', 'Back to profile');
    const ins = s.insurance?.[p.id] || { type: 'bhyt', number: '', holder: p.name, facility: '', validFrom: '', validTo: '' };
    const f = { ...ins, ...(u.forms.insurance || {}) };
    return {
      heading: s.insurance?.[p.id] ? 'Edit insurance details' : 'Add insurance', lead: 'Enter the details exactly as on the card so the clinic can check them faster.',
      body: pform('insurance',
        select('type', 'Insurance type', f.type, INSURANCE_TYPES, { required: true }) +
        input('number', f.type === 'bhyt' ? 'Health insurance card number' : 'Policy / card number', f.number, 'text', { required: true, autocapitalize: 'characters', maxlength: '20', spellcheck: 'false' }, f.type === 'bhyt' ? '15 characters: 2 letters and 13 digits.' : '6–20 letters or digits.') +
        input('holder', 'Cardholder name', f.holder, 'text', { required: true, maxlength: '60' }) +
        input('facility', 'Registered primary care facility', f.facility, 'text', { maxlength: '120' }) +
        `<div class="cf-field-pair">${input('validFrom', 'Valid from', f.validFrom, 'date')}${input('validTo', 'Expires', f.validTo, 'date', { required: true, min: M.localDate(1) })}</div>`,
        'Save insurance', { cancel: button('Cancel', 'p-form-cancel', { 'data-form': 'insurance', 'data-to': 'K11' }, 'text') }),
    };
  }
  function ticketList(s, u) {
    const all = (s.tickets || []).slice().sort((a, b) => (b.thread.at(-1)?.at || b.createdAt).localeCompare(a.thread.at(-1)?.at || a.createdAt));
    const filter = u.ticketFilter || 'open';
    const open = all.filter((t) => t.status !== 'closed'), closed = all.filter((t) => t.status === 'closed');
    const list = filter === 'open' ? open : closed;
    return {
      heading: 'Support tickets', lead: 'Track the questions you’ve sent and replies from the clinic.',
      body: nav('New ticket', 'T3', {}, 'primary', 'plus') + segmented('ticketFilter', filter, [['open', 'Open', open.length], ['closed', 'Closed', closed.length]]) +
        (list.length ? `<div class="list cf-ticket-list">${list.map((t) => prow(t.subject, `${t.id}, ${t.topic}. Updated ${stamp(t.thread.at(-1)?.at || t.createdAt)}`, 'T2', { 'ticket-id': t.id }, 'message-circle', pill(TICKET_STATUS[t.status][0], TICKET_STATUS[t.status][1]))).join('')}</div>`
          : empty(filter === 'open' ? 'No open tickets' : 'No closed tickets yet', filter === 'open' ? 'If you need help with appointments, your profile or payment, create a new ticket.' : 'Tickets you close are kept here.')),
    };
  }
  function ticketNew(s, u) {
    const f = { topic: u.params?.topic || TOPICS[0], subject: '', body: '', visitId: '', ...(u.forms['ticket-new'] || {}) };
    const rx = u.params?.rx && rxFor(s).find((r) => r.id === u.params.rx);
    if (rx && !f.subject) f.subject = 'Question about prescription ' + rx.id;
    const visits = s.visits.slice().sort((a, b) => b.date.localeCompare(a.date));
    return {
      heading: 'New support ticket', lead: 'The clinic usually replies during working hours. For emergencies, call 115.',
      body: pform('ticket-new',
        select('topic', 'Topic', f.topic, TOPICS.map((t) => [t, t]), { required: true }) +
        input('subject', 'Subject', f.subject, 'text', { required: true, maxlength: '80' }) +
        select('visitId', 'Related visit (optional)', f.visitId, [['', 'Not about a visit'], ...visits.map((v) => [v.id, `${v.id}, ${dmy(v.date)}, ${M.profile(s, v.patientId)?.name || ''}`])]) +
        area('body', 'Message', f.body, { required: true, maxlength: '1000', rows: 5 }, 'Don’t send urgent information here.'),
        'Send request', { cancel: button('Cancel', 'p-form-cancel', { 'data-form': 'ticket-new', 'data-to': 'T1' }, 'text') }),
    };
  }
  function ticketDetail(s, u) {
    const t = ticket(s, param('ticketId'));
    if (!t) return notFound('Ticket not found', 'This ticket doesn’t exist or was removed from the demo session.', 'T1', 'Back to tickets');
    const me = account(s);
    const thread = `<div class="conversation cf-thread">${t.thread.map((m) => `<div class="message ${m.from === 'patient' ? 'sent' : 'received'}"><span>${esc(m.from === 'patient' ? (me?.name || 'You') : (m.author || 'Clinic'))}, ${esc(stamp(m.at))}</span><p>${esc(m.text)}</p></div>`).join('')}</div>`;
    const visit = t.visitId && s.visits.find((v) => v.id === t.visitId);
    return {
      heading: t.subject, lead: `${t.id}, ${t.topic}`,
      body: `<div class="cf-ticket-head">${pill(TICKET_STATUS[t.status][0], TICKET_STATUS[t.status][1])}<small>Created ${esc(stamp(t.createdAt))}</small></div>` +
        (visit ? prow('Visit ' + visit.id, visit.slot + ' on ' + dmy(visit.date), 'D2', { 'visit-id': visit.id }, 'calendar') : '') +
        section('Conversation', thread, 'message-circle') +
        (t.status === 'closed'
          ? note('This ticket is closed' + (t.closeReason ? ': ' + t.closeReason : '.') + ' You can reopen it if you still need help.') + button('Reopen ticket', 'ticket-reopen', { 'data-id': t.id }, 'secondary', 'refresh')
          : pform('ticket-reply', `<input type="hidden" name="ticketId" value="${esc(t.id)}">` + area('reply', 'Reply to the clinic', u.forms['ticket-reply']?.reply || '', { maxlength: '1000', rows: 3 }), 'Send reply', { variant: 'secondary' }) +
            button('Close ticket', 'ticket-close', { 'data-id': t.id }, 'text danger-text', 'check-circle')),
    };
  }
  const RENDER = { M1: medsList, M2: medDetail, M3: refillForm, K6: profileEdit, K7: familyList, K8: (s, u) => familyForm(s, u, false), K10: (s, u) => familyForm(s, u, true), K9: familyDetail, K11: insuranceView, K12: insuranceForm, T1: ticketList, T2: ticketDetail, T3: ticketNew };
  function render(id, s, u) { return RENDER[id](s, u); }

  /** Clinician picker injected into the booking slot step (C7). */
  function clinicianPicker(s, u) {
    const clinicians = s.clinicians || Seed.DATA.clinicians;
    const d = s.draft || {};
    const cached = u.forms?.slot || {};
    const specialty = cached.specialty || d.clinician?.specialty || clinicians[0].specialty;
    const doctorId = cached.clinicianId ?? d.clinician?.id ?? 'any';
    const options = clinicians.filter((c) => c.specialty === specialty);
    const specialties = s.specialties || Seed.DATA.specialties;
    return `<div class="cf-clinician-picker"><h2>Specialty and doctor</h2>${select('specialty', 'Specialty', specialty, specialties.map((x) => [x, x]))}${select('clinicianId', 'Doctor', options.some((c) => c.id === doctorId) ? doctorId : 'any', [['any', 'Any available doctor'], ...options.map((c) => [c.id, c.name])])}</div>`;
  }
  function chosenClinician(s, specialty, clinicianId) {
    const list = s.clinicians || Seed.DATA.clinicians;
    const c = list.find((x) => x.id === clinicianId && x.specialty === specialty) || list.find((x) => x.specialty === specialty);
    return c ? { id: c.id, name: c.name, specialty: c.specialty, initials: c.initials } : null;
  }

  /* ---------- mutations ---------- */
  function setBusy(el, busy, label) {
    if (!el) return;
    if (busy) { el.dataset.label = el.querySelector('span')?.textContent || ''; el.disabled = true; el.setAttribute('aria-busy', 'true'); if (el.querySelector('span')) el.querySelector('span').textContent = label || 'Saving…'; }
    else { el.disabled = false; el.removeAttribute('aria-busy'); if (el.querySelector('span') && el.dataset.label) el.querySelector('span').textContent = el.dataset.label; }
  }
  function showAlert(container, message, retryAction, retryData = {}) {
    const box = container.querySelector('[data-form-alert]') || container;
    box.innerHTML = `<div class="cf-inline-error" data-cf-state="error">${I('warning', 20)}<div><strong>Not saved</strong><p>${esc(message)}</p></div>${button('Try again', retryAction, retryData, 'secondary', 'refresh')}</div>`;
    box.querySelector('button')?.focus();
  }
  /** Run fn through the simulated server; on success save + navigate, on failure keep data and show a retry. */
  function commit(trigger, fn, { done, to, params, alertIn, retry, retryData, busyLabel }) {
    setBusy(trigger, true, busyLabel);
    return Store.request(() => fn(st())).then((result) => {
      if (result && result.ok === false) { setBusy(trigger, false); if (alertIn) showAlert(alertIn, result.message, retry, retryData); return; }
      const app = App();
      if (done) app.ui.notice = done;
      app.save();
      if (to) app.go(to, params || {});
      else app.render();
    }).catch((err) => {
      setBusy(trigger, false);
      const msg = err?.code === 'SIMULATED' ? err.message : 'Something unexpected went wrong. Your data has not changed.';
      if (alertIn) showAlert(alertIn, msg, retry, retryData);
      else App().dialog('Couldn’t complete', msg, button('Close', 'close-dialog', {}, 'primary'));
    });
  }
  function clearDraft(name) { delete App().ui.forms[name]; }

  function submit(name, form) {
    if (!form.hasAttribute('data-product-form')) return false;
    if (!validate(form)) return true;
    const data = new FormData(form), get = (k) => String(data.get(k) ?? '').trim();
    const cta = form.querySelector('[type=submit]');
    const opts = (extra) => ({ alertIn: form, retry: 'p-resubmit', retryData: { 'data-form': name }, ...extra });
    const finish = (fn, extra) => commit(cta, (s) => { const r = fn(s); clearDraft(name); return r; }, opts(extra));
    switch (name) {
      case 'profile-edit':
        finish((s) => { Object.assign(account(s), { name: get('name'), dob: get('dob'), phone: get('phone').replace(/\s/g, ''), email: get('email'), address: get('address'), allergies: get('allergies'), medicalHistory: get('medicalHistory') }); }, { done: 'Personal details saved.', to: 'K2' });
        return true;
      case 'family-edit': {
        const id = get('personId');
        finish((s) => {
          const fields = { name: get('name'), dob: get('dob'), relation: get('relation'), phone: get('phone').replace(/\s/g, '') };
          if (id) { const p = s.profiles.find((x) => x.id === id); if (!p) return { ok: false, message: 'This profile no longer exists.' }; Object.assign(p, fields); return; }
          const n = Math.max(0, ...s.profiles.map((p) => Number(p.id.replace(/\D/g, '')) || 0)) + 1;
          const p = { id: 'p' + n, ...fields, email: '', address: '', allergies: '', medicalHistory: '', canBook: true, canViewResults: false };
          s.profiles.push(p);
          App().ui.params = { personId: p.id };
        }, { done: id ? 'Family member saved.' : 'Family member added.', to: 'K9', params: id ? { personId: id } : undefined });
        return true;
      }
      case 'insurance':
        finish((s) => { const p = account(s); s.insurance ??= {}; s.insurance[p.id] = { type: get('type'), number: get('number').toUpperCase(), holder: get('holder'), facility: get('facility'), validFrom: get('validFrom'), validTo: get('validTo'), updatedAt: new Date().toISOString() }; }, { done: 'Insurance details saved.', to: 'K11' });
        return true;
      case 'refill': {
        const rxId = param('rxId');
        finish((s) => {
          const r = rxFor(s).find((x) => x.id === rxId);
          if (!r || rxEnded(r) || r.refill?.status === 'requested') return { ok: false, message: 'This prescription no longer accepts refill requests.' };
          const at = new Date().toISOString();
          r.refill = { status: 'requested', at, supply: get('supply'), pickup: get('pickup'), note: get('refillNote') };
          (r.refillHistory ??= []).push({ status: 'requested', at });
          r.refillsUsed = (r.refillsUsed || 0) + 1;
          const c = s.clinic;
          if (c) c.tasks.unshift({ id: 'TK-' + (++c.sequence.task), title: 'Review refill request ' + r.id, patientId: r.patientId, visitId: r.visitId, rxId: r.id, due: M.localDate(1), priority: get('supply') === 'out' ? 'high' : 'normal', assignee: 'Doctor', note: get('refillNote'), status: 'open', createdAt: at, source: 'refill' });
        }, { done: 'Refill request sent. The clinic will review it and contact you.', to: 'M2', params: { rxId } });
        return true;
      }
      case 'ticket-new':
        finish((s) => {
          const id = nextTicketId(s), at = new Date().toISOString();
          s.tickets.unshift({ id, topic: get('topic'), subject: get('subject'), status: 'open', visitId: get('visitId') || null, createdAt: at, closeReason: '', thread: [{ from: 'patient', author: '', text: get('body'), at }] });
          App().ui.params = { ticketId: id };
        }, { done: 'Ticket sent. The clinic will reply here.', to: 'T2' });
        return true;
      case 'ticket-reply': {
        const id = get('ticketId');
        finish((s) => { const t = ticket(s, id); if (!t || t.status === 'closed') return { ok: false, message: 'This ticket is closed. Reopen it to continue the conversation.' }; t.thread.push({ from: 'patient', author: '', text: get('reply'), at: new Date().toISOString() }); t.status = 'open'; }, { done: 'Reply sent.' });
        return true;
      }
    }
    return false;
  }

  /* ---------- actions ---------- */
  const ACTIONS = {
    'p-nav'(el) {
      if (document.getElementById('dialog').open) document.getElementById('dialog').close();
      const params = {};
      for (const [k, v] of Object.entries(el.dataset)) if (k.startsWith('p') && k !== 'purpose' && k.length > 1 && k[1] === k[1].toUpperCase()) { const key = k[1].toLowerCase() + k.slice(2); params[key] = v; }
      if (params.visitId) App().state.activeVisitId = params.visitId;
      App().go(el.dataset.to, params);
    },
    'p-filter'(el) { App().ui[el.dataset.key] = el.dataset.value; App().save(); App().render(); },
    'p-retry-load'() { startLoad(); App().render(); },
    'p-resubmit'(el) { document.querySelector(`form[data-form="${CSS.escape(el.dataset.form)}"]`)?.requestSubmit(); },
    'p-form-cancel'(el) { clearDraft(el.dataset.form); ACTIONS['p-nav'](el); },
    'rx-cancel-refill'(el) {
      App().dialog('Cancel refill request?', 'The clinic will no longer review this request. You can send it again later.', button('Keep request', 'close-dialog', {}, 'secondary') + button('Cancel request', 'rx-cancel-refill-confirm', { 'data-id': el.dataset.id }, 'danger'));
    },
    'rx-cancel-refill-confirm'(el) {
      const dialogActions = document.getElementById('dialog-actions');
      commit(el, (s) => {
        const r = (s.prescriptions || []).find((x) => x.id === el.dataset.id);
        if (!r?.refill || r.refill.status !== 'requested') return { ok: false, message: 'This request is no longer pending.' };
        const at = new Date().toISOString();
        (r.refillHistory ??= []).push({ status: 'cancelled', at });
        r.refillsUsed = Math.max(0, (r.refillsUsed || 1) - 1);
        r.refill = null;
        const task = s.clinic?.tasks.find((t) => t.rxId === r.id && t.status === 'open'); if (task) { task.status = 'done'; task.note = (task.note ? task.note + '. ' : '') + 'Patient cancelled the request.'; }
        document.getElementById('dialog').close();
      }, { done: 'Refill request cancelled.', alertIn: dialogActions, retry: 'rx-cancel-refill-confirm', retryData: { 'data-id': el.dataset.id }, busyLabel: 'Cancelling…' });
    },
    'family-delete'(el) {
      const s = st(), p = s.profiles.find((x) => x.id === el.dataset.id);
      if (!p) return;
      const visits = s.visits.filter((v) => v.patientId === p.id);
      if (visits.length) return App().dialog('This profile can’t be deleted yet', `${p.name} has ${visits.length} ${visits.length === 1 ? 'appointment or visit' : 'appointments or visits'}. Profiles with a visit history must be kept by the clinic. You can edit the details or send a support ticket.`, button('Close', 'close-dialog', {}, 'primary'));
      App().dialog('Delete profile for ' + p.name + '?', 'The profile will be removed from your account in this demo session.', button('Keep profile', 'close-dialog', {}, 'secondary') + button('Delete profile', 'family-delete-confirm', { 'data-id': p.id }, 'danger'));
    },
    'family-delete-confirm'(el) {
      commit(el, (s) => {
        const i = s.profiles.findIndex((x) => x.id === el.dataset.id && x.relation !== 'self');
        if (i < 0) return { ok: false, message: 'This profile no longer exists.' };
        if (s.visits.some((v) => v.patientId === el.dataset.id)) return { ok: false, message: 'This profile has appointments, so it can’t be deleted yet.' };
        s.profiles.splice(i, 1);
        if (s.activePatientId === el.dataset.id) s.activePatientId = s.accountProfileId;
        document.getElementById('dialog').close();
      }, { done: 'Family member deleted.', to: 'K7', alertIn: document.getElementById('dialog-actions'), retry: 'family-delete-confirm', retryData: { 'data-id': el.dataset.id }, busyLabel: 'Deleting…' });
    },
    'insurance-remove'() {
      App().dialog('Remove insurance details?', 'You can add them again at any time. The clinic will ask for your card details at your visit.', button('Keep details', 'close-dialog', {}, 'secondary') + button('Remove', 'insurance-remove-confirm', {}, 'danger'));
    },
    'insurance-remove-confirm'(el) {
      commit(el, (s) => { delete s.insurance[account(s).id]; document.getElementById('dialog').close(); }, { done: 'Insurance details removed.', to: 'K11', alertIn: document.getElementById('dialog-actions'), retry: 'insurance-remove-confirm', busyLabel: 'Deleting…' });
    },
    'ticket-close'(el) {
      App().dialog('Close this ticket?', '', button('Keep open', 'close-dialog', {}, 'secondary') + button('Close ticket', 'ticket-close-confirm', { 'data-id': el.dataset.id }, 'danger'));
      document.getElementById('dialog-body').innerHTML = `<p>You won’t receive more replies on this ticket until you reopen it.</p><div class="field"><label for="close-reason">Reason (optional)</label><select id="close-reason"><option value="">No reason given</option><option>My issue has been resolved</option><option>I contacted the clinic another way</option><option>I sent this by mistake</option></select></div>`;
    },
    'ticket-close-confirm'(el) {
      const reason = document.getElementById('close-reason')?.value || '';
      commit(el, (s) => { const t = ticket(s, el.dataset.id); if (!t) return { ok: false, message: 'This ticket no longer exists.' }; t.status = 'closed'; t.closeReason = reason; t.closedAt = new Date().toISOString(); document.getElementById('dialog').close(); }, { done: 'Ticket closed.', alertIn: document.getElementById('dialog-actions'), retry: 'ticket-close-confirm', retryData: { 'data-id': el.dataset.id }, busyLabel: 'Closing…' });
    },
    'ticket-reopen'(el) {
      commit(el, (s) => { const t = ticket(s, el.dataset.id); if (!t) return { ok: false, message: 'This ticket no longer exists.' }; t.status = 'open'; t.closeReason = ''; }, { done: 'Ticket reopened.', busyLabel: 'Reopening…' });
    },
    'notification-read'(el) {
      const n = st().notifications.find((x) => x.id === el.dataset.id);
      if (n) { n.read = true; App().save(); App().render(); }
    },
    'reset-demo'() {
      App().dialog('Reset demo data?', 'All changes in this session (appointments, profiles, tickets, clinic notes) will be cleared and the original data reloaded.', button('Keep data', 'close-dialog', {}, 'secondary') + button('Reset', 'reset-demo-confirm', {}, 'danger'));
    },
    'reset-demo-confirm'() {
      const fresh = Store.reset({ keepAuth: true });
      location.replace(location.pathname + '#' + (fresh.authenticated ? '/home' : '/login'));
      location.reload();
    },
    'demo-fail-toggle'(el) {
      Store.failNext.set(!Store.failNext.get());
      syncFailToggle();
      App().demo(Store.failNext.get() ? 'The next save or load will hit a simulated connection error.' : 'Simulated error turned off.');
    },
  };
  function syncFailToggle() {
    const on = Store.failNext.get();
    document.querySelectorAll('[data-action="demo-fail-toggle"]').forEach((b) => { b.setAttribute('aria-pressed', String(on)); b.querySelector('span') && (b.querySelector('span').textContent = on ? 'Simulated error: on' : 'Simulate connection error'); });
  }

  /* ---------- live behaviour ---------- */
  document.addEventListener('focusout', (e) => {
    const el = e.target, form = el.closest?.('form[data-product-form]');
    if (!form || !el.name || el.type === 'hidden') return;
    if (el.value || el.getAttribute('aria-invalid')) validate(form, el.name);
  });
  document.addEventListener('input', (e) => {
    const el = e.target, form = el.closest?.('form[data-product-form]');
    if (form && el.name && el.getAttribute('aria-invalid')) validate(form, el.name);
    if (form?.dataset.form === 'insurance' && el.name === 'type') {
      const label = form.querySelector('label[for="number"] span');
      if (label) label.textContent = el.value === 'bhyt' ? 'Health insurance card number' : 'Policy / card number';
      const hint = form.querySelector('#number-hint');
      if (hint) hint.textContent = el.value === 'bhyt' ? '15 characters: 2 letters and 13 digits.' : '6–20 letters or digits.';
    }
    if (el.id === 'specialty') {
      const s = st(), list = (s.clinicians || Seed.DATA.clinicians).filter((c) => c.specialty === el.value);
      const doctor = document.getElementById('clinicianId');
      if (doctor) {
        doctor.innerHTML = [['any', 'Any available doctor'], ...list.map((c) => [c.id, c.name])].map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
        doctor.value = 'any';
        doctor.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });

  root.CareFlowProduct = { SCREENS, has, tabFor, render, gateView, ACTIONS, submit, clinicianPicker, chosenClinician, relationLabel, RELATIONS, syncFailToggle, rxFor };
})(window);
