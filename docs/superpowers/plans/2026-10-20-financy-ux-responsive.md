# Financy UX Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para a execução nativa proposta, tarefa por tarefa, somente após revisão humana e pedido explícito de implementação. superpowers:subagent-driven-development é alternativa apenas se o usuário a escolher posteriormente. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar os seis requisitos de categorias, títulos, alinhamento e web responsiva com integridade financeira e a identidade visual atual.
**Architecture:** Evoluir componentes, queries e APIs existentes. Duas migrations coordenam títulos/descrição; a apresentação mobile usa os mesmos dados e handlers da apresentação desktop. Não duplicar lógica financeira.
**Tech Stack:** React, TypeScript, Vite, pnpm, TanStack Router/Query/Form/Table, Tailwind, Radix/ui existentes e Supabase Auth/PostgreSQL/Data API/RLS.
**Spec:** [Design proposto de 20/10](../specs/2026-10-20-financy-ux-responsive-design.md).

**Status:** plano rascunho para revisão, produzido por solicitação expressa junto com a especificação. Nenhuma caixa de execução está concluída. Aprovação da especificação → revisão do plano → pedido explícito de implementação. Não fazer commit destes documentos nesta etapa.

## Global Constraints

- Web responsiva mobile-first, preservando a experiência desktop.
- Títulos: categories.name e transactions.description, 1–20 pontos de código após trim; não criar segundo título.
- Descrição de categoria opcional, string/null; vazio normalizado para null, sem limite de 20.
- Preservar Inter, logos, sete cores, ícones, dinheiro textual exato, calendário de São Paulo e paginação/filtros na URL.
- Preservar RLS, proprietário, FK composta, exclusão protegida, snapshots concorrentes e cache por userId.
- Nenhuma dependência, store, camada, PWA/offline ou stack nova.
- Leituras legadas continuam válidas; nenhuma truncagem, renomeação, exclusão ou normalização retroativa automática.
- Testes de escrita somente local/desenvolvimento. Mudanças destrutivas e produção exigem autorização específica.
- Extensão de grants de description depende de decisão expressa; a proibição de alterar permissões permanece até essa decisão.
- Controles principais e ações financeiras: pelo menos 44×44 CSS px; conteúdo completo acessível por teclado e toque.
- Comandos e resultados esperados abaixo são futuros; nenhuma suíte ou migration foi executada neste planejamento.

## Review Focus

1. Legado acima de 20 continua legível e só pode ser atualizado com título corrigido; snapshot conserva a versão original. Provas T1/T5.
2. Emoji, acento combinante e NBSP/FEFF não podem produzir contagens diferentes entre UI e PostgreSQL. Provas T1.
3. Categoria sem descrição não quebra os parsers do dashboard/transações; limpar envia null e persiste após reload. Provas T2.
4. Valor exato muito longo e título sem espaços não deslocam a categoria central nem perdem conteúdo atrás de reticências. Provas T3/T5.
5. Teclado virtual, paisagem, zoom e mudança de breakpoint com modal aberto não escondem ações/foco nem alteram URL/estado. Provas T4–T6.

## 1. Dependências e ordem

**T0 (esta análise) → revisão da especificação → revisão do plano → autorização futura → T1 → T2 → T3 → T4 → T5 → T6.**

T1 e T2 alteram contratos compartilhados; T4/T5 mudam os mesmos estilos e modais. Trabalho sequencial evita conflitos e revalidação duplicada. T3 poderia ser isolado tecnicamente, mas o ganho não compensa um segundo checkout/integração para poucas regras de alinhamento.

A pendência de grant bloqueia apenas a persistência de T2: se o usuário mantiver a vedação, registrar R2 não autorizado e devolver o plano para ajuste; não inventar uma alternativa privilegiada. Não começar a implementação do restante silenciosamente com o escopo parcialmente rejeitado.

## 2. Modelos e esforços por tarefa

