import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173/',
    reuseExistingServer: true,
    timeout: 30_000
  },
  use: {
    baseURL: 'http://127.0.0.1:5173/',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } }
    },
    {
      name: 'mobile-320',
      use: { browserName: 'chromium', viewport: { width: 320, height: 640 }, isMobile: true }
    }
  ]
});
