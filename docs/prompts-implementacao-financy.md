# Financy — estado atual e prompts de implementação

Análise de 15/10/2026. Destino dos prompts: **Codex**. Base inspecionada: commit `5c27730`, branch `feat/financy-v1`. Este documento orienta as próximas entregas; sua criação não executa a implementação.

## 1. Estado verificado

O projeto concluiu a entrega de base e acesso. O próximo trabalho funcional é preparar o catálogo visual e implementar integridade e autorização dos dados financeiros, antes das páginas de gestão.

| Área | Evidência no repositório | Situação |
| --- | --- | --- |
| Base | `package.json`, lockfile, `src/main.tsx`, configurações Vite/TypeScript | Implementada; React 19, Vite 8, TypeScript 6, pnpm 12.4.2 |
| Acesso e perfil | `src/features/auth/`, proteção em `src/router.tsx` | Cadastro, login, restauração de sessão, edição do nome e logout implementados |
| Isolamento do cache | `src/lib/session-cache.ts`, teste e `auth-provider.tsx` | Cancelamento e limpeza na troca de identidade; teste unitário passou novamente |
| Visual da base | `DESIGN.md`, `src/styles.css`, `AppShell`, `Logo`, `Button`, `Input` | Referências de acesso já registradas; catálogo financeiro ainda ausente |
| Categorias, transações e dashboard | `FeaturePending` em `src/router.tsx` | Somente rotas reservadas; não são funcionalidades concluídas |
| Banco financeiro | Ausência de `supabase/`, migrations e tipos gerados | Não implementado no repositório; estado remoto não consultado nesta análise |
| Testes financeiros | Ausência de `tests/integration/` e testes E2E financeiros | Pendentes |
| Publicação | Sem `vercel.json`; `docs/operations.md` registra hospedagem pendente | Não há evidência local de publicação; GitHub/Vercel não reconsultados |

