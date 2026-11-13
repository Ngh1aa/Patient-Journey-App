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
  await page.goto(PATIENT + '?demo=1&scenario=demo#/login');
  await page.fill('#phone', '0900000000');
  await p.submit('otp');
  await page.fill('#otp', '123456');
  await page.check('#consent');
  await p.submit('verify');
  await p.screen('A2');
  await p.submit('match');
  await p.screen('B1');
}

/** Staff demo tools live in a collapsed floating menu (only with ?demo=1). */
async function openStaffDemoTools(page) {
  await page.waitForSelector('.cf-demo-tools');
  if (!(await page.locator('.cf-demo-tools').evaluate((d) => d.open))) await page.click('.cf-demo-tools > summary');
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
    await p.text('Dr. Trần Thu Hà');
    await page.click('[data-action="filter"][data-filter="past"]');
    await page.waitForSelector('[data-action="filter"][data-filter="past"][aria-pressed="true"]');
    await p.text('Dr. Trần Phương Linh');
    await page.click('[data-action="filter"][data-filter="cancelled"]');
    await page.waitForSelector('[data-action="filter"][data-filter="cancelled"][aria-pressed="true"]');
    await page.click('[data-action="filter"][data-filter="upcoming"]');
  });

  let bookedId;
  await step('Appointments: book with specialty, doctor, slot and reason', async () => {
    await page.click('#bottom-nav .nav-book');
    await p.screen('C1');
    await page.check('input[name="Patient"][value="p1"]', { force: true });
    await p.submit('patient');
    await p.screen('C2');
    await p.submit('reason');
    await page.locator('#form-error').filter({ hasText: /./ }).waitFor();
    await page.fill('#reason', 'Palpitations when climbing stairs, would like a heart check');
    await p.submit('reason');
    await p.screen('C3');
    await page.check('form input[value="normal"]', { force: true });
    await p.submit('safety');
    await p.screen('C6');
    await page.check('form input[value="onsite"]', { force: true });
    await p.submit('mode');
    await p.screen('C7');
    await page.selectOption('#specialty', 'Cardiology');
    await page.waitForSelector('#clinicianId option[value="dr-quan"]', { state: 'attached' });
    await page.selectOption('#clinicianId', 'dr-quan');
    const day = await page.locator('[data-action="quick-date"]').nth(2).getAttribute('data-date');
    await page.click(`[data-action="quick-date"][data-date="${day}"]`);
    await page.check('input[name="slot"][value="10:30"]', { force: true });
    await p.submit('slot');
    await p.screen('C8');
    await p.text('Palpitations when climbing stairs');
    await page.check('#consent');
    await p.submit('booking');
    await p.screen('C9');
    const s = await p.state();
    const v = s.visits.find((x) => x.reason.startsWith('Palpitations'));
    assert(v && v.clinician?.id === 'dr-quan' && v.slot === '10:30' && v.date === day, 'booked visit stores doctor, slot and date');
    bookedId = v.id;
  });

  await step('Appointments: detail shows doctor; reschedule creates a linked replacement', async () => {
    await p.open('#/appointments/' + bookedId, 'D2');
    await p.text('Dr. Lê Minh Quân');
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
    await page.locator('#form-error', { hasText: 'why you are cancelling' }).waitFor();
    await page.fill('#cancelNote', 'I am travelling for work that week');
    await p.submit('cancel');
    await page.waitForSelector('#dialog[open]');
    await p.dialogClick('Confirm cancellation');
    await p.screen('D2');
    await p.text('I am travelling for work that week');
    assert((await p.state()).visits.find((v) => v.id === 'CF-2044').status === 'cancelled', 'CF-2044 cancelled');
  });

  await step('Visit summary and results detail', async () => {
    await p.open('#/appointments/CF-2031/summary', 'H6');
    await p.text('The doctor has recorded the notes from this visit');
    await p.text('Paracetamol 500 mg');
    await p.open('#/appointments/CF-2031/results', 'H7');
    await p.text('Complete blood count');
    await page.locator('[data-action="go"][data-to="F2"][data-lab="lab-1"]').first().click();
    await p.screen('F2');
    await p.text('Doctor’s comments');
  });

  await step('Medications: list filters, detail, not-found', async () => {
    await p.open('#/medications', 'M1');
    await p.text('Vitamin D3 1000 IU');
    await page.click('[data-action="p-filter"][data-value="ended"]');
    await p.text('Paracetamol oral suspension');
    await page.click('[data-action="p-filter"][data-value="active"]');
    await page.click('[data-p-rx-id="RX-3101"]');
    await p.screen('M2');
    await p.text('Dr. Trần Thu Hà');
    await p.open('#/medications/RX-0000', 'M2');
    await page.waitForSelector('[data-cf-state="not-found"]');
    await p.text('Prescription not found');
  });

  await step('Medications: refill request with inline validation, simulated failure and retry', async () => {
    await p.open('#/medications/RX-3101/refill', 'M3');
    await p.submit('refill');
    await p.fieldError('refill', 'supply', 'Choose how much medication');
    await p.fieldError('refill', 'ack', 'Please confirm');
    await page.check('input[name="supply"][value="lt3"]');
    await page.check('input[name="pickup"][value="pharmacy"]');
    await page.fill('#refillNote', 'I can take calls after 5 pm.');
    await page.check('#ack');
    await page.click('#review-toggle');
    await page.click('#review-tools [data-action="demo-fail-toggle"]');
    await page.waitForSelector('#review-tools [data-action="demo-fail-toggle"][aria-pressed="true"]');
    await page.click('#review-toggle');
    await p.submit('refill');
    await page.waitForSelector('form[data-form="refill"] [data-cf-state="error"]');
    await p.text('We couldn’t reach CareFlow+');
    assert(!(await p.state()).prescriptions.find((r) => r.id === 'RX-3101').refill, 'failed save leaves data unchanged');
    await page.click('form[data-form="refill"] [data-action="p-resubmit"]');
    await p.screen('M2');
    await p.text('Refill request sent');
  });

  await step('Medications: cancel a refill request, then request again', async () => {
    await page.click('[data-action="rx-cancel-refill"]');
    await page.waitForSelector('#dialog[open]');
    await p.dialogClick('Cancel request');
    await page.waitForSelector('#dialog[open]', { state: 'detached' });
    await p.screen('M2');
    await p.text('Request a refill');
    assert((await p.state()).prescriptions.find((r) => r.id === 'RX-3101').refill === null, 'refill cleared');
    await page.click('[data-action="p-nav"][data-to="M3"]');
    await p.screen('M3');
    await page.check('input[name="supply"][value="out"]');
    await page.check('input[name="pickup"][value="call"]');
    await page.check('#ack');
    await p.submit('refill');
    await p.screen('M2');
    await p.text('Refill request sent');
  });

  await step('Profile: edit with inline validation', async () => {
    await p.open('#/profile', 'K2');
    await page.click('.cf-profile-allergy [data-to="K6"]');
    await p.screen('K6');
    await page.fill('#name', '');
    await page.fill('#phone', '12345');
    await page.fill('#email', 'minhanh@');
    await p.submit('profile-edit');
    await p.fieldError('profile-edit', 'name', 'Enter the full name');
    await p.fieldError('profile-edit', 'phone', '10 digits');
    await p.fieldError('profile-edit', 'email', 'valid email');
    await page.fill('#name', 'Nguyễn Minh Anh Thư');
    await page.fill('#phone', '0912345678');
    await page.fill('#email', 'minhanh.thu@example.com');
    await page.fill('#allergies', 'Pollen allergy (self-reported)');
    await p.submit('profile-edit');
    await p.screen('K2');
    await p.text('Personal details saved');
    await p.text('Nguyễn Minh Anh Thư');
    await p.text('Pollen allergy');
  });

  await step('Family: create, view, edit, delete; delete blocked when history exists', async () => {
    await p.open('#/profile/family', 'K7');
    await p.text('Trần Thị Mai');
    await page.click('[data-action="p-nav"][data-to="K8"]');
    await p.screen('K8');
    await p.submit('family-edit');
    await p.fieldError('family-edit', 'name', 'Enter the full name');
    await p.fieldError('family-edit', 'relation', 'Choose a relationship');
    await page.fill('#name', 'Nguyễn Văn Hùng');
    await page.fill('#dob', '2030-01-01');
    await page.selectOption('#relation', 'father');
    await p.submit('family-edit');
    await p.fieldError('family-edit', 'dob', 'in the future');
    await page.fill('#dob', '1960-04-20');
    await p.submit('family-edit');
    await p.screen('K9');
    await p.text('Family member added');
    await p.text('Father');
    await page.click('[data-action="p-nav"][data-to="K10"]');
    await p.screen('K10');
    await page.selectOption('#relation', 'relative');
    await page.fill('#phone', '0987000111');
    await p.submit('family-edit');
    await p.screen('K9');
    await p.text('Other relative');
    await page.click('[data-action="family-delete"]');
    await page.waitForSelector('#dialog[open]');
    await p.dialogClick('Delete profile');
    await p.screen('K7');
    await p.noText('Nguyễn Văn Hùng');
    await page.click('[data-p-person-id="p2"]');
    await p.screen('K9');
    await page.click('[data-action="family-delete"]');
    await page.locator('#dialog[open]', { hasText: 'can’t be deleted yet' }).waitFor();
    await p.dialogClick('Close');
  });

  await step('Insurance: edit with validation, remove (empty state), add again', async () => {
    await p.open('#/profile/insurance', 'K11');
    await p.text('DN4797900000128');
    await page.click('[data-action="p-nav"][data-to="K12"]');
    await p.screen('K12');
    await page.fill('#number', 'AB123');
    await page.fill('#validTo', '2020-01-01');
    await p.submit('insurance');
    await p.fieldError('insurance', 'number', '15 characters');
    await page.fill('#number', 'hn4797911112222');
    await page.fill('#validTo', '2031-12-31');
    await p.submit('insurance');
    await p.screen('K11');
    await p.text('HN4797911112222');
    await p.text('31/12/2031');
    await page.click('[data-action="insurance-remove"]');
    await page.waitForSelector('#dialog[open]');
    await p.dialogClick('Remove');
    await p.screen('K11');
    await p.text('No insurance details yet');
    await page.click('[data-action="p-nav"][data-to="K12"]');
    await p.screen('K12');
    await page.selectOption('#type', 'private');
    await page.fill('#number', 'PVI-2026-7781');
    await page.fill('#holder', 'Nguyễn Minh Anh Thư');
    await page.fill('#validTo', '2030-06-30');
    await p.submit('insurance');
    await p.screen('K11');
    await p.text('Private health insurance');
  });

  await step('Support: create ticket (validation), detail thread, reply, close, reopen', async () => {
    await p.open('#/support', 'K5');
    await page.click('[data-action="support-requests"]');
    await p.screen('T1');
    await p.text('Receipt for visit CF-2031');
    await page.click('[data-action="p-nav"][data-to="T3"]');
    await p.screen('T3');
    await p.submit('ticket-new');
    await p.fieldError('ticket-new', 'subject', 'Enter a short subject');
    await p.fieldError('ticket-new', 'body', 'Describe what you need help with');
    await page.selectOption('#topic', 'Results');
    await page.fill('#subject', 'Question about my X-ray results');
    await page.selectOption('#visitId', 'CF-2031');
    await page.fill('#body', 'I would like to ask more about the X-ray images from my last visit.');
    await p.submit('ticket-new');
    await p.screen('T2');
    await p.text('Ticket sent');
    await p.text('Awaiting clinic');
    await p.submit('ticket-reply');
    await p.fieldError('ticket-reply', 'reply', 'Enter your reply');
    await page.fill('#reply', 'One more thing: you can call me after 5 pm.');
    await p.submit('ticket-reply');
    await p.text('Reply sent');
    await p.text('you can call me after 5 pm');
    await page.click('[data-action="ticket-close"]');
    await page.waitForSelector('#dialog[open] #close-reason');
    await page.selectOption('#close-reason', 'My issue has been resolved');
    await p.dialogClick('Close ticket');
    await page.locator('#phone-content', { hasText: 'This ticket is closed: My issue has been resolved' }).waitFor();
    await page.click('[data-action="ticket-reopen"]');
    await page.waitForSelector('form[data-form="ticket-reply"]');
    await p.open('#/support/tickets', 'T1');
    await page.click('[data-action="p-filter"][data-value="closed"]');
    await p.text('How to change my appointment time');
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
    await p.text('Couldn’t load data');
    await page.click('[data-action="p-retry-load"]');
    await p.screen('T1');
    await page.click('[data-action="p-filter"][data-value="open"]');
    await p.text('Question about my X-ray results');
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
    await s.open('/ops/queue', 'Today’s queue');
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
    await s.toast('Patient checked in');
    await s.row('CF-2041').locator('[data-action="ops-start"]').waitFor();
    await page.goto(PATIENT + '#/appointments/CF-2041');
    await p.screen('D2');
    await p.text('Checked in');
    const st = await p.state();
    assert(st.visits.find((v) => v.id === 'CF-2041').status === 'received', 'patient state shows received');
    assert(st.notifications[0].title === 'The clinic has checked you in', 'patient notified of check-in');
  });

  await step('Staff: patient detail and visit detail; add and delete internal notes', async () => {
    await s.open('/ops/patients/p1', 'Nguyễn Minh Anh Thư');
    await page.locator('main', { hasText: 'HN' }).or(page.locator('main', { hasText: 'PVI-2026-7781' })).first().waitFor();
    await page.locator('a[href="#/ops/visits/CF-2041"]').click();
    await page.locator('main h1', { hasText: 'Visit CF-2041' }).waitFor();
    await s.idle();
    await page.click('form[data-ops-form="note"] [type=submit]');
    await page.locator('[data-error-for="note"]', { hasText: 'Enter a note' }).waitFor();
    await page.fill('#ops-note', 'Patient brought previous lab results.');
    await page.click('form[data-ops-form="note"] [type=submit]');
    await s.toast('Internal note saved');
    await page.locator('.ops-notes', { hasText: 'previous lab results' }).waitFor();
    await page.click('.ops-notes [data-action="ops-note-delete"]');
    await page.click('.dialog-card [data-action="ops-note-delete-confirm"]');
    await s.toast('Note deleted');
    assert(await page.locator('.ops-notes li').count() === 0, 'note deleted');
    await page.fill('#ops-note', 'ID documents checked.');
    await page.click('form[data-ops-form="note"] [type=submit]');
    await page.locator('.ops-notes', { hasText: 'ID documents checked' }).waitFor();
  });

  await step('Staff: start and complete the visit (confirm dialog)', async () => {
    await page.click('.ops-actions [data-action="ops-start"]');
    await s.toast('Consultation started');
    await page.click('.ops-actions [data-action="ops-complete"]');
    await page.waitForSelector('.dialog-card');
    await page.click('.dialog-card [data-action="ops-complete-confirm"]');
    await s.toast('Visit completed');
    await page.locator('.ops-panel', { hasText: 'This visit has no further steps' }).waitFor();
  });

  await step('Staff: create a follow-up task (validation) and a follow-up appointment', async () => {
    await page.fill('#ops-title', '');
    await page.click('form[data-ops-form="task"] [type=submit]');
    await page.locator('[data-error-for="title"]', { hasText: 'at least 3 characters' }).waitFor();
    await page.fill('#ops-title', 'Post-visit check-in call');
    await page.selectOption('form[data-ops-form="task"] #ops-assignee', 'Nurse');
    await page.click('form[data-ops-form="task"] [type=submit]');
    await s.toast('Task created');
    await page.locator('.ops-mini-list', { hasText: 'Post-visit check-in call' }).waitFor();
    await page.fill('form[data-ops-form="followup"] #ops-date', '2020-01-01');
    await page.click('form[data-ops-form="followup"] [type=submit]');
    await page.locator('[data-error-for="date"]', { hasText: 'after today' }).waitFor();
    const date = await page.evaluate(() => window.CareFlowModel.localDate(14));
    await page.fill('form[data-ops-form="followup"] #ops-date', date);
    await page.selectOption('form[data-ops-form="followup"] #ops-slot', '15:30');
    await page.click('form[data-ops-form="followup"] [type=submit]');
    await s.toast('Follow-up scheduled');
  });

  await step('Patient sees the completed visit and the follow-up appointment', async () => {
    await page.goto(PATIENT + '#/appointments/CF-2041');
    await p.screen('D2');
    await p.text('Visit complete');
    const st = await p.state();
    const follow = st.visits.find((v) => v.previousId === 'CF-2041' && v.purpose === 'followup');
    assert(follow && follow.status === 'confirmed' && follow.slot === '15:30', 'follow-up visit created for patient');
    await p.open('#/notifications', 'K1');
    await p.text('The clinic booked a follow-up visit');
    await p.open('#/appointments/' + follow.id, 'D2');
    await p.text('Follow-up as advised by the doctor');
  });

  await step('Staff: tasks — edit, complete (refill review syncs to patient), reopen, delete', async () => {
    await s.open('/ops/tasks', 'Tasks');
    const refill = page.locator('.ops-task', { hasText: 'Review refill request RX-3101' });
    await refill.waitFor();
    await refill.locator('[data-action="ops-task-done"]').click();
    await s.toast('Task marked done');
    const task = page.locator('.ops-task', { hasText: 'Post-visit check-in call' });
    await task.locator('a', { hasText: 'Edit' }).click();
    await page.locator('main h1', { hasText: 'Edit task' }).waitFor();
    await s.idle();
    await page.fill('#ops-title', 'Post-visit check-in call (priority)');
    await page.selectOption('#ops-priority', 'high');
    await page.click('form[data-ops-form="taskEdit"] [type=submit]');
    await s.toast('Task saved');
    const edited = page.locator('.ops-task', { hasText: 'Post-visit check-in call (priority)' });
    await edited.locator('.pill', { hasText: 'High priority' }).waitFor();
    await edited.locator('[data-action="ops-task-done"]').click();
    await s.toast('Task marked done');
    await page.click('[data-action="ops-task-filter"][data-value="done"]');
    const done = page.locator('.ops-task', { hasText: 'Post-visit check-in call (priority)' });
    await done.locator('[data-action="ops-task-reopen"]').click();
    await s.toast('Task reopened');
    await page.click('[data-action="ops-task-filter"][data-value="open"]');
    await page.locator('.ops-task', { hasText: 'Post-visit check-in call (priority)' }).locator('[data-action="ops-task-delete"]').click();
    await page.click('.dialog-card [data-action="ops-task-delete-confirm"]');
    await s.toast('Task deleted');
    assert(await page.locator('.ops-task', { hasText: 'Post-visit check-in call' }).count() === 0, 'task deleted');
    await s.open('/ops/tasks/new', 'New task');
    await page.selectOption('#ops-patientId', 'c-104');
    await page.fill('#ops-title', 'Remind to bring previous results');
    await page.click('form[data-ops-form="taskEdit"] [type=submit]');
    await s.toast('Task created');
    await page.locator('.ops-task', { hasText: 'Remind to bring previous results' }).waitFor();
  });

  await step('Staff: reply to the patient ticket; patient sees the reply', async () => {
    await s.open('/ops/tickets', 'Support tickets');
    await page.locator('tr', { hasText: 'Question about my X-ray results' }).locator('a', { hasText: 'Open' }).click();
    await page.locator('main h1', { hasText: 'Question about my X-ray results' }).waitFor();
    await s.idle();
    await page.fill('#ops-reply', 'The clinic has received your question and will call you back after 5 pm.');
    await page.click('form[data-ops-form="reply"] [type=submit]');
    await s.toast('Reply sent to patient');
    const ticketId = await page.evaluate(() => location.hash.split('/').pop());
    await page.goto(PATIENT + '#/support/tickets/' + ticketId);
    await p.screen('T2');
    await p.text('will call you back after 5 pm');
    await p.text('Clinic replied');
    await p.open('#/medications/RX-3101', 'M2');
    await p.text('Reviewed by clinic');
  });

  await step('Staff: simulated failure shows a recoverable error; retry succeeds', async () => {
    await s.open('/ops/queue', 'Today’s queue');
    await openStaffDemoTools(page);
    await page.click('[data-action="ops-fail-toggle"]');
    await page.waitForSelector('[data-action="ops-fail-toggle"][aria-pressed="true"]');
    await s.row('PK-0804').locator('[data-action="ops-checkin"]').click();
    await page.waitForSelector('.ops-banner[data-cf-state="error"]');
    await page.locator('.ops-banner', { hasText: 'We couldn’t reach CareFlow+' }).waitFor();
    await page.click('.ops-banner [data-action="ops-retry"]');
    await s.toast('Patient checked in');
    await s.row('PK-0804').locator('[data-action="ops-start"]').waitFor();
  });

  await step('Staff: not-found for unknown visit, patient and task ids', async () => {
    await s.open('/ops/visits/XX-404', 'Visit not found');
    await s.open('/ops/patients/nobody', 'Patient not found');
    await s.open('/ops/tasks/TK-0', 'Task not found');
  });
}

