const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const M = require('../model.js'),
  VI = require('../strings.vi.js');
const content = (page) => page.locator('#phone-content');
const action = (page, name) =>
  page.locator('#phone-content [data-action="' + name + '"]');
const screen = async (page, id) => {
  await expect(content(page)).toHaveAttribute('data-screen', id);
  await expect(content(page)).toHaveAttribute('data-guarded', '');
};
const submit = (page) => content(page).locator('form [type=submit]').click();
const state = (page) =>
  page.evaluate(
    () => JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state,
  );
const current = async (page) => {
  const s = await state(page);
  return s.visits.find((v) => v.id === s.activeVisitId);
};
async function load(page, name = 'upcoming') {
  await page.goto('/prototype/index.html?scenario=' + name);
  await expect(content(page)).toHaveAttribute(
    'data-screen',
    name === 'new' || name === 'returning' ? 'A1' : 'B1',
  );
}
async function tools(page) {
  if (await page.locator('#review-tools').isHidden())
    await page.locator('#review-toggle').click();
}
async function staff(page, event) {
  await tools(page);
  await page.locator('#staff-event').selectOption(event);
  await page.locator('[data-action=staff]').click();
}
async function nav(page, id) {
  await tools(page);
  await page.locator('#screen-picker').selectOption(id);
  await expect(content(page)).toHaveAttribute('data-screen', id);
}
async function go(page, to) {
  await content(page)
    .locator('[data-to="' + to + '"]')
    .first()
    .click();
}
async function bookStart(page) {
  await action(page, 'begin').first().click();
  await screen(page, 'C1');
  await submit(page);
  await screen(page, 'C2');
  await page
    .locator('#reason')
    .fill('Tôi muốn trao đổi với bác sĩ về tình trạng gần đây.');
  await submit(page);
  await screen(page, 'C3');
}
async function normal(page, mode = 'onsite') {
  await content(page).locator('input[value=normal]').check();
  await submit(page);
  await screen(page, 'C6');
  await content(page)
    .locator('input[value=' + mode + ']')
    .check();
  await submit(page);
  await screen(page, 'C7');
}
async function slot(page, time = '09:00') {
  await content(page)
    .locator('input[name=slot][value="' + time + '"]')
    .check();
  await submit(page);
  await screen(page, 'C8');
}
async function send(page) {
  await page.locator('#consent').check();
  await submit(page);
  await screen(page, 'C9');
}
async function login(page) {
  await page.locator('#phone').fill('0900000000');
  await submit(page);
  await page.locator('#otp').fill('123456');
  await page.locator('#consent').check();
  await submit(page);
}
async function seed(page, id, large = false) {
  const path = await page.evaluate(
    ({ id, large }) => {
      const M = window.CareFlowModel;
      let type = 'upcoming';
      if (
        id.startsWith('H') ||
        id.startsWith('I') ||
        id === 'J1' ||
        id === 'K3'
      )
        type = 'completed';
      if (id.startsWith('F')) type = 'pre-lab';
      if (id.startsWith('G')) type = 'online';
      if (id === 'A1') type = 'empty';
      let s = M.fixture(type);
      if (id === 'A1') s = M.initial();
      if (id === 'A3') {
        s = M.initial();
        s.authenticated = true;
      }
      let v = M.visit(s);
      if (/^C[1-8]$/.test(id)) {
        M.beginBooking(s);
        Object.assign(s.draft, {
          reason: 'Khám theo lịch hẹn',
          safety: 'normal',
          slot: '09:00',
        });
        if (['C4', 'C5'].includes(id)) M.screenSafety(s, 'warning');
      }
      if (id === 'C9') {
        s = M.fixture('empty');
        M.beginBooking(s);
        Object.assign(s.draft, {
          reason: 'Khám theo lịch hẹn',
          safety: 'normal',
          slot: '09:00',
        });
        M.submitBooking(s);
        v = M.visit(s);
      }
      if (id === 'E2') M.transition(s, v.id, 'reminder', 'staff');
      if (id === 'E3') {
        M.transition(s, v.id, 'reminder', 'staff');
        M.transition(s, v.id, 'arrived');
      }
      if (id === 'F4')
        M.labTransition(s, v.id, v.labs[0].id, 'scheduled', 'patient', {
          appointmentDate: M.localDate(1),
        });
      if (['G2', 'G3', 'G4', 'G5'].includes(id)) {
        for (const t of ['reminder', 'online-wait'])
          M.transition(s, v.id, t, 'staff');
        if (id !== 'G2') M.transition(s, v.id, 'calling', 'staff');
        if (id === 'G4') M.transition(s, v.id, 'in-consult');
        if (id === 'G5') M.transition(s, v.id, 'unreachable');
      }
      if (id === 'H5') {
        M.setPayment(s, v.id, 'counter-pending');
        M.setPayment(s, v.id, 'paid', 'staff');
      }
      if (id === 'H7') {
        for (const t of [
          'scheduled',
          'available',
          'awaiting-review',
          'reviewed',
        ])
          M.labTransition(s, v.id, v.labs[0].id, t, 'staff', {
            appointmentDate: M.localDate(1),
          });
        M.communicateResult(s, v.id, 'notified');
      }
      if (id === 'I4')
        v.care.referral =
          'Phòng khám đang sắp xếp hướng dẫn chuyển chuyên khoa.';
      s.settings.largeText = large;
      sessionStorage.setItem(
        'careflow.browser.v3',
        JSON.stringify({
          state: s,
          ui: {
            labId: v?.labs[0]?.id,
            reportReason: 'medicine',
            forms: {},
            filter: 'upcoming',
          },
        }),
      );
      const meta = M.SCREENS.find((x) => x.id === id);
      let path = meta.route
        .split('?')[0]
        .replace(':id', v?.id || 'CF-0001')
        .replace(':labId', v?.labs[0]?.id || 'lab-1');
      if (id === 'I2') path += '?reason=medicine&visit=' + v.id;
      else if (id.startsWith('I')) path += '?visit=' + v.id;
      return path;
    },
    { id, large },
  );
  await page.goto(
    '/prototype/index.html?capture=' + id + '-' + Date.now() + '#' + path,
  );
  await screen(page, id);
}
test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect(page.__errors).toEqual([]);
});