### Verificações executadas nesta análise

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck` | Passou |
| `pnpm lint` | Passou |
| `pnpm test` | 1 teste passou |
| `pnpm exec playwright test tests/e2e/access.spec.ts` | 5 testes passaram: navegação, rota privada, falha de rede, teclado e largura de 1024/1440 px |
| `pnpm build` | Passou; chunk principal de 572,40 kB, 169,09 kB gzip; aviso acima de 500 kB |

O registro `docs/superpowers/execution/2026-10-15-financy-base.md` relata 7 E2E aprovados na entrega anterior, incluindo autenticação real. Nesta análise foram repetidos apenas os 5 de acesso, sem os testes que criam contas. Não confundir evidência histórica com nova verificação. O aviso do build merece medição na revisão final, mas não justifica uma refatoração antecipada.

### A stack vigente substitui o contexto inicial

A especificação aprovada usa **Supabase Auth + PostgreSQL + Data API + RLS**, com TanStack Query para dados remotos e estado local do React para interações. **SQLite, Prisma, GraphQL, Apollo Client, JWT/bcrypt próprios e Zustand não fazem parte desta versão.** Não reinstalar essas ferramentas a partir do primeiro prompt da conversa.

TanStack Router, Query e Form já estão instalados. TanStack Table entra quando a listagem de transações precisar dele. Vitest, Playwright, Radix, CVA, tailwind-merge, Lucide e Inter local já estão disponíveis.

### Pontos de atenção para os próximos passos

1. `DESIGN.md` registra principalmente acesso e base visual. As cores/ícones permitidos nas categorias precisam ser extraídos do Figma antes das constraints SQL.
2. RLS e privilégios da Data API são camadas distintas. A etapa do banco deve verificar ambas e conceder somente os privilégios necessários a `authenticated`, sem abrir dados financeiros para `anon`. A mudança de privilégios padrão foi confirmada na [documentação oficial do Supabase](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).
3. O isolamento deve existir no banco, inclusive no vínculo entre transação e categoria. Proteger rotas no React não comprova autorização da API.
4. Dinheiro deve permanecer decimal exato, inclusive acima do limite de inteiros seguros do JavaScript. O transporte como texto precisa ser verificado com a versão real da Data API/SDK, não presumido pela tipagem.
5. Os arquivos e assinaturas sugeridos pelo plano não existem todos. Reutilizar a estrutura real e criar apenas o que a etapa consome; não recriar arquivos já presentes nem scaffolding da entrega 1.
6. A especificação contém propostas técnicas na seção 8. O plano e o registro de execução detalham sua adoção. Se houver contradição material entre esses documentos e uma instrução posterior do usuário, explicitar a diferença antes de mudar a regra.

## 2. Como usar

Execute **um prompt por vez**, na ordem. O prompt 0 é útil ao abrir outro chat ou retomar depois de mudanças. O próximo passo funcional, no estado analisado, é o prompt 1. Cada prompt referencia este arquivo e os documentos do projeto para funcionar também em outro chat com acesso ao repositório.

Os prompts dividem as entregas 2–6 do plano existente em partes menores; não substituem a especificação aprovada. Só avance depois de verificar a etapa anterior. Se algum pré-requisito depender de acesso indisponível, conclua o trabalho independente e identifique o bloqueio sem declarar a etapa concluída.

São prompts para um agente com acesso real ao sistema. Confira o escopo e os ambientes antes de colar; nenhum prompt autoriza apagar dados reais, contratar serviços ou expor credenciais.

### Contrato comum de execução

Todos os prompts abaixo incorporam este contrato:

- Leia as instruções aplicáveis do repositório, `docs/superpowers/specs/2026-10-14-financy-v1.md`, a tarefa correspondente em `docs/superpowers/plans/2026-10-14-financy-v1.md`, `docs/operations.md` e os registros recentes de execução. Respeite as decisões atuais, preservando mudanças locais do usuário.
- Antes de editar, confira o estado Git e os arquivos realmente existentes. Identifique os consumidores, testes e configurações afetados. Implemente somente a etapa solicitada, reaproveitando os componentes e helpers existentes; não faça refatorações alheias.
- Consulte documentação oficial pertinente às versões utilizadas quando uma API ou comportamento precisar ser confirmado. Preserve versões instaladas e lockfile; adicione dependências somente quando necessárias à etapa. Não atualize a stack em bloco.
- Código e nomes de arquivos em inglês; interface, documentação e comunicação em português. Prioridade desktop a partir de 1024 px. Figma e regras aprovadas prevalecem sobre preferências genéricas de design.
- Supabase de desenvolvimento: `gorymmpnavtudztnasny`; produção: `bqkmhzrrfurphiikylpa`, conforme `docs/operations.md`. Confirme os alvos antes de escrever. Testes e fixtures só em desenvolvimento ou ambiente local descartável. Não imprima valores de variáveis, senhas, tokens ou sessões.
- Use chave publicável e sessões reais nos testes de RLS. Credenciais administrativas não podem mascarar testes de autorização nem entrar no frontend. Fixtures devem identificar os registros criados pela execução e limpar somente esses registros.
- Etapas 1–7 não autorizam publicação ou mudanças em produção. Mudanças destrutivas exigem identificar dados afetados e autorização específica. Não recrie projetos, faça reset remoto ou contrate planos. Não faça commit, push ou publique um repositório sem instrução correspondente.
- Novas regras financeiras, autorização e correções de bugs devem ter testes de comportamento que demonstrem o risco. Execute a verificação pertinente, corrigindo falhas causadas pela etapa. Falha de ambiente não conta como teste da regra; um teste pulado não conta como aprovado.
- Separe implementado, testado localmente, validado em desenvolvimento e publicado. Atualize o registro de execução com mudanças, comandos, resultados e pendências, sem segredos. Ao terminar, informe o resultado e o próximo prompt adequado, sem iniciá-lo automaticamente.

### Regras compartilhadas do domínio

- Cada usuário começa sem categorias; exatamente uma categoria é obrigatória em cada transação. Categorias servem tanto para receitas quanto para despesas.
- Dinheiro positivo na escrita, até duas casas decimais, BRL; o tipo define receita/despesa. No transporte, decimal textual canônico com ponto e duas casas; cálculos financeiros no PostgreSQL. Sem arredondamento silencioso ou cálculos via `Number`/`parseFloat`.
- Data financeira `YYYY-MM-DD`, hoje ou passado. Referência de hoje: `America/Sao_Paulo`; exibição da data sem conversão de fuso.
- Nome de categoria único por usuário, desconsiderando caixa e espaços externos. Categoria utilizada não pode ser excluída; renomear preserva os vínculos e atualiza sua apresentação histórica.
- Cache: `['finance', userId, 'categories']`, `['finance', userId, 'transactions', filters]`, `['finance', userId, 'dashboard', month]`. Mutation bem-sucedida invalida `['finance', userId]`; sem atualização otimista nesta versão. Queries só executam com sessão válida; preserve cancelamento e limpeza na troca de conta.
- Dashboard: saldo acumulado de todo o histórico; receitas, despesas, cinco maiores categorias de despesa e cinco transações recentes do mês selecionado.
- Listagem: busca por descrição, filtros de tipo/categoria/mês combináveis, dez registros por página, ordenação `occurred_on desc, created_at desc, id desc`. URL é a fonte de filtros/página; entrada direta usa todos os meses; mudar ou limpar filtros volta à página 1.

## 3. Sequência e entregáveis

| Prompt | Escopo | Relação com o plano | Conclusão verificável |
| --- | --- | --- | --- |
| 0 | Retomar contexto | Antes de executar | Estado e próxima etapa confirmados |
| 1 | Referências financeiras e catálogo | Pré-requisito da tarefa 2 | Catálogo rastreável ao Figma |
| 2 | Banco, RLS e contratos da API | Tarefa 2 | Integridade e isolamento demonstrados via API |
| 3 | Categorias | Tarefa 3 | CRUD e contagens corretos |
| 4 | Dinheiro, datas e URL | Primeira parte da tarefa 4 | Casos de borda aprovados |
| 5 | Transações | Restante da tarefa 4 | CRUD, filtros e paginação reais |
| 6 | Dashboard | Tarefa 5 | Agregações completas e isoladas |
| 7 | Revisão integrada | Primeira parte da tarefa 6 | Fluxo completo verificado em desenvolvimento |
| 8 | Preparação e publicação | Restante da tarefa 6 | Release preparada e publicação condicionada ao alvo/autorização |

## Prompt 0 — Retomar sem repetir a base

```text
Analise o estado atual do Financy e indique a próxima etapa executável. Esta etapa é somente de leitura; não implemente nem altere ambientes.

