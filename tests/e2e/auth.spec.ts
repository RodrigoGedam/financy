import { expect, test } from '@playwright/test'

test.beforeEach(() => {
  const ref = process.env.FINANCY_DEV_PROJECT_REF
  const url = process.env.VITE_SUPABASE_URL
  if (!ref || ref !== 'gorymmpnavtudztnasny' || !url || new URL(url).hostname !== `${ref}.supabase.co`) {
    throw new Error('Testes de escrita exigem o projeto Financy de desenvolvimento conferido em .env.test.local.')
  }
})

test('Supabase recusa senha de sete caracteres por API direta', async ({ request }) => {
  const response = await request.post(`${process.env.VITE_SUPABASE_URL}/auth/v1/signup`, {
    headers: { apikey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY! },
    data: { email: `financy-short-${Date.now()}@example.com`, password: '1234567' },
  })
  expect(response.status()).toBe(422)
  expect((await response.json()).error_code).toBe('weak_password')
})

test('conta real: cadastro imediato, perfil, persistência, logout e segunda conta', async ({ page, browser }) => {
  test.setTimeout(90_000)
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const email = `financy-e2e-${suffix}@example.com`
  const password = `Financy-${suffix}-teste!`
  await page.goto('/cadastro')
  await page.getByLabel('Nome completo').fill('Alice Financy')
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Meu perfil' })).toBeVisible({ timeout: 20_000 })
  await page.getByRole('link', { name: 'Meu perfil' }).click()
  await page.getByLabel('Nome completo').fill('Alice Atualizada')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('status')).toHaveText('Nome atualizado.')
  await expect(page.getByRole('heading', { name: 'Alice Atualizada' })).toBeVisible()
  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width)
    await page.screenshot({ path: `test-results/profile-${width}.png`, fullPage: true })
  }
  const saved = await page.context().storageState()
  const persistent = await browser.newContext({ storageState: saved })
  const restored = await persistent.newPage()
  await restored.goto('/perfil')
  await expect(restored.getByRole('heading', { name: 'Alice Atualizada' })).toBeVisible()
  await persistent.close()
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible()
  await page.goto('/perfil')
  await expect(page).toHaveURL(/\/login/)
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await page.getByRole('link', { name: 'Meu perfil' }).click()
  await expect(page.getByRole('heading', { name: 'Alice Atualizada' })).toBeVisible()
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await page.goto('/cadastro')
  await page.getByLabel('Nome completo').fill('Bob Financy')
  await page.getByLabel('E-mail', { exact: true }).fill(`financy-e2e-bob-${suffix}@example.com`)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click()
  await page.getByRole('link', { name: 'Meu perfil' }).click()
  await expect(page.getByRole('heading', { name: 'Bob Financy' })).toBeVisible()
  await expect(page.getByText('Alice Atualizada')).toHaveCount(0)
  await page.getByRole('button', { name: 'Sair da conta' }).click()
})
