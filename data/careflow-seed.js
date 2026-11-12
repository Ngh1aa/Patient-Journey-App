/* CareFlow demo seed — the single source of starting data for the patient app
 * (prototype/) and the clinic workspace (staff-prototype/).
 *
 * Every person, clinician, code and document here is fictional. Medication
 * entries are illustrative placeholders, not treatment advice. Dates are
 * offsets from "today" (Asia/Ho_Chi_Minh) so the demo always has a visit
 * today, upcoming visits and past visits.
 *
 * User changes never touch this file: both apps copy the built state into
 * sessionStorage (key careflow.browser.v3) and work on that copy.
 */
(function (root) {
  'use strict';
  const TZ = 'Asia/Ho_Chi_Minh';
  const day = (offset = 0, now = Date.now()) =>
    new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(new Date(now + offset * 86400000));
  const at = (offset, time, now) => new Date(day(offset, now) + 'T' + time + ':00+07:00').toISOString();

  const DATA = {
    accountPhone: '0900000000',
    specialties: ['Nội tổng quát', 'Tim mạch', 'Da liễu', 'Tai mũi họng', 'Nhi khoa'],
    clinicians: [
      { id: 'dr-ha', name: 'BS. Trần Thu Hà', specialty: 'Nội tổng quát', initials: 'TH' },
      { id: 'dr-an', name: 'BS. Nguyễn Văn An', specialty: 'Nội tổng quát', initials: 'VA' },
      { id: 'dr-quan', name: 'BS. Lê Minh Quân', specialty: 'Tim mạch', initials: 'LQ' },
      { id: 'dr-lan', name: 'BS. Phạm Ngọc Lan', specialty: 'Da liễu', initials: 'PL' },
      { id: 'dr-khoa', name: 'BS. Đỗ Đăng Khoa', specialty: 'Tai mũi họng', initials: 'ĐK' },
      { id: 'dr-linh', name: 'BS. Trần Phương Linh', specialty: 'Nhi khoa', initials: 'PL' },
    ],
    // Patient account (the person who signs in to the patient app) and dependents.
    profiles: [
      { id: 'p1', name: 'Nguyễn Minh Anh', dob: '1994-08-15', relation: 'self', phone: '0900000000', email: 'minhanh.demo@example.com', address: '12 Đường Mẫu, phường Demo, TP.HCM', allergies: 'Chưa ghi nhận dị ứng', medicalHistory: 'Không có ghi chú thêm.', canBook: true, canViewResults: true },
      { id: 'p2', name: 'Trần Thị Mai', dob: '1965-05-12', relation: 'mother', phone: '', email: '', address: '', allergies: '', medicalHistory: '', canBook: true, canViewResults: false },
      { id: 'p3', name: 'Nguyễn Gia Bảo', dob: '2019-03-02', relation: 'child', phone: '', email: '', address: '', allergies: '', medicalHistory: '', canBook: true, canViewResults: true },
    ],
    insurance: {
      p1: { type: 'bhyt', number: 'DN4797900000128', holder: 'Nguyễn Minh Anh', facility: 'Phòng khám Đa khoa Mẫu Quận 1', validFromOffset: -200, validToOffset: 165, updatedOffset: -30 },
    },
    // Account visits. status follows prototype/model.js TRANSITIONS.
    visits: [
      { id: 'CF-2041', patientId: 'p1', clinicianId: 'dr-ha', offset: 0, slot: '15:30', mode: 'onsite', status: 'confirmed', reason: 'Đau họng và mệt mỏi ba ngày', createdOffset: -4 },
      { id: 'CF-2044', patientId: 'p1', clinicianId: 'dr-quan', offset: 6, slot: '09:00', mode: 'online', status: 'confirmed', reason: 'Tư vấn lại sau lần đo huyết áp tại nhà', createdOffset: -2 },
      { id: 'CF-2046', patientId: 'p2', clinicianId: 'dr-lan', offset: 10, slot: '08:00', mode: 'onsite', status: 'pending', reason: 'Da khô, ngứa vùng cánh tay', createdOffset: -1 },
      { id: 'CF-2031', patientId: 'p1', clinicianId: 'dr-ha', offset: -21, slot: '10:30', mode: 'onsite', status: 'completed', reason: 'Ho và sốt nhẹ', createdOffset: -25,
        summary: 'Bác sĩ đã ghi nhận nội dung buổi khám. Kết luận chi tiết được lưu trong hồ sơ của phòng khám; bạn có thể hỏi lại phòng khám nếu cần giải thích.',
        labs: [
          { id: 'lab-1', name: 'Công thức máu (minh họa)', status: 'reviewed', note: 'Bác sĩ đã xem kết quả và trao đổi trong buổi khám.' },
          { id: 'lab-2', name: 'X-quang ngực (minh họa)', status: 'reviewed', note: 'Bác sĩ đã xem hình ảnh và ghi nhận trong hồ sơ.' },
        ] },
      { id: 'CF-2018', patientId: 'p3', clinicianId: 'dr-linh', offset: -48, slot: '14:00', mode: 'onsite', status: 'completed', reason: 'Khám định kỳ cho bé', createdOffset: -52,
        summary: 'Phòng khám đã ghi nhận buổi khám định kỳ. Hãy hỏi lại phòng khám nếu bạn cần thêm hướng dẫn.', labs: [] },
      { id: 'CF-2009', patientId: 'p1', clinicianId: 'dr-khoa', offset: -70, slot: '09:00', mode: 'onsite', status: 'cancelled', reason: 'Nghẹt mũi kéo dài', createdOffset: -75, cancelReason: 'Tôi bận việc đột xuất' },
    ],
    // Illustrative only: names are placeholders and instructions point back to the clinic.
    prescriptions: [
      { id: 'RX-3101', visitId: 'CF-2031', patientId: 'p1', name: 'Thuốc minh họa A 500 mg', form: 'Viên nén', quantity: '10 viên', instructions: 'Dùng theo hướng dẫn ghi trên đơn của bác sĩ.', prescriber: 'BS. Trần Thu Hà', startOffset: -21, endOffset: 9, refillsAllowed: 1, status: 'active' },
      { id: 'RX-3102', visitId: 'CF-2031', patientId: 'p1', name: 'Thuốc minh họa B 1000 IU', form: 'Viên nang', quantity: '30 viên', instructions: 'Dùng theo hướng dẫn ghi trên đơn của bác sĩ.', prescriber: 'BS. Trần Thu Hà', startOffset: -21, endOffset: 40, refillsAllowed: 2, status: 'active' },
      { id: 'RX-2950', visitId: 'CF-2018', patientId: 'p3', name: 'Siro minh họa C 60 ml', form: 'Siro', quantity: '1 chai', instructions: 'Dùng theo hướng dẫn ghi trên đơn của bác sĩ.', prescriber: 'BS. Trần Phương Linh', startOffset: -48, endOffset: -41, refillsAllowed: 0, status: 'completed' },
    ],
    tickets: [
      { id: 'HT-1007', topic: 'Thanh toán', subject: 'Biên lai lượt khám CF-2031', status: 'answered', createdOffset: -3, visitId: 'CF-2031',
        thread: [
          { from: 'patient', text: 'Tôi muốn nhận lại biên lai điện tử của lượt khám CF-2031.', offset: -3, time: '09:12' },
          { from: 'staff', author: 'Điều phối viên Thu Trang', text: 'Phòng khám đã nhận yêu cầu. Biên lai sẽ được gửi lại qua ứng dụng trong ngày làm việc tiếp theo.', offset: -2, time: '10:05' },
        ] },
      { id: 'HT-0995', topic: 'Đổi hoặc hủy lịch', subject: 'Hỏi cách đổi giờ khám', status: 'closed', createdOffset: -40,
        thread: [
          { from: 'patient', text: 'Tôi có thể đổi lịch sang buổi chiều được không?', offset: -40, time: '08:30' },
          { from: 'staff', author: 'Lễ tân Hoài An', text: 'Bạn có thể chọn Đổi lịch trên phiếu khám. Lịch mới sẽ được phòng khám xác nhận lại.', offset: -40, time: '11:20' },
        ] },
    ],
    notifications: [
      { id: 'n-seed-1', visitId: 'CF-2041', patientId: 'p1', screen: 'D2', title: 'Lịch khám hôm nay đã được xác nhận', body: 'BS. Trần Thu Hà, 15:30 tại phòng khám.', offset: -1, time: '18:00', read: false },
      { id: 'n-seed-2', ticketId: 'HT-1007', screen: 'T2', title: 'Phòng khám đã trả lời yêu cầu HT-1007', body: 'Mở yêu cầu để xem phản hồi.', offset: -2, time: '10:05', read: false },
      { id: 'n-seed-3', visitId: 'CF-2031', patientId: 'p1', screen: 'H6', title: 'Tài liệu sau khám đã được chia sẻ', body: 'Xem kết luận và đơn thuốc của lượt khám CF-2031.', offset: -20, time: '16:40', read: true },
    ],
    // Clinic-side records that only the staff workspace shows.
    clinic: {
      staffName: 'Điều dưỡng Ngọc Hân',
      patients: [
        { id: 'c-102', name: 'Trần Quốc Bảo', dob: '1991-02-11', phone: '0911000102', code: 'BN-2102' },
        { id: 'c-103', name: 'Lê Thu Hằng', dob: '1982-07-30', phone: '0911000103', code: 'BN-2103' },
        { id: 'c-104', name: 'Phạm Gia Huy', dob: '1999-12-04', phone: '0911000104', code: 'BN-2104' },
        { id: 'c-105', name: 'Đặng Ngọc Mai', dob: '1986-04-19', phone: '0911000105', code: 'BN-2105' },
        { id: 'c-106', name: 'Võ Thanh Tùng', dob: '1993-09-23', phone: '0911000106', code: 'BN-2106' },
      ],
      visits: [
        { id: 'PK-0801', patientId: 'c-106', clinicianId: 'dr-an', offset: 0, slot: '08:00', mode: 'onsite', status: 'completed', reason: 'Tái khám theo hẹn' },
        { id: 'PK-0802', patientId: 'c-102', clinicianId: 'dr-an', offset: 0, slot: '09:00', mode: 'onsite', status: 'in-consult', reason: 'Ho kéo dài một tuần' },
        { id: 'PK-0803', patientId: 'c-103', clinicianId: 'dr-ha', offset: 0, slot: '10:30', mode: 'onsite', status: 'received', reason: 'Khám sức khỏe định kỳ' },
        { id: 'PK-0804', patientId: 'c-104', clinicianId: 'dr-ha', offset: 0, slot: '14:00', mode: 'onsite', status: 'confirmed', reason: 'Đau đầu, ngủ không ngon' },
        { id: 'PK-0805', patientId: 'c-105', clinicianId: 'dr-an', offset: 0, slot: '16:00', mode: 'online', status: 'confirmed', reason: 'Trao đổi kết quả xét nghiệm' },
      ],
      tasks: [
        { id: 'TK-501', title: 'Gọi lại hẹn tái khám', patientId: 'c-106', visitId: 'PK-0801', dueOffset: 2, priority: 'normal', assignee: 'Lễ tân', note: 'Người bệnh muốn chọn buổi sáng.', status: 'open' },
        { id: 'TK-502', title: 'Chuẩn bị hồ sơ khám định kỳ', patientId: 'c-103', visitId: 'PK-0803', dueOffset: 0, priority: 'high', assignee: 'Điều dưỡng', note: '', status: 'open' },
        { id: 'TK-498', title: 'Gửi lại hướng dẫn đến khám', patientId: 'p1', visitId: 'CF-2041', dueOffset: -1, priority: 'normal', assignee: 'Lễ tân', note: 'Đã gửi qua ứng dụng.', status: 'done' },
      ],
    },
  };

  const clinician = (id) => {
    const c = DATA.clinicians.find((x) => x.id === id) || DATA.clinicians[0];
    return { id: c.id, name: c.name, specialty: c.specialty, initials: c.initials };
  };
  const PATH = ['pending', 'confirmed', 'reminder', 'arrived', 'received', 'ready', 'in-consult', 'completed'];
  function history(status, createdAt, end) {
    if (status === 'cancelled') return [{ status: 'pending', at: createdAt, actor: 'patient' }, { status: 'confirmed', at: createdAt, actor: 'staff' }, { status: 'cancelled', at: end, actor: 'patient' }];
    const steps = PATH.slice(0, PATH.indexOf(status) + 1);
    return steps.map((s, i) => ({ status: s, at: i === steps.length - 1 && i > 1 ? end : createdAt, actor: i === 0 ? 'patient' : 'staff' }));
  }
  function visitFrom(x, now) {
    const createdAt = at(x.createdOffset ?? x.offset, '08:00', now);
    const end = at(Math.min(x.offset, 0), x.slot, now);
    const done = x.status === 'completed';
    return {
      id: x.id, patientId: x.patientId, bookedByProfileId: 'p1', reason: x.reason, medicalHistory: '',
      mode: x.mode, date: day(x.offset, now), slot: x.slot, status: x.status,
      feePlan: 'pending', risk: false, reviewReason: '', previousId: null, purpose: 'new',
      payment: done ? { status: 'paid', amount: null, reason: '', dueDate: '', history: [{ status: 'paid', at: end, actor: 'staff' }] }
        : { status: 'unpaid', amount: null, reason: '', dueDate: '', history: [] },
      labs: (x.labs || []).map((l) => ({ id: l.id, name: l.name, status: l.status, timing: 'post', returnPath: 'visit', files: [], note: l.note, history: [{ status: 'ordered', at: end }, { status: l.status, at: end }] })),
      care: { status: 'monitoring', referral: null },
      communication: { result: done && x.labs?.length ? 'notified' : 'pending', explanation: done && x.labs?.length ? 'explained' : 'pending', callback: 'none' },
      history: history(x.status, createdAt, end),
      createdAt, cancelReason: x.cancelReason || '', rescheduledTo: null,
      clinician: clinician(x.clinicianId),
      staffNotes: [],
      ...(done ? { lockedAt: end, signedBy: clinician(x.clinicianId).name, summary: { sharedAt: end, author: clinician(x.clinicianId).name, note: x.summary } } : {}),
    };
  }
  /** Build the clinic-side and patient-side collections that the original model.js state does not have. */
  function extras(now = Date.now()) {
    const c = DATA.clinic;
    return {
      prescriptions: DATA.prescriptions.map((r) => ({ id: r.id, visitId: r.visitId, patientId: r.patientId, name: r.name, form: r.form, quantity: r.quantity, instructions: r.instructions, prescriber: r.prescriber, startDate: day(r.startOffset, now), endDate: day(r.endOffset, now), refillsAllowed: r.refillsAllowed, status: r.status, refill: null })),
      insurance: Object.fromEntries(Object.entries(DATA.insurance).map(([pid, x]) => [pid, { type: x.type, number: x.number, holder: x.holder, facility: x.facility, validFrom: day(x.validFromOffset, now), validTo: day(x.validToOffset, now), updatedAt: at(x.updatedOffset, '09:00', now) }])),
      tickets: DATA.tickets.map((t) => ({ id: t.id, topic: t.topic, subject: t.subject, status: t.status, visitId: t.visitId || null, createdAt: at(t.createdOffset, '08:00', now), closeReason: '', thread: t.thread.map((m) => ({ from: m.from, author: m.author || '', text: m.text, at: at(m.offset, m.time, now) })) })),
      clinic: {
        staffName: c.staffName,
        patients: c.patients.map((p) => ({ ...p })),
        visits: c.visits.map((v) => visitFrom({ ...v, createdOffset: -3 }, now)),
        tasks: c.tasks.map((t) => ({ id: t.id, title: t.title, patientId: t.patientId, visitId: t.visitId, due: day(t.dueOffset, now), priority: t.priority, assignee: t.assignee, note: t.note, status: t.status, createdAt: at(-3, '08:00', now) })),
        sequence: { task: 510, visit: 810 },
      },
      clinicians: DATA.clinicians.map((x) => ({ ...x })),
      specialties: DATA.specialties.slice(),
    };
  }
  /** Full patient-app state (version 3 shape used by prototype/model.js) plus extras. */
  function build(now = Date.now()) {
    return {
      version: 3,
      authenticated: false,
      profiles: DATA.profiles.map((p) => ({ ...p })),
      activePatientId: 'p1',
      accountProfileId: 'p1',
      visits: DATA.visits.map((v) => visitFrom(v, now)),
      activeVisitId: 'CF-2041',
      draft: null,
      riskByPatient: {},
      sequence: 2050,
      notifications: DATA.notifications.map((n) => ({ id: n.id, visitId: n.visitId, patientId: n.patientId, ticketId: n.ticketId, screen: n.screen, title: n.title, body: n.body, at: at(n.offset, n.time, now), read: n.read })),
      messages: [], reports: [], tracking: [], requests: [],
      settings: { largeText: false, privatePreview: true, reminders: true },
      request: null,
      offline: false,
      seeded: 'careflow-seed-v1',
      ...extras(now),
    };
  }
  /** Add missing collections to a state that came from a scenario fixture or guided journey. */
  function ensure(s, now = Date.now()) {
    if (!s || typeof s !== 'object') return s;
    const blank = extras(now);
    s.prescriptions ??= [];
    s.insurance ??= {};
    s.tickets ??= [];
    s.clinicians ??= blank.clinicians;
    s.specialties ??= blank.specialties;
    s.clinic ??= blank.clinic;
    for (const v of s.visits || []) v.staffNotes ??= [];
    return s;
  }
  const api = { DATA, build, ensure, extras, day, version: 'careflow-seed-v1' };
  root.CareFlowSeed = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
