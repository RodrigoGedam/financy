# Financy — referência visual

Fonte: Figma `rm4MepATAsOLyoYVuAT8YH`, design `3:376`, style guide `3:377`.

Interface financeira clara, discreta, com navegação superior e verde como destaque. Prioridade desktop a partir de 1024 px.

- Fonte: Inter variável, servida localmente por @fontsource-variable/inter.
- Marca: #1F6F43; hover #124B2B. Fundo #F8F9FA; superfícies #FFFFFF.
- Texto principal #111827; secundário #4B5563; labels #374151; bordas #E5E7EB e inputs #D1D5DB.
- Acesso: logo 134 × 32, margem superior 48, intervalo 32, cartão 448 px com padding 32, borda 1, raio 12.
- Formulários: labels 14/20, inputs e botões 48 px, raio 8; intervalos de campos 16 e grupos 24/32.
- Shell: barra superior de 69 px, margens laterais 48 px; cartões brancos, borda sutil.
- Ícones Lucide. Logo oficial baixado do asset fornecido pelo Figma.
- Foco visível, labels associados, erros com role alert e ações pendentes desabilitadas.
- A identidade explícita do Figma prevalece sobre preferências genéricas de outras skills.
- Recuperação de senha e checkbox “lembrar-me” do mockup ficam fora da UI conforme escopo: sessão persistente padrão.

## Categorias implementadas — 16/10/2026

O consumidor real `src/config/category-options.ts` mapeia as sete cores (base/dark/light) e os 16 ícones abaixo para labels e componentes Lucide explícitos. Tipos `CategoryColor`/`CategoryIcon` são uniões das chaves; API valida as chaves recebidas sem fallback arbitrário. O teste `category-options.test.ts` compara os conjuntos do frontend com este documento e a migration `20261015182208_financy_core.sql`. Alterações de catálogo exigem atualização coordenada dessas fontes.

Antes de implementar `/categorias`, foram consultados novamente contexto detalhado e screenshots da página `3104:2028` e modal `3107:4607`. Adaptação ao escopo: sem descrição, sem resumos ilustrativos; cartões com padding 24, borda 1, raio 12 e intervalo 16; quatro colunas a 1440 e três a 1024 px. O modal mantém largura 448, padding 24, ícones em duas linhas de oito e sete cores em linha; altura segue os campos aprovados. Nome é a label funcional do “Título” do Figma. Não há alegação de igualdade pixel a pixel.

Criação/edição usam TanStack Form; Dialog/AlertDialog da dependência Radix já instalada fazem o controle de foco. Cores e ícones usam radios nativos, com foco visível e seleção indicada além da cor. Vazio, carregamento, erros de rede, duplicidade e exclusão com uso têm mensagens e ações próprias. Capturas locais ignoradas em `test-results/categories-{1024,1440}.png` e `category-dialog-{1024,1440}.png` foram inspecionadas. Auth e sessão persistente permanecem como aprovadas.

## Referências financeiras — extração de 15/10/2026

Base local da extração: commit `5c27730`, branch `feat/financy-v1`. Este documento é a fonte verificável do catálogo. Na extração ainda não havia módulo frontend nem migration; a seção de implementação abaixo registra os consumidores adicionados depois. Regras de comportamento: [especificação CAT/TX/DASH/LIST](docs/superpowers/specs/2026-10-14-financy-v1.md), [plano](docs/superpowers/plans/2026-10-14-financy-v1.md) e [contrato comum](docs/prompts-implementacao-financy.md).

### Fontes e qualidade da evidência

Arquivo Figma: `rm4MepATAsOLyoYVuAT8YH`. Os links abaixo abrem os nodes consultados. As páginas `3:376` e `3:377` são contêineres; consultar seus frames internos para obter contexto visual.

