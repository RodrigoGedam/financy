# Ambientes e operação

Organização Supabase escolhida: `RodrigoGedam's Org` (`nkblcxsitlciadoapxzo`). Ambos os projetos foram criados pelo usuário no plano Free, região São Paulo (`sa-east-1`).

| Ambiente | Projeto | Referência |
| --- | --- | --- |
| Desenvolvimento | financy-dev | gorymmpnavtudztnasny |
| Produção | financy-prod | bqkmhzrrfurphiikylpa |

A base local usa somente desenvolvimento. Produção não recebe testes, fixtures ou cadastros automáticos.

## Autenticação

- E-mail/senha ativados, confirmação de e-mail desativada com confirmação explícita do usuário em 2026-10-15.
- Mínimo de 8 caracteres, sem requisitos extras de composição.
- Sessões persistentes e renovação padrão do Supabase Free.
- Logout com escopo `local`.
- Nome em `auth.users.user_metadata.full_name`, sem uso para autorização.
- Site URL de desenvolvimento: `http://127.0.0.1:5173`, sem redirects adicionais ou curingas. Produção receberá a URL da Vercel na entrega de publicação.
- Nenhum provedor OAuth ou login anônimo foi adicionado ao aplicativo.

As configurações de Auth ficam no painel do Supabase; antes de recriar um ambiente, repetir esses valores. Na publicação, definir as URLs exatas de Preview/Production no projeto correspondente; nunca usar credenciais de produção em previews.

## Dados e mudanças futuras

Ainda não existem tabelas financeiras próprias nesta entrega. O próximo passo do plano cria migrations versionadas com RLS e integridade. Aplicar primeiro em desenvolvimento, verificar por API com duas contas e depois aplicar em produção. Não usar reset em produção. Antes de qualquer mudança que possa perder dados, exportar o banco e conferir o arquivo fora do Git. Backups e credenciais permanecem fora do repositório.

## Testes de acesso

O E2E gera contas com e-mails `financy-e2e-<identificador>@example.com` e `financy-e2e-bob-<identificador>@example.com`. São exclusivas de desenvolvimento, não recebem dados pessoais e não dependem de caixa de e-mail. Para limpar, conferir o identificador da execução e remover somente essas contas; jamais fazer uma limpeza ampla por prefixo em produção.

## Hospedagem

Vercel Hobby, repositório público e alvos de implantação ainda não foram criados. Após as entregas restantes, revisar segredos, commit e variáveis antes de publicar. Configurar fallback de rotas da SPA e rollback pelo deployment anterior. Projetos Supabase Free podem pausar por inatividade; retomar pelo painel quando necessário, sem automações de atividade artificial.
