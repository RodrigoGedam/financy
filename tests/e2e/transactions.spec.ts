import { expect, test } from '@playwright/test'
import {
	createTestClients,
	categoryInput,
	rows,
	rowId,
	transactionInput,
	type Fixtures,
} from '../fixtures/supabase'

let f: Fixtures
let categoryId: string
test.beforeAll(async () => {
	f = await createTestClients()
	categoryId = rowId(
		rows(
			await f.request(
				f.alice,
				'categories',
				'POST',
				categoryInput('Casa'),
			),
		)[0],
	)
	const batch = Array.from({ length: 12 }, (_, i) => ({
		...transactionInput(categoryId),
		description: `Lançamento ${String(i).padStart(2, '0')}`,
		kind: i % 2 ? 'income' : 'expense',
		amount: i === 0 ? '9007199254740993.01' : '12.34',
		occurred_on:
			i === 11 ? '2024-02-01' : i === 0 ? '2024-01-16' : '2024-01-15',
	}))
	expect(
		(await f.request(f.alice, 'transactions', 'POST', batch)).status,
	).toBe(201)
})
test.afterAll(async () => {
	if (!f) return
	for (const row of rows(await f.request(f.alice, 'transactions')))
		f.track(f.alice, 'transactions', rowId(row))
	await f.cleanup()
})
async function login(page: import('@playwright/test').Page) {
	const session = (await f.alice.auth.getSession()).data.session
	if (!session) throw new Error('Sessão real obrigatória')
	await page.addInitScript((session) => {
		if (!localStorage.getItem('sb-gorymmpnavtudztnasny-auth-token'))
			localStorage.setItem(
				'sb-gorymmpnavtudztnasny-auth-token',
				JSON.stringify(session),
			)
	}, session)
	await page.goto('/transacoes')
	await expect(page.getByText('1 a 10 | 12 resultados')).toBeVisible({
		timeout: 20_000,
	})
}
test('CRUD, precisão, URL, histórico, categoria atual, falhas e teclado em desktop', async ({
	page,
}) => {
	test.setTimeout(150_000)
	await login(page)
	await expect(page.locator('tbody tr')).toHaveCount(10)
	await expect(page.getByText(/9\.007\.199\.254\.740\.993,01/)).toBeVisible()
	for (const width of [1024, 1440]) {
		await page.setViewportSize({ width, height: 1000 })
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth,
			),
		).toBe(true)
		await page.screenshot({
			path: `test-results/transactions-${width}.png`,
			fullPage: true,
		})
	}
	await page.getByRole('button', { name: 'Próxima página' }).click()
	await expect(page.getByText('11 a 12 | 12 resultados')).toBeVisible()
	await page.reload()
	await expect(page.locator('tbody tr')).toHaveCount(2)
	await page.getByLabel('Tipo', { exact: true }).selectOption('income')
	await page.getByLabel('Período', { exact: true }).fill('2024-01')
	await page.getByLabel('Categoria', { exact: true }).selectOption(categoryId)
	await page.getByLabel('Buscar', { exact: true }).fill('Lançamento')
	await page.getByRole('button', { name: 'Aplicar filtros' }).click()
	await expect(page.getByText('1 a 5 | 5 resultados')).toBeVisible()
	await page.reload()
	await expect(page.getByLabel('Período')).toHaveValue('2024-01')
	await page.goBack()
	await expect(page.getByText('11 a 12 | 12 resultados')).toBeVisible()
	await page.goForward()
	await expect(page.getByText('1 a 5 | 5 resultados')).toBeVisible()
	await page.getByRole('button', { name: 'Limpar filtros' }).click()
	await expect(page.getByText('1 a 10 | 12 resultados')).toBeVisible()
	const create = page.getByRole('button', {
		name: 'Nova transação',
		exact: true,
	})
	await create.focus()
	await page.keyboard.press('Enter')
	const dialog = page.getByRole('dialog', { name: 'Nova transação' })
	await expect(dialog.getByLabel('Descrição')).toBeFocused()
	await dialog.getByLabel('Descrição').fill('Almoço %_*')
	await dialog.getByLabel('Valor (R$)', { exact: true }).fill('0,01')
	await dialog
		.getByLabel('Categoria', { exact: true })
		.selectOption(categoryId)
	for (const width of [1024, 1440]) {
		await page.setViewportSize({ width, height: 1000 })
		await expect(dialog).toBeVisible()
		await page.screenshot({
			path: `test-results/transaction-dialog-${width}.png`,
		})
	}
	await dialog.getByLabel('Data', { exact: true }).fill('9999-01-01')
	await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
	await expect(dialog.getByRole('alert')).toContainText('futura')
	await expect(dialog.getByLabel('Data', { exact: true })).toHaveAttribute(
		'aria-invalid',
		'true',
	)
	await expect(dialog.getByLabel('Data', { exact: true })).toHaveAttribute(
		'aria-describedby',
		'tx-date-error',
	)
	await dialog.getByLabel('Valor (R$)', { exact: true }).fill('0,00')
	await dialog.getByLabel('Data', { exact: true }).fill('2024-02-29')
	await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
	await expect(
		dialog.getByLabel('Valor (R$)', { exact: true }),
	).toHaveAttribute('aria-invalid', 'true')
	await expect(
		dialog.getByLabel('Valor (R$)', { exact: true }),
	).toHaveAttribute('aria-describedby', 'tx-amount-error')
	await dialog.getByLabel('Valor (R$)', { exact: true }).fill('0,01')
	await dialog.getByLabel('Data', { exact: true }).fill('2024-02-29')
	await page.route('**/rest/v1/rpc/save_transaction', (route) =>
		route.abort('failed'),
	)
	await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
	await expect(dialog.getByRole('alert')).toContainText('conexão')
	await expect(dialog.getByLabel('Descrição')).toHaveValue('Almoço %_*')
	await page.unroute('**/rest/v1/rpc/save_transaction')
	await dialog.getByRole('button', { name: 'Tentar novamente' }).click()
	await expect(dialog).not.toBeVisible()
	await expect(create).toBeFocused()
	await page.getByLabel('Buscar').fill('%_*')
	await page.getByRole('button', { name: 'Aplicar filtros' }).click()
	await expect(page.locator('tbody tr')).toHaveCount(1)
	await page
		.getByRole('button', {
			name: 'Editar transação Almoço %_*',
			exact: true,
		})
		.click()
	const edit = page.getByRole('dialog', { name: 'Editar transação' })
	await edit.getByLabel('Descrição').fill('Almoço alterado')
	await edit.getByLabel('Receita').check()
	await edit.getByLabel('Valor (R$)', { exact: true }).fill('1.234,56')
	await edit.getByRole('button', { name: 'Salvar', exact: true }).click()
	await expect(edit).not.toBeVisible()
	await expect(page.getByText('Nenhuma transação encontrada')).toBeVisible()
	await page.getByRole('button', { name: 'Limpar filtros' }).click()
	await page
		.getByRole('button', {
			name: 'Excluir transação Almoço alterado',
			exact: true,
		})
		.click()
	const confirmation = page.getByRole('alertdialog')
	await expect(confirmation).toContainText('1.234,56')
	await expect(
		confirmation.getByRole('button', { name: 'Cancelar' }),
	).toBeFocused()
	await confirmation.getByRole('button', { name: 'Cancelar' }).click()
	await expect(
		page.getByRole('button', {
			name: 'Excluir transação Almoço alterado',
			exact: true,
		}),
	).toBeFocused()
	await page
		.getByRole('button', {
			name: 'Excluir transação Almoço alterado',
			exact: true,
		})
		.click()
	await confirmation
		.getByRole('button', { name: 'Excluir', exact: true })
		.click()
	await expect(confirmation).not.toBeVisible()
	await expect(page.getByText('1 a 10 | 12 resultados')).toBeVisible()
	await page.getByRole('link', { name: 'Categorias', exact: true }).click()
	await expect(page.getByText('12 transações', { exact: true })).toBeVisible()
	await page.getByRole('button', { name: 'Editar categoria Casa' }).click()
	await page
		.getByRole('dialog')
		.getByLabel('Nome', { exact: true })
		.fill('Casa renomeada')
	await page
		.getByRole('dialog')
		.getByRole('button', { name: 'Salvar', exact: true })
		.click()
	await expect(page.getByRole('dialog')).not.toBeVisible()
	await page.getByRole('link', { name: 'Transações', exact: true }).click()
	await expect(
		page.locator('tbody').getByText('Casa renomeada').first(),
	).toBeVisible()
	await page.route('**/rest/v1/transactions?**', (route) =>
		route.abort('failed'),
	)
	await page.getByLabel('Buscar').fill('falha')
	await page.getByRole('button', { name: 'Aplicar filtros' }).click()
	await expect(page.locator('tbody tr')).toHaveCount(0)
	await expect(page.getByRole('alert')).toContainText(
		'Não foi possível carregar as transações',
		{ timeout: 30_000 },
	)
	await page.unroute('**/rest/v1/transactions?**')
	await page
		.getByRole('button', { name: 'Tentar novamente', exact: true })
		.click()
	await expect(page.getByText('Nenhuma transação encontrada')).toBeVisible()
})
test('envio único, conflito preserva campos e resposta antiga não substitui novo filtro', async ({
	page,
}) => {
	test.setTimeout(120_000)
	await login(page)
	await page
		.getByRole('button', { name: 'Nova transação', exact: true })
		.click()
	const dialog = page.getByRole('dialog', { name: 'Nova transação' })
	await dialog.getByLabel('Descrição').fill('Concorrência E2E')
	await dialog.getByLabel('Valor (R$)', { exact: true }).fill('1,20')
	await dialog
		.getByLabel('Categoria', { exact: true })
		.selectOption(categoryId)
	let release = () => {}
	let arrived = () => {}
	const gate = new Promise<void>((resolve) => {
		release = resolve
	})
	const reached = new Promise<void>((resolve) => {
		arrived = resolve
	})
	let writes = 0
	await page.route('**/rest/v1/rpc/save_transaction', async (route) => {
		writes++
		arrived()
		await gate
		await route.continue()
	})
	try {
		await dialog
			.getByRole('button', { name: 'Salvar', exact: true })
			.click()
		await reached
		await expect(
			dialog.getByRole('button', { name: 'Salvando…' }),
		).toBeDisabled()
		await page.keyboard.press('Enter')
		expect(writes).toBe(1)
	} finally {
		release()
	}
	await expect(dialog).not.toBeVisible()
	expect(writes).toBe(1)
	await page.unroute('**/rest/v1/rpc/save_transaction')
	const row = rows(await f.request(f.alice, 'transactions')).find(
		(r) => r.description === 'Concorrência E2E',
	)!
	await page
		.getByRole('button', {
			name: 'Editar transação Concorrência E2E',
			exact: true,
		})
		.click()
	const edit = page.getByRole('dialog', { name: 'Editar transação' })
	await edit.getByLabel('Descrição').fill('Meu rascunho')
	expect(
		(
			await f.request(
				f.alice,
				'transactions',
				'PATCH',
				{ description: 'Alterada externamente' },
				rowId(row),
			)
		).status,
	).toBe(200)
	await edit.getByRole('button', { name: 'Salvar', exact: true }).click()
	await expect(edit.getByRole('alert')).toContainText(
		'alterada em outro contexto',
	)
	await expect(edit.getByLabel('Descrição')).toHaveValue('Meu rascunho')
	expect(
		rows(
			await f.request(
				f.alice,
				'transactions',
				'GET',
				undefined,
				rowId(row),
			),
		)[0].description,
	).toBe('Alterada externamente')
	await page.keyboard.press('Escape')
	await expect(edit).not.toBeVisible()
	await f.request(f.alice, 'transactions', 'DELETE', undefined, rowId(row))
	let releaseRead = () => {}
	let arrivedRead = () => {}
	const gateRead = new Promise<void>((resolve) => {
		releaseRead = resolve
	})
	const reachedRead = new Promise<void>((resolve) => {
		arrivedRead = resolve
	})
	await page.route('**/rest/v1/transactions?**', async (route) => {
		if (
			new URL(route.request().url()).searchParams.get('description') !==
			'imatch.Lançamento'
		)
			return route.continue()
		const response = await route.fetch()
		arrivedRead()
		await gateRead
		try {
			await route.fulfill({ response })
		} catch {
			/* Query cancelou a requisição anterior. */
		}
	})
	try {
		await page.getByLabel('Buscar').fill('Lançamento')
		await page.getByRole('button', { name: 'Aplicar filtros' }).click()
		await reachedRead
		await page.getByLabel('Buscar').fill('inexistente')
		await page.getByRole('button', { name: 'Aplicar filtros' }).click()
		await expect(
			page.getByText('Nenhuma transação encontrada'),
		).toBeVisible()
	} finally {
		releaseRead()
	}
	await expect(page.locator('tbody tr')).toHaveCount(0)
	await expect(page.getByLabel('Buscar')).toHaveValue('inexistente')
	await page.unroute('**/rest/v1/transactions?**')
})
test('última página é corrigida após exclusão e troca para conta vazia', async ({
	page,
}) => {
	test.setTimeout(90_000)
	await login(page)
	await page.getByRole('button', { name: 'Última página' }).click()
	await expect(page.locator('tbody tr')).toHaveCount(2)
	for (let i = 0; i < 2; i++) {
		await page
			.locator('tbody')
			.getByRole('button', { name: /Excluir transação/ })
			.first()
			.click()
		await page
			.getByRole('alertdialog')
			.getByRole('button', { name: 'Excluir', exact: true })
			.click()
		await expect(page.getByRole('alertdialog')).not.toBeVisible()
	}
	await expect(page.getByText('1 a 10 | 10 resultados')).toBeVisible()
	const session = (await f.bob.auth.getSession()).data.session!
	let release = () => {}
	let arrived = () => {}
	const gate = new Promise<void>((resolve) => {
		release = resolve
	})
	const reached = new Promise<void>((resolve) => {
		arrived = resolve
	})
	await page.route('**/rest/v1/transactions?**', async (route) => {
		const query = new URL(route.request().url()).searchParams
		if (
			query.get('description') !== 'imatch.Lançamento' ||
			!route
				.request()
				.headers()
				.authorization?.includes(
					(await f.alice.auth.getSession()).data.session!
						.access_token,
				)
		)
			return route.continue()
		const response = await route.fetch()
		arrived()
		await gate
		try {
			await route.fulfill({ response })
		} catch {
			/* Consulta de Alice foi cancelada. */
		}
	})
	try {
		await page.getByLabel('Buscar').fill('Lançamento')
		await page.getByRole('button', { name: 'Aplicar filtros' }).click()
		await reached
		await page.evaluate(async (session) => {
			// Cliente real da aplicação no servidor Vite de desenvolvimento.
			const source = '/src/lib/supabase.ts'
			const { supabase } = await import(source)
			const { error } = await supabase.auth.setSession(session)
			if (error) throw new Error('Falha ao trocar a sessão real.')
		}, session)
		await expect(
			page.getByText('Crie uma categoria para começar'),
		).toBeVisible({ timeout: 20_000 })
	} finally {
		release()
	}
	await page.unroute('**/rest/v1/transactions?**')
	await expect(page.getByText('Crie uma categoria para começar')).toBeVisible(
		{ timeout: 20_000 },
	)
	await expect(page.getByText('Nenhuma transação encontrada')).toBeVisible()
	await expect(
		page.getByRole('button', { name: 'Nova transação', exact: true }),
	).toBeDisabled()
	await expect(page.locator('tbody tr')).toHaveCount(0)
	await expect(
		page.getByRole('link', { name: 'Criar categorias' }),
	).toHaveAttribute('href', '/categorias')
})
