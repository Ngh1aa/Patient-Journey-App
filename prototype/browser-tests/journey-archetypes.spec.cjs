const {test,expect}=require('@playwright/test');
test('appointment precedes overview and quick access, with a readable blue mesh',async({page})=>{
 for(const width of [360,375,430]){
  await page.setViewportSize({width,height:852});await page.goto('/prototype/?scenario=upcoming#/home');
  const hero=page.locator('.cf-home-appointment');
  const layout=await hero.evaluate(el=>{const r=el.getBoundingClientRect(),overview=document.querySelector('.cf-home-overview').getBoundingClientRect(),quick=document.querySelector('.cf-home-quick').getBoundingClientRect();return{hero:r.bottom,overview:overview.top,quick:quick.top,mesh:getComputedStyle(el).backgroundImage};});
  expect(layout.overview).toBeGreaterThanOrEqual(layout.hero+12);expect(layout.quick).toBeGreaterThan(layout.overview);expect(layout.mesh).toContain('radial-gradient');
  await expect(hero).toHaveCSS('border-radius','24px');
  await expect(hero.locator('.cf-home-appointment-button')).toHaveCSS('background-color','rgb(11, 18, 32)');
 }
});

test('booking preserves the clinical risk branch with a four-dot visual stepper and useful symptom chips', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=empty');
  await page.locator('#bottom-nav .nav-book').click();
  await expect(page.locator('.booking-progress li')).toHaveCount(4);
  await page.locator('#phone-content form [type=submit]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'C2');
  await page.locator('.symptom-chip[data-symptom="Đau đầu"]').click();
  await page.locator('.symptom-chip[data-symptom="Sốt"]').click();
  await expect(page.locator('#reason')).toHaveValue('Đau đầu, Sốt');
  await page.reload();
  await expect(page.locator('#reason')).toHaveValue('Đau đầu, Sốt');
  await page.locator('#phone-content form [type=submit]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'C3');
  await page.locator('input[value=warning]').check();
  await page.locator('#phone-content form [type=submit]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'C4');
  await expect(page.locator('#phone-content .note.danger')).toBeVisible();
});

test('appointment and support use their own layouts instead of generic stacked cards', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=upcoming');
  await page.locator('.cf-home-appointment-button').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'D2');
  await expect(page.locator('.ticket')).toBeVisible();
  await expect(page.locator('.facility-card')).toBeVisible();
  await page.locator('#bottom-nav a').last().click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'K5');
  await expect(page.locator('.support-grid > button')).toHaveCount(3);
  await page.locator('#bottom-nav a').nth(2).click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'K2');
  await expect(page.locator('.rich-profile-details')).toContainText('Nguyễn Minh Anh');
  await expect(page.locator('.rich-profile-details')).toContainText('Chưa khai báo');
  await expect(page.locator('.rich-settings-links')).toContainText(['Trần Thị Mai','Thông báo']);
});
