# Financy — plano de validação antes do merge

> **For agentic workers:** usar `superpowers:executing-plans`, nativamente e em sequência, após revisão deste plano e pedido de execução. As caixas abaixo descrevem trabalho futuro; apenas o diagnóstico Docker desta data já foi executado.

**Goal:** fechar as pendências de banco, tipos, testes reais e revisão da branch responsiva antes de autorizar sua integração em main.
**Architecture:** manter a implementação T1–T5; acrescentar somente o suporte de testes necessário para usar Supabase local descartável, ensaiar M1/M2 em ordem e gerar tipos do schema validado. Reutilizar fixtures, APIs e jornadas existentes.
**Tech Stack:** stack atual, Docker Desktop/WSL, Supabase CLI fixado em 2.121.0, PostgreSQL 17, Vitest e Playwright. Sem dependências novas.
**Spec:** [contrato aprovado de UX](../specs/2026-10-20-financy-ux-responsive-design.md), com [plano T1–T6](2026-10-20-financy-ux-responsive.md) e [evidências de implementação](../execution/2026-10-20-financy-ux-responsive.md).
**Status:** plano solicitado em 21/10/2026; execução das etapas V1–V5 e merge ainda não realizados. Método preservado: nativo, sequencial; nenhum subagente.

## Estado reconfirmado em 21/10/2026

| Verificação executada | Evidência |
| --- | --- |
| `docker version` | Client e Server **29.8.0**, exit 0 |
| `docker info` | Engine **linux**, arquitetura **x86_64**, exit 0 |
| `wsl --version` | WSL **3.0.3.0**, kernel **6.18.54.1-1** |
| `docker run --rm --network none hello-world` | **Hello from Docker!**, exit 0; imagem oficial baixada, container removido automaticamente |
| `docker ps` | Nenhum container em execução no momento da consulta |
| main local | `359a1857ad37e87c576fd03a71d85af03984a776`; quatro documentos não rastreados preservados |
| Branch de implementação | `codex/financy-ux-responsive`, HEAD `8d2b1ecb0eb8b7cf5b81d593daa20ee201166456`; limpa antes da criação deste plano |

**Docker operacional confirmado; o bloqueio de runtime registrado em 20/10 foi superado.** Isso não comprova ainda que a stack Supabase local sobe ou que as migrations passam. Não foi iniciado Supabase nem aplicado SQL nesta preparação. A imagem hello-world ficou apenas no cache local.

Não houve fetch nesta data; o SHA do servidor remoto deve ser reconferido na execução. Os resultados de 183 unitários, 10 cenários visuais, typecheck/lint/build são os da implementação anterior, e não novas execuções de 21/10.

## Restrições globais e isolamento

- Continuar no worktree existente: `C:/Users/Rodrigo/.codex/worktrees/financy-ux-responsive/Financy com IA`. Não criar outro worktree nem alterar produto no checkout main.
- Nenhum Supabase remoto, push, PR, merge ou deployment faz parte da execução V1–V5. Integração exige decisão posterior explícita, com evidências disponíveis.
- Manter RLS, FK composta, proprietário/identidade, SECURITY INVOKER, dinheiro textual, calendário de São Paulo, cache por userId e URL. Nenhuma refatoração de produto adicional.
- O grant mínimo INSERT/UPDATE(description) foi autorizado para M2 local. Nenhuma outra permissão nova; não mudar policies para facilitar testes.
- Os guards remotos existentes continuam estritos. Não trocar suas URLs por localhost nem permitir qualquer URL quando existir uma flag de teste.
- Não copiar `.env`, `.temp/project-ref`, credenciais, sessões ou dados de projetos remotos. Usar apenas contas/linhas fictícias locais com runId.
- Não imprimir chaves, senhas, JWTs ou DSNs. Manifests contêm somente alvo local, runId e IDs técnicos; sessões/credenciais das fixtures ficam em memória.
- Reutilizar o CLI fixado e o mecanismo local de migrations. Nunca usar `--linked`, `--project-ref`, `db push`, `db pull` ou `migration repair` como atalho deste plano.
- Escritas/DDL e eventual reset são exclusivamente do novo alvo descartável identificado abaixo. Antes de reset/remoção, provar a propriedade por caminho absoluto, project_id, containers e portas. Nunca remover volumes ou bancos de outros trabalhos.