async function resetSuite(page) {
  const p = P(page);
  await step('Reset demo data restores the seed in both apps', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PATIENT + '#/home');
    await p.screen('B1');
    await page.click('#review-toggle');
    await page.click('#reset-demo');
    await page.waitForSelector('#dialog[open]');
    await Promise.all([page.waitForEvent('load'), p.dialogClick('Reset')]);
    await p.screen('B1');
    const s = await p.state();
    assert(s.visits.find((v) => v.id === 'CF-2041').status === 'confirmed', 'CF-2041 back to confirmed');
    assert(s.visits.find((v) => v.id === 'CF-2044').status === 'confirmed', 'CF-2044 back to confirmed');
    assert(s.tickets.length === 2 && s.insurance.p1.number === 'DN4797900000128', 'tickets and insurance restored');
    assert(s.profiles.find((x) => x.id === 'p1').name === 'Nguyễn Minh Anh', 'profile restored');
    assert(s.clinic.tasks.length === 3 && s.authenticated === true, 'clinic tasks restored, still signed in');
    await page.setViewportSize({ width: 1440, height: 900 });
    await S(page).open('/ops/queue', 'Today’s queue');
    await S(page).row('CF-2041').locator('[data-action="ops-checkin"]').waitFor();
    await S(page).row('PK-0804').locator('[data-action="ops-checkin"]').waitFor();
    await openStaffDemoTools(page);
    await page.click('.cf-demo-tools .footer-reset');
    await page.click('[data-action="confirm-reset"]');
    await S(page).toast('Session reset');
  });
}

