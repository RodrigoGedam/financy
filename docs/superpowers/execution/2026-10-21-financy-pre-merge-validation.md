# Execução — validação pré-merge

Plano: `docs/superpowers/plans/2026-10-21-financy-pre-merge-validation.md`.
Contrato: especificação UX responsiva de 2026-10-20.

## Identidade e limites

- Worktree `financy-ux-responsive`, branch `codex/financy-ux-responsive`.
- Base local e remota em 2026-10-21: `359a1857ad37e87c576fd03a71d85af03984a776`.
- Início: `8d2b1ecb0eb8b7cf5b81d593daa20ee201166456`.
- Docker cliente/servidor 29.8.0 respondeu com sucesso.
- Somente recursos descartáveis locais desta execução; sem Supabase remoto, push, publicação ou merge.

## Ledger

- V1 concluído: guard local estrito, seletor sem fallback, configurações separadas, storage key e manifesto por ambiente. RED: duas funções ainda inexistentes; GREEN: 9 testes. Typecheck e lint exit 0. Um timeout de importação sob download Docker passou na repetição, sem alterar limite.
- V2 concluído: ensaio legado PASS (1 cenário sequencial, 16,89 s, exit 0); aplicação limpa PASS, cinco migrations e ambos os CHECKs `convalidated=true`. Runtime `ca86d7e2-8c88-4764-bfad-e90d6fe2de8d`, projeto `financy-ux-premerge-ca86d7e2`, API/DB `55321/55322`. Início com somente três migrations antigas; portas livres verificadas previamente. Banco/Auth/gateway saudáveis, `start` exit 0 e API autenticada real confirmada pelo ensaio.
- V3 concluído: CLI 2.121.0 gerou tipos do schema público local (exit 0); stdout temporário validado e formatado antes de substituir o arquivo. Typecheck, 122 testes focados (APIs/dinheiro/datas) e lint passaram.
- V4 automação concluída: 190 unitários e 12 responsivos PASS na rodada final de 22/10, sem build concorrente; build/typecheck e lint PASS. Os logs do ensaio anterior confirmam 21 integrações e 15 E2E backend PASS. Aceite visual humano registrado; aparelho físico e percentuais específicos de zoom nativo não foram comprovados. As falhas iniciais e as repetições permanecem no histórico abaixo.
- V5 concluído: P2 corrigido, commits locais registrados, origin/main reconferida e revisão independente da branch completa sem novos achados de código. A simulação do checkout principal identificou documentos untracked que impedem o futuro merge; backup verificado preserva os originais. Aparelho físico e zoom nativo específico continuam sem comprovação. Nenhum merge foi executado.

Ruling: usar este registro versionado como ledger em Windows, como na execução anterior — facilita revisão e continuidade sem depender de scripts Bash.

Ruling: adaptar também o guard consumidor em `auth.spec.ts` ao seletor validado — a inspeção encontrou ali uma chamada remota direta omitida na lista V1; o contrato remoto original permanece intacto.

Diagnóstico do primeiro início: `DbConnectError`, conexão terminada durante a inicialização. Segunda tentativa com imagens em cache: PostgreSQL saudável, sem OOMKilled; as três migrations antigas foram aplicadas. Não atribuir causa definitiva à RAM (host 3930 MB, livre 389 MB observado). Nenhuma proteção de saúde foi ignorada.

## Evidências do ensaio legado

Comando: `pnpm exec vitest run --config vitest.migration.local.config.ts`, com workdir e CLI 2.121.0 explícitos. Arquivo `tests/migrations/financial-titles.local.test.ts` mantém sessões em um único processo. Operações de usuário via chave pública e JWTs Alice/Bob/anônimo; somente catálogo/migrations via administração do contêiner local identificado.

