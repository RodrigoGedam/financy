# Financy — tarefa 3: categorias

Concluída em desenvolvimento em 16/10/2026, base `5c27730`, branch `feat/financy-v1`. Produção fora do escopo; sem commit/push. Preservadas as mudanças locais anteriores, inclusive `docs/prompt-avaliar-regras-spa.md`.

## Inspeção e decisões

- Prompt 2 confirmado: histórico remoto `20261015182208_financy_core`, MD5 `de0ab7e420cb311bac01c25327d6aaa9`, RLS nas duas tabelas, oito policies, tabelas vazias. Registro anterior demonstra 10 testes reais de RLS/integridade e transporte textual aprovados.
- Figma consultado antes da interface: página `3104:2028` e modal `3107:4607`, contexto detalhado e screenshots. Mantidos Inter, marca, AppShell, Button, Input e Lucide já aprovados; as preferências genéricas da skill visual não substituem a identidade existente.
- Ruling: continuar no checkout da execução nativa, preservando pré-requisitos não commitados. Este registro é o ledger; somente tarefa 3, sem seguir automaticamente para tarefas posteriores.
- Ruling: nome/cor/ícone e contagem são o escopo. Não adicionar descrição opcional nem os resumos ilustrativos do Figma, conforme DESIGN.md. Cartão terá altura adaptada ao conteúdo real. Nenhuma categoria automática.
- Consumidores afetados: somente rota `/categorias`, API/hooks/formulários específicos, catálogo frontend, estilos, testes de API/navegador e documentação. Sem mudança de Auth, schema financeiro, transações ou dashboard.

## Verificações

