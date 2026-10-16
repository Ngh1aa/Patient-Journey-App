const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

test('HR appointment link opens reviewed cards without login and preserves the selected visit on reload',async({page})=>{
  const url='/prototype/?journey=F1&branch=default#/appointments';
  await page.goto(url);
  await expect(page).toHaveURL(/\?journey=F1&branch=default#\/appointments$/);
  await expect(page.locator('.cf-appt-featured')).toContainText('BS. Trần Thu Hà');
  await expect(page.locator('.rich-appt-card')).toHaveCount(3);
  await expect(page.locator('.cf-appointment-history')).toHaveCount(2);
  await page.locator('[data-id="CF-SAMPLE-02"][data-to="D2"]').click();
  await page.reload();
  await expect(page.locator('.ticket')).toContainText('BS. Lê Minh Quân');
  await page.locator('#bottom-nav [aria-label="Lịch hẹn"]').click();
  await page.evaluate(()=>{
    const saved=JSON.parse(sessionStorage.getItem('careflow.browser.v3'));
    saved.state.visits.find(v=>v.id==='CF-SAMPLE-02').status='cancelled';
    sessionStorage.setItem('careflow.browser.v3',JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.locator('.rich-appt-card')).toHaveCount(2);
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.visits.find(v=>v.id==='CF-SAMPLE-02').status)).toBe('cancelled');
});

test('HR appointment link replaces an earlier empty F1 session',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/appointments');
  await page.evaluate(()=>{
    const saved=JSON.parse(sessionStorage.getItem('careflow.browser.v3'));
    saved.ui.journey={id:'F1',variant:'default',index:4};
    saved.ui.inspection=false;
    sessionStorage.setItem('careflow.browser.v3',JSON.stringify(saved));
  });
  await page.goto('/prototype/?journey=F1&branch=default#/appointments');
  await expect(page.locator('.rich-appt-card')).toHaveCount(3);
  await expect(page.locator('.cf-appointment-history')).toHaveCount(2);
});

test('F1 entry still starts the first booking journey',async({page})=>{
  await page.goto('/prototype/?journey=F1&branch=default');
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','A1');
  await expect(page.locator('.journey-panel')).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.visits)).toHaveLength(0);
});

async function mixedAppointments(page) {
  await page.goto('/prototype/?scenario=upcoming#/appointments');
  await page.evaluate(()=>{
    const saved=JSON.parse(sessionStorage.getItem('careflow.browser.v3'));
    const original=saved.state.visits[0];
    const pending=structuredClone(original);
    Object.assign(pending,{id:'CF-PENDING',status:'pending',mode:'online',patientId:'p2'});
    const completed=window.CareFlowModel.fixture('completed').visits[0];
    completed.id='CF-COMPLETED';
    saved.state.visits=[original,pending,completed];
    sessionStorage.setItem('careflow.browser.v3',JSON.stringify(saved));
  });
  await page.reload();
}

test('reference cards route actions to the selected appointment and retain pending semantics',async({page})=>{
  await mixedAppointments(page);
  const pending=page.locator('.rich-filterable').filter({has:page.locator('[data-id="CF-PENDING"]')});
  await expect(pending).toContainText('Chờ phòng khám');
  await expect(pending.getByRole('button',{name:'Vào khám',exact:true})).toHaveCount(0);
  await pending.getByRole('button',{name:'Hủy lịch',exact:true}).click();
  await expect(page).toHaveURL(/appointments\/CF-PENDING\/cancel/);
  await expect(page.locator('#phone-content')).toContainText('Trần Thị Mai');
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.visits.find(v=>v.id==='CF-PENDING').status)).toBe('pending');
  await page.goto('/prototype/#/appointments');
  await page.locator('[data-id="CF-COMPLETED"][data-to="H7"]').click();
  await expect(page).toHaveURL(/appointments\/CF-COMPLETED\/results/);
});

