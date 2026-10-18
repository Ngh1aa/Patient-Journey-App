const path=require('node:path');
const {defineConfig}=require('../prototype/node_modules/@playwright/test');
const previewPort=Number(process.env.PORT||4175);
module.exports=defineConfig({
  outputDir:path.join(__dirname,'test-results'),testDir:__dirname,testMatch:['doctor.spec.cjs','doctor-cards.spec.cjs'],fullyParallel:true,
  timeout:25000,retries:0,workers:2,reporter:'list',
  use:{baseURL:'http://127.0.0.1:'+previewPort,trace:'retain-on-failure',screenshot:'only-on-failure'},
  projects:[{name:'chromium-1440',use:{browserName:'chromium',viewport:{width:1440,height:900}}},{name:'chromium-1280',use:{browserName:'chromium',viewport:{width:1280,height:800}}},{name:'chromium-1920',use:{browserName:'chromium',viewport:{width:1920,height:1080}}},{name:'webkit-1440',use:{browserName:'webkit',viewport:{width:1440,height:900}}}],
  webServer:{command:'node prototype/preview-server.cjs',cwd:path.resolve(__dirname,'..'),url:'http://127.0.0.1:'+previewPort+'/staff-prototype/index.html',reuseExistingServer:!process.env.CI,timeout:30000}
});
