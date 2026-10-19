const { test, expect } = require('@playwright/test');

test('central booking icon is prominent and opens the existing booking flow', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=empty#/home');
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'B1');
  const nav = page.locator('#bottom-nav');
  const booking = nav.locator('.nav-book');
  await expect(nav.locator('a,button')).toHaveCount(5);
  await expect(booking.locator('.nav-caption')).toHaveCount(0);
  await expect(booking).toHaveAttribute('aria-label', 'Đặt lịch');
  const box = await booking.boundingBox();
  const navBox = await nav.boundingBox();
  expect(box).toBeTruthy();
  expect(navBox).toBeTruthy();
  expect(Math.abs(box.x + box.width / 2 - (navBox.x + navBox.width / 2))).toBeLessThan(16);
  await booking.click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'C1');
  await expect(page.locator('.patient-group')).toBeVisible();
});

test('contextual cards keep existing app actions and real-photo fallback configuration', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=empty#/home');
  const home = page.locator('#phone-content');
  await expect(home.locator('.cf-home-quick-grid button')).toHaveCount(4);
  await expect(home.locator('.cf-help-strip img')).toHaveAttribute('src', /doctor-cutout\.webp/);
  await home.locator('.cf-help-strip [data-to="K5"]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'K5');
  await expect(page.locator('.cf-support-content')).toBeVisible();
});

test('mobile cards and center CTA do not cause horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/prototype/index.html?scenario=empty#/home');
  await expect(page.locator('.cf-home-content')).toBeVisible();
  const sizes = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    content: document.getElementById('phone-content').scrollWidth,
    width: document.getElementById('phone-content').clientWidth
  }));
  expect(sizes.doc).toBeLessThanOrEqual(sizes.viewport + 1);
  expect(sizes.content).toBeLessThanOrEqual(sizes.width + 1);
});

test('prep checklist is interactive and preserved within the demo tab', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=appointments#/appointments/CF-SAMPLE-02/prepare');
  const checklist = page.locator('[data-visit-tools]');
  await expect(checklist).toBeVisible();
  await checklist.locator('input[data-preparation="details"]').check();
  await expect(checklist.locator('[data-preparation-count]')).toContainText('1/3');
  await page.reload();
  await expect(checklist.locator('input[data-preparation="details"]')).toBeChecked();
});
