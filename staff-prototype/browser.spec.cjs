const {test, expect} = require('../prototype/node_modules/@playwright/test');
const routes = [
  ['W01','/reception','Một ngày làm việc'],
  ['W02','/calendar','Lịch khám trực quan'],
  ['W03','/patients','Quản lý bệnh nhân'],
  ['W04','/patients/p-001','Nguyễn Minh Anh'],
  ['W05','/appointments/a-018','Nguyễn Minh Anh'],
  ['W06','/doctor','Chào bác sĩ An'],
  ['W07','/encounters/a-033','BUỔI KHÁM'],
  ['W08','/results','Kết quả cần xem xét']
];
test('eight showcase surfaces render without JS errors or horizontal page overflow',async ({page},testInfo)=>{
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  for(const [id,route,text] of routes){
    await page.goto('/staff-prototype/index.html#'+route);
    await expect(page.locator('main')).toContainText(text);
    await expect(page.locator('.demo-indicator')).toContainText('Dữ liệu minh họa');
    const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));
    expect(size.scroll,`${id} viewport overflow`).toBeLessThanOrEqual(size.width+1);
    await page.screenshot({path:testInfo.outputPath(id+'.png'),fullPage:true,animations:'disabled'});
  }
  expect(errors).toEqual([]);
});
test('confirming a booking updates drawer status immediately',async ({page})=>{
  await page.goto('/staff-prototype/index.html#/reception');
  await page.locator('.data-table [data-id="a-018"]').click();
  await expect(page.locator('.drawer')).toBeVisible();
  await expect(page.locator('.drawer')).toContainText('Chờ xác nhận');
  await page.locator('.drawer [data-action="confirm-appointment"]').click();
  await expect(page.locator('.drawer')).toContainText('Đã xác nhận');
  await expect(page.locator('.toast')).toContainText('Đã xác nhận lịch');
  await page.locator('.drawer [aria-label="Đóng chi tiết lịch"]').click();
  await expect(page.locator('.drawer')).toHaveCount(0);
});
test('directory search, patient profile and result review',async ({page})=>{
  await page.goto('/staff-prototype/index.html#/patients');
  await page.locator('#patients-search').fill('Minh Anh');
  await expect(page.locator('.patient-row:visible')).toHaveCount(1);
  await page.locator('.patient-row:visible [data-action="open-patient"]').click();
  await expect(page).toHaveURL(/#\/patients\/p-001/);
  await page.locator('[data-action="profile-tab"][data-value="labs"]').click();
  await expect(page.locator('.profile-body')).toContainText('Công thức máu');
  await page.locator('[data-action="show-result"]').click();
  await expect(page).toHaveURL(/#\/results/);
  await page.locator('[data-action="review-result"]').click();
  await expect(page.locator('.result-detail')).toContainText('Bác sĩ đã xem');
});
test('doctor can save a draft, review and finish a synthetic encounter',async ({page})=>{
  await page.goto('/staff-prototype/index.html#/doctor');
  await page.locator('.hero-actions [data-action="start-consult"]').click();
  await expect(page).toHaveURL(/#\/encounters\//);
  await page.locator('textarea[name="symptom"]').fill('Thông tin thăm khám minh họa.');
  await page.locator('textarea[name="assessment"]').fill('Đã xem thông tin theo kịch bản demo.');
  await page.locator('[data-action="save-draft"]').click();
  await expect(page.locator('.toast')).toContainText('Đã lưu bản nháp');
  await page.locator('[data-action="review-sign"]').click();
  await expect(page.locator('.dialog-card')).toContainText('không tạo chữ ký');
  await page.locator('[data-action="confirm-sign"]').click();
  await expect(page.locator('.consult-top')).toContainText('Đã hoàn tất');
  await expect(page.locator('[data-action="review-sign"]')).toBeDisabled();
});
test('week navigation and reset recover the showcase state',async ({page})=>{
  await page.goto('/staff-prototype/index.html#/calendar');
  await page.locator('[data-action="next-week"]').click();
  await expect(page.locator('.calendar-month')).toContainText('Tuần +1');
  await page.locator('[data-action="today"]').first().click();
  await expect(page.locator('.calendar-month')).toContainText('12 – 18');
  await page.locator('.footer-reset[data-action="reset-demo"]').click();
  await expect(page.locator('.dialog-card')).toContainText('Đặt lại');
  await page.locator('[data-action="confirm-reset"]').click();
  await expect(page.locator('.toast')).toContainText('Đã đặt lại');
});