test('appointment person and mode filters compose and restore grouped content',async({page})=>{
  await mixedAppointments(page);
  await page.getByRole('button',{name:'Lọc lịch hẹn',exact:true}).click();
  await page.locator('[data-visit-filter="online"]').click();
  await expect(page.locator('.rich-filterable:visible')).toHaveCount(1);
  await page.locator('.rich-person-picker summary').click();
  await page.locator('[data-appointment-person="p1"]').click();
  await expect(page.locator('.rich-filterable:visible')).toHaveCount(0);
  await expect(page.locator('.rich-filter-empty')).toBeVisible();
  await expect(page.locator('.rich-appointment-group:visible')).toHaveCount(0);
  await page.locator('[data-visit-filter="all"]').click();
  await expect(page.locator('.rich-filterable:visible')).toHaveCount(2);
  await page.locator('.rich-person-picker summary').click();
  await page.locator('[data-appointment-person="all"]').click();
  await expect(page.locator('.rich-filterable:visible')).toHaveCount(3);
  await expect(page.locator('.rich-appointment-group:visible')).toHaveCount(3);
});

test('home aftercare selects the completed visit even when another visit is active',async({page})=>{
  await mixedAppointments(page);
  await page.goto('/prototype/#/home');
  await page.locator('.cf-home-care-foot [data-to="H6"]').click();
  await expect(page).toHaveURL(/appointments\/CF-COMPLETED\/summary/);
  await expect(page.locator('.rich-aftercare-sample')).toContainText('không phải đơn thuốc của bạn');
  const before=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.visits);
  await page.getByRole('checkbox',{name:'Đã uống (mẫu)'}).check();
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state.visits)).toEqual(before);
});