| Referência | Node e fonte | Evidência obtida nesta etapa |
| --- | --- | --- |
| Página do projeto | [3:376](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3-376) | Hierarquia completa via metadata |
| Style guide | [3:377](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3-377) | Hierarquia, estilos de pintura e propriedades de componentes |
| Dashboard | [3103:1987](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3103-1987) | Metadata e geometria pela Plugin API |
| Categorias | [3104:2028](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3104-2028) | Metadata e geometria pela Plugin API |
| Transações | [3104:362](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3104-362) | Metadata e geometria pela Plugin API |
| Cena com nova transação | [3107:3626](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3107-3626) | Metadata; overlay `3107:4293` |
| Modal de transação | [3107:4295](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3107-4295) | Contexto detalhado, screenshot inspecionada e propriedades |
| Cena com nova categoria | [3107:3745](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3107-3745) | Metadata; overlay `3107:4606` |
| Modal de categoria | [3107:4607](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3107-4607) | Contexto detalhado, screenshot inspecionada e propriedades |
| Paleta | [1085:712](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=1085-712) | Metadata e estilos locais com RGB convertido a hexadecimal |
| Biblioteca de ícones | [1085:795](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=1085-795) | Componentes e correspondência das instâncias do seletor |
| Variantes de inputs | [3105:3190](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3105-3190) | Metadata e propriedades de seis variantes |
| Variantes de tags | [3104:299](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3104-299) | Fundos, textos, dimensões e variantes |

As chamadas usam `get_metadata`, `get_design_context` e `use_figma` somente para leitura. As capturas completas das três páginas não foram obtidas: o conector retornou limite de chamadas do plano Starter. Nenhuma assinatura foi alterada. Geometria de páginas abaixo é leitura estrutural, não comparação visual por screenshot. Não há alegação de fidelidade final das futuras telas.

### Catálogo fechado de cores

Fonte de seleção: [grupo Cor, 3107:4733](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3107-4733). São **sete opções**, na ordem visual abaixo. Chaves em inglês e minúsculas são o contrato de persistência; labels são apresentação em português. Os tokens Figma seguem `<Color>/<color>-base`, `-dark`, `-light`.

| Chave `color` | Label | Base / amostra | Dark / texto da tag | Light / fundo da tag | Node da amostra | Componente da tag |
| --- | --- | --- | --- | --- | --- | --- |
| `green` | Verde | `#16A34A` | `#15803D` | `#E0FAE9` | `3107:4758` | `3104:295` |
| `blue` | Azul | `#2563EB` | `#1D4ED8` | `#DBEAFE` | `3107:4759` | `3104:297` |
| `purple` | Roxo | `#9333EA` | `#7E22CE` | `#F3E8FF` | `3107:4765` | `3104:296` |
| `pink` | Rosa | `#DB2777` | `#BE185D` | `#FCE7F3` | `3107:4763` | `3104:323` |
| `red` | Vermelho | `#DC2626` | `#B91C1C` | `#FEE2E2` | `3107:4767` | `3104:813` |
| `orange` | Laranja | `#EA580C` | `#C2410C` | `#FFEDD5` | `3107:4761` | `3104:298` |
| `yellow` | Amarelo | `#CA8A04` | `#A16207` | `#F7F3CA` | `3107:4769` | `3104:325` |

Não substituir os hex por uma escala Tailwind presumida: especialmente `green-light` e `yellow-light` são os valores lidos do arquivo. A tag cinza `3104:1684` existe no style guide (fundo `#E5E7EB`, texto `#374151`), mas não aparece no seletor. É uma variante neutra de apresentação, **não uma oitava opção de categoria**. Cores de marca, feedback, branco e preto também não entram no catálogo persistido.

### Catálogo fechado de ícones

Fonte: [seletor Ícone, 3107:4701](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3107-4701). São **16 opções**, em duas linhas de oito no modal de 448 px. Cada instância foi relacionada ao componente principal pela Plugin API. Chave = nome Figma sem o prefixo `Icon/`; labels abaixo são nomes acessíveis definidos para a interface, não textos presentes no mockup.

