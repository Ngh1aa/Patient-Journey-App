const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const state = page => page.evaluate(() => JSON.parse(sessionStorage.getItem('careflow.browser.v3')));
const submit = page => page.locator('#phone-content form [type=submit]').click();

test('fixed full-width navy canvas remains behind scrolling content and horizontal cards have a peek', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=upcoming');
  const geometry = () => page.locator('#phone-frame').evaluate(el=>{
    const style=getComputedStyle(el,'::before'),box=el.getBoundingClientRect();
    return {height:parseFloat(style.height),width:parseFloat(style.width),frameHeight:box.height,frameWidth:el.clientWidth,background:style.backgroundImage,scrollbar:getComputedStyle(document.querySelector('#phone-main')).scrollbarWidth};
  });
  const before=await geometry();
  expect(before.height/before.frameHeight).toBeGreaterThan(.50);
  expect(before.height/before.frameHeight).toBeLessThanOrEqual(.55);
  expect(before.width).toBe(before.frameWidth);
  expect(before.scrollbar).toBe('none');
  await expect(page.locator('.quick-actions button')).toHaveCount(4);
  const rail=page.locator('.home-tasks');
  expect(await rail.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
  await page.locator('.service-section').scrollIntoViewIfNeeded();
  expect(await page.locator('#phone-main').evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  expect(await geometry()).toEqual(before);
});

test('symptom chips add editable content, four steps remain visible and severity follows the draft', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  await page.locator('.quick-actions [data-action=begin]').click();await submit(page);
  await page.locator('.symptom-chips [data-value="Đau đầu"]').click();
  await expect(page.locator('#reason')).toHaveValue('Đau đầu');
  await page.locator('input[name=feeling][value="2"]').check();
  await expect(page.locator('.booking-progress li')).toHaveCount(4);
  const cta=await page.locator('form [type=submit]').boundingBox(),nav=await page.locator('#bottom-nav').boundingBox();
  expect(cta.y+cta.height).toBeLessThanOrEqual(nav.y);
  await submit(page);
  expect((await state(page)).state.draft.reason).toContain('Mức độ cảm nhận: Vừa');
});

test('callback window is a request preference and reviewed results can be filtered without changing their state', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=completed');
  await page.locator('#bottom-nav a').nth(3).click();
  await page.locator('#phone-content [data-action=clinic-call]').click();
  await page.locator('#dialog input[value=afternoon]').check();
  await page.locator('#dialog form[data-form=callback-window] [type=submit]').click();
  expect((await state(page)).state.requests.find(r=>r.type==='callback').preferredWindow).toBe('afternoon');
  await expect(page.locator('#dialog')).toContainText('chưa phải giờ gọi đã xác nhận');
  await page.locator('#dialog [data-action=close-dialog]').click();
  await page.evaluate(()=>{
    const saved=JSON.parse(sessionStorage.getItem('careflow.browser.v3'));
    saved.state.visits[0].labs[0].status='reviewed';
    sessionStorage.setItem('careflow.browser.v3',JSON.stringify(saved));
    const route=CareFlowModel.SCREENS.find(x=>x.id==='H7').route.replace(':id',saved.state.activeVisitId);
    history.replaceState(null,'','#'+route);
  });
  await page.reload();
  await page.locator('[data-action=result-filter][data-filter=reviewed]').click();
  await expect(page.locator('#phone-content [data-to=F2]')).toHaveCount(1);
  expect((await state(page)).state.visits[0].labs[0].status).toBe('reviewed');
});

test('in-call drawer switches views and saves a private note without sending a clinic message', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=online');
  await page.evaluate(()=>{
    const s=CareFlowModel.fixture('online'),id=s.activeVisitId;
    for(const status of ['reminder','online-wait','calling','in-consult']) {
      const result=CareFlowModel.transition(s,id,status,status==='calling'||status==='reminder'?'staff':'patient');
      if(!result.ok)throw new Error(result.code);
    }
    sessionStorage.setItem('careflow.browser.v3',JSON.stringify({state:s,ui:{inspection:true,forms:{}}}));
    history.replaceState(null,'','#'+CareFlowModel.SCREENS.find(x=>x.id==='G4').route.replace(':id',id));
  });
  await page.reload();
  await page.locator('.call-drawer > summary').click();
  await page.locator('[data-action=call-tab][data-tab=chat]').click();
  await expect(page.locator('.call-notes')).toBeVisible();
  await page.locator('[data-action=call-tab][data-tab=notes]').click();
  await page.locator('#callNote').fill('Điều cần hỏi trong buổi khám');
  const previous=(await state(page)).state.messages.length;
  await page.locator('form[data-form=call-note] [type=submit]').click();
  const saved=await state(page);
  expect(saved.ui.callNotes[saved.state.activeVisitId]).toBe('Điều cần hỏi trong buổi khám');
  expect(saved.state.messages.length).toBe(previous);
  await page.reload();
  await expect(page.locator('#callNote')).toHaveValue('Điều cần hỏi trong buổi khám');
});

