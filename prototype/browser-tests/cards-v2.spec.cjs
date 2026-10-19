const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises');
const AxeBuilder=require('@axe-core/playwright').default;
const main=page=>page.locator('#phone-content');
const route=async(page,id)=>{
  const hash=await page.evaluate(id=>{const saved=JSON.parse(sessionStorage.getItem('careflow.browser.v3'));return window.CareFlowModel.SCREENS.find(s=>s.id===id).route.replace(':id',saved.state.activeVisitId)},id);
  await page.goto('/prototype/#'+hash);
  await expect(main(page)).toHaveAttribute('data-screen',id);
};

test('preparation and notes persist per visit, survive navigation and clear on logout',async({page})=>{
  await page.goto('/prototype/?journey=F1&branch=default#/appointments');
  const ids=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.visits.filter(v=>['confirmed','pending','mode-review','reminder'].includes(v.status)).map(v=>v.id));
  expect(ids.length).toBeGreaterThan(1);
  await page.locator(`.rich-appt-card [data-action="go"][data-to="D2"][data-id="${ids[0]}"]`).click();
  const tools=page.locator('[data-visit-tools]');
  await tools.locator('[data-preparation="details"]').check();
  await tools.locator('[data-visit-note]').fill('Câu hỏi riêng <không gửi tự động>');
  await expect(tools.locator('[data-preparation-count]')).toHaveText('1/3 đã chuẩn bị');
  await route(page,'E1');
  await expect(tools.locator('[data-preparation="details"]')).toBeChecked();
  await page.reload();
  await expect(tools.locator('[data-visit-note]')).toHaveValue('Câu hỏi riêng <không gửi tự động>');
  await expect(page.locator('[data-visit-note] script')).toHaveCount(0);
  await page.locator('#bottom-nav [aria-label="Lịch hẹn"]').click();
  await page.locator(`.rich-appt-card [data-action="go"][data-to="D2"][data-id="${ids[1]}"]`).click();
  await expect(tools.locator('[data-preparation-count]')).toHaveText('0/3 đã chuẩn bị');
  await expect(tools.locator('[data-visit-note]')).toHaveValue('');
  const saved=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')));
  expect(saved.state.requests).toHaveLength(0);
  await route(page,'K2');
  await main(page).locator('[data-action="confirm-logout"]').click();
  await page.locator('#dialog [data-action="logout"]').click();
  const cleared=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).ui);
  expect(cleared.visitNotes).toEqual({});expect(cleared.preparation).toEqual({});
});

test('calendar export uses the selected appointment time without clinical data',async({page})=>{
  await page.goto('/prototype/?scenario=upcoming#/home');
  await main(page).getByRole('button',{name:'Xem phiếu khám',exact:true}).click();
  const data=await page.evaluate(()=>{const s=JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state;return s.visits.find(v=>v.id===s.activeVisitId)});
  const event=page.waitForEvent('download');
  await page.locator('[data-action="save-calendar"]').click();
  const download=await event;
  expect(download.suggestedFilename()).toBe(data.id+'.ics');
  const text=await fs.readFile(await download.path(),'utf8');
  expect(text).toContain('BEGIN:VCALENDAR\r\nVERSION:2.0');
  const start=new Date(data.date+'T'+data.slot+':00+07:00').toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
  expect(text).toContain('DTSTART:'+start);expect(text).not.toContain(data.reason);
  expect(text).not.toContain('DTEND:');
  await expect(page.locator('[data-calendar-feedback]')).toContainText('Đã tạo tệp lịch');
});

test('appointment search composes with mode and person filters and resets the zero state',async({page})=>{
  await page.goto('/prototype/?journey=F1&branch=default#/appointments');
  await page.locator('#appointment-search').fill('khongco123');
  await expect(page.locator('.rich-filter-empty')).toBeVisible();
  await page.reload();await expect(page.locator('#appointment-search')).toHaveValue('khongco123');
  await page.locator('.rich-filter-empty [data-appointment-reset]').click();
  await expect(page.locator('.rich-appt-card:visible')).toHaveCount(3);
  await page.getByRole('button',{name:'Lọc lịch hẹn',exact:true}).click();
  await page.locator('[data-visit-filter="online"]').click();
  const id=await page.locator('.rich-appt-card:visible [data-to="D2"]').first().getAttribute('data-id');
  await page.locator('#appointment-search').fill(id.toLowerCase());
  await expect(page.locator('.rich-appt-card:visible')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('[data-visit-filter="online"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.rich-appt-card:visible')).toHaveCount(1);
});

