import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from './auth-context'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { queryClient } from '../../lib/query-client'
import { clearAccountCache } from '../../lib/session-cache'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ session: Session | null; loading: boolean; error: boolean }>({ session: null, loading: true, error: false })
  useEffect(() => {
    let active = true
    let revision = 0
    let identity: string | null = null
    const accept = async (session: Session | null) => {
      const current = ++revision
      if (identity !== (session?.user.id ?? null)) {
        identity = session?.user.id ?? null
        setState({ session: null, loading: true, error: false })
        await clearAccountCache(queryClient)
      }
      if (active && current === revision) setState({ session, loading: false, error: false })
    }
    if (!supabaseConfigured) {
      void accept(null)
      return () => { active = false }
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { void accept(session) })
    const initialRevision = revision
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active || revision !== initialRevision) return
      if (error) setState({ session: null, loading: false, error: true })
      else void accept(data.session)
    }).catch(() => { if (active && revision === initialRevision) setState({ session: null, loading: false, error: true }) })
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
