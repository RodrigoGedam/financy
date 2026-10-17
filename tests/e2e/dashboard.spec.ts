import { expect, test, type Page } from '@playwright/test'
import { todayInSaoPaulo } from '../../src/lib/dates'
import {
	createTestClients,
	categoryInput,
	rowId,
	rows,
	transactionInput,
	type Fixtures,
} from '../fixtures/supabase'

let f: Fixtures
let categoryId: string
let expectedRecent: string[]
const month = todayInSaoPaulo().slice(0, 7)
const period = `${month.slice(5)}/${month.slice(0, 4)}`
const previous = month.endsWith('-01')
	? `${Number(month.slice(0, 4)) - 1}-12`
	: `${month.slice(0, 4)}-${String(Number(month.slice(5)) - 1).padStart(2, '0')}`
test.beforeAll(async () => {
	f = await createTestClients()
	const names = [
		'Casa',
		'Transporte',
		'Mercado',
		'Lazer',
		'Saúde',
		'Outros',
		'Salário',
	]
	const colors = [
		'green',
		'blue',
		'purple',
		'pink',
		'red',
		'orange',
		'yellow',
	]
	const categories = rows(
		await f.request(
			f.alice,
			'categories',
			'POST',
			names.map((name, i) => ({
				...categoryInput(name),
				color: colors[i],
			})),
		),
	)
	categoryId = rowId(categories[0])
	const amounts = ['20.00', '10.00', '8.00', '5.00', '3.00', '1.00', '50.00']
	const inserted = rows(
		await f.request(
			f.alice,
			'transactions',
			'POST',
			categories.map((c, i) => ({
				...transactionInput(rowId(c)),
				description: `Registro ${names[i]}`,
				kind: i === 6 ? 'income' : 'expense',
				amount: amounts[i],
				occurred_on: `${month}-01`,
			})),
		),
	).sort((a, b) => String(b.id).localeCompare(String(a.id)))
	expectedRecent = inserted.slice(0, 5).map((row) => String(row.description))
	await f.request(f.alice, 'transactions', 'POST', {
		...transactionInput(rowId(categories[6])),
		description: 'Histórico anterior',
		kind: 'income',
		amount: '100.00',
		occurred_on: `${previous}-01`,
	})
})
test.afterAll(async () => {
	if (!f) return
	for (const row of rows(await f.request(f.alice, 'transactions')))
		f.track(f.alice, 'transactions', rowId(row))
	await f.cleanup()
})
async function login(page: Page) {
	const session = (await f.alice.auth.getSession()).data.session!
	await page.addInitScript(
		(session) =>
			localStorage.setItem(
				'sb-gorymmpnavtudztnasny-auth-token',
				JSON.stringify(session),
			),
		session,
	)
	await page.goto('/')
	await expect(
		page.getByRole('region', { name: 'Saldo total' }),
	).toContainText(/R\$\s103,00/, { timeout: 20_000 })
}
test('períodos, ranking, recentes, link filtrado, CRUD e categoria atual em desktop', async ({
	page,
}) => {
	test.setTimeout(150_000)
	const rpcBodies: unknown[] = []
	const tableReads: string[] = []
	page.on('response', async (response) => {
		if (
			response.url().includes('/rest/v1/rpc/get_dashboard') &&
			response.ok()
		)
			rpcBodies.push(await response.json())
	})
	page.on('request', (request) => {
		if (
			request.method() === 'GET' &&
			/\/rest\/v1\/(transactions|categories)\?/.test(request.url())
		)
			tableReads.push(request.url())
	})
	await login(page)
	await expect(page.getByLabel('Mês de referência')).toHaveValue(month)
	await expect(
		page.getByRole('region', { name: 'Saldo total' }),
	).toContainText('Todo o histórico')
	await expect(
		page.getByRole('region', { name: 'Receitas do mês' }),
	).toContainText(/R\$\s50,00/)
	await expect(
		page.getByRole('region', { name: 'Despesas do mês' }),
	).toContainText(/R\$\s47,00/)
	const ranking = page.getByRole('region', { name: 'Maiores despesas' })
	await expect(ranking).toContainText(period)
	await expect(ranking.locator('li')).toHaveCount(5)
	for (const [index, name] of [
		'Casa',
		'Transporte',
		'Mercado',
		'Lazer',
		'Saúde',
	].entries())
		await expect(ranking.locator('li').nth(index)).toContainText(name)
	await expect(ranking).not.toContainText('Salário')
	const recent = page.getByRole('region', { name: 'Transações recentes' })
	await expect(recent.locator('li')).toHaveCount(5)
	for (const [index, name] of expectedRecent.entries())
		await expect(recent.locator('li').nth(index)).toContainText(name)
	expect(tableReads).toEqual([])
	expect(rpcBodies).toHaveLength(1)
	expect(rpcBodies[0]).toMatchObject({
		balance: '103.00',
		income: '50.00',
		expenses: '47.00',
	})
	for (const width of [1024, 1440]) {
		await page.setViewportSize({ width, height: 1000 })
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth,
			),
		).toBe(true)
		await page.screenshot({
			path: `test-results/dashboard-${width}.png`,
			fullPage: true,
		})
	}
	await page.getByLabel('Mês de referência').focus()
	await expect(page.getByLabel('Mês de referência')).toBeFocused()
	// O controle nativo de mês possui segmentos internos de teclado.
	const seeAll = page.getByRole('link', { name: 'Ver todas', exact: true })
	for (
		let i = 0;
		i < 4 &&
		!(await seeAll.evaluate((node) => node === document.activeElement));
		i++
	)
		await page.keyboard.press('Tab')
	await expect(seeAll).toBeFocused()
	await page.keyboard.press('Enter')
	await expect(page.getByLabel('Período')).toHaveValue(month)
	await expect(page.getByText('1 a 7 | 7 resultados')).toBeVisible()
	expect(new URL(page.url()).searchParams.get('month')).toBe(month)
	await page
		.getByRole('button', { name: 'Nova transação', exact: true })
		.click()
	let dialog = page.getByRole('dialog', { name: 'Nova transação' })
	await dialog.getByLabel('Descrição').fill('E2E novo')
	await dialog.getByLabel('Valor (R$)', { exact: true }).fill('0,50')
	await dialog
		.getByLabel('Categoria', { exact: true })
		.selectOption(categoryId)
	await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
	await expect(dialog).not.toBeVisible()
	await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
	await expect(
		page.getByRole('region', { name: 'Saldo total' }),
	).toContainText(/R\$\s102,50/)
	await expect(
		page.getByRole('region', { name: 'Despesas do mês' }),
	).toContainText(/R\$\s47,50/)
	await expect(ranking.locator('li').first()).toContainText('2 despesas')
	await expect(recent).toContainText('E2E novo')
	await page.getByRole('link', { name: 'Ver todas', exact: true }).click()
	await page
		.getByRole('button', { name: 'Editar transação E2E novo', exact: true })
		.click()
	dialog = page.getByRole('dialog', { name: 'Editar transação' })
	await dialog.getByLabel('Receita').check()
	await dialog.getByLabel('Valor (R$)', { exact: true }).fill('1,00')
	await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
	await expect(dialog).not.toBeVisible()
	await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
	await expect(
		page.getByRole('region', { name: 'Saldo total' }),
	).toContainText(/R\$\s104,00/)
	await expect(
		page.getByRole('region', { name: 'Receitas do mês' }),
	).toContainText(/R\$\s51,00/)
	await expect(
		page.getByRole('region', { name: 'Despesas do mês' }),
	).toContainText(/R\$\s47,00/)
	await expect(ranking.locator('li').first()).toContainText('1 despesa')
	await page.getByRole('link', { name: 'Categorias', exact: true }).click()
	await page
		.getByRole('button', { name: 'Editar categoria Casa', exact: true })
		.click()
	await page
		.getByRole('dialog')
		.getByLabel('Nome', { exact: true })
		.fill('Casa atual')
	await page
		.getByRole('dialog')
		.getByRole('button', { name: 'Salvar', exact: true })
		.click()
	await expect(page.getByRole('dialog')).not.toBeVisible()
	await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
	await expect(ranking.locator('li').first()).toContainText('Casa atual')
	await page.getByRole('link', { name: 'Ver todas', exact: true }).click()
	await page
		.getByRole('button', {
			name: 'Excluir transação E2E novo',
			exact: true,
		})
		.click()
	await page
		.getByRole('alertdialog')
		.getByRole('button', { name: 'Excluir', exact: true })
		.click()
	await expect(page.getByRole('alertdialog')).not.toBeVisible()
	await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
	await expect(
		page.getByRole('region', { name: 'Saldo total' }),
	).toContainText(/R\$\s103,00/)
	await expect(
		page.getByRole('region', { name: 'Receitas do mês' }),
	).toContainText(/R\$\s50,00/)
})
test('troca rápida de mês, vazio e falha recuperável sem dados de outro período', async ({
	page,
}) => {
	test.setTimeout(90_000)
	await login(page)
	let release = () => {}
	let arrived = () => {}
	const gate = new Promise<void>((resolve) => {
		release = resolve
	})
	const reached = new Promise<void>((resolve) => {
		arrived = resolve
	})
	await page.route('**/rest/v1/rpc/get_dashboard', async (route) => {
		if (route.request().postDataJSON().p_month !== `${previous}-01`)
			return route.continue()
		const response = await route.fetch()
		arrived()
		await gate
		try {
			await route.fulfill({ response })
		} catch {
			/* Consulta antiga cancelada. */
		}
	})
	try {
		await page.getByLabel('Mês de referência').fill(previous)
		await reached
		await expect(page.getByRole('status')).toContainText(
			'Carregando dashboard',
		)
		await expect(
			page.getByRole('region', { name: 'Receitas do mês' }),
		).toHaveCount(0)
		await page.getByLabel('Mês de referência').fill('2024-02')
		await expect(
			page.getByRole('region', { name: 'Receitas do mês' }),
		).toContainText(/R\$\s0,00/)
		await expect(
			page.getByText('Nenhuma transação neste mês'),
		).toBeVisible()
		await expect(page.getByText('Nenhuma despesa neste mês')).toBeVisible()
	} finally {
		release()
	}
	await expect(
		page.getByRole('region', { name: 'Receitas do mês' }),
	).toContainText('02/2024')
	await expect(
		page.getByRole('region', { name: 'Receitas do mês' }),
	).toContainText(/R\$\s0,00/)
	await page.unroute('**/rest/v1/rpc/get_dashboard')
	await page.route('**/rest/v1/rpc/get_dashboard', (route) =>
		route.abort('failed'),
	)
	await page.getByLabel('Mês de referência').fill('2024-03')
	await expect(page.getByRole('alert')).toContainText(
		'Não foi possível carregar o dashboard de 03/2024',
		{ timeout: 30_000 },
	)
	await expect(page.getByRole('region', { name: 'Saldo total' })).toHaveCount(
		0,
	)
	await page.unroute('**/rest/v1/rpc/get_dashboard')
	await page.getByRole('button', { name: 'Tentar novamente' }).click()
	await expect(
		page.getByRole('region', { name: 'Saldo total' }),
	).toContainText(/R\$\s103,00/)
	await expect(page.getByText('Nenhuma transação neste mês')).toBeVisible()
	const aliceToken = (await f.alice.auth.getSession()).data.session!
		.access_token
	const bobSession = (await f.bob.auth.getSession()).data.session!
	let releaseAccount = () => {}
	let arrivedAccount = () => {}
	const accountGate = new Promise<void>((resolve) => {
		releaseAccount = resolve
	})
	const accountReached = new Promise<void>((resolve) => {
		arrivedAccount = resolve
	})
	await page.route('**/rest/v1/rpc/get_dashboard', async (route) => {
		if (
			route.request().postDataJSON().p_month !== '2024-05-01' ||
			route.request().headers().authorization !== `Bearer ${aliceToken}`
		)
			return route.continue()
		const response = await route.fetch()
		arrivedAccount()
		await accountGate
		try {
			await route.fulfill({ response })
		} catch {
			/* Resposta da conta anterior cancelada. */
		}
	})
	try {
		await page.getByLabel('Mês de referência').fill('2024-05')
		await accountReached
		await page.evaluate(async (session) => {
			const path = '/src/lib/supabase.ts'
			const { supabase } = await import(path)
			const { error } = await supabase.auth.setSession(session)
			if (error) throw new Error('Troca de sessão real falhou.')
		}, bobSession)
		await expect(
			page.getByRole('region', { name: 'Saldo total' }),
		).toContainText(/R\$\s0,00/, { timeout: 20_000 })
	} finally {
		releaseAccount()
	}
	await page.unroute('**/rest/v1/rpc/get_dashboard')
	await expect(
		page.getByRole('region', { name: 'Saldo total' }),
	).toContainText(/R\$\s0,00/)
})
