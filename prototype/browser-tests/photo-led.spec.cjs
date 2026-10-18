const {test,expect}=require('@playwright/test');
const main=page=>page.locator('#phone-content');
const submit=page=>main(page).locator('form [type=submit]').click();

for(const width of [360,390,1440])test(`full photo cards, caption material and type at ${width}px`,async({page},info)=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/prototype/?scenario=appointments#/home');
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.fonts.check('16px "Plus Jakarta Sans"','Chăm sóc sức khỏe'))).toBe(true);
  await expect(main(page)).toHaveCSS('font-family',/Plus Jakarta Sans/);
  const cards=main(page).locator('button.cf-photo-card,.cf-guide-media > summary');
  expect(await cards.count()).toBeGreaterThanOrEqual(8);
  for(const card of await cards.all()){
    await card.scrollIntoViewIfNeeded();
    const image=card.locator('> .cf-photo-image');
    await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
    const geometry=await card.evaluate(el=>{
      const r=el.getBoundingClientRect(),image=el.querySelector('.cf-photo-image').getBoundingClientRect();
      const caption=el.querySelector('.cf-photo-content'),c=caption.getBoundingClientRect();
      const arrow=el.querySelector('.cf-photo-arrow').getBoundingClientRect();
      return {w:r.width,h:r.height,imageW:image.width,imageH:image.height,imageX:image.x-r.x,imageY:image.y-r.y,captionW:c.width,captionX:c.x-r.x,captionBottom:r.bottom-c.bottom,arrowInset:r.right-arrow.right,captionPadding:parseFloat(getComputedStyle(caption).paddingLeft),material:getComputedStyle(caption).backgroundColor,nested:el.querySelectorAll('button,a').length};
    });
    expect(geometry.imageX).toBeCloseTo(0,0);expect(geometry.imageY).toBeCloseTo(0,0);
    expect(geometry.imageW).toBeCloseTo(geometry.w,0);expect(geometry.imageH).toBeCloseTo(geometry.h,0);
    expect(geometry.captionW).toBeCloseTo(geometry.w,0);expect(geometry.captionX).toBeCloseTo(0,0);
    expect(geometry.captionBottom).toBeCloseTo(0,0);expect(geometry.arrowInset).toBeGreaterThanOrEqual(12);
    expect(geometry.captionPadding).toBeGreaterThanOrEqual(12);expect(geometry.material).toBe('rgba(6, 27, 58, 0.78)');
    expect(geometry.nested).toBe(0);expect(geometry.h).toBeGreaterThanOrEqual(44);
  }
  const feature=main(page).locator('.cf-photo-featured').first();
  await feature.scrollIntoViewIfNeeded();
  const crop=await feature.evaluate(el=>{
    const img=el.querySelector('img'),r=img.getBoundingClientRect(),panel=el.querySelector('.cf-photo-content').getBoundingClientRect();
    const scale=Math.max(r.width/img.naturalWidth,r.height/img.naturalHeight);
    const x=(r.width-img.naturalWidth*scale)/2,y=(r.height-img.naturalHeight*scale)/2;
    // No-cut head zone observed in NCI tl447mekwuQ: clinician head x290..580/y50..350.
    return {left:x+290*scale,right:x+580*scale,top:y+50*scale,bottom:y+350*scale,width:r.width,overlayTop:panel.top-r.top};
  });
  expect(crop.left).toBeGreaterThanOrEqual(0);expect(crop.right).toBeLessThanOrEqual(crop.width);
  expect(crop.top).toBeGreaterThanOrEqual(0);expect(crop.bottom).toBeLessThan(crop.overlayTop);
  await page.locator('.phone').screenshot({path:info.outputPath('discovery-'+width+'.png')});
});

test('image mode choices keep the selected mode and safety flow',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/home');
  await page.locator('#bottom-nav .nav-book').click();await submit(page);
  await page.locator('#reason').fill('Tôi muốn trao đổi với phòng khám.');await submit(page);
  await page.locator('input[value=normal]').check();await submit(page);
  await expect(main(page)).toHaveAttribute('data-screen','C6');
  await expect(page.locator('.cf-mode-choice img')).toHaveCount(2);
  await page.locator('.cf-mode-choice input[value=online]').check();await submit(page);
  await expect(main(page)).toHaveAttribute('data-screen','C7');
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.draft.mode)).toBe('online');
});

test('detail icon shortcuts and image result arrows retain the exact visit and lab',async({page})=>{
  await page.goto('/prototype/?scenario=pre-lab#/home');
  const before=await page.evaluate(()=>{const s=JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state;return {visit:s.activeVisitId,lab:s.visits.find(v=>v.id===s.activeVisitId).labs[0].id,status:s.visits.find(v=>v.id===s.activeVisitId).status}});
  await page.locator('.cf-home-appointment-button').click();
  await expect(page.locator('.ref-detail-hero img')).toBeVisible();
  await page.locator('.cf-detail-shortcuts').getByRole('button',{name:'Chỉ định',exact:true}).click();
  await expect(main(page)).toHaveAttribute('data-screen','F1');
  await page.getByRole('button',{name:'Xem chỉ định',exact:true}).click();
  await expect(main(page)).toHaveAttribute('data-screen','F2');
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).ui.labId)).toBe(before.lab);
  await page.locator('.cf-detail-shortcuts').getByRole('button',{name:'Hỗ trợ',exact:true}).click();
  await expect(main(page)).toHaveAttribute('data-screen','K5');
  const after=await page.evaluate(()=>{const s=JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state;return {visit:s.activeVisitId,status:s.visits.find(v=>v.id===s.activeVisitId).status}});
  expect(after).toEqual({visit:before.visit,status:before.status});
});
