const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './browser-tests',
  testMatch: '*.spec.cjs',
  timeout: 90000,
  expect: { timeout: 6000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4175',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 8000,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  },
  projects: [
    { name: 'Chromium', use: { browserName: 'chromium' } },
    { name: 'WebKit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'node preview-server.cjs',
    url: 'http://127.0.0.1:4175/prototype/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  outputDir: 'test-results',
});
