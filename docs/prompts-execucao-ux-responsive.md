# Financy — prompts para executar o plano de UX responsiva

Destino: **Codex**. Documentos analisados: [design](superpowers/specs/2026-10-20-financy-ux-responsive-design.md) e [plano](superpowers/plans/2026-10-20-financy-ux-responsive.md), de 20/10/2026. Este arquivo prepara a execução; não implementa o produto nem altera o status de aprovação dos documentos.

## Leitura da análise e sequência recomendada

Os documentos estão coerentes quanto às regras, dependências e divisão T1–T6. A estratégia recomendada é executar sequencialmente em **um único worktree**, pois migrations, contratos, modais e estilos se sobrepõem. Não há ganho demonstrado em abrir um agente ou worktree por ajuste visual.

Antes de executar, resolver estes pontos:

| Ponto                                                  | Consequência para a execução                                                                                                                                                        |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Especificação e plano ainda registrados como rascunhos | Confirmar sua revisão e o pedido explícito de execução. A criação destes prompts não concede aprovação por conta própria.                                                           |
| Grant de `description` pendente                        | T2 depende da autorização estrita de `INSERT(description)` e `UPDATE(description)` para `authenticated`, preservando RLS. Não presumir autorização a partir da aprovação de layout. |
| Ensaio legado depende da ordem da migration            | Semear fixtures próprias de títulos longos antes da primeira aplicação de M1 em desenvolvimento. Se M1 já estiver aplicada, não afrouxar constraints para recriar o teste.          |
| Documentos ainda não rastreados no estado inspecionado | O worktree criado a partir de um commit não os receberá automaticamente. Levar cópias somente dos documentos necessários, sem mover os originais.                                   |
| Caminho de worktree proposto fora do workspace atual   | Preferir a ferramenta nativa e seu caminho gerenciado; o caminho do plano é proposta, não permissão de escrita.                                                                     |
| Modelos, grafo e auditorias são fotografias            | Reconfirmar disponibilidade do modelo, fontes do grafo e estado de migrations antes da execução; não tratar a auditoria de 20/10 como garantia futura.                              |
| Release anterior documentada como publicada            | Produção e deploy continuam fora desta sequência. Worktree não isola o Supabase remoto nem portas/processos.                                                                        |

Use **um prompt por vez**, na ordem. O prompt 0 encerra as decisões de T0; 1–6 correspondem às tarefas do plano. Não execute o próximo prompt automaticamente. O registro de cada entrega deve informar o worktree/branch reais, revisão de partida, arquivos, comandos, resultados e pendências, para permitir retomar em outro chat.

### Modelo e esforço sugeridos

As recomendações abaixo reproduzem a seção 2 do plano; não são uma nova verificação do catálogo da OpenAI nem da disponibilidade na conta. Escolha no seletor o modelo confirmado disponível antes de colar o prompt. Se o catálogo mudou, valide uma alternativa na documentação oficial e registre a escolha sem reconstruir o planejamento.

| Prompt / tarefa | Recomendação registrada | Escopo                                      |
| --------------- | ----------------------- | ------------------------------------------- |
| 0 / T0          | GPT-6.1 Sol, high       | Revisão e fechamento das decisões           |
| 1 / T1          | GPT-6.1 Sol, high       | Títulos, Unicode, legado e migration        |
| 2 / T2          | GPT-6.1 Sol, medium     | Descrição persistida e resumos              |
| 3 / T3          | GPT-6 Luna, high        | Alinhamento delimitado e provas geométricas |
| 4 / T4          | GPT-6.1 Sol, medium     | Shell, acesso e modais responsivos          |
| 5 / T5          | GPT-6.1 Sol, high       | Páginas responsivas, recentes e detalhes    |
| 6 / T6          | GPT-6.1 Sol, high       | Regressão e revisão combinada               |

## Contrato de todos os prompts

Cada bloco pede a leitura desta seção e dos dois documentos de origem. Se este arquivo não estiver disponível no novo checkout, leve uma cópia junto com o design e o plano antes de usar os prompts seguintes.

