const {test,expect}=require('@playwright/test');

const tag = p => p.locator('#phone-screen-tag');
const inPhone=(p,a)=>p.locator('#phone-main [data-action="'+a+'"]');
const option=(p,a,v)=>p.locator('#phone-main [data-action="'+a+'"][data-value="'+v+'"]');
const jump=(p,id)=>p.locator('#screen-menu [data-screen="'+id+'"]');
async function expectScreen(p,id){await expect(tag(p)).toHaveText(id);}
const errors=new WeakMap();
test.beforeEach(async({page})=>{
  const pageErrors=[];errors.set(page,pageErrors);
  page.on('pageerror',e=>pageErrors.push(e.message));
  await page.goto('/index.html');
  await expectScreen(page,'A1');
});
test.afterEach(async({page})=>{
  expect(errors.get(page)||[],'Runtime JS exceptions on page').toEqual([]);
});

test('launches latest demo with three panels and live inspector',async({page})=>{
  await page.setViewportSize({width:1680,height:940});
  await expect(page.locator('.sidebar')).toBeVisible();
  await expect(page.locator('#phone-frame')).toBeVisible();
  await expect(page.locator('.inspector')).toBeVisible();
  await expect(page.locator('#scenario-menu [data-scenario]')).toHaveCount(5);
  await expect(page.locator('#screen-menu [data-screen]')).toHaveCount(23);
  await expect(page.locator('#inspector-content')).toContainText('A1');
  await expect(page.getByText('14 MVP SCREENS')).toBeVisible();
});

test('login with demo OTP then inspect dashboard and notification center',async({page})=>{
  await inPhone(page,'login').click();
  await expectScreen(page,'B1');
  await expect(page.locator('#phone-main')).toContainText('Nguyễn Minh Anh');
  await page.locator('.phone-header [data-action="goG2"]').click();
  await expectScreen(page,'G2');
  await expect(page.locator('#inspector-content')).toContainText('G2');
});

test('booking journey A1 B1 C1 C2 C4 C5 C6 D2 is operational',async({page},testInfo)=>{
  await inPhone(page,'login').click();
  await expectScreen(page,'B1');
  await inPhone(page,'startBooking').click();
  await expectScreen(page,'C1');
  await inPhone(page,'nextPerson').click();
  await expectScreen(page,'C2');
  await option(page,'chooseScreening','normal').click();
  await inPhone(page,'nextScreening').click();
  await expectScreen(page,'C4');
  await option(page,'chooseSlot','14:30').click();
  await inPhone(page,'nextSlot').click();
  await expectScreen(page,'C5');
  await expect(page.locator('#phone-main')).toContainText('Nguyễn Minh Anh');
  await inPhone(page,'confirmBooking').click();
  await expectScreen(page,'C6');
  await expect(page.locator('#phone-main')).toContainText('DEMO-001');
  await page.locator('#phone-frame').screenshot({path:testInfo.outputPath('confirmed-mobile.png')});
  await inPhone(page,'goD2').click();
  await expectScreen(page,'D2');
});

test('proxy mock retains selected patient identity',async({page})=>{
  await page.setViewportSize({width:1680,height:940});
  await page.locator('[data-scenario="proxy"]').click();
  await expectScreen(page,'C1');
  await expect(page.locator('#phone-main')).toContainText('Trần Thị Mai');
  await inPhone(page,'nextPerson').click();
  await expectScreen(page,'C2');
  await expect(page.locator('#phone-main')).toContainText('Trần Thị Mai');
});

test('warning branch routes to C3 and direct C4 navigation is intercepted',async({page})=>{
  await page.setViewportSize({width:1680,height:940});
  await page.locator('[data-scenario="warning"]').click();
  await expectScreen(page,'C2');
  await inPhone(page,'nextScreening').click();
  await expectScreen(page,'C3');
  await jump(page,'C4').click();
  await expectScreen(page,'C3');
});

test('slot collision is reported without false booking confirmation',async({page})=>{
  await page.setViewportSize({width:1680,height:940});
  await page.locator('[data-scenario="slot"]').click();
  await expectScreen(page,'C5');
  await inPhone(page,'confirmBooking').click();
  await expectScreen(page,'C5');
  await expect(page.locator('#phone-main')).toContainText('Giờ khám không còn trống');
});

test('unknown network outcome is not presented as successful',async({page})=>{
  await page.setViewportSize({width:1680,height:940});
  await page.locator('[data-scenario="unknown"]').click();
  await expectScreen(page,'C5');
  await inPhone(page,'confirmBooking').click();
  await expectScreen(page,'C5');
  await expect(page.locator('#phone-main')).toContainText('Chưa xác định đã đặt thành công');
  await expect(inPhone(page,'confirmBooking')).toBeDisabled();
});

test('inspector smoke tests and offline toggle operate',async({page})=>{
  await page.setViewportSize({width:1680,height:940});
  await page.locator('.inspector [data-action="runSmokeTests"]').click();
  await expect(page.locator('#qa-results')).toContainText('15/15');
  await page.locator('.inspector [data-action="toggleOffline"]').click();
  await expect(page.locator('#offline-bar')).toBeVisible();
});

test('mobile viewport keeps mockup visible and avoids document-level overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('#phone-frame')).toBeVisible();
  const size=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(size.page).toBeLessThanOrEqual(size.viewport+2);
});

test('capture 14 MVP design frames from the current main code',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='Desktop Chrome 1680','single desktop screenshot run');
  await page.setViewportSize({width:1680,height:1000});
  const ids=['A1','A2','B1','C1','C2','C3','C4','C5','C6','D1','D2','D3','F2','G2'];
  for(const id of ids){
    await jump(page,id).click();
    await expectScreen(page,id==='C6'?'C5':id); // C6 gated without confirmed booking.
    await page.locator('#phone-frame').screenshot({path:testInfo.outputPath(id+'.png')});
  }
});

// Safety release gate (not marked as passing by the runtime smoke suite):
// The current source has confirmContinueBooking setting m.risk=false after
// patient checkbox acknowledgment, without an approved clinician workflow.
// Record it for clinical review before using C3 in a real patient app.
