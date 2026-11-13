const {test,expect}=require('../prototype/node_modules/@playwright/test');
const AxeBuilder=require('../prototype/node_modules/@axe-core/playwright').default;
const home='/staff-prototype/index.html#/doctor';
const filter=(page,key,value)=>page.locator(`[data-action="doc-dashboard-filter"][data-group="${key}"][data-value="${value}"]`);
const select=(page,key)=>page.locator(`[data-dashboard-field="${key}"]`);
async function persistInitialFixture(page){
 // The real prototype saves lazily after an edit. Exercise that API before seeding stress states.
 for(let i=0;i<2;i++){
  await select(page,'taskStatus').selectOption('all');
  await page.locator('[data-task-id="case-a-033"] [data-action="doc-task-toggle"]').click();
 }
}

test('agenda combines accent-insensitive search, status, mode, sorting and browser Back',async({page})=>{
 await page.goto(home);
 await expect(page.locator('.doctor-agenda-row')).toHaveCount(7);
 await page.locator('#doctor-agenda-search').pressSequentially('hoang nhat');
 await expect(page.locator('#doctor-agenda-search')).toHaveValue('hoang nhat');
 await expect(page.locator('#doctor-agenda-search')).toBeFocused();
 await expect(page.locator('.doctor-agenda-row')).toHaveCount(1);
 await select(page,'agendaStatus').selectOption('ready');
 await select(page,'agendaMode').selectOption('online');
 await expect(page.locator('.doctor-agenda-row')).toContainText('Hoàng Nhật Nam');
 await select(page,'agendaSort').selectOption('desc');
 await page.locator('.doctor-agenda-row [data-to="/doctor/online/a-040"]').click();
 await expect(page).toHaveURL(/doctor\/online\/a-040$/);
 await page.goBack();
 await expect(page.locator('#doctor-agenda-search')).toHaveValue('hoang nhat');
 await expect(select(page,'agendaMode')).toHaveValue('online');
 await expect(page.locator('.doctor-agenda-row')).toHaveCount(1);
 await page.locator('#doctor-agenda-search').fill('NO SUCH RECORD');
 await expect(page.locator('.doctor-today')).toContainText('No matching visits found');
 await page.locator('.doctor-agenda-feedback [data-action="doc-dashboard-reset"]').click();
 await expect(page.locator('.doctor-agenda-row')).toHaveCount(7);
 await expect(page.locator('.doctor-agenda-row').first()).toContainText('14:30');
 await page.locator('#doctor-agenda-search').fill('PK-1015-027');
 await expect(page.locator('.doctor-agenda-row')).toContainText('Phạm Gia Huy');
});

test('result card opens the exact result across prior filters and updates counts after review',async({page})=>{
 await page.goto(home);
 await expect(page.locator('.doctor-result-item')).toHaveCount(2);
 await filter(page,'result','waiting').click();
 await expect(filter(page,'result','waiting')).toBeFocused();
 await expect(page.locator('.doctor-result-item')).toContainText('Chest X-ray');
 await page.locator('.doctor-result-item button').click();
 await expect(page.locator('.doctor-result-preview')).toContainText('CD-2033');
 await expect(page.locator('[data-action="review-result"]')).toBeDisabled();
 await page.locator('[data-action="doc-result-filter"][data-value="reviewed"]').click();
 await page.goBack();
 await expect(filter(page,'result','waiting')).toHaveAttribute('aria-pressed','true');
 await filter(page,'result','ready').click();
 await page.locator('.doctor-result-item[data-result-id="r-04"] button').click();
 await expect(page.locator('.doctor-lab-row.selected')).toContainText('Urinalysis');
 await expect(page.locator('.doctor-result-preview')).toContainText('XN-1156');
 await page.locator('[data-action="review-result"][data-id="r-04"]').click();
 await page.goBack();
 await expect(page.locator('.doctor-result-item')).toHaveCount(1);
 await expect(filter(page,'result','ready')).toContainText('1');
 await filter(page,'result','reviewed').click();
 await expect(page.locator('.doctor-result-item')).toContainText('Urinalysis');
});

