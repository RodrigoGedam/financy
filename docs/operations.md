# Ambientes e operação

Estado de 17/10/2026 após autorização: frontend Production READY em `https://financy-gules.vercel.app`, projeto Vercel `financy` / `prj_KwAs12YJXoldXBQErlBQd5QM9QG1`, deployment `dpl_FqsuTixC94vVFBN1CYE7UbB9khke`, fonte `abcff9eca763fc6a64e1880e3a76a58f9e3a5849`. Os arquivos foram enviados diretamente ao deploy pelo MCP a partir desse commit, preservando `.vercelignore`; nenhuma chave administrativa foi usada no bundle. O repositório GitHub está público em `https://github.com/RodrigoGedam/financy`, com main enviada e SHA remoto conferido. Não há conexão Git automática com a Vercel; commits posteriores de documentação não provocam deployment.

As três migrations foram aplicadas uma vez em produção pelo MCP, com SQL comparado integralmente aos arquivos locais. O MCP registrou inicialmente versões geradas `20261017175510`, `20261017175607`, `20261017175641`. Após a recusa automática inicial e autorização específica do usuário, somente o campo version desses três registros foi alinhado a `20261015182208`, `20261016183142`, `20261016190434`. A operação atômica verificou nomes, hashes do SQL e ausência de versões de destino antes de atualizar; conferência posterior confirmou as três versões e SQL inalterado. Não houve reaplicação ou mudança de dados financeiros. Futuro push deve conferir história e dry-run antes de aplicar somente migrations novas; nunca reaplicar estas três.

Site URL de produção salva e reconferida após reload: `https://financy-gules.vercel.app`; allowlist adicional vazia, coerente com login/senha sem redirects explícitos. Desenvolvimento conserva a URL local; não houve deployment Preview a cadastrar. Smoke somente GET/leitura: `/`, `/login`, `/cadastro`, `/perfil`, `/categorias`, `/transacoes?month=all&page=1` responderam 200 com index SPA; navegador mostrou cadastro/login e redirecionou visitante das rotas privadas. Bundle servido confirmou endpoint de produção, ausência de endpoint dev e de valores com formato administrativo. Histórico de execução e limites de recuperação no [registro da release](superpowers/execution/2026-10-17-financy-release.md).

Organização Supabase escolhida: `RodrigoGedam's Org` (`nkblcxsitlciadoapxzo`). Ambos os projetos foram criados pelo usuário no plano Free, região São Paulo (`sa-east-1`).

| Ambiente | Projeto | Referência |
| --- | --- | --- |
| Desenvolvimento | financy-dev | gorymmpnavtudztnasny |
| Produção | financy-prod | bqkmhzrrfurphiikylpa |

A base local usa somente desenvolvimento. Produção não recebe testes, fixtures ou cadastros automáticos.

## Autenticação

Conferência somente em leitura no painel em 17/10/2026: desenvolvimento com Site URL `http://127.0.0.1:5173`; produção com `http://localhost:3000`; ambos sem URLs adicionais de redirect. Produção tem e-mail habilitado, confirmação de e-mail desativada, login anônimo/OAuth desativados e mínimo de oito caracteres observado no painel. Não houve atualização remota nesta preparação.

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

O dashboard usa `20261016190434_financy_dashboard.sql`, aplicada uma vez em desenvolvimento pelo MCP, com histórico conciliado ao nome do CLI após comparação do conteúdo. `get_dashboard(date)` é STABLE/SECURITY INVOKER, exige usuário autenticado e primeiro dia de mês finito; somente authenticated executa. Agregados monetários saem como texto, listas limitadas a cinco depois das somas/contagens. Não reaplicar a migration por outro caminho. Tipos e evidências no [registro do dashboard](superpowers/execution/2026-10-16-financy-dashboard.md).

O desenvolvimento também recebeu `20261016183142_financy_transaction_conflicts.sql`, uma vez pelo MCP, com versão conciliada para o timestamp gerado pelo CLI após comparar o SQL aplicado. Não reaplicar por outro caminho. A RPC `change_transaction` compara o snapshot original sob bloqueio da linha e recusa alteração/exclusão de registro removido ou modificado; é `security invoker`, sujeita à RLS e executável somente por authenticated. Os tipos gerados incluem essa RPC. Evidências, comandos e limpeza estão no [registro de transações](superpowers/execution/2026-10-16-financy-transactions.md).

