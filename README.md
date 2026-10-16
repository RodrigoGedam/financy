# Financy

Organização de finanças pessoais individuais, com prioridade para desktop. Projeto pessoal para portfólio e experimentação de desenvolvimento com IA.

## Estado atual

Base React/TypeScript/Vite, cadastro, login, sessão persistente, edição de nome e logout local com Supabase Auth. Categorias têm criação, edição, exclusão protegida e contagem de transações de todo o histórico. Dashboard e transações continuam como rotas reservadas para as próximas entregas.

A tarefa 2 adiciona o schema financeiro em desenvolvimento, com RLS, integridade e transporte decimal textual validados pela Data API. Consulte o [registro de execução](docs/superpowers/execution/2026-10-15-financy-data.md).

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
| `pnpm test` | Testes unitários de comportamento |
| `pnpm test:integration` | RLS, integridade e decimais no Supabase de desenvolvimento |
| `pnpm test:e2e` | Fluxos no Chromium e Supabase de desenvolvimento |
| `pnpm build` | Build em `dist/` |
| `pnpm preview` | Conferir o build local |

Para os testes de navegador, instale o Chromium com `pnpm exec playwright install chromium`. Crie `.env.test.local` com `FINANCY_DEV_PROJECT_REF=gorymmpnavtudztnasny`. O teste que escreve contas valida a referência de desenvolvimento antes de enviar requisições; nunca o aponte para produção. O Playwright inicia seu próprio servidor e recusa uma porta 5173 já ocupada para evitar testar outro ambiente. O teste de autenticação cria contas fictícias identificadas por `financy-e2e-` e registra sessões somente nos artefatos locais ignorados pelo Git. Limpe somente as contas dessas execuções em desenvolvimento quando não forem mais necessárias.

## Stack

React, TypeScript, Vite, pnpm, TanStack Router/Query/Form, Tailwind CSS, componentes baseados no shadcn/ui, CVA, tailwind-merge, Lucide e Supabase Auth/PostgreSQL. TanStack Table entrará quando a interface de transações precisar dela.

Estado de sessão em um provider único; dados remotos em TanStack Query; limpeza e cancelamento do cache na troca de identidade. O metadata do nome serve apenas para apresentação. A autorização dos dados financeiros usa RLS no PostgreSQL.

## Referências e plano

- [Figma: design](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3-376).
- [Figma: style guide](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3-377).
- [Especificação](docs/superpowers/specs/2026-10-14-financy-v1.md).
- [Plano](docs/superpowers/plans/2026-10-14-financy-v1.md).
- [Referência visual local](DESIGN.md).
- [Operação e ambientes](docs/operations.md).

## Limitações desta etapa

Sem recuperação de senha ou alteração de e-mail/senha na interface. Cadastro não confirma a propriedade do e-mail, por decisão do escopo. Logout é local e não revoga instantaneamente um JWT emitido. Projetos Supabase Free podem pausar por inatividade. Esta entrega ainda não está publicada na Vercel.
