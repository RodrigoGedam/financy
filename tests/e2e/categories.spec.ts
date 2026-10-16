import { expect, test } from '@playwright/test'
import { createTestClients, rowId, rows, transactionInput, type Fixtures } from '../fixtures/supabase'

let f: Fixtures
test.beforeAll(async () => { f = await createTestClients() })
test.afterAll(async () => {
  if (!f) return
  // Contas exclusivas desta execução: incluir também registros criados pela interface.
  for (const row of rows(await f.request(f.alice, 'categories'))) f.track(f.alice, 'categories', rowId(row))
  await f.cleanup()
})

test('envio pendente bloqueia repetição até o servidor confirmar', async ({ page }) => {
  const session = (await f.alice.auth.getSession()).data.session
  if (!session) throw new Error('Sessão real obrigatória.')
  await page.addInitScript(session => localStorage.setItem('sb-gorymmpnavtudztnasny-auth-token', JSON.stringify(session)), session)
  await page.goto('/categorias')
  await page.getByRole('button', { name: 'Nova categoria', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Nova categoria' })
  await dialog.getByLabel('Nome', { exact: true }).fill('Envio único')
  let release = () => {}
  let arrived = () => {}
  const gate = new Promise<void>(resolve => { release = resolve })
  const reached = new Promise<void>(resolve => { arrived = resolve })
  let writes = 0
  await page.route('**/rest/v1/categories?**', async route => {
    if (route.request().method() !== 'POST') return route.continue()
    writes++
    arrived()
    await gate
    await route.continue()
  })
  try {
    await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
    await reached
    await expect(dialog.getByRole('button', { name: 'Salvando…' })).toBeDisabled()
    await expect(dialog.getByLabel('Nome', { exact: true })).toBeDisabled()
    await page.keyboard.press('Enter')
    expect(writes).toBe(1)
  } finally { release() }
  await expect(dialog).not.toBeVisible()
  expect(writes).toBe(1)
  const saved = rows(await f.request(f.alice, 'categories')).filter(row => row.name === 'Envio único')
  expect(saved).toHaveLength(1)
  expect(rows(await f.request(f.alice, 'categories', 'DELETE', undefined, rowId(saved[0])))).toHaveLength(1)
})

test('categorias reais: vazio, CRUD, vínculo, falhas, teclado e desktop', async ({ page, browser }) => {
  test.setTimeout(120_000)
  const { data: { session } } = await f.alice.auth.getSession()
  if (!session) throw new Error('Sessão real obrigatória.')
  const storageKey = 'sb-gorymmpnavtudztnasny-auth-token'
  await page.addInitScript(({ session, storageKey }) => localStorage.setItem(storageKey, JSON.stringify(session)), { session, storageKey })
  const categoryRequests: string[] = []
  const transactionRequests: string[] = []
  page.on('request', request => {
    if (request.method() !== 'GET') return
    if (request.url().includes('/rest/v1/categories?')) categoryRequests.push(request.url())
    if (request.url().includes('/rest/v1/transactions?')) transactionRequests.push(request.url())
  })
  await page.goto('/categorias')
  await expect(page.getByText('Você ainda não tem categorias.')).toBeVisible()
  expect(categoryRequests).toHaveLength(1)
  expect(new URL(categoryRequests[0]).searchParams.get('select')).toContain('transactions(count)')

  const newButton = page.getByRole('button', { name: 'Nova categoria', exact: true })
  await newButton.click()
  const dialog = page.getByRole('dialog', { name: 'Nova categoria' })
  await expect(dialog.getByLabel('Nome', { exact: true })).toBeFocused()
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(dialog.getByText('Informe o nome da categoria.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(newButton).toBeFocused()

  for (const name of ['Zoológico', '  Árvore  ']) {
    await newButton.click()
    await dialog.getByLabel('Nome', { exact: true }).fill(name)
    await dialog.getByRole('radio', { name: 'Talheres', exact: true }).check()
    await dialog.getByRole('radio', { name: 'Azul', exact: true }).check()
    await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
    await expect(dialog).not.toBeVisible()
  }
  await expect(page.locator('.category-card h2')).toHaveText(['Árvore', 'Zoológico'])
  await newButton.click()
  await dialog.getByLabel('Nome', { exact: true }).fill(' árvore ')
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('Já existe uma categoria com esse nome.')
  await expect(dialog.getByLabel('Nome', { exact: true })).toHaveValue(' árvore ')
  await dialog.getByRole('button', { name: 'Fechar', exact: true }).click()

  await newButton.click()
  await dialog.getByLabel('Nome', { exact: true }).fill('Mercado')
  await page.route('**/rest/v1/categories?**', route => route.request().method() === 'POST' ? route.abort() : route.continue())
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('Verifique a conexão')
  await expect(dialog.getByLabel('Nome', { exact: true })).toHaveValue('Mercado')
  await page.unroute('**/rest/v1/categories?**')
  await dialog.getByRole('button', { name: 'Tentar novamente', exact: true }).click()
  await expect(dialog).not.toBeVisible()

  const category = rows(await f.request(f.alice, 'categories')).find(row => row.name === 'Árvore')
  if (!category) throw new Error('Categoria criada não encontrada.')
  const tx = rows(await f.request(f.alice, 'transactions', 'POST', transactionInput(rowId(category))))[0]
  await page.reload()
  const card = page.getByRole('article', { name: 'Árvore', exact: true })
  await expect(card.getByText('1 transação', { exact: true })).toBeVisible()
  const edit = card.getByRole('button', { name: 'Editar categoria Árvore' })
  await edit.click()
  const editing = page.getByRole('dialog', { name: 'Editar categoria' })
  await expect(editing.getByLabel('Nome', { exact: true })).toHaveValue('Árvore')
  await editing.getByLabel('Nome', { exact: true }).fill('Casa')
  await editing.getByRole('radio', { name: 'Rosa', exact: true }).check()
  await editing.getByRole('radio', { name: 'Casa', exact: true }).check()
  await editing.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(editing).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Editar categoria Casa' })).toBeFocused()
  const linked = await f.alice.from('transactions').select('category_id,categories(name,color,icon)').eq('id', rowId(tx)).single()
  expect(linked.data?.categories).toMatchObject({ name: 'Casa', color: 'pink', icon: 'house' })

  await page.getByRole('button', { name: 'Excluir categoria Zoológico' }).click()
  let confirmation = page.getByRole('alertdialog', { name: 'Excluir categoria?' })
  await expect(confirmation.getByRole('button', { name: 'Cancelar' })).toBeFocused()
  await confirmation.getByRole('button', { name: 'Excluir', exact: true }).click()
  await expect(confirmation).not.toBeVisible()
  await expect(newButton).toBeFocused()
  await expect(page.getByRole('article', { name: 'Zoológico', exact: true })).not.toBeVisible()

  // A transação surge depois de abrir a confirmação: somente a FK decide a exclusão.
  const market = rows(await f.request(f.alice, 'categories')).find(row => row.name === 'Mercado')
  if (!market) throw new Error('Categoria criada não encontrada.')
  await page.getByRole('button', { name: 'Excluir categoria Mercado' }).click()
  await f.request(f.alice, 'transactions', 'POST', transactionInput(rowId(market)))
  confirmation = page.getByRole('alertdialog', { name: 'Excluir categoria?' })
  await confirmation.getByRole('button', { name: 'Excluir', exact: true }).click()
  await expect(confirmation.getByRole('alert')).toContainText('Reclassifique as transações')
  await confirmation.getByRole('button', { name: 'Cancelar' }).click()
  await page.reload()

  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.getByRole('article', { name: 'Casa', exact: true })).toBeVisible()
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width)
    await page.screenshot({ path: `test-results/categories-${width}.png`, fullPage: true })
    await newButton.click()
    await expect(dialog.getByLabel('Nome', { exact: true })).toBeFocused()
    await dialog.getByRole('radio', { name: 'Verde', exact: true }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(dialog.getByRole('radio', { name: 'Azul', exact: true })).toBeChecked()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Shift+Tab')
    await expect(dialog.getByRole('radio', { name: 'Azul', exact: true })).toBeFocused()
    await page.screenshot({ path: `test-results/category-dialog-${width}.png`, fullPage: true })
    await page.keyboard.press('Escape')
    await expect(newButton).toBeFocused()
  }
  expect(transactionRequests).toEqual([])

  await page.route('**/rest/v1/categories?**', route => route.abort())
  await page.reload()
  // SDK: 3 retries de GET (1/2/4 s); QueryClient mantém sua política existente.
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar as categorias.', { timeout: 25_000 })
  await page.unroute('**/rest/v1/categories?**')
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click()
  await expect(page.getByRole('article', { name: 'Casa', exact: true })).toBeVisible()

  let release = () => {}
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.route('**/rest/v1/categories?**', async route => { await gate; await route.continue() })
  try {
    await page.reload()
    await expect(page.getByRole('status')).toHaveText('Carregando categorias…')
  } finally { release() }
  await expect(page.getByRole('article', { name: 'Casa', exact: true })).toBeVisible()
  await page.unroute('**/rest/v1/categories?**')

  const context = await browser.newContext()
  const bobPage = await context.newPage()
  const bobSession = (await f.bob.auth.getSession()).data.session
  if (!bobSession) throw new Error('Sessão de Bob obrigatória.')
  await bobPage.addInitScript(({ session, storageKey }) => localStorage.setItem(storageKey, JSON.stringify(session)), { session: bobSession, storageKey })
  const bobResponse = bobPage.waitForResponse(response => response.url().includes('/rest/v1/categories?') && response.request().method() === 'GET')
  await bobPage.goto('/categorias')
  expect(await (await bobResponse).json()).toEqual([])
  await expect(bobPage.getByText('Você ainda não tem categorias.')).toBeVisible({ timeout: 15_000 })
  await expect(bobPage.getByRole('article')).toHaveCount(0)
  await context.close()
})
