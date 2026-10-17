import { randomUUID } from 'node:crypto'
import { appendFileSync, mkdirSync } from 'node:fs'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { integrationEnvironment } from './environment'
import type { Database } from '../../src/lib/database.types'

type Table = 'categories' | 'transactions'
export type ApiResult = { status: number; data: unknown; code: string | null }

export function recordFixtureUser(userId: string, runId: string) {
	integrationEnvironment(process.env)
	const uuid =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
	if (!uuid.test(userId) || !uuid.test(runId))
		throw new Error('Identificação de fixture inválida.')
	mkdirSync('test-fixtures', { recursive: true })
	appendFileSync(
		'test-fixtures/finance-users.jsonl',
		JSON.stringify({ runId, projectRef: 'gorymmpnavtudztnasny', userId }) +
			'\n',
	)
}

export function rows(result: ApiResult): Record<string, unknown>[] {
	if (
		!Array.isArray(result.data) ||
		!result.data.every(
			(row) => row && typeof row === 'object' && !Array.isArray(row),
		)
	) {
		throw new Error(
			`Resposta inesperada: HTTP ${result.status}, código ${result.code}`,
		)
	}
	return result.data
}

export function rowId(row: Record<string, unknown>) {
	if (typeof row.id !== 'string')
		throw new Error('API não retornou um id textual.')
	return row.id
}

export async function createTestClients() {
	const { url, key } = integrationEnvironment(process.env)
	const runId = randomUUID()
	const clients: SupabaseClient<Database>[] = []
	const created: {
		client: SupabaseClient<Database>
		table: Table
		id: string
	}[] = []
	const client = () =>
		createClient<Database>(url, key, {
			auth: {
				persistSession: false,
				autoRefreshToken: false,
				detectSessionInUrl: false,
			},
		})
	const track = (who: SupabaseClient<Database>, table: Table, id: string) => {
		created.push({ client: who, table, id })
		return id
	}
	const request = async (
		who: SupabaseClient<Database>,
		table: Table,
		method = 'GET',
		body?: Record<string, unknown> | Record<string, unknown>[],
		id?: string,
	): Promise<ApiResult> => {
		const {
			data: { session },
		} = await who.auth.getSession()
		const params = new URLSearchParams({
			select:
				table === 'transactions'
					? 'id,user_id,category_id,description,kind,amount::text,occurred_on,created_at'
					: '*',
		})
		if (id) params.set('id', `eq.${id}`)
		const response = await fetch(`${url}/rest/v1/${table}?${params}`, {
			method,
			headers: {
				apikey: key,
				...(session
					? { Authorization: `Bearer ${session.access_token}` }
					: {}),
				'Content-Type': 'application/json',
				Prefer: 'return=representation',
			},
			body: body ? JSON.stringify(body) : undefined,
		})
		const text = await response.text()
		const data: unknown = text ? JSON.parse(text) : null
		const code =
			data &&
			typeof data === 'object' &&
			'code' in data &&
			typeof data.code === 'string'
				? data.code
				: null
		const result = { status: response.status, data, code }
		if (method === 'POST' && response.ok)
			for (const row of rows(result)) track(who, table, rowId(row))
		return result
	}
	const cleanup = async () => {
		const failures: string[] = []
		for (const table of ['transactions', 'categories'] satisfies Table[]) {
			for (const who of clients) {
				const ids = created
					.filter(
						(record) =>
							record.table === table && record.client === who,
					)
					.map((record) => record.id)
				for (let start = 0; start < ids.length; start += 200) {
					try {
						const { error } = await who
							.from(table)
							.delete()
							.in('id', ids.slice(start, start + 200))
						if (error) failures.push(`${table}:${error.code}`)
					} catch {
						failures.push(`${table}:network`)
					}
				}
			}
		}
		for (const who of clients) {
			const { error } = await who.auth.signOut({ scope: 'global' })
			if (error) failures.push(`signout:${error.code}`)
		}
		if (failures.length)
			throw new Error(`Limpeza incompleta: ${failures.join(', ')}`)
	}
	const signup = async (name: string) => {
		const who = client()
		clients.push(who)
		const credentials = {
			email: `financy-data-${name}-${runId}@example.com`,
			password: `Financy-${randomUUID()}!`,
		}
		const { data, error } = await who.auth.signUp(credentials)
		if (data.user) {
			// Playwright apaga test-results antes de cada execução; preservar o manifesto fora dele.
			recordFixtureUser(data.user.id, runId)
		}
		if (error || !data.session)
			throw new Error(
				`Fixture Auth falhou: ${error?.code ?? 'session_missing'}`,
			)
		return { client: who, id: data.session.user.id, credentials }
	}
	try {
		const alice = await signup('alice')
		const bob = await signup('bob')
		return {
			alice: alice.client,
			bob: bob.client,
			aliceId: alice.id,
			bobId: bob.id,
			anon: client(),
			credentials: { alice: alice.credentials, bob: bob.credentials },
			runId,
			request,
			cleanup,
			track,
		}
	} catch (error) {
		await cleanup()
		throw error
	}
}

export type Fixtures = Awaited<ReturnType<typeof createTestClients>>
export const categoryInput = (name: string) => ({
	name,
	color: 'green',
	icon: 'utensils',
})
export const transactionInput = (categoryId: string) => ({
	category_id: categoryId,
	description: 'Lançamento de teste',
	kind: 'expense',
	amount: '12.34',
	occurred_on: '2026-01-01',
})