test('F1 new profile → all booking steps → pending visit, 4 tabs', async ({
  page,
}) => {
  await load(page, 'new');
  await page.locator('#phone').fill('123');
  await submit(page);
  await expect(page.locator('#form-error')).toContainText('10 chữ số');
  await login(page);
  await screen(page, 'A3');
  await page.locator('#name').fill('Nguyễn An');
  await page.locator('#dob').fill('1995-02-15');
  await submit(page);
  await screen(page, 'B1');
  await bookStart(page);
  await normal(page);
  await slot(page);
  await send(page);
  expect((await current(page)).status).toBe('pending');
  await go(page, 'D2');
  await screen(page, 'D2');
  await expect(page.locator('#visit-qr svg')).toBeVisible();
  await expect(page.locator('#bottom-nav a')).toHaveText([
    'Trang chủ',
    'Lịch hẹn',
    'Hồ sơ',
    'Hỗ trợ',
  ]);
});
test('F2 existing profile is confirmed and can be updated without re-entry', async ({
  page,
}) => {
  await load(page, 'returning');
  await login(page);
  await screen(page, 'A2');
  await expect(page.locator('#name')).toHaveValue('Nguyễn Minh Anh');
  await page.locator('#name').fill('Nguyễn Minh Anh Cập nhật');
  await submit(page);
  await screen(page, 'B1');
  await bookStart(page);
  await normal(page);
  await slot(page);
  await send(page);
  expect((await current(page)).status).toBe('pending');
});
test('F3a warning → emergency exit, no booking and no real external call', async ({
  page,
}) => {
  await load(page, 'empty');
  await bookStart(page);
  await content(page).locator('input[value=warning]').check();
  await submit(page);
  await screen(page, 'C4');
  await action(page, 'emergency').click();
  await expect(page.locator('#dialog')).toBeVisible();
  await expect(page.locator('#dialog-body')).toContainText(
    'Không thực hiện cuộc gọi',
  );
  await page.locator('[data-action=stop-emergency]').click();
  await screen(page, 'B1');
  expect((await state(page)).visits).toHaveLength(0);
});
test('F3b cannot bypass risk; review request waits for staff mode decision', async ({
  page,
}) => {
  await load(page, 'empty');
  await bookStart(page);
  await content(page).locator('input[value=warning]').check();
  await submit(page);
  await screen(page, 'C4');
  await nav(page, 'C6');
  await expect(content(page)).toHaveAttribute('data-guarded', 'review');
  await go(page, 'C4');
  await action(page, 'safety-continue').click();
  await screen(page, 'C5');
  await page.locator('#ack').check();
  await submit(page);
  await slot(page);
  await send(page);
  expect((await current(page)).status).toBe('mode-review');
  await staff(page, 'review:onsite');
  expect((await current(page)).status).toBe('pending');
  await staff(page, 'visit:confirmed');
  expect((await current(page)).status).toBe('confirmed');
});
test('F4 arrives → received → ready → in-consult → completed in order', async ({
  page,
}) => {
  await load(page);
  await nav(page, 'E1');
  await screen(page, 'E1');
  await go(page, 'D2');
  await staff(page, 'visit:reminder');
  await go(page, 'E2');
  await action(page, 'arrive').click();
  await screen(page, 'E3');
  for (const t of ['received', 'ready', 'in-consult', 'completed'])
    await staff(page, 'visit:' + t);
  await screen(page, 'H1');
  expect((await current(page)).status).toBe('completed');
});
test('F5 lab appointment, external file, both return paths and staff result release', async ({
  page,
}) => {
  await load(page, 'pre-lab');
  await nav(page, 'D2');
  await go(page, 'F1');
  await go(page, 'F2');
  await content(page).locator('input[value=during]').check();
  await submit(page);
  expect((await current(page)).labs[0].returnPath).toBe('during');
  await go(page, 'F3');
  await page.locator('#coordinator').check();
  await submit(page);
  await screen(page, 'F2');
  expect((await current(page)).labs[0].status).toBe('scheduled');
  await go(page, 'F4');
  await page.locator('#file').setInputFiles({
    name: 'result.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 fixture'),
  });
  await submit(page);
  await screen(page, 'F2');
  expect((await current(page)).labs[0].status).toBe('available');
  await content(page).locator('input[value=visit]').check();
  await submit(page);
  await go(page, 'D2');
  await staff(page, 'visit:confirmed');
  expect((await current(page)).status).toBe('confirmed');
});
test('F6 cancellation retains reason/history and rebooking links a new visit', async ({
  page,
}) => {
  await load(page);
  await nav(page, 'D2');
  const old = (await current(page)).id;
  await go(page, 'D4');
  await page.locator('#cancelNote').fill('Cần đổi thời gian');
  await submit(page);
  await page.locator('[data-action=confirm-cancel]').click();
  await screen(page, 'D2');
  expect((await current(page)).cancelReason).toContain('Cần đổi');
  await go(page, 'C7');
  await screen(page, 'C7');
  await slot(page, '14:00');
  await send(page);
  const s = await state(page);
  expect(s.visits).toHaveLength(2);
  expect((await current(page)).previousId).toBe(old);
  expect(s.visits[0].status).toBe('cancelled');
});
test('F6 no-show and reschedule preserve old visit and create linked replacement', async ({
  page,
}) => {
  await load(page, 'no-show');
  await nav(page, 'D2');
  await go(page, 'C7');
  await slot(page);
  await send(page);
  expect((await state(page)).visits[0].status).toBe('no-show');
  await load(page);
  await nav(page, 'D3');
  await action(page, 'rebook').click();
  await screen(page, 'C7');
  await slot(page, '14:00');
  expect((await state(page)).visits[0].status).toBe('confirmed');
  await send(page);
  const s = await state(page);
  expect(s.visits[0].status).toBe('cancelled');
  expect(s.visits[0].rescheduledTo).toBe(s.activeVisitId);
});
async function onlineWait(page) {
  await load(page, 'online');
  await nav(page, 'G1');
  await action(page, 'device').click();
  await page.locator('[data-action=device-ready]').click();
  await staff(page, 'visit:reminder');
  await action(page, 'join').click();
  await screen(page, 'G2');
  await staff(page, 'visit:calling');
  await screen(page, 'G3');
}
test('F7 online preparation, incoming call, controls, staff completion', async ({
  page,
}) => {
  await onlineWait(page);
  await action(page, 'answer').click();
  await screen(page, 'G4');
  await action(page, 'mic').click();
  await expect(action(page, 'mic')).toHaveText('Bật micro');
  await action(page, 'camera').click();
  await expect(action(page, 'camera')).toHaveText('Bật camera');
  await staff(page, 'visit:completed');
  await screen(page, 'H1');
});
test('F8 wait for callback keeps unreachable visit open', async ({ page }) => {
  await onlineWait(page);
  await action(page, 'decline').click();
  await screen(page, 'G5');
  await action(page, 'callback').click();
  await page.locator('[data-action=close-dialog]').click();
  expect((await current(page)).status).toBe('unreachable');
  expect((await current(page)).communication.callback).toBe('pending');
});
for (const mode of ['online', 'onsite'])
  test('F8 replacement appointment: ' + mode, async ({ page }) => {
    await onlineWait(page);
    await action(page, 'decline').click();
    await content(page)
      .locator('[data-mode="' + mode + '"]')
      .click();
    await screen(page, 'C7');
    await slot(page, '14:00');
    await send(page);
    const s = await state(page);
    expect(s.visits).toHaveLength(2);
    expect(s.visits[0].status).toBe('cancelled');
    expect((await current(page)).mode).toBe(mode);
    expect((await current(page)).previousId).toBe(s.visits[0].id);
  });
