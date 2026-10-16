import { afterAll, beforeAll, expect, it } from 'vitest'
import { supabase } from '../../src/lib/supabase'
import { createCategory, deleteCategory, listCategories, updateCategory } from '../../src/features/categories/api'
import { categoryInput, createTestClients, rowId, rows, transactionInput, type Fixtures } from '../fixtures/supabase'

let f: Fixtures
beforeAll(async () => {
  f = await createTestClients()
  const { data: { session } } = await f.alice.auth.getSession()
  if (!session) throw new Error('Sessão real obrigatória.')
  const { error } = await supabase.auth.setSession(session)
  if (error) throw new Error('Não foi possível autenticar o cliente da aplicação.')
})
afterAll(async () => { await supabase.auth.signOut({ scope: 'local' }); if (f) await f.cleanup() })

it('CRUD específico, ordem pt-BR, duplicidade concorrente e isolamento real', async () => {
  expect(await listCategories()).toEqual([])
  const make = async (name: string) => {
    const row = await createCategory({ name, color: 'blue', icon: 'utensils' })
    f.track(f.alice, 'categories', row.id)
    return row
  }
  const z = await make('Zoológico')
  const a = await make('  Árvore  ')
  expect(a.name).toBe('Árvore')
  expect((await listCategories()).map(row => row.name)).toEqual(['Árvore', 'Zoológico'])
  await expect(make(' árvore ')).rejects.toThrow('Já existe uma categoria com esse nome.')
  const results = await Promise.allSettled([make('Concorrência'), make(' concorrência ')])
  expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
  expect(results.filter(result => result.status === 'rejected')).toHaveLength(1)
  const foreign = rowId(rows(await f.request(f.bob, 'categories', 'POST', categoryInput('Somente Bob')))[0])
  expect((await listCategories()).some(row => row.id === foreign)).toBe(false)
  await expect(updateCategory(foreign, { name: 'Ataque', color: 'green', icon: 'house' })).rejects.toThrow()
  await expect(deleteCategory(foreign)).rejects.toThrow()
  expect(rows(await f.request(f.bob, 'categories', 'GET', undefined, foreign))[0].name).toBe('Somente Bob')
  expect(await updateCategory(a.id, { name: 'Bosque', color: 'pink', icon: 'house' })).toMatchObject({ id: a.id, name: 'Bosque', color: 'pink', icon: 'house' })
  await deleteCategory(z.id)
  expect((await listCategories()).some(row => row.id === z.id)).toBe(false)
})

it('contagem no banco inclui mais de mil transações de meses/tipos diferentes; vínculo permanece após edição', async () => {
  const category = await createCategory({ name: 'Histórico completo', color: 'green', icon: 'house' })
  f.track(f.alice, 'categories', category.id)
  const foreign = rowId(rows(await f.request(f.bob, 'categories', 'POST', categoryInput('Histórico de Bob')))[0])
  await f.request(f.bob, 'transactions', 'POST', transactionInput(foreign))
  for (let start = 0; start < 1005; start += 200) {
    const batch = Array.from({ length: Math.min(200, 1005 - start) }, (_, index) => ({ ...transactionInput(category.id), amount: '0.01', kind: index % 2 ? 'income' : 'expense', occurred_on: index % 2 ? '2024-01-01' : '2025-12-31' }))
    expect((await f.request(f.alice, 'transactions', 'POST', batch)).status).toBe(201)
  }
  expect((await listCategories()).find(row => row.id === category.id)?.transaction_count).toBe(1005)
  const tx = rows(await f.request(f.alice, 'transactions'))[0]
  await updateCategory(category.id, { name: 'Casa e família', color: 'orange', icon: 'gift' })
  const linked = await f.alice.from('transactions').select('category_id,categories(name,color,icon)').eq('id', rowId(tx)).single()
  expect(linked.error).toBeNull()
  expect(linked.data?.categories).toMatchObject({ name: 'Casa e família', color: 'orange', icon: 'gift' })
  await expect(deleteCategory(category.id)).rejects.toThrow('Reclassifique as transações antes de excluir esta categoria.')
  expect((await listCategories()).find(row => row.id === category.id)?.transaction_count).toBe(1005)
})

it('exclusão continua protegida se uma transação surgir após a leitura inicial', async () => {
  const category = await createCategory({ name: 'Uso concorrente', color: 'red', icon: 'heart-pulse' })
  f.track(f.alice, 'categories', category.id)
  expect((await listCategories()).find(row => row.id === category.id)?.transaction_count).toBe(0)
  await f.request(f.alice, 'transactions', 'POST', transactionInput(category.id))
  await expect(deleteCategory(category.id)).rejects.toThrow('Reclassifique')
  expect((await listCategories()).find(row => row.id === category.id)?.transaction_count).toBe(1)
})
