export function integrationEnvironment(env: Record<string, string | undefined>) {
  const ref = 'gorymmpnavtudztnasny'
  if (env.FINANCY_DEV_PROJECT_REF !== ref || env.VITE_SUPABASE_URL !== `https://${ref}.supabase.co`
    || !env.VITE_SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_')) {
    throw new Error('Integração exige a URL exata e chave publicável de financy-dev. Nenhuma escrita foi autorizada.')
  }
  return { url: env.VITE_SUPABASE_URL, key: env.VITE_SUPABASE_PUBLISHABLE_KEY }
}

export function localIntegrationEnvironment(env: Record<string, string | undefined>) {
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY
  let publicKey = !!key?.startsWith('sb_publishable_') && key.length > 'sb_publishable_'.length
  if (key && !publicKey) {
    try {
      const parts = key.split('.')
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
      publicKey = parts.length === 3 && !!parts[2] && header.alg === 'HS256' && payload.role === 'anon'
    } catch { publicKey = false }
  }
  if (env.FINANCY_TEST_TARGET !== 'local'
    || !/^financy-ux-premerge-[0-9a-f]{8}$/.test(env.FINANCY_LOCAL_PROJECT_ID ?? '')
    || env.FINANCY_DEV_PROJECT_REF
    || env.VITE_SUPABASE_URL !== 'http://127.0.0.1:55321'
    || !publicKey) {
    throw new Error('Integração local exige modo local, projeto descartável, URL exata e chave pública local. Nenhuma escrita foi autorizada.')
  }
  return { url: env.VITE_SUPABASE_URL, key: key!, projectRef: env.FINANCY_LOCAL_PROJECT_ID!, storageKey: 'sb-127-auth-token' }
}

export function getFinanceTestEnvironment(env: Record<string, string | undefined>) {
  if (env.FINANCY_TEST_TARGET === 'local') return localIntegrationEnvironment(env)
  if (env.FINANCY_TEST_TARGET || env.FINANCY_LOCAL_PROJECT_ID) throw new Error('Alvo de integração local/remoto ambíguo.')
  return { ...integrationEnvironment(env), projectRef: 'gorymmpnavtudztnasny', storageKey: 'sb-gorymmpnavtudztnasny-auth-token' }
}
