/* CareFlow full-product end-to-end test (patient app + clinic workspace).
 *
 * Runs against a static server at the repo root:
 *   py -3 -m http.server 8903 --bind 127.0.0.1
 *   NODE_PATH=<dir containing playwright> node tests/full-product.e2e.cjs
 *
 * Uses the plain `playwright` library (no test runner) so it works with any
 * installed Playwright >= 1.40. Every step waits for selectors after async
 * actions (the demo store simulates ~400 ms latency).
 */
'use strict';
const { chromium } = require('playwright');
const BASE = process.env.CAREFLOW_BASE || 'http://127.0.0.1:8903';
const PATIENT = BASE + '/prototype/';
const STAFF = BASE + '/staff-prototype/';
const PRODUCT_SCREENS = ['M1', 'M2', 'M3', 'K6', 'K7', 'K8', 'K9', 'K10', 'K11', 'K12', 'T1', 'T2', 'T3'];

let checks = 0;
const results = [];
const consoleErrors = [];
function assert(cond, message) { checks++; if (!cond) throw new Error('Assertion failed: ' + message); }

async function step(name, fn) {
  const started = Date.now();
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name} (${Date.now() - started} ms)`);
  } catch (err) {
    results.push({ name, ok: false, error: err });
    console.log(`  ✗ ${name}\n      ${String(err.message).split('\n').slice(0, 6).join('\n      ')}`);
    throw err;
  }
}

function attach(page, label) {
  page.setDefaultTimeout(10000);
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`[${label}] ${m.text()}`); });
  page.on('pageerror', (e) => consoleErrors.push(`[${label}] pageerror: ${e.message}`));
}

/* ---------- patient helpers ---------- */
const P = (page) => ({
  content: page.locator('#phone-content'),
  async hash(h) { await page.evaluate((x) => { location.hash = x; }, h); },
  /** Wait for a screen id and for the simulated load to finish. */
  async screen(id) {
    await page.waitForSelector(`#phone-content[data-screen="${id}"]`);
    await page.waitForSelector('#phone-content:not(:has([data-cf-state="loading"]))');
    await this.audit();
  },
  async open(h, id) { await this.hash(h); await this.screen(id); },
  async text(t) { await page.locator('#phone-content', { hasText: t }).waitFor(); checks++; },
  async noText(t) { assert(!(await page.locator('#phone-content').innerText()).includes(t), `"${t}" should not be visible`); },
  async submit(form) { await page.click(`form[data-form="${form}"] [type=submit]`); },
  async fieldError(form, name, text) {
    const loc = page.locator(`form[data-form="${form}"] [data-error-for="${name}"]`);
    await loc.filter({ hasText: text }).waitFor();
    assert((await page.locator(`form[data-form="${form}"] [name="${name}"]`).first().getAttribute('aria-invalid')) === 'true', `${name} marked aria-invalid`);
  },
  async state() { return page.evaluate(() => JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state); },
  /** No href="#", and every button on product screens does something. */
  async audit() {
    const dead = await page.locator('a[href="#"]').count();
    assert(dead === 0, `no a[href="#"] (found ${dead}) on ${page.url()}`);
    const id = await page.locator('#phone-content').getAttribute('data-screen');
    if (PRODUCT_SCREENS.includes(id)) {
      const inert = await page.locator('#phone-content button:not([data-action]):not([type="submit"]):not(.cf-field-control)').count();
      assert(inert === 0, `every button on ${id} has an action (found ${inert} without)`);
    }
  },
  async dialogClick(name) { await page.locator('#dialog-actions').getByRole('button', { name, exact: true }).click(); },
});

async function login(page, p) {
  await page.goto(PATIENT + '?scenario=demo#/login');
  await page.fill('#phone', '0900000000');
  await p.submit('otp');
  await page.fill('#otp', '123456');
  await page.check('#consent');
  await p.submit('verify');
  await p.screen('A2');
  await p.submit('match');
  await p.screen('B1');
}

