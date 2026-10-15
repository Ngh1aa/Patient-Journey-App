const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const state = page => page.evaluate(() => JSON.parse(sessionStorage.getItem('careflow.browser.v3')));
const submit = page => page.locator('#phone-content form [type=submit]').click();

test('icon navigation is compact, named for screen readers and profile add follows the selection', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  const nav=page.locator('#bottom-nav');
  expect((await nav.boundingBox()).height).toBeLessThanOrEqual(64);
  for(const el of await nav.locator(':scope > *').all()) await expect(el).toHaveAttribute('aria-label', /.+/);
  for(const caption of await nav.locator('.nav-caption').all()) await expect(caption).toBeHidden();
  await nav.locator('.nav-book').click();
  await expect(page.locator('.selection-reminder')).toHaveCount(0);
  await expect(page.locator('#bottom-nav')).toBeHidden();
  await expect(page.locator('.patient-group')).toContainText('Ngày sinh · 15/08/1994');
  await expect(page.locator('.patient-group .choice-visual svg')).toHaveCount(2);
  const portrait=await page.locator('.patient-choice .choice-visual').first().innerHTML();
  await page.locator('.patient-group input[value=p2]').check();
  expect(await page.locator('.add-relative-inline').evaluate(el=>el.previousElementSibling.querySelector('input').value)).toBe('p2');
  await page.reload();
  expect(await page.locator('.add-relative-inline').evaluate(el=>el.previousElementSibling.querySelector('input').value)).toBe('p2');
  expect(await page.locator('.patient-choice .choice-visual').first().innerHTML()).toBe(portrait);
});

test('appointment management is before the ticket and opens existing change/cancel flows', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=upcoming');
  await page.locator('.visit-card').click();
  const tools=page.locator('.appointment-tools');
  expect(await tools.evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('.ticket')) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await tools.locator('[data-to=D3]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','D3');
  await page.goBack();
  await page.locator('.appointment-tools [data-to=D4]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','D4');
  expect((await state(page)).state.visits[0].status).toBe('confirmed');
});

test('contextual tips open with keyboard; patient shortcut returns to the existing selection screen', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  await page.locator('#bottom-nav .nav-book').click();
  await expect(page.locator('.selection-reminder')).toHaveCount(0);
  await submit(page);
  const tip=page.locator('.ux-tip');
  await tip.locator('summary').focus();await page.keyboard.press('Enter');
  await expect(tip).toHaveAttribute('open','');
  await expect(tip.locator('p')).toBeVisible();
  await page.locator('button.context-edit').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C1');
  await expect(page.locator('input[value=p1]')).toBeChecked();
});

test('booking hides tab nav and preserves draft through Back, forward and reload', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  await page.locator('#bottom-nav .nav-book').click();
  await submit(page);
  await expect(page.locator('#bottom-nav')).toBeHidden();
  await page.locator('#reason').fill('Nội dung đang nhập chưa gửi');
  await page.locator('#medicalHistory').fill('Thông tin cần giữ lại');
  const original=(await state(page)).state.draft;
  await page.reload();
  await expect(page.locator('#reason')).toHaveValue('Nội dung đang nhập chưa gửi');
  await expect(page.locator('#medicalHistory')).toHaveValue('Thông tin cần giữ lại');
  await page.goBack();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C1');
  await page.goForward();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C2');
  await expect(page.locator('#reason')).toHaveValue('Nội dung đang nhập chưa gửi');
  expect((await state(page)).state.draft).toEqual(original);
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
  await expect(page.locator('.booking-progress [aria-current=step] > span:last-child')).toHaveText('Lịch hẹn');
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
