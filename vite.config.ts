import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const API = `http://localhost:${process.env.PORT ?? 3001}`;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    sourcemap: true,
    cssMinify: 'lightningcss',
  },
  css: { transformer: 'lightningcss' },
  server: {
    port: 5173,
    proxy: {
      '/api': API,
      '/data/uploads': API,
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/server/**/*.test.ts', 'tests/**/*.test.ts'],
          env: {
            NODE_ENV: 'test',
            DB_DIALECT: 'sqlite',
            SQLITE_STORAGE: ':memory:',
            SESSION_SECRET: 'test-secret-test-secret-test-secret',
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'client',
          environment: 'jsdom',
          include: ['src/client/**/*.test.tsx'],
          setupFiles: ['src/client/test/setup.ts'],
        },
      },
    ],
  },
});
