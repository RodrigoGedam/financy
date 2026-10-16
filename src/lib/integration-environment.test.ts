import { expect, it } from 'vitest'
import { integrationEnvironment } from '../../tests/fixtures/environment'

const valid = {
  FINANCY_DEV_PROJECT_REF: 'gorymmpnavtudztnasny',
  VITE_SUPABASE_URL: 'https://gorymmpnavtudztnasny.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
}

it('permite somente o alvo exato de desenvolvimento e uma chave publicável', () => {
  expect(integrationEnvironment(valid).url).toBe(valid.VITE_SUPABASE_URL)
  for (const patch of [
    { FINANCY_DEV_PROJECT_REF: 'bqkmhzrrfurphiikylpa' },
    { VITE_SUPABASE_URL: 'https://bqkmhzrrfurphiikylpa.supabase.co' },
    { VITE_SUPABASE_URL: `${valid.VITE_SUPABASE_URL}.evil.test` },
    { VITE_SUPABASE_URL: `${valid.VITE_SUPABASE_URL}/rest/v1` },
    { VITE_SUPABASE_URL: '' },
    { VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_test' },
    { VITE_SUPABASE_PUBLISHABLE_KEY: '' },
  ]) expect(() => integrationEnvironment({ ...valid, ...patch })).toThrow('financy-dev')
})
