const {test,expect}=require('@playwright/test');
const main=page=>page.locator('#phone-content');
const submit=page=>main(page).locator('form [type=submit]').click();

for(const width of [360,390,1440])test(`approved artwork stays in its card without covering the text at ${width}px`,async({page},info)=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/prototype/?scenario=appointments#/home');
  await page.evaluate(()=>document.fonts.ready);
  await expect(main(page)).toHaveCSS('font-family',/Plus Jakarta Sans/);
  await expect(main(page).locator('.cf-help-strip img')).toHaveAttribute('src',/doctor-cutout\.webp/);
  const photos=await main(page).locator('img').evaluateAll(nodes=>nodes.map(el=>({alt:el.alt,loaded:el.complete&&el.naturalWidth>0})));
  expect(photos.every(p=>p.alt===''&&p.loaded)).toBe(true);
  const artwork=main(page).locator('.cf-illustration-slot');expect(await artwork.count()).toBeGreaterThan(1);
  for(const item of await artwork.all()){
    const bounds=await item.evaluate(el=>{const r=el.getBoundingClientRect(),card=el.closest('[data-cf-card]').getBoundingClientRect();return {left:r.left-card.left,right:card.right-r.right,w:r.width,h:r.height};});
    expect(bounds.w).toBeGreaterThanOrEqual(80);expect(bounds.h).toBeGreaterThan(60);
    expect(bounds.left).toBeGreaterThanOrEqual(12);expect(bounds.right).toBeGreaterThanOrEqual(12);
  }
  const links=main(page).locator('.cf-section-link');expect(await links.count()).toBeGreaterThan(2);
  for(const link of await links.all())await expect(link).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  await page.locator('.phone').screenshot({path:info.outputPath('blue-green-'+width+'.png')});
});

test('illustrated mode choices keep the selected mode and safety flow',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/home');
  await page.locator('#bottom-nav .nav-book').click();await submit(page);
  await page.locator('#reason').fill('Tôi muốn trao đổi với phòng khám.');await submit(page);
  await page.locator('input[value=normal]').check();await submit(page);
  await expect(main(page)).toHaveAttribute('data-screen','C6');
  await expect(page.locator('.cf-mode-choice .cf-illustration')).toHaveCount(2);
  await page.locator('.cf-mode-choice input[value=online]').check();await submit(page);
  await expect(main(page)).toHaveAttribute('data-screen','C7');
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.draft.mode)).toBe('online');
});

test('detail icon shortcuts and image result arrows retain the exact visit and lab',async({page})=>{
  await page.goto('/prototype/?scenario=pre-lab#/home');
  const before=await page.evaluate(()=>{const s=JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state;return {visit:s.activeVisitId,lab:s.visits.find(v=>v.id===s.activeVisitId).labs[0].id,status:s.visits.find(v=>v.id===s.activeVisitId).status}});
  await page.locator('.cf-home-appointment-button').click();
  await expect(page.locator('.ticket')).toBeVisible();
  await page.locator('.cf-detail-shortcuts').getByRole('button',{name:'Chỉ định',exact:true}).click();
  await expect(main(page)).toHaveAttribute('data-screen','F1');
  await page.getByRole('button',{name:'Xem chỉ định',exact:true}).click();
  await expect(main(page)).toHaveAttribute('data-screen','F2');
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).ui.labId)).toBe(before.lab);
  await page.locator('.cf-detail-shortcuts').getByRole('button',{name:'Hỗ trợ',exact:true}).click();
  await expect(main(page)).toHaveAttribute('data-screen','K5');
  const after=await page.evaluate(()=>{const s=JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state;return {visit:s.activeVisitId,status:s.visits.find(v=>v.id===s.activeVisitId).status}});
  expect(after).toEqual({visit:before.visit,status:before.status});
});


test('preparation and question entries keep distinct destinations and do not mutate the visit',async({page})=>{
  await page.goto('/prototype/?scenario=upcoming#/home');
  await page.locator('.cf-question-card button').first().click();
  await expect(main(page)).toHaveAttribute('data-screen','K5');
  await expect(page.locator('.cf-support-network')).toBeVisible();
  await page.goto('/prototype/#/home');
  await page.locator('.cf-action-tile[data-to="E1"]').click();
  await expect(main(page)).toHaveAttribute('data-screen','E1');
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.visits[0].status)).toBe('confirmed');
});