for (const method of [
  'counter-pending',
  'pharmacy-pending',
  'transfer-pending',
])
  test(
    'F9 method ' + method + ' remains pending until staff receipt',
    async ({ page }) => {
      await load(page, 'completed');
      await nav(page, 'H2');
      if (method === 'transfer-pending') {
        await go(page, 'H4');
        await expect(content(page)).toContainText('Chưa có mã thanh toán');
      }
      await content(page)
        .locator('[data-status="' + method + '"]')
        .click();
      await screen(page, 'H5');
      expect((await current(page)).payment.status).toBe(method);
      await staff(page, 'payment:paid');
      expect((await current(page)).payment.status).toBe('paid');
      await expect(content(page)).toContainText('RC-CF-0001');
      await staff(page, 'payment:refunding');
      await expect(content(page)).toContainText('Đang hoàn tiền');
      await staff(page, 'payment:refunded');
      await expect(content(page)).toContainText('Đã hoàn tiền');
    },
  );
test('F9 defer validates reason/date and fee waiver stays separate', async ({
  page,
}) => {
  await load(page, 'completed');
  await nav(page, 'H3');
  await submit(page);
  await expect(page.locator('#form-error')).not.toBeEmpty();
  await page.locator('#deferReason').fill('Cần sắp xếp');
  await submit(page);
  await screen(page, 'H5');
  expect((await current(page)).payment.status).toBe('deferred');
  await staff(page, 'payment:not-required');
  await expect(content(page)).toContainText('Không phát sinh phí');
});
test('F10 all lab states, doctor review vs notice vs explanation, four next actions', async ({
  page,
}) => {
  await load(page, 'completed');
  await nav(page, 'F1');
  await go(page, 'F2');
  for (const t of ['scheduled', 'available', 'awaiting-review', 'reviewed'])
    await staff(page, 'lab-status:lab-1:' + t);
  let v = await current(page);
  expect(v.communication.result).toBe('pending');
  expect(v.communication.explanation).toBe('pending');
  await staff(page, 'communicate:unreachable');
  await nav(page, 'H7');
  await expect(content(page)).toContainText('Phòng khám đang cố liên hệ');
  await staff(page, 'communicate:notified');
  await expect(content(page)).toContainText('Đã gửi thông báo');
  await expect(content(page)).toContainText('Chưa ghi nhận đã giải thích');
  await staff(page, 'communicate:explained');
  await expect(
    content(page).locator('[data-action=go][data-to=H6]'),
  ).toBeVisible();
  await expect(
    content(page).locator('[data-action=go][data-to=F1]'),
  ).toBeVisible();
  await expect(action(page, 'callback')).toBeVisible();
  await action(page, 'rebook').click();
  await screen(page, 'C7');
  await expect(content(page)).toContainText('Không thu phí');
  await slot(page);
  await send(page);
  expect((await current(page)).payment.status).toBe('not-required');
});
for (const reason of ['medicine', 'question', 'symptoms'])
  test('F11 distinct aftercare reason ' + reason, async ({ page }) => {
    await load(page, 'completed');
    await nav(page, 'I1');
    await content(page)
      .locator('[data-reason="' + reason + '"]')
      .click();
    await screen(page, 'I2');
    await page
      .locator('#report')
      .fill('Nội dung phản hồi để phòng khám xem xét.');
    if (reason === 'symptoms') await page.locator('#urgent').check();
    await submit(page);
    if (reason === 'symptoms') {
      await screen(page, 'C4');
      expect((await state(page)).reports[0].urgent).toBe(true);
    } else {
      await screen(page, 'I5');
      expect((await state(page)).reports[0].reason).toBe(reason);
    }
  });
