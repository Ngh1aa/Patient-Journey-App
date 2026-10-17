const {test,expect}=require('@playwright/test');

test('shared CareFlow cards token source is available on patient and doctor',async({page})=>{
  await page.goto('/prototype/index.html?scenario=empty#/home');
  expect(await page.evaluate(()=>Boolean(window.CareFlowCardsV2))).toBe(true);
  expect(await page.evaluate(()=>window.CareFlowCardsV2.count(0))).toBe('0');
  expect(await page.evaluate(()=>window.CareFlowCardsV2.dateTime('2026-10-17','09:30'))).toBe('T7, 17/10 · 09:30');
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--cf2-brand').trim())).toBe('#001D57');
  await page.goto('/staff-prototype/index.html#/doctor');
  expect(await page.evaluate(()=>Boolean(window.CareFlowCardsV2))).toBe(true);
  await expect(page.locator('#app .doctor-surface').first()).toHaveAttribute('data-cf2-variant','surface');
  expect(await page.evaluate(()=>getComputedStyle(document.body).fontFamily)).toContain('Be Vietnam Pro');
});

test('home has complete section containers, useful shortcuts and no leading zero KPI',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/prototype/index.html?scenario=empty#/home');
  const home=page.locator('#phone-content[data-screen=B1]');
  await expect(home.locator('.cf-home-appointment .cf2-section-header')).toBeVisible();
  await expect(home.locator('.ref-overview .cf2-section-header')).toBeVisible();
  await expect(home.locator('.ref-overview-grid.cf2-section-container')).toBeVisible();
  await expect(home.locator('.cf-home-quick-grid.cf2-section-container')).toBeVisible();
  await expect(home.locator('.cf-home-quick-grid > button')).toHaveCount(4);
  await expect(home.locator('.cf2-quick-hint')).toHaveCount(4);
  const values=await home.locator('.ref-overview-grid > button > strong').allTextContents();
  expect(values).toEqual(['0','2','0']);
  expect(await home.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
  const columns=await home.locator('.cf-home-quick-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
  expect(columns).toBe(2);
});

test('contextual sections have one content container and real profile count',async({page})=>{
  await page.goto('/prototype/index.html?scenario=empty#/appointments');
  const node=page.locator('.cfx-screen-d1 .cfx-section');
  await expect(node).toBeVisible();
  await expect(node.locator(':scope > .cf2-section-container')).toHaveCount(1);
  await expect(node).toContainText('2 hồ sơ đang quản lý');
  const extra=page.locator('#phone-content .cf-appt-empty-cta');
  await extra.click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C1');
});

test('empty cancelled appointments uses secondary view-upcoming action, no primary booking',async({page})=>{
  await page.goto('/prototype/index.html?scenario=empty#/appointments');
  const content=page.locator('#phone-content');
  await content.locator('.rich-appt-tabs [data-filter=cancelled]').click();
  await expect(content.locator('.cf-appt-empty-cta')).toContainText('Xem lịch sắp tới');
  await expect(content.locator('.cf-appt-empty-cta')).toHaveAttribute('data-action','filter');
  await expect(content.locator('.cf-appt-empty-cta')).toHaveClass(/cf2-empty-secondary/);
  await content.locator('.cf-appt-empty-cta').click();
  await expect(content.locator('.rich-appt-tabs [data-filter=upcoming]')).toHaveAttribute('aria-pressed','true');
});

test('shared seven card states are semantic and error offers a nonfake retry action',async({page})=>{
  await page.goto('/prototype/index.html?scenario=empty#/home');
  const states=await page.evaluate(()=>{
    const c=window.CareFlowCardsV2;
    const host=document.createElement('div');
    host.innerHTML=c.stateView('loading')+c.stateView('empty',{title:'Chưa có kết quả'})+
      c.stateView('error',{title:'Không thể tải',retryAction:'retry-demo'})+
      c.stateView('zero')+c.stateView('unread')+
      c.card('<strong>Đang nhấn</strong>',{state:'pressed'});
    return [...host.children].map(x=>[x.getAttribute('data-cf2-state'),x.querySelector('[data-action]')?.dataset.action||null]);
  });
  expect(states).toEqual([['loading',null],['empty',null],['error','retry-demo'],['zero',null],['unread',null],['pressed',null]]);
});
