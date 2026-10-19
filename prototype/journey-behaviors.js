/* Patient-journey progressive enhancements. Real forms, model guards and routes remain in app.js. */
(function () {
  'use strict';
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLocaleLowerCase('vi-VN');
  function remember(detail) {
    document.dispatchEvent(new CustomEvent('careflow:collection',{detail}));
  }
  function filterCollection(collection, persist = false) {
    const filter = collection.dataset.filter || 'all';
    const query = collection.querySelector('[data-collection-search]')?.value || '';
    const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
    const items = [...collection.querySelectorAll('[data-collection-item]')];
    items.forEach(item => {
      item.hidden = (filter !== 'all' && item.dataset.category !== filter) || !terms.every(term => normalize(item.dataset.search).includes(term));
    });
    collection.querySelectorAll('[data-collection-filter]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.collectionFilter === filter)));
    const visible = items.filter(item => !item.hidden).length;
    const count = collection.querySelector('[data-collection-count]');
    count.textContent = `Hiển thị ${visible} / ${items.length}`;
    collection.querySelector('.cf-collection-empty').hidden = visible > 0;
    collection.querySelector('.cf-collection-meta [data-collection-reset]').hidden = filter === 'all' && !query;
    if (persist) remember({key:collection.dataset.collection,filter,query});
  }
  function filterAppointments(root) {
    const mode = root.querySelector('[data-visit-filter][aria-pressed="true"]')?.dataset.visitFilter || 'all';
    const person = root.querySelector('.rich-person-picker')?.dataset.person || 'all';
    const query=root.querySelector('[data-appointment-search]')?.value||'';
    const date=root.querySelector('[data-appointment-date][aria-pressed="true"]')?.dataset.appointmentDate||'';
    const terms=normalize(query).trim().split(/\s+/).filter(Boolean);
    const cards = [...root.querySelectorAll('.rich-filterable')];
    cards.forEach(card => {
      card.hidden = (mode !== 'all' && card.dataset.mode !== mode) || (person !== 'all' && card.dataset.person !== person) || (date && card.dataset.date !== date) || !terms.every(term=>normalize(card.dataset.search).includes(term));
    });
    root.querySelectorAll('.rich-appointment-group').forEach(group => {
      group.hidden = ![...group.querySelectorAll('.rich-filterable')].some(card => !card.hidden);
    });
    const empty = root.querySelector('.rich-filter-empty');
    if (empty) empty.hidden = cards.some(card => !card.hidden) || !cards.length;
    const count = root.querySelector('[data-appointment-count]');
    if(count) count.textContent = `${cards.filter(card=>!card.hidden).length} lịch hẹn`;
    root.querySelectorAll('[data-appointment-reset]').forEach(button=>{
      if(!button.closest('.rich-filter-empty')) button.hidden=mode==='all'&&person==='all'&&!query&&!date;
    });
    const badge=root.querySelector('[data-appointment-filter-count]');
    const applied=Number(mode!=='all')+Number(person!=='all')+Number(!!query)+Number(!!date);
    if(badge){badge.hidden=!applied;badge.textContent=String(applied);}
    remember({key:'appointments',filter:mode,person,query,date});
  }
  window.CareFlowCollections = {refresh(root) {
    root.querySelectorAll('[data-collection]').forEach(collection=>filterCollection(collection));
    if(root.querySelector('.rich-appointment-list')) filterAppointments(root);
  }};
  document.addEventListener('click', (event) => {
    const collectionControl=event.target.closest('[data-collection-filter],[data-collection-reset]');
    if(collectionControl) {
      const collection=collectionControl.closest('[data-collection]');
      collection.dataset.filter=collectionControl.hasAttribute('data-collection-reset')?'all':collectionControl.dataset.collectionFilter;
      if(collectionControl.hasAttribute('data-collection-reset')) {
        const input=collection.querySelector('[data-collection-search]');
        if(input) input.value='';
      }
      filterCollection(collection,true);
      // A reset inside the empty state becomes hidden after restoring content.
      if(!collectionControl.getClientRects().length) collection.querySelector('[data-collection-search],[data-collection-filter]')?.focus({preventScroll:true});
      return;
    }
    const reset=event.target.closest('[data-appointment-reset]');
    if(reset) {
      const root=reset.closest('#phone-content');
      root.querySelectorAll('[data-appointment-date]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.appointmentDate==='')));
      root.querySelectorAll('[data-visit-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.visitFilter==='all')));
      const picker=root.querySelector('.rich-person-picker');
      picker.dataset.person='all';
      picker.querySelectorAll('[data-appointment-person]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.appointmentPerson==='all')));
      picker.querySelector('summary span').textContent='Tất cả hồ sơ';
      const search=root.querySelector('[data-appointment-search]');
      if(search) search.value='';
      filterAppointments(root);
      root.querySelector('[data-action="appointment-filters"]')?.focus({preventScroll:true});
      return;
    }
    const date=event.target.closest('button[data-appointment-date]');
    if(date) {
      const root=date.closest('#phone-content');
      const value=date.getAttribute('aria-pressed')==='true'?'':date.dataset.appointmentDate;
      root.querySelectorAll('[data-appointment-date]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.appointmentDate===value)));
      filterAppointments(root);
      return;
    }
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
    if(event.target.matches('[data-appointment-search]')) filterAppointments(event.target.closest('#phone-content'));
    if(event.target.matches('[data-collection-search]')) filterCollection(event.target.closest('[data-collection]'),true);
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
  window.CareFlowCollections.refresh(document.getElementById('phone-content'));
  setInterval(refreshCountdown, 30000);
})();
