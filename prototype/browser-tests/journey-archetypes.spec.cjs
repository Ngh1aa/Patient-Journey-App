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

test('Home preserves classic card styling, flush next card and an 8px navy inset', async ({page}) => {
  for (const width of [360,375,430]) {
    await page.setViewportSize({width,height:852});
    await page.goto('/prototype/index.html?scenario=upcoming');
    const metrics = await page.locator('.phone').evaluate(frame => {
      const header=frame.querySelector('.phone-header').getBoundingClientRect();
      const masthead=frame.querySelector('.home-masthead').getBoundingClientRect();
      const card=frame.querySelector('#phone-content > .rich-hero');
      const shortcuts=frame.querySelector('.rich-shortcuts').getBoundingClientRect();
      const cardRect=card.getBoundingClientRect();
      const phone=frame.getBoundingClientRect();
      return {
        headerLeft:header.left-phone.left,
        headerRight:phone.right-header.right,
        navyLeft:masthead.left-phone.left,
        navyRight:phone.right-masthead.right,
        gap:shortcuts.top-cardRect.bottom,
      };
    });
    for (const side of ['headerLeft','headerRight','navyLeft','navyRight']) {
      expect(metrics[side], width+'px '+side).toBeCloseTo(8,0);
    }
    expect(metrics.gap, width+'px card-to-quick-actions gap').toBeCloseTo(0,0);
    const hero=page.locator('#phone-content > .rich-hero');
    await expect(hero).toHaveCSS('border-radius','25px');
    await expect(hero).toHaveCSS('padding-top','18px');
    await expect(hero).toHaveCSS('border-top-color','rgb(237, 242, 248)');
    await expect(page.locator('.home-quick-actions button')).toHaveCount(4);
  }
});

test('Home greeting is a single state-aware sentence and Demo lives in the app bar', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','B1');
  await expect(page.locator('.rich-greeting h1')).toContainText('Minh Anh');
  await expect(page.locator('.rich-greeting p')).toHaveText('Hôm nay bạn chưa có lịch khám.');
  await expect(page.locator('.rich-head-meta, .rich-eyebrow')).toHaveCount(0);
  await expect(page.locator('.app-demo-badge')).toHaveText('Demo');
  await expect(page.locator('.app-demo-badge')).toBeVisible();
  await page.goto('/prototype/index.html?scenario=upcoming');
  await expect(page.locator('.rich-greeting p')).toHaveText('Bạn có 1 lịch khám lúc 08:00.');
  await expect(page.locator('.rich-head-meta, .rich-eyebrow')).toHaveCount(0);
});

test('Header has no white separator on Home, appointments, profile, support or booking', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  const check=async (id)=>{
    await expect(page.locator('#phone-content')).toHaveAttribute('data-screen',id);
    const styles=await page.locator('.phone-header').evaluate(el=>({
      shadow:getComputedStyle(el).boxShadow,border:getComputedStyle(el).borderBottomWidth,
      overflows:el.scrollWidth>el.clientWidth+1
    }));
    expect(styles.shadow,id).toBe('none');
    expect(styles.border,id).toBe('0px');
    expect(styles.overflows,id).toBe(false);
    await expect(page.locator('.app-demo-badge')).toBeVisible();
  };
  await check('B1');
  await page.locator('#bottom-nav a[href="#/appointments"]').click();
  await check('D1');
  await page.locator('#bottom-nav a[href="#/profile"]').click();
  await check('K2');
  await page.locator('#bottom-nav a[href="#/support"]').click();
  await check('K5');
  await page.locator('#bottom-nav .nav-book').click();
  await check('C1');
});

test('Unread dot is shown on bell only when notifications are unread', async ({page}) => {
  await page.goto('/prototype/index.html?scenario=empty');
  const bell=page.locator('#notifications');
  await expect(bell.locator('.navy-notice-dot')).toHaveCount(0);
  await expect(bell).toHaveAttribute('aria-label','Thông báo');
  await page.evaluate(()=>{
    const key='careflow.browser.v3',payload=JSON.parse(sessionStorage.getItem(key));
    payload.state.notifications.push({id:'qa-unread',title:'Tin mới',body:'Thử thông báo',at:new Date().toISOString(),read:false});
    sessionStorage.setItem(key,JSON.stringify(payload));
  });
  await page.reload();
  await expect(page.locator('#notifications .navy-notice-dot')).toHaveCount(1);
  await expect(bell).toHaveAttribute('aria-label','Thông báo, 1 chưa đọc');
  await page.evaluate(()=>{
    const key='careflow.browser.v3',payload=JSON.parse(sessionStorage.getItem(key));
    payload.state.notifications.find(n=>n.id==='qa-unread').read=true;
    sessionStorage.setItem(key,JSON.stringify(payload));
  });
  await page.reload();
  await expect(page.locator('#notifications .navy-notice-dot')).toHaveCount(0);
  await expect(bell).toHaveAttribute('aria-label','Thông báo');
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