- Legado próprio com 80 pontos de código preservado integralmente após M1; valor `9007199254740993.01` preservado como texto.
- Ambos os CHECKs `convalidated=false` na presença de legado; edição parcial rejeitada sem perda. Correção explícita e vínculo a categoria legada aceitos.
- Limites 19/20/21 em ASCII/emojis, NBSP/FEFF/tab, acentos combinados e espaços internos verificados via tabelas e RPCs. Snapshot original aceita uma alteração; repetição obsoleta rejeitada.
- Após M2, descrição antiga null, nova descrição >20 aceita, edição/limpeza/releitura corretas; embed e dois caminhos JSON do dashboard corretos.
- RLS Alice/Bob/anônimo, grants de descrição e igualdade do catálogo anterior de ACLs/FKs/triggers/policies/segurança de funções confirmados.
- Cinco versões registradas no histórico. Fixtures removidas e sessões revogadas antes do reset; manifesto contém só IDs técnicos em diretório ignorado.
- Repetir este ensaio exige novo runtime com apenas três migrations; nunca retirar CHECKs de uma base já migrada para fabricar legado.

## Tipos gerados

`src/lib/database.types.ts` agora vem da geração local real. Schema mantém descrição nullable, opcional em Insert/Update; numeric continua number no gerado e texto exato no domínio. RPCs e FK composta mantidas. O gerador 2.121.0 acrescenta `ComputedFields: never` e não emite o antigo `__InternalSupabase.PostgrestVersion = 14.18`; preservamos a saída real, sem fabricar metadados do ambiente remoto. Formatação via Prettier altera apenas apresentação. Runtime usa imagem Postgres 17.11.0.004/PostgREST v16.4.

Ruling: `expect.timeout=30s` apenas no Playwright backend local — trace mostrou get_dashboard HTTP 200 em 5115 ms e escritas/refetch ainda pendentes quando expirava a espera padrão de 5s. Não mudar handlers ou proteger falhas de regra de negócio com retries. Acrescentada asserção de Escape/fechamento bloqueados enquanto busy.

Ruling: restringir a asserção de valor monetário do teste desktop à tabela visível — o DOM contém tabela e cards responsivos, e o seletor textual antigo incluía a representação oculta (strict mode). Nenhuma alteração no layout foi necessária para esse diagnóstico.

## Revisão final e refinamento CSS mobile — 22/10/2026

- Revisão da candidata completa identificou um P2 no guard do ensaio: relative(root, parent(root)) resulta em '..' e não é rejeitado. Permanece pendente em tests/migrations/financial-titles.local.test.ts:13; esta correção visual não o altera.
- Retorno humano: zoom e alinhamento geral do dashboard pareceram bons, mas as capturas mobile mostraram cartões alongados/alinhamentos inconsistentes e motivaram a centralização do ranking de categorias. O retorno não informa percentuais de zoom nem equivale a teste em aparelho físico.
- Correção concentrada em src/styles.css: estilos de alinhamento da tabela restritos ao desktop; cartões mobile com tipo/valor juntos e ações horizontais; metadados recentes compactados; ranking centralizado abaixo de 768 px, preservando desktop.
- Regressões de geometria acrescentadas em tests/e2e/responsive.spec.ts. RED observado: tipo/valor separados por 64 px, alinhamentos incorretos e categorias fora do centro. Outra regressão confirmou corte de valor curto a 320 px; a coluna monetária foi ampliada sem alterar a string de domínio.
- Primeira execução completa: 12/12 PASS. Após o ajuste monetário final: 11/12 PASS, uma falha no carregamento inicial dos itens do dashboard (0 itens no prazo de 5 s, antes das medidas CSS). Confirmação sem build concorrente: os três testes focados PASS, incluindo o caso que falhou, ambos os testes novos e geometria desktop. Nenhum timeout foi ampliado. A falha transitória foi observada; sua causa não foi demonstrada.
- Build final PASS, lint final PASS e git diff --check PASS. Detector Impeccable executado uma vez sobre o CSS: sem achados ([]). Sem nova execução de integração/backend E2E, pois APIs, schema e handlers não mudaram.
- Evidências locais ignoradas em test-fixtures/ux-responsive/: mobile-css-red.log, mobile-amount-red.log, mobile-css-green.log, mobile-css-final.log, mobile-css-confirmation.log, mobile-css-build-final.log, mobile-css-lint-final.log, mobile-css-detector.json; capturas mobile-fix-transactions-390.png, mobile-fix-dashboard-390.png e dashboard-320.png. Capturas finais inspecionadas; valor curto integral a 320 px, sem overflow global, cartões <=300 px e ações >=44 px nos cenários novos. Textos/valores legados extremos usam o detalhe integral existente.
- Tudo local, no worktree codex/financy-ux-responsive. Sem merge, push, publicação ou alteração em Supabase remoto. Pendências de integração: P2 do guard, revisão/aceite humano final, aparelho físico e confirmação explícita dos critérios de zoom nativo. As cinco alterações anteriores não commitadas foram preservadas.

