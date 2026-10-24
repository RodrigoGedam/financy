import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import { localIntegrationEnvironment } from './tests/fixtures/environment'

const env = loadEnv('validation', process.cwd(), '')
localIntegrationEnvironment(env)

export default defineConfig({
	test: {
		include: ['tests/integration/**/*.test.ts'],
		fileParallelism: false,
		maxWorkers: 1,
		testTimeout: 30_000,
		hookTimeout: 60_000,
		env: {
			FINANCY_TEST_TARGET: env.FINANCY_TEST_TARGET!,
			FINANCY_LOCAL_PROJECT_ID: env.FINANCY_LOCAL_PROJECT_ID!,
			FINANCY_DEV_PROJECT_REF: '',
			VITE_SUPABASE_URL: env.VITE_SUPABASE_URL!,
			VITE_SUPABASE_PUBLISHABLE_KEY: env.VITE_SUPABASE_PUBLISHABLE_KEY!,
		},
	},
})
