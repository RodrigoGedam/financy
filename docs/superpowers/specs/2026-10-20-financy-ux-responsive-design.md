# Financy — títulos, categorias e web responsiva: design proposto

**Data:** 20/10/2026. **Status:** rascunho para revisão; não aprovado para execução.
**Plano associado:** [tarefas e verificação](../plans/2026-10-20-financy-ux-responsive.md).

## 1. Objetivo e limites

Permitir organizar as mesmas finanças individuais pelo celular e computador, restaurar a seção comprovadamente ausente em categorias, persistir descrição opcional e limitar os dois títulos a 20 caracteres. A prioridade exclusivamente desktop do documento de 14/10 passa a ser **web responsiva mobile-first, preservando a experiência desktop**. Este documento é uma proposta de atualização; não reescreve a especificação, o plano ou os registros históricos.

Esta etapa autoriza leitura e documentos de planejamento. Não autoriza implementação dos itens 1–5, migrations, dependências, branches/worktrees, testes, commits, push ou publicação. Aprovar estes documentos ainda exige um pedido posterior explícito de implementação.

Preservar React/TypeScript/Vite/pnpm, TanStack Router/Query/Form/Table, Tailwind, Radix/componentes existentes e Supabase. Preservar Inter, logos, sete cores, catálogo Lucide, foco da marca e tokens do DESIGN.md. Sem redesign, animações novas, PWA, offline, aplicativo nativo, stores ou camadas novas.

## 2. Estado confirmado e evidências

- Checkout em `main`, HEAD `359a1857ad37e87c576fd03a71d85af03984a776`; referência local `origin/main` aponta ao mesmo SHA. Não foi feito fetch, portanto isso não prova que o servidor remoto permaneça nesse SHA.
- Única mudança inicial no status: arquivo do usuário não rastreado `docs/prompt-atualizacoes-ux-mobile-first.md`. Não foi alterado. Nenhum AGENTS.md foi encontrado no repositório nem nos ancestrais consultados.
- [README](../../../README.md), [DESIGN](../../../DESIGN.md), [operações](../../operations.md), [especificação vigente](../specs/2026-10-14-financy-v1.md), [plano vigente](../plans/2026-10-14-financy-v1.md), registros financeiros de 16/10 e [encerramento da release](../execution/2026-10-17-financy-release.md) foram consultados. A release de 17/10 está documentada como publicada; afirmações anteriores de “publicação pendente” são históricas. Não foi repetido smoke do deployment.
- Categorias têm CRUD, contagem agregada de todo o histórico e paginação interna de 500 categorias; transações têm paginação remota de dez registros, filtros na URL e ordenação data/criação/ID. Dashboard usa RPC com dinheiro textual. Não substituir esses fluxos.
- [CategoriesPage](../../../src/features/categories/categories-page.tsx) passa do cabeçalho diretamente aos estados/grade; card contém ícone, ações, nome e rodapé. [CategoryDialog](../../../src/features/categories/category-dialog.tsx) contém nome, ícone e cor. [API](../../../src/features/categories/api.ts) seleciona apenas `id,name,color,icon`; não existe descrição da categoria nos tipos ou banco.
- [TransactionsPage](../../../src/features/transactions/transactions-page.tsx) usa TanStack Table e células com wrappers próprios. [CSS](../../../src/styles.css), linhas 155–164 nesta revisão: cabeçalhos à esquerda, exceto valor; ações usam flex sem alinhamento à direita. Não há ordenação interativa configurada; conservar a ordenação remota existente.
- [DashboardPage](../../../src/features/dashboard/dashboard-page.tsx) mantém ícone, descrição/data, badge e valor/tipo por linha. CSS 127–132 reserva tracks, mas usa `justify-self: end` no badge e permite quebra de texto; centralizar texto isoladamente não resolve.
- CSS 52–57: navbar de altura fixa 69, três colunas, avatar 36. CSS 63–107: padding global 48/24, controles de 32/36, seletores de cores de 30 e grade de oito ícones. CSS 183: tabela com mínimo 880 abaixo de 700. Existem adaptações parciais; não constituem cobertura mobile completa.
- Auth já tem cartão fluido de máximo 448, inputs de 48 e `100dvh`. Perfil já quebra e-mail. Reaproveitar esses acertos, corrigindo padding, nome longo e toggle de senha de 40.
- Consultas remotas **somente SELECT**, em ambos os projetos confirmados pelo conector: PostgreSQL 17.11, UTF8; descrição ausente; zero CHECKs de char_length; RLS ativa nas duas tabelas e oito políticas. UPDATE de categorias para authenticated está limitado a `color, icon, name`. Nenhuma política ou credencial foi modificada.