| Chave `icon` | Label acessível | Export de `lucide-react` | Instância no seletor | Componente no style guide |
| --- | --- | --- | --- | --- |
| `briefcase-business` | Maleta de trabalho | `BriefcaseBusiness` | `3107:4696` | `3104:1261` |
| `car-front` | Carro | `CarFront` | `3107:4699` | `3104:1288` |
| `heart-pulse` | Coração com pulso | `HeartPulse` | `3107:4703` | `3104:1305` |
| `piggy-bank` | Cofrinho | `PiggyBank` | `3107:4712` | `3104:1252` |
| `shopping-cart` | Carrinho de compras | `ShoppingCart` | `3107:4716` | `3104:1277` |
| `ticket` | Ingresso | `Ticket` | `3107:4720` | `3104:1314` |
| `tool-case` | Caixa de ferramentas | `ToolCase` | `3107:4724` | `3104:1323` |
| `utensils` | Talheres | `Utensils` | `3107:4728` | `3104:1269` |
| `paw-print` | Pata | `PawPrint` | `3107:4779` | `3107:4852` |
| `house` | Casa | `House` | `3107:4864` | `3107:4855` |
| `gift` | Presente | `Gift` | `3107:4868` | `3107:4854` |
| `dumbbell` | Haltere | `Dumbbell` | `3107:4872` | `3107:4853` |
| `book-open` | Livro aberto | `BookOpen` | `3107:4876` | `3107:4856` |
| `baggage-claim` | Carrinho de bagagem | `BaggageClaim` | `3107:4942` | `3107:4937` |
| `mailbox` | Caixa de correio | `Mailbox` | `3107:4946` | `3107:4936` |
| `receipt-text` | Recibo | `ReceiptText` | `3107:4950` | `3107:4935` |

Os 16 exports foram encontrados no entrypoint ESM de `lucide-react@1.57.0` instalado. Isso comprova disponibilidade dos componentes, não igualdade pixel a pixel entre a versão instalada e os vetores Figma. Ícones de ações (`plus`, `x`, `trash`, `square-pen`), navegação, `wallet`, `tag` e indicadores de receita/despesa não são opções de categoria.

### Contrato para SQL e interface futuros

- `color` e `icon` são obrigatórios e aceitam **somente** as chaves exatas das duas tabelas, com comparação sensível a caixa. Não aceitar hex, classes CSS, URLs, SVG, nomes arbitrários de componentes ou labels traduzidos.
- São conjuntos independentes: qualquer um dos 16 ícones pode ser combinado com qualquer uma das 7 cores. Não vincular um ícone a uma categoria predefinida, tipo financeiro ou cor fixa.
- A migration do prompt 2 deve restringir ambos os campos no banco e testar valor desconhecido, vazio, nulo e caixa diferente. Rejeitar entrada inválida; não converter silenciosamente em uma opção padrão.
- O futuro módulo de interface deve mapear explicitamente cada chave para label, tokens ou componente. Não usar import dinâmico por texto recebido nem transformar texto do banco em classe/URL arbitrária.
- O catálogo oferece opções; não cria categorias para a conta. Verde e maleta aparecem selecionados no mockup, o que não estabelece um default de domínio no banco.
- Mudanças futuras no conjunto de chaves exigem sincronizar documentação, constraints, testes e consumidor frontend. Renomear uma label não deve renomear a chave persistida. O módulo `src/config/category-options.ts` entra somente com consumidor real.

### Medidas observadas e estados dos componentes

Unidade: px. As dimensões são as do frame consultado, não limites de conteúdo nem regras de responsividade. A API informa padding 24 e borda 1 nos modais; o primeiro filho começa em 25. Não copiar `p-[25px]` do código gerado como se fosse uma segunda medida independente.

