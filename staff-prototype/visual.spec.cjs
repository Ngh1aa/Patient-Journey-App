const {test,expect}=require('../prototype/node_modules/@playwright/test');

const screens=[
  ['reception','/reception','Tổng quan'],['calendar','/calendar','Lịch khám'],
  ['patients','/patients','Bệnh nhân'],['patient-profile','/patients/p-001','Nguyễn Minh Anh'],
  ['appointment-drawer','/appointments/a-018','Nguyễn Minh Anh'],['doctor-dashboard','/doctor','Chào bác sĩ'],
  ['clinical-workspace','/encounters/a-033','KHÔNG GIAN KHÁM BỆNH'],['results','/results','Kết quả'],
  ['requests','/requests','Yêu cầu đặt lịch'],['booking','/booking/new','Tạo lịch khám'],
  ['reception-checkin','/checkin','Tiếp nhận bệnh nhân'],['live-queue','/queue','Hàng chờ khám'],
  ['lab-orders','/clinical/orders','Chỉ định & xét nghiệm'],['prescriptions','/clinical/prescription','Đơn thuốc'],
  ['review','/clinical/review','Xem lại & hoàn tất'],['welcome','/welcome','trải nghiệm liền mạch'],
  ['schedule-management','/schedule/a-018','Quản lý thay đổi lịch'],
  ['nursing-home','/nursing','Điều dưỡng & điều phối'],
  ['nursing-preparation','/nursing/prepare','Chuẩn bị trước buổi khám'],
  ['nursing-followup','/nursing/followups','Theo dõi & bàn giao']
];

for(let group=0;group<5;group++){
  const subset=screens.slice(group*4,group*4+4);
  test('visual coherence + screenshot cohort '+(group+1),async({page},testInfo)=>{
    const errors=[];page.on('pageerror',err=>errors.push(err.message));
    for(const [name,path,heading] of subset){
      await page.goto('/staff-prototype/index.html#'+path);
      await expect(page.locator('main')).toContainText(heading);
      await expect(page.locator('.sidebar-nav')).toBeVisible();
      await expect(page.locator('.sidebar-product-note')).toContainText('CLINIC WORKSPACE');
      await expect(page.locator('.breadcrumbs')).toBeVisible();
      const dims=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
      expect(dims.scroll,name+' overflow').toBeLessThanOrEqual(dims.width+1);
      const modes=await page.locator('.switch-options button[aria-pressed="true"]').count();
      expect(modes,name+' role switch').toBe(1);
      await page.screenshot({path:testInfo.outputPath('visual-'+name+'.png'),fullPage:true,animations:'disabled'});
    }
    expect(errors).toEqual([]);
  });
}

test('cross-page typography, contrast, role nav and button states',async({page})=>{
  await page.goto('/staff-prototype/index.html#/reception');
  const css=await page.evaluate(()=>({
    font:getComputedStyle(document.body).fontFamily,
    header:getComputedStyle(document.querySelector('.page-heading h1')).fontSize,
    navbg:getComputedStyle(document.querySelector('.nav-item.active')).backgroundColor,
    navfg:getComputedStyle(document.querySelector('.nav-item.active')).color,
    roleCount:document.querySelectorAll('.switch-options button[aria-pressed="true"]').length
  }));
  expect(css.font).toContain('Be Vietnam Pro');
  expect(parseFloat(css.header)).toBeGreaterThanOrEqual(26);
  expect(css.roleCount).toBe(1);
  expect(css.navbg).not.toBe(css.navfg);
  await page.locator('.nav-item.active').hover();
  await expect(page.locator('.nav-item.active')).toHaveCSS('color',/rgb/);
  const primary=page.locator('.btn-primary:visible').first();
  await expect(primary).toHaveCSS('color','rgb(255, 255, 255)');
  await primary.hover();
  await expect(primary).toHaveCSS('color','rgb(255, 255, 255)');
  await primary.focus();
  await expect(primary).toHaveCSS('outline-style','solid');
  await page.goto('/staff-prototype/index.html#/nursing');
  await expect(page.locator('.switch-options [data-role="nurse"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.switch-options [data-role="reception"]')).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('.sidebar-nav .nav-item.active')).toContainText('Tổng quan');
  await page.locator('.sidebar-nav a[data-route="/nursing/prepare"]').click();
  await expect(page).toHaveURL(new RegExp('#/nursing/prepare$'));
  await expect(page.locator('.sidebar-nav .nav-item.active')).toContainText('Chuẩn bị khám');
});

test('1920px hero and dense-table presentation screenshots',async({page},testInfo)=>{
  await page.setViewportSize({width:1920,height:1080});
  for(const [name,route] of [['clinical','/encounters/a-033'],['dashboard','/reception'],['directory','/patients']]){
    await page.goto('/staff-prototype/index.html#'+route);
    await expect(page.locator('main')).toBeVisible();
    await page.screenshot({path:testInfo.outputPath('large-'+name+'.png'),fullPage:true,animations:'disabled'});
    const dims=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
    expect(dims.scroll).toBeLessThanOrEqual(dims.width+1);
  }
});