Para integração, configure `.env.test.local` com `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `FINANCY_DEV_PROJECT_REF` do desenvolvimento. Rode `pnpm test:integration`. Configuração separada dos unitários; o guard exige URL exata e referência `gorymmpnavtudztnasny`, além de chave publicável, antes de criar contas. As operações testadas usam somente essa chave e JWTs reais de Alice/Bob ou cliente sem sessão; nenhuma chave administrativa.

A integração cria contas `financy-data-alice-<runId>@example.com` e `financy-data-bob-<runId>@example.com`, registra IDs e execução em `test-fixtures/finance-users.jsonl` (ignorado, sem senhas/JWTs), remove as linhas financeiras e encerra as sessões ao terminar. O manifesto fica fora de `test-results`, que o Playwright limpa a cada execução. A exclusão das contas Auth exige administração separada: conferir os IDs do manifesto e os e-mails exatos da execução, verificar ausência de linhas dependentes e remover somente esses IDs no desenvolvimento. Falhas de limpeza são reportadas pelo teste; não fazer limpeza ampla por prefixo. As contas de cada entrega são tratadas nos respectivos registros de execução.

O E2E de cadastro registra o ID diretamente da resposta do signup, antes de verificar navegação; usa o mesmo manifesto e padrão de e-mails Alice/Bob da integração. A jornada integrada recebe credenciais efêmeras das fixtures apenas em memória e faz login pela interface. Artefatos locais de navegador podem conter sessões e permanecem ignorados pelo Git; nunca publicá-los. Nenhum teste depende de caixa de e-mail.

Integração e Playwright aplicam o guard também ao carregar suas configurações, antes de servidor/fixtures. A referência e URL exatas de desenvolvimento são obrigatórias; uma chave secreta é recusada. Playwright mantém `reuseExistingServer: false` e `--strictPort`. Testes unitários comprovam rejeição da configuração de produção sem rede; a revisão integrada comprovou recusa de uma porta ocupada por servidor desconhecido, sem afrouxar as travas.

Na [revisão integrada](superpowers/execution/2026-10-16-financy-integrated-review.md), 155 unitários, 19 integrações e 15 E2E passaram. Limpeza administrativa das 35 contas identificadas da revisão, após conferir ausência de dependências: uma sessão residual removida com seus refresh tokens, depois 35 contas. Consulta final limitada aos IDs: zero contas, sessões, categorias e transações. JWT emitido pode permanecer válido até expirar mesmo após revogação da sessão. Não houve alteração em produção ou publicação.

## Hospedagem

Hospedagem planejada: Vercel Hobby e repositório público. Em 16/10, o checkout não tem remote Git, `vercel.json` ou vínculo `.vercel/project.json`; GitHub/Vercel remotos não foram reconsultados, portanto não se afirma sua inexistência. O prompt 8 deve preparar alvos, revisar segredos/histórico, commit e variáveis Preview/Production, conferir estado/migrations/Auth de produção e configurar fallback SPA e rollback. Publicação exige execução autorizada própria. Projetos Supabase Free podem pausar por inatividade; retomar pelo painel quando necessário, sem automações de atividade artificial.

## Candidata à release — 17/10/2026

O usuário escolheu criar o repositório público `RodrigoGedam/financy` e projeto Vercel `financy` na conta `rodrigogedam`. O antigo `RodrigoGedam/ftr-financy`, público e com backend GraphQL/Prisma, não é remoto deste checkout e será preservado. Nenhum desses novos alvos foi criado nesta fase. Branch local `feat/financy-v1`, HEAD `5b398426e51662e06308cccf294820150a3b17d8`, com dashboard/revisão e preparação ainda não commitados. Não há `origin` ou `main` local. Commit e envio dependem da autorização da lista concreta, não da escolha do nome.

Vercel: conta identificada como Hobby; a listagem sem escopo retorna somente `portfolio`. O escopo padrão confirmado é `rodrigogedams-projects`, ID `team_GEBnCB8faol74Ab23BukVkI5`; consulta explícita retorna 403. CLI Vercel não disponível e painel sem login. É necessário restabelecer acesso e reconsultar esse escopo antes de criar `financy`, evitando duplicata. Não se inferiu inexistência no escopo negado.

Configuração local pronta: raiz do repositório, framework Vite, Node 24, pnpm 12.4.2, instalação `pnpm install --frozen-lockfile`, build `pnpm build`, saída `dist`, rewrite `/(.*)` → `/index.html` em `vercel.json`. Sem funções, CI adicional, domínio pago ou upgrade. `.vercelignore` exclui variáveis locais, fixtures geradas/traces, backups e o grafo local; `.gitignore` também exclui `graphify-out/` sem apagar os arquivos existentes. Fontes de testes permanecem disponíveis ao compilador: as configurações raiz e um unitário importam `tests/fixtures/environment.ts`. Esses fontes não são sessões ou dados gerados e não entram no bundle Vite.

### Variáveis e URLs por ambiente

| Alvo | `VITE_SUPABASE_URL` | `VITE_SUPABASE_PUBLISHABLE_KEY` | Auth |
| --- | --- | --- | --- |
| Local / Vercel Development | `https://gorymmpnavtudztnasny.supabase.co` | Chave publicável ativa do desenvolvimento | Site URL local `http://127.0.0.1:5173` |
| Vercel Preview | A mesma URL de desenvolvimento | Chave publicável de desenvolvimento | Adicionar somente origens/URLs Preview exatas após sua atribuição; sem curingas |
| Vercel Production | `https://bqkmhzrrfurphiikylpa.supabase.co` | Chave publicável ativa de produção | Substituir Site URL local pela origem HTTPS canônica atribuída ao projeto |

