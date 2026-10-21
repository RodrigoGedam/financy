import { defineConfig } from 'vitest/config'
import integration from './vitest.integration.local.config'

export default defineConfig({
  ...integration,
  test: {
    ...integration.test,
    include: ['tests/migrations/**/*.local.test.ts'],
    testTimeout: 180_000,
    env: { ...integration.test?.env, FINANCY_LOCAL_WORKDIR: process.env.FINANCY_LOCAL_WORKDIR ?? '' },
  },
})
