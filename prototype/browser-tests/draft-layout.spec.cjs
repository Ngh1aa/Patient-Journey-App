const {test,expect}=require('@playwright/test');
const main=page=>page.locator('#phone-content');

for(const width of [360,390,1440]) test(`draft type roles, card insets and real photos at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/prototype/?scenario=appointments#/home');
  const book=page.getByRole('button',{name:'Đặt lịch khám',exact:true}).filter({has:page.locator('.nav-plus')});
  await expect(book.locator('.nav-caption')).toBeHidden();
  await expect(book).toHaveCSS('border-color','rgb(174, 184, 198)');
  const box=await book.boundingBox();expect(box.width).toBe(56);expect(box.height).toBe(56);
  const avatar=page.locator('.ref-header-avatar .cf-avatar-photo');
  await expect(avatar).toHaveAttribute('src',/account-portrait.webp$/);
  expect(await avatar.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  for(const route of ['/home','/appointments','/profile','/support']){
    await page.goto('/prototype/#'+route);
    await page.evaluate(()=>document.fonts.ready);
    const sizes=await main(page).locator('h2').evaluateAll(nodes=>nodes.map(el=>getComputedStyle(el).fontSize));
    expect(sizes.length).toBeGreaterThan(0);expect([...new Set(sizes)]).toEqual(['18px']);
    const paragraphs=await main(page).locator('p').evaluateAll(nodes=>nodes.map(el=>getComputedStyle(el).fontSize));
    expect(paragraphs.every(size=>size==='14px')).toBe(true);
    // WebKit keeps offscreen lazy images deferred. Exercise real scrolling before
    // checking the load, rather than awaiting decode() outside the viewport.
    for(const image of await main(page).locator('img:visible').all()){
      await image.scrollIntoViewIfNeeded();
      await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
    }
    expect(await main(page).evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  }
  const profile=page.locator('.rich-profile-details');
  await page.goto('/prototype/#/profile');
  const columns=await profile.locator(':scope > div').evaluateAll(nodes=>nodes.map(el=>Math.round(el.getBoundingClientRect().x)));
  expect(new Set(columns).size).toBe(1);
  await page.goto('/prototype/#/home');
  const insets=await main(page).locator('.cf-home-task-card .cf-photo-content,.cf-home-tip-card > summary .cf-photo-content').evaluateAll(nodes=>nodes.map(el=>{const s=getComputedStyle(el);return {left:parseFloat(s.paddingLeft),right:parseFloat(s.paddingRight)}}));
  expect(insets.length).toBeGreaterThanOrEqual(5);insets.forEach(s=>{expect(s.left).toBeGreaterThanOrEqual(12);expect(s.right).toBeGreaterThanOrEqual(12)});
  const guide=main(page).locator('.cf-home-tip-card').first();
  await guide.locator('summary').focus();await page.keyboard.press('Enter');
  await expect(guide).toHaveAttribute('open','');
  await expect(guide.locator('.cf-guide-body button')).toBeVisible();
});

test('stock assets have local bytes, explicit provenance and a decorative account avatar',async({page})=>{
  const source=await (await page.request.get('/prototype/assets/images/unsplash/sources.json')).json();
  for(const item of source){
    expect(item.photo).toMatch(/^https:\/\/unsplash.com\/photos\//);
    expect(item.photographer).toBeTruthy();expect(item.license).toBe('https://unsplash.com/license');
    const response=await page.request.get('/prototype/assets/images/unsplash/'+item.file);
    expect(response.ok()).toBe(true);expect((await response.body()).length).toBeGreaterThan(1000);
  }
  await page.goto('/prototype/?scenario=upcoming#/profile');
  const avatar=page.locator('.cf-profile-masthead-account .cf-avatar-photo');
  await expect(avatar).toHaveAttribute('alt','');
  await expect(avatar).toHaveAttribute('title','Ảnh đại diện minh họa');
});
