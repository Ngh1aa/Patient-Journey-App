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
    { id: 'M1', title: 'Đơn thuốc', route: '/medications', tab: 'B1' },
    { id: 'M3', title: 'Yêu cầu cấp lại thuốc', route: '/medications/:rxId/refill', tab: 'B1' },
    { id: 'M2', title: 'Chi tiết thuốc', route: '/medications/:rxId', tab: 'B1' },
    { id: 'K6', title: 'Sửa thông tin cá nhân', route: '/profile/edit', tab: 'K2' },
    { id: 'K7', title: 'Người thân', route: '/profile/family', tab: 'K2' },
    { id: 'K8', title: 'Thêm người thân', route: '/profile/family/new', tab: 'K2' },
    { id: 'K10', title: 'Sửa hồ sơ người thân', route: '/profile/family/:personId/edit', tab: 'K2' },
    { id: 'K9', title: 'Hồ sơ người thân', route: '/profile/family/:personId', tab: 'K2' },
    { id: 'K11', title: 'Bảo hiểm', route: '/profile/insurance', tab: 'K2' },
    { id: 'K12', title: 'Sửa thông tin bảo hiểm', route: '/profile/insurance/edit', tab: 'K2' },
    { id: 'T1', title: 'Yêu cầu hỗ trợ', route: '/support/tickets', tab: 'K5' },
    { id: 'T3', title: 'Tạo yêu cầu hỗ trợ', route: '/support/tickets/new', tab: 'K5' },
    { id: 'T2', title: 'Chi tiết yêu cầu', route: '/support/tickets/:ticketId', tab: 'K5' },
  ];
  const byId = Object.fromEntries(SCREENS.map((x) => [x.id, x]));
  for (const x of SCREENS) if (!M.SCREENS.some((y) => y.id === x.id)) M.SCREENS.push({ id: x.id, title: x.title, route: x.route, phase: 'Demo' });
  const has = (id) => !!byId[id];
  const tabFor = (id) => byId[id]?.tab;

  /* ---------- shared vocabulary ---------- */
  const RELATIONS = [['mother', 'Mẹ'], ['father', 'Bố'], ['spouse', 'Vợ/Chồng'], ['child', 'Con'], ['sibling', 'Anh/Chị/Em'], ['relative', 'Người thân khác']];
  const relationLabel = (r) => r === 'self' ? 'Bản thân' : (RELATIONS.find(([k]) => k === r)?.[1] || 'Người thân');
  const TOPICS = ['Đổi hoặc hủy lịch', 'Thông tin hồ sơ', 'Thanh toán', 'Kết quả', 'Đơn thuốc', 'Khám trực tuyến', 'Khác'];
  const TICKET_STATUS = { open: ['Chờ phòng khám', 'warning'], answered: ['Phòng khám đã trả lời', 'info'], closed: ['Đã đóng', 'neutral'] };
  const REFILL_STATUS = { requested: ['Đã gửi yêu cầu cấp lại', 'warning'], reviewed: ['Phòng khám đã xem xét', 'success'], cancelled: ['Đã hủy yêu cầu', 'neutral'] };
  const INSURANCE_TYPES = [['bhyt', 'Bảo hiểm y tế (BHYT)'], ['private', 'Bảo hiểm sức khỏe tư nhân']];
  const today = () => M.localDate();
  const dmy = (d) => d ? d.split('-').reverse().join('/') : 'Chưa cập nhật';
  const stamp = (iso) => { try { return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(iso)); } catch { return ''; } };
  const pill = (label, tone = 'info') => `<span class="chip ${tone}" data-cf-component="status" data-cf-tone="${tone}">${I(tone === 'success' ? 'check-circle' : tone === 'warning' ? 'clock' : tone === 'danger' ? 'warning' : 'info', 16)}${esc(label)}</span>`;
  const note = (text, type = 'info') => `<div class="note ${type}">${I(type === 'danger' || type === 'warning' ? 'warning' : 'info', 19)}<p>${esc(text)}</p></div>`;
  const button = (label, action, data = {}, variant = 'secondary', icon = '') => `<button type="button" class="btn ${variant}" ${UI.buttonAttrs(variant)} data-action="${action}"${attrs(data)}>${icon ? I(icon, 18) : ''}<span>${esc(label)}</span></button>`;
  const nav = (label, to, params = {}, variant = 'secondary', icon = '') => button(label, 'p-nav', { 'data-to': to, ...Object.fromEntries(Object.entries(params).map(([k, v]) => ['data-p-' + k, v])) }, variant, icon);
  const prow = (title, hint, to, params = {}, icon = 'document', trailing = '') => `<button type="button" class="row cf-product-row" ${UI.cardAttrs('row')} data-action="p-nav" data-to="${to}"${attrs(Object.fromEntries(Object.entries(params).map(([k, v]) => ['data-p-' + k, v])))}><span class="row-icon">${I(icon)}</span><span class="row-text"><strong>${esc(title)}</strong>${hint ? `<small>${esc(hint)}</small>` : ''}${trailing ? `<span class="cf-row-badges">${trailing}</span>` : ''}</span><span class="row-arrow">${I('chevron-right', 18)}</span></button>`;
  const empty = (title, lead, action = '') => `<div class="empty" data-cf-card="surface" data-cf-state="empty">${UI.illustration('result')}<h2>${esc(title)}</h2>${lead ? `<p>${esc(lead)}</p>` : ''}${action}</div>`;
  const facts = (rows) => `<dl class="details" data-cf-component="facts">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v || 'Chưa cập nhật')}</dd></div>`).join('')}</dl>`;
  const section = (title, html, icon = 'document', extra = '') => `<section class="section ${extra}" ${UI.cardAttrs('section')}><h2 class="section-heading">${I(icon, 18)}<span>${esc(title)}</span></h2>${html}</section>`;
  const segmented = (key, value, options) => `<div class="cf-segmented" role="group" aria-label="Lọc danh sách">${options.map(([v, label, count]) => `<button type="button" data-action="p-filter" data-key="${key}" data-value="${v}" aria-pressed="${v === value}">${esc(label)}${count !== undefined ? `<span>${count}</span>` : ''}</button>`).join('')}</div>`;

  /* ---------- form helpers with inline validation ---------- */
  const fieldMsg = (id) => `<p class="field-message" id="${id}-error" data-error-for="${id}" aria-live="polite"></p>`;
  const input = (id, label, value = '', type = 'text', extra = {}, hint = '') => `<div class="field" data-field="${id}"><label for="${id}"><span>${esc(label)}</span>${extra.required ? '<em class="cf-required" aria-hidden="true">*</em>' : ''}</label>${hint ? `<small class="field-hint" id="${id}-hint">${esc(hint)}</small>` : ''}<input id="${id}" name="${id}" type="${type}" value="${esc(value)}" aria-describedby="${hint ? id + '-hint ' : ''}${id}-error"${attrs(extra)}>${fieldMsg(id)}</div>`;
  const area = (id, label, value = '', extra = {}, hint = '') => `<div class="field" data-field="${id}"><label for="${id}"><span>${esc(label)}</span>${extra.required ? '<em class="cf-required" aria-hidden="true">*</em>' : ''}</label>${hint ? `<small class="field-hint" id="${id}-hint">${esc(hint)}</small>` : ''}<textarea id="${id}" name="${id}" rows="${extra.rows || 4}" aria-describedby="${hint ? id + '-hint ' : ''}${id}-error"${attrs({ ...extra, rows: undefined })}>${esc(value)}</textarea>${fieldMsg(id)}</div>`;
  const select = (id, label, value, options, extra = {}) => `<div class="field" data-field="${id}"><label for="${id}"><span>${esc(label)}</span>${extra.required ? '<em class="cf-required" aria-hidden="true">*</em>' : ''}</label><select id="${id}" name="${id}" aria-describedby="${id}-error"${attrs(extra)}>${options.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(value) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>${fieldMsg(id)}</div>`;
  const radios = (id, legend, value, options) => `<fieldset class="cf-radio-set" data-field="${id}" aria-describedby="${id}-error"><legend>${esc(legend)}<em class="cf-required" aria-hidden="true">*</em></legend>${options.map(([v, l]) => `<label class="cf-radio"><input type="radio" name="${id}" value="${esc(v)}"${v === value ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('')}${fieldMsg(id)}</fieldset>`;
  const checkbox = (id, label, checked = false) => `<div class="field cf-check-field" data-field="${id}"><label class="check"><input id="${id}" name="${id}" type="checkbox" aria-describedby="${id}-error"${checked ? ' checked' : ''}><span>${esc(label)}</span></label>${fieldMsg(id)}</div>`;
  const pform = (name, html, cta, { cancel = '', variant = 'primary' } = {}) => `<form data-form="${name}" data-product-form novalidate><div class="form-body">${html}</div><div class="form-actions"><div class="cf-form-alert" data-form-alert role="alert"></div><p class="field-error" id="form-error" role="alert"></p><button class="btn ${variant}" ${UI.buttonAttrs(variant, 'lg')} type="submit"><span>${esc(cta)}</span>${I('check-circle', 20)}</button>${cancel}</div></form>`;

  const RULES = {
    name: (v) => !v.trim() ? 'Nhập họ và tên.' : v.trim().length < 2 ? 'Họ và tên cần ít nhất 2 ký tự.' : v.trim().length > 60 ? 'Họ và tên tối đa 60 ký tự.' : /[0-9@#$%^&*_=+<>{}[\]]/.test(v) ? 'Họ và tên chỉ gồm chữ cái và khoảng trắng.' : '',
    dob: (v) => !v ? 'Chọn ngày sinh.' : !M.validDate(v) ? 'Ngày sinh chưa hợp lệ.' : v > today() ? 'Ngày sinh không thể ở tương lai.' : v < '1900-01-01' ? 'Ngày sinh chưa hợp lệ.' : '',
    phone: (v) => !v.trim() ? 'Nhập số điện thoại.' : !/^0\d{9}$/.test(v.replace(/\s/g, '')) ? 'Số điện thoại gồm 10 chữ số và bắt đầu bằng 0.' : '',
    phoneOptional: (v) => v.trim() && !/^0\d{9}$/.test(v.replace(/\s/g, '')) ? 'Số điện thoại gồm 10 chữ số và bắt đầu bằng 0.' : '',
    email: (v) => v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Email chưa đúng định dạng, ví dụ ten@example.com.' : '',
    max: (n) => (v) => v.length > n ? `Tối đa ${n} ký tự.` : '',
    required: (msg) => (v) => !String(v).trim() ? msg : '',
  };
  const VALIDATORS = {
    'profile-edit': { name: RULES.name, dob: RULES.dob, phone: RULES.phone, email: RULES.email, address: RULES.max(120), allergies: RULES.max(200), medicalHistory: RULES.max(500) },
    'family-edit': { name: RULES.name, dob: RULES.dob, relation: RULES.required('Chọn mối quan hệ.'), phone: RULES.phoneOptional },
    insurance: {
      type: RULES.required('Chọn loại bảo hiểm.'),
      number: (v, f) => { const x = v.trim().toUpperCase(); if (!x) return 'Nhập số thẻ bảo hiểm.'; if (f.get('type') === 'bhyt' && !/^[A-Z]{2}\d{13}$/.test(x)) return 'Mã thẻ BHYT gồm 2 chữ cái và 13 chữ số (15 ký tự).'; if (f.get('type') !== 'bhyt' && !/^[A-Z0-9-]{6,20}$/.test(x)) return 'Số hợp đồng gồm 6–20 chữ cái, chữ số hoặc dấu gạch.'; return ''; },
      holder: RULES.name,
      facility: (v, f) => f.get('type') === 'bhyt' && !v.trim() ? 'Nhập nơi đăng ký khám chữa bệnh ban đầu.' : v.length > 120 ? 'Tối đa 120 ký tự.' : '',
      validFrom: (v, f) => v && !M.validDate(v) ? 'Ngày bắt đầu chưa hợp lệ.' : v && f.get('validTo') && v >= f.get('validTo') ? 'Ngày bắt đầu phải trước ngày hết hạn.' : '',
      validTo: (v) => !v ? 'Chọn ngày hết hạn.' : !M.validDate(v) ? 'Ngày hết hạn chưa hợp lệ.' : v <= today() ? 'Thẻ đã hết hạn. Hãy nhập thẻ còn hiệu lực.' : '',
    },
    refill: { supply: RULES.required('Chọn lượng thuốc bạn còn.'), pickup: RULES.required('Chọn cách nhận thông tin.'), refillNote: RULES.max(300), ack: (v) => v !== 'on' ? 'Hãy xác nhận trước khi gửi.' : '' },
    'ticket-new': { topic: RULES.required('Chọn chủ đề.'), subject: (v) => !v.trim() ? 'Nhập tiêu đề ngắn.' : v.trim().length < 5 ? 'Tiêu đề cần ít nhất 5 ký tự.' : v.length > 80 ? 'Tiêu đề tối đa 80 ký tự.' : '', body: (v) => !v.trim() ? 'Nhập nội dung bạn cần hỗ trợ.' : v.trim().length < 10 ? 'Nội dung cần ít nhất 10 ký tự để phòng khám hiểu rõ.' : v.length > 1000 ? 'Tối đa 1000 ký tự.' : '' },
    'ticket-reply': { reply: (v) => !v.trim() ? 'Nhập nội dung trả lời.' : v.length > 1000 ? 'Tối đa 1000 ký tự.' : '' },
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
      if (summary) summary.textContent = first ? 'Vui lòng kiểm tra các mục được đánh dấu.' : '';
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
    if (gate.state === 'error') return `<div class="screen-masthead">${intro}</div><div class="cf-load-error" data-cf-state="error" role="alert">${I('warning', 28)}<h2>Chưa tải được dữ liệu</h2><p>Kết nối với máy chủ demo bị gián đoạn. Dữ liệu của bạn vẫn an toàn trong phiên này.</p>${button('Thử lại', 'p-retry-load', {}, 'primary', 'refresh')}</div>`;
    return `<div class="screen-masthead">${intro}</div><div class="cf-skeleton" data-cf-state="loading" aria-busy="true" aria-label="Đang tải"><span class="sr-only">Đang tải dữ liệu…</span>${'<div class="cf-skeleton-card"><span></span><span></span><span></span></div>'.repeat(3)}</div>`;
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
    return { heading: 'Không tìm thấy', lead: '', body: `<div data-cf-state="not-found">${empty(title, lead, nav(backLabel, back, {}, 'primary'))}</div>` };
  }
  function medsList(s, u) {
    const all = rxFor(s), filter = u.rxFilter || 'active';
    const active = all.filter((r) => !rxEnded(r)), ended = all.filter(rxEnded);
    const list = filter === 'active' ? active : ended;
    const card = (r) => {
      const person = M.profile(s, r.patientId);
      const refill = r.refill && REFILL_STATUS[r.refill.status];
      return `<article class="cf-rx-card" ${UI.cardAttrs('surface')} data-rx="${esc(r.id)}"><button type="button" class="cf-rx-open" data-action="p-nav" data-to="M2" data-p-rx-id="${esc(r.id)}" ><span class="cf-rx-icon" aria-hidden="true">${I('pill', 24)}</span><span class="cf-rx-copy"><strong>${esc(r.name)}</strong><small>${esc(r.form)}, ${esc(r.quantity)}</small><small>${esc(person?.name || '')}</small><small>${esc(dmy(r.startDate))} – ${esc(dmy(r.endDate))}</small></span>${I('chevron-right', 18)}</button><div class="cf-rx-meta">${rxEnded(r) ? pill('Đã kết thúc', 'neutral') : pill('Đang dùng', 'success')}${refill ? pill(refill[0], refill[1]) : ''}</div></article>`;
    };
    return {
      heading: 'Đơn thuốc', lead: 'Thuốc bác sĩ đã kê trong các lượt khám của bạn và người thân được cấp quyền xem.',
      body: segmented('rxFilter', filter, [['active', 'Đang dùng', active.length], ['ended', 'Đã kết thúc', ended.length]]) +
        (list.length ? `<div class="cf-rx-list">${list.map(card).join('')}</div>` : empty(filter === 'active' ? 'Chưa có thuốc đang dùng' : 'Chưa có đơn thuốc đã kết thúc', filter === 'active' ? 'Đơn thuốc sẽ xuất hiện ở đây khi phòng khám chia sẻ sau buổi khám.' : 'Các đơn đã hết thời gian dùng sẽ được lưu ở đây.', nav('Xem lịch hẹn', 'D1'))) +
        note('Thông tin minh họa trong bản demo. Không tự thay đổi cách dùng thuốc; hãy hỏi bác sĩ hoặc dược sĩ khi cần.'),
    };
  }
  function medDetail(s, u) {
    const r = rxFor(s).find((x) => x.id === param('rxId'));
    if (!r) return notFound('Không tìm thấy đơn thuốc', 'Đơn thuốc này không tồn tại hoặc bạn chưa được cấp quyền xem.', 'M1', 'Về danh sách đơn thuốc');
    const person = M.profile(s, r.patientId), visit = s.visits.find((v) => v.id === r.visitId);
    const left = Math.max(0, (r.refillsAllowed || 0) - refillsUsed(r));
    let refill = '';
    if (r.refill?.status === 'requested') refill = `<div class="cf-refill-status">${pill(REFILL_STATUS.requested[0], 'warning')}<p>Gửi lúc ${esc(stamp(r.refill.at))}. Phòng khám sẽ xem xét và liên hệ qua ${esc(r.refill.pickup === 'call' ? 'điện thoại' : 'nhà thuốc phòng khám')}.</p>${r.refill.note ? `<p class="cf-quote">“${esc(r.refill.note)}”</p>` : ''}${button('Hủy yêu cầu cấp lại', 'rx-cancel-refill', { 'data-id': r.id }, 'text danger-text', 'cross')}</div>`;
    else if (r.refill?.status === 'reviewed') refill = `<div class="cf-refill-status">${pill(REFILL_STATUS.reviewed[0], 'success')}<p>Phòng khám đã xem xét yêu cầu lúc ${esc(stamp(r.refill.reviewedAt))}. Đây là mô phỏng; chưa có đơn thuốc mới nào được kê.</p></div>`;
    if (!rxEnded(r) && r.refill?.status !== 'requested') refill += left ? nav('Yêu cầu cấp lại thuốc', 'M3', { 'rx-id': r.id }, 'primary', 'refresh') + `<p class="hint">Còn ${left} lần có thể yêu cầu cấp lại cho đơn này.</p>` : note('Đơn này không còn lượt cấp lại. Hãy đặt lịch tái khám để bác sĩ đánh giá lại.');
    if (rxEnded(r)) refill += note('Đơn đã kết thúc. Nếu cần dùng tiếp, hãy hỏi phòng khám hoặc đặt lịch tái khám.') + nav('Hỏi phòng khám về đơn này', 'T3', { topic: 'Đơn thuốc', rx: r.id });
    return {
      heading: r.name, lead: `${r.form}, ${r.quantity}`,
      body: `<section class="card cf-rx-hero" ${UI.cardAttrs('tonal')}><span class="cf-rx-icon" aria-hidden="true">${I('pill', 28)}</span><div>${rxEnded(r) ? pill('Đã kết thúc', 'neutral') : pill('Đang dùng', 'success')}<p class="eyebrow">Mã đơn ${esc(r.id)}</p></div></section>` +
        section('Thông tin đơn', facts([['Người dùng thuốc', person?.name], ['Bác sĩ kê đơn', r.prescriber], ['Thời gian', dmy(r.startDate) + ' – ' + dmy(r.endDate)], ['Cách dùng', r.instructions]]) + (visit ? prow('Lượt khám ' + visit.id, dmy(visit.date) + ', ' + (visit.clinician?.name || ''), 'D2', { 'visit-id': visit.id }, 'calendar') : ''), 'pill') +
        section('Cấp lại thuốc', refill, 'refresh') +
        (r.refillHistory?.length ? section('Lịch sử yêu cầu', `<ol class="timeline">${r.refillHistory.slice().reverse().map((h) => `<li><span class="timeline-dot"></span><div><strong>${esc(REFILL_STATUS[h.status]?.[0] || h.status)}</strong><small>${esc(stamp(h.at))}</small></div></li>`).join('')}</ol>`, 'clock') : '') +
        note('Thông tin minh họa. Không dùng nội dung này để tự bắt đầu, dừng hay đổi liều thuốc.', 'warning'),
    };
  }
  function refillForm(s, u) {
    const r = rxFor(s).find((x) => x.id === param('rxId'));
    if (!r) return notFound('Không tìm thấy đơn thuốc', 'Không thể tạo yêu cầu cho đơn thuốc này.', 'M1', 'Về danh sách đơn thuốc');
    if (rxEnded(r) || r.refill?.status === 'requested') return { heading: 'Yêu cầu cấp lại thuốc', lead: r.name, body: note(r.refill?.status === 'requested' ? 'Đơn này đang có một yêu cầu chờ phòng khám xem xét.' : 'Đơn đã kết thúc nên không thể yêu cầu cấp lại.', 'warning') + nav('Xem chi tiết đơn', 'M2', { 'rx-id': r.id }, 'primary') };
    const f = u.forms.refill || {};
    return {
      heading: 'Yêu cầu cấp lại thuốc', lead: r.name + ', cho ' + (M.profile(s, r.patientId)?.name || ''),
      body: pform('refill',
        radios('supply', 'Bạn còn khoảng bao nhiêu thuốc?', f.supply || '', [['lt3', 'Còn dưới 3 ngày'], ['3to7', 'Còn 3–7 ngày'], ['out', 'Đã hết thuốc']]) +
        radios('pickup', 'Phòng khám liên hệ bạn qua', f.pickup || '', [['pharmacy', 'Nhà thuốc của phòng khám'], ['call', 'Gọi điện cho tôi']]) +
        area('refillNote', 'Ghi chú cho phòng khám (không bắt buộc)', f.refillNote || '', { maxlength: '300', rows: 3 }, 'Ví dụ: thời gian bạn có thể nhận điện thoại.') +
        checkbox('ack', 'Tôi hiểu yêu cầu cần bác sĩ xem xét và chưa phải là đơn thuốc mới.', f.ack === true),
        'Gửi yêu cầu', { cancel: button('Hủy', 'p-form-cancel', { 'data-form': 'refill', 'data-to': 'M2', 'data-p-rx-id': r.id }, 'text') }),
    };
  }
  function profileEdit(s, u) {
    const p = account(s);
    if (!p) return notFound('Chưa có hồ sơ', 'Hãy tạo hồ sơ trước khi chỉnh sửa.', 'K2', 'Về hồ sơ');
    const f = { ...p, ...(u.forms['profile-edit'] || {}) };
    return {
      heading: 'Sửa thông tin cá nhân', lead: 'Cập nhật thông tin để phòng khám liên hệ và chuẩn bị buổi khám chính xác.',
      body: pform('profile-edit',
        input('name', 'Họ và tên', f.name, 'text', { autocomplete: 'name', required: true, maxlength: '60' }) +
        input('dob', 'Ngày sinh', f.dob, 'date', { max: today(), required: true }) +
        input('phone', 'Số điện thoại', f.phone, 'tel', { inputmode: 'tel', autocomplete: 'tel', required: true }, '10 chữ số, ví dụ 0901234567.') +
        input('email', 'Email (không bắt buộc)', f.email, 'email', { autocomplete: 'email' }) +
        input('address', 'Địa chỉ liên hệ (không bắt buộc)', f.address, 'text', { autocomplete: 'street-address', maxlength: '120' }) +
        area('allergies', 'Dị ứng đã biết', f.allergies, { maxlength: '200', rows: 2 }, 'Ghi “Chưa ghi nhận” nếu bạn chưa biết mình dị ứng gì.') +
        area('medicalHistory', 'Ghi chú sức khỏe', f.medicalHistory, { maxlength: '500', rows: 3 }),
        'Lưu thay đổi', { cancel: button('Hủy', 'p-form-cancel', { 'data-form': 'profile-edit', 'data-to': 'K2' }, 'text') }),
    };
  }
  function familyList(s) {
    const people = s.profiles.filter((p) => p.relation !== 'self');
    return {
      heading: 'Người thân', lead: 'Quản lý hồ sơ của người thân để đặt lịch hộ khi cần.',
      body: (people.length ? `<div class="list cf-family-list">${people.map((p) => prow(p.name, relationLabel(p.relation) + ', sinh ' + dmy(p.dob), 'K9', { 'person-id': p.id }, 'user', p.canViewResults ? '' : `<span class="cf-row-tag">Chưa được xem kết quả</span>`)).join('')}</div>` : empty('Chưa có hồ sơ người thân', 'Thêm hồ sơ để đặt lịch và theo dõi lịch hẹn cho người thân.')) +
        nav('Thêm người thân', 'K8', {}, 'primary', 'plus'),
    };
  }
  function familyForm(s, u, editing) {
    const p = editing ? s.profiles.find((x) => x.id === param('personId') && x.relation !== 'self') : null;
    if (editing && !p) return notFound('Không tìm thấy hồ sơ', 'Hồ sơ người thân này không tồn tại hoặc đã bị xóa.', 'K7', 'Về danh sách người thân');
    const key = 'family-edit';
    const f = { name: '', dob: '', relation: '', phone: '', ...(p || {}), ...(u.forms[key] || {}) };
    return {
      heading: editing ? 'Sửa hồ sơ người thân' : 'Thêm người thân', lead: editing ? p.name : 'Thông tin cơ bản giúp phòng khám nhận đúng người đi khám.',
      body: pform(key,
        `<input type="hidden" name="personId" value="${esc(p?.id || '')}">` +
        input('name', 'Họ và tên', f.name, 'text', { required: true, maxlength: '60', autocomplete: 'off' }) +
        input('dob', 'Ngày sinh', f.dob, 'date', { max: today(), required: true }) +
        select('relation', 'Mối quan hệ với bạn', f.relation, [['', 'Chọn mối quan hệ'], ...RELATIONS], { required: true }) +
        input('phone', 'Số điện thoại riêng (không bắt buộc)', f.phone, 'tel', { inputmode: 'tel' }) +
        note('Quyền xem kết quả của người thân do phòng khám xác nhận, không đổi được trong ứng dụng.'),
        editing ? 'Lưu thay đổi' : 'Thêm hồ sơ', { cancel: button('Hủy', 'p-form-cancel', { 'data-form': key, 'data-to': editing ? 'K9' : 'K7', 'data-p-person-id': p?.id || '' }, 'text') }),
    };
  }
  function familyDetail(s) {
    const p = s.profiles.find((x) => x.id === param('personId') && x.relation !== 'self');
    if (!p) return notFound('Không tìm thấy hồ sơ', 'Hồ sơ người thân này không tồn tại hoặc đã bị xóa.', 'K7', 'Về danh sách người thân');
    const visits = s.visits.filter((v) => v.patientId === p.id).sort((a, b) => b.date.localeCompare(a.date));
    return {
      heading: p.name, lead: relationLabel(p.relation),
      body: section('Thông tin', facts([['Họ và tên', p.name], ['Ngày sinh', dmy(p.dob)], ['Mối quan hệ', relationLabel(p.relation)], ['Số điện thoại', p.phone || 'Chưa cập nhật'], ['Quyền xem kết quả', p.canViewResults ? 'Được xem' : 'Chưa được cấp quyền']]), 'user') +
        `<div class="cf-action-row">${nav('Sửa thông tin', 'K10', { 'person-id': p.id }, 'secondary', 'document')}${button('Đặt lịch cho người này', 'profile-book-relative', { 'data-id': p.id }, 'primary', 'calendar')}</div>` +
        section('Lịch hẹn', visits.length ? `<div class="list">${visits.map((v) => prow(v.slot + ' ngày ' + dmy(v.date), (v.clinician?.name || '') + ', ' + UI.status(v.status).label.toLocaleLowerCase('vi-VN'), 'D2', { 'visit-id': v.id }, 'calendar')).join('')}</div>` : `<p class="hint">Chưa có lịch hẹn cho người này.</p>`, 'calendar') +
        button('Xóa hồ sơ người thân', 'family-delete', { 'data-id': p.id }, 'text danger-text', 'cross'),
    };
  }
  function insuranceView(s) {
    const p = account(s), ins = p && s.insurance?.[p.id];
    if (!ins) return { heading: 'Bảo hiểm', lead: 'Thông tin bảo hiểm giúp phòng khám chuẩn bị thủ tục khi bạn đến khám.', body: empty('Chưa có thông tin bảo hiểm', 'Thêm thẻ BHYT hoặc bảo hiểm sức khỏe để phòng khám kiểm tra trước buổi khám.', nav('Thêm bảo hiểm', 'K12', {}, 'primary', 'plus')) };
    const expired = ins.validTo <= today(), soon = !expired && ins.validTo <= M.localDate(30);
    return {
      heading: 'Bảo hiểm', lead: 'Thông tin bạn đã khai báo. Phòng khám sẽ đối chiếu với thẻ gốc khi bạn đến khám.',
      body: `<section class="card cf-insurance-card" ${UI.cardAttrs('tonal')}><span class="eyebrow">${esc(INSURANCE_TYPES.find(([k]) => k === ins.type)?.[1] || 'Bảo hiểm')}</span><strong class="cf-insurance-number">${esc(ins.number)}</strong><span>${esc(ins.holder)}</span>${expired ? pill('Đã hết hạn', 'danger') : soon ? pill('Sắp hết hạn', 'warning') : pill('Còn hiệu lực', 'success')}</section>` +
        section('Chi tiết', facts([['Nơi đăng ký khám ban đầu', ins.facility || 'Không áp dụng'], ['Hiệu lực từ', dmy(ins.validFrom)], ['Hết hạn', dmy(ins.validTo)], ['Cập nhật lần cuối', stamp(ins.updatedAt)]]), 'shield') +
        `<div class="cf-action-row">${nav('Sửa thông tin bảo hiểm', 'K12', {}, 'primary', 'document')}${button('Xóa thông tin bảo hiểm', 'insurance-remove', {}, 'text danger-text', 'cross')}</div>` +
        note('Bản demo không kiểm tra thẻ với cơ quan bảo hiểm.'),
    };
  }
  function insuranceForm(s, u) {
    const p = account(s);
    if (!p) return notFound('Chưa có hồ sơ', 'Hãy tạo hồ sơ trước.', 'K2', 'Về hồ sơ');
    const ins = s.insurance?.[p.id] || { type: 'bhyt', number: '', holder: p.name, facility: '', validFrom: '', validTo: '' };
    const f = { ...ins, ...(u.forms.insurance || {}) };
    return {
      heading: s.insurance?.[p.id] ? 'Sửa thông tin bảo hiểm' : 'Thêm bảo hiểm', lead: 'Nhập đúng như trên thẻ để phòng khám đối chiếu nhanh hơn.',
      body: pform('insurance',
        select('type', 'Loại bảo hiểm', f.type, INSURANCE_TYPES, { required: true }) +
        input('number', f.type === 'bhyt' ? 'Mã thẻ BHYT' : 'Số hợp đồng / số thẻ', f.number, 'text', { required: true, autocapitalize: 'characters', maxlength: '20', spellcheck: 'false' }, f.type === 'bhyt' ? '15 ký tự: 2 chữ cái và 13 chữ số.' : '6–20 chữ cái hoặc chữ số.') +
        input('holder', 'Họ tên chủ thẻ', f.holder, 'text', { required: true, maxlength: '60' }) +
        input('facility', 'Nơi đăng ký khám chữa bệnh ban đầu', f.facility, 'text', { maxlength: '120' }) +
        `<div class="cf-field-pair">${input('validFrom', 'Hiệu lực từ', f.validFrom, 'date')}${input('validTo', 'Hết hạn', f.validTo, 'date', { required: true, min: M.localDate(1) })}</div>`,
        'Lưu bảo hiểm', { cancel: button('Hủy', 'p-form-cancel', { 'data-form': 'insurance', 'data-to': 'K11' }, 'text') }),
    };
  }
  function ticketList(s, u) {
    const all = (s.tickets || []).slice().sort((a, b) => (b.thread.at(-1)?.at || b.createdAt).localeCompare(a.thread.at(-1)?.at || a.createdAt));
    const filter = u.ticketFilter || 'open';
    const open = all.filter((t) => t.status !== 'closed'), closed = all.filter((t) => t.status === 'closed');
    const list = filter === 'open' ? open : closed;
    return {
      heading: 'Yêu cầu hỗ trợ', lead: 'Theo dõi câu hỏi bạn đã gửi và phản hồi từ phòng khám.',
      body: nav('Tạo yêu cầu mới', 'T3', {}, 'primary', 'plus') + segmented('ticketFilter', filter, [['open', 'Đang mở', open.length], ['closed', 'Đã đóng', closed.length]]) +
        (list.length ? `<div class="list cf-ticket-list">${list.map((t) => prow(t.subject, `${t.id}, ${t.topic}. Cập nhật ${stamp(t.thread.at(-1)?.at || t.createdAt)}`, 'T2', { 'ticket-id': t.id }, 'message-circle', pill(TICKET_STATUS[t.status][0], TICKET_STATUS[t.status][1]))).join('')}</div>`
          : empty(filter === 'open' ? 'Không có yêu cầu đang mở' : 'Chưa có yêu cầu đã đóng', filter === 'open' ? 'Khi cần hỗ trợ về lịch hẹn, hồ sơ hay thanh toán, hãy tạo yêu cầu mới.' : 'Yêu cầu bạn đóng sẽ được lưu ở đây.')),
    };
  }
  function ticketNew(s, u) {
    const f = { topic: u.params?.topic || TOPICS[0], subject: '', body: '', visitId: '', ...(u.forms['ticket-new'] || {}) };
    const rx = u.params?.rx && rxFor(s).find((r) => r.id === u.params.rx);
    if (rx && !f.subject) f.subject = 'Hỏi về đơn thuốc ' + rx.id;
    const visits = s.visits.slice().sort((a, b) => b.date.localeCompare(a.date));
    return {
      heading: 'Tạo yêu cầu hỗ trợ', lead: 'Phòng khám thường trả lời trong giờ làm việc. Việc khẩn cấp hãy gọi 115.',
      body: pform('ticket-new',
        select('topic', 'Chủ đề', f.topic, TOPICS.map((t) => [t, t]), { required: true }) +
        input('subject', 'Tiêu đề', f.subject, 'text', { required: true, maxlength: '80' }) +
        select('visitId', 'Lượt khám liên quan (không bắt buộc)', f.visitId, [['', 'Không liên quan lượt khám'], ...visits.map((v) => [v.id, `${v.id}, ${dmy(v.date)}, ${M.profile(s, v.patientId)?.name || ''}`])]) +
        area('body', 'Nội dung', f.body, { required: true, maxlength: '1000', rows: 5 }, 'Không gửi thông tin khẩn cấp qua đây.'),
        'Gửi yêu cầu', { cancel: button('Hủy', 'p-form-cancel', { 'data-form': 'ticket-new', 'data-to': 'T1' }, 'text') }),
    };
  }
  function ticketDetail(s, u) {
    const t = ticket(s, param('ticketId'));
    if (!t) return notFound('Không tìm thấy yêu cầu', 'Yêu cầu này không tồn tại hoặc đã bị xóa khỏi phiên demo.', 'T1', 'Về danh sách yêu cầu');
    const me = account(s);
    const thread = `<div class="conversation cf-thread">${t.thread.map((m) => `<div class="message ${m.from === 'patient' ? 'sent' : 'received'}"><span>${esc(m.from === 'patient' ? (me?.name || 'Bạn') : (m.author || 'Phòng khám'))}, ${esc(stamp(m.at))}</span><p>${esc(m.text)}</p></div>`).join('')}</div>`;
    const visit = t.visitId && s.visits.find((v) => v.id === t.visitId);
    return {
      heading: t.subject, lead: `${t.id}, ${t.topic}`,
      body: `<div class="cf-ticket-head">${pill(TICKET_STATUS[t.status][0], TICKET_STATUS[t.status][1])}<small>Tạo lúc ${esc(stamp(t.createdAt))}</small></div>` +
        (visit ? prow('Lượt khám ' + visit.id, visit.slot + ' ngày ' + dmy(visit.date), 'D2', { 'visit-id': visit.id }, 'calendar') : '') +
        section('Trao đổi', thread, 'message-circle') +
        (t.status === 'closed'
          ? note('Yêu cầu đã đóng' + (t.closeReason ? ': ' + t.closeReason : '.') + ' Bạn có thể mở lại nếu vẫn cần hỗ trợ.') + button('Mở lại yêu cầu', 'ticket-reopen', { 'data-id': t.id }, 'secondary', 'refresh')
          : pform('ticket-reply', `<input type="hidden" name="ticketId" value="${esc(t.id)}">` + area('reply', 'Trả lời phòng khám', u.forms['ticket-reply']?.reply || '', { maxlength: '1000', rows: 3 }), 'Gửi trả lời', { variant: 'secondary' }) +
            button('Đóng yêu cầu', 'ticket-close', { 'data-id': t.id }, 'text danger-text', 'check-circle')),
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
    return `<div class="cf-clinician-picker"><h2>Chuyên khoa và bác sĩ</h2>${select('specialty', 'Chuyên khoa', specialty, specialties.map((x) => [x, x]))}${select('clinicianId', 'Bác sĩ', options.some((c) => c.id === doctorId) ? doctorId : 'any', [['any', 'Bác sĩ phù hợp bất kỳ'], ...options.map((c) => [c.id, c.name])])}</div>`;
  }
  function chosenClinician(s, specialty, clinicianId) {
    const list = s.clinicians || Seed.DATA.clinicians;
    const c = list.find((x) => x.id === clinicianId && x.specialty === specialty) || list.find((x) => x.specialty === specialty);
    return c ? { id: c.id, name: c.name, specialty: c.specialty, initials: c.initials } : null;
  }

  /* ---------- mutations ---------- */
  function setBusy(el, busy, label) {
    if (!el) return;
    if (busy) { el.dataset.label = el.querySelector('span')?.textContent || ''; el.disabled = true; el.setAttribute('aria-busy', 'true'); if (el.querySelector('span')) el.querySelector('span').textContent = label || 'Đang lưu…'; }
    else { el.disabled = false; el.removeAttribute('aria-busy'); if (el.querySelector('span') && el.dataset.label) el.querySelector('span').textContent = el.dataset.label; }
  }
  function showAlert(container, message, retryAction, retryData = {}) {
    const box = container.querySelector('[data-form-alert]') || container;
    box.innerHTML = `<div class="cf-inline-error" data-cf-state="error">${I('warning', 20)}<div><strong>Chưa lưu được</strong><p>${esc(message)}</p></div>${button('Thử lại', retryAction, retryData, 'secondary', 'refresh')}</div>`;
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
      const msg = err?.code === 'SIMULATED' ? err.message : 'Đã có lỗi ngoài dự kiến. Dữ liệu của bạn chưa thay đổi.';
      if (alertIn) showAlert(alertIn, msg, retry, retryData);
      else App().dialog('Chưa thực hiện được', msg, button('Đóng', 'close-dialog', {}, 'primary'));
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
        finish((s) => { Object.assign(account(s), { name: get('name'), dob: get('dob'), phone: get('phone').replace(/\s/g, ''), email: get('email'), address: get('address'), allergies: get('allergies'), medicalHistory: get('medicalHistory') }); }, { done: 'Đã lưu thông tin cá nhân.', to: 'K2' });
        return true;
      case 'family-edit': {
        const id = get('personId');
        finish((s) => {
          const fields = { name: get('name'), dob: get('dob'), relation: get('relation'), phone: get('phone').replace(/\s/g, '') };
          if (id) { const p = s.profiles.find((x) => x.id === id); if (!p) return { ok: false, message: 'Hồ sơ này không còn tồn tại.' }; Object.assign(p, fields); return; }
          const n = Math.max(0, ...s.profiles.map((p) => Number(p.id.replace(/\D/g, '')) || 0)) + 1;
          const p = { id: 'p' + n, ...fields, email: '', address: '', allergies: '', medicalHistory: '', canBook: true, canViewResults: false };
          s.profiles.push(p);
          App().ui.params = { personId: p.id };
        }, { done: id ? 'Đã lưu hồ sơ người thân.' : 'Đã thêm hồ sơ người thân.', to: 'K9', params: id ? { personId: id } : undefined });
        return true;
      }
      case 'insurance':
        finish((s) => { const p = account(s); s.insurance ??= {}; s.insurance[p.id] = { type: get('type'), number: get('number').toUpperCase(), holder: get('holder'), facility: get('facility'), validFrom: get('validFrom'), validTo: get('validTo'), updatedAt: new Date().toISOString() }; }, { done: 'Đã lưu thông tin bảo hiểm.', to: 'K11' });
        return true;
      case 'refill': {
        const rxId = param('rxId');
        finish((s) => {
          const r = rxFor(s).find((x) => x.id === rxId);
          if (!r || rxEnded(r) || r.refill?.status === 'requested') return { ok: false, message: 'Đơn này không còn nhận yêu cầu cấp lại.' };
          const at = new Date().toISOString();
          r.refill = { status: 'requested', at, supply: get('supply'), pickup: get('pickup'), note: get('refillNote') };
          (r.refillHistory ??= []).push({ status: 'requested', at });
          r.refillsUsed = (r.refillsUsed || 0) + 1;
          const c = s.clinic;
          if (c) c.tasks.unshift({ id: 'TK-' + (++c.sequence.task), title: 'Xem xét yêu cầu cấp lại ' + r.id, patientId: r.patientId, visitId: r.visitId, rxId: r.id, due: M.localDate(1), priority: get('supply') === 'out' ? 'high' : 'normal', assignee: 'Bác sĩ', note: get('refillNote'), status: 'open', createdAt: at, source: 'refill' });
        }, { done: 'Đã gửi yêu cầu cấp lại. Phòng khám sẽ xem xét và liên hệ bạn.', to: 'M2', params: { rxId } });
        return true;
      }
      case 'ticket-new':
        finish((s) => {
          const id = nextTicketId(s), at = new Date().toISOString();
          s.tickets.unshift({ id, topic: get('topic'), subject: get('subject'), status: 'open', visitId: get('visitId') || null, createdAt: at, closeReason: '', thread: [{ from: 'patient', author: '', text: get('body'), at }] });
          App().ui.params = { ticketId: id };
        }, { done: 'Đã gửi yêu cầu. Phòng khám sẽ trả lời trong mục này.', to: 'T2' });
        return true;
      case 'ticket-reply': {
        const id = get('ticketId');
        finish((s) => { const t = ticket(s, id); if (!t || t.status === 'closed') return { ok: false, message: 'Yêu cầu đã đóng. Hãy mở lại để tiếp tục trao đổi.' }; t.thread.push({ from: 'patient', author: '', text: get('reply'), at: new Date().toISOString() }); t.status = 'open'; }, { done: 'Đã gửi trả lời.' });
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
      App().dialog('Hủy yêu cầu cấp lại thuốc?', 'Phòng khám sẽ không xem xét yêu cầu này nữa. Bạn có thể gửi lại sau.', button('Giữ yêu cầu', 'close-dialog', {}, 'secondary') + button('Hủy yêu cầu', 'rx-cancel-refill-confirm', { 'data-id': el.dataset.id }, 'danger'));
    },
    'rx-cancel-refill-confirm'(el) {
      const dialogActions = document.getElementById('dialog-actions');
      commit(el, (s) => {
        const r = (s.prescriptions || []).find((x) => x.id === el.dataset.id);
        if (!r?.refill || r.refill.status !== 'requested') return { ok: false, message: 'Yêu cầu không còn ở trạng thái chờ.' };
        const at = new Date().toISOString();
        (r.refillHistory ??= []).push({ status: 'cancelled', at });
        r.refillsUsed = Math.max(0, (r.refillsUsed || 1) - 1);
        r.refill = null;
        const task = s.clinic?.tasks.find((t) => t.rxId === r.id && t.status === 'open'); if (task) { task.status = 'done'; task.note = (task.note ? task.note + '. ' : '') + 'Người bệnh đã hủy yêu cầu.'; }
        document.getElementById('dialog').close();
      }, { done: 'Đã hủy yêu cầu cấp lại thuốc.', alertIn: dialogActions, retry: 'rx-cancel-refill-confirm', retryData: { 'data-id': el.dataset.id }, busyLabel: 'Đang hủy…' });
    },
    'family-delete'(el) {
      const s = st(), p = s.profiles.find((x) => x.id === el.dataset.id);
      if (!p) return;
      const visits = s.visits.filter((v) => v.patientId === p.id);
      if (visits.length) return App().dialog('Chưa thể xóa hồ sơ này', `${p.name} đã có ${visits.length} lịch hẹn hoặc lượt khám. Hồ sơ có lịch sử khám cần được phòng khám lưu giữ. Bạn có thể sửa thông tin hoặc gửi yêu cầu hỗ trợ.`, button('Đóng', 'close-dialog', {}, 'primary'));
      App().dialog('Xóa hồ sơ ' + p.name + '?', 'Hồ sơ sẽ bị xóa khỏi tài khoản của bạn trong phiên demo này.', button('Giữ hồ sơ', 'close-dialog', {}, 'secondary') + button('Xóa hồ sơ', 'family-delete-confirm', { 'data-id': p.id }, 'danger'));
    },
    'family-delete-confirm'(el) {
      commit(el, (s) => {
        const i = s.profiles.findIndex((x) => x.id === el.dataset.id && x.relation !== 'self');
        if (i < 0) return { ok: false, message: 'Hồ sơ không còn tồn tại.' };
        if (s.visits.some((v) => v.patientId === el.dataset.id)) return { ok: false, message: 'Hồ sơ đã có lịch hẹn nên chưa thể xóa.' };
        s.profiles.splice(i, 1);
        if (s.activePatientId === el.dataset.id) s.activePatientId = s.accountProfileId;
        document.getElementById('dialog').close();
      }, { done: 'Đã xóa hồ sơ người thân.', to: 'K7', alertIn: document.getElementById('dialog-actions'), retry: 'family-delete-confirm', retryData: { 'data-id': el.dataset.id }, busyLabel: 'Đang xóa…' });
    },
    'insurance-remove'() {
      App().dialog('Xóa thông tin bảo hiểm?', 'Bạn có thể thêm lại bất cứ lúc nào. Phòng khám sẽ hỏi thông tin thẻ khi bạn đến khám.', button('Giữ thông tin', 'close-dialog', {}, 'secondary') + button('Xóa', 'insurance-remove-confirm', {}, 'danger'));
    },
    'insurance-remove-confirm'(el) {
      commit(el, (s) => { delete s.insurance[account(s).id]; document.getElementById('dialog').close(); }, { done: 'Đã xóa thông tin bảo hiểm.', to: 'K11', alertIn: document.getElementById('dialog-actions'), retry: 'insurance-remove-confirm', busyLabel: 'Đang xóa…' });
    },
    'ticket-close'(el) {
      App().dialog('Đóng yêu cầu này?', '', button('Để mở', 'close-dialog', {}, 'secondary') + button('Đóng yêu cầu', 'ticket-close-confirm', { 'data-id': el.dataset.id }, 'danger'));
      document.getElementById('dialog-body').innerHTML = `<p>Bạn sẽ không nhận thêm phản hồi cho yêu cầu này cho đến khi mở lại.</p><div class="field"><label for="close-reason">Lý do (không bắt buộc)</label><select id="close-reason"><option value="">Không nêu lý do</option><option>Vấn đề đã được giải quyết</option><option>Tôi đã liên hệ phòng khám qua kênh khác</option><option>Tôi gửi nhầm yêu cầu</option></select></div>`;
    },
    'ticket-close-confirm'(el) {
      const reason = document.getElementById('close-reason')?.value || '';
      commit(el, (s) => { const t = ticket(s, el.dataset.id); if (!t) return { ok: false, message: 'Yêu cầu không còn tồn tại.' }; t.status = 'closed'; t.closeReason = reason; t.closedAt = new Date().toISOString(); document.getElementById('dialog').close(); }, { done: 'Đã đóng yêu cầu.', alertIn: document.getElementById('dialog-actions'), retry: 'ticket-close-confirm', retryData: { 'data-id': el.dataset.id }, busyLabel: 'Đang đóng…' });
    },
    'ticket-reopen'(el) {
      commit(el, (s) => { const t = ticket(s, el.dataset.id); if (!t) return { ok: false, message: 'Yêu cầu không còn tồn tại.' }; t.status = 'open'; t.closeReason = ''; }, { done: 'Đã mở lại yêu cầu.', busyLabel: 'Đang mở…' });
    },
    'notification-read'(el) {
      const n = st().notifications.find((x) => x.id === el.dataset.id);
      if (n) { n.read = true; App().save(); App().render(); }
    },
    'reset-demo'() {
      App().dialog('Đặt lại dữ liệu demo?', 'Mọi thay đổi trong phiên này (lịch hẹn, hồ sơ, yêu cầu, ghi chú của phòng khám) sẽ bị xóa và dữ liệu ban đầu được nạp lại.', button('Giữ dữ liệu', 'close-dialog', {}, 'secondary') + button('Đặt lại', 'reset-demo-confirm', {}, 'danger'));
    },
    'reset-demo-confirm'() {
      const fresh = Store.reset({ keepAuth: true });
      location.replace(location.pathname + '#' + (fresh.authenticated ? '/home' : '/login'));
      location.reload();
    },
    'demo-fail-toggle'(el) {
      Store.failNext.set(!Store.failNext.get());
      syncFailToggle();
      App().demo(Store.failNext.get() ? 'Thao tác lưu hoặc tải tiếp theo sẽ gặp lỗi kết nối mô phỏng.' : 'Đã tắt lỗi mô phỏng.');
    },
  };
  function syncFailToggle() {
    const on = Store.failNext.get();
    document.querySelectorAll('[data-action="demo-fail-toggle"]').forEach((b) => { b.setAttribute('aria-pressed', String(on)); b.querySelector('span') && (b.querySelector('span').textContent = on ? 'Lỗi mô phỏng: đang bật' : 'Mô phỏng lỗi kết nối'); });
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
      if (label) label.textContent = el.value === 'bhyt' ? 'Mã thẻ BHYT' : 'Số hợp đồng / số thẻ';
      const hint = form.querySelector('#number-hint');
      if (hint) hint.textContent = el.value === 'bhyt' ? '15 ký tự: 2 chữ cái và 13 chữ số.' : '6–20 chữ cái hoặc chữ số.';
    }
    if (el.id === 'specialty') {
      const s = st(), list = (s.clinicians || Seed.DATA.clinicians).filter((c) => c.specialty === el.value);
      const doctor = document.getElementById('clinicianId');
      if (doctor) {
        doctor.innerHTML = [['any', 'Bác sĩ phù hợp bất kỳ'], ...list.map((c) => [c.id, c.name])].map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
        doctor.value = 'any';
        doctor.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });

  root.CareFlowProduct = { SCREENS, has, tabFor, render, gateView, ACTIONS, submit, clinicianPicker, chosenClinician, relationLabel, RELATIONS, syncFailToggle, rxFor };
})(window);
