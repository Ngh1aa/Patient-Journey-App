const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const phone=page=>page.locator('#phone-content');
const submit=page=>phone(page).locator('form [type="submit"]').click();
const geometry=locator=>locator.evaluate(el=>{
  const s=getComputedStyle(el),r=el.getBoundingClientRect();
  return {font:s.fontSize,radius:s.borderRadius,height:r.height,variant:el.dataset.cfVariant};
});

test('patient appointment action preserves its name, type scale and clinician across screens',async({page})=>{
  await page.goto('/prototype/index.html?scenario=upcoming#/home');
  const homeAction=phone(page).locator('.cf-home-appointment-button');
  const home=await geometry(homeAction);
  const avatar=await phone(page).locator('.cf-home-appointment-avatar').innerHTML();
  await page.locator('#bottom-nav [aria-label="Lịch hẹn"]').click();
  const listAction=phone(page).getByRole('button',{name:'Xem phiếu khám',exact:true});
  expect(await geometry(listAction)).toEqual(home);
  expect(await phone(page).locator('.cf-clinician-avatar').innerHTML()).toBe(avatar);
  await listAction.click();await expect(phone(page)).toHaveAttribute('data-screen','D2');
  await page.goBack();await expect(phone(page)).toHaveAttribute('data-screen','D1');
  await expect(listAction).toBeVisible();
});

for(const width of [360,390])test(`large text and long content reflow without losing actions at ${width}px`,async({page},info)=>{
  await page.setViewportSize({width,height:844});
  await page.goto('/prototype/index.html?scenario=upcoming#/home');
  await page.evaluate(()=>{
    const saved=JSON.parse(sessionStorage.getItem('careflow.browser.v3'));
    saved.state.settings.largeText=true;
    saved.state.visits[0].clinician={name:'BS. Nguyễn Hoàng Minh Anh Phương',specialty:'Nội tổng quát và theo dõi sau khám',initials:'AP'};
    saved.state.visits[0].reason='Thông tin dài phục vụ kiểm tra giao diện '.repeat(12);
    sessionStorage.setItem('careflow.browser.v3',JSON.stringify(saved));
  });
  await page.reload();
  await page.locator('#bottom-nav [aria-label="Lịch hẹn"]').click();
  const action=phone(page).getByRole('button',{name:'Xem phiếu khám',exact:true});
  await expect(action).toHaveCSS('font-size','30px');
  await action.click();await expect(phone(page)).toHaveAttribute('data-screen','D2');
  for(const target of ['D2','K5']){
    if(target==='K5')await page.locator('#bottom-nav [aria-label="Hỗ trợ"]').click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
    const clipped=await phone(page).locator('[data-cf-component="button"]').evaluateAll(nodes=>nodes.filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.textContent.trim()));
    expect(clipped).toEqual([]);
    await page.screenshot({path:info.outputPath(`large-${width}-${target}.png`),fullPage:true});
  }
});

test('visit and result statuses keep different meanings and consistent tones across roles',async({page})=>{
  await page.goto('/prototype/index.html?scenario=upcoming#/home');
  const patient=phone(page).locator('.cf-home-appointment-status [data-cf-component="status"]');
  await expect(patient).toHaveText('Đã xác nhận');
  await expect(patient).toHaveAttribute('data-cf-tone','success');
  await page.goto('/staff-prototype/index.html#/doctor/queue');
  const states=await page.evaluate(()=>({visit:CareFlowUI.status('ready'),result:CareFlowUI.status('ready','result'),review:CareFlowUI.status('review')}));
  expect(states.visit.label).toBe('Sẵn sàng khám');
  expect(states.result.label).toBe('Chờ bác sĩ xem');
  expect(states.review.tone).toBe('warning');
  await expect(page.locator('.doctor-appointment').filter({hasText:'Phạm Gia Huy'}).locator('[data-cf-component="status"]')).toHaveText(states.visit.label);
});

