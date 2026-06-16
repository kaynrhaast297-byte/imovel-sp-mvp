import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'coverage', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      include: [
        'app/admin/page.tsx',
        'app/ai/page.tsx',
        'app/api/admin/session/route.ts',
        'app/api/admin/geocode/route.ts',
        'app/api/admin/property-images/route.ts',
        'app/api/ai/route.ts',
        'app/api/analise/route.ts',
        'app/api/imoveis/route.ts',
        'app/api/imoveis/[id]/route.ts',
        'app/api/leads/route.ts',
        'components/*.tsx',
        'lib/api-response.ts',
        'lib/admin-auth.ts',
        'lib/geocoding.ts',
        'lib/property-images.ts',
        'lib/rate-limit.ts',
        'lib/supabase.ts',
        'lib/utils.ts',
        'lib/validation.ts',
      ],
      thresholds: {
        statements: 96,
        lines: 98,
        functions: 98,
        branches: 90,
      },
      exclude: [
        'app/**/layout.tsx',
        'lib/types.ts',
        'vitest.config.ts',
        'vitest.setup.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
    },
  },
})
