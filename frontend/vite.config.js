import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
    // Playwright's e2e/*.spec.js files aren't Vitest tests — exclude them.
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
