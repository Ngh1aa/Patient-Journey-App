const { test } = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  M = require('./model.js'),
  VI = require('./strings.vi.js');
const draft = () => {
  const s = M.fixture('empty');
  M.beginBooking(s);
  Object.assign(s.draft, {
    reason: 'Trao đổi với bác sĩ',
    safety: 'normal',
    slot: '09:00',
  });
  return s;
};
const current = (s) => M.visit(s),
  book = () => {
    const s = draft();
    M.submitBooking(s);
    return s;
  };
test('47 unique IDs and exact routes match the supplied inventory', () => {
  const source = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../docs/screen-inventory.json')),
  );
  assert.deepEqual(M.SCREENS, source);
  assert.equal(source.length, 47);
  assert.equal(new Set(source.map((x) => x.id)).size, 47);
  assert.equal(new Set(source.map((x) => x.route)).size, 47);
});
test('every screen has centralized Vietnamese copy and a composed renderer', () => {
  const source = fs.readFileSync(path.join(__dirname, 'views.js'), 'utf8');
  for (const row of M.SCREENS) {
    assert.ok(VI.screen[row.id]?.heading, row.id);
    assert.ok(source.includes("case '" + row.id + "'"), row.id);
  }
  for (const status of Object.keys(M.TRANSITIONS))
    assert.ok(VI.statuses[status]);
});
test('new and existing profile authentication branches, invalid phone/OTP', () => {
  const s = M.initial();
  assert.equal(M.authenticate(s, '123', '123456').ok, false);
  assert.equal(M.authenticate(s, '0900000000', '111111').ok, false);
  assert.equal(s.authenticated, false);
  assert.equal(M.authenticate(s, '0900000000', '123456').match, false);
  M.createProfile(s, 'Hồ sơ thử', '1990-01-01');
  s.authenticated = false;
  assert.equal(M.authenticate(s, '0900000000', '123456').match, true);
});
test('profile requires valid information and authentication', () => {
  const s = M.initial();
  assert.equal(M.createProfile(s, 'A', '1990-01-01').ok, false);
  s.authenticated = true;
  assert.equal(M.createProfile(s, '', '1990-01-01').ok, false);
  assert.equal(M.createProfile(s, 'A', '2999-01-01').ok, false);
  assert.equal(M.createProfile(s, 'A', '1990-01-01').ok, true);
});
test('F1 submission is pending and idempotent, never auto-confirmed', () => {
  const s = draft();
  const a = M.submitBooking(s);
  assert.equal(a.visit.status, 'pending');
  assert.equal(M.submitBooking(s).visit.id, a.visit.id);
  assert.equal(s.visits.length, 1);
});
test('booking rejects incomplete safety, reason, date, slot, permission', () => {
  for (const [key, value, code] of [
    ['reason', '', 'REASON'],
    ['safety', '', 'SAFETY'],
    ['date', '2000-01-01', 'SLOT'],
    ['slot', '09:99', 'SLOT'],
  ]) {
    const s = draft();
    s.draft[key] = value;
    assert.equal(M.submitBooking(s).code, code);
  }
  const s = draft();
  M.profile(s).canBook = false;
  assert.equal(M.submitBooking(s).ok, false);
});
test('F3 danger remains sticky when changing the answer and switching patients', () => {
  const s = draft();
  assert.equal(M.screenSafety(s, 'warning').next, 'C4');
  assert.equal(M.screenSafety(s, 'normal').next, 'C4');
  assert.equal(M.submitBooking(s).code, 'REVIEW');
  M.choosePatient(s, 'p2');
  assert.equal(s.draft.risk, false);
  assert.equal(s.draft.reason, '');
  M.choosePatient(s, 'p1');
  assert.equal(s.draft.risk, true);
  assert.equal(M.submitBooking(s).ok, false);
});
test('F3 acknowledged warning submits to mode-review, then staff determines mode', () => {
  const s = draft();
  M.screenSafety(s, 'warning');
  s.draft.reviewAccepted = true;
  assert.equal(M.submitBooking(s).visit.status, 'mode-review');
  assert.equal(M.transition(s, current(s).id, 'confirmed', 'staff').ok, false);
  assert.equal(M.transition(s, current(s).id, 'pending').ok, false);
  assert.equal(
    M.reviewMode(s, current(s).id, 'online', 'Phòng khám đã xem xét').ok,
    true,
  );
  assert.equal(current(s).mode, 'online');
  assert.equal(current(s).status, 'pending');
});
test('slot collision preserves reason and creates no visit', () => {
  const s = draft();
  assert.equal(M.submitBooking(s, 'slot-unavailable').code, 'SLOT_UNAVAILABLE');
  assert.equal(s.visits.length, 0);
  assert.equal(s.draft.slot, '');
  assert.ok(s.draft.reason);
});
for (const found of [true, false])
  test('unknown outcome recovery ' + found, () => {
    const s = draft();
    assert.equal(M.submitBooking(s, 'unknown').code, 'UNKNOWN');
    assert.equal(M.submitBooking(s).code, 'UNKNOWN');
    assert.equal(s.visits.length, 0);
    assert.equal(M.resolveUnknown(s, found).ok, true);
    if (!found) M.submitBooking(s);
    assert.equal(s.visits.length, 1);
  });