1. Leia as instruções aplicáveis, a especificação/plano de 20/10 e o registro mais recente desta execução. Confira o código atual e mudanças locais. As restrições históricas de “somente planejamento” descrevem a etapa em que aqueles documentos foram escritos: após aprovação e pedido explícito, execute somente a tarefa solicitada. Não transforme essa restrição histórica em um ciclo infinito de novas aprovações; decisões ainda não autorizadas continuam pendentes.
2. Use `superpowers:executing-plans` para a execução nativa sequencial e `ponytail` full para a menor mudança completa. Use as skills de teste/verificação pertinentes. Nas tarefas visuais, aplique `ui-ux-pro-max`, `frontend-god-mode` e `impeccable`, subordinando preferências genéricas à identidade aprovada. Não refaça o design aprovado por gosto pessoal. Use skills Supabase/Figma antes das operações que as exigem.
3. Consulte Graphify de forma focada quando precisar confirmar consumidores/caminhos. O grafo conhecido antecede a release e não prova CSS nem todo o fluxo SDK/banco; confirme fontes no código. Não reconstrua o grafo inteiro por padrão nem trate arestas inferidas ou caminhos não dirigidos como prova de persistência.
4. No prompt 1, crie o único isolamento aprovado antes de editar produto. Nos seguintes, reutilize o mesmo worktree e branch identificados no registro; não crie novos por tarefa. Preserve alterações do usuário, sem stash/reset/clean ou troca forçada. Não dispare subagentes sem escolha explícita desse método pelo usuário.
5. Desenvolvimento conhecido: `gorymmpnavtudztnasny`; produção: `bqkmhzrrfurphiikylpa`. Reconfirme com `docs/operations.md`. Migrations e testes de escrita desta sequência só em desenvolvimento/local autorizado. Uma suíte de escrita por vez, fixtures segregadas por execução e limpeza apenas dos próprios registros. Não copie `.env`, senhas, sessões ou artefatos de produção entre checkouts e não imprima seus valores. Não enfraqueça o guard do ambiente nem `reuseExistingServer: false`.
6. Preserve dinheiro decimal textual exato, calendário de São Paulo, ordenação/paginação remota, URL de filtros, snapshots de concorrência, cache por userId, FK composta e RLS. Não acrescente dependências, stores, rotas, PWA, offline ou API própria. Não edite migrations já aplicadas; gere as novas pelo CLI verificado e use um único mecanismo de aplicação.
7. Antes de editar, identifique consumidores e testes afetados. Escreva testes de comportamento que reproduzam o risco; falha de configuração não é RED da regra. Após corrigir, execute os focados; amplie a regressão por risco ou na tarefa final. Mocks de geometria/erro não comprovam persistência, RLS ou ensaio de migration. Não use resultados históricos como resultados atuais nem atualize screenshots automaticamente para esconder regressões.
8. Se algo já estiver implementado e verificado, confira a evidência e execute apenas o restante, sem duplicar migrations/arquivos. Quando houver bloqueio, conclua somente trabalho independente e reporte o estado parcial sem dar aceite à tarefa. Pare por autorização faltante, drift material ou risco de dados; não pare por escolhas rotineiras já decididas no plano.
9. Atualize um registro em `docs/superpowers/execution/` com resultados reais por tarefa e checkpoints correspondentes no plano de execução, sem apagar o histórico. Commits locais somente se autorizados na execução; nenhum prompt autoriza merge, push, publicação, produção ou remoção do worktree.
10. Ao concluir cada tarefa, informe resultado, arquivos, testes/ambiente, pendências e próximo prompt. Preserve o worktree para continuidade. Identifique explicitamente se houve auto-revisão, revisão independente ou aprovação humana; não confunda essas evidências.

Estes prompts podem executar comandos e editar arquivos quando usados para implementação. Confira os caminhos, alvos e escopo antes de colar. As decisões de permissão e integração abaixo são específicas deste projeto.

## Prompt 0 — Fechar T0 e conferir a prontidão

