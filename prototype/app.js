/* Navigation/UI orchestration. All service updates are explicitly synthetic. */
(function () {
  'use strict';
  const M = window.CareFlowModel,
    VI = window.CareFlowCopy,
    V = window.CareFlowViews,
    $ = (id) => document.getElementById(id),
    KEY = 'careflow.browser.v3';
  let returnHash = null;
  let s = M.initial(),
    u = {
      screen: 'A1',
      filter: 'upcoming',
      reportReason: 'medicine',
      labId: null,
      mic: true,
      camera: true,
      deviceReady: false,
      otpSent: false,
      phone: '',
      forms: {},
      urgentAftercare: false,
    },
    lastFocus = null;
  function demo(message = VI.demo.notice) {
    $('demo-feedback').textContent = message;
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (
      saved?.state?.version === 3 &&
      Array.isArray(saved.state.visits) &&
      Array.isArray(saved.state.profiles)
    ) {
      s = saved.state;
      u = { ...u, ...saved.ui, forms: saved.ui?.forms || {} };
    }
  } catch {
    demo('Phiên trước không đọc được. Đã mở phiên thử nghiệm mới.');
  }
  function save() {
    try {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          state: s,
          ui: {
            ...u,
            phone: '',
            otpSent: false,
            forms: Object.fromEntries(
              Object.entries(u.forms).filter(
                ([k]) => !['otp', 'verify'].includes(k),
              ),
            ),
          },
        }),
      );
    } catch {
      demo(
        'Trình duyệt chưa cho phép lưu phiên. Bạn có thể dùng cho đến khi tải lại.',
      );
    }
  }
  function routeFor(id, extra = {}) {
    const meta = M.SCREENS.find((x) => x.id === id);
    if (!meta) return '/not-found';
    const visitId = extra.visitId || s.activeVisitId || 'missing',
      labId = extra.labId || u.labId || M.visit(s)?.labs[0]?.id || 'missing';
    const path = meta.route
        .split('?')[0]
        .replace(':id', encodeURIComponent(visitId))
        .replace(':labId', encodeURIComponent(labId)),
      query = new URLSearchParams();
    if (id.startsWith('I')) {
      query.set('visit', visitId);
      if (id === 'I2') query.set('reason', extra.reason || u.reportReason);
    }
    return path + (query.size ? '?' + query : '');
  }
  function readRoute() {
    const [path, query = ''] = (location.hash.slice(1) || '/login').split('?'),
      params = new URLSearchParams(query);
    for (const meta of M.SCREENS) {
      const names = [],
        pattern = meta.route.split('?')[0].replace(/:[a-zA-Z]+/g, (t) => {
          names.push(t.slice(1));
          return '([^/]+)';
        }),
        match = path.match(new RegExp('^' + pattern + '$'));
      if (!match) continue;
      const values = {};
      try {
        names.forEach(
          (name, i) => (values[name] = decodeURIComponent(match[i + 1])),
        );
      } catch {
        return { id: 'UNKNOWN' };
      }
      if (values.id) s.activeVisitId = values.id;
      if (params.has('visit')) s.activeVisitId = params.get('visit');
      if (values.labId) u.labId = values.labId;
      if (meta.id === 'I2')
        u.reportReason = ['medicine', 'question', 'symptoms'].includes(
          params.get('reason'),
        )
          ? params.get('reason')
          : 'medicine';
      return { id: meta.id };
    }
    return { id: 'UNKNOWN' };
  }
  function go(id, extra = {}, replace = false) {
    if (extra.visitId) s.activeVisitId = extra.visitId;
    if (extra.labId) u.labId = extra.labId;
    if (extra.reason) u.reportReason = extra.reason;
    const target = '#' + routeFor(id, extra);
    save();
    if (location.hash === target) {
      render();
      return;
    }
    if (replace) {
      history.replaceState(null, '', target);
      render();
    } else {
      history.pushState({ careflow: true }, '', target);
      render();
    }
  }
  const visitScreens = new Set([
    'C9',
    'D2',
    'D3',
    'D4',
    'E1',
    'E2',
    'E3',
    'F1',
    'F2',
    'F3',
    'F4',
    'G1',
    'G2',
    'G3',
    'G4',
    'G5',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'H7',
    'I2',
    'I3',
    'I4',
    'I5',
    'J1',
  ]);
  function guard(id) {
    const v = M.visit(s);
    if (
      s.authenticated &&
      /^C[1-7]$/.test(id) &&
      !(id === 'C4' && u.urgentAftercare) &&
      s.request?.status === 'unknown'
    )
      return ['unknown', VI.feedback.awaiting, VI.errors.UNKNOWN, 'C8'];
    if (
      s.authenticated &&
      /^C[1-8]$/.test(id) &&
      !(id === 'C4' && u.urgentAftercare) &&
      s.request?.status === 'done'
    )
      return ['sent', VI.screen.C9.heading, VI.screen.C9.lead, 'C9'];
    if (!['A1', 'K5', 'UNKNOWN'].includes(id) && !s.authenticated) {
      returnHash = location.hash;
      return ['auth', VI.feedback.auth, VI.feedback.authLead, 'A1'];
    }
    if (
      s.authenticated &&
      !s.profiles.length &&
      !['A1', 'A3', 'K5', 'UNKNOWN'].includes(id)
    )
      return ['profile', VI.screen.A3.heading, VI.screen.A3.lead, 'A3'];
    if (visitScreens.has(id) && !v)
      return ['visit', VI.feedback.notFound, VI.errors.VISIT, 'D1'];
    if (
      ['H6', 'H7', 'F1', 'F2', 'F3', 'F4', 'I2', 'I3', 'I4', 'I5'].includes(
        id,
      ) &&
      v &&
      !M.canViewResults(s, v)
    )
      return [
        'permission',
        VI.feedback.permission,
        VI.feedback.permissionLead,
        'D2',
      ];
    if (/^C[1-8]$/.test(id) && id !== 'C4' && !s.draft)
      return ['draft', VI.screen.C1.heading, VI.screen.B1.emptyLead, 'B1'];
    if (/^C[6-8]$/.test(id) && s.draft?.risk && !s.draft.reviewAccepted)
      return ['review', VI.screen.C5.heading, VI.errors.REVIEW, 'C4'];
    if (id === 'C6' && s.draft?.risk)
      return ['review', VI.screen.C5.heading, VI.errors.REVIEW, 'C5'];
    if (/^C[7-8]$/.test(id) && !s.draft?.safety)
      return ['safety', VI.screen.C3.heading, VI.errors.SAFETY, 'C3'];
    if (id === 'C8' && (!s.draft?.slot || !s.draft?.reason))
      return ['draft', VI.screen.C7.heading, VI.errors.SLOT, 'C7'];
    if (
      ['F2', 'F3', 'F4'].includes(id) &&
      !M.lab(s, v.id, u.labId || v.labs[0]?.id)
    )
      return ['lab', VI.screen.F1.empty, VI.screen.F1.emptyLead, 'F1'];
    if (
      ['D3', 'D4'].includes(id) &&
      !(M.TRANSITIONS[v.status] || []).includes('cancelled')
    )
      return ['step', VI.feedback.awaiting, VI.errors.TRANSITION, 'D2'];
    if (id === 'E2' && (v.status !== 'reminder' || v.mode !== 'onsite'))
      return ['step', VI.feedback.awaiting, VI.errors.TRANSITION, 'D2'];
    if (['G1', 'G2', 'G3', 'G4', 'G5'].includes(id)) {
      if (v.mode !== 'online')
        return ['mode', VI.feedback.awaiting, VI.errors.MODE, 'D2'];
      const allowed = {
        G1: ['confirmed', 'reminder', 'online-wait'],
        G2: ['online-wait', 'calling'],
        G3: ['calling'],
        G4: ['in-consult'],
        G5: ['unreachable'],
      };
      if (!allowed[id].includes(v.status))
        return ['step', VI.feedback.awaiting, VI.errors.TRANSITION, 'D2'];
    }
    if (
      (id.startsWith('H') || ['I2', 'I3', 'I4', 'I5', 'J1'].includes(id)) &&
      v.status !== 'completed'
    )
      return ['step', VI.feedback.awaiting, VI.errors.NOT_COMPLETED, 'D2'];
    return null;
  }
  function activeTab(id) {
    if (id === 'B1' || id.startsWith('C')) return 'B1';
    if (['K2', 'K3', 'K4'].includes(id)) return 'K2';
    if (id.startsWith('I') || id === 'K5') return 'K5';
    return 'D1';
  }
  function render() {
    const id = readRoute().id;
    u.screen = id;
    const g = guard(id);
    $('phone-frame').classList.toggle('large-text', !!s.settings.largeText);
    $('phone-frame').classList.toggle(
      'video-mode',
      ['G3', 'G4'].includes(id) && !g,
    );
    $('back').innerHTML = window.CareFlowIcon('chevron-left', 23);
    $('notifications').innerHTML = window.CareFlowIcon('bell', 22);
    $('back').hidden = ['A1', 'B1', 'D1', 'K2', 'K5'].includes(id);
    $('notifications').hidden = !s.authenticated;
    $('phone-content').dataset.screen = id;
    $('phone-content').dataset.guarded = g ? g[0] : '';
    $('phone-content').innerHTML = g
      ? V.head(g[1], g[2]) + V.go(VI.common.continue, g[3], 'primary')
      : V.render(id, s, u);
    $('bottom-nav').hidden =
      !s.authenticated || ['A1', 'A2', 'A3', 'G3', 'G4'].includes(id);
    $('bottom-nav').innerHTML = [
      ['B1', 'Trang chủ', 'home'],
      ['D1', 'Lịch hẹn', 'calendar'],
      ['K2', 'Hồ sơ', 'user'],
      ['K5', 'Hỗ trợ', 'phone'],
    ]
      .map(
        ([to, label, icon]) =>
          `<a href="#${routeFor(to)}"${activeTab(id) === to ? ' aria-current="page"' : ''}>${window.CareFlowIcon(icon, 22)}<span>${label}</span></a>`,
      )
      .join('');
    $('offline-bar').hidden = !s.offline;
    $('offline-bar').textContent = VI.feedback.offline;
    $('phone-content')
      .querySelectorAll('form[data-form]')
      .forEach((form) => {
        const cache = u.forms[form.dataset.form];
        if (cache)
          for (const el of form.elements) {
            if (!el.name || !(el.name in cache) || el.type === 'file') continue;
            if (['checkbox', 'radio'].includes(el.type))
              el.checked =
                el.type === 'checkbox'
                  ? cache[el.name] === true
                  : el.value === cache[el.name];
            else el.value = cache[el.name];
          }
      });
    if (u.notice) {
      const node = document.createElement('div');
      node.className = 'note';
      node.setAttribute('role', 'status');
      node.textContent = u.notice;
      $('phone-content').prepend(node);
      u.notice = '';
    }
    $('phone-main').scrollTop = 0;
    renderReviewer();
    const qr = $('visit-qr');
    if (qr && window.qrcode) {
      const code = window.qrcode(0, 'M');
      code.addData(qr.dataset.payload);
      code.make();
      qr.innerHTML = code.createSvgTag({
        cellSize: 3,
        margin: 0,
        scalable: true,
      });
      qr.querySelector('svg').setAttribute('aria-hidden', 'true');
    }
    document.title = (VI.screen[id]?.heading || 'CareFlow') + ' · CareFlow';
    $('announcer').textContent = VI.screen[id]?.heading || VI.feedback.notFound;
    save();
    requestAnimationFrame(() =>
      $('screen-title')?.focus({ preventScroll: true }),
    );
  }
  function renderReviewer() {
    $('screen-picker').innerHTML = M.SCREENS.map(
      (x) =>
        `<option value="${x.id}"${x.id === u.screen ? ' selected' : ''}>${x.id} · ${V.esc(x.title)}</option>`,
    ).join('');
    const v = M.visit(s),
      events = [];
    $('review-state').innerHTML =
      `<p class="review-hint">Màn: ${V.esc(u.screen)} · Lượt: ${V.esc(v?.id || '—')}<br>Trạng thái: ${V.esc(v?.status || '—')}<br>Thanh toán: ${V.esc(v?.payment.status || '—')}</p>`;
    if (v) {
      for (const status of M.TRANSITIONS[v.status] || [])
        if (status !== 'cancelled')
          events.push(['visit:' + status, VI.statuses[status][0]]);
      if (v.status === 'mode-review') {
        events.length = 0;
        events.push(
          ['review:onsite', 'Chốt hình thức tại phòng khám'],
          ['review:online', 'Chốt hình thức khám online'],
        );
      }
      if (v.status === 'confirmed')
        events.push(['lab:pre', 'Thêm chỉ định trước khám']);
      if (v.status === 'completed') {
        events.push(
          ['lab:post', 'Thêm chỉ định sau khám'],
          ['referral', 'Bác sĩ giới thiệu chuyên khoa'],
          ['reply', 'Điều phối viên phản hồi'],
          ['care:followup', 'Bác sĩ khuyến nghị tái khám'],
          ['care:emergency', 'Nhân viên yêu cầu hỗ trợ khẩn cấp'],
        );
        for (const status of M.PAYMENT_TRANSITIONS[v.payment.status] || [])
          if (
            ['paid', 'refunding', 'refunded', 'not-required'].includes(status)
          )
            events.push(['payment:' + status, VI.payments[status]]);
      }
      for (const lab of v.labs)
        for (const status of M.LAB_TRANSITIONS[lab.status] || [])
          events.push([
            'lab-status:' + lab.id + ':' + status,
            lab.id + ' · ' + VI.labs[status],
          ]);
      if (v.labs.some((l) => l.status === 'reviewed'))
        events.push(
          ['communicate:notified', 'Thông báo kết quả'],
          ['communicate:unreachable', 'Chưa liên hệ được để báo kết quả'],
          ['communicate:explained', 'Ghi nhận đã giải thích kết quả'],
        );
    }
    if (s.request?.status === 'unknown')
      events.push(
        ['unknown:found', 'Kiểm tra: đã nhận yêu cầu'],
        ['unknown:missing', 'Kiểm tra: chưa nhận yêu cầu'],
      );
    if (M.profile(s, 'p2'))
      events.push(
        ['permission:grant', 'Cho phép xem kết quả người thân'],
        ['permission:revoke', 'Thu hồi quyền xem kết quả người thân'],
      );
    $('staff-event').innerHTML = events.length
      ? events
          .map(
            ([key, label]) => `<option value="${key}">${V.esc(label)}</option>`,
          )
          .join('')
      : '<option value="">Chưa có cập nhật khả dụng</option>';
  }
  function dialog(title, body, buttons = '') {
    lastFocus = document.activeElement;
    $('dialog-title').textContent = title;
    $('dialog-body').textContent = body;
    $('dialog-actions').innerHTML =
      buttons || V.btn('Đóng', 'close-dialog', {}, 'primary');
    $('dialog').showModal();
  }
  function error(code, fieldId) {
    const target = $('form-error');
    if (target) {
      target.textContent = VI.errors[code] || VI.errors.REQUIRED;
      const input = fieldId
        ? $(fieldId)
        : $('phone-content').querySelector('input,textarea');
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', 'form-error');
        input.focus();
      }
    } else dialog(VI.feedback.awaiting, VI.errors[code] || VI.errors.REQUIRED);
    return false;
  }
  function complete(result, next, message) {
    if (!result.ok) return error(result.code);
    u.forms = {};
    demo();
    save();
    if (message) u.notice = message;
    if (next) go(next);
    else render();
    return true;
  }
  function rebook(purpose = 'rebook', mode = null) {
    const result = M.beginBooking(s, s.activeVisitId, purpose, mode);
    if (!result.ok) return error(result.code);
    u.forms = {};
    u.deviceReady = false;
    u.urgentAftercare = false;
    if (s.draft.risk) go('C4');
    else {
      s.draft.safety = 'normal';
      go('C7');
    }
  }

  function staff() {
    const event = $('staff-event').value,
      parts = event.split(':'),
      v = M.visit(s);
    let result = { ok: false, code: 'TRANSITION' };
    switch (parts[0]) {
      case 'visit':
        result = M.transition(s, v?.id, parts[1], 'staff');
        break;
      case 'review':
        result = M.reviewMode(
          s,
          v?.id,
          parts[1],
          'Phòng khám đã xem xét và đề nghị hình thức này.',
        );
        break;
      case 'lab':
        result = M.addLab(s, v?.id, parts[1]);
        break;
      case 'lab-status':
        result = M.labTransition(s, v?.id, parts[1], parts[2], 'staff', {
          appointmentDate: M.localDate(1),
        });
        break;
      case 'payment':
        result = M.setPayment(s, v?.id, parts[1], 'staff', {
          reason:
            parts[1] === 'refunding'
              ? 'Phòng khám đang kiểm tra đề nghị hoàn tiền.'
              : v.payment.reason,
        });
        break;
      case 'communicate':
        result = M.communicateResult(s, v?.id, parts[1]);
        break;
      case 'referral':
        if (v?.status === 'completed') {
          v.care.referral =
            'Phòng khám sẽ liên hệ để hướng dẫn chuyên khoa và cơ sở phù hợp.';
          M.notify(s, v, 'I4');
          result = { ok: true };
        }
        break;
      case 'reply':
        if (v?.status === 'completed') {
          s.messages.push({
            visitId: v.id,
            patientId: v.patientId,
            from: 'staff',
            text: 'Phòng khám đã nhận nội dung của bạn và sẽ trao đổi thêm.',
            at: new Date().toISOString(),
          });
          result = { ok: true };
        }
        break;
      case 'care':
        if (v?.status === 'completed') {
          v.care.status =
            parts[1] === 'emergency' ? 'urgent-review' : 'followup-due';
          M.notify(s, v, parts[1] === 'emergency' ? 'C4' : 'J1');
          result = { ok: true };
        }
        break;
      case 'unknown':
        result = M.resolveUnknown(s, parts[1] === 'found');
        break;
      case 'permission': {
        const p = M.profile(s, 'p2');
        if (p) {
          p.canViewResults = parts[1] === 'grant';
          result = { ok: true };
        }
        break;
      }
    }
    if (result.ok) {
      demo(
        'Đã áp dụng cập nhật thử nghiệm: ' +
          $('staff-event').selectedOptions[0].textContent,
      );
      save();
      const id = u.screen;
      if (
        parts[0] === 'visit' &&
        parts[1] === 'calling' &&
        ['G1', 'G2'].includes(id)
      )
        go('G3');
      else if (
        parts[0] === 'visit' &&
        parts[1] === 'completed' &&
        ['G4', 'E3'].includes(id)
      )
        go('H1');
      else if (
        parts[0] === 'visit' &&
        parts[1] === 'unreachable' &&
        ['G2', 'G3', 'G4'].includes(id)
      )
        go('G5');
      else if (parts[0] === 'unknown' && parts[1] === 'found') go('C9');
      else render();
    } else demo('Cập nhật bị chặn: ' + (VI.errors[result.code] || result.code));
  }
  const actions = {
    'skip-content'() {
      $('phone-main').focus();
    },
    go(el) {
      const to = el.dataset.to;
      if (el.dataset.reason) u.reportReason = el.dataset.reason;
      if (el.dataset.lab) u.labId = el.dataset.lab;
      if (el.dataset.purpose === 'rebook') return rebook();
      if (to === 'I1' && M.visit(s)?.status !== 'completed') {
        const found = s.visits.find((v) => v.status === 'completed');
        if (found) s.activeVisitId = found.id;
      }
      go(to);
    },
    back() {
      if (history.state?.careflow) history.back();
      else
        go(s.authenticated ? (visitScreens.has(u.screen) ? 'D1' : 'B1') : 'A1');
    },
    begin() {
      const result = M.beginBooking(s);
      if (result.ok) {
        u.forms = {};
        u.urgentAftercare = false;
        go('C1');
      } else error(result.code);
    },
    'open-visit'(el) {
      s.activeVisitId = el.dataset.id;
      u.labId = null;
      go('D2');
    },
    filter(el) {
      u.filter = el.dataset.filter;
      render();
    },
    resend() {
      demo(VI.demo.otp);
      $('otp')?.focus();
    },
    'different-profile'() {
      u.forms = {};
      go('A3');
    },
    'safety-continue'() {
      go(u.urgentAftercare ? 'I5' : 'C5');
    },
    'stop-booking'() {
      s.draft = null;
      u.urgentAftercare = false;
      demo(VI.feedback.demoStopped);
      go('B1');
    },
    emergency() {
      dialog(
        VI.demo.title,
        VI.demo.emergency,
        V.btn(VI.screen.C4.exit, 'stop-emergency', {}, 'primary') +
          V.btn('Đóng', 'close-dialog'),
      );
    },
    'stop-emergency'() {
      $('dialog').close();
      s.draft = null;
      u.urgentAftercare = false;
      go('B1');
    },
    directions() {
      dialog(VI.demo.title, VI.demo.directions);
    },
    'clinic-call'() {
      dialog(VI.screen.K5.call, VI.common.notProvided);
    },
    rebook(el) {
      rebook(el.dataset.purpose, el.dataset.mode || null);
    },
    arrive() {
      if (s.offline) return error('OFFLINE');
      complete(M.transition(s, s.activeVisitId, 'arrived'), 'E3');
    },
    device() {
      dialog(
        VI.demo.title,
        VI.demo.video,
        V.btn('Tiếp tục thử thiết bị', 'device-ready', {}, 'primary') +
          V.btn(VI.common.cancel, 'close-dialog'),
      );
    },
    'device-ready'() {
      $('dialog').close();
      u.deviceReady = true;
      render();
      demo(VI.demo.video);
    },
    join() {
      if (s.offline) return error('OFFLINE');
      const v = M.visit(s);
      if (v.status === 'online-wait') {
        go('G2');
        return;
      }
      complete(M.transition(s, v.id, 'online-wait'), 'G2');
    },
    answer() {
      if (s.offline) return error('OFFLINE');
      complete(M.transition(s, s.activeVisitId, 'in-consult'), 'G4');
      demo(VI.demo.video);
    },
    decline() {
      if (s.offline) return error('OFFLINE');
      complete(M.transition(s, s.activeVisitId, 'unreachable'), 'G5');
    },
    mic() {
      u.mic = !u.mic;
      render();
      demo(VI.demo.video);
    },
    camera() {
      u.camera = !u.camera;
      render();
      demo(VI.demo.video);
    },
    'leave-call'() {
      dialog(
        VI.screen.G4.end,
        VI.screen.G4.note,
        V.btn(VI.screen.G4.end, 'confirm-leave', {}, 'danger') +
          V.btn('Tiếp tục cuộc gọi', 'close-dialog'),
      );
    },
    'confirm-leave'() {
      $('dialog').close();
      const v = M.visit(s);
      v.communication.callback = 'pending';
      go('D2');
      demo(VI.screen.G4.disconnect + ' ' + VI.demo.video);
    },
    callback() {
      if (s.offline) return error('OFFLINE');
      const v = M.visit(s);
      v.communication.callback = 'pending';
      save();
      demo();
      dialog(VI.common.support, VI.feedback.callback);
    },
    payment(el) {
      if (s.offline) return error('OFFLINE');
      const result = M.setPayment(s, s.activeVisitId, el.dataset.status);
      if (result.ok) {
        demo(
          el.dataset.status === 'transfer-pending'
            ? VI.demo.payment
            : VI.demo.notice,
        );
        go('H5');
      } else error(result.code);
    },
    'resolve-unknown'() {
      demo(
        'Người đánh giá: chọn kết quả kiểm tra yêu cầu trong Công cụ đánh giá.',
      );
      $('review-tools').hidden = false;
      $('review-toggle').setAttribute('aria-expanded', 'true');
      $('staff-event').focus();
    },
    'care-urgent'() {
      u.urgentAftercare = true;
      go('C4');
    },
    notification(el) {
      const n = s.notifications.find((x) => x.id === el.dataset.id);
      if (n) {
        n.read = true;
        if (n.screen === 'C4') u.urgentAftercare = true;
        go(n.screen, { visitId: n.visitId });
      }
    },
    staff,
    offline() {
      s.offline = !s.offline;
      save();
      render();
      demo(
        s.offline
          ? VI.feedback.offline
          : 'Đã kết nối lại trong phiên thử nghiệm.',
      );
    },
    'large-text'() {
      s.settings.largeText = !s.settings.largeText;
      save();
      render();
    },
    reset() {
      sessionStorage.removeItem(KEY);
      s = M.initial();
      u = {
        ...u,
        screen: 'A1',
        forms: {},
        otpSent: false,
        phone: '',
        deviceReady: false,
        urgentAftercare: false,
      };
      demo(VI.demo.warning);
      go('A1', {}, true);
    },
    logout() {
      s.authenticated = false;
      u.forms = {};
      u.otpSent = false;
      save();
      go('A1');
    },
    'close-dialog'() {
      $('dialog').close();
    },
    'confirm-cancel'() {
      const reason = u.cancelReason;
      $('dialog').close();
      if (s.offline) return error('OFFLINE');
      complete(
        M.transition(s, s.activeVisitId, 'cancelled', 'patient', reason),
        'D2',
      );
    },
  };
  document.addEventListener('click', (event) => {
    const el = event.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const action = actions[el.dataset.action];
    if (action) {
      event.preventDefault();
      action(el);
    }
  });
  document.addEventListener('input', (event) => {
    const el = event.target,
      form = el.closest('form[data-form]');
    if (!form || el.type === 'file') return;
    const name = form.dataset.form;
    u.forms[name] ??= {};
    u.forms[name][el.name] = el.type === 'checkbox' ? el.checked : el.value;
    el.removeAttribute('aria-invalid');
    if ($('form-error')) $('form-error').textContent = '';
    save();
  });

  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!form.matches('form[data-form]')) return;
    event.preventDefault();
    const name = form.dataset.form,
      data = new FormData(form),
      get = (key) => String(data.get(key) || '').trim(),
      v = M.visit(s),
      cta = form.querySelector('[type=submit]');
    if (cta.disabled) return;
    if (s.offline && name !== 'settings') return error('OFFLINE');
    switch (name) {
      case 'otp':
        if (!/^0\d{9}$/.test(get('phone'))) return error('PHONE', 'phone');
        u.phone = get('phone');
        u.otpSent = true;
        render();
        demo(VI.demo.otp);
        $('otp')?.focus();
        break;
      case 'verify': {
        if (!data.has('consent')) return error('CONSENT', 'consent');
        const result = M.authenticate(s, get('phone'), get('otp'));
        if (!result.ok)
          return error(result.code, result.code === 'PHONE' ? 'phone' : 'otp');
        demo();
        u.forms = {};
        go(result.match ? 'A2' : 'A3');
        break;
      }
      case 'profile':
        complete(M.createProfile(s, get('name'), get('dob')), 'B1');
        break;
      case 'match': {
        const p = M.profile(s);
        if (
          !get('name') ||
          !M.validDate(get('dob')) ||
          get('dob') > M.localDate()
        )
          return error('PROFILE', 'name');
        p.name = get('name');
        p.dob = get('dob');
        if (returnHash) {
          const target = returnHash;
          returnHash = null;
          complete({ ok: true });
          location.hash = target;
        } else complete({ ok: true }, 'B1');
        break;
      }
      case 'relative': {
        const result = M.createProfile(s, get('name'), get('dob'), 'relative');
        const returnToBooking = s.draft && s.request?.status !== 'done';
        if (result.ok && returnToBooking) M.choosePatient(s, result.profile.id);
        complete(result, returnToBooking ? 'C1' : 'K2');
        break;
      }
      case 'patient':
        complete(M.choosePatient(s, get(VI.common.patient)), 'C2');
        break;
      case 'reason':
        if (!get('reason')) return error('REASON', 'reason');
        s.draft.reason = get('reason');
        complete({ ok: true }, 'C3');
        break;
      case 'safety': {
        const result = M.screenSafety(s, get(VI.screen.C3.heading));
        complete(result, result.next);
        break;
      }
      case 'mode-review':
        if (!data.has('ack')) return error('CONSENT', 'ack');
        s.draft.reviewAccepted = true;
        complete({ ok: true }, 'C7');
        break;
      case 'mode':
        s.draft.mode = get(VI.common.mode);
        complete({ ok: true }, 'C7');
        break;
      case 'slot': {
        if (
          !M.validDate(get('date')) ||
          get('date') < M.localDate() ||
          !get('slot')
        )
          return error('SLOT', 'date');
        s.draft.date = get('date');
        s.draft.slot = get('slot');
        complete({ ok: true }, 'C8');
        break;
      }
      case 'booking': {
        if (!data.has('consent')) return error('CONSENT', 'consent');
        cta.disabled = true;
        cta.textContent = 'Đang gửi…';
        form.setAttribute('aria-busy', 'true');
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const result = M.submitBooking(s, $('booking-outcome').value);
        if (result.ok) complete(result, 'C9');
        else {
          cta.disabled = false;
          cta.textContent = VI.screen.C8.send;
          form.removeAttribute('aria-busy');
          save();
          error(result.code);
          renderReviewer();
          if (result.code === 'UNKNOWN') {
            const extra = document.createElement('div');
            extra.innerHTML = V.btn(VI.screen.C8.verify, 'resolve-unknown');
            form.append(extra);
          }
          if (result.code === 'SLOT_UNAVAILABLE') u.forms.slot = {};
        }
        break;
      }
      case 'cancel': {
        const selected = get(VI.screen.D4.reason),
          labels = {
            busy: VI.screen.D4.option1,
            'other-date': VI.screen.D4.option2,
            other: VI.screen.D4.option3,
          };
        if (!labels[selected] || (selected === 'other' && !get('cancelNote')))
          return error('CANCEL_REASON', 'cancelNote');
        u.cancelReason =
          labels[selected] +
          (get('cancelNote') ? ' · ' + get('cancelNote') : '');
        dialog(
          VI.screen.D4.dialog,
          VI.screen.D4.note,
          V.btn(VI.screen.D4.confirm, 'confirm-cancel', {}, 'danger') +
            V.btn(VI.screen.D4.keep, 'close-dialog'),
        );
        break;
      }
      case 'lab-path': {
        const l = M.lab(s, v.id, u.labId || v.labs[0]?.id);
        l.returnPath = get(VI.screen.F2.path);
        complete({ ok: true }, null, VI.screen.F2.saved);
        break;
      }
      case 'lab-book': {
        if (
          !data.has('coordinator') &&
          (!get('labDate') || get('labDate') < M.localDate() || !get('labTime'))
        )
          return error('LAB_DATE', 'labDate');
        complete(
          M.labTransition(
            s,
            v.id,
            u.labId || v.labs[0]?.id,
            'scheduled',
            'patient',
            {
              appointmentDate: get('labDate'),
              appointmentTime: get('labTime'),
              coordinator: data.has('coordinator'),
            },
          ),
          'F2',
          VI.screen.F3.done,
        );
        break;
      }
      case 'lab-upload': {
        const file = data.get('file');
        if (
          !file?.size ||
          file.size > 10 * 1024 * 1024 ||
          !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
        )
          return error('FILE', 'file');
        complete(
          M.labTransition(
            s,
            v.id,
            u.labId || v.labs[0]?.id,
            'available',
            'patient',
            { file: { name: file.name, size: file.size, type: file.type } },
          ),
          'F2',
          VI.screen.F4.done,
        );
        break;
      }
      case 'defer':
        complete(
          M.setPayment(s, v.id, 'deferred', 'patient', {
            reason: get('deferReason'),
            dueDate: get('dueDate'),
          }),
          'H5',
          VI.screen.H3.done,
        );
        break;
      case 'report': {
        const result = M.report(
          s,
          v.id,
          u.reportReason,
          get('report'),
          data.has('urgent'),
        );
        u.urgentAftercare = data.has('urgent');
        complete(result, result.next);
        break;
      }
      case 'tracking':
        if (!get('tracking')) return error('REQUIRED', 'tracking');
        s.tracking.push({
          visitId: v.id,
          patientId: v.patientId,
          text: get('tracking'),
          at: new Date().toISOString(),
        });
        complete({ ok: true });
        break;
      case 'referral':
        if (!get('referral')) return error('REQUIRED', 'referral');
        s.messages.push({
          visitId: v.id,
          patientId: v.patientId,
          from: 'patient',
          text: get('referral'),
          at: new Date().toISOString(),
        });
        complete({ ok: true }, 'I5');
        break;
      case 'message':
        if (!get('message')) return error('REQUIRED', 'message');
        s.messages.push({
          visitId: v.id,
          patientId: v.patientId,
          from: 'patient',
          text: get('message'),
          at: new Date().toISOString(),
        });
        complete({ ok: true });
        break;
      case 'support':
        if (!get('support')) return error('REQUIRED', 'support');
        s.requests.push({
          id: 'request-' + s.requests.length,
          text: get('support'),
          visitId: s.activeVisitId,
          status: 'waiting',
        });
        complete({ ok: true });
        dialog(VI.screen.K5.message, VI.screen.K5.sent);
        break;
      case 'settings':
        s.settings = {
          largeText: data.has('largeText'),
          privatePreview: data.has('privatePreview'),
          reminders: data.has('reminders'),
        };
        complete({ ok: true }, null, VI.feedback.saved);
        break;
    }
  });
  $('dialog').addEventListener(
    'close',
    () => lastFocus?.isConnected && lastFocus.focus(),
  );
  $('review-toggle').addEventListener('click', () => {
    const expanded =
      $('review-toggle').getAttribute('aria-expanded') === 'true';
    $('review-toggle').setAttribute('aria-expanded', String(!expanded));
    $('review-tools').hidden = expanded;
  });
  $('screen-picker').addEventListener('change', (e) => go(e.target.value));
  $('scenario').addEventListener('change', (e) => loadScenario(e.target.value));
  $('phone-content').addEventListener('change', (e) => {
    if (e.target.name === VI.screen.I1.visit) {
      s.activeVisitId = e.target.value;
      u.forms = {};
      go('I1', { visitId: s.activeVisitId });
    }
  });
  function loadScenario(name) {
    s = name === 'new' ? M.initial() : M.fixture(name);
    u = {
      ...u,
      forms: {},
      otpSent: false,
      phone: '',
      deviceReady: false,
      labId: null,
      urgentAftercare: false,
    };
    if (name === 'returning') {
      s.authenticated = false;
      go('A1', {}, true);
    } else go(name === 'new' ? 'A1' : 'B1', {}, true);
    demo(VI.demo.warning);
  }
  window.addEventListener('hashchange', render);
  const params = new URLSearchParams(location.search);
  if (
    [
      'new',
      'returning',
      'empty',
      'upcoming',
      'completed',
      'online',
      'pre-lab',
      'no-show',
    ].includes(params.get('scenario'))
  ) {
    s =
      params.get('scenario') === 'new'
        ? M.initial()
        : M.fixture(params.get('scenario'));
    if (params.get('scenario') === 'returning') s.authenticated = false;
    u.forms = {};
    if (!location.hash)
      history.replaceState(
        null,
        '',
        '#' + (s.authenticated ? '/home' : '/login'),
      );
  }
  if (!location.hash)
    history.replaceState(
      null,
      '',
      '#' + (s.authenticated ? '/home' : '/login'),
    );
  if (params.has('scenario')) {
    params.delete('scenario');
    history.replaceState(
      null,
      '',
      location.pathname + (params.size ? '?' + params : '') + location.hash,
    );
  }
  const sizeObserver = new ResizeObserver(() => {
    const height =
      document.querySelector('.demo-bar').getBoundingClientRect().height +
      $('demo-feedback').getBoundingClientRect().height;
    document.documentElement.style.setProperty('--demo-height', height + 'px');
  });
  sizeObserver.observe(document.querySelector('.demo-bar'));
  sizeObserver.observe($('demo-feedback'));
  render();
})();