test('F11 tracking, referral, messages and follow-up recommendation', async ({
  page,
}) => {
  await load(page, 'completed');
  await nav(page, 'I3');
  await page.locator('#tracking').fill('Tôi muốn cập nhật tình trạng hôm nay.');
  await submit(page);
  expect((await state(page)).tracking).toHaveLength(1);
  await staff(page, 'referral');
  await nav(page, 'I4');
  await page
    .locator('#referral')
    .fill('Tôi đã trao đổi với cơ sở chuyên khoa.');
  await submit(page);
  await screen(page, 'I5');
  await page.locator('#message').fill('Tôi cần hỏi thêm.');
  await submit(page);
  await staff(page, 'reply');
  await expect(content(page)).toContainText('Phòng khám đã nhận nội dung');
  await staff(page, 'care:followup');
  await go(page, 'J1');
  await screen(page, 'J1');
});
test('F12 follow-up starts a new linked visit without losing the old profile', async ({
  page,
}) => {
  await load(page, 'completed');
  await nav(page, 'H6');
  await go(page, 'J1');
  await action(page, 'rebook').click();
  await screen(page, 'C7');
  await slot(page, '14:00');
  await send(page);
  const s = await state(page);
  expect(s.visits).toHaveLength(2);
  expect(s.visits[0].status).toBe('completed');
  expect((await current(page)).patientId).toBe('p1');
  expect((await current(page)).previousId).toBe(s.visits[0].id);
});

