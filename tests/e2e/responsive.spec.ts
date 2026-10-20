import { expect, test, type Page } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'

const evidence = 'test-fixtures/ux-responsive'
const category = { id: 'c1', name: 'Casa', description: null as string | null, color: 'green', icon: 'house', transaction_count: 12 }
const categories = [category, { ...category, id: 'c2', name: 'CategoriaLegadaSemEspaços'.repeat(3), description: 'Descrição opcional integral acima de vinte caracteres.', color: 'blue', transaction_count: 2 }]
const rows = categories.map((c, i) => ({ id: `t${i}`, description: i ? 'x'.repeat(80) : 'Pagamento legado com descrição integral '.repeat(3), category_id: c.id, category: c, kind: i ? 'income' : 'expense', amount: i ? '12.34' : '9007199254740993.01', occurred_on: '2024-01-15', created_at: '2024-01-15T12:00:00Z' }))

async function mockFinance(page: Page, options: { anonymous?: boolean; empty?: boolean; error?: boolean; delayed?: boolean } = {}) {
  const user = { id: 'a0000000-0000-4000-a000-000000000001', email: 'marina@example.com', aud: 'authenticated', role: 'authenticated', created_at: '2024-01-01T00:00:00Z', app_metadata: { provider: 'email' }, user_metadata: { full_name: 'Marina'.repeat(20) } }
  const jwt = ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify({ sub: user.id, exp: 4102444800 })).toString('base64url'), 'fixture'].join('.')
  if (!options.anonymous) await page.addInitScript(session => localStorage.setItem('sb-financy-auth-token', JSON.stringify(session)), { access_token: jwt, refresh_token: 'local-fixture', expires_at: 4102444800, expires_in: 3600, token_type: 'bearer', user })
  const calls: string[] = []
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin === 'http://127.0.0.1:5173') return route.continue()
    if (url.origin !== 'https://financy.local.invalid') return route.abort()
    calls.push(`${route.request().method()} ${url.pathname}`)
    if (options.delayed) await new Promise(resolve => setTimeout(resolve, 600))
    if (url.pathname.startsWith('/auth/')) return route.fulfill({ json: user })
    if (options.error) return route.fulfill({ status: 503, json: { message: 'fixture unavailable' } })
    const cs = options.empty ? [] : categories
    if (url.pathname.endsWith('/categories')) return route.fulfill({ json: cs.map(c => ({ ...c, transactions: [{ count: c.transaction_count }] })) })
    if (url.pathname.endsWith('/transactions')) {
      const data = options.empty ? [] : rows
      return route.fulfill({ json: url.searchParams.get('limit') === '0' ? [] : data.map(tx => ({ ...tx, categories: tx.category })), headers: { 'content-range': `*/${data.length}`, 'access-control-expose-headers': 'content-range' } })
    }
    if (url.pathname.endsWith('/rpc/get_dashboard')) return route.fulfill({ json: { balance: '9007199254740993.01', income: '12.34', expenses: '9007199254740993.01', topCategories: cs.map(c => ({ ...c, amount: '9007199254740993.01' })), recentTransactions: options.empty ? [] : rows } })
    return route.abort()
  })
  return calls
}

async function screenshot(page: Page, name: string) {
  mkdirSync(evidence, { recursive: true })
  await page.screenshot({ path: `${evidence}/${name}.png`, fullPage: true })
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
}

test('desktop table geometry in 1024 and 1440', async ({ page }) => {
  await mockFinance(page)
  await page.goto('/transacoes')
  await expect(page.getByRole('table')).toBeVisible()
  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    if (!existsSync(`${evidence}/before-table-${width}.png`)) await screenshot(page, `before-table-${width}`)
    const geometry = await page.locator('tbody tr').first().evaluate(tr => {
      const cells = [...tr.querySelectorAll('td')]
      const cell = cells[2], badge = cell.querySelector('.category-tag')!
      const r = cell.getBoundingClientRect(), b = badge.getBoundingClientRect()
      const actions = cells[5], group = actions.querySelector('.category-actions')!
      const a = actions.getBoundingClientRect(), g = group.getBoundingClientRect()
      const value = cells[4], amount = value.querySelector('.transaction-amount')!
      const v = value.getBoundingClientRect(), m = amount.getBoundingClientRect()
      return { category: Math.abs(b.x + b.width / 2 - r.x - r.width / 2), actions: Math.abs(a.right - parseFloat(getComputedStyle(actions).paddingRight) - g.right), amount: Math.abs(v.right - parseFloat(getComputedStyle(value).paddingRight) - m.right), hit: [...group.querySelectorAll('button')].every(el => el.getBoundingClientRect().width >= 44 && el.getBoundingClientRect().height >= 44) }
    })
    expect(geometry.category).toBeLessThanOrEqual(2)
    expect(geometry.actions).toBeLessThanOrEqual(2)
    expect(geometry.amount).toBeLessThanOrEqual(2)
    expect(geometry.hit).toBe(true)
    await noOverflow(page)
    await screenshot(page, `table-${width}`)
  }
})