Uma chave moderna publicável ativa foi confirmada em cada projeto, sem registrar seus valores. Não cadastrar `FINANCY_DEV_PROJECT_REF` na Vercel; serve somente à trava dos testes. Não cadastrar senhas de banco, service_role ou tokens de gerenciamento no frontend, principalmente sob `VITE_`. Definir variáveis nos ambientes corretos antes do build e reconferir o destino incorporado sem imprimir a chave. Preview não recebe credenciais de produção. Alterar variável exige novo build; não promover um bundle Preview com ambiente de desenvolvimento para Production.

As URLs públicas ainda não foram atribuídas: não prometer `financy.vercel.app` nem registrar domínio presumido. O login atual usa senha e não fornece `redirectTo`, OAuth, recuperação ou confirmação por e-mail; não inventar uma rota callback. Manter as allowlists mínimas, registrando URLs exatas se necessárias ao fluxo, sem wildcard. Desenvolvimento conserva a Site URL local e recebe somente os Previews autorizados; produção não recebe localhost ou URLs Preview. Mudanças no Auth fazem parte da confirmação da release.

### Banco: comparação e aplicação em um único caminho

Leitura em 17/10: ambos os projetos existentes estão ACTIVE_HEALTHY, PostgreSQL 17.11, São Paulo. Desenvolvimento tem as três versões e seu SQL corresponde aos arquivos locais após normalizar finais de linha/espaço final. Produção não tem histórico de migrations, tabelas/views/sequências/funções em `public`, funções em `private` ou usuários Auth. Isto descreve somente o que foi consultado, não todos os recursos internos do Supabase. Nenhum objeto foi alterado.

Aplicar em produção somente após autorização, nesta ordem:

1. `20261015182208_financy_core.sql`: tabelas, constraints, triggers, políticas/grants e RPC de escrita.
2. `20261016183142_financy_transaction_conflicts.sql`: proteção de edição/exclusão concorrente.
3. `20261016190434_financy_dashboard.sql`: agregação mensal/histórica.

Reconferir schema/histórico imediatamente antes. Usar um único mecanismo para aplicar e registrar as versões; preferir o CLI já usado pelo projeto (`pnpm dlx supabase@2.121.0`) com credenciais configuradas com segurança pelo operador. `supabase link --project-ref bqkmhzrrfurphiikylpa`, `supabase migration list` e `supabase db push --dry-run` devem indicar somente as três migrations acima, sem drift. O dry-run pode depender de autenticação e criar vínculo local; não foi executado nesta preparação. Só então `supabase db push`. Não repetir pelo MCP depois de um push; se o caminho disponível mudar, registrar o mecanismo e conferir história/SQL antes de qualquer nova aplicação. Não fazer reset ou reparo cego do histórico para esconder divergência. Após aplicar, conferir versões, SQL, RLS, grants, FK/constraints e permissões das RPCs por consultas de catálogo, sem fixtures em produção.

