/* Shared render components and 47 composed screens; events belong to app.js. */
(function (root) {
  'use strict';
  const M = root.CareFlowModel,
    VI = root.CareFlowCopy,
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
    `<button type="button" class="btn ${variant}" data-action="${action}"${attrs(data)}${disabled ? ' disabled' : ''}>${['device', 'clinic-call', 'callback', 'rebook', 'arrive', 'directions'].includes(action) ? I(({device:'video','clinic-call':'phone',callback:'phone',rebook:'calendar',arrive:'map-pin',directions:'map-pin'})[action],20) : ''}${['mic','camera','leave-call'].includes(action)?I(({mic:'mic',camera:'video','leave-call':'phone'})[action],22):''}${variant.includes('method-card')?I('document',24):''}${variant.includes('change-visit') ? I('refresh',20) : variant.includes('cancel-visit') ? I('cross',20) : variant.includes('add-relative-inline') ? I('plus',20) : ''}<span>${esc(label)}</span>${variant.includes('primary') && action === 'go' ? I('arrow-right',20) : ''}</button>`;
  const go = (label, to, variant = 'secondary', extra = {}) =>
    btn(label, 'go', { 'data-to': to, ...extra }, variant);
  const external = (label, href, variant = 'primary') => `<a class="btn ${variant}" href="${esc(href)}"${href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''} data-action="external-support">${esc(label)}</a>`;
  const facilityCard = () => `<section class="facility-card"><span class="facility-icon">${I('document',28)}</span><div><h3>${esc(VI.facility.name)}</h3><p>${esc(VI.facility.address)}</p><span class="chip">${esc(VI.facility.entrance)}</span></div></section>`;
  const row = (title, hint, to, icon = 'chevron-right', extra = {}) => {
    const description = hint || VI.layout.rowHints[to];
    return `<button type="button" class="row" data-action="${to === 'C1' ? 'book-nav' : 'go'}" data-to="${to}"${attrs(extra)}><span class="row-icon">${I(icon)}</span><span class="row-text"><strong>${esc(title)}</strong>${description ? `<small>${esc(description)}</small>` : ''}</span><span class="row-arrow">${I('chevron-right', 18)}</span></button>`;
  };
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
  const choices = (name, items, selected, inlineAction = '') => {
    const icons = { onsite: 'map-pin', online: 'video', normal: 'shield', warning: 'warning' };
    return `<fieldset class="choices"><legend class="sr-only">${esc(name)}</legend>${items.map(([v, label, hint, meta]) => `<label class="choice ${v === selected ? 'selected' : ''} ${name === C.patient ? 'patient-choice' : ''}"><input type="radio" name="${name}" value="${esc(v)}"${v === selected ? ' checked' : ''}>${icons[v] || name === C.patient ? `<span class="choice-visual" aria-hidden="true">${name === C.patient ? root.CareFlowAvatar(v,44) : I(icons[v],25)}</span>` : ''}<span class="choice-copy"><strong>${esc(label)}</strong>${hint ? `<small>${esc(hint)}</small>` : ''}${meta ? `<span class="choice-meta">${I(name === C.patient ? 'calendar' : 'document',13)}${esc(meta)}</span>` : ''}</span></label>${v === selected ? inlineAction : ''}`).join('')}${items.some(([v]) => v === selected) ? '' : inlineAction}</fieldset>`;
  };
  const form = (name, html, cta = C.continue, variant = 'primary', errorId = 'form-error') =>
    `<form data-form="${name}" novalidate><div class="form-body">${html}</div><div class="form-actions"><p class="field-error" id="${errorId}" role="alert"></p><button class="btn ${variant}" type="submit"><span>${esc(cta)}</span>${I(name === 'booking' ? 'check-circle' : 'arrow-right',20)}</button></div></form>`;
  const head = (t, lead) =>
    `<div class="screen-intro"><h1 id="screen-title" tabindex="-1">${esc(t)}</h1><p>${esc(lead || '')}</p></div>`;
  const section = (title, html, cls = '', icon = 'document') =>
    `<section class="section ${cls}"><h2 class="section-heading">${I(title === C.history ? 'clock' : icon,18)}<span>${esc(title)}</span></h2>${html}</section>`;
  const chip = (text, tone = 'info') =>
    `<span class="chip ${tone}">${esc(text)}</span>`;
  const status = (v) =>
    chip(
      VI.statuses[v.status][0],
      ['cancelled', 'no-show'].includes(v.status)
        ? 'neutral'
        : ['mode-review', 'pending', 'unreachable'].includes(v.status)
          ? 'warning'
          : ['completed', 'confirmed', 'reminder', 'ready'].includes(v.status)
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
    `<dl class="details"><div><dt>${I('user',14)}${esc(C.patient)}</dt><dd>${esc(M.profile(s, v.patientId)?.name)}</dd></div><div><dt>${I('calendar',14)}${esc(C.date)}</dt><dd>${esc(dateText(v))}</dd></div><div><dt>${I('clock',14)}${esc(C.time)}</dt><dd>${esc(v.slot)}</dd></div><div><dt>${I(v.mode === 'online' ? 'video' : 'map-pin',14)}${esc(C.mode)}</dt><dd>${esc(v.status === 'mode-review' || (!v.status && v.risk) ? 'Chờ phòng khám xác nhận' : modeText(v.mode))}</dd></div><div><dt>${I('document',14)}${esc(C.reason)}</dt><dd>${esc(v.reason)}</dd></div></dl>`;
  function visitCard(s, v, hero = false) {
    const date = new Date(v.date + 'T12:00:00+07:00');
    const day = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
    const month = new Intl.DateTimeFormat('vi-VN', { month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
    return `<button data-status="${esc(v.status)}" class="visit-card ${hero ? 'hero' : ''}" type="button" data-action="open-visit" data-id="${esc(v.id)}"><span class="visit-card-top"><span class="visit-person">${root.CareFlowAvatar(v.patientId,36)}<span><small>${esc(C.patient)}</small><strong>${esc(M.profile(s, v.patientId)?.name)}</strong></span></span><span class="visit-mode" aria-label="${esc(modeText(v.mode))}">${I(v.mode === 'online' ? 'video' : 'map-pin', 22)}</span></span><span class="visit-schedule"><span class="visit-day" aria-hidden="true"><strong>${esc(day)}</strong><small>THÁNG ${esc(month)}</small></span><span class="visit-schedule-copy"><strong class="visit-time">${esc(v.slot)}</strong><span class="visit-date">${esc(dateText(v))}</span><span class="visit-location">${esc(v.status === 'mode-review' ? 'Hình thức đang được xem xét' : modeText(v.mode))}</span></span></span><span class="visit-bottom">${status(v)}<span class="visit-open" aria-label="${esc(C.viewVisit)}">${I('arrow-right', 19)}</span></span></button>`;
  }
  function timeline(v) {
    return `<ol class="timeline">${v.history.map((h, i) => `<li class="${i === v.history.length - 1 ? 'current' : ''}"><span class="timeline-dot"></span><div><strong>${esc(VI.statuses[h.status]?.[0] || h.status)}</strong><small>${esc(new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(h.at)))}</small></div></li>`).join('')}</ol>`;
  }
  function slotForm(s, name = 'slot', title = VI.screen.C7) {
    const d = s.draft || {};
    const selected = d.date || M.localDate(1);
    const days = Array.from({length: 8}, (_, i) => {
      const value = M.localDate(i);
      const date = new Date(value + 'T12:00:00+07:00');
      const weekday = new Intl.DateTimeFormat('vi-VN', {weekday: 'short', timeZone: 'Asia/Ho_Chi_Minh'}).format(date);
      return `<button type="button" class="date-option" data-action="quick-date" data-date="${value}" aria-label="${esc(dateText({date: value}))}" aria-pressed="${value === selected}"><span>${esc(weekday)}</span><strong>${date.getDate()}</strong></button>`;
    }).join('');
    return form(
      name,
      `<div class="date-strip" role="group" aria-label="${esc(VI.layout.quickDates)}">${days}</div>` + field('date', title.date || C.date, selected, 'date', {
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
      ? `<div class="context">${I('user', 16)}<span>${esc(p.name)}</span>${v ? `<small>${esc(v.id)}</small>` : `<button type="button" class="context-edit" data-action="go" data-to="C1" aria-label="${esc(VI.layout.changePatient)}">${I('user',16)}<span>Đổi</span></button>`}</div>`
      : '';
  }
  function careProgress(v) {
    const task = v.care.tasks?.at(-1);
    if (!task) return '';
    const labels = { received: ['Đã nhận cập nhật của bạn','Điều phối viên sẽ kiểm tra và chuyển thông tin cho bác sĩ.'], coordinating: ['Điều phối viên đang xử lý','Thông tin của bạn đang được tổng hợp để chuyển bác sĩ.'], 'doctor-review': ['Bác sĩ đang xem','Phòng khám sẽ phản hồi khi bác sĩ có hướng dẫn tiếp theo.'], answered: ['Phòng khám đã phản hồi','Bạn có thể xem phản hồi trong tin nhắn và hỏi thêm nếu cần.'] };
    return card(`${chip(labels[task.status][0])}<p class="eyebrow">Phụ trách yêu cầu</p><h2>${esc(task.owner)}</h2><p>${esc(labels[task.status][1])}</p>`, 'care-progress');
  }
  function bookingProgress(id) {
    const step = {C1: 0, C2: 1, C3: 1, C4: 1, C5: 2, C6: 2, C7: 2, C8: 3}[id];
    if (step === undefined) return '';
    const labels = VI.layout.bookingSteps;
    return `<div class="booking-progress"><div class="booking-progress-title"><span>${esc(VI.layout.bookingTitle)}</span><span>${esc(VI.layout.step)} ${step + 1} / 4</span></div><ol aria-label="Tiến trình đặt lịch">${labels.map((label, i) => `<li class="${i < step ? 'done' : ''}"${i === step ? ' aria-current="step"' : ''}><span class="step-track"></span><span>${esc(label)}</span></li>`).join('')}</ol></div>`;
  }
  const doctorCard = () => `<div class="doctor-strip">${I('user',28)}<div><strong>Bác sĩ phụ trách</strong><small>Phòng khám sẽ xác nhận người phụ trách</small></div>${I('shield',18)}</div>`;
  const levels = (name) => `<fieldset class="feeling-scale"><legend>Mức độ bạn cảm nhận</legend>${['Nhẹ','Vừa','Nặng'].map((label,i)=>`<label><input type="radio" name="${name}" value="${i+1}"><span>${I(['heart-pulse','info','warning'][i],19)}${label}</span></label>`).join('')}</fieldset>`;
  const stats = (items) => `<div class="stat-strip">${items.map(([value,label])=>`<div><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('')}</div>`;
  const labProgress = (value='ordered') => {
    const states=['ordered','scheduled','available','awaiting-review','reviewed'];
    return `<ol class="lab-progress" aria-label="Tiến độ xét nghiệm">${states.map((state,i)=>`<li class="${i<=states.indexOf(value)?'done':''}"${state===value?' aria-current="step"':''}><span>${i+1}</span><small>${esc(VI.labs[state])}</small></li>`).join('')}</ol>`;
  };
  const visitJourney = (v) => {
    const steps=['Xác nhận','Đến phòng khám','Tiếp nhận','Sẵn sàng','Đang khám','Hoàn tất'];
    const current={pending:-1,'mode-review':-1,confirmed:0,reminder:0,'pre-lab':0,arrived:1,received:2,ready:3,'online-wait':2,calling:3,'in-consult':4,completed:5}[v.status]??-1;
    return `<ol class="visit-journey" aria-label="Tiến trình lượt khám">${steps.map((label,i)=>`<li class="${i<current?'done':''}"${i===current?' aria-current="step"':''}><span>${i<current?I('check',14):i+1}</span><div><strong>${label}</strong><small>${i<current?'Đã qua bước này':i===current?'Bước hiện tại':'Chưa đến bước này'}</small></div></li>`).join('')}</ol>`;
  };
  const visitHero = (v) => `<div class="schedule-hero"><div><span class="eyebrow">${esc(dateText(v))}</span><strong>${esc(v.slot)}</strong><small>${I(v.mode==='online'?'video':'map-pin',16)}${esc(modeText(v.mode))}</small></div>${status(v)}</div>`;
  const qrCard = (v) => `<div class="arrival-qr"><div id="visit-qr" data-payload="CAREFLOW-DEMO:${esc(v.id)}" aria-label="${esc(VI.screen.D2.qr)}" role="img"></div><strong>${esc(v.id)}</strong><small>Đưa mã này cho lễ tân</small></div>`;
  // Auth visuals are shared; each screen retains its real form and validation.
  const authVisual = () =>
    `<div class="auth-scene"><span class="auth-scene-circle" aria-hidden="true"></span><span class="auth-scene-ring" aria-hidden="true"></span><div class="auth-promise"><span class="auth-promise-icon" aria-hidden="true">${I('heart-pulse', 30)}</span><p>${VI.layout.authTitle.map(esc).join('<br>')}</p><small>${esc(VI.layout.authLead)}</small></div></div>`;
  const authPanel = (title, lead, controls, variant = '') =>
    `<section class="auth-panel ${esc(variant)}" aria-labelledby="screen-title">${head(title, lead)}<div class="auth-panel-content">${controls}</div></section>`;
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
        intro = authVisual();
        body = authPanel(
          u.otpSent ? 'Xác nhận số điện thoại' : T.heading,
          u.otpSent
            ? 'Nhập mã xác nhận để tiếp tục với hồ sơ của bạn.'
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
            nav(C.support, 'K5', 'text'),
          u.otpSent ? 'auth-otp' : 'auth-start',
        );
        break;
      case 'A2':
        intro = authVisual();
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
        intro = authVisual();
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
        intro = `<div class="greeting"><span class="avatar">${root.CareFlowAvatar(p?.id||'account',44)}</span><div><p>${esc(T.heading)}</p><h1 id="screen-title" tabindex="-1">${esc(p?.name||'')}</h1></div></div><div class="home-statement"><h2>Lịch khám rõ ràng.<br>An tâm mỗi ngày.</h2></div>`;
        const active=s.visits.filter(x=>!['completed','cancelled','no-show'].includes(x.status));
        const next=v?M.nextAction(v):null;
        body = `<div class="home-hero">${active.length?visitCard(s,active[0],true):empty(T.empty,T.emptyLead,btn(C.book,'book-nav',{},'primary'))}</div>` +
          `<div class="quick-actions" role="group" aria-label="Thao tác nhanh">${[['Đặt lịch','begin','calendar',''],['Lịch hẹn','go','clock','D1'],['Hồ sơ','go','user','K2'],['Hỗ trợ','go','phone','K5']].map(([label,action,icon,to])=>`<button type="button" data-action="${action}" data-to="${to}"><span>${I(icon,23)}</span><small>${label}</small></button>`).join('')}</div>`;
        body+=section(T.tasks,`<div class="home-tasks horizontal-rail">${next?row(VI.actions[next[1]],VI.statuses[v.status][1],next[0],'clock',{'data-purpose':['cancelled','no-show'].includes(v.status)?'rebook':''}):row('Chọn lịch khám đầu tiên','Bắt đầu từ hồ sơ của bạn','C1','calendar')}${row('Thông báo mới',s.notifications.filter(n=>!n.read).length+' thông báo chưa đọc','K1','bell')}${row('Nhờ phòng khám hỗ trợ','Hỏi về lịch hẹn hoặc yêu cầu gọi lại','K5','phone')}</div>`,'','clock');
        body+=section(VI.layout.services,`<div class="service-grid bento-grid">${row(C.book,VI.layout.bookingHint,'C1','calendar')}${row(VI.layout.aftercare,T.careLead,'I1','heart-pulse')}${row('Kết quả khám','Xem các lượt khám đã hoàn tất','K3','document-check')}${row(T.help,T.helpLead,'K5','phone')}</div>`,'service-section','heart-pulse');
        break;
      }
      case 'C1':
        body = form(
          'patient',
          `<section class="patient-group"><div class="group-heading"><h2>${esc(VI.layout.savedProfiles)}</h2><span>${s.profiles.length}</span></div>` +
          choices(C.patient, s.profiles.map((x) => [
            x.id, x.name,
            x.relation === 'self' ? T.self : x.canViewResults ? VI.layout.sharedProfile : T.permission,
            VI.layout.dobLabel + ' · ' + (x.dob ? x.dob.split('-').reverse().join('/') : C.notProvided),
          ]), d?.patientId, nav(T.add, 'K2', 'secondary add-relative-inline')) + '</section>',
          C.continue,
        );
        break;
      case 'C2':
        body =
          form(
            'reason',
            textarea('reason', T.label, d?.reason || '', {
              maxlength: '1200',
              required: 'required',
            }) + `<p class="hint">${esc(T.hint)}</p><div class="symptom-chips horizontal-rail" role="group" aria-label="Gợi ý nội dung">${['Đau đầu','Ho, đau họng','Khó ngủ','Khám định kỳ'].map(text=>btn(text,'reason-chip',{'data-value':text},'secondary')).join('')}</div>` + levels('feeling') + `<details class="history-disclosure"><summary>${esc(C.medicalHistory)}</summary>${textarea('medicalHistory',C.medicalHistory,d?.medicalHistory||'')}<p class="hint">${esc(C.historyHint)}</p></details>`,
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
            ),
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
                ['onsite', C.onsite, 'Gặp trực tiếp · Thuận tiện thăm khám và xét nghiệm', C.unknownFee],
                ['online', C.online, 'Gặp qua video · Không cần di chuyển đến phòng khám', C.unknownFee],
              ],
              d?.mode,
            ),
          ) + `<details class="mode-comparison"><summary>So sánh hai cách khám</summary><div class="comparison-grid"><div><strong>Tại phòng khám</strong><p>Thăm khám trực tiếp, thực hiện chỉ định tại cơ sở.</p></div><div><strong>Qua video</strong><p>Chuẩn bị thiết bị, đường truyền và không gian riêng tư.</p></div></div><p>${esc(T.note)}</p></details>`;
        break;
      case 'C7':
        body = doctorCard() + (d?.free ? note(T.free) : '') + slotForm(s);
        break;
      case 'C8':
        body =
          card(`<div class="ticket-head">${I('calendar',24)}<strong>Thông tin đặt lịch</strong></div>`+(d?details(s,d):''), 'booking-ticket') + note('Phòng khám sẽ thông báo khoản thu trước khi bạn thanh toán.') +
          nav(T.edit, 'C2', 'text') +
          form('booking', check('consent', T.consent), T.send) +
          (s.request?.status === 'unknown'
            ? btn(T.verify, 'resolve-unknown', {}, 'primary')
            : '');
        break;
      case 'C9':
        body = v
          ? `<div class="request-received">${I('document-check', 30)}<div><strong>${esc(VI.layout.requestSent)}</strong><p>${esc(VI.layout.requestPending)}</p></div></div>` + card(status(v) + details(s, v)) + nav(C.viewVisit, 'D2', 'primary')
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
        const next=M.nextAction(v);
        const management=(M.TRANSITIONS[v.status]||[]).includes('cancelled')?`<div class="appointment-tools" role="group" aria-label="Điều chỉnh lịch hẹn">${nav(T.change,'D3','secondary change-visit')}${nav(T.cancel,'D4','secondary cancel-visit')}</div>`:'';
        body=visitHero(v)+card(`${status(v)}<span class="eyebrow">${esc(C.owner)}</span><h2>${esc(VI.statuses[v.status][1])}</h2>${v.reviewReason?`<p>${esc(v.reviewReason)}</p>`:''}${nav(VI.actions[next[1]],next[0],'primary',{'data-purpose':['cancelled','no-show'].includes(v.status)?'rebook':''})}`,'next-step');
        if(v.mode==='online') {
          body+=card(`<span class="eyebrow">Thời gian đến lịch hẹn</span><strong class="countdown" data-countdown="${esc(v.date+'T'+v.slot+':00+07:00')}">Theo giờ hẹn</strong><div class="online-checklist">${[['video','Thiết bị','Kiểm tra trước khi vào'],['heart-pulse','Đường truyền','Chọn mạng ổn định'],['lock','Phòng khám','Mở khi phòng khám sẵn sàng']].map(([icon,title,hint])=>`<div>${I(icon,21)}<strong>${title}</strong><small>${hint}</small></div>`).join('')}</div>`,'online-preparation');
        } else {
          body+=section('Hành trình khám',visitJourney(v),'journey-section','clock')+card(`<div class="mini-map" role="img" aria-label="Địa chỉ cơ sở khám chưa được phòng khám cung cấp">${I('map-pin',32)}<span>Địa điểm khám</span></div><h2>Địa chỉ phòng khám</h2><p>${esc(C.notProvided)}</p><small>Xem hướng dẫn trước khi di chuyển.</small>`,'location-card');
        }
        body+=`<details class="ticket"><summary>${I('document',18)} Thông tin và mã lượt khám</summary>${details(s,v)}${qrCard(v)}</details>`;
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
        body += section(C.history, timeline(v)) + management;
        break;
      }
      case 'D3':
        body=card(`<span class="eyebrow">Lịch hiện tại</span><strong>${esc(v.slot)} · ${esc(dateText(v))}</strong>`)+section('Bạn muốn chuyển sang ngày nào?',`<div class="reschedule-dates">${[1,2,3].map(offset=>btn(dateText({date:M.localDate(offset)}),'rebook',{'data-purpose':'reschedule','data-date':M.localDate(offset)},'secondary')).join('')}</div>`,'','calendar')+btn(T.cta,'rebook',{'data-purpose':'reschedule'},'primary');
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
        body=qrCard(v)+stats([['Chưa có','Số thứ tự'],['Chưa có','Thời gian chờ']])+note('Lễ tân sẽ cung cấp số thứ tự và thời gian dự kiến sau khi tiếp nhận bạn.')+btn(T.cta,'arrive',{},'primary');
        break;
      case 'E3':
        body=card(`<div class="queue-orbit">${I('clock',42)}</div><span class="eyebrow">Trạng thái tiếp nhận</span><h2>${esc(VI.statuses[v.status][0])}</h2><p>${esc(VI.statuses[v.status][1])}</p><small>Chưa có số người chờ và thời gian dự kiến.</small>`,'queue-hero')+visitJourney(v)+doctorCard()+note(T.note)+nav(C.viewVisit,'D2');
        break;
      case 'F1':
        body=labProgress(l?.status)+(v.labs.length?`<div class="lab-list">${v.labs.map(x=>`<button type="button" class="lab-card row" data-action="go" data-to="F2" data-lab="${esc(x.id)}"><span class="row-icon">${I('document-check')}</span><span class="row-text"><strong>${esc(x.name)}</strong><small>${x.appointmentDate?esc(x.appointmentDate+' · '+(x.appointmentTime||'')):'Chưa có giờ thực hiện'}</small>${chip(VI.labs[x.status],x.status==='reviewed'?'success':'info')}</span>${I('chevron-right',18)}</button>`).join('')}</div>`:empty(T.empty,T.emptyLead))+nav(C.returnVisit,'D2');
        break;
      case 'F2':
        body = labProgress(l.status) +
          card(
            `<h2 class="card-heading">${I('document',24)}<span>${esc(l.name)}</span></h2>${chip(VI.labs[l.status])}<p>${esc(l.timing === 'pre' ? VI.statuses['pre-lab'][0] : VI.screen.H1.labs)}</p>`,
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
            `<h2 class="card-heading">${I('document-check',24)}<span>${esc(l.file.name)}</span></h2><p>${esc(VI.labs[l.status])}</p>`,
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
        body = `<div class="call-stage"><div class="call-banner"><span class="live-dot"></span>${esc(T.heading)}</div><div class="remote-person"><span class="call-avatar">${I('user', 60)}</span><h1 id="screen-title" tabindex="-1">${esc('Phòng khám CareFlow')}</h1></div><div class="self-video">${I(u.camera ? 'video' : 'lock', 24)}</div><p>${esc(T.note)}</p><div class="call-controls">${btn(u.mic ? T.micOn : T.micOff, 'mic', {}, 'call-control')}${btn(u.camera ? T.camOn : T.camOff, 'camera', {}, 'call-control')}${btn(T.end, 'leave-call', {}, 'danger')}</div><details class="call-drawer"${u.callDrawerOpen ? ' open' : ''}><summary>${I('document',18)}Trao đổi và ghi chú ${I('chevron-right',16)}</summary><div class="call-tabs" role="group" aria-label="Nội dung trong buổi khám">${btn('Trao đổi','call-tab',{'data-tab':'chat'},u.callTab==='chat'?'selected':'text')}${btn('Ghi chú riêng','call-tab',{'data-tab':'notes'},u.callTab!=='chat'?'selected':'text')}</div><div class="call-notes"${u.callTab!=='chat'?' hidden':''}>${s.messages.filter(x=>x.visitId===v.id).map(x=>`<p>${esc(x.text)}</p>`).join('')||'<p>Chưa có nội dung được chia sẻ.</p>'}</div><div${u.callTab==='chat'?' hidden':''}>${form('call-note',textarea('callNote','Ghi chú riêng',u.callNotes?.[v.id]||''),'Lưu ghi chú','secondary')}</div></details></div>`;
        break;
      case 'G5':
        body =
          (v.communication.callback === 'pending' ? note(C.callback) : '') +
          note(T.lead, 'warning') +
          btn(T.wait, 'callback', {}, 'primary') +
          `<div class="connection-options">` + btn(T.online, 'rebook', {
            'data-purpose': 'online-retry',
            'data-mode': 'online',
          }) +
          btn(T.onsite, 'rebook', {
            'data-purpose': 'convert-onsite',
            'data-mode': 'onsite',
          }) + '</div>';
        break;
      case 'H1':
        body=stats([[v.summary?1:0,'Tài liệu đã chia sẻ'],[v.labs.filter(x=>['available','awaiting-review','reviewed'].includes(x.status)).length,'Kết quả'],[['unpaid','deferred','transfer-pending','counter-pending','pharmacy-pending'].includes(v.payment.status)?1:0,'Khoản chờ thu']])+card(status(v)+`<p>${esc(M.profile(s,v.patientId)?.name)} · ${esc(dateText(v))}</p>`,'aftercare-hero')+nav(T.pay,'H2','primary')+(v.lockedAt?note(C.signed):'')+`<div class="list bento-grid">${row(T.summary,'','H6','pill')}${row(T.labs,'','F1','document-check')}${row('Thanh toán',VI.payments[v.payment.status],'H2','document')}${row(T.followup,'','J1','calendar')}${row(T.care,'','I1','heart-pulse')}</div>`;
        break;
      case 'H2':
        body=card(`<span class="eyebrow">${esc(C.fee)}</span><h2>${esc(C.unknownFee)}</h2>${chip(VI.payments[v.payment.status])}`,'payment-total')+note(T.note);
        if(['unpaid','deferred'].includes(v.payment.status)) body+=`<section class="payment-methods" aria-label="Chọn cách thanh toán">${btn(T.counter,'payment',{'data-status':'counter-pending'},'primary method-card')}${nav(T.transfer,'H4','secondary method-card')}${btn(T.pharmacy,'payment',{'data-status':'pharmacy-pending'},'secondary method-card')}</section>`+nav(T.later,'H3','text');
        body+=section('Lịch sử giao dịch',v.payment.history.length?`<ol class="payment-history">${v.payment.history.map(item=>`<li>${I('document-check',18)}<div><strong>${esc(VI.payments[item.status])}</strong><small>${esc(new Date(item.at).toLocaleString('vi-VN'))}</small></div></li>`).join('')}</ol>`:'<p>Chưa có giao dịch được ghi nhận.</p>','','clock')+nav(T.receipt,'H5');
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
          section(T.medicine, card(`<p>${esc(C.noClinical)}</p><div class="medication-times" aria-label="Chưa có lịch dùng thuốc">${['Sáng','Trưa','Tối'].map(label=>`<span>${I('clock',14)}${label} · Chưa có chỉ định</span>`).join('')}</div>`), '', 'pill') +
          `<details class="care-instructions"><summary>${I('heart-pulse',20)}${esc(T.instructions)}</summary><p>${esc(C.noClinical)}</p></details>` +
          nav(T.question, 'I1', 'primary') +
          nav(T.followup, 'J1');
        break;
      case 'H7':
        body = `<div class="segments" role="group" aria-label="Lọc kết quả">${btn('Mới','result-filter',{'data-filter':'new'},u.resultFilter==='reviewed'?'text':'selected')}${btn('Đã xem','result-filter',{'data-filter':'reviewed'},u.resultFilter==='reviewed'?'selected':'text')}</div>` + (v.labs.filter(x=>u.resultFilter==='reviewed'?x.status==='reviewed':x.status!=='reviewed')
            .map((x) =>
              row(x.name, VI.labs[x.status], 'F2', 'document', {
                'data-lab': x.id,
              }),
            )
            .join('') || empty('Chưa có kết quả trong mục này','Kết quả sẽ xuất hiện khi phòng khám cập nhật.')) +
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
          `<div class="list care-entry-grid">${['medicine', 'question', 'symptoms'].map((k) => row(T[k], T[k + 'Hint'], 'I2', k === 'medicine' ? 'pill' : 'document', { 'data-reason': k })).join('')}${row(T.tracking, '', 'I3', 'heart-pulse')}${row(T.referral, '', 'I4', 'document')}${row(T.messages, '', 'I5', 'phone')}</div>`;
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
              (u.reportReason === 'symptoms' ? levels('symptomLevel')+check('urgent', T.urgent) : '') +
              note(T.note, 'warning'),
            T.cta,
          );
        break;
      case 'I3': {
        const entries=s.tracking.filter(x=>x.visitId===v.id);
        body=careProgress(v)+section('Nhật ký theo dõi',entries.length?`<ol class="care-journal">${entries.map(x=>`<li><span>${I('heart-pulse',17)}</span><div><time>${esc(new Date(x.at).toLocaleDateString('vi-VN'))}</time><p>${esc(x.text)}</p></div></li>`).join('')}</ol>`:empty(T.empty,'Ghi lại cảm nhận và những thay đổi hôm nay.'),'','clock')+form('tracking',levels('dailyFeeling')+textarea('tracking',T.text),T.cta)+nav(T.contact,'I5');
        break;
      }
      case 'I4':
        body = `<ol class="referral-steps" aria-label="Tiến độ chuyên khoa">${['Được giới thiệu','Đã khám chuyên khoa','Đã phản hồi'].map((label,i)=>`<li${i===0?' aria-current="step"':''}><span>${i+1}</span><small>${label}</small></li>`).join('')}</ol>` + careProgress(v) + (v.care.referral
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
          `<div class="conversation" role="log" aria-label="Nội dung trao đổi">${
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
        body=card(`<span class="eyebrow">Lần khám trước</span><h2>${esc(dateText(v))}</h2><p>${esc(M.profile(s,v.patientId)?.name)} · ${esc(v.reason)}</p>`,'followup-hero')+doctorCard()+note(s.settings.reminders?'Bạn đã bật nhận nhắc lịch. Kênh liên hệ sẽ được phòng khám xác nhận.':'Nhắc lịch đang tắt. Bạn có thể bật trong Cài đặt.')+section(T.suggestion,`<p>${esc(C.notProvided)}</p>`)+btn(T.cta,'rebook',{'data-purpose':'followup'},'primary');
        break;
      case 'K1': {
        const today=M.localDate();
        const groups=[['Hôm nay',n=>n.at&&new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(n.at))===today],['Trước đó',n=>n.at&&new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(n.at))!==today],['Thông báo khác',n=>!n.at]];
        body=s.notifications.length?groups.map(([label,match])=>{const items=s.notifications.filter(match);return items.length?section(label,items.map(n=>`<button class="notification row ${n.read?'read':''}" type="button" data-action="notification" data-id="${esc(n.id)}"><span class="notification-dot" aria-label="${n.read?'Đã đọc':'Chưa đọc'}" role="img"></span><span class="row-text"><strong>${esc(n.title)}</strong><small>${esc(n.body)}</small><span class="inline-link">Mở cập nhật ${I('arrow-right',14)}</span></span></button>`).join(''),'notification-group','bell'):'';}).join(''):empty(T.empty,'');
        body+=note(T.note);
        break;
      }
      case 'K2':
        body=card(`<div class="profile-row"><span class="avatar">${root.CareFlowAvatar(p?.id,64)}</span><div><span class="eyebrow">Tài khoản của bạn</span><h2>${esc(p?.name)}</h2><p>${esc(p?.dob?.split('-').reverse().join('/'))}</p>${chip('Hồ sơ cá nhân')}</div></div>`,'profile-hero')+`<div class="profile-bento bento-grid">${row('Người đi khám',s.profiles.length+' hồ sơ đã lưu','K2','user',{'data-section':'saved-profiles'})}<details class="insurance-tile"><summary>${I('shield',24)}<strong>Bảo hiểm</strong><small>Chưa có thông tin</small></summary><p>Thông tin bảo hiểm sẽ do phòng khám kiểm tra khi tiếp nhận.</p></details>${row('Kết quả','Xem các lượt đã khám','K3','document-check')}${row('Đơn thuốc','Tra lại theo lượt khám','K3','pill')}</div>`+section('Người đi khám',`<div id="saved-profiles">${s.profiles.map(x=>card(`<div class="profile-row"><span class="avatar">${root.CareFlowAvatar(x.id,44)}</span><div><h2>${esc(x.name)}</h2><p class="entry-date">${I('calendar',14)}${esc(x.dob?.split('-').reverse().join('/'))}</p>${chip(x.canViewResults?T.view:T.bookOnly)}</div></div>`)).join('')}</div>`,'profile-list','user')+`<details class="add-relative"><summary>${I('plus',20)}${esc(T.add)}</summary>${form('relative',field('name',T.name)+field('dob',T.dob,'','date',{max:M.localDate()}),T.save)}</details>`+`<div class="settings-list">${row(T.history,'Tra lại lịch sử khám','K3','clock')}${row(T.settings,'Chữ lớn, riêng tư và nhắc lịch','K4','settings')}</div>`;
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
          `<div class="support-channels bento-grid">${row('Yêu cầu gọi lại','Chọn giờ thuận tiện','K5','phone',{'data-section':'callback'})}${row('Nhắn tin',VI.screen.I1.lead,'I1','document')}<div class="unavailable-channel">${I('phone',22)}<strong>Zalo</strong><small>Phòng khám chưa cung cấp kênh liên hệ</small></div></div>` +
          form('support', textarea('support', T.text), T.message, 'secondary') +
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
    const personContext = (s.authenticated &&
      /[C-J]/.test(id[0]) &&
      !['C1', 'C4', 'I1'].includes(id)
        ? context(s, id.startsWith('C') && id !== 'C9' ? null : v)
        : '');
    if (['D3','D4','H3'].includes(id)) return `<div class="sheet-background" aria-hidden="true" inert>${visitHero(v)}${card(details(s,v))}</div><button class="sheet-scrim" type="button" data-action="go" data-to="${id==='H3'?'H2':'D2'}" aria-label="Đóng bảng thao tác"></button><section class="route-sheet" role="dialog" aria-modal="true" aria-labelledby="screen-title"><span class="sheet-handle" aria-hidden="true"></span>${go('Đóng',id==='H3'?'H2':'D2','text sheet-close')}${intro}${body}</section>`;
    if (id === 'B1') return `<div class="screen-masthead home-masthead">${intro}</div>${body}`;
    if (id.startsWith('A') || ['G3','G4'].includes(id)) return intro + personContext + body;
    const groups = {
      C: ['ĐẶT LỊCH KHÁM', 'calendar'], D: ['LỊCH KHÁM CỦA BẠN', 'calendar'],
      E: ['ĐẾN PHÒNG KHÁM', 'map-pin'], F: ['XÉT NGHIỆM & KẾT QUẢ', 'document-check'],
      G: ['KHÁM ONLINE', 'video'], H: ['THÔNG TIN SAU KHÁM', 'document'],
      I: ['CHĂM SÓC SAU KHÁM', 'heart-pulse'], J: ['HẸN GẶP LẠI BÁC SĨ', 'calendar'],
      K: [id === 'K5' ? 'PHÒNG KHÁM ĐỒNG HÀNH' : 'THÔNG TIN CỦA BẠN', id === 'K5' ? 'phone' : 'user'],
    };
    const [label, icon] = groups[id[0]] || ['CAREFLOW', 'heart-pulse'];
    const tip = id === 'D2' ? null : VI.layout.tips[id];
    return `<div class="screen-masthead"><div class="masthead-label"><span>${esc(label)}</span><span class="masthead-icon" aria-hidden="true">${I(icon,24)}</span></div>${intro}${s.authenticated && s.draft ? bookingProgress(id) : ''}${personContext}</div>${tip ? id === 'C1' ? `<aside class="selection-reminder" role="note">${I('shield',21)}<div><strong>${esc(tip[0])}</strong><p>${esc(tip[1])}</p></div></aside>` : `<details class="ux-tip"><summary>${I('info',18)}<span>${esc(tip[0])}</span>${I('chevron-right',16)}</summary><p>${esc(tip[1])}</p></details>` : ''}${body}`;
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
    form,
    choices,
    render,
    context,
    modeText,
  };
})(window);
