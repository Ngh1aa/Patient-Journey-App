/* Patient-journey progressive enhancements. Real forms, model guards and routes remain in app.js. */
(function () {
  'use strict';
  document.addEventListener('click', (event) => {
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