Leia docs/prompts-implementacao-financy.md, incluindo o contrato comum, e confronte a especificação, o plano, os registros de execução e o código atual. A fotografia registrada nesse guia é de 15/10/2026, commit 5c27730; não presuma que continua atual.

Confira estado Git, scripts, funcionalidades existentes, migrations e verificações registradas. Distinga código implementado de placeholders e de exemplos do plano. Use as ferramentas conectadas apenas em leitura quando necessário para esclarecer o estado remoto; não crie contas ou dados para este diagnóstico.

Preserve a arquitetura aprovada: React/Vite/TypeScript, TanStack e Supabase. Não recupere a stack inicial com Prisma/SQLite/GraphQL/Apollo/bcrypt próprios.

Responda com: o que está pronto e sua evidência; pendências e dependências; divergências materiais; número do próximo prompt recomendado. Declare o que não conseguiu verificar. Não repita decisões já aprovadas como perguntas nem inicie implementação automaticamente.
```

**Destino: Codex.** Objetivo: retomar com evidências e evitar reconstruir funcionalidades existentes.

## Prompt 1 — Fechar referências visuais e catálogo financeiro

```text
Prepare as referências necessárias às categorias, transações e dashboard do Financy. Aplique o contrato comum de docs/prompts-implementacao-financy.md. Ainda não implemente essas telas nem altere o banco.