| Elemento / fonte | Medidas e observações confirmadas |
| --- | --- |
| Páginas financeiras | Frames de 1280 × 800; navbar 69; conteúdo com margens laterais e superior de 48, largura útil 1184. O conteúdo de transações excede a altura do frame. |
| Modal de categoria `3107:4607` | 448 × 594, raio 12, borda 1 `gray-200`, fundo branco, padding 24, espaços entre blocos 24; conteúdo útil 398. Cabeçalho 46; título Inter semibold 16/24, subtítulo regular 14/20; fechar 32 × 32 com ícone 16. Altura inclui descrição opcional do mockup, fora do escopo. |
| Seletor de ícone `3107:4701` | Células 42 × 42, ícone 20 × 20, raio 8, intervalo 8. Não selecionado: borda `gray-300`; selecionado: fundo `gray-100` e borda `brand-base`. Estado selecionado confirmado na primeira opção. |
| Seletor de cor `3107:4733` | Sete opções em uma linha, intervalo 8, wrapper raio 8; amostra interna com altura 20 e raio 4. Padding da API gerada inclui a borda; seleção usa borda de marca e fundo `gray-100`. |
| Modal de transação `3107:4295` | 448 × 538, mesma superfície/padding/cabeçalho do modal de categoria. Bloco despesa/receita 398 × 62, raio 12; padding 8, opções 191 × 46. Despesa selecionada: borda `red-base`, fundo `gray-100`; receita não selecionada. Não foi verificada variante com receita selecionada. |
| Formulário de transação `3107:4540` | Espaço vertical 16; descrição ocupa 398; data/valor lado a lado, cada um com 191 e intervalo 16; categoria ocupa 398. Botão Salvar 398 × 48. |
| Input `3105:3190` | Controle 48 de altura, raio 8, borda 1 `gray-300`, branco; padding horizontal 12; label 14/20 medium; distância label/controle 8. Bloco com label mede 76, com helper 100; helper 12/16. Placeholder `gray-400`, texto preenchido `gray-800`. |
| Estados de input | Empty `3103:1490`, Active `3105:3191`, Filled `3105:3138`, Error `3105:3200`, Disabled `3105:3341`, Select `3107:5914`. Active: label de marca; Error: label `Feedback/danger #EF4444`; nas propriedades lidas a borda continua `gray-300`. Disabled: opacidade 0,5 no controle. Não inferir ring de foco desses nomes. |
| Dropdown `3107:5930` | Variante Select inclui painel 460 × 118, raio 8, borda `gray-300`, branco, padding vertical 14/horizontal 12 e intervalo 16. Teclado e abertura/fechamento não foram comprovados por protótipo. |
| Botões com label `3105:3071` | Solid/Outline; Default/Hover/Disabled; Md altura 48 e Sm 36. IDs: Md solid `3103:1631`, hover `3105:3072`, disabled `3105:3088`; Sm solid `3103:2099`. Dimensões/nomes por metadata; cores de cada variante não foram extraídas nesta rodada. |
| Botões de ícone `3105:3111` | 32 × 32; Outline/Danger, Default/Hover/Disabled. Exemplos `3104:862` e `3105:3117`. |
| Paginação `3105:3067` | 32 × 32, Default `3104:1995`, Hover `3105:3066`, Active `3104:2002`, Disabled `3105:3068`. |
| Tags `3104:299` | Altura 28, raio 999, padding 4 vertical/12 horizontal; label com altura 20; largura conforme texto. Fundo light e texto dark conforme catálogo. |

### Páginas: estrutura observada no Figma

**Categorias.** Header `3104:2181`: 1184 × 58. Resumos `3104:2499`: três cartões de aproximadamente 378,67 × 106, intervalo 24, com total de categorias, total de transações e categoria mais utilizada. Grade `3104:2627`: quatro colunas de 284, intervalo horizontal/vertical 16, duas linhas de exemplo. Cartão `3104:2701`: 284 × 226, conteúdo inicia em 25, cabeçalho 40; ícone em área 40 × 40, ações 32 × 32 com intervalo 8. Texto inclui nome e descrição; rodapé tem tag e quantidade. A altura 226 inclui descrição, portanto não deve ser imposta ao cartão adaptado ao escopo sem esse campo.

**Transações.** Header `3104:682`: 1184 × 58. Filtros `3104:721`: 1184 × 122, raio 12, padding vertical 20/horizontal 24; quatro blocos de input de 271,5 × 76 com intervalo 16 (`3104:753`, `3104:761`, `3104:768`, `3104:774`). Textos internos dessas instâncias não foram extraídos; a função busca/tipo/categoria/mês vem de LIST-01. Tabela `3104:401`: 1184 × 707 no exemplo; conteúdo 1182; cabeçalho 56 mais divisor, linhas 72; footer 72. Colunas observadas: descrição 414, data 112, categoria 200, tipo 136, valor 200 e ações 120. Valor alinhado à direita. Rodapé `3104:1823`: contagem à esquerda e cinco controles de 32, intervalo 8, à direita. Existem oito linhas ilustrativas, embora o texto do footer diga “1 a 10 | 27 resultados”; não usar esse exemplo como regra de paginação.

