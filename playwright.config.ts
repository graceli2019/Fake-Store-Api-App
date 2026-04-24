import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: process.env.API_BASE_URL || 'https://fakestoreapi.com',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },

  projects: [
    {
      name: 'Fake Store API',
    },
  ],
});
