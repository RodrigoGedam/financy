import { afterAll, beforeAll, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { categoryInput, createTestClients, rowId, rows, transactionInput, type Fixtures } from '../fixtures/supabase'

let f: Fixtures
let categoryId: string
beforeAll(async () => { f = await createTestClients() })
afterAll(async () => { if (f) await f.cleanup() })

it('catálogo documentado é aceito e nome é normalizado/único por dono', async () => {
  const design = readFileSync('DESIGN.md', 'utf8')
  const keys = (section: string) => [...section.matchAll(/^\| `([^`]+)` \|/gm)].map(match => match[1])
  const colors = keys(design.split('### Catálogo fechado de cores')[1].split('### Catálogo fechado de ícones')[0])
  const icons = keys(design.split('### Catálogo fechado de ícones')[1].split('### Contrato para SQL')[0])
  expect(colors).toHaveLength(7)
  expect(icons).toHaveLength(16)
  for (const [index, icon] of icons.entries()) {
    expect((await f.request(f.alice, 'categories', 'POST', { name: `Catálogo ${index}`, icon, color: colors[index % colors.length] })).status).toBe(201)
  }
  const original = rows(await f.request(f.alice, 'categories', 'POST', categoryInput('  Alimentação  ')))[0]
  categoryId = rowId(original)
  expect(original.name).toBe('Alimentação')
  expect((await f.request(f.alice, 'categories', 'POST', categoryInput(' alimentação '))).code).toBe('23505')
  expect((await f.request(f.bob, 'categories', 'POST', categoryInput(' alimentação '))).status).toBe(201)
  const another = rows(await f.request(f.alice, 'categories', 'POST', categoryInput('Outra')))[0]
  expect((await f.request(f.alice, 'categories', 'PATCH', { name: 'ALIMENTAÇÃO' }, rowId(another))).code).toBe('23505')
  expect(rows(await f.request(f.alice, 'categories', 'GET', undefined, rowId(another)))[0]).toEqual(another)
})

it('recusa catálogo inválido/nulo/vazio, nome e descrição sem conteúdo', async () => {
  for (const patch of [{ name: '' }, { name: '   ' }, { name: '\t\n' }, { name: null },
    ...['gray', '#16A34A', 'Green', '', null].map(color => ({ color })),
    ...['plus', 'Utensils', 'anything', '', null].map(icon => ({ icon }))]) {
    const result = await f.request(f.alice, 'categories', 'POST', { ...categoryInput('Inválida'), ...patch })
    expect(['23514', '23502']).toContain(result.code)
  }
  for (const description of ['', '   ', '\t\n', null]) {
    expect(['23514', '23502']).toContain((await f.request(f.alice, 'transactions', 'POST', { ...transactionInput(categoryId), description })).code)
  }
})

it('recusa dinheiro não positivo, não finito ou com mais de duas casas sem arredondar', async () => {
  const original = rows(await f.request(f.alice, 'transactions', 'POST', transactionInput(categoryId)))[0]
  for (const amount of ['0', '-1', '1.001', '1.000', 'NaN', 'Infinity', '-Infinity', null]) {
    expect((await f.request(f.alice, 'transactions', 'POST', { ...transactionInput(categoryId), amount })).code).toBe('23514')
    expect((await f.request(f.alice, 'transactions', 'PATCH', { amount }, rowId(original))).code).toBe('23514')
    expect(rows(await f.request(f.alice, 'transactions', 'GET', undefined, rowId(original)))[0]).toEqual(original)
  }
})

it('valida calendário, hoje em São Paulo, tipos e categoria obrigatória', async () => {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const original = rows(await f.request(f.alice, 'transactions', 'POST', transactionInput(categoryId)))[0]
  for (const occurred_on of [today, '2024-02-29']) expect((await f.request(f.alice, 'transactions', 'POST', { ...transactionInput(categoryId), occurred_on })).status).toBe(201)
  for (const patch of [{ occurred_on: '9999-12-31' }, { occurred_on: '2025-02-29' }, { occurred_on: null }, { kind: 'other' }, { kind: null }, { category_id: null }]) {
    expect((await f.request(f.alice, 'transactions', 'POST', { ...transactionInput(categoryId), ...patch })).status).toBeGreaterThanOrEqual(400)
    expect((await f.request(f.alice, 'transactions', 'PATCH', patch, rowId(original))).status).toBeGreaterThanOrEqual(400)
    expect(rows(await f.request(f.alice, 'transactions', 'GET', undefined, rowId(original)))[0]).toEqual(original)
  }
})

it('Data API preserva texto decimal, centavos e valor acima do limite seguro JS', async () => {
  for (const [input, canonical] of [['1', '1.00'], ['1.2', '1.20'], ['0.01', '0.01'], ['9007199254740993.01', '9007199254740993.01']]) {
    const row = rows(await f.request(f.alice, 'transactions', 'POST', { ...transactionInput(categoryId), amount: input }))[0]
    expect(row.amount).toBe(canonical)
    const { data, error } = await f.alice.from('transactions').select('id,amount::text').eq('id', rowId(row)).single()
    expect(error).toBeNull()
    expect(data?.amount).toBe(canonical)
  }
})

it('SDK grava e atualiza decimal textual pela RPC sem contornar RLS', async () => {
  const category = rowId(rows(await f.request(f.alice, 'categories', 'POST', categoryInput('RPC')))[0])
  const input = { p_description: 'Via SDK', p_kind: 'income', p_amount: '9007199254740993.01', p_occurred_on: '2026-01-01', p_category_id: category }
  const inserted = await f.alice.rpc('save_transaction', input)
  expect(inserted.error).toBeNull()
  if (typeof inserted.data !== 'string') throw new Error('RPC não retornou UUID.')
  const id = f.track(f.alice, 'transactions', inserted.data)
  expect(rows(await f.request(f.alice, 'transactions', 'GET', undefined, id))[0].amount).toBe(input.p_amount)
  expect((await f.alice.rpc('save_transaction', { ...input, p_id: id, p_amount: '0.01' })).error).toBeNull()
  const original = rows(await f.request(f.alice, 'transactions', 'GET', undefined, id))[0]
  expect(original.amount).toBe('0.01')
  expect((await f.bob.rpc('save_transaction', { ...input, p_id: id })).error).not.toBeNull()
  expect((await f.anon.rpc('save_transaction', input)).error).not.toBeNull()
  expect((await f.alice.rpc('save_transaction', { ...input, p_id: id, p_amount: '1.001' })).error?.code).toBe('23514')
  expect(rows(await f.request(f.alice, 'transactions', 'GET', undefined, id))[0]).toEqual(original)
})
