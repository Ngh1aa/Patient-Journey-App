/* Review harness only. Product state and clinical guards are never loaded/mutated. */
(function () {
  'use strict';
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
})();
