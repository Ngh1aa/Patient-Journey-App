const path=require('node:path');
const {defineConfig}=require('../prototype/node_modules/@playwright/test');
module.exports=defineConfig({
  outputDir:path.join(__dirname,'test-results'),testDir:__dirname,testMatch:'browser.spec.cjs',fullyParallel:true,
  timeout:25000,retries:0,workers:2,reporter:'list',
  use:{baseURL:'http://127.0.0.1:4175',trace:'retain-on-failure',screenshot:'only-on-failure'},
  projects:[{name:'chromium-1440',use:{browserName:'chromium',viewport:{width:1440,height:900}}},{name:'chromium-1280',use:{browserName:'chromium',viewport:{width:1280,height:800}}}],
  webServer:{command:'node prototype/preview-server.cjs',cwd:path.resolve(__dirname,'..'),url:'http://127.0.0.1:4175/staff-prototype/index.html',reuseExistingServer:!process.env.CI,timeout:30000}
});
