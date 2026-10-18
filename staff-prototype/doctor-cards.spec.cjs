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
 await page.locator('#doctor-agenda-search').fill('KHÔNG CÓ HỒ SƠ');
 await expect(page.locator('.doctor-today')).toContainText('Không tìm thấy lượt khám phù hợp');
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
 await expect(page.locator('.doctor-result-item')).toContainText('X-quang ngực');
 await page.locator('.doctor-result-item button').click();
 await expect(page.locator('.doctor-result-preview')).toContainText('CD-2033');
 await expect(page.locator('[data-action="review-result"]')).toBeDisabled();
 await page.locator('[data-action="doc-result-filter"][data-value="reviewed"]').click();
 await page.goBack();
 await expect(filter(page,'result','waiting')).toHaveAttribute('aria-pressed','true');
 await filter(page,'result','ready').click();
 await page.locator('.doctor-result-item[data-result-id="r-04"] button').click();
 await expect(page.locator('.doctor-lab-row.selected')).toContainText('Tổng phân tích nước tiểu');
 await expect(page.locator('.doctor-result-preview')).toContainText('XN-1156');
 await page.locator('[data-action="review-result"][data-id="r-04"]').click();
 await page.goBack();
 await expect(page.locator('.doctor-result-item')).toHaveCount(1);
 await expect(filter(page,'result','ready')).toContainText('1');
 await filter(page,'result','reviewed').click();
 await expect(page.locator('.doctor-result-item')).toContainText('Tổng phân tích nước tiểu');
});

test('decision brief exposes missing-input recovery and the actual handoff',async({page})=>{
 await page.goto(home);
 await filter(page,'decision','handoff').click();
 await expect(page.locator('.doctor-decision-card')).toContainText('Chưa có yêu cầu đã bàn giao');
 await filter(page,'decision','mine').click();
 await page.locator('.doctor-decision-item button').click();
 await page.locator('[data-action="doc-triage-handoff"]').click();
 await expect(page.locator('.toast')).toContainText('chọn hướng xử lý và nhập ghi chú');
 await page.locator('#journey-triage-decision').selectOption('Yêu cầu bổ sung thông tin');
 await page.locator('#journey-triage-note').fill('Cần điều phối xác minh thông tin do người bệnh cung cấp.');
 await page.locator('[data-action="doc-triage-handoff"]').click();
 await expect(page.locator('.journey-confirm')).toContainText('Đang chờ điều phối');
 await page.goBack();
 await expect(filter(page,'decision','mine')).toContainText('0');
 await filter(page,'decision','handoff').click();
 await expect(page.locator('.doctor-decision-item')).toContainText('Yêu cầu bổ sung thông tin');
 await expect(page.locator('.doctor-decision-item')).toContainText('Cần điều phối xác minh');
 await expect(page.locator('.doctor-decision-item')).toContainText('Điều phối');
});

test('encounter workspace reflects real draft completeness after return',async({page})=>{
 await page.goto(home);
 await expect(page.locator('.doctor-encounter-record')).toContainText('0/3 mục đã điền');
 await page.locator('.doctor-now [data-to="/encounters/a-033"]').click();
 for(const name of ['symptom','assessment','plan'])await page.locator(`textarea[name="${name}"]`).fill('Nội dung giả lập để kiểm tra lưu bản nháp.');
 await page.goBack();
 await expect(page.locator('.doctor-encounter-record')).toContainText('3/3 mục đã điền');
 await expect(page.locator('.doctor-record-checklist li')).toHaveCount(3);
 await expect(page.locator('.doctor-now')).toContainText('Cần rà soát nội dung trước khi hoàn tất');
});

test('online sessions separate connection preparation from coordinator support',async({page})=>{
 await page.goto(home);
 await filter(page,'online','support').click();
 await expect(page.locator('.doctor-online-item')).toHaveCount(1);
 await expect(page.locator('.doctor-online-item')).toContainText('Mai Khánh Vy');
 await expect(page.locator('.doctor-online-item')).toContainText('Phụ trách: Điều phối');
 await expect(page.locator('.doctor-online-item [data-action="start-consult"]')).toHaveCount(0);
 await filter(page,'online','prepare').click();
 await expect(filter(page,'online','prepare')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.doctor-online-item')).toContainText('Hoàng Nhật Nam');
 await page.locator('.doctor-online-item button').click();
 await expect(page).toHaveURL(/doctor\/online\/a-040$/);
 await expect(page.locator('[data-action="start-consult"]')).toHaveCount(0);
 await page.locator('[data-action="doc-online-connect"]').click();
 await page.goBack();
 await expect(page.locator('.doctor-online-item')).toContainText('Đã xác nhận kết nối');
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
 await expect(page.locator('.doctor-task-item')).toContainText('Theo dõi sau tái khám');
 await page.reload();
 await select(page,'taskStatus').selectOption('done');
 await expect(page.locator('.doctor-task-item.is-done')).toHaveCount(1);
 await page.locator('.doctor-task-item [data-action="doc-task-toggle"]').click();
 await expect(page.locator('.doctor-aftercare-card')).toContainText('Không có công việc phù hợp');
 await select(page,'taskStatus').selectOption('open');
 await expect(page.locator('[data-task-id="case-a-033"]')).toBeVisible();
});

test('empty dashboard and synchronous offline rendering recover without a dead end',async({page,context})=>{
 await page.goto(home);
 await persistInitialFixture(page);
 await page.evaluate(()=>{
  const key='careflow.clinic.showcase.v1',data=JSON.parse(sessionStorage.getItem(key));
  // Preserve IDs to avoid demo migrations; remove assignments, not canonical fixture records.
  data.appointments.forEach(a=>a.doctor='BS. Trần Phương Linh');
  data.results.forEach(r=>r.doctor='BS. Trần Phương Linh');data.doctorTasks=[];
  sessionStorage.setItem(key,JSON.stringify(data));
 });
 await page.reload();
 await expect(page.locator('.doctor-now')).toContainText('Chưa có buổi khám đang thực hiện');
 await expect(page.locator('.doctor-today')).toContainText('Chưa có lịch khám');
 await expect(page.locator('.doctor-agenda-row')).toHaveCount(0);
 await expect(page.locator('.doctor-online-card')).toContainText('Không có phiên phù hợp');
 await context.setOffline(true);
 await filter(page,'result','reviewed').click();
 await expect(page.locator('.doctor-labs-today')).toContainText('Chưa có kết quả đã xem');
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
  data.appointments[0].reason='Nội dung lý do khám dài dùng để kiểm tra khả năng xuống dòng '.repeat(8);
  data.doctorTasks[0].title='Theo dõi và đối chiếu thông tin của lần tái khám với nội dung dài '.repeat(4);
  data.doctorTasks[0].next='Bước xử lý tiếp theo có nội dung dài và mã hồ sơ '.repeat(6);
  data.results[0].title='Tên phiếu kết quả dài để kiểm tra bố cục và nút bấm '.repeat(4);
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