```text
Faça a revisão de prontidão para executar o plano de UX responsiva do Financy. Aplique o contrato de docs/prompts-execucao-ux-responsive.md e leia integralmente o design docs/superpowers/specs/2026-10-20-financy-ux-responsive-design.md e o plano docs/superpowers/plans/2026-10-20-financy-ux-responsive.md. Esta etapa é somente leitura e documentação; não implemente, crie worktree/branch ou aplique migrations.

Confronte requisitos R1–R6 com tarefas T1–T6 e confirme decisões importantes: três resumos reais em categorias; descrição opcional string/null; títulos por pontos de código; CHECK NOT VALID com correção do título ao editar legado; snapshots integrais; mesmos dados e handlers nas apresentações mobile/desktop; detalhes acessíveis sem hover.

Confirme no código/documentos atuais apenas o necessário para identificar drift, estado de migrations, disponibilidade de ferramentas, branch-base e existência de trabalho parcial. Não refaça todo o diagnóstico visual já documentado. Verifique se há evidência de aprovação da especificação, do plano, da execução nativa e do grant estrito de description. A marcação “rascunho” não substitui evidência de autorização mais recente da conversa, mas nenhuma autorização deve ser inventada.

O grant pendente é somente INSERT(description) e UPDATE(description) a authenticated sob a RLS existente. Se a decisão não existir, apresente o impacto e solicite essa decisão explicitamente junto das outras revisões pendentes; não sugira service_role, SECURITY DEFINER ou permissão ampla como atalho. Se a extensão for recusada, devolva o escopo para ajuste antes de iniciar a sequência dependente.

Reconfirme a recomendação de modelo/esforço para cada tarefa com base no plano e na disponibilidade verificável, sem trocar o modelo da conversa. Confirme o worktree único proposto e como transportar cópias dos documentos ainda não rastreados.

Entregue uma matriz curta de aprovado/pendente/bloqueado com evidências e qualquer correção pontual necessária ao plano. Se houver decisões pendentes, apresente uma única solicitação consolidada e concreta de revisão. Se tudo já estiver autorizado, informe que o prompt 1 pode ser executado. Não inicie T1 automaticamente.
```

## Prompt 1 — Isolamento único e T1: títulos, Unicode e legado

```text
Execute somente T1 do plano de UX responsiva do Financy, pela execução nativa. Aplique o contrato de docs/prompts-execucao-ux-responsive.md e leia a especificação e o plano de 20/10 ali vinculados, em especial as regras de Unicode, transição legada e T1. Confirme o fechamento de T0 e o pedido explícito de implementação antes de alterar o produto; preserve o escopo aprovado.

Antes de editar, confira status, HEAD, base real e worktrees existentes. Crie o worktree único com branch codex/financy-ux-responsive conforme a estratégia aprovada e a skill using-git-worktrees; prefira a ferramenta nativa e registre o caminho real. Não sobrescreva uma branch/worktree já existente: reutilize somente se corresponder a esta execução. Leve cópias dos documentos aprovados e deste guia, sem mover originais, copiar mudanças de produto não aprovadas ou copiar credenciais. Prepare o ambiente de desenvolvimento pelo mecanismo seguro disponível; não instale infraestrutura como efeito colateral. Capture baseline visual antes das mudanças.

Implemente normalizeFinancialTitle(value, field) e countTitleCharacters(value) em src/lib/financial-text.ts, com as assinaturas do plano. Conte pontos de código depois do trim externo idêntico ao JavaScript/SQL definido na seção 5 do design; sem NFC/NFD, grafemas, truncamento ou string.length como regra. Use o conjunto explícito de espaços dessa seção no btrim do trigger. Preserve espaços internos.

Integre aos formulários/APIs de categorias e transações: categoria.name e transação.description obrigatórios de 1 a 20; contador normalizado N/20, ajuda sobre emojis compostos, validação blur/envio, erro associado e foco no primeiro inválido. Permita colar 21 para corrigir; não use maxLength UTF16 como restrição. Não valide o teto nos parsers de leitura nem altere nome do perfil.

Reconfirme auditoria agregada e catálogo de desenvolvimento. Gere M1 financial_titles e altere somente a normalização textual de private.prepare_financial_row, preservando dinheiro, imutabilidade e demais proteções. Adicione categories_name_length_check e transactions_description_length_check como NOT VALID. Preserve RLS, FK, grants e assinaturas das RPCs.

Antes da PRIMEIRA aplicação de M1 em desenvolvimento, semeie fixtures próprias de categoria/transação com 21+ pela API antiga e registre o manifesto da execução. Depois aplique M1 uma vez e prove: texto antigo não mudou; leitura continua; nova escrita 21 falha; editar só cor/valor do legado falha sem perder dados; corrigir o título permite editar; categoria legada pode ser usada por transação válida sem atualizar a categoria. Preserve o snapshot original integral de change_transaction e teste conflito. Se M1 já estiver aplicada, não a remova ou afrouxe: registre o ensaio anterior ou a necessidade de ambiente descartável autorizado, sem alegar cobertura que não realizou.

Teste 19/20/21, vazio, NBSP/FEFF/tab, espaços internos, acentos composto/decomposto, emojis simples e família conforme os valores exatos do design. Teste escrita direta e save_transaction/change_transaction com cliente público e RLS. Valide CHECKs somente após auditoria com zero violações; caso contrário, mantenha NOT VALID e registre a pendência. Não reescreva dados legados. Diferencie erros específicos do título de outros 23514, preservando conflitos/FK.

Ajuste somente fixtures positivas incompatíveis, sem slice genérico que masque negativos. Execute testes focados indicados em T1, typecheck e lint; registre resultados reais e limpeza dos próprios dados. Confira consumidores da regra e diff. Não execute T2. Entregue worktree/branch reais, evidência do ensaio, estado das constraints e pendências.
```