Leia DESIGN.md, src/styles.css, os componentes existentes e as regras CAT/TX/DASH/LIST da especificação. Consulte o Figma com as ferramentas e skills adequadas:
- Design: https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3-376
- Style guide: https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3-377

Localize os frames específicos e registre seus IDs. Extraia o catálogo finito de cores e ícones de categorias, além das medidas e estados relevantes de cartões, formulários, modais, filtros, tabela e resumo. Separe observação do Figma de comportamento definido pela especificação. Se algum detalhe estiver ausente ou inacessível, registre a lacuna sem inventar valores ou afirmar fidelidade.

Atualize DESIGN.md com fontes verificáveis, chaves estáveis do catálogo e sua correspondência visual. Garanta que esse catálogo possa ser reutilizado nas constraints SQL e na interface sem permitir strings arbitrárias. Mantenha a documentação como fonte nesta etapa; crie o módulo frontend quando houver consumidor real.

Considere 1024/1440 px, foco visível, teclado, labels e estados vazio/carregando/erro. Reutilize a identidade existente e respeite adaptações funcionais já aprovadas, como sessão persistente sem checkbox lembrar-me.

Conclua quando o catálogo necessário ao banco estiver definido e rastreável. Informe lacunas que bloqueiem constraints, os arquivos alterados e a prontidão para o prompt 2. Não peça aprovação de escolhas já explícitas no Figma e no escopo.
```

**Destino: Codex.** Objetivo: resolver a dependência visual do schema antes de gravar constraints.

## Prompt 2 — Banco financeiro, integridade e isolamento

```text
Implemente a tarefa 2 do plano do Financy, seguindo o contrato comum de docs/prompts-implementacao-financy.md. Pré-requisito: catálogo verificado em DESIGN.md. Trabalhe em desenvolvimento; produção está fora desta etapa.

Inspecione o estado real do Supabase de desenvolvimento e o histórico local de migrations antes de escrever. Não conclua que o banco está vazio só porque a pasta supabase ainda não existe. Confira CLI/documentação atual, grants da Data API e RLS. Se não houver acesso, prepare os arquivos e testes locais possíveis e registre a validação remota pendente.

Crie migrations versionadas com nomes gerados pelo CLI e o schema mínimo categories/transactions descrito no plano. Garanta dono obrigatório, FK composta (user_id, category_id), exclusão restrita de categoria utilizada, unicidade por usuário de lower(btrim(name)), conteúdo não vazio, tipos válidos e cores/ícones do catálogo. IDs/criação devem ser gerados pelo banco e protegidos contra alteração, assim como o dono.

Valide também no banco valores positivos e finitos com até duas casas, sem typmod que arredonde antes da validação; datas futuras devem ser recusadas pela referência America/Sao_Paulo. Não imponha um teto monetário novo sem justificar o impacto no escopo.

Habilite RLS e configure somente os privilégios necessários. SELECT/INSERT/UPDATE/DELETE devem respeitar auth.uid(); updates precisam verificar a linha existente e a resultante. Não use user_metadata para autorização. Se houver função/view, preserve RLS e controle permissões de execução e search_path.

Crie fixtures e configuração de integração separadas dos unitários, com trava pelo project-ref de desenvolvimento e clientes de Alice, Bob e anônimo. Use chave publicável e sessões reais, sem service_role nas operações testadas. Demonstre: A não lê/altera/apaga B; não pode inserir/reassociar dono; não vincula categoria de B; categoria inexistente/utilizada e dinheiro/data inválidos são recusados. Para mutations negadas, confira que a linha original permanece intacta, mesmo se a API retornar sucesso com zero linhas.

Gere os tipos Database, conecte-os ao cliente existente e verifique o caminho real de escrita/leitura decimal textual, inclusive 9007199254740993.01. Não esconda incompatibilidades com casts TypeScript. Crie somente contratos já necessários e atualize scripts/.env.example sem valores reais. Garanta que a migration reproduz o schema validado e não foi aplicada duas vezes por caminhos diferentes.

