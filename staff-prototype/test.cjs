const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=(name)=>fs.readFileSync(path.join(__dirname,name),'utf8');
const html=read('index.html'),app=read('app.js'),doctor=read('doctor-showcase.js'),css=read('doctor-showcase.css');
test('public prototype is doctor only',()=>{
  assert.match(app,/function normalizeDoctorPath/);
  assert.match(app,/role:'doctor'/);
  assert.match(app,/Điều hướng bác sĩ/);
  assert.doesNotMatch(app.slice(app.indexOf('function sidebar()'),app.indexOf('function header()')),/data-role="reception"|data-role="nurse"/);
  assert.match(doctor,/CareFlowDoctor/);
  assert.match(doctor,/return false/);
});
test('doctor IA and core interactions are implemented',()=>{
  for(const route of ['/doctor','/doctor/schedule','/doctor/queue','/doctor/followups','/patients','/results','/clinical/orders','/clinical/prescription','/clinical/review'])assert.ok(doctor.includes(route)||app.includes(route),route);
  for(const action of ['doc-day','doc-today','doc-filter-queue','doc-result-filter','doc-task-toggle'])assert.ok(doctor.includes(action),action);
  assert.match(app,/review-sign/);assert.match(app,/review-result/);assert.match(app,/save-draft/);
});
test('consistent brand, responsive constraints and accessibility contracts',()=>{
 assert.match(html,/doctor-showcase\.css/);assert.match(html,/doctor-showcase\.js/);
 assert.match(css,/#0a67d1/i);assert.match(css,/Be Vietnam Pro/);
 assert.match(css,/@media\(max-width:1290px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/:focus-visible/);
 assert.match(app,/Dữ liệu minh họa/);
});