test('unknown request cannot be reconciled against a modified draft', () => {
  const s = draft();
  M.submitBooking(s, 'unknown');
  s.draft.slot = '14:00';
  assert.equal(M.resolveUnknown(s, true).code, 'CONFLICT');
  assert.equal(s.visits.length, 0);
});
test('offline booking is blocked and keeps draft', () => {
  const s = draft();
  s.offline = true;
  assert.equal(M.submitBooking(s).code, 'OFFLINE');
  assert.equal(s.visits.length, 0);
  assert.equal(s.draft.slot, '09:00');
});
test('F4 onsite transitions preserve ordered clinical handoffs', () => {
  const s = book(),
    id = current(s).id;
  for (const to of ['confirmed', 'reminder'])
    assert.equal(M.transition(s, id, to, 'staff').ok, true);
  assert.equal(M.transition(s, id, 'completed', 'staff').ok, false);
  assert.equal(M.transition(s, id, 'arrived').ok, true);
  for (const to of ['received', 'ready', 'in-consult', 'completed']) {
    assert.equal(M.transition(s, id, to).ok, false);
    assert.equal(M.transition(s, id, to, 'staff').ok, true);
  }
  assert.equal(current(s).history.length, 8);
});
test('all 15 main states reject every transition absent from the contract', () => {
  for (const from of Object.keys(M.TRANSITIONS))
    for (const to of Object.keys(M.TRANSITIONS)) {
      if (M.TRANSITIONS[from].includes(to)) continue;
      const s = M.fixture('upcoming');
      current(s).status = from;
      assert.equal(
        M.transition(s, current(s).id, to, 'staff', 'reason').ok,
        false,
        from + ' → ' + to,
      );
    }
});
test('mode guards reject online arrival and onsite online-wait', () => {
  const s = M.fixture('online'),
    v = current(s);
  M.transition(s, v.id, 'reminder', 'staff');
  assert.equal(M.transition(s, v.id, 'arrived').ok, false);
  v.mode = 'onsite';
  assert.equal(M.transition(s, v.id, 'online-wait').ok, false);
});
test('F5 pre-lab requires result or an explicit staff allowance before confirming', () => {
  const s = M.fixture('pre-lab'),
    v = current(s);
  assert.equal(v.labs[0].status, 'ordered');
  assert.equal(M.transition(s, v.id, 'confirmed', 'staff').ok, false);
  assert.equal(
    M.transition(s, v.id, 'confirmed', 'staff', 'allow-before-results').ok,
    true,
  );
});
test('F5 ordered lab can receive an external file and return to the current visit', () => {
  const s = M.fixture('pre-lab'),
    v = current(s),
    l = v.labs[0];
  assert.equal(
    M.labTransition(s, v.id, l.id, 'available', 'patient', {
      file: { name: 'result.pdf' },
    }).ok,
    true,
  );
  assert.equal(M.transition(s, v.id, 'confirmed', 'staff').ok, true);
  assert.equal(s.visits.length, 1);
});
test('F6 cancellation requires reason; rebook preserves old visit history', () => {
  const s = M.fixture('upcoming'),
    v = current(s);
  assert.equal(M.transition(s, v.id, 'cancelled').ok, false);
  assert.equal(
    M.transition(s, v.id, 'cancelled', 'patient', 'Tôi bận').ok,
    true,
  );
  const old = JSON.stringify(v.history);
  M.beginBooking(s, v.id, 'rebook');
  Object.assign(s.draft, { safety: 'normal', slot: '14:00' });
  M.submitBooking(s);
  assert.equal(s.visits.length, 2);
  assert.equal(current(s).previousId, v.id);
  assert.equal(v.status, 'cancelled');
  assert.equal(v.cancelReason, 'Tôi bận');
  assert.ok(
    JSON.parse(old).every(
      (x, i) => JSON.stringify(v.history[i]) === JSON.stringify(x),
    ),
  );
});
test('F6 reschedule is atomic, creates a linked visit and closes the old one only upon submission', () => {
  const s = M.fixture('upcoming'),
    old = current(s);
  M.beginBooking(s, old.id, 'reschedule');
  assert.equal(old.status, 'confirmed');
  Object.assign(s.draft, { safety: 'normal', slot: '14:00' });
  M.submitBooking(s);
  assert.equal(old.status, 'cancelled');
  assert.equal(old.rescheduledTo, current(s).id);
  assert.equal(current(s).status, 'pending');
  assert.equal(current(s).previousId, old.id);
});
test('F6 no-show rebook retains patient and reason', () => {
  const s = M.fixture('no-show'),
    old = current(s);
  M.beginBooking(s, old.id, 'rebook');
  assert.equal(s.draft.reason, old.reason);
  assert.equal(s.draft.patientId, old.patientId);
  assert.equal(old.status, 'no-show');
});
test('F7 video joining is not completion and only staff can complete an encounter', () => {
  const s = M.fixture('online'),
    v = current(s);
  M.transition(s, v.id, 'reminder', 'staff');
  M.transition(s, v.id, 'online-wait');
  M.transition(s, v.id, 'calling', 'staff');
  M.transition(s, v.id, 'in-consult');
  assert.equal(M.transition(s, v.id, 'completed').ok, false);
  assert.equal(M.transition(s, v.id, 'completed', 'staff').ok, true);
});
for (const mode of ['online', 'onsite'])
  test(
    'F8 replacement after unreachable uses a new linked visit: ' + mode,
    () => {
      const s = M.fixture('online'),
        old = current(s);
      for (const t of ['reminder', 'online-wait', 'calling', 'unreachable'])
        M.transition(s, old.id, t, 'staff');
      M.beginBooking(s, old.id, 'online-retry', mode);
      Object.assign(s.draft, { safety: 'normal', slot: '14:00' });
      M.submitBooking(s);
      assert.equal(old.status, 'cancelled');
      assert.equal(current(s).previousId, old.id);
      assert.equal(current(s).mode, mode);
      assert.equal(current(s).status, 'pending');
    },
  );
