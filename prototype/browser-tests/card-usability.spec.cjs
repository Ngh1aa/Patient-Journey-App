const { test, expect } = require('@playwright/test');

const content = page => page.locator('#phone-content');
const collection = (page,key) => page.locator(`[data-collection="${key}"]`);
const visibleItems = root => root.locator('[data-collection-item]:visible');

for (const width of [360,390,1440]) {
  test('guide text has usable width and disclosure works with keyboard at '+width,async({page},info)=>{
    await page.setViewportSize({width,height:844});
    await page.goto('/prototype/?scenario=upcoming#/home');
    const guides=collection(page,'guides');
    await guides.scrollIntoViewIfNeeded();
    const widths=await guides.locator('.cf-guide-copy').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().width));
    // A page without horizontal overflow can still squeeze each word into a letter column.
    for(const textWidth of widths) expect(textWidth).toBeGreaterThan(180);
    const summary=guides.locator('summary').first();
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(guides.locator('details').first()).toHaveAttribute('open','');
    await expect(guides.locator('details').first().locator('ol li')).toHaveCount(3);
    await page.locator('.phone').screenshot({path:info.outputPath('guide-expanded-'+width+'.png')});
    await guides.locator('[data-collection-filter="online"]').click();
    await expect(visibleItems(guides)).toHaveCount(1);
    await guides.locator('summary:visible').click();
    await guides.getByRole('button',{name:'Tìm lịch khám online'}).click();
    await expect(content(page)).toHaveAttribute('data-screen','D1');
    await expect(page.locator('[data-visit-filter="online"]')).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.rich-filter-empty')).toBeVisible();
    await page.locator('.rich-filter-empty [data-appointment-reset]').click();
    await expect(page.locator('.rich-filterable:visible')).toHaveCount(1);
  });
}

test('appointment filters persist across tabs and reload, reset recovers from no matches',async({page})=>{
  await page.goto('/prototype/?journey=F1&branch=default#/appointments');
  await page.getByRole('button',{name:'Lọc lịch hẹn',exact:true}).click();
  await page.locator('[data-visit-filter="online"]').click();
  const count=await page.locator('.rich-filterable:visible').count();
  expect(count).toBeGreaterThan(0);
  await page.reload();
  await expect(page.locator('[data-visit-filter="online"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.rich-filterable:visible')).toHaveCount(count);
  await page.locator('.rich-appt-tabs [data-filter="past"]').click();
  await expect(page.locator('[data-visit-filter="online"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('.cf-appointment-filter-summary [data-appointment-reset]').click();
  await expect(page.locator('.rich-filterable:visible')).toHaveCount(2);
});

test('history search ignores Vietnamese accents, combines with categories and keeps selected visit',async({page})=>{
  await page.goto('/prototype/?journey=F1&branch=default#/appointments');
  const path=await page.evaluate(()=>window.CareFlowModel.SCREENS.find(s=>s.id==='K3').route);
  await page.goto('/prototype/#'+path);
  const root=collection(page,'history');
  await expect(visibleItems(root)).toHaveCount(2);
  await root.locator('[data-collection-search]').fill('KHAM');
  await expect(visibleItems(root)).toHaveCount(2);
  await root.locator('[data-collection-filter="stopped"]').click();
  await expect(visibleItems(root)).toHaveCount(0);
  await expect(root.locator('.cf-collection-empty')).toBeVisible();
  await root.locator('.cf-collection-empty [data-collection-reset]').click();
  await expect(visibleItems(root)).toHaveCount(2);
  await expect(root.locator('[data-collection-search]')).toHaveValue('');
  const selected=await root.locator('[data-to="H7"]').first().getAttribute('data-id');
  await root.locator('[data-to="H7"]').first().click();
  await expect(content(page)).toHaveAttribute('data-screen','H7');
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.activeVisitId)).toBe(selected);
});

