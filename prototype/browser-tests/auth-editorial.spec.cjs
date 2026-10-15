const { test, expect } = require('@playwright/test');

async function load(page, scenario) {
  await page.goto('/prototype/index.html?scenario=' + scenario);
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'A1');
}

test('Blue editorial auth: real OTP and new-profile flow, no visual-only CTA', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await load(page, 'new');
  const phone = page.locator('#phone-frame');
  await expect(phone).toHaveAttribute('data-auth-step', '1');
  await expect(page.locator('#auth-progress')).toBeVisible();
  await expect(page.locator('.auth-panel form[data-form=otp]')).toBeVisible();
  await page.locator('#auth-jump').click();
  await expect(page.locator('#phone')).toBeFocused();
  await page.locator('#phone').fill('0900000000');
  await page.locator('.auth-panel [type=submit]').click();
  await expect(phone).toHaveAttribute('data-auth-step', '2');
  await expect(page.locator('.auth-panel form[data-form=verify]')).toBeVisible();
  await page.locator('#otp').fill('123456');
  await page.locator('#consent').check();
  await page.locator('.auth-panel [type=submit]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'A3');
  await expect(phone).toHaveAttribute('data-auth-step', '3');
  await expect(page.locator('.auth-panel form[data-form=profile]')).toBeVisible();
  await page.locator('#name').fill('Nguyễn An');
  await page.locator('#dob').fill('1995-02-15');
  await page.locator('.auth-panel [type=submit]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'B1');
  await expect(page.locator('#auth-jump')).toBeHidden();
  await expect(page.locator('#auth-progress')).toBeHidden();
});

test('Blue editorial auth: returning patient sees A2 with editable existing identity', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await load(page, 'returning');
  await page.locator('#phone').fill('0900000000');
  await page.locator('.auth-panel [type=submit]').click();
  await page.locator('#otp').fill('123456');
  await page.locator('#consent').check();
  await page.locator('.auth-panel [type=submit]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'A2');
  await expect(page.locator('.auth-panel')).toBeVisible();
  await expect(page.locator('#phone-frame')).toHaveAttribute('data-auth-step', '3');
  await page.locator('#auth-jump').click();
  await expect(page.locator('#name')).toBeFocused();
  await expect(page.locator('#name')).toHaveValue('Nguyễn Minh Anh');
  await page.locator('.auth-panel [type=submit]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen', 'B1');
});

for (const width of [360, 390, 430]) {
  test('Blue editorial auth fits ' + width + 'px and 200% text without page overflow', async ({ page }, info) => {
    await page.setViewportSize({ width, height: 844 });
    await load(page, 'new');
    for (const large of [false,true]) {
      if (large) await page.locator('#phone-frame').evaluate(el => el.classList.add('large-text'));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('#phone-main').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await expect(page.locator('#auth-jump')).toBeVisible();
      await expect(page.locator('.auth-panel h1')).toBeVisible();
      if (width === 390) await page.locator('.phone').screenshot({ path: info.outputPath('auth-blue-' + width + (large ? '-200pct' : '') + '.png') });
    }
  });
}
