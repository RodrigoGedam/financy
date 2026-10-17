import { expect, test, type Page } from '@playwright/test'
import { todayInSaoPaulo } from '../../src/lib/dates'
import {
	createTestClients,
	rows,
	rowId,
	transactionInput,
	type Fixtures,
} from '../fixtures/supabase'

let f: Fixtures
const month = todayInSaoPaulo().slice(0, 7)
test.beforeAll(async () => {
	f = await createTestClients()
})
test.afterAll(async () => {
	if (!f) return
	for (const table of ['transactions', 'categories'] as const)
		for (const row of rows(await f.request(f.alice, table)))
			f.track(f.alice, table, rowId(row))
	await f.cleanup()
})
async function login(page: Page, who: 'alice' | 'bob') {
	await page
		.getByLabel('E-mail', { exact: true })
		.fill(f.credentials[who].email)
	await page
		.getByLabel('Senha', { exact: true })
		.fill(f.credentials[who].password)
	await page.getByRole('button', { name: 'Entrar', exact: true }).click()
	await expect(
		page.getByRole('heading', { name: 'Dashboard', exact: true }),
	).toBeVisible({ timeout: 20_000 })
}
async function category(page: Page, name: string) {
	await page
		.getByRole('button', { name: 'Nova categoria', exact: true })
		.click()
	const dialog = page.getByRole('dialog', { name: 'Nova categoria' })
	await expect(dialog.getByLabel('Nome', { exact: true })).toBeFocused()
	await dialog.getByLabel('Nome', { exact: true }).fill(name)
	await dialog.getByRole('button', { name: 'Salvar', exact: true }).click()
	await expect(dialog).not.toBeVisible()
	await expect(
		page.getByRole('button', { name: 'Nova categoria', exact: true }),
	).toBeFocused()
	return rowId(
		rows(await f.request(f.alice, 'categories')).find(
			(row) => row.name === name,
		)!,
	)
}
test('percurso integrado de conta vazia até logout e outra conta, com reclassificação protegida', async ({
	page,
}) => {
	test.setTimeout(180_000)
	await page.goto('/login')
	await login(page, 'alice')
	await expect(
		page.getByRole('region', { name: 'Saldo total' }),
	).toContainText(/R\$\s0,00/)
	await expect(page.getByText('Nenhuma transação neste mês')).toBeVisible()
	for (const width of [1024, 1440]) {
		await page.setViewportSize({ width, height: 1000 })
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth,
			),
		).toBe(true)
		await page.screenshot({
			path: `test-results/integrated-empty-dashboard-${width}.png`,
			fullPage: true,
		})
	}
	await page
		.getByRole('link', { name: 'Nova transação', exact: true })
		.click()
	await expect(
		page.getByRole('button', { name: 'Nova transação', exact: true }),
	).toBeDisabled()
	await page
		.getByRole('link', { name: 'Criar categorias', exact: true })
		.click()
	await expect(page.getByText('Você ainda não tem categorias.')).toBeVisible()
	const mainId = await category(page, 'Revisão integrada')
	const centsId = await category(page, 'Centavos')
	await page.getByRole('link', { name: 'Transações', exact: true }).click()
	for (const [description, amount, kind] of [
		['Receita integrada', '100,00', 'Receita'],
		['Despesa integrada', '20,00', 'Despesa'],
	]) {
		await page
			.getByRole('button', { name: 'Nova transação', exact: true })
			.click()
		const dialog = page.getByRole('dialog', { name: 'Nova transação' })
		await dialog.getByLabel('Descrição').fill(description)
		await dialog.getByLabel('Valor (R$)', { exact: true }).fill(amount)
		await dialog.getByRole('radio', { name: new RegExp(kind) }).check()
		await dialog.getByLabel('Data', { exact: true }).fill(`${month}-01`)
		await dialog
			.getByLabel('Categoria', { exact: true })
			.selectOption(mainId)
		await dialog
			.getByRole('button', { name: 'Salvar', exact: true })
			.click()
		await expect(dialog).not.toBeVisible()
	}
	expect(
		(
			await f.request(
				f.alice,
				'transactions',
				'POST',
				Array.from({ length: 10 }, (_, index) => ({
					...transactionInput(centsId),
					description: `Centavo integrado ${index}`,
					amount: '0.01',
					occurred_on: `${month}-01`,
				})),
			)
		).status,
	).toBe(201)
	await page
		.getByRole('button', { name: 'Atualizar lista', exact: true })
		.click()
	await expect(page.getByText('1 a 10 | 12 resultados')).toBeVisible()
	await page.getByRole('button', { name: 'Próxima página' }).click()
	await expect(page.getByText('11 a 12 | 12 resultados')).toBeVisible()
	await page.reload()
	await expect(page.getByText('11 a 12 | 12 resultados')).toBeVisible()
	await page.getByLabel('Buscar', { exact: true }).fill('Centavo')
	await page.getByLabel('Tipo', { exact: true }).selectOption('expense')
	await page.getByLabel('Categoria', { exact: true }).selectOption(centsId)
	await page.getByLabel('Período', { exact: true }).fill(month)
	await page.getByRole('button', { name: 'Aplicar filtros' }).click()
	await expect(page.getByText('1 a 10 | 10 resultados')).toBeVisible()
	expect(new URL(page.url()).searchParams.get('page')).toBe('1')
	await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
	await expect(
		page.getByRole('region', { name: 'Saldo total' }),
	).toContainText(/R\$\s79,90/)
	await expect(
		page.getByRole('region', { name: 'Despesas do mês' }),
	).toContainText(/R\$\s20,10/)
	await page.getByRole('link', { name: 'Ver todas', exact: true }).click()
	await page.getByLabel('Buscar').fill('Despesa integrada')
	await page.getByRole('button', { name: 'Aplicar filtros' }).click()
	await page
		.getByRole('button', {
			name: 'Editar transação Despesa integrada',
			exact: true,
		})
		.click()
	const edit = page.getByRole('dialog', { name: 'Editar transação' })
	await edit.getByLabel('Valor (R$)', { exact: true }).fill('25,00')
	await edit.getByLabel('Data', { exact: true }).fill(todayInSaoPaulo())
	await edit.getByRole('button', { name: 'Salvar', exact: true }).click()
	await expect(edit).not.toBeVisible()
	await page.getByRole('link', { name: 'Categorias', exact: true }).click()
	const used = page.getByRole('article').filter({
		has: page.getByRole('heading', {
			name: 'Revisão integrada',
			exact: true,
		}),
	})
	await expect(used).toContainText('2 transações')
	await page
		.getByRole('button', {
			name: 'Excluir categoria Revisão integrada',
			exact: true,
		})
		.click()
	await page
		.getByRole('alertdialog')
		.getByRole('button', { name: 'Excluir', exact: true })
		.click()
	await expect(
		page.getByRole('alertdialog').getByRole('alert'),
	).toContainText('Reclassifique')
	await page
		.getByRole('alertdialog')
		.getByRole('button', { name: 'Cancelar' })
		.click()
	await expect(
		page.getByRole('button', {
			name: 'Excluir categoria Revisão integrada',
			exact: true,
		}),
	).toBeFocused()
	await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
	await expect(
		page.getByRole('region', { name: 'Saldo total' }),
	).toContainText(/R\$\s74,90/)
	await expect(
		page.getByRole('region', { name: 'Transações recentes' }),
	).toContainText('Despesa integrada')
	await page.getByRole('link', { name: 'Ver todas', exact: true }).click()
	await page
		.getByRole('button', {
			name: 'Excluir transação Despesa integrada',
			exact: true,
		})
		.click()
	await expect(page.getByRole('alertdialog')).toContainText('25,00')
	await expect(
		page.getByRole('alertdialog').getByRole('button', { name: 'Cancelar' }),
	).toBeFocused()
	await page
		.getByRole('alertdialog')
		.getByRole('button', { name: 'Excluir', exact: true })
		.click()
	await expect(page.getByRole('alertdialog')).not.toBeVisible()
	await page.getByLabel('Buscar').fill('Receita integrada')
	await page.getByRole('button', { name: 'Aplicar filtros' }).click()
	await page
		.getByRole('button', {
			name: 'Editar transação Receita integrada',
			exact: true,
		})
		.click()
	await page
		.getByRole('dialog')
		.getByLabel('Categoria', { exact: true })
		.selectOption(centsId)
	await page
		.getByRole('dialog')
		.getByRole('button', { name: 'Salvar', exact: true })
		.click()
	await expect(page.getByRole('dialog')).not.toBeVisible()
	await expect(page.locator('tbody tr')).toContainText('Centavos')
	await page.getByRole('link', { name: 'Categorias', exact: true }).click()
	await expect(used).toContainText('0 transações')
	await page
		.getByRole('button', {
			name: 'Excluir categoria Revisão integrada',
			exact: true,
		})
		.click()
	await page
		.getByRole('alertdialog')
		.getByRole('button', { name: 'Excluir', exact: true })
		.click()
	await expect(page.getByRole('alertdialog')).not.toBeVisible()
	await expect(
		page.getByRole('heading', { name: 'Revisão integrada', exact: true }),
	).toHaveCount(0)
	await expect(page.getByText('11 transações', { exact: true })).toBeVisible()
	await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
	await expect(
		page.getByRole('region', { name: 'Saldo total' }),
	).toContainText(/R\$\s99,90/)
	await page.getByRole('link', { name: 'Meu perfil' }).click()
	await page.getByRole('button', { name: 'Sair da conta' }).click()
	await expect(page).toHaveURL(/\/login/)
	await page.goto('/categorias')
	await expect(page).toHaveURL(/\/login/)
	await login(page, 'bob')
	await expect(
		page.getByRole('region', { name: 'Saldo total' }),
	).toContainText(/R\$\s0,00/)
	await page.getByRole('link', { name: 'Categorias', exact: true }).click()
	await expect(page.getByText('Você ainda não tem categorias.')).toBeVisible()
	await expect(page.getByText('Centavos', { exact: true })).toHaveCount(0)
	await page.getByRole('link', { name: 'Meu perfil' }).click()
	await page.getByRole('button', { name: 'Sair da conta' }).click()
	await expect(page).toHaveURL(/\/login/)
})
