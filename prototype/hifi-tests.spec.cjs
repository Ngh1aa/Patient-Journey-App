const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const current=page=>page.locator('#screen-list [aria-current="page"] b');
const act=(page,id)=>page.locator('.device-screen [data-action="'+id+'"]');
const choose=(page,a,v)=>page.locator('.device-screen [data-action="'+a+'"][data-value="'+v+'"]');
const scene=(page,id)=>page.locator('[data-scenario="'+id+'"]').click();
const nav=(page,id)=>page.locator('#screen-list [data-screen="'+id+'"]').click();
const assertScreen=async(page,id)=>await expect(current(page)).toHaveText(id);
test.beforeEach(async({page})=>{await page.goto('/hifi/index.html');await assertScreen(page,'A1');});
async function completedBooking(page){
 await act(page,'login').click();await assertScreen(page,'B1');
 await act(page,'begin').first().click();await assertScreen(page,'C1');
 await act(page,'nextPerson').click();await assertScreen(page,'C2');
 await choose(page,'screening','normal').click();await act(page,'nextScreening').click();await assertScreen(page,'C4');
 await choose(page,'slot','14:30').click();await act(page,'nextSlot').click();await assertScreen(page,'C5');
 await act(page,'confirm').click();await assertScreen(page,'C6');
}

test('8-screen primary journey completes with confirmed patient and appointment',async({page},testInfo)=>{
 await completedBooking(page);
 await expect(page.locator('#cf-screen')).toContainText('DEMO-001');
 await page.screenshot({path:testInfo.outputPath('C6-confirmed.png'),fullPage:true});
 await page.locator('.device-screen [data-action="navigate"][data-to="D2"]').click();
 await assertScreen(page,'D2');
 await expect(page.locator('#cf-screen')).toContainText('Hành trình buổi khám');
});
test('proxy choice updates patient and does not inherit unrelated reason',async({page})=>{
 await scene(page,'proxy');await assertScreen(page,'C1');
 await act(page,'nextPerson').click();await assertScreen(page,'C2');
 await expect(page.locator('#cf-screen')).toContainText('Trần Hoa (người thân mẫu)');
 await choose(page,'screening','normal').click();await act(page,'nextScreening').click();
 await choose(page,'slot','09:00').click();await act(page,'nextSlot').click();
 await expect(page.locator('#cf-screen')).toContainText('Trần Hoa (người thân mẫu)');
 await act(page,'confirm').click();await assertScreen(page,'C6');
 await expect(page.locator('#cf-screen')).toContainText('Trần Hoa');
});
test('risk screening always redirects to safety screen, no bypass on editing',async({page})=>{
 await scene(page,'warning');await assertScreen(page,'C2');
 await act(page,'nextScreening').click();await assertScreen(page,'C3');
 await nav(page,'C4');await assertScreen(page,'C3');
 await act(page,'navigate').first().click();await assertScreen(page,'C2');
 await choose(page,'screening','normal').click();await act(page,'nextScreening').click();await assertScreen(page,'C3');
 await nav(page,'B1');await act(page,'begin').first().click();await assertScreen(page,'C3');
});
test('slot collision shows error then succeeds after user chooses another slot',async({page})=>{
 await scene(page,'slot');await assertScreen(page,'C5');
 await act(page,'confirm').click();await assertScreen(page,'C5');
 await expect(page.locator('#cf-screen')).toContainText('Khung giờ không còn trống');
 await page.locator('#cf-screen [data-to="C4"]').last().click();
 await assertScreen(page,'C4');await choose(page,'slot','14:30').click();
 await act(page,'nextSlot').click();await act(page,'confirm').click();await assertScreen(page,'C6');
});
test('unknown result cannot show false success and allows verified retry',async({page})=>{
 await scene(page,'unknown');await assertScreen(page,'C5');
 await act(page,'confirm').click();
 await expect(page.locator('#cf-screen')).toContainText('Chưa xác định đã đặt thành công');
 await expect(act(page,'confirm')).toBeDisabled();
 await act(page,'verify').click();
 await expect(act(page,'confirm')).toBeEnabled();
 await act(page,'confirm').click();await assertScreen(page,'C6');
});
test('online booking remains blocked pending clinic approval',async({page})=>{
 await nav(page,'C4');await choose(page,'mode','online').click();await choose(page,'slot','14:30').click();
 await act(page,'nextSlot').click();await assertScreen(page,'C4');
 await expect(page.locator('#cf-screen')).toContainText('cần được phòng khám xác nhận');
});
test('tokens visual modes and large text preserve main CTA',async({page})=>{
 await page.locator('#theme-toggle').click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.locator('#font-toggle').click();
 await expect(page.locator('body')).toHaveClass(/large-text/);
 await expect(act(page,'login')).toBeVisible();
});
test('navigation contains eight specified screens plus safety fallback',async({page})=>{
 for(const id of ['A1','B1','C1','C2','C4','C5','C6','D2','C3'])await expect(page.locator('#screen-list [data-screen="'+id+'"]')).toHaveCount(1);
});
test('hi-fi screenshots of A1 B1 C1 C2 C4 C5 C6 D2',async({page},testInfo)=>{
 const shots=['A1','B1','C1','C2','C4','C5','C6','D2'];
 await completedBooking(page);
 for(const id of shots){
  await nav(page,id);await assertScreen(page,id);
  await page.screenshot({path:testInfo.outputPath(id+'.png')});
 }
});
test('axe targeted color, landmarks, labels and keyboard semantics on patient screens',async({page})=>{
 await completedBooking(page);
 for(const id of ['A1','B1','C1','C2','C4','C5','C6','D2','C3']){
  await nav(page,id);await assertScreen(page,id);
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  const serious=scan.violations.filter(v=>['serious','critical'].includes(v.impact));
  console.log('HIFI AXE '+id+' total='+scan.violations.length+' severe='+serious.length);
  expect(serious,JSON.stringify(serious.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})))).toEqual([]);
 }
});
