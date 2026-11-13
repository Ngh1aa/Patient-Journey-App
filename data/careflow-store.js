/* CareFlow demo store — sessionStorage persistence shared by the patient app and
 * the clinic workspace when they run in the same browser tab.
 *
 * - Data lives under one key (careflow.browser.v3, the patient app's existing
 *   session key) so a change made in one app is visible in the other.
 * - request() simulates network latency and an optional, recoverable failure.
 *   Nothing leaves the browser.
 */
(function (root) {
  'use strict';
  const KEY = 'careflow.browser.v3';
  const FAIL_KEY = 'careflow.demo.failNext';
  const LEGACY_KEYS = ['careflow.clinic.showcase.v1'];
  const Seed = () => root.CareFlowSeed;
  // One-time reseed after the English translation: a tab that still holds the earlier
  // Vietnamese seed in sessionStorage starts again from the English seed. Runs before
  // either app reads its state (this script loads ahead of both apps).
  const LOCALE_KEY = 'careflow.locale';
  const LOCALE = 'en-GB.1';
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(LOCALE_KEY) !== LOCALE) {
      for (const k of [KEY, FAIL_KEY, ...LEGACY_KEYS]) sessionStorage.removeItem(k);
      sessionStorage.setItem(LOCALE_KEY, LOCALE);
    }
  } catch { /* storage blocked: nothing stored to migrate */ }
  const valid = (s) => s && s.version === 3 && Array.isArray(s.visits) && Array.isArray(s.profiles);

  function readRaw() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
  }
  /** Current state, or a fresh copy of the seed when the tab has none yet. */
  function load() {
    const saved = readRaw();
    if (valid(saved?.state)) return Seed().ensure(saved.state);
    return Seed().build();
  }
  /** Persist state and keep whatever UI data the patient app stored next to it. */
  function save(state, ui) {
    const saved = readRaw() || {};
    const next = { state, ui: ui !== undefined ? ui : saved.ui || { inspection: true } };
    sessionStorage.setItem(KEY, JSON.stringify(next));
  }
  /** Drop every user change and start again from data/careflow-seed.js. */
  function reset({ keepAuth = false } = {}) {
    const before = readRaw()?.state;
    const fresh = Seed().build();
    if (keepAuth && before?.authenticated) fresh.authenticated = true;
    try {
      for (const k of LEGACY_KEYS) sessionStorage.removeItem(k);
      sessionStorage.removeItem(FAIL_KEY);
      sessionStorage.setItem(KEY, JSON.stringify({ state: fresh, ui: { inspection: true } }));
    } catch { /* storage blocked: caller still gets the fresh state */ }
    return fresh;
  }
  const failNext = {
    get() { try { return sessionStorage.getItem(FAIL_KEY) === '1'; } catch { return false; } },
    set(on) { try { on ? sessionStorage.setItem(FAIL_KEY, '1') : sessionStorage.removeItem(FAIL_KEY); } catch { /* ignore */ } },
  };
  class DemoError extends Error {
    constructor() { super('Could not reach the demo server. Your data has not changed.'); this.code = 'SIMULATED'; }
  }
  /** Simulate a server round-trip. fn runs only on success; a failure leaves data untouched. */
  function request(fn, { delay = 450 } = {}) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (failNext.get()) { failNext.set(false); reject(new DemoError()); return; }
        try { resolve(fn ? fn() : undefined); } catch (err) { reject(err); }
      }, delay);
    });
  }
  const uid = (prefix) => prefix + '-' + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 5);
  const api = { KEY, FAIL_KEY, LOCALE_KEY, load, save, reset, request, failNext, DemoError, uid, readRaw };
  root.CareFlowStore = api;
})(typeof window !== 'undefined' ? window : globalThis);
