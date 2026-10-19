const {test,expect}=require('../prototype/node_modules/@playwright/test');
const cases=[
 ['dashboard','/doctor','Tổng quan khám bệnh'],
 ['schedule','/doctor/schedule','Lịch khám của tôi'],
 ['queue','/doctor/queue','Danh sách khám'],
 ['patients','/patients','Hồ sơ bệnh nhân'],
 ['profile','/patients/p-006','Võ Thanh Tùng'],
 ['encounter','/encounters/a-033','KHÁM LÂM SÀNG'],
 ['results','/results','Kết quả cận lâm sàng'],
 ['orders','/clinical/orders','Chỉ định cận lâm sàng'],
 ['prescription','/clinical/prescription','Đơn thuốc'],
 ['review','/clinical/review','Rà soát hồ sơ khám'],
 ['followups','/doctor/followups','Theo dõi sau khám'],
 ['visit','/visits/a-033','Thông tin lượt khám']
];
for(const group of [0,1,2]){
 test('doctor-only 12-screen visual snapshots — cohort '+(group+1),async({page},testInfo)=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const [name,path,title] of cases.slice(group*4,group*4+4)){
   await page.goto('/staff-prototype/index.html#'+path);
   await expect(page.locator('main')).toContainText(title);
   await expect(page.locator('.doctor-sidebar')).toBeVisible();
   await expect(page.locator('.app-footer')).toContainText('Prototype UI/UX');
   await expect(page.locator('.demo-indicator')).toHaveCount(0);
   await expect(page.locator('main h1 svg, main h2 svg')).toHaveCount(0);
   await expect(page.locator('.sidebar [aria-current="page"]')).toHaveCount(1);
   const navFits=await page.evaluate(()=>{
     const item=document.querySelector('.sidebar-nav a[href="#/doctor/followups"]');
     const viewport=document.querySelector('.sidebar-nav');
     return item && viewport && item.getBoundingClientRect().bottom<=viewport.getBoundingClientRect().bottom+2;
   });
   expect(navFits,name+' sidebar last item clipped').toBe(true);
   const dimensions=await page.evaluate(()=>({body:document.documentElement.scrollWidth,viewport:innerWidth}));
   expect(dimensions.body,name+' horizontal overflow').toBeLessThanOrEqual(dimensions.viewport+1);
   await page.screenshot({path:testInfo.outputPath('doctor-'+name+'.png'),fullPage:true,animations:'disabled'});
  }
  expect(errors).toEqual([]);
 });
}
test('site defaults to doctor and rejects all reception and nursing routes',async({page})=>{
 await page.goto('/staff-prototype/');
 await expect(page).toHaveURL(/#\/doctor$/);
 await expect(page.locator('.doctor-heading h1')).toContainText('Tổng quan khám bệnh');
 await expect(page.locator('.switch-options')).toHaveCount(0);
 await expect(page.locator('.sidebar-nav [href*="reception"]')).toHaveCount(0);
 await expect(page.locator('.sidebar-nav [href*="nursing"]')).toHaveCount(0);
 for(const path of ['/reception','/nursing','/welcome','/requests','/checkin','/booking/new','/schedule/a-018']){
  await page.goto('/staff-prototype/index.html#'+path);
  await expect(page).toHaveURL(/#\/doctor$/);
 }
 await page.goto('/staff-prototype/index.html#/calendar');
 await expect(page).toHaveURL(/#\/doctor\/schedule$/);
});
test('doctor schedule navigation and patient queue',async({page})=>{
 await page.goto('/staff-prototype/index.html#/doctor/schedule');
 await expect(page.locator('.doctor-today-list')).toContainText('Võ Thanh Tùng');
 await page.locator('[data-action="next-week"]').click();
 await expect(page.locator('.doctor-empty')).toContainText('Không có lịch khám');
 await page.locator('[data-action="doc-today"]').first().click();
 await expect(page.locator('.doctor-today-list')).toContainText('Võ Thanh Tùng');
 await page.goto('/staff-prototype/index.html#/doctor/queue');
 await page.locator('[data-action="doc-filter-queue"][data-value="ready"]').click();
 await expect(page.locator('.doctor-today-list')).toContainText('Phạm Gia Huy');
 await page.locator('[data-action="start-consult"][data-id="a-027"]').click();
 await expect(page).toHaveURL(/#\/encounters\/a-027$/);
});
test('doctor clinical draft, signature simulation, state recovery',async({page})=>{
 await page.goto('/staff-prototype/index.html#/encounters/a-033');
 await page.locator('textarea[name="symptom"]').fill('Ghi chú khám minh họa phục vụ portfolio.');
 await page.locator('textarea[name="assessment"]').fill('Đã xem các thông tin liên quan trong kịch bản.');
 await page.locator('textarea[name="plan"]').fill('Tư vấn theo dõi và tái khám theo kế hoạch.')
 await page.locator('[data-action="save-draft"]').first().click();
 await expect(page.locator('.toast')).toContainText('Đã lưu ghi nhận thăm khám');
 await page.reload();
 await expect(page.locator('textarea[name="symptom"]')).toHaveValue('Ghi chú khám minh họa phục vụ portfolio.');
 await page.locator('[data-action="review-sign"]').first().click();
 await expect(page.locator('.dialog-card')).toContainText('không tạo chữ ký');
 await page.locator('[data-action="confirm-sign"]').click();
 await expect(page.locator('.consult-top')).toContainText('Hoàn tất buổi khám');
 await expect(page.locator('[data-action="review-sign"]')).toBeDisabled();
});
test('doctor result review, patient roster and profile tabs',async({page})=>{
 await page.goto('/staff-prototype/index.html#/results');
 await expect(page.locator('.doctor-lab-list')).toContainText('Công thức máu');
 await page.locator('[data-action="review-result"][data-id="r-01"]').click();
 await expect(page.locator('.doctor-result-preview')).toContainText('Bác sĩ đã xem');
 await page.goto('/staff-prototype/index.html#/patients');
 await page.locator('#doctor-search').fill('Thanh Tùng');
 await expect(page.locator('.doctor-directory-row')).toHaveCount(1);
 await page.locator('.doctor-directory-open').click();
 await expect(page).toHaveURL(/#\/patients\/p-006$/);
 await page.locator('[data-action="profile-tab"][data-value="history"]').click();
 await expect(page.locator('.profile-body')).toContainText('PK-1015-033');
 await page.locator('[data-action="open-appointment"][data-id="a-033"]').click();
 await expect(page).toHaveURL(/#\/visits\/a-033$/);
 await expect(page.locator('main')).toContainText('Đang khám');
});
test('follow-up internal task change persists without contacting patients',async({page})=>{
 await page.goto('/staff-prototype/index.html#/doctor/followups');
 await page.locator('[data-action="doc-task-toggle"][data-id="case-a-033"]').click();
 await expect(page.locator('.journey-task-entry.is-done')).toHaveCount(1);
 await page.reload();
 await expect(page.locator('.journey-task-entry.is-done')).toHaveCount(1);
});
test('task-first overview preserves priority, brand and visible primary action',async({page},testInfo)=>{
 await page.goto('/staff-prototype/index.html#/doctor');
 await expect(page.locator('.doctor-hero')).toHaveCount(0);
 expect(await page.locator('.doctor-priority-grid > [data-priority]').evaluateAll(nodes=>nodes.map(n=>n.dataset.priority))).toEqual(['current','decisions','results','schedule']);
 const current=page.locator('[data-priority="current"]');
 await expect(current).toContainText('Võ Thanh Tùng');
 const primary=current.getByRole('button',{name:'Tiếp tục khám'});
 await expect(primary).toBeInViewport();
 await primary.focus();await expect(primary).toHaveCSS('outline-style','solid');
 await expect(primary).toHaveCSS('background-color','rgb(11, 18, 32)');
 await expect(page.locator('.doctor-current-facts')).toContainText('Người phụ trách');
 await page.screenshot({path:testInfo.outputPath('doctor-priorities.png'),fullPage:true,animations:'disabled'});
});

test('doctor icon registry and supporting workflows remain available',async({page})=>{
 await page.goto('/staff-prototype/index.html#/doctor');
 const icons=await page.evaluate(()=>Object.keys(window.CareFlowIcons||{}));
 expect(icons).toContain('stethoscope');expect(icons).toContain('pill');
 await expect(page.locator('main h1 svg, main h2 svg')).toHaveCount(0);
 await page.goto('/staff-prototype/index.html#/doctor/schedule');
 await expect(page.locator('.doctor-next-visit')).toContainText('LƯỢT KHÁM TIẾP THEO');
 await page.goto('/staff-prototype/index.html#/doctor/followups');
 await expect(page.locator('.doctor-followups-summary')).toContainText('Bác sĩ phụ trách');
 await page.goto('/staff-prototype/index.html#/clinical/prescription');
 await expect(page.locator('.support-rx-metadata')).toContainText('Lượt khám');
});

test('sidebar fills the vertical rail with evenly distributed doctor links',async({page},testInfo)=>{
 const width=page.viewportSize().width;
 for(const height of [700,768,900,1080]){
  await page.setViewportSize({width,height});
  await page.goto('/staff-prototype/index.html#/doctor');
  const layout=await page.evaluate(()=>{
   const sidebar=document.querySelector('.doctor-sidebar');
   const nav=sidebar.querySelector('.sidebar-nav');
   const bottom=sidebar.querySelector('.sidebar-bottom');
   const groups=[...nav.querySelectorAll('.side-section')];
   const rect=el=>el.getBoundingClientRect();
   return {
    sidebar:rect(sidebar).toJSON(),nav:rect(nav).toJSON(),bottom:rect(bottom).toJSON(),
    overflow:nav.scrollHeight>nav.clientHeight+2,
    allLinks:[...nav.querySelectorAll('.nav-item')].map(el=>rect(el).toJSON()),
    groupIntervals:groups.map(group=>{
     const links=[...group.querySelectorAll('.nav-item')];
     const tops=links.map(el=>rect(el).top);
     return tops.slice(1).map((top,i)=>top-tops[i]);
    }),
    active:[...nav.querySelectorAll('.nav-item[aria-current="page"]')].length
   };
  });
  expect(layout.active).toBe(1);
  expect(layout.allLinks).toHaveLength(10);
  expect(Math.abs(layout.sidebar.bottom-height)).toBeLessThan(2);
  expect(layout.bottom.bottom).toBeLessThanOrEqual(height);
  expect(layout.bottom.bottom).toBeGreaterThan(height-35);
  expect(layout.nav.bottom).toBeLessThanOrEqual(layout.bottom.top+2);
  if(height>=768){
   expect(layout.overflow,`sidebar has unnecessary scroll at ${width}x${height}`).toBe(false);
   const last=layout.allLinks.at(-1);
   expect(last.bottom,`last sidebar entry hidden at ${height}px`).toBeLessThanOrEqual(layout.nav.bottom+1);
   expect(layout.nav.bottom-last.bottom,`sidebar keeps excessive empty lower region at ${height}px`).toBeLessThan(85);
   for(const intervals of layout.groupIntervals){
    const spread=Math.max(...intervals)-Math.min(...intervals);
    expect(spread,`uneven intra-group sidebar rhythm at ${height}px`).toBeLessThan(3);
   }
  }
  await page.locator('.doctor-sidebar').screenshot({path:testInfo.outputPath(`sidebar-${width}x${height}.png`),animations:'disabled'});
 }
});

const compositionRoutes=[
  ['/doctor','.doctor-priority-grid','dashboard'],
  ['/doctor/schedule','.doctor-schedule-layout','schedule'],
  ['/doctor/queue','.doctor-today-list','queue'],
  ['/patients','.doctor-directory','patients'],
  ['/patients/p-006','.profile-grid','patient-profile'],
  ['/visits/a-033','.doctor-results-grid','visit'],
  ['/encounters/a-033','.consult-grid','clinical-workspace'],
  ['/results','.doctor-results-grid','results'],
  ['/clinical/orders','.support-two-col','orders'],
  ['/clinical/prescription','.support-two-col','prescription'],
  ['/clinical/review','.support-review-grid','review'],
  ['/doctor/followups','.doctor-followups-grid','followups']
];

test('rectangular card-grid geometry and every doctor screen: no horizontal overflow',async({page},testInfo)=>{
  test.setTimeout(60000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const width=page.viewportSize().width;
  for(const [route,selector,name] of compositionRoutes){
    await page.goto('/staff-prototype/index.html#'+route);
    await expect(page.locator(selector)).toBeVisible();
    const geometry=await page.evaluate(selector=>{
      const el=document.querySelector(selector),main=document.querySelector('.main-content');
      const rect=el.getBoundingClientRect(),view=document.documentElement.scrollWidth;
      return {width:innerWidth,documentWidth:view,mainWidth:main.getBoundingClientRect().width,
        gridColumns:getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length,
        selectorWidth:rect.width};
    },selector);
    expect(geometry.documentWidth,name+' horizontal overflow '+width).toBeLessThanOrEqual(width+1);
    expect(geometry.mainWidth,name+' exceeds 1440').toBeLessThanOrEqual(1441);
    if(width>=1181 && selector!=='.doctor-today-list' && selector!=='.doctor-directory'){
      expect(geometry.gridColumns,name+' is not the shared 12-col desktop grid').toBe(12);
    }
    await page.screenshot({path:testInfo.outputPath('grid-'+name+'-'+width+'.png'),fullPage:true,animations:'disabled'});
  }
  expect(errors).toEqual([]);
});

test('desktop paired cards form a single bottom-aligned rectangle',async({page},testInfo)=>{
  const width=page.viewportSize().width;
  if(width<1181)return;
  const pairs=[
    ['/doctor/schedule','.doctor-schedule-main','.doctor-schedule-aside'],
    ['/doctor/followups','.doctor-followups-grid>.doctor-surface','.doctor-followups-grid>.doctor-followups-side'],
    ['/results','.doctor-results-grid>.doctor-surface:first-child','.doctor-result-preview'],
    ['/patients/p-006','.profile-grid>.profile-main','.profile-grid>.profile-side'],
    ['/clinical/orders','.support-two-col>.support-panel:first-child','.support-two-col>.support-panel:nth-child(2)'],
    ['/clinical/prescription','.support-two-col>.support-panel:first-child','.support-two-col>.support-panel:nth-child(2)'],
    ['/clinical/review','.support-review-grid>.support-panel:first-child','.support-review-grid>.support-panel:nth-child(2)'],
    ['/encounters/a-033','.consult-grid>.consult-queue','.consult-grid>.consult-editor'],
    ['/encounters/a-033','.consult-grid>.consult-editor','.consult-grid>.consult-right']
  ];
  for(const [route,left,right] of pairs){
    await page.goto('/staff-prototype/index.html#'+route);
    const edges=await page.evaluate(([left,right])=>{
      const a=document.querySelector(left).getBoundingClientRect(),
        b=document.querySelector(right).getBoundingClientRect();
      return {aBottom:a.bottom,bBottom:b.bottom,aTop:a.top,bTop:b.top,
        aWidth:a.width,bWidth:b.width};
    },[left,right]);
    expect(Math.abs(edges.aBottom-edges.bBottom),
      route+' paired card bottom misalignment '+JSON.stringify(edges)).toBeLessThanOrEqual(3);
    expect(Math.abs(edges.aTop-edges.bTop),route+' paired card top misalignment').toBeLessThanOrEqual(3);
    expect(edges.aWidth).toBeGreaterThan(120);
    expect(edges.bWidth).toBeGreaterThan(120);
  }

});

test('responsive composition: two columns tablet, one column phone',async({page},testInfo)=>{
  test.setTimeout(60000);
  const widths=[900,375];
  for(const width of widths){
    await page.setViewportSize({width,height:900});
    for(const [route,selector,name] of compositionRoutes){
      await page.goto('/staff-prototype/index.html#'+route);
      const grid=await page.evaluate(selector=>{
        const target=document.querySelector(selector);
        return {cols:getComputedStyle(target).gridTemplateColumns.split(' ').filter(Boolean).length,
          scroll:document.documentElement.scrollWidth,width:innerWidth};
      },selector);
      expect(grid.scroll,route+' '+width+'px overflow').toBeLessThanOrEqual(width+1);
      if(selector!=='.doctor-today-list' && selector!=='.doctor-directory'){
        expect(grid.cols,route+' columns at '+width).toBe(selector==='.doctor-priority-grid'?1:width===900?2:1);
      }
    }
    await page.goto('/staff-prototype/index.html#/doctor');
    await page.screenshot({path:testInfo.outputPath('grid-dashboard-responsive-'+width+'.png'),fullPage:true,animations:'disabled'});
  }
});

test('phone appointment rows preserve full patient names and keep actions accessible',async({page})=>{
  await page.setViewportSize({width:375,height:820});
  await page.goto('/staff-prototype/index.html#/doctor');
  const rows=page.locator('.doctor-today .doctor-agenda-row');
  await expect(rows).toHaveCount(7);
  const metrics=await page.evaluate(()=>{
    const first=document.querySelector('.doctor-today .doctor-agenda-row');
    const name=first.querySelector('.doctor-agenda-person strong');
    const action=first.querySelector('.doctor-agenda-actions .btn');
    const n=name.getBoundingClientRect(),a=action.getBoundingClientRect();
    return {display:getComputedStyle(first).display,whiteSpace:getComputedStyle(name).whiteSpace,
      personWidth:name.clientWidth,personScroll:name.scrollWidth,
      actionTop:a.top,nameBottom:n.bottom,documentWidth:document.documentElement.scrollWidth};
  });
  expect(metrics.display).toBe('grid');
  expect(metrics.whiteSpace).toBe('normal');
  expect(metrics.personScroll).toBeLessThanOrEqual(metrics.personWidth+1);
  expect(metrics.actionTop).toBeGreaterThan(metrics.nameBottom);
  expect(metrics.documentWidth).toBeLessThanOrEqual(376);
});

test('same patient action has the same label, type and named size across screens',async({page})=>{
 const sizes=[];
 for(const route of ['/doctor','/results','/encounters/a-033','/visits/a-033']){
  await page.goto('/staff-prototype/index.html#'+route);
  const action=page.locator('main [data-action="open-patient"]').filter({hasText:'Xem hồ sơ bệnh nhân'}).first();
  await expect(action).toBeVisible();
  sizes.push(await action.evaluate(el=>{const s=getComputedStyle(el);return {font:s.fontSize,minHeight:s.minHeight,radius:s.borderRadius,variant:el.dataset.cfVariant}}));
 }
 expect(sizes.every(s=>s.font===sizes[0].font&&parseFloat(s.minHeight)>=44&&s.radius===sizes[0].radius&&s.variant==='secondary')).toBe(true);
});

test('navy dashboard and clinical controls retain legible contrast across states',async({page})=>{
 const paths=['/doctor','/doctor/schedule','/doctor/queue','/patients','/results','/encounters/a-033','/clinical/orders','/clinical/prescription','/clinical/review','/doctor/followups'];
 for(const path of paths){
  await page.goto('/staff-prototype/index.html#'+path);
  const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(size.scroll,path+' overflow').toBeLessThanOrEqual(size.viewport+1);
  await expect(page.locator('main')).toBeVisible();
 }
 await page.goto('/staff-prototype/index.html#/doctor');
 const action=page.locator('.doctor-now .doctor-card-actions [data-cf-variant="primary"]');
 await action.hover();
 await expect(action).toHaveCSS('color','rgb(255, 255, 255)');
 await action.focus();
 await expect(action).toHaveCSS('outline-style','solid');
});

test('clinical brand statuses and selected tabs inherit navy rather than blue',async({page})=>{
 await page.goto('/staff-prototype/index.html#/encounters/a-033');
 await expect(page.locator('.consult-identity [data-cf-component="status"]')).toHaveAttribute('data-cf-tone','info');
 await expect(page.locator('.consult-tabs .tab.current')).toHaveCSS('color','rgb(0, 29, 87)');
 await expect(page.locator('.consult-person.selected .selected-stripe')).toHaveCSS('background-color','rgb(11, 18, 32)');
});

test('scenario: pre-visit physician review to coordinator handoff',async({page})=>{
 await page.goto('/staff-prototype/index.html#/doctor');
 await expect(page.locator('.doctor-decision-card')).toContainText('Trần Quốc Bảo');
 await expect(page.locator('.doctor-decision-card [data-value="mine"]')).toContainText('1');
 await page.locator('.doctor-decision-card [data-to="/doctor/review/a-021"]').click();
 await expect(page).toHaveURL(/#\/doctor\/review\/a-021$/);
 await expect(page.locator('.journey-facts')).toContainText('Bác sĩ');
 await page.locator('#journey-triage-decision').selectOption('Đề nghị điều phối khám trực tiếp');
 await page.locator('#journey-triage-note').fill('Cần bộ phận tiếp đón xác minh tình trạng và hướng dẫn tiếp nhận.');
 await page.locator('[data-action="doc-triage-handoff"]').click();
 await expect(page.locator('.journey-confirm')).toContainText('Đang chờ điều phối');
 await expect(page.locator('.journey-page-grid>.journey-panel').last()).toContainText('Điều phối');
 await page.goto('/staff-prototype/index.html#/doctor');
 await expect(page.locator('.doctor-decision-card [data-value="mine"]')).toContainText('0');
 await page.goto('/staff-prototype/index.html#/doctor/followups');
 await expect(page.locator('.journey-task-list')).toContainText('Tiếp nhận đề xuất trước khám');
 await expect(page.locator('.journey-task-list')).toContainText('Điều phối');
 await expect(page.locator('[data-action="doc-task-toggle"][data-id="review-a-021"]')).toHaveCount(0);
});

test('scenario: online connection confirmed before doctor starts consultation',async({page})=>{
 await page.goto('/staff-prototype/index.html#/doctor/online/a-040');
 await expect(page.locator('main')).toContainText('Hoàng Nhật Nam');
 await expect(page.locator('[data-action="start-consult"]')).toHaveCount(0);
 await page.locator('[data-action="doc-online-connect"]').click();
 await expect(page.locator('main')).toContainText('Đã xác nhận kết nối');
 await page.locator('[data-action="start-consult"][data-id="a-040"]').click();
 await expect(page).toHaveURL(/#\/encounters\/a-040$/);
 await expect(page.locator('.consult-top')).toContainText('Hoàng Nhật Nam');
});

test('scenario: online unreachable hands off callback without changing booking',async({page})=>{
 await page.goto('/staff-prototype/index.html#/doctor/online/a-041');
 await expect(page.locator('main')).toContainText('Chưa liên hệ được');
 await page.locator('#journey-online-choice').selectOption('Đề nghị chuyển khám trực tiếp');
 await page.locator('[data-action="doc-online-handoff"]').click();
 await expect(page.locator('.journey-confirm')).toContainText('Đề nghị chuyển khám trực tiếp');
 await expect(page.locator('main')).toContainText('Điều phối');
 await page.goto('/staff-prototype/index.html#/doctor/followups');
 await expect(page.locator('.journey-task-list')).toContainText('Hỗ trợ lịch khám trực tuyến');
 await expect(page.locator('.journey-task-list')).toContainText('Đề nghị chuyển khám trực tiếp');
});

test('end-to-end: reception handoff -> ready -> examination -> lab review -> completion -> aftercare',async({page})=>{
 await page.goto('/staff-prototype/index.html#/doctor/queue');
 const ready=page.locator('.doctor-appointment').filter({hasText:'Phạm Gia Huy'});
 await expect(ready).toContainText('Phụ trách: Bác sĩ');
 await ready.locator('[data-action="start-consult"][data-id="a-027"]').click();
 await expect(page).toHaveURL(/#\/encounters\/a-027$/);
 await page.locator('textarea[name="symptom"]').fill('Đau họng nhẹ, không khó thở; khám thực thể đã ghi nhận.');
 await page.locator('textarea[name="assessment"]').fill('Viêm đường hô hấp trên cần theo dõi diễn tiến.');
 await page.locator('textarea[name="plan"]').fill('Theo dõi triệu chứng và hẹn tái khám nếu không cải thiện.');
 await page.locator('[data-action="save-draft"]').first().click();
 await page.locator('[data-action="review-sign"]').first().click();
 await expect(page.locator('.toast')).toContainText('Vẫn còn kết quả cận lâm sàng');
 await page.goto('/staff-prototype/index.html#/results');
 await page.locator('[data-action="select-result"][data-id="r-04"]').click();
 await expect(page.locator('[data-action="doc-result-next"]')).toBeDisabled();
 await page.locator('[data-action="review-result"][data-id="r-04"]').click();
 await page.locator('#journey-result-choice').selectOption('follow');
 await page.locator('[data-action="doc-result-next"][data-id="r-04"]').click();
 await expect(page.locator('.journey-result-next')).toContainText('Đã bàn giao');
 await page.locator('a[href="#/encounters/a-027"]').click();
 await page.locator('[data-action="review-sign"]').first().click();
 await expect(page.locator('.dialog-card')).toContainText('Hoàn tất');
 await page.locator('[data-action="confirm-sign"]').click();
 await expect(page.locator('.consult-top')).toContainText('Hoàn tất buổi khám');
 await page.goto('/staff-prototype/index.html#/doctor/followups');
 await expect(page.locator('.journey-task-list')).toContainText('Theo dõi triệu chứng');
 await expect(page.locator('.journey-task-list')).toContainText('Phạm Gia Huy');
 await page.reload();
 await expect(page.locator('.journey-task-list')).toContainText('Phạm Gia Huy');
});

test('doctor cannot bypass arrival/handoff and cannot finish empty encounter',async({page})=>{
 await page.goto('/staff-prototype/index.html#/encounters/a-033');
 await page.locator('[data-action="review-sign"]').first().click();
 await expect(page.locator('.toast')).toContainText('Cần hoàn thiện triệu chứng');
 await expect(page.locator('.dialog-card')).toHaveCount(0);
 await page.goto('/staff-prototype/index.html#/doctor/queue');
 await expect(page.locator('.doctor-appointment').filter({hasText:'Nguyễn Minh Anh'})).not.toContainText('Bắt đầu khám');
 await page.evaluate(()=>{
  const b=document.createElement('button');
  b.dataset.action='start-consult';b.dataset.id='a-018';
  document.body.appendChild(b);b.click();b.remove();
 });
 await expect(page.locator('.toast')).toContainText('Chỉ bắt đầu khám');
 await expect(page).toHaveURL(/#\/doctor\/queue$/);
});

test('journey command cards render and fit in all responsive viewports',async({page},testInfo)=>{
 // Twenty-five route loads and five captures are a matrix, not a single page latency budget.
 test.setTimeout(90000);
 const sizes=[{width:375,height:812},{width:900,height:900},{width:1280,height:900},{width:1440,height:900},{width:1920,height:1080}];
 for(const size of sizes){
  await page.setViewportSize(size);
  for(const route of ['/doctor','/doctor/review/a-021','/doctor/online/a-040','/doctor/followups','/results']){
   await page.goto('/staff-prototype/index.html#'+route);
   await expect(page.locator('main')).toBeVisible();
   const metric=await page.evaluate(()=>({
    doc:document.documentElement.scrollWidth,window:innerWidth,main:document.querySelector('main').getBoundingClientRect().width
   }));
   expect(metric.doc,route+' horizontal overflow at '+size.width).toBeLessThanOrEqual(metric.window+1);
   expect(metric.main).toBeLessThanOrEqual(1441);
  }
  await page.goto('/staff-prototype/index.html#/doctor');
  await expect(page.locator('.doctor-priority-grid>[data-priority]')).toHaveCount(4);
  await page.screenshot({path:testInfo.outputPath('clinical-command-'+size.width+'.png'),fullPage:true,animations:'disabled'});
 }
});

test('cross-screen design evidence: clinical decision, online, aftercare and result',async({page},testInfo)=>{
 const sizes=[{width:1440,height:900},{width:375,height:812}];
 const screens=[['review','/doctor/review/a-021'],['online','/doctor/online/a-040'],['followups','/doctor/followups'],['results','/results']];
 for(const size of sizes){
  await page.setViewportSize(size);
  for(const [name,path] of screens){
   await page.goto('/staff-prototype/index.html#'+path);
   await expect(page.locator('main')).toBeVisible();
   const sizeCheck=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
   expect(sizeCheck.scroll,path+' at '+size.width).toBeLessThanOrEqual(sizeCheck.width+1);
   if(name==='followups'){
    await expect(page.locator('.journey-deadline-item')).toHaveCount(3);
    await expect(page.locator('.journey-deadline-item').first()).toContainText('15/10/2026');
   }
   await page.screenshot({path:testInfo.outputPath('journey-'+name+'-'+size.width+'.png'),fullPage:true,animations:'disabled'});
  }
 }
});