## Review Focus

1. Uma flag local não pode autorizar conexão de escrita com produção, financy-dev, hostname externo ou URL parecida com loopback.
2. `supabase start` aplica migrations disponíveis: M1/M2 não podem estar no diretório inicial antes de semear o legado.
3. O ensaio precisa manter o snapshot e o texto integral anteriores a M1; rollback de uma escrita recusada não pode perder cor, dinheiro ou vínculo.
4. Tokens anon locais podem usar formato JWT legado; aceitá-los não significa permitir service_role/secret ou usá-los para testar como administrador.
5. A suíte E2E contém storage keys fixas de financy-dev; o login local precisa usar a chave correta e continuar provando cache/isolamento de contas.

## Arquivos previstos

- Modificar somente para suporte de testes: `tests/fixtures/environment.ts`, `tests/fixtures/supabase.ts`, `src/lib/integration-environment.test.ts`, `src/lib/test-config-environment.test.ts`, `package.json`.
- Adaptar as storage keys literais em `tests/e2e/categories.spec.ts`, `tests/e2e/dashboard.spec.ts`, `tests/e2e/transactions.spec.ts` para um helper validado; preservar as jornadas e assertions existentes.
- Criar `vitest.integration.local.config.ts`, `playwright.backend-local.config.ts`, `vitest.migration.local.config.ts`, `tests/migrations/financial-titles.local.test.ts`.
- Regenerar `src/lib/database.types.ts` pelo banco local, sem ajuste manual de numeric.
- Criar evidências em `docs/superpowers/execution/2026-10-21-financy-pre-merge-validation.md`; atualizar por adendo `docs/operations.md` com os comandos locais efetivamente verificados.
- Configuração efêmera, migrations copiadas, logs e screenshots em `test-fixtures/ux-premerge/<runId>/`, já ignorado. Não versionar credenciais nem arquivos de runtime.
- Migrations e código de produto só recebem correção adicional se um teste revelar defeito; nesse caso reproduzir RED, corrigir a causa e repetir os testes afetados.

## V1 — preparar testes reais com destino local estrito

**Consome:** fixtures/configs atuais; Docker operacional. **Produz:** dois comandos novos e um guard local sem ampliar a autorização dos comandos remotos.

- [ ] Conferir status/SHA das duas pastas, branches/worktrees e referência remota de main. Se main mudou, revisar o diff de base e registrar o impacto antes de prosseguir; preservar mudanças de terceiros.
- [ ] Manter `integrationEnvironment(env)` com seu contrato remoto atual. No mesmo módulo de testes, criar `localIntegrationEnvironment(env)` e `getFinanceTestEnvironment(env)`. Ambos retornam metadados necessários `{url,key,projectRef,storageKey}`; o seletor aceita somente modos explícitos `local` ou o modo remoto já existente. Uma configuração local chama obrigatoriamente o guard local antes de servidor/fixtures.
- [ ] Definir o alvo local como URL **exatamente** `http://127.0.0.1:55321`, `FINANCY_TEST_TARGET=local` e `FINANCY_LOCAL_PROJECT_ID` no formato `financy-ux-premerge-<8 hex de runId>`. Recusar query/path extra, hostname alternativo, outra porta, HTTPS externo e metadados de projeto remoto misturados. Não fazer fallback entre ambientes.
- [ ] Escrever RED para os destinos inválidos acima e produção/dev remoto; recusar chave ausente, `sb_secret_` e JWT com role `service_role`/payload inválido. Aceitar chave publicável local emitida pelo runtime ou JWT anon local. A inspeção de role é uma trava contra uso acidental de chave privilegiada, não validação criptográfica de JWT.
- [ ] GREEN mantendo todos os testes negativos remotos anteriores. Estender `test-config-environment.test.ts` para comprovar que as duas novas configs recusam alvo remoto/ausente antes de efeitos colaterais.
- [ ] Fixtures passam a usar o seletor; manifesto recebe o projectRef real validado, sem literal remoto para execuções locais. Derivar/testar storageKey conforme o SDK: `sb-gorymmpnavtudztnasny-auth-token` no remoto e `sb-127-auth-token` no loopback definido. Reutilizar o helper nos três E2E identificados.
- [ ] Criar configs locais carregando ambiente `validation` e propagando explicitamente modo/projeto/URL/chave aos workers e ao Vite. Ambiente local vem de runtime próprio para arquivo ignorado; não carregar `.env.test.local` remoto como configuração de teste local. Rejeitar variáveis conflitantes herdadas.
- [ ] Vitest local inclui a mesma suíte `tests/integration/**/*.test.ts`, um worker; a configuração de rehearsal inclui somente `tests/migrations/**/*.local.test.ts`. Playwright real local exclui `responsive.spec.ts`, mantém 1440×1000, porta 5173 livre, `--strictPort` e `reuseExistingServer:false`.
- [ ] Adicionar `test:integration:local = vitest run --config vitest.integration.local.config.ts` e `test:e2e:backend-local = playwright test --config playwright.backend-local.config.ts`. `test:ui:local` continua sendo a suíte com mocks; não renomeá-la como prova de banco.
- [ ] Executar `pnpm test src/lib/integration-environment.test.ts src/lib/test-config-environment.test.ts`, `pnpm typecheck` e `pnpm lint`. Esperado: todos passam; nenhum cliente de escrita chega a destino remoto. Revisar/registrar commit da unidade.