### Auditoria agregada de títulos existentes em 20/10

Contagem após remover o conjunto de espaços externos definido na seção 5. Nenhum nome, descrição, ID de conta ou valor financeiro foi retornado.

| Ambiente | Categorias / acima de 20 / maior título | Transações / acima de 20 / maior título |
| --- | --- | --- |
| Desenvolvimento | 0 / 0 / 0 | 0 / 0 / 0 |
| Produção | 1 / 0 / 7 | 1 / 0 / 7 |

É uma fotografia, não garantia para uma migration futura. Repetir imediatamente antes da mudança; o plano cobre registros acima de 20 mesmo que hoje não existam.

## 3. Referências visuais efetivamente consultadas

Foram visualizadas as três imagens locais anexadas: cards completos, modal com descrição e “Opcional”, e recentes com badges marcados. Caminhos originais estão no pedido; são temporários e podem desaparecer. Não foram copiados assets nem persistidas URLs temporárias do Figma.

No [Figma — categorias, frame 3104:2028](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3104-2028), contexto e screenshot confirmaram uma linha de **três resumos entre o cabeçalho e a grade**:
1. Total de categorias (`3104:2500`);
2. Total de transações (`3104:2652`);
3. Categoria mais utilizada (`3104:2658`).

A imagem 1 é recorte dos cards e não mostra essa linha; a evidência da seção inteira vem do frame. O DESIGN.md e o registro anterior explicitam a exclusão de resumos ilustrativos pelo escopo antigo. A restauração agora usa dados reais; os números 8/27 do mockup não serão copiados.

O [style guide 3:377](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3-377) foi visualizado por screenshot: Inter, marca, catálogo, componentes. O pedido de contexto desse nó retornou “nothing selected”; não se afirma ter obtido contexto detalhado dele. O contexto de categorias também forneceu os tokens de cor. As capturas do Figma são desktop; o desenho mobile abaixo é proposta, não layout mobile extraído do Figma.

Não houve renderização atual da aplicação nesta análise. Os defeitos atuais foram confirmados no código, comparados com imagens/Figma; medidas efetivas em pixels e screenshots de antes/depois são trabalho futuro.

## 4. Matriz dos seis requisitos

| Requisito | Decisão proposta | Entrega e prova futura | Tarefa |
| --- | --- | --- | --- |
| R1 — seção ausente | Restaurar os três resumos comprovados, antes da grade; separado de R2 | Resumos com dados reais, zero/vazio/erro e atualização após CRUD/reclassificação; screenshot com o frame | T2 |
| R2 — descrição opcional | `categories.description: text nullable`, vazio normalizado para null; criação, edição e remoção | Persistência, reload, consumers e cards sem placeholder/altura reservada quando null | T2 |
| R3 — títulos | `categories.name` e `transactions.description`: 1–20 pontos de código após trim; UI/API/banco | 19/20/21, Unicode, chamada direta e transição legada sem perda | T1 |
| R4 — tabela | Descrição esquerda; data/categoria/tipo centro; valor/ações direita, incluindo wrappers | Geometria de cabeçalhos/células/badges/botões e comparação visual | T3 |
| R5 — recentes | Tracks idênticos por linha, badge no centro do track reservado; overflow controlado e detalhes acessíveis | Categorias curtas/longas, títulos legados, valores grandes; teclado/toque | T5 |
| R6 — mobile-first | Base pequena e evolução por conteúdo; mesmos dados, queries, filtros e formulários | Matriz de seis larguras e jornadas representativas, desktop preservado | T4–T6 |