Execute integração em desenvolvimento e verificações estáticas/unitárias pertinentes. Conclua somente com evidência de RLS, integridade e transporte monetário; registre migrations, testes, limpeza das fixtures e bloqueios. Não implemente as páginas financeiras.
```

**Destino: Codex.** Objetivo: comprovar segurança e exatidão antes de construir os fluxos que dependem delas.

## Prompt 3 — Gestão de categorias

```text
Implemente a tarefa 3 do Financy. Aplique o contrato comum de docs/prompts-implementacao-financy.md e confirme que o schema/RLS do prompt 2 foi validado. Não implemente transações ou dashboard.

Reutilize AppShell, Button, Input, o cliente Supabase, AuthProvider e QueryClient. Crie os arquivos necessários em src/features/categories e o catálogo frontend consumido pela tela, coerente com DESIGN.md e as constraints. Substitua somente o placeholder de /categorias. Consulte os frames específicos do Figma antes de implementar a interface.

Entregue criação, edição e exclusão; cartões em ordem alfabética com nome, cor, ícone e contagem de transações de todo o histórico. Conte no banco sem baixar todo o histórico nem realizar uma consulta por cartão. Use API específica e hooks de Query; não crie camada genérica de repositórios.

Formulário com TanStack Form: trim, nome obrigatório, duplicidade tratada pelo banco, opções restritas ao catálogo e bloqueio de envio repetido. Em falha, preserve campos e mantenha o modal aberto com ação de tentar novamente. Forneça vazio orientado, carregamento, erro recuperável e confirmação de exclusão. Categoria em uso deve continuar protegida pelo banco, inclusive sob concorrência; não apagar transações em cascata.

Use chaves de cache por userId e invalide o prefixo financeiro após sucesso. A edição de categoria deve aparecer nas transações vinculadas sem copiar nome/cor/ícone para o histórico. Garanta teclado, foco inicial/devolvido, fechamento acessível e ações com nomes claros.

Teste duplicidade normalizada, isolamento, edição, exclusão sem uso e recusa com uso. Crie transações fictícias por API em desenvolvimento quando necessárias ao teste de vínculo, mesmo que sua tela ainda não exista. Verifique contagens e falha de rede, além do fluxo de navegador em 1024/1440 px. Não use mocks para afirmar que RLS funciona.

Execute testes pertinentes, typecheck, lint e build. Registre resultados e a correspondência entre catálogo de interface e banco. Não altere autenticação por preferência de arquitetura.
```

**Destino: Codex.** Objetivo: entregar o primeiro fluxo financeiro completo com regras sustentadas pelo banco.

## Prompt 4 — Dinheiro, datas e filtros na URL

```text
Implemente os utilitários e contratos da primeira parte da tarefa 4 do Financy. Aplique o contrato comum de docs/prompts-implementacao-financy.md. Não construa ainda a página completa de transações.

Confira os tipos e helpers existentes antes de criar src/lib/money.ts, src/lib/dates.ts e src/features/transactions/search.ts, com testes focados. Mantenha as interfaces propostas pelo plano quando compatíveis com o código real.

Dinheiro: parseAmountPtBr retorna decimal textual canônico ou null. Aceite 1.234,56 e 1234,56; recuse zero, negativos, agrupamento inválido, mais de duas casas e notação exponencial. Não use parseFloat/Number para transformar valores financeiros. formatBrl deve preservar centavos, sinal de saldos negativos e todos os dígitos de 9007199254740993.01. Normalize textualmente respostas como 1 e 1.2 sem arredondar. Evite biblioteca monetária se a solução pequena e testada bastar.

Datas: todayInSaoPaulo, monthBounds e formatDateBr devem tratar calendário e mês sem deslocar YYYY-MM-DD pelo fuso. Cubra ano bissexto, datas inexistentes, dezembro para janeiro e o instante 2026-10-15T01:30:00Z, cujo dia em São Paulo é 14/10/2026.

