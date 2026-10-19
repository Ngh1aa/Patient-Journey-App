const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const snapshot=page=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')));
for(const entered of [false,true])test(`legacy booking deep link restores guide without replacing ${entered?'entered':'empty'} draft`,async({page},info)=>{
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/prototype/index.html?scenario=empty');
 await page.evaluate(entered=>{
  const s=CareFlowModel.fixture('empty');
  s.profiles[0].name='Người xem đã có hồ sơ';
  CareFlowModel.beginBooking(s);
  sessionStorage.setItem('careflow.browser.v3',JSON.stringify({state:s,ui:{screen:'C2',forms:{reason:{reason:entered?'Nội dung đang viết cần giữ lại':'',medicalHistory:entered?'Thông tin đã nhập cần giữ lại':''}}}}));
 },entered);
 await page.goto('about:blank');
 await page.goto('/prototype/index.html#/book/reason');
 await expect(page.locator('.journey-panel')).toBeVisible();
 await expect(page.locator('.journey-item > button')).toHaveCount(12);
 await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C2');
 await expect(page.locator('#phone-content')).toContainText('Người xem đã có hồ sơ');
 await expect(page.locator('#reason')).toHaveValue(entered?'Nội dung đang viết cần giữ lại':'Đau đầu hai ngày, ngủ không ngon.');
 await expect(page.locator('#medicalHistory')).toHaveValue(entered?'Thông tin đã nhập cần giữ lại':'Chưa có thông tin cần bổ sung.');
 expect((await snapshot(page)).state.visits).toHaveLength(0);
 await page.reload();
 await expect(page.locator('.journey-panel')).toBeVisible();
 await expect(page.locator('#reason')).not.toHaveValue('');
 await page.screenshot({path:info.outputPath(`restored-booking-${entered?'entered':'empty'}.png`)});
 await page.locator('#phone-content form [type=submit]').click();
 await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C3');
 await expect(page.locator('.journey-checklist [aria-current=step]')).toContainText('Sàng lọc');
});
test('explicit inspection mode persists through reload without presentation autofill',async({page})=>{
 await page.goto('/prototype/index.html?scenario=empty');
 await page.locator('#bottom-nav .nav-book').click();
 await page.locator('#phone-content form [type=submit]').click();
 await page.reload();
 await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C2');
 await expect(page.locator('.journey-panel')).toBeHidden();
 await expect(page.locator('#reason')).toHaveValue('');
});
const cases={F1:['default'],F2:['default'],F3:['review','emergency'],F4:['default'],F5:['visit','during'],F6:['cancel','no-show','reschedule'],F7:['default'],F8:['callback','online','onsite'],F9:['transfer','counter','pharmacy','later','refund','free'],F10:['summary','more','explain','callback'],F11:['medicine','question','symptoms','urgent','tracking','referral'],F12:['default']};
for(const [flow,branches] of Object.entries(cases))for(const branch of branches){
 test(`guided ${flow}/${branch}: patient clicks and clinic handoffs complete the checklist`,async({page})=>{
  await page.setViewportSize({width:1366,height:960});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`/prototype/index.html?journey=${flow}&branch=${branch}`);
  await expect(page.locator('.journey-item.active')).toBeVisible();
  for(let turn=0;turn<28;turn++){
   const before=await snapshot(page),guide=before.ui.journey;
   const step=await page.evaluate(()=>{const {ui}=JSON.parse(sessionStorage.getItem('careflow.browser.v3'));const f=CareFlowJourney.flows.find(x=>x.id===ui.journey.id);return {length:f.steps(ui.journey.variant).length,event:!!f.steps(ui.journey.variant)[ui.journey.index]?.event};});
   if(guide.index===step.length)break;
   const screen=await page.locator('#phone-content').getAttribute('data-screen');
   const app=page.locator('#phone-content');
   if(flow==='F3' && branch==='emergency'){
    if(!before.ui.emergencyOpened)await app.locator('[data-action=directions]').click();
    else {
     await page.context().route('https://www.google.com/maps/**',route=>route.fulfill({status:200,body:'Map navigation target'}));
     const opened=page.waitForEvent('popup');
     await page.locator('#dialog-actions a').first().click();
     const map=await opened;await expect(map).toHaveURL(/google\.com\/maps\//);await map.close();
     await page.locator('#dialog [data-action=close-dialog]').click();
    }
   }
   else if(step.event)await page.locator('[data-action=journey-next]').click();
   else if(screen==='G1' && !before.ui.deviceReady){
    await app.locator('[data-action=device]').click();await page.locator('[data-action=device-ready]').click();
    await expect(app.locator('[data-action=join]')).toBeDisabled();
   }else if(screen==='C4' && flow==='F11')await app.locator('[data-to=I5]').click();
   else if(screen==='C4')await app.locator(`[data-action=${branch==='emergency'?'stop-booking':'safety-continue'}]`).click();
   else if(screen==='G5')await app.locator(`[data-purpose=${branch==='online'?'online-retry':'convert-onsite'}]`).click();
   else if(screen==='B1')await page.locator('#bottom-nav .nav-book').click();
   else if(screen==='G1')await app.locator('[data-action=join]').click();
   else if(screen==='F2' && flow==='F5')await app.locator(guide.index===0?'[data-to=F3]':'.btn.primary').first().click();
   else if(screen==='H2')await app.locator(`[data-status=${branch==='pharmacy'?'pharmacy-pending':'counter-pending'}]`).click();
   else if(screen==='H7' && branch==='explain')await app.locator('[data-purpose=explanation]').click();
   else if(await app.locator('form [type=submit]').count()){
    await app.locator('form [type=submit]').click();
    if(screen==='D4')await page.locator('[data-action=confirm-cancel]').click();
   }else await app.locator('.btn.primary:not(:disabled)').first().click();
   await expect.poll(async()=>{
    const after=await snapshot(page);
    return after.ui.journey.index>guide.index || after.ui.screen!==screen;
   }).toBe(true);
  }
  const final=await snapshot(page);
  await expect(page.locator('.journey-progress')).toContainText('Hành trình đã hoàn tất');
  expect(errors).toEqual([]);
  const v=final.state.visits.find(x=>x.id===final.state.activeVisitId);
  if(flow==='F12'){
   expect(v.previousId).toBeTruthy();expect(v.reason).toContain('cập nhật');
   expect(v.status).toBe('reminder');expect(final.state.visits[0].status).toBe('completed');
  }
  if(flow==='F11'){
   expect(v.care.tasks.at(-1).status).toBe('answered');expect(v.care.tasks.at(-1).history).toHaveLength(4);
  }
  if(flow==='F5')expect(v.labs[0].continuation).toBe(branch==='during'?'review-during':'return-to-visit');
  if(flow==='F8'&&branch==='callback')expect(v.communication.callback).toBe('resolved');
  await expect(page.locator('#phone-frame')).not.toContainText(/Bản demo|kiểm thử|mock/i);
 });
}
test('guided shell is accessible, responsive, persistent and uses prefilled fields',async({page},info)=>{
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/prototype/index.html');
 await expect(page.locator('.demo-bar, #demo-warning')).toHaveCount(0);
 await expect(page.locator('body')).not.toContainText('Trải nghiệm minh họa');
 await expect(page.locator('#phone')).toHaveValue('0900000000');
 expect(await page.locator('.journey-item > button').count()).toBe(12);
 const panel=await page.locator('.journey-panel').boundingBox(),phone=await page.locator('.phone').boundingBox();expect(panel.x+panel.width).toBeLessThan(phone.x);
 await page.screenshot({path:info.outputPath('guided-desktop.png')});
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
 await page.locator('#phone-content [type=submit]').click();await page.reload();
 await expect(page.locator('#otp')).toHaveValue('123456');
 for(const width of [360,390]){
  await page.setViewportSize({width,height:844});
  await expect(page.locator('.journey-mobile-toggle')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('[data-action=journey-toggle]').click();
  await expect(page.locator('.journey-list')).toBeVisible();
  await page.locator('[data-flow=F12]').click();
  await page.locator('[data-action=journey-open]').click();
  await page.screenshot({path:info.outputPath(`guided-mobile-${width}.png`)});
 }
});
