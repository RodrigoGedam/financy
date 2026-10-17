# Financy

Organização de finanças pessoais individuais, com prioridade para desktop. Projeto pessoal para portfólio e experimentação de desenvolvimento com IA.

## Estado atual

A [revisão integrada em desenvolvimento](docs/superpowers/execution/2026-10-16-financy-integrated-review.md) passou com 155 unitários, 19 integrações reais e 15 E2E, além de typecheck, lint e build. Inclui matriz AUTH/CAT/TX/DASH/LIST, correções das travas de teste e rastreabilidade de fixtures, inspeção em 1024/1440 px e limpeza conferida. Próximo: prompt 8, preparação da publicação; produto ainda não publicado.

A [candidata à publicação de 17/10](docs/superpowers/execution/2026-10-17-financy-release.md) prepara o novo destino público `RodrigoGedam/financy` e projeto Vercel `financy`, escolhidos pelo usuário. Os alvos ainda não foram criados/vinculados. Produção foi consultada somente em leitura: três migrations financeiras pendentes e Site URL do Auth ainda local. A execução aguarda autorização da lista de release e acesso ao escopo Vercel. O repositório antigo `ftr-financy` será preservado.

Base React/TypeScript/Vite, cadastro, login, sessão persistente, edição de nome e logout local com Supabase Auth. Categorias têm criação, edição, exclusão protegida e contagem de transações de todo o histórico. Transações têm CRUD, dinheiro textual exato, proteção contra conflitos, filtros na URL e paginação remota. Dashboard apresenta saldo histórico, receitas/despesas mensais, cinco maiores categorias de despesa e cinco transações recentes, calculados no PostgreSQL.

A tarefa 2 adiciona o schema financeiro em desenvolvimento, com RLS, integridade e transporte decimal textual validados pela Data API. Consulte o [registro de execução](docs/superpowers/execution/2026-10-15-financy-data.md).

A [tarefa 5](docs/superpowers/execution/2026-10-16-financy-dashboard.md) valida agregados exatos com mais de mil registros, saldo negativo, mês vazio, isolamento e resposta atrasada. A regressão passou com 153 unitários, 19 integrações reais e 12 E2E pertinentes. Testes específicos: `pnpm test:integration -- tests/integration/dashboard.test.ts` e `pnpm exec playwright test tests/e2e/dashboard.spec.ts`. Publicação continua pendente.

A [tarefa 4](docs/superpowers/execution/2026-10-16-financy-transactions.md) foi validada com 151 unitários, 16 integrações reais e oito E2E de acesso/transações. Fluxos específicos: `pnpm test:integration -- tests/integration/transactions.test.ts` e `pnpm exec playwright test tests/e2e/transactions.spec.ts`. Fixtures somente em desenvolvimento, com limpeza dos próprios dados.

A [tarefa 3](docs/superpowers/execution/2026-10-16-financy-categories.md) usa catálogo fechado e contagens agregadas na Data API, sem baixar o histórico de transações. Testes específicos: `pnpm test:integration -- tests/integration/categories.test.ts` e `pnpm exec playwright test tests/e2e/categories.spec.ts`.

## Executar localmente

Requisitos: Node 22 (a partir de 22.13) ou Node 24+ e pnpm 12.4.2. Desenvolvido com Node 24.

1. Rode `pnpm install --frozen-lockfile`.
2. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com o projeto **de desenvolvimento**.
3. Rode `pnpm dev` e abra o endereço exibido no terminal.

Use somente a chave publicável no frontend. Credenciais administrativas, senhas, sessões e arquivos `.env.local` não devem ser versionados. Sem as variáveis, a interface exibe orientação e não envia credenciais.

## Comandos

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Servidor local |
| `pnpm typecheck` | Verificação TypeScript |
| `pnpm lint` | Análise estática |
| `pnpm format` | Aplicar a formatação do Prettier |
| `pnpm format:check` | Conferir formatação sem alterar arquivos |
| `pnpm test` | Testes unitários de comportamento |
| `pnpm test:integration` | RLS, integridade e decimais no Supabase de desenvolvimento |
| `pnpm test:e2e` | Fluxos no Chromium e Supabase de desenvolvimento |
| `pnpm build` | Build em `dist/` |
| `pnpm preview` | Conferir o build local |