### Aceite humano — 22/10/2026

O usuário aprovou as mudanças visuais após testar o CSS e solicitou o encerramento do projeto. Vite encerrado e porta 5173 sem listener. O aceite visual está registrado; permanecem o P2 do guard, a confirmação da suíte responsiva completa após o último ajuste, revisão/commits finais e a verificação de divergência com main antes do merge. Aparelho físico e percentuais específicos de zoom nativo não foram comprovados nesta sessão. Nenhum merge ou alteração remota foi realizado.

## Fechamento pré-merge — 22/10/2026

- P2 corrigido: assertLocalRuntimeDirectory recebe os caminhos já resolvidos por realpathSync e rejeita raiz, pai exato ('..'), ancestrais, irmãos e outro drive. O controlador chama o guard antes de ler o config do destino e antes de copiar/executar migrations. Descendentes válidos, inclusive um nome iniciado por '..', continuam aceitos. Proteções de identidade, vínculo remoto e contêiner permanecem intactas.
- Regressão RED específica comprovada: remover temporariamente somente child === '..' faz falhar o caso da pasta pai; a correção foi restaurada em finally. A suíte final, com a proteção ativa, passou em 190 testes/13 arquivos. Sem I/O de banco no teste do caminho e sem nova aplicação de migrations.
- pnpm test:ui:local executado sozinho: 12/12 PASS em 1,7 min, incluindo CSS mobile, valor curto a 320 px, foco/toque, estados e desktop. A falha transitória anterior de carregamento não se repetiu; sua causa não foi demonstrada e não houve aumento de timeout ou retry.
- Após os responsivos: pnpm build PASS (inclui tsc -b), pnpm lint PASS e git diff --check PASS. Evidências ignoradas em test-fixtures/ux-responsive/premerge-{parent-red,guard-red,guard-green,unit-final,responsive-final,build-final,lint-final}.log.
- Ruling: colocar a checagem pura de confinamento no módulo de fixtures já existente — permite testar a mesma regra usada pelo ensaio sem importar o controlador com efeitos administrativos. Nenhuma abstração de produto foi criada.
- Este fechamento substitui as pendências de P2 e repetição da suíte registradas nos adendos anteriores. Os resultados de integração/backend e do ensaio legado já verificados continuam históricos; não foram repetidos porque esta rodada altera somente CSS/testes e o guard local, sem mudar SQL, API ou handlers.
- Servidor web permanece encerrado. Sem merge, push, publicação ou alteração em Supabase remoto. Worktree e evidências preservados para revisão e integração posterior.

### Resultado da revisão e estado de integração