for (const method of [
  'transfer-pending',
  'counter-pending',
  'pharmacy-pending',
])
  test('F9 method requires staff reconciliation: ' + method, () => {
    const s = M.fixture('completed'),
      v = current(s);
    assert.equal(M.setPayment(s, v.id, method).ok, true);
    assert.notEqual(v.payment.status, 'paid');
    assert.equal(M.setPayment(s, v.id, 'paid').ok, false);
    assert.equal(M.setPayment(s, v.id, 'paid', 'staff').ok, true);
    assert.equal(v.status, 'completed');
  });
test('F9 deferred requires reason and date, fee waiver and refund are staff-owned', () => {
  const s = M.fixture('completed'),
    v = current(s);
  assert.equal(M.setPayment(s, v.id, 'deferred').ok, false);
  assert.equal(
    M.setPayment(s, v.id, 'deferred', 'patient', {
      reason: 'Cần sắp xếp',
      dueDate: M.localDate(2),
    }).ok,
    true,
  );
  assert.equal(M.setPayment(s, v.id, 'not-required').ok, false);
  assert.equal(M.setPayment(s, v.id, 'not-required', 'staff').ok, true);
  const t = M.fixture('completed'),
    a = current(t);
  M.setPayment(t, a.id, 'counter-pending');
  M.setPayment(t, a.id, 'paid', 'staff');
  assert.equal(M.setPayment(t, a.id, 'refunding', 'staff').ok, false);
  assert.equal(
    M.setPayment(t, a.id, 'refunding', 'staff', {
      reason: 'Theo xác nhận của phòng khám',
    }).ok,
    true,
  );
  assert.equal(M.setPayment(t, a.id, 'refunded', 'staff').ok, true);
});
test('F10 lab chain has five independent states, review does not notify or explain', () => {
  const s = M.fixture('completed'),
    v = current(s),
    l = v.labs[0];
  assert.equal(M.labTransition(s, v.id, l.id, 'reviewed').ok, false);
  for (const status of [
    'scheduled',
    'available',
    'awaiting-review',
    'reviewed',
  ])
    assert.equal(
      M.labTransition(s, v.id, l.id, status, 'staff', {
        appointmentDate: M.localDate(1),
      }).ok,
      true,
    );
  assert.equal(l.history.length, 5);
  assert.equal(v.communication.result, 'pending');
  assert.equal(v.communication.explanation, 'pending');
  assert.equal(M.communicateResult(s, v.id, 'explained').ok, false);
  M.communicateResult(s, v.id, 'unreachable');
  assert.equal(v.communication.callback, 'pending');
  M.communicateResult(s, v.id, 'notified');
  assert.equal(v.communication.explanation, 'pending');
  M.communicateResult(s, v.id, 'explained');
  assert.equal(v.communication.explanation, 'explained');
});
test('payment, lab and care do not overwrite main visit status', () => {
  const s = M.fixture('completed'),
    v = current(s);
  M.setPayment(s, v.id, 'transfer-pending');
  M.labTransition(s, v.id, v.labs[0].id, 'available', 'patient', {
    file: { name: 'a.pdf' },
  });
  M.report(s, v.id, 'medicine', 'Hỏi phòng khám');
  assert.equal(v.status, 'completed');
});
test('F11 each reason creates a distinct report context and urgent route', () => {
  for (const reason of ['medicine', 'question', 'symptoms']) {
    const s = M.fixture('completed'),
      v = current(s);
    assert.equal(
      M.report(s, v.id, reason, 'Nội dung thử', reason === 'symptoms').next,
      reason === 'symptoms' ? 'C4' : 'I5',
    );
    assert.equal(s.reports[0].reason, reason);
    assert.equal(s.messages[0].visitId, v.id);
  }
});
test('F12 follow-up keeps old encounter intact and links new visit', () => {
  const s = M.fixture('completed'),
    old = current(s),
    history = JSON.stringify(old.history);
  M.beginBooking(s, old.id, 'followup');
  Object.assign(s.draft, { safety: 'normal', slot: '14:00' });
  M.submitBooking(s);
  assert.equal(current(s).previousId, old.id);
  assert.equal(old.status, 'completed');
  assert.ok(old.history.length > JSON.parse(history).length);
  assert.equal(current(s).patientId, old.patientId);
});
test('explanation appointment has a separate not-required fee', () => {
  const s = M.fixture('completed'),
    old = current(s);
  M.beginBooking(s, old.id, 'explanation');
  Object.assign(s.draft, { safety: 'normal', slot: '14:00' });
  M.submitBooking(s);
  assert.equal(current(s).payment.status, 'not-required');
  assert.equal(old.payment.status, 'unpaid');
});
test('proxy booking does not confer result permission; checks bound to visit patient', () => {
  const s = draft();
  M.choosePatient(s, 'p2');
  Object.assign(s.draft, { reason: 'Đặt hộ', safety: 'normal', slot: '09:00' });
  M.submitBooking(s);
  assert.equal(current(s).patientId, 'p2');
  assert.equal(M.canViewResults(s, current(s)), false);
  s.activePatientId = 'p1';
  assert.equal(M.canViewResults(s, current(s)), false);
  M.profile(s, 'p2').canViewResults = true;
  assert.equal(M.canViewResults(s, current(s)), true);
  M.profile(s, 'p2').canViewResults = false;
  assert.equal(M.canViewResults(s, current(s)), false);
});
test('notifications never include sensitive reason, medicine or lab content', () => {
  const s = draft();
  s.draft.reason = 'sensitive health text';
  M.submitBooking(s);
  M.transition(s, current(s).id, 'confirmed', 'staff');
  assert.equal(
    JSON.stringify(s.notifications).includes('sensitive health text'),
    false,
  );
  assert.ok(
    s.notifications.every(
      (n) =>
        n.title === 'Có cập nhật về lượt khám' &&
        n.body === 'Mở ứng dụng để xem chi tiết.',
    ),
  );
});
test('all 15 D2 main states have exactly one primary next action', () => {
  for (const status of Object.keys(M.TRANSITIONS)) {
    const s = M.fixture('upcoming'),
      v = current(s);
    v.status = status;
    const next = M.nextAction(v);
    assert.equal(next.length, 2);
    assert.ok(M.SCREENS.some((x) => x.id === next[0]));
    assert.ok(VI.actions[next[1]]);
  }
});
test('copy contains no developer jargon in patient screens', () => {
  const forbidden =
    /bản mẫu|hồ sơ mẫu|check-in|booking|ticket|\bslot\b|\bmock\b|mô phỏng|viện phí/i;
  for (const [id, copy] of Object.entries(VI.screen))
    assert.equal(forbidden.test(JSON.stringify(copy)), false, id);
});
test('script loading order and mobile viewport are intact', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.ok(html.includes('viewport-fit=cover'));
  assert.ok(html.indexOf('src="./model.js"') < html.indexOf('src="./app.js"'));
  assert.ok(html.includes('Bản demo'));
});

