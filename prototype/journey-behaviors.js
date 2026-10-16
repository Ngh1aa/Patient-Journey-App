/* Patient-journey progressive enhancements. Real forms, model guards and routes remain in app.js. */
(function () {
  'use strict';
  function filterAppointments(root) {
    const mode = root.querySelector('[data-visit-filter][aria-pressed="true"]')?.dataset.visitFilter || 'all';
    const person = root.querySelector('.rich-person-picker')?.dataset.person || 'all';
    const cards = [...root.querySelectorAll('.rich-filterable')];
    cards.forEach(card => {
      card.hidden = (mode !== 'all' && card.dataset.mode !== mode) || (person !== 'all' && card.dataset.person !== person);
    });
    root.querySelectorAll('.rich-appointment-group').forEach(group => {
      group.hidden = ![...group.querySelectorAll('.rich-filterable')].some(card => !card.hidden);
    });
    const empty = root.querySelector('.rich-filter-empty');
    if (empty) empty.hidden = cards.some(card => !card.hidden) || !cards.length;
  }
  document.addEventListener('click', (event) => {
    const filter = event.target.closest('button[data-visit-filter]');
    if (filter) {
      const root = filter.closest('#phone-content');
      root.querySelectorAll('button[data-visit-filter]').forEach(button => button.setAttribute('aria-pressed',String(button===filter)));
      filterAppointments(root);
      return;
    }
    const callbackSlot = event.target.closest('button[data-callback-slot]');
    if (callbackSlot) {
      callbackSlot.parentElement.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed',String(button===callbackSlot)));
      return;
    }
    const topic=event.target.closest('button[data-support-topic]');
    if (topic) {
      const group=topic.closest('.rich-topic-grid');
      group.querySelectorAll('button[data-support-topic]').forEach(button=>button.setAttribute('aria-pressed',String(button===topic)));
      const input=document.getElementById('supportTopic');
      if(input){input.value=topic.dataset.supportTopic;input.dispatchEvent(new Event('input',{bubbles:true}));}
      return;
    }
    const person=event.target.closest('button[data-appointment-person]');
    if(person){
      const picker=person.closest('.rich-person-picker');
      const id=person.dataset.appointmentPerson;
      picker.dataset.person=id;
      picker.querySelectorAll('[data-appointment-person]').forEach(button=>button.setAttribute('aria-pressed',String(button===person)));
      filterAppointments(picker.closest('#phone-content'));
      const selected=picker.querySelector('summary span');
      if(selected)selected.textContent=id==='all'?'Tất cả hồ sơ':person.textContent.trim();
      picker.open=false;
      return;
    }
    const chip = event.target.closest('button[data-symptom]');
    if (!chip) return;
    const field = document.getElementById('reason');
    if (!field || field.disabled) return;
    const term = chip.dataset.symptom.trim();
    const existing = field.value.trim();
    const parts = existing.split(/[,;\n]/).map(x => x.trim().toLocaleLowerCase('vi-VN'));
    if (!parts.includes(term.toLocaleLowerCase('vi-VN'))) {
      field.value = existing ? existing.replace(/[\s,;]+$/, '') + ', ' + term : term;
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
    chip.setAttribute('aria-pressed', 'true');
    field.focus({ preventScroll: true });
  });
  document.addEventListener('input',(event)=>{
    if(event.target.id==='support'){
      const count=document.getElementById('support-count');
      if(count) count.textContent=String(event.target.value.length);
    }
  });
  function refreshCountdown() {
    document.querySelectorAll('[data-appointment-countdown]').forEach(node => {
      const target = Date.parse(node.getAttribute('data-appointment-countdown'));
      if (!Number.isFinite(target)) { node.textContent = 'Xem thời gian trên phiếu khám'; return; }
      const difference = target - Date.now();
      if (difference <= 0) { node.textContent = 'Đã đến giờ hẹn'; return; }
      const minutes = Math.ceil(difference / 60000);
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      const remaining = minutes % 60;
      node.textContent = days > 0 ? days + ' ngày ' + hours + ' giờ' : hours > 0 ? hours + ' giờ ' + remaining + ' phút' : remaining + ' phút';
    });
  }
  window.addEventListener('hashchange', () => queueMicrotask(refreshCountdown));
  refreshCountdown();
  setInterval(refreshCountdown, 30000);
})();
