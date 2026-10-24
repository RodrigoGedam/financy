# Financy — revisão antes do push

Data: 24/10/2026. Revisão de leitura, com verificações locais, sem correções, commits, push, deploy ou aplicação de migrations.

Correções posteriores autorizadas pelo usuário: [registro dos ajustes e das verificações](../execution/2026-10-24-financy-pre-push-fixes.md). Os achados e resultados abaixo preservam o estado anterior às correções.

## Veredito

**Recomendo aguardar o push público para resolver a exposição do e-mail nos commits novos.** A release anterior adotou autoria anonimizada, mas os 14 commits posteriores à referência local de `origin/main` voltaram a conter um endereço não anonimizado. Não encontrei defeito crítico nos fluxos financeiros revisados. Unitários, lint, typecheck e build passaram nesta rodada.

A formatação também precisa de atenção: a regra de tabs com largura 4 está configurada, mas `format:check` falhou. Há ainda um defeito visual pequeno nas iniciais de alguns nomes Unicode. As duas migrations novas são uma dependência de **deploy**, não uma exigência para armazenar o código no GitHub.

## Estado conferido

| Item                        | Evidência desta revisão                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checkout                    | `main`, HEAD `1f2ba55f66b54aea34b9fae60a15362fb6d342ad`                                                                                                             |
| Referência local do remoto  | `origin/main` em `359a1857ad37e87c576fd03a71d85af03984a776`; comparação local: 0 commits atrás e 14 à frente                                                        |
| Conteúdo do intervalo       | 51 arquivos alterados; nenhum diff rastreado pendente no checkout ou no index                                                                                       |
| Arquivos locais preservados | `docs/prompt-atualizacoes-ux-mobile-first.md` e `docs/prompts-execucao-ux-responsive.md`, não rastreados ao iniciar                                                 |
| GitHub atual                | O conector encontrou a branch `main`, mas não retornou seu SHA. `git ls-remote` falhou por resolução de DNS; não foi possível atualizar a comparação com o servidor |
| Grafo                       | 501 nós, 1.112 relações, 25 grupos; `built_at_commit` coincide com o HEAD revisado                                                                                  |

Os 14 commits são relativos à referência **local** do remoto. Antes de qualquer alteração de histórico, é indispensável reconferir o SHA remoto e identificar o intervalo efetivamente não publicado. Este relatório acrescenta somente um documento de revisão; os dois documentos locais anteriores não foram alterados.

## Achados e ações proporcionais

### 1. Antes do push público: preservar a anonimização da autoria

**Prioridade alta de privacidade.** Os 14 commits do intervalo local `origin/main..HEAD`, de `2f9ec31` a `1f2ba55`, contêm um único e-mail não anonimizado em 28 campos de autor/committer. Ele coincide com a configuração local de autoria. O endereço e seu domínio não são reproduzidos aqui.

Isso importa porque o [registro da release anterior](../execution/2026-10-17-financy-release.md:48) documenta a anonimização da cadeia publicável. `.gitignore` não remove metadados dos objetos Git, e alterar apenas a identidade dos próximos commits não corrige os anteriores.

A menor ação futura é confirmar o estado remoto, obter autorização para ajustar somente a cadeia ainda não publicada e usar a identidade noreply já verificada do proprietário. Preservar árvores e conteúdo dos arquivos, registrar a correspondência dos SHAs e conferir a cadeia final antes do envio. Também ajustar a autoria dos próximos commits para evitar recorrência. **Nada disso foi executado nesta revisão.** Não pressupor necessidade de force-push, pois o estado remoto atual não foi confirmado.

A referência local de recuperação `refs/financy-private/pre-anonymization` ainda existe. Ela deve permanecer privada; não enviar referências indiscriminadamente com mirror ou equivalente.

### 2. Antes do push, recomendado: cumprir a regra de formatação existente