### Recuperação de banco

As três migrations são aditivas no schema alvo observado; nenhuma apaga dados ou objetos existentes. Se a reconferência encontrar dados/objetos conflitantes ou exigir operação com risco de perda, interromper essa operação, identificar dependências, preparar exportação e solicitar autorização específica. A autorização de publicação não cobre reset ou perda de dados.

Procedimento preparado, não executado: com CLI autenticado/vinculado explicitamente a produção e Docker disponível para pg_dump, exportar schema para `backups/financy-prod-schema.sql` e dados necessários para `backups/financy-prod-data.sql` usando `supabase db dump --file ...` e `supabase db dump --data-only --use-copy --file ...`; exportar papéis personalizados separadamente quando existirem. O dump padrão do CLI exclui schemas gerenciados como Auth/Storage e não contém dados por padrão: ele não é uma cópia integral do serviço. Inventariar e preparar recuperação específica desses recursos se uma operação os afetar, proteger os arquivos fora do Git/Vercel e conferir hashes, integridade e restauração em ambiente descartável antes da operação arriscada. Não enviar URIs/senhas em argumentos ou logs. Sem exportação/restauração executada nesta fase, não há promessa de recuperação validada.

### Execução autorizada e smoke test

Depois da confirmação da candidata: resolver privacidade do e-mail de autoria do histórico, conferir conteúdo/hash, criar commit de release e branch estável `main`, criar/vincular o novo repositório público e projeto Vercel confirmado, configurar variáveis por ambiente, aplicar migrations uma vez, configurar Site URL exata e gerar deployment Production da revisão aprovada. Não criar alvos duplicados se aparecerem na reconferência. Não acionar deploy automático antes de preparar banco e variáveis.

Registrar SHA final e ID/URL/state do deployment. Somente READY seguido de verificação HTTP/navegador permite chamar de publicado. Conferir `/`, `/login`, `/cadastro`, `/perfil`, `/categorias` e `/transacoes?month=all&page=1`, incluindo acesso direto e reload, assets e redirecionamento de visitante nas rotas privadas. Fazer apenas GET/leitura; não enviar formulário, criar contas ou lançar transações. Registrar que CRUD/RLS foram validados em desenvolvimento, não alegar CRUD de produção. Se autenticação real em produção exigir criar conta, solicitar autorização específica e identificada antes.

Se uma fase falhar, registrar quais objetos/migrations/variáveis/deployment já existem e quais ainda faltam. Reconferir antes de retomar, sem reaplicar ou sobrescrever às cegas. Não marcar publicado enquanto o deployment não estiver confirmado.

### Rollback do frontend

Guardar o ID e URL do deployment Production anterior, se houver. Com autorização operacional, `vercel rollback <id-ou-url-anterior> --scope rodrigogedams-projects` volta a servir esse artefato; conferir novamente as rotas e o ambiente embutido. Rollback pode interromper atribuições automáticas até nova promoção: conferir o estado do projeto. Não promover um Preview com destino de dados diferente. Na primeira publicação não existe deployment anterior: registrar essa limitação e corrigir/reimplantar uma revisão aprovada, sem prometer rollback instantâneo.

Rollback de frontend não reverte migrations, transações ou configurações do Auth. A recuperação do banco é um procedimento separado, dependente de exportação/restauração validada e autorização para o impacto real. Esta etapa não executou rollback ou recuperação.

Fontes verificadas: [Vercel Vite/SPA](https://vercel.com/docs/frameworks/frontend/vite), [Supabase redirects](https://supabase.com/docs/guides/auth/redirect-urls), [CLI dump](https://supabase.com/docs/reference/cli/supabase-db-dump), [CLI push](https://supabase.com/docs/reference/cli/supabase-db-push). O changelog atual foi consultado; a retirada de cifras TLS legadas a partir de novembro não exige mudar a stack moderna usada nos testes.
