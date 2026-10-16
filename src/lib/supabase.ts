import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabaseConfigured = Boolean(url && key)

// Sem configuração, a UI explica o próximo passo e não envia credenciais.
export const supabase = createClient<Database>(url || 'http://127.0.0.1:54321', key || 'not-configured')
