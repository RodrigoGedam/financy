import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const evidence = 'test-fixtures/ux-responsive'
const category = { id: 'c1', name: 'Casa', description: null as string | null, color: 'green', icon: 'house', transaction_count: 12 }
const categories = [category, { ...category, id: 'c2', name: 'CategoriaLegadaSemEspaços'.repeat(3), description: 'Descrição opcional integral acima de vinte caracteres.', color: 'blue', transaction_count: 2 }]
const rows = categories.map((c, i) => ({ id: `t${i}`, description: i ? 'x'.repeat(80) : 'Pagamento legado com descrição integral '.repeat(3), category_id: c.id, category: c, kind: i ? 'income' : 'expense', amount: i ? '12.34' : '9007199254740993.01', occurred_on: '2024-01-15', created_at: '2024-01-15T12:00:00Z' }))

async function mockFinance(page: Page, options: { anonymous?: boolean; empty?: boolean; error?: boolean; delayed?: boolean } = {}) {
  const user = { id: 'a0000000-0000-4000-a000-000000000001', email: 'marina@example.com', aud: 'authenticated', role: 'authenticated', created_at: '2024-01-01T00:00:00Z', app_metadata: { provider: 'email' }, user_metadata: { full_name: 'Marina'.repeat(20) } }
  const jwt = ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify({ sub: user.id, exp: 4102444800 })).toString('base64url'), 'fixture'].join('.')
  if (!options.anonymous) await page.addInitScript(session => localStorage.setItem('sb-financy-auth-token', JSON.stringify(session)), { access_token: jwt, refresh_token: 'local-fixture', expires_at: 4102444800, expires_in: 3600, token_type: 'bearer', user })
  const calls: string[] = []
  let cs = options.empty ? [] : categories.map(c => ({ ...c }))
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin === 'http://127.0.0.1:5173') return route.continue()
    if (url.origin !== 'https://financy.local.invalid') return route.abort()
    calls.push(`${route.request().method()} ${url.pathname}`)
    if (options.delayed) await new Promise(resolve => setTimeout(resolve, 600))
    if (url.pathname.startsWith('/auth/')) return route.fulfill({ json: user })
    if (options.error) return route.fulfill({ status: 400, json: { code: 'fixture_error', message: 'fixture unavailable' } })
    if (url.pathname.endsWith('/categories')) {
      const method = route.request().method()
      const id = url.searchParams.get('id')?.replace(/^eq\./, '')
      if (method === 'POST') {
        const saved = { ...category, ...route.request().postDataJSON(), id: `c${cs.length + 1}`, transaction_count: 0 }
        cs.push(saved)
        return route.fulfill({ status: 201, json: saved })
      }
      if (method === 'PATCH') {
        cs = cs.map(c => c.id === id ? { ...c, ...route.request().postDataJSON() } : c)
        return route.fulfill({ json: cs.find(c => c.id === id) })
      }
      return route.fulfill({ json: cs.map(c => ({ ...c, transactions: [{ count: c.transaction_count }] })) })
    }
    if (url.pathname.endsWith('/transactions')) {
      const data = options.empty ? [] : rows
      return route.fulfill({ json: url.searchParams.get('limit') === '0' ? [] : data.map(tx => ({ ...tx, categories: cs.find(c => c.id === tx.category_id) ?? tx.category })), headers: { 'content-range': `*/${data.length}`, 'access-control-expose-headers': 'content-range' } })
    }
    if (url.pathname.endsWith('/rpc/get_dashboard')) return route.fulfill({ json: { balance: '9007199254740993.01', income: '12.34', expenses: '9007199254740993.01', topCategories: cs.filter(c => c.transaction_count > 0).map(c => ({ ...c, amount: '9007199254740993.01' })), recentTransactions: options.empty ? [] : rows.map(tx => ({ ...tx, category: cs.find(c => c.id === tx.category_id) ?? tx.category })) } })
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
    const geometries = await page.locator('tbody tr').evaluateAll(trs => trs.map(tr => {
      const cells = [...tr.querySelectorAll('td')]
      const cell = cells[2], badge = cell.querySelector('.category-tag')!
      const r = cell.getBoundingClientRect(), b = badge.getBoundingClientRect()
      const actions = cells[5], group = actions.querySelector('.category-actions')!
      const a = actions.getBoundingClientRect(), g = group.getBoundingClientRect()
      const value = cells[4], amount = value.querySelector('.transaction-amount')!
      const v = value.getBoundingClientRect(), m = amount.getBoundingClientRect()
      return { category: Math.abs(b.x + b.width / 2 - r.x - r.width / 2), actions: Math.abs(a.right - parseFloat(getComputedStyle(actions).paddingRight) - g.right), amount: Math.abs(v.right - parseFloat(getComputedStyle(value).paddingRight) - m.right), hit: [...group.querySelectorAll('button')].every(el => el.getBoundingClientRect().width >= 44 && el.getBoundingClientRect().height >= 44) }
    }))
    for (const geometry of geometries) {
      expect(geometry.category).toBeLessThanOrEqual(2)
      expect(geometry.actions).toBeLessThanOrEqual(2)
      expect(geometry.amount).toBeLessThanOrEqual(2)
      expect(geometry.hit).toBe(true)
    }
    const headers = await page.locator('th').evaluateAll(cells => cells.map(cell => {
      const range = document.createRange(); range.selectNodeContents(cell)
      const text = range.getBoundingClientRect(), r = cell.getBoundingClientRect(), css = getComputedStyle(cell)
      const column = cell.getAttribute('data-column')
      if (column === 'amount' || column === 'actions') return Math.abs(text.right - r.right + parseFloat(css.paddingRight))
      if (column === 'description') return Math.abs(text.left - r.left - parseFloat(css.paddingLeft))
      return Math.abs(text.x + text.width / 2 - r.x - r.width / 2)
    }))
    expect(headers.every(delta => delta <= 2)).toBe(true)
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
  test.setTimeout(120_000)
  const calls = await mockFinance(page)
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    await expect(page.locator('.dashboard-recent li')).toHaveCount(2)
    await noOverflow(page)
    if (width >= 768) {
      const tracks = await page.locator('.dashboard-recent li').evaluateAll(els => els.map(el => {
        const css = getComputedStyle(el), columns = css.gridTemplateColumns.split(' ').map(parseFloat), box = el.getBoundingClientRect()
        const badge = el.querySelector('.category-tag')!.getBoundingClientRect()
        return { center: badge.x + badge.width / 2, expected: box.x + parseFloat(css.paddingLeft) + columns[0] + columns[1] + 2 * parseFloat(css.columnGap) + columns[2] / 2 }
      }))
      expect(Math.abs(tracks[0].center - tracks[1].center)).toBeLessThanOrEqual(2)
      expect(tracks.every(track => Math.abs(track.center - track.expected) <= 2)).toBe(true)
    }
    await screenshot(page, `dashboard-${width}`)
    expect(await page.locator('.dashboard-recent .transaction-title').last().evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true)
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

