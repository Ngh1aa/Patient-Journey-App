const { test, expect } = require('@playwright/test');

const home = (page) => page.locator('#phone-content[data-screen="B1"]');

test('B1 empty-state cards preserve the main navigation and booking entry', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=empty#/home');
  await expect(home(page)).toBeVisible();
  await expect(home(page).locator('.cf-home-quick-grid button')).toHaveCount(4);
  await expect(home(page).locator('.rich-greeting p')).toContainText('chưa có lịch khám');
  await expect(home(page).locator('.cf-home-appointment')).toContainText('chưa có lịch khám sắp tới');
  await expect(home(page).locator('.cf-home-care-card')).toContainText('Chưa có thông tin sau khám');
  await expect(home(page).locator('.cf-home-task-card')).toHaveCount(2);
  await expect(page.locator('#bottom-nav')).toBeVisible();
  await expect(page.locator('#bottom-nav').locator('a,button')).toHaveCount(5);
  await home(page).locator('.cf-home-quick-grid [data-action="begin"]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'C1');
});

test('B1 upcoming appointment card opens the real visit detail', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=upcoming#/home');
  await expect(home(page)).toBeVisible();
  await expect(home(page).locator('.cf-home-appointment-info')).toContainText('BS. Trần Thu Hà');
  await expect(home(page).locator('.cf-home-appointment-status')).toBeVisible();
  await expect(home(page).locator('.cf-home-task-card')).toHaveCount(2);
  await expect(home(page).locator('.cf-home-tip-card')).toHaveCount(2);
  await home(page).locator('.cf-home-appointment-button').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'D2');
});

test('B1 aftercare is conditional and does not show fictitious medication reminders', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=completed#/home');
  await expect(home(page)).toBeVisible();
  await expect(home(page).locator('.cf-home-care-card')).toContainText('Lần khám');
  await expect(home(page).locator('.cf-home-care-card')).not.toContainText('Tối nay');
  await expect(home(page).locator('.cf-home-care-card')).toContainText('dữ liệu minh họa');
  await home(page).locator('.cf-home-tip-card summary').first().click();
  await expect(home(page).locator('.cf-home-tip-card').first()).toHaveAttribute('open', '');
});
