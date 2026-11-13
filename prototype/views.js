/* Shared render components and 47 composed screens; events belong to app.js. */
(function (root) {
  'use strict';
  const R = root.CareFlowRich,
    M = root.CareFlowModel,
    VI = root.CareFlowCopy,
    UI = root.CareFlowUI,
    C = VI.common,
    I = (name, size = 22) => root.CareFlowIcon(name, size).replace('<svg ', '<svg aria-hidden="true" ');
  const esc = (x) =>
    String(x ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  const attrs = (o) =>
    Object.entries(o || {})
      .map(([k, v]) => ` ${k}="${esc(v)}"`)
      .join('');
  const btn = (
    label,
    action = 'go',
    data = {},
    variant = 'secondary',
    disabled = false,
  ) =>
    `<button type="button" class="btn ${variant}" ${UI.buttonAttrs(variant)} data-action="${action}"${attrs(data)}${disabled ? ' disabled' : ''}>${['device', 'clinic-call', 'callback', 'rebook', 'arrive', 'directions'].includes(action) ? I(({device:'video','clinic-call':'phone',callback:'phone',rebook:'calendar',arrive:'map-pin',directions:'map-pin'})[action],20) : ''}${variant.includes('change-visit') ? I('refresh',20) : variant.includes('cancel-visit') ? I('cross',20) : variant.includes('add-relative-inline') ? I('plus',20) : ''}<span>${esc(label)}</span>${variant.includes('primary') && action === 'go' ? I('arrow-right',20) : ''}</button>`;
  const go = (label, to, variant = 'secondary', extra = {}) =>
    btn(label, 'go', { 'data-to': to, ...extra }, variant);
  const external = (label, href, variant = 'primary') => `<a class="btn ${variant}" ${UI.buttonAttrs(variant)} href="${esc(href)}"${href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''} data-action="external-support">${esc(label)}</a>`;
  const facilityCard = () => `<section class="facility-card" ${UI.cardAttrs('surface')}><span class="facility-icon">${I('document',28)}</span><div><h3>${esc(VI.facility.name)}</h3><p>${esc(VI.facility.address)}</p><span class="chip">${esc(VI.facility.entrance)}</span></div></section>`;
  const row = (title, hint, to, icon = 'chevron-right', extra = {}) => {
    const description = hint || VI.layout.rowHints[to];
    return `<button type="button" class="row" ${UI.cardAttrs('row')} data-action="go" data-to="${to}"${attrs(extra)}><span class="row-icon">${I(icon)}</span><span class="row-text"><strong>${esc(title)}</strong>${description ? `<small>${esc(description)}</small>` : ''}</span><span class="row-arrow">${I('chevron-right', 18)}</span></button>`;
  };
  const card = (content, cls = '') =>
    UI.card(content, cls);
  const note = (text, type = 'info') =>
    `<div class="note ${type}">${I(type === 'danger' ? 'warning' : 'info', 19)}<p>${esc(text)}</p></div>`;
  const empty = (title, lead, action = '') =>
    `<div class="empty" data-cf-card="surface" data-cf-state="empty">${UI.illustration('result')}<h2>${esc(title)}</h2>${lead ? `<p>${esc(lead)}</p>` : ''}${action}</div>`;
  const field = (id, label, value = '', type = 'text', extra = {}) =>
    `<div class="field"><label for="${id}">${I(type==='date'?'calendar':type==='tel'?'phone':'document',16)}<span>${esc(label)}</span></label><input id="${id}" name="${id}" type="${type}" value="${esc(value)}"${attrs(extra)}></div>`;
  const textarea = (id, label, value = '', extra = {}) =>
    `<div class="field"><label for="${id}">${I(id==='medicalHistory'?'heart-pulse':id==='message'?'message-circle':'document',16)}<span>${esc(label)}</span></label><textarea id="${id}" name="${id}" rows="4"${attrs(extra)}>${esc(value)}</textarea></div>`;
  const check = (id, label, checked = false) =>
    `<label class="check"><input id="${id}" name="${id}" type="checkbox"${checked ? ' checked' : ''}><span>${esc(label)}</span></label>`;
  const choices = (name, items, selected, inlineAction = '') => {
    const icons = { onsite: 'map-pin', online: 'video', normal: 'shield', warning: 'warning' };
    return `<fieldset class="choices"><legend class="sr-only">${esc(name)}</legend>${items.map(([v, label, hint, meta]) => `<label class="choice ${v === selected ? 'selected' : ''} ${name === C.patient ? 'patient-choice' : ''} ${name === C.mode ? 'cf-mode-choice' : ''}" ${UI.cardAttrs(name===C.mode?'media':'tonal')}><input type="radio" name="${name}" value="${esc(v)}"${v === selected ? ' checked' : ''}>${name===C.mode?`${UI.illustration(v==='online'?'support':'clinic')}`:icons[v] || name === C.patient ? `<span class="choice-visual" aria-hidden="true">${name === C.patient ? root.CareFlowAvatar(v,44) : I(icons[v],25)}</span>` : ''}<span class="choice-copy${name===C.mode?' cf-mode-caption':''}"><strong>${esc(label)}</strong>${hint ? `<small>${esc(hint)}</small>` : ''}${meta ? `<span class="choice-meta">${I('calendar',13)}${esc(meta)}</span>` : ''}</span></label>${v === selected ? inlineAction : ''}`).join('')}${items.some(([v]) => v === selected) ? '' : inlineAction}</fieldset>`;
  };
  const form = (name, html, cta = C.continue, variant = 'primary') =>
    `<form data-form="${name}" novalidate><div class="form-body">${html}</div><div class="form-actions"><p class="field-error" id="form-error" role="alert"></p><button class="btn ${variant}" ${UI.buttonAttrs(variant, 'lg')} type="submit"><span>${esc(cta)}</span>${I(name === 'booking' ? 'check-circle' : 'arrow-right',20)}</button></div></form>`;
  const head = (t, lead) =>
    `<div class="screen-intro"><h1 id="screen-title" tabindex="-1">${esc(t)}</h1><p>${esc(lead || '')}</p></div>`;
  const section = (title, html, cls = '', icon = 'document') =>
    `<section class="section ${cls}" ${UI.cardAttrs('section')}><h2 class="section-heading">${I(title === C.history ? 'clock' : icon,18)}<span>${esc(title)}</span></h2>${html}</section>`;
  const chip = (text, tone = 'info') =>
    `<span class="chip ${tone}" data-cf-component="status" data-cf-tone="${tone}">${I(tone==='success'?'check-circle':tone==='warning'?'clock':tone==='danger'?'warning':'info',16)}${esc(text)}</span>`;
  const status = (v) => UI.badge(v.status);
  const dateText = (v) => {
    if (!v?.date) return C.notProvided;
    const date = new Date(v.date + 'T12:00:00+07:00');
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(date);
  };
  const modeText = UI.modeText;
  const details = (s, v) =>
    `<dl class="details" data-cf-component="facts">${v.status?`<div><dt>${I('user',14)}Doctor</dt><dd>${esc(R.clinician(v).name)} · ${esc(R.clinician(v).specialty)}</dd></div>`:''}<div><dt>${I('user',14)}${esc(C.patient)}</dt><dd>${esc(M.profile(s, v.patientId)?.name)}</dd></div><div><dt>${I('calendar',14)}${esc(C.date)}</dt><dd>${esc(dateText(v))}</dd></div><div><dt>${I('clock',14)}${esc(C.time)}</dt><dd>${esc(v.slot)}</dd></div><div><dt>${I(v.mode === 'online' ? 'video' : 'map-pin',14)}${esc(C.mode)}</dt><dd>${esc(v.status === 'mode-review' || (!v.status && v.risk) ? 'Awaiting clinic confirmation' : modeText(v.mode))}</dd></div><div><dt>${I('document',14)}${esc(C.reason)}</dt><dd>${esc(v.reason)}</dd></div></dl>`;
  function visitCard(s, v, hero = false) {
    const date = new Date(v.date + 'T12:00:00+07:00');
    const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
    const month = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
    return `<button data-cf-component="appointment" data-cf-variant="card" class="visit-card ${hero ? 'hero' : ''}" type="button" data-action="open-visit" data-id="${esc(v.id)}"><span class="visit-card-top"><span class="visit-person">${root.CareFlowAvatar(v.patientId,36)}<span><small>${esc(C.patient)}</small><strong>${esc(M.profile(s, v.patientId)?.name)}</strong></span></span><span class="visit-mode" aria-label="${esc(modeText(v.mode))}">${I(v.mode === 'online' ? 'video' : 'map-pin', 22)}</span></span><span class="visit-schedule"><span class="visit-day" aria-hidden="true"><strong>${esc(day)}</strong><small>${esc(month.toUpperCase())}</small></span><span class="visit-schedule-copy"><strong class="visit-time">${esc(v.slot)}</strong><span class="visit-date">${esc(dateText(v))}</span><span class="visit-location">${esc(v.status === 'mode-review' ? 'Visit type under review' : modeText(v.mode))}</span></span></span><span class="visit-bottom">${status(v)}<span class="visit-open" aria-label="${esc(C.viewVisit)}">${I('arrow-right', 19)}</span></span></button>`;
  }
  function timeline(v) {
    return `<ol class="timeline">${v.history.map((h, i) => `<li class="${i === v.history.length - 1 ? 'current' : ''}"><span class="timeline-dot"></span><div><strong>${esc(VI.statuses[h.status]?.[0] || h.status)}</strong><small>${esc(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(h.at)))}</small></div></li>`).join('')}</ol>`;
  }
  function slotForm(s, name = 'slot', title = VI.screen.C7) {
    const d = s.draft || {};
    const selected = d.date || M.localDate(1);
    const days = Array.from({length: 5}, (_, i) => {
      const value = M.localDate(i);
      const date = new Date(value + 'T12:00:00+07:00');
      const weekday = new Intl.DateTimeFormat('en-GB', {weekday: 'short', timeZone: 'Asia/Ho_Chi_Minh'}).format(date);
      return `<button type="button" class="date-option" data-action="quick-date" data-date="${value}" aria-label="${esc(dateText({date: value}))}" aria-pressed="${value === selected}"><span>${esc(weekday)}</span><strong>${date.getDate()}</strong></button>`;
    }).join('');
    return form(
      name,
      (name === 'slot' && s.draft && root.CareFlowProduct ? root.CareFlowProduct.clinicianPicker(s, root.CareFlowApp?.ui || {}) : '') +
      `<div class="cf-schedule-date"><div class="cf-schedule-heading"><h2>Preferred visit date</h2><span data-date-month></span></div><div class="date-strip" role="group" aria-label="${esc(VI.layout.quickDates)}">${days}</div><div class="cf-date-other">` + field('date', 'Choose another date', selected, 'date', {
        min: M.localDate(),
        required: 'required',
      }) + `</div></div><fieldset class="slot-field"><legend>${esc(C.time)}</legend>${[['Morning',['08:00','09:00','10:30']],['Afternoon',['14:00','15:30']]].map(([label,times])=>`<div class="cf-slot-group"><p>${label}</p><div class="slots">${times.map(t=>`<label class="slot"><input name="slot" type="radio" value="${t}"${d.slot===t?' checked':''}><span>${t}</span></label>`).join('')}</div></div>`).join('')}<p class="cf-schedule-hint">The clinic will confirm the time after receiving your request.</p></fieldset>`,
      title.next || C.continue,
    );
  }
  function context(s, v) {
    const p = M.profile(s, v?.patientId || s.draft?.patientId);
    return p
      ? `<div class="context">${I('user', 16)}<span>${esc(p.name)}</span>${v ? `<small>${esc(v.id)}</small>` : `<button type="button" class="context-edit" data-action="go" data-to="C1" aria-label="${esc(VI.layout.changePatient)}">${I('user',16)}<span>Change</span></button>`}</div>`
      : '';
  }
  function careProgress(v) {
    const task = v.care.tasks?.at(-1);
    if (!task) return '';
    const labels = { received: ['Your update has been received','A coordinator will check it and pass it to the doctor.'], coordinating: ['Coordinator is handling it','Your information is being compiled for the doctor.'], 'doctor-review': ['Doctor is reviewing','The clinic will reply when the doctor has further advice.'], answered: ['The clinic has replied','You can read the reply in messages and ask more if needed.'] };
    return card(`${chip(labels[task.status][0])}<p class="eyebrow">Handled by</p><h2>${esc(task.owner)}</h2><p>${esc(labels[task.status][1])}</p>`, 'care-progress');
  }
  function bookingProgress(id) {
    const step = {C1: 0, C2: 1, C3: 1, C4: 1, C5: 2, C6: 2, C7: 3, C8: 3}[id];
    if (step === undefined) return '';
    return `<div class="booking-progress"><div class="booking-progress-title"><span>${esc(VI.layout.bookingTitle)}</span><span>${esc(VI.layout.step)} ${step + 1} / 4</span></div>${UI.stepper(step)}</div>`;
  }
  // Auth visuals are shared; each screen retains its real form and validation.
  function authVisual(id,s,u) {
    const step=id==='A1'?(u.otpSent?2:1):3;
    const name=u.forms[id==='A2'?'match':'profile']?.name||(id==='A2'?M.accountProfile(s)?.name:'');
    return `<div class="cf-hdr-auth"><div class="cf-hdr-auth-nav"><span data-header-back></span><h2>${step===1?'Sign in':step===2?'Verify':id==='A2'?'Confirm profile':'Create profile'}</h2><span>Step ${step}/3</span></div><ol class="cf-hdr-auth-progress" aria-label="Account setup progress">${['Phone number','Verify','Profile'].map((label,i)=>`<li${i+1===step?' aria-current="step"':''} data-complete="${i+1<step}"><span>${i+1<step?I('check',16):i+1}</span><small>${label}</small></li>`).join('')}</ol>${step===3?`<div class="cf-hdr-auth-preview"><span aria-hidden="true">${root.CareFlowAvatar(M.accountProfile(s)?.id||'account',40)}</span><div><small>${id==='A2'?'Profile found':'New profile'}</small><strong data-identity-preview>${esc(name||'Your full name')}</strong></div>${I('document-check',24)}</div>`:`<div class="cf-hdr-auth-prompt">${I(step===1?'phone':'shield',28)}<p>${step===1?'Start with your phone number.':'Verify to continue with your profile.'}</p></div>`}</div>`;
  }
  const authPanel = (title, lead, controls, variant = '') =>
    `<section class="auth-panel ${esc(variant)}" ${UI.cardAttrs('surface')} aria-labelledby="screen-title">${head(title, lead)}<div class="auth-panel-content">${controls}</div></section>`;
  function render(id, s, u) {
    const P = root.CareFlowProduct;
    const loading = P?.gateView(id, s);
    if (loading) return loading;
    const T = VI.screen[id],
      v = M.visit(s),
      d = s.draft,
      p = M.accountProfile(s),
      l = v?.labs.find((x) => x.id === u.labId) || v?.labs[0];
    let body = '';
    const richH = { M, VI, C, I, esc, btn, go, row, card, note, empty, field, textarea, form, check, choices, chip, status, dateText, modeText, details, timeline, facilityCard };
    let intro = head(T?.heading || '', T?.lead || '');
    const nav = (label, to, variant = 'secondary', extra = {}) =>
      go(label, to, variant, extra);
    switch (id) {
      case 'A1':
        intro = authVisual(id,s,u);
        body = authPanel(
          u.otpSent ? 'Confirm your phone number' : T.heading,
          u.otpSent
            ? 'Enter the verification code to continue with your profile.'
            : T.lead,
          form(
            u.otpSent ? 'verify' : 'otp',
            field('phone', T.phone, u.phone || '', 'tel', {
              inputmode: 'tel',
              autocomplete: 'tel',
              required: 'required',
            }) +
              (u.otpSent
                ? field('otp', T.otp, '', 'text', {
                    inputmode: 'numeric',
                    autocomplete: 'one-time-code',
                    maxlength: '6',
                    required: 'required',
                  }) + check('consent', T.consent)
                : ''),
            u.otpSent ? T.verify : T.getCode,
          ) +
            (u.otpSent ? btn(T.resend, 'resend', {}, 'text') : '') +
            (!u.otpSent && s.seeded && M.accountProfile(s) ? btn('Continue as ' + M.accountProfile(s).name.split(/\s+/).slice(-2).join(' '), 'continue-as', {}, 'secondary') : '') +
            nav(C.support, 'K5', 'text'),
          u.otpSent ? 'auth-otp' : 'auth-start',
        );
        break;
      case 'A2':
        intro = authVisual(id,s,u);
        body = authPanel(
          T.heading, T.lead,
          form(
            'match',
            field('name', T.name, p?.name || '', 'text', {
              autocomplete: 'name',
            }) +
              field('dob', T.dob, p?.dob || '', 'date', { max: M.localDate() }) +
              field('contactPhone', C.contactPhone, p?.phone || '', 'tel') +
              textarea('medicalHistory', C.medicalHistory, p?.medicalHistory || ''),
            T.confirm,
          ) + btn(T.different, 'different-profile', {}, 'text'),
          'auth-profile',
        );
        break;
      case 'A3':
        intro = authVisual(id,s,u);
        body = authPanel(
          T.heading, T.lead,
          form(
            'profile',
            field('name', T.name, '', 'text', { autocomplete: 'name' }) +
              field('dob', T.dob, '', 'date', {
                max: M.localDate(),
                required: 'required',
              }) +
              field('contactPhone', C.contactPhone, '', 'tel') +
              textarea('medicalHistory', C.medicalHistory),
            T.submit,
          ),
          'auth-profile',
        );
        break;
      case 'B1': {
        intro = R.homeHeader(s, p);
        body = R.home(s, v, richH, u);
        break;
      }
      case 'C1':
        intro = head('Who is the visit for?', 'Choose an existing profile or add someone new.');
        body = R.patient(s, d, richH);
        break;
      case 'C2':
        body =
          form(
            'reason',
            textarea('reason', T.label, d?.reason || '', {
              maxlength: '1200',
              required: 'required',
            }) + `<div class="symptom-chips" role="group" aria-label="Common symptoms">${['Headache','Fever','Cough','Stomach ache','Tiredness','Trouble sleeping'].map(x => `<button type="button" class="symptom-chip" data-symptom="${esc(x)}">${esc(x)}</button>`).join('')}</div><fieldset class="severity-set"><legend>How unwell do you feel?</legend><div class="severity-grid">${[['mild','Mild'],['moderate','Moderate'],['high','Severe']].map(([value,label])=>`<label><input type="radio" name="severity" value="${value}"${d?.severity===value?' checked':''}><span>${label}</span></label>`).join('')}</div><small>Self-assessment only; it does not replace the warning-sign check.</small></fieldset><p class="hint">${esc(T.hint)}</p>` + textarea('medicalHistory', C.medicalHistory, d?.medicalHistory || '') + `<p class="hint">${esc(C.historyHint)}</p>`,
          ) + (T.note ? note(T.note) : '');
        break;
      case 'C3':
        body =
          form(
            'safety',
            choices(
              T.heading,
              [
                ['normal', T.normal],
                ['warning', T.warning],
              ],
              d?.safety,
            ) + `<div data-safety-guidance role="alert"${d?.safety==='warning'?'':' hidden'}>${UI.emergencyCard()}</div>`,
          ) + (T.note ? note(T.note) : '');
        break;
      case 'C4':
        body =
          note(T.note, 'danger') +
          btn(T.call, 'emergency', {}, 'danger') +
          btn(T.directions, 'directions') +
          (u.urgentAftercare
            ? nav(VI.screen.I5.heading, 'I5')
            : btn(T.continue, 'safety-continue')) +
          btn(T.exit, 'stop-booking', {}, 'text');
        break;
      case 'C5':
        body =
          note(T.note, 'warning') +
          form('mode-review', check('ack', T.ack), T.cta);
        break;
      case 'C6':
        body =
          form(
            'mode',
            choices(
              C.mode,
              [
                ['onsite', 'In person at the clinic', T.onsite],
                ['online', 'Online visit', T.online],
              ],
              d?.mode,
            ),
          ) + note(T.note);
        break;
      case 'C7':
        body = (d?.free ? note(T.free) : '') + slotForm(s);
        break;
      case 'C8':
        body =
          card(d ? details(s, d) : '') +
          nav(T.edit, 'C2', 'text') +
          form('booking', check('consent', T.consent), T.send) +
          (s.request?.status === 'unknown'
            ? btn(T.verify, 'resolve-unknown', {}, 'primary')
            : '');
        break;
      case 'C9':
        body = v
          ? `<div class="request-received">${I('document-check', 30)}<div><strong>${esc(VI.layout.requestSent)}</strong><p>${esc(VI.layout.requestPending)}</p></div></div>` + card(`<div class="ticket-head"><span class="eyebrow">Visit code</span><strong>${esc(v.id)}</strong>${status(v)}</div>` + details(s, v), 'ticket') + nav(C.viewVisit, 'D2', 'primary')
          : '';
        break;
      case 'D1': {
        intro = head(T.heading,'') + R.appointmentCalendar(s,u,richH);
        body = R.appointments(s, u, richH);
        break;
      }
      case 'D2': {
        const next = M.nextAction(v);
        const management = (M.TRANSITIONS[v.status] || []).includes('cancelled')
          ? `<div class="appointment-tools" role="group" aria-label="Change appointment">${nav(T.change, 'D3', 'secondary change-visit')}${nav(T.cancel, 'D4', 'secondary cancel-visit')}</div>` : '';
        body =
          card(
            `${status(v)}<span class="eyebrow">${esc(C.owner)}</span><h2>${esc(VI.statuses[v.status][1])}</h2>${v.reviewReason ? `<p>${esc(v.reviewReason)}</p>` : ''}${nav(VI.actions[next[1]], next[0], 'primary', { 'data-purpose': ['cancelled', 'no-show'].includes(v.status) ? 'rebook' : '' })}`,
            'next-step',
          ) + management +
          card(
            `<div class="ticket-head"><span class="eyebrow">${esc(T.code)}</span><strong>${esc(v.id)}</strong>${status(v)}</div>${details(s, v)}<div class="ticket-code"><div id="visit-qr" data-payload="CAREFLOW-DEMO:${esc(v.id)}" aria-label="${esc(T.qr)}" role="img"></div><p>${esc(T.qrHint)}</p></div>`,
            'ticket',
          );
        body += v.mode === 'onsite'
          ? facilityCard()
          : `<section class="online-appointment-status" aria-label="Prepare for online visit"><strong>Time until your appointment</strong><time data-appointment-countdown="${esc(v.date + 'T' + v.slot + ':00+07:00')}" aria-live="off">Calculating time</time><p>The clinic will guide you into the online consultation when it’s time.</p></section>`;
        body += note(v.feePlan === 'not-required' ? C.feeFree : v.feePlan === 'package' ? C.feePackage : C.feePending);
        if (v.lockedAt) body += note(C.signed);
        if (v.communication.callback === 'pending') body += note(C.callback);
        if (v.status === 'no-show') body += note(T.noShow, 'warning');
        if (v.cancelReason)
          body += note(T.cancelReason + ': ' + v.cancelReason);
        if (v.previousId)
          body += btn(
            T.previous + ' · ' + v.previousId,
            'open-visit',
            { 'data-id': v.previousId },
            'text',
          );
        if (v.rescheduledTo)
          body += btn(
            T.replacement + ' · ' + v.rescheduledTo,
            'open-visit',
            { 'data-id': v.rescheduledTo },
            'text',
          );
        body += section(
          T.details,
          `<div class="list">${row(T.labs, v.labs.length ? VI.labs[v.labs[0].status] : VI.screen.F1.empty, 'F1', 'document')}${row(T.pay, VI.payments[v.payment.status], 'H2', 'document')}${row(T.summary, C.noClinical, 'H6', 'pill')}${row(T.results, v.communication.result === 'notified' ? VI.screen.H7.notified : VI.screen.H7.pending, 'H7', 'document')}${row(T.care, '', 'I1', 'heart-pulse')}</div>`,
        );
        body += section(C.history, timeline(v));
        body += R.visitExtras(s, v, richH);
        break;
      }
      case 'D3':
        body =
          card(details(s, v)) +
          btn(T.cta, 'rebook', { 'data-purpose': 'reschedule' }, 'primary');
        break;
      case 'D4':
        body =
          form(
            'cancel',
            choices(
              T.reason,
              [
                ['busy', T.option1],
                ['other-date', T.option2],
                ['other', T.option3],
              ],
              'busy',
            ) +
              textarea('cancelNote', T.reason) +
              note(T.note),
            T.cta,
          ) + nav(T.keep, 'D2', 'text');
        break;
      case 'E1':
        body =
          `<figure class="cf-context-illustration">${UI.illustration('clinic')}<figcaption>Check the details before your visit</figcaption></figure>` + card(
            `<dl class="details" data-cf-component="facts">${[
              [T.time, v.slot + ' · ' + dateText(v)],
              [T.arrival, 'No specific arrival time instructions yet'],
              [T.papers, 'ID and any medical documents you have'],
              [T.address, 'The clinic hasn’t shared the location for this visit yet'],
              [C.fee, C.unknownFee],
            ]
              .map(
                ([k, val]) =>
                  `<div><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`,
              )
              .join('')}</dl>`,
          ) +
          note(T.note) +
          nav(T.cta, 'D2', 'primary') + nav('Ask about your visit','K5');
        break;
      case 'E2':
        body =
          `<section class="checkin-qr-panel" ${UI.cardAttrs('surface')} aria-label="Check-in code"><div id="visit-qr" data-payload="CAREFLOW-DEMO:${esc(v.id)}" role="img" aria-label="QR code identifying your appointment"></div><strong>${esc(v.id)}</strong><p>Show this code at reception to help with check-in. Reception confirms your check-in.</p></section>` +
          card(details(s, v)) +
          note(T.note) +
          btn(T.cta, 'arrive', {}, 'primary');
        break;
      case 'E3':
        body =
          card(
            `${UI.illustration('result')}<div class="cf-photo-panel-content"><div class="queue-orbit">${I('clock', 32)}</div><h2>${esc(VI.statuses[v.status][0])}</h2><p>${esc(VI.statuses[v.status][1])}</p></div>`,
            'center cf-waiting-card cf-photo-panel','media',
          ) +
          section(T.queue, `<p>${esc(T.queueNote)}</p>`) +
          note(T.note) +
          section(C.history, timeline(v)) +
          nav(C.viewVisit, 'D2');
        break;
      case 'F1':
        intro = head(T.heading,'');
        body = v.labs.length ? R.collection('labs',u,v.labs.map(x=>({category:['available','awaiting-review','reviewed'].includes(x.status)?'results':'prepare',search:x.name+' '+VI.labs[x.status],html:`<article class="cf-lab-card cf-stack" ${UI.cardAttrs('surface')}>${UI.illustration('result')}<div class="cf-lab-content cf-photo-panel-content"><span class="cf-card-kicker">${esc(x.timing==='pre'?'Before the visit':'During the visit')}</span><h2>${esc(x.name)}</h2>${chip(VI.labs[x.status],x.status==='reviewed'?'success':'info')}<div class="cf-card-actions"><button type="button" class="cf-photo-arrow-action" ${UI.buttonAttrs('inverse')} data-action="go" data-to="F2" data-lab="${esc(x.id)}" aria-label="${x.status==='ordered'?'View order':x.status==='scheduled'?'View schedule':'View results'}"><span class="sr-only">${x.status==='ordered'?'View order':x.status==='scheduled'?'View schedule':'View results'}</span>${I('arrow-right',20)}</button>${['ordered','scheduled'].includes(x.status)?go('Upload results file','F4','inverse',{'data-lab':x.id}):''}</div></div></article>`})),{label:'orders',search:'Search orders',compactSearch:true,placeholder:'Test or imaging name…',filters:[['all','All'],['prepare','To do'],['results','Results ready']]}) + `<div class="cf-photo-grid cf-lab-utilities">${R.photoCard({title:'Instructions',layout:'topic',description:'View order information',to:'F2',labId:v.labs[0].id,icon:'document'})}${R.photoCard({title:'Need help?',layout:'network',description:'Ask the clinic',to:'K5',icon:'headphones'})}</div>` : empty(T.empty,T.emptyLead);
        break;
      case 'F2':
        intro = head(l.name,'Instructions and documents for this order.');
        body =
          card(
            `<h2 class="card-heading">${I('flask',24)}<span>Order status</span></h2>${chip(VI.labs[l.status])}<p>${esc(l.timing === 'pre' ? VI.statuses['pre-lab'][0] : VI.screen.H1.labs)}</p>`,
          ) +
          (l.note ? card(`<h2 class="card-heading">${I('document-check',24)}<span>Doctor’s comments</span></h2><p>${esc(l.note)}</p>`) : '') +
          (l.appointmentDate ? card(`<h2>Your chosen time</h2><dl class="details cf-lab-schedule"><div><dt>Date</dt><dd>${esc(dateText({date:l.appointmentDate}))}</dd></div><div><dt>Preferred time</dt><dd>${esc(l.appointmentTime||'To be arranged')}</dd></div></dl>${l.coordinator?'<p>A nurse has been asked to contact you to arrange it.</p>':''}`) : '') +
          section(T.prepare, `<p>${esc(C.noClinical)}</p>`) +
          (l.timing === 'pre' && !l.continuation ? form(
            'lab-path',
            choices(
              T.path,
              [
                ['visit', T.return],
                ['during', T.during],
              ],
              l.returnPath,
            ),
            C.save, 'secondary',
          ) : '');
        if (l.status === 'ordered') body += nav(T.book, 'F3', 'primary');
        if (['ordered', 'scheduled'].includes(l.status))
          body += nav(T.upload, 'F4');
        if (l.file)
          body += card(
            `<div class="cf-file-summary"><h2 class="card-heading">${I('document-check',24)}<span>${esc(l.file.name)}</span></h2><p>${esc(l.file.type==='application/pdf'?'PDF':'Result image')} · ${Math.max(1,Math.round(l.file.size/1024))} KB</p><small>${esc(VI.labs[l.status])}</small></div>`,
          );
        if (['available','awaiting-review','reviewed'].includes(l.status) && l.timing === 'pre') {
          if (l.continuation === 'review-during') body += note('The clinic has received the results. The doctor will go through them with you during the visit.') + nav('Track check-in', 'E3', 'primary');
          else if (l.continuation === 'return-to-visit') body += note('The clinic has received the results. Please return to your appointment details to continue this visit.') + nav('Continue current visit', 'D2', 'primary');
          else body += note('Results are awaiting a nurse’s check. The clinic will confirm how your visit continues.');
        }
        body += nav(C.returnVisit, 'D2');
        break;
      case 'F3':
        body = form(
          'lab-book',
          field('labDate', T.date, M.localDate(1), 'date', {
            min: M.localDate(),
          }) +
            field('labTime', T.time, '09:00', 'time') +
            check('coordinator', T.coordinator),
          T.cta,
        );
        break;
      case 'F4':
        body = form(
          'lab-upload',
          `<div class="field"><label for="file">${esc(T.file)}</label><input id="file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" aria-describedby="file-hint"><small id="file-hint">${esc(T.hint)}</small></div>`,
          T.cta,
        );
        break;
      case 'G1':
        body =
          `<figure class="cf-context-illustration">${UI.illustration('support')}<figcaption>Get your device and a private space ready</figcaption></figure>` +
          `<div class="online-prepare-list" aria-label="Prepare for online visit"><div>1 <span>Check camera and microphone</span></div><div>2 <span>Check your internet connection</span></div><div>3 <span>Wait for the clinic to open the online room</span></div></div>` +
          card(
            `<div class="video-preview">${I('video', 44)}<strong>${esc(u.deviceReady ? T.ready : T.waiting)}</strong></div>`,
          ) +
          note(T.note) +
          btn(T.check, 'device') +
          (v.status === 'confirmed' ? note(T.notYet) : '') +
          btn(T.cta, 'join', {}, 'primary', !u.deviceReady || !['reminder','online-wait'].includes(v.status));
        break;
      case 'G2':
        body =
          card(
            `${UI.illustration('result')}<div class="cf-photo-panel-content"><div class="waiting-orbit">${I('video', 32)}</div><h2>${esc(T.heading)}</h2><p>${esc(T.note)}</p></div>`,
            'center cf-waiting-card cf-photo-panel','media',
          ) +
          nav(C.support, 'K5') +
          nav(T.cancel, 'D4', 'text');
        break;
      case 'G3':
        intro = '';
        body = `<div class="incoming"><span class="call-avatar">${I('user', 58)}</span><h1 id="screen-title" tabindex="-1">${esc(T.heading)}</h1><p>${esc(T.lead)}</p><div class="call-answer">${btn(T.decline, 'decline', {}, 'danger')}${btn(T.accept, 'answer', {}, 'primary')}</div></div>`;
        break;
      case 'G4':
        intro = '';
        body = `<div class="call-stage"><div class="call-banner"><span class="live-dot"></span>${esc(T.heading)}</div><div class="remote-person"><span class="call-avatar">${I('user', 60)}</span><h1 id="screen-title" tabindex="-1">${esc('CareFlow Clinic')}</h1></div><div class="self-video">${I(u.camera ? 'video' : 'lock', 24)}</div><p>${esc(T.note)}</p><div class="call-controls">${btn(u.mic ? T.micOn : T.micOff, 'mic', {}, 'call-control')}${btn(u.camera ? T.camOn : T.camOff, 'camera', {}, 'call-control')}${btn(T.end, 'leave-call', {}, 'danger')}</div><details class="call-notes"><summary>Personal notes</summary><label for="call-note-text">Notes for this session</label><textarea id="call-note-text" rows="3" placeholder="Not sent to the clinic"></textarea></details></div>`;
        break;
      case 'G5':
        body =
          (v.communication.callback === 'pending' ? note(C.callback) : '') +
          note(T.lead, 'warning') +
          btn(T.wait, 'callback', {}, 'primary') +
          `<div class="recovery-options" role="group" aria-label="How to continue">` + btn(T.online, 'rebook', {
            'data-purpose': 'online-retry',
            'data-mode': 'online',
          }) +
          btn(T.onsite, 'rebook', {
            'data-purpose': 'convert-onsite',
            'data-mode': 'onsite',
          }) + `</div>`;
        break;
      case 'H1':
        body =
          `<div class="care-stat-strip" aria-label="After-visit overview"><div><strong>${v.summary ? 1 : 0}</strong><small>Advice</small></div><div><strong>${v.labs.filter(x=>['available','reviewed'].includes(x.status)).length}</strong><small>Results</small></div><div><strong>${['unpaid','deferred'].includes(v.payment.status) ? 1 : 0}</strong><small>Due</small></div></div><div class="completion-mark">${I('check-circle', 48)}</div>` +
          card(
            status(v) +
              `<p>${esc(M.profile(s, v.patientId)?.name)} · ${esc(dateText(v))}</p>`,
          ) +
          nav(T.pay, 'H2', 'primary') +
          (v.lockedAt ? note(C.signed) : '') +
          `<div class="cf-photo-grid cf-aftercare-grid">${R.photoCard({title:T.summary,layout:'stack',description:'Advice and documents',to:'H6',id:v.id,icon:'document'})}${R.photoCard({title:T.labs,description:'Track orders',to:'F1',id:v.id,icon:'flask'})}${R.photoCard({title:T.care,layout:'network',description:'Send a question to the clinic',to:'I1',id:v.id,icon:'message-circle'})}${R.photoCard({title:T.followup,layout:'topic',description:'Choose your next appointment',to:'J1',id:v.id,icon:'calendar'})}</div>`;
        break;
      case 'H2':
        body =
          card(
            `<span class="eyebrow">${esc(C.fee)}</span><h2 class="card-heading">${I('document',24)}<span>${esc(C.unknownFee)}</span></h2>${chip(VI.payments[v.payment.status])}`,
          ) + note(T.note);
        if (['unpaid', 'deferred'].includes(v.payment.status))
          body +=
            btn(
              T.counter,
              'payment',
              { 'data-status': 'counter-pending' },
              'primary',
            ) +
            nav(T.transfer, 'H4') +
            btn(T.pharmacy, 'payment', { 'data-status': 'pharmacy-pending' }) +
            nav(T.later, 'H3', 'text');
        body += nav(T.receipt, 'H5');
        break;
      case 'H3':
        body = form(
          'defer',
          textarea('deferReason', T.reason) +
            field('dueDate', T.date, M.localDate(1), 'date', {
              min: M.localDate(),
            }),
          T.cta,
        );
        break;
      case 'H4':
        body =
          card(
            `<div class="qr-placeholder">${I('lock', 32)}<strong>${esc(T.noQR)}</strong></div><h2>${esc(T.bank)}</h2><p>${esc(C.notProvided)}</p>`,
          ) +
          note(
            v.payment.status === 'transfer-pending' ? T.pending : T.note,
            'warning',
          ) +
          btn(
            T.cta,
            'payment',
            { 'data-status': 'transfer-pending' },
            'primary',
            !['unpaid', 'deferred'].includes(v.payment.status),
          ) +
          nav(VI.screen.H2.receipt, 'H5');
        break;
      case 'H5':
        body = card(
          chip(VI.payments[v.payment.status]) +
            `<h2 class="card-heading">${I('document-check',24)}<span>${esc(T.receipt)}</span></h2>` +
            (['paid', 'refunding', 'refunded'].includes(v.payment.status)
              ? `<dl class="details" data-cf-component="facts"><div><dt>${esc(T.number)}</dt><dd>${esc('RC-' + v.id)}</dd></div><div><dt>${esc(C.fee)}</dt><dd>${esc(C.unknownFee)}</dd></div></dl>`
              : `<p>${esc(T.empty)}</p>`),
        );
        if (v.payment.dueDate)
          body += card(
            `<strong>${esc(T.date)}</strong><p>${esc(v.payment.dueDate)}</p><p>${esc(v.payment.reason)}</p>`,
          );
        if (['refunding', 'refunded'].includes(v.payment.status))
          body += section(
            T.refund,
            `<p>${esc(v.payment.reason)}</p>` + note(T.policy),
          );
        body += nav(T.summary, 'H6', 'primary') + nav(C.returnVisit, 'D2');
        break;
      case 'H6':
        body =
          section(T.conclusion, card(v.summary ? `<span class="chip">${esc(T.shared)}</span><p>${esc(v.summary.note)}</p><small>${esc(v.summary.author)}</small>` : `<p>${esc(T.empty)}</p>`)) +
          section(T.medicine, (s.prescriptions || []).some(r => r.visitId === v.id)
            ? `<div class="list">${s.prescriptions.filter(r => r.visitId === v.id).map(r => `<button type="button" class="row" ${UI.cardAttrs('row')} data-action="p-nav" data-to="M2" data-p-rx-id="${esc(r.id)}"><span class="row-icon">${I('pill')}</span><span class="row-text"><strong>${esc(r.name)}</strong><small>${esc(r.form)} · ${esc(r.quantity)}</small></span><span class="row-arrow">${I('chevron-right', 18)}</span></button>`).join('')}</div>`
            : `<div class="cf-document-empty">${I('pill',24)}<div><strong>No prescription shared yet</strong><p>The prescription for this visit will appear here once the clinic provides it.</p></div></div>`, '', 'pill') +
          section(T.instructions, `<p>${esc(C.noClinical)}</p>`) + R.aftercare(v,richH) +
          nav(T.question, 'I1', 'primary') +
          nav(T.followup, 'J1');
        break;
      case 'H7':
        body =
          (v.labs.length ? R.collection('results',u,v.labs.map(x=>({category:x.status==='reviewed'?'reviewed':['available','awaiting-review'].includes(x.status)?'waiting':'prepare',search:x.name+' '+VI.labs[x.status],html:`<article class="cf-result-card cf-stack" ${UI.cardAttrs('surface')}>${UI.illustration('result')}<div class="cf-photo-panel-content"><span class="cf-card-kicker">${esc(v.id)}</span><h2>${esc(x.name)}</h2><p>${esc(VI.labs[x.status])}</p>${x.file?`<small>${esc(x.file.name)}</small>`:''}<button type="button" class="cf-photo-arrow-action" ${UI.buttonAttrs('inverse')} data-action="go" data-to="F2" data-lab="${esc(x.id)}" aria-label="Open details"><span class="sr-only">Open details</span>${I('arrow-right',20)}</button></div></article>`})),{label:'results',search:'Search results',compactSearch:true,placeholder:'Test name or status',filters:[['all','All'],['waiting','Awaiting doctor'],['reviewed','Reviewed']]}) : empty('No results yet','Shared documents will appear in this visit.')) +
          card(
            `<dl class="details" data-cf-component="facts"><div><dt>${esc(T.notification)}</dt><dd>${esc(T[v.communication.result] || T.pending)}</dd></div><div><dt>${esc(T.explanation)}</dt><dd>${esc(v.communication.explanation === 'explained' ? T.explained : T.notExplained)}</dd></div></dl>`,
          );
        if (v.labs.some((x) => x.status === 'reviewed'))
          body +=
            nav(T.summary, 'H6', 'primary') +
            nav(T.more, 'F1') +
            btn(T.free, 'rebook', { 'data-purpose': 'explanation' }) +
            btn(T.call, 'callback');
        else body += note(T.wait);
        break;
      case 'I1': {
        const completed = s.visits.filter((x) => x.status === 'completed');
        if (!completed.length) {
          body = empty(
            VI.feedback.awaiting,
            VI.errors.NOT_COMPLETED,
            nav(C.viewVisit, 'D2'),
          );
          break;
        }
        body =
          section(
            T.visit,
            choices(
              T.visit,
              completed.map((x) => [
                x.id,
                M.profile(s, x.patientId)?.name,
                x.id + ' · ' + dateText(x),
              ]),
              v?.id,
            ),
          ) +
           `<div class="support-reasons cf-photo-grid" aria-label="Choose what to ask about">${['medicine', 'question', 'symptoms'].map(k=>R.photoCard({title:T[k],layout:k==='question'?'network':k==='symptoms'?'topic':'photo',description:T[k+'Hint'],image:k==='medicine'?'unsplash/medical-tools.webp':k==='question'?'unsplash/consultation.webp':'unsplash/doctor-care.webp',to:'I2',id:v.id,icon:k==='medicine'?'pill':k==='question'?'message-circle':'heart-pulse',reason:k,classes:'cf-inquiry-tile'})).join('')}</div><div class="care-links cf-photo-grid">${R.photoCard({title:T.tracking,layout:'topic',to:'I3',id:v.id,icon:'heart-pulse'})}${R.photoCard({title:T.referral,layout:'stack',to:'I4',id:v.id,icon:'document'})}${R.photoCard({title:T.messages,layout:'network',to:'I5',id:v.id,icon:'message-circle'})}</div>`;

        break;
      }
      case 'I2':
        body =
          chip(VI.screen.I1[u.reportReason]) +
          form(
            'report',
            textarea('report', T.text, u.reportText || '', {
              maxlength: '2000',
            }) +
              (u.reportReason === 'symptoms' ? `<fieldset class="severity-set"><legend>Severity of new symptoms</legend><div class="severity-grid">${[['mild','Mild'],['moderate','Moderate'],['high','Severe']].map(([value,label])=>`<label><input type="radio" name="severity" value="${value}"><span>${label}</span></label>`).join('')}</div></fieldset>` + check('urgent', T.urgent) : '') +
              note(T.note, 'warning'),
            T.cta,
          );
        break;
      case 'I3':
        body =
          careProgress(v) +
          form('tracking', textarea('tracking', T.text), T.cta) +
          section(
            T.heading,
            s.tracking
              .filter((x) => x.visitId === v.id)
              .map((x) =>
                card(
                  `<p>${esc(x.text)}</p><small class="entry-date">${I('clock',14)}${esc(new Date(x.at).toLocaleDateString('en-GB'))}</small>`,
                ),
              )
              .join('') || `<p>${esc(T.empty)}</p>`,
          ) +
          nav(T.contact, 'I5');
        break;
      case 'I4':
        body = `<ol class="referral-steps" aria-label="Referral progress"><li class="${v.care.referral ? 'reached' : ''}">Referred</li><li>Seen by specialist</li><li>Replied</li></ol>` + careProgress(v) + (v.care.referral
          ? card(`<p>${esc(v.care.referral)}</p>`) +
            form('referral', textarea('referral', T.text), T.cta)
          : empty(T.empty, T.lead, nav(C.support, 'K5')));
        break;
      case 'I5':
        body =
          careProgress(v) +
          (v.care.status === 'followup-due'
            ? note(VI.screen.I5.recommendation) +
              nav(VI.screen.I5.followup, 'J1', 'primary')
            : v.care.status === 'urgent-review'
              ? note(VI.screen.C4.lead, 'danger') +
                btn(VI.screen.I5.urgent, 'care-urgent', {}, 'danger')
              : '') +
          `<div class="conversation">${
            s.messages
              .filter((x) => x.visitId === v.id)
              .map(
                (x) =>
                  `<div class="message ${x.from === 'patient' ? 'sent' : 'received'}"><span>${esc(x.from === 'patient' ? M.profile(s, v.patientId)?.name : C.pending)}</span><p>${esc(x.text)}</p></div>`,
              )
              .join('') || `<p class="hint">${esc(T.empty)}</p>`
          }</div>` +
          form(
            'message',
            textarea('message', T.text, '', { maxlength: '2000' }),
            T.cta,
          ) +
          nav(T.followup, 'J1', 'text') +
          btn(T.urgent, 'care-urgent', {}, 'text danger-text');
        break;
      case 'J1':
        body =
          `<section class="cf-split" ${UI.cardAttrs('surface')} data-cf-mesh="feature"><div class="cf-stack"><h2>See your doctor again</h2><p>Choose a suitable time for your next visit.</p></div>${UI.illustration('calendar')}</section>` + card(details(s, v)) +
          section(T.suggestion, `<p>${esc(C.notProvided)}</p>`) +
          btn(T.cta, 'rebook', { 'data-purpose': 'followup' }, 'primary');
        break;
      case 'K1':
        body = (s.notifications.length
          ? (s.notifications.some(n=>!n.read)?btn('Mark all as read','notifications-read',{},'text'):'') + R.collection('notifications',u,s.notifications.map(n=>({category:n.read?'read':'unread',search:n.title+' '+n.body,html:`<button class="notification row ${n.read?'read':''}" ${UI.cardAttrs('row')} type="button" data-action="notification" data-id="${esc(n.id)}"><span class="row-icon">${I('bell')}</span><span class="row-text"><span class="cf-card-kicker">${n.read?'Read':'Unread'}${n.at?', '+esc(new Date(n.at).toLocaleDateString('en-GB')):''}</span><strong>${esc(n.title)}</strong><small>${esc(n.body)}</small></span>${I('chevron-right',18)}</button>${n.read?'':`<button type="button" class="cf-mark-read" data-action="notification-read" data-id="${esc(n.id)}">${I('check',16)}<span>Mark as read</span></button>`}`})),{label:'notifications',filters:[['all','All'],['unread','Unread'],['read','Read']]})
          : empty(T.empty,'')) + note(T.note);
        break;
      case 'K2':
        intro = head(T.heading,'') + R.profileHeader(s,richH);
        body = R.profile(s, u, richH);
        break;
      case 'K3': {
        const old = s.visits.filter((x) =>
          ['completed', 'cancelled', 'no-show'].includes(x.status),
        );
        body = old.length
          ? R.collection('history',u,old.sort((a,b)=>b.date.localeCompare(a.date)).map(x=>({category:x.status==='completed'?'completed':'stopped',search:[M.profile(s,x.patientId)?.name,R.clinician(x).name,x.reason,dateText(x)].join(' '),html:R.appointmentCard(s,x,richH)})),{label:'visits',search:'Search history',placeholder:'Patient, doctor or reason for visit',filters:[['all','All'],['completed','Completed'],['stopped','Stopped']]})
          : empty(T.empty, '');
        break;
      }
      case 'K4':
        body =
          form(
            'settings',
            check('largeText', T.text, s.settings.largeText) +
              check('privatePreview', T.preview, s.settings.privatePreview) +
              check('reminders', T.reminders, s.settings.reminders),
            C.save,
          ) +
          section(T.privacy, `<p>${esc(T.privacyLead)}</p>`) +
          (window.CareFlowDemoTools?.enabled() ? section('Demo tools', `<p>Restore appointments, profiles and requests to the original data for this tab.</p>${btn('Reset demo data', 'reset-demo', {}, 'secondary')}`) : '') +
          btn(T.logout, 'logout', {}, 'danger') + `<p class="cf-concept-credit cf-concept-credit--screen">Concept product designed by Đỗ Anh Nghĩa.</p>`;
        break;
      case 'K5':
        intro = R.supportHeader(s,richH);
        body = R.support(s, u, richH);
        break;
      default:
        if (P?.has(id)) {
          const screen = P.render(id, s, u);
          intro = head(screen.heading, screen.lead);
          body = screen.body;
          break;
        }
        return empty(
          VI.feedback.notFound,
          VI.feedback.notFoundLead,
          nav(C.home, 'B1', 'primary'),
        );
    }
    body += R.journeyCompanion(id,s,v,u,richH);
    const personContext = (s.authenticated &&
      /[C-J]/.test(id[0]) &&
      !['C1', 'C4', 'I1'].includes(id)
        ? context(s, id.startsWith('C') && id !== 'C9' ? null : v)
        : '');
    if (id === 'D2') return `<div class="ref-detail-sheet"><div class="ref-detail-heading">${intro}<div class="ref-clinician"><span>${root.CareFlowAvatar('doctor-ha',40)}</span><div><strong>${esc(R.clinician(v).name)}</strong><small>${esc(R.clinician(v).specialty)}</small></div>${I(v.mode==='online'?'video':'map-pin',22)}</div></div>${R.detailShortcuts(v,richH)}${body}</div>`;
    if (id === 'F2') return `<div class="ref-detail-sheet"><div class="ref-detail-heading">${intro}</div>${R.detailShortcuts(v,richH)}${body}</div>`;
    if (id === 'B1') return `<div class="screen-masthead home-masthead">${intro}</div>${body}`;
    if (['C1','D1','K2','K5'].includes(id)) return `<div class="screen-masthead compact-masthead">${intro}${id==='C1' && s.draft ? bookingProgress(id) : ''}</div>${body}`;
    if (id.startsWith('A') || ['G3','G4'].includes(id)) return intro + personContext + body;
    const groups = {
      C: ['BOOK AN APPOINTMENT', 'calendar'], D: ['YOUR APPOINTMENTS', 'calendar'],
      E: ['AT THE CLINIC', 'map-pin'], F: ['TESTS & RESULTS', 'document-check'],
      G: ['ONLINE VISIT', 'video'], H: ['AFTER YOUR VISIT', 'document'],
      I: ['AFTERCARE', 'heart-pulse'], J: ['SEE YOUR DOCTOR AGAIN', 'calendar'],
      K: [id === 'K5' ? 'CLINIC SUPPORT' : 'YOUR INFORMATION', id === 'K5' ? 'phone' : 'user'],
      M: ['YOUR MEDICATIONS', 'pill'], T: ['CLINIC SUPPORT', 'message-circle'],
    };
    const [label, icon] = groups[id[0]] || ['CAREFLOW', 'heart-pulse'];
    const tip = ['C1','C7','D1','K2','K5'].includes(id) ? null : VI.layout.tips[id];
    return `<div class="screen-masthead">${intro}${s.authenticated && s.draft ? bookingProgress(id) : ''}${personContext}</div>${tip ? id === 'C1' ? `<aside class="selection-reminder" role="note">${I('shield',21)}<div><strong>${esc(tip[0])}</strong><p>${esc(tip[1])}</p></div></aside>` : `<details class="ux-tip"><summary>${I('info',18)}<span>${esc(tip[0])}</span>${I('chevron-right',16)}</summary><p>${esc(tip[1])}</p></details>` : ''}${body}`;
  }
  root.CareFlowViews = {
    external,
    facilityCard,
    esc,
    btn,
    go,
    row,
    card,
    note,
    empty,
    head,
    render,
    context,
    modeText,
  };
})(window);
