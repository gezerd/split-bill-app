import { defineConfig } from '@playwright/test';

// e2e runs its own mock-OCR backend and Vite server on dedicated ports so it
// never reuses (and spends real API credits through) a running dev session.
const BACKEND_PORT = 8001;
const FRONTEND_PORT = 5174;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: `uv run --directory ../backend uvicorn app.main:app --port ${BACKEND_PORT}`,
      url: `http://localhost:${BACKEND_PORT}/health`,
      env: {
        MOCK_OCR: 'true',
        CORS_ORIGINS: `http://localhost:${FRONTEND_PORT}`,
      },
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: `npm run dev -- --port ${FRONTEND_PORT} --strictPort`,
      url: `http://localhost:${FRONTEND_PORT}`,
      env: {
        VITE_API_URL: `http://localhost:${BACKEND_PORT}`,
      },
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});