- Commits locais desta rodada: 1b97a95 (guard), 21f4937 (CSS mobile e regressões), 535a84f (suítes/registro operacional). A revisão independente, em contexto novo e somente leitura, percorreu 359a1857ad37e87c576fd03a71d85af03984a776..535a84f98fba3029691a5f5927ed8945736d5368 inteiro e os fluxos conectados; nenhum novo achado concreto de código. Logs RED/190 unitários/12 responsivos/build/lint e os históricos de legado/21 integrações/15 backend E2E conferidos pelo revisor. Esta atualização documental é posterior à revisão e não altera código/config/testes.
- git fetch origin main concluído: main e origin/main continuam em 359a1857ad37e87c576fd03a71d85af03984a776. Na candidata revisada, 0 commits exclusivos de main e 11 da feature; origin/main é ancestral de HEAD. Não há conflito entre os históricos, e main não foi alterada.
- Simulação adicional do checkout original: git read-tree --dry-run -m -u main codex/financy-ux-responsive retornou 128 porque o plano UX está untracked em um caminho que a feature passa a versionar. A especificação UX está na mesma situação. git hash-object dos dois originais é idêntico aos blobs da candidata. Os outros dois documentos untracked não colidem com novos arquivos da feature.
- Cópias verificadas por hash preservadas em test-fixtures/ux-premerge/main-untracked-docs-2026-10-22/, ignoradas pelo Git no worktree. Os quatro originais, index e HEAD do checkout principal permanecem intactos. Em futura operação autorizada de merge, reconferir os hashes e mover as duas cópias não rastreadas conflitantes para backup antes de atualizar main; se algum conteúdo mudar, reconciliar sem sobrescrever ou excluir silenciosamente.
- Entrega técnica concluída e aceite visual humano registrado. Não há novo bloqueio de código identificado. O checkout principal ainda requer a reconciliação documental acima; aparelho físico e zoom nativo exato 200%/400% não foram comprovados. Sem merge, push, deploy ou alteração no Supabase remoto. Servidor web encerrado, worktree mantido.

## Integração local autorizada e referência WCAG — 23/10/2026

- O usuário aceitou a recomendação de usar WCAG como referência e autorizou o merge local, incluindo a resolução dos dois documentos duplicados. A autorização não inclui push, deploy ou mudança em Supabase remoto.
- Referências: [WCAG 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) e [WCAG 1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Verificação focada nesses comportamentos; não constitui auditoria ou certificação de conformidade WCAG completa.
- Teste de apresentação no Edge instalado, headless, com perfis descartáveis próprios e respostas interceptadas (.invalid), sem banco ou perfil pessoal. O zoom foi aplicado pela preferência nativa do navegador, sem CSS zoom, pinch ou emulação de deviceScaleFactor. A preferência da partição atual foi conferida no [código do Chromium](https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/ui/zoom/chrome_zoom_level_prefs.cc).
- Escala comprovada: base 100% DPR=1 e viewport 1256x808; 200% DPR=2 e 628x404; 400% DPR=4 e 314x202. visualViewport.scale=1 e zoom computado de html/body=1 em todas. A largura a 400% é inferior a 320 pixels CSS.
- Matriz PASS (1 cenário, 1,1 min): dashboard/categorias/transações/perfil/login/cadastro em 200% e 400%, sem overflow horizontal global; valores extremos completos no detalhe; modal com texto inválido preservado, primeiro erro focado e visível, foco dentro do diálogo, Fechar/Salvar alcançáveis por rolagem, Escape e restauração do foco. A interação foi por teclado; não se afirma teste de mouse nativo ou aparelho físico.
- Capturas de confirmação PASS (1 cenário, 24,4 s), inspecionadas: verified-200-dashboard.png, verified-400-transactions.png e verified-400-dashboard.png. A exportação padrão do Playwright recortava a imagem em zoom nativo; as capturas verified-* corrigem apenas a escala de exportação, com largura PNG conferida contra o viewport CSS. Nenhum CSS do produto foi alterado.
- Evidências ignoradas em test-fixtures/ux-premerge/wcag-merge-2026-10-23/: wcag-zoom.spec.ts, wcag-zoom.config.ts, metrics.json, zoom-final.log, capture.log e verified-*.png. As tentativas de preparação anteriores não contam como PASS: preferência antiga não aplicada, interação aguardando coordenadas interrompida e expectativa incorreta de um Cancelar inexistente, corrigida para Fechar. Nenhuma dessas tentativas motivou mudança no produto.
- pnpm test pré-merge PASS: 190/190 em 13 arquivos. Revisão independente anterior continua válida para o código; desde 75a01fd esta etapa acrescenta somente registro documental e artefatos ignorados de verificação. Aparelho físico permanece não testado; o comportamento de zoom 200%/400% agora possui evidência automatizada do navegador.
