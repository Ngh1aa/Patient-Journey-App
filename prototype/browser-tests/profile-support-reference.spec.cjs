const {test,expect}=require('@playwright/test');
const state=page=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state);

test('profile reference uses the account owner and sends an update request without changing identity',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/profile');
  await expect(page.locator('.cf-profile-masthead-account')).toContainText('Nguyễn Minh Anh');
  await expect(page.locator('.rich-profile-details')).toContainText('Chưa khai báo');
  const before=(await state(page)).profiles;
  await page.getByRole('button',{name:'Xem hồ sơ',exact:true}).click();
  await expect(page.locator('#dialog')).toBeVisible();
  await expect(page.locator('#dialog-body')).toContainText('15/08/1994');
  await page.getByRole('button',{name:'Yêu cầu cập nhật',exact:true}).click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','K5');
  await expect(page.locator('#dialog')).not.toBeVisible();
  await expect(page.locator('#supportTopic')).toHaveValue('Thông tin hồ sơ');
  await expect(page.locator('#support')).toBeFocused();
  await page.locator('#support').fill('Tôi muốn cập nhật số điện thoại liên hệ.');
  await page.locator('form[data-form="support"] button[type="submit"]').click();
  expect((await state(page)).requests.at(-1)).toMatchObject({topic:'Thông tin hồ sơ',status:'waiting'});
  expect((await state(page)).profiles).toEqual(before);
});

test('relative tiles open details, preserve result permissions and select the correct patient for booking',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/profile');
  await page.locator('.cf-relative-add summary').click();
  await page.locator('#name').fill('Người thân mới');
  await page.locator('#dob').fill('2000-01-01');
  await page.locator('form[data-form="relative"] button[type="submit"]').click();
  await expect(page.locator('.cf-profile-masthead-account')).toContainText('2 người thân');
  await page.locator('.cf-relative-card').filter({hasText:'Người thân mới'}).click();
  await expect(page.locator('#dialog-body')).toContainText('Chưa được cấp quyền xem kết quả');
  await page.getByRole('button',{name:'Đặt lịch cho người này'}).click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C1');
  await expect(page.locator('input[name="Người đi khám"][value="p3"]')).toBeChecked();
  expect((await state(page)).profiles.find(p=>p.id==='p3').canViewResults).toBe(false);
  await page.goto('/prototype/#/profile');
  await expect(page.locator('.cf-profile-masthead-account')).toContainText('Nguyễn Minh Anh');
  await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();
  await expect(page.locator('#dialog')).toContainText('Đăng xuất khỏi CareFlow+?');
});

test('support reference FAQ, channels and request history have functional actions and truthful empty states',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/support');
  await expect(page.locator('.rich-faqs details')).toHaveCount(3);
  await page.locator('.rich-faqs summary').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.rich-faqs details').first()).toHaveAttribute('open','');
  await page.getByRole('button',{name:'Xem thêm',exact:true}).click();
  await expect(page.locator('.rich-faqs details')).toHaveCount(5);
  await page.locator('[data-action="support-requests"]').click();
  await expect(page.locator('#dialog-body')).toContainText('Bạn chưa gửi yêu cầu');
  await page.getByRole('button',{name:'Gửi yêu cầu mới'}).click();
  await expect(page.locator('#support')).toBeFocused();
  await page.locator('[data-topic="Thông tin hồ sơ"]').click();
  await expect(page.locator('#supportTopic')).toHaveValue('Thông tin hồ sơ');
  await expect(page.locator('#support')).toBeFocused();
  expect((await state(page)).requests).toHaveLength(0);
  expect((await state(page)).messages).toHaveLength(0);
});