URL: normalize q, kind, categoryId, month e page com padrões seguros; página inteira positiva e finita, mês válido ou all. Defina a adaptação entre page iniciando em 1 e pageIndex iniciando em 0. Mudar/limpar filtro retorna à página 1; entrada direta usa todos os meses; link vindo do dashboard preserva seu mês.

Escreva primeiro casos que falhem pela regra ausente, implemente o mínimo e execute testes. Não adicione dependências ou schemas genéricos apenas para validar esses campos. Registre limites reais e qualquer divergência que exija decisão de produto; não imponha um teto de dinheiro arbitrário.

Conclua com testes de valores grandes, centavos, datas de borda e URL inválida aprovados, além de typecheck/lint. A integração visual e de API continua no prompt 5.
```

**Destino: Codex.** Objetivo: estabilizar os contratos de maior risco antes de integrá-los à tabela e ao formulário.

## Prompt 5 — Transações completas, filtros e paginação

```text
Conclua a tarefa 4 do Financy usando os contratos verificados no prompt 4 e as categorias do prompt 3. Aplique o contrato comum de docs/prompts-implementacao-financy.md.

Implemente src/features/transactions com operações de API, hooks de Query, formulário e página; integre /transacoes no router. Instale TanStack Table somente se ainda ausente, em versão compatível verificada e fixada. Reutilize os componentes existentes e os frames específicos do Figma.

Entregue CRUD de receitas/despesas realizadas, com descrição, tipo, valor, data e uma categoria obrigatória. Conta sem categorias recebe orientação e ação para criá-las. Não permita data futura ou valores inválidos; preserve a validação no banco. Exclusão definitiva exige confirmação com descrição e valor. Falhas preservam campos; evite envio duplicado e trate registro removido/alterado em outro contexto.

Consulta remota com busca literal por descrição, filtros combináveis de tipo/categoria/mês, contagem total filtrada e dez linhas por página. Escape curingas na busca; não concatene SQL com entrada do usuário. Ordene por occurred_on, created_at e id decrescentes. Use dinheiro textual na leitura e escrita e a relação atual de categoria. Verifique precisão real no retorno da API.

Use search params validados pelo TanStack Router como fonte dos filtros e paginação. Recarregar, compartilhar URL e voltar/avançar deve restaurar a consulta. TanStack Table terá paginação manual e contagem remota, sem paginar novamente os dez registros. Ajuste explicitamente a página após mudança de filtros ou exclusão do último item da última página.

Separe cache por userId e filtros; invalide o prefixo financeiro após mutation. Encaminhe AbortSignal onde suportado e preserve proteção contra respostas atrasadas/troca de conta. Não apresente resultados de filtro anterior como se pertencessem ao novo filtro.

Teste com mais de dez registros: limites de mês, empate de datas, filtros combinados, caracteres de busca, última página, recarga/voltar/avançar, renomeação de categoria, falha de rede e troca de conta. Verifique que uma mudança atualiza contagens de categorias. E2E usa apenas desenvolvimento e limpa seus próprios dados.

Execute testes unitários, integração, E2E pertinentes, typecheck, lint e build. Faça inspeção em 1024/1440 px e teclado. Documente o que ficou verificado; não antecipe o dashboard.
```

**Destino: Codex.** Objetivo: conectar regras exatas a uma listagem remota previsível e compartilhável por URL.

## Prompt 6 — Dashboard com agregações corretas

```text
Implemente a tarefa 5 do Financy após validar categorias e transações. Aplique o contrato comum de docs/prompts-implementacao-financy.md. Banco e testes de escrita continuam exclusivos de desenvolvimento.

Crie a migration da RPC get_dashboard conforme os contratos reais do projeto, atualize os tipos gerados e implemente src/features/dashboard/{api,queries}.ts e a página. Substitua o placeholder de /. Reutilize os utilitários monetários/de datas, cache e componentes; consulte o Figma específico do dashboard.