## V2 — ensaiar M1/M2 em Supabase descartável real

**Consome:** guard/fixtures V1. **Produz:** evidência de transição legada, persistência, catálogo e aplicação limpa; nenhuma mudança remota.

- [ ] Criar runId e diretório absoluto próprio em `test-fixtures/ux-premerge/<runId>`. Inventariar containers/portas novamente. Copiar o config local para `supabase/config.toml` desse diretório, com project_id único acima; API 55321, DB 55322 e shadow 55320. Se ocupadas, parar e reconciliar o alvo; não deslocar a URL silenciosamente.
- [ ] Inicialmente copiar somente `20261015182208_financy_core.sql`, `20261016183142_financy_transaction_conflicts.sql`, `20261016190434_financy_dashboard.sql`. Não editar seus bytes; M1/M2 ainda ficam fora do diretório staged.
- [ ] Iniciar via `pnpm dlx supabase@2.121.0 start --workdir <diretório absoluto próprio>`. Pode excluir serviços não usados com o `--exclude` documentado; manter PostgreSQL/Auth/gateway/PostgREST. Resolver portas extras do template ou desabilitar seus serviços na configuração efêmera. Não usar `--ignore-health-check`. Download inicial de imagens e recursos disponíveis podem limitar esta etapa.
- [ ] Confirmar health, project_id, containers/volumes e endpoints locais por status/catálogo. Obter apenas as credenciais públicas locais necessárias, sem imprimir o conteúdo de status sensível. Ausência de estado saudável bloqueia testes; Docker hello-world não substitui este gate.
- [ ] Implementar o rehearsal em um único processo Vitest para manter as duas sessões e credenciais em memória durante a troca de schema. O controlador só copia M1/M2 e chama `migration up --local --workdir <alvo próprio>`; não oferece destino arbitrário. Usar as fixtures existentes; antes de M2, semear via Data API com payload antigo explícito, sem `categories.description`.
- [ ] Antes de M1, criar apenas fixtures próprias com categoria/transação de 80 pontos de código e dinheiro `9007199254740993.01`. Registrar IDs/runId; manter o texto e snapshot esperados em memória. Conferir somente as três versões antigas no histórico local.
- [ ] Copiar M1 `20261020165607_financial_titles.sql` para o staged e aplicar uma vez. Assert: texto integral antes/depois idêntico, CHECKs nomeados presentes e `convalidated=false` onde existe legado. Cor/valor isolados em linha legada são recusados sem perda; título corrigido salva; transação válida pode usar categoria legada.
- [ ] Com cliente público e JWTs reais: 19/20 aceitos e 21 recusados em ambas as tabelas e RPCs save/change; incluir 20/21 emojis, NBSP/FEFF/tab, acento composto/decomposto e espaços internos. Snapshot original integral corrige a linha uma vez; snapshot concorrente é recusado.
- [ ] Copiar M2 `20261020165709_category_description.sql` e aplicar uma vez. Assert: categoria anterior recebe null; criar/editar/limpar descrição e recarregar preservam string/null; descrição acima de 20 é aceita; transações embutidas e os dois JSONs do dashboard retornam o campo correto e dinheiro textual exato.
- [ ] Conferir RLS com Alice/Bob/anônimo por clientes públicos e grants/trigger/CHECK/FK/SECURITY INVOKER por catálogo local. Só o novo INSERT/UPDATE(description) deve ampliar ACLs; não testar operações do usuário como service_role. Confirmar que mutações não afetam o outro proprietário.
- [ ] Limpar apenas fixtures próprias e revogar suas sessões. Para provar o caminho sem legado, preparar aplicação integral em banco vazio: reset **somente** do alvo descartável próprio, após reconfirmar identidade e preservação de evidências. `db reset --local --no-seed --workdir <alvo próprio>` deve aplicar as cinco migrations e validar os dois CHECKs sem violações. Não resetar um banco já usado por outra tarefa.
- [ ] Registrar saída/exit code/versões e assertions nos logs ignorados e resumir no novo execution log. Se o rehearsal retomou depois de M1 já aplicada, criar novo alvo descartável; não afrouxar/remover constraints para semear legado. Falha vira teste RED e correção mínima; nunca reaplicar SQL antigo cegamente.