async function patientSuite(page) {
  const p = P(page);
  await step('Patient: sign in to the seeded demo account', async () => {
    await login(page, p);
    await p.text('Minh Anh');
    await p.text('CF-2041');
  });

  await step('Appointments: loading state, upcoming vs past lists', async () => {
    await p.hash('#/appointments');
    await page.waitForSelector('#phone-content [data-cf-state="loading"]');
    await p.screen('D1');
    await p.text('BS. Trần Thu Hà');
    await page.click('[data-action="filter"][data-filter="past"]');
    await page.waitForSelector('[data-action="filter"][data-filter="past"][aria-pressed="true"]');
    await p.text('BS. Trần Phương Linh');
    await page.click('[data-action="filter"][data-filter="cancelled"]');
    await page.waitForSelector('[data-action="filter"][data-filter="cancelled"][aria-pressed="true"]');
    await page.click('[data-action="filter"][data-filter="upcoming"]');
  });

  let bookedId;
  await step('Appointments: book with specialty, doctor, slot and reason', async () => {
    await page.click('#bottom-nav .nav-book');
    await p.screen('C1');
    await page.check('input[name="Người đi khám"][value="p1"]', { force: true });
    await p.submit('patient');
    await p.screen('C2');
    await p.submit('reason');
    await page.locator('#form-error').filter({ hasText: /./ }).waitFor();
    await page.fill('#reason', 'Hồi hộp khi leo cầu thang, muốn kiểm tra tim mạch');
    await p.submit('reason');
    await p.screen('C3');
    await page.check('form input[value="normal"]', { force: true });
    await p.submit('safety');
    await p.screen('C6');
    await page.check('form input[value="onsite"]', { force: true });
    await p.submit('mode');
    await p.screen('C7');
    await page.selectOption('#specialty', 'Tim mạch');
    await page.waitForSelector('#clinicianId option[value="dr-quan"]', { state: 'attached' });
    await page.selectOption('#clinicianId', 'dr-quan');
    const day = await page.locator('[data-action="quick-date"]').nth(2).getAttribute('data-date');
    await page.click(`[data-action="quick-date"][data-date="${day}"]`);
    await page.check('input[name="slot"][value="10:30"]', { force: true });
    await p.submit('slot');
    await p.screen('C8');
    await p.text('Hồi hộp khi leo cầu thang');
    await page.check('#consent');
    await p.submit('booking');
    await p.screen('C9');
    const s = await p.state();
    const v = s.visits.find((x) => x.reason.startsWith('Hồi hộp'));
    assert(v && v.clinician?.id === 'dr-quan' && v.slot === '10:30' && v.date === day, 'booked visit stores doctor, slot and date');
    bookedId = v.id;
  });

  await step('Appointments: detail shows doctor; reschedule creates a linked replacement', async () => {
    await p.open('#/appointments/' + bookedId, 'D2');
    await p.text('BS. Lê Minh Quân');
    await page.click('[data-action="go"][data-to="D3"]');
    await p.screen('D3');
    await page.click('[data-action="rebook"]');
    await p.screen('C7');
    assert(await page.inputValue('#clinicianId') === 'dr-quan', 'reschedule keeps the chosen doctor');
    await page.check('input[name="slot"][value="14:00"]', { force: true });
    await p.submit('slot');
    await p.screen('C8');
    await page.check('#consent');
    await p.submit('booking');
    await p.screen('C9');
    const s = await p.state();
    const old = s.visits.find((x) => x.id === bookedId);
    assert(old.status === 'cancelled' && old.rescheduledTo, 'old visit cancelled and linked to the replacement');
    const repl = s.visits.find((x) => x.id === old.rescheduledTo);
    assert(repl.slot === '14:00' && repl.previousId === bookedId, 'replacement visit has the new slot');
  });

  await step('Appointments: cancel with a reason (validation, confirm dialog)', async () => {
    await p.open('#/appointments/CF-2044', 'D2');
    await page.click('[data-action="go"][data-to="D4"]');
    await p.screen('D4');
    await page.check('form[data-form="cancel"] input[value="other"]', { force: true });
    await p.submit('cancel');
    await page.locator('#form-error', { hasText: 'lý do hủy' }).waitFor();
    await page.fill('#cancelNote', 'Tôi đi công tác tuần đó');
    await p.submit('cancel');
    await page.waitForSelector('#dialog[open]');
    await p.dialogClick('Xác nhận hủy lịch');
    await p.screen('D2');
    await p.text('Tôi đi công tác tuần đó');
    assert((await p.state()).visits.find((v) => v.id === 'CF-2044').status === 'cancelled', 'CF-2044 cancelled');
  });

  await step('Visit summary and results detail', async () => {
    await p.open('#/appointments/CF-2031/summary', 'H6');
    await p.text('Bác sĩ đã ghi nhận nội dung buổi khám');
    await p.text('Thuốc minh họa A');
    await p.open('#/appointments/CF-2031/results', 'H7');
    await p.text('Công thức máu (minh họa)');
    await page.locator('[data-action="go"][data-to="F2"][data-lab="lab-1"]').first().click();
    await p.screen('F2');
    await p.text('Nhận xét của bác sĩ');
  });

  await step('Medications: list filters, detail, not-found', async () => {
    await p.open('#/medications', 'M1');
    await p.text('Thuốc minh họa B');
    await page.click('[data-action="p-filter"][data-value="ended"]');
    await p.text('Siro minh họa C');
    await page.click('[data-action="p-filter"][data-value="active"]');
    await page.click('[data-p-rx-id="RX-3101"]');
    await p.screen('M2');
    await p.text('BS. Trần Thu Hà');
    await p.open('#/medications/RX-0000', 'M2');
    await page.waitForSelector('[data-cf-state="not-found"]');
    await p.text('Không tìm thấy đơn thuốc');
  });

  await step('Medications: refill request with inline validation, simulated failure and retry', async () => {
    await p.open('#/medications/RX-3101/refill', 'M3');
    await p.submit('refill');
    await p.fieldError('refill', 'supply', 'Chọn lượng thuốc');
    await p.fieldError('refill', 'ack', 'xác nhận');
    await page.check('input[name="supply"][value="lt3"]');
    await page.check('input[name="pickup"][value="pharmacy"]');
    await page.fill('#refillNote', 'Tôi có thể nhận điện thoại sau 17 giờ.');
    await page.check('#ack');
    await page.click('#review-toggle');
    await page.click('#review-tools [data-action="demo-fail-toggle"]');
    await page.waitForSelector('#review-tools [data-action="demo-fail-toggle"][aria-pressed="true"]');
    await page.click('#review-toggle');
    await p.submit('refill');
    await page.waitForSelector('form[data-form="refill"] [data-cf-state="error"]');
    await p.text('Không kết nối được máy chủ demo');
    assert(!(await p.state()).prescriptions.find((r) => r.id === 'RX-3101').refill, 'failed save leaves data unchanged');
    await page.click('form[data-form="refill"] [data-action="p-resubmit"]');
    await p.screen('M2');
    await p.text('Đã gửi yêu cầu cấp lại');
  });

  await step('Medications: cancel a refill request, then request again', async () => {
    await page.click('[data-action="rx-cancel-refill"]');
    await page.waitForSelector('#dialog[open]');
    await p.dialogClick('Hủy yêu cầu');
    await page.waitForSelector('#dialog[open]', { state: 'detached' });
    await p.screen('M2');
    await p.text('Yêu cầu cấp lại thuốc');
    assert((await p.state()).prescriptions.find((r) => r.id === 'RX-3101').refill === null, 'refill cleared');
    await page.click('[data-action="p-nav"][data-to="M3"]');
    await p.screen('M3');
    await page.check('input[name="supply"][value="out"]');
    await page.check('input[name="pickup"][value="call"]');
    await page.check('#ack');
    await p.submit('refill');
    await p.screen('M2');
    await p.text('Đã gửi yêu cầu cấp lại');
  });

  await step('Profile: edit with inline validation', async () => {
    await p.open('#/profile', 'K2');
    await page.click('.cf-profile-allergy [data-to="K6"]');
    await p.screen('K6');
    await page.fill('#name', '');
    await page.fill('#phone', '12345');
    await page.fill('#email', 'minhanh@');
    await p.submit('profile-edit');
    await p.fieldError('profile-edit', 'name', 'Nhập họ và tên');
    await p.fieldError('profile-edit', 'phone', '10 chữ số');
    await p.fieldError('profile-edit', 'email', 'định dạng');
    await page.fill('#name', 'Nguyễn Minh Anh Thư');
    await page.fill('#phone', '0912345678');
    await page.fill('#email', 'minhanh.thu@example.com');
    await page.fill('#allergies', 'Dị ứng phấn hoa (tự khai báo)');
    await p.submit('profile-edit');
    await p.screen('K2');
    await p.text('Đã lưu thông tin cá nhân');
    await p.text('Nguyễn Minh Anh Thư');
    await p.text('Dị ứng phấn hoa');
  });

  await step('Family: create, view, edit, delete; delete blocked when history exists', async () => {
    await p.open('#/profile/family', 'K7');
    await p.text('Trần Thị Mai');
    await page.click('[data-action="p-nav"][data-to="K8"]');
    await p.screen('K8');
    await p.submit('family-edit');
    await p.fieldError('family-edit', 'name', 'Nhập họ và tên');
    await p.fieldError('family-edit', 'relation', 'Chọn mối quan hệ');
    await page.fill('#name', 'Nguyễn Văn Hùng');
    await page.fill('#dob', '2030-01-01');
    await page.selectOption('#relation', 'father');
    await p.submit('family-edit');
    await p.fieldError('family-edit', 'dob', 'tương lai');
    await page.fill('#dob', '1960-04-20');
    await p.submit('family-edit');
    await p.screen('K9');
    await p.text('Đã thêm hồ sơ người thân');
    await p.text('Bố');
    await page.click('[data-action="p-nav"][data-to="K10"]');
    await p.screen('K10');
    await page.selectOption('#relation', 'relative');
    await page.fill('#phone', '0987000111');
    await p.submit('family-edit');
    await p.screen('K9');
    await p.text('Người thân khác');
    await page.click('[data-action="family-delete"]');
    await page.waitForSelector('#dialog[open]');
    await p.dialogClick('Xóa hồ sơ');
    await p.screen('K7');
    await p.noText('Nguyễn Văn Hùng');
    await page.click('[data-p-person-id="p2"]');
    await p.screen('K9');
    await page.click('[data-action="family-delete"]');
    await page.locator('#dialog[open]', { hasText: 'Chưa thể xóa' }).waitFor();
    await p.dialogClick('Đóng');
  });

  await step('Insurance: edit with validation, remove (empty state), add again', async () => {
    await p.open('#/profile/insurance', 'K11');
    await p.text('DN4797900000128');
    await page.click('[data-action="p-nav"][data-to="K12"]');
    await p.screen('K12');
    await page.fill('#number', 'AB123');
    await page.fill('#validTo', '2020-01-01');
    await p.submit('insurance');
    await p.fieldError('insurance', 'number', '15 ký tự');
    await page.fill('#number', 'hn4797911112222');
    await page.fill('#validTo', '2031-12-31');
    await p.submit('insurance');
    await p.screen('K11');
    await p.text('HN4797911112222');
    await p.text('31/12/2031');
    await page.click('[data-action="insurance-remove"]');
    await page.waitForSelector('#dialog[open]');
    await p.dialogClick('Xóa');
    await p.screen('K11');
    await p.text('Chưa có thông tin bảo hiểm');
    await page.click('[data-action="p-nav"][data-to="K12"]');
    await p.screen('K12');
    await page.selectOption('#type', 'private');
    await page.fill('#number', 'PVI-2026-7781');
    await page.fill('#holder', 'Nguyễn Minh Anh Thư');
    await page.fill('#validTo', '2030-06-30');
    await p.submit('insurance');
    await p.screen('K11');
    await p.text('Bảo hiểm sức khỏe tư nhân');
  });

  await step('Support: create ticket (validation), detail thread, reply, close, reopen', async () => {
    await p.open('#/support', 'K5');
    await page.click('[data-action="support-requests"]');
    await p.screen('T1');
    await p.text('Biên lai lượt khám CF-2031');
    await page.click('[data-action="p-nav"][data-to="T3"]');
    await p.screen('T3');
    await p.submit('ticket-new');
    await p.fieldError('ticket-new', 'subject', 'Nhập tiêu đề');
    await p.fieldError('ticket-new', 'body', 'Nhập nội dung');
    await page.selectOption('#topic', 'Kết quả');
    await page.fill('#subject', 'Hỏi về kết quả X-quang');
    await page.selectOption('#visitId', 'CF-2031');
    await page.fill('#body', 'Tôi muốn hỏi thêm về hình ảnh X-quang của lượt khám trước.');
    await p.submit('ticket-new');
    await p.screen('T2');
    await p.text('Đã gửi yêu cầu');
    await p.text('Chờ phòng khám');
    await p.submit('ticket-reply');
    await p.fieldError('ticket-reply', 'reply', 'Nhập nội dung trả lời');
    await page.fill('#reply', 'Tôi bổ sung: có thể gọi tôi sau 17 giờ.');
    await p.submit('ticket-reply');
    await p.text('Đã gửi trả lời');
    await p.text('có thể gọi tôi sau 17 giờ');
    await page.click('[data-action="ticket-close"]');
    await page.waitForSelector('#dialog[open] #close-reason');
    await page.selectOption('#close-reason', 'Vấn đề đã được giải quyết');
    await p.dialogClick('Đóng yêu cầu');
    await page.locator('#phone-content', { hasText: 'Yêu cầu đã đóng: Vấn đề đã được giải quyết' }).waitFor();
    await page.click('[data-action="ticket-reopen"]');
    await page.waitForSelector('form[data-form="ticket-reply"]');
    await p.open('#/support/tickets', 'T1');
    await page.click('[data-action="p-filter"][data-value="closed"]');
    await p.text('Hỏi cách đổi giờ khám');
    await p.open('#/support/tickets/HT-0000', 'T2');
    await page.waitForSelector('[data-cf-state="not-found"]');
  });

  await step('Notifications: mark one read, then mark all read', async () => {
    await p.open('#/notifications', 'K1');
    const unread = () => p.state().then((s) => s.notifications.filter((n) => !n.read).length);
    const before = await unread();
    assert(before >= 2, 'seeded unread notifications');
    await page.locator('[data-action="notification-read"]').first().click();
    await page.waitForFunction((n) => JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.notifications.filter((x) => !x.read).length === n, before - 1);
    await page.click('[data-action="notifications-read"]');
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.notifications.every((x) => x.read));
  });

  await step('Not-found for unknown ids (appointment, family member)', async () => {
    await p.hash('#/appointments/CF-0000');
    await page.waitForSelector('#phone-content[data-guarded="visit"]');
    await p.audit();
    await p.open('#/profile/family/p999', 'K9');
    await page.waitForSelector('[data-cf-state="not-found"]');
  });

  await step('Recoverable load error: simulated failure, then retry', async () => {
    await p.open('#/home', 'B1');
    await page.click('#review-toggle');
    await page.click('#review-tools [data-action="demo-fail-toggle"]');
    await page.click('#review-toggle');
    await p.hash('#/support/tickets');
    await page.waitForSelector('#phone-content [data-cf-state="error"]');
    await p.text('Chưa tải được dữ liệu');
    await page.click('[data-action="p-retry-load"]');
    await p.screen('T1');
    await page.click('[data-action="p-filter"][data-value="open"]');
    await p.text('Hỏi về kết quả X-quang');
  });
}

