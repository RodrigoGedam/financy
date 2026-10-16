import { afterAll, beforeAll, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { categoryInput, createTestClients, rowId, rows, transactionInput, type Fixtures } from '../fixtures/supabase'

let f: Fixtures
beforeAll(async () => { f = await createTestClients() })
afterAll(async () => { if (f) await f.cleanup() })

it('CRUD próprio e geração de identidade/criação funcionam nas duas tabelas', async () => {
  const category = rows(await f.request(f.alice, 'categories', 'POST', categoryInput('  Alimentação  ')))[0]
  expect(category).toMatchObject({ name: 'Alimentação', user_id: f.aliceId })
  expect(category.created_at).toEqual(expect.any(String))
  const id = rowId(category)
  const transaction = rows(await f.request(f.alice, 'transactions', 'POST', transactionInput(id)))[0]
  expect(transaction).toMatchObject({ user_id: f.aliceId, amount: '12.34' })
  expect(transaction.created_at).toEqual(expect.any(String))
  expect(rows(await f.request(f.alice, 'categories', 'PATCH', { name: 'Refeições' }, id))[0].name).toBe('Refeições')
  expect(rows(await f.request(f.alice, 'transactions', 'PATCH', { description: 'Atualizada' }, rowId(transaction)))[0].description).toBe('Atualizada')
  expect(rows(await f.request(f.alice, 'transactions', 'DELETE', undefined, rowId(transaction)))).toHaveLength(1)
  expect(rows(await f.request(f.alice, 'categories', 'DELETE', undefined, id))).toHaveLength(1)
})

it('Alice e Bob não leem, alteram ou apagam linhas um do outro; anônimo não acessa', async () => {
  for (const [owner, other, name] of [[f.alice, f.bob, 'Alice'], [f.bob, f.alice, 'Bob']] as const) {
    const category = rows(await f.request(owner, 'categories', 'POST', categoryInput(name)))[0]
    const transaction = rows(await f.request(owner, 'transactions', 'POST', transactionInput(rowId(category))))[0]
    for (const [table, row, patch] of [['categories', category, { name: 'Ataque' }], ['transactions', transaction, { description: 'Ataque' }]] as const) {
      expect(rows(await f.request(other, table, 'GET', undefined, rowId(row)))).toEqual([])
      for (const method of ['PATCH', 'DELETE']) {
        const result = await f.request(other, table, method, method === 'PATCH' ? patch : undefined, rowId(row))
        expect(result.status).toBeLessThan(300)
        expect(rows(result)).toEqual([])
        expect(rows(await f.request(owner, table, 'GET', undefined, rowId(row)))[0]).toEqual(row)
      }
      for (const method of ['GET', 'PATCH', 'DELETE', 'POST']) {
        const body = method === 'POST' ? (table === 'categories' ? categoryInput('Anônimo') : transactionInput(rowId(category))) : method === 'PATCH' ? patch : undefined
        expect((await f.request(f.anon, table, method, body, method === 'POST' ? undefined : rowId(row))).code).toBe('42501')
        expect(rows(await f.request(owner, table, 'GET', undefined, rowId(row)))[0]).toEqual(row)
      }
    }
  }
})

it('recusa dono forjado, troca de dono, identidade e criação fornecidas pelo cliente', async () => {
  const category = rows(await f.request(f.alice, 'categories', 'POST', categoryInput('Protegida')))[0]
  const transaction = rows(await f.request(f.alice, 'transactions', 'POST', transactionInput(rowId(category))))[0]
  for (const [table, input, row] of [['categories', categoryInput('Forjada'), category], ['transactions', transactionInput(rowId(category)), transaction]] as const) {
    for (const patch of [{ user_id: f.bobId }, { user_id: null }, { id: randomUUID() }, { created_at: '2000-01-01T00:00:00Z' }]) {
      expect((await f.request(f.alice, table, 'POST', { ...input, ...patch })).status).toBeGreaterThanOrEqual(400)
      expect((await f.request(f.alice, table, 'PATCH', patch, rowId(row))).status).toBeGreaterThanOrEqual(400)
      expect(rows(await f.request(f.alice, table, 'GET', undefined, rowId(row)))[0]).toEqual(row)
    }
  }
})

it('FK composta impede categoria alheia/inexistente e exclusão de categoria utilizada', async () => {
  const own = rowId(rows(await f.request(f.alice, 'categories', 'POST', categoryInput('Minha')))[0])
  const foreign = rowId(rows(await f.request(f.bob, 'categories', 'POST', categoryInput('De Bob')))[0])
  const original = rows(await f.request(f.alice, 'transactions', 'POST', transactionInput(own)))[0]
  for (const categoryId of [foreign, randomUUID()]) {
    expect((await f.request(f.alice, 'transactions', 'POST', transactionInput(categoryId))).code).toBe('23503')
    expect((await f.request(f.alice, 'transactions', 'PATCH', { category_id: categoryId }, rowId(original))).code).toBe('23503')
    expect(rows(await f.request(f.alice, 'transactions', 'GET', undefined, rowId(original)))[0]).toEqual(original)
  }
  expect((await f.request(f.alice, 'categories', 'DELETE', undefined, own)).code).toBe('23503')
  expect(rows(await f.request(f.alice, 'categories', 'GET', undefined, own))).toHaveLength(1)
  expect(rows(await f.request(f.alice, 'transactions', 'GET', undefined, rowId(original)))[0]).toEqual(original)
})
