const { test, expect } = require('@playwright/test');

test('center booking icon has no visible caption but retains accessible name', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=empty#/appointments');
  const nav = page.locator('#bottom-nav');
  await expect(nav).toBeVisible();
  await expect(nav.locator('a,button')).toHaveCount(5);
  await expect(nav.locator('.nav-book')).toHaveAttribute('aria-label', 'Đặt lịch khám');
  await expect(nav.locator('.nav-book .nav-caption')).toHaveCount(0);
});

test('empty appointment tab uses one concise booking action, not two competing buttons', async ({ page }) => {
  await page.goto('/prototype/index.html?scenario=empty#/appointments');
  const content = page.locator('#phone-content[data-screen="D1"]');
  await expect(content.locator('.cf-appt-empty')).toContainText('Chưa có lịch sắp tới');
  await expect(content.locator('.cf-appt-empty-cta')).toHaveCount(1);
  await expect(content.locator('.rich-new-booking')).toHaveCount(0);
  await expect(content.locator('.cf-appt-steps')).toBeVisible();
  await expect(content.locator('.cfx-screen-d1')).toContainText('Quản lý dễ dàng hơn');
  const metrics = await content.evaluate(node => ({
    scrollWidth: node.scrollWidth, width: node.clientWidth,
    count: [...node.querySelectorAll('.rich-appt-tabs .btn')].length
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width + 1);
  expect(metrics.count).toBe(3);
  await content.locator('.cf-appt-empty-cta').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C1');
});

async function factLayout(page, screen) {
  const content = page.locator('#phone-content[data-screen="' + screen + '"]');
  await expect(content).toBeVisible();
  const facts = content.locator('[data-cf-component="facts"]').first();
  await expect(facts).toBeVisible();
  const metrics = await facts.evaluate(node => {
    const row = node.querySelector(':scope > div');
    const dt = row?.querySelector('dt');
    const dd = row?.querySelector('dd');
    return {
      gridColumns: getComputedStyle(node).gridTemplateColumns,
      label: dt?.getBoundingClientRect().width,
      value: dd?.getBoundingClientRect().width,
      width: node.clientWidth,
      overflow: node.scrollWidth - node.clientWidth,
      count: node.querySelectorAll(':scope > div').length
    };
  });
  expect(metrics.count).toBeGreaterThan(3);
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  expect(metrics.label).toBeGreaterThanOrEqual(94);
  expect(metrics.value).toBeGreaterThanOrEqual(115);
  expect(metrics.gridColumns.split(' ').length).toBe(1);
}

test('C8 booking review facts keep readable labels at 390px', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/prototype/index.html?scenario=empty#/home');
  const content=page.locator('#phone-content');
  const screen=async id => expect(content).toHaveAttribute('data-screen',id);
  const submit=async () => content.locator('form [type=submit]').click();
  await content.locator('[data-action=begin]').first().click();
  await screen('C1');
  await submit();
  await screen('C2');
  await page.locator('#reason').fill('Đau đầu hai ngày, ngủ không ngon.');
  await submit();
  await screen('C3');
  await content.locator('input[value=normal]').check();
  await submit();
  await screen('C6');
  await content.locator('input[value=online]').check();
  await submit();
  await screen('C7');
  await content.locator('input[name=slot][value="08:00"]').check();
  await submit();
  await screen('C8');
  await factLayout(page,'C8');
});
test('C9 booking confirmation facts keep readable labels at 390px', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/prototype/index.html?scenario=upcoming#/book/done/CF-1017-0042');
  await factLayout(page,'C9');
});

test('C9 confirmation uses stacked facts on narrow 360px phones', async ({ page }) => {
  await page.setViewportSize({width:360,height:740});
  await page.goto('/prototype/index.html?scenario=upcoming#/book/done/CF-1017-0042');
  const facts=page.locator('#phone-content[data-screen="C9"] [data-cf-component="facts"]').first();
  await expect(facts).toBeVisible();
  const positions=await facts.evaluate(node => {
    const row=node.querySelector(':scope > div');
    const l=row.querySelector('dt').getBoundingClientRect();
    const v=row.querySelector('dd').getBoundingClientRect();
    return {labelLeft:l.left,valueLeft:v.left, labelBottom:l.bottom,valueTop:v.top,overflow:node.scrollWidth-node.clientWidth};
  });
  expect(Math.abs(positions.labelLeft-positions.valueLeft)).toBeLessThan(2);
  expect(positions.valueTop).toBeGreaterThanOrEqual(positions.labelBottom);
  expect(positions.overflow).toBeLessThanOrEqual(1);
});
