import { afterAll, beforeAll, expect, it } from 'vitest'
import {
	createTestClients,
	categoryInput,
	rows,
	rowId,
	transactionInput,
	type Fixtures,
} from '../fixtures/supabase'
import { getDashboard, parseDashboard } from '../../src/features/dashboard/api'
import { supabase } from '../../src/lib/supabase'
import { updateCategory } from '../../src/features/categories/api'
import {
	createTransaction,
	updateTransaction,
	deleteTransaction,
	listTransactions,
} from '../../src/features/transactions/api'
import { parseTransactionSearch } from '../../src/features/transactions/search'

let f: Fixtures
let categoryId: string
beforeAll(async () => {
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
	const session = (await f.alice.auth.getSession()).data.session!
	expect((await supabase.auth.setSession(session)).error).toBeNull()
})
afterAll(async () => {
	await supabase.auth.signOut({ scope: 'local' })
	if (f) await f.cleanup()
})
async function dashboard(who = f.alice, month = '2024-01-01') {
	const result = await who.rpc('get_dashboard', { p_month: month })
	expect(result.error).toBeNull()
	return parseDashboard(result.data)
}
it('agrega histórico e mês com precisão, RLS e recusa de argumentos inválidos', async () => {
	const values = [
		{
			...transactionInput(categoryId),
			description: 'Anterior',
			kind: 'income',
			amount: '100.00',
			occurred_on: '2023-12-31',
		},
		{
			...transactionInput(categoryId),
			description: 'Receita',
			kind: 'income',
			amount: '50.00',
			occurred_on: '2024-01-01',
		},
		{
			...transactionInput(categoryId),
			description: 'Despesa',
			kind: 'expense',
			amount: '20.00',
			occurred_on: '2024-01-31',
		},
	]
	expect(
		(await f.request(f.alice, 'transactions', 'POST', values)).status,
	).toBe(201)
	expect(await dashboard()).toMatchObject({
		balance: '130.00',
		income: '50.00',
		expenses: '20.00',
	})
	expect(await dashboard(f.bob)).toMatchObject({
		balance: '0.00',
		income: '0.00',
		expenses: '0.00',
		topCategories: [],
		recentTransactions: [],
	})
	expect(await dashboard(f.alice, '2024-02-01')).toMatchObject({
		balance: '130.00',
		income: '0.00',
		expenses: '0.00',
		topCategories: [],
		recentTransactions: [],
	})
	for (const p_month of ['2024-01-02', 'infinity', '-infinity'])
		expect(
			(await f.alice.rpc('get_dashboard', { p_month })).error,
		).not.toBeNull()
	expect(
		(await f.anon.rpc('get_dashboard', { p_month: '2024-01-01' })).error
			?.code,
	).toBe('42501')
	expect(
		(await f.alice.rpc('get_dashboard', { p_month: '2024-02-30' })).error
			?.code,
	).toBe('22008')
	expect(await getDashboard('2023-12')).toMatchObject({
		balance: '130.00',
		income: '100.00',
		expenses: '0.00',
	})
	expect((await getDashboard('2024-01')).topCategories).toMatchObject([
		{ id: categoryId, amount: '20.00', transaction_count: 1 },
	])
})
it('mais de mil linhas: totais, contagem e ranking completo sem teto de retorno da API', async () => {
	for (let start = 0; start < 1005; start += 200) {
		const batch = Array.from(
			{ length: Math.min(200, 1005 - start) },
			() => ({
				...transactionInput(categoryId),
				description: 'Centavo',
				amount: '0.01',
				occurred_on: '2024-03-01',
			}),
		)
		expect(
			(await f.request(f.alice, 'transactions', 'POST', batch)).status,
		).toBe(201)
	}
	const result = await getDashboard('2024-03')
	expect(result).toMatchObject({
		balance: '119.95',
		income: '0.00',
		expenses: '10.05',
		topCategories: [
			{ id: categoryId, amount: '10.05', transaction_count: 1005 },
		],
	})
	expect(result.recentTransactions).toHaveLength(5)
	const subset = await f.alice
		.from('transactions')
		.select('id')
		.eq('occurred_on', '2024-03-01')
		.order('occurred_on', { ascending: false })
		.order('created_at', { ascending: false })
		.order('id', { ascending: false })
		.limit(5)
	expect(result.recentTransactions.map((r) => r.id)).toEqual(
		subset.data?.map((r) => r.id),
	)
	for (const name of ['Zulu', 'Beta', 'Alfa', 'Gama', 'Delta']) {
		const id = rowId(
			rows(
				await f.request(
					f.alice,
					'categories',
					'POST',
					categoryInput(name),
				),
			)[0],
		)
		expect(
			(
				await f.request(f.alice, 'transactions', 'POST', {
					...transactionInput(id),
					description: 'Empate',
					amount: '0.01',
					occurred_on: '2024-03-02',
				})
			).status,
		).toBe(201)
	}
	const ranked = await getDashboard('2024-03')
	expect(ranked.expenses).toBe('10.10')
	expect(ranked.topCategories).toHaveLength(5)
	expect(ranked.topCategories.map((c) => c.name)).toEqual([
		'Casa',
		'Alfa',
		'Beta',
		'Delta',
		'Gama',
	])
	expect(ranked.recentTransactions).toHaveLength(5)
})
it('valor maior que inteiro seguro, saldo negativo e categorias atuais após CRUD', async () => {
	const positive = await f.alice.rpc('save_transaction', {
		p_description: 'Grande receita',
		p_kind: 'income',
		p_amount: '9007199254740993.01',
		p_occurred_on: '2024-04-01',
		p_category_id: categoryId,
	})
	expect(positive.error).toBeNull()
	if (positive.data) f.track(f.alice, 'transactions', positive.data)
	const negative = await f.alice.rpc('save_transaction', {
		p_description: 'Grande despesa',
		p_kind: 'expense',
		p_amount: '9007199254740993.02',
		p_occurred_on: '2024-04-02',
		p_category_id: categoryId,
	})
	expect(negative.error).toBeNull()
	if (negative.data) f.track(f.alice, 'transactions', negative.data)
	const actual = await getDashboard('2024-04')
	expect(actual).toMatchObject({
		balance: '119.89',
		income: '9007199254740993.01',
		expenses: '9007199254740993.02',
	})
	expect(actual.recentTransactions.map((r) => r.amount)).toEqual([
		'9007199254740993.02',
		'9007199254740993.01',
	])
	const bobCategory = rowId(
		rows(
			await f.request(f.bob, 'categories', 'POST', categoryInput('Bob')),
		)[0],
	)
	await f.request(f.bob, 'transactions', 'POST', {
		...transactionInput(bobCategory),
		amount: '0.01',
		occurred_on: '2024-04-01',
	})
	expect(await dashboard(f.bob, '2024-04-01')).toMatchObject({
		balance: '-0.01',
		income: '0.00',
		expenses: '0.01',
	})
	await createTransaction({
		...transactionInput(categoryId),
		description: 'Mudança',
		kind: 'income',
		amount: '0.10',
		occurred_on: '2024-04-01',
	})
	const original = (
		await listTransactions(parseTransactionSearch({ q: 'Mudança' }))
	).rows[0]
	f.track(f.alice, 'transactions', original.id)
	expect((await getDashboard('2024-04')).balance).toBe('119.99')
	await updateTransaction(original, {
		...original,
		kind: 'expense',
		amount: '0.20',
		occurred_on: '2024-04-03',
	})
	expect(await getDashboard('2024-04')).toMatchObject({
		balance: '119.69',
		expenses: '9007199254740993.22',
	})
	await updateCategory(categoryId, {
		name: 'Casa atual',
		color: 'pink',
		icon: 'gift',
	})
	const updated = await getDashboard('2024-04')
	expect(updated.topCategories[0]).toMatchObject({
		name: 'Casa atual',
		color: 'pink',
		icon: 'gift',
	})
	expect(updated.recentTransactions[0].category).toMatchObject({
		name: 'Casa atual',
		color: 'pink',
		icon: 'gift',
	})
	await deleteTransaction(updated.recentTransactions[0])
	expect((await getDashboard('2024-04')).balance).toBe('119.89')
})
