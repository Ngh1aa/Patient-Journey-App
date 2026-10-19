const {test,expect}=require('@playwright/test');
const home=page=>page.locator('#phone-content[data-screen="B1"]');
test('home empty state is honest and has two booking entrances including navigation',async({page})=>{
 await page.goto('/prototype/?scenario=empty#/home');
 await expect(home(page).locator('.cf-home-appointment')).toContainText('chưa có lịch sắp tới');
 await expect(home(page).locator('.cf-home-head p')).toContainText('Chào');
 await expect(home(page).locator('.cf-home-quick-grid button')).toHaveCount(4);
 await expect(home(page).locator('[data-action="book-nav"]')).toHaveCount(1);
 expect(await home(page).innerText()).not.toMatch(/\b00\b/);
 await page.locator('#bottom-nav .nav-book').click();await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C1');
});
test('home appointment opens the actual visit and displays its clinician',async({page})=>{
 await page.goto('/prototype/?scenario=upcoming#/home');
 await expect(home(page).locator('.cf-home-appointment-info')).toContainText('BS. Trần Thu Hà');
 await expect(home(page).locator('.cf-home-appointment-status')).toContainText('Đã xác nhận');
 await home(page).locator('.cf-home-appointment-button').click();await expect(page.locator('.ticket')).toContainText('CF-1017-0042');
});
test('aftercare remains conditional and does not fabricate medication reminders',async({page})=>{
 await page.goto('/prototype/?scenario=completed#/home');
 const card=home(page).locator('.cf-home-care-card');await expect(card).toContainText('Thông tin sau buổi khám');
 await expect(card).not.toContainText('Tối nay');await card.getByRole('button',{name:'Xem lời dặn'}).click();
 await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','H6');
});
for(const width of [360,390,1440])test('home scrolls while navigation reserves space at '+width,async({page},info)=>{
 await page.setViewportSize({width,height:852});await page.goto('/prototype/?scenario=upcoming#/home');
 await page.locator('#phone-main').evaluate(el=>el.scrollTop=el.scrollHeight);
 await expect(page.locator('#bottom-nav')).toBeVisible();
 const action=home(page).locator('.cf-help-strip button');await action.scrollIntoViewIfNeeded();
 const button=await action.boundingBox(),nav=await page.locator('#bottom-nav').boundingBox();expect(button.y+button.height).toBeLessThanOrEqual(nav.y);
 await page.locator('.phone').screenshot({path:info.outputPath('home-bottom-'+width+'.png')});
});
