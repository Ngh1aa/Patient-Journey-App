const {test,expect}=require('../prototype/node_modules/@playwright/test');

const routes=[
  ['W07-premium','/encounters/a-033','KHÔNG GIAN KHÁM BỆNH'],
  ['Schedule','/schedule/a-018','Quản lý thay đổi lịch'],
  ['N01','/nursing','Điều dưỡng & điều phối'],
  ['N02','/nursing/prepare','Chuẩn bị trước buổi khám'],
  ['N03','/nursing/followups','Theo dõi & bàn giao']
];
test('new wave3 pages and W07 hierarchy render without errors or overflow',async({page},testInfo)=>{
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  for(const [id,route,title] of routes){
    await page.goto('/staff-prototype/index.html#'+route);
    await expect(page.locator('main')).toContainText(title);
    await expect(page.locator('.demo-indicator')).toContainText('Dữ liệu minh họa');
    if(id==='W07-premium')await expect(page.locator('.wave-consult-progress')).toContainText('Xem lại & hoàn tất');
    const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));
    expect(size.scroll,id+' horizontal overflow').toBeLessThanOrEqual(size.width+1);
    await page.screenshot({path:testInfo.outputPath(id+'.png'),fullPage:true,animations:'disabled'});
  }
  expect(errors).toEqual([]);
});
test('reschedule requires reason and reconfirmation; cancellation is final',async({page})=>{
  await page.goto('/staff-prototype/index.html#/schedule/a-018');
  await page.locator('#wave-time').selectOption('13:30');
  await page.locator('[data-action="wave-propose-reschedule"]').click();
  await expect(page.locator('.toast')).toContainText('Vui lòng chọn hoặc nhập lý do');
  await page.locator('#wave-time').selectOption('13:30');
  await page.locator('#wave-reschedule-reason').fill('Bệnh nhân đề nghị chuyển giờ');
  await page.locator('[data-action="wave-propose-reschedule"]').click();
  await expect(page.locator('.wave-confirm')).toContainText('09:00 → 13:30');
  await page.locator('[data-action="wave-commit"]').click();
  await expect(page.locator('.wave-schedule-main')).toContainText('13:30');
  await expect(page.locator('.wave-history')).toContainText('Bệnh nhân đề nghị chuyển giờ');
  await page.goto('/staff-prototype/index.html#/calendar');
  await expect(page.locator('.calendar-event[data-id="a-018"]')).toContainText('13:30');
  await page.goto('/staff-prototype/index.html#/schedule/a-018');
  await page.locator('#wave-cancel-reason').selectOption('Bệnh nhân yêu cầu hủy');
  await page.locator('[data-action="wave-propose-cancel"]').click();
  await expect(page.locator('.wave-confirm')).toContainText('Hủy lịch khám này?');
  await page.locator('[data-action="wave-commit"]').click();
  await expect(page.locator('.wave-schedule-main')).toContainText('Đã hủy');
  await expect(page.locator('.wave-form-layout')).toHaveCount(0);
  await page.goto('/staff-prototype/index.html#/calendar');
  await expect(page.locator('.calendar-event[data-id="a-018"]')).toHaveCount(0);
  await page.goto('/staff-prototype/index.html#/schedule/a-018');
  await page.reload();
  await expect(page.locator('.wave-history')).toContainText('Đã hủy lịch');
});
test('reception cannot reschedule a locked clinical encounter',async({page})=>{
  await page.goto('/staff-prototype/index.html#/schedule/a-033');
  await expect(page.locator('.wave-schedule-main')).toContainText('không cho phép đổi hoặc hủy');
  await expect(page.locator('[data-action="wave-commit"]')).toHaveCount(0);
  await expect(page.locator('.wave-form-layout')).toHaveCount(0);
});
test('nurse can prepare patient and track internal tasks across reloads',async({page})=>{
  await page.goto('/staff-prototype/index.html#/reception');
  await page.locator('.data-table [data-id="a-018"]').click();
  await page.locator('.drawer [data-action="confirm-appointment"]').click();
  await page.locator('.drawer [aria-label="Đóng chi tiết lịch"]').click();
  await page.goto('/staff-prototype/index.html#/checkin');
  await page.locator('[data-action="checkin-patient"]').click();
  await page.goto('/staff-prototype/index.html#/nursing');
  await expect(page.locator('.switch-options [data-role="nurse"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.wave-nurse-items')).toContainText('Nguyễn Minh Anh');
  await page.locator('.wave-nurse-items [data-action="ready-patient"]').click();
  await expect(page.locator('.wave-nurse-items')).toContainText('Sẵn sàng khám');
  await page.goto('/staff-prototype/index.html#/nursing/followups');
  await page.locator('[data-action="wave-task-toggle"]').first().click();
  await expect(page.locator('.wave-followup-list')).toContainText('Đã xử lý');
  await page.reload();
  await expect(page.locator('.wave-followup-list')).toContainText('Đã xử lý');
});