**Dashboard.** Três cartões `3103:2206`, `3103:2218`, `3103:2231`: aproximadamente 378,67 × 118, intervalo horizontal 24, raio 12, borda 1, padding 24, intervalo interno 16. Rótulos com ícone 20 e linha de texto 16; valores com linha 32. Painéis inferiores começam 24 abaixo: recentes `3103:2246` com 781,33 × 523 e categorias `3103:2350` com 378,67 × 331, separados por 24. Recentes: cabeçalho 61, cinco linhas de 80, ícone em área 40 com vetor 16, descrição/data, tag e valor; colunas laterais 160 cada. Categorias: cabeçalho 61, corpo com padding 24; cinco linhas de 28 com intervalo 20, tags, contagens e valores. Não foi localizado seletor mensal na estrutura do dashboard consultado.

### Comportamento aprovado e adaptações obrigatórias

Esta seção deriva da especificação/contrato, **não de uma interação comprovada no Figma**.

| Tema | Aplicação no Financy |
| --- | --- |
| Categoria: campos e exemplos | Persistir nome/cor/ícone. “Título” do mockup representa `name`; descrição opcional não faz parte do modelo aprovado. Não adicionar campo, coluna ou placeholder para ela. Cartões/resumos ilustrativos não criam categorias iniciais; totais extras e “mais utilizada” não são novos requisitos de API. |
| CAT-02–07 | Conta começa vazia; ordem alfabética; contagem de transações de todo histórico; nome único por usuário ignorando caixa/espaços externos; edição preserva vínculos; categoria utilizada não pode ser excluída. Cor e ícone não determinam receita/despesa. |
| TX-01–08 | CRUD manual, descrição/tipo/valor/data/uma categoria obrigatórios; dinheiro positivo em BRL, até duas casas, decimal textual exato; hoje/passado por `America/Sao_Paulo`; sem saldo inicial, recorrências ou categorias automáticas. Confirmação de exclusão mostra descrição e valor. “0,00” no mockup não autoriza gravar zero. |
| LIST-01–03 | Busca por descrição; tipo/categoria/mês combináveis; limpar filtros; dez registros por página; ordem `occurred_on desc, created_at desc, id desc`; filtros/página na URL. Entrada direta começa em todos os meses; mudar/limpar filtros retorna à página 1. |
| DASH-01–03 | Saldo acumulado de todo histórico; receitas/despesas, cinco maiores categorias de despesa e cinco recentes do mês selecionado. Mês inicial atual. Precisará de seletor mensal e identificação dos períodos, mesmo sem modelo desse controle no frame. Link para todas as transações preserva mês. Ranking inclui nome/cor/ícone/valor conforme regra, mesmo se o exemplo tiver apenas tag e contagem. |
| Dados ilustrativos | Nomes, quantidades, valores e datas do mockup são exemplos. Recentes do Figma misturam meses e ranking não está estritamente ordenado por valor; no produto valem mês selecionado e total de despesas decrescente. Não copiar números, contagens ou ordenação para testes de regras. |
| Acesso | Preservar sessão persistente sem checkbox lembrar-me; sem recuperar senha nem editar e-mail/senha. Reutilizar AuthProvider, proteção de rotas e limpeza do cache. |

### Acessibilidade, estados e desktop

Os únicos frames financeiros localizados são de 1280 px. **Não há evidência de layouts específicos de 1024/1440 px** nesta extração. Os critérios abaixo são adaptações de implementação exigidas pelo escopo, não medidas inventadas do Figma:

