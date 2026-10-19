const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const nav=page=>page.locator('#bottom-nav');
const main=page=>page.locator('#phone-content');

for(const width of [320,360,390,1440])test(`integrated navigation has raised booking, filled selection and accessible icon-only tabs at ${width}px`,async({page},info)=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/prototype/?scenario=upcoming#/home');
  await expect(nav(page)).toBeVisible();
  const selected=nav(page).getByRole('link',{name:'Trang chủ',exact:true});
  await expect(selected).toHaveAttribute('aria-current','page');
  await expect(selected).toHaveCSS('background-color','rgb(207, 226, 255)');
  await expect(selected.locator('svg')).toHaveCSS('fill','rgb(0, 29, 87)');
  const idle=nav(page).getByRole('link',{name:'Hồ sơ',exact:true});
  await expect(idle).toHaveCSS('color','rgb(91, 107, 140)');await expect(idle.locator('svg')).toHaveCSS('fill','none');
  const book=nav(page).getByRole('button',{name:'Đặt lịch',exact:true});
  await expect(book.locator('.nav-caption')).toHaveCount(0);
  await expect(nav(page).locator('.cf-nav-background path')).toHaveCount(1);
  await expect(selected.locator('.nav-caption')).toBeHidden();
  await expect(idle.locator('.nav-caption')).toBeHidden();
  await expect(book.locator('.nav-plus')).toHaveCSS('background-color','rgb(11, 18, 32)');
  await expect(book.locator('.nav-plus')).toHaveCSS('border','4px solid rgb(255, 255, 255)');
  const bar=await nav(page).boundingBox(),circle=await book.locator('.nav-plus').boundingBox();
  expect(circle.y).toBeLessThan(bar.y);expect(circle.x).toBeGreaterThanOrEqual(bar.x);expect(circle.x+circle.width).toBeLessThanOrEqual(bar.x+bar.width);
  const sizes=await nav(page).locator('.cf-nav-item').evaluateAll(nodes=>nodes.map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
  expect(sizes).toHaveLength(5);expect(sizes.filter(r=>r.w<44||r.h<44)).toEqual([]);
  const labels=await nav(page).locator('.nav-caption').evaluateAll(nodes=>nodes.map(el=>({font:parseFloat(getComputedStyle(el).fontSize),visible:el.getClientRects().length>0,clip:el.scrollWidth>el.clientWidth+1})));
  expect(labels.filter(r=>r.visible)).toEqual([]);
  await expect(nav(page).getByRole('link',{name:'Lịch hẹn',exact:true})).toBeVisible();
  await expect(nav(page).getByRole('link',{name:'Hỗ trợ',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
  await idle.focus();await page.keyboard.press('Enter');await expect(main(page)).toHaveAttribute('data-screen','K2');
  await expect(nav(page).getByRole('link',{name:'Hồ sơ',exact:true}).locator('svg')).toHaveCSS('fill','rgb(0, 29, 87)');
  await expect(nav(page).getByRole('link',{name:'Hồ sơ',exact:true}).locator('.nav-caption')).toBeHidden();
  expect(await nav(page).textContent()).not.toContain('Thanh điều hướng');
  await page.locator('.phone').screenshot({path:info.outputPath(`navigation-${width}.png`)});
});

test('appointment badge deduplicates real unread visit updates and clears only when read',async({page})=>{
  await page.goto('/prototype/?scenario=appointments#/home');
  await page.evaluate(()=>{
    const key='careflow.browser.v3',saved=JSON.parse(sessionStorage.getItem(key)),M=CareFlowModel;
    saved.state=M.fixture('appointments');saved.state.notifications=[];
    const [a,b]=saved.state.visits;M.notify(saved.state,a,'D2');M.notify(saved.state,a,'D2');M.notify(saved.state,b,'D2');M.notify(saved.state,a,'H7');
    sessionStorage.setItem(key,JSON.stringify(saved));
  });
  await page.reload();await expect(nav(page).locator('.cf-nav-badge')).toHaveText('2');
  await nav(page).getByRole('link',{name:'Lịch hẹn',exact:true}).click();await expect(main(page)).toHaveAttribute('data-screen','D1');
  await expect(nav(page).locator('.cf-nav-badge')).toHaveText('2');
  await page.goto('/prototype/#/notifications');
  await page.locator('[data-action="notifications-read"]').click();
  await expect(nav(page).locator('.cf-nav-badge')).toHaveCount(0);
  await page.reload();await expect(nav(page).locator('.cf-nav-badge')).toHaveCount(0);
});

test('booking remains separate from appointment list and resumes the existing clinical draft',async({page})=>{
  await page.goto('/prototype/?scenario=upcoming#/home');
  await nav(page).getByRole('link',{name:'Lịch hẹn',exact:true}).click();await expect(main(page)).toHaveAttribute('data-screen','D1');
  await nav(page).getByRole('button',{name:'Đặt lịch',exact:true}).click();await expect(main(page)).toHaveAttribute('data-screen','C1');
  await expect(nav(page)).toBeHidden();
  await main(page).locator('form [type="submit"]').click();
  await page.locator('#reason').fill('Nội dung được giữ khi quay lại đặt lịch.');
  await main(page).locator('form [type="submit"]').click();await expect(main(page)).toHaveAttribute('data-screen','C3');
  await page.evaluate(()=>location.hash='#/home');await expect(main(page)).toHaveAttribute('data-screen','B1');
  await nav(page).getByRole('button',{name:'Đặt lịch',exact:true}).click();await expect(main(page)).toHaveAttribute('data-screen','C3');
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.draft.reason)).toBe('Nội dung được giữ khi quay lại đặt lịch.');
});

test('large-text navigation avoids overlap with content and auth has no tab bar',async({page})=>{
  await page.setViewportSize({width:360,height:900});await page.goto('/prototype/?scenario=upcoming#/home');
  await page.evaluate(()=>{const key='careflow.browser.v3',saved=JSON.parse(sessionStorage.getItem(key));saved.state.settings.largeText=true;sessionStorage.setItem(key,JSON.stringify(saved));});
  await page.reload();await expect(nav(page)).toBeVisible();
  const clipped=await nav(page).locator('.nav-caption').evaluateAll(nodes=>nodes.filter(el=>el.getClientRects().length&&el.scrollWidth>el.clientWidth+1).map(el=>el.textContent));expect(clipped).toEqual([]);
  const circle=await nav(page).locator('.nav-plus').boundingBox();expect(circle.width).toBe(56);await expect(nav(page).locator('.nav-book .nav-caption')).toHaveCount(0);
  const scroll=await page.locator('#phone-main').boundingBox(),bar=await nav(page).boundingBox();expect(scroll.y+scroll.height).toBeLessThanOrEqual(bar.y);
  const result=await new AxeBuilder({page}).include('#bottom-nav').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations).toEqual([]);
  await page.evaluate(()=>sessionStorage.clear());await page.goto('/prototype/#/login');await expect(nav(page)).toBeHidden();
});
