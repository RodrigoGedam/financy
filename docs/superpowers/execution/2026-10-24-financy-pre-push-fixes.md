# Financy — correções antes do push

Data: 24/10/2026. Pedido: realizar os ajustes identificados na [revisão anterior](../reviews/2026-10-24-financy-pre-push.md). Escopo local: código, formatação, privacidade do histórico e verificações. Sem push, deploy ou alteração de Supabase remoto.

## Resultado

Os achados foram tratados: iniciais Unicode corrigidas, formatação aprovada e 14 commits locais anonimizados. A verificação atual passou em **190 testes unitários e 13 testes de interface**, além de lint, typecheck, build e Prettier. A auditoria das dependências de produção retornou zero vulnerabilidades conhecidas.

## Alterações

| Ponto                  | Correção e evidência                                                                                                                                                                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Iniciais Unicode       | `src/components/app-shell.tsx` e `src/features/auth/profile-page.tsx` extraem o primeiro ponto de código com `[...part][0]`. Preservadas as duas iniciais, a conversão de maiúsculas e o fallback existentes; sem dependência nova                                |
| Regressão de interface | `tests/e2e/responsive.spec.ts` aceita um nome na fixture e verifica os dois avatares com `👩 𠀀`. Antes da correção recebeu `��`; após a correção recebeu `👩𠀀` nos dois componentes                                                                             |
| Formatação             | Aplicado Prettier nos arquivos do projeto que divergiam, preservando `useTabs: true`, `tabWidth: 4`, aspas simples e ausência de ponto e vírgula. O diff rastreado teve 79 arquivos antes dos documentos desta entrega, predominantemente por formatação          |
| Finais de linha        | Acrescentado `endOfLine: auto` à configuração: o checkout Windows usa `core.autocrlf=true`. Dois documentos com mistura CRLF/LF foram normalizados; a checagem completa ficou verde                                                                               |
| Teste do catálogo      | O alinhamento das tabelas Markdown expôs dependência de exatamente um espaço em `src/config/category-options.test.ts`. A leitura agora aceita espaços horizontais e compara a primeira célula após `trim()`, mantendo chaves, ordem, tokens de cor e contrato SQL |

Não foram alterados regras financeiras, consultas, cache, permissões, migrations, tipos de banco, dependências ou versões. A revisão independente confirmou equivalência das demais alterações de código após normalização com Prettier. A correção de iniciais trata pontos de código; não amplia o escopo para segmentação de grafemas compostos.

## Privacidade e Git

Antes de editar o produto foi criada `codex/pre-push-fixes` no checkout atual. O estado inicial não tinha alterações rastreadas ou no index; os documentos locais e o relatório anterior foram preservados.

O remoto foi reconferido por `git ls-remote`: somente `main` em `359a1857ad37e87c576fd03a71d85af03984a776`, sem outras branches/tags anunciadas. Assim, os 14 commits posteriores ainda não estavam publicados.

A identidade noreply da base publicada foi reutilizada somente na configuração deste repositório e nos campos de autor/committer dos 14 commits locais. Não houve alteração de configuração global. O endereço pessoal não foi reproduzido em documentos nem logs.

| Verificação da anonimização | Resultado                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Tip original                | `1f2ba55f66b54aea34b9fae60a15362fb6d342ad`                                                                                                 |
| Tip equivalente anonimizado | `418cff1e91f0b87a67cdd6838f732163f14bbf22`                                                                                                 |
| Conteúdo dos commits        | Árvores, mensagens brutas, nomes, datas, demais headers e sequência de pais preservados; somente e-mails e parents encadeados substituídos |
| Identidades no intervalo    | 28/28 campos noreply; nenhum campo não anonimizado remanescente                                                                            |
| Segurança da operação       | Ensaio sem escrita, reconferências remotas, comparação dos objetos e atualização transacional das duas branches com SHA antigo esperado    |
| Estado dos arquivos         | Index, status e bytes dos arquivos conferidos antes/depois da anonimização; a operação não alterou o trabalho pendente                     |
| Recuperação                 | Nova referência privada `refs/financy-private/pre-push-2026-10-24`; referência privada anterior preservada                                 |