test('explicit severe symptom selection opens the full urgent panel before submitting a report', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=completed');
  await page.locator('.service-section [data-to=I1]').click();
  await page.locator('.care-entry-grid [data-reason=symptoms]').click();
  await page.locator('.feeling-scale label:has(input[value="3"])').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C4');
  await expect(page.locator('[data-action=emergency]')).toBeVisible();
  await expect(page.locator('#phone-content .card')).toHaveCount(0);
  expect((await state(page)).state.reports).toHaveLength(0);
});

test('icon navigation is compact, named for screen readers and profile add follows the selection', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  const nav=page.locator('#bottom-nav');
  expect((await nav.boundingBox()).height).toBeLessThanOrEqual(64);
  for(const el of await nav.locator(':scope > *').all()) await expect(el).toHaveAttribute('aria-label', /.+/);
  for(const caption of await nav.locator('.nav-caption').all()) await expect(caption).toBeHidden();
  await nav.locator('.nav-book').click();
  await expect(page.locator('.selection-reminder')).toHaveAttribute('role','note');
  await expect(page.locator('.patient-group')).toContainText('Ngày sinh · 15/08/1994');
  await expect(page.locator('.patient-group .choice-visual svg')).toHaveCount(2);
  const portrait=await page.locator('.patient-choice .choice-visual').first().innerHTML();
  await page.locator('.patient-group input[value=p2]').check();
  expect(await page.locator('.add-relative-inline').evaluate(el=>el.previousElementSibling.querySelector('input').value)).toBe('p2');
  await page.reload();
  expect(await page.locator('.add-relative-inline').evaluate(el=>el.previousElementSibling.querySelector('input').value)).toBe('p2');
  expect(await page.locator('.patient-choice .choice-visual').first().innerHTML()).toBe(portrait);
});

test('appointment management follows the timeline and opens keyboard-accessible sheets', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=upcoming');
  await page.locator('.visit-card').click();
  const tools=page.locator('.appointment-tools');
  expect(await tools.evaluate(el=>!!(document.querySelector('.visit-journey').compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await tools.locator('[data-to=D3]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','D3');
  await expect(page.locator('.route-sheet')).toHaveAttribute('aria-modal','true');
  await expect(page.locator('#bottom-nav')).toHaveAttribute('inert','');
  await page.goBack();
  await page.locator('.appointment-tools [data-to=D4]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','D4');
  expect((await state(page)).state.visits[0].status).toBe('confirmed');
  await page.keyboard.press('Escape');
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','D2');
});

test('contextual tips open with keyboard; patient shortcut returns to the existing selection screen', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  await page.locator('#bottom-nav .nav-book').click();
  await expect(page.locator('.selection-reminder')).toContainText('Kiểm tra hồ sơ');
  await submit(page);
  const tip=page.locator('.ux-tip');
  await tip.locator('summary').focus();await page.keyboard.press('Enter');
  await expect(tip).toHaveAttribute('open','');
  await expect(tip.locator('p')).toBeVisible();
  await page.locator('button.context-edit').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C1');
  await expect(page.locator('input[value=p1]')).toBeChecked();
});

test('central booking action preserves unsent fields across tabs, Back and reload', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  await page.locator('#bottom-nav .nav-book').click();
  await submit(page);
  await page.locator('#reason').fill('Nội dung đang nhập chưa gửi');
  await page.locator('.history-disclosure summary').click();
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
  await expect(page.locator('.booking-progress [aria-current=step]')).toHaveText('Kiểm tra');
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