test('decision brief exposes missing-input recovery and the actual handoff',async({page})=>{
 await page.goto(home);
 await filter(page,'decision','handoff').click();
 await expect(page.locator('.doctor-decision-card')).toContainText('No handed-over requests yet');
 await filter(page,'decision','mine').click();
 await page.locator('.doctor-decision-item button').click();
 await page.locator('[data-action="doc-triage-handoff"]').click();
 await expect(page.locator('.toast')).toContainText('choose an approach and enter a handover note');
 await page.locator('#journey-triage-decision').selectOption('Request more information');
 await page.locator('#journey-triage-note').fill('Coordinator to verify the information provided by the patient.');
 await page.locator('[data-action="doc-triage-handoff"]').click();
 await expect(page.locator('.journey-confirm')).toContainText('Awaiting coordinator');
 await page.goBack();
 await expect(filter(page,'decision','mine')).toContainText('0');
 await filter(page,'decision','handoff').click();
 await expect(page.locator('.doctor-decision-item')).toContainText('Request more information');
 await expect(page.locator('.doctor-decision-item')).toContainText('Coordinator to verify');
 await expect(page.locator('.doctor-decision-item')).toContainText('Coordinator');
});

test('encounter workspace reflects real draft completeness after return',async({page})=>{
 await page.goto(home);
 await expect(page.locator('.doctor-encounter-record')).toContainText('0/3 sections filled');
 await page.locator('.doctor-now [data-to="/encounters/a-033"]').click();
 for(const name of ['symptom','assessment','plan'])await page.locator(`textarea[name="${name}"]`).fill('Simulated content to check draft saving.');
 await page.goBack();
 await expect(page.locator('.doctor-encounter-record')).toContainText('3/3 sections filled');
 await expect(page.locator('.doctor-record-checklist li')).toHaveCount(3);
 await expect(page.locator('.doctor-now')).toContainText('Review the content before completing');
});

