import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4317);

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // Set PLAYWRIGHT_CHANNEL=chrome to use an installed Chrome instead of `npx playwright install`.
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npm run seed && npm start',
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      PORT: String(PORT),
      NODE_ENV: 'production',
      SESSION_SECRET: 'e2e-only-secret-e2e-only-secret',
      DB_DIALECT: 'sqlite',
      SQLITE_STORAGE: '.data/e2e.sqlite',
      UPLOAD_DIR: '.data/e2e-uploads',
    },
  },
});
