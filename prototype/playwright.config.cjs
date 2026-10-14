const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'./browser-tests',
  timeout:30000,
  expect:{timeout:5000},
  fullyParallel:false,
  forbidOnly:!!process.env.CI,
  retries:process.env.CI?1:0,
  workers:process.env.CI?2:undefined,
  reporter:process.env.CI?[['list'],['html',{open:'never'}]]:'list',
  use:{
    baseURL:'http://127.0.0.1:4173',
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
    actionTimeout:10000
  },
  projects:[
    {name:'Android-like Chrome',use:{...devices['Pixel 7'],browserName:'chromium'}},
    {name:'iOS-like WebKit',use:{...devices['iPhone 13'],browserName:'webkit'}}
  ],
  webServer:{
    command:'python3 -m http.server 4173 --bind 127.0.0.1',
    url:'http://127.0.0.1:4173/index.html',
    reuseExistingServer:!process.env.CI,
    timeout:30000
  },
  outputDir:'test-results',
  snapshotPathTemplate:'{testDir}/__screenshots__/{projectName}/{arg}{ext}'
});
