import { isCategoryColor, isCategoryIcon } from '../../config/category-options'
import { supabase } from '../../lib/supabase'
import { normalizeFinancialTitle } from '../../lib/financial-text'
import type { Category, CategoryInput, CategorySummary } from './types'

const fields = 'id,name,description,color,icon'
function category(row: { id: string; name: string; description: string | null; color: string; icon: string }): Category {
  if (row.description !== null && typeof row.description !== 'string') throw new Error('Categoria com descrição inválida. Atualize a página.')
  if (!isCategoryColor(row.color) || !isCategoryIcon(row.icon)) throw new Error('Categoria com opção desconhecida. Atualize a página e tente novamente.')
  return { id: row.id, name: row.name, description: row.description, color: row.color, icon: row.icon }
}
function input(value: CategoryInput): CategoryInput {
  const name = normalizeFinancialTitle(value.name, 'category')
  if (value.description != null && typeof value.description !== 'string') throw new Error('Descrição da categoria inválida.')
  if (!isCategoryColor(value.color) || !isCategoryIcon(value.icon)) throw new Error('Selecione uma cor e um ícone válidos.')
  return { ...value, name, description: value.description?.trim() || null }
}
function failure(error: { code?: string; message?: string }) {
  if (error.code === '23514' && error.message?.includes('categories_name_length_check')) return new Error('Use até 20 caracteres no nome da categoria.')
  if (error.code === '23505') return new Error('Já existe uma categoria com esse nome.')
  if (error.code === '23503') return new Error('Reclassifique as transações antes de excluir esta categoria.')
  if (error.code === 'PGRST116') return new Error('Categoria indisponível. Atualize a lista e tente novamente.')
  return new Error('Não foi possível concluir a operação. Verifique a conexão e tente novamente.')
}
export async function listCategories(signal?: AbortSignal): Promise<CategorySummary[]> {
  const result: CategorySummary[] = []
  // Paginar categorias evita truncamento pela Data API; transações retornam somente COUNT.
  for (let start = 0; ; start += 500) {
    let query = supabase.from('categories').select('id,name,description,color,icon,transactions(count)').order('id').range(start, start + 499)
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
