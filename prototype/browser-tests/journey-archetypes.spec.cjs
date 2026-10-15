const { test, expect } = require('@playwright/test');

test('solid navy rounded masthead scrolls under sticky navy app header', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=upcoming');
  const result = await page.locator('.phone').evaluate(el => {
    const canvas=getComputedStyle(el,'::before');
    const head=el.querySelector('.home-masthead');
    const header=el.querySelector('.phone-header');
    const scroll=el.querySelector('.phone-scroll');
    const rect=head.getBoundingClientRect();
    const radius=getComputedStyle(head).borderBottomLeftRadius;
    scroll.scrollTop=300;
    return {canvas:canvas.content, background:getComputedStyle(head).backgroundColor,
      radius, moved:head.getBoundingClientRect().top-rect.top,
      headerColor:getComputedStyle(header).backgroundColor};
  });
  expect(result.canvas).toBe('none');
  expect(result.background).toBe('rgb(10, 31, 92)');
  expect(result.radius).toBe('32px');
  expect(result.headerColor).toBe('rgb(10, 31, 92)');
  expect(result.moved).toBeLessThan(-180);
  await expect(page.locator('.home-quick-actions button')).toHaveCount(4);
  await expect(page.locator('.rich-stat-strip button')).toHaveCount(0);
  await expect(page.locator('.rich-tips .rich-tip')).toHaveCount(3);
  expect(await page.locator('.home-tasks').evaluate(el => getComputedStyle(el).display)).toBe('flex');
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
  await page.locator('.visit-card').first().click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'D2');
  await expect(page.locator('.ticket')).toBeVisible();
  await expect(page.locator('.facility-card')).toBeVisible();
  await page.locator('#bottom-nav a').last().click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'K5');
  await expect(page.locator('.support-grid > button')).toHaveCount(3);
  await page.locator('#bottom-nav a').nth(2).click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'K2');
  await expect(page.locator('.profile-bento > .row')).toHaveCount(3);
  await expect(page.locator('.profile-bento > .rich-insurance')).toHaveCount(1);
});