## Prompt 2 — T2: descrição persistida e três resumos reais

```text
Execute somente T2 no worktree/branch da execução de UX responsiva do Financy. Aplique o contrato de docs/prompts-execucao-ux-responsive.md, leia o registro de T1 e as seções correspondentes do design/plano de 20/10. Confirme T1 concluída e a decisão expressa sobre INSERT/UPDATE(description). Se o grant não estiver autorizado, exponha esse bloqueio; não contorne nem declare persistência concluída.

Use os arquivos de categorias existentes e seus consumidores em transações/dashboard. Crie M2 category_description: categories.description text nullable, normalização do trim consistente para null no vazio e somente a extensão de grants de coluna autorizada. Preserve os demais grants, RLS, dono, ID, criação, dinheiro, triggers e constraints de T1. Atualize o JSON de get_dashboard tanto em topCategories quanto em category de recentTransactions, incluindo agrupamentos pertinentes, sem trocar assinatura, SECURITY INVOKER, ordem, limites ou dinheiro textual.

Aplique uma vez em desenvolvimento, confira o histórico e regenere database.types.ts. Mantenha numeric gerado conforme o SDK, sem substituir por string manualmente; os contratos de domínio e transportes financeiros existentes continuam textuais. Banco/RPC vêm antes do frontend consumidor.

Atualize CategoryInput/Category/CategorySummary, todos os selects/parsers e builders realmente afetados. categories.description é string|null; transação.description continua sendo seu título limitado a 20. Descrição de categoria aceita 21+ e não recebe um teto arbitrário. Ao editar, carregue texto salvo; ao limpar, envie null explicitamente. Formulário coloca Descrição entre nome e Ícone com ajuda Opcional acessível. Card renderiza descrição apenas quando não vazia, sem placeholder, altura fixa ou espaço reservado exclusivo para null.

Implemente getCategoryOverview em src/features/categories/summary.ts conforme a assinatura do plano, reutilizando a lista completa de CategorySummary. Total de categorias=length; transações=soma segura de transaction_count de todo o histórico; mais utilizada=maior contagem positiva, com desempate pela ordem estável pt-BR/ID já garantida. Vazio=0/0/null; zero usos=“Nenhuma categoria utilizada”. Soma insegura deve produzir erro controlado.

Restaure os três resumos entre cabeçalho e grade: Total de categorias, Total de transações e Categoria mais utilizada, conforme frame 3104:2028 e tokens existentes. Não use ranking mensal ou dinheiro e não crie RPC/query por card. Carregando/erro não mostram zeros fictícios. Preserve estados, contagens e exclusão protegida.

Teste descrição omitida/null/vazia/espaços/21+, criar/editar/limpar/reload, categoria antiga sem descrição, retornos de insert/update/lista, categoria embutida em transações e ambos os caminhos JSON do dashboard. Teste resumos, incluindo 12/2/1/3 usos → 4 categorias/18 transações, empate e soma insegura. Prove RLS, grants mínimos e invalidação finance/userId após mutations/reclassificação/troca de conta.

Execute testes focados de T2, typecheck/lint e comparação visual desktop que distinga os resumos da inclusão da descrição. Registre schema/compatibilidade/limpeza de fixtures. Preserve o worktree e pare antes de T3.
```

