import { defineConfig } from '@playwright/test'

// Suite de apresentação: domínio reservado inválido e todas as respostas interceptadas.
// O guard e as suítes reais de integração permanecem em playwright.config.ts.
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'responsive.spec.ts',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:5173', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  webServer: {
    command: 'pnpm dev --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: false,
    env: { VITE_SUPABASE_URL: 'https://financy.local.invalid', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_ui_fixture' },
  },
})
