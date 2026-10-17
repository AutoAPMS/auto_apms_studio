import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolveVersionInfo } from './versionInfo.js'

// https://vite.dev/config/
export default defineConfig({
  base: '/auto_apms_studio/',
  define: {
    __APP_VERSION__: JSON.stringify(resolveVersionInfo()),
  },
  plugins: [
      tailwindcss(),
      react()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/health': { target: 'http://localhost:8000', changeOrigin: true }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/**/*.js'],
      exclude: [
        'constants.js',
        'node_modules/',
        'src/tests/**',
        '**/*.test.js',
        '**/*.spec.js',
        '**/test/**',
        '**/__tests__/**',
        '**/coverage/**',
        '*.config.js',
      ],

      all: true,
    }
  }
})
