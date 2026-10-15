import { expect, test } from '@playwright/test'

test('acesso mostra formulário e navega para cadastro', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Fazer login' })).toBeVisible()
  await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Criar conta' }).click()
  await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible()
  await page.getByLabel('Nome completo').fill('Pessoa de teste')
  await page.getByLabel('E-mail', { exact: true }).fill('teste@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('1234567')
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click()
  await expect(page.getByText('Use pelo menos 8 caracteres.')).toBeVisible()
})

test('rota privada sem sessão retorna ao login', async ({ page }) => {
  await page.goto('/perfil')
  await expect(page.getByRole('heading', { name: 'Fazer login' })).toBeVisible()
  await expect(page).toHaveURL(/\/login/)
})

test('falha de rede preserva os campos e não acusa credenciais inválidas', async ({ page }) => {
  await page.route('**/auth/v1/token*', route => route.abort('internetdisconnected'))
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill('conexao@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('SenhaDeTeste123')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Verifique sua conexão', { timeout: 20_000 })
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('conexao@example.com')
  await expect(page.getByLabel('Senha', { exact: true })).toHaveValue('SenhaDeTeste123')
})

for (const width of [1024, 1440]) {
  test(`login acessível por teclado e sem rolagem horizontal em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Fazer login' })).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('E-mail', { exact: true })).toBeFocused()
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width)
    await page.screenshot({ path: `test-results/login-${width}.png`, fullPage: true })
  })
}