for(const width of [320,360,390,1440])test('booking nav and card facts remain readable at '+width,async({page},info)=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/prototype/?scenario=upcoming#/home');
  const book=page.locator('#bottom-nav .nav-book');
  await expect(book.locator('.nav-caption')).toBeHidden();
  await expect(book.locator('.nav-plus')).toHaveCSS('background-color','rgb(11, 18, 32)');
  const targets=await page.locator('#bottom-nav a,#bottom-nav button').evaluateAll(nodes=>nodes.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})));
  expect(targets).toHaveLength(5);targets.forEach(t=>{expect(t.w).toBeGreaterThanOrEqual(44);expect(t.h).toBeGreaterThanOrEqual(44)});
  await book.focus();await page.keyboard.press('Enter');
  await expect(main(page)).toHaveAttribute('data-screen','C1');
  await page.goto('/prototype/?scenario=upcoming#/home');
  await route(page,'E1');
  const labels=await main(page).locator('[data-cf-component="facts"] dt').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));
  labels.forEach(w=>expect(w).toBeGreaterThan(90));
  const tools=page.locator('[data-visit-tools]');await tools.scrollIntoViewIfNeeded();
  await page.locator('.phone').screenshot({path:info.outputPath('preparation-'+width+'.png')});
});

test('desktop followup search filters owner and state without offering delegated completion',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/staff-prototype/#/doctor/followups');
  const cards=page.locator('.journey-task-entry');const count=await cards.count();expect(count).toBeGreaterThan(1);
  await page.locator('[data-followup-field="owner"]').selectOption('delegated');
  await expect(page.locator('.journey-task-entry [data-action="doc-task-toggle"]')).toHaveCount(0);
  await page.locator('[data-followup-query]').fill('khongco123');
  await expect(page.locator('[data-cf-state="empty"]')).toContainText('Không có công việc phù hợp');
  await page.getByRole('button',{name:'Xóa bộ lọc',exact:true}).click();await expect(cards).toHaveCount(count);
  await page.locator('[data-followup-field="owner"]').selectOption('mine');
  await cards.first().locator('[data-action="doc-task-toggle"]').click();
  await page.locator('[data-followup-field="status"]').selectOption('done');
  await expect(cards).toHaveCount(1);await expect(cards).toContainText('Đã xử lý');
  await page.reload();await page.locator('[data-followup-field="status"]').selectOption('done');
  await expect(cards).toHaveCount(1);
  const result=await new AxeBuilder({page}).include('#content').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(result.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
});

test('lab artwork is local vector presentation and never substitutes for a clinical result',async({page})=>{
  await page.goto('/prototype/?scenario=pre-lab');await route(page,'F1');
  const artwork=page.locator('.cf-lab-card .cf-illustration');await expect(artwork).toBeVisible();
  await expect(artwork).toHaveAttribute('aria-hidden','true');
  await expect(page.locator('.cf-lab-card img')).toHaveCount(0);
  await expect(page.locator('.cf-lab-card')).toContainText('Đã chỉ định');
  await page.getByRole('button',{name:'Xem chỉ định',exact:true}).click();
  await expect(main(page)).toHaveAttribute('data-screen','F2');
});

test('200 percent booking label and private tools reflow and remain usable offline',async({page})=>{
  await page.setViewportSize({width:360,height:900});
  await page.goto('/prototype/?scenario=upcoming#/home');
  await page.evaluate(()=>{
    const key='careflow.browser.v3',saved=JSON.parse(sessionStorage.getItem(key));
    saved.state.settings.largeText=true;saved.state.offline=true;
    sessionStorage.setItem(key,JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.locator('.nav-book .nav-caption')).toBeHidden();
  await expect(page.locator('.nav-book')).toHaveAccessibleName('Đặt lịch');
  await expect(page.locator('.nav-book .nav-plus')).toHaveCSS('border-width','4px');
  await route(page,'E1');
  const tools=page.locator('[data-visit-tools]');
  await tools.locator('[data-preparation="details"]').focus();await page.keyboard.press('Space');
  await expect(tools.locator('[data-preparation-count]')).toHaveText('1/3 đã chuẩn bị');
  await tools.locator('[data-visit-note]').fill('</textarea><img src=x onerror="window.noteLeaked=true">');
  await page.reload();
  expect(await page.evaluate(()=>window.noteLeaked)).toBeUndefined();
  await expect(tools.locator('img')).toHaveCount(0);
  const clipped=await main(page).locator('[data-cf-card],textarea').evaluateAll(nodes=>nodes.filter(n=>n.scrollWidth>n.clientWidth+2).map(n=>n.className));
  expect(clipped).toEqual([]);
  const rect=await tools.locator('.cf-preparation-checks label').first().boundingBox();expect(rect.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.requests.length)).toBe(0);
});

test('online preparation leads to device checks and completed visits show aftercare notes',async({page})=>{
  await page.goto('/prototype/?scenario=online#/home');
  await page.getByRole('button',{name:/Chuẩn bị cho buổi khám/}).click();
  await expect(main(page)).toHaveAttribute('data-screen','G1');
  await expect(main(page)).toHaveAttribute('data-guarded','');
  await page.goto('/prototype/?scenario=completed#/home');
  await route(page,'D2');
  await expect(page.locator('[data-visit-tools] h2')).toHaveText('Câu hỏi cho lần trao đổi tới');
  await expect(page.locator('[data-visit-tools] [data-preparation]')).toHaveCount(0);
  await expect(page.locator('[data-action="save-calendar"]')).toHaveCount(0);
});
