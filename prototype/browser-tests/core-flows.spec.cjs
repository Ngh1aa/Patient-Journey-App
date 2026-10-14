const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const current=page=>page.locator('#phone-screen-tag');
const phone=page=>page.locator('#phone-main');
const action=(page,id)=>page.locator('#phone-main [data-action="'+id+'"]');
const choose=(page,actionName,value)=>page.locator('#phone-main [data-action="'+actionName+'"][data-value="'+value+'"]');
const sidebar=(page,screen)=>page.locator('#screen-menu [data-screen="'+screen+'"]');
const navTo=async(page,screen)=>{await page.locator("#mobile-screen-picker").selectOption(screen);};
const startScenario=async(page,name)=>{await page.locator('[data-scenario="'+name+'"]').click();};
const expectScreen=async(page,id)=>await expect(current(page)).toHaveText(id);

test.beforeEach(async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/index.html');
  await expectScreen(page,'A1');
  page.on('close',()=>{if(errors.length)console.error('Browser errors: '+errors.join('; '));});
});

test('S1 normal booking from OTP through confirmed appointment',async({page},testInfo)=>{
  await action(page,'login').click();
  await expectScreen(page,'B1');
  await action(page,'startBooking').click();
  await expectScreen(page,'C1');
  await action(page,'nextPerson').click();
  await expectScreen(page,'C2');
  await action(page,'chooseScreening').first().click();
  await action(page,'nextScreening').click();
  await expectScreen(page,'C4');
  await choose(page,'chooseSlot','09:00').click();
  await action(page,'nextSlot').click();
  await expectScreen(page,'C5');
  await expect(phone(page)).toContainText('Tôi (hồ sơ mẫu)');
  await action(page,'confirmBooking').click();
  await expectScreen(page,'C6');
  await expect(phone(page)).toContainText('DEMO-001');
  await page.screenshot({path:testInfo.outputPath('booking-confirmed.png'),fullPage:true});
  await action(page,'goD2').click();
  await expectScreen(page,'D2');
});

test('S2 proxy booking targets relative, but result requires separate permission',async({page})=>{
  await startScenario(page,'proxy');
  await expectScreen(page,'C1');
  await expect(phone(page)).toContainText('Mẹ (hồ sơ mẫu)');
  await action(page,'nextPerson').click();
  await expectScreen(page,'C2');
  await choose(page,'chooseScreening','normal').click();
  await action(page,'nextScreening').click();
  await expectScreen(page,'C4');
  await choose(page,'chooseSlot','09:00').click();
  await action(page,'nextSlot').click();
  await expectScreen(page,'C5');
  await expect(phone(page)).toContainText('Mẹ (hồ sơ mẫu)');
  await action(page,'confirmBooking').click();
  await expectScreen(page,'C6');
  await expect(phone(page)).toContainText('Mẹ (hồ sơ mẫu)');
  await navTo(page,'F2');
  await expectScreen(page,'F2');
  await action(page,'viewResult').click();
  await expect(phone(page)).toContainText('chưa có quyền xem kết quả');
});

test('S2b revoked proxy BOOK permission prevents booking',async({page})=>{
  await startScenario(page,'proxy');
  await navTo(page,'G1');
  await action(page,'toggleRelativeBook').click();
  await expect(phone(page)).toContainText('Không có quyền đặt hộ');
  await navTo(page,'C1');
  await action(page,'nextPerson').click();
  await expectScreen(page,'C1');
  await expect(phone(page)).toContainText('Chưa có quyền đặt lịch');
});

test('S3 high-risk screening stops the flow even if answer is changed',async({page},testInfo)=>{
  await startScenario(page,'warning');
  await expectScreen(page,'C2');
  await action(page,'nextScreening').click();
  await expectScreen(page,'C3');
  await expect(phone(page)).toContainText('tạm dừng');
  await page.screenshot({path:testInfo.outputPath('warning-screen.png'),fullPage:true});
  await navTo(page,'C4');
  await expectScreen(page,'C3');
  await action(page,'goC2').click();
  await choose(page,'chooseScreening','normal').click();
  await action(page,'nextScreening').click();
  await expectScreen(page,'C3');
  await navTo(page,'B1');
  await action(page,'startBooking').click();
  await expectScreen(page,'C3');
});

