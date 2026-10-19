/* Shared presentation contract. Clinical state and permissions stay in each model. */
(function (root) {
  'use strict';
  const copy = root.CareFlowCopy;
  const tones = {
    pending: 'warning', 'mode-review': 'warning', confirmed: 'info',
    'pre-lab': 'info', reminder: 'success', arrived: 'info', received: 'info',
    ready: 'success', 'in-consult': 'info', 'online-wait': 'info', calling: 'info',
    unreachable: 'warning', completed: 'success', cancelled: 'neutral', 'no-show': 'neutral',
  };
  function status(value, domain = 'visit') {
    if (domain === 'result') {
      const key = { ready: 'awaiting-review', waiting: 'scheduled' }[value] || value;
      return { label: copy.labs[key] || 'Chưa có thông tin', tone: key === 'reviewed' ? 'success' : key === 'awaiting-review' ? 'warning' : 'neutral' };
    }
    const key = value === 'review' ? 'mode-review' : value;
    return { label: copy.statuses[key]?.[0] || 'Chưa có thông tin', tone: tones[key] || 'neutral' };
  }
  function buttonAttrs(variant = 'secondary', size = 'md') {
    const names = variant.split(/\s+/);
    const resolved = names.some(n => ['danger', 'danger-text', 'btn-danger', 'cancel-visit'].includes(n)) ? 'danger'
      : names.some(n => ['inverse', 'btn-hero'].includes(n)) ? 'inverse'
      : names.some(n => ['primary', 'btn-primary'].includes(n)) ? 'primary'
      : names.some(n => ['text', 'btn-text', 'link'].includes(n)) ? 'text' : 'secondary';
    return `data-cf-component="button" data-cf-variant="${resolved}" data-cf-size="${size === 'lg' ? 'lg' : 'md'}"`;
  }
  function modeText(value) {
    if (value === 'online' || /online|trực tuyến/i.test(value)) return copy.common.online;
    if (value === 'onsite' || /tại phòng khám|trực tiếp/i.test(value)) return copy.common.onsite;
    return value || copy.common.notProvided;
  }
  function facts(items, escape, classes = 'details') {
    return `<dl class="${classes}" data-cf-component="facts">${items.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>`;
  }
  const cardVariants = ['surface', 'tonal', 'row', 'section', 'media'];
  function cardAttrs(variant = 'surface') {
    return `data-cf-card="${cardVariants.includes(variant) ? variant : 'surface'}"`;
  }
  // Content is trusted renderer markup. Plain text must be escaped by the caller.
  function card(content, classes = '', variant = 'surface') {
    const safeClasses = classes.replace(/[^a-zA-Z0-9_ -]/g, '');
    return `<section class="card ${safeClasses}" ${cardAttrs(variant)}>${content}</section>`;
  }
  const escapeText = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const icon = (name, size = 20) => root.CareFlowIcon(name, size).replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
  function actionButton(label, options = {}) {
    const { variant = 'secondary', icon: symbol, action, to, disabled = false, busy = false, pressed } = options;
    return `<button type="button" ${buttonAttrs(variant)}${action ? ` data-action="${escapeText(action)}"` : ''}${to ? ` data-to="${escapeText(to)}"` : ''}${typeof pressed === 'boolean' ? ` aria-pressed="${pressed}"` : ''}${disabled || busy ? ' disabled' : ''}${busy ? ' aria-busy="true"' : ''}>${symbol ? icon(symbol) : ''}<span>${escapeText(label)}</span></button>`;
  }
  function badge(value, domain = 'visit') {
    const state = status(value, domain);
    const tone = domain === 'visit' && value === 'cancelled' ? 'danger' : state.tone;
    const symbol = value === 'completed' ? 'document-check' : value === 'confirmed' || tone === 'success' ? 'check-circle' : tone === 'warning' ? 'clock' : tone === 'danger' ? 'cross' : 'info';
    return `<span data-cf-component="status" data-cf-tone="${tone}">${icon(symbol,16)}${escapeText(state.label)}</span>`;
  }
  function header({ title, subtitle = '', unread = 0 }) {
    return `<header class="cf-screen-header"><div>${subtitle ? `<p>${escapeText(subtitle)}</p>` : ''}<h1>${escapeText(title)}</h1></div><button type="button" class="cf-icon-button" data-action="go" data-to="K1" aria-label="Thông báo${unread > 0 ? `, ${Number(unread)} chưa đọc` : ''}">${icon('bell',22)}${unread > 0 ? `<span class="cf-unread" aria-hidden="true">${Number(unread)}</span>` : ''}</button></header>`;
  }
  function sectionHeader(title, { label = 'Xem tất cả', action, to, href } = {}) {
    const destination = href || (to && root.CareFlowModel?.SCREENS.find(screen=>screen.id===to)?.route);
    const link = destination ? `<a class="cf-section-link" href="${escapeText(href || '#'+destination)}"${action ? ` data-action="${escapeText(action)}"` : ''}${to ? ` data-to="${escapeText(to)}"` : ''}>${escapeText(label)}${icon('arrow-right',16)}</a>` : action ? `<button type="button" class="cf-section-link" data-action="${escapeText(action)}">${escapeText(label)}${icon('arrow-right',16)}</button>` : '';
    return `<div class="cf-section-header"><h2>${escapeText(title)}</h2>${link}</div>`;
  }
  function appointmentUpdateCount(state) {
    const visits = new Set(state.visits.map(visit=>visit.id));
    return new Set(state.notifications.filter(item=>!item.read && item.screen==='D2' && visits.has(item.visitId)).map(item=>item.visitId)).size;
  }
  function navigation(current = 'B1', { unread = 0, routeFor, contentOnly = false } = {}) {
    const tabs = [['B1','Trang chủ','home','/home'],['D1','Lịch hẹn','calendar','/appointments'],['C1','Đặt lịch','plus','/book/patient'],['K2','Hồ sơ','user','/profile'],['K5','Hỗ trợ','headphones','/support']];
    const items=tabs.map(([id,label,symbol,route]) => {
      if(id==='C1') return `<button type="button" class="cf-nav-item cf-nav-book nav-book" data-action="book-nav" aria-label="Đặt lịch"${current===id?' aria-current="step"':''}><span class="cf-nav-symbol nav-plus">${icon(symbol,24)}</span></button>`;
      const active=id===current, badge=id==='D1' && unread>0;
      return `<a class="cf-nav-item" href="#${escapeText(routeFor ? routeFor(id) : route)}" data-to="${id}" aria-label="${label}"${active?' aria-current="page"':''}${badge?' aria-describedby="cf-appointment-update-description"':''}><span class="cf-nav-symbol" data-cf-icon-style="${active?'filled':'outline'}">${icon(active?symbol+'-filled':symbol,24)}${badge?`<span class="cf-nav-badge" aria-hidden="true">${unread>99?'99+':unread}</span>`:''}</span><span class="cf-nav-label nav-caption">${label}</span>${badge?`<span class="cf-visually-hidden" id="cf-appointment-update-description">${unread} lịch hẹn có cập nhật chưa đọc</span>`:''}</a>`;
    });
    const background='<svg class="cf-nav-background" viewBox="0 0 390 88" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 24 Q0 0 24 0 H139 C153 0 157 6 160 18 C165 38 177 48 195 48 C213 48 225 38 230 18 C233 6 237 0 251 0 H366 Q390 0 390 24 V64 Q390 88 366 88 H24 Q0 88 0 64 Z"/></svg>';
    const contents=`${background}<div class="cf-nav-side">${items.slice(0,2).join('')}</div>${items[2]}<div class="cf-nav-side">${items.slice(3).join('')}</div>`;
    return contentOnly ? contents : `<nav class="cf-tab-bar" data-cf-component="navigation" aria-label="Điều hướng chính">${contents}</nav>`;
  }
  function tabs(items, selected, id) {
    const safeId = escapeText(id);
    return `<div class="cf-tabs" role="tablist" aria-label="Lọc lịch hẹn">${items.map(([value,label]) => `<button type="button" role="tab" data-cf-component="tab" id="${safeId}-${escapeText(value)}" data-value="${escapeText(value)}" aria-controls="${safeId}-panel" aria-selected="${value === selected}" tabindex="${value === selected ? 0 : -1}">${escapeText(label)}</button>`).join('')}</div>`;
  }
  function stepper(current) {
    const labels = ['Hồ sơ','Bệnh','Nơi khám','Kiểm tra'];
    const full = ['Chọn hồ sơ','Thông tin bệnh và dị ứng','Chọn nơi khám','Kiểm tra ngày giờ và gửi yêu cầu'];
    return `<ol class="cf-stepper" aria-label="Tiến trình đặt lịch">${labels.map((label,i) => `<li${i === current ? ' aria-current="step"' : ''} data-complete="${i < current}"><span aria-hidden="true">${i < current ? icon('check',16) : i+1}</span><span class="cf-step-label" aria-label="${escapeText(full[i])}">${label}</span></li>`).join('')}</ol>`;
  }
  // Decorative SVG, drawn with the same semantic tokens as the surrounding UI.
  // Never represents a named clinician, clinic, clinical result or live availability.
  function illustration(kind = 'calendar') {
    const drawings = {
      calendar: '<rect x="43" y="38" width="114" height="108" rx="16" class="cf-art-paper"/><path d="M43 71h114M71 29v20m58-20v20" class="cf-art-line"/><rect x="59" y="86" width="25" height="24" rx="6" class="cf-art-blue"/><rect x="96" y="86" width="25" height="24" rx="6" class="cf-art-green"/><path d="M61 125h38" class="cf-art-line"/><circle cx="143" cy="137" r="24" class="cf-art-seal"/><path d="m132 137 7 7 15-18" class="cf-art-line"/>',
      clinic: '<rect x="42" y="56" width="116" height="91" rx="14" class="cf-art-paper"/><rect x="69" y="29" width="62" height="57" rx="14" class="cf-art-blue"/><path d="M100 41v32M84 57h32M59 107h14m54 0h14M89 146v-37h22v37" class="cf-art-line"/><path d="M31 148h138" class="cf-art-line"/>',
      support: '<path d="M41 39h110a14 14 0 0 1 14 14v59a14 14 0 0 1-14 14H84l-29 19v-19H41a14 14 0 0 1-14-14V53a14 14 0 0 1 14-14Z" class="cf-art-paper"/><path d="M54 66h76M54 86h52" class="cf-art-line"/><rect x="106" y="105" width="58" height="42" rx="14" class="cf-art-seal"/><circle cx="122" cy="126" r="3" class="cf-art-ink"/><circle cx="136" cy="126" r="3" class="cf-art-ink"/><circle cx="150" cy="126" r="3" class="cf-art-ink"/>',
      profile: '<rect x="43" y="30" width="114" height="120" rx="18" class="cf-art-paper"/><circle cx="100" cy="72" r="21" class="cf-art-blue"/><path d="M72 129c0-36 56-36 56 0" class="cf-art-green"/><path d="M84 69q16-15 32 0M72 130h56" class="cf-art-line"/>',
      result: '<path d="M44 44h45l14 14h49a13 13 0 0 1 13 13v64a13 13 0 0 1-13 13H44a13 13 0 0 1-13-13V57a13 13 0 0 1 13-13Z" class="cf-art-paper"/><path d="M54 84h62M54 103h38" class="cf-art-line"/><circle cx="142" cy="134" r="25" class="cf-art-seal"/><path d="m131 134 8 8 15-18" class="cf-art-line"/>',
    };
    return `<div class="cf-illustration-slot" data-cf-art-kind="${escapeText(drawings[kind] ? kind : 'calendar')}"><svg class="cf-illustration" viewBox="0 0 200 180" fill="none" aria-hidden="true" focusable="false"><rect x="12" y="12" width="176" height="156" rx="28" class="cf-art-backdrop"/>${drawings[kind] || drawings.calendar}</svg></div>`;
  }
  function profileSummary(profiles) {
    const avatars=profiles.slice(0,2).map(profile=>`<span class="cf-profile-avatar"><span class="cf-avatar-initials">${escapeText(profile.name.trim().split(/\s+/).slice(-2).map(word=>word[0]).join(''))}</span></span>`).join('');
    return `<div class="cf-profile-summary"><div class="cf-avatar-stack" aria-hidden="true">${avatars}</div><strong>${profiles.length} hồ sơ</strong></div>`;
  }
  function emergencyCard({compact = false} = {}) {
    if (compact) return `<aside class="cf-emergency-card cf-emergency-compact" aria-label="Cần trợ giúp khẩn cấp?"><div class="cf-emergency-heading">${icon('warning',20)}<div><h2>Cần trợ giúp khẩn cấp?</h2><p>Đừng chờ phản hồi qua ứng dụng.</p></div></div><a class="btn primary" href="tel:115" ${buttonAttrs('primary')}>${icon('phone',18)}<span>Gọi 115</span></a></aside>`;
    return `<aside class="cf-emergency-card" aria-label="Cần trợ giúp khẩn cấp?"><div class="cf-emergency-heading">${icon('warning',24)}<h2>Cần trợ giúp khẩn cấp?</h2></div><p>Gọi 115 hoặc đến cơ sở y tế gần nhất; đừng chờ phản hồi qua ứng dụng.</p><a class="btn" href="tel:115" data-cf-component="button" data-cf-variant="danger">${icon('phone',20)}<span>Gọi 115</span>${icon('arrow-right',20)}</a></aside>`;
  }
  // Enhance the existing form controls; values, validation and FormData stay owned
  // by their original inputs. The app supplies its existing modal/focus lifecycle.
  function enhanceControls(container, openSheet) {
    for (const field of container.querySelectorAll('textarea')) {
      if (field.dataset.cfCounter) continue;
      field.dataset.cfCounter = 'true';
      const count = document.createElement('small');
      count.id = field.id + '-count';
      count.className = 'cf-character-count';
      field.after(count);
      field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), count.id].filter(Boolean).join(' '));
      const update = () => { count.textContent = field.value.length + (field.maxLength > 0 ? ' / ' + field.maxLength : '') + ' ký tự'; };
      field.addEventListener('input', update);
      update();
    }
    for (const field of container.querySelectorAll('input[type=date],input[type=time],input[type=file],select')) {
      if (field.dataset.cfEnhanced) continue;
      field.dataset.cfEnhanced = 'true';
      const kind = field.getAttribute('type') || field.type;
      const label = container.querySelector(`label[for="${field.id}"]`);
      const title = label?.textContent.trim() || 'Chọn thông tin';
      const button = document.createElement('button');
      button.type = 'button';
      button.id = field.id + '-control';
      button.className = 'cf-field-control';
      button.dataset.cfControl = field.id;
      button.setAttribute('aria-haspopup', kind === 'file' ? 'false' : 'dialog');
      field.classList.add('cf-native-value');
      field.tabIndex = -1;
      field.setAttribute('aria-hidden', 'true');
      field.after(button);
      if (label) label.htmlFor = button.id;
      const update = () => {
        const value = field.tagName === 'SELECT' ? field.selectedOptions[0]?.textContent : kind === 'date' ? field.value.split('-').reverse().join('/') : kind === 'file' ? field.files[0]?.name : field.value;
        const symbol = kind === 'file' ? 'document' : kind === 'date' ? 'calendar' : kind === 'time' ? 'clock' : 'chevron-down';
        button.innerHTML = `<span>${escapeText(value || (kind === 'file' ? 'Chọn tệp kết quả' : 'Chọn ' + title.toLocaleLowerCase('vi-VN')))}</span>${icon(symbol,20)}`;
        button.setAttribute('aria-label', title + ': ' + (value || 'Chưa chọn'));
        button.disabled = field.disabled;
        if (!field.hasAttribute('aria-invalid')) { button.removeAttribute('aria-invalid'); button.removeAttribute('aria-describedby'); }
      };
      const commit = value => {
        field.value = value;
        field.dispatchEvent(new Event('input', {bubbles:true}));
        field.dispatchEvent(new Event('change', {bubbles:true}));
        update();
      };
      field.addEventListener('change', update);
      field.addEventListener('input', update);
      update();
      button.addEventListener('click', () => {
        if (kind === 'file') { field.click(); return; }
        const sheet = openSheet(title, button);
        const close = () => sheet.closest('dialog').close();
        if (field.tagName === 'SELECT') {
          sheet.innerHTML = `<div class="cf-sheet-options" role="listbox" aria-label="${escapeText(title)}">${[...field.options].map((option,i)=>`<button type="button" role="option" data-option="${i}" aria-selected="${option.selected}"${option.disabled?' disabled':''}><span>${escapeText(option.textContent)}</span>${option.selected?icon('check',20):''}</button>`).join('')}</div>`;
          sheet.querySelectorAll('[data-option]').forEach(option=>option.onclick=()=>{commit(field.options[Number(option.dataset.option)].value);close();});
          sheet.querySelector('[aria-selected="true"]')?.focus();
          sheet.onkeydown = event => {
            if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
            event.preventDefault();
            const options = [...sheet.querySelectorAll('[data-option]:not(:disabled)')], index = options.indexOf(document.activeElement);
            options[event.key==='Home'?0:event.key==='End'?options.length-1:(index+(event.key==='ArrowDown'?1:options.length-1))%options.length]?.focus();
          };
          return;
        }
        if (kind === 'time') {
          let [hour,minute] = (field.value || '09:00').split(':');
          const list = (name,total,current) => `<div><h3>${name==='hour'?'Giờ':'Phút'}</h3><div class="cf-time-options" role="listbox" aria-label="${name==='hour'?'Giờ':'Phút'}">${Array.from({length:total},(_,i)=>String(i).padStart(2,'0')).map(value=>`<button type="button" data-${name}="${value}" role="option" aria-selected="${value===current}">${value}</button>`).join('')}</div></div>`;
          sheet.innerHTML = `<div class="cf-time-picker">${list('hour',24,hour)}${list('minute',60,minute)}</div><button type="button" class="btn primary" data-time-done ${buttonAttrs('primary')}>Chọn giờ ${icon('check',20)}</button>`;
          sheet.querySelectorAll('[data-hour],[data-minute]').forEach(option=>option.onclick=()=>{
            if (option.dataset.hour) hour=option.dataset.hour; else minute=option.dataset.minute;
            for (const item of option.parentElement.children) item.setAttribute('aria-selected',String(item===option));
          });
          sheet.querySelector('[data-time-done]').onclick=()=>{commit(hour+':'+minute);close();};
          sheet.querySelectorAll('[aria-selected="true"]').forEach(el=>el.scrollIntoView({block:'center'}));
          return;
        }
        const today = new Date();
        const initial = field.value || (field.max && field.max < today.toISOString().slice(0,10) ? field.max : `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`);
        let year=Number(initial.slice(0,4)), month=Number(initial.slice(5,7))-1, mode='days';
        const iso = (y,m,d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const allowed = value => (!field.min || value >= field.min) && (!field.max || value <= field.max);
        function draw() {
          const heading = `<div class="cf-calendar-heading"><button type="button" data-calendar-prev aria-label="${mode==='years'?'12 năm trước':mode==='months'?'Năm trước':'Tháng trước'}">${icon('chevron-left',20)}</button><button type="button" data-calendar-month>Tháng ${month+1}</button><button type="button" data-calendar-year>${year}</button><button type="button" data-calendar-next aria-label="${mode==='years'?'12 năm sau':mode==='months'?'Năm sau':'Tháng sau'}">${icon('chevron-right',20)}</button></div>`;
          let body;
          if (mode === 'years') {
            body=`<div class="cf-calendar-periods" aria-label="Chọn năm">${Array.from({length:12},(_,i)=>year-5+i).map(value=>`<button type="button" data-year="${value}"${field.min&&value<Number(field.min.slice(0,4))||field.max&&value>Number(field.max.slice(0,4))?' disabled':''}>${value}</button>`).join('')}</div>`;
          } else if (mode === 'months') {
            body=`<div class="cf-calendar-periods" aria-label="Chọn tháng">${Array.from({length:12},(_,i)=>`<button type="button" data-month="${i}"${field.min&&iso(year,i,31)<field.min||field.max&&iso(year,i,1)>field.max?' disabled':''}>Tháng ${i+1}</button>`).join('')}</div>`;
          } else {
            const offset=(new Date(year,month,1).getDay()+6)%7, days=new Date(year,month+1,0).getDate();
            body=`<div class="cf-calendar-week" aria-hidden="true">${['T2','T3','T4','T5','T6','T7','CN'].map(day=>`<span>${day}</span>`).join('')}</div><div class="cf-calendar-days" role="group" aria-label="Tháng ${month+1} năm ${year}">${'<span></span>'.repeat(offset)}${Array.from({length:days},(_,i)=>{const value=iso(year,month,i+1);return `<button type="button" data-date-value="${value}" aria-label="${i+1}/${month+1}/${year}" aria-pressed="${value===field.value}"${allowed(value)?'':' disabled'}>${i+1}</button>`;}).join('')}</div>`;
          }
          sheet.innerHTML = heading + body + '<p class="cf-calendar-hint">Chọn tháng hoặc năm để chuyển nhanh.</p>';
          sheet.querySelector('[data-calendar-month]').onclick=()=>{mode='months';draw();sheet.querySelector('[data-month]:not(:disabled)')?.focus();};
          sheet.querySelector('[data-calendar-year]').onclick=()=>{mode='years';draw();sheet.querySelector('[data-year]:not(:disabled)')?.focus();};
          const turn = direction => {if(mode==='days'){const date=new Date(year,month+direction,1);year=date.getFullYear();month=date.getMonth();}else year+=direction*(mode==='years'?12:1);draw();sheet.querySelector(direction>0?'[data-calendar-next]':'[data-calendar-prev]').focus();};
          sheet.querySelector('[data-calendar-prev]').onclick=()=>turn(-1);
          sheet.querySelector('[data-calendar-next]').onclick=()=>turn(1);
          sheet.querySelectorAll('[data-year]').forEach(el=>el.onclick=()=>{year=Number(el.dataset.year);mode='months';draw();sheet.querySelector('[data-month]:not(:disabled)')?.focus();});
          sheet.querySelectorAll('[data-month]').forEach(el=>el.onclick=()=>{month=Number(el.dataset.month);mode='days';draw();sheet.querySelector('[data-date-value]:not(:disabled)')?.focus();});
          sheet.querySelectorAll('[data-date-value]').forEach(el=>el.onclick=()=>{commit(el.dataset.dateValue);close();});
        }
        draw();
        sheet.querySelector('[aria-pressed="true"],[data-date-value]:not(:disabled)')?.focus();
        sheet.onkeydown = event => {
          if (!event.target.matches('[data-date-value]') || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
          event.preventDefault();
          const dates=[...sheet.querySelectorAll('[data-date-value]')], index=dates.indexOf(event.target), change={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-index%7,End:6-index%7}[event.key];
          const target=dates[index+change]; if(target&&!target.disabled)target.focus();
        };
      });
    }
  }
  // A page has one strongest action. Collection rows remain actionable secondary
  // controls; the navigation FAB and modal dialog have their own interaction scope.
  function applyActionHierarchy(container) {
    if (!container) return;
    const buttons = [...container.querySelectorAll('.btn[data-cf-component="button"]')];
    for (const button of buttons) {
      // Journey presentation may have changed the legacy class after rendering.
      const attributes = buttonAttrs(button.className);
      button.dataset.cfVariant = attributes.match(/data-cf-variant="([^"]+)"/)[1];
      if (button.disabled && !button.closest('[aria-busy="true"]') && !button.querySelector('svg')) {
        button.insertAdjacentHTML('afterbegin', icon('lock',16));
      }
    }
    const primary = buttons.filter(button=>button.dataset.cfVariant==='primary');
    const preferred = primary.find(button=>button.matches('form [type="submit"]')) || primary[0];
    for (const button of primary) {
      if (button === preferred) continue;
      button.classList.remove('primary','btn-primary');
      button.classList.add('secondary');
      button.dataset.cfVariant='secondary';
    }
  }
  root.CareFlowUI = { status, buttonAttrs, modeText, facts, cardAttrs, card, actionButton, badge, header, sectionHeader, navigation, tabs, stepper, illustration, profileSummary, appointmentUpdateCount, applyActionHierarchy, enhanceControls, emergencyCard };
})(typeof window !== 'undefined' ? window : globalThis);