test('online sessions separate connection preparation from coordinator support',async({page})=>{
 await page.goto(home);
 await filter(page,'online','support').click();
 await expect(page.locator('.doctor-online-item')).toHaveCount(1);
 await expect(page.locator('.doctor-online-item')).toContainText('Mai Khánh Vy');
 await expect(page.locator('.doctor-online-item')).toContainText('Assigned to: Coordinator');
 await expect(page.locator('.doctor-online-item [data-action="start-consult"]')).toHaveCount(0);
 await filter(page,'online','prepare').click();
 await expect(filter(page,'online','prepare')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.doctor-online-item')).toContainText('Hoàng Nhật Nam');
 await page.locator('.doctor-online-item button').click();
 await expect(page).toHaveURL(/doctor\/online\/a-040$/);
 await expect(page.locator('[data-action="start-consult"]')).toHaveCount(0);
 await page.locator('[data-action="doc-online-connect"]').click();
 await page.goBack();
 await expect(page.locator('.doctor-online-item')).toContainText('Connection confirmed');
 await page.locator('.doctor-online-item [data-action="start-consult"]').click();
 await expect(page).toHaveURL(/encounters\/a-040$/);
 await page.goBack();
 await select(page,'currentEncounter').selectOption('a-040');
 await expect(page.locator('.doctor-now-person')).toContainText('Hoàng Nhật Nam');
 await expect(page.locator('.doctor-now [data-to="/encounters/a-040"]')).toBeVisible();
});

test('aftercare cards filter accountable owner and status, persist completion and reopen',async({page})=>{
 await page.goto(home);
 await expect(page.locator('.doctor-task-item')).toHaveCount(2);
 await expect(page.locator('.doctor-task-item').first()).toContainText('16/10/2026');
 await filter(page,'taskOwner','delegated').click();
 await expect(page.locator('.doctor-task-item')).toContainText('Mai Khánh Vy');
 await expect(page.locator('.doctor-task-item [data-action="doc-task-toggle"]')).toHaveCount(0);
 await filter(page,'taskOwner','mine').click();
 await page.locator('[data-task-id="case-a-033"] [data-action="doc-task-toggle"]').click();
 await expect(page.locator('.doctor-task-item')).toHaveCount(1);
 await select(page,'taskStatus').selectOption('done');
 await expect(page.locator('.doctor-task-item')).toContainText('Monitoring after follow-up visit');
 await page.reload();
 await select(page,'taskStatus').selectOption('done');
 await expect(page.locator('.doctor-task-item.is-done')).toHaveCount(1);
 await page.locator('.doctor-task-item [data-action="doc-task-toggle"]').click();
 await expect(page.locator('.doctor-aftercare-card')).toContainText('No matching tasks');
 await select(page,'taskStatus').selectOption('open');
 await expect(page.locator('[data-task-id="case-a-033"]')).toBeVisible();
});

test('empty dashboard and synchronous offline rendering recover without a dead end',async({page,context})=>{
 await page.goto(home);
 await persistInitialFixture(page);
 await page.evaluate(()=>{
  const key='careflow.clinic.showcase.v1',data=JSON.parse(sessionStorage.getItem(key));
  // Preserve IDs to avoid demo migrations; remove assignments, not canonical fixture records.
  data.appointments.forEach(a=>a.doctor='Dr. Trần Phương Linh');
  data.results.forEach(r=>r.doctor='Dr. Trần Phương Linh');data.doctorTasks=[];
  sessionStorage.setItem(key,JSON.stringify(data));
 });
 await page.reload();
 await expect(page.locator('.doctor-now')).toContainText('No consultation in progress');
 await expect(page.locator('.doctor-today')).toContainText('No appointments yet');
 await expect(page.locator('.doctor-agenda-row')).toHaveCount(0);
 await expect(page.locator('.doctor-online-card')).toContainText('No matching sessions');
 await context.setOffline(true);
 await filter(page,'result','reviewed').click();
 await expect(page.locator('.doctor-labs-today')).toContainText('No reviewed results yet');
 await expect(page.locator('.doctor-heading [data-to="/doctor/schedule"]')).toBeEnabled();
 await context.setOffline(false);
});

test('dashboard supports long content, 200% text, keyboard focus and semantic a11y',async({page},info)=>{
 test.setTimeout(90000); // Axe plus eight reload/reflow captures form one deliberate stress case.
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(home);
 const axe=await new AxeBuilder({page}).include('.doctor-home').analyze();
 expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 await persistInitialFixture(page);
 await page.evaluate(()=>{
  const key='careflow.clinic.showcase.v1',data=JSON.parse(sessionStorage.getItem(key));
  data.appointments[0].reason='Long visit reason text used to check line wrapping behaviour '.repeat(8);
  data.doctorTasks[0].title='Monitor and cross-check information from the follow-up visit with long content '.repeat(4);
  data.doctorTasks[0].next='Next handling step with long content and a record code '.repeat(6);
  data.results[0].title='Long result sheet name to check layout and buttons '.repeat(4);
  sessionStorage.setItem(key,JSON.stringify(data));
 });
 for(const width of [320,390,768,1100,1101,1280,1440,1920]){
  await page.setViewportSize({width,height:900});await page.reload();
  await page.evaluate(()=>{document.documentElement.style.fontSize='200%';document.documentElement.style.setProperty('--font-scale','2')});
  const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,clipped:[...document.querySelectorAll('.doctor-home button,.doctor-home input,.doctor-home select')].filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>({text:el.innerText,value:el.value}))}));
  expect(metrics.scroll,`${width}px document overflow`).toBeLessThanOrEqual(width+1);
  expect(metrics.clipped,`${width}px controls clipped`).toEqual([]);
 }
 await page.setViewportSize({width:390,height:844});await page.reload();
 await filter(page,'decision','all').focus();await page.keyboard.press('Enter');
 await expect(filter(page,'decision','all')).toBeFocused();
 await expect(filter(page,'decision','all')).toHaveCSS('outline-style','solid');
 await page.screenshot({path:info.outputPath('cards-long-mobile.png'),fullPage:true});
 expect(errors).toEqual([]);
});