/* ---------- staff ---------- */
const S = (page) => ({
  async open(hash, text) {
    await page.goto(STAFF + '#' + hash);
    await page.waitForSelector('main#content:not(:has([data-cf-state="loading"]))');
    if (text) await page.locator('main#content', { hasText: text }).waitFor();
    await this.audit();
  },
  async idle() { await page.waitForSelector('main#content:not(:has([data-cf-state="loading"]))'); await page.waitForSelector('main#content:not(:has([aria-busy="true"]))'); },
  async toast(text) { await page.locator('.toast', { hasText: text }).waitFor(); checks++; },
  async audit() { const dead = await page.locator('a[href="#"]').count(); assert(dead === 0, `no a[href="#"] on ${page.url()} (found ${dead})`); },
  row(id) { return page.locator(`tr[data-visit="${id}"]`); },
});

async function staffSuite(page) {
  const s = S(page), p = P(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await step('Staff: today\'s queue shows patient-app and clinic visits', async () => {
    await s.open('/ops/queue', 'Hàng chờ hôm nay');
    await s.row('CF-2041').waitFor();
    await s.row('PK-0802').waitFor();
    assert(await page.locator('.ops-table tbody tr').count() >= 6, 'queue lists today\'s visits');
    await page.click('[data-action="ops-queue-filter"][data-value="done"]');
    await page.waitForSelector('[data-action="ops-queue-filter"][data-value="done"][aria-pressed="true"]');
    assert(await s.row('PK-0801').count() === 1 && await s.row('CF-2041').count() === 0, 'filter shows finished visits only');
    await page.click('[data-action="ops-queue-filter"][data-value="all"]');
  });

  await step('Staff: check in the patient-app visit; patient sees it in the same tab', async () => {
    await s.row('CF-2041').locator('[data-action="ops-checkin"]').click();
    await s.toast('Đã check-in người bệnh');
    await s.row('CF-2041').locator('[data-action="ops-start"]').waitFor();
    await page.goto(PATIENT + '#/appointments/CF-2041');
    await p.screen('D2');
    await p.text('Phòng khám đã nhận bạn');
    const st = await p.state();
    assert(st.visits.find((v) => v.id === 'CF-2041').status === 'received', 'patient state shows received');
    assert(st.notifications[0].title === 'Phòng khám đã tiếp nhận bạn', 'patient notified of check-in');
  });

  await step('Staff: patient detail and visit detail; add and delete internal notes', async () => {
    await s.open('/ops/patients/p1', 'Nguyễn Minh Anh Thư');
    await page.locator('main', { hasText: 'HN' }).or(page.locator('main', { hasText: 'PVI-2026-7781' })).first().waitFor();
    await page.locator('a[href="#/ops/visits/CF-2041"]').click();
    await page.locator('main h1', { hasText: 'Lượt khám CF-2041' }).waitFor();
    await s.idle();
    await page.click('form[data-ops-form="note"] [type=submit]');
    await page.locator('[data-error-for="note"]', { hasText: 'Nhập nội dung ghi chú' }).waitFor();
    await page.fill('#ops-note', 'Người bệnh mang theo kết quả xét nghiệm cũ.');
    await page.click('form[data-ops-form="note"] [type=submit]');
    await s.toast('Đã lưu ghi chú nội bộ');
    await page.locator('.ops-notes', { hasText: 'kết quả xét nghiệm cũ' }).waitFor();
    await page.click('.ops-notes [data-action="ops-note-delete"]');
    await page.click('.dialog-card [data-action="ops-note-delete-confirm"]');
    await s.toast('Đã xóa ghi chú');
    assert(await page.locator('.ops-notes li').count() === 0, 'note deleted');
    await page.fill('#ops-note', 'Đã kiểm tra giấy tờ tùy thân.');
    await page.click('form[data-ops-form="note"] [type=submit]');
    await page.locator('.ops-notes', { hasText: 'giấy tờ tùy thân' }).waitFor();
  });

  await step('Staff: start and complete the visit (confirm dialog)', async () => {
    await page.click('.ops-actions [data-action="ops-start"]');
    await s.toast('Đã bắt đầu lượt khám');
    await page.click('.ops-actions [data-action="ops-complete"]');
    await page.waitForSelector('.dialog-card');
    await page.click('.dialog-card [data-action="ops-complete-confirm"]');
    await s.toast('Đã hoàn tất lượt khám');
    await page.locator('.ops-panel', { hasText: 'Lượt khám không còn bước xử lý' }).waitFor();
  });

  await step('Staff: create a follow-up task (validation) and a follow-up appointment', async () => {
    await page.fill('#ops-title', '');
    await page.click('form[data-ops-form="task"] [type=submit]');
    await page.locator('[data-error-for="title"]', { hasText: 'ít nhất 3 ký tự' }).waitFor();
    await page.fill('#ops-title', 'Gọi hỏi thăm sau khám');
    await page.selectOption('form[data-ops-form="task"] #ops-assignee', 'Điều dưỡng');
    await page.click('form[data-ops-form="task"] [type=submit]');
    await s.toast('Đã tạo việc cần làm');
    await page.locator('.ops-mini-list', { hasText: 'Gọi hỏi thăm sau khám' }).waitFor();
    await page.fill('form[data-ops-form="followup"] #ops-date', '2020-01-01');
    await page.click('form[data-ops-form="followup"] [type=submit]');
    await page.locator('[data-error-for="date"]', { hasText: 'sau hôm nay' }).waitFor();
    const date = await page.evaluate(() => window.CareFlowModel.localDate(14));
    await page.fill('form[data-ops-form="followup"] #ops-date', date);
    await page.selectOption('form[data-ops-form="followup"] #ops-slot', '15:30');
    await page.click('form[data-ops-form="followup"] [type=submit]');
    await s.toast('Đã đặt lịch tái khám');
  });

  await step('Patient sees the completed visit and the follow-up appointment', async () => {
    await page.goto(PATIENT + '#/appointments/CF-2041');
    await p.screen('D2');
    await p.text('Hoàn tất');
    const st = await p.state();
    const follow = st.visits.find((v) => v.previousId === 'CF-2041' && v.purpose === 'followup');
    assert(follow && follow.status === 'confirmed' && follow.slot === '15:30', 'follow-up visit created for patient');
    await p.open('#/notifications', 'K1');
    await p.text('Phòng khám đã đặt lịch tái khám');
    await p.open('#/appointments/' + follow.id, 'D2');
    await p.text('Tái khám theo hẹn của bác sĩ');
  });

  await step('Staff: tasks — edit, complete (refill review syncs to patient), reopen, delete', async () => {
    await s.open('/ops/tasks', 'Việc cần làm');
    const refill = page.locator('.ops-task', { hasText: 'Xem xét yêu cầu cấp lại RX-3101' });
    await refill.waitFor();
    await refill.locator('[data-action="ops-task-done"]').click();
    await s.toast('Đã hoàn thành việc');
    const task = page.locator('.ops-task', { hasText: 'Gọi hỏi thăm sau khám' });
    await task.locator('a', { hasText: 'Sửa' }).click();
    await page.locator('main h1', { hasText: 'Sửa việc cần làm' }).waitFor();
    await s.idle();
    await page.fill('#ops-title', 'Gọi hỏi thăm sau khám (ưu tiên)');
    await page.selectOption('#ops-priority', 'high');
    await page.click('form[data-ops-form="taskEdit"] [type=submit]');
    await s.toast('Đã lưu việc cần làm');
    const edited = page.locator('.ops-task', { hasText: 'Gọi hỏi thăm sau khám (ưu tiên)' });
    await edited.locator('.pill', { hasText: 'Ưu tiên cao' }).waitFor();
    await edited.locator('[data-action="ops-task-done"]').click();
    await s.toast('Đã hoàn thành việc');
    await page.click('[data-action="ops-task-filter"][data-value="done"]');
    const done = page.locator('.ops-task', { hasText: 'Gọi hỏi thăm sau khám (ưu tiên)' });
    await done.locator('[data-action="ops-task-reopen"]').click();
    await s.toast('Đã mở lại việc');
    await page.click('[data-action="ops-task-filter"][data-value="open"]');
    await page.locator('.ops-task', { hasText: 'Gọi hỏi thăm sau khám (ưu tiên)' }).locator('[data-action="ops-task-delete"]').click();
    await page.click('.dialog-card [data-action="ops-task-delete-confirm"]');
    await s.toast('Đã xóa việc');
    assert(await page.locator('.ops-task', { hasText: 'Gọi hỏi thăm sau khám' }).count() === 0, 'task deleted');
    await s.open('/ops/tasks/new', 'Tạo việc cần làm');
    await page.selectOption('#ops-patientId', 'c-104');
    await page.fill('#ops-title', 'Nhắc mang kết quả cũ');
    await page.click('form[data-ops-form="taskEdit"] [type=submit]');
    await s.toast('Đã tạo việc cần làm');
    await page.locator('.ops-task', { hasText: 'Nhắc mang kết quả cũ' }).waitFor();
  });

  await step('Staff: reply to the patient ticket; patient sees the reply', async () => {
    await s.open('/ops/tickets', 'Yêu cầu hỗ trợ');
    await page.locator('tr', { hasText: 'Hỏi về kết quả X-quang' }).locator('a', { hasText: 'Mở' }).click();
    await page.locator('main h1', { hasText: 'Hỏi về kết quả X-quang' }).waitFor();
    await s.idle();
    await page.fill('#ops-reply', 'Phòng khám đã nhận câu hỏi và sẽ gọi lại cho bạn sau 17 giờ.');
    await page.click('form[data-ops-form="reply"] [type=submit]');
    await s.toast('Đã gửi trả lời cho người bệnh');
    const ticketId = await page.evaluate(() => location.hash.split('/').pop());
    await page.goto(PATIENT + '#/support/tickets/' + ticketId);
    await p.screen('T2');
    await p.text('sẽ gọi lại cho bạn sau 17 giờ');
    await p.text('Phòng khám đã trả lời');
    await p.open('#/medications/RX-3101', 'M2');
    await p.text('Phòng khám đã xem xét');
  });

  await step('Staff: simulated failure shows a recoverable error; retry succeeds', async () => {
    await s.open('/ops/queue', 'Hàng chờ hôm nay');
    await page.click('[data-action="ops-fail-toggle"]');
    await page.waitForSelector('[data-action="ops-fail-toggle"][aria-pressed="true"]');
    await s.row('PK-0804').locator('[data-action="ops-checkin"]').click();
    await page.waitForSelector('.ops-banner[data-cf-state="error"]');
    await page.locator('.ops-banner', { hasText: 'Không kết nối được máy chủ demo' }).waitFor();
    await page.click('.ops-banner [data-action="ops-retry"]');
    await s.toast('Đã check-in người bệnh');
    await s.row('PK-0804').locator('[data-action="ops-start"]').waitFor();
  });

  await step('Staff: not-found for unknown visit, patient and task ids', async () => {
    await s.open('/ops/visits/XX-404', 'Không tìm thấy lượt khám');
    await s.open('/ops/patients/nobody', 'Không tìm thấy người bệnh');
    await s.open('/ops/tasks/TK-0', 'Không tìm thấy việc cần làm');
  });
}

async function resetSuite(page) {
  const p = P(page);
  await step('Reset demo data restores the seed in both apps', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PATIENT + '#/home');
    await p.screen('B1');
    await page.click('#reset-demo');
    await page.waitForSelector('#dialog[open]');
    await Promise.all([page.waitForEvent('load'), p.dialogClick('Đặt lại')]);
    await p.screen('B1');
    const s = await p.state();
    assert(s.visits.find((v) => v.id === 'CF-2041').status === 'confirmed', 'CF-2041 back to confirmed');
    assert(s.visits.find((v) => v.id === 'CF-2044').status === 'confirmed', 'CF-2044 back to confirmed');
    assert(s.tickets.length === 2 && s.insurance.p1.number === 'DN4797900000128', 'tickets and insurance restored');
    assert(s.profiles.find((x) => x.id === 'p1').name === 'Nguyễn Minh Anh', 'profile restored');
    assert(s.clinic.tasks.length === 3 && s.authenticated === true, 'clinic tasks restored, still signed in');
    await page.setViewportSize({ width: 1440, height: 900 });
    await S(page).open('/ops/queue', 'Hàng chờ hôm nay');
    await S(page).row('CF-2041').locator('[data-action="ops-checkin"]').waitFor();
    await S(page).row('PK-0804').locator('[data-action="ops-checkin"]').waitFor();
    await page.click('.footer-reset');
    await page.click('[data-action="confirm-reset"]');
    await S(page).toast('Đã khôi phục phiên làm việc');
  });
}

