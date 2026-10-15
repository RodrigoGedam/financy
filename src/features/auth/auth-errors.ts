import { AuthApiError } from '@supabase/supabase-js'

export function authErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError) {
    if (error.code === 'invalid_credentials') return 'E-mail ou senha incorretos.'
    if (error.code === 'user_already_exists' || error.code === 'email_exists') return 'Este e-mail já possui uma conta.'
    if (error.code === 'weak_password') return 'Use pelo menos 8 caracteres na senha.'
    if (error.status === 429) return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.'
    if (error.code === 'email_not_confirmed') return 'O projeto ainda exige confirmação de e-mail. Confira a configuração de autenticação.'
    if (error.code === 'signup_disabled') return 'O cadastro está temporariamente indisponível.'
  }
  return 'Não foi possível conectar. Verifique sua conexão e tente novamente.'
}
