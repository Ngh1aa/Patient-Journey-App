const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const content=page=>page.locator('#phone-content');
const submit=page=>content(page).locator('form [type=submit]').click();
const state=page=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state);

for(const width of [320,360,390,1440])test(`eight reviewed card groups preserve actions and reflow at ${width}px`,async({page},info)=>{
  await page.setViewportSize({width,height:900});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/prototype/?scenario=empty#/support');
  await expect(content(page)).not.toContainText('Chưa có giờ trực');
  await expect(content(page).locator('[data-cf-control=supportTopic] polyline')).toHaveCount(1);
  await expect(content(page).locator('[data-cf-control=supportTopic] circle')).toHaveCount(0);
  await page.getByRole('button',{name:'Nhắn tin cho phòng khám',exact:true}).click();
  await page.locator('#support').fill('Tôi cần hỏi thông tin lịch khám.');
  await page.locator('[data-topic="Thanh toán"]').click();
  await expect(page.locator('#supportTopic')).toHaveValue('Thanh toán');await expect(page.locator('#support')).toHaveValue('Tôi cần hỏi thông tin lịch khám.');
  await page.locator('.cf-contact-preference summary').click();await page.locator('[name=contactMode][value=message]').check();
  await expect(page.locator('[data-contact-mode-label]')).toHaveText('Tin nhắn');await page.reload();await expect(page.locator('[data-contact-mode-label]')).toHaveText('Tin nhắn');
  expect(await page.locator('#phone-main').evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
  await page.goto('/prototype/#/profile');
  await expect(page.locator('.cf-personal-facts button')).toHaveCount(0);
  await expect(page.locator('.cf-profile-allergy')).toContainText('Chưa khai báo');
  const before=(await state(page)).profiles;await page.getByRole('button',{name:'Xem hồ sơ',exact:true}).click();await expect(page.locator('#dialog-body')).toContainText('Nguyễn Minh Anh');await page.locator('#dialog [data-action=close-dialog]').click();expect((await state(page)).profiles).toEqual(before);
  await page.locator('[data-focus=reminders]').click();await expect(page.locator('#reminders')).toBeFocused();
  await page.goto('/prototype/#/profile');await page.locator('[data-focus=language]').click();await expect(page.locator('#dialog-body')).toContainText('hiện hỗ trợ tiếng Việt');await page.locator('#dialog [data-action=close-dialog]').click();
  await expect(page.getByRole('button',{name:'Đăng xuất',exact:true})).toHaveCSS('color','rgb(163, 38, 50)');
  await page.locator('#bottom-nav .nav-book').click();await expect(content(page)).toHaveAttribute('data-screen','C1');
  await expect(page.locator('.group-heading')).toContainText('2 hồ sơ');await expect(content(page)).not.toContainText('Thông tin theo đúng hồ sơ');
  await page.locator('.patient-group input[value=p2]').check();await expect(page.locator('form [type=submit]')).toContainText('Thị Mai');
  expect(await page.locator('.add-relative-inline').evaluate(el=>!!el.closest('fieldset.choices'))).toBe(false);
  await page.locator('.cf-profile-privacy summary').click();await expect(page.locator('.cf-profile-privacy')).toContainText('không tự cấp quyền');
  await submit(page);await page.locator('#reason').fill('Đau đầu từ hôm qua');await submit(page);
  await page.locator('input[value=normal]').check();await expect(page.locator('.choice:has(input[value=warning])')).toHaveCSS('background-color','rgb(255, 255, 255)');
  await expect(content(page)).not.toContainText('Không, tiếp tục đặt lịch');
  await page.locator('input[value=warning]').check();await expect(page.locator('[data-safety-guidance]')).toBeVisible();await expect(page.locator('.choice:has(input[value=warning])')).toHaveClass(/selected/);
  await page.locator('input[value=normal]').check();await submit(page);await page.locator('input[value=onsite]').check();await submit(page);
  await expect(content(page)).toHaveAttribute('data-screen','C7');await expect(page.locator('[data-date-month]')).not.toBeEmpty();
  await expect(page.locator('.cf-slot-group')).toHaveCount(2);await expect(page.locator('.ux-tip')).toHaveCount(0);
  await page.locator('.date-option').last().click();await expect(page.locator('.date-option').last()).toHaveAttribute('aria-pressed','true');
  const selected=await page.locator('#date').inputValue();await expect(page.locator('[data-cf-control=date]')).toContainText(selected.split('-').reverse().join('/'));
  await page.locator('input[name=slot][value="15:30"]').check();await submit(page);await expect(content(page)).toHaveAttribute('data-screen','C8');
  expect((await state(page)).draft).toMatchObject({patientId:'p2',date:selected,slot:'15:30'});expect(errors).toEqual([]);
  await page.locator('.phone').screenshot({path:info.outputPath('review.png')});
});

test('guided prefill updates counters without overwriting user edits',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/support');
  await page.evaluate(()=>{const key='careflow.browser.v3',saved=JSON.parse(sessionStorage.getItem(key));saved.ui.journey={id:'F1',variant:'default',index:3};saved.ui.inspection=false;sessionStorage.setItem(key,JSON.stringify(saved));});
  await page.goto('/prototype/?journey=F1&branch=default#/support');
  const text=await page.locator('#support').inputValue();expect(text.length).toBeGreaterThan(0);await expect(page.locator('#support-count')).toHaveText(`${text.length} / 500 ký tự`);
  await page.locator('#support').fill('Nội dung của tôi');await page.reload();await expect(page.locator('#support')).toHaveValue('Nội dung của tôi');await expect(page.locator('#support-count')).toHaveText('16 / 500 ký tự');
});

test('empty relatives show one explicit add action and booking draft survives adding a profile',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/profile');await page.evaluate(()=>{const key='careflow.browser.v3',saved=JSON.parse(sessionStorage.getItem(key));saved.state.profiles=saved.state.profiles.filter(p=>p.relation==='self');sessionStorage.setItem(key,JSON.stringify(saved));});await page.reload();
  await expect(page.locator('.cf-relative-empty')).toContainText('Chưa có hồ sơ người thân');
  await expect(page.locator('[data-action=profile-relatives]')).toHaveCount(0);
  await page.locator('#bottom-nav .nav-book').click();await page.locator('[data-action=profile-add-booking]').click();
  await expect(page.locator('#profile-add-relative')).toHaveAttribute('open','');await expect(page.locator('#name')).toBeFocused();
  await page.locator('#name').fill('Người thân mới');await page.locator('#dob').fill('2000-01-01');await submit(page);
  expect((await state(page)).profiles).toHaveLength(2);expect((await state(page)).profiles[1].canViewResults).toBe(false);
  await expect(content(page)).toHaveAttribute('data-screen','C1');await expect(page.locator('.patient-group')).toContainText('Người thân mới');
});

test('support and profile remain accessible with large text',async({page})=>{
  await page.setViewportSize({width:360,height:900});await page.goto('/prototype/?scenario=empty#/support');
  await page.evaluate(()=>{const key='careflow.browser.v3',saved=JSON.parse(sessionStorage.getItem(key));saved.state.settings.largeText=true;sessionStorage.setItem(key,JSON.stringify(saved));});await page.reload();
  for(const route of ['/support','/profile']){
    await page.goto('/prototype/#'+route);expect(await page.locator('#phone-main').evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
    const result=await new AxeBuilder({page}).include('#phone-content').include('#bottom-nav').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations).toEqual([]);
  }
});
