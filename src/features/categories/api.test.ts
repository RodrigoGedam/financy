import { beforeEach, expect, it, vi } from 'vitest'
const mock = vi.hoisted(() => ({ from: vi.fn(), response: { data: null as unknown, error: null as unknown } }))
vi.mock('../../lib/supabase', () => ({ supabase: { from: mock.from } }))
import { createCategory, updateCategory, listCategories } from './api'

const value = { name: ' Alimentação ', description: null as string | null, color: 'green' as const, icon: 'utensils' as const }
const row = { ...value, id: 'category', name: 'Alimentação' }
let query: Record<string, ReturnType<typeof vi.fn>>
beforeEach(() => {
  vi.clearAllMocks()
  mock.response = { data: row, error: null }
  query = Object.fromEntries(['select', 'insert', 'update', 'eq', 'single', 'order', 'range', 'abortSignal'].map(key => [key, vi.fn().mockImplementation(() => query)]))
  query.then = vi.fn((resolve) => Promise.resolve(mock.response).then(resolve))
  mock.from.mockReturnValue(query)
})
it.each([null, '', ' \t\ufeff', ' texto descritivo com mais de vinte caracteres '])('creates/clears optional description %j', async description => {
  const expected = description?.trim() || null
  mock.response.data = { ...row, description: expected }
  expect(await createCategory({ ...value, description })).toEqual({ ...row, description: expected })
  expect(query.insert).toHaveBeenCalledWith({ ...value, name: 'Alimentação', description: expected })
  await updateCategory('category', { ...value, description })
  expect(query.update).toHaveBeenCalledWith({ ...value, name: 'Alimentação', description: expected })
  expect(query.select).toHaveBeenCalledWith('id,name,description,color,icon')
})
it('reads legacy titles and nullable description with aggregate counts', async () => {
  mock.response.data = [{ ...row, name: 'x'.repeat(80), transactions: [{ count: 12 }] }]
  expect(await listCategories()).toEqual([{ ...row, name: 'x'.repeat(80), transaction_count: 12 }])
})
it('validates titles and descriptions at the API boundary', async () => {
  await expect(createCategory({ ...value, name: '😀'.repeat(21) })).rejects.toThrow('20')
  await expect(createCategory({ ...value, description: 123 as unknown as string })).rejects.toThrow('Descrição')
  mock.response.data = { ...row, description: 123 }
  await expect(createCategory(value)).rejects.toThrow('descrição')
})