test('booking recovery: collision, unknown outcome, no duplicate and retry', async ({
  page,
}) => {
  await load(page, 'empty');
  await bookStart(page);
  await normal(page);
  await slot(page);
  await tools(page);
  await page.locator('#booking-outcome').selectOption('slot-unavailable');
  await page.locator('#consent').check();
  await submit(page);
  await expect(page.locator('#form-error')).toContainText('vừa hết chỗ');
  expect((await state(page)).visits).toHaveLength(0);
  await nav(page, 'C7');
  await slot(page, '14:00');
  await page.locator('#booking-outcome').selectOption('unknown');
  await page.locator('#consent').check();
  await submit(page);
  await expect(page.locator('#form-error')).toContainText('Chưa xác định');
  await submit(page);
  expect((await state(page)).visits).toHaveLength(0);
  await staff(page, 'unknown:missing');
  await page.locator('#booking-outcome').selectOption('success');
  await page.locator('#consent').check();
  await submit(page);
  await screen(page, 'C9');
  expect((await state(page)).visits).toHaveLength(1);
});
test('unknown found recovery returns the single pending request', async ({
  page,
}) => {
  await load(page, 'empty');
  await bookStart(page);
  await normal(page);
  await slot(page);
  await tools(page);
  await page.locator('#booking-outcome').selectOption('unknown');
  await page.locator('#consent').check();
  await submit(page);
  await staff(page, 'unknown:found');
  await screen(page, 'C9');
  expect((await state(page)).visits).toHaveLength(1);
  expect((await current(page)).status).toBe('pending');
});
test('offline retains typed form and recovers after reconnection', async ({
  page,
}) => {
  await load(page, 'empty');
  await bookStart(page);
  await normal(page);
  await slot(page);
  await page.locator('#consent').check();
  await tools(page);
  await page.locator('[data-action=offline]').click();
  await submit(page);
  await expect(page.locator('#form-error')).toContainText('mất mạng');
  expect((await state(page)).visits).toHaveLength(0);
  await page.locator('[data-action=offline]').click();
  await page.locator('#consent').check();
  await submit(page);
  await screen(page, 'C9');
});
test('proxy permission is bound to visit; direct links cannot expose health results', async ({
  page,
}) => {
  await load(page, 'empty');
  await action(page, 'begin').first().click();
  await content(page).locator('input[value=p2]').check();
  await submit(page);
  await page.locator('#reason').fill('Đặt lịch cho người thân');
  await submit(page);
  await normal(page);
  await slot(page);
  await send(page);
  await go(page, 'D2');
  await go(page, 'F1');
  await expect(content(page)).toHaveAttribute('data-guarded', 'permission');
  await page.reload();
  await expect(content(page)).toHaveAttribute('data-guarded', 'permission');
  await tools(page);
  await staff(page, 'permission:grant');
  await screen(page, 'F1');
  await staff(page, 'permission:revoke');
  await expect(content(page)).toHaveAttribute('data-guarded', 'permission');
});
test('Back, reload, safe notification deep link and invalid entity recovery', async ({
  page,
}) => {
  await load(page);
  await nav(page, 'D2');
  await go(page, 'E1');
  await page.goBack();
  await screen(page, 'D2');
  await page.reload();
  await screen(page, 'D2');
  await nav(page, 'K1');
  await action(page, 'notification').first().click();
  await screen(page, 'D2');
  await page.goto('/prototype/index.html#/appointments/no-such-visit');
  await expect(content(page)).toHaveAttribute('data-guarded', 'visit');
  await go(page, 'D1');
  await screen(page, 'D1');
});
test('deep link authentication resumes the exact visit after matching the profile', async ({
  page,
}) => {
  await load(page);
  await nav(page, 'K4');
  await action(page, 'logout').click();
  await page.goto('/prototype/index.html#/appointments/CF-0001');
  await expect(content(page)).toHaveAttribute('data-guarded', 'auth');
  await go(page, 'A1');
  await login(page);
  await screen(page, 'A2');
  await submit(page);
  await screen(page, 'D2');
});
test('settings persist through reload and reset; support and FAQ are functional', async ({
  page,
}) => {
  await load(page);
  await nav(page, 'K4');
  await page.locator('#largeText').check();
  await page.locator('#reminders').uncheck();
  await submit(page);
  await page.reload();
  await expect(page.locator('#largeText')).toBeChecked();
  await expect(page.locator('#reminders')).not.toBeChecked();
  await nav(page, 'K5');
  await page.locator('summary').first().click();
  await expect(content(page)).toContainText('Lịch chỉ được xác nhận');
  await page.locator('#support').fill('Tôi cần hỗ trợ đổi giờ');
  await submit(page);
  await page.locator('[data-action=close-dialog]').click();
  expect((await state(page)).requests).toHaveLength(1);
  await tools(page);
  await page.locator('[data-action=reset]').click();
  await screen(page, 'A1');
  expect((await state(page)).visits).toHaveLength(0);
});
test('upload rejects invalid content; text is escaped rather than executed', async ({
  page,
}) => {
  await load(page, 'pre-lab');
  await nav(page, 'F4');
  await page.locator('#file').setInputFiles({
    name: 'unsafe.html',
    mimeType: 'text/html',
    buffer: Buffer.from('<script>alert(1)</script>'),
  });
  await submit(page);
  await expect(page.locator('#form-error')).toContainText('PDF');
  await load(page, 'completed');
  await nav(page, 'I5');
  const text = '<img src=x onerror="throw new Error(1)">';
  await page.locator('#message').fill(text);
  await submit(page);
  await expect(content(page)).toContainText(text);
  await expect(content(page).locator('img')).toHaveCount(0);
});
test('leaving online call never marks consultation completed', async ({
  page,
}) => {
  await onlineWait(page);
  await action(page, 'answer').click();
  await action(page, 'leave-call').click();
  await page.locator('[data-action=confirm-leave]').click();
  await screen(page, 'D2');
  expect((await current(page)).status).toBe('in-consult');
  expect((await current(page)).communication.callback).toBe('pending');
});
for (const view of [
  { width: 360, large: false },
  { width: 390, large: false },
  { width: 360, large: true },
])
  test(
    'all 47 routes render and reflow ' +
      view.width +
      (view.large ? ' large text' : ''),
    async ({ page }, info) => {
      test.setTimeout(240000);
      await page.setViewportSize({ width: view.width, height: 844 });
      await load(page);
      for (const meta of M.SCREENS) {
        await seed(page, meta.id, view.large);
        await expect(content(page).locator('h1')).toHaveCount(1);
        await expect(content(page)).not.toBeEmpty();
        const metrics = await page.evaluate(() => {
          const root = document.querySelector('#phone-content'),
            main = document.querySelector('#phone-main');
          return {
            page: document.documentElement.scrollWidth <= innerWidth,
            main: main.scrollWidth <= main.clientWidth + 1,
            content: root.scrollWidth <= root.clientWidth + 1,
            tiny: [
              ...root.querySelectorAll(
                'button,a,input:not([type=radio],[type=checkbox]),summary',
              ),
            ]
              .filter((x) => {
                const r = x.getBoundingClientRect();
                return (
                  r.width > 0 && r.height > 0 && (r.width < 43 || r.height < 43)
                );
              })
              .map((x) => x.outerHTML.slice(0, 180)),
          };
        });
        expect(metrics.page, meta.id + ' page overflow').toBe(true);
        expect(metrics.main, meta.id + ' scroller overflow').toBe(true);
        expect(metrics.content, meta.id + ' content overflow').toBe(true);
        expect(metrics.tiny, meta.id + ' small touch targets').toEqual([]);
        const text = await content(page).innerText();
        expect(text, /patient jargon at / + meta.id).not.toMatch(
          /bản mẫu|hồ sơ mẫu|check-in|\bbooking\b|\bslot\b|\bmock\b|mô phỏng|viện phí/i,
        );
        if (
          view.width === 390 &&
          [
            'A1',
            'B1',
            'C4',
            'C5',
            'C8',
            'D2',
            'E3',
            'F2',
            'G3',
            'G4',
            'G5',
            'H2',
            'H4',
            'H5',
            'H7',
            'I5',
            'K5',
          ].includes(meta.id)
        )
          await page
            .locator('.phone')
            .screenshot({ path: info.outputPath(meta.id + '.png') });
      }
    },
  );