test('lab filters and search preserve state, upload selects the correct lab',async({page})=>{
  await page.goto('/prototype/?scenario=pre-lab#/home');
  const path=await page.evaluate(()=>{
    const saved=JSON.parse(sessionStorage.getItem('careflow.browser.v3'));
    const visit=saved.state.visits[0];
    const second=structuredClone(visit.labs[0]);
    Object.assign(second,{id:'second-lab',name:'Kết quả xét nghiệm đã nhận',status:'available'});
    visit.labs.push(second);
    sessionStorage.setItem('careflow.browser.v3',JSON.stringify(saved));
    return window.CareFlowModel.SCREENS.find(s=>s.id==='F1').route.replace(':id',visit.id);
  });
  await page.goto('/prototype/?capture=lab-collection#'+path);
  const root=collection(page,'labs');
  await root.locator('[data-collection-filter="results"]').click();
  await expect(visibleItems(root)).toHaveCount(1);
  await expect(visibleItems(root)).toContainText('Kết quả xét nghiệm đã nhận');
  await page.reload();
  await expect(visibleItems(root)).toHaveCount(1);
  await root.locator('[data-collection-search]').fill('khong co');
  await expect(root.locator('.cf-collection-empty')).toBeVisible();
  await root.locator('.cf-collection-empty [data-collection-reset]').click();
  await expect(visibleItems(root)).toHaveCount(2);
  await root.locator('[data-collection-search]').fill('DA CHI DINH');
  await expect(visibleItems(root)).toHaveCount(1);
  await expect(visibleItems(root)).toContainText('Xem chỉ định');
  await root.locator('.cf-collection-meta [data-collection-reset]').click();
  await root.getByRole('button',{name:'Xem chỉ định',exact:true}).click();
  await content(page).locator('[data-to="F3"]').click();
  await page.locator('#labTime').fill('09:45');
  await content(page).locator('form [type="submit"]').click();
  await expect(content(page)).toHaveAttribute('data-screen','F2');
  await expect(page.locator('.cf-lab-schedule')).toContainText('09:45');
  await content(page).locator('[data-to="F4"]').click();
  await expect(content(page)).toHaveAttribute('data-screen','F4');
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).ui.labId)).not.toBe('second-lab');
  await page.locator('#file').setInputFiles({name:'Ket-qua.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n%%EOF')});
  await content(page).locator('form [type="submit"]').click();
  await expect(content(page)).toHaveAttribute('data-screen','F2');
  await expect(page.locator('.cf-file-summary')).toContainText('Ket-qua.pdf');
  await expect(page.locator('.cf-file-summary')).toContainText('PDF');
});

test('home record shortcuts recover when no completed visit is available',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/home');
  await page.locator('.home-quick-actions [data-to="H7"]').click();
  await expect(page.locator('#dialog')).toBeVisible();
  await expect(page.locator('#dialog-title')).toContainText('Chưa có tài liệu');
  await page.locator('#dialog-actions [data-to="K3"]').click();
  await expect(content(page)).toHaveAttribute('data-screen','K3');
  await expect(page.locator('#dialog')).not.toBeVisible();
  await page.goto('/prototype/#/home');
  await page.locator('[data-action="open-guide"]').click();
  await expect(page.locator('.cf-home-tip-card').first()).toHaveAttribute('open','');
  await expect(page.locator('.cf-home-tip-card summary').first()).toBeFocused();
});

test('notification category follows actual read state and bulk action updates it',async({page})=>{
  await page.goto('/prototype/?scenario=upcoming#/home');
  await page.locator('#notifications').click();
  await expect(content(page)).toHaveAttribute('data-screen','K1');
  const root=collection(page,'notifications');
  await root.locator('[data-collection-filter="unread"]').click();
  expect(await visibleItems(root).count()).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Đánh dấu tất cả đã đọc',exact:true}).click();
  await expect(visibleItems(root)).toHaveCount(0);
  await root.locator('[data-collection-filter="read"]').click();
  expect(await visibleItems(root).count()).toBeGreaterThan(0);
  const notifications=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.notifications);
  expect(notifications.every(n=>n.read)).toBe(true);
});