Para os testes de navegador, instale o Chromium com `pnpm exec playwright install chromium`. Crie `.env.test.local` com `FINANCY_DEV_PROJECT_REF=gorymmpnavtudztnasny` e as variáveis publicáveis de desenvolvimento. Integração e Playwright validam referência e URL exatas ao carregar a configuração, antes de iniciar servidor ou fixtures. O Playwright inicia seu próprio servidor e recusa uma porta 5173 já ocupada. Contas fictícias `financy-data-alice-<runId>@example.com` e `financy-data-bob-<runId>@example.com` têm seus IDs registrados em `test-fixtures/finance-users.jsonl`, ignorado pelo Git, sem senhas/JWTs. Limpeza administrativa somente pelos IDs e e-mails exatos da execução, depois de conferir dependências e sessões, conforme `docs/operations.md`.

## Formatação

Prettier usa tabs para indentação, com largura visual de 4 espaços (`useTabs: true`, `tabWidth: 4`), aspas simples e sem ponto e vírgula. A configuração está em `.prettierrc.json`; `.editorconfig` orienta editores compatíveis. YAML e Markdown usam espaços conforme suas convenções. O Prettier pode usar espaços para alinhamento mesmo quando a indentação usa tabs.

Execute `pnpm format` para aplicar ou `pnpm format:check` para conferir. A configuração não reformata automaticamente os arquivos existentes: eles podem ser apontados pelo check até a primeira aplicação. O formatador respeita `.gitignore`; lockfile, tipos gerados do Supabase e assets são excluídos por `.prettierignore`. SQL não é formatado pelo Prettier instalado, sem plugins adicionais.

## Stack

React, TypeScript, Vite, pnpm, TanStack Router/Query/Form/Table, Tailwind CSS, componentes baseados no shadcn/ui, CVA, tailwind-merge, Lucide e Supabase Auth/PostgreSQL. TanStack Table usa paginação manual com consulta remota de dez registros.

Estado de sessão em um provider único; dados remotos em TanStack Query; limpeza e cancelamento do cache na troca de identidade. O metadata do nome serve apenas para apresentação. A autorização dos dados financeiros usa RLS no PostgreSQL.

## Publicação e operação

`vercel.json` configura Vite, instalação pelo lockfile, build `pnpm build`, saída `dist` e fallback para `index.html`, permitindo acesso direto a `/transacoes`, `/categorias` e `/perfil`. Usar Node 24 no projeto Vercel, pnpm 12.4.2 definido em `packageManager` e diretório raiz do repositório. Não há CI adicional ou serviços novos.

| Ambiente do frontend | Supabase | Variáveis do bundle |
| --- | --- | --- |
| Local / Vercel Development / Preview | financy-dev — `gorymmpnavtudztnasny` | `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` do desenvolvimento |
| Vercel Production | financy-prod — `bqkmhzrrfurphiikylpa` | As mesmas duas variáveis, com valores exclusivos de produção |
| Integração / E2E | Somente financy-dev | As duas variáveis e `FINANCY_DEV_PROJECT_REF`, em `.env.test.local` |

Vite incorpora as variáveis durante o build: mudar o ambiente exige novo build. Não promover um bundle de Preview com credenciais de desenvolvimento para Production. Não enviar `.env.local`, sessões, traces, backups ou `graphify-out/` para o GitHub/Vercel; `.gitignore` e `.vercelignore` protegem esses artefatos. Segredos administrativos nunca recebem prefixo `VITE_` e não são necessários ao frontend.

URLs exatas do Auth, migrations, verificação não destrutiva após deploy e rollback estão em [operações](docs/operations.md). Nenhuma suíte que cria contas/dados pode rodar em produção. Esta candidata foi validada localmente; URL/deployment público ainda pendentes.

## Referências e plano

- [Figma: design](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3-376).
- [Figma: style guide](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3-377).
- [Especificação](docs/superpowers/specs/2026-10-14-financy-v1.md).
- [Plano](docs/superpowers/plans/2026-10-14-financy-v1.md).
- [Referência visual local](DESIGN.md).
- [Operação e ambientes](docs/operations.md).

## Limitações desta etapa

Sem recuperação de senha ou alteração de e-mail/senha na interface. Cadastro não confirma a propriedade do e-mail, por decisão do escopo. Logout é local e não revoga instantaneamente um JWT emitido. Projetos Supabase Free podem pausar por inatividade. Esta entrega ainda não está publicada na Vercel.
