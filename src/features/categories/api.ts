import { isCategoryColor, isCategoryIcon } from '../../config/category-options'
import { supabase } from '../../lib/supabase'
import type { Category, CategoryInput, CategorySummary } from './types'

const fields = 'id,name,color,icon'
function category(row: { id: string; name: string; color: string; icon: string }): Category {
  if (!isCategoryColor(row.color) || !isCategoryIcon(row.icon)) throw new Error('Categoria com opção desconhecida. Atualize a página e tente novamente.')
  return { id: row.id, name: row.name, color: row.color, icon: row.icon }
}
function input(value: CategoryInput): CategoryInput {
  if (!value.name.trim()) throw new Error('Informe o nome da categoria.')
  if (!isCategoryColor(value.color) || !isCategoryIcon(value.icon)) throw new Error('Selecione uma cor e um ícone válidos.')
  return { ...value, name: value.name.trim() }
}
function failure(error: { code?: string }) {
  if (error.code === '23505') return new Error('Já existe uma categoria com esse nome.')
  if (error.code === '23503') return new Error('Reclassifique as transações antes de excluir esta categoria.')
  if (error.code === 'PGRST116') return new Error('Categoria indisponível. Atualize a lista e tente novamente.')
  return new Error('Não foi possível concluir a operação. Verifique a conexão e tente novamente.')
}
export async function listCategories(signal?: AbortSignal): Promise<CategorySummary[]> {
  const result: CategorySummary[] = []
  // Paginar categorias evita truncamento pela Data API; transações retornam somente COUNT.
  for (let start = 0; ; start += 500) {
    let query = supabase.from('categories').select('id,name,color,icon,transactions(count)').order('id').range(start, start + 499)
    if (signal) query = query.abortSignal(signal)
    const { data, error } = await query
    if (error) throw failure(error)
    for (const row of data) {
      const count = row.transactions[0]?.count
      if (!Number.isSafeInteger(count) || count < 0) throw new Error('Contagem de transações inválida. Tente novamente.')
      result.push({ ...category(row), transaction_count: count })
    }
    if (data.length < 500) break
  }
  return result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id))
}
export async function createCategory(value: CategoryInput): Promise<Category> {
  const { data, error } = await supabase.from('categories').insert(input(value)).select(fields).single()
  if (error) throw failure(error)
  return category(data)
}
export async function updateCategory(id: string, value: CategoryInput): Promise<Category> {
  const { data, error } = await supabase.from('categories').update(input(value)).eq('id', id).select(fields).single()
  if (error) throw failure(error)
  return category(data)
}
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id).select('id').single()
  if (error) throw failure(error)
}
