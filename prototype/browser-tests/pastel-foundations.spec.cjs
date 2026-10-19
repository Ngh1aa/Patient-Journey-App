const {test,expect} = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('node:fs');
const path = require('node:path');
const url = '/design/preview.html';

for (const width of [360,390,768,1440]) test(`candidate components have safe insets, visible nav labels and touch targets at ${width}px`, async ({page},info) => {
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width,height:1000});
  await page.goto(url);await page.evaluate(()=>document.fonts.ready);
  expect(errors).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
  const nav=page.getByRole('navigation',{name:'Điều hướng chính'});
  for(const name of ['Trang chủ','Lịch hẹn','Hồ sơ','Hỗ trợ'])await expect(nav.getByRole('link',{name})).toBeVisible();
  await expect(nav.getByRole('button',{name:'Đặt lịch',exact:true})).toBeVisible();
  const sizes=await page.locator('button,a').evaluateAll(nodes=>nodes.filter(el=>el.getClientRects().length).map(el=>({label:el.textContent.trim(),w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
  expect(sizes.filter(s=>s.w<44||s.h<44)).toEqual([]);
  const insetIssues=await page.locator('[data-cf-card]').evaluateAll(nodes=>nodes.filter(card=>card.getClientRects().length).flatMap(card=>[...card.querySelectorAll('h2,h3,p')].filter(el=>{
    if(!el.getClientRects().length)return false;
    const c=card.getBoundingClientRect(),r=el.getBoundingClientRect();return r.left-c.left<15||c.right-r.right<15;
  }).map(el=>el.textContent)));
  expect(insetIssues).toEqual([]);
  const clippedActions=await page.locator('[data-cf-card] button').evaluateAll(nodes=>nodes.filter(el=>{if(!el.getClientRects().length)return false;const r=el.getBoundingClientRect(),c=el.closest('[data-cf-card]').getBoundingClientRect();return r.right>c.right-15||r.left<c.left+15||el.scrollWidth>el.clientWidth+1;}).map(el=>el.textContent));
  expect(clippedActions).toEqual([]);
  const wraps=await page.locator('.cf-step-label,[role="tab"]').evaluateAll(nodes=>nodes.filter(el=>{const s=getComputedStyle(el);return el.scrollWidth>el.clientWidth+1 || s.whiteSpace!=='nowrap';}).map(el=>el.textContent));
  expect(wraps).toEqual([]);
  await page.screenshot({path:info.outputPath(`foundations-${width}.png`),fullPage:true});
});

test('text at 200% reflows at 360px without clipped actions or wrapped step labels',async({page},info)=>{
  await page.setViewportSize({width:360,height:900});await page.goto(url);
  await page.getByRole('button',{name:'Chữ 200%',exact:true}).click();
  await expect(page.getByRole('button',{name:'Chữ 200%',exact:true})).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(361);
  const clipped=await page.locator('[data-cf-card] button,.cf-step-label').evaluateAll(nodes=>nodes.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent));
  expect(clipped).toEqual([]);
  const clippedByCard=await page.locator('[data-cf-card] :is(p,h2,h3,small,button,textarea,summary)').evaluateAll(nodes=>nodes.filter(el=>{
    if(!el.getClientRects().length||el.closest('.cf-tabs,.cf-stepper,.cf-state-controls'))return false;
    const r=el.getBoundingClientRect(),c=el.closest('[data-cf-card]').getBoundingClientRect();return r.left<c.left+15||r.right>c.right-15;
  }).map(el=>el.textContent));
  expect(clippedByCard).toEqual([]);
  await expect(page.locator('.cf-step-label').first()).toHaveCSS('white-space','nowrap');
  await expect(page.locator('.cf-nav-book .cf-nav-label')).toHaveCount(0);
  await expect(page.locator('.cf-nav-book')).toHaveAccessibleName('Đặt lịch');
  await page.screenshot({path:info.outputPath('foundations-200percent.png'),fullPage:true});
  await page.getByRole('button',{name:'Chữ 200%',exact:true}).click();
  await expect(page.locator('.cf-step-label').first()).toHaveCSS('font-size','12px');
});

test('tabs support keyboard navigation and named state; stepper stays within four visual groups',async({page})=>{
  await page.goto(url);
  const tab=page.getByRole('tab',{name:'Sắp tới'});await tab.focus();await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab',{name:'Đã khám'})).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('Hoàn tất buổi khám');
  await page.keyboard.press('End');await expect(page.getByRole('tab',{name:'Đã hủy'})).toHaveAttribute('aria-selected','true');
  await expect(page.getByRole('tabpanel').locator('[data-cf-component="status"]')).toHaveAttribute('data-cf-tone','danger');
  await expect(page.locator('[data-action="preview-step-back"]')).toBeDisabled();
  for(let i=0;i<3;i++)await page.locator('[data-action="preview-step-next"]').click();
  await expect(page.locator('.cf-stepper [aria-current="step"]')).toContainText('Kiểm tra');
  await expect(page.locator('[data-action="preview-step-next"]')).toBeDisabled();
  await page.locator('[data-action="preview-step-back"]').click();
  await expect(page.locator('.cf-stepper [aria-current="step"]')).toContainText('Nơi khám');
});

test('empty, loading and error provide distinct semantics and recovery without changing product state',async({page})=>{
  await page.goto(url);
  await expect(page.locator('[data-cf-state="empty"]')).toContainText('Chưa có lịch hẹn');
  await page.locator('[data-preview-state="loading"]').click();
  await expect(page.locator('[data-cf-state="loading"]')).toHaveAttribute('aria-busy','true');
  await expect(page.locator('[data-cf-state="loading"] button')).toBeDisabled();
  await page.locator('[data-preview-state="error"]').click();
  await expect(page.locator('[data-cf-state="error"]')).toContainText('Kiểm tra kết nối');
  await page.getByRole('button',{name:'Thử lại',exact:true}).click();
  await expect(page.locator('[data-cf-state="ready"]')).toContainText('Đã xác nhận');
  // Both controls now reflect the same state, rather than leaving Error selected.
  await expect(page.locator('[data-preview-state="ready"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('.cf-tab-bar').getByRole('link',{name:'Lịch hẹn',exact:true}).click();
  await expect(page.locator('.cf-tab-bar [aria-current="page"] .cf-nav-label')).toHaveText('Lịch hẹn');
  await expect(page.locator('.cf-tab-bar [aria-current="page"] svg')).toHaveCSS('fill','rgb(0, 29, 87)');
  await page.locator('.cf-nav-book').click();
  await expect(page.locator('#preview-feedback')).toContainText('Nút + sẽ mở luồng đặt lịch');
  expect(await page.evaluate(()=>sessionStorage.getItem('careflow.browser.v3'))).toBeNull();
});

test('candidate text palette meets 4.5:1 on surfaces, every mesh extreme and named status backgrounds',async({page},info)=>{
  await page.goto(url);
  const pairs=await page.evaluate(()=>{
    // Resolve aliases via a DOM element so var() values cannot bypass the check.
    const color=name=>{const el=document.createElement('i');el.style.color='var(--cf-'+name+')';document.body.append(el);const value=getComputedStyle(el).color;el.remove();const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return `rgb(${[...ctx.getImageData(0,0,1,1).data].slice(0,3).join(', ')})`;};
    return [['brand','surface'],['text','surface'],['text-muted','surface'],['text-muted','surface-page'],['on-brand','primary'],['on-brand','primary-loading'],['disabled-ink','disabled-surface'],...['baby-blue','blue-deep','mint','mint-deep'].flatMap(bg=>[['brand',bg],['text',bg]]),...['success','warning','danger','info','neutral'].map(tone=>[tone,tone+'-surface'])].map(([fg,bg])=>({fg,bg,ink:color(fg),surface:color(bg)}));
  });
  const luminance=rgb=>{const channels=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];};
  const report=pairs.map(pair=>{const a=luminance(pair.ink),b=luminance(pair.surface);return {...pair,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
  expect(report.filter(pair=>pair.ratio<4.5)).toEqual([]);
  await info.attach('candidate-contrast.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
});

test('primary roles share black styling, examples have captions and section links remain unfilled',async({page})=>{
  await page.goto(url);
  await expect(page.locator('[data-action="preview-step-next"]')).toHaveCSS('background-color','rgb(11, 18, 32)');
  await expect(page.locator('[data-action="preview-primary"]')).toHaveCSS('background-color','rgb(11, 18, 32)');
  await expect(page.getByRole('button',{name:'Mặc định',exact:true})).toHaveCount(0);
  await expect(page.locator('.cf-button-examples figcaption')).toHaveText(['Mặc định','Đang tải','Chưa đủ thông tin']);
  const link=page.getByRole('link',{name:'Xem tất cả',exact:true});
  await expect(link).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  await expect(link).toHaveAttribute('href','#/profile');
  const css=fs.readFileSync(path.resolve(__dirname,'../../design/tokens.css'),'utf8').split('[data-cf-theme="pastel"]')[1];
  expect(css).not.toMatch(/lavender|peach|#d9d4ff|#ffd9d0/i);
  const painted=await page.locator('.cf-illustration *,.cf-profile-avatar').evaluateAll(nodes=>nodes.map(el=>{const s=getComputedStyle(el);return [s.fill,s.backgroundColor];}).flat());
  expect(painted).not.toContain('rgb(217, 212, 255)');expect(painted).not.toContain('rgb(255, 217, 208)');
  const busy=page.locator('#loading-button-example button');
  const locked=page.getByRole('button',{name:'Chưa thể tiếp tục',exact:true});
  await expect(busy).toHaveAttribute('aria-busy','true');await expect(busy).toBeDisabled();
  await expect(busy).toHaveCSS('color','rgb(255, 255, 255)');
  expect(await busy.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(await locked.evaluate(el=>getComputedStyle(el).backgroundColor));
  await expect(locked.locator('svg')).toHaveCount(1);await expect(locked).toHaveCSS('box-shadow','none');
  await expect(locked).toHaveCSS('background-color','rgb(238, 241, 245)');
  await expect(busy).toHaveCSS('opacity','1');
  expect(await busy.evaluate(el=>getComputedStyle(el,'::after').content)).not.toBe('none');
});

test('profile stack and question suggestion have different functional anatomy and no fake message send',async({page})=>{
  await page.setViewportSize({width:360,height:900});await page.goto(url);
  const profile=page.locator('.cf-profile-card'),question=page.locator('.cf-question-card');
  await expect(profile.locator('.cf-profile-avatar')).toHaveCount(2);
  await expect(profile.locator('.cf-profile-summary')).toContainText('2 hồ sơ');
  await expect(profile.locator('.cf-illustration-slot')).toHaveCount(0);
  await profile.locator('summary').click();
  await expect(profile.locator('li')).toHaveCount(2);
  const line=await profile.locator('.cf-profile-summary').evaluate(el=>{const a=el.firstElementChild.getBoundingClientRect(),b=el.lastElementChild.getBoundingClientRect();return Math.abs((a.top+a.height/2)-(b.top+b.height/2));});
  expect(line).toBeLessThan(2);
  const overlapped=await profile.locator('.cf-profile-avatar').evaluateAll(nodes=>nodes.slice(0,-1).filter((avatar,i)=>avatar.querySelector('.cf-avatar-initials').getBoundingClientRect().right>nodes[i+1].getBoundingClientRect().left).length);
  expect(overlapped).toBe(0);
  await question.getByRole('button',{name:'Giấy tờ',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Câu hỏi của bạn'})).toHaveValue('Tôi cần mang giấy tờ gì khi đến khám?');
  const clipped=await page.locator('#quick-question textarea,#quick-question button').evaluateAll(nodes=>nodes.filter(el=>{const r=el.getBoundingClientRect(),c=el.closest('[data-cf-card]').getBoundingClientRect();return r.left<c.left+15||r.right>c.right-15||el.scrollWidth>el.clientWidth+1;}).map(el=>el.textContent));
  expect(clipped).toEqual([]);
  await page.getByRole('textbox',{name:'Câu hỏi của bạn'}).fill('<img src=x> Tôi muốn hỏi giờ khám.');
  await page.getByRole('button',{name:'Xem trước',exact:true}).click();
  await expect(page.locator('#question-preview')).toHaveText('<img src=x> Tôi muốn hỏi giờ khám.');
  await expect(page.locator('#question-preview img')).toHaveCount(0);
  await expect(page.locator('#question-note')).toContainText('chưa gửi');
  expect(await page.evaluate(()=>sessionStorage.getItem('careflow.browser.v3'))).toBeNull();
  await page.getByRole('button',{name:'Đóng',exact:true}).click();await expect(page.locator('#quick-question')).toBeHidden();
  await page.getByRole('checkbox',{name:'Xem lại ngày giờ',exact:true}).check();
  await expect(page.getByRole('checkbox',{name:'Xem lại ngày giờ',exact:true})).toBeChecked();
  expect(await page.getByRole('checkbox',{name:'Xem lại ngày giờ',exact:true}).locator('..').evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
});

for(const width of [360,390])test(`illustrations are outlined, visible and inside a fixed slot at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto(url);
  const art=await page.locator('.cf-illustration-slot').evaluateAll(nodes=>nodes.map(slot=>{const svg=slot.querySelector('svg'),b=svg.getBBox(),r=slot.getBoundingClientRect(),c=slot.closest('[data-cf-card]').getBoundingClientRect();return {kind:slot.dataset.cfArtKind,width:r.width,inside:r.left>=c.left+15&&r.right<=c.right-15,withinViewBox:b.x>=0&&b.y>=0&&b.x+b.width<=200&&b.y+b.height<=180,stroke:getComputedStyle(svg.querySelector('.cf-art-paper')).stroke};}));
  expect(art.length).toBeGreaterThanOrEqual(4);
  expect(art.filter(row=>!row.inside||!row.withinViewBox||row.width<116||row.stroke==='none')).toEqual([]);
  await expect(page.locator('[data-cf-state="empty"] .cf-illustration-slot')).toHaveCSS('width','160px');
  const row=await page.locator('.cf-stepper li').evaluateAll(nodes=>nodes.map(n=>Math.round(n.getBoundingClientRect().top)));
  expect(new Set(row).size).toBe(1);
});

test('candidate has no axe WCAG 2.1 AA findings in default, loading or error states',async({page})=>{
  await page.goto(url);
  for(const state of ['empty','loading','error','ready']) {
    await page.locator(`[data-preview-state="${state}"]`).click();
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
  }
});

test('candidate uses token-owned colors, escapes labels and is enabled by both approved product renderers',async({page})=>{
  const css=fs.readFileSync(path.resolve(__dirname,'../../design/components.css'),'utf8');
  expect(css).not.toMatch(/#[a-f\d]{3,8}\b|rgba?\(/i);
  await page.goto(url);
  const html=await page.evaluate(()=>CareFlowUI.actionButton('<img src=x onerror=alert(1)>',{to:'" onclick="alert(1)'}));
  expect(html).toContain('&lt;img');expect(html).toContain('&quot; onclick=&quot;');
  expect(await page.locator('img').count()).toBe(0);
  expect(await page.locator('.cf-review-frame').count()).toBe(3);
  await page.goto('/prototype/?scenario=upcoming#/home');
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','B1');
  await expect(page.locator('#phone-frame')).toHaveAttribute('data-cf-theme','pastel');
  await page.goto('/staff-prototype/#/doctor');await expect(page.locator('body')).toHaveAttribute('data-cf-theme','pastel');
});