## Prompt 3 — T3: alinhamento desktop verificável

```text
Execute somente T3 no mesmo worktree do Financy. Aplique o contrato de docs/prompts-execucao-ux-responsive.md e leia T3 e o contrato de alinhamento da especificação de 20/10. Confirme T1/T2 estabilizadas. Esta tarefa é de markup/CSS e teste visual; não altere banco, queries ou filtros.

Atue em transactions-page.tsx, styles.css e E2E pertinente. Reutilize as seis colunas existentes do TanStack Table. Associe classes/data-column estáveis por column.id a th/td e preserve table/thead/tbody/th scope. Não use nth-child como vínculo frágil quando o ID já identifica a coluna.

Alinhe cabeçalhos, conteúdo e wrappers: Descrição à esquerda; Data/Categoria/Tipo no centro; Valor/Ações à direita da área útil. Reserve espaço real para dois botões de 44×44 com 8 de intervalo e padding, conforme o mínimo proposto no design. Centralize os badges e grupos internos, não apenas seu text-align. Preserve valores exatos, ordenação remota e dez registros por página.

Crie prova geométrica reproduzível em 1024/1440 com ambos os tipos e categorias de comprimentos diferentes. Meça área útil da célula e elementos: centros de badge/conteúdo dentro de 2 CSS px do centro útil; valor/grupo de ações e cabeçalhos dentro de 2 px da borda útil correspondente. Não use o centro da página como referência. Dados determinísticos e screenshots complementam as assertions; computed text-align sozinho não prova alinhamento.

Confira aplicar/limpar filtros, recarga, voltar e paginação. Se seis colunas não couberem em 1024 com alvos de toque e conteúdo, registre a evidência e ajuste o breakpoint de tabela/cards coerentemente com T5; não esconda colunas ou force overflow global. A política completa de detalhes/truncamento é T5, não uma refatoração nesta tarefa.

Execute pnpm test:e2e -- tests/e2e/transactions.spec.ts, typecheck/lint. Revise screenshots e diff, registre o resultado e preserve o mesmo worktree para T4. Não avance automaticamente.
```

## Prompt 4 — T4: shell, acesso e modais mobile-first