Abordagens avaliadas: apenas corrigir CSS deixaria schema/validação e persistência incompletos; reestruturar o frontend ampliaria custo e risco sem resolver uma necessidade adicional. Recomenda-se evolução incremental dos componentes existentes, com duas mudanças coordenadas de dados e uma adaptação de apresentação. Cards mobile exigem algum markup próprio, mas reutilizam o modelo de linhas/células da tabela, sem replicar lógica financeira.

## 5. Regras de conteúdo e compatibilidade

### Títulos: significado, Unicode e normalização

Título de categoria continua `name`; título da transação continua `description`. Não criar segundo campo de título nem limitar o nome do perfil. A nova descrição de categoria é outro campo, sem herdar 20 ou receber um limite arbitrário de 200.

Contar **pontos de código Unicode**, sem normalizar NFC/NFD e sem contar grafemas. Frontend: iteração Unicode (`Array.from(textoNormalizado).length`); banco UTF8: `char_length(textoNormalizado)`. Não usar string.length ou maxLength HTML como regra. Exemplos: “é” precomposto = 1; “e” + acento combinante = 2; “😀” = 1; família “👨‍👩‍👧‍👦” = 7. Expor essa decisão na ajuda: “Até 20 caracteres; emojis compostos podem contar mais de um.”

Remover somente espaços externos; preservar espaços internos. Usar o mesmo conjunto do trim do JavaScript: U+0009–000D, 0020, 00A0, 1680, 2000–200A, 2028, 2029, 202F, 205F, 3000 e FEFF. No trigger PostgreSQL, usar btrim com esse conjunto explícito; btrim sem segundo argumento remove apenas espaço comum e hoje diverge do frontend. Não converter acentos nem colapsar espaços internos.

Centralizar somente essa regra compartilhada em `src/lib/financial-text.ts`, consumida pelos formulários e APIs existentes. O contador mostra tamanho normalizado N/20, ajuda e erros vinculados por aria-describedby; não anunciar cada tecla por live region. Validar no blur/envio, focar o primeiro campo inválido no envio e conservar texto ao falhar. Aceitar colar 21 caracteres para corrigir; não cortar nem depender de maxlength UTF16. Mensagens: “Use até 20 caracteres no nome da categoria.” e “Use até 20 caracteres na descrição da transação.” Preservar mensagens de obrigatoriedade.

Nova migration substitui apenas o trecho textual de `private.prepare_financial_row`; manter imutabilidade, validação monetária e truncagem exata já existentes. CHECKs nomeados `categories_name_length_check` e `transactions_description_length_check` verificam char_length entre 1 e 20 após o trigger. RLS, FK e RPCs de transação continuam iguais. Mensagem de erro de CHECK desses campos deve ser específica, sem reclassificar erros de dinheiro/data como erro de título.

### Transição legada: regra explícita

Adicionar CHECKs como **NOT VALID**, sem reescrever registros. PostgreSQL passa a exigir a regra em INSERT e UPDATE, incluindo chamada direta à tabela e ambas as RPCs; NOT VALID não é uma isenção para novas escritas.

Registros legados continuam listáveis, filtráveis, visíveis no dashboard e abertos para edição com o texto integral. Ao salvar **qualquer edição da própria categoria/transação**, exigir corrigir seu título para até 20 antes de persistir; explicar isso no formulário. Não permitir salvar somente cor/valor com título ainda inválido. Categoria legada não impede criar/editar uma transação com título válido vinculada a ela, pois a categoria não está sendo atualizada. Exclusão continua com as proteções existentes.

Não impor a regra de escrita aos parsers de leitura; isso esconderia dados antigos. Em transação, o snapshot esperado conserva o título original integral; `change_transaction` compara a versão antiga antes de aplicar o título corrigido. Conflitos de concorrência continuam rejeitados.

Se a auditoria no momento da migration apontar zero violações, validar os CHECKs. Se houver violações, concluir a expansão com NOT VALID, registrar a pendência de validação histórica e permitir correção pelo dono. Só validar depois de zero violações, numa etapa autorizada. Não fazer uma migration incondicional que falhe ao encontrar legado nem truncar/renomear/excluir dados. Normalização de um nome legado pode encontrar duplicidade; manter erro 23505, sem mesclar categorias.