test('auth controls at 320', async ({ page }) => {
  await mockFinance(page, { anonymous: true })
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Fazer login' })).toBeVisible()
  await noOverflow(page)
  const toggle = page.getByRole('button', { name: /Mostrar senha/ })
  const box = await toggle.boundingBox()
  expect(box!.width).toBeGreaterThanOrEqual(44)
  await screenshot(page, 'login-320')
  for (const width of [320, 375, 390, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 1000 }); await noOverflow(page) }
  await page.getByRole('link', { name: 'Criar conta', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Criar conta', exact: true })).toBeVisible()
  for (const width of [1440, 1024, 768, 390, 375, 320]) { await page.setViewportSize({ width, height: 1000 }); await noOverflow(page) }
  await screenshot(page, 'signup-320')
})

test('profile long name, keyboard navigation and skip link', async ({ page }) => {
  await mockFinance(page)
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('/perfil')
  await expect(page.getByRole('heading', { name: 'Marina'.repeat(20) })).toBeVisible()
  await noOverflow(page)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Ir para o conteúdo' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await screenshot(page, 'profile-320')
  for (const width of [375, 390, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 1000 }); await noOverflow(page) }
})

test('category description form creates, edits and clears via existing handlers', async ({ page }) => {
  await mockFinance(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/categorias')
  await page.getByRole('button', { name: 'Nova categoria', exact: true }).click()
  const dialog = page.getByRole('dialog')
  const description = 'Roteiros e reservas para viagens em família'
  await dialog.getByLabel('Nome', { exact: true }).fill('Viagens')
  await dialog.getByLabel('Descrição', { exact: true }).fill(description)
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByText(description, { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText(description, { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Editar categoria Viagens', exact: true }).click()
  await expect(dialog.getByLabel('Descrição', { exact: true })).toHaveValue(description)
  await dialog.getByLabel('Descrição', { exact: true }).fill('   ')
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Viagens', exact: true })).toBeVisible()
  await expect(page.locator('.category-card').filter({ has: page.getByRole('heading', { name: 'Viagens', exact: true }) }).locator('.category-card-description')).toHaveCount(0)
  await screenshot(page, 'categories-390')
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await noOverflow(page)
    if ([320, 768, 1440].includes(width)) await screenshot(page, `categories-${width}`)
  }
})

test('touch opens full transaction details at 390', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 }, baseURL: 'http://127.0.0.1:5173' })
  try {
    const page = await context.newPage()
    await mockFinance(page)
    await page.goto('/transacoes')
    const title = page.getByRole('button', { name: /Ver detalhes da transação/ }).last()
    await title.tap()
    await expect(page.getByRole('dialog').getByText('x'.repeat(80), { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Fechar detalhes', exact: true }).tap()
    await expect(title).toBeFocused()
  } finally { await context.close() }
})

for (const state of ['empty', 'error', 'delayed'] as const) {
  test(`320 ${state} states keep controls and honest summaries`, async ({ page }) => {
    await mockFinance(page, { [state]: true })
    await page.setViewportSize({ width: 320, height: 700 })
    await page.goto('/categorias')
    if (state === 'delayed') {
      await expect(page.getByRole('status')).toContainText('Carregando')
      await expect(page.getByRole('region', { name: 'Resumo das categorias' })).toHaveCount(0)
      await expect(page.locator('.category-card')).toHaveCount(2)
    } else if (state === 'error') {
      await expect(page.getByRole('alert')).toContainText('Não foi possível')
      await expect(page.getByRole('region', { name: 'Resumo das categorias' })).toHaveCount(0)
    } else {
      await expect(page.getByText('Você ainda não tem categorias.')).toBeVisible()
      await expect(page.getByRole('region', { name: 'Resumo das categorias' })).toContainText('Nenhuma categoria utilizada')
    }
    await noOverflow(page)
    await screenshot(page, `categories-${state}-320`)
    await page.goto('/')
    if (state === 'error') await expect(page.getByRole('alert')).toContainText('Não foi possível')
    else if (state === 'empty') await expect(page.getByText('Nenhuma transação neste mês')).toBeVisible()
    else await expect(page.locator('.dashboard-recent li')).toHaveCount(2)
    await noOverflow(page)
    await page.goto('/transacoes')
    if (state === 'error') await expect(page.getByRole('alert').first()).toContainText('Não foi possível')
    else if (state === 'empty') await expect(page.getByText('Nenhuma transação encontrada')).toBeVisible()
    else await expect(page.getByRole('region', { name: 'Lista de transações' })).toBeVisible()
    await noOverflow(page)
  })
}
