export function integrationEnvironment(env: Record<string, string | undefined>) {
  const ref = 'gorymmpnavtudztnasny'
  if (env.FINANCY_DEV_PROJECT_REF !== ref || env.VITE_SUPABASE_URL !== `https://${ref}.supabase.co`
    || !env.VITE_SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_')) {
    throw new Error('Integração exige a URL exata e chave publicável de financy-dev. Nenhuma escrita foi autorizada.')
  }
  return { url: env.VITE_SUPABASE_URL, key: env.VITE_SUPABASE_PUBLISHABLE_KEY }
}