### Descrição opcional: fluxo completo

- `CategoryInput` recebe `description: string | null`; `Category` e `CategorySummary` carregam o mesmo campo. Formulário usa string vazia para editar; API normaliza trim e converte vazio/espaços em null. Coluna nova aceita null por padrão, sem backfill fictício.
- Campo “Descrição” após o nome e antes de Ícone, com indicação “Opcional” abaixo, conforme imagem 2 e ligada ao campo por aria-describedby. Não renomear labels existentes sem necessidade.
- API de categorias inclui description em select de lista e retornos de insert/update; parser aceita somente string ou null e preserva legado. Ao limpar no formulário, enviar null explicitamente; omitir o campo em PATCH não o limpa.
- Card exibe descrição não vazia abaixo do título, com texto secundário e quebra segura. Sem parágrafo, placeholder, altura fixa ou gap exclusivo quando null. Conteúdo longo pode ampliar o card; não alterar o valor salvo para caber.
- `transactions/api.ts` deve selecionar `categories(id,name,description,color,icon)`. Dashboard: atualizar JSON de `get_dashboard` tanto em topCategories quanto category de recentTransactions; incluir campo no monthly/ranked/group by pertinentes. Parser category de `dashboard/api.ts` e fixtures recebem string/null. Não trocar o transporte monetário textual nem a assinatura RPC.
- Regenerar `database.types.ts` a partir de desenvolvimento após migration. `numeric` gerado continua number; preservar `amount::text`, RPCs e tipos de domínio string.
- Manter query keys com userId e invalidação do prefixo `['finance', userId]`; não criar segundo cache. Revalidar após editar descrição/nome, reclassificar, excluir e trocar conta.

**Dependência de permissão a revisar:** grants atuais de INSERT/UPDATE são por coluna. Persistir description exige conceder **somente INSERT(description) e UPDATE(description) a authenticated**, sob a RLS existente. O pedido veda alterar permissões; portanto esta extensão pontual é uma proposta pendente de decisão, não autorização presumida. Sem ela, R2 fica bloqueado. Não contornar com service_role, SECURITY DEFINER, JSON em outro campo ou nova RPC privilegiada. Nenhuma outra permissão/política deve mudar.

### Resumos restaurados

Reutilizar a lista completa de CategorySummary, já paginada e com contagens autorizadas: total de categorias = length; total de transações = soma de transaction_count de todo o histórico; mais utilizada = maior contagem positiva. Empate: ordem pt-BR já devolvida por listCategories, depois ID. Todas as contagens zero: “Nenhuma categoria utilizada”; nenhuma categoria: totais zero e o mesmo estado vazio existente abaixo.

Não usar ranking mensal de despesas, dinheiro ou mês do dashboard para esses resumos. Não adicionar query/RPC por card. Resumos só mostram valores quando a consulta estiver disponível; carregando/erro não exibem zeros falsos. Reutilizar ícones e tokens do catálogo. Validar soma inteira segura, como a API já faz para contagens individuais.

## 6. Contrato responsivo proposto

Breakpoints têm motivação de conteúdo: 640 px permite duas colunas de campos/cards; 768 permite navegação numa linha e recentes em colunas; 1024 comporta tabela com seis colunas e ações de 44; 1280 comporta os dois painéis do dashboard e quatro categorias. São valores iniciais verificáveis, ajustáveis apenas se a prova visual mostrar necessidade.

Base: 16 px de margem lateral, filhos flex/grid com min-width:0, uma coluna e larguras fluidas. Em 768, margens 24; em 1024, 32; em 1280, 48, mantendo o max-width existente. Sem largura mínima global para esconder erros, sem overflow:hidden na página ou bloqueio de zoom. Clipping de reticências é local ao texto e não corta foco.