test('support preserves topic and contact preference without inventing clinic replies',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/support');
  await expect(page.locator('#phone-content')).toContainText('Chưa có tin nhắn');
  await page.getByRole('button',{name:'Nhắn tin',exact:true}).click();
  await expect(page.locator('#support')).toBeFocused();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','K5');
  await page.locator('#supportTopic').selectOption('Kết quả');
  await page.locator('#support').fill('Tôi muốn hỏi về kết quả xét nghiệm.');
  await page.locator('.cf-contact-preference summary').click();
  await page.locator('[name="contactMode"][value="message"]').check();
  await page.locator('form[data-form="support"] [type="submit"]').click();
  const saved=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state);
  expect(saved.requests.at(-1)).toMatchObject({topic:'Kết quả',contactMode:'message',status:'waiting'});
  expect(saved.messages).toHaveLength(0);
  await page.evaluate(()=>{
    const saved=JSON.parse(sessionStorage.getItem('careflow.browser.v3'));
    const owner=window.CareFlowModel.fixture('completed').visits[0];
    const relative=structuredClone(owner);
    Object.assign(owner,{id:'CF-OWNER'});
    Object.assign(relative,{id:'CF-RELATIVE',patientId:'p2'});
    saved.state.visits=[owner,relative];
    saved.state.messages=[{visitId:owner.id,from:'staff',text:'Thông tin của bạn'},{visitId:relative.id,from:'staff',text:'Thông tin riêng người thân'}];
    sessionStorage.setItem('careflow.browser.v3',JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.locator('.rich-message-preview')).toHaveCount(1);
  await expect(page.locator('.rich-message-preview')).toContainText('Thông tin của bạn');
  await expect(page.locator('#phone-content')).not.toContainText('Thông tin riêng người thân');
  await page.evaluate(()=>{
    const saved=JSON.parse(sessionStorage.getItem('careflow.browser.v3'));
    saved.state.authenticated=false;
    sessionStorage.setItem('careflow.browser.v3',JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.locator('.rich-message-preview')).toHaveCount(0);
});

for(const width of [360,390,1440]) {
  test('reference content reflows with large text and preserves navigation at '+width,async({page},info)=>{
    test.setTimeout(180000);
    await page.setViewportSize({width,height:900});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    for(const [name,route] of [['home','/home'],['appointments','/appointments'],['profile','/profile'],['support','/support']]) {
      await page.goto('/prototype/?scenario=upcoming#'+route);
      for(const large of [false,true]) {
        if(large) {await page.locator('#review-toggle').click();await page.locator('[data-action="large-text"]').click();await page.locator('#review-toggle').click();await page.evaluate(()=>scrollTo(0,0));}
        await expect(page.locator('#bottom-nav')).toBeVisible();
        await expect(page.locator('#bottom-nav a,#bottom-nav button')).toHaveCount(5);
        const overflow=await page.locator('#phone-main').evaluate(el=>el.scrollWidth-el.clientWidth);
        expect(overflow,name+' large='+large).toBeLessThanOrEqual(1);
        await page.screenshot({path:info.outputPath(name+'-'+width+(large?'-large':'')+'.png'),animations:'disabled'});
      }
    }
    expect(errors).toEqual([]);
  });
}

test('changed screens have no serious or critical automated accessibility findings',async({page})=>{
  for(const route of ['/home','/appointments','/profile','/support']) {
    await page.goto('/prototype/?scenario=upcoming#'+route);
    const result=await new AxeBuilder({page}).include('.phone').analyze();
    expect(result.violations.filter(v=>['serious','critical'].includes(v.impact)),route).toEqual([]);
  }
});

test('appointment board uses reference data and each card opens the correct clinician and visit',async({page})=>{
  await page.goto('/prototype/?scenario=appointments#/appointments');
  await expect(page.locator('.cf-appt-featured')).toContainText('BS. Trần Thu Hà');
  await expect(page.locator('.cf-appt-featured')).toHaveCSS('background-color','rgb(0, 29, 87)');
  await expect(page.locator('.rich-appt-card')).toHaveCount(3);
  await expect(page.locator('.cf-appointment-history')).toHaveCount(2);
  await page.locator('[data-id="CF-SAMPLE-02"][data-to="D2"]').click();
  await expect(page.locator('.ticket')).toContainText('BS. Lê Minh Quân');
  await expect(page.locator('.ticket')).toContainText('CF-SAMPLE-02');
  await page.goto('/prototype/#/appointments');
  await page.locator('[data-id="CF-SAMPLE-03"][data-to="D4"]').click();
  await expect(page).toHaveURL(/CF-SAMPLE-03\/cancel/);
  await page.goto('/prototype/#/appointments');
  await page.getByRole('button',{name:'Xem tất cả chờ xác nhận'}).click();
  await expect(page.locator('.rich-appt-card')).toHaveCount(1);
  await expect(page.locator('.rich-appt-card')).toContainText('BS. Phạm Ngọc Lan');
  await page.getByRole('button',{name:'Tất cả lịch sắp tới'}).click();
  await expect(page.locator('.rich-appt-card')).toHaveCount(3);
  await page.getByRole('button',{name:'Xem tất cả đã khám gần đây'}).click();
  await expect(page.locator('.rich-appt-tabs [data-filter="past"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.rich-appt-card')).toHaveCount(2);
});

test('Home gives booking a primary level and navy chrome has no gap on representative screens',async({page})=>{
  for(const width of [360,390,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto('/prototype/?scenario=empty#/home');
    const metrics=await page.locator('.phone').evaluate(phone=>{
      const bounds=phone.getBoundingClientRect(),head=phone.querySelector('.phone-header').getBoundingClientRect(),mast=phone.querySelector('.home-masthead').getBoundingClientRect();
      const primary=phone.querySelector('.cf-quick-primary').getBoundingClientRect(),secondary=phone.querySelector('.cf-quick-secondary').getBoundingClientRect();
      return {headLeft:head.left-bounds.left-phone.clientLeft,headRight:bounds.right-phone.clientLeft-head.right,mastLeft:mast.left-bounds.left-phone.clientLeft,mastRight:bounds.right-phone.clientLeft-mast.right,primaryWidth:primary.width,secondaryWidth:secondary.width};
    });
    for(const key of ['headLeft','headRight','mastLeft','mastRight']) expect(metrics[key],width+' '+key).toBeCloseTo(0,0);
    expect(metrics.primaryWidth).toBeGreaterThan(metrics.secondaryWidth*2);
    for(const route of ['/home','/appointments','/appointments/CF-1017-0042','/profile','/support','/book/patient']) {
      if(route==='/book/patient') {
        await page.goto('/prototype/?scenario=empty#/home');
        await page.locator('#bottom-nav .nav-book').click();
      } else await page.goto('/prototype/?scenario=upcoming#'+route);
      const seam=await page.locator('.phone-header').evaluate(header=>({shadow:getComputedStyle(header).boxShadow,gap:document.querySelector('.screen-masthead').getBoundingClientRect().top-header.getBoundingClientRect().bottom}));
      expect(seam.shadow,route).toBe('none');
      expect(seam.gap,route).toBeCloseTo(0,0);
    }
  }
});
