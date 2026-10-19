const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

for(const width of [320,360,390,1440])test(`support contact bento and compact emergency remain usable at ${width}px`,async({page},info)=>{
  await page.setViewportSize({width,height:900});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/prototype/?scenario=empty#/support');
  const content=page.locator('#phone-content');
  await expect(content).not.toContainText('Hỗ trợ từ phòng khám');
  await expect(content.locator('.cf-hdr-request-row')).toContainText('Chưa có yêu cầu đang chờ');
  const headings=await content.locator('.cf-support-content > section > .cf-reference-section-head h2').allTextContents();
  expect(headings).toEqual(['Liên hệ nhanh','Câu hỏi thường gặp','Gửi yêu cầu']);
  const emergency=content.getByRole('link',{name:'Gọi 115',exact:true});
  await expect(emergency).toHaveAttribute('href','tel:115');
  await expect(emergency).toHaveCSS('background-color','rgb(11, 18, 32)');
  await expect(content.locator('[data-cf-variant=primary]')).toHaveCount(1);
  await expect(content.locator('.cf-hdr-support-hero img')).toHaveJSProperty('complete',true);
  expect(await content.locator('.cf-hdr-support-hero img').evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
  const geometry=await content.locator('.cf-support-content').evaluate(root=>{
    const children=[...root.children].map(el=>el.getBoundingClientRect());
    const cards=[...root.querySelectorAll('.cf-support-topics > div > button')].map(el=>el.getBoundingClientRect());
    return {gaps:children.slice(1).map((r,i)=>r.top-children[i].bottom),cards:cards.map(r=>({x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height})),overflow:document.getElementById('phone-main').scrollWidth-document.getElementById('phone-main').clientWidth};
  });
  expect(geometry.gaps.every(g=>Math.abs(g-16)<1)).toBe(true);
  expect(Math.abs(geometry.cards[0].w-geometry.cards[1].w)).toBeLessThan(1);
  expect(Math.abs(geometry.cards[0].y-geometry.cards[1].y)).toBeLessThan(1);
  expect(geometry.cards.every(r=>r.w>=44&&r.h>=44)).toBe(true);expect(geometry.overflow).toBeLessThanOrEqual(1);
  await page.locator('.phone').screenshot({path:info.outputPath('support.png')});
  await content.getByRole('button',{name:'Nhắn tin cho phòng khám',exact:true}).click();
  await expect(page.locator('#support')).toBeFocused();
  await content.locator('[data-topic="Đổi hoặc hủy lịch"]').click();await expect(page.locator('#support')).toBeFocused();
  await page.locator('.rich-faqs summary').first().click();await expect(page.locator('.rich-faqs details').first()).toHaveAttribute('open','');
  expect(errors).toEqual([]);
});

test('support preserves callback deduplication and submitted request values',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/support');
  for(let i=0;i<2;i++){
    await page.getByRole('button',{name:'Gọi lại',exact:true}).click();await expect(page.locator('#dialog')).toBeVisible();
    await page.locator('#dialog [data-action=close-dialog]').click();
  }
  await expect(page.locator('.cf-hdr-request-row')).toContainText('1 đang chờ');
  await expect(page.locator('.cf-support-callback')).toContainText('Chờ tiếp nhận');
  await page.getByRole('button',{name:'Nhắn tin cho phòng khám',exact:true}).click();
  await page.locator('#support').fill('Mình cần hỏi lại thời gian khám.');
  await page.locator('form[data-form=support] [type=submit]').click();
  const state=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state);
  expect(state.requests.filter(r=>r.type==='callback')).toHaveLength(1);
  expect(state.requests.some(r=>r.message==='Mình cần hỏi lại thời gian khám.'||r.text==='Mình cần hỏi lại thời gian khám.')).toBe(true);
});

test('completed visit contact cards retain their distinct care routes',async({page})=>{
  await page.goto('/prototype/?scenario=completed#/support');
  await page.getByRole('button',{name:'Nhắn tin cho phòng khám',exact:true}).click();await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','I5');
  await page.goto('/prototype/#/support');await page.getByRole('button',{name:'Hỏi phòng khám',exact:true}).click();await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','I1');
});

test('large text reflows contact cards and keeps emergency, form and navigation accessible',async({page},info)=>{
  await page.setViewportSize({width:360,height:900});await page.goto('/prototype/?scenario=empty#/support');
  await page.evaluate(()=>{const key='careflow.browser.v3',saved=JSON.parse(sessionStorage.getItem(key));saved.state.settings.largeText=true;sessionStorage.setItem(key,JSON.stringify(saved));});await page.reload();
  expect(await page.locator('#phone-main').evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
  await expect(page.getByRole('link',{name:'Gọi 115',exact:true})).toBeVisible();
  const accessibility=await new AxeBuilder({page}).include('#phone-content').include('#bottom-nav').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(accessibility.violations).toEqual([]);
  await page.locator('.phone').screenshot({path:info.outputPath('support-large.png')});
});
