# Financy — dashboard (tarefa 5, prompt 6)

## Base, escopo e decisões

Execução em 16/10/2026 na branch `feat/financy-v1`, conforme contrato comum de `docs/prompts-implementacao-financy.md`, especificação DASH-01–03 e tarefa 5 do plano. O estado anterior foi commitado primeiro por solicitação do usuário: **`5b39842` — `feat: add transactions with filters and pagination`**, com árvore limpa após o commit. Esta implementação do dashboard permanece como alteração de trabalho.

Antes de implementar, categorias e transações passaram novamente nos seis testes reais dos respectivos arquivos de integração. Histórico remoto conferido: migrations `20261015182208` e `20261016183142`, ambas as tabelas com RLS e oito políticas; `get_dashboard` ainda ausente. O histórico do guia de 15/10 não foi tomado como estado atual.

Execução inline, reaproveitando a arquitetura aprovada: AppShell, Button, Input, cliente Database/Supabase, AuthProvider, QueryClient, catálogo e utilitários monetários/de datas. Nenhuma dependência nova, camada genérica, cálculo financeiro no navegador ou mudança de autenticação. Escritas e fixtures exclusivamente em **`gorymmpnavtudztnasny`**; produção e publicação fora da etapa.

Ruling: usar o mês como estado local da página, inicializado por `todayInSaoPaulo`; o contrato não exige URL para o dashboard. O link para transações usa o normalizador existente com o mês selecionado, página 1 e demais filtros limpos. Ao reentrar na página, começa novamente no mês atual.

Ruling: acrescentar `transaction_count` às categorias do ranking, pois o frame apresenta quantidades e o pedido exige validar contagens sobre o conjunto completo. É a quantidade de **despesas daquele mês e categoria**, explicitamente rotulada; receitas não entram. Nenhuma coluna nova foi criada. `topCategories` e `recentTransactions` mantêm as chaves propostas no plano, e recentes reutilizam `Transaction` com categoria atual.

## Migration e autorização

CLI Supabase **2.121.0** gerou `supabase/migrations/20261016190434_financy_dashboard.sql`. Aplicação única pelo MCP autenticado em desenvolvimento; o CLI local não tem login administrativo. O MCP registrou inicialmente `20261016190610`. Após comparar os statements remotos com o arquivo local — **2.831 caracteres idênticos**, aparando espaços externos — somente a versão no histórico foi conciliada para `20261016190434`. Não houve segunda aplicação do DDL nem alteração de migrations antigas.

`public.get_dashboard(p_month date) returns jsonb`:

- Exige `auth.uid()` e argumento não nulo/finito cujo dia seja 1; recusa argumento inválido com `22023` e falta de autenticação com `42501`.
- `STABLE`, `SECURITY INVOKER`, `search_path=''`, tabelas e funções de aplicação qualificadas. RLS continua ativa, com filtro explícito pelo usuário autenticado; nenhuma autorização por `user_metadata`.
- Execução revogada de PUBLIC, anon, authenticated e service_role; somente authenticated recebe EXECUTE. Catálogo confirmou ACL postgres/authenticated, invoker, estabilidade, search_path e oito políticas intactas.
- Saldo soma receitas menos despesas de todo o histórico. Demais agregados usam `[primeiro dia, primeiro dia seguinte)`; SQL materializa o conjunto mensal autorizado e calcula somas/contagens antes dos limites de listas.
- Ranking de despesas: soma decrescente, nome e ID como desempate; até cinco categorias. Recentes: `occurred_on desc, created_at desc, id desc`, até cinco, receitas e despesas.
- Valores em `numeric` existente, sem typmod novo ou teto arbitrário. `trunc(...,2)::text` canoniza somente a apresentação de somas de linhas já validadas com até duas casas; não usa máscara de largura limitada. Vazio retorna `0.00`; arrays vazios retornam `[]`.