test('S4 slot collision returns to C4 and safely recovers on another slot',async({page})=>{
  await startScenario(page,'slot');
  await expectScreen(page,'C5');
  await action(page,'confirmBooking').click();
  await expectScreen(page,'C5');
  await expect(phone(page)).toContainText('Giờ khám không còn trống');
  await page.getByRole('button',{name:'Chọn giờ khác'}).click();
  await expectScreen(page,'C4');
  await choose(page,'chooseSlot','14:30').click();
  await action(page,'nextSlot').click();
  await expectScreen(page,'C5');
  await expect(phone(page)).toContainText('14:30');
  await action(page,'confirmBooking').click();
  await expectScreen(page,'C6');
});

test('S5 network timeout requires status check and then safe retry',async({page})=>{
  await startScenario(page,'unknown');
  await expectScreen(page,'C5');
  await action(page,'confirmBooking').click();
  await expectScreen(page,'C5');
  await expect(phone(page)).toContainText('Chưa xác định đã đặt thành công');
  await expect(action(page,'confirmBooking')).toBeDisabled();
  await action(page,'checkUnknown').click();
  await expect(phone(page)).toContainText('chưa ghi nhận lịch');
  await expect(action(page,'confirmBooking')).toBeEnabled();
  await action(page,'confirmBooking').click();
  await expectScreen(page,'C6');
});

test('telehealth lost connection routes to callback without inventing completed visit',async({page})=>{
  await navTo(page,'E2');
  await action(page,'joinVideo').click();
  await expectScreen(page,'E3');
  await action(page,'dropCall').click();
  await expectScreen(page,'E4');
  await expect(phone(page)).toContainText('bị gián đoạn');
  await action(page,'goF4').click();
  await expectScreen(page,'F4');
  await action(page,'requestCallback').click();
  await expect(phone(page)).toContainText('Đã nhận yêu cầu (demo)');
});

test('QR generated is not equivalent to verified payment',async({page})=>{
  await navTo(page,'F1');
  await action(page,'beginPayment').click();
  await expect(phone(page)).toContainText('Đang xác nhận thanh toán');
  await expect(page.locator('#inspector-content')).toContainText('pending_reconciliation');
});

test('all 23 screen destinations remain present in the explorer',async({page})=>{
  const ids=['A1','A2','B1','C1','C2','C3','C4','C5','C6','D1','D2','D3','E1','E2','E3','E4','F1','F2','F3','F4','G1','G2','G3'];
  for(const id of ids)await expect(sidebar(page,id)).toHaveCount(1);
});

test('small viewport has no horizontal document overflow',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await startScenario(page,'warning');
  await action(page,'nextScreening').click();
  await expectScreen(page,'C3');
  const dims=await page.evaluate(()=>({outer:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  expect(dims.outer).toBeLessThanOrEqual(dims.viewport+1);
});

test('axe: entry, proxy, warning, and booking review have no serious or critical automated violations',async({page})=>{
  const screenSet=[
    async()=>await expectScreen(page,'A1'),
    async()=>{await navTo(page,'C1');await expectScreen(page,'C1');},
    async()=>{await startScenario(page,'warning');await action(page,'nextScreening').click();await expectScreen(page,'C3');},
    async()=>{await startScenario(page,'slot');await expectScreen(page,'C5');}
  ];
  for(const [idx,go] of screenSet.entries()){
    await go();
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
    const high=scan.violations.filter(v=>['critical','serious'].includes(v.impact));
    console.log('AXE screen '+idx+' ('+(await current(page).innerText())+') total='+scan.violations.length+' high='+high.length+' '+scan.violations.map(v=>v.id+':'+v.impact).join(','));
    expect(high,'axe severe issues: '+JSON.stringify(high.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})))).toEqual([]);
  }
});
