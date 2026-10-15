/* Shared render components and 47 composed screens; events belong to app.js. */
(function (root) {
  'use strict';
  const M = root.CareFlowModel,
    VI = root.CareFlowCopy,
    C = VI.common,
    I = (name, size = 22) => root.CareFlowIcon(name, size);
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
    `<button type="button" class="btn ${variant}" data-action="${action}"${attrs(data)}${disabled ? ' disabled' : ''}>${esc(label)}</button>`;
  const go = (label, to, variant = 'secondary', extra = {}) =>
    btn(label, 'go', { 'data-to': to, ...extra }, variant);
  const external = (label, href, variant = 'primary') => `<a class="btn ${variant}" href="${esc(href)}"${href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''} data-action="external-support">${esc(label)}</a>`;
  const facilityCard = () => `<section class="facility-card"><span class="facility-icon">${I('document',28)}</span><div><h3>${esc(VI.facility.name)}</h3><p>${esc(VI.facility.address)}</p><span class="chip">${esc(VI.facility.entrance)}</span></div></section>`;
  const row = (title, hint, to, icon = 'chevron-right', extra = {}) =>
    `<button type="button" class="row" data-action="go" data-to="${to}"${attrs(extra)}><span class="row-icon">${I(icon)}</span><span class="row-text"><strong>${esc(title)}</strong>${hint ? `<small>${esc(hint)}</small>` : ''}</span>${I('chevron-right', 18)}</button>`;
  const card = (content, cls = '') =>
    `<section class="card ${cls}">${content}</section>`;
  const note = (text, type = 'info') =>
    `<div class="note ${type}">${I(type === 'danger' ? 'warning' : 'info', 19)}<p>${esc(text)}</p></div>`;
  const empty = (title, lead, action = '') =>
    `<div class="empty"><span class="empty-icon">${I('document', 38)}</span><h2>${esc(title)}</h2>${lead ? `<p>${esc(lead)}</p>` : ''}${action}</div>`;
  const field = (id, label, value = '', type = 'text', extra = {}) =>
    `<div class="field"><label for="${id}">${esc(label)}</label><input id="${id}" name="${id}" type="${type}" value="${esc(value)}"${attrs(extra)}></div>`;
  const textarea = (id, label, value = '', extra = {}) =>
    `<div class="field"><label for="${id}">${esc(label)}</label><textarea id="${id}" name="${id}" rows="4"${attrs(extra)}>${esc(value)}</textarea></div>`;
  const check = (id, label, checked = false) =>
    `<label class="check"><input id="${id}" name="${id}" type="checkbox"${checked ? ' checked' : ''}><span>${esc(label)}</span></label>`;
  const choices = (name, items, selected) =>
    `<fieldset class="choices"><legend class="sr-only">${esc(name)}</legend>${items.map(([v, label, hint]) => `<label class="choice ${v === selected ? 'selected' : ''}"><input type="radio" name="${name}" value="${esc(v)}"${v === selected ? ' checked' : ''}><span><strong>${esc(label)}</strong>${hint ? `<small>${esc(hint)}</small>` : ''}</span></label>`).join('')}</fieldset>`;
  const form = (name, html, cta = C.continue, variant = 'primary') =>
    `<form data-form="${name}" novalidate>${html}<p class="field-error" id="form-error" role="alert"></p><button class="btn ${variant}" type="submit">${esc(cta)}</button></form>`;
  const head = (t, lead) =>
    `<div class="screen-intro"><h1 id="screen-title" tabindex="-1">${esc(t)}</h1><p>${esc(lead || '')}</p></div>`;
  const section = (title, html) =>
    `<section class="section"><h2>${esc(title)}</h2>${html}</section>`;
  const chip = (text, tone = 'info') =>
    `<span class="chip ${tone}">${esc(text)}</span>`;
  const status = (v) =>
    chip(
      VI.statuses[v.status][0],
      ['cancelled', 'no-show'].includes(v.status)
        ? 'neutral'
        : v.status === 'mode-review'
          ? 'warning'
          : v.status === 'completed'
            ? 'success'
            : 'info',
    );
  const dateText = (v) => {
    if (!v?.date) return C.notProvided;
    const date = new Date(v.date + 'T12:00:00+07:00');
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(date);
  };
  const modeText = (mode) => (mode === 'online' ? C.online : C.onsite);
  const details = (s, v) =>
    `<dl class="details"><div><dt>${esc(C.patient)}</dt><dd>${esc(M.profile(s, v.patientId)?.name)}</dd></div><div><dt>${esc(C.date)}</dt><dd>${esc(dateText(v))}</dd></div><div><dt>${esc(C.time)}</dt><dd>${esc(v.slot)}</dd></div><div><dt>${esc(C.mode)}</dt><dd>${esc(v.status === 'mode-review' || (!v.status && v.risk) ? 'Chờ phòng khám xác nhận' : modeText(v.mode))}</dd></div><div><dt>${esc(C.reason)}</dt><dd>${esc(v.reason)}</dd></div></dl>`;
  function visitCard(s, v, hero = false) {
    return `<button class="visit-card ${hero ? 'hero' : ''}" type="button" data-action="open-visit" data-id="${esc(v.id)}"><span class="visit-card-top"><span class="eyebrow">${esc(v.status === 'mode-review' || (!v.status && v.risk) ? 'Chờ phòng khám xác nhận' : modeText(v.mode))}</span>${I(v.mode === 'online' ? 'video' : 'calendar', 24)}</span><strong class="visit-time">${esc(v.slot)}</strong><span class="visit-date">${esc(dateText(v))}</span><span class="visit-person">${I('user', 17)}${esc(M.profile(s, v.patientId)?.name)}</span><span class="visit-bottom">${status(v)}${I('chevron-right', 20)}</span></button>`;
  }
  function timeline(v) {
    return `<ol class="timeline">${v.history.map((h, i) => `<li class="${i === v.history.length - 1 ? 'current' : ''}"><span class="timeline-dot"></span><div><strong>${esc(VI.statuses[h.status]?.[0] || h.status)}</strong><small>${esc(new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(h.at)))}</small></div></li>`).join('')}</ol>`;
  }
  function slotForm(s, name = 'slot', title = VI.screen.C7) {
    const d = s.draft || {};
    return form(
      name,
      field('date', title.date || C.date, d.date || M.localDate(1), 'date', {
        min: M.localDate(),
        required: 'required',
      }) +
        `<fieldset class="slot-field"><legend>${esc(C.time)}</legend><div class="slots">${['08:00', '09:00', '10:30', '14:00', '15:30'].map((t) => `<label class="slot"><input name="slot" type="radio" value="${t}"${d.slot === t ? ' checked' : ''}><span>${t}</span></label>`).join('')}</div></fieldset>`,
      title.next || C.continue,
    );
  }
  function context(s, v) {
    const p = M.profile(s, v?.patientId || s.draft?.patientId);
    return p
      ? `<div class="context">${I('user', 16)}<span>${esc(p.name)}</span>${v ? `<small>${esc(v.id)}</small>` : ''}</div>`
      : '';
  }
  function careProgress(v) {
    const task = v.care.tasks?.at(-1);
    if (!task) return '';
    const labels = { received: ['Đã nhận cập nhật của bạn','Điều phối viên sẽ kiểm tra và chuyển thông tin cho bác sĩ.'], coordinating: ['Điều phối viên đang xử lý','Thông tin của bạn đang được tổng hợp để chuyển bác sĩ.'], 'doctor-review': ['Bác sĩ đang xem','Phòng khám sẽ phản hồi khi bác sĩ có hướng dẫn tiếp theo.'], answered: ['Phòng khám đã phản hồi','Bạn có thể xem phản hồi trong tin nhắn và hỏi thêm nếu cần.'] };
    return card(`${chip(labels[task.status][0])}<p class="eyebrow">Ai đang xử lý</p><h2>${esc(task.owner)}</h2><p>${esc(labels[task.status][1])}</p>`, 'care-progress');
  }
  function render(id, s, u) {
    const T = VI.screen[id],
      v = M.visit(s),
      d = s.draft,
      p = M.accountProfile(s),
      l = v?.labs.find((x) => x.id === u.labId) || v?.labs[0];
    let body = '';
    let intro = head(T?.heading || '', T?.lead || '');
    const nav = (label, to, variant = 'secondary', extra = {}) =>
      go(label, to, variant, extra);
    switch (id) {
      case 'A1':
        intro =
          `<div class="welcome-mark" aria-hidden="true">${I('heart-pulse', 44)}</div>` +
          head(T.heading, T.lead);
        body =
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
          nav(C.support, 'K5', 'text');
        break;
      case 'A2':
        body =
          form(
            'match',
            field('name', T.name, p?.name || '', 'text', {
              autocomplete: 'name',
            }) +
              field('dob', T.dob, p?.dob || '', 'date', { max: M.localDate() }) +
              field('contactPhone', C.contactPhone, p?.phone || '', 'tel') +
              textarea('medicalHistory', C.medicalHistory, p?.medicalHistory || ''),
            T.confirm,
          ) + btn(T.different, 'different-profile', {}, 'text');
        break;
      case 'A3':
        body = form(
          'profile',
          field('name', T.name, '', 'text', { autocomplete: 'name' }) +
            field('dob', T.dob, '', 'date', {
              max: M.localDate(),
              required: 'required',
            }) + field('contactPhone', C.contactPhone, '', 'tel') + textarea('medicalHistory', C.medicalHistory),
          T.submit,
        );
        break;
      case 'B1': {
        intro = `<div class="greeting"><div><p>${esc(T.heading)}</p><h1 id="screen-title" tabindex="-1">${esc(p?.name || '')}</h1></div><span class="avatar">${esc(
          (p?.name || 'CF')
            .split(' ')
            .slice(-2)
            .map((x) => x[0])
            .join(''),
        )}</span></div><p class="greeting-lead">${esc(T.lead)}</p>`;
        const active = s.visits.filter(
          (x) => !['completed', 'cancelled', 'no-show'].includes(x.status),
        );
        body =
          btn(C.book, 'begin', {}, 'primary book-cta') +
          section(
            T.upcoming,
            active.length
              ? active.map((x) => visitCard(s, x, true)).join('')
              : empty(T.empty, T.emptyLead),
          );
        if (v) {
          const next = M.nextAction(v);
          body += section(
            T.tasks,
            row(
              VI.actions[next[1]],
              VI.statuses[v.status][1],
              next[0],
              'clock',
              {
                'data-purpose': ['cancelled', 'no-show'].includes(v.status)
                  ? 'rebook'
                  : '',
              },
            ) +
              (v.labs.length
                ? row(
                    VI.screen.F1.heading,
                    VI.labs[v.labs[0].status],
                    'F1',
                    'document',
                  )
                : '') +
              (v.status === 'completed'
                ? row(VI.payments[v.payment.status], C.fee, 'H2', 'document')
                : ''),
          );
        }
        body +=
          section(
            T.care,
            row(VI.screen.I1.heading, T.careLead, 'I1', 'heart-pulse'),
          ) + row(T.help, T.helpLead, 'K5', 'phone');
        break;
      }
      case 'C1':
        body =
          form(
            'patient',
            choices(
              C.patient,
              s.profiles.map((x) => [
                x.id,
                x.name,
                x.relation === 'self' ? T.self : T.permission,
              ]),
              d?.patientId,
            ),
            C.continue,
          ) + nav(T.add, 'K2', 'text');
        break;
      case 'C2':
        body =
          form(
            'reason',
            textarea('reason', T.label, d?.reason || '', {
              maxlength: '1200',
              required: 'required',
            }) + `<p class="hint">${esc(T.hint)}</p>` + textarea('medicalHistory', C.medicalHistory, d?.medicalHistory || '') + `<p class="hint">${esc(C.historyHint)}</p>`,
          ) + note(T.note);
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
            ),
          ) + note(T.note);
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
                ['onsite', C.onsite, T.onsite],
                ['online', C.online, T.online],
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
          ? card(status(v) + details(s, v)) + nav(C.viewVisit, 'D2', 'primary')
          : '';
        break;
      case 'D1': {
        body = `<div class="segments" role="group" aria-label="${esc(T.heading)}">${['upcoming', 'past', 'cancelled'].map((k) => btn(T[k], 'filter', { 'data-filter': k }, u.filter === k ? 'selected' : 'text')).join('')}</div>`;
        const visits = s.visits.filter((x) =>
          u.filter === 'past'
            ? x.status === 'completed'
            : u.filter === 'cancelled'
              ? ['cancelled', 'no-show'].includes(x.status)
              : !['completed', 'cancelled', 'no-show'].includes(x.status),
        );
        body += visits.length
          ? visits.map((x) => visitCard(s, x)).join('')
          : empty(T.empty, T.emptyLead, btn(C.book, 'begin', {}, 'primary'));
        break;
      }
      case 'D2': {
        const next = M.nextAction(v);
        body =
          card(
            `${status(v)}<span class="eyebrow">${esc(C.owner)}</span><h2>${esc(VI.statuses[v.status][1])}</h2>${v.reviewReason ? `<p>${esc(v.reviewReason)}</p>` : ''}${nav(VI.actions[next[1]], next[0], 'primary', { 'data-purpose': ['cancelled', 'no-show'].includes(v.status) ? 'rebook' : '' })}`,
            'next-step',
          ) +
          card(
            `<div class="ticket-head"><span class="eyebrow">${esc(T.code)}</span><strong>${esc(v.id)}</strong>${status(v)}</div>${details(s, v)}<div class="ticket-code"><div id="visit-qr" data-payload="CAREFLOW-DEMO:${esc(v.id)}" aria-label="${esc(T.qr)}" role="img"></div><p>${esc(T.qrHint)}</p></div>`,
            'ticket',
          );
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
        if ((M.TRANSITIONS[v.status] || []).includes('cancelled'))
          body += `<div class="inline-actions">${nav(T.change, 'D3')}${nav(T.cancel, 'D4', 'text danger-text')}</div>`;
        body += section(C.history, timeline(v));
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
          card(
            `<dl class="details">${[
              [T.time, v.slot + ' · ' + dateText(v)],
              [T.arrival, C.notProvided],
              [T.papers, C.notProvided],
              [T.address, C.notProvided],
              [C.fee, C.unknownFee],
            ]
              .map(
                ([k, val]) =>
                  `<div><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`,
              )
              .join('')}</dl>`,
          ) +
          note(T.note) +
          nav(T.cta, 'D2', 'primary');
        break;
      case 'E2':
        body =
          card(details(s, v)) +
          note(T.note) +
          btn(T.cta, 'arrive', {}, 'primary');
        break;
      case 'E3':
        body =
          card(
            `<div class="queue-orbit">${I('clock', 44)}</div><h2>${esc(VI.statuses[v.status][0])}</h2><p>${esc(VI.statuses[v.status][1])}</p>`,
            'center',
          ) +
          section(T.queue, `<p>${esc(T.queueNote)}</p>`) +
          note(T.note) +
          section(C.history, timeline(v)) +
          nav(C.viewVisit, 'D2');
        break;
      case 'F1':
        body = v.labs.length
          ? v.labs
              .map((x) =>
                row(x.name, VI.labs[x.status], 'F2', 'document', {
                  'data-lab': x.id,
                }),
              )
              .join('')
          : empty(T.empty, T.emptyLead);
        body += nav(C.returnVisit, 'D2');
        break;
      case 'F2':
        body =
          card(
            `<h2>${esc(l.name)}</h2>${chip(VI.labs[l.status])}<p>${esc(l.timing === 'pre' ? VI.statuses['pre-lab'][0] : VI.screen.H1.labs)}</p>`,
          ) +
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
            `<strong>${esc(l.file.name)}</strong><p>${esc(VI.labs[l.status])}</p>`,
          );
        if (['available','awaiting-review','reviewed'].includes(l.status) && l.timing === 'pre') {
          if (l.continuation === 'review-during') body += note('Phòng khám đã nhận kết quả. Bác sĩ sẽ xem cùng bạn trong buổi khám.') + nav('Theo dõi bước tiếp nhận', 'E3', 'primary');
          else if (l.continuation === 'return-to-visit') body += note('Phòng khám đã nhận kết quả. Bạn hãy quay lại phiếu khám để tiếp tục lượt hiện tại.') + nav('Tiếp tục lượt khám hiện tại', 'D2', 'primary');
          else body += note('Kết quả đang chờ điều dưỡng kiểm tra. Phòng khám sẽ xác nhận cách tiếp tục lượt khám của bạn.');
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
            `<div class="waiting-orbit">${I('video', 40)}</div><h2>${esc(T.heading)}</h2><p>${esc(T.note)}</p>`,
            'center',
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
        body = `<div class="call-stage"><div class="call-banner"><span class="live-dot"></span>${esc(T.heading)}</div><div class="remote-person"><span class="call-avatar">${I('user', 60)}</span><h1 id="screen-title" tabindex="-1">${esc('Phòng khám CareFlow')}</h1></div><div class="self-video">${I(u.camera ? 'video' : 'lock', 24)}</div><p>${esc(T.note)}</p><div class="call-controls">${btn(u.mic ? T.micOn : T.micOff, 'mic', {}, 'call-control')}${btn(u.camera ? T.camOn : T.camOff, 'camera', {}, 'call-control')}${btn(T.end, 'leave-call', {}, 'danger')}</div></div>`;
        break;
      case 'G5':
        body =
          (v.communication.callback === 'pending' ? note(C.callback) : '') +
          note(T.lead, 'warning') +
          btn(T.wait, 'callback', {}, 'primary') +
          btn(T.online, 'rebook', {
            'data-purpose': 'online-retry',
            'data-mode': 'online',
          }) +
          btn(T.onsite, 'rebook', {
            'data-purpose': 'convert-onsite',
            'data-mode': 'onsite',
          });
        break;
      case 'H1':
        body =
          `<div class="completion-mark">${I('check-circle', 48)}</div>` +
          card(
            status(v) +
              `<p>${esc(M.profile(s, v.patientId)?.name)} · ${esc(dateText(v))}</p>`,
          ) +
          nav(T.pay, 'H2', 'primary') +
          (v.lockedAt ? note(C.signed) : '') +
          `<div class="list">${row(T.summary, '', 'H6', 'document')}${row(T.labs, '', 'F1', 'document')}${row(T.care, '', 'I1', 'heart-pulse')}${row(T.followup, '', 'J1', 'calendar')}</div>`;
        break;
      case 'H2':
        body =
          card(
            `<span class="eyebrow">${esc(C.fee)}</span><h2>${esc(C.unknownFee)}</h2>${chip(VI.payments[v.payment.status])}`,
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
            `<h2>${esc(T.receipt)}</h2>` +
            (['paid', 'refunding', 'refunded'].includes(v.payment.status)
              ? `<dl class="details"><div><dt>${esc(T.number)}</dt><dd>${esc('RC-' + v.id)}</dd></div><div><dt>${esc(C.fee)}</dt><dd>${esc(C.unknownFee)}</dd></div></dl>`
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
          section(T.medicine, card(`<p>${esc(C.noClinical)}</p>`)) +
          section(T.instructions, `<p>${esc(C.noClinical)}</p>`) +
          nav(T.question, 'I1', 'primary') +
          nav(T.followup, 'J1');
        break;
      case 'H7':
        body =
          v.labs
            .map((x) =>
              row(x.name, VI.labs[x.status], 'F2', 'document', {
                'data-lab': x.id,
              }),
            )
            .join('') +
          card(
            `<dl class="details"><div><dt>${esc(T.notification)}</dt><dd>${esc(T[v.communication.result] || T.pending)}</dd></div><div><dt>${esc(T.explanation)}</dt><dd>${esc(v.communication.explanation === 'explained' ? T.explained : T.notExplained)}</dd></div></dl>`,
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
          `<div class="list">${['medicine', 'question', 'symptoms'].map((k) => row(T[k], T[k + 'Hint'], 'I2', k === 'medicine' ? 'pill' : 'document', { 'data-reason': k })).join('')}${row(T.tracking, '', 'I3', 'heart-pulse')}${row(T.referral, '', 'I4', 'document')}${row(T.messages, '', 'I5', 'phone')}</div>`;
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
              (u.reportReason === 'symptoms' ? check('urgent', T.urgent) : '') +
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
                  `<p>${esc(x.text)}</p><small>${esc(new Date(x.at).toLocaleDateString('vi-VN'))}</small>`,
                ),
              )
              .join('') || `<p>${esc(T.empty)}</p>`,
          ) +
          nav(T.contact, 'I5');
        break;
      case 'I4':
        body = careProgress(v) + (v.care.referral
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
          card(details(s, v)) +
          section(T.suggestion, `<p>${esc(C.notProvided)}</p>`) +
          btn(T.cta, 'rebook', { 'data-purpose': 'followup' }, 'primary');
        break;
      case 'K1':
        body =
          (s.notifications.length
            ? s.notifications
                .map(
                  (n) =>
                    `<button class="notification row ${n.read ? 'read' : ''}" type="button" data-action="notification" data-id="${esc(n.id)}"><span class="row-icon">${I('bell')}</span><span class="row-text"><strong>${esc(n.title)}</strong><small>${esc(n.body)}</small></span>${I('chevron-right', 18)}</button>`,
                )
                .join('')
            : empty(T.empty, '')) + note(T.note);
        break;
      case 'K2':
        body =
          s.profiles
            .map((x) =>
              card(
                `<div class="profile-row"><span class="avatar">${esc(
                  x.name
                    .split(' ')
                    .slice(-2)
                    .map((z) => z[0])
                    .join(''),
                )}</span><div><h2>${esc(x.name)}</h2><p>${esc(x.dob)}</p>${chip(x.canViewResults ? T.view : T.bookOnly)}</div></div>`,
              ),
            )
            .join('') +
          row(T.history, '', 'K3', 'document') +
          row(T.settings, '', 'K4', 'settings') +
          `<details class="add-relative"><summary>${esc(T.add)}</summary>${form('relative', field('name', T.name) + field('dob', T.dob, '', 'date', { max: M.localDate() }), T.save)}</details>`;
        break;
      case 'K3': {
        const old = s.visits.filter((x) =>
          ['completed', 'cancelled', 'no-show'].includes(x.status),
        );
        body = old.length
          ? old.map((x) => visitCard(s, x)).join('')
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
          btn(T.logout, 'logout', {}, 'text danger-text');
        break;
      case 'K5':
        body =
          card(
            `<span class="support-mark">${I('phone', 32)}</span><h2>${esc(T.call)}</h2><p>Để lại yêu cầu để phòng khám liên hệ với bạn về lịch hẹn và việc sau khám.</p>${btn(T.call, 'clinic-call', {}, 'primary')}`,
          ) +
          row(VI.screen.I1.heading, VI.screen.I1.lead, 'I1', 'heart-pulse') +
          form('support', textarea('support', T.text), T.message) +
          section(
            T.faq,
            [1, 2, 3, 4]
              .map(
                (n) =>
                  `<details class="faq"><summary>${esc(T['q' + n])}</summary><p>${esc(T['a' + n])}</p></details>`,
              )
              .join(''),
          );
        break;
      default:
        return empty(
          VI.feedback.notFound,
          VI.feedback.notFoundLead,
          nav(C.home, 'B1', 'primary'),
        );
    }
    return (
      intro +
      (s.authenticated &&
      /[C-J]/.test(id[0]) &&
      !['C1', 'C4', 'I1'].includes(id)
        ? context(s, id.startsWith('C') && id !== 'C9' ? null : v)
        : '') +
      body
    );
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
