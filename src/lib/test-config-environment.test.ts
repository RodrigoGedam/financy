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

for (const config of ['../../vitest.integration.local.config', '../../vitest.migration.local.config', '../../playwright.backend-local.config']) {
  it(`${config} recusa produção antes de iniciar servidor ou fixtures`, async () => {
    vi.stubEnv('FINANCY_TEST_TARGET', 'local')
    vi.stubEnv('FINANCY_LOCAL_PROJECT_ID', 'financy-ux-premerge-1234abcd')
    vi.stubEnv('VITE_SUPABASE_URL', 'https://bqkmhzrrfurphiikylpa.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
    await expect(import(/* @vite-ignore */ config)).rejects.toThrow('Integração local exige')
  })
}

it('configurações locais propagam somente o alvo validado e separam ensaio de integração', async () => {
  vi.stubEnv('FINANCY_TEST_TARGET', 'local')
  vi.stubEnv('FINANCY_DEV_PROJECT_REF', '')
  vi.stubEnv('FINANCY_LOCAL_PROJECT_ID', 'financy-ux-premerge-1234abcd')
  vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:55321')
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_local')
  const integration = (await import('../../vitest.integration.local.config')).default
  const migration = (await import('../../vitest.migration.local.config')).default
  const browser = (await import('../../playwright.backend-local.config')).default
  expect(integration.test?.include).toEqual(['tests/integration/**/*.test.ts'])
  expect(migration.test?.include).toEqual(['tests/migrations/**/*.local.test.ts'])
  expect(integration.test?.env?.VITE_SUPABASE_URL).toBe('http://127.0.0.1:55321')
  expect(browser.webServer).toMatchObject({ reuseExistingServer: false, env: { VITE_SUPABASE_URL: 'http://127.0.0.1:55321' } })
})