test('booking exposes loading, preserves the draft on slot error and allows recovery',async({page})=>{
  await page.goto('/prototype/index.html?scenario=empty#/home');
  await page.locator('#bottom-nav .nav-book').click();await submit(page);
  await page.locator('#reason').fill('Nội dung cần giữ khi giờ khám không còn trống');await submit(page);
  await page.locator('input[value="normal"]').check();await submit(page);
  await page.locator('input[value="onsite"]').check();await submit(page);
  await page.locator('input[name="slot"][value="10:30"]').check();await submit(page);
  await page.locator('#review-toggle').click();
  await page.locator('#booking-outcome').selectOption('slot-unavailable');
  await page.locator('#review-toggle').click();
  await page.locator('#consent').check();
  await page.evaluate(()=>{
    const original=CareFlowModel.submitBooking;
    CareFlowModel.submitBooking=(...args)=>{
      const form=document.querySelector('#phone-content form');
      const button=form.querySelector('[type="submit"]');
      window.observedSubmit={busy:form.getAttribute('aria-busy'),disabled:button.disabled,label:button.textContent};
      return original(...args);
    };
  });
  await submit(page);
  expect(await page.evaluate(()=>window.observedSubmit)).toEqual({busy:'true',disabled:true,label:'Đang gửi yêu cầu…'});
  await expect(page.locator('#form-error')).not.toBeEmpty();
  await expect(phone(page).locator('form [type="submit"]')).toBeEnabled();
  await expect(phone(page).locator('form [type="submit"] svg')).toHaveCount(1);
  const saved=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state);
  expect(saved.draft.reason).toContain('Nội dung cần giữ');expect(saved.visits).toHaveLength(0);
  await page.goBack();await expect(phone(page)).toHaveAttribute('data-screen','C7');
  // The unavailable slot is deliberately cleared; the patient's reason is retained.
  await expect(page.locator('input[name="slot"][value="10:30"]')).not.toBeChecked();
  const replacement=page.locator('input[name="slot"]:not([value="10:30"])').first();
  const replacementTime=await replacement.getAttribute('value');
  await replacement.check();await submit(page);
  await page.locator('#review-toggle').click();
  await page.locator('#booking-outcome').selectOption('success');
  await page.locator('#review-toggle').click();
  await page.locator('#consent').check();await submit(page);
  await expect(phone(page)).toHaveAttribute('data-screen','C9');
  const recovered=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.visits);
  expect(recovered).toHaveLength(1);expect(recovered[0].slot).toBe(replacementTime);
});

test('doctor tabs support arrows, Home, End and a labelled panel',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/staff-prototype/index.html#/encounters/a-033');
  await page.getByRole('tab',{name:'Khám lâm sàng',exact:true}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab',{name:'Cận lâm sàng',exact:true})).toBeFocused();
  await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby','consult-tab-orders');
  await page.keyboard.press('End');await expect(page.getByRole('tab',{name:'Đơn thuốc',exact:true})).toBeFocused();
  await page.keyboard.press('Home');await expect(page.getByRole('tab',{name:'Khám lâm sàng',exact:true})).toBeFocused();
  await page.goto('/staff-prototype/index.html#/patients/p-006');
  await page.getByRole('tab',{name:'Tổng quan',exact:true}).focus();await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby','profile-tab-history');
});

test('doctor controls reflow at 200 percent zoom with long clinical content',async({page},info)=>{
  await page.setViewportSize({width:1440,height:900});
  for(const route of ['/doctor','/results','/encounters/a-033']){
    await page.goto('/staff-prototype/index.html#'+route);
    await page.evaluate(()=>document.body.style.zoom='2');
    if(route.startsWith('/encounters/'))await page.locator('textarea[name="symptom"]').fill('Nội dung dài kiểm tra khả năng đọc và cuộn trong trường nhập liệu. '.repeat(30));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(1441);
    const clipped=await page.locator('main [data-cf-component="button"]').evaluateAll(nodes=>nodes.filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.textContent.trim()));
    expect(clipped).toEqual([]);
  }
  await page.screenshot({path:info.outputPath('doctor-zoom-200.png'),fullPage:true});
});

test('doctor overview empty states retain a useful destination',async({page})=>{
  await page.setViewportSize({width:1280,height:800});
  await page.goto('/staff-prototype/index.html#/doctor');
  // Persist through a real save before editing the synthetic session fixture.
  await page.goto('/staff-prototype/index.html#/encounters/a-033');
  await page.getByRole('button',{name:'Lưu nháp',exact:true}).click();
  await page.evaluate(()=>{
    const saved=JSON.parse(sessionStorage.getItem('careflow.clinic.showcase.v1'));
    saved.appointments=[];saved.results=[];saved.doctorTasks=[];
    sessionStorage.setItem('careflow.clinic.showcase.v1',JSON.stringify(saved));
  });
  await page.goto('/staff-prototype/index.html#/doctor');
  await page.reload();
  await expect(page.locator('[data-priority="current"]')).toContainText('Chưa có buổi khám');
  await expect(page.locator('[data-priority="results"]')).toContainText('Không có kết quả');
  await page.getByRole('button',{name:'Xem danh sách khám',exact:true}).click();
  await expect(page.locator('main h1')).toHaveText('Danh sách khám');
});

test('changed patient components and doctor priorities have no serious accessibility violations',async({page})=>{
  await page.goto('/prototype/index.html?scenario=upcoming#/appointments');
  let result=await new AxeBuilder({page}).include('#phone-frame').analyze();
  expect(result.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/staff-prototype/index.html#/doctor');
  result=await new AxeBuilder({page}).include('main').analyze();
  expect(result.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
});