test('accessibility: axe WCAG A/AA and keyboard labels in 16 representative states', async ({
  page,
}) => {
  test.setTimeout(240000);
  await load(page);
  for (const id of [
    'A1',
    'A2',
    'C1',
    'C3',
    'C4',
    'C8',
    'D2',
    'E2',
    'F3',
    'F4',
    'G4',
    'H3',
    'H7',
    'I1',
    'I5',
    'K5',
  ]) {
    await seed(page, id);
    const results = await new AxeBuilder({ page })
      .include('.phone')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
      id,
    ).toEqual([]);
  }
  await seed(page, 'A1');
  await page.locator('#phone').focus();
  await page.keyboard.press('Tab');
  await expect(content(page).locator('[type=submit]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#form-error')).not.toBeEmpty();
  await expect(page.locator('#phone')).toHaveAttribute('aria-invalid', 'true');
});
test('desktop frame, project subpath assets, self-hosted Vietnamese font', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto(
    '/Patient-Journey-App/prototype/index.html?scenario=upcoming',
  );
  await screen(page, 'B1');
  expect(
    (
      await page.request.get(
        '/Patient-Journey-App/prototype/assets/fonts/BeVietnamPro-Regular.ttf',
      )
    ).status(),
  ).toBe(200);
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      document.fonts.check('16px "Be Vietnam Pro"', 'Chăm sóc sức khỏe'),
    ),
  ).toBe(true);
  await expect(page.locator('.phone')).toHaveCSS('width', '402px');
  await action(page, 'begin').first().click();
  await screen(page, 'C1');
  await page.reload();
  await screen(page, 'C1');
  await page.screenshot({
    path: info.outputPath('desktop.png'),
    fullPage: true,
  });
});
test('D2 has one primary next action in every main state', async ({ page }) => {
  await load(page);
  for (const status of Object.keys(M.TRANSITIONS)) {
    await seed(page, 'D2');
    await page.evaluate((status) => {
      const x = JSON.parse(sessionStorage.getItem('careflow.browser.v3'));
      x.state.visits[0].status = status;
      sessionStorage.setItem('careflow.browser.v3', JSON.stringify(x));
    }, status);
    await page.reload();
    await expect(content(page).locator('.btn.primary')).toHaveCount(1);
    await expect(content(page).locator('.btn.primary')).toBeEnabled();
  }
});