async function emptySuite(page) {
  const p = P(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => sessionStorage.clear());
  await step('Empty states: medications, tickets, insurance, notifications, staff tickets', async () => {
    await page.goto(PATIENT + '?scenario=empty#/medications');
    await p.screen('M1');
    await p.text('No active medications');
    await p.open('#/support/tickets', 'T1');
    await p.text('No open tickets');
    await p.open('#/profile/insurance', 'K11');
    await p.text('No insurance details yet');
    await p.open('#/notifications', 'K1');
    await p.text('You have no new notifications');
    await page.setViewportSize({ width: 1440, height: 900 });
    await S(page).open('/ops/tickets', 'No open tickets');
    await page.click('[data-action="ops-ticket-filter"][data-value="closed"]');
    await page.locator('main', { hasText: 'No closed tickets yet' }).waitFor();
  });
}

const SIGNALS = /prototype|demo|sandbox|simulat|fictional|state lab|portfolio|showcase|\bsample\b|\bmock\b|example data/i;
const PATIENT_ROUTES = ['/home', '/appointments', '/appointments/CF-2041', '/appointments/CF-2031/summary', '/profile', '/profile/history', '/settings', '/support', '/notifications', '/medications', '/medications/RX-3101', '/profile/family', '/profile/insurance', '/support/tickets'];
const STAFF_ROUTES = ['/doctor', '/doctor/schedule', '/doctor/queue', '/doctor/followups', '/patients', '/results', '/encounters/a-033', '/clinical/orders', '/clinical/prescription', '/clinical/review', '/ops/queue', '/ops/tasks', '/ops/tickets'];

