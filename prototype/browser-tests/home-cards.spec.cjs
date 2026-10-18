const { test, expect } = require('@playwright/test');

const home = (page) => page.locator('#phone-content[data-screen="B1"]');

test('B1 empty-state cards preserve the main navigation and booking entry', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=empty#/home');
  await expect(home(page)).toBeVisible();
  await expect(home(page).locator('.cf-home-quick-grid button')).toHaveCount(4);
  await expect(home(page).locator('.rich-greeting p')).toContainText('Chào');
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
  await expect(home(page).locator('.cf-home-tip-card')).toHaveCount(3);
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


for (const width of [360, 390, 1440]) {
  test('Home light chrome remains separate from scrolling content at ' + width + 'px', async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 852 });
    await page.goto('/prototype/index.html?scenario=upcoming#/home');
    const metrics = await page.locator('.phone-scroll').evaluate(el => {
      const header = document.querySelector('.phone-header');
      el.scrollTop = 400;
      const curtain = getComputedStyle(el, '::before');
      return {
        scrollTop: el.scrollTop,
        headerBottom: header.getBoundingClientRect().bottom,
        scrollTopEdge: el.getBoundingClientRect().top,
        curtainContent: curtain.content, headerColor:getComputedStyle(header).backgroundColor,
        curtainTop: curtain.top,
        curtainHeight: curtain.height,
        curtainBackground: curtain.backgroundColor,
        curtainPointerEvents: curtain.pointerEvents
      };
    });
    expect(metrics.scrollTop).toBeGreaterThan(100);
    expect(metrics.scrollTopEdge).toBeGreaterThanOrEqual(metrics.headerBottom - 1);
    expect(metrics.curtainContent).toBe('none');
    expect(metrics.headerColor).toBe('rgb(247, 248, 250)');
    await page.screenshot({ path:testInfo.outputPath('light-scroll-' + width + '.png') });
    await expect(page.locator('#bottom-nav')).toBeVisible();
  });
}