Referências atuais consultadas: [funções e privilégios Supabase](https://supabase.com/docs/guides/database/functions), [agregados PostgreSQL 17](https://www.postgresql.org/docs/17/functions-aggregate.html). Tipos da RPC obtidos pelo gerador Supabase e adicionados a `Database`, com retorno `Json`; o adapter valida o JSON antes de produzir `DashboardSummary`. Dinheiro numérico, escala inválida, catálogo desconhecido, contagem não inteira/insegura e listas acima de cinco são recusados, sem casts para ocultar numeric como string.

Security Advisor: nenhuma nova advertência de tabelas/funções. Permanece o aviso preexistente de [proteção contra senhas vazadas desativada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection); nenhuma configuração de Auth foi alterada.

## Frontend e referência visual

Criados `src/features/dashboard/{types,api,queries}.ts`, `api.test.ts` e `dashboard-page.tsx`; `/` substitui o placeholder. `getDashboard(month, signal?)` realiza uma RPC com o primeiro dia do mês. Hook com chave `['finance', userId, 'dashboard', month]`, sessão obrigatória, AbortSignal e sem dados de outro mês como placeholder. A proteção existente de troca de conta permanece.

Mutations de categorias e transações já invalidam `['finance', userId]`; os E2E demonstraram que isso atualiza cartões, ranking, recentes, nome e contagens ao retornar ao dashboard. Sem atualização otimista ou download do histórico. A resposta mensal contém só três totais, até cinco categorias e até cinco transações, não as linhas usadas nas somas.

Figma consultado com design context completo e screenshot do [frame `3103:1987`](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3103-1987). Cartões `3103:2206`, `3103:2218`, `3103:2231`; recentes `3103:2246`; ranking `3103:2350`. Reutilizados identidade, cores, ícones Lucide correspondentes e catálogo já verificado; nenhuma imagem nova necessária.

Adaptações funcionais, não observações do Figma: cabeçalho com seletor mensal (ausente no mock), saldo identificado como Todo o histórico, período em cada bloco, ranking rotulado Maiores despesas e contagem como despesas, datas com quatro dígitos no ano. Nome/cor/ícone vêm das relações atuais. Em 1024, linhas de recentes e valores do ranking usam espaço adicional vertical para manter controles e textos legíveis; valores muito extensos podem quebrar linha sem perder dígitos. Sem alegação de fidelidade pixel a pixel para esses ajustes ou para o seletor nativo.

Inspeção em **1024/1440 px**, sem rolagem horizontal da página. Capturas ignoradas pelo Git: `test-results/dashboard-1024.png` e `dashboard-1440.png`. Teclado: foco visível no mês, passagem pelos segmentos nativos e ativação de Ver todas com Enter. Carregamento identifica o novo período e oculta cartões antigos; vazio separa ausência de transações/despesas; erro recuperável informa mês e oferece Tentar novamente.

## Evidências de verificação

| Verificação | Resultado |
| --- | --- |
| RED integração inicial | Falhou com `PGRST202`, RPC ainda inexistente |
| RED unitário inicial | Falhou por ausência de `./api` |
| Pré-requisitos categorias/transações | 6 integrações passaram |
| `pnpm test` | **153 testes**, nove arquivos, passaram |
| `pnpm test:integration` | **19 testes**, cinco arquivos, passaram; 95,64 s |
| `pnpm exec playwright test tests/e2e/dashboard.spec.ts tests/e2e/categories.spec.ts tests/e2e/transactions.spec.ts tests/e2e/access.spec.ts` | **12 testes passaram**, 2,4 min |
| `pnpm typecheck` / `pnpm lint` | Passaram sem avisos |
| Prettier nos arquivos novos do dashboard e seus testes | Passou |
| `pnpm build` | Passou; principal 320,74 kB / 102,49 kB gzip; dashboard 8,20 kB / 2,59 kB gzip; nenhum chunk acima de 500 kB |

Integração financeira real, com chave publicável e sessões Alice/Bob/anônimo:

- Receita anterior `100.00`, mensal `50.00`, despesa mensal `20.00`: saldo `130.00`; limites de dezembro/janeiro e mês vazio preservam o saldo histórico.
- **1.005 despesas de `0.01`**: despesa `10.05`, quantidade 1.005 na categoria, cinco recentes; mais cinco categorias empatadas elevam total para `10.10`, com ranking limitado a cinco e desempate verificado. O limite padrão de mil linhas da Data API não limita agregação.
- Receita `9007199254740993.01` e despesa `9007199254740993.02`: API devolve strings exatas, inclusive centavos e diferença no saldo. Outra conta com despesa de `0.01` recebe saldo `-0.01`, sem dados de Alice; anônimo recebe `42501`.
- Argumentos não primeiros dias, infinitos e data inexistente são recusados. CRUD altera os totais esperados; renomear categoria altera ranking/recentes sem cópia histórica.

E2E verificou ranking só com despesas, cinco recentes e sua ordem, link para listagem com o mês, CRUD completo com atualização dos agregados/contagens, renomeação, erro de rede, vazio, troca rápida de meses e troca real para Bob durante resposta pendente de Alice. Interceptações só atrasam/abortam transporte; dados e autorização são reais. A importação do cliente app via Vite no teste serve somente para trocar sessões reais. A primeira tentativa de teclado pressupunha um único Tab no `input month`; corrigido o teste para respeitar os segmentos nativos, sem mudar a aplicação.

## Limpeza e limites

Fixtures guardadas pela referência e URL exatas de desenvolvimento. Removeram suas linhas financeiras e encerraram sessões. Limpeza administrativa posterior restrita aos IDs/runIds do manifesto e e-mails Alice/Bob exatos: **32 contas fictícias removidas**, sem limpeza ampla por prefixo. A consulta final extensa por IDs excedeu o prazo da revisão automática de permissões; repetida uma vez com somente contagens agregadas do desenvolvimento, confirmou **zero contas, sessões, categorias e transações**. Manifesto ignorado preservado para rastreabilidade, sem senhas ou tokens.

Não foi executada a suíte de cadastro/login que cria contas Auth fora dessas fixtures; a regressão de acesso foi executada. Capturas são do Chromium; outros navegadores e publicação não foram validados. O mês segue o intervalo dos helpers existentes (anos 0001–9999); quantidades JSON são conferidas como inteiros seguros de JavaScript, dinheiro permanece textual. Histórico arbitrariamente grande além do ensaio de mil linhas não recebeu benchmark de carga. Sem Realtime: mudanças externas aparecem na próxima consulta; mutations locais invalidam o prefixo financeiro.

Revisão independente fresca da implementação: nenhum achado material; revisão somente leitura, sem substituir testes ou inspeção remota. **Tarefa 5 concluída em desenvolvimento. Próximo prompt: 7 — revisão integrada**, sem início automático e sem publicação.
