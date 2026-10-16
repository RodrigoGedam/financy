# Financy — transações (tarefa 4, prompt 5)

## Escopo e base

Execução em 16/10/2026, branch `feat/financy-v1`. Antes de implementar, o estado anterior foi commitado por solicitação do usuário: `48de98a` (`feat: add exact money date and transaction search utilities`); árvore limpa após o commit. Esta entrega permanece como alteração de trabalho para revisão.

Contrato comum de `docs/prompts-implementacao-financy.md` aplicado. Reutilizados AppShell, Button, Input, Supabase tipado, AuthProvider, QueryClient, TanStack Form e catálogo de categorias existente. Autenticação e dashboard não foram modificados. Escritas remotas restritas a `gorymmpnavtudztnasny`, com contas fictícias exclusivas; produção não foi alterada.

## Implementação e contratos

- `src/features/transactions/`: API específica, hooks, tipos, modal de criação/edição, confirmação de exclusão e página; `/transacoes` substitui o placeholder.
- Receita/despesa realizada com descrição aparada, valor positivo textual, data de calendário até hoje em São Paulo e categoria obrigatória. Validação acessível por campo no TanStack Form; banco continua como autoridade. Conta sem categorias recebe link para criá-las.
- Consulta no banco com filtros combináveis, contagem exata e dez linhas; ordenação `occurred_on`, `created_at`, `id` decrescente. A contagem inicial sem linhas permite corrigir até uma página cujo offset excederia um inteiro seguro. A seleção paginada também devolve contagem; se uma exclusão concorrente invalidar a página, consulta novamente a página válida. Sem baixar histórico para paginar ou contar.
- Dinheiro na leitura por `amount::text`, normalizado textualmente; criação pela RPC `save_transaction` com argumento textual. Edição/exclusão usam nova RPC com snapshot textual. A relação de categoria é consultada a cada leitura; não há cópia de nome/cor/ícone nas transações.
- Busca literal, sem concatenação de SQL: operador Data API `imatch` com todos os metacaracteres de regex escapados. A primeira integração demonstrou que ILIKE converte `*` em `%` apesar de escape; a implementação foi corrigida. `%`, `_`, `*`, barra invertida, acentos, vírgula, parênteses e aspas foram testados contra a API real. Referência: [operadores PostgREST](https://docs.postgrest.org/en/stable/references/api/tables_views.html#operators).
- Search params validados pelo Router são a consulta aplicada. O formulário submete os filtros em conjunto e reinicia página 1; limpar também. Parser/serializer tratam `q` como texto literal, preservando dígitos grandes e aspas em URL direta e round-trip. Entrada direta usa todos os meses; mês recebido por URL permanece.
- Cache `['finance', userId, 'transactions', filters]`; mutations invalidam `['finance', userId]`. AbortSignal encaminhado às consultas; sem `placeholderData` de outro filtro. A limpeza de identidade existente continua em vigor.
- TanStack Table **8.21.3**, fixado no manifesto e lockfile após consulta do registry: peer React/React DOM `>=16.8`, compatível com os instalados. API v8 documentada em [paginação manual](https://tanstack.com/table/v8/docs/guide/pagination). `manualPagination`, `rowCount`, tamanho 10 e apenas `getCoreRowModel`; sem paginação duplicada. React Compiler não está habilitado; o componente declara `use no memo` e a exceção de lint para a instância mutável v8 está restrita à chamada, sem repassá-la a componentes memoizados.

Adaptações necessárias às interfaces propostas: `TransactionPage` inclui `page` efetiva; edição e exclusão recebem a transação original em vez de somente ID para detectar conflitos. Não foi criada camada genérica de repositórios, dependência monetária ou novo teto de dinheiro.

## Banco e migrations

Antes de escrever, foi encontrado o histórico `20261015182208_financy_core`. RLS de ambas as tabelas, oito políticas de dono e as constraints da entrega 2 continuam existentes; a suíte real de segurança/integridade foi repetida.

CLI Supabase 2.121.0 gerou `20261016183142_financy_transaction_conflicts.sql`. Aplicada **uma vez** pelo MCP no desenvolvimento; o CLI local permanece sem login administrativo. O MCP registrou inicialmente versão `20261016183329`; após conferir o conteúdo, somente o número no histórico foi reconciliado com o nome local do CLI. Não houve segundo caminho de aplicação do DDL. Comparação direta do SQL local e dos statements remotos, aparando espaços externos: conteúdo idêntico (1.543 caracteres).

`change_transaction` bloqueia a linha com `SELECT ... FOR UPDATE`, compara os cinco campos originais e só então atualiza/exclui. Snapshot divergente gera `P0001`; linha removida/invisível, `P0002`. `SECURITY INVOKER`, objetos qualificados, `search_path=''`, execução revogada de PUBLIC/anon/service_role e concedida a authenticated. Consulta de catálogo confirmou ACL apenas postgres/authenticated e oito políticas intactas. Sem mudanças nas constraints, grants de tabelas ou regras monetárias. Tipos da função obtidos pelo gerador Supabase e integrados a `Database`, sem casts para disfarçar numeric como string.

## Referência visual e acessibilidade

Figma consultado nesta execução com design context e screenshots: [listagem `3104:362`](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3104-362) e [modal `3107:4295`](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3107-4295). Tokens e catálogo de `DESIGN.md` reutilizados. Não foram necessárias imagens novas.

Inspeção de listagem e modal em 1024/1440 px, sem rolagem horizontal da página. Coluna monetária adaptada em 1024 para apresentar `9.007.199.254.740.993,01` inteiro. Valores ainda maiores podem quebrar linha, preservando todos os dígitos, sem truncamento. Evidências locais ignoradas: `test-results/transactions-{1024,1440}.png` e `test-results/transaction-dialog-{1024,1440}.png`.

Adaptações funcionais ao mock: período nativo `month` (vazio = todos), ações Aplicar/Limpar, Atualizar lista para recuperação de conflitos, datas com ano de quatro dígitos, dez linhas reais e controles primeira/anterior/próxima/última. Sem afirmar fidelidade pixel a pixel para estes controles nativos. Foco inicial na descrição, trap/escape/fechamento Radix, devolução ao disparador ou botão Nova transação quando a linha desaparece; exclusão inicia no Cancelar e informa descrição/valor. Revisão independente identificou ausência de associação dos erros aos campos; corrigida com validators, `aria-invalid`, `aria-describedby` e asserções E2E.

## Verificação

- Testes novos de API escritos antes do módulo: execução inicial falhou pela ausência de `./api`.
- `pnpm test`: **151 testes passaram**.
- `pnpm typecheck` e `pnpm lint`: passaram, sem avisos.
- Prettier nos dez arquivos TypeScript novos/estendidos de transações: passou. `git diff --check`: passou. Revisão dos arquivos da etapa não encontrou valores de credenciais embutidos.
- `pnpm test:integration`: **16 testes passaram**, quatro arquivos, incluindo concorrência simultânea real. Execução final em 74,04 s.
- `pnpm exec playwright test tests/e2e/transactions.spec.ts tests/e2e/access.spec.ts`: **8 testes passaram**. CRUD, validação associada, precisão, paginação, filtros, recarga/voltar/avançar, confirmação/cancelamento, falhas preservando campos, envio pendente único, categoria renomeada, contagem atualizada, página inválida após exclusão, resposta antiga de filtro e troca real de sessão enquanto a resposta de Alice está pendente. O teste importa o cliente real pelo servidor Vite exclusivamente para acionar `auth.setSession` com a sessão real de Bob; não substitui RLS por mocks.
- Falhas de rede e gates de resposta usam interceptação de transporte; os dados, JWTs e regras de autorização são reais. Integração cobre >10 registros, limites de mês, empate de datas/criação com desempate por ID, categorias atuais, dinheiro grande, recusas e preservação de linhas de outro usuário. Teste adicional dispara duas edições e duas exclusões simultâneas: exatamente uma vence em cada par; anônimo não executa a nova RPC.
- `pnpm build`: passou. Principal 315,23 kB (100,45 kB gzip), página de transações 65,38 kB (17,42 kB gzip), chunk compartilhado Button 261,00 kB (70,53 kB gzip). Nenhum chunk ultrapassou 500 kB; nenhum ajuste manual de bundling foi necessário.

## Limites e próximo passo

Validação remota nesta entrega é exclusivamente desenvolvimento. Não foi executada a suíte completa de cadastro/login com criação de contas nem testes de dashboard/publicação; a regressão de acesso foi executada. A busca literal não ganha índice especializado nesta etapa; eventual custo em históricos grandes depende de medição real. A aplicação não usa Realtime: alterações externas aparecem após nova consulta/Atualizar lista, e gravações sobre snapshot alterado são recusadas.

As fixtures removeram suas linhas financeiras e encerraram sessões. Após todos os testes, limpeza administrativa restrita aos IDs/runIds do manifesto e e-mails exatos Alice/Bob: **36 contas fictícias removidas**. Consulta final por todos esses IDs confirmou **zero contas, sessões, categorias e transações**. O manifesto ignorado foi preservado para rastreabilidade; nenhuma limpeza ampla por prefixo foi usada.

Próximo prompt: **6 — Dashboard**, sem início automático. Sem bloqueios desta etapa.
