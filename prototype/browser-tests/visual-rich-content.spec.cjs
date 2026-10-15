const { test, expect } = require('@playwright/test');

const layouts = [
  ['home', null, 'B1'],
  ['appointments', 'a[href="#/appointments"]', 'D1'],
  ['patient', '.nav-book', 'C1'],
  ['profile', 'a[href="#/profile"]', 'K2'],
  ['support', 'a[href="#/support"]', 'K5'],
];
for (const width of [375, 430]) {
  test('before-after visual evidence ' + width + 'px', async ({ page }, info) => {
    test.setTimeout(240000);
    await page.setViewportSize({ width, height: 852 });
    for (const [name, navigation, screen] of layouts) {
      for (const variant of ['before', 'after']) {
        const base = variant === 'before' ? 'http://127.0.0.1:4176' : 'http://127.0.0.1:4175';
        await page.goto(base + '/prototype/index.html?scenario=upcoming');
        if (navigation) await page.locator('#bottom-nav ' + navigation).click();
        await expect(page.locator('#phone-content')).toHaveAttribute('data-screen',screen);
        await expect(page.locator('#screen-title')).toBeVisible();
        for (const scrollY of [0,300]) {
          await page.locator('#phone-main').evaluate((el,y)=>{el.scrollTop=y;},scrollY);
          const shot = info.outputPath(variant+'-'+name+'-'+width+'-scroll'+scrollY+'.png');
          await page.screenshot({path:shot,fullPage:true,animations:'disabled'});
        }
      }
    }
  });
}
