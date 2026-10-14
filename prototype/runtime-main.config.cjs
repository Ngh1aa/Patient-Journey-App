const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'./browser-tests',
  testMatch:'runtime-main.spec.cjs',
  timeout:30000,
  expect:{timeout:7000},
  fullyParallel:false,
  retries:process.env.CI?1:0,
  workers:process.env.CI?2:1,
  reporter:process.env.CI?[['list'],['html',{open:'never',outputFolder:'runtime-playwright-report'}]]:'list',
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure'},
  projects:[
    {name:'Desktop Chrome 1680',use:{...devices['Desktop Chrome'],viewport:{width:1680,height:900}}},
    {name:'Mobile Chromium',use:{...devices['Pixel 7'],browserName:'chromium'}},
    {name:'Mobile WebKit',use:{...devices['iPhone 13'],browserName:'webkit'}}
  ],
  webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1',url:'http://127.0.0.1:4173/index.html',reuseExistingServer:!process.env.CI,timeout:30000},
  outputDir:'runtime-test-results'
});
