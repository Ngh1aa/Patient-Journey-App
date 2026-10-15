/* Navigation/UI orchestration. All service updates are explicitly synthetic. */
(function () {
  'use strict';
  const M = window.CareFlowModel,
    VI = window.CareFlowCopy,
    V = window.CareFlowViews,
    $ = (id) => document.getElementById(id),
    KEY = 'careflow.browser.v3';
  let returnHash = null;
  let guideEnabled = false;
  let restoredSession = false;
  let deviceStream = null;
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
    $('demo-feedback').textContent = guideEnabled ? '' : message;
  }
  function withFeeling(text, level) {
    const label = {1:'Nhẹ',2:'Vừa',3:'Nặng'}[level];
    return text + (label ? '\nMức độ cảm nhận: ' + label : '');
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
      restoredSession = true;
    }
  } catch {
    demo('Không mở được phiên trước. Bạn có thể bắt đầu lại.');
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
    if (id.startsWith('C')) return 'C1';
    if (id === 'B1') return 'B1';
    if (['K2', 'K3', 'K4'].includes(id)) return 'K2';
    if (id.startsWith('I') || id === 'K5') return 'K5';
    return 'D1';
  }
  function render() {
    const id = readRoute().id;
    u.screen = id;
    $('phone-frame').dataset.screen = id;
    const g = guard(id);
    const isSheet = ['D3', 'D4', 'H3'].includes(id) && !g;
    $('phone-frame').classList.toggle('sheet-open', isSheet);
    $('phone-frame').querySelector('.phone-header').inert = isSheet;
    $('bottom-nav').inert = isSheet;
    if (/^C[1-8]$/.test(id) && !g) u.bookingScreen = id;
    $('phone-frame').classList.toggle('large-text', !!s.settings.largeText);
    $('phone-frame').classList.toggle(
      'video-mode',
      ['G3', 'G4'].includes(id) && !g,
    );
    $('back').innerHTML = window.CareFlowIcon('chevron-left', 23);
    $('notifications').innerHTML = window.CareFlowIcon('bell', 22);
    const isAuth = ['A1', 'A2', 'A3'].includes(id);
    $('auth-progress').hidden = !isAuth;
    $('auth-jump').hidden = !isAuth;
    $('auth-jump').innerHTML = isAuth ? window.CareFlowIcon('arrow-right', 28) : '';
    $('phone-frame').dataset.authStep = id === 'A1' ? (u.otpSent ? '2' : '1') : '3';
    $('back').hidden = ['A1', 'B1', 'D1', 'K2', 'K5'].includes(id);
    $('notifications').hidden = !s.authenticated || isAuth;
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
      ['C1', 'Đặt lịch', 'plus'],
      ['K2', 'Hồ sơ', 'user'],
      ['K5', 'Hỗ trợ', 'phone'],
    ]
      .map(
        ([to, label, icon]) =>
          to === 'C1'
            ? `<button type="button" class="nav-book" data-action="book-nav" aria-label="Đặt lịch khám" title="Đặt lịch khám"${activeTab(id) === to ? ' aria-current="step"' : ''}><span class="nav-plus">${window.CareFlowIcon(icon, 28)}</span><span class="nav-caption" hidden>${label}</span></button>`
            : `<a href="#${routeFor(to)}" aria-label="${label}" title="${label}"${activeTab(id) === to ? ' aria-current="page"' : ''}>${window.CareFlowIcon(icon, 22)}<span class="nav-caption" hidden>${label}</span></a>`,
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
    updateDateSelection();
    updatePatientAction();
    updateCountdown();
    const savedHistory = $('medicalHistory');
    if (savedHistory?.value) savedHistory.closest('details')?.setAttribute('open', '');
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
    if (window.CareFlowJourney && guideEnabled && renderJourney()) return;
    document.title = (VI.screen[id]?.heading || 'CareFlow') + ' · CareFlow';
    $('announcer').textContent = VI.screen[id]?.heading || VI.feedback.notFound;
    save();
    $('screen-title')?.focus({ preventScroll: true });
  }
  function journeyContext() {
    const v = M.visit(s);
    return {s,u,v,l:v?.labs[0]};
  }
  function startJourney(id, variant) {
    const flow = window.CareFlowJourney.flows.find(f=>f.id===id) || window.CareFlowJourney.flows[0];
    const selected = variant || flow.variants?.[0][0] || 'default';
    guideEnabled = true;
    s = window.CareFlowJourney.seed(flow, selected);
    u = {...u, inspection:false, journey:{id:flow.id,variant:selected,index:0},forms:{},otpSent:false,deviceReady:false,emergencyOpened:false,emergencyAccessed:false,phone:'',labId:null,reportReason:selected==='urgent'?'symptoms':['medicine','question','symptoms'].includes(selected)?selected:'medicine',urgentAftercare:false,notice:''};
    const params = new URLSearchParams(location.search);
    params.set('journey', flow.id);
    params.set('branch', selected);
    params.delete('scenario');
    history.replaceState(null,'',location.pathname+'?'+params);
    $('review-tools').hidden = true;
    $('review-toggle').setAttribute('aria-expanded','false');
    go(flow.steps(selected)[0].screen,{},true);
    const panel = document.querySelector('.journey-panel'), active = panel.querySelector('.journey-item.active');
    if(active && flow.id!=='F1')panel.scrollTop=Math.max(0,active.offsetTop-panel.offsetTop-150);
  }
  function restoreJourney() {
    const id = readRoute().id, v = M.visit(s), l = v?.labs[0];
    let flowId='F1', variant='default';
    if(id==='A2')flowId='F2';
    else if(['C4','C5'].includes(id) || (/^C[7-9]$/.test(id) && s.draft?.risk) || (id==='D2' && v?.status==='mode-review')){flowId='F3';variant='review';}
    else if(id==='J1' || (/^C[2-8]$/.test(id) && s.draft?.purpose==='followup'))flowId='F12';
    else if(id.startsWith('E'))flowId='F4';
    else if(id.startsWith('F')){flowId=l?.timing==='pre'?'F5':'F10';variant=flowId==='F5'?(l?.returnPath || 'visit'):'summary';}
    else if(id.startsWith('G')){flowId=id==='G5'?'F8':'F7';variant=id==='G5'?'callback':'default';}
    else if(['D3','D4'].includes(id) || (id==='D2' && ['cancelled','no-show'].includes(v?.status))){flowId='F6';variant=id==='D3'?'reschedule':v?.status==='no-show'?'no-show':'cancel';}
    else if(/^H[2-5]$/.test(id)){flowId='F9';variant=id==='H3'?'later':id==='H4'?'transfer':'counter';}
    else if(id==='H7'){flowId='F10';variant='summary';}
    else if(id.startsWith('I')){flowId='F11';variant=id==='I3'?'tracking':id==='I4'?'referral':u.reportReason || 'medicine';}
    else if(v?.status==='completed')flowId='F4';
    if(!s.authenticated)flowId='F1';
    const flow=window.CareFlowJourney.flows.find(f=>f.id===flowId);
    if(flow.variants && !flow.variants.some(([key])=>key===variant))variant=flow.variants[0][0];
    const steps=flow.steps(variant);
    let index=steps.findIndex(step=>step.screen===id);
    if(flowId==='F1' && s.authenticated)index=id==='A3'||!s.profiles.length?2:index<0?3:index;
    if(!s.authenticated)index=0;
    if(flowId==='F5' && l?.status==='available')index=3;
    if(flowId==='F5' && l?.continuation)index=4;
    u.inspection=false;
    u.journey={id:flowId,variant,index:Math.max(0,index)};
    // Adopt the route and draft in place. Switching journeys remains an explicit reset.
  }
  function prefillJourney() {
    const branch=u.journey.variant;
    let preferredAction=null;
    if(u.journey.id==='F8' && u.screen==='G5') preferredAction=`[data-purpose="${branch==='online'?'online-retry':'convert-onsite'}"]`;
    if(u.journey.id==='F9' && u.screen==='H2' && ['counter','pharmacy','refund','later'].includes(branch)) preferredAction=`[data-status="${branch==='pharmacy'?'pharmacy-pending':'counter-pending'}"]`;
    if(u.journey.id==='F10' && branch==='explain' && u.screen==='H7') preferredAction='[data-purpose="explanation"]';
    if(preferredAction){
      const chosen=$('phone-content').querySelector(preferredAction);
      if(chosen)for(const button of $('phone-content').querySelectorAll('.btn')){
        button.classList.toggle('primary',button===chosen);
        if(button!==chosen && !button.classList.contains('text'))button.classList.add('secondary');
      }
    }
    const values = {phone:'0900000000',otp:'123456',name:'Nguyễn Minh Anh',dob:'1994-08-15',contactPhone:'0900000000',medicalHistory:'Chưa có thông tin cần bổ sung.',reason:u.journey.id==='F12'?'Tôi muốn cập nhật tình trạng và trao đổi lại sau lần khám trước.':'Đau đầu hai ngày, ngủ không ngon.',cancelNote:'Tôi cần sắp xếp lại thời gian.',deferReason:'Tôi cần sắp xếp thời gian thanh toán.',report:'Tôi muốn trao đổi thêm với phòng khám sau buổi khám.',tracking:'Tôi gửi cập nhật tình trạng hôm nay để phòng khám theo dõi.',referral:'Tôi đã đến khám chuyên khoa và muốn chuyển thông tin lại cho bác sĩ.',message:'Tôi muốn hỏi thêm về thông tin sau buổi khám.',support:'Tôi cần phòng khám hỗ trợ về lịch hẹn.'};
    const form = $('phone-content').querySelector('form[data-form]');
    if (!form) return;
    for (const el of form.elements) {
      if (el.type==='file' && !el.files.length) {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['%PDF-1.4\n% CareFlow portfolio attachment - no clinical data\n%%EOF'], 'Ket-qua-da-nhan.pdf', {type:'application/pdf'}));
        el.files = transfer.files;
      } else if (el.type==='checkbox' && (['consent','ack'].includes(el.name) || (el.name==='urgent' && branch==='urgent'))) el.checked=true;
      else if (el.type!=='radio' && !el.value && values[el.name]) el.value=values[el.name];
    }
    const radios=Array.from(form.querySelectorAll('input[type=radio]'));
    const preferred=radios.find(el=>el.value===(u.journey.id==='F3'?'warning':'normal'));
    if(!radios.some(el=>el.checked) && radios.length)(preferred || radios[0]).checked=true;
  }
  function renderJourney() {
    const J = window.CareFlowJourney;
    const active = J.flows.find(f=>f.id===u.journey?.id);
    if(!active)return false;
    const steps = active.steps(u.journey.variant);
    let moved=false;
    while(u.journey.index<steps.length && steps[u.journey.index].done(journeyContext())) {u.journey.index++;moved=true;}
    const current=steps[u.journey.index];
    if(moved && current && current.screen!==u.screen){go(current.screen);return true;}
    const count = u.journey.index;
    u.completedJourneys ??= {};
    if(count===steps.length)u.completedJourneys[active.id]=true;
    $('journey-list').innerHTML=J.flows.map((f,i)=>`<li class="journey-item ${f.id===active.id?'active':''}"><button type="button" data-action="journey-select" data-flow="${f.id}" aria-expanded="${f.id===active.id}"><span class="journey-number">${u.completedJourneys[f.id]?'✓':String(i+1).padStart(2,'0')}</span><span><strong>${V.esc(f.title)}</strong>${f.id===active.id?`<small>${V.esc(f.description)}</small>`:''}</span><span class="journey-chevron" aria-hidden="true">${f.id===active.id?'−':'+'}</span></button>${f.id===active.id?`<div class="journey-detail">${f.variants?`<div class="journey-branches" role="group" aria-label="Nhánh hành trình">${f.variants.map(([key,label])=>`<button type="button" data-action="journey-branch" data-branch="${key}" aria-pressed="${key===u.journey.variant}">${V.esc(label)}</button>`).join('')}</div>`:''}<div class="journey-progress"><span>${count===steps.length?'Hành trình đã hoàn tất':`Đã đi qua ${count}/${steps.length} bước`}</span><span>${Math.round(count/steps.length*100)}%</span></div><progress max="${steps.length}" value="${count}" aria-label="Tiến độ hành trình"></progress><ol class="journey-checklist" tabindex="0" aria-label="Các bước trong hành trình">${steps.map((step,n)=>`<li class="${n<count?'done':n===count?'current':''}"${n===count?' aria-current="step"':''}><span class="step-check" aria-hidden="true">${n<count?'✓':n+1}</span><span>${V.esc(step.title)}${n===count?`<small>${step.event?'Phòng khám đang xử lý':'Tiếp tục trong ứng dụng'}</small>`:''}</span></li>`).join('')}</ol><div class="journey-current">${current?`${current.event?`<p>${V.esc(current.title)}</p><button type="button" class="btn primary" data-action="journey-next">Xem cập nhật từ phòng khám</button>`:`<p>Thông tin đã điền sẵn. Bạn có thể chỉnh sửa hoặc tiếp tục bằng nút trong ứng dụng.</p><button type="button" class="btn secondary" data-action="journey-open">${current.screen===u.screen?'Tiếp tục trong ứng dụng':'Mở bước hiện tại'}</button>`}`:`<p>Bạn đã đi hết nhánh này. Chọn một hành trình khác để tiếp tục khám phá.</p><button type="button" class="btn secondary" data-action="journey-restart">Xem lại hành trình</button>`}</div></div>`:''}</li>`).join('');
    $('journey-mobile-label').textContent=active.title + (current?.event ? ' · Có cập nhật' : ' · Xem các bước');
    const currentItem=$('journey-list').querySelector('[aria-current=step]');
    if(currentItem){const list=currentItem.closest('ol');list.scrollTop=Math.max(0,currentItem.offsetTop-list.offsetTop-100);}
    prefillJourney();
    save();
    return false;
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
        events.push(['lab:pre', 'Thêm chỉ định trước khám'], ['fee:package', 'Thông báo phí theo gói'], ['fee:not-required', 'Xác nhận không thu phí']);
      if (v.status === 'completed') {
        events.push(
          ['lab:post', 'Thêm chỉ định sau khám'],
          ['referral', 'Bác sĩ giới thiệu chuyên khoa'],
          ['reply', 'Điều phối viên phản hồi'],
          ['care:followup', 'Bác sĩ khuyến nghị tái khám'],
          ['care:emergency', 'Nhân viên yêu cầu hỗ trợ khẩn cấp'],
          ['summary', 'Bác sĩ chia sẻ kết luận'],
        );
        const task = v.care.tasks?.find(t => t.status !== 'answered');
        const careNext = { received: ['coordinating','Điều phối viên tiếp nhận'], coordinating: ['doctor-review','Chuyển bác sĩ xem'], 'doctor-review': ['answered','Phản hồi lại bệnh nhân'] };
        if (task && careNext[task.status]) events.push(['handoff:' + careNext[task.status][0], careNext[task.status][1]]);
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
    stopDevicePreview();
    if(!$('dialog').open)lastFocus = document.activeElement;
    $('dialog-title').textContent = title;
    $('dialog-body').textContent = body;
    $('dialog-actions').innerHTML =
      buttons || V.btn('Đóng', 'close-dialog', {}, 'primary');
    $('dialog').showModal();
  }
  function stopDevicePreview() {
    deviceStream?.getTracks().forEach(track=>track.stop());
    deviceStream=null;
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
    else if (purpose === 'followup') go('C2');
    else {
      s.draft.safety = 'normal';
      go('C7');
    }
  }

  function staff(requestedEvent) {
    const event = typeof requestedEvent === 'string' ? requestedEvent : $('staff-event').value,
      parts = event.split(':'),
      v = M.visit(s);
    let result = { ok: false, code: 'TRANSITION' };
    switch (parts[0]) {
      case 'fee':
        result = M.setFeePlan(s, v?.id, parts[1]);
        break;
      case 'summary':
        result = M.shareSummary(s, v?.id);
        break;
      case 'handoff':
        result = M.advanceCare(s, v?.id, parts[1]);
        break;
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
          (Array.from($('staff-event').options).find(o => o.value === event)?.textContent || 'Thông tin lượt khám'),
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
    'journey-select'(el) { startJourney(el.dataset.flow); },
    'journey-branch'(el) { startJourney(u.journey.id,el.dataset.branch); },
    'journey-restart'() { startJourney(u.journey.id,u.journey.variant); },
    'journey-open'() {
      const flow=window.CareFlowJourney.flows.find(f=>f.id===u.journey.id), step=flow.steps(u.journey.variant)[u.journey.index];
      if(step.screen!==u.screen)go(step.screen);
      document.querySelector('.journey-panel').classList.remove('mobile-open');
      document.querySelector('.journey-mobile-toggle').setAttribute('aria-expanded','false');
      const target=$('phone-content').querySelector('form [type=submit],.btn.primary,.btn');
      target?.focus();target?.scrollIntoView({block:'nearest'});
    },
    'journey-next'() {
      const flow=window.CareFlowJourney.flows.find(f=>f.id===u.journey.id), step=flow.steps(u.journey.variant)[u.journey.index];
      if(step?.event)staff(step.event);
    },
    'journey-toggle'(el) { el.setAttribute('aria-expanded',String(document.querySelector('.journey-panel').classList.toggle('mobile-open'))); },
    'skip-content'() {
      $('phone-main').focus();
    },
    go(el) {
      const to = el.dataset.to;
      if (el.dataset.section === 'saved-profiles') {
        $('saved-profiles')?.scrollIntoView({block:'start'});
        return;
      }
      if (el.dataset.section === 'callback') return actions['clinic-call']();
      if (el.dataset.reason) u.reportReason = el.dataset.reason;
      if (el.dataset.lab) u.labId = el.dataset.lab;
      if (el.dataset.purpose === 'rebook') return rebook();
      if (to === 'I1' && M.visit(s)?.status !== 'completed') {
        const found = s.visits.find((v) => v.status === 'completed');
        if (found) s.activeVisitId = found.id;
      }
      go(to);
    },
    'auth-jump'() {
      const id = u.screen === 'A1' ? (u.otpSent ? 'otp' : 'phone') : 'name';
      const field = $(id);
      if (!field) return;
      field.scrollIntoView({ block: 'center', behavior: 'instant' });
      field.focus({ preventScroll: true });
    },
    back() {
      if (history.state?.careflow) history.back();
      else
        go(s.authenticated ? (visitScreens.has(u.screen) ? 'D1' : 'B1') : 'A1');
    },
    'book-nav'() {
      if (s.request?.status === 'unknown') return go('C8');
      // Resume a draft when returning from another tab; do not erase entered data.
      if (s.draft && s.request?.status !== 'done') {
        if (/^C[1-8]$/.test(u.bookingScreen)) return go(u.bookingScreen);
        const next = s.draft.risk
          ? (s.draft.reviewAccepted ? (s.draft.slot ? 'C8' : 'C7') : 'C4')
          : !s.draft.reason ? 'C1' : !s.draft.safety ? 'C3' : !s.draft.slot ? 'C6' : 'C8';
        return go(next);
      }
      actions.begin();
    },
    'quick-date'(el) {
      const input = $('date');
      if (!input) return;
      input.value = el.dataset.date;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      updateDateSelection();
    },
    'reason-chip'(el) {
      const input = $('reason');
      if (!input) return;
      input.value = input.value.trim() ? input.value.trim() + ', ' + el.dataset.value.toLowerCase() : el.dataset.value;
      input.dispatchEvent(new Event('input', {bubbles:true}));
      input.focus();
    },
    'result-filter'(el) {
      u.resultFilter = el.dataset.filter;
      render();
    },
    'call-tab'(el) {
      u.callTab = el.dataset.tab;
      u.callDrawerOpen = true;
      render();
    },
    begin() {
      if (s.draft && s.request?.status !== 'done') return actions['book-nav']();
      const result = M.beginBooking(s);
      if (result.ok) {
        u.forms = {};
        u.bookingScreen = 'C1';
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
      u.emergencyOpened = true;
      render();
      dialog(
        VI.facility.emergencyTitle,
        VI.facility.emergencyLead,
        V.external('Gọi '+VI.facility.emergencyPhone, 'tel:'+VI.facility.emergencyPhone, 'danger') +
          V.btn(VI.screen.C4.directions, 'directions') +
          V.btn(VI.screen.C4.exit, 'stop-emergency', {}, 'text'),
      );
    },
    'stop-emergency'() {
      $('dialog').close();
      s.draft = null;
      u.urgentAftercare = false;
      go('B1');
    },
    directions() {
      u.emergencyOpened = true;
      render();
      dialog(VI.screen.C4.directions, '', V.external(VI.facility.directions, VI.facility.maps) + V.external(VI.facility.details, VI.facility.source, 'secondary') + V.btn('Quay lại', 'close-dialog', {}, 'text'));
      $('dialog-body').innerHTML=V.facilityCard();
    },
    'external-support'() { u.emergencyAccessed=true;save();render(); },
    'clinic-call'() {
      const v=M.visit(s);
      if(v)v.communication.callback='pending';
      if(!s.requests.some(r=>r.type==='callback' && r.visitId===s.activeVisitId && r.status==='waiting'))
        s.requests.push({id:'request-'+s.requests.length,type:'callback',visitId:s.activeVisitId,text:'Bạn muốn phòng khám gọi lại để hỗ trợ.',status:'waiting'});
      save();render();
      dialog('Yêu cầu phòng khám gọi lại', VI.feedback.callback);
      $('dialog-body').innerHTML = V.form('callback-window', V.choices('Khung giờ thuận tiện', [['morning','Buổi sáng','08:00–11:30'],['afternoon','Buổi chiều','13:30–17:00']], 'morning'), 'Gửi giờ mong muốn', 'primary', 'callback-error');
    },
    rebook(el) {
      rebook(el.dataset.purpose, el.dataset.mode || null);
      if (el.dataset.date && s.draft && u.screen === 'C7') {
        s.draft.date = el.dataset.date;
        save();render();
      }
    },
    arrive() {
      if (s.offline) return error('OFFLINE');
      complete(M.transition(s, s.activeVisitId, 'arrived'), 'E3');
    },
    device() {
      dialog(
        'Chuẩn bị camera và âm thanh',
        'Bạn có thể kiểm tra trước khi vào phòng chờ. Camera chỉ bật khi bạn cho phép.',
        V.btn('Bật camera', 'device-camera') + V.btn('Nghe âm thanh', 'device-audio') +
          V.btn('Tiếp tục vào phòng chờ', 'device-ready', {}, 'primary') + V.btn(VI.common.cancel, 'close-dialog', {}, 'text'),
      );
      $('dialog-body').insertAdjacentHTML('beforeend','<video id="device-preview" autoplay muted playsinline hidden></video><p id="device-status" class="hint" role="status">Bạn có thể tiếp tục mà chưa bật camera.</p>');
    },
    async 'device-camera'() {
      const status=$('device-status');
      if(!navigator.mediaDevices?.getUserMedia){status.textContent='Trình duyệt chưa hỗ trợ camera. Bạn có thể đổi trình duyệt hoặc tiếp tục vào phòng chờ.';return;}
      try {
        const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
        if(!$('dialog').open || !$('device-preview') || $('device-status')!==status){stream.getTracks().forEach(t=>t.stop());return;}
        stopDevicePreview();deviceStream=stream;
        $('device-preview').srcObject=stream;$('device-preview').hidden=false;
        status.textContent='Camera đã bật. Bạn có thể kiểm tra hình ảnh trước khi tiếp tục.';
      } catch {
        if($('dialog').open && $('device-status')===status)status.textContent='Chưa bật được camera. Bạn có thể cấp quyền trong trình duyệt, thử lại hoặc tiếp tục vào phòng chờ.';
      }
    },
    async 'device-audio'() {
      const Audio=window.AudioContext || window.webkitAudioContext;
      if(!Audio){$('device-status').textContent='Bạn có thể kiểm tra loa bằng phần cài đặt âm thanh trên thiết bị.';return;}
      let context;
      try {
        context=new Audio();
        await context.resume();
        const tone=context.createOscillator(),volume=context.createGain();
        volume.gain.setValueAtTime(0.05,context.currentTime);
        tone.frequency.value=520;tone.connect(volume);volume.connect(context.destination);
        tone.start();tone.stop(context.currentTime+0.25);
        tone.onended=()=>context.close().catch(()=>{});
        if($('device-status'))$('device-status').textContent='Nếu nghe thấy âm báo, loa hoặc tai nghe của bạn đã sẵn sàng.';
      } catch {context?.close().catch(()=>{});if($('device-status'))$('device-status').textContent='Chưa phát được âm thanh. Bạn hãy kiểm tra âm lượng rồi thử lại.';}
    },
    'device-ready'() {
      stopDevicePreview();
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
      M.transition(s, v.id, 'online-wait', 'patient', 'connection-interrupted');
      go('G2');
      demo(VI.screen.G4.disconnect + ' ' + VI.demo.video);
    },
    callback() {
      if (s.offline) return error('OFFLINE');
      const v = M.visit(s);
      v.communication.callback = 'pending';
      save();
      demo();
      render();
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
          : 'Đã kết nối lại.',
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
        callNotes: {},
        callDrawerOpen: false,
      };
      demo(VI.demo.warning);
      go('A1', {}, true);
    },
    logout() {
      s.authenticated = false;
      u.forms = {};
      u.callNotes = {};
      u.callDrawerOpen = false;
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
      if(el.dataset.action!=='external-support')event.preventDefault();
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

  document.addEventListener('submit', (event) => {
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
      case 'profile': {
        const created = M.createProfile(s, get('name'), get('dob'));
        if (created.ok) Object.assign(created.profile, { phone: get('contactPhone'), medicalHistory: get('medicalHistory') });
        complete(created, 'B1');
        break;
      }
      case 'match': {
        const p = M.accountProfile(s);
        if (
          !get('name') ||
          !M.validDate(get('dob')) ||
          get('dob') > M.localDate()
        )
          return error('PROFILE', 'name');
        p.name = get('name');
        p.dob = get('dob');
        p.phone = get('contactPhone');
        p.medicalHistory = get('medicalHistory');
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
        s.draft.reason = withFeeling(get('reason'), get('feeling'));
        s.draft.medicalHistory = get('medicalHistory');
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
        // Commit the local request before navigation can replace this form.
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
          withFeeling(get('report'), get('symptomLevel')),
          data.has('urgent'),
        );
        u.urgentAftercare = data.has('urgent');
        complete(result, result.next);
        break;
      }
      case 'tracking':
        if (!get('tracking')) return error('REQUIRED', 'tracking');
        complete(M.submitCareUpdate(s, v.id, 'tracking', withFeeling(get('tracking'), get('dailyFeeling'))));
        break;
      case 'call-note':
        u.callNotes ??= {};
        u.callNotes[v.id] = get('callNote');
        complete({ok:true}, null, 'Đã lưu ghi chú riêng của bạn.');
        break;
      case 'callback-window': {
        const preferredWindow = get('Khung giờ thuận tiện');
        if (!['morning','afternoon'].includes(preferredWindow)) { $('callback-error').textContent = 'Chọn khung giờ thuận tiện để phòng khám liên hệ.'; return; }
        const request = s.requests.find(r => r.type === 'callback' && r.visitId === s.activeVisitId && r.status === 'waiting');
        if (request) request.preferredWindow = preferredWindow;
        save();$('dialog').close();render();
        dialog('Đã ghi nhận giờ mong muốn', 'Phòng khám sẽ sắp xếp liên hệ. Đây chưa phải giờ gọi đã xác nhận.');
        break;
      }
      case 'referral':
        if (!get('referral')) return error('REQUIRED', 'referral');
        complete(M.submitCareUpdate(s, v.id, 'referral', get('referral')), 'I5');
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
    () => {stopDevicePreview();lastFocus?.isConnected && lastFocus.focus();},
  );
  $('review-toggle').addEventListener('click', () => {
    if(guideEnabled){startJourney(u.journey.id,u.journey.variant);return;}
    const expanded =
      $('review-toggle').getAttribute('aria-expanded') === 'true';
    $('review-toggle').setAttribute('aria-expanded', String(!expanded));
    $('review-tools').hidden = expanded;
  });
  $('screen-picker').addEventListener('change', (e) => go(e.target.value));
  $('scenario').addEventListener('change', (e) => loadScenario(e.target.value));
  $('phone-content').addEventListener('change', (e) => {
    if (e.target.name === 'symptomLevel' && e.target.value === '3') {
      actions['care-urgent']();
      return;
    }
    if (e.target.id === 'date') updateDateSelection();
    if (e.target.closest('.patient-group') && e.target.type === 'radio') updatePatientAction();
    if (e.target.name === VI.screen.I1.visit) {
      s.activeVisitId = e.target.value;
      u.forms = {};
      go('I1', { visitId: s.activeVisitId });
    }
  });
  function updateDateSelection() {
    const value = $('date')?.value;
    $('phone-content').querySelectorAll('[data-action="quick-date"]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.date === value));
    });
  }
  function updatePatientAction() {
    const group = $('phone-content').querySelector('.patient-group');
    const selected = group?.querySelector('.choice input:checked')?.closest('.choice');
    const add = group?.querySelector('.add-relative-inline');
    if (selected && add) selected.after(add);
  }
  function updateCountdown() {
    const el = $('phone-content').querySelector('[data-countdown]');
    if (!el) return;
    const delta = Date.parse(el.dataset.countdown) - Date.now();
    if (!Number.isFinite(delta)) { el.textContent = 'Chờ xác nhận giờ hẹn'; return; }
    const minutes = Math.max(0, Math.ceil(delta / 60000));
    el.textContent = minutes === 0 ? 'Đã đến giờ hẹn' : minutes >= 1440 ? `${Math.floor(minutes/1440)} ngày ${Math.floor(minutes%1440/60)} giờ` : `${Math.floor(minutes/60)} giờ ${minutes%60} phút`;
  }
  setInterval(updateCountdown, 30000);
  document.addEventListener('toggle', event => {
    if (event.target.matches?.('.call-drawer')) { u.callDrawerOpen = event.target.open; save(); }
  }, true);
  let drawerGesture = null;
  document.addEventListener('pointerdown', event => {
    const handle = event.target.closest('.call-drawer > summary');
    if (handle) { drawerGesture = {handle, y:event.clientY}; handle.setPointerCapture(event.pointerId); }
  });
  document.addEventListener('pointerup', event => {
    if (!drawerGesture) return;
    const {handle,y} = drawerGesture;
    drawerGesture = null;
    if (Math.abs(event.clientY-y) < 24) return;
    handle.parentElement.open = event.clientY < y;
    handle.addEventListener('click', click => click.preventDefault(), {once:true});
  });
  document.addEventListener('pointercancel', () => { drawerGesture = null; });
  document.addEventListener('keydown', event => {
    const sheet = $('phone-content').querySelector('.route-sheet');
    if (!sheet || $('dialog').open) return;
    if (event.key === 'Escape') {
      event.preventDefault();go(u.screen === 'H3' ? 'H2' : 'D2');return;
    }
    if (event.key !== 'Tab') return;
    const targets = [...sheet.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea,select,summary,[href]')].filter(el=>el.getClientRects().length);
    const first = targets[0], last = targets.at(-1);
    if (event.shiftKey && (document.activeElement === first || !targets.includes(document.activeElement))) {event.preventDefault();last?.focus();}
    else if (!event.shiftKey && (document.activeElement === last || !targets.includes(document.activeElement))) {event.preventDefault();first?.focus();}
  });
  function loadScenario(name) {
    s = name === 'new' ? M.initial() : M.fixture(name);
    u = {
      ...u,
      inspection: true,
      journey: null,
      forms: {},
      otpSent: false,
      phone: '',
      deviceReady: false,
      labId: null,
      urgentAftercare: false,
      callNotes: {},
      callDrawerOpen: false,
    };
    if (name === 'returning') {
      s.authenticated = false;
      go('A1', {}, true);
    } else go(name === 'new' ? 'A1' : 'B1', {}, true);
    demo(VI.demo.warning);
  }
  window.addEventListener('hashchange', render);
  const params = new URLSearchParams(location.search);
  if(params.has('inspect'))u.inspection=true;
  guideEnabled = !params.has('scenario') && !params.has('inspect') && (params.has('journey') || !location.hash || !!u.journey || !u.inspection);
  if(guideEnabled && u.journey?.index===1 && ['F1','F2'].includes(u.journey.id) && !s.authenticated) u.otpSent=true;
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
    u.journey = null;
    u.inspection = true;
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
      $('presentation-bar').getBoundingClientRect().height;
    document.documentElement.style.setProperty('--presentation-height', height + 'px');
  });
  sizeObserver.observe($('presentation-bar'));
  document.querySelector('.journey-panel').hidden = !guideEnabled;
  document.body.classList.toggle('guided',guideEnabled);
  if(guideEnabled){$('review-toggle').textContent='Bắt đầu lại';$('review-toggle').setAttribute('aria-controls','journey-list');}
  if(guideEnabled && !u.journey && restoredSession && !params.has('journey')){restoreJourney();render();}
  else if(guideEnabled && (!u.journey || (params.has('journey') && params.get('journey')!==u.journey.id) || (params.has('branch') && params.get('branch')!==u.journey.variant))) startJourney(params.get('journey') || 'F1',params.get('branch'));
  else render();
})();
