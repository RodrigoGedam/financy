import { dirname, join, resolve } from 'node:path'
import { expect, it } from 'vitest'
import { integrationEnvironment, localIntegrationEnvironment, getFinanceTestEnvironment, assertLocalRuntimeDirectory } from '../../tests/fixtures/environment'

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

const local = {
  FINANCY_TEST_TARGET: 'local',
  FINANCY_LOCAL_PROJECT_ID: 'financy-ux-premerge-1234abcd',
  VITE_SUPABASE_URL: 'http://127.0.0.1:55321',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_local',
}
const jwt = (role: string) => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`

it('local exige modo explícito, identidade descartável, URL exata e chave pública', () => {
  expect(localIntegrationEnvironment(local)).toEqual({ url: local.VITE_SUPABASE_URL, key: local.VITE_SUPABASE_PUBLISHABLE_KEY, projectRef: local.FINANCY_LOCAL_PROJECT_ID, storageKey: 'sb-127-auth-token' })
  expect(localIntegrationEnvironment({ ...local, VITE_SUPABASE_PUBLISHABLE_KEY: jwt('anon') }).key).toBe(jwt('anon'))
  for (const patch of [
    { FINANCY_TEST_TARGET: undefined }, { FINANCY_TEST_TARGET: 'remote' },
    { FINANCY_LOCAL_PROJECT_ID: '' }, { FINANCY_LOCAL_PROJECT_ID: 'financy' },
    { FINANCY_DEV_PROJECT_REF: 'gorymmpnavtudztnasny' },
    ...['http://localhost:55321', 'http://127.0.0.1:54321', 'http://127.0.0.1:55321/', 'http://127.0.0.1:55321?x=1', 'http://127.0.0.1.evil:55321', valid.VITE_SUPABASE_URL, 'https://bqkmhzrrfurphiikylpa.supabase.co'].map(VITE_SUPABASE_URL => ({ VITE_SUPABASE_URL })),
    ...['', 'sb_secret_local', jwt('service_role'), 'bad.jwt.value', 'a.e30.c', 'a.W10.c'].map(VITE_SUPABASE_PUBLISHABLE_KEY => ({ VITE_SUPABASE_PUBLISHABLE_KEY })),
  ]) expect(() => localIntegrationEnvironment({ ...local, ...patch })).toThrow('local')
})

it('seletor não recua de um alvo local inválido para o remoto', () => {
  expect(getFinanceTestEnvironment(local).storageKey).toBe('sb-127-auth-token')
  expect(getFinanceTestEnvironment(valid).storageKey).toBe('sb-gorymmpnavtudztnasny-auth-token')
  expect(() => getFinanceTestEnvironment({ ...valid, FINANCY_TEST_TARGET: 'local' })).toThrow('local')
  expect(() => getFinanceTestEnvironment({ ...valid, FINANCY_TEST_TARGET: 'unknown' })).toThrow()
  expect(() => getFinanceTestEnvironment({ ...valid, FINANCY_LOCAL_PROJECT_ID: local.FINANCY_LOCAL_PROJECT_ID })).toThrow()
})

it('confina o runtime a um descendente real da raiz do ensaio, recusando a pasta pai exata', () => {
  const root = resolve('test-fixtures/ux-premerge')
  for (const workdir of [root, dirname(root), dirname(dirname(root)), join(dirname(root), 'another-runtime')]) {
    expect(() => assertLocalRuntimeDirectory(root, workdir), workdir).toThrow('Runtime local não pertence a este ensaio.')
  }
  for (const workdir of [join(root, 'runtime'), join(root, 'runtime', 'nested'), join(root, '..runtime')]) {
    expect(() => assertLocalRuntimeDirectory(root, workdir), workdir).not.toThrow()
  }
  if (process.platform === 'win32') {
    const otherDrive = root.startsWith('C:') ? 'D:' : 'C:'
    expect(() => assertLocalRuntimeDirectory(root, `${otherDrive}\\outside-runtime`)).toThrow('Runtime local não pertence a este ensaio.')
  }
})
