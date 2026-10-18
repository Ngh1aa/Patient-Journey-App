/* Shared presentation contract. Clinical state and permissions stay in each model. */
(function (root) {
  'use strict';
  const copy = root.CareFlowCopy;
  const tones = {
    pending: 'warning', 'mode-review': 'warning', confirmed: 'success',
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
  root.CareFlowUI = { status, buttonAttrs, modeText, facts, cardAttrs, card };
})(typeof window !== 'undefined' ? window : globalThis);
