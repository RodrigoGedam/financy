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

Desenvolvimento contém `categories` e `transactions`, criadas por `supabase/migrations/20261015182208_financy_core.sql`, com RLS e grants explícitos. Produção não recebeu essa migration nesta etapa. Antes de qualquer mudança que possa perder dados, exportar o banco e conferir o arquivo fora do Git. Backups e credenciais permanecem fora do repositório.

O CLI 2.121.0 gerou o nome da migration. A aplicação foi feita uma vez pelo MCP autenticado, pois o CLI não tinha access token. O timestamp atribuído pelo MCP foi conciliado no histórico para o nome local após comparação exata do SQL; não reaplicar o arquivo. Antes de futuros pushes, conferir histórico local/remoto e usar dry-run com credenciais próprias. Detalhes e hash no registro da tarefa 2.

`Database` em `src/lib/database.types.ts` foi gerado do schema remoto e tipa o cliente. O gerador representa `numeric` por `number`; para dinheiro, gravar com `save_transaction(p_amount: string)` e ler com `select('...,amount::text')`. A RPC é `security invoker`, obedece RLS e retorna UUID. Não converter dinheiro para `Number` nem sobrescrever os tipos gerados para ocultar o transporte padrão numérico. A coluna usa `numeric` sem typmod: valida escala antes de normalizar para duas casas; não há teto monetário adicional.

## Testes de acesso

Para integração, configure `.env.test.local` com `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `FINANCY_DEV_PROJECT_REF` do desenvolvimento. Rode `pnpm test:integration`. Configuração separada dos unitários; o guard exige URL exata e referência `gorymmpnavtudztnasny`, além de chave publicável, antes de criar contas. As operações testadas usam somente essa chave e JWTs reais de Alice/Bob ou cliente sem sessão; nenhuma chave administrativa.

A integração cria contas `financy-data-alice-<runId>@example.com` e `financy-data-bob-<runId>@example.com`, registra IDs e execução em `test-fixtures/finance-users.jsonl` (ignorado, sem senhas/JWTs), remove as linhas financeiras e encerra as sessões ao terminar. O manifesto fica fora de `test-results`, que o Playwright limpa a cada execução. A exclusão das contas Auth exige administração separada: conferir os IDs do manifesto e os e-mails exatos da execução, verificar ausência de linhas dependentes e remover somente esses IDs no desenvolvimento. Falhas de limpeza são reportadas pelo teste; não fazer limpeza ampla por prefixo. As contas de cada entrega são tratadas nos respectivos registros de execução.

O E2E gera contas com e-mails `financy-e2e-<identificador>@example.com` e `financy-e2e-bob-<identificador>@example.com`. São exclusivas de desenvolvimento, não recebem dados pessoais e não dependem de caixa de e-mail. Para limpar, conferir o identificador da execução e remover somente essas contas; jamais fazer uma limpeza ampla por prefixo em produção.

## Hospedagem

Vercel Hobby, repositório público e alvos de implantação ainda não foram criados. Após as entregas restantes, revisar segredos, commit e variáveis antes de publicar. Configurar fallback de rotas da SPA e rollback pelo deployment anterior. Projetos Supabase Free podem pausar por inatividade; retomar pelo painel quando necessário, sem automações de atividade artificial.