| Área / problema atual | Base mobile e evolução decidida | Arquivos / dependência | Aceite específico |
| --- | --- | --- | --- |
| Shell: navbar de 69, logo+nav+avatar não cabem confortavelmente | Duas linhas: logo/perfil acima, três links sempre visíveis abaixo; links com áreas iguais e 44 de altura. A partir de 768, linha desktop com nav central. Sem hamburger/drawer/estado novo ou barra fixa inferior | app-shell.tsx, styles.css; rotas existentes | 320 sem overflow; rota ativa, skip-link, foco e perfil disponíveis; nav não sobrepõe conteúdo |
| Login/cadastro/perfil: padding estreita cartão, toggle 40 e nome pode estourar | Cartão 100% até máximo 448; padding 16/24 em pequena largura e 32 quando couber; página rola verticalmente. Toggle 44 e ajuste do padding do input. Nome/e-mail quebram; botões e mensagens legíveis | auth-form.tsx, profile-page.tsx, estilos compartilhados | Senha, labels, erros, autofill/paste e logout mantidos; nome longo não alarga página |
| Dashboard: totais/painéis e quatro tracks mínimos apertam | Totais empilhados, três a partir de 768. Painéis empilhados até 1279; duas colunas 2:1 a partir de 1280. Ranking reorganiza valor abaixo em espaço estreito | dashboard-page.tsx, styles.css; parseDashboard preservado | Valores exatos, período e ranking continuam visíveis; estados não mudam layout da página |
| Recentes: badge à direita do track e textos quebrando | Abaixo de 768: descrição/data ao lado do ícone, categoria em linha própria e valor/tipo em outra, à direita. A partir de 768: todos os itens usam os mesmos quatro tracks 40px / minmax(0,1fr) / minmax(0,.75fr) / minmax(0,1fr), mesmos gaps/padding. Badge centralizado no terceiro track | dashboard-page.tsx, styles.css, diálogo de detalhes T5 | Centro da categoria independente do texto/valor; nenhuma quebra involuntária; truncamento dá acesso completo |
| Categorias: quatro colunas e resumos ausentes | Resumos 1 coluna, 3 a partir de 768. Cards 1 / 2 / 3 / 4 colunas em base / 640 / 1024 / 1280; descrição condicional, ações 44, rodapé sem min-height artificial | categories-page.tsx e CSS; depende T2 | Cards/ações/contagens e estados preservados; descrição null não reserva bloco |
| Transações: tabela mínima 880 e ações comprimidas | Abaixo de 1024, lista de cards sem scroll lateral; acima, tabela semântica com seis colunas. Cada card contém descrição, data, categoria, tipo, valor e editar/excluir. Mesmo table.getRowModel, definições/cell renderers, handlers, query e diálogos; só apresentação muda | transactions-page.tsx, styles.css; depende T3 | Mesmos registros/ordem/filtros; dez por página; nada só acessível no desktop; apresentação oculta sai da árvore acessível |
| Filtros/paginação: duas colunas ainda apertadas e rodapé numa linha | Filtros 1 coluna na base, 2 a partir de 640, 4 a partir de 1024; ações empilham/quebram. Paginação: contagem acima dos controles na base; quatro botões 44 e indicador cabem em 320; uma linha quando houver espaço | transactions-page.tsx, styles.css; search.ts/router-search.ts mantidos | Aplicar/limpar, reload/voltar/avançar, categoria indisponível e correção de página continuam iguais |
| Modais: centro fixo, oito ícones e sete cores apertados | Base ancorada no topo com 16 de margem, scroll interno e max-height dependente de 100dvh; formulário em uma coluna. Em 640+, centralização e pares de transação em duas colunas. Categoria pode ter máximo 480 para oito opções de 44 + gaps, mantendo tokens; auto-fit de opções nas pequenas larguras | category-dialog.tsx, transaction-dialog.tsx, styles.css; Radix existente | Teclado virtual/viewport baixo: campo ativo, fechar, salvar/cancelar alcançáveis por rolagem; foco preso e restaurado; escolhas por rádio acessíveis |

Controles principais e ações financeiras têm área efetiva de pelo menos 44×44 CSS px em todos os breakpoints, inclusive desktop touch; não basta aumentar o desenho do ícone. Manter espaço entre controles, labels, erro associado, foco visível e feedback já existente. Não exigir gesto ou hover. Orientação paisagem não deve fixar a altura do modal ou impedir rolagem.

