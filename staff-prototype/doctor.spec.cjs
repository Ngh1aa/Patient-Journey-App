const {test,expect}=require('../prototype/node_modules/@playwright/test');
const cases=[
 ['dashboard','/doctor','Lịch khám'],
 ['schedule','/doctor/schedule','Lịch khám của tôi'],
 ['queue','/doctor/queue','Danh sách khám'],
 ['patients','/patients','Hồ sơ bệnh nhân'],
 ['profile','/patients/p-006','Võ Thanh Tùng'],
 ['encounter','/encounters/a-033','KHÁM LÂM SÀNG'],
 ['results','/results','Kết quả cận lâm sàng'],
 ['orders','/clinical/orders','Chỉ định cận lâm sàng'],
 ['prescription','/clinical/prescription','Đơn thuốc'],
 ['review','/clinical/review','Rà soát hồ sơ khám'],
 ['followups','/doctor/followups','Theo dõi sau khám'],
 ['visit','/visits/a-033','Thông tin lượt khám']
];
for(const group of [0,1,2]){
 test('doctor-only 12-screen visual snapshots — cohort '+(group+1),async({page},testInfo)=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const [name,path,title] of cases.slice(group*4,group*4+4)){
   await page.goto('/staff-prototype/index.html#'+path);
   await expect(page.locator('main')).toContainText(title);
   await expect(page.locator('.doctor-sidebar')).toBeVisible();
   await expect(page.locator('.app-footer')).toContainText('Prototype UI/UX');
   await expect(page.locator('.demo-indicator')).toHaveCount(0);
   await expect(page.locator('main h1 svg, main h2 svg')).toHaveCount(0);
   await expect(page.locator('.sidebar [aria-current="page"]')).toHaveCount(1);
   const navFits=await page.evaluate(()=>{
     const item=document.querySelector('.sidebar-nav a[href="#/doctor/followups"]');
     const viewport=document.querySelector('.sidebar-nav');
     return item && viewport && item.getBoundingClientRect().bottom<=viewport.getBoundingClientRect().bottom+2;
   });
   expect(navFits,name+' sidebar last item clipped').toBe(true);
   const dimensions=await page.evaluate(()=>({body:document.documentElement.scrollWidth,viewport:innerWidth}));
   expect(dimensions.body,name+' horizontal overflow').toBeLessThanOrEqual(dimensions.viewport+1);
   await page.screenshot({path:testInfo.outputPath('doctor-'+name+'.png'),fullPage:true,animations:'disabled'});
  }
  expect(errors).toEqual([]);
 });
}
test('site defaults to doctor and rejects all reception and nursing routes',async({page})=>{
 await page.goto('/staff-prototype/');
 await expect(page).toHaveURL(/#\/doctor$/);
 await expect(page.locator('.doctor-hero h1')).toContainText('Lịch khám');
 await expect(page.locator('.switch-options')).toHaveCount(0);
 await expect(page.locator('.sidebar-nav [href*="reception"]')).toHaveCount(0);
 await expect(page.locator('.sidebar-nav [href*="nursing"]')).toHaveCount(0);
 for(const path of ['/reception','/nursing','/welcome','/requests','/checkin','/booking/new','/schedule/a-018']){
  await page.goto('/staff-prototype/index.html#'+path);
  await expect(page).toHaveURL(/#\/doctor$/);
 }
 await page.goto('/staff-prototype/index.html#/calendar');
 await expect(page).toHaveURL(/#\/doctor\/schedule$/);
});
test('doctor schedule navigation and patient queue',async({page})=>{
 await page.goto('/staff-prototype/index.html#/doctor/schedule');
 await expect(page.locator('.doctor-today-list')).toContainText('Võ Thanh Tùng');
 await page.locator('[data-action="next-week"]').click();
 await expect(page.locator('.doctor-empty')).toContainText('Không có lịch khám');
 await page.locator('[data-action="doc-today"]').first().click();
 await expect(page.locator('.doctor-today-list')).toContainText('Võ Thanh Tùng');
 await page.goto('/staff-prototype/index.html#/doctor/queue');
 await page.locator('[data-action="doc-filter-queue"][data-value="ready"]').click();
 await expect(page.locator('.doctor-today-list')).toContainText('Phạm Gia Huy');
 await page.locator('[data-action="start-consult"][data-id="a-027"]').click();
 await expect(page).toHaveURL(/#\/encounters\/a-027$/);
});
test('doctor clinical draft, signature simulation, state recovery',async({page})=>{
 await page.goto('/staff-prototype/index.html#/encounters/a-033');
 await page.locator('textarea[name="symptom"]').fill('Ghi chú khám minh họa phục vụ portfolio.');
 await page.locator('textarea[name="assessment"]').fill('Đã xem các thông tin liên quan trong kịch bản.');
 await page.locator('[data-action="save-draft"]').first().click();
 await expect(page.locator('.toast')).toContainText('Đã lưu ghi nhận thăm khám');
 await page.reload();
 await expect(page.locator('textarea[name="symptom"]')).toHaveValue('Ghi chú khám minh họa phục vụ portfolio.');
 await page.locator('[data-action="review-sign"]').first().click();
 await expect(page.locator('.dialog-card')).toContainText('không tạo chữ ký');
 await page.locator('[data-action="confirm-sign"]').click();
 await expect(page.locator('.consult-top')).toContainText('Đã hoàn tất');
 await expect(page.locator('[data-action="review-sign"]')).toBeDisabled();
});
test('doctor result review, patient roster and profile tabs',async({page})=>{
 await page.goto('/staff-prototype/index.html#/results');
 await expect(page.locator('.doctor-lab-list')).toContainText('Công thức máu');
 await page.locator('[data-action="review-result"][data-id="r-01"]').click();
 await expect(page.locator('.doctor-result-preview')).toContainText('Bác sĩ đã xem');
 await page.goto('/staff-prototype/index.html#/patients');
 await page.locator('#doctor-search').fill('Thanh Tùng');
 await expect(page.locator('.doctor-directory-row')).toHaveCount(1);
 await page.locator('.doctor-directory-open').click();
 await expect(page).toHaveURL(/#\/patients\/p-006$/);
 await page.locator('[data-action="profile-tab"][data-value="history"]').click();
 await expect(page.locator('.profile-body')).toContainText('PK-1015-033');
 await page.locator('[data-action="open-appointment"][data-id="a-033"]').click();
 await expect(page).toHaveURL(/#\/visits\/a-033$/);
 await expect(page.locator('main')).toContainText('Đang khám');
});
test('follow-up internal task change persists without contacting patients',async({page})=>{
 await page.goto('/staff-prototype/index.html#/doctor/followups');
 await page.locator('[data-action="doc-task-toggle"][data-id="t01"]').click();
 await expect(page.locator('.doctor-task.is-done')).toHaveCount(1);
 await page.reload();
 await expect(page.locator('.doctor-task.is-done')).toHaveCount(1);
});
test('visual contrast, button focus and 1920px hero',async({page},testInfo)=>{
 await page.setViewportSize({width:1920,height:1080});
 await page.goto('/staff-prototype/index.html#/doctor');
 await expect(page.locator('.doctor-sidebar')).toBeVisible();
 const visual=await page.evaluate(()=>{
  const hero=document.querySelector('.doctor-hero');
  const text=hero.querySelector('h1');
  const computedHero=getComputedStyle(hero);
  const computedText=getComputedStyle(text);
  return {font:getComputedStyle(document.body).fontFamily,hero:computedHero.backgroundColor,color:computedText.color,headline:parseFloat(computedText.fontSize),viewport:innerWidth,scroll:document.documentElement.scrollWidth}
 });
 expect(visual.font).toContain('Plus Jakarta Sans');
 expect(visual.headline).toBeGreaterThan(36);
 expect(visual.color).toBe('rgb(255, 255, 255)');
 expect(visual.scroll).toBeLessThanOrEqual(visual.viewport+1);
 await page.locator('.doctor-hero .btn-hero').focus();
 await expect(page.locator('.doctor-hero .btn-hero')).toHaveCSS('outline-style','solid');
 await page.screenshot({path:testInfo.outputPath('doctor-hero-1920.png'),fullPage:true,animations:'disabled'});
});

test('Lucide medical icon registry, clinical copy and compact data-led cards',async({page})=>{
 await page.goto('/staff-prototype/index.html#/doctor');
 await page.evaluate(()=>document.fonts.ready);
 const data=await page.evaluate(()=>{
  const stat=document.querySelector('.doctor-stat-card'),hero=document.querySelector('.doctor-hero');
  return {font:getComputedStyle(document.body).fontFamily,statHeight:Math.round(stat.getBoundingClientRect().height),heroHeight:Math.round(hero.getBoundingClientRect().height),iconPaths:Object.keys(window.CareFlowIcons||{}),svgCount:document.querySelectorAll('.doctor-sidebar svg').length};
 });
 expect(data.font).toContain('Plus Jakarta Sans');
 expect(data.iconPaths).toContain('stethoscope');
 expect(data.iconPaths).toContain('pill');
 expect(data.iconPaths.length).toBeGreaterThanOrEqual(25);
 expect(data.svgCount).toBeGreaterThanOrEqual(10);
 expect(data.statHeight).toBeLessThan(180);
 expect(data.heroHeight).toBeLessThan(330);
 await expect(page.locator('.doctor-now-details')).toContainText('Hình thức');
 await page.goto('/staff-prototype/index.html#/doctor/schedule');
 await expect(page.locator('.doctor-next-visit')).toContainText('LƯỢT KHÁM TIẾP THEO');
 await page.goto('/staff-prototype/index.html#/doctor/followups');
 await expect(page.locator('.doctor-followups-summary')).toContainText('Kết quả chưa xem');
 await page.goto('/staff-prototype/index.html#/clinical/prescription');
 await expect(page.locator('.support-rx-metadata')).toContainText('Lượt khám');
 await expect(page.locator('main h1 svg, main h2 svg')).toHaveCount(0);
});

test('sidebar fills the vertical rail with evenly distributed doctor links',async({page},testInfo)=>{
 const width=page.viewportSize().width;
 for(const height of [700,768,900,1080]){
  await page.setViewportSize({width,height});
  await page.goto('/staff-prototype/index.html#/doctor');
  const layout=await page.evaluate(()=>{
   const sidebar=document.querySelector('.doctor-sidebar');
   const nav=sidebar.querySelector('.sidebar-nav');
   const bottom=sidebar.querySelector('.sidebar-bottom');
   const groups=[...nav.querySelectorAll('.side-section')];
   const rect=el=>el.getBoundingClientRect();
   return {
    sidebar:rect(sidebar).toJSON(),nav:rect(nav).toJSON(),bottom:rect(bottom).toJSON(),
    overflow:nav.scrollHeight>nav.clientHeight+2,
    allLinks:[...nav.querySelectorAll('.nav-item')].map(el=>rect(el).toJSON()),
    groupIntervals:groups.map(group=>{
     const links=[...group.querySelectorAll('.nav-item')];
     const tops=links.map(el=>rect(el).top);
     return tops.slice(1).map((top,i)=>top-tops[i]);
    }),
    active:[...nav.querySelectorAll('.nav-item[aria-current="page"]')].length
   };
  });
  expect(layout.active).toBe(1);
  expect(layout.allLinks).toHaveLength(10);
  expect(Math.abs(layout.sidebar.bottom-height)).toBeLessThan(2);
  expect(layout.bottom.bottom).toBeLessThanOrEqual(height);
  expect(layout.bottom.bottom).toBeGreaterThan(height-35);
  expect(layout.nav.bottom).toBeLessThanOrEqual(layout.bottom.top+2);
  if(height>=768){
   expect(layout.overflow,`sidebar has unnecessary scroll at ${width}x${height}`).toBe(false);
   const last=layout.allLinks.at(-1);
   expect(last.bottom,`last sidebar entry hidden at ${height}px`).toBeLessThanOrEqual(layout.nav.bottom+1);
   expect(layout.nav.bottom-last.bottom,`sidebar keeps excessive empty lower region at ${height}px`).toBeLessThan(85);
   for(const intervals of layout.groupIntervals){
    const spread=Math.max(...intervals)-Math.min(...intervals);
    expect(spread,`uneven intra-group sidebar rhythm at ${height}px`).toBeLessThan(3);
   }
  }
  await page.locator('.doctor-sidebar').screenshot({path:testInfo.outputPath(`sidebar-${width}x${height}.png`),animations:'disabled'});
 }
});
