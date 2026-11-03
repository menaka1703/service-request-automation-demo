import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests sequentially for deterministic database operations
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Deterministic sequential execution across the single test database
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'node --import tsx server/src/index.ts',
      url: 'http://localhost:5000/api/health',
      timeout: 45000,
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: '5000',
        USE_TEST_DB: 'true',
      },
    },
    {
      command: 'npx vite --port 3000',
      url: 'http://localhost:3000',
      timeout: 45000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
