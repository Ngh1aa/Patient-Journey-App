const { test, expect } = require('@playwright/test');

test('navy canvas is fixed under scrolling content and has no hard rounded lower edge', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=upcoming');
  const canvas = await page.locator('.phone').evaluate(el => {
    const phone = el.getBoundingClientRect();
    const pseudo = getComputedStyle(el, '::before');
    const scroll = el.querySelector('.phone-scroll');
    return {
      heightFraction: parseFloat(pseudo.height) / phone.height,
      width: parseFloat(pseudo.width),
      phoneWidth: phone.width,
      bottomRadius: pseudo.borderBottomLeftRadius,
      gradient: pseudo.backgroundImage,
      scrollbar: getComputedStyle(scroll).scrollbarWidth,
      position: pseudo.position,
      scrollHeight: scroll.scrollHeight,
      viewportHeight: scroll.clientHeight,
    };
  });
  expect(canvas.heightFraction).toBeGreaterThanOrEqual(.5);
  expect(canvas.heightFraction).toBeLessThanOrEqual(.55);
  expect(canvas.width).toBeGreaterThanOrEqual(canvas.phoneWidth - 12);
  expect(canvas.bottomRadius).toBe('0px');
  expect(canvas.gradient).toContain('linear-gradient');
  expect(canvas.scrollbar).toBe('none');
  expect(canvas.position).toBe('absolute');
  await expect(page.locator('.home-quick-actions button')).toHaveCount(4);
  await expect(page.locator('.service-grid .service-tile')).toHaveCount(2);
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
  await expect(page.locator('.support-grid > .row')).toHaveCount(2);
  await page.locator('#bottom-nav a').nth(2).click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'K2');
  await expect(page.locator('.profile-bento > .row')).toHaveCount(4);
});