## V3 — regenerar tipos a partir do schema validado

**Consome:** schema M1/M2 saudável, V2 verde. **Produz:** tipos efetivamente gerados e diff revisado.

- [ ] Executar `pnpm dlx supabase@2.121.0 gen types --local --lang typescript --schema public --workdir <alvo próprio>` para arquivo temporário ignorado, separado de stderr. Não sobrescrever o arquivo de produto se o comando falhar, produzir arquivo vazio ou misturar logs no TypeScript.
- [ ] Revisar o resultado contra `src/lib/database.types.ts`; só então substituir pelo conteúdo gerado. Esperado: description nullable em Row, opcional nullable em Insert/Update; numeric continua number na representação gerada. Não converter dinheiro de domínio em Number/parseFloat para satisfazer o tipo.
- [ ] Explicar diferenças de metadados/versionamento do gerador, se houver, e conferir assinaturas das três RPCs e FK composta. Mudança inesperada de schema bloqueia o gate, em vez de ser removida manualmente do arquivo gerado.
- [ ] Executar typecheck, unitários de APIs/money/dates e lint. Revisar diff/commit. A anotação anterior de “delta manual” só é encerrada no registro novo depois dessa prova.

## V4 — regressão com backend real e revisão da interface

**Consome:** V1–V3 verdes e runtime saudável. **Produz:** resultados novos da candidata, capturas revisadas e lacunas manuais explícitas.

