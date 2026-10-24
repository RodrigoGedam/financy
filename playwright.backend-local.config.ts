import { defineConfig } from '@playwright/test'
import { loadEnv } from 'vite'
import { localIntegrationEnvironment } from './tests/fixtures/environment'

const env = loadEnv('validation', process.cwd(), '')
localIntegrationEnvironment(env)
const localEnv = {
	FINANCY_TEST_TARGET: env.FINANCY_TEST_TARGET!,
	FINANCY_LOCAL_PROJECT_ID: env.FINANCY_LOCAL_PROJECT_ID!,
	FINANCY_DEV_PROJECT_REF: '',
	VITE_SUPABASE_URL: env.VITE_SUPABASE_URL!,
	VITE_SUPABASE_PUBLISHABLE_KEY: env.VITE_SUPABASE_PUBLISHABLE_KEY!,
}
Object.assign(process.env, localEnv)

export default defineConfig({
	testDir: './tests/e2e',
	testIgnore: 'responsive.spec.ts',
	fullyParallel: false,
	workers: 1,
	expect: { timeout: 30_000 },
	use: {
		baseURL: 'http://127.0.0.1:5173',
		viewport: { width: 1440, height: 1000 },
		trace: 'retain-on-failure',
	},
	webServer: {
		command: 'pnpm dev --mode validation --port 5173 --strictPort',
		url: 'http://127.0.0.1:5173',
		reuseExistingServer: false,
		env: localEnv,
	},
})