Calcule no PostgreSQL: saldo de todo o histórico; receitas/despesas do mês selecionado; cinco categorias com maior soma de despesas do mês; cinco transações recentes do mês. Inicie no mês atual e identifique claramente cada período. Ranking não inclui receitas. Link para ver todas leva à listagem com o mesmo mês.

Valide o argumento como primeiro dia do mês e exija usuário autenticado. Prefira SECURITY INVOKER, objetos qualificados e search_path controlado; revogue execução pública/anônima e conceda somente o necessário. Confirme RLS nas tabelas usadas. Valores e agregados devem sair como texto decimal exato, com 0.00 no vazio; desempates devem ser determinísticos.

Não baixe transações para somar no navegador e não limite totais à página visível ou ao teto padrão de retorno da API. Execute teste com mais de 1.000 registros fictícios autorizados: saldo, somas e contagens precisam considerar todo o conjunto. Teste também histórico fora do mês, mês vazio, centavos, saldos negativos, outra conta e acesso anônimo.

Garanta invalidação após criar/editar/excluir transações e editar categorias. Mudar de mês rapidamente não pode misturar respostas; estados de carregamento/vazio/erro devem ser claros. Confira o ranking, os recentes e o link filtrado em E2E, com teclado e larguras 1024/1440 px.

Conclua com testes financeiros/RLS, typecheck, lint e build aprovados. Registre migrations, limpeza dos dados de teste, evidências visuais e limites encontrados. Não publique nesta etapa.
```

**Destino: Codex.** Objetivo: validar o resumo contra todo o conjunto de dados, preservando RLS e precisão.

## Prompt 7 — Verificar o produto integrado e corrigir falhas

```text
Faça a revisão integrada do Financy e corrija falhas reproduzidas dentro do escopo aprovado. Aplique o contrato comum de docs/prompts-implementacao-financy.md. Esta etapa encerra a validação em desenvolvimento e não autoriza publicação.

Leia os registros das etapas anteriores e monte uma matriz curta ligando AUTH/CAT/TX/DASH/LIST aos testes e evidências existentes. Não repita testes sem motivo nem crie cobertura que apenas espelhe a implementação. Adicione testes somente para lacunas relevantes ou bugs encontrados.

Verifique o percurso completo: conta vazia → categoria → receita/despesa → filtros/paginação → dashboard → edição → exclusão → logout → outra conta. Teste API/RLS diretamente com duas contas e anônimo. Inclua troca de conta com consultas pendentes, categoria em uso, contagens após mutations, valores grandes/centavos, virada de mês e resumo com mais de 1.000 registros.

Execute unitários, integração em desenvolvimento, E2E, typecheck, lint e build. Garanta que as travas de ambiente dos testes impedem apontar para produção e que o Playwright não reutiliza um servidor desconhecido. Não afrouxe essas travas para obter um resultado verde.

Compare páginas e estados relevantes com os frames do Figma em 1024/1440 px. Verifique navegação por teclado, foco e retorno dos modais, labels, nomes acessíveis, erros recuperáveis e ausência de overflow. Não faça redesign nem acrescente mobile nesta revisão.

Meça o carregamento/bundle se o aviso de chunk persistir. Faça otimização apenas quando a medição indicar benefício e preserve comportamento; não esconda o aviso elevando seu limite para chamar isso de correção. Confira paginação/agregação remota e consultas sem N+1.

Revise o diff e os consumidores dos arquivos corrigidos. Para cada falha, registre reprodução, impacto, correção e teste. Ao final, informe bloqueadores reais para publicação, riscos conhecidos e o que não foi verificado. Atualize a documentação sem marcar produto publicado. Se tudo necessário passar, indique o prompt 8.
```

**Destino: Codex.** Objetivo: transformar entregas isoladas em evidência do fluxo completo, sem expansão de escopo.

## Prompt 8 — Preparar a release e publicar com os alvos confirmados

```text
Prepare a publicação do Financy conforme a tarefa 6 do plano. Aplique o contrato comum de docs/prompts-implementacao-financy.md e confirme as evidências do prompt 7. Primeiro deixe a release concreta e revisável; só execute publicação/mudanças em produção quando houver autorização explícita aplicável na conversa.

