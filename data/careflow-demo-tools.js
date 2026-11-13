/* CareFlow demo tools switch — shared by the patient app and the clinic workspace.
 * Reset and failure-simulation controls stay hidden from normal visitors. They appear only after
 * opening a URL with ?demo=1; the choice is kept in sessionStorage for the tab, and ?demo=0
 * turns it off again. Each app renders its own small "Demo tools" menu when enabled() is true. */
(function (root) {
  'use strict';
  const KEY = 'careflow.demoTools';
  let on = false;
  try {
    const flag = new URLSearchParams(root.location.search).get('demo');
    if (flag === '1') root.sessionStorage.setItem(KEY, '1');
    else if (flag === '0') root.sessionStorage.removeItem(KEY);
    on = root.sessionStorage.getItem(KEY) === '1';
  } catch {
    try { on = new URLSearchParams(root.location.search).get('demo') === '1'; } catch { on = false; }
  }
  if (on && root.document) root.document.documentElement.classList.add('cf-demo-on');
  root.CareFlowDemoTools = Object.freeze({ KEY, enabled: () => on });
})(window);
