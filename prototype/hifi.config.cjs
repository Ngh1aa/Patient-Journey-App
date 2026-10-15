const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'.',testMatch:'hifi-tests.spec.cjs',timeout:30000,expect:{timeout:5000},
 fullyParallel:false,retries:process.env.CI?1:0,workers:process.env.CI?2:undefined,
 reporter:process.env.CI?[['list'],['html',{open:'never',outputFolder:'hifi-playwright-report'}]]:'list',
 projects:[
  {name:'HiFi Android Chrome',use:{...devices['Pixel 7'],browserName:'chromium'}},
  {name:'HiFi iOS WebKit',use:{...devices['iPhone 13'],browserName:'webkit'}}
 ],
 use:{baseURL:'http://127.0.0.1:4174/hifi/index.html',screenshot:'only-on-failure',trace:'retain-on-failure'},
 webServer:{command:'python3 -m http.server 4174 --bind 127.0.0.1 --directory ..',url:'http://127.0.0.1:4174/hifi/index.html',reuseExistingServer:!process.env.CI,timeout:30000},
 outputDir:'hifi-test-results'
});