Confira repositório/remoto/branch, conta e projeto Vercel, Supabase de desenvolvimento e produção e histórico de migrations. Não presuma que recursos ainda não existem nem crie duplicatas. Reutilize alvos confirmados. Sem upgrades, domínio pago ou recursos extras.

Prepare README, .env.example e docs/operations.md com setup reproduzível, comandos reais, ambientes, limitações de autenticação e operação. Configure apenas o necessário para Vite/dist e fallback das rotas SPA. Preview usa desenvolvimento; Production usa produção. O bundle recebe somente URL e chave publicável correspondentes; segredos administrativos nunca usam VITE_. Confira redirects exatos do Auth para cada ambiente.

Revise arquivos rastreados, artefatos e histórico que seriam publicados para detectar segredos, sessões, backups ou dados pessoais, sem imprimir seus valores. Confirme build e validações pertinentes para a revisão final. Não configure CI complexo ou novo serviço apenas por conveniência.

Prepare uma lista concreta da release: revisão Git, destino GitHub e sua visibilidade pública, destino Vercel, migrations pendentes e ambiente de cada variável. Compare schema remoto antes de aplicar. Para mudança com risco de perda de dados, prepare recuperação/exportação e peça autorização específica antes da operação; nunca faça reset de produção.

Se publicação/produção não estiverem explicitamente autorizadas, conclua todos os preparativos independentes e peça uma única confirmação dessa lista concreta. Não peça novamente por uma ação já autorizada e cujo escopo permaneça igual. Se faltar apenas identidade/acesso de um alvo, pergunte somente o dado necessário.

Com autorização e alvos confirmados: aplique migrations versionadas já verificadas em desenvolvimento, publique a revisão conferida e faça smoke test não destrutivo da URL e acesso direto às rotas SPA. Não rode fixtures nem suítes que criam usuários/dados em produção. Não afirme que testou CRUD em produção se validou isso apenas em desenvolvimento.

Documente URL, revisão/deployment, migrations aplicadas, smoke test e procedimento de rollback do frontend. Diferencie rollback do frontend de recuperação de banco; não prometa reversão automática de dados. Se uma fase falhar, registre o estado parcial real e o próximo passo. Não marque publicado antes de confirmar o deployment.
```

**Destino: Codex.** Objetivo: separar preparação verificável, autorização aplicável e execução da publicação.

## 4. Referências e limites da análise

- As regras de produto e contratos vêm da [especificação aprovada](superpowers/specs/2026-10-14-financy-v1.md), do [plano existente](superpowers/plans/2026-10-14-financy-v1.md), do [registro da base](superpowers/execution/2026-10-15-financy-base.md) e de [operação](operations.md).
- Políticas devem proteger linhas existentes/resultantes, e views precisam preservar o isolamento: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- Funções exigem revisão de privilégios de execução e contexto de segurança: [Supabase Database Functions](https://supabase.com/docs/guides/database/functions).
- Com paginação manual, a tabela recebe dados já paginados e a aplicação precisa tratar os resets de página: [TanStack Table — Pagination](https://tanstack.com/table/v8/docs/guide/pagination).
- O detalhe de cast/serialização decimal da Data API continua como critério de integração: a consulta à referência PostgREST retornou HTTP 429 nesta análise. Não foi feita uma afirmação nova de compatibilidade baseada nessa página.

Não foram revalidados o Figma ao vivo, configurações remotas do Supabase, autenticação real, GitHub ou Vercel. Foram preservados os dados do aplicativo; nenhuma migration, alteração de produção, instalação de dependência ou publicação foi executada. O risco prioritário antes de disponibilizar dados financeiros continua sendo comprovar RLS, vínculo entre donos e exatidão monetária pela API real.
