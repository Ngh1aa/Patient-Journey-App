const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const state = page => page.evaluate(() => JSON.parse(sessionStorage.getItem('careflow.browser.v3')));
const submit = page => page.locator('#phone-content form [type=submit]').click();

test('contextual tips open with keyboard; patient shortcut returns to the existing selection screen', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  await page.locator('#bottom-nav .nav-book').click();
  const tip=page.locator('.ux-tip');
  await tip.locator('summary').focus();await page.keyboard.press('Enter');
  await expect(tip).toHaveAttribute('open','');
  await expect(tip.locator('p')).toBeVisible();
  await submit(page);
  await page.locator('button.context-edit').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C1');
  await expect(page.locator('input[value=p1]')).toBeChecked();
});

test('central booking action preserves unsent fields across tabs, Back and reload', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  await page.locator('#bottom-nav .nav-book').click();
  await submit(page);
  await page.locator('#reason').fill('Nội dung đang nhập chưa gửi');
  await page.locator('#medicalHistory').fill('Thông tin cần giữ lại');
  const original = (await state(page)).state.draft;
  await page.locator('#bottom-nav a').first().click();
  await page.locator('#bottom-nav .nav-book').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C2');
  await expect(page.locator('#reason')).toHaveValue('Nội dung đang nhập chưa gửi');
  await expect(page.locator('#medicalHistory')).toHaveValue('Thông tin cần giữ lại');
  expect((await state(page)).state.draft).toEqual(original);
  await page.locator('#bottom-nav a').first().click();
  await page.locator('#phone-content [data-action=begin]').click();
  await expect(page.locator('#reason')).toHaveValue('Nội dung đang nhập chưa gửi');
  await page.reload();
  await expect(page.locator('#reason')).toHaveValue('Nội dung đang nhập chưa gửi');
  await page.goBack();
  await page.locator('#bottom-nav .nav-book').click();
  await expect(page.locator('#reason')).toHaveValue('Nội dung đang nhập chưa gửi');
});

test('quick dates update the actual booking, custom date selection and reload remain consistent', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  await page.locator('#bottom-nav .nav-book').click();await submit(page);
  await page.locator('#reason').fill('Trao đổi với bác sĩ');await submit(page);
  await page.locator('input[value=normal]').check();await submit(page);
  await page.locator('input[value=online]').check();await submit(page);
  const date=page.locator('.date-option').nth(3);
  const value=await date.getAttribute('data-date');
  await date.click();
  await expect(page.locator('#date')).toHaveValue(value);
  await expect(date).toHaveAttribute('aria-pressed','true');
  await page.reload();
  await expect(date).toHaveAttribute('aria-pressed','true');
  await page.locator('input[name=slot][value="10:30"]').check();await submit(page);
  await expect(page.locator('.booking-progress [aria-current=step]')).toHaveText('Xác nhận');
  expect((await state(page)).state.draft.date).toBe(value);
  await page.locator('#consent').check();await submit(page);
  await expect(page.locator('.request-received')).toContainText('Đã gửi yêu cầu');
  await expect(page.locator('.chip.warning')).toContainText('Chờ phòng khám xác nhận');
  expect((await state(page)).state.visits[0].status).toBe('pending');
});

for (const width of [360,390,1440]) test(`five navigation controls have distinct actions and accessible targets at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  await page.goto('/prototype/index.html?scenario=upcoming');
  const nav=page.locator('#bottom-nav');
  await expect(nav.locator(':scope > *')).toHaveCount(5);
  await expect(nav.locator(':scope > :nth-child(3)')).toHaveAttribute('aria-label','Đặt lịch khám');
  const targets=await nav.locator(':scope > *').evaluateAll(els=>els.map(el=>{
    const r=el.getBoundingClientRect();return {width:r.width,height:r.height};
  }));
  for(const target of targets){expect(target.width).toBeGreaterThanOrEqual(44);expect(target.height).toBeGreaterThanOrEqual(44);}
  await page.locator('#bottom-nav a').nth(1).click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','D1');
  await page.locator('#bottom-nav a').nth(2).click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','K2');
  await page.locator('#bottom-nav a').nth(3).click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','K5');
  await expect(page.locator('#phone-content .btn.primary')).toHaveCount(1);
  await page.locator('#bottom-nav a').first().click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','B1');
  if(width===1440)await expect(page.locator('.phone-status-icons svg')).toHaveCount(3);
});

test('submitted, pending and confirmed states differ by copy and visual treatment; home passes axe',async({page})=>{
  await page.goto('/prototype/index.html?scenario=upcoming');
  await expect(page.locator('.visit-card .chip.success')).toHaveText('Đã xác nhận');
  const confirmed=await page.locator('.visit-card .chip').evaluate(el=>getComputedStyle(el).backgroundColor);
  const results=await new AxeBuilder({page}).include('.phone').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  await page.evaluate(()=>{
    const saved=JSON.parse(sessionStorage.getItem('careflow.browser.v3'));
    saved.state.visits[0].status='pending';
    sessionStorage.setItem('careflow.browser.v3',JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.locator('.visit-card .chip.warning')).toHaveText('Chờ phòng khám xác nhận');
  expect(await page.locator('.visit-card .chip').evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(confirmed);
});