test('unknown request locks earlier booking steps until reconciliation', async ({
  page,
}) => {
  await load(page, 'empty');
  await bookStart(page);
  await normal(page);
  await slot(page);
  await tools(page);
  await page.locator('#booking-outcome').selectOption('unknown');
  await page.locator('#consent').check();
  await submit(page);
  await nav(page, 'C2');
  await expect(content(page)).toHaveAttribute('data-guarded', 'unknown');
  await go(page, 'C8');
  await staff(page, 'unknown:found');
  await screen(page, 'C9');
  await nav(page, 'C2');
  await expect(content(page)).toHaveAttribute('data-guarded', 'sent');
  expect((await state(page)).visits).toHaveLength(1);
});
test('typed booking draft survives reload without persisting OTP', async ({
  page,
}) => {
  await load(page, 'empty');
  await action(page, 'begin').first().click();
  await submit(page);
  await page.locator('#reason').fill('Nội dung chưa gửi được giữ lại.');
  await page.reload();
  await screen(page, 'C2');
  await expect(page.locator('#reason')).toHaveValue(
    'Nội dung chưa gửi được giữ lại.',
  );
});
test('D2 next action is visible at 360px before scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await load(page);
  await nav(page, 'D2');
  await page.locator('#review-toggle').click();
  const visible = await content(page)
    .locator('.next-step .primary')
    .evaluate((el) => {
      const a = el.getBoundingClientRect(),
        b = document.querySelector('#phone-main').getBoundingClientRect();
      return a.top >= b.top && a.bottom <= b.bottom;
    });
  expect(visible).toBe(true);
});
test('exception screenshots document cancellation, no-show, offline and transfer pending', async ({
  page,
}, info) => {
  await load(page, 'no-show');
  await nav(page, 'D2');
  await page.locator('#review-toggle').click();
  await page
    .locator('.phone')
    .screenshot({ path: info.outputPath('D2-no-show.png') });
  await load(page);
  await nav(page, 'D4');
  await submit(page);
  await page
    .locator('#dialog')
    .screenshot({ path: info.outputPath('D4-confirmation.png') });
  await page.locator('[data-action=confirm-cancel]').click();
  await page
    .locator('.phone')
    .screenshot({ path: info.outputPath('D2-cancelled.png') });
  await load(page, 'completed');
  await nav(page, 'H4');
  await content(page).locator('[data-status=transfer-pending]').click();
  await page
    .locator('.phone')
    .screenshot({ path: info.outputPath('H5-transfer-pending.png') });
  await tools(page);
  await page.locator('[data-action=offline]').click();
  await page
    .locator('.phone')
    .screenshot({ path: info.outputPath('offline.png') });
  for(const id of ['C7','C9','H6','I1']){await seed(page,id,id==='I1');await page.locator('.phone').screenshot({path:info.outputPath(id+(id==='I1'?'-large':'')+'.png')});}

});
test('skip content preserves route and direct-link header Back has an in-app exit', async ({
  page,
}) => {
  await load(page);
  const hash = await page.evaluate(() => location.hash);
  await page.locator('.skip-link').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#phone-main')).toBeFocused();
  expect(await page.evaluate(() => location.hash)).toBe(hash);
  await page.goto(
    '/prototype/index.html?direct=1#/appointments/CF-0001/prepare',
  );
  await page.locator('#back').click();
  await screen(page, 'D1');
});
test('F5 existing external result goes directly from ordered to available', async ({
  page,
}) => {
  await load(page, 'pre-lab');
  await nav(page, 'F2');
  await go(page, 'F4');
  await page.locator('#file').setInputFiles({
    name: 'external-result.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF fixture'),
  });
  await submit(page);
  expect((await current(page)).labs[0].status).toBe('available');
  await go(page, 'D2');
  await staff(page, 'visit:confirmed');
  expect((await current(page)).status).toBe('confirmed');
});
test('F8 unanswered waiting-room event and staff callback preserve the same visit', async ({
  page,
}) => {
  await load(page, 'online');
  await nav(page, 'G1');
  await action(page, 'device').click();
  await page.locator('[data-action=device-ready]').click();
  await staff(page, 'visit:reminder');
  await action(page, 'join').click();
  await staff(page, 'visit:unreachable');
  await screen(page, 'G5');
  const id = (await current(page)).id;
  await staff(page, 'visit:online-wait');
  await nav(page, 'G2');
  await staff(page, 'visit:calling');
  await action(page, 'answer').click();
  await screen(page, 'G4');
  expect((await current(page)).id).toBe(id);
  expect((await state(page)).visits).toHaveLength(1);
});
test('F9 fee-free completion and F10 summary/additional-lab actions use the right visit', async ({
  page,
}) => {
  await load(page, 'completed');
  await nav(page, 'H2');
  await staff(page, 'payment:not-required');
  await go(page, 'H5');
  await expect(content(page)).toContainText('Không phát sinh phí');
  await nav(page, 'F2');
  for (const status of [
    'scheduled',
    'available',
    'awaiting-review',
    'reviewed',
  ])
    await staff(page, 'lab-status:lab-1:' + status);
  await nav(page, 'H7');
  await go(page, 'H6');
  await screen(page, 'H6');
  await nav(page, 'H7');
  await staff(page, 'lab:post');
  await go(page, 'F1');
  await expect(content(page).locator('[data-to=F2]')).toHaveCount(2);
  await content(page).locator('[data-lab=lab-2]').click();
  await screen(page, 'F2');
  expect((await current(page)).labs[1].status).toBe('ordered');
});
test('large text actually doubles editable text, with no horizontal overflow', async ({
  page,
}) => {
  await load(page, 'empty');
  await action(page, 'begin').first().click();
  await submit(page);
  const size = await page
    .locator('#reason')
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  await tools(page);
  await page.locator('[data-action=large-text]').click();
  expect(
    await page
      .locator('#reason')
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBe(size * 2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test('F11 multiple completed visits keep the selected report context', async ({
  page,
}) => {
  await load(page, 'completed');
  await page.evaluate(() => {
    const M = window.CareFlowModel,
      s = M.fixture('completed');
    M.beginBooking(s, s.activeVisitId, 'followup');
    Object.assign(s.draft, { safety: 'normal', slot: '14:00' });
    M.submitBooking(s);
    for (const to of [
      'confirmed',
      'reminder',
      'arrived',
      'received',
      'ready',
      'in-consult',
      'completed',
    ])
      M.transition(s, s.activeVisitId, to, 'staff');
    sessionStorage.setItem(
      'careflow.browser.v3',
      JSON.stringify({ state: s, ui: { forms: {} } }),
    );
  });
  await page.goto('/prototype/index.html?multiple=1#/care?visit=CF-0002');
  await screen(page, 'I1');
  await expect(content(page).locator('input[type=radio]')).toHaveCount(2);
  await content(page).locator('input[value=CF-0001]').check();
  await content(page).locator('[data-reason=question]').click();
  await page.locator('#report').fill('Trao đổi về lượt khám trước.');
  await submit(page);
  expect((await state(page)).reports[0].visitId).toBe('CF-0001');
  expect((await current(page)).id).toBe('CF-0001');
});
