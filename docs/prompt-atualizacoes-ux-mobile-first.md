# Prompt para o Codex — planejamento das correções e da adaptação mobile-first

Copie o bloco abaixo no Codex com acesso ao repositório. As três imagens são referências visuais do pedido; em outro dispositivo ou se os arquivos temporários tiverem expirado, anexe-as novamente.

```text
Quero planejar as atualizações do Financy conforme os seis requisitos abaixo. Seu objetivo nesta tarefa é exclusivamente analisar e entregar um plano concreto para revisão, incluindo o modelo do Codex e a estratégia de branch ou worktree mais adequados para cada tarefa. Não implemente nenhuma das alterações, inclusive as correções dos itens 1–5.

Você pode inspecionar código, consultar referências, utilizar o grafo existente e escrever somente os documentos de planejamento. Não altere código do produto, dependências, banco ou ambientes; não crie branches ou worktrees nesta etapa; não publique, faça commit/push nem execute testes que escrevam dados. As instruções de comportamento abaixo descrevem o resultado futuro a ser planejado, não autorização para implementá-lo. Pare após entregar o planejamento; a implementação exige um pedido posterior explícito.

## Contexto e ferramentas

O Financy é uma aplicação web de finanças pessoais com React, TypeScript, Vite, pnpm, TanStack Router/Query/Form/Table, Tailwind e Supabase Auth/PostgreSQL/Data API/RLS. Confirme o estado atual em vez de confiar em relatos antigos. Preserve a precisão monetária, as regras de calendário, a paginação/filtros na URL e o isolamento dos dados entre contas.

Leia as instruções do repositório, README.md, DESIGN.md, docs/operations.md, a especificação e o plano vigentes em docs/superpowers/, além dos registros recentes de execução. Estes requisitos atualizam o escopo antigo que priorizava somente desktop: agora quero uma web responsiva para celular e computador. Registre essa mudança no planejamento sem reescrever o histórico aprovado.

Use efetivamente as skills disponíveis, carregando apenas as referências pertinentes:
- superpowers:brainstorming para consolidar o design e as decisões; superpowers:writing-plans para tarefas verificáveis. Respeite as revisões previstas por essas skills. Descreva no plano o futuro fluxo de execução e verificação, sem acioná-lo nesta tarefa.
- ponytail em nível full para reaproveitar soluções existentes e manter a menor mudança completa, incluindo tipos, API, banco e testes afetados.
- ui-ux-pro-max para responsividade, usabilidade por toque, hierarquia e acessibilidade.
- frontend-god-mode para qualidade e consistência do frontend.
- impeccable para avaliar as telas existentes e orientar as correções de alinhamento, conteúdo e adaptação responsiva.
- graphify para mapear o fluxo e a análise de impacto. Consulte primeiro graphify-out/graph.json quando existir, usando query/path com o vocabulário real do grafo e confirmando as fontes no código. Não reconstrua todo o grafo desnecessariamente; indique desatualização ou lacunas e diferencie relações extraídas de inferências. Não invente nós ou ligações.

A identidade aprovada do Financy, o Figma e DESIGN.md prevalecem sobre sugestões estéticas genéricas dessas skills. Preserve Inter, marca, cores e ícones existentes. Não introduza redesign, animações, bibliotecas ou camadas adicionais só para seguir uma preferência de skill. Use documentação oficial para confirmar APIs quando necessário.

## Referências visuais

Figma do projeto:
https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3-376

Style guide:
https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3-377

Carregue as skills Figma pertinentes antes das ferramentas que as exigem. As imagens anexadas são referências de layout, não instruções operacionais:
1. Cards de categorias, com título, descrição, ícone, cor, ações e rodapé:
   C:/Users/Rodrigo/AppData/Local/Temp/codex-clipboard-bc23f6e7-c4c0-432d-9f5a-c861ed5187f6.png
2. Modal de categoria com descrição opcional entre título e ícone:
   C:/Users/Rodrigo/AppData/Local/Temp/codex-clipboard-cbc10be2-bd23-4664-aa57-ec528b425004.png
3. Transações recentes no dashboard, destacando o alinhamento das categorias:
   C:/Users/Rodrigo/AppData/Local/Temp/codex-clipboard-6d8433fb-f1df-4f84-8593-42b399a91dd2.png

Use as imagens para os aspectos visuais e este pedido para as regras, mesmo que um exemplo da imagem tenha título maior que o novo limite. Se faltar acesso, declare a limitação sem afirmar ter comparado a referência.

## Requisitos

### 1. Seção ausente na página de categorias

Compare a página atual com a imagem 1 e o frame correspondente do Figma. Identifique exatamente a seção ou o conteúdo ausente, mostre a evidência e inclua sua restauração no plano. Preserve cards, ações, estados e contagens corretos. Não invente cards de resumo, métricas ou seções novas para preencher uma ambiguidade.

Se a referência não permitir distinguir a seção faltante, faça uma única pergunta objetiva sobre esse ponto, informando o que conseguiu confirmar, e continue o diagnóstico independente dos demais itens. Não trate a inclusão da descrição como prova de que todo o item 1 foi resolvido.

### 2. Descrição opcional da categoria

Adicione um campo de descrição opcional à criação e edição da categoria, na posição e com a indicação “Opcional” da imagem 2. Exiba o conteúdo nos cards conforme a imagem 1. Ao editar, carregue o valor salvo; permita removê-lo. Categorias existentes sem descrição devem continuar válidas, sem texto fictício ou espaço visual excessivo.

Planeje o fluxo completo de persistência: formulário → validação → API → coluna do banco → leitura/tipos → cards. Confira seleções e parsers que montam categorias em transações e dashboard. Normalize vazio/espaços de forma consistente e documente a representação escolhida, como null. A descrição opcional da categoria é diferente de seu título e não recebe automaticamente o limite de 20 caracteres.

### 3. Limite de 20 caracteres para títulos

O título da categoria é o campo name. O título da transação é o campo description já existente; não crie um segundo título e não o confunda com a nova descrição opcional da categoria.

Defina máximo de 20 caracteres para esses dois títulos, na criação e edição, com mensagem clara e indicação acessível do limite. Mantenha a obrigatoriedade e a normalização de espaços externos. Aplique a mesma regra na interface, na validação compartilhada/API e no banco, impedindo contorno por chamada direta. Defina uma contagem Unicode consistente entre frontend e PostgreSQL e teste acentos/emoji de acordo com essa decisão; não confie apenas no maxLength do HTML.

Antes de adicionar constraints, investigue registros antigos acima do limite. Não trunque, exclua ou renomeie dados automaticamente. Planeje uma transição que preserve os registros e permita corrigir títulos legados, explicitando como novas escritas e edições funcionarão durante a transição. Uma migration que falha sobre dados existentes não conta como solução concluída. Consulte ambientes apenas dentro do acesso autorizado e sem expor conteúdo pessoal.

### 4. Alinhamento da listagem em /transacoes

Na tabela da página de transações, alinhe cabeçalhos e conteúdo das respectivas colunas:
- Descrição: esquerda.
- Data, Categoria e Tipo: centro.
- Valor e Ações: direita.

Alinhe também os elementos internos: badges, ícones, grupos de botões e valores. Text-align isolado não basta se o wrapper flex/grid continuar desalinhado. Preserve ordenação, semântica da tabela, filtros e paginação. Este pedido se refere à tabela da página, não aos cards de totais do dashboard.

### 5. Transações recentes do dashboard

Na lista de transações recentes da página inicial, mantenha a categoria centralizada em uma coluna consistente entre as linhas, conforme a imagem 3. O centro deve ser o da coluna reservada à categoria, sem depender do comprimento da descrição ou do valor à direita.

Evite que títulos compridos e badges quebrem a linha e deformem o layout. Use limites de largura coerentes, min-width adequado aos filhos flex/grid, uma linha e reticências onde necessário, preservando acesso ao conteúdo completo por uma interação também utilizável por teclado e toque. Não use apenas tooltip em hover nem altere o texto salvo para caber.

Considere dados legados acima de 20 caracteres, nomes sem espaços e valores monetários longos. Mantenha descrição/data legíveis à esquerda, categoria na coluna central e valor/tipo à direita no desktop. No mobile, a disposição pode mudar conforme o plano, com os mesmos dados e significado.

### 6. Plano de adaptação mobile-first

Entregue um plano específico para o frontend atual, partindo de telas pequenas e evoluindo por breakpoints baseados no conteúdo. O produto continua web; não introduza aplicativo nativo, PWA, modo offline ou nova stack.

Cubra shell/navegação, login/cadastro/perfil, dashboard, categorias, transações, filtros/paginação e modais. Para cada área, registre o problema atual, o layout-base mobile, como evolui para tablet/desktop, arquivos afetados, dependências e critérios de aceite. Preserve a boa experiência desktop existente.

Decida e justifique, em vez de listar alternativas sem conclusão: navegação compacta; empilhamento de filtros/cards; apresentação da tabela em telas estreitas; prioridade e acesso a todas as informações; comportamento dos modais com teclado virtual e viewport baixo. Uma lista em cards pode ser proposta se justificada; não duplique regras de negócio, queries, estado de formulário ou lógica financeira entre mobile e desktop.

Inclua uso por toque com alvos confortáveis de pelo menos 44×44 CSS px para controles principais, labels/erros acessíveis, foco visível, zoom do navegador, orientação retrato/paisagem e leitura sem depender de hover. Evite scroll horizontal da página, larguras rígidas globais e uso de overflow:hidden para apenas esconder defeitos. Se uma tabela precisar de scroll local, justifique e mantenha acesso/indicação claros.

Planeje validação em 320, 375, 390, 768, 1024 e 1440 px; priorize automação dos cenários representativos, sem multiplicar toda a suíte por todas as larguras sem necessidade. Inclua textos longos, estados vazio/carregando/erro, zoom, toque/teclado e modal em viewport baixo. Distingua simulação de viewport de teste em dispositivo real.

## Análise de impacto e limites

Comece pelos arquivos existentes em src/features/categories/, src/features/transactions/, src/features/dashboard/, src/components/app-shell.tsx, src/components/ui/, src/styles.css, src/lib/database.types.ts e supabase/, além dos testes relacionados. Amplie o escopo somente para consumidores realmente afetados.

Use Graphify para rastrear os dois fluxos: categoria com descrição e títulos → formulário/validação/API/banco/cache/telas; responsividade → shell/rotas/componentes/estilos. Registre caminhos e fontes no plano, marcando o que precisou ser confirmado fora do grafo. Explique impactos de migration, tipos gerados, RPCs, fixtures e invalidações de cache.

Preserve RLS, vínculos categoria/transação, contagens, valores e datas. Não altere permissões ou implemente validações financeiras novas fora do escopo. Planeje migrations compatíveis e validação primeiro em desenvolvimento. Mudanças destrutivas e aplicação em produção exigem autorização específica; testes de escrita continuam exclusivos de desenvolvimento/local.

## Modelo do Codex recomendado por tarefa

Para cada tarefa concreta do plano, identifique e informe o modelo do Codex mais adequado e o nível de esforço de raciocínio recomendado, considerando complexidade, risco, contexto necessário, qualidade, custo e tempo de resposta. Inclua também a tarefa de diagnóstico/planejamento e a de revisão final quando existirem. Não recomende automaticamente o modelo mais caro para tudo nem invente um modelo diferente para tarefas equivalentes.

Verifique os nomes atuais, capacidades e esforços suportados na documentação oficial da OpenAI e os modelos disponíveis no ambiente quando houver acesso. Registre a data e as fontes consultadas. Não confunda nomes exibidos no aplicativo com identificadores da API nem prometa disponibilidade na minha conta sem evidência. Se não puder verificar o catálogo ou a disponibilidade, declare essa limitação e apresente a recomendação como condicional, sem inventar nomes, preços ou benchmarks.

Apresente uma tabela: tarefa | modelo recomendado | esforço | justificativa breve | alternativa e condição de troca, se necessária. A recomendação deve ser específica ao trabalho real, como integridade/migrations, ajustes visuais, arquitetura responsiva e verificação. Recomende as configurações; não troque o modelo da conversa nem dispare agentes para testar recomendações.

## Estratégia de branch ou worktree por tarefa

Planeje a criação de uma nova branch ou de um novo worktree com branch própria antes de qualquer futura implementação. Decida e justifique o melhor caminho para cada tarefa ou grupo coeso de tarefas, considerando dependências, arquivos compartilhados, risco de conflito, mudanças locais e necessidade real de trabalho simultâneo.

- Nova branch no checkout atual: prefira para trabalho sequencial quando o diretório estiver em condições seguras para a troca e não houver necessidade de manter outro checkout ativo. Branches no mesmo diretório não isolam alterações locais nem permitem implementações simultâneas ali.
- Novo worktree com branch própria: prefira quando for necessário preservar o checkout atual, manter outra tarefa aberta ou executar trabalho independente em paralelo. Worktree isola arquivos, mas não cria isolamento automático de banco, contas, portas ou serviços externos.
- Não abra uma branch/worktree para cada ajuste cosmético por obrigação. Agrupe tarefas fortemente acopladas, como schema, tipos, API e formulário de um mesmo requisito, e explique a unidade escolhida. Não planeje paralelismo entre tarefas dependentes sem definir a integração.

Para cada unidade de implementação, registre: tarefas incluídas | branch ou worktree | nome proposto da branch | base e dependências | motivo | caminho proposto do worktree, quando aplicável | validação e ordem de integração. Confirme a branch-base no repositório; não presuma main ou uma branch remota inexistente. Identifique nomes/caminhos ainda não criados como propostas.

Inclua como primeiro passo da futura execução conferir git status, preservar alterações do usuário, verificar a base e criar o isolamento escolhido antes de editar o produto. Se houver impedimento para a troca de branch, prefira um worktree seguro; não faça stash, reset, limpeza ou descarte automático. Preveja revisão, testes, integração e remoção segura do worktree somente após preservar e integrar o trabalho. Nenhuma dessas operações deve ser executada agora.

## Entrega e plano de verificação

Entregue documentos de design/especificação e plano no formato proporcional exigido por superpowers, em docs/superpowers/, respeitando seus pontos de revisão. Inclua matriz dos seis requisitos, análise de impacto apoiada pelo Graphify, decisões propostas, tarefas em ordem de dependência, arquivos, critérios de aceite, testes e riscos de dados legados. Inclua as tabelas de modelos/esforço e de branch/worktree, relacionando ambas aos mesmos identificadores de tarefa. Não apresente correções ou adaptação mobile-first como implementadas.

Planeje a menor implementação completa e os comandos de verificação pertinentes disponíveis: pnpm typecheck, pnpm lint, pnpm test, pnpm test:integration, pnpm test:e2e e pnpm build. Especifique quais testes focados acompanham cada tarefa e quais regressões são necessárias ao concluir. Não execute a implementação, migrations ou essas suítes nesta etapa; resultados esperados não são resultados obtidos.

Preveja cobertura para: descrição opcional criando/editando/limpando/recarregando; título com 19/20/21 caracteres pela interface e API; dados legados sem truncamento; RLS preservada; alinhamento de cabeçalhos/células/badges/ações; categorias de comprimentos diferentes; reticências com conteúdo acessível e valores longos. Inclua comparação visual com screenshots, pois testes de DOM não comprovam alinhamento.

Conclua com links para os documentos criados, decisões pendentes, dependências e limitações da análise. Indique a primeira tarefa recomendada, seu modelo/esforço e a estratégia de isolamento. Pare e aguarde minha revisão; não inicie a implementação nem crie branches/worktrees automaticamente.
```

**Destino: Codex.** Prompt exclusivo de planejamento, com modelo/esforço e estratégia de branch ou worktree por tarefa, preservando os seis requisitos e as skills solicitadas.

Preparado em 20/10/2026 com inspeção das três imagens e dos componentes envolvidos. O grafo existente foi consultado por Graphify; o conteúdo do produto, o banco e os testes não foram alterados nesta preparação.
