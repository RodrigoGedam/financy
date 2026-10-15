import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { LogOut, Mail, UserRound } from 'lucide-react'
import { useAuth } from './auth-context'
import { supabase } from '../../lib/supabase'
import { authErrorMessage } from './auth-errors'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export function ProfilePage() {
  const { session } = useAuth()
  const name = typeof session?.user.user_metadata.full_name === 'string' ? session.user.user_metadata.full_name : ''
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [leaving, setLeaving] = useState(false)
  const form = useForm({
    defaultValues: { name },
    onSubmit: async ({ value }) => {
      setError(''); setSuccess('')
      try {
        const { error } = await supabase.auth.updateUser({ data: { full_name: value.name.trim() } })
        if (error) throw error
        setSuccess('Nome atualizado.')
      } catch (cause) { setError(authErrorMessage(cause)) }
    },
  })
  const logout = async () => {
    setLeaving(true); setError(''); setSuccess('')
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) throw error
    } catch (cause) { setError(authErrorMessage(cause)); setLeaving(false) }
  }
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toLocaleUpperCase('pt-BR') || 'U'
  return <div className="profile-wrap"><section className="auth-card" aria-label="Meu perfil">
    <header className="profile-header"><span className="avatar" aria-hidden="true">{initials}</span><div><h1>{name || 'Meu perfil'}</h1><p>{session?.user.email}</p></div></header>
    <hr className="m-0 border-gray-200" />
    <form className="auth-form" noValidate onSubmit={event => { event.preventDefault(); void form.handleSubmit() }}>
      <div className="fields">
        <form.Field name="name" validators={{ onSubmit: ({ value }) => !value.trim() ? 'Informe seu nome.' : undefined }}>{field => <div className="field">
          <label htmlFor="profile-name">Nome completo</label><div className="field-control"><UserRound aria-hidden="true" /><Input id="profile-name" autoComplete="name" value={field.state.value} onChange={e => field.handleChange(e.target.value)} onBlur={field.handleBlur} aria-invalid={!field.state.meta.isValid} aria-describedby="profile-name-error" /></div>
          {field.state.meta.errors.length > 0 && <p className="error" role="alert" id="profile-name-error">{field.state.meta.errors.join(' ')}</p>}
        </div>}</form.Field>
        <div className="field"><label htmlFor="profile-email">E-mail</label><div className="field-control"><Mail aria-hidden="true" /><Input id="profile-email" type="email" readOnly aria-readonly="true" value={session?.user.email ?? ''} className="bg-gray-50 text-gray-600" aria-describedby="email-help" /></div><p className="text-xs text-gray-500" id="email-help">O e-mail não pode ser alterado</p></div>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {success && <p className="success" role="status">{success}</p>}
      <form.Subscribe selector={state => state.isSubmitting}>{busy => <div className="grid gap-4"><Button type="submit" disabled={busy || leaving}>{busy ? 'Salvando…' : 'Salvar alterações'}</Button><Button type="button" variant="outline" disabled={busy || leaving} onClick={() => void logout()}><LogOut className="text-red-500" aria-hidden="true" />{leaving ? 'Saindo…' : 'Sair da conta'}</Button></div>}</form.Subscribe>
    </form>
  </section></div>
}
