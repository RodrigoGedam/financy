# Financy — prompt 4: dinheiro, calendário e URL

Concluído localmente em 16/10/2026, base `22e02d9`, branch `feat/financy-v1`. Somente primeira parte da tarefa 4. Mudanças locais de README/package/lockfile e configuração de formatação preservadas; sem dependências novas, commit, acesso ao banco ou tela de transações.

## Contratos e decisões

- Mantidas as seis assinaturas propostas: `parseAmountPtBr`, `formatBrl`, `todayInSaoPaulo`, `monthBounds`, `formatDateBr`, `parseTransactionSearch`. Helpers existentes/callers inspecionados: nenhum desses módulos existia.
- Acrescentar somente `normalizeDecimal` (texto da API/saldos), `isValidMonth` (reutilizado no parser da URL) e os contratos/adaptadores de filtros/paginação necessários agora. Entidades/input/API de transações ficam para o consumidor no prompt 5.
- Dinheiro digitado: positivo, inteiro ou vírgula com uma/duas casas, agrupamento brasileiro válido ou ausente. Espaços externos aceitos, internos e símbolo de moeda recusados. Zeros iniciais sem agrupamento são normalizados; agrupamento iniciado por zero é inválido. Decimal de API aceita sinal negativo para saldo; zero negativo vira `0.00`. Entrada inválida retorna null; formatação de decimal inválido lança RangeError, sem arredondar nem mascarar como zero. Sem teto monetário de produto.
- Calendário de entrada com ano `0001`–`9999` e campos de largura fixa. `monthBounds` usa limite final exclusivo; para dezembro/9999, o marcador de término é `10000-01-01` (texto aceito pelo calendário PostgreSQL), sem ampliar o formato de datas de entrada. Formatadores e monthBounds recusam entradas inválidas com RangeError.
- URL aceita UUID sintático sem consultar banco/dono; isso será responsabilidade da API/RLS. Página limitada a inteiro seguro do JavaScript, por precisão do índice, sem representar limite de dinheiro. O ajuste ao total real e o range da Data API entram no prompt 5.
- Parser instalado do TanStack Router JSON-parsa primitivos em URLs diretas. `q` aceita texto, número finito e booleano como texto; arrays/objetos/null viram busca vazia. Links serializados pelo Router preservam strings numéricas com zeros iniciais. Não mudar o Router nesta etapa.
- Ruling: manter checkout existente e ledger versionável, somente prompt 4. Não criar graphify/índice ou instalar ferramentas para esta tarefa pequena; não há grafo existente e o usuário vedou dependências novas.

## Verificações

Testes escritos antes da implementação. Primeiro foram expostas as assinaturas com falha explícita de regra ausente para observar os testes executando, não apenas um erro de importação. RED: **106 casos de dinheiro/calendário falharam**; o setup de URL foi ajustado para não chamar o parser ainda ausente fora de um teste, e os **38 casos de URL falharam** em execução separada. Nenhum desses placeholders permanece.

Implementação mínima passou inicialmente nos 144 casos. Um teste adicional revelou que Intl sem era poderia exibir um ano anterior à era comum como ano positivo: RED com uma falha (38 casos pulados não contados como aprovados), corrigido pela validação explícita da era.

| Verificação executada | Resultado |
| --- | --- |
| `node node_modules/vitest/vitest.mjs run --reporter=dot` (mesma suíte de `pnpm test`) | **148/148** passaram em seis arquivos; 145 casos novos e três existentes |
| Mesmo runner, somente `src/lib/dates.test.ts`, processo filho com `TZ=UTC` | **39/39** passaram; referência São Paulo e datas civis independem do fuso padrão do processo |
| `pnpm typecheck` | Exit 0 |
| `pnpm lint` | Exit 0 |
| Prettier instalado, `--check` somente nos sete arquivos TypeScript novos | Passou; configuração local de tabs preservada |

Cobertos centavos, saldo negativo, zero negativo, `1`/`1.2`, valor `9007199254740993.01` e valores de 30 dígitos, agrupamento brasileiro inválido, excesso de casas e expoentes. Dinheiro é transformado por texto; BigInt aparece somente nas unidades para agrupamento da exibição. Não há soma/aritmética financeira no JavaScript.

Calendário cobre bissextos (incluindo 1900/2000/2100), dias inexistentes, limites de ano/mês e `2026-10-15T01:30:00Z` → `2026-10-14`. Formatação civil usa apenas partes textuais, sem construir Date a partir de `YYYY-MM-DD`.

URL cobre entradas inválidas, filtros combinados, consulta literal com acentos/%/_, UUID canônico, mês do dashboard, todos os meses como entrada direta, reset de página e round-trip page/pageIndex. Exercitado o parser/serializador reais de `@tanstack/react-router@1.170.44`, sem mocks e sem alterar a configuração de rotas.

## Arquivos e limites

- Novos: `src/lib/money.ts`, `money.test.ts`, `dates.ts`, `dates.test.ts`, `src/features/transactions/{types,search,search.test}.ts` e este registro. Plano atualizado apenas nos passos 1–2 da tarefa 4; demais passos continuam pendentes.
- `normalizeDecimal` retorna null quando a resposta textual não é válida; formatadores lançam RangeError para entrada inválida. O futuro adapter de API deve tratar esse erro como dado inválido, sem converter para zero. Uma resposta numérica já imprecisa não pode ser recuperada: manter `amount::text`/RPC textual validados no prompt 2.
- O parser recebe o objeto já decodificado pelo Router. Texto numérico criado pelos links do Router é preservado; uma URL manual cujo `q` seja JSON numérico grande pode perder precisão antes desse helper. A integração do prompt 5 deve preservar texto de busca na leitura/serialização da URL, sem esperar que o normalizador reconstrua dígitos já perdidos.
- UUID válido não comprova existência nem propriedade. Page/pageIndex validam inteiros seguros; página fora do total e offset da consulta serão ajustados pelo consumidor real. Não há novo teto monetário, biblioteca de dinheiro ou schema genérico. Não surgiu divergência que exija nova decisão de produto.
- Integração visual/API, verificação de data futura no formulário e restrições de acesso continuam no **prompt 5**. Não foram executados build, navegador, integração remota ou migrations nesta etapa de utilitários. O relatório JSON temporário de RED foi removido. Nenhuma conta, transação ou ambiente foi alterado.
