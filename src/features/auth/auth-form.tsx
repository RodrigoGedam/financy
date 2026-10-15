import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Eye, EyeClosed, Lock, LogIn, Mail, UserRound, UserRoundPlus } from 'lucide-react'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Logo } from '../../components/logo'
import { authErrorMessage } from './auth-errors'

export function AuthForm({ signup = false }: { signup?: boolean }) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError('')
      if (!supabaseConfigured) { setError('Configure o projeto Supabase para acessar sua conta.'); return }
      try {
        const result = signup
          ? await supabase.auth.signUp({ email: value.email.trim(), password: value.password, options: { data: { full_name: value.name.trim() } } })
          : await supabase.auth.signInWithPassword({ email: value.email.trim(), password: value.password })
        if (result.error) throw result.error
        if (!result.data.session) { setError('A conta foi criada, mas o projeto ainda exige confirmação de e-mail.'); return }
        await navigate({ to: '/' })
      } catch (cause) { setError(authErrorMessage(cause)) }
    },
  })
  return <main className="auth-page">
    <Logo />
    <section className="auth-card" aria-labelledby="auth-title">
      <header className="auth-header"><h1 id="auth-title">{signup ? 'Criar conta' : 'Fazer login'}</h1><p>{signup ? 'Comece a controlar suas finanças ainda hoje' : 'Entre na sua conta para continuar'}</p></header>
      {!supabaseConfigured && <p className="notice">A conexão com o Supabase precisa ser configurada neste ambiente.</p>}
      <form className="auth-form" noValidate onSubmit={event => { event.preventDefault(); void form.handleSubmit() }}>
        <div className="fields">
          {signup && <form.Field name="name" validators={{ onSubmit: ({ value }) => !value.trim() ? 'Informe seu nome.' : undefined }}>{field => <div className="field">
            <label htmlFor="name">Nome completo</label><div className="field-control"><UserRound aria-hidden="true" /><Input id="name" autoComplete="name" value={field.state.value} onChange={e => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="Seu nome completo" aria-invalid={!field.state.meta.isValid} aria-describedby="name-error" /></div>
            {field.state.meta.errors.length > 0 && <p id="name-error" className="error" role="alert">{field.state.meta.errors.join(' ')}</p>}
          </div>}</form.Field>}
          <form.Field name="email" validators={{ onSubmit: ({ value }) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? 'Informe um e-mail válido.' : undefined }}>{field => <div className="field">
            <label htmlFor="email">E-mail</label><div className="field-control"><Mail aria-hidden="true" /><Input id="email" type="email" autoComplete="email" value={field.state.value} onChange={e => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="mail@exemplo.com" aria-invalid={!field.state.meta.isValid} aria-describedby="email-error" /></div>
            {field.state.meta.errors.length > 0 && <p id="email-error" className="error" role="alert">{field.state.meta.errors.join(' ')}</p>}
          </div>}</form.Field>
          <form.Field name="password" validators={{ onSubmit: ({ value }) => signup && value.length < 8 ? 'Use pelo menos 8 caracteres.' : !value ? 'Informe sua senha.' : undefined }}>{field => <div className="field">
            <label htmlFor="password">Senha</label><div className="field-control"><Lock aria-hidden="true" /><Input id="password" type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} value={field.state.value} onChange={e => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="Digite sua senha" aria-invalid={!field.state.meta.isValid} aria-describedby="password-help password-error" /><button className="password-toggle" type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Eye aria-hidden="true" /> : <EyeClosed aria-hidden="true" />}</button></div>
            {signup && <p id="password-help" className="text-xs text-gray-600">A senha deve ter no mínimo 8 caracteres</p>}
            {field.state.meta.errors.length > 0 && <p id="password-error" className="error" role="alert">{field.state.meta.errors.join(' ')}</p>}
          </div>}</form.Field>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <form.Subscribe selector={state => state.isSubmitting}>{busy => <Button type="submit" disabled={busy}>{busy ? 'Aguarde…' : signup ? 'Criar conta' : 'Entrar'}</Button>}</form.Subscribe>
      </form>
      <div className="divider">ou</div>
      <div className="auth-footer"><p>{signup ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}</p><Button asChild variant="outline"><Link to={signup ? '/login' : '/cadastro'}>{signup ? <LogIn aria-hidden="true" /> : <UserRoundPlus aria-hidden="true" />}{signup ? 'Fazer login' : 'Criar conta'}</Link></Button></div>
    </section>
  </main>
}
