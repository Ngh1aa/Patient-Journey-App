const {test,expect}=require('@playwright/test');
const {default:AxeBuilder}=require('@axe-core/playwright');
const url='/prototype/index.html';
const visit=async(page,scenario='upcoming')=>{
  await page.goto(url+'?scenario='+scenario);
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','B1');
};
test('home appointment card has clear information, action, and real visit navigation',async({page},info)=>{
  await visit(page);
  const first=page.locator('#phone-content .visit-card').first();
  await expect(first).toBeVisible();
  await expect(first.locator('.visit-card-category')).toContainText('LƯỢT KHÁM');
  await expect(first.locator('.visit-card-schedule')).not.toBeEmpty();
  await expect(first.locator('.visit-card-person')).toContainText('Người đi khám');
  await expect(first.locator('.visit-bottom .chip')).toHaveCount(1);
  await expect(first.locator('.visit-card-open')).toContainText('Xem chi tiết');
  await page.locator('#phone-frame').screenshot({path:info.outputPath('patient-home-card-390.png'),animations:'disabled'});
  await first.click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','D2');
});
test('all four shortcuts act on existing patient routes, not decorative icons',async({page})=>{
  const paths=[['begin','C1'],['D1','D1'],['F1','F1'],['K5','K5']];
  for(const [action,target] of paths){
    await visit(page);
    const item=action==='begin'
      ?page.locator('.home-shortcut[data-action="begin"]')
      :page.locator('.home-shortcut[data-to="'+action+'"]');
    await expect(item).toBeEnabled();
    await item.click();
    await expect(page.locator('#phone-content')).toHaveAttribute('data-screen',target);
  }
});
test('empty profile keeps useful shortcuts and explains unavailable results',async({page},info)=>{
  await visit(page,'empty');
  await expect(page.locator('.visit-card')).toHaveCount(0);
  await expect(page.locator('.home-shortcut')).toHaveCount(4);
  const result=page.locator('.home-shortcut[data-to="F1"]');
  await expect(result).toBeDisabled();
  await expect(result).toContainText('Có khi có lượt khám');
  await expect(page.locator('.home-shortcut-primary')).toBeEnabled();
  await page.locator('#phone-frame').screenshot({path:info.outputPath('patient-empty-shortcuts.png'),animations:'disabled'});
  await page.locator('.home-shortcut-primary').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C1');
});
for(const width of [360,390,430]){
  test('patient card and shortcut grid reflow at '+width+'px, normal/large text',async({page},info)=>{
    await page.setViewportSize({width,height:844});
    await visit(page);
    const phone=page.locator('#phone-frame');
    for(const large of [false,true]){
      if(large)await phone.evaluate(el=>el.classList.add('large-text'));
      const g=await page.evaluate(()=>{
        const grid=document.querySelector('.home-shortcut-grid');
        const phone=document.querySelector('#phone-frame');
        const card=document.querySelector('.visit-card');
        return {width:document.documentElement.scrollWidth,viewport:innerWidth,
          gridCols:getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length,
          cardWidth:card.getBoundingClientRect().width,
          contentWidth:document.querySelector('#phone-content').getBoundingClientRect().width,
          phoneScroll:phone.scrollWidth,phoneClient:phone.clientWidth};
      });
      expect(g.width,width+' document overflow').toBeLessThanOrEqual(width+1);
      expect(g.phoneScroll,width+' phone overflow').toBeLessThanOrEqual(g.phoneClient+1);
      expect(g.cardWidth).toBeLessThanOrEqual(g.contentWidth+1);
      expect(g.gridCols).toBe(large?1:2);
      if(width===390)await phone.screenshot({path:info.outputPath('patient-'+width+'-'+(large?'large':'normal')+'.png'),animations:'disabled'});
    }
  });
}
test('patient card controls meet keyboard focus and basic accessibility scan',async({page})=>{
  await visit(page);
  await page.locator('.home-shortcut[data-to="D1"]').focus();
  await expect(page.locator('.home-shortcut[data-to="D1"]')).toHaveCSS('outline-style','solid');
  const result=await new AxeBuilder({page}).include('#phone-content').withTags(['wcag2a','wcag2aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.length}))).toEqual([]);
});
