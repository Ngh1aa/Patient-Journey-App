const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const current=p=>p.locator('#phone-screen-tag');
const inPhone=(p,a)=>p.locator('#phone-main [data-action="'+a+'"]');
const select=(p,id)=>p.locator('#mobile-screen-picker').selectOption(id);
const patient=p=>p.locator('#phone-main');
test.beforeEach(async({page})=>{
 const problems=[];page.on('pageerror',e=>problems.push(e.message));
 await page.goto('/index.html');
 page.__careflowProblems=problems;
 await expect(current(page)).toHaveText('A1');
});
test.afterEach(async({page})=>expect(page.__careflowProblems||[],'uncaught JS errors').toEqual([]));
test('24 screens in navigator and 6-slot OTP',async({page})=>{
 await expect(page.locator('#mobile-screen-picker option')).toHaveCount(24);
 await expect(patient(page).locator('.otp-digit-box')).toHaveCount(6);
 await expect(patient(page)).toContainText('Chào mừng đến CareFlow');
});
test('login and 3-column desktop shell',async({page})=>{
 await page.setViewportSize({width:1440,height:960});
 await expect(page.locator('.sidebar')).toBeVisible();
 await expect(page.locator('#phone-frame')).toBeVisible();
 await expect(page.locator('.inspector')).toBeVisible();
 await inPhone(page,'login').click();
 await expect(current(page)).toHaveText('B1');
});
test('all 24 destinations render, with booking confirmation gated',async({page})=>{
 const screens=['A1','A2','B1','C1','C2','C3','C4','C5','D1','D2','D3','E1','E2','E3','E4','F1','F2','F3','F4','G1','G2','G3','H1'];
 for(const id of screens){
   await select(page,id);await expect(current(page)).toHaveText(id);
   await expect(page.locator('#phone-content h2').first()).toBeVisible();
 }
 await select(page,'C6');await expect(current(page)).toHaveText('C5');
});
test('safety flag requires clinician review, checkbox cannot clear it',async({page})=>{
 await select(page,"C2");
 await patient(page).locator('[data-action="chooseScreening"][data-value="warning"]').click();
 await inPhone(page,'nextScreening').click();await expect(current(page)).toHaveText('C3');
 await inPhone(page,'openContinueConfirmation').click();
 await expect(patient(page)).toContainText('Tôi hiểu');
 await inPhone(page,'toggleSafetyAck').click();
 await inPhone(page,'confirmContinueBooking').click();
 await expect(current(page)).toHaveText('C3');
 await select(page,'C4');await expect(current(page)).toHaveText('C3');
});
test('scheduling reselects day and confirms with retained date',async({page})=>{
 await inPhone(page,'login').click();await inPhone(page,'startBooking').click();
 await inPhone(page,'nextPerson').click();
 await patient(page).locator('[data-action="chooseScreening"][data-value="normal"]').click();
 await inPhone(page,'nextScreening').click();await expect(current(page)).toHaveText('C4');
 const day=await patient(page).locator('[data-action="chooseDate"]').nth(1).getAttribute("data-value");
 await patient(page).locator('[data-action="chooseDate"]').nth(1).click();
 await patient(page).locator('[data-action="chooseSlot"][data-value="14:30"]').click();
 await inPhone(page,'nextSlot').click();await expect(current(page)).toHaveText('C5');
 const shown=new Intl.DateTimeFormat("vi-VN",{day:"2-digit",month:"2-digit",timeZone:"Asia/Ho_Chi_Minh"}).format(new Date(day+"T12:00:00+07:00"));
 await expect(patient(page)).toContainText(shown);
 await inPhone(page,'confirmBooking').click();
 await expect(current(page)).toHaveText('C6');
});
test('video failure and recovery controls route',async({page})=>{
 await select(page,'E2');await inPhone(page,'joinVideo').click();await expect(current(page)).toHaveText('E3');
 await inPhone(page,'dropCall').click();await expect(current(page)).toHaveText('E4');
 await inPhone(page,'requestCallback').click();
 await expect(patient(page)).toContainText('Đã gửi yêu cầu');
});
test('payment cannot silently become paid after showing QR',async({page})=>{
 await select(page,'F1');await expect(patient(page)).toContainText('350.000 ₫');
 await inPhone(page,'beginPayment').click();
 await expect(patient(page)).toContainText('Đang kiểm tra khoản chuyển');
 await expect(page.locator('#inspector-content')).toContainText('pending_reconciliation');
});
test('messaging and settings remain interactive',async({page})=>{
 await select(page,'F4');
 await patient(page).locator('[data-action="contactTab"][data-value="0"]').click();
 await patient(page).locator('[data-field="supportMessage"]').fill('Tôi muốn hỏi lịch khám');
 await inPhone(page,'sendMessage').click();
 await expect(patient(page)).toContainText('Tôi muốn hỏi lịch khám');
 await select(page,'G3');
 await patient(page).locator('[data-action="setFontSize"][data-value="1"]').click();
 await expect(page.locator('body')).toHaveClass(/large-text/);
});
test('supports 360px width without document horizontal overflow',async({page})=>{
 await page.setViewportSize({width:360,height:800});
 await select(page,'H1');
 const size=await page.evaluate(()=>({width:document.documentElement.scrollWidth,view:window.innerWidth}));
 expect(size.width).toBeLessThanOrEqual(size.view+2);
});
test('targeted accessibility scan of new help and login',async({page})=>{
 for(const id of ['A1','H1','G3']){
  await select(page,id);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  const severe=result.violations.filter(v=>['serious','critical'].includes(v.impact));
  expect(severe,JSON.stringify(severe.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))).toEqual([]);
 }
});
