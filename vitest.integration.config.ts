import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

const env = loadEnv('test', process.cwd(), '')

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 30_000,
    hookTimeout: 60_000,
    env: {
      VITE_SUPABASE_URL: env.VITE_SUPABASE_URL ?? '',
      VITE_SUPABASE_PUBLISHABLE_KEY: env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
      FINANCY_DEV_PROJECT_REF: env.FINANCY_DEV_PROJECT_REF ?? '',
    },
  },
})