- RED de API: suite falhou ao importar o módulo ainda ausente (sem testes executados, não é prova de regra). RED de navegador: placeholder não apresentou o vazio orientado, teste falhou como esperado.
- API implementada e exercitada pelo mesmo singleton da aplicação com sessão real de Alice; Bob usa cliente independente. Integração específica: 3/3 passou. Suíte completa com RLS/integridade: **13/13**, 26,74 s. Contagem exata de **1.005** transações de tipos/meses distintos, sem linhas históricas na resposta; contagens não incluem Bob. Duplicate concorrente permitiu uma criação; edição atualizou o join da transação antiga; exclusão após vínculo concorrente foi recusada.
- Consulta `categories.select('id,name,color,icon,transactions(count)')`; count executado no PostgreSQL/Data API. Uma requisição por lote de até 500 categorias, sem consulta por cartão. Paginação por ID evita truncar uma lista de mais de 1.000 categorias; ordenação final pt-BR. Cancelamento encaminhado pelo AbortSignal. [Fonte oficial do SDK](https://supabase.com/docs/reference/javascript/select), exemplo “Querying referenced table with count”. Não foi necessária migration ou mudança de grants/RLS.
- Teste de navegador inicial após UI percorreu CRUD, erros de escrita, vínculo, foco e larguras, mas falhou na espera de erro de GET. Diagnóstico pelo SDK 2.117.3 instalado: GET faz três retries com intervalos de 1/2/4 s, além do retry do QueryClient existente. Espera específica ajustada para 25 s, sem mudar política do produto. Repetição com carregamento controlado: **1/1 passou**, 48,5 s.
- Typecheck, lint e três unitários passaram. Build passou: chunk de categorias 64,96 kB (gzip 21,53), principal 573,44 kB (gzip 169,50); aviso preexistente acima de 500 kB continua. Nenhuma dependência/lockfile alterados.
- Revisão independente estática: sem achados bloqueadores; contexto remoto/testes/visual conferidos pelo implementador. Checklist React e pre-flight visual aplicados, preservando identidade explícita em vez das preferências genéricas de skills.

## Implementação

- `src/config/category-options.ts`: catálogo consumido; sete chaves e 16 ícones, tokens exatos de DESIGN.md. Teste compara chaves com documentação e constraints e recusa strings/propriedades herdadas. `types.ts` limita inputs ao catálogo; API valida dados recebidos.
- `src/features/categories/{api,queries,types}.ts`: CRUD específico, trim e erros de unicidade/FK/linha indisponível, sem repositório genérico. `.single()` exige a linha efetivamente alterada/excluída, inclusive para evitar sucesso falso com zero linhas RLS.
- Query `['finance', userId, 'categories']`, habilitada somente com sessão; mutations invalidam `['finance', userId]`, sem otimismo. AuthProvider/QueryClient e limpeza por identidade preservados.
- `categories-page.tsx` e `category-dialog.tsx`: cartões, vazio, carregamento/erro recuperável, form TanStack, modal Radix e confirmação. Valores persistem após falha; o botão de retry reenvia os mesmos campos. Radios acessíveis, foco inicial/devolvido, escape e ações nomeadas. Sem cópia de nome/cor/ícone para transações; somente FK existente.
- Alterados somente placeholder `/categorias`, estilos específicos, fixtures/testes, README/DESIGN e registro/plano. Não alterados autenticação, rotas de transações/dashboard, banco de produção ou schema financeiro.

## Ajuste e limpeza das fixtures

Para testar volume sem mil requisições de limpeza, fixture aceita inserts em lotes e remove os IDs exatos em lotes de até 200, sempre transações → categorias. As operações sob teste continuam com chave publicável/JWTs reais; interceptações de rede do navegador simulam somente falha/atraso de transporte, não autorização.

Foi detectado que Playwright apaga `test-results` ao iniciar. O manifesto anterior tinha oito entradas, mas os horários das execuções e a consulta administrativa de Auth mostraram 14 contas desta tarefa (sete pares Alice/Bob, entre 13:20:31 e 13:28:53 UTC). Recuperadas as seis entradas de três execuções anteriores com IDs/e-mails/runIds exatos. Manifesto transferido para `test-fixtures/finance-users.jsonl`, fora do diretório de saída e ignorado pelo Git. Nenhuma limpeza ampla por prefixo. A tarefa 2 havia confirmado sua própria limpeza antes deste problema.

O teste adicional de envio pendente passou: botão e campos desabilitados, Enter repetido e somente um POST/registro. Sua primeira execução deixou uma categoria para o teste seguinte, que esperava vazio; corrigida a limpeza específica desse caso, sem alterar o produto. O manifesto preservou as 14 entradas anteriores durante o reinício do Playwright e cresceu para 20 IDs únicos (dez pares de execuções).

Na execução conjunta, cinco testes existentes de acesso e envio único passaram; o teste completo de categorias falhou somente na espera de 5 s do segundo contexto de navegador. Trace confirmou `200 []` real para Bob. A checagem passou a aguardar explicitamente a resposta, validar seu JSON vazio e esperar a renderização por até 15 s. Repetição final dos dois testes de categorias: **2/2 passaram**, 59,2 s; fluxo completo 36,7 s. Essa evidência é separada dos **5/5 testes de acesso** aprovados no run anterior, não apresentada como um único run de sete aprovados.

Últimos checks após ajustes de testes/fixture: typecheck e lint exit 0; unitários **3/3** (incluindo equivalência dos hex e chaves do catálogo); `git diff --check` sem erros (somente avisos de conversão LF/CRLF). O build aprovado acima corresponde ao mesmo código de produção; depois dele mudaram apenas testes, manifesto ignorado e documentação.

Conferência administrativa final: 20 IDs do manifesto corresponderam aos e-mails exatos Alice/Bob dos respectivos runIds, zero divergências, zero categorias/transações/sessões dependentes. Removidas exatamente essas 20 contas Auth, com guardas por ID/e-mail e ausência de dependências. Auditoria posterior confirma zero contas, sessões e linhas financeiras dessas fixtures; as tabelas financeiras estão vazias. A administração não foi usada nas operações sob teste e não substitui a prova de RLS.

## Entrega e limites

Arquivos desta tarefa: `src/config/category-options.ts` e teste; `src/features/categories/{types,api,queries}.ts`, `categories-page.tsx`, `category-dialog.tsx`; rota em `src/router.tsx` e estilos em `src/styles.css`; `tests/integration/categories.test.ts`, `tests/e2e/categories.spec.ts`, fixture compartilhada, `.gitignore`; DESIGN, README, operação, plano e este registro. Sem novas dependências, migrations ou mudanças de autenticação.

Capturas finais de página/modal em 1024/1440 px inspecionadas, sem rolagem horizontal. Teclado e foco inicial/devolvido foram verificados por Playwright, além de labels, radios, Escape e confirmação com foco em Cancelar. Não houve auditoria independente com leitor de tela nem alegação de igualdade pixel a pixel com o Figma. Testes de Auth que criam contas não foram repetidos nesta tarefa; cinco testes de acesso foram. Permanece o aviso de chunk principal acima de 500 kB já conhecido. Não há bloqueio para o **prompt 4 — dinheiro, datas e URL**, que não foi iniciado.