```text
Execute somente T4 no worktree existente do Financy. Aplique o contrato de docs/prompts-execucao-ux-responsive.md, confirme T2/T3 concluídas e leia as decisões responsivas da seção 6 do design de 20/10. Use os componentes existentes e as skills visuais previstas; preserve identidade e comportamentos de domínio.

Implemente a base responsiva em app-shell.tsx, styles.css, auth-form.tsx/profile-page.tsx e nos diálogos existentes apenas no necessário. Crie tests/e2e/responsive.spec.ts com cenários desta tarefa, sem exigir que as páginas ainda a adaptar em T5 já cumpram toda a matriz final.

Shell: duas linhas na base, logo/perfil acima e três links sempre visíveis com áreas iguais abaixo; a partir de 768, uma linha com navegação central. Preserve rota ativa/skip-link/foco. Não adicione menu hamburger, drawer, estado de navegação ou barra fixa inferior. Retire a altura fixa conflitante.

Use margens laterais 16/24/32/48 nas faixas base/768/1024/1280, preservando max-width e min-width:0 nos filhos necessários. Auth mantém máximo 448, padding adaptativo e rolagem vertical; nome/e-mail longos não alargam a página. Toggle de senha, perfil e demais controles principais devem ter área efetiva 44×44, mantendo paste/autofill, validação, sessão, logout e cache.

Modais: na base, topo com margem 16, altura dependente de 100dvh e scroll interno; uma coluna no formulário. Em 640+, centralização e pares de transação em duas colunas. Categoria pode atingir máximo 480; opções de ícones/cores fazem auto-fit com áreas 44. Não esconda campos/ações para caber nem acrescente visualViewport listener sem defeito reproduzido.

Teste trap/Escape, fechamento bloqueado durante envio e restauração de foco; se o trigger não estiver conectado/visível após mudar breakpoint, use fallback visível coerente com a página. Em 320/390, prove ausência de overflow do shell/auth/modal e geometria dos controles. Em 667×375 e 390×400, alcance último campo, salvar/cancelar/fechar por scroll e teclado.

Execute cenários focados de access/auth/responsive, typecheck/lint e revisão visual antes/depois. Registre testes em viewport como simulação, sem alegar teclado virtual/dispositivo real. Separe lacunas de T5 de defeitos desta tarefa. Pare após registrar T4, mantendo o worktree.
```

## Prompt 5 — T5: páginas responsivas, recentes e detalhes completos

```text
Execute somente T5 no mesmo worktree do Financy. Aplique o contrato de docs/prompts-execucao-ux-responsive.md, leia T5, o contrato responsivo e as evidências de T3/T4. Implemente em dashboard-page.tsx, categories-page.tsx, transactions-page.tsx, styles.css e nos testes pertinentes. Crie TransactionDetailsDialog de leitura com as props e limites do plano; sem query, rota ou edição nova.

Recentes a partir de 768: mesmas quatro tracks em TODAS as linhas — 40px / minmax(0,1fr) / minmax(0,.75fr) / minmax(0,1fr), mesmos gaps/padding; badge central no terceiro track, ícone e tipo preservados. Abaixo de 768: descrição/data ao lado do ícone, categoria em linha própria e valor/tipo em outra à direita. Use min-width:0 e truncamento local de uma linha onde definido; não mude os textos salvos.

Abra o diálogo de detalhes por botão no título, com nome “Ver detalhes da transação …”, no dashboard e na listagem. Mostre descrição, categoria, data, tipo e valor completos usando o objeto Transaction já carregado. Garanta Enter/Espaço, toque, Escape, foco preso/restaurado e quebra segura de textos/valores longos. Reutilize o diálogo, não um segundo formulário/estado financeiro; mantenha IDs únicos.

Dashboard: totais empilhados e três colunas a partir de 768; painéis empilhados abaixo de 1280 e duas colunas 2:1 a partir dessa largura. Ranking pode mover o valor para outra linha, mantendo todo o conteúdo. Categorias: resumos 1 coluna e 3 a partir de 768; cards 1/2/3/4 em base/640/1024/1280. Descrição null continua sem bloco reservado.

Transações: cards abaixo de 1024 e tabela semântica a partir daí, salvo ajuste de breakpoint sustentado por prova de T3. Use as mesmas rows de table.getRowModel, definições/cell renderers, handlers, query e diálogos. Cards exibem descrição, data, categoria, tipo, valor e editar/excluir, com labels. Só a apresentação ativa pode estar exposta/focável; preserve um único conjunto de IDs/diálogos e estado de seleção. Nenhuma lógica financeira ou consulta deve ser duplicada.

Filtros: 1/2/4 colunas em base/640/1024; ações adaptam. Na paginação, contagem acima dos controles na base e quatro botões 44+indicador cabem em 320. Preserve route.useSearch/navigate, correção de página, todos os campos e ordenação remota, sem refatorar parser de URL.

Use casos determinísticos com títulos legados de 80 pontos de código, textos sem espaços, categorias curtas/longas, valor 9007199254740993.01 e ambos os tipos. Para geometria, dados legados podem vir de mock da resposta; não semeie inválidos depois dos CHECKs nem confunda mock com prova de migration/RLS.

Prove centros dos badges iguais e coincidentes com a track reservada dentro de 2 CSS px em 768/1024/1440, independentemente do texto/valor. Confira reticências reais e leitura integral por teclado/toque, ações acessíveis, ausência de overflow da página e estados vazio/carregando/erro. Alternar 390↔1440 deve preservar URL/filtros/seleção e não duplicar mutations/queries; respostas antigas continuam isoladas por conta/período.

Execute E2E focados de responsive/dashboard/transactions/categories, unitários de money/dates/search/router-search existentes e typecheck/lint. Compare screenshots representativas com referências e preserve R4. Registre resultados/limites e pare antes de T6.
```

