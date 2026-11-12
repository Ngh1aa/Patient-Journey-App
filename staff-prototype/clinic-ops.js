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
    [/^\/ops\/queue$/, 'Hàng chờ hôm nay'],
    [/^\/ops\/visits\/[^/]+$/, 'Xử lý lượt khám'],
    [/^\/ops\/patients\/[^/]+$/, 'Hồ sơ người bệnh'],
    [/^\/ops\/tasks$/, 'Việc cần làm'],
    [/^\/ops\/tasks\/new$/, 'Tạo việc cần làm'],
    [/^\/ops\/tasks\/[^/]+$/, 'Sửa việc cần làm'],
    [/^\/ops\/tickets$/, 'Yêu cầu hỗ trợ'],
    [/^\/ops\/tickets\/[^/]+$/, 'Chi tiết yêu cầu'],
  ];
  const permitted = (path) => ROUTES.some(([re]) => re.test(path.split('?')[0]));
  const title = (path) => ROUTES.find(([re]) => re.test(path.split('?')[0]))?.[1];

  /* ---------- helpers ---------- */
  const e = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  const today = () => M.localDate();
  const dmy = (d) => d ? d.split('-').reverse().join('/') : '—';
  const stamp = (iso) => { try { return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(iso)); } catch { return ''; } };
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
  const ASSIGNEES = ['Lễ tân', 'Điều dưỡng', 'Bác sĩ', 'Điều phối'];
  const SLOTS = ['08:00', '09:00', '10:30', '14:00', '15:30'];
  const PRIORITY = { high: ['Ưu tiên cao', 'warning'], normal: ['Bình thường', 'neutral'] };
  const TICKET = { open: ['Chờ phản hồi', 'warning'], answered: ['Đã trả lời', 'info'], closed: ['Đã đóng', 'neutral'] };

  /** Next operational step for a visit, as [label, action] or null. */
  function nextStep(v) {
    switch (v.status) {
      case 'pending': return ['Xác nhận lịch', 'ops-confirm'];
      case 'confirmed': case 'reminder': return [isOnline(v) ? 'Mở phòng chờ online' : 'Check-in', 'ops-checkin'];
      case 'arrived': return ['Tiếp nhận', 'ops-checkin'];
      case 'received': case 'ready': case 'online-wait': return ['Bắt đầu khám', 'ops-start'];
      case 'in-consult': return ['Hoàn tất khám', 'ops-complete'];
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
    'ops-confirm': ['Phòng khám đã xác nhận lịch hẹn', 'Lịch của bạn đã được xác nhận. Mở phiếu khám để chuẩn bị.', 'D2'],
    'ops-checkin': ['Phòng khám đã tiếp nhận bạn', 'Bạn đã được check-in. Theo dõi lượt khám trên phiếu.', 'D2'],
    'ops-start': ['Bác sĩ đã bắt đầu buổi khám', 'Buổi khám của bạn đang diễn ra.', 'D2'],
    'ops-complete': ['Buổi khám đã hoàn tất', 'Phòng khám sẽ chia sẻ tài liệu sau khám khi sẵn sàng.', 'H1'],
    'ops-noshow': ['Phòng khám ghi nhận bạn chưa đến khám', 'Bạn có thể đặt lại lịch mới trong ứng dụng.', 'D2'],
  };
  function notifyPatient(n) { st.notifications.unshift({ id: Store.uid('n'), read: false, at: new Date().toISOString(), ...n }); }
  function applySteps(action, id) {
    const found = findVisit(id);
    if (!found) return { ok: false, message: 'Không tìm thấy lượt khám.' };
    const { v, scope } = found, steps = PATHS[action](v);
    if (!steps.length) return { ok: false, message: 'Trạng thái hiện tại không cho phép thao tác này. Hãy tải lại trang.' };
    const before = st.notifications.length;
    for (const to of steps) {
      const r = M.transition(proxy(scope), v.id, to, 'staff', action === 'ops-noshow' ? 'Không đến theo lịch' : '');
      if (!r.ok) return { ok: false, message: 'Không chuyển được trạng thái (' + r.code + ').' };
    }
    if (scope === 'account') {
      st.notifications.splice(0, st.notifications.length - before);
      const [t, b, screen] = PATIENT_MESSAGE[action];
      notifyPatient({ visitId: v.id, patientId: v.patientId, screen, title: t, body: b });
    }
    if (action === 'ops-complete') v.signedBy = v.clinician?.name || 'Bác sĩ phụ trách';
    return { ok: true };
  }

  /* ---------- simulated network ---------- */
  function gateView(path, x) {
    if (ops.gate.path !== path) { ops.gate.path = path; load(x); }
    if (ops.gate.state === 'loading') return `<section class="screen doctor-screen ops-screen">${heading('VẬN HÀNH PHÒNG KHÁM', title(path), '')}<div class="ops-skeleton" aria-busy="true" data-cf-state="loading"><span class="sr-only">Đang tải dữ liệu…</span>${'<div class="ops-skeleton-row"><span></span><span></span><span></span></div>'.repeat(4)}</div></section>`;
    if (ops.gate.state === 'error') return `<section class="screen doctor-screen ops-screen">${heading('VẬN HÀNH PHÒNG KHÁM', title(path), '')}<div class="ops-load-error doctor-surface" role="alert" data-cf-state="error"><h2>Chưa tải được dữ liệu</h2><p>Kết nối với máy chủ demo bị gián đoạn. Dữ liệu trong phiên vẫn được giữ nguyên.</p>${x.btn('Thử lại', 'ops-retry-load', 'btn-primary')}</div></section>`;
    return null;
  }
  function load(x) {
    ops.gate.state = 'loading';
    const path = ops.gate.path;
    Store.request(null, { delay: 380 }).then(() => { if (ops.gate.path === path) { ops.gate.state = 'ready'; x.render(); } })
      .catch(() => { if (ops.gate.path === path) { ops.gate.state = 'error'; x.render(); } });
  }
  function run(x, trigger, fn, { done, go, alertIn } = {}) {
    if (trigger) { trigger.disabled = true; trigger.setAttribute('aria-busy', 'true'); trigger.dataset.label = trigger.innerHTML; trigger.textContent = 'Đang lưu…'; }
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
      const message = err.message || 'Đã có lỗi ngoài dự kiến.';
      if (alertIn?.isConnected) { alertIn.innerHTML = `<div class="ops-inline-error" role="alert" data-cf-state="error"><strong>Chưa lưu được</strong><p>${e(message)}</p>${err.code === 'RULE' ? '' : x.btn('Thử lại', 'ops-resubmit', 'btn-secondary', `data-form="${e(alertIn.closest('form')?.dataset.opsForm || '')}"`)}</div>`; return; }
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
    const items = [['/ops/queue', 'Hàng chờ hôm nay'], ['/ops/tasks', 'Việc cần làm'], ['/ops/tickets', 'Yêu cầu hỗ trợ']];
    const open = { '/ops/tasks': st.clinic.tasks.filter((t) => t.status === 'open').length, '/ops/tickets': (st.tickets || []).filter((t) => t.status === 'open').length };
    const on = Store.failNext.get();
    return `<div class="ops-toolbar"><nav class="ops-subnav" aria-label="Vận hành phòng khám">${items.map(([p, l]) => `<a href="#${p}" class="${path.startsWith(p) ? 'active' : ''}"${path.startsWith(p) ? ' aria-current="page"' : ''}>${e(l)}${open[p] ? `<span>${open[p]}</span>` : ''}</a>`).join('')}</nav><button type="button" class="ops-fail-toggle" data-action="ops-fail-toggle" aria-pressed="${on}">${on ? 'Lỗi mô phỏng: đang bật' : 'Mô phỏng lỗi kết nối'}</button></div>`;
  }
  function banner(x) {
    if (!ops.error) return '';
    return `<div class="ops-banner" role="alert" tabindex="-1" data-cf-state="error"><div><strong>Chưa thực hiện được</strong><p>${e(ops.error.message)}</p></div>${ops.error.retry ? x.btn('Thử lại', 'ops-retry', 'btn-secondary') : ''}${x.btn('Đóng', 'ops-dismiss-error', 'btn-outline')}</div>`;
  }
  function modal(x) {
    const m = ops.modal;
    if (!m) return '';
    const map = {
      complete: ['Hoàn tất lượt khám?', 'Lượt khám sẽ chuyển sang Hoàn tất và người bệnh nhận thông báo. Đây là thao tác mô phỏng, không tạo chữ ký hay hồ sơ bệnh án thật.', 'Hoàn tất khám', 'ops-complete-confirm'],
      noshow: ['Ghi nhận không đến?', 'Người bệnh sẽ thấy lịch ở trạng thái Chưa đến khám và có thể đặt lại.', 'Ghi nhận không đến', 'ops-noshow-confirm'],
      'delete-task': ['Xóa việc này?', 'Việc sẽ bị xóa khỏi danh sách của phòng khám trong phiên demo.', 'Xóa việc', 'ops-task-delete-confirm'],
      'delete-note': ['Xóa ghi chú?', 'Ghi chú nội bộ sẽ bị xóa khỏi lượt khám.', 'Xóa ghi chú', 'ops-note-delete-confirm'],
      'close-ticket': ['Đóng yêu cầu hỗ trợ?', 'Người bệnh vẫn có thể mở lại yêu cầu nếu cần.', 'Đóng yêu cầu', 'ops-ticket-close-confirm'],
    };
    const [t, body, cta, action] = map[m.type];
    return `<div class="modal-overlay" data-action="ops-close-modal"><div class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="ops-modal-title"><h2 id="ops-modal-title">${e(t)}</h2><p>${e(body)}</p><div class="dialog-actions">${x.btn('Quay lại', 'ops-close-modal', 'btn-outline')}${x.btn(cta, action, 'btn-primary', `data-id="${e(m.id)}" data-note="${e(m.note || '')}"`)}</div></div></div>`;
  }
  const field = (name, label, control, hint = '') => `<label class="ops-field" data-field="${name}"><span>${e(label)}</span>${control}${hint ? `<small>${e(hint)}</small>` : ''}<em class="ops-error" data-error-for="${name}" aria-live="polite"></em></label>`;
  const inputC = (name, value = '', type = 'text', extra = '') => `<input name="${name}" id="ops-${name}" type="${type}" value="${e(value)}" aria-describedby="ops-${name}-err" ${extra}>`;
  const selectC = (name, value, options, extra = '') => `<select name="${name}" id="ops-${name}" ${extra}>${options.map(([v, l]) => `<option value="${e(v)}"${String(v) === String(value) ? ' selected' : ''}>${e(l)}</option>`).join('')}</select>`;
  const areaC = (name, value = '', extra = '') => `<textarea name="${name}" id="ops-${name}" rows="3" ${extra}>${e(value)}</textarea>`;
  const formWrap = (name, html, cta, x, extra = '') => `<form class="ops-form" data-ops-form="${name}" novalidate>${html}<div class="ops-form-alert" data-form-alert></div><div class="ops-form-actions">${extra}<button type="submit" class="btn btn-primary" ${UI.buttonAttrs('btn-primary')}>${e(cta)}</button></div></form>`;
  const emptyBox = (t, d, action = '') => `<div class="ops-empty" data-cf-state="empty"><strong>${e(t)}</strong><p>${e(d)}</p>${action}</div>`;
  const notFound = (x, t, back, label) => `<section class="screen doctor-screen ops-screen" data-cf-state="not-found">${heading('VẬN HÀNH PHÒNG KHÁM', 'Không tìm thấy', '')}${emptyBox(t, 'Mã này không tồn tại hoặc đã bị xóa trong phiên demo.', `<a class="btn btn-primary" ${UI.buttonAttrs('btn-primary')} href="#${back}">${e(label)}</a>`)}</section>`;
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
      return `<tr data-visit="${e(v.id)}"><td class="mono">${e(v.slot)}</td><td><a class="text-link" href="#/ops/patients/${e(v.patientId)}">${e(p?.name || 'Không rõ')}</a><small class="ops-sub">${e(v.id)}, ${isOnline(v) ? 'Trực tuyến' : 'Tại phòng khám'}</small></td><td>${e(v.reason)}</td><td>${e(v.clinician?.name || '')}</td><td>${statusPill(x, v)}</td><td><div class="ops-row-actions">${step ? x.btn(step[0], step[1], 'btn-primary', `data-id="${e(v.id)}"`) : ''}<a class="btn btn-secondary" ${UI.buttonAttrs('btn-secondary')} href="#/ops/visits/${e(v.id)}">Chi tiết</a></div></td></tr>`;
    }).join('');
    const filters = [['all', 'Tất cả', all.length], ['waiting', 'Chờ đến', count('waiting')], ['inclinic', 'Đang ở phòng khám', count('inclinic')], ['done', 'Đã xong', count('done')]];
    return `<section class="screen doctor-screen ops-screen">${heading('VẬN HÀNH PHÒNG KHÁM', 'Hàng chờ hôm nay', 'Check-in, bắt đầu và hoàn tất lượt khám. Người bệnh thấy cập nhật ngay trên ứng dụng trong cùng phiên.')}${subnav(path)}${banner(x)}
      <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">${e(dmy(today()))}</span><h2>${all.length} lượt khám trong ngày</h2></div></div>
      <div class="ops-filters" role="group" aria-label="Lọc hàng chờ">${filters.map(([k, l, n]) => `<button type="button" data-action="ops-queue-filter" data-value="${k}" aria-pressed="${f === k}">${e(l)} <span>${n}</span></button>`).join('')}</div>
      ${list.length ? `<div class="table-scroll"><table class="data-table ops-table"><thead><tr><th>Giờ</th><th>Người bệnh</th><th>Lý do khám</th><th>Bác sĩ</th><th>Trạng thái</th><th><span class="sr-only">Thao tác</span></th></tr></thead><tbody>${rows}</tbody></table></div>`
        : emptyBox(all.length ? 'Không có lượt khám ở nhóm này' : 'Hôm nay chưa có lượt khám', all.length ? 'Chọn nhóm khác để xem các lượt còn lại.' : 'Lịch hẹn được xác nhận cho hôm nay sẽ xuất hiện ở đây.')}</section>${modal(x)}</section>`;
  }
  function visitPage(x, path, id) {
    const found = findVisit(id);
    if (!found) return notFound(x, 'Không tìm thấy lượt khám', '/ops/queue', 'Về hàng chờ');
    const { v } = found, p = person(v.patientId), step = nextStep(v);
    const canNoShow = ['confirmed', 'reminder'].includes(v.status);
    const notes = (v.staffNotes || []).slice().reverse();
    const tasks = st.clinic.tasks.filter((t) => t.visitId === v.id);
    const f = ops.forms;
    return `<section class="screen doctor-screen ops-screen">${heading('VẬN HÀNH PHÒNG KHÁM', 'Lượt khám ' + v.id, (p?.name || '') + ', ' + dmy(v.date) + ', ' + v.slot, `${link('/ops/queue', '← Hàng chờ hôm nay')}`)}${subnav('/ops/queue')}${banner(x)}
      <div class="ops-grid">
        <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">TRẠNG THÁI</span><h2>${e(UI.status(v.status).label)}</h2></div>${statusPill(x, v)}</div>
          <dl class="ops-facts"><div><dt>Người bệnh</dt><dd><a class="text-link" href="#/ops/patients/${e(v.patientId)}">${e(p?.name || 'Không rõ')}</a></dd></div><div><dt>Bác sĩ</dt><dd>${e(v.clinician?.name || '—')}, ${e(v.clinician?.specialty || '')}</dd></div><div><dt>Hình thức</dt><dd>${isOnline(v) ? 'Khám trực tuyến' : 'Tại phòng khám'}</dd></div><div><dt>Lý do khám</dt><dd>${e(v.reason)}</dd></div>${v.cancelReason ? `<div><dt>Lý do hủy</dt><dd>${e(v.cancelReason)}</dd></div>` : ''}</dl>
          <div class="ops-actions">${step ? x.btn(step[0], step[1], 'btn-primary', `data-id="${e(v.id)}"`) : `<p class="ops-muted">Lượt khám không còn bước xử lý tiếp theo.</p>`}${canNoShow ? x.btn('Ghi nhận không đến', 'ops-noshow', 'btn-outline', `data-id="${e(v.id)}"`) : ''}</div>
          <h3 class="ops-h3">Tiến trình</h3><ol class="ops-timeline">${v.history.map((h) => `<li><strong>${e(UI.status(h.status).label)}</strong><small>${e(stamp(h.at))}, ${h.actor === 'staff' ? 'Phòng khám' : 'Người bệnh'}</small></li>`).join('')}</ol>
        </section>
        <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">GHI CHÚ NỘI BỘ</span><h2>${notes.length} ghi chú</h2></div></div>
          <p class="ops-muted">Chỉ nhân viên phòng khám thấy. Không ghi chẩn đoán hay chỉ định điều trị trong bản demo.</p>
          ${formWrap('note', `<input type="hidden" name="visitId" value="${e(v.id)}">` + field('note', 'Thêm ghi chú', areaC('note', f.note?.note || '', 'maxlength="1000"')), 'Lưu ghi chú', x)}
          ${notes.length ? `<ul class="ops-notes">${notes.map((n) => `<li><p>${e(n.text)}</p><small>${e(n.author)}, ${e(stamp(n.at))}</small>${x.btn('Xóa', 'ops-note-delete', 'btn-outline ops-small', `data-id="${e(v.id)}" data-note="${e(n.id)}"`)}</li>`).join('')}</ul>` : emptyBox('Chưa có ghi chú', 'Ghi lại thông tin vận hành như giấy tờ còn thiếu hoặc yêu cầu hỗ trợ.')}
        </section>
      </div>
      <div class="ops-grid">
        <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">THEO DÕI SAU KHÁM</span><h2>Tạo việc cần làm</h2></div></div>
          ${formWrap('task', `<input type="hidden" name="visitId" value="${e(v.id)}"><input type="hidden" name="patientId" value="${e(v.patientId)}">` + taskFields(f.task || { title: '', due: M.localDate(1), assignee: 'Lễ tân', priority: 'normal', note: '' }), 'Tạo việc', x)}
          ${tasks.length ? `<ul class="ops-mini-list">${tasks.map((t) => `<li><a class="text-link" href="#/ops/tasks/${e(t.id)}">${e(t.title)}</a> ${x.pill(t.status === 'done' ? 'Đã xong' : 'Đang mở', t.status === 'done' ? 'success' : 'warning')}</li>`).join('')}</ul>` : ''}
        </section>
        <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">HẸN TÁI KHÁM</span><h2>Đặt lịch tiếp theo</h2></div></div>
          <p class="ops-muted">Lịch được tạo ở trạng thái Đã xác nhận${found.scope === 'account' ? ' và hiện ngay trong ứng dụng của người bệnh' : ''}.</p>
          ${formWrap('followup', `<input type="hidden" name="visitId" value="${e(v.id)}">` + `<div class="ops-pair">${field('date', 'Ngày tái khám', inputC('date', f.followup?.date || M.localDate(7), 'date', `min="${M.localDate(1)}" required`))}${field('slot', 'Giờ', selectC('slot', f.followup?.slot || '09:00', SLOTS.map((s) => [s, s])))}</div>` + field('mode', 'Hình thức', selectC('mode', f.followup?.mode || v.mode, [['onsite', 'Tại phòng khám'], ['online', 'Trực tuyến']])) + field('reason', 'Lý do', inputC('reason', f.followup?.reason || 'Tái khám theo hẹn của bác sĩ', 'text', 'maxlength="120" required')), 'Đặt lịch tái khám', x)}
        </section>
      </div>${modal(x)}</section>`;
  }
  function taskFields(t) {
    return field('title', 'Tên việc', inputC('title', t.title, 'text', 'maxlength="80" required')) +
      `<div class="ops-pair">${field('due', 'Hạn xử lý', inputC('due', t.due, 'date', 'required'))}${field('assignee', 'Người phụ trách', selectC('assignee', t.assignee, ASSIGNEES.map((a) => [a, a])))}</div>` +
      field('priority', 'Mức ưu tiên', selectC('priority', t.priority, [['normal', 'Bình thường'], ['high', 'Ưu tiên cao']])) +
      field('note', 'Ghi chú', areaC('note', t.note, 'maxlength="300"'));
  }
  function patientPage(x, path, id) {
    const p = person(id);
    if (!p) return notFound(x, 'Không tìm thấy người bệnh', '/ops/queue', 'Về hàng chờ');
    const visits = visitsOf(id), tasks = st.clinic.tasks.filter((t) => t.patientId === id);
    const ins = p.scope === 'account' ? st.insurance?.[id] : null;
    const rx = (st.prescriptions || []).filter((r) => r.patientId === id);
    return `<section class="screen doctor-screen ops-screen">${heading('VẬN HÀNH PHÒNG KHÁM', p.name, (p.code || '') + ', ngày sinh ' + dmy(p.dob))}${subnav('/ops/queue')}${banner(x)}
      <div class="ops-grid">
        <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">THÔNG TIN HÀNH CHÍNH</span><h2>Liên hệ</h2></div></div>
          <dl class="ops-facts"><div><dt>Số điện thoại</dt><dd>${e(p.phone ? p.phone.slice(0, 3) + ' ••• ' + p.phone.slice(-3) : 'Chưa cập nhật')}</dd></div><div><dt>Bảo hiểm</dt><dd>${ins ? e(ins.number + ', hết hạn ' + dmy(ins.validTo)) : 'Chưa khai báo'}</dd></div><div><dt>Nguồn hồ sơ</dt><dd>${p.scope === 'account' ? 'Tài khoản CareFlow+ của người bệnh' : 'Hồ sơ tại phòng khám'}</dd></div></dl>
          ${rx.length ? `<h3 class="ops-h3">Đơn thuốc minh họa</h3><ul class="ops-mini-list">${rx.map((r) => `<li>${e(r.name)} ${r.refill?.status === 'requested' ? x.pill('Chờ xem xét cấp lại', 'warning') : ''}</li>`).join('')}</ul>` : ''}
        </section>
        <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">VIỆC LIÊN QUAN</span><h2>${tasks.filter((t) => t.status === 'open').length} việc đang mở</h2></div><a class="btn btn-secondary" ${UI.buttonAttrs('btn-secondary')} href="#/ops/tasks/new?patient=${e(id)}">Tạo việc</a></div>
          ${tasks.length ? `<ul class="ops-mini-list">${tasks.map((t) => `<li><a class="text-link" href="#/ops/tasks/${e(t.id)}">${e(t.title)}</a> ${x.pill(t.status === 'done' ? 'Đã xong' : 'Hạn ' + dmy(t.due), t.status === 'done' ? 'success' : 'warning')}</li>`).join('')}</ul>` : emptyBox('Chưa có việc liên quan', 'Tạo việc để nhắc lễ tân hoặc điều dưỡng liên hệ người bệnh.')}
        </section>
      </div>
      <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">LƯỢT KHÁM</span><h2>${visits.length} lượt</h2></div></div>
        ${visits.length ? `<div class="table-scroll"><table class="data-table ops-table"><thead><tr><th>Ngày</th><th>Giờ</th><th>Bác sĩ</th><th>Lý do</th><th>Trạng thái</th><th><span class="sr-only">Mở</span></th></tr></thead><tbody>${visits.map((v) => `<tr><td>${e(dmy(v.date))}</td><td class="mono">${e(v.slot)}</td><td>${e(v.clinician?.name || '')}</td><td>${e(v.reason)}</td><td>${statusPill(x, v)}</td><td><a class="btn btn-secondary" ${UI.buttonAttrs('btn-secondary')} href="#/ops/visits/${e(v.id)}">Mở</a></td></tr>`).join('')}</tbody></table></div>` : emptyBox('Chưa có lượt khám', 'Người bệnh chưa có lịch hẹn nào.')}
      </section></section>`;
  }
  function tasksPage(x, path) {
    const f = ops.taskFilter, all = st.clinic.tasks;
    const list = all.filter((t) => f === 'all' || t.status === f).sort((a, b) => a.due.localeCompare(b.due));
    return `<section class="screen doctor-screen ops-screen">${heading('VẬN HÀNH PHÒNG KHÁM', 'Việc cần làm', 'Việc theo dõi sau khám, gọi lại và yêu cầu cấp lại thuốc từ người bệnh.', `<a class="btn btn-primary" ${UI.buttonAttrs('btn-primary')} href="#/ops/tasks/new">Tạo việc mới</a>`)}${subnav(path)}${banner(x)}
      <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}>
      <div class="ops-filters" role="group" aria-label="Lọc việc">${[['open', 'Đang mở'], ['done', 'Đã xong'], ['all', 'Tất cả']].map(([k, l]) => `<button type="button" data-action="ops-task-filter" data-value="${k}" aria-pressed="${f === k}">${l} <span>${k === 'all' ? all.length : all.filter((t) => t.status === k).length}</span></button>`).join('')}</div>
      ${list.length ? `<ul class="ops-task-list">${list.map((t) => { const p = person(t.patientId); const overdue = t.status === 'open' && t.due < today(); return `<li class="ops-task ${t.status === 'done' ? 'is-done' : ''}" data-task="${e(t.id)}"><div class="ops-task-main"><div class="ops-task-meta">${x.pill(PRIORITY[t.priority]?.[0] || 'Bình thường', PRIORITY[t.priority]?.[1] || 'neutral')}${t.status === 'done' ? x.pill('Đã xong', 'success') : overdue ? x.pill('Quá hạn', 'warning') : ''}${t.source === 'refill' ? x.pill('Yêu cầu cấp lại thuốc', 'info') : ''}</div><h3>${e(t.title)}</h3><p>${p ? `<a class="text-link" href="#/ops/patients/${e(p.id)}">${e(p.name)}</a>, ` : ''}${e(t.assignee)}, Hạn ${e(dmy(t.due))}</p>${t.note ? `<p class="ops-muted">${e(t.note)}</p>` : ''}</div><div class="ops-task-actions">${t.status === 'open' ? x.btn('Hoàn thành', 'ops-task-done', 'btn-primary', `data-id="${e(t.id)}"`) : x.btn('Mở lại', 'ops-task-reopen', 'btn-secondary', `data-id="${e(t.id)}"`)}<a class="btn btn-secondary" ${UI.buttonAttrs('btn-secondary')} href="#/ops/tasks/${e(t.id)}">Sửa</a>${x.btn('Xóa', 'ops-task-delete', 'btn-outline', `data-id="${e(t.id)}"`)}</div></li>`; }).join('')}</ul>`
        : emptyBox(f === 'open' ? 'Không còn việc đang mở' : f === 'done' ? 'Chưa có việc đã xong' : 'Chưa có việc nào', 'Tạo việc mới hoặc tạo từ trang xử lý lượt khám.', `<a class="btn btn-primary" ${UI.buttonAttrs('btn-primary')} href="#/ops/tasks/new">Tạo việc mới</a>`)}
      </section>${modal(x)}</section>`;
  }
  function taskForm(x, path, id) {
    const editing = id !== 'new';
    const t = editing ? st.clinic.tasks.find((k) => k.id === id) : null;
    if (editing && !t) return notFound(x, 'Không tìm thấy việc cần làm', '/ops/tasks', 'Về danh sách việc');
    const preset = new URLSearchParams(location.hash.split('?')[1] || '').get('patient') || '';
    const v = ops.forms.taskEdit || t || { title: '', due: M.localDate(1), assignee: 'Lễ tân', priority: 'normal', note: '', patientId: preset };
    return `<section class="screen doctor-screen ops-screen">${heading('VẬN HÀNH PHÒNG KHÁM', editing ? 'Sửa việc cần làm' : 'Tạo việc cần làm', editing ? t.id : 'Giao việc cho lễ tân, điều dưỡng hoặc điều phối.', link('/ops/tasks', '← Việc cần làm'))}${subnav('/ops/tasks')}${banner(x)}
      <section class="doctor-surface ops-panel ops-narrow" ${UI.cardAttrs('surface')}>${formWrap('taskEdit', `<input type="hidden" name="taskId" value="${e(t?.id || '')}">` + field('patientId', 'Người bệnh', selectC('patientId', v.patientId || '', [['', 'Không gắn người bệnh'], ...allPatients().map((p) => [p.id, p.name])])) + taskFields(v) + (editing ? field('status', 'Trạng thái', selectC('status', v.status, [['open', 'Đang mở'], ['done', 'Đã xong']])) : ''), editing ? 'Lưu thay đổi' : 'Tạo việc', x, `<a class="btn btn-outline" ${UI.buttonAttrs('btn-outline')} href="#/ops/tasks" data-action="ops-cancel-form" data-form="taskEdit">Hủy</a>`)}</section></section>`;
  }
  function ticketsPage(x, path) {
    const f = ops.ticketFilter, all = (st.tickets || []).slice().sort((a, b) => (b.thread.at(-1)?.at || '').localeCompare(a.thread.at(-1)?.at || ''));
    const list = all.filter((t) => f === 'active' ? t.status !== 'closed' : t.status === 'closed');
    return `<section class="screen doctor-screen ops-screen">${heading('VẬN HÀNH PHÒNG KHÁM', 'Yêu cầu hỗ trợ', 'Câu hỏi người bệnh gửi từ ứng dụng. Phản hồi tại đây hiện ngay trong mục Hỗ trợ của người bệnh.')}${subnav(path)}${banner(x)}
      <section class="doctor-surface ops-panel" ${UI.cardAttrs('surface')}><div class="ops-filters" role="group" aria-label="Lọc yêu cầu">${[['active', 'Đang mở'], ['closed', 'Đã đóng']].map(([k, l]) => `<button type="button" data-action="ops-ticket-filter" data-value="${k}" aria-pressed="${f === k}">${l} <span>${all.filter((t) => k === 'active' ? t.status !== 'closed' : t.status === 'closed').length}</span></button>`).join('')}</div>
      ${list.length ? `<div class="table-scroll"><table class="data-table ops-table"><thead><tr><th>Mã</th><th>Tiêu đề</th><th>Chủ đề</th><th>Cập nhật</th><th>Trạng thái</th><th><span class="sr-only">Mở</span></th></tr></thead><tbody>${list.map((t) => `<tr><td class="mono">${e(t.id)}</td><td>${e(t.subject)}</td><td>${e(t.topic)}</td><td>${e(stamp(t.thread.at(-1)?.at || t.createdAt))}</td><td>${x.pill(TICKET[t.status][0], TICKET[t.status][1])}</td><td><a class="btn btn-secondary" ${UI.buttonAttrs('btn-secondary')} href="#/ops/tickets/${e(t.id)}">Mở</a></td></tr>`).join('')}</tbody></table></div>`
        : emptyBox(f === 'active' ? 'Không có yêu cầu đang mở' : 'Chưa có yêu cầu đã đóng', 'Yêu cầu mới từ ứng dụng người bệnh sẽ xuất hiện ở đây.')}</section></section>`;
  }
  function ticketPage(x, path, id) {
    const t = (st.tickets || []).find((k) => k.id === id);
    if (!t) return notFound(x, 'Không tìm thấy yêu cầu', '/ops/tickets', 'Về danh sách yêu cầu');
    const owner = st.profiles.find((p) => p.relation === 'self');
    return `<section class="screen doctor-screen ops-screen">${heading('VẬN HÀNH PHÒNG KHÁM', t.subject, t.id + ', ' + t.topic, link('/ops/tickets', '← Yêu cầu hỗ trợ'))}${subnav('/ops/tickets')}${banner(x)}
      <section class="doctor-surface ops-panel ops-narrow" ${UI.cardAttrs('surface')}><div class="doctor-section-head"><div><span class="doctor-overline">${e(owner?.name || 'Người bệnh')}</span><h2>Trao đổi</h2></div>${x.pill(TICKET[t.status][0], TICKET[t.status][1])}</div>
        <ol class="ops-thread">${t.thread.map((m) => `<li class="${m.from === 'staff' ? 'is-staff' : ''}"><small>${e(m.from === 'staff' ? m.author || 'Phòng khám' : owner?.name || 'Người bệnh')}, ${e(stamp(m.at))}</small><p>${e(m.text)}</p></li>`).join('')}</ol>
        ${t.status === 'closed' ? `<p class="ops-muted">Yêu cầu đã đóng${t.closeReason ? ': ' + e(t.closeReason) : ''}. Người bệnh có thể mở lại.</p>` : formWrap('reply', `<input type="hidden" name="ticketId" value="${e(t.id)}">` + field('reply', 'Trả lời người bệnh', areaC('reply', ops.forms.reply?.reply || '', 'maxlength="1000"'), 'Không gửi chẩn đoán hay hướng dẫn điều trị qua kênh này.'), 'Gửi trả lời', x, x.btn('Đóng yêu cầu', 'ops-ticket-close', 'btn-outline', `data-id="${e(t.id)}"`))}
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
    note: { note: (v) => !v.trim() ? 'Nhập nội dung ghi chú.' : '' },
    task: { title: (v) => v.trim().length < 3 ? 'Tên việc cần ít nhất 3 ký tự.' : '', due: (v) => !M.validDate(v) ? 'Chọn hạn xử lý.' : '' },
    taskEdit: { title: (v) => v.trim().length < 3 ? 'Tên việc cần ít nhất 3 ký tự.' : '', due: (v) => !M.validDate(v) ? 'Chọn hạn xử lý.' : '' },
    followup: { date: (v) => !M.validDate(v) ? 'Chọn ngày tái khám.' : v <= today() ? 'Ngày tái khám phải sau hôm nay.' : '', reason: (v) => !v.trim() ? 'Nhập lý do tái khám.' : '' },
    reply: { reply: (v) => !v.trim() ? 'Nhập nội dung trả lời.' : '' },
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
    if (name === 'note') return run(x, cta, () => { const f = findVisit(d.visitId); if (!f) return { ok: false, message: 'Lượt khám không còn tồn tại.' }; (f.v.staffNotes ??= []).push({ id: Store.uid('note'), text: d.note.trim(), author: st.clinic.staffName, at: new Date().toISOString() }); clear(); }, { done: 'Đã lưu ghi chú nội bộ', alertIn });
    if (name === 'task') return run(x, cta, () => { st.clinic.tasks.unshift({ id: 'TK-' + (++st.clinic.sequence.task), title: d.title.trim(), patientId: d.patientId, visitId: d.visitId, due: d.due, priority: d.priority, assignee: d.assignee, note: d.note.trim(), status: 'open', createdAt: new Date().toISOString() }); clear(); }, { done: 'Đã tạo việc cần làm', alertIn });
    if (name === 'taskEdit') return run(x, cta, () => {
      const fields = { title: d.title.trim(), patientId: d.patientId, due: d.due, priority: d.priority, assignee: d.assignee, note: d.note.trim() };
      if (d.taskId) { const t = st.clinic.tasks.find((k) => k.id === d.taskId); if (!t) return { ok: false, message: 'Việc này không còn tồn tại.' }; const wasOpen = t.status === 'open'; Object.assign(t, fields, { status: d.status || t.status }); if (wasOpen && t.status === 'done') onTaskDone(t); }
      else st.clinic.tasks.unshift({ id: 'TK-' + (++st.clinic.sequence.task), ...fields, visitId: null, status: 'open', createdAt: new Date().toISOString() });
      clear();
    }, { done: d.taskId ? 'Đã lưu việc cần làm' : 'Đã tạo việc cần làm', go: '/ops/tasks', alertIn });
    if (name === 'followup') return run(x, cta, () => {
      const f = findVisit(d.visitId); if (!f) return { ok: false, message: 'Lượt khám không còn tồn tại.' };
      const at = new Date().toISOString(), scope = f.scope;
      const id = scope === 'account' ? 'CF-' + String(++st.sequence).padStart(4, '0') : 'PK-0' + (++st.clinic.sequence.visit);
      const v = { ...structuredClone(f.v), id, date: d.date, slot: d.slot, mode: d.mode, reason: d.reason.trim(), status: 'confirmed', purpose: 'followup', previousId: f.v.id, labs: [], staffNotes: [], cancelReason: '', rescheduledTo: null, createdAt: at,
        payment: { status: 'unpaid', amount: null, reason: '', dueDate: '', history: [] }, care: { status: 'monitoring', referral: null }, communication: { result: 'pending', explanation: 'pending', callback: 'none' },
        history: [{ status: 'pending', at, actor: 'staff' }, { status: 'confirmed', at, actor: 'staff' }] };
      for (const k of ['lockedAt', 'signedAt', 'signedBy', 'summary']) delete v[k];
      (scope === 'account' ? st.visits : st.clinic.visits).push(v);
      if (scope === 'account') notifyPatient({ visitId: id, patientId: v.patientId, screen: 'D2', title: 'Phòng khám đã đặt lịch tái khám', body: dmy(d.date) + ', ' + d.slot + ' với ' + (v.clinician?.name || 'bác sĩ phụ trách') + '.' });
      clear();
    }, { done: 'Đã đặt lịch tái khám', alertIn });
    if (name === 'reply') return run(x, cta, () => {
      const t = (st.tickets || []).find((k) => k.id === d.ticketId); if (!t || t.status === 'closed') return { ok: false, message: 'Yêu cầu đã đóng.' };
      t.thread.push({ from: 'staff', author: st.clinic.staffName, text: d.reply.trim(), at: new Date().toISOString() }); t.status = 'answered';
      notifyPatient({ ticketId: t.id, screen: 'T2', title: 'Phòng khám đã trả lời yêu cầu ' + t.id, body: 'Mở yêu cầu để xem phản hồi.' });
      clear();
    }, { done: 'Đã gửi trả lời cho người bệnh', alertIn });
  });
  function onTaskDone(t) {
    t.completedAt = new Date().toISOString();
    if (t.source !== 'refill') return;
    const r = (st.prescriptions || []).find((k) => k.id === t.rxId);
    if (r?.refill?.status === 'requested') {
      r.refill = { ...r.refill, status: 'reviewed', reviewedAt: t.completedAt };
      (r.refillHistory ??= []).push({ status: 'reviewed', at: t.completedAt });
      notifyPatient({ rxId: r.id, screen: 'M2', title: 'Phòng khám đã xem xét yêu cầu cấp lại thuốc', body: r.name + '. Đây là mô phỏng, chưa có đơn mới.' });
    }
  }

  /* ---------- actions ---------- */
  function action(b, x) {
    lastCtx = x;
    const a = b.dataset.action, id = b.dataset.id;
    const simple = { 'ops-confirm': 'Đã xác nhận lịch hẹn', 'ops-checkin': 'Đã check-in người bệnh', 'ops-start': 'Đã bắt đầu lượt khám' };
    if (simple[a]) { run(x, b, () => applySteps(a, id), { done: simple[a] }); return true; }
    if (a === 'ops-complete') { ops.modal = { type: 'complete', id }; x.render(); document.querySelector('#ops-modal-title')?.closest('.dialog-card')?.querySelector('.btn-primary')?.focus(); return true; }
    if (a === 'ops-noshow') { ops.modal = { type: 'noshow', id }; x.render(); return true; }
    if (a === 'ops-complete-confirm') { run(x, b, () => applySteps('ops-complete', id), { done: 'Đã hoàn tất lượt khám' }); return true; }
    if (a === 'ops-noshow-confirm') { run(x, b, () => applySteps('ops-noshow', id), { done: 'Đã ghi nhận không đến' }); return true; }
    if (a === 'ops-close-modal') { ops.modal = null; x.render(); return true; }
    if (a === 'ops-queue-filter') { ops.queueFilter = b.dataset.value; x.render(); return true; }
    if (a === 'ops-task-filter') { ops.taskFilter = b.dataset.value; x.render(); return true; }
    if (a === 'ops-ticket-filter') { ops.ticketFilter = b.dataset.value; x.render(); return true; }
    if (a === 'ops-retry-load') { load(x); x.render(); return true; }
    if (a === 'ops-retry') { ops.error = null; ops.retry?.(); return true; }
    if (a === 'ops-dismiss-error') { ops.error = null; x.render(); return true; }
    if (a === 'ops-resubmit') { document.querySelector(`form[data-ops-form="${b.dataset.form}"]`)?.requestSubmit(); return true; }
    if (a === 'ops-cancel-form') { delete ops.forms[b.dataset.form]; x.go('/ops/tasks'); return true; }
    if (a === 'ops-task-done') { run(x, b, () => { const t = st.clinic.tasks.find((k) => k.id === id); if (!t) return { ok: false, message: 'Việc không còn tồn tại.' }; t.status = 'done'; onTaskDone(t); }, { done: 'Đã hoàn thành việc' }); return true; }
    if (a === 'ops-task-reopen') { run(x, b, () => { const t = st.clinic.tasks.find((k) => k.id === id); if (!t) return { ok: false, message: 'Việc không còn tồn tại.' }; t.status = 'open'; }, { done: 'Đã mở lại việc' }); return true; }
    if (a === 'ops-task-delete') { ops.modal = { type: 'delete-task', id }; x.render(); return true; }
    if (a === 'ops-task-delete-confirm') { run(x, b, () => { const i = st.clinic.tasks.findIndex((k) => k.id === id); if (i < 0) return { ok: false, message: 'Việc không còn tồn tại.' }; st.clinic.tasks.splice(i, 1); }, { done: 'Đã xóa việc', go: location.hash.startsWith('#/ops/tasks/') ? '/ops/tasks' : undefined }); return true; }
    if (a === 'ops-note-delete') { ops.modal = { type: 'delete-note', id, note: b.dataset.note }; x.render(); return true; }
    if (a === 'ops-note-delete-confirm') { run(x, b, () => { const f = findVisit(id); const i = f?.v.staffNotes?.findIndex((n) => n.id === b.dataset.note) ?? -1; if (i < 0) return { ok: false, message: 'Ghi chú không còn tồn tại.' }; f.v.staffNotes.splice(i, 1); }, { done: 'Đã xóa ghi chú' }); return true; }
    if (a === 'ops-ticket-close') { ops.modal = { type: 'close-ticket', id }; x.render(); return true; }
    if (a === 'ops-ticket-close-confirm') { run(x, b, () => { const t = (st.tickets || []).find((k) => k.id === id); if (!t) return { ok: false, message: 'Yêu cầu không còn tồn tại.' }; t.status = 'closed'; t.closeReason = 'Phòng khám đã đóng yêu cầu'; }, { done: 'Đã đóng yêu cầu' }); return true; }
    if (a === 'ops-fail-toggle') { Store.failNext.set(!Store.failNext.get()); x.notify(Store.failNext.get() ? 'Thao tác lưu hoặc tải tiếp theo sẽ gặp lỗi kết nối mô phỏng' : 'Đã tắt lỗi mô phỏng'); return true; }
    if (a === 'confirm-reset') { st = Store.reset(); ops.forms = {}; ops.error = null; ops.gate.path = null; return false; }
    return false;
  }
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && ops.modal) { ops.modal = null; ctxRender(); } });
  /** Header entry: compact link plus the simulated-failure switch. */
  function headerLinks() {
    return `<a class="ops-header-link" href="#/ops/queue" title="Vận hành phòng khám: hàng chờ, việc cần làm, yêu cầu hỗ trợ">Vận hành</a>`;
  }
  root.CareFlowClinicOps = { permitted, page, action, title, headerLinks };
})(window);