Verificado em **20/10/2026**. Fontes oficiais abertas: [modelos no Codex/Work](https://learn.chatgpt.com/docs/models), [GPT-6.1 Sol na API](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [GPT-6 Luna na API](https://developers.openai.com/api/docs/models/gpt-6-luna). A documentação indica Sol para trabalho complexo com custo inferior a Astra e Luna para tarefas focadas. Isso não é benchmark do Financy.

O catálogo local `C:/Users/Rodrigo/.codex/models_cache.json` anuncia `gpt-6.1-sol`, `gpt-6-luna`, `gpt-6-sol` e `gpt-6-astra`, com medium/high entre os esforços suportados. Catálogo/cache e capacidades expostas pela ferramenta não garantem disponibilidade atual na conta. Confirmar no seletor antes da futura execução. Não foram feitas chamadas para testar modelos nem alterado o modelo desta conversa.

Usar os IDs exatos abaixo na configuração; nomes exibidos como “GPT-6.1 Sol” podem ter outra apresentação no aplicativo. Esforço de raciocínio e modo de velocidade são controles distintos. Não prescrever Max/Ultra, preços ou tempos de conclusão.

| Tarefa                                               | Modelo recomendado          | Esforço | Justificativa breve                                                                                         | Alternativa e condição de troca                                                                     |
| ---------------------------------------------------- | --------------------------- | ------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| T0 — diagnóstico, especificação e plano              | GPT-6.1 Sol (`gpt-6.1-sol`) | high    | Várias fontes, decisões de dados/UX e limites de autorização; contexto amplo                                | GPT-6 Sol/high se 6.1 indisponível; disponibilidade condicional                                     |
| T1 — títulos, migration e transição legada           | GPT-6.1 Sol                 | high    | Unicode/trigger/CHECK/snapshot, riscos de bloquear edição e contornar API                                   | Mesmo Sol/xhigh se drift ou legado conflitante exigir investigação; não subir esforço sem evidência |
| T2 — descrição integral e seção restaurada           | GPT-6.1 Sol                 | medium  | Contrato definido; coordena tipos/select/JSON/formulário/fixtures e regra de resumo                         | Sol/high se a inspeção revelar contrato remoto divergente                                           |
| T3 — alinhamento da tabela desktop                   | GPT-6 Luna (`gpt-6-luna`)   | high    | Mudança delimitada, critérios geométricos e CSS/markup conhecidos; custo e resposta favorecem tarefa focada | Sol/medium se houver conflito real entre ações 44, largura e célula compartilhada                   |
| T4 — shell, auth e modais responsivos                | GPT-6.1 Sol                 | medium  | Padrões existentes, sem nova lógica de domínio; sensível a foco e viewport                                  | Sol/high se teclado virtual/dispositivo revelar comportamento além de CSS                           |
| T5 — páginas responsivas, recentes e acesso integral | GPT-6.1 Sol                 | high    | Integra vários layouts, conteúdo extremo e semântica das apresentações sem duplicar estado                  | Sol/medium apenas se reduzido a ajustes delimitados após T4 e provas já estáveis                    |
| T6 — verificação e revisão final                     | GPT-6.1 Sol                 | high    | Reavaliar impacto combinado em RLS, dinheiro, URL e UI; mesma capacidade de T1 para revisar o risco         | Astra/low apenas se houver achado difícil não resolvido e disponibilidade confirmada; não é padrão  |

Fallback geral: confirmar um modelo disponível de capacidade equivalente antes de executar; se catálogo/conta divergirem, atualizar a recomendação com evidência. Não substituir por modelos antigos retirados do Codex ou confundir identificadores API com rótulos visuais.

## 3. Isolamento proposto e integração

Estado observado: `main` / HEAD e referência local origin/main = `359a1857ad37e87c576fd03a71d85af03984a776`. Uma proposta do usuário está não rastreada; os documentos desta entrega também não estarão no commit-base. Nenhuma branch/worktree foi criada.

| Unidade / tarefas                | Branch ou worktree                                           | Nome de branch proposto              | Base e dependências                                                                                                                              | Motivo / caminho proposto                                                                                                                                                 | Validação e ordem                                                                                         |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Planejamento T0                  | Checkout atual, só documentos                                | Nenhuma nova branch nesta etapa      | main observada; não modificar produto                                                                                                            | Pedido de análise; preservar arquivo do usuário                                                                                                                           | Auto-revisão textual agora; revisão humana antes de T1                                                    |
| Implementação T1–T5 e revisão T6 | **Um novo worktree com branch própria**, execução sequencial | `codex/financy-ux-responsive`        | main reconfirmada no início; se mudar, revisar diff/base antes de criar. T2 depende T1; T3 depende contratos estáveis; T4 após T2/T3; T5 após T4 | Preservar checkout/prompt/documentos locais e separar futuro trabalho de produto. Caminho proposto: `C:/Users/Rodrigo/OneDrive/Documentos/Projetos/Financy-ux-responsive` | Verificação por tarefa, revisão combinada T6; integrar uma unidade em main após autorização de integração |
| Publicação / produção            | Fora deste plano de implementação                            | Nenhuma proposta de branch de deploy | Depende T6 aprovado e autorização específica                                                                                                     | Worktree não isola Supabase nem Vercel                                                                                                                                    | Nova decisão operacional; sem deploy automático ao integrar                                               |

O caminho e nome são propostas, não recursos existentes. Preferir a ferramenta nativa de worktrees; se ela atribuir outro caminho gerenciado, registrar o caminho real. Confirmar permissões de escrita desse diretório na execução; não interpretar esta proposta como concessão de acesso ao filesystem.

Uma branch no checkout atual seria a menor alternativa se ele estivesse livre e não houvesse interesse em preservar o contexto aberto. Aqui o worktree único preserva a pasta atual; não criar um por correção cosmética. Branches no mesmo diretório não isolam alterações locais.

Primeiro passo futuro, antes de editar produto:

- Conferir git status, branch, HEAD, referência-base, branches/worktrees existentes e diferenças não commitadas. Preservar tudo; sem stash/reset/clean ou checkout forçado.
- Invocar using-git-worktrees apenas na execução autorizada; criar o isolamento proposto a partir da base confirmada. Não copiar alterações não aprovadas do produto.
- Levar somente cópias da especificação/plano aprovados ao worktree, pois não estão no commit-base. Não mover o prompt do usuário nem copiar .env, sessões ou credenciais.
- Garantir configuração de desenvolvimento pelo mecanismo seguro já usado; não imprimir valores. Worktree não duplica banco, contas, portas nem serviços: rodar uma suíte de escrita por vez, fixtures com runId e porta livre 5173. Manter guard exato e reuseExistingServer:false.
- Preparar commits pequenos por tarefa e revisão do diff, só durante a execução futura. Não fazer push/deploy por consequência implícita.
- Depois da revisão e integração autorizadas, verificar SHA/conteúdo integrado e arquivos locais/ignorados necessários antes de arquivar/remover o worktree. Sem delete forçado; checkout original e arquivo do usuário permanecem preservados.

## 4. Mapa de arquivos e interfaces

A [seção 7 da especificação](../specs/2026-10-20-financy-ux-responsive-design.md#7-análise-de-impacto-apoiada-pelo-graphify) registra queries, paths, arestas EXTRACTED/INFERRED, fontes e lacunas do grafo. Nenhum vínculo de CSS ou caminho completo de persistência foi inventado no grafo.

| Área                   | Alterações futuras limitadas ao escopo                                                                                                                                                                                                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Texto compartilhado T1 | Criar `src/lib/financial-text.ts` e `financial-text.test.ts`; formular validação comum nos dois diálogos e APIs                                                                                                                                                                                                |
| Categorias T2          | `src/features/categories/{types,api,queries,categories-page,category-dialog}.ts(x)`; queries só se consumidor/tipo exigir, mantendo keys e invalidação                                                                                                                                                         |
| Resumos T2             | Criar `src/features/categories/summary.ts` e `summary.test.ts` para soma/empate/zero, usados somente pela página                                                                                                                                                                                               |
| Transações T1/T2/T3/T5 | `src/features/transactions/{api,types,transaction-dialog,transactions-page}.ts(x)`; `search.ts`/`router-search.ts` são regressão, não alvo de refatoração                                                                                                                                                      |
| Dashboard T2/T5        | `src/features/dashboard/{api,types,dashboard-page}.ts(x)`; queries permanecem com período/userId existentes                                                                                                                                                                                                    |
| UI T4/T5               | `src/components/app-shell.tsx`, `src/styles.css`, AuthForm/ProfilePage; Button/Input só se um ajuste realmente não puder ser expresso nas classes existentes                                                                                                                                                   |
| Detalhes T5            | Criar `src/features/transactions/transaction-details-dialog.tsx`, apresentação de leitura reutilizada em dashboard/listagem                                                                                                                                                                                    |
| Banco/tipos T1/T2      | Duas novas migrations, sufixos `financial_titles` e `category_description`; nomes temporais gerados pelo CLI no futuro. Regenerar `src/lib/database.types.ts`. Não editar as três migrations aplicadas                                                                                                         |
| Testes/fixtures        | Unitários existentes de transaction/dashboard API; criar unitário `src/features/categories/api.test.ts` (não existe hoje); integrações category/transaction/dashboard/security/integrity; E2E category/transaction/dashboard/financy/access/auth, fixtures compartilhadas; novo `tests/e2e/responsive.spec.ts` |
| Documentação final T6  | README, DESIGN, operações recebem atualização datada, sem apagar histórico; criar registro de execução novo. Não editar esses arquivos nesta etapa                                                                                                                                                             |

Interfaces propostas para evitar decisões implícitas:

- `normalizeFinancialTitle(value: string, field: 'category' | 'transaction'): string`: trim compartilhado, valida 1–20 e lança mensagem de campo.
- `countTitleCharacters(value: string): number`: conta pontos de código depois do mesmo trim; não normaliza Unicode.
- `CategoryInput = {name:string; description:string|null; color:CategoryColor; icon:CategoryIcon}`; Category acrescenta id; CategorySummary acrescenta transaction_count. Todos os construtores/fixtures compilam com o campo.
- APIs existentes mantêm nomes/signaturas: createCategory/updateCategory/listCategories, validateTransactionInput, listTransactions, getDashboard/parseDashboard.
- `getCategoryOverview(categories: readonly CategorySummary[]): {categoryCount:number; transactionCount:number; mostUsed:CategorySummary|null}`: soma segura; desempate pela ordem estável da lista; null sem uso positivo.
- `TransactionDetailsDialog({transaction,onClose,restoreFocus})`: props Transaction, função sem argumentos e função sem argumentos; sem fetch/mutação. Não criar uma segunda cópia persistente do registro ou formulário.
- `save_transaction`, `change_transaction` e `get_dashboard(date)` mantêm assinaturas, grants atuais de execução e SECURITY INVOKER. Só o corpo JSON de get_dashboard muda em T2.

## 5. Tarefas verificáveis

### T0 — fechar especificação e plano com revisão humana

**Arquivos:** estes dois documentos. **Modelo:** Sol/high. **Isolamento:** checkout atual, documentos apenas.

- [ ] Revisar primeiro a especificação: seção restaurada, Unicode, edição legada, descrição sem limite inventado e layouts por faixa.
- [ ] Resolver explicitamente a extensão estrita de grant de description; sem essa decisão, T2 continua bloqueado.
- [ ] Revisar este plano, modelos/esforços e worktree único; aprovar ou corrigir o fluxo nativo proposto.
- [ ] Solicitar implementação de forma explícita em nova mensagem. Nenhuma das aprovações anteriores executa T1 automaticamente.

**Saída:** documentos aprovados com decisões registradas; não é código nem autorização de produção.

### T1 — regra dos títulos, compatibilidade e ensaio de migration

**Arquivos:** criar financial-text.ts/test.ts; modificar categories/api.ts/category-dialog.tsx, transactions/api.ts/transaction-dialog.tsx; criar migration financial_titles; atualizar fixtures/testes consumidores. Tipos gerados só se a alteração efetivamente mudar seu conteúdo.
**Consome:** nomes de campos atuais e normalizador decimal existente.
**Produz:** duas funções de texto acima; CHECKs nomeados; escrita limitada e leitura legada preservada.
**Modelo:** Sol/high. **Depende:** T0 e isolamento criado.

- [ ] Conferir status/base, criar worktree/branch e transportar os documentos aprovados, conforme seção 3. Capturar baseline visual em desenvolvimento antes de editar; ainda sem fixtures em produção.
- [ ] Repetir auditoria agregada nos alvos autorizados e inventariar constraints/trigger/versões. Parar diante de drift; não reaplicar migrations antigas.
- [ ] Escrever testes unitários RED para ambos os campos: 19/20 aceitos, 21 rejeitado; vazio/espaços rejeitados; trim de NBSP/FEFF/tab; espaços internos preservados; 20 emojis simples aceitos e 21 rejeitados; acento composto/decomposto e família contados como especificado.
- [ ] Criar as funções de texto e ligá-las aos validators TanStack Form e validação da API. Manter nome/descrição preenchidos depois de erro; hints/contador associados; foco no primeiro inválido ao enviar. Não usar corte automático/maxLength UTF16.
- [ ] Gerar nova migration pelo CLI apropriado descoberto por --help, com sufixo financial_titles; ainda em desenvolvimento. Substituir só normalização textual do trigger e adicionar CHECK NOT VALID. Preservar todas as outras linhas funcionais do trigger, FK, RLS/grants e funções de escrita.
- [ ] Ensaiar legado **antes da primeira aplicação dessa migration em dev**: criar fixtures próprias segregadas pelas ferramentas existentes e semear categoria/transação com 21+ via Data API antiga, registrando apenas IDs técnicos/runId no manifesto. Aplicar migration em dev; comparar texto integral lido com o valor semeado; confirmar que não houve UPDATE de dados pela migration.
- [ ] No mesmo ensaio: nova escrita 21 deve falhar; edição só de cor/valor de uma linha legada deve falhar sem perda; edição com título corrigido deve funcionar; transação pode usar categoria legada sem atualizar seu título. Deletar somente fixtures próprias ao terminar. Se a migration já estiver aplicada quando a tarefa retomar, não removê-la/afrouxar CHECKs para semear legado: exigir ambiente descartável autorizado para repetir o ensaio.
- [ ] Testar chamadas diretas autenticadas com 19/20/21 em categorias e transações, save_transaction e change_transaction. Corrigir título legado usando snapshot original e conferir rejeição de snapshot concorrente. Ana/Bob/anônimo não ganham acesso.
- [ ] Validar CHECKs apenas onde a reconferência mostrar zero violações. Havendo legado, deixar NOT VALID aplicado e registrar transição, sem falha/reversão de toda a expansão.
- [ ] Ajustar mensagens de CHECK identificado: “Use até 20 …”. Se o SDK não trouxer identidade suficiente para distinguir a constraint, usar mensagem clara que mencione limite **e** campos financeiros, sem classificar todo 23514 como título. Manter mensagens atuais de conflito/FK.
- [ ] Revisar todos os títulos sintéticos nas fixtures/suítes; encurtar explicitamente somente exemplos positivos que passariam a violar a regra. Manter casos negativos/legados dedicados. Não aplicar slice(0,20) a builders genéricos; não alterar dados de usuários.
- [ ] Verificar focado e revisar diff antes do commit futuro da unidade.

**Verificação futura:** `pnpm test -- src/lib/financial-text.test.ts src/features/transactions/api.test.ts`; `pnpm test:integration -- tests/integration/transactions.test.ts tests/integration/integrity.test.ts tests/integration/security.test.ts`; `pnpm test:e2e -- tests/e2e/categories.spec.ts tests/e2e/transactions.spec.ts`; `pnpm typecheck` e `pnpm lint`.
**Aceite:** assertions acima verdes, ensaio legado registrado e somente dados próprios limpos; migration não depende de todos os títulos históricos já serem curtos. Não alegar ensaio repetível local se Docker/CLI não estiver disponível.

### T2 — descrição persistida e resumos reais em categorias

**Arquivos:** categories types/api/dialog/page; criar summary.ts/test.ts e categories/api.test.ts; transactions/api.ts; dashboard/api.ts/api.test.ts; nova migration category_description; database.types.ts; fixtures e testes category/dashboard/transaction.
**Consome:** CategoryInput/CategorySummary propostos, helper de título T1, lista completa de categorias e cache por conta.
**Produz:** description string/null em todos os leitores; getCategoryOverview; cards e seção de três resumos.
**Modelo:** Sol/medium. **Depende:** T1 e decisão expressa do grant.

- [ ] RED: validar sem descrição/null/espaços, criar com texto, editar texto, limpar→null e recarregar; description com 21+ continua aceita. Testar select de retorno/lista e os dois caminhos JSON do dashboard.
- [ ] Criar migration aditiva: description text nullable, normalização nullif(trim consistente,'') no trigger de categorias; extensão estrita INSERT/UPDATE(description) somente se aprovada; nenhum grant de dono/ID/criação ou política nova. Atualizar get_dashboard para emitir description nos dois objetos de categoria, preservando dinheiro textual/ordem/limites.
- [ ] Aplicar primeiro em dev pelo mecanismo único verificado; comparar história/SQL. Regenerar tipos a partir desse schema, sem editar à mão a representação de numeric para contornar o SDK.
- [ ] Atualizar tipos de domínio e todos os selects/parsers/builders identificados. Leituras não validam o teto do título; description deve ser string/null e mantida em categorias embutidas. Descrever compatibilidade: banco/RPC primeiro, frontend depois; cliente antigo ignora a coluna nova.
- [ ] Formulário: inserir Descrição entre nome e Ícone, `Opcional` associado; default edit=valor salvo ou ''; API limpa com null explícito. Cards: texto condicional, sem altura fixa reservada. Nenhum texto inventado.
- [ ] RED/GREEN para getCategoryOverview: lista vazia=0/0/null; categorias com 12/2/1/3 transações=4/18/primeira; zero usos=null; empate usa ordem estável/ID já resolvidos pela API; soma insegura produz erro controlado. Não somar dinheiro nem baixar transações.
- [ ] Renderizar a faixa comprovada do Figma antes da grade; consulta pendente/erro não mostra zeros fictícios. Conservar empty state, botões, ícones, contagens e exclusão protegida.
- [ ] Provar invalidação pelo prefixo finance/userId após criação/edição/limpeza/reclassificação/exclusão e troca de conta. Não introduzir nova query ou cache.
- [ ] Conferir RLS e grants de catálogo e rodar testes focados; revisar diff/commit futuro.

**Verificação futura:** `pnpm test -- src/features/categories/summary.test.ts src/features/categories/api.test.ts src/features/dashboard/api.test.ts`; `pnpm test:integration -- tests/integration/categories.test.ts tests/integration/dashboard.test.ts tests/integration/transactions.test.ts tests/integration/security.test.ts`; `pnpm test:e2e -- tests/e2e/categories.spec.ts tests/e2e/dashboard.spec.ts tests/e2e/financy.spec.ts`; typecheck/lint.
**Aceite:** persistência completa e limpeza sobrevivem reload; categoria existente recebe null sem backfill; selects/JSON não quebram; resumos refletem histórico e não mockups. Comparação visual em desktop separa a restauração de R1 da descrição de R2.

### T3 — alinhamento desktop da tabela de transações

**Arquivos:** transactions-page.tsx, styles.css, tests/e2e/transactions.spec.ts.
**Consome/produz:** mesma Transaction e mesmas colunas; acrescenta identificação visual estável por column.id, sem mudar API ou search.
**Modelo:** Luna/high. **Depende:** T1/T2 estabilizados.

- [ ] Especificar prova RED de geometria em 1024 e 1440: posições relativas à área útil da célula, não ao centro da página; categorias de nomes/comprimentos diferentes e ambos os tipos.
- [ ] Associar data-column/classes estáveis em th/td; aplicar alinhamentos requeridos também aos wrappers flex/grid. Manter header/cell mesma coluna e semântica table.
- [ ] Reservar espaço para dois botões de 44 separados por 8 e padding; alinhar esse grupo à direita. Data/tipo/badge centrados; valor alinhado à direita; descrição esquerda. Manter formato exato e paginação de dez.
- [ ] Conferir geometry GREEN: centro do badge dentro de 2 CSS px do centro útil da célula; borda direita de valor/ações dentro de 2 px da borda útil; cabeçalho segue a mesma regra. Validar componentes internos, ícone e texto, não só computed text-align.
- [ ] Capturar e revisar screenshot com dados determinísticos; não aceitar apenas DOM. Testar aplicar/limpar filtro, reload, voltar e paginação sem modificação da ordenação remota.
- [ ] Rodar teste focado, revisar diff/commit futuro. A política completa de truncamento/leitura é concluída em T5.

**Verificação futura:** `pnpm test:e2e -- tests/e2e/transactions.spec.ts`, typecheck/lint.
**Aceite:** R4 nos seis cabeçalhos/células e ações internas, sem mudar totais do dashboard.

### T4 — fundação mobile: shell, autenticação, perfil e modais

**Arquivos:** app-shell.tsx, styles.css, auth-form.tsx/profile-page.tsx e diálogos existentes apenas no necessário; novo responsive.spec.ts; E2E access/auth/categories/transactions pertinentes.
**Consome:** regras/classes atuais, Radix, validação/descrição de T1/T2.
**Produz:** contrato da seção 6 da especificação sem novas rotas, menu ou biblioteca.
**Modelo:** Sol/medium. **Depende:** T2/T3.

- [ ] RED em 320/390: navbar, auth e modal não ultrapassam a viewport; principal botão/fechar/perfil/mostrar senha/radios têm área 44; foco segue ordem de leitura e skip-link funciona.
- [ ] Reorganizar navbar em duas linhas base e uma a partir de 768; retirar altura fixa conflitante. Reutilizar Link e indicação ativa; não criar estado de navegação.
- [ ] Aplicar gutters mobile-first e min-width:0 nos filhos relevantes. Ajustar auth/profile sem mexer em sessão, senha, logout ou cache; conservar inputs e formulários existentes.
- [ ] Adaptar modais: topo/scroll/dvh, conteúdo e ações alcançáveis; auto-fit de ícones/cores com hit areas 44; categoria máximo 480 em espaço suficiente; pares em uma coluna na base. Reduzir densidade vertical em viewport baixo sem ocultar campos.
- [ ] Confirmar trap, Escape, bloqueio de fechamento durante envio e restauração de foco de todos os diálogos. Se o botão original não estiver conectado/visível após mudança de breakpoint, usar fallback visível já disponível na página.
- [ ] Verificar com viewport 667×375 e 390×400; focar último campo e alcançar salvar/cancelar por scroll e teclado. Não adicionar listener de visualViewport preventivamente; se aparelho real demonstrar falha de CSS, investigar antes de ampliar solução.
- [ ] Rodar focados, revisar screenshots do shell/auth/modal e diff/commit futuro.

**Verificação futura:** `pnpm test:e2e -- tests/e2e/access.spec.ts tests/e2e/auth.spec.ts tests/e2e/responsive.spec.ts`, typecheck/lint.
**Aceite:** navegação, campos, toques e foco acessíveis nas pequenas larguras; layout desktop mantém identidade; viewport simulado não é anunciado como prova de teclado virtual real.

### T5 — conteúdo responsivo, recentes centralizados e texto integral

**Arquivos:** dashboard-page.tsx, categories-page.tsx, transactions-page.tsx, styles.css; criar transaction-details-dialog.tsx; responsive.spec.ts e E2E dashboard/transactions/categories.
**Consome:** dados/estado existentes, colunas/cell renderers T3, base responsiva T4.
**Produz:** apresentações por faixa e diálogo de leitura compartilhado, sem query/regra de negócio nova.
**Modelo:** Sol/high. **Depende:** T4.

- [ ] RED com fixture representativa: categoria curta/longa, descrição legada com 80 pontos de código e outra sem espaços, valor `9007199254740993.01`, ambos os tipos, nome de categoria legado; também vazio/carregando/erro.
- [ ] Aplicar grades/resumos/painéis conforme tabela da especificação. Não esconder controles ou conteúdos do ranking em mobile; mover valor para linha própria quando necessário.
- [ ] Recentes: tracks idênticos entre linhas, badge justify-self:center na coluna reservada; minmax(0,...), min-width:0, uma linha com reticências locais. Tipo continua visível à direita. Em mobile, usar a organização explícita em três faixas.
- [ ] Implementar TransactionDetailsDialog de leitura com dados já presentes. Abrir pelo título em ambos os contextos; mostrar campos completos, sem hover; teclado/toque/Escape/foco. Reutilizar estado de seleção da página onde couber, sem duplicar formulário.
- [ ] Abaixo de 1024, apresentar cards de transações derivados das mesmas rows/cell renderers, com labels dos campos e handlers existentes. Acima, tabela. Apenas uma apresentação fica exposta/focável; IDs de formulário/dialog permanecem únicos, fora das duas apresentações.
- [ ] Empilhar filtros e paginação como proposto. Preservar route.useSearch/navigate e o efeito legítimo de correção de página; nenhuma alteração da regra de ordenação ou do parser de URL.
- [ ] GREEN em 768/1024/1440 para recentes: centros dos badges iguais dentro de 2 px e iguais ao track reservado, apesar de tamanhos diferentes. Verificar truncamento real, valor/tipo à direita e acesso integral por Enter e toque; em mobile verificar significado/todos os campos.
- [ ] Provar mesma lista e URL ao alternar 390↔1440; não duplicar requisições/mutations ou perder seleção/filtro. Resposta atrasada de outra conta/período continua cancelada/isolada.
- [ ] Capturar screenshots nos estados representativos; revisar contra imagem 3/Figma e novos layouts propostos. Rodar focados, revisar diff/commit futuro.

**Verificação futura:** `pnpm test:e2e -- tests/e2e/responsive.spec.ts tests/e2e/dashboard.spec.ts tests/e2e/transactions.spec.ts tests/e2e/categories.spec.ts`; unitários de money/dates/search/router-search; typecheck/lint.
**Aceite:** R5 e R6 sem scroll lateral da página; cabeçalhos/células R4 continuam corretos; textos salvos e regras de domínio intactos.

### T6 — regressão final, revisão e handoff

**Arquivos:** todos os alterados em T1–T5, README/DESIGN/operações com atualização datada e novo registro de execução.
**Consome:** evidências focadas, catálogo de migrations e matriz abaixo.
**Produz:** revisão da unidade e lista de resultados reais/limitações, sem publicação implícita.
**Modelo:** Sol/high. **Depende:** T1–T5 concluídos.

- [ ] Reavaliar cada R1–R6 e Review Focus contra diff e fontes conectadas; examinar handlers, fixtures e parsers, não só linhas novas. Confirmar nenhum novo grant além da coluna expressamente aprovada.
- [ ] Rodar a sequência de regressão da seção 6, uma vez depois de estabilizar. Se falhar, corrigir causa e repetir os testes afetados; ampliar apenas com nova alteração/risco. Não declarar sucesso por resultados históricos.
- [ ] Conferir schema/dev e versões; CHECKs aplicados, condição de validação histórica honesta, description null e RPCs invoker. RLS com duas contas/anônimo por cliente público; consultas administrativas de catálogo não substituem essa prova.
- [ ] Revisar screenshots e geometria; fazer zoom/retrato/paisagem/teclado/toque e aparelho real quando disponível. Registrar explicitamente o que só teve simulação.
- [ ] Atualizar README/DESIGN/operações por adendo datado, incluindo mudança do foco desktop, sequência das novas migrations, compatibilidade, grant autorizado e limites. Histórico antigo permanece.
- [ ] Fazer revisão final independente se autorizada na futura execução; nenhum despacho agora. Se execução continuar nativa sem revisor externo, registrar auto-revisão como tal e manter gate humano.
- [ ] Apresentar diff, SHA futuro e evidências para integração autorizada. Não fazer push para main, deployment ou migration prod por conta da conclusão. Remover/arquivar worktree apenas após integração/preservação verificadas, conforme seção 3.

**Aceite:** matriz cumprida com evidência real e limitações explícitas; revisão humana pendente impede declarar release concluída.

## 6. Matriz de verificação futura

### Larguras e modos de entrada

| Largura CSS | Cobertura automatizada proporcional                                                                                                  | Comparação visual / interação complementar                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 320         | Smoke de todas as páginas, overflow de página, controles/labels, paginação e modal baixo; dados extremos por resposta determinística | Screenshot dos piores casos e leitura dos detalhes; sem repetir CRUD completo             |
| 375         | Geometria de shell/cards/filtros e abertura de modal                                                                                 | Portrait e paisagem representativa 667×375                                                |
| 390         | Uma jornada principal autenticada de categorias/transações/dashboard, criar/editar/limpar descrição e detalhes por toque simulado    | Screenshots mobile e foco no viewport 390×400                                             |
| 768         | Navegação numa linha, filtros em duas colunas, recentes e cards da listagem                                                          | Screenshot de transição; centro do track e informações completas                          |
| 1024        | Tabela de seis colunas, ações 44, alinhamento e filtros de quatro colunas                                                            | Screenshot desktop compacto; se não couber, ajustar breakpoint em vez de esconder defeito |
| 1440        | Suíte E2E atual e regressão da jornada integrada, alinhamento, categorias e dashboard                                                | Comparação desktop com Figma/imagens, screenshots de novos resumos/descrição/recentes     |

Executar todos os seis tamanhos em casos geométricos rápidos dentro de responsive.spec.ts, não multiplicar todas as suítes/projetos por seis. Manter viewport default 1440×1000 para a suíte atual; setViewportSize por cenário de responsividade. Usar touch em contexto representativo de 390, sem confundir clique de mouse com toque.

Casos obrigatórios:

- Descrição: omitida/null/vazia/espaços/21+; criação/edição/limpeza; reload; coluna/select/parser/JSON; categoria antiga sem descrição. Integração prova persistência; DOM sozinho não basta.
- Títulos: 19/20/21 na UI, função compartilhada, API pública e RPC; trim de espaços externos Unicode; acentos/emoji; nenhuma truncagem. Leitura de legado e correção mantêm dados/snapshot.
- Dinheiro/calendário: valor enorme, centavos, sinal/tipo, mês/data de São Paulo; mesmas funções de money/dates. Sem conversão Number/parseFloat.
- RLS/cache: Alice/Bob/anônimo; grants atuais e extensão mínima aprovada; respostas pendentes não aparecem após logout/troca. Contagem e FK/exclusão protegida conservadas.
- UI: erro/loading/vazio, longos sem espaços, badges diferentes, números grandes, bordas/centros dos wrappers, ações internas e screenshots. DOM/role/text-align não provam alinhamento.
- Teclado: Tab/Shift-Tab, Enter/Espaço, Escape, erros vinculados, foco visível, trap e restauração; detalhe truncado legível sem hover.
- Zoom: teste manual do navegador em 200% e 400% numa janela desktop; não substituir por CSS zoom/transform. Nenhuma meta viewport bloqueia zoom.
- Dispositivo real: Safari iOS e/ou Chrome Android disponíveis, teclado virtual aberto, autofill/seletores de data, rotação e toque. Se só houver emulação Chromium, registrar lacuna e não prometer cobertura real.

Capturas: preparar dados determinísticos; revisar screenshots antes/depois e goldens selecionadas do Playwright em 390/768/1440, além do caso extremo 320. Não atualizar snapshots automaticamente para esconder regressões. Guardar evidência gerada fora do Git/Vercel conforme ignores existentes; se houver goldens versionadas, usar apenas fixtures fictícias, nunca dados de produção.

### Comandos disponíveis, somente para execução posterior

Após focados e ambiente confirmado:

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm test:integration`
5. `pnpm test:e2e`
6. `pnpm build`

Cada comando deve terminar com exit 0 e suas assertions esperadas; registrar contagens reais e ambiente no novo execution log. Build/typecheck também escrevem artefatos, por isso não foram executados agora. Integrações/E2E usam o guard de financy-dev já existente e um worker. Não relaxar guard nem reutilizar servidor com destino desconhecido para fazê-los passar.

Testes com mock de resposta podem cobrir legado extenso/erro/overflow visual sem criar registros inválidos após CHECKs. Mocks não comprovam RLS, persistência ou comportamento da migration; esses pontos usam testes reais/ensaio de T1 e integração de T2.

## 7. Sequência de banco e limites operacionais

M1 financial_titles: adição compatível por NOT VALID e atualização textual do trigger, com auditoria e validação condicional. M2 category_description: coluna nullable, normalização, JSON de dashboard e grant pontual se autorizado. Criar versões novas via CLI na execução, aplicar uma vez em dev e conferir histórico; não trocar versões internas ou repetir por outro mecanismo.

Preparar frontend contra o schema dev atualizado; não publicar bundle novo contra produção antiga. Produção não integra esta execução: futuramente exige autorização específica, nova leitura agregada/catálogo, revisão da migration aprovada e plano de aplicação/recuperação proporcionais ao risco. Correções de dados legados pertencem aos donos, sem SQL de truncagem/rename.

Rollback de frontend pode deixar CHECKs mais estritos que o cliente antigo; registrar que o banco continuará rejeitando 21, com possível mensagem antiga menos específica. Conservar coluna nullable e dados; não fazer DROP COLUMN ou desfazer constraints automaticamente. Rollback de bundle não recupera banco.

Limitações atuais: auditoria é fotografia; grafo anterior à release tem lacunas de CSS/SDK; nenhuma renderização/teste atual foi executado; screenshots anexas estão em pasta temporária; acesso de modelos é condicional ao seletor/conta. O ensaio de legado precisa ocorrer antes da primeira aplicação dev ou em ambiente descartável autorizado se houver retomada posterior; não instalar Docker/CLI ou criar terceiro projeto como efeito colateral deste plano.

## 8. Auto-revisão do planejamento

Revisado em 20/10/2026:

- R1→T2; R2→T2; R3→T1; R4→T3; R5→T5; R6→T4/T5/T6.
- Tipos, selects de categorias embutidas, JSON de ambas as listas do dashboard, fixtures, grants de coluna, invalidação e snapshots incluídos.
- Cada export proposto tem produtor/consumidor; APIs públicas existentes conservam assinaturas; migration temporal será gerada em execução, não inventada agora.
- Unicode, NOT VALID, correção legada e proibição de backfill destrutivo compatíveis entre spec/plano.
- Review Focus tem testes/tarefas; todo resultado de verificação é futuro.
- Trabalho sequencial e uma única branch/worktree propostos; nenhuma base remota presumida.
- Gates de revisão preservados: especificação e plano são rascunhos, sem commit e sem início de execução.