async function cleanSuite(browser) {
  await step('Plain URLs: signed-in entry, no prototype wording, demo tools hidden', async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    attach(page, 'clean');
    const p = P(page);
    await page.goto(PATIENT);
    await p.screen('B1');
    assert(/#\/home$/.test(page.url()), 'plain patient URL lands on #/home, got ' + page.url());
    await p.text('Minh Anh');
    assert(await page.locator('.journey-panel').isHidden(), 'guided showcase panel hidden');
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      for (const r of PATIENT_ROUTES) {
        await page.evaluate((x) => { location.hash = x; }, '#' + r);
        await page.waitForSelector('#phone-content:not(:has([data-cf-state="loading"]))');
        await page.waitForTimeout(50);
        const text = await page.locator('body').innerText();
        const hit = text.match(SIGNALS);
        assert(!hit, `patient ${r} @${width}px shows "${hit && hit[0]}"`);
        assert(!(await page.locator('#review-toggle, #reset-demo, [data-action="demo-fail-toggle"], [data-action="reset-demo"]').filter({ visible: true }).count()), `patient ${r} @${width}px hides demo tools`);
      }
    }
    await page.goto(STAFF);
    await page.waitForSelector('main#content');
    assert(/#\/doctor$/.test(page.url()), 'plain clinic URL lands on #/doctor, got ' + page.url());
    for (const r of STAFF_ROUTES) {
      await page.goto(STAFF + '#' + r);
      await page.waitForSelector('main#content');
      await page.waitForSelector('main#content:not(:has([data-cf-state="loading"]))');
      const text = await page.locator('body').innerText();
      const hit = text.match(SIGNALS);
      assert(!hit, `clinic ${r} shows "${hit && hit[0]}"`);
      assert(await page.locator('.cf-demo-tools, [data-action="ops-fail-toggle"], [data-action="reset-demo"]').count() === 0, `clinic ${r} hides demo tools`);
      assert((await page.locator('.app-footer').innerText()).includes('Concept product designed by Đỗ Anh Nghĩa.'), `clinic ${r} footer credit`);
    }
    await ctx.close();
  });

  await step('?demo=1 reveals demo tools in both apps; ?demo=0 hides them again', async () => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    attach(page, 'demo-flag');
    const p = P(page);
    await page.goto(PATIENT + '?demo=1#/home');
    await p.screen('B1');
    await page.locator('#review-toggle', { hasText: 'Demo tools' }).waitFor();
    await page.click('#review-toggle');
    await page.locator('#reset-demo').waitFor();
    await page.locator('#review-tools [data-action="demo-fail-toggle"]').waitFor();
    await page.goto(PATIENT + '#/settings');
    await p.screen('K4');
    await page.locator('#phone-content [data-action="reset-demo"]').waitFor();
    await page.goto(STAFF + '#/ops/queue');
    await page.locator('.cf-demo-tools > summary', { hasText: 'Demo tools' }).waitFor();
    await openStaffDemoTools(page);
    await page.locator('.cf-demo-tools [data-action="ops-fail-toggle"]').waitFor();
    await page.locator('.cf-demo-tools [data-action="reset-demo"]').waitFor();
    await page.goto(STAFF + '?demo=0#/ops/queue');
    await page.waitForSelector('main#content');
    assert(await page.locator('.cf-demo-tools').count() === 0, 'clinic demo tools off after ?demo=0');
    await page.goto(PATIENT + '#/home');
    await p.screen('B1');
    assert(await page.locator('#review-toggle').isHidden(), 'patient demo tools off after ?demo=0');
    await ctx.close();
  });

  await step('Sign out shows the login screen; "Continue as" signs back in', async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    attach(page, 'signout');
    const p = P(page);
    await page.goto(PATIENT + '#/settings');
    await p.screen('K4');
    await page.click('#phone-content [data-action="logout"]');
    await p.screen('A1');
    await page.locator('#phone').waitFor();
    await page.click('#phone-content [data-action="continue-as"]');
    await p.screen('B1');
    await p.text('Minh Anh');
    await ctx.close();
  });

  await step('Guided showcase stays reachable through ?scenario=guided', async () => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    attach(page, 'guided');
    await page.goto(PATIENT + '?scenario=guided');
    await page.locator('.journey-panel').waitFor();
    assert(await page.locator('.journey-item > button').count() === 12, '12 guided journeys');
    await ctx.close();
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
    console.log('Clean product URLs and demo tools');
    await cleanSuite(browser);
  } catch { failed = true; }
  await browser.close();
  console.log('\nConsole errors:', consoleErrors.length ? '\n  ' + consoleErrors.join('\n  ') : 'none');
  if (consoleErrors.length) failed = true;
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/${results.length} steps passed, ${checks} checks, ${Math.round((Date.now() - started) / 1000)} s`);
  process.exit(failed ? 1 : 0);
})();