## Prompt 6 — T6: regressão, revisão e entrega para integração

```text
Execute somente T6 no worktree da unidade de UX responsiva do Financy. Aplique o contrato de docs/prompts-execucao-ux-responsive.md e leia os registros de T1–T5 e a matriz da seção 6 do plano de 20/10. Confirme entregas e eventuais pendências antes de declarar a unidade pronta. Não faça merge, push, deploy, migration em produção ou arquivamento do worktree nesta tarefa.

Revise R1–R6 e os cinco pontos de Review Focus contra o diff completo, consumidores, fixtures e testes. Confira que o único grant adicionado é o de description expressamente autorizado. Verifique no desenvolvimento migrations/histórico, CHECKs e seu estado de validação, description nullable e get_dashboard invoker; confirme dinheiro textual, snapshots, FK, cache e URL preservados. RLS deve ter evidência por clientes públicos de duas contas/anônimo, não apenas SELECT administrativo.

Depois de estabilizar, execute uma sequência de regressão: pnpm typecheck; pnpm lint; pnpm test; pnpm test:integration; pnpm test:e2e; pnpm build, como comandos separados e com os guards/ambiente confirmados. Uma suíte de escrita por vez. Registre exit codes, contagens reais e falhas; resultados antigos ou testes pulados não contam como passagem. Se falhar, corrija a causa dentro do escopo e repita os testes afetados, ampliando somente quando houver nova alteração/risco.

Cubra seis larguras 320/375/390/768/1024/1440 nos cenários geométricos rápidos, sem multiplicar toda a suíte por seis. Jornada autenticada representativa em 390 com toque simulado; regressão desktop em 1440; casos extremos em 320; paisagem 667×375 e modal baixo 390×400. Revise capturas/goldens selecionadas manualmente antes de aceitar mudanças.

Verifique teclado/foco/erros, detalhes completos sem hover, textos grandes/sem espaços, valores exatos grandes, badges centralizados e ações 44. Confira zoom real do navegador em 200%/400%, sem substituí-lo por CSS zoom. Teste dispositivo real e teclado virtual somente quando disponível e registre a lacuna se só houver emulação. Não declare equivalência entre as duas evidências.

Atualize README, DESIGN e operações por adendo datado, preservando histórico: foco mobile-first, novos comportamentos, migrations, grant aprovado, condição dos títulos legados, compatibilidade e limites. Rollback do frontend não desfaz CHECKs nem recupera dados; não proponha DROP/reset automático. Não publique frontend novo contra schema antigo de produção.

Faça auto-revisão explícita. Revisão independente com agente só se o usuário tiver autorizado esse método; não simule independência. Entregue matriz R1–R6 com evidências, arquivos/diff, branch/worktree, HEAD e mudanças não commitadas, testes executados e limitações. Deixe a unidade disponível para revisão humana e futura autorização de integração. Não marque uma nova release como concluída.
```

## Limites desta preparação

Foram analisados os dois documentos fornecidos e o estado Git dos arquivos de planejamento. Não foram reaplicadas auditorias remotas, reabertas referências visuais, executados testes, criados branches/worktrees ou modificados o aplicativo, o banco e os documentos de origem. A disponibilidade atual dos modelos permanece a confirmar na execução.
