/* Canonical browser prototype state. No real service or clinical decision engine. */
(function (root) {
  'use strict';
  const SCREENS = [
    {
      id: 'A1',
      title: 'Đăng nhập (SĐT và OTP)',
      route: '/login',
      phase: 'P1',
    },
    {
      id: 'A2',
      title: 'Xác nhận hồ sơ cũ',
      route: '/profile-match',
      phase: 'P1',
    },
    {
      id: 'A3',
      title: 'Tạo hồ sơ bệnh nhân',
      route: '/profile-new',
      phase: 'P1',
    },
    {
      id: 'B1',
      title: 'Trang chủ',
      route: '/home',
      phase: 'P1',
    },
    {
      id: 'C1',
      title: 'Ai đi khám',
      route: '/book/patient',
      phase: 'P1',
    },
    {
      id: 'C2',
      title: 'Lý do khám và triệu chứng',
      route: '/book/reason',
      phase: 'P1',
    },
    {
      id: 'C3',
      title: 'Dấu hiệu nguy hiểm',
      route: '/book/safety',
      phase: 'P1',
    },
    {
      id: 'C4',
      title: 'Khuyến cáo nhập viện, cấp cứu',
      route: '/book/alert',
      phase: 'P1',
    },
    {
      id: 'C5',
      title: 'Phòng khám xác nhận hình thức khám',
      route: '/book/mode-review',
      phase: 'P1',
    },
    {
      id: 'C6',
      title: 'Chọn hình thức khám',
      route: '/book/mode',
      phase: 'P1',
    },
    {
      id: 'C7',
      title: 'Chọn ngày giờ',
      route: '/book/slot',
      phase: 'P1',
    },
    {
      id: 'C8',
      title: 'Kiểm tra và gửi yêu cầu',
      route: '/book/review',
      phase: 'P1',
    },
    {
      id: 'C9',
      title: 'Đã gửi, Phiếu khám',
      route: '/book/done/:id',
      phase: 'P1',
    },
    {
      id: 'D1',
      title: 'Lịch hẹn',
      route: '/appointments',
      phase: 'P1',
    },
    {
      id: 'D2',
      title: 'Phiếu khám (chi tiết lượt khám)',
      route: '/appointments/:id',
      phase: 'P1',
    },
    {
      id: 'D3',
      title: 'Đổi lịch',
      route: '/appointments/:id/reschedule',
      phase: 'P1',
    },
    {
      id: 'D4',
      title: 'Hủy lịch',
      route: '/appointments/:id/cancel',
      phase: 'P1',
    },
    {
      id: 'E1',
      title: 'Chuẩn bị trước khi đến',
      route: '/appointments/:id/prepare',
      phase: 'P1',
    },
    {
      id: 'E2',
      title: 'Báo đã đến',
      route: '/appointments/:id/arrive',
      phase: 'P1',
    },
    {
      id: 'E3',
      title: 'Theo dõi lượt khám',
      route: '/appointments/:id/visit',
      phase: 'P1',
    },
    {
      id: 'F1',
      title: 'Xét nghiệm, chụp chiếu',
      route: '/appointments/:id/labs',
      phase: 'P2',
    },
    {
      id: 'F2',
      title: 'Chi tiết chỉ định',
      route: '/appointments/:id/labs/:labId',
      phase: 'P2',
    },
    {
      id: 'F3',
      title: 'Đặt hẹn xét nghiệm',
      route: '/appointments/:id/labs/:labId/book',
      phase: 'P2',
    },
    {
      id: 'F4',
      title: 'Đính kèm kết quả',
      route: '/appointments/:id/labs/:labId/upload',
      phase: 'P2',
    },
    {
      id: 'G1',
      title: 'Chuẩn bị khám online',
      route: '/appointments/:id/online-prepare',
      phase: 'P2',
    },
    {
      id: 'G2',
      title: 'Chờ bác sĩ gọi',
      route: '/appointments/:id/online-wait',
      phase: 'P2',
    },
    {
      id: 'G3',
      title: 'Bác sĩ đang gọi',
      route: '/appointments/:id/incoming',
      phase: 'P2',
    },
    {
      id: 'G4',
      title: 'Đang khám online',
      route: '/appointments/:id/call',
      phase: 'P2',
    },
    {
      id: 'G5',
      title: 'Chưa liên hệ được',
      route: '/appointments/:id/unreachable',
      phase: 'P2',
    },
    {
      id: 'H1',
      title: 'Buổi khám đã hoàn tất',
      route: '/appointments/:id/completed',
      phase: 'P2',
    },
    {
      id: 'H2',
      title: 'Thanh toán',
      route: '/appointments/:id/pay',
      phase: 'P2',
    },
    {
      id: 'H3',
      title: 'Thanh toán sau',
      route: '/appointments/:id/pay-later',
      phase: 'P2',
    },
    {
      id: 'H4',
      title: 'Chuyển khoản QR',
      route: '/appointments/:id/pay/transfer',
      phase: 'P2',
    },
    {
      id: 'H5',
      title: 'Biên lai và hoàn tiền',
      route: '/appointments/:id/receipt',
      phase: 'P2',
    },
    {
      id: 'H6',
      title: 'Kết luận và đơn thuốc',
      route: '/appointments/:id/summary',
      phase: 'P2',
    },
    {
      id: 'H7',
      title: 'Kết quả và việc tiếp theo',
      route: '/appointments/:id/results',
      phase: 'P2',
    },
    {
      id: 'I1',
      title: 'Hỏi phòng khám',
      route: '/care',
      phase: 'P3',
    },
    {
      id: 'I2',
      title: 'Gửi phản hồi (ba lý do)',
      route: '/care/report?reason=',
      phase: 'P3',
    },
    {
      id: 'I3',
      title: 'Theo dõi triệu chứng',
      route: '/care/follow-up',
      phase: 'P3',
    },
    {
      id: 'I4',
      title: 'Chuyển chuyên khoa',
      route: '/care/referral/:id',
      phase: 'P3',
    },
    {
      id: 'I5',
      title: 'Tin nhắn với điều phối viên',
      route: '/care/messages',
      phase: 'P3',
    },
    {
      id: 'J1',
      title: 'Đặt lịch tái khám',
      route: '/followup/:id',
      phase: 'P1',
    },
    {
      id: 'K1',
      title: 'Thông báo',
      route: '/notifications',
      phase: 'P1',
    },
    {
      id: 'K2',
      title: 'Hồ sơ và người thân',
      route: '/profile',
      phase: 'P3',
    },
    {
      id: 'K3',
      title: 'Lịch sử khám',
      route: '/profile/history',
      phase: 'P3',
    },
    {
      id: 'K4',
      title: 'Cài đặt',
      route: '/settings',
      phase: 'P3',
    },
    {
      id: 'K5',
      title: 'Hỗ trợ',
      route: '/support',
      phase: 'P1 (khung), P2 (đầy đủ)',
    },
  ];
  const TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    'mode-review': ['pending', 'cancelled'],
    confirmed: ['pre-lab', 'reminder', 'cancelled'],
    'pre-lab': ['confirmed', 'cancelled'],
    reminder: ['arrived', 'online-wait', 'no-show', 'cancelled'],
    arrived: ['received'],
    received: ['ready'],
    ready: ['in-consult'],
    'in-consult': ['completed', 'online-wait'],
    'online-wait': ['calling', 'unreachable'],
    calling: ['in-consult', 'unreachable'],
    unreachable: ['online-wait', 'cancelled'],
    completed: [],
    cancelled: [],
    'no-show': [],
  };
  const PATIENT_TRANSITIONS = {
    'in-consult': ['online-wait'],
    reminder: ['arrived', 'online-wait', 'cancelled'],
    calling: ['in-consult', 'unreachable'],
    unreachable: ['cancelled'],
    pending: ['cancelled'],
    'mode-review': ['cancelled'],
    confirmed: ['cancelled'],
    'pre-lab': ['cancelled'],
    'online-wait': ['cancelled'],
  };
  const LAB_TRANSITIONS = {
    ordered: ['scheduled', 'available'],
    scheduled: ['available'],
    available: ['awaiting-review'],
    'awaiting-review': ['reviewed'],
    reviewed: [],
  };
  const PAYMENT_TRANSITIONS = {
    unpaid: [
      'transfer-pending',
      'counter-pending',
      'pharmacy-pending',
      'deferred',
      'not-required',
    ],
    'transfer-pending': ['paid'],
    'counter-pending': ['paid'],
    'pharmacy-pending': ['paid'],
    deferred: [
      'transfer-pending',
      'counter-pending',
      'pharmacy-pending',
      'not-required',
    ],
    paid: ['refunding'],
    refunding: ['refunded'],
    'not-required': [],
    refunded: [],
  };
  const fail = (code) => ({ ok: false, code }),
    pass = (data) => ({ ok: true, ...data }),
    stamp = () => new Date().toISOString();
  const validDate = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value + 'T12:00:00Z')) &&
    new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) === value;
  const localDate = (offset = 0) =>
    new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(Date.now() + offset * 86400000));
  function initial() {
    return {
      version: 3,
      authenticated: false,
      profiles: [],
      activePatientId: null,
      accountProfileId: null,
      visits: [],
      activeVisitId: null,
      draft: null,
      riskByPatient: {},
      sequence: 0,
      notifications: [],
      messages: [],
      reports: [],
      tracking: [],
      requests: [],
      settings: { largeText: false, privatePreview: true, reminders: true },
      request: null,
      offline: false,
    };
  }
  function authenticate(s, phone, otp) {
    if (!/^0\d{9}$/.test(phone)) return fail('PHONE');
    if (otp !== '123456') return fail('OTP');
    s.authenticated = true;
    return pass({ match: !!accountProfile(s) });
  }
  function createProfile(s, name, dob, relation = 'self') {
    if (!s.authenticated) return fail('AUTH');
    if (
      !name.trim() ||
      !validDate(dob) ||
      dob > localDate() ||
      dob < '1900-01-01'
    )
      return fail('PROFILE');
    const profile = {
      id: 'p' + (s.profiles.length + 1),
      name: name.trim(),
      dob,
      relation,
      phone: '',
      medicalHistory: '',
      canBook: true,
      canViewResults: relation === 'self',
    };
    s.profiles.push(profile);
    if (relation === 'self') {
      s.accountProfileId = profile.id;
      s.activePatientId = profile.id;
    } else if (!s.activePatientId) s.activePatientId = profile.id;
    return pass({ profile });
  }
  const profile = (s, id = s.activePatientId) =>
      s.profiles.find((p) => p.id === id),
    visit = (s, id = s.activeVisitId) => s.visits.find((v) => v.id === id);
  const accountProfile = (s) => {
    const ownerId =
      s.accountProfileId || s.profiles.find((p) => p.relation === 'self')?.id;
    return ownerId ? profile(s, ownerId) : undefined;
  };
  function beginBooking(s, previousId = null, purpose = 'new', mode = null) {
    if (s.request?.status === 'unknown') return fail('UNKNOWN');
    const previous = previousId ? visit(s, previousId) : null;
    if (previousId && !previous) return fail('VISIT');
    const patientId = previous?.patientId || s.activePatientId;
    if (!profile(s, patientId)?.canBook) return fail('PERMISSION');
    s.activePatientId = patientId;
    s.draft = {
      patientId,
      reason: purpose === 'followup' ? '' : previous?.reason || '',
      medicalHistory: previous?.medicalHistory || profile(s, patientId)?.medicalHistory || '',
      safety: '',
      risk: !!s.riskByPatient[patientId],
      reviewAccepted: false,
      mode: mode || previous?.mode || 'onsite',
      date: localDate(1),
      slot: '',
      previousId,
      purpose,
      free: purpose === 'explanation',
    };
    s.request = null;
    return pass();
  }
  function choosePatient(s, id) {
    if (s.request?.status === 'unknown') return fail('UNKNOWN');
    if (!profile(s, id)?.canBook) return fail('PERMISSION');
    if (!s.draft) beginBooking(s);
    s.activePatientId = id;
    if (s.draft.patientId !== id) {
      s.draft = {
        ...s.draft,
        patientId: id,
        reason: '',
        medicalHistory: profile(s, id)?.medicalHistory || '',
        safety: '',
        risk: !!s.riskByPatient[id],
        reviewAccepted: false,
        slot: '',
        previousId: null,
        purpose: 'new',
        free: false,
      };
      s.request = null;
    }
    return pass();
  }
  function screenSafety(s, answer) {
    if (s.request?.status === 'unknown') return fail('UNKNOWN');
    if (!s.draft || !['normal', 'warning'].includes(answer))
      return fail('SAFETY');
    s.draft.safety = answer;
    if (answer === 'warning') s.riskByPatient[s.draft.patientId] = true;
    s.draft.risk = !!s.riskByPatient[s.draft.patientId];
    return pass({ next: s.draft.risk ? 'C4' : 'C6' });
  }
  function bookingValidation(s) {
    const d = s.draft;
    if (!s.authenticated) return 'AUTH';
    if (!d || !profile(s, d.patientId)?.canBook) return 'PERMISSION';
    if (!d.reason.trim()) return 'REASON';
    if (!d.safety) return 'SAFETY';
    if ((d.risk || s.riskByPatient[d.patientId]) && !d.reviewAccepted)
      return 'REVIEW';
    if (!['onsite', 'online'].includes(d.mode)) return 'MODE';
    if (
      !validDate(d.date) ||
      d.date < localDate() ||
      !['08:00', '09:00', '10:30', '14:00', '15:30'].includes(d.slot)
    )
      return 'SLOT';
    const old = d.previousId ? visit(s, d.previousId) : null;
    if (d.previousId && !old) return 'VISIT';
    if (
      old &&
      ![
        'completed',
        'cancelled',
        'no-show',
        'pending',
        'mode-review',
        'confirmed',
        'pre-lab',
        'reminder',
        'unreachable',
      ].includes(old.status)
    )
      return 'TRANSITION';
    return null;
  }
  function submitBooking(s, outcome = 'success') {
    if (s.request?.status === 'done')
      return pass({ visit: visit(s, s.request.visitId), existing: true });
    if (s.offline) return fail('OFFLINE');
    if (s.request?.status === 'unknown') return fail('UNKNOWN');
    const error = bookingValidation(s);
    if (error) return fail(error);
    if (outcome === 'slot-unavailable') {
      s.draft.slot = '';
      return fail('SLOT_UNAVAILABLE');
    }
    if (outcome === 'unknown') {
      s.request = { status: 'unknown', draft: JSON.stringify(s.draft) };
      return fail('UNKNOWN');
    }
    const d = {
        ...s.draft,
        risk: !!(s.draft.risk || s.riskByPatient[s.draft.patientId]),
      },
      id = 'CF-' + String(++s.sequence).padStart(4, '0');
    const v = {
      id,
      patientId: d.patientId,
      bookedByProfileId: accountProfile(s)?.id,
      reason: d.reason,
      medicalHistory: d.medicalHistory,
      mode: d.mode,
      date: d.date,
      slot: d.slot,
      status: d.risk ? 'mode-review' : 'pending',
      feePlan: d.free ? 'not-required' : 'pending',
      risk: d.risk,
      reviewReason: d.risk
        ? 'Bạn đã yêu cầu phòng khám xem xét hình thức khám.'
        : '',
      previousId: d.previousId,
      purpose: d.purpose,
      payment: {
        status: d.free ? 'not-required' : 'unpaid',
        amount: null,
        reason: '',
        dueDate: '',
        history: [],
      },
      labs: [],
      care: { status: 'monitoring', referral: null },
      communication: {
        result: 'pending',
        explanation: 'pending',
        callback: 'none',
      },
      history: [],
      createdAt: stamp(),
      cancelReason: '',
      rescheduledTo: null,
    };
    const previous = d.previousId ? visit(s, d.previousId) : null;
    if (
      previous &&
      !['completed', 'cancelled', 'no-show'].includes(previous.status)
    ) {
      const cancelled = transition(
        s,
        previous.id,
        'cancelled',
        'patient',
        d.purpose,
      );
      if (!cancelled.ok) {
        s.sequence--;
        return cancelled;
      }
    }
    if (previous) {
      previous.rescheduledTo = id;
      previous.history.push({
        status: previous.status,
        at: stamp(),
        reason: d.purpose,
        linkedVisit: id,
      });
    }
    v.history.push({ status: v.status, at: stamp(), actor: 'patient' });
    s.visits.push(v);
    s.activeVisitId = id;
    s.request = { status: 'done', visitId: id };
    return pass({ visit: v });
  }
  function resolveUnknown(s, found) {
    if (s.request?.status !== 'unknown') return fail('UNKNOWN');
    if (s.request.draft !== JSON.stringify(s.draft)) return fail('CONFLICT');
    s.request = null;
    return found ? submitBooking(s) : pass({ retry: true });
  }
  function notify(s, v, screen) {
    s.notifications.unshift({
      id: 'n' + s.notifications.length,
      visitId: v.id,
      patientId: v.patientId,
      screen,
      title: 'Có cập nhật về lượt khám',
      body: 'Mở ứng dụng để xem chi tiết.',
      at: stamp(),
      read: false,
    });
  }
  function transition(s, id, to, actor = 'patient', reason = '') {
    const v = visit(s, id);
    if (!v) return fail('VISIT');
    if (!(TRANSITIONS[v.status] || []).includes(to)) return fail('TRANSITION');
    if (
      actor !== 'staff' &&
      !(PATIENT_TRANSITIONS[v.status] || []).includes(to)
    )
      return fail('STAFF_ONLY');
    if (to === 'cancelled' && !reason.trim()) return fail('CANCEL_REASON');
    if (to === 'arrived' && v.mode !== 'onsite') return fail('MODE');
    if (to === 'online-wait' && v.mode !== 'online') return fail('MODE');
    if (to === 'unreachable') {
      v.communication.callback = 'pending';
      v.communication.callbackReason = 'online';
    }
    if (to === 'calling' && v.communication.callback === 'pending')
      v.communication.callback = 'in-progress';
    if (to === 'in-consult') v.communication.callback = 'resolved';
    if (to === 'completed') {
      v.signedAt = stamp();
      v.lockedAt = v.signedAt;
      v.signedBy = 'Bác sĩ phụ trách';
    }
    if (
      v.status === 'pre-lab' &&
      to === 'confirmed' &&
      !v.labs.some((l) =>
        ['available', 'awaiting-review', 'reviewed'].includes(l.status),
      ) &&
      reason !== 'allow-before-results'
    )
      return fail('LAB_PENDING');
    v.status = to;
    if (to === 'confirmed' && v.labs.some(l => l.timing === 'pre' && ['available','awaiting-review','reviewed'].includes(l.status))) {
      const completedLab = v.labs.find(l => l.timing === 'pre' && ['available','awaiting-review','reviewed'].includes(l.status));
      completedLab.continuation = completedLab.returnPath === 'during' ? 'review-during' : 'return-to-visit';
      completedLab.continuationAt = stamp();
    }
    v.history.push({ status: to, at: stamp(), actor, reason });
    if (to === 'cancelled') v.cancelReason = reason;
    if (actor === 'staff' && (to !== 'reminder' || s.settings.reminders))
      notify(
        s,
        v,
        to === 'completed'
          ? 'H1'
          : to === 'calling'
            ? 'G3'
            : to === 'unreachable'
              ? 'G5'
              : 'D2',
      );
    return pass({ visit: v });
  }
  function reviewMode(s, id, mode, reason) {
    const v = visit(s, id);
    if (
      !v ||
      v.status !== 'mode-review' ||
      !['onsite', 'online'].includes(mode) ||
      !reason.trim()
    )
      return fail('REVIEW');
    v.mode = mode;
    v.reviewReason = reason;
    return transition(s, id, 'pending', 'staff', reason);
  }
  function setPayment(s, id, to, actor = 'patient', details = {}) {
    const v = visit(s, id);
    if (!v) return fail('VISIT');
    if (v.status !== 'completed') return fail('NOT_COMPLETED');
    if (!(PAYMENT_TRANSITIONS[v.payment.status] || []).includes(to))
      return fail('PAYMENT');
    if (
      ['paid', 'refunding', 'refunded', 'not-required'].includes(to) &&
      actor !== 'staff'
    )
      return fail('STAFF_ONLY');
    if (
      to === 'deferred' &&
      (!details.reason?.trim() ||
        !validDate(details.dueDate) ||
        details.dueDate < localDate())
    )
      return fail('DEFER');
    if (to === 'refunding' && !details.reason?.trim())
      return fail('REFUND_REASON');
    v.payment = {
      ...v.payment,
      ...details,
      status: to,
      history: [...v.payment.history, { status: to, at: stamp(), actor }],
    };
    if (actor === 'staff') notify(s, v, 'H5');
    return pass();
  }
  function setFeePlan(s, id, plan, actor = 'staff') {
    const v = visit(s, id);
    if (actor !== 'staff') return fail('STAFF_ONLY');
    if (!v || !['package','not-required'].includes(plan)) return fail('PAYMENT');
    if (!['unpaid','not-required'].includes(v.payment.status)) return fail('PAYMENT');
    v.feePlan = plan;
    v.payment.status = plan === 'not-required' ? 'not-required' : 'unpaid';
    notify(s, v, 'D2');
    return pass();
  }
  function addLab(s, id, timing = 'post') {
    const v = visit(s, id);
    if (!v) return fail('VISIT');
    if (timing === 'pre' && v.status !== 'confirmed') return fail('TRANSITION');
    if (timing === 'post' && v.status !== 'completed')
      return fail('NOT_COMPLETED');
    const lab = {
      id: 'lab-' + (v.labs.length + 1),
      name: 'Xét nghiệm theo chỉ định',
      status: 'ordered',
      timing,
      returnPath: 'visit',
      files: [],
      history: [{ status: 'ordered', at: stamp() }],
    };
    v.labs.push(lab);
    if (timing === 'pre') transition(s, id, 'pre-lab', 'staff');
    notify(s, v, 'F1');
    return pass({ lab });
  }
  const lab = (s, id, labId) => visit(s, id)?.labs.find((l) => l.id === labId);
  function labTransition(s, id, labId, to, actor = 'staff', details = {}) {
    const l = lab(s, id, labId);
    if (!l || !(LAB_TRANSITIONS[l.status] || []).includes(to))
      return fail('LAB');
    if (actor !== 'staff' && !['scheduled', 'available'].includes(to))
      return fail('STAFF_ONLY');
    if (to === 'scheduled' && !details.appointmentDate && !details.coordinator)
      return fail('LAB_DATE');
    if (to === 'available' && actor !== 'staff' && !details.file)
      return fail('FILE');
    l.status = to;
    Object.assign(l, details);
    l.history.push({ status: to, at: stamp(), actor });
    return pass();
  }
  function communicateResult(s, id, outcome) {
    const v = visit(s, id);
    if (
      !v ||
      !v.labs.some((l) => l.status === 'reviewed') ||
      !['notified', 'unreachable', 'explained'].includes(outcome)
    )
      return fail('RESULT');
    if (outcome === 'explained') {
      if (v.communication.result !== 'notified') return fail('NOT_NOTIFIED');
      v.communication.explanation = 'explained';
    } else v.communication.result = outcome;
    if (outcome === 'notified') notify(s, v, 'H7');
    if (outcome === 'unreachable') {
      v.communication.callback = 'pending';
      v.communication.callbackReason = 'result';
    }
    if (['notified', 'explained'].includes(outcome) && v.communication.callbackReason === 'result')
      v.communication.callback = 'resolved';
    return pass();
  }
  const canViewResults = (s, v) =>
    !!(s.authenticated && v && profile(s, v.patientId)?.canViewResults);
  function report(s, id, reason, text, urgent = false) {
    const v = visit(s, id);
    if (
      !v ||
      v.status !== 'completed' ||
      !['medicine', 'question', 'symptoms'].includes(reason) ||
      !text.trim()
    )
      return fail('REPORT');
    const item = {
      id: 'r' + s.reports.length,
      visitId: id,
      patientId: v.patientId,
      reason,
      text,
      urgent,
      status: 'waiting',
      at: stamp(),
    };
    s.reports.push(item);
    openCareTask(s, v, reason, text);
    v.care.status = 'feedback-received';
    s.messages.push({
      visitId: id,
      patientId: v.patientId,
      from: 'patient',
      text,
      at: stamp(),
    });
    return pass({ next: urgent ? 'C4' : 'I5' });
  }
  function openCareTask(s, v, type, text) {
    const id = 'care-' + v.id + '-' + (v.care.tasks?.length || 0);
    const task = { id, type, text, status: 'received', owner: 'Điều phối viên', history: [{ status: 'received', at: stamp() }] };
    v.care.tasks ??= [];
    v.care.tasks.push(task);
    return task;
  }
  function submitCareUpdate(s, id, type, text) {
    const v = visit(s, id);
    if (!v || v.status !== 'completed' || !['tracking','referral'].includes(type) || !text.trim()) return fail('REPORT');
    if (type === 'referral' && !v.care.referral) return fail('REFERRAL');
    if (type === 'tracking') s.tracking.push({ visitId: id, patientId: v.patientId, text, at: stamp() });
    else s.messages.push({ visitId: id, patientId: v.patientId, from: 'patient', text, at: stamp() });
    return pass({ task: openCareTask(s, v, type, text) });
  }
  function advanceCare(s, id, to, actor = 'staff') {
    const v = visit(s, id), task = v?.care.tasks?.find(t => t.status !== 'answered');
    if (actor !== 'staff') return fail('STAFF_ONLY');
    const next = { received: 'coordinating', coordinating: 'doctor-review', 'doctor-review': 'answered' };
    if (!task || next[task.status] !== to) return fail('TRANSITION');
    task.status = to;
    task.owner = to === 'answered' ? 'Bạn' : to === 'doctor-review' ? 'Bác sĩ phụ trách' : 'Điều phối viên';
    task.history.push({ status: to, at: stamp() });
    if (to === 'answered') {
      s.messages.push({ visitId: id, patientId: v.patientId, from: 'staff', text: 'Phòng khám đã nhận nội dung của bạn, bác sĩ đã xem và đề nghị tiếp tục trao đổi với điều phối viên nếu bạn còn điều chưa rõ.', at: stamp() });
      notify(s, v, 'I5');
    }
    return pass();
  }
  function shareSummary(s, id, actor = 'staff') {
    const v = visit(s, id);
    if (actor !== 'staff') return fail('STAFF_ONLY');
    if (!v?.lockedAt) return fail('NOT_COMPLETED');
    v.summary = { sharedAt: stamp(), author: v.signedBy, note: 'Nội dung buổi khám đã được ghi nhận trong hồ sơ. Bạn có thể hỏi lại phòng khám về những điều chưa rõ.' };
    notify(s, v, 'H6');
    return pass();
  }
  function nextAction(v) {
    const map = {
      pending: ['K5', 'contact'],
      'mode-review': ['K5', 'contact'],
      confirmed: [v?.mode === 'online' ? 'G1' : 'E1', 'prepare'],
      'pre-lab': ['F1', 'labs'],
      reminder: [
        v?.mode === 'online' ? 'G2' : 'E2',
        v?.mode === 'online' ? 'join' : 'arrive',
      ],
      arrived: ['E3', 'track'],
      received: ['E3', 'track'],
      ready: ['E3', 'track'],
      'in-consult': [v?.mode === 'online' ? 'G4' : 'E3', 'consult'],
      'online-wait': ['G2', 'wait'],
      calling: ['G3', 'answer'],
      unreachable: ['G5', 'recover'],
      completed: ['H1', 'after'],
      cancelled: ['C7', 'rebook'],
      'no-show': ['C7', 'rebook'],
    };
    return map[v?.status] || ['D1', 'appointments'];
  }
  function fixture(name = 'upcoming') {
    const s = initial();
    s.authenticated = true;
    createProfile(s, 'Nguyễn Minh Anh', '1994-08-15');
    createProfile(s, 'Trần Thị Mai', '1965-05-12', 'mother');
    if (name === 'empty' || name === 'returning') return s;
    beginBooking(s);
    Object.assign(s.draft, {
      reason: 'Khám theo lịch hẹn',
      safety: 'normal',
      slot: '09:00',
      mode: name === 'online' ? 'online' : 'onsite',
    });
    submitBooking(s);
    transition(s, s.activeVisitId, 'confirmed', 'staff');
    if (name === 'pre-lab') addLab(s, s.activeVisitId, 'pre');
    else if (name === 'completed') {
      for (const status of [
        'reminder',
        'arrived',
        'received',
        'ready',
        'in-consult',
        'completed',
      ])
        transition(s, s.activeVisitId, status, 'staff');
      addLab(s, s.activeVisitId, 'post');
    } else if (name === 'no-show') {
      transition(s, s.activeVisitId, 'reminder', 'staff');
      transition(s, s.activeVisitId, 'no-show', 'staff');
    }
    return s;
  }
  const api = {
    accountProfile,
    validDate,
    notify,
    SCREENS,
    TRANSITIONS,
    LAB_TRANSITIONS,
    PAYMENT_TRANSITIONS,
    initial,
    localDate,
    authenticate,
    createProfile,
    profile,
    visit,
    beginBooking,
    choosePatient,
    screenSafety,
    bookingValidation,
    submitBooking,
    resolveUnknown,
    transition,
    reviewMode,
    setPayment,
    setFeePlan,
    addLab,
    lab,
    labTransition,
    communicateResult,
    canViewResults,
    report,
    submitCareUpdate,
    advanceCare,
    shareSummary,
    nextAction,
    fixture,
  };
  root.CareFlowModel = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
