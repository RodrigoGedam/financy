import { defineConfig } from '@playwright/test'
import { loadEnv } from 'vite'
import { integrationEnvironment } from './tests/fixtures/environment'

const env = loadEnv('test', process.cwd(), '')
integrationEnvironment(env)
Object.assign(process.env, env)

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: false,
	workers: 1,
	use: {
		baseURL: 'http://127.0.0.1:5173',
		viewport: { width: 1440, height: 1000 },
		trace: 'retain-on-failure',
	},
	webServer: {
		command: 'pnpm dev --port 5173 --strictPort',
		url: 'http://127.0.0.1:5173',
		reuseExistingServer: false,
	},
})