### Texto completo, reticências e alinhamento

Recentes e células compactas: uma linha em descrição, badge e valor; min-width:0 nos filhos, limites no track, overflow/text-overflow locais. Ícone do tipo não encolhe nem desaparece. O valor continua texto monetário exato; não cortar a string de domínio.

Adicionar um único `TransactionDetailsDialog` de leitura, reaproveitando Radix/Button e o objeto Transaction já carregado. Um botão no título da transação, com nome “Ver detalhes da transação …”, abre descrição integral, categoria integral, data, tipo e valor integral; teclado Enter/Espaço, toque, Escape e restauração de foco. Usar no dashboard e nos cards/tabela quando truncáveis. Não criar query, rota, edição ou estado financeiro adicional. Conteúdo do diálogo quebra naturalmente, inclusive valores sem espaços. Assim o conteúdo é acessível mesmo quando não houver hover.

Na tabela desktop, associar classes/data-column pelo ID da coluna aos th/td. Descrição e seu wrapper à esquerda; data/categoria/tipo com conteúdo interno centralizado; valor e grupo de ações no extremo direito da área útil. Reservar pelo menos 128 px para ações (44+8+44 e padding), evitando a largura percentual antiga insuficiente. Manter semântica table/thead/tbody/th scope, cálculos de paginação e ordenação remota.

Não criar scroll lateral como solução padrão mobile. Se as provas em 1024 demonstrarem que seis colunas não cabem com dados reais e ações 44, subir o breakpoint da tabela e usar os mesmos cards nessa faixa; não esconder colunas nem criar scroll global.

## 7. Análise de impacto apoiada pelo Graphify

[Grafo local](../../../graphify-out/graph.json): 385 nós/818 arestas, built_at_commit `5b398426e51662e06308cccf294820150a3b17d8`, anterior ao HEAD atual e à anonimização/release. Linhas do grafo não são as linhas atuais após formatação. Não reconstruído nem alterado. Histórico de “publicação pendente”, CSS sem AST e extração semântica das três migrations são limitações conhecidas.

Vocabulário usado: CategoryDialog, createCategory, listCategories, validateTransactionInput, save_transaction, AppShell, TransactionsPage, DashboardPage, Input, Button. Duas queries BFS retornaram 134/119 nós, com orçamento de 1100/1000 tokens e truncamento explicitamente informado. Caminhos complementaram a busca; não se considera que a query retornou toda a análise.

| Traço observado no grafo | Classificação e interpretação | Confirmação no código atual / impacto |
| --- | --- | --- |
| CategoryDialog → useCategoryMutations, calls, L16 | EXTRACTED / AST | category-dialog.tsx e queries.ts; formulário deve enviar descrição e validar título |
| useCategoryMutations → createCategory, indirect_call, L16 | INFERRED / AST; indireção de mutationFn | queries.ts confirma mutationFn:createCategory; api.ts confirma insert/select; não atribuir certeza só à inferência |
| public.get_dashboard → public.categories, shares_data_with, line 26 | EXTRACTED / semântica SQL | JOIN e JSON na migration confirmam consumo de categoria; adicionar descrição nos dois retornos |
| AppShell → useAuth ← useCategories ← TransactionsPage, caminho não dirigido de 3 saltos | Arestas EXTRACTED; ligação por sessão, não composição de telas | app-shell.tsx/router.tsx/transactions-page.tsx confirmam composição e dados. Layout por CSS precisa inspeção fora do grafo |
| CategoryDialog → … → public.categories, caminho não dirigido de 6 saltos via Button, DashboardPage, data e registro histórico | Arestas do caminho EXTRACTED, mas **não é fluxo de persistência** | A busca dirigida não encontrou caminho. O caminho curto por utilitários compartilhados não prova formulário→banco; API/SDK/grants/trigger foram rastreados manualmente |

