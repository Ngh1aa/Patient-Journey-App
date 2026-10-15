const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const routes = ['/reception', '/calendar', '/patients', '/appointments/', '/doctor', '/encounters/', '/results'];
test('standalone shell with accessible target', () => { assert.match(html, /lang="vi"/); assert.match(html, /id="content"|href="#content"/); assert.match(html, /app\.js/); });
test('eight showcase surfaces are implemented', () => { for(const s of ['receptionPage','calendarPage','patientsPage','patientProfilePage','appointmentDrawer','doctorPage','consultationPage','resultsPage']) assert.match(js, new RegExp('function '+s+'\\(')); });
test('all routes have reachable navigation', () => { for(const r of routes) assert.ok(js.includes(r),r); });
test('brand tokens and responsive layouts exist', () => { for(const t of ['#0a67d1','#f2f6fb','Be Vietnam Pro','prefers-reduced-motion','@media']) assert.ok(css.includes(t),t); });
test('demo caveats and reset are explicit', () => { assert.match(js, /Dữ liệu minh họa/); assert.match(js, /reset-demo/); });

test('eight follow-up showcase surfaces and shared entrypoints are present',()=>{ const ext=fs.readFileSync(path.join(__dirname,'supporting.js'),'utf8'); const newCss=fs.readFileSync(path.join(__dirname,'supporting.css'),'utf8'); for(const url of ['/requests','/booking/new','/checkin','/queue','/clinical/orders','/clinical/prescription','/clinical/review','/welcome']) assert.ok(ext.includes(url),url);assert.match(html,/supporting\.js/);assert.match(html,/supporting\.css/);assert.match(js,/supportingContext/);assert.match(newCss,/support-welcome/); });