**Pendência de conformidade, sem falha funcional demonstrada.** [.prettierrc.json](../../../.prettierrc.json:1) já define `useTabs: true` e `tabWidth: 4`, além de aspas simples e ausência de ponto e vírgula. Entretanto, `pnpm format:check` encerrou com código 1 e informou **84 arquivos** fora do padrão: 83 rastreados e o documento local `docs/prompts-execucao-ux-responsive.md`.

Há ocorrências em componentes, APIs, testes, configurações e Markdown, por exemplo [app-shell.tsx](../../../src/components/app-shell.tsx:8), [categories/api.ts](../../../src/features/categories/api.ts:30) e [package.json](../../../package.json:1). Não é necessário instalar outro formatter nem alterar a regra aprovada.

A menor ação futura é formatar os arquivos rastreados pertinentes com a configuração atual, revisar o diff e repetir `format:check` e os checks apropriados. Evitar aplicar `format --write .` indiscriminadamente aos documentos locais do usuário. Esta revisão não alterou a formatação e não atribui toda a divergência aos commits novos.

### 3. Correção pequena, opcional antes do push: iniciais Unicode inválidas

**Prioridade baixa, visual.** [app-shell.tsx:8](../../../src/components/app-shell.tsx:8) e [profile-page.tsx:34](../../../src/features/auth/profile-page.tsx:34) usam `part[0]` para extrair a inicial. Esse acesso retorna uma unidade UTF-16. Em nomes aceitos como `𠀀 Silva` ou `👩 Ana`, a inicial pode ser um surrogate isolado, exibido como `�` no avatar.

Uma reprodução local, sem modificar arquivos, confirmou o surrogate isolado. A menor correção futura é iterar por pontos de código nos dois pontos existentes, com uma regressão focada; não exige biblioteca de segmentação. Não afeta valores, autenticação ou dados salvos e não bloqueia o push por si só.

## Banco e publicação: separar do push

O frontend atual seleciona `categories.description` em [categories/api.ts:30](../../../src/features/categories/api.ts:30) e [transactions/api.ts:64](../../../src/features/transactions/api.ts:64), e o dashboard exige o contrato correspondente de sua RPC. Ele depende, nesta ordem, de:

1. [20261020165607_financial_titles.sql](../../../supabase/migrations/20261020165607_financial_titles.sql:1): normalização e limites dos títulos, preservando legado e validação condicional dos CHECKs.
2. [20261020165709_category_description.sql](../../../supabase/migrations/20261020165709_category_description.sql:1): coluna opcional, grants restritos e atualização da resposta do dashboard.

[operations.md](../../operations.md:121) estabelece banco antes do frontend. Seus registros de 22–23/10 confirmam que o ensaio local de legado, a aplicação limpa, a regeneração de tipos e as verificações de backend já foram concluídos. **Essas etapas não continuam pendentes por causa dos registros históricos anteriores.**

Os documentos não registram aplicação remota dessas duas migrations. A tentativa desta revisão de confirmar o catálogo de produção, somente por SELECT, retornou banco indisponível. Portanto, não afirmo que o schema remoto foi conferido hoje. Antes de publicar este bundle, reconferir o alvo, histórico e schema; qualquer aplicação em produção exige autorização específica. Não truncar legado, reaplicar migrations antigas nem desfazer proteções num rollback de frontend.

O [guia operacional](../../operations.md:3) registra ausência de integração Git automática com Vercel. O projeto Vercel foi acessível nesta revisão, mas a resposta disponível não incluía o vínculo Git; não foi possível reconfirmá-lo. **Antes do push, confirmar que ele não disparará um deploy do frontend contra um banco ainda incompatível.** Isso é uma verificação de publicação, não autorização para migrar ou implantar.

## Cobertura da revisão

Foram confrontados README, DESIGN, operação, especificações/planos vigentes e registros recentes com os consumidores reais do código. O Graphify orientou o rastreio de autenticação, cache, dinheiro, categorias, transações, ambientes, migrations e verificação; as conclusões foram confirmadas nos arquivos, não apenas nas relações do grafo. Houve três revisões independentes de dados, frontend e preparação do Git.

