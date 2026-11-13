const {test,expect}=require('@playwright/test');
const state=page=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('careflow.browser.v3')).state);

test('profile reference uses the account owner and sends an update request without changing identity',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/profile');
  await expect(page.locator('.cf-profile-masthead-account')).toContainText('Nguyễn Minh Anh');
  await expect(page.locator('.rich-profile-details')).toContainText('Not declared');
  const before=(await state(page)).profiles;
  await page.getByRole('button',{name:'View profile',exact:true}).click();
  await expect(page.locator('#dialog')).toBeVisible();
  await expect(page.locator('#dialog-body')).toContainText('15/08/1994');
  await page.getByRole('button',{name:'Request an update',exact:true}).click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','K5');
  await expect(page.locator('#dialog')).not.toBeVisible();
  await expect(page.locator('#supportTopic')).toHaveValue('Profile information');
  await expect(page.locator('#support')).toBeFocused();
  await page.locator('#support').fill('I would like to update my contact phone number.');
  await page.locator('form[data-form="support"] button[type="submit"]').click();
  expect((await state(page)).requests.at(-1)).toMatchObject({topic:'Profile information',status:'waiting'});
  expect((await state(page)).profiles).toEqual(before);
});

test('relative tiles open details, preserve result permissions and select the correct patient for booking',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/profile');
  await page.locator('.cf-relative-add summary').click();
  await page.locator('#name').fill('New family member');
  await page.locator('#dob').fill('2000-01-01');
  await page.locator('form[data-form="relative"] button[type="submit"]').click();
  await expect(page.locator('.cf-profile-masthead-account')).toContainText('2 family members');
  await page.locator('.cf-relative-card').filter({hasText:'New family member'}).click();
  await expect(page.locator('#dialog-body')).toContainText('Not yet allowed to view results');
  await page.getByRole('button',{name:'Book for this person'}).click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','C1');
  await expect(page.locator('input[name="Patient"][value="p3"]')).toBeChecked();
  expect((await state(page)).profiles.find(p=>p.id==='p3').canViewResults).toBe(false);
  await page.goto('/prototype/#/profile');
  await expect(page.locator('.cf-profile-masthead-account')).toContainText('Nguyễn Minh Anh');
  await page.getByRole('button',{name:'Sign out',exact:true}).click();
  await expect(page.locator('#dialog')).toContainText('Sign out of CareFlow+?');
});

test('support reference FAQ, channels and request history have functional actions and truthful empty states',async({page})=>{
  await page.goto('/prototype/?scenario=empty#/support');
  await expect(page.locator('.rich-faqs details')).toHaveCount(3);
  await page.locator('.rich-faqs summary').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.rich-faqs details').first()).toHaveAttribute('open','');
  await page.getByRole('button',{name:'Show more',exact:true}).click();
  await expect(page.locator('.rich-faqs details')).toHaveCount(5);
  // Request history is now its own list (Support → Tickets) with a truthful empty state.
  await page.locator('[data-action="support-requests"]').click();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','T1');
  await expect(page.locator('#phone-content')).toContainText('No open tickets');
  await page.goBack();
  await expect(page.locator('#phone-content')).toHaveAttribute('data-screen','K5');
  await page.locator('[data-topic="Profile information"]').click();
  await expect(page.locator('#supportTopic')).toHaveValue('Profile information');
  await expect(page.locator('#support')).toBeFocused();
  expect((await state(page)).requests).toHaveLength(0);
  expect((await state(page)).messages).toHaveLength(0);
});
