const {test,expect}=require('@playwright/test');
const content=page=>page.locator('#phone-content');
const submit=page=>content(page).locator('form [type=submit]').click();
async function screen(page,id){await expect(content(page)).toHaveAttribute('data-screen',id);await expect(content(page)).toHaveAttribute('data-guarded','');}
async function review(page,id){if(await page.locator('#review-tools').isHidden())await page.locator('#review-toggle').click();await page.locator('#screen-picker').selectOption(id);await screen(page,id);}
async function dockFits(page){await expect.poll(()=>page.evaluate(()=>{const main=document.getElementById('phone-main').getBoundingClientRect(),footer=document.querySelector('[data-cf-docked]');if(!footer)return false;const f=footer.getBoundingClientRect();return footer.offsetParent.id==='phone-frame'&&main.bottom<=f.top+1&&f.bottom<=document.querySelector('.phone').getBoundingClientRect().bottom;})).toBe(true);}

for(const width of [360,390,1440])test(`booking chrome reserves CTA and keeps full header at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:width===1440?1000:844});
  await page.goto('/prototype/?scenario=upcoming#/home');await page.locator('#bottom-nav .nav-book').click();await screen(page,'C1');await dockFits(page);
  await submit(page);await screen(page,'C2');await page.locator('#reason').fill('Đau đầu từ hôm qua');
  await page.locator('#phone-main').evaluate(el=>el.scrollTop=el.scrollHeight);await dockFits(page);
  const header=await page.locator('.screen-masthead').boundingBox(),main=await page.locator('#phone-main').boundingBox();expect(header.y).toBeGreaterThanOrEqual(main.y-1);
  await expect(page.locator('#reason-count')).toHaveText('18 / 1200 ký tự');
  await submit(page);await screen(page,'C3');
  await page.locator('input[value=warning]').check();await expect(page.locator('[data-safety-guidance]')).toBeVisible();await expect(page.locator('[data-safety-guidance] a')).toHaveAttribute('href','tel:115');
  await expect(page.locator('.choice:has(input[value=warning])')).toHaveClass(/selected/);await expect(page.locator('.choice:has(input[value=normal])')).not.toHaveClass(/selected/);
  await page.locator('input[value=normal]').check();await expect(page.locator('[data-safety-guidance]')).toBeHidden();await submit(page);await screen(page,'C6');
  const padding=await page.locator('.cf-mode-choice').evaluateAll(els=>els.map(el=>parseFloat(getComputedStyle(el).paddingBottom)));expect(padding.every(p=>p>=16)).toBe(true);
  await page.locator('input[value=onsite]').check();await submit(page);await screen(page,'C7');await dockFits(page);
  await page.locator('[data-cf-control=date]').click();await expect(page.locator('#dialog')).toBeVisible();await page.locator('#dialog [data-date-value][aria-pressed=true]').click();
  await page.locator('input[name=slot][value="09:00"]').check();await submit(page);await screen(page,'C8');
  await submit(page);await expect(page.locator('#form-error')).not.toBeEmpty();await dockFits(page);await expect(page.locator('#consent')).toBeFocused();
});

test('date/topic sheets support selection, keyboard dismissal, focus return and real form values',async({page})=>{
  await page.goto('/prototype/?scenario=upcoming#/support');await expect(page.locator('.cf-emergency-card a[href="tel:115"]')).toBeVisible();
  const requestGap=await page.locator('.cf-reference-section').filter({has:page.getByRole('heading',{name:'Gửi yêu cầu',exact:true})}).evaluate(section=>section.querySelector('label').getBoundingClientRect().top-section.querySelector('h2').getBoundingClientRect().bottom);expect(requestGap).toBeLessThan(32);
  await page.locator('[data-cf-control=supportTopic]').click();await expect(page.locator('#dialog')).toBeVisible();
  await page.locator('#dialog [role=option]').filter({hasText:'Thanh toán'}).click();await expect(page.locator('#supportTopic')).toHaveValue('Thanh toán');
  await page.locator('#support').fill('Cần kiểm tra khoản thanh toán');await expect(page.locator('#support-count')).toHaveText('29 / 500 ký tự');
  await page.locator('[data-cf-control=supportTopic]').click();await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');await expect(page.locator('[data-cf-control=supportTopic]')).toBeFocused();
  await page.goto('/prototype/#/profile');await page.locator('#profile-add-relative > summary').click();await page.locator('#name').fill('Người thân');await submit(page);
  await expect(page.locator('[data-cf-control=dob]')).toBeFocused();
  await page.locator('[data-cf-control=dob]').click();await page.locator('[data-calendar-year]').click();
  for(let i=0;i<3;i++)await page.locator('[data-calendar-prev]').click();
  await page.locator('[data-year="1994"]').click();await page.locator('[data-month="2"]').click();await page.locator('[data-date-value="1994-03-21"]').click();
  await expect(page.locator('#dob')).toHaveValue('1994-03-21');await expect(page.locator('[data-cf-control=dob]')).toContainText('21/03/1994');
});

test('large-text booking deliberately collapses its header after scrolling',async({page})=>{
  await page.goto('/prototype/?scenario=upcoming#/home');await page.locator('#bottom-nav .nav-book').click();await submit(page);await screen(page,'C2');
  await page.evaluate(()=>{const key='careflow.browser.v3',saved=JSON.parse(sessionStorage.getItem(key));saved.state.settings.largeText=true;sessionStorage.setItem(key,JSON.stringify(saved));});await page.reload();
  await page.locator('#phone-main').evaluate(el=>el.scrollTop=300);await expect(page.locator('.phone')).toHaveAttribute('data-cf-header-collapsed','');
  const head=await page.locator('.screen-masthead').boundingBox(),main=await page.locator('#phone-main').boundingBox();expect(head.y).toBeGreaterThanOrEqual(main.y-1);await dockFits(page);
});

test('lab time and file controls retain the lab booking and upload contracts',async({page})=>{
  await page.goto('/prototype/?scenario=pre-lab');await review(page,'F3');
  await page.locator('[data-cf-control=labTime]').click();await page.locator('[data-hour="10"]').click();await page.locator('[data-minute="15"]').click();await page.locator('[data-time-done]').click();await expect(page.locator('#labTime')).toHaveValue('10:15');
  await submit(page);await review(page,'F4');await page.locator('#file').setInputFiles({name:'ket-qua.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\nresult')});
  await expect(page.locator('[data-cf-control=file]')).toContainText('ket-qua.pdf');
});
