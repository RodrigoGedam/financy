import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
	vi.unstubAllEnvs()
	vi.resetModules()
})
for (const config of ['playwright', 'integration'] as const) {
	it(`${config} recusa produção ao carregar a configuração, antes de iniciar servidor ou fixtures`, async () => {
		vi.stubEnv('FINANCY_DEV_PROJECT_REF', 'bqkmhzrrfurphiikylpa')
		vi.stubEnv(
			'VITE_SUPABASE_URL',
			'https://bqkmhzrrfurphiikylpa.supabase.co',
		)
		vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
		if (config === 'playwright')
			await expect(import('../../playwright.config')).rejects.toThrow(
				'financy-dev',
			)
		else
			await expect(
				import('../../vitest.integration.config'),
			).rejects.toThrow('financy-dev')
	})
}
