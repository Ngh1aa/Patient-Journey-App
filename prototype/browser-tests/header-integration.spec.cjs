const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const content=page=>page.locator('#phone-content');
const submit=page=>content(page).locator('form [type=submit]').click();

for(const width of [320,360,390,1440])test(`reviewed headers use actual state and remain accessible at ${width}px`,async({page},info)=>{
  await page.setViewportSize({width,height:900});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/prototype/?scenario=appointments#/home');
  for(const [screen,route] of [['B1','home'],['D1','appointments'],['K2','profile'],['K5','support']]){
    await page.goto('/prototype/#/'+route);await page.evaluate(()=>document.fonts.ready);
    expect(await page.locator('#phone-main').evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
    const small=await content(page).locator('.screen-masthead button:not([hidden])').evaluateAll(nodes=>nodes.filter(el=>el.getClientRects().length).map(el=>({name:el.ariaLabel||el.textContent,w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})).filter(r=>r.w<44||r.h<44));
    expect(small).toEqual([]);
    const scan=await new AxeBuilder({page}).include('#phone-content').include('#bottom-nav').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
    if(screen==='B1'){
      await expect(content(page).locator('.cf-home-appointment')).toHaveCount(1);
      await expect(content(page).locator('.cf-home-appointment')).toContainText('CF-SAMPLE-01');
      const gap=await content(page).evaluate(el=>el.querySelector('.cf-home-overview').getBoundingClientRect().top-el.querySelector('.cf-home-appointment').getBoundingClientRect().bottom);
      expect(gap).toBeGreaterThanOrEqual(16);
    }
    if(screen==='K2'){
      await expect(page.locator('.cf-hdr-id-card')).toContainText('15/08/1994');
      await page.locator('.cf-hdr-family-dock').click();await expect(page.locator('#dialog-body')).toContainText('Trần Thị Mai');await page.keyboard.press('Escape');
    }
    if(screen==='K5')await expect(page.getByRole('link',{name:'Gọi 115',exact:true})).toHaveAttribute('href','tel:115');
    await page.locator('#phone-main').evaluate(el=>el.scrollTop=0);
    await page.locator('.phone').screenshot({path:info.outputPath(`${screen}-${width}.png`)});
  }
  expect(errors).toEqual([]);
});

test('appointment date composes with mode, person and search; resets and survives reload',async({page})=>{
  await page.goto('/prototype/?scenario=appointments#/appointments');
  await page.locator('[data-appointment-date="2026-10-27"]').click();
  await expect(content(page).locator('.rich-filterable:visible')).toHaveCount(1);
  await page.getByRole('button',{name:'Lọc lịch hẹn',exact:true}).click();
  await page.locator('[data-visit-filter=online]').click();await expect(page.locator('.rich-filter-empty')).toBeVisible();
  await page.reload();await expect(page.locator('[data-appointment-date="2026-10-27"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('.rich-filter-empty')).toBeVisible();
  await page.locator('.rich-filter-empty [data-appointment-reset]').click();await expect(content(page).locator('.rich-filterable:visible')).toHaveCount(5);
  await page.locator('[data-appointment-date="2026-10-24"]').click();
  await page.locator('.rich-person-picker summary').click();await page.locator('[data-appointment-person=p2]').click();
  await page.locator('#appointment-search').fill('CF-SAMPLE-01');await expect(page.locator('.rich-filter-empty')).toBeVisible();
  await expect(page.locator('[data-appointment-filter-count]')).toHaveText('3');
  await page.locator('.rich-filter-empty [data-appointment-reset]').click();await expect(content(page).locator('.rich-filterable:visible')).toHaveCount(5);
  await page.locator('[data-appointment-date="2026-10-24"]').click();
  await page.locator('.rich-appt-tabs [data-action=filter][data-filter=past]').click();
  await expect(page.locator('[data-appointment-date=""]')).toHaveAttribute('aria-pressed','true');await expect(content(page).locator('.rich-filterable:visible')).toHaveCount(2);
  await page.locator('[data-action=filter][data-filter=cancelled]').click();await expect(page.locator('.cf-hdr-date-rail')).toHaveCount(0);await expect(content(page)).toContainText('Chưa có lịch đã hủy');
});

test('a visit update clears a date that no longer belongs to the current status group',async({page})=>{
  await page.goto('/prototype/?scenario=appointments#/appointments');await page.locator('[data-appointment-date="2026-10-24"]').click();
  await page.evaluate(()=>{const key='careflow.browser.v3',saved=JSON.parse(sessionStorage.getItem(key));saved.state.visits.find(v=>v.id==='CF-SAMPLE-01').status='completed';sessionStorage.setItem(key,JSON.stringify(saved));});await page.reload();
  await expect(page.locator('[data-appointment-date="2026-10-24"]')).toHaveCount(0);await expect(page.locator('[data-appointment-date=""]')).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).ui.appointmentDate)).toBe('');
});

test('account progress follows real OTP and preserves profile draft through back navigation',async({page},info)=>{
  await page.goto('/prototype/?scenario=new#/login');
  await expect(page.locator('#back')).toBeDisabled();await expect(page.locator('#auth-jump')).toBeHidden();
  expect((await new AxeBuilder({page}).include('#phone-content').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.locator('#phone').fill('0900000000');await submit(page);await expect(page.locator('.cf-hdr-auth-progress [aria-current=step]')).toContainText('Xác thực');
  expect((await new AxeBuilder({page}).include('#phone-content').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.locator('#otp').fill('123456');await page.locator('#consent').check();await submit(page);
  await expect(content(page)).toHaveAttribute('data-screen','A3');await page.locator('#name').fill('Lê Minh Khang');
  await expect(page.locator('[data-identity-preview]')).toHaveText('Lê Minh Khang');
  expect((await new AxeBuilder({page}).include('#phone-content').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.locator('#dob').fill('1995-02-15');await page.locator('.phone').screenshot({path:info.outputPath('A3.png')});
  await page.locator('#back').click();await expect(content(page)).toHaveAttribute('data-screen','A1');await expect(page.locator('.cf-hdr-auth-progress [aria-current=step]')).toContainText('Xác thực');
  await page.locator('#otp').fill('123456');await page.locator('#consent').check();await submit(page);
  await expect(page.locator('#name')).toHaveValue('Lê Minh Khang');await expect(page.locator('[data-identity-preview]')).toHaveText('Lê Minh Khang');await submit(page);
  await expect(content(page)).toHaveAttribute('data-screen','B1');
});

test('reviewed headers reflow with large text and long account names',async({page})=>{
  await page.setViewportSize({width:320,height:900});await page.goto('/prototype/?scenario=appointments#/home');
  await page.evaluate(()=>{const key='careflow.browser.v3',saved=JSON.parse(sessionStorage.getItem(key));saved.state.settings.largeText=true;saved.state.profiles[0].name='Nguyễn Hoàng Minh Anh Phương';sessionStorage.setItem(key,JSON.stringify(saved));});await page.reload();
  for(const route of ['home','appointments','profile','support']){
    await page.goto('/prototype/#/'+route);
    expect(await page.locator('#phone-main').evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
    const scan=await new AxeBuilder({page}).include('#phone-content').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(scan.violations).toEqual([]);
  }
});
