/* CareFlow contextual experience layer — real Unsplash photography, synthetic UI-only guidance.
   It never changes medical state, booking transitions, payments or personal records. */
(function installCareFlowExperience(root) {
  'use strict';
  const IMG = Object.freeze({
    appointment: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1100&q=78',
    consultation: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1100&q=78',
    radiology: 'https://images.unsplash.com/photo-1666214277730-e9c7e755e5a3?auto=format&fit=crop&w=1100&q=78',
    clinician: 'https://images.unsplash.com/photo-1758691462651-611d730c5272?auto=format&fit=crop&w=1100&q=78'
  });
  const esc = (value) => String(value == null ? '' : value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
  const icon = (name, size = 18) => root.CareFlowIcon(name, size);
  const link = (label, to, subtle = false) =>
    '<button type="button" class="cfx-link' + (subtle ? ' is-subtle' : '') +
    '" data-action="go" data-to="' + esc(to) + '">' + esc(label) +
    icon('arrow-right', 16) + '</button>';
  const tip = (name, title, description, to, label) =>
    '<div class="cfx-tile"><span class="cfx-tile-icon">' + icon(name, 21) +
    '</span><strong>' + esc(title) + '</strong><p>' + esc(description) +
    '</p>' + (to ? link(label || 'See more', to, true) : '') + '</div>';
  const section = (eyebrow, title, html, description = '') =>
    '<section class="cfx-section" aria-label="' + esc(title) + '">' +
    '<div class="cfx-section-heading"><span>' + esc(eyebrow) + '</span><h2>' +
    esc(title) + '</h2>' + (description ? '<p>' + esc(description) + '</p>' : '') +
    '</div>' + html + '</section>';
  const grid = (...cards) => '<div class="cfx-grid">' + cards.join('') + '</div>';
  const details = (title, content, subtitle = '') =>
    '<details class="cfx-disclosure"><summary><span>' +
    icon('info', 19) + '</span><span><strong>' + esc(title) + '</strong>' +
    (subtitle ? '<small>' + esc(subtitle) + '</small>' : '') +
    '</span>' + icon('chevron-right', 18) + '</summary><div class="cfx-disclosure-body">' +
    content + '</div></details>';
  const list = (...items) => '<ul class="cfx-bullets">' +
    items.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>';
  const photo = (key, title, text, to, label) =>
    '<div class="cfx-photo-card"><img src="' + IMG[key] +
    '" alt="Sample healthcare photo from Unsplash" loading="lazy" ' +
    'width="560" height="360" data-cfx-fallback="./assets/images/clinic-reception.webp">' +
    '<div class="cfx-photo-copy"><span>Care corner</span><strong>' +
    esc(title) + '</strong><p>' + esc(text) + '</p>' +
    (to ? link(label || 'See more', to) : '') + '</div></div>';
  const checklist = (key, title, items) =>
    '<div class="cfx-checklist" data-cfx-checklist="' + esc(key) + '">' +
    '<div class="cfx-check-head"><strong>' + esc(title) + '</strong>' +
    '<span class="cfx-check-count" role="status" aria-live="polite">0/' + items.length +
    ' prepared</span></div>' +
    items.map((item, i) =>
      '<label class="cfx-check-row"><input type="checkbox" data-cfx-index="' + i +
      '"><span class="cfx-check-mark" aria-hidden="true">' + icon('check', 14) +
      '</span><span>' + esc(item) + '</span></label>').join('') +
    '<p class="cfx-check-foot">A self-check list on this device; it is not sent to the clinic.</p></div>';
  const band = (text, to, action) =>
    '<div class="cfx-action-band"><span>' + icon('headphones', 20) +
    '</span><p>' + esc(text) + '</p>' + link(action || 'Support', to || 'K5') + '</div>';

  const panels = {
    B1: ({s}) => section('CHOOSE YOUR CARE', 'Tools for you',
      grid(tip('user', 'Family profiles', (s.profiles?.length || 0) + ((s.profiles?.length || 0) === 1 ? ' profile' : ' profiles') + ' saved. View the list and choose the right person for the visit.', 'K2', 'View profiles'),
        tip('message-circle', 'Need help with an appointment?', 'Ask the clinic about appointment times or how to prepare.', 'K5', 'Contact'))),
    C1: () => section('START BOOKING', 'Choose the right person',
      photo('consultation', 'One place for the whole family',
        'Each person has a separate profile to help avoid mixing up appointments and results.', 'K2', 'Manage profiles') +
      details('Before booking for a family member',
        list('Check the patient’s name and date of birth.',
          'Only view results for people who have given you access.',
          'You can change the patient at this step.'))),
    C2: () => section('DESCRIBING SYMPTOMS', 'Help the doctor understand',
      grid(tip('clock', 'When did it start?', 'Note when it started and how your symptoms have changed.'),
        tip('document', 'What have you tried?', 'If any, list medications taken and other steps tried.')) +
      details('Tips for describing your reason for visit',
        list('Describe the main problem in your own words.',
          'You can add timing, how much it affects you and relevant medical history.',
          'Don’t skip the warning-signs check in the next step.'))),
    C5: () => section('WHILE YOU WAIT', 'What happens next?',
      grid(tip('shield', 'Clinic review', 'The visit type will be confirmed based on your needs and the information provided.'),
        tip('headphones', 'Need to talk?', 'Contact the clinic directly if your condition or request changes.', 'K5', 'Support'))),
    C6: () => section('QUICK COMPARISON', 'Choose the right visit type',
      grid(tip('map-pin', 'At the clinic', 'Suitable when you need an in-person examination and tests or procedures on site.'),
        tip('video', 'Online', 'Requires a stable connection and a private space.')) +
      details('Not sure which to choose?',
        'The clinic may need to review the visit type based on the health information you provided. ' +
        'An online visit does not replace emergency care.')),
    C7: () => section('BOOK AHEAD', 'Before choosing a time',
      grid(tip('calendar', 'Check your schedule', 'Choose a day that gives you time to prepare and travel.'),
        tip('clock', 'Times may change', 'A booking is only complete when the app shows it as confirmed.'))),
    C8: () => section('FINAL CHECK', 'After you send the request',
      details('How will the clinic respond?',
        list('Follow the appointment status and notifications in the app.',
          'If the time you chose is no longer available, you can choose again.',
          'Don’t make a bank transfer until you have clear payment instructions.'))),
    C9: () => section('NEXT STEPS', 'What you can do now',
      grid(tip('calendar', 'Track your appointment', 'See your request status and appointment details.', 'D1', 'Open appointments'),
        tip('headphones', 'Ask the clinic', 'Get in touch to change the time or about special preparation.', 'K5', 'Contact'))),
    D1: ({s}) => section('APPOINTMENT TOOLS', 'Easier to manage',
      grid(tip('user', 'Family profiles', (s.profiles?.length || 0) + ((s.profiles?.length || 0) === 1 ? ' profile' : ' profiles') + ' managed. Check the patient before sending a booking.', 'K2', 'View profiles'),
        tip('headphones', 'Ask about times', 'Get guidance before coming to the clinic or joining online.', 'K5', 'Contact'))),
    D3: () => section('RESCHEDULE', 'Please note',
      details('The new time is not yet confirmed',
        'Check the appointment status after sending your reschedule request. ' +
        'If it is not confirmed, contact the clinic.')),
    D4: () => section('CANCEL APPOINTMENT', 'Before you decide',
      details('If you still want a visit',
        'You can go back to the appointment details and reschedule instead of cancelling. ' +
        'Any fees or refunds depend on the clinic’s information.')),
    E1: () => section('PRE-VISIT CHECKLIST', 'Ready for your appointment',
      checklist('onsite', 'What have you prepared?',
        ['Check the time and location in the appointment details.',
         'Bring ID documents, prescriptions and previous results if you have them.',
         'Write down questions for the doctor.']) +
      band('Special test or fasting instructions? Ask the clinic before you follow them.', 'K5', 'Ask now')),
    E2: () => section('AT THE CLINIC', 'After you check in',
      grid(tip('clock', 'Track your visit', 'Check your check-in progress in the appointment details.', 'E3', 'View progress'),
        tip('headphones', 'Need help at the desk?', 'Ask staff if your name or appointment time is incorrect.', 'K5', 'Contact'))),
    E3: () => section('WHILE YOU WAIT', 'Keep your details to hand',
      grid(tip('document', 'Appointment details', 'Review the appointment, patient and request details.', 'D2', 'Open details'),
        tip('message-circle', 'Something changed?', 'Let reception or the care team know.', 'K5', 'Support'))),
    F1: () => section('DIAGNOSTICS', 'Prepare as instructed',
      grid(tip('document-check', 'Read your orders', 'See the name, status and notes for each order.'),
        tip('headphones', 'Unsure what’s needed?', 'Don’t fast or stop medication on your own; ask the clinic.', 'K5', 'Ask the clinic'))),
    F2: () => section('DIAGNOSTICS', 'Understand results in context',
      details('Results should be explained by a doctor',
        'Test results should be read alongside your symptoms, medical history and the doctor’s assessment. ' +
        'If anything is unclear, you can ask the clinic.')),
    F3: () => section('PREPARING FOR TESTS', 'Before the appointment',
      checklist('lab', 'Things to confirm',
        ['The test name and patient are correct.',
         'Asked the clinic about any special preparation.',
         'Checked the location and appointment time.'])),
    F4: () => section('SHARING DOCUMENTS', 'Protect your personal information',
      details('Check files before attaching',
        'Only choose documents for this visit and the right patient. ' +
        'This is a prototype: files are not uploaded to a server.')),
    G1: () => section('ONLINE VISIT CHECKLIST', 'Ready to connect',
      checklist('online', 'Check before your appointment',
        ['Your connection is stable enough for video.',
         'Camera and microphone have been checked.',
         'You are in a quiet, private space.']) +
      band('If you can’t enter the waiting room, reopen the appointment or ask for support.', 'K5', 'Get help')),
    G2: () => section('IN THE WAITING ROOM', 'Don’t miss the call',
      grid(tip('video', 'Keep your device ready', 'Stay on the waiting screen and check your audio.'),
        tip('headphones', 'Connection dropped?', 'Contact the clinic if the wait is too long or something goes wrong.', 'K5', 'Support'))),
    G5: () => section('IF YOU CAN’T CONNECT', 'You can still continue',
      grid(tip('calendar', 'Review appointment details', 'Check the appointment time and call status.', 'D2', 'Appointment details'),
        tip('headphones', 'Ask to reconnect', 'Talk to the clinic about the next step.', 'K5', 'Contact'))),
    H1: () => section('AFTER YOUR VISIT', 'Keep the information you need',
      grid(tip('document-check', 'Advice and prescription', 'See what has been shared for this visit.', 'H6', 'View advice'),
        tip('headphones', 'Need more explanation?', 'Send a question to the care team.', 'K5', 'Support'))),
    H2: () => section('PAYMENT', 'Check before you pay',
      details('Verify payment details',
        'Check the patient, service and amount shown. ' +
        'The app only simulates payment status; no real transactions are made.')),
    H3: () => section('PAY LATER', 'Keep your appointment details',
      grid(tip('document', 'View fee status', 'Track payment information for this visit.', 'D2', 'Appointment details'),
        tip('headphones', 'Questions?', 'Contact us for payment guidance.', 'K5', 'Support'))),
    H5: () => section('VISIT DOCUMENTS', 'What you can check',
      details('Keep details for your records',
        'Check the payment status and document details for the correct visit. ' +
        'Financial data in this prototype is sample data only.')),
    H6: () => section('AFTERCARE', 'Next steps',
      photo('clinician', 'Understand your doctor’s advice',
        'Review the prescription and instructions provided; ask if anything is unclear.', 'K5', 'Ask the clinic') +
      checklist('aftercare', 'Things to remember',
        ['Read the aftercare instructions for the correct visit.',
         'Saved questions to ask the doctor.',
         'Checked the follow-up date, if one was requested.'])),
    H7: () => section('RESULTS AND FOLLOW-UP', 'Information you need',
      grid(tip('document-check', 'View advice', 'Read the summary and instructions shared above.'),
        tip('message-circle', 'Still have questions?', 'Ask the clinic about your results.', 'K5', 'Contact'))),
    I1: () => section('STAY IN TOUCH', 'Choose the right support channel',
      grid(tip('message-circle', 'Send a question', 'Say clearly what is unclear so the clinic can respond.', 'I5', 'Messages'),
        tip('headphones', 'Need to reach us quickly?', 'Open Support and request a callback.', 'K5', 'Support'))),
    I2: () => section('POST-VISIT UPDATE', 'Keep it short and clear',
      details('What to include',
        list('What has changed since your visit?',
          'When did it start?',
          'What would you like the clinic to answer?'))),
    I3: () => section('MONITORING AT HOME', 'Notes for your next contact',
      checklist('followup', 'Suggested preparation',
        ['Re-read the instructions you received.',
         'Note any changes to tell the clinic.',
         'Prepare questions for your next contact.']) +
      details('If symptoms get worse',
        'Don’t wait for a reply in the app if you have warning signs. ' +
        'Call 115 or go to the nearest emergency department.')),
    I4: () => section('SPECIALIST REFERRAL', 'Before your next visit',
      grid(tip('document', 'Keep your appointment details', 'Review the referral and order details.'),
        tip('headphones', 'Unsure of the next step?', 'Contact the clinic to confirm.', 'K5', 'Support'))),
    I5: () => section('CARE MESSAGES', 'To get a clear reply',
      details('Writing a helpful message',
        'Mention the visit and your main question; never share passwords or verification codes. ' +
        'In an emergency, call 115 instead of waiting for a message.')),
    J1: () => section('FOLLOW-UP', 'Prepare for your next appointment',
      grid(tip('document-check', 'View past records', 'See advice and results that have been shared.', 'H6', 'Advice'),
        tip('headphones', 'Unsure about timing?', 'Contact the clinic for guidance.', 'K5', 'Support'))),
    K1: () => section('RELATED INFORMATION', 'Manage updates',
      grid(tip('calendar', 'Your appointments', 'See every change in your appointment details.', 'D1', 'Open'),
        tip('shield', 'Reminder settings', 'Notification and privacy options.', 'K4', 'Settings'))),
    K3: () => section('VISIT HISTORY', 'Find important information',
      grid(tip('document-check', 'Prescriptions and summaries', 'Choose a completed visit to see what was shared.'),
        tip('user', 'Family member profiles', 'Access to results depends on each profile.', 'K2', 'Profile'))),
    K4: () => section('PRIVACY', 'What do you control?',
      details('Data in this demo',
        'Status and sample data are stored in your browser. ' +
        'This is not a real medical records system. Do not enter real health data.') +
      band('Want the clinic to help with access to or changes to your records?', 'K5', 'Contact'))
  };
  function applyRealPhoto(node, selector, key, alt) {
    const element = node.querySelector(selector);
    if (!element || !IMG[key]) return;
    const fallback = element.getAttribute('src');
    if (!fallback) return;
    element.dataset.cfxFallback = fallback;
    element.src = IMG[key];
    if (alt !== undefined) element.alt = alt;
    element.loading = selector.includes('appointment-object') ? 'eager' : 'lazy';
  }
  function restoreChecklist(node, id, visitId) {
    node.querySelectorAll('[data-cfx-checklist]').forEach(group => {
      const storageKey = 'careflow-ui-check-v1:' + id + ':' + (visitId || 'none') +
        ':' + group.dataset.cfxChecklist;
      group.dataset.cfxStorage = storageKey;
      let checked = [];
      try { checked = JSON.parse(root.sessionStorage.getItem(storageKey) || '[]'); } catch (_) {}
      group.querySelectorAll('input[data-cfx-index]').forEach(input => {
        input.checked = Array.isArray(checked) && checked.includes(Number(input.dataset.cfxIndex));
      });
      updateChecklist(group);
    });
  }
  function updateChecklist(group) {
    const boxes = [...group.querySelectorAll('input[data-cfx-index]')];
    const done = boxes.filter(input => input.checked).length;
    const status = group.querySelector('.cfx-check-count');
    if (status) status.textContent = done + '/' + boxes.length + ' prepared';
    group.classList.toggle('is-complete', done === boxes.length);
  }
  function enrichExistingCards(content, s, id) {
    if (id !== 'B1') return;
    const upcoming = (s?.visits || [])
      .filter(visit => !['completed', 'cancelled', 'no-show'].includes(visit.status))
      .sort((a, b) => ((a.date || '') + (a.slot || '')).localeCompare((b.date || '') + (b.slot || '')))[0];
    const footer = content.querySelector('.cf-home-appointment-footer');
    if (upcoming && footer && upcoming.mode === 'onsite' &&
        ['confirmed', 'reminder'].includes(upcoming.status)) {
      const prepare = root.document.createElement('button');
      prepare.type = 'button';
      prepare.className = 'cfx-hero-secondary';
      prepare.dataset.action = 'go';
      prepare.dataset.to = 'E1';
      prepare.dataset.id = upcoming.id;
      prepare.textContent = 'Prepare for your visit';
      footer.prepend(prepare);
    }
    const aftercare = content.querySelector('.cf-home-care-card');
    const recent = (s?.visits || []).some(visit =>
      visit.status === 'completed' && root.CareFlowModel.canViewResults(s, visit));
    if (recent && aftercare) {
      const tools = root.document.createElement('div');
      tools.className = 'cfx-card-tools';
      tools.innerHTML = '<span>Unclear about advice or your prescription?</span>' +
        '<button type="button" data-action="go" data-to="K5">Ask the clinic ' +
        icon('arrow-right', 14) + '</button>';
      aftercare.append(tools);
    }
  }
  function decorate({id, s, u, guarded}) {
    const content = root.document.getElementById('phone-content');
    if (!content || guarded) return;
    const imagery = {
      B1: [['.appointment-object', 'appointment', ''],
           ['.ref-discover-image img', 'consultation', 'Sample photo of a clinic consultation from Unsplash']],
      D2: [['.ref-detail-hero img', 'radiology', 'Sample photo of a doctor talking with a patient from Unsplash']],
      K5: [['.cf-context-photo img', 'consultation', 'Sample photo of a consultation at the clinic from Unsplash']]
    };
    if (id.startsWith('A')) applyRealPhoto(content, '.auth-scene img', 'clinician',
      'Sample photo of a doctor from Unsplash');
    (imagery[id] || []).forEach(([selector, key, alt]) => applyRealPhoto(content, selector, key, alt));
    enrichExistingCards(content, s, id);
    const renderPanel = panels[id];
    if (!renderPanel) return;
    const panel = root.document.createElement('div');
    panel.className = 'cfx-insert cfx-screen-' + id.toLowerCase();
    panel.innerHTML = renderPanel({s, u});
    if (id === 'B1') {
      const anchor = content.querySelector('.cf-home-task-section');
      if (anchor) anchor.before(panel);
      else content.append(panel);
    } else {
      content.append(panel);
    }
    restoreChecklist(panel, id, s?.activeVisitId);
    panel.querySelectorAll('img[data-cfx-fallback]').forEach(img => img.addEventListener('error', fallbackImage, {once:true}));
  }
  function fallbackImage(event) {
    const img = event.currentTarget;
    const fallback = img.dataset.cfxFallback;
    if (fallback && img.getAttribute('src') !== fallback) {
      img.removeAttribute('data-cfx-fallback');
      img.src = fallback;
    }
  }
  root.document.addEventListener('error', function(event) {
    const img = event.target;
    if (img?.tagName === 'IMG' && img.dataset.cfxFallback) fallbackImage({currentTarget:img});
  }, true);
  root.document.addEventListener('change', function(event) {
    const checkbox = event.target.closest?.('input[data-cfx-index]');
    if (!checkbox) return;
    const group = checkbox.closest('[data-cfx-checklist]');
    if (!group) return;
    const indexes = [...group.querySelectorAll('input[data-cfx-index]')]
      .filter(input => input.checked).map(input => Number(input.dataset.cfxIndex));
    try { root.sessionStorage.setItem(group.dataset.cfxStorage, JSON.stringify(indexes)); } catch (_) {}
    updateChecklist(group);
  });
  root.CareFlowExperience = {decorate, IMG};
})(window);