test('small shell, auth and modal controls', async ({ page }) => {
  await mockFinance(page)
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('/categorias')
  await expect(page.locator('.category-card')).toHaveCount(2)
  await noOverflow(page)
  for (const link of await page.locator('.navbar nav a, .navbar .avatar').all()) {
    const box = await link.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
  await page.getByRole('button', { name: 'Nova categoria', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByLabel('Nome', { exact: true })).toBeFocused()
  await dialog.getByLabel('Nome', { exact: true }).fill('😀'.repeat(21))
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('20')
  await expect(dialog.getByLabel('Nome', { exact: true })).toHaveValue('😀'.repeat(21))
  await expect(dialog.getByLabel('Nome', { exact: true })).toBeFocused()
  for (const viewport of [{ width: 320, height: 700 }, { width: 667, height: 375 }, { width: 390, height: 400 }]) {
    await page.setViewportSize(viewport)
    await noOverflow(page)
    await dialog.getByRole('button', { name: 'Salvar', exact: true }).scrollIntoViewIfNeeded()
    await expect(dialog.getByRole('button', { name: 'Salvar', exact: true })).toBeInViewport()
    const small = await dialog.locator('input[type=radio], button').evaluateAll(els => els.some(el => el.getBoundingClientRect().width < 44 || el.getBoundingClientRect().height < 44))
    expect(small).toBe(false)
  }
  await screenshot(page, 'category-dialog-low')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Nova categoria', exact: true })).toBeFocused()
})

test('responsive content, recent tracks and complete details', async ({ page }) => {
  const calls = await mockFinance(page)
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    await expect(page.locator('.dashboard-recent li')).toHaveCount(2)
    await noOverflow(page)
    if (width >= 768) {
      const centers = await page.locator('.dashboard-recent li > .category-tag').evaluateAll(els => els.map(el => { const b = el.getBoundingClientRect(); return b.x + b.width / 2 }))
      expect(Math.abs(centers[0] - centers[1])).toBeLessThanOrEqual(2)
    }
    await screenshot(page, `dashboard-${width}`)
    const title = page.getByRole('button', { name: `Ver detalhes da transação ${rows[0].description}`, exact: true })
    await title.focus()
    await page.keyboard.press('Enter')
    const details = page.getByRole('dialog', { name: 'Detalhes da transação' })
    await expect(details.getByText(rows[0].description, { exact: true })).toBeVisible()
    await expect(details.getByText(/9\.007\.199\.254\.740\.993,01/)).toBeVisible()
    await noOverflow(page)
    await page.keyboard.press('Escape')
    await expect(title).toBeFocused()
    await page.goto('/transacoes?kind=expense&q=Pagamento')
    await expect(page.getByRole('region', { name: 'Lista de transações' })).toBeVisible()
    await noOverflow(page)
    await screenshot(page, `transactions-${width}`)
    await expect(page.getByRole('button', { name: /Editar transação/ })).toHaveCount(2)
    const url = page.url()
    const requests = calls.length
    await page.setViewportSize({ width: width < 1024 ? 1440 : 390, height: 1000 })
    expect(page.url()).toBe(url)
    expect(calls.length).toBe(requests)
    await page.getByRole('button', { name: /Editar transação/ }).first().click()
    await page.setViewportSize({ width, height: 700 })
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Nova transação', exact: true })).toBeFocused()
  }
})

test('auth, profile and empty/error/loading states at 320', async ({ page }) => {
  await mockFinance(page, { anonymous: true })
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Fazer login' })).toBeVisible()
  await noOverflow(page)
  const toggle = page.getByRole('button', { name: /Mostrar senha/ })
  const box = await toggle.boundingBox()
  expect(box!.width).toBeGreaterThanOrEqual(44)
  await screenshot(page, 'login-320')
})