- Usar layout fluido e validar em 1024/1440; não fixar largura de página em 1280 nem copiar as larguras de colunas como mínimos simultâneos. Grade de cartões pode reduzir colunas e filtros podem quebrar linha para manter controles acessíveis. Evitar overflow horizontal da página e não ocultar ações para fazê-la caber. A revisão final do plano também inclui 1920 px.
- Modal mantém referência de largura 448 quando couber; altura acompanha conteúdo, mensagens e campo de descrição removido. Garantir acesso ao botão salvar/fechar em viewport baixo, sem cortar conteúdo. Overlay existe nos nodes listados, mas cor/opacidade não foram extraídas; não registrar um valor presumido como token Figma.
- Reutilizar foco global existente: outline 3 `#1F6F43`, offset 3. Preservar skip link de `AppShell`, labels associados, mensagens identificadas por `aria-describedby` e `aria-invalid`, estado pendente e envio duplicado bloqueado.
- Seletores de cor/ícone: grupo com label, nome acessível por opção e seleção exposta semanticamente. Operação por teclado e indicador além da cor; seleção e foco são estados distintos. A semântica não pode ser inferida de um retângulo selecionado no mockup.
- Modal: título acessível, foco inicial previsível, foco contido enquanto aberto, Escape/fechar e devolução ao disparador; não fechar nem perder campos em falha de salvamento. Ações de ícone precisam de nomes como “Editar categoria Alimentação”, “Excluir transação …” e “Fechar”.
- Tabela com cabeçalhos semânticos; estado ativo da paginação anunciado; anterior/próximo indisponíveis nos limites. Tipo financeiro identificado por texto/ícone além da cor. Conteúdo monetário grande não pode perder dígitos para caber.

| Estado exigido | Direção funcional para a implementação | Evidência visual |
| --- | --- | --- |
| Sem categorias | Orientar criar a primeira; transação orienta ir a categorias | Não localizado frame específico |
| Sem transações / sem resultados | Distinguir conta vazia de filtros sem correspondência; oferecer ação pertinente, inclusive limpar filtros | Não localizado frame específico |
| Dashboard vazio | Totais exatos zero e listas vazias com período explícito | Não localizado frame específico |
| Carregando / salvando | Estado anunciado; bloquear envio repetido; não mostrar dados de outra conta/filtro como atuais | Não localizado frame específico de página; há variantes Disabled de controles |
| Erro recuperável | Preservar campos, manter modal e permitir tentar novamente; erros de duplicidade, categoria em uso e rede diferenciados | Existe variante Error de input; não há fluxo de erro completo verificado |
| Edição / confirmação de exclusão | Carregar valores atuais; confirmar exclusão; explicar bloqueio de categoria utilizada | Não localizados modais próprios; reutilizar linguagem dos modais de criação sem alegar frame existente |

### Reuso da base e diferenças registradas

Reutilizar `AppShell`, `Logo`, `Button`, `Input`, Inter local e tokens em `src/styles.css`. O logo já é asset local (134 × 32 ou 100 × 24); não substituir por desenho novo. O `Button` atual tem variantes default/outline/destructive/ghost e altura mínima 48, portanto ainda não expressa os controles de 32/36 do Figma. Compor/estender apenas quando houver consumidor; não criar biblioteca antecipada.

Diferenças existentes, fora da alteração desta etapa: placeholder local `#6B7280` versus Figma `#9CA3AF`; input inválido local usa borda `#B91C1C`, enquanto a variante Figma lida muda o label para `#EF4444` e mantém borda `#D1D5DB`; disabled local usa opacidade 0,6 em botões versus 0,5 observado no controle Input desabilitado. São contextos distintos; não uniformizar silenciosamente nem remover o foco acessível. Nenhum CSS foi modificado.

### Prontidão e limites

**Prompt 1 concluído para o catálogo necessário ao banco:** 7 chaves de cor com tokens e 16 chaves de ícone com origem rastreável. Não há lacuna de catálogo bloqueando as constraints do prompt 2. O catálogo não comprova RLS, integridade financeira ou transporte decimal; essas verificações pertencem à próxima etapa.

Antes das telas, retomar as capturas completas quando o acesso permitir; verificar detalhes internos dos filtros, tipografia das páginas, cores dos estados de botões, overlay e compatibilidade visual dos ícones instalados. Estados ausentes e adaptação desktop continuam exigências funcionais com validação futura. Nenhuma tela, módulo, dependência, migration ou ambiente foi alterado nesta extração.
