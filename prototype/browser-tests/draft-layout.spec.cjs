const {test,expect}=require('@playwright/test');
const main=page=>page.locator('#phone-content');
for(const width of [360,390,1440])test('type roles, shared palette and card insets at '+width,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/prototype/?scenario=appointments#/home');
 for(const route of ['/home','/appointments','/profile','/support']){
  await page.goto('/prototype/#'+route);await page.evaluate(()=>document.fonts.ready);
  await expect(main(page).locator('h1')).toHaveCSS('font-size','24px');
  const sizes=await main(page).locator('h2,h3').evaluateAll(nodes=>nodes.map(el=>getComputedStyle(el).fontSize));expect(sizes.every(s=>['16px','18px'].includes(s))).toBe(true);
  const paragraphs=await main(page).locator('p').evaluateAll(nodes=>nodes.map(el=>getComputedStyle(el).fontSize));expect(paragraphs.every(s=>s==='14px')).toBe(true);
  const photos=await main(page).locator('img').evaluateAll(nodes=>nodes.map(el=>({src:el.getAttribute('src'),alt:el.alt,loaded:el.complete&&el.naturalWidth>0})));
  expect(photos.every(p=>p.src.endsWith('doctor-cutout.webp')&&p.alt===''&&p.loaded)).toBe(true);
  expect(await main(page).evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 }
 await page.goto('/prototype/#/home');
 const insets=await main(page).locator('.cf-action-tile,.cf-home-tip-card>summary').evaluateAll(nodes=>nodes.map(el=>{const s=getComputedStyle(el);return[parseFloat(s.paddingLeft),parseFloat(s.paddingRight)]}));
 expect(insets.length).toBeGreaterThanOrEqual(3);insets.flat().forEach(value=>expect(value).toBeGreaterThanOrEqual(16));
 const guide=main(page).locator('.cf-home-tip-card').first();await guide.locator('summary').focus();await page.keyboard.press('Enter');await expect(guide).toHaveAttribute('open','');
});
test('profile avatar does not assign a stock person to the account or a named clinician',async({page})=>{
 await page.goto('/prototype/?scenario=upcoming#/profile');
 const avatar=page.locator('.cf-profile-masthead-account .cf-person-avatar');await expect(avatar).toHaveAttribute('aria-hidden','true');await expect(avatar.locator('svg')).toBeVisible();
 await expect(main(page).locator('img')).toHaveCount(0);await expect(main(page)).toContainText('Nguyễn Minh Anh');
});