test('unknown outcome cannot be reset by restarting booking or changing patient', () => {
  const s = draft();
  M.submitBooking(s, 'unknown');
  assert.equal(M.beginBooking(s).code, 'UNKNOWN');
  assert.equal(M.choosePatient(s, 'p2').code, 'UNKNOWN');
  assert.equal(M.screenSafety(s, 'normal').code, 'UNKNOWN');
  assert.equal(s.request.status, 'unknown');
  assert.equal(s.visits.length, 0);
});
test('impossible calendar dates are rejected', () => {
  const s = M.fixture('empty');
  assert.equal(M.createProfile(s, 'A', '1999-02-31').ok, false);
  M.beginBooking(s);
  Object.assign(s.draft, {
    reason: 'A',
    safety: 'normal',
    slot: '09:00',
    date: '2027-02-31',
  });
  assert.equal(M.submitBooking(s).code, 'SLOT');
});
const { test: regression } = require('node:test');
regression(
  'disabled reminders suppress reminder preview but preserve visit state',
  () => {
    const s = M.fixture('upcoming'),
      v = M.visit(s),
      count = s.notifications.length;
    s.settings.reminders = false;
    M.transition(s, v.id, 'reminder', 'staff');
    assert.equal(v.status, 'reminder');
    assert.equal(s.notifications.length, count);
  },
);