| Área                            | Resultado da leitura                                                                                                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dinheiro e calendário           | Conversão textual/exata e regras existentes preservadas; não identifiquei nova conversão financeira insegura                                                                                                             |
| Categorias e transações         | Descrição opcional, normalização, títulos, edição de legado e snapshots de conflito coerentes entre tipos, API e migrations                                                                                              |
| RLS e vínculos                  | Políticas, grants, FKs e RPCs revisados; não identifiquei ampliação indevida de acesso no código SQL                                                                                                                     |
| Sessão e cache                  | Queries incluem identidade da conta; limpeza/invalidação e troca de sessão têm cobertura local                                                                                                                           |
| Interface                       | Shell, autenticação/perfil, categorias, dashboard, transações, detalhes, modais, filtros e paginação revisados; achado concreto de iniciais descrito acima                                                               |
| Segredos e arquivos publicáveis | Inspeção do HEAD e dos commits novos: 275 objetos/165 blobs textuais únicos no escopo analisado, sem credencial administrativa real identificada. Ocorrências de chave/JWT de teste conferidas como fixtures deliberadas |
| Exclusões                       | Ambientes reais, fixtures, resultados, build, grafo e arquivos transitórios continuam ignorados; somente `.env.example` vazio é rastreado                                                                                |
| Dependências                    | 30/30 especificadores do manifesto correspondem ao lockfile; não há alteração de dependências no intervalo revisado                                                                                                      |

A varredura de padrões e a leitura não constituem garantia universal de ausência de segredos. Referências privadas de recuperação não devem ser publicadas.

## Verificações executadas em 24/10

| Verificação                           | Resultado obtido                                                                                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`                           | **Passou: 190 testes em 13 arquivos**                                                                                                                                  |
| `pnpm lint`                           | **Passou**                                                                                                                                                             |
| `pnpm typecheck`                      | **Passou**                                                                                                                                                             |
| `pnpm build`                          | **Passou**; maior chunk JavaScript de aproximadamente 321 kB antes de gzip                                                                                             |
| `git diff --check origin/main...HEAD` | **Passou**                                                                                                                                                             |
| `pnpm format:check`                   | **Falhou: 84 arquivos fora do padrão**                                                                                                                                 |
| `pnpm test:ui:local`                  | **Inconclusivo**: ficou na inicialização do servidor local, sem resultado de cenários; execução interrompida. Não atribuo isso a um defeito do produto sem diagnóstico |
| `pnpm audit --prod --json`            | **Indisponível**: resposta inválida do endpoint de auditoria (`ERR_PNPM_AUDIT_BAD_RESPONSE`); nenhum parecer atualizado sobre vulnerabilidades foi obtido              |

Não houve execução de suítes que escrevem em Supabase remoto. Os registros de 22–23/10 reportam 21 testes de integração, 15 E2E de backend, 12 responsivos e zoom nativo 200%/400% aprovados, mas são **evidências históricas**, não resultados reproduzidos nesta rodada. As capturas locais encontradas também eram de 23/10. O helper de screenshots em [responsive.spec.ts](../../../tests/e2e/responsive.spec.ts:47) salva evidências, sem comparação automática com baseline visual.

## Decisão sugerida

1. Resolver a privacidade do histórico publicável após reconferir o remoto, preservando conteúdo e referências privadas.
2. Regularizar a formatação existente em uma alteração revisável; a correção das iniciais pode acompanhar uma mudança pequena posterior.
3. Concluir uma execução responsiva local antes de declarar a verificação atual completa e confirmar a ausência de deploy automático incompatível. Aplicar migrations e publicar somente em tarefa própria autorizada.

Não fiz correções, commit/push, deploy, migrations nem escrita em banco remoto. Ficaram sem verificação atual a suíte visual, o backend real, o SHA remoto, o schema de produção, a auditoria de vulnerabilidades e aparelho físico; a avaliação não equivale a uma auditoria WCAG completa.
