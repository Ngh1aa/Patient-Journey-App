/* Review harness only. Product state and clinical guards are never loaded/mutated. */
(function () {
  'use strict';
  if(new URLSearchParams(location.search).get('view')==='headers') {
    renderHeaderStudy();
    return;
  }
  const UI = window.CareFlowUI, M = window.CareFlowModel;
  const s = M.fixture('upcoming'), visit = M.visit(s);
  const escape = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const button = UI.actionButton;
  const framed = (label, header, content) => `<section class="cf-review-column" aria-label="${label}"><p class="cf-review-label">${label}</p><div class="cf-review-frame">${header}<div class="cf-review-content">${content}</div></div></section>`;
  const date = new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(visit.date+'T12:00:00+07:00'));
  const hero = `<section data-cf-card="surface" data-cf-mesh="hero" aria-labelledby="appointment-heading"><div class="cf-split"><div class="cf-stack"><small>Lịch hẹn tiếp theo</small><h2 id="appointment-heading">Sẵn sàng cho buổi khám</h2>${UI.badge(visit.status)}</div>${UI.illustration('calendar')}</div>${UI.facts([['Ngày khám',date],['Giờ khám',visit.slot]],escape)}<div class="cf-card-footer"><small>${escape(visit.id)}</small>${button('Xem phiếu',{variant:'primary',icon:'arrow-right',action:'preview-ticket'})}</div></section>`;
  const bento = `<div class="cf-bento"><section data-cf-card="surface" class="cf-profile-card" aria-labelledby="profile-heading"><h3 id="profile-heading">Hồ sơ đã lưu</h3>${UI.profileSummary(s.profiles)}<details class="cf-profile-details"><summary>Xem hồ sơ ${window.CareFlowIcon('chevron-right',16)}</summary><ul>${s.profiles.map(profile=>`<li>${escape(profile.name)}</li>`).join('')}</ul></details></section><section data-cf-card="surface" class="cf-question-card" aria-labelledby="support-heading"><h3 id="support-heading">Hỏi phòng khám</h3><p class="cf-secondary">Bạn cần biết gì?</p>${button('Giấy tờ',{icon:'document',action:'preview-question-documents'})}${button('Đổi giờ',{icon:'calendar',action:'preview-question-reschedule'})}</section><section id="quick-question" data-cf-card="surface" class="cf-wide cf-question-form" hidden><label for="question-draft">Câu hỏi của bạn</label><textarea id="question-draft" rows="3" aria-describedby="question-note"></textarea><small id="question-note" class="cf-secondary">Bản soạn thử, chưa gửi đến phòng khám.</small><div class="cf-inline">${button('Xem trước',{icon:'message-circle',action:'preview-question-review'})}${button('Đóng',{action:'preview-question-close'})}</div><p id="question-preview" class="cf-question-preview" hidden></p></section></div>`;
  const feature = `<section data-cf-card="surface" data-cf-mesh="feature" aria-labelledby="clinic-heading"><div class="cf-guide-heading">${UI.illustration('clinic')}<div class="cf-stack"><small>Chuẩn bị đi khám</small><h3 id="clinic-heading">Hai việc trước buổi khám</h3></div></div><div class="cf-guide-checks"><label><input type="checkbox" name="preview-preparation" value="details"><span>Xem lại ngày giờ</span></label><label><input type="checkbox" name="preview-preparation" value="documents"><span>Chuẩn bị giấy tờ</span></label></div><p class="cf-guide-note">Đánh dấu để tự nhắc, không gửi phòng khám.</p></section>`;
  const column1 = framed('01 · Thẻ, bố cục và minh họa', UI.header({title:'Thẻ và tiện ích',subtitle:'Một thẻ, một vai trò',unread:s.notifications.filter(n=>!n.read).length}), `${hero}${UI.sectionHeader('Thông tin của bạn',{to:'K2'})}${bento}${feature}`);
  const column2 = framed('02 · Tab, tiến trình và điều hướng', UI.header({title:'Các bước rõ ràng',subtitle:'Cùng một hệ chữ và khoảng cách'}), `
    <section data-cf-card="surface" class="cf-stack"><h2>Nhóm lịch hẹn</h2>${UI.tabs([['upcoming','Sắp tới'],['completed','Đã khám'],['cancelled','Đã hủy']],'upcoming','visit-tabs')}<div role="tabpanel" id="visit-tabs-panel" aria-labelledby="visit-tabs-upcoming" tabindex="0" class="cf-stack">${UI.badge('pending')}<p data-tab-copy>Lịch hẹn đang chờ phòng khám xác nhận.</p></div></section>
    <section data-cf-card="surface" data-cf-specimen="booking-progress" class="cf-stack"><h2>Đặt lịch, 4 bước</h2><div id="stepper-preview">${UI.stepper(0)}</div><p id="step-copy" class="cf-secondary" aria-live="polite">Chọn hồ sơ người đi khám.</p><div class="cf-inline">${button('Quay lại',{action:'preview-step-back',disabled:true,icon:'chevron-left'})}${button('Tiếp theo',{action:'preview-step-next',variant:'primary',icon:'arrow-right'})}</div></section>
    <section data-cf-card="surface"><h2>Nút và trạng thái</h2><div class="cf-button-examples">
      <figure data-cf-specimen="button-default" id="primary-button-preview">${button('Tiếp tục',{variant:'primary',icon:'arrow-right',action:'preview-primary'})}<figcaption>Mặc định</figcaption></figure>
      <figure data-cf-specimen="button-loading" id="loading-button-example">${button('Đang gửi yêu cầu',{variant:'primary',busy:true})}<figcaption>Đang tải</figcaption></figure>
      <figure data-cf-specimen="button-locked">${button('Chưa thể tiếp tục',{disabled:true,icon:'lock'})}<figcaption>Chưa đủ thông tin</figcaption></figure>
    </div><div class="cf-inline">${button('Đổi lịch',{icon:'calendar',action:'preview-secondary'})}${button('Đăng xuất',{variant:'danger',icon:'log-out',action:'preview-logout'})}</div></section>
    ${UI.sectionHeader('Thanh điều hướng')}${UI.navigation('B1',{unread:UI.appointmentUpdateCount(s)})}<p class="cf-secondary">Lịch hẹn mở danh sách. Nút + bắt đầu đặt lịch mới.</p><p id="preview-feedback" class="cf-review-feedback" role="status" aria-live="polite">Chọn một thành phần để thử phản hồi.</p>`);
  const column3 = framed('03 · Rỗng, đang tải, lỗi và trạng thái', UI.header({title:'Luôn có bước tiếp',subtitle:'Trạng thái rõ, hành động phù hợp'}), `<div class="cf-state-controls" role="group" aria-label="Đổi trạng thái mẫu">${['empty','loading','error','ready'].map((state,i)=>`<button type="button" ${UI.buttonAttrs()} data-preview-state="${state}" aria-pressed="${i===0}">${['Rỗng','Đang tải','Lỗi','Có dữ liệu'][i]}</button>`).join('')}</div><div id="state-preview" aria-live="polite"></div><section data-cf-card="surface"><h2>Trạng thái có ý nghĩa</h2><p class="cf-secondary">Nhãn và icon đi cùng màu. Nội dung lấy từ trạng thái trong model.</p><div class="cf-stack">${['confirmed','pending','cancelled','completed'].map(value=>UI.badge(value)).join('')}</div></section><section data-cf-card="surface" data-cf-mesh="result"><div class="cf-split"><div class="cf-stack"><small>Mẫu thẻ hoàn thành</small><h3>Lời dặn sau khám</h3><p>Xem lại thông tin đã được lưu từ buổi khám.</p></div>${UI.illustration('result')}</div>${button('Xem thông tin',{icon:'document',action:'preview-result'})}</section>`);
  document.getElementById('component-preview').innerHTML = column1 + column2 + column3;
  document.getElementById('review-accessibility').innerHTML = button('Chữ 200%',{icon:'search',action:'preview-large',pressed:false});
  const fontRoles = ['page-title-font','title-font','card-title-font','number-font','body-font','caption-font','label-font','status-font','control-font'];
  const fontSizes = Object.fromEntries(fontRoles.map(role=>[role,parseFloat(getComputedStyle(document.body).getPropertyValue('--cf-'+role))]));
  let currentStep = 0;
  function renderState(state) {
    const states = {
      empty: `<section data-cf-card="surface" data-cf-state="empty" class="cf-state-box"><div class="cf-empty-art">${UI.illustration('calendar')}</div><h2>Chưa có lịch hẹn sắp tới</h2><p class="cf-secondary">Chọn thời gian phù hợp để bắt đầu.</p>${button('Chọn lịch khám',{variant:'primary',icon:'plus',action:'preview-book'})}</section>`,
      loading: `<section data-cf-card="surface" data-cf-state="loading" class="cf-state-box" aria-busy="true"><h2>Đang tải lịch hẹn</h2><p class="cf-secondary">Thông tin sẽ hiện khi tải xong.</p><div class="cf-loading-lines" aria-hidden="true"><span></span><span></span><span></span></div>${button('Đang tải',{variant:'primary',busy:true})}</section>`,
      error: `<section data-cf-card="surface" data-cf-state="error" class="cf-state-box"><h2>Chưa tải được lịch hẹn</h2><p class="cf-error-copy">Kiểm tra kết nối rồi thử lại. Thông tin đã lưu vẫn được giữ.</p>${button('Thử lại',{icon:'refresh',variant:'primary',action:'preview-retry'})}</section>`,
      ready: `<section data-cf-card="surface" data-cf-state="ready" class="cf-state-box"><h2>Lịch hẹn của bạn</h2>${UI.badge(visit.status)}${UI.facts([['Ngày khám',date],['Giờ khám',visit.slot]],escape)}${button('Xem phiếu',{icon:'arrow-right',variant:'primary',action:'preview-ticket'})}</section>`,
    };
    document.getElementById('state-preview').innerHTML = states[state] || states.empty;
    document.querySelectorAll('[data-preview-state]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.previewState === state)));
  }
  renderState('empty');
  function selectTab(tab, focus = false) {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    tabs.forEach(el=>{el.setAttribute('aria-selected',String(el === tab));el.tabIndex=el === tab ? 0 : -1;});
    const options = {upcoming:['pending','Lịch hẹn đang chờ phòng khám xác nhận.'],completed:['completed','Xem lại thông tin buổi khám đã hoàn tất.'],cancelled:['cancelled','Lịch đã hủy được lưu để bạn tra cứu.']};
    const [status,copy] = options[tab.dataset.value];
    const panel = document.getElementById('visit-tabs-panel');
    panel.setAttribute('aria-labelledby',tab.id);
    panel.innerHTML = `${UI.badge(status)}<p data-tab-copy>${copy}</p>`;
    if (focus) tab.focus();
  }
  document.addEventListener('keydown',event=>{
    const tab = event.target.closest('[role="tab"]');
    if (!tab || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...tab.parentElement.querySelectorAll('[role="tab"]')], index = tabs.indexOf(tab);
    selectTab(tabs[event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length)%tabs.length],true);
  });
  document.addEventListener('click',event=>{
    const target = event.target.closest('button,a');
    if (!target || target.disabled) return;
    if (target.dataset.action?.startsWith('preview-question-')) {
      const panel=document.getElementById('quick-question'),input=document.getElementById('question-draft'),output=document.getElementById('question-preview');
      if (target.dataset.action==='preview-question-close') { panel.hidden=true;document.querySelector('[data-action="preview-question-documents"]').focus();return; }
      if (target.dataset.action==='preview-question-review') { output.textContent=input.value.trim() || 'Bạn chưa nhập câu hỏi.';output.hidden=false;return; }
      panel.hidden=false;output.hidden=true;
      input.value=target.dataset.action.endsWith('documents') ? 'Tôi cần mang giấy tờ gì khi đến khám?' : 'Tôi muốn đổi giờ khám thì cần làm gì?';input.focus();
      return;
    }
    if (target.dataset.action === 'preview-large') {
      const large = !document.body.hasAttribute('data-cf-large-text');
      document.body.toggleAttribute('data-cf-large-text',large);
      target.setAttribute('aria-pressed',String(large));
      fontRoles.forEach(role=>document.body.style.setProperty('--cf-'+role,`${fontSizes[role]*(large ? 2 : 1)}px`));
      return;
    }
    if (target.dataset.previewState) return renderState(target.dataset.previewState);
    if (target.matches('[role="tab"]')) return selectTab(target);
    if (target.dataset.action?.startsWith('preview-step-')) {
      currentStep = Math.max(0,Math.min(3,currentStep+(target.dataset.action.endsWith('next') ? 1 : -1)));
      document.getElementById('stepper-preview').innerHTML=UI.stepper(currentStep);
      document.getElementById('step-copy').textContent=['Chọn hồ sơ người đi khám.','Điền thông tin bệnh và dị ứng.','Chọn khám online hoặc tại phòng khám.','Xem lại ngày giờ trước khi gửi.'][currentStep];
      document.querySelector('[data-action="preview-step-back"]').disabled=currentStep===0;
      document.querySelector('[data-action="preview-step-next"]').disabled=currentStep===3;
      return;
    }
    if (target.dataset.action === 'preview-retry') { renderState('ready'); return; }
    const nav = target.closest('.cf-tab-bar');
    if(target.matches('a[href^="#"]')) event.preventDefault();
    if (nav && target.matches('a')) {
      event.preventDefault();
      nav.innerHTML=UI.navigation(target.dataset.to,{unread:UI.appointmentUpdateCount(s),contentOnly:true});
      nav.querySelector(`[data-to="${target.dataset.to}"]`).focus();
    }
    const labels = {notifications:'Mẫu thông báo: số chưa đọc lấy từ dữ liệu, không dùng chấm online trang trí.','book-nav':'Nút + sẽ mở luồng đặt lịch. Đây là mẫu component để duyệt.','preview-book':'Nút này sẽ mở bước chọn hồ sơ khi tích hợp Trang chủ.','preview-logout':'Mẫu nút đăng xuất. Bản duyệt không thay đổi phiên đăng nhập.','preview-ticket':'Mẫu nút xem phiếu. Phiếu và dữ liệu ứng dụng được giữ nguyên.'};
    document.getElementById('preview-feedback').textContent = target.dataset.to === 'K1' ? labels.notifications : labels[target.dataset.action] || `Đã chọn “${target.textContent.trim()}”. Hành vi thực tế sẽ nối vào flow hiện có khi duyệt màn.`;
  });
  function renderHeaderStudy() {
    const UI=window.CareFlowUI,M=window.CareFlowModel,s=M.fixture('appointments');
    const account=M.accountProfile(s),relatives=s.profiles.filter(p=>p.id!==account.id);
    const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
    const I=(name,size=20)=>window.CareFlowIcon(name,size).replace('<svg ','<svg aria-hidden="true" focusable="false" ');
    const upcoming=s.visits.filter(v=>!['completed','cancelled','no-show'].includes(v.status)).sort((a,b)=>a.date.localeCompare(b.date));
    const past=s.visits.filter(v=>v.status==='completed'),cancelled=s.visits.filter(v=>['cancelled','no-show'].includes(v.status));
    const date=v=>v.date.split('-').reverse().slice(0,2).join('/');
    const state={tab:'upcoming',mode:'all',date:'',authStep:3,name:account.name};
    const statusBar=`<div class="hpr-statusbar" aria-hidden="true"><span>9:41</span><span class="hpr-island"></span><span class="hpr-system-icons"><svg width="17" height="14" viewBox="0 0 20 16" fill="currentColor"><rect x="1" y="10" width="3" height="5" rx="1"/><rect x="6" y="7" width="3" height="8" rx="1"/><rect x="11" y="4" width="3" height="11" rx="1"/><rect x="16" y="1" width="3" height="14" rx="1"/></svg><svg width="17" height="14" viewBox="0 0 20 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 5a12 12 0 0 1 16 0M5 8a7.5 7.5 0 0 1 10 0M8 11a3 3 0 0 1 4 0"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg><svg width="23" height="14" viewBox="0 0 26 14" fill="none"><rect x="1" y="2" width="21" height="10" rx="3" stroke="currentColor"/><rect x="3" y="4" width="17" height="6" rx="1" fill="currentColor"/><path d="M24 5v4" stroke="currentColor" stroke-width="2"/></svg></span></div>`;
    const iconButton=(name,icon,action,disabled=false)=>`<button type="button" class="hpr-icon-button" aria-label="${esc(name)}" data-hpr-action="${action}"${disabled?' disabled':''}>${I(icon,22)}</button>`;
    const bell=()=>iconButton('Thông báo','bell','notifications');
    const head=(title,subtitle)=>`<div class="hpr-title-row"><h3>${title}</h3>${bell()}</div>${subtitle?`<p class="hpr-subtitle">${subtitle}</p>`:''}`;
    const action=(label,act,icon='arrow-right',variant='secondary')=>`<button type="button" ${UI.buttonAttrs(variant)} data-hpr-action="${act}">${esc(label)}${I(icon,18)}</button>`;
    const card=(title,body)=>UI.card(`<h4>${title}</h4>${body}`,'hpr-content-card');
    const phone=(id,label,rationale,header,content)=>`<article class="hpr-study" data-hpr-screen="${id}"><div class="hpr-study-label"><span>${label}</span><span>${id}</span></div><div class="hpr-phone"><div class="hpr-masthead">${statusBar}<header class="hpr-header">${header}</header></div><div class="hpr-phone-content">${content}</div><div class="hpr-home-indicator" aria-hidden="true"></div></div><p class="hpr-rationale">${rationale}</p></article>`;
    document.body.classList.add('hpr-review');document.title='CareFlow · Bản nháp 5 header';
    const intro=document.querySelector('.cf-review-intro');
    intro.innerHTML=`<div><p class="hpr-eyebrow">CAREFLOW / HƯỚNG THIẾT KẾ 02</p><h1>5 màn hình.<br>5 điểm bắt đầu.</h1><p class="hpr-intro-copy">Lịch hẹn thành một tấm vé. Hồ sơ thành thẻ danh tính. Hỗ trợ có hình ảnh và một nơi bắt đầu rõ ràng. Bản nháp này thay đổi cấu trúc, giữ nguyên bảng màu của app.</p></div><div class="hpr-review-tools"><div role="group" aria-label="Chiều rộng màn hình"><button type="button" data-hpr-width="360" aria-pressed="false">360 px</button><button type="button" data-hpr-width="390" aria-pressed="true">390 px</button></div><button type="button" data-hpr-large aria-pressed="false">Chữ lớn</button><a href="preview.html">Design System ${I('arrow-right',16)}</a></div>`;
    const root=document.getElementById('component-preview');root.className='hpr-grid';root.setAttribute('aria-label','Năm header CareFlow đang đề xuất');
    const home=`<div class="hpr-topline"><span class="hpr-wordmark">CareFlow<span>+</span></span>${bell()}</div><div class="hpr-home-intro"><div><p class="hpr-greeting">Chào bạn,</p><h3>${esc(account.name.split(' ').slice(-2).join(' '))}</h3><p class="hpr-home-caption">Chăm sóc từ hôm nay.</p></div><span class="hpr-home-portrait" aria-hidden="true">${window.CareFlowAvatar(account.id,72)}<span class="hpr-portrait-mark">${I('heart-pulse',20)}</span></span></div><div class="hpr-floating-ticket"><div class="hpr-ticket-date"><strong>${upcoming[0].date.slice(-2)}</strong><small>Tháng ${Number(upcoming[0].date.slice(5,7))}</small></div><div class="hpr-ticket-info"><small>Lịch gần nhất</small><strong>${esc(upcoming[0].slot)} · Khám trực tuyến</strong>${UI.badge(upcoming[0].status)}</div><button type="button" class="hpr-ticket-arrow" data-hpr-action="visit" aria-label="Xem lịch hẹn gần nhất">${I('arrow-right',20)}</button></div>`;
    const homeBody=`<h4>Tiện ích của bạn</h4><div class="hpr-quick-grid"><button type="button" data-hpr-action="profile">${I('users',26)}<strong>${s.profiles.length} hồ sơ</strong><span>Quản lý người đi khám</span>${I('arrow-right',18)}</button><button type="button" data-hpr-action="message">${I('message-circle',26)}<strong>Hỏi phòng&nbsp;khám</strong><span>Lịch hẹn, hồ sơ, kết quả</span>${I('arrow-right',18)}</button></div>`;
    const appointments=`${head('Lịch hẹn','')}<div class="hpr-calendar-heading"><span>${I('calendar',18)}<span data-hpr-calendar-caption>Ngày có lịch</span></span><small data-hpr-date-summary>${upcoming.length} lịch sắp tới</small></div><div class="hpr-date-rail" role="group" aria-label="Lọc theo ngày hẹn"></div><div class="hpr-appointment-tabs">${UI.tabs([['upcoming',`Sắp tới ${upcoming.length}`],['past',`Đã khám ${past.length}`],['cancelled',`Đã hủy ${cancelled.length}`]],state.tab,'header-appointments')}</div>`;
    const apptBody=`<div class="hpr-list-toolbar"><h4>Lịch của bạn</h4><button type="button" class="hpr-filter" data-hpr-action="filter">${I('settings',18)}Bộ lọc<span data-hpr-filter-count hidden>1</span></button></div><div id="header-appointments-panel" role="tabpanel" aria-labelledby="header-appointments-upcoming" class="hpr-visit-list"></div>`;
    const profile=`${head('Hồ sơ','')}<div class="hpr-id-card"><div class="hpr-id-top"><span>HỒ SƠ CÁ NHÂN</span>${I('heart-pulse',20)}</div><div class="hpr-id-person"><div><strong>${esc(account.name)}</strong><span>Bản thân</span></div><span class="hpr-id-avatar" aria-hidden="true">${window.CareFlowAvatar(account.id,52)}</span></div><div class="hpr-id-bottom"><div><small>Ngày sinh</small><strong>${account.dob.split('-').reverse().join('/')}</strong></div><span class="hpr-id-monogram" aria-hidden="true">CF<span>+</span></span></div></div><button type="button" class="hpr-family-dock" data-hpr-action="relatives"><span class="hpr-family-avatars" aria-hidden="true">${window.CareFlowAvatar(account.id,28)}${relatives[0]?window.CareFlowAvatar(relatives[0].id,28):''}</span><span><strong>${relatives.length} người thân</strong><small>Cùng quản lý, dễ đặt lịch</small></span>${I('chevron-right',18)}</button>`;
    const profileBody=`<div class="hpr-profile-utility"><span class="hpr-utility-icon">${I('shield',22)}</span><div><h4>Thông tin y tế</h4><p>Dị ứng · ${esc(account.allergies||'Chưa khai báo')}</p></div><button type="button" class="hpr-icon-button" data-hpr-action="profile" aria-label="Xem thông tin y tế">${I('arrow-right',20)}</button></div>`;
    const support=`${head('Hỗ trợ','')}<div class="hpr-support-hero"><div class="hpr-support-copy"><h4>Kết nối với<br>phòng khám.</h4><p>Lịch hẹn, hồ sơ<br>và kết quả của bạn.</p></div><img src="../prototype/assets/images/unsplash/doctor-cutout.webp" alt="" class="hpr-support-portrait"><span class="hpr-support-bubble" aria-hidden="true">${I('message-circle',24)}</span></div><div class="hpr-contact-dock">${action('Nhắn tin','message','arrow-right','primary')}<button type="button" class="hpr-callback" data-hpr-action="callback">${I('phone',20)}<span>Nhờ gọi lại</span></button></div>`;
    const supportBody=`<div class="hpr-support-topics"><h4>Bạn đang cần hỏi về</h4><div>${[['Lịch hẹn','calendar'],['Hồ sơ','user'],['Kết quả','document-check']].map(([label,icon])=>`<button type="button" data-hpr-action="message">${I(icon,20)}<span>${label}</span></button>`).join('')}</div></div><button type="button" class="hpr-request-row" data-hpr-action="requests">${I('document',22)}<span><strong>Yêu cầu đã gửi</strong><small>Xem phản hồi từ phòng khám</small></span>${I('chevron-right',18)}</button>`;
    const authHead=()=>`<div class="hpr-auth-nav">${iconButton('Quay lại bước trước','chevron-left','auth-back',state.authStep===1)}<h3>${['Đăng nhập','Xác thực','Tạo hồ sơ'][state.authStep-1]}</h3><span>Bước ${state.authStep}/3</span></div><ol class="hpr-auth-progress" aria-label="Tiến trình tạo tài khoản">${['Số điện thoại','Xác thực','Hồ sơ'].map((label,i)=>`<li${i+1===state.authStep?' aria-current="step"':''} data-complete="${i+1<state.authStep}"><span>${i+1<state.authStep?I('check',16):i+1}</span><small>${label}</small></li>`).join('')}</ol>${state.authStep===3?`<div class="hpr-auth-preview"><span aria-hidden="true">${window.CareFlowAvatar(account.id,40)}</span><div><small>Hồ sơ đang tạo</small><strong>${esc(state.name)}</strong></div>${I('document-check',24)}</div>`:`<div class="hpr-auth-prompt"><span>${I(state.authStep===1?'phone':'shield',28)}</span><p>${state.authStep===1?'Bắt đầu với số điện thoại của bạn.':'Xác thực để tiếp tục tạo hồ sơ.'}</p></div>`}`;
    const authBody=()=>`<form class="hpr-auth-form"><div><h4>${['Số điện thoại của bạn','Nhập mã xác thực','Thông tin của bạn'][state.authStep-1]}</h4><p>${['Nhập số điện thoại để nhận mã xác thực.','Mã được gửi đến số điện thoại bạn đã nhập.','Giúp phòng khám tiếp nhận đúng người đi khám.'][state.authStep-1]}</p></div><label>${['Số điện thoại','Mã xác thực','Họ và tên'][state.authStep-1]}<input name="identity" autocomplete="off" required value="${state.authStep===3?esc(state.name):''}"${state.authStep===2?' inputmode="numeric" maxlength="6"':state.authStep===1?' type="tel" inputmode="tel"':''}></label>${state.authStep===3?`<label>Ngày sinh<input value="${account.dob.split('-').reverse().join('/')}" readonly aria-readonly="true"></label>`:''}<button type="submit" ${UI.buttonAttrs('primary')}>${['Nhận mã','Tiếp tục','Lưu hồ sơ'][state.authStep-1]}${I('arrow-right',18)}</button></form>`;
    root.innerHTML=phone('B1','01 · Trang chủ','Lời chào mở + vé lịch hẹn giao giữa hai vùng. Việc tiếp theo là điểm nhấn, không còn lặp một thẻ lịch bên dưới.',home,homeBody)+phone('D1','02 · Lịch hẹn','Đầu màn là một lịch thu gọn. Bấm ngày để lọc; các tab trạng thái chuyển sang dạng gạch chân.',appointments,apptBody)+phone('K2','03 · Hồ sơ','Thẻ danh tính với avatar vuông, ngày sinh và một dải người thân nối liền phía dưới.',profile,profileBody)+phone('K5','04 · Hỗ trợ','Ảnh tách nền tạo bố cục lệch; hai cách liên hệ nằm cùng một dock thao tác rõ ràng.',support,supportBody)+phone('A3','05 · Tạo hồ sơ','Tiến trình có nút bước và dấu hoàn thành; thông tin đang tạo được xem trước phía trên biểu mẫu.',authHead(),authBody());
    const dialog=document.createElement('dialog');dialog.id='hpr-dialog';dialog.setAttribute('aria-labelledby','hpr-dialog-title');dialog.innerHTML='<div class="hpr-dialog-heading"><h2 id="hpr-dialog-title"></h2><button type="button" class="hpr-icon-button" data-hpr-action="close" aria-label="Đóng">'+I('cross',20)+'</button></div><div id="hpr-dialog-body"></div>';document.body.append(dialog);
    let trigger;
    function show(title,body){dialog.querySelector('h2').textContent=title;dialog.querySelector('#hpr-dialog-body').innerHTML=body;dialog.showModal()}
    dialog.addEventListener('close',()=>trigger?.focus());
    const feedback=copy=>show('Bản xem trước',`<p>${copy}</p>`);
    function renderAppointments(){
      const all={upcoming,past,cancelled}[state.tab];const list=all.filter(v=>(state.mode==='all'||v.mode===state.mode)&&(!state.date||v.date===state.date));
      const rail=root.querySelector('.hpr-date-rail');rail.hidden=all.length===0;
      const dates=[...new Set(all.map(v=>v.date))];
      rail.innerHTML=`<button type="button" data-hpr-date="" aria-pressed="${!state.date}"><span>${I('calendar',20)}</span><small>Tất cả</small></button>${dates.map(value=>`<button type="button" data-hpr-date="${value}" aria-pressed="${state.date===value}"><strong>${value.slice(-2)}</strong><small>Tháng ${Number(value.slice(5,7))}</small></button>`).join('')}`;
      root.querySelector('[data-hpr-date-summary]').textContent=state.date?date({date:state.date}):`${all.length} ${state.tab==='past'?'lượt đã khám':state.tab==='cancelled'?'lịch đã hủy':'lịch sắp tới'}`;
      root.querySelector('#header-appointments-panel').innerHTML=list.length?list.slice(0,2).map(v=>`<button type="button" class="hpr-visit-row" data-hpr-action="visit"><span class="hpr-date-tile"><strong>${v.date.slice(-2)}</strong><small>Tháng ${Number(v.date.slice(5,7))}</small></span><span><strong>${v.mode==='online'?'Khám trực tuyến':'Tại phòng khám'}</strong><small>${esc(v.slot)} · ${esc(M.profile(s,v.patientId)?.name||account.name)}</small>${UI.badge(v.status)}</span>${I('chevron-right',16)}</button>`).join(''):`<div class="hpr-empty"><strong>${state.tab==='cancelled'?'Chưa có lịch đã hủy':'Không có lịch phù hợp'}</strong><p>${state.tab==='cancelled'?'Lịch còn hiệu lực vẫn ở tab Sắp tới.':'Đổi ngày hoặc hình thức khám để xem lịch của bạn.'}</p>${action(state.tab==='cancelled'?'Xem lịch sắp tới':'Xóa bộ lọc','clear-filters')}</div>`;
      const badge=root.querySelector('[data-hpr-filter-count]');badge.hidden=state.mode==='all';
    }
    function selectTab(tab){root.querySelectorAll('[role=tab]').forEach(el=>{const active=el===tab;el.setAttribute('aria-selected',String(active));el.tabIndex=active?0:-1});state.tab=tab.dataset.value;state.date='';root.querySelector('[role=tabpanel]').setAttribute('aria-labelledby',tab.id);renderAppointments()}
    root.addEventListener('keydown',event=>{const tab=event.target.closest('[role=tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...tab.parentElement.children],index=tabs.indexOf(tab);const next=tabs[event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];selectTab(next);next.focus()});
    document.addEventListener('click',event=>{
      const tab=event.target.closest('[role=tab]');if(tab&&root.contains(tab)){selectTab(tab);return}
      const dateChoice=event.target.closest('[data-hpr-date]');if(dateChoice){state.date=state.date===dateChoice.dataset.hprDate?'':dateChoice.dataset.hprDate;renderAppointments();root.querySelector(`[data-hpr-date="${state.date}"]`)?.focus();return}
      const width=event.target.closest('[data-hpr-width]');if(width){document.body.style.setProperty('--hpr-device-width',width.dataset.hprWidth+'px');intro.querySelectorAll('[data-hpr-width]').forEach(el=>el.setAttribute('aria-pressed',String(el===width)));return}
      const large=event.target.closest('[data-hpr-large]');if(large){const enabled=large.getAttribute('aria-pressed')!=='true';large.setAttribute('aria-pressed',String(enabled));document.body.classList.toggle('hpr-large',enabled);return}
      const btn=event.target.closest('[data-hpr-action]');if(!btn)return;
      const act=btn.dataset.hprAction;
      if(act==='close'){dialog.close();return}
      trigger=btn;
      if(act==='clear-filters'){state.mode='all';state.date='';selectTab(root.querySelector('[role=tab][data-value=upcoming]'));return}
      if(act==='notifications'){show('Thông báo',`<p>Trong app, thông báo về lịch hẹn và yêu cầu sẽ xuất hiện tại đây.</p><p class="hpr-quiet-note">Bản nháp này không kết nối dữ liệu tài khoản.</p>`);return}
      if(act==='filter'){show('Lọc lịch hẹn',`<form id="hpr-filter-form"><fieldset><legend>Hình thức khám</legend>${[['all','Tất cả'],['online','Khám trực tuyến'],['onsite','Tại phòng khám']].map(([value,label])=>`<label class="hpr-radio"><input type="radio" name="mode" value="${value}"${state.mode===value?' checked':''}>${label}</label>`).join('')}</fieldset><button type="submit" ${UI.buttonAttrs('primary')}>Áp dụng</button></form>`);return}
      if(act==='relatives'){show('Người thân',relatives.map(p=>`<div class="hpr-relative-row">${window.CareFlowAvatar(p.id,44)}<div><strong>${esc(p.name)}</strong><p>Hồ sơ người thân</p></div></div>`).join(''));return}
      if(act==='auth-back'){state.authStep=Math.max(1,state.authStep-1);const auth=root.querySelector('[data-hpr-screen=A3]');auth.querySelector('.hpr-header').innerHTML=authHead();auth.querySelector('.hpr-phone-content').innerHTML=authBody();return}
      feedback({visit:'Đây là vị trí mở phiếu khám trong app. Bản xem trước giữ nguyên dữ liệu mẫu.',profile:'Thông tin hồ sơ sẽ được mở tại đây khi tích hợp vào app.',message:'Lối vào soạn câu hỏi cho phòng khám. Bản nháp này chưa gửi tin nhắn.',callback:'Lối vào yêu cầu gọi lại. Bản nháp này chưa tạo yêu cầu.',requests:'Lối vào danh sách yêu cầu đã gửi. Bản nháp không thay đổi dữ liệu ứng dụng.'}[act]||'Thao tác chỉ dùng để xem trước thiết kế.');
    });
    root.addEventListener('input',event=>{if(state.authStep!==3||!event.target.matches('.hpr-auth-form input[name=identity]'))return;state.name=event.target.value;root.querySelector('.hpr-auth-preview strong').textContent=state.name.trim()||'Họ và tên của bạn'});
    document.addEventListener('submit',event=>{if(!event.target.matches('.hpr-auth-form,#hpr-filter-form'))return;event.preventDefault();if(event.target.id==='hpr-filter-form'){state.mode=new FormData(event.target).get('mode');renderAppointments();dialog.close()}else if(state.authStep<3){state.authStep++;const auth=root.querySelector('[data-hpr-screen=A3]');auth.querySelector('.hpr-header').innerHTML=authHead();auth.querySelector('.hpr-phone-content').innerHTML=authBody()}else{trigger=event.submitter;feedback('Đã xem mẫu trạng thái lưu hồ sơ. Không có hồ sơ nào được tạo hoặc sửa trong app.')}});
    renderAppointments();
  }
})();