Fluxos confirmados **fora das lacunas do grafo**, por leitura:
- Categoria: CategoryDialog → useCategoryMutations → create/updateCategory → Data API categories → prepare_financial_row/CHECK/RLS → select/parser → useCategories → cards/resumos. Consumidores: listTransactions e JSON/parseDashboard; invalidação compartilhada finance/userId.
- Título transação: TransactionDialog → validateTransactionInput → save_transaction/change_transaction → trigger/CHECK → amount::text/listTransactions ou get_dashboard → tabela/cards/recentes. Preservar snapshot original.
- Responsividade: router.tsx monta AppShell e páginas; classes vêm de styles.css e ui/Button/Input. Rotas e regras de search não precisam mudar. Styles não estão cobertos estruturalmente; os breakpoints propostos são análise direta e decisões de design.

Tipos gerados, parsers de categoria, fixtures SQL/API/E2E, contagens e cache pertencem ao mesmo escopo de persistência. Não limitar o impacto ao formulário nem atualizar somente CategoryInput.

## 8. Verificação futura e revisão

A especificação será revisada antes de liberar o plano. O plano é entregue agora por pedido explícito como rascunho dependente dessa revisão; sua presença não pula os gates de Superpowers. Depois de aprovar a especificação, revisar tarefas/modelos/isolamento. Executar apenas com novo pedido explícito. Recomendação de execução: nativa, sequencial, com revisão independente ao final se posteriormente autorizada; nenhum agente foi disparado nesta análise.

O plano define testes de comportamento, integração/RLS, ensaio de migration e prova visual. Resultados históricos de 155/19/15 não são novos testes. Nesta etapa não foram executados typecheck, lint, test, integração, E2E ou build, nem testes de escrita.

Auto-revisão da especificação em 20/10: R1 distinguido de R2; nomes de campos sem ambiguidade; Unicode/trim e transição definidos; grant identificado como decisão pendente; preservação de dinheiro/datas/cache/URL explícita; mobile cobre as oito áreas; nenhum histórico reescrito. Não houve revisão humana ou aprovação desta versão.

## 9. Decisões para revisão e limitações

1. Autorizar futuramente a extensão estrita dos grants de coluna para description, ou manter R2 bloqueado sob a proibição atual.
2. Revisar a contagem por pontos de código e a regra de corrigir título legado ao salvar qualquer edição da própria linha.
3. Revisar as propostas visuais mobile e os critérios/tarefas do plano, em sequência aos gates acima.

Não há ambiguidade pendente sobre a seção R1: o frame forneceu evidência suficiente. Os empates/zero nos resumos são decisões propostas, pois o Figma não define comportamento.

Impeccable foi aplicado no modo Operate com referências shape/adapt e contexto direto do produto. Seu launcher pode baixar binário/cache e não foi executado sob a restrição de não modificar ambiente; não foram criados PRODUCT.md ou contratos de design auxiliares. Frontend God Mode orientou grid/foco/dados, com preferências estéticas genéricas subordinadas ao Figma. UI UX Pro Max foi consultado por busca focada de toque/teclado/formulários, sem persistir design system. Ponytail full guiou reaproveitamento; Graphify foi usado somente em consulta.

Não há aparelho real, execução visual atual nem ambiente local descartável comprovado nesta análise. Nenhum executável supabase/docker foi encontrado no PATH consultado; o procedimento histórico usa pnpm dlx com CLI fixado e requer verificação futura antes de uso. Não criar terceiro projeto Supabase Free nem contratar serviços para contornar isso.

### Fontes técnicas oficiais consultadas em 20/10/2026

- [PostgreSQL 17: strings](https://www.postgresql.org/docs/17/functions-string.html): char_length, btrim e UTF8.
- [PostgreSQL 17: ALTER TABLE](https://www.postgresql.org/docs/17/sql-altertable.html): CHECK NOT VALID verifica novas escritas/edições e validação posterior não corrige registros.
- [ECMAScript: strings e iteração Unicode](https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype-@@iterator) e [trim](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim): normalização externa e contagem definidas acima.
- [Supabase: suporte TypeScript](https://supabase.com/docs/reference/javascript/typescript-support): tipos derivados do schema; atualizar contratos dos selects.
- Modelos e configuração: fontes, evidência local e recomendações específicas estão no plano associado.
