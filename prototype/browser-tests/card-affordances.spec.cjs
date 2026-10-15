const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const open=async(page,scenario='upcoming')=>{
 await page.goto('/prototype/index.html?scenario='+scenario);
 await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','B1');
};
test('appointment card shows real visit context and labeled detail action',async({page},info)=>{
 await open(page);
 const c=page.locator('.visit-card').first();
 await expect(c).toBeVisible();
 await expect(c.locator('.visit-person strong')).not.toBeEmpty();
 await expect(c.locator('.visit-schedule')).toBeVisible();
 await expect(c.locator('.visit-bottom .chip')).toHaveCount(1);
 const ordered=await page.evaluate(()=>document.querySelector('.service-grid').getBoundingClientRect().top<document.querySelector('.home-tasks').getBoundingClientRect().top);
 expect(ordered).toBe(true);
 await expect(c.locator('.visit-open')).toContainText('Xem phiếu khám');
 await page.locator('#phone-frame').screenshot({path:info.outputPath('card-visit-390.png'),animations:'disabled'});
 await c.click();
 await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','D2');
});
test('four service tiles are real existing navigation actions',async({page})=>{
 const routes=[['begin','C1'],['D1','D1'],['F1','F1'],['I1','I1']];
 for(const [action,target] of routes){
  await open(page);
  const el=action==='begin'?page.locator('.service-tile[data-action="begin"]'):
   page.locator('.service-tile[data-to="'+action+'"]');
  await expect(el).toBeEnabled();
  await el.click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen',target);
 }
});
test('empty state explains unavailable medical routes, keeps booking and appointment list open',async({page},info)=>{
 await open(page,'empty');
 await expect(page.locator('.visit-card')).toHaveCount(0);
 await expect(page.locator('.service-tile')).toHaveCount(4);
 for(const route of ['F1','I1']){
  const el=page.locator('.service-tile[data-to="'+route+'"]');
  await expect(el).toBeDisabled();
  await expect(el).toContainText('Cần có lượt khám');
 }
 await expect(page.locator('.booking-tile')).toBeEnabled();
 await page.locator('#phone-frame').screenshot({path:info.outputPath('card-empty-390.png'),animations:'disabled'});
 await page.locator('.booking-tile').click();
 await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C1');
});
for(const width of [360,390,430]){
 test('bento cards reflow at '+width+'px (normal and 200% text)',async({page},info)=>{
  await page.setViewportSize({width,height:844});
  await open(page);
  const phone=page.locator('#phone-frame');
  for(const large of [false,true]){
   if(large)await phone.evaluate(el=>el.classList.add('large-text'));
   const dims=await page.evaluate(()=>{
    const grid=document.querySelector('.service-grid');
    const phone=document.querySelector('#phone-frame');
    const card=document.querySelector('.visit-card');
    return {scroll:document.documentElement.scrollWidth,width:innerWidth,
     cols:getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length,
     phoneScroll:phone.scrollWidth,phoneClient:phone.clientWidth,
     cardWidth:card.getBoundingClientRect().width,contentWidth:document.querySelector('#phone-content').getBoundingClientRect().width};
   });
   expect(dims.scroll).toBeLessThanOrEqual(width+1);
   expect(dims.phoneScroll).toBeLessThanOrEqual(dims.phoneClient+1);
   expect(dims.cardWidth).toBeLessThanOrEqual(dims.contentWidth+1);
   expect(dims.cols).toBe(large?1:2);
   if(large){
    const alignment=await page.evaluate(()=>{
      const avatar=document.querySelector('.greeting>.avatar').getBoundingClientRect();
      const h1=document.querySelector('.greeting h1').getBoundingClientRect();
      return {avatarRight:avatar.right,headingLeft:h1.left};
    });
    expect(alignment.avatarRight).toBeLessThanOrEqual(alignment.headingLeft+1);
   }
   if(width===390)await phone.screenshot({path:info.outputPath('card-'+width+'-'+(large?'large':'normal')+'.png'),animations:'disabled'});
  }
 });
}
test('accessible labels, focus, visible action target and patient contrast basics',async({page})=>{
 await open(page);
 const controls=page.locator('.service-tile');
 await expect(controls).toHaveCount(4);
 const dims=await page.evaluate(()=>{
  const a=document.querySelector('.visit-open').getBoundingClientRect();
  const b=document.querySelector('.service-tile .service-arrow').getBoundingClientRect();
  return {a:[a.width,a.height],b:[b.width,b.height]};
 });
 expect(dims.a[1]).toBeGreaterThanOrEqual(44);
 expect(dims.b[0]).toBeGreaterThanOrEqual(36);
 await controls.nth(1).focus();
 await expect(controls.nth(1)).toHaveCSS('outline-style','solid');
 const scan=await new AxeBuilder({page}).include('#phone-content').withTags(['wcag2a','wcag2aa']).analyze();
 expect(scan.violations.map(v=>v.id)).toEqual([]);
});