O mapa dos 14 pares de SHAs e o script de operação ficaram em `.superpowers/pre-push/`, ignorado pelo Git. O primeiro ensaio abortou porque sua fixture sintética continha NUL, recusado pelo próprio Git; a fixture foi corrigida, o ensaio passou e só então a operação foi aplicada. O aborto não atualizou refs nem configuração.

A integração local das correções usa a branch criada e fast-forward de `main`, após revisão e checks; não requer reescrever a base publicada. Qualquer publicação futura deve enviar somente a branch desejada, com refspec explícito. **Não enviar referências privadas, `--all` ou `--mirror`.**

## Documentos locais

`docs/prompt-atualizacoes-ux-mobile-first.md` permaneceu idêntico byte a byte. `docs/prompts-execucao-ux-responsive.md` recebeu somente a formatação apontada pelo Prettier. Ambos permanecem não rastreados e fora do commit das correções.

Os originais têm cópia byte a byte em base64 e SHA-256 no arquivo ignorado `.superpowers/backups/2026-10-24-pre-push/local-documents.json`. A integridade dessas cópias foi conferida. Nenhum documento local foi descartado.

## Verificações desta entrega

| Comando/checagem                                                 | Resultado obtido                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Regressão Unicode antes da correção                              | 1 falha esperada por avatar `��`, reproduzida no navegador real com respostas fictícias           |
| Regressão Unicode após a correção                                | 1/1 passou, nos dois avatares                                                                     |
| Teste do catálogo após ajuste do parser                          | 1/1 passou                                                                                        |
| `pnpm test`                                                      | 190/190 passaram em 13 arquivos                                                                   |
| `pnpm lint`                                                      | Passou                                                                                            |
| `pnpm typecheck`                                                 | Passou                                                                                            |
| `pnpm build`                                                     | Passou; maior chunk JavaScript aproximadamente 321 kB antes de gzip                               |
| `pnpm format:check`                                              | Passou no checkout completo, incluindo os documentos locais                                       |
| `pnpm test:ui:local --reporter=line`                             | 13/13 passaram; execução de 1,4 min, servidor/navegador locais com permissão de execução adequada |
| `pnpm audit --prod --json --registry https://registry.npmjs.org` | Exit 0; zero advisories e zero vulnerabilidades reportadas nas dependências de produção           |
| `git diff --check`                                               | Passou                                                                                            |

A suíte visual não exigiu mudança de config ou relaxamento de guards. O rerun com execução local autorizada iniciou o servidor e concluiu os cenários. O prefixo `$ vite` é saída normal do pnpm instalado, não indício de outro runtime.

Os testes de interface exercitaram os tamanhos representativos de 320–1440 px, alinhamento de tabela e dashboard, toque simulado, teclado/foco, detalhes de conteúdo completo, formulários de categorias e estados vazio/erro/carregando. As capturas foram renovadas em `test-fixtures/ux-responsive/`, ignorado pelo Git. Elas são evidência para inspeção, não comparação automática com baseline visual nem ensaio em aparelho físico.

## Publicação e limites

O inventário específico de conexões Git do Vercel não lista `financy` entre os projetos vinculados da equipe correta, corroborando o guia operacional. A presença do projeto foi confirmada separadamente. Não houve inspeção de todas as automações externas; metadados de commit de um deployment antigo não provam vínculo ativo.

O frontend atual continua dependente das migrations `20261020165607_financial_titles.sql` e `20261020165709_category_description.sql` antes de um futuro deploy, conforme `docs/operations.md`. **Push de código e deploy são operações distintas.** Aplicação remota exige tarefa autorizada própria; esta entrega não reaplicou nem alterou migrations.

Não repeti integrações de escrita em Supabase real, não alterei banco/Auth, não fiz teste em aparelho físico nem auditoria WCAG completa. O grafo foi usado para localizar os dois consumidores de iniciais e confirmado no código; não foi reconstruído apenas por formatação ou mudança de SHAs.