async function emptySuite(page) {
  const p = P(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => sessionStorage.clear());
  await step('Empty states: medications, tickets, insurance, notifications, staff tickets', async () => {
    await page.goto(PATIENT + '?scenario=empty#/medications');
    await p.screen('M1');
    await p.text('Chưa có thuốc đang dùng');
    await p.open('#/support/tickets', 'T1');
    await p.text('Không có yêu cầu đang mở');
    await p.open('#/profile/insurance', 'K11');
    await p.text('Chưa có thông tin bảo hiểm');
    await p.open('#/notifications', 'K1');
    await p.text('Bạn chưa có thông báo mới');
    await page.setViewportSize({ width: 1440, height: 900 });
    await S(page).open('/ops/tickets', 'Không có yêu cầu đang mở');
    await page.click('[data-action="ops-ticket-filter"][data-value="closed"]');
    await page.locator('main', { hasText: 'Chưa có yêu cầu đã đóng' }).waitFor();
  });
}

(async () => {
  const browser = await chromium.launch();
  const started = Date.now();
  let failed = false;
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    attach(page, 'main');
    console.log('Patient app (390px)');
    await patientSuite(page);
    console.log('Clinic workspace (1440px, same tab)');
    await staffSuite(page);
    console.log('Reset');
    await resetSuite(page);
    console.log('Empty states (same tab, cleared session)');
    await emptySuite(page);
    await ctx.close();
  } catch { failed = true; }
  await browser.close();
  console.log('\nConsole errors:', consoleErrors.length ? '\n  ' + consoleErrors.join('\n  ') : 'none');
  if (consoleErrors.length) failed = true;
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/${results.length} steps passed, ${checks} checks, ${Math.round((Date.now() - started) / 1000)} s`);
  process.exit(failed ? 1 : 0);
})();