- [ ] Executar uma suíte de escrita por vez, com a configuração estritamente local. Na branch estabilizada: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:integration:local`, `pnpm test:e2e:backend-local`, `pnpm test:ui:local`, `pnpm build`.
- [ ] Usar a suíte completa real de categories/transactions/dashboard/integrity/security e Auth/CRUD/E2E já existente. Confirmar create/edit/clear/reload, contagens e invalidação, reclassificação/exclusão protegida, conflito concorrente e logout/troca de conta sem dados ou respostas atrasadas da conta anterior. Acrescentar somente assertions faltantes nas jornadas existentes.
- [ ] Registrar novas contagens reais; não exigir que sejam iguais às antigas após acrescentar testes de guard/rehearsal. Nenhum resultado de mock substitui integração, RLS ou persistência.
- [ ] Rodar browser e build em sequência. Não editar arquivos durante Playwright/Vite; a implementação anterior já encontrou recarga concorrente interferindo no cenário atrasado.
- [ ] Revisar screenshots e geometria em 320/375/390/768/1024/1440. Confirmar centros/bordas dentro de 2 px, ações 44×44, detalhes completos e ausência de overflow global; fixture extrema mantém títulos legados, categoria sem espaços e valor acima do limite seguro JS.
- [ ] Exercitar Tab/Shift-Tab, Enter/Espaço, Escape, trap, foco no primeiro inválido, busy bloqueando repetição/fechamento e restauração de foco em todos os diálogos, inclusive com troca de breakpoint.
- [ ] Fazer zoom **nativo do navegador** em 200%/400%, sem CSS zoom/transform, e retrato/paisagem com modal baixo. Se houver aparelho real acessível no ambiente autorizado, testar Safari iOS/Chrome Android, teclado virtual e autofill. Não expor serviços na rede apenas para fabricar essa evidência.
- [ ] Sem aparelho disponível, marcar “não executado”, risco e responsável pela validação; a revisão humana deve aceitar explicitamente a lacuna antes do merge. Não confundir Chromium com touch com hardware real.
- [ ] Corrigir defeitos encontrados por reprodução RED→GREEN, repetir afetados e rodar a regressão estabilizada. Atualizar operações e o novo execution log, preservando o histórico de 20/10.

## V5 — revisão e decisão sobre merge

**Consome:** evidências atuais V1–V4 e diff final. **Produz:** candidata revisável, sem integração automática.

- [ ] Revisar a unidade inteira contra R1–R6 e o Review Focus: código conectado, migrações, fixtures, configs, dinheiro, datas, URLs, cache e autorização. Registrar severidade, correção ou justificativa dos achados; nenhuma mudança de grant além da coluna aprovada.
- [ ] Conferir diff contra main reconfirmada e conflitos. Se a base tiver mudado, resolver/revalidar o que ela afetar na branch; não executar merge em main nesta etapa.
- [ ] Apresentar revisão humana do diff e das capturas. Revisor independente somente se autorizado; auto-revisão deve ser identificada como tal. Encerrar bloqueios importantes antes de recomendar integração.
- [ ] Registrar SHA final, comandos/exit codes, schema/histórico, ensaio legado e aplicação limpa, tipos gerados, cleanup de fixtures/sessões e exceções manuais aceitas.
- [ ] Parar e entregar o resultado. Só depois de autorização explícita: integrar a revisão aprovada e conferir o SHA/conteúdo integrado. Push, migrations remotas e publicação continuam operações separadas; não decorrem do merge.
- [ ] Preservar worktree e evidências necessárias. Encerrar/remover apenas containers/volumes deste run após verificar sua identidade; não arquivar o worktree antes de preservar e confirmar a integração.

## Gate para recomendar o merge

- [ ] Supabase local saudável, com alvo e ownership comprovados.
- [ ] Rehearsal legado e aplicação limpa das cinco migrations verdes; RLS/grants/FK/RPCs conferidos.
- [ ] Tipos regenerados do schema, com diff revisado e dinheiro textual preservado.
- [ ] Unitários, integração real, E2E real, geometria e build verdes na candidata estabilizada.
- [ ] Zoom/teclado/foco revisados; aparelho real verificado ou lacuna explicitamente aceita.
- [ ] Revisão humana concluída; sem achados importantes abertos; main/base/SHA reconfirmados.
- [ ] Autorização posterior de integração recebida. Docker funcionando isoladamente não libera o merge.

## Auto-revisão e limites deste plano

Cobertura: pendência de banco → V1/V2; tipos → V3; integração/E2E e dispositivo/zoom → V4; diff/capturas/aprovação → V5. Cada interface proposta tem produtor e consumidor. Não é um novo redesign nem nova arquitetura de produção; configurações extras limitam o destino das provas que faltam.

Nesta preparação só foram executados diagnóstico Docker/WSL, hello-world, inventário de containers, consultas de Git/arquivos e `--help` do CLI. Não foram iniciados Supabase, migrations, fixtures financeiras, novos testes do Financy, geração de tipos, merge ou publicação. O único novo arquivo de trabalho é este plano, não commitado para revisão.

CLI 2.121.0 confirmou nesta data `start --exclude`, `migration up --local`, `db reset --local --no-seed` e `gen types --local --lang typescript --schema`; `--workdir` permite apontar o diretório próprio sem descobrir um projeto ancestral. Referências oficiais: [workflow local](https://supabase.com/docs/guides/local-development/cli-workflows), [migrations](https://supabase.com/docs/guides/local-development/database-migrations). A versão realmente instalada e o help devem ser reconferidos se a execução futura mudar de ambiente.
