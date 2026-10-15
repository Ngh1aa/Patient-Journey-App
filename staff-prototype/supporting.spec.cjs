const {test,expect}=require('../prototype/node_modules/@playwright/test');
const paths=[
 ['W09','/requests','Yêu cầu đặt lịch'],
 ['W10','/booking/new','Tạo lịch khám'],
 ['W14','/checkin','Tiếp nhận bệnh nhân'],
 ['W15','/queue','Hàng chờ khám'],
 ['W29','/clinical/orders','Chỉ định & xét nghiệm'],
 ['W30','/clinical/prescription','Đơn thuốc · Bản nháp'],
 ['W31','/clinical/review','Xem lại & hoàn tất'],
 ['W44','/welcome','trải nghiệm liền mạch']
];
test('eight additional portfolio screens render with no JS error or horizontal overflow',async({page},testInfo)=>{
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  for(const [id,route,title] of paths){
    await page.goto('/staff-prototype/index.html#'+route);
    await expect(page.locator('main')).toContainText(title);
    await expect(page.locator('.demo-indicator')).toContainText('Dữ liệu minh họa');
    const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
    expect(width.scroll,id+' horizontal overflow').toBeLessThanOrEqual(width.width+1);
    await page.screenshot({path:testInfo.outputPath(id+'.png'),fullPage:true,animations:'disabled'});
  }
  expect(errors).toEqual([]);
});
test('reception creates, confirms and checks in a mock booking',async({page})=>{
  await page.goto('/staff-prototype/index.html#/booking/new');
  await page.locator('#new-slot').selectOption('14:30');
  await page.locator('[data-action="create-booking"]').click();
  await expect(page.locator('.drawer')).toContainText('Chờ xác nhận');
  await page.locator('.drawer [data-action="confirm-appointment"]').click();
  await expect(page.locator('.drawer')).toContainText('Đã xác nhận');
  await page.locator('.drawer [aria-label="Đóng chi tiết lịch"]').click();
  await page.goto('/staff-prototype/index.html#/checkin');
  await expect(page.locator('[data-action="checkin-patient"]')).toHaveCount(1);
  await page.locator('[data-action="checkin-patient"]').click();
  await expect(page.locator('.toast')).toContainText('Đã ghi nhận bệnh nhân');
  await page.locator('[data-action="ready-patient"]').first().click();
  await page.goto('/staff-prototype/index.html#/queue');
  await expect(page.locator('.support-kanban')).toContainText('Nguyễn Minh Anh');
  await expect(page.locator('.support-kanban')).toContainText('Phạm Gia Huy');
});
test('request filters and document mock flows retain state',async({page})=>{
  await page.goto('/staff-prototype/index.html#/requests');
  await page.locator('[data-action="request-filter"][data-value="review"]').click();
  await expect(page.locator('.data-table tbody tr')).toHaveCount(1);
  await page.goto('/staff-prototype/index.html#/clinical/orders');
  await page.locator('#order-title').fill('Yêu cầu demo để xem trạng thái');
  await page.locator('[data-action="create-lab-order"]').click();
  await expect(page.locator('.support-list')).toContainText('Yêu cầu demo để xem trạng thái');
  await page.goto('/staff-prototype/index.html#/clinical/prescription');
  await page.locator('#rx-note').fill('Chờ phê duyệt nội dung minh họa.');
  await page.locator('[data-action="save-rx"]').click();
  await page.reload();
  await expect(page.locator('#rx-note')).toHaveValue('Chờ phê duyệt nội dung minh họa.');
});
test('doctor review and entry route actions work',async({page})=>{
  await page.goto('/staff-prototype/index.html#/welcome');
  await page.locator('[data-action="role"][data-role="doctor"]').last().click();
  await expect(page).toHaveURL(/#\/doctor/);
  await page.goto('/staff-prototype/index.html#/clinical/review');
  await page.locator('[data-action="review-sign"]').click();
  await expect(page.locator('.dialog-card')).toContainText('không tạo chữ ký');
  await page.locator('[data-action="confirm-sign"]').click();
  await expect(page.locator('.support-review-grid')).toContainText('Đã hoàn tất');
});
