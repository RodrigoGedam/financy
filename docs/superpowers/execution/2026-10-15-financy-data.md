# Financy — tarefa 2: integridade e autorização

Concluída em 15/10/2026, base `5c27730`, branch `feat/financy-v1`. Escopo: prompt 2, validado em desenvolvimento. Sem commit, push ou publicação; produção fora desta etapa.

## Inspeção e decisões

- Desenvolvimento confirmado via MCP: `gorymmpnavtudztnasny`, `financy-dev`, `ACTIVE_HEALTHY`, PostgreSQL 17.11. Sem tabelas em `public`, sem migrations remotas e sem diretório local `supabase` na inspeção inicial.
- Privilégios padrão de tabelas/funções ainda concedem acesso a anon/authenticated/service_role. Cada objeto novo terá grants revogados explicitamente e somente os necessários restaurados, junto de RLS.
- Catálogo de `DESIGN.md`: 7 cores e 16 ícones. Não criar descrição de categoria nem módulo visual.
- Ruling: continuar no checkout/branch da execução nativa aprovada, preservando DESIGN.md, guia e registro de catálogo não commitados; não criar checkout que perderia esse pré-requisito local.
- Ruling: aplicar somente a tarefa 2 solicitada; o registro versionável abaixo substitui a burocracia de commits/workspaces temporários da skill. Sem commit/push/publicação. A revisão final cobre o diff desta tarefa.
- Baseline: Vitest 1/1 passou. CLI ausente do PATH; primeira tentativa de download falhou por DNS do sandbox, repetida com acesso de rede autorizado. Sem adicionar dependência ao package.json.
- Fonte oficial PostgREST confirma `select=amount::text`; a documentação hospedada retornou 429, consultado o arquivo oficial no GitHub. Compatibilidade real será testada, sem usar cast TypeScript para disfarçar precisão.

## Implementação e histórico

- Migration real gerada pelo CLI 2.121.0: `supabase/migrations/20261015182208_financy_core.sql`. Cria somente `categories`, `transactions`, índices necessários, trigger privado e RPC textual de escrita. Não cria categorias iniciais nem telas.
- CLI consultado com `--help` e subcomandos `migration`, `db`, `gen`. `db push --dry-run --skip-vault --project-ref gorymmpnavtudztnasny --agent yes` ficou bloqueado por `AccessTokenRequiredError`; o MCP já estava autenticado. Nenhuma migration foi aplicada pelo CLI.
- O SQL exato do arquivo foi aplicado **uma vez** pelo MCP `apply_migration`, nome `financy_core`. O MCP atribuiu versão `20261015182533`. Após comparar o conteúdo completo, foi atualizado somente o identificador do histórico para `20261015182208`, com guarda por nome, versão anterior, uma declaração registrada e hash. Não houve segunda aplicação do schema. Histórico remoto final contém uma migration; MD5 do SQL local/remoto (texto sem espaços externos): `de0ab7e420cb311bac01c25327d6aaa9`.
- Dono obrigatório com default `auth.uid()`, FK para Auth, identidade/criação geradas pelo banco e protegidas por grants de coluna e trigger. FK composta `(user_id,category_id)` referencia `(user_id,id)` e restringe exclusão. Nome normalizado com `btrim`, único por usuário com `lower(btrim(name))`; conteúdo vazio e catálogo arbitrário recusados.
- Dinheiro usa `numeric` sem typmod (`atttypmod=-1`), positivo, finito e escala de entrada até dois; trigger valida antes de canonizar para duas casas. Sem teto monetário de aplicação. Datas finitas, hoje/passado pela referência `America/Sao_Paulo`; tipo `date` valida calendário.
- RLS nas duas tabelas: oito policies para `authenticated`, com `USING` para linha existente e `WITH CHECK` para linha resultante no update. Auditoria de privilégios confirmou SELECT/DELETE de tabela e INSERT/UPDATE somente nas colunas necessárias; nenhum grant nessas tabelas para anon/PUBLIC/service_role. Dono pode ser fornecido no insert, mas policy exige o usuário da sessão; não pode ser atualizado.
- Funções `SECURITY INVOKER`, `search_path=''`, objetos qualificados. Trigger sem EXECUTE concedido aos clientes; RPC `save_transaction` executável somente por authenticated (além do proprietário administrativo). Não há view ou uso de metadata para autorização.
- `src/lib/database.types.ts` gerado pelo MCP a partir do schema aplicado, sem edição das representações de tipos; cliente existente usa `createClient<Database>`. Tipos de domínio de categorias/transações/dashboard e módulo visual ficam para consumidores reais, conforme instrução atual, em vez de scaffolding dos exemplos do plano.

## Transporte monetário real

O gerador retorna `numeric` como `number`: um insert tipado direto pelo SDK não aceita o texto exigido pelo domínio. Foi criada a fronteira mínima necessária `save_transaction(p_amount text, ...) returns uuid`, com RLS preservado e sem parâmetros de dono/identidade/criação para inserção. Tanto gravação quanto alteração pelo SDK foram exercitadas. Leitura usa `select('id,amount::text')`, inferida como string pelo SDK, sem cast TypeScript.

A API aceitou escrita textual e devolveu `1.00`, `1.20`, `0.01` e **`9007199254740993.01`** exatamente. A RPC gravou esse último valor e atualizou para `0.01`; Bob/anônimo e valor `1.001` foram recusados, com registro original preservado. Não usar o select numérico padrão nem converter dinheiro com `Number`/`parseFloat` nos próximos consumidores.

Fontes: [segurança da Data API](https://supabase.com/docs/guides/api/securing-your-api), [mudança dos grants padrão](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically), [documentação oficial PostgREST sobre casts na seleção](https://github.com/PostgREST/postgrest/blob/main/docs/references/api/tables_views.rst). A decisão foi confirmada na versão real do SDK 2.117.3 e PostgREST 14.18 do projeto, além da documentação.

## Verificação e limpeza

| Verificação | Resultado |
| --- | --- |
| Baseline unitário | 1/1 passou |
| Integração RED antes da migration | 9 falhas por `PGRST205`, schema ausente; teste adicional da RPC também falhou por schema ausente (demais pulados não contam como aprovados) |
| Integração após migration | 10/10 passaram |
| Integração com Database conectado ao cliente | 10/10 passaram, 21,21 s |
| Integridade após reforçar asserts de update recusado | 6/6 passaram, 11,43 s; segurança permaneceu na execução completa anterior |
| `pnpm typecheck` | Passou após corrigir nulidade do retorno de signup na fixture |
| `pnpm lint` | Passou |
| `pnpm test` | 2/2 passaram, incluindo trava do ambiente |
| `pnpm build` | Passou; chunk principal 572,40 kB, gzip 169,10 kB; aviso preexistente acima de 500 kB |
| Auditoria SQL remota | RLS, policies, grants por coluna, permissões/search_path de funções, constraints, typmod e histórico conferidos |
| Revisão independente | Sem achados bloqueadores; condicionada aos checks e à limpeza confirmados nesta execução |

Testes cobrem CRUD próprio, isolamento simétrico Alice/Bob, anônimo, dono forjado/reassociado, identidade/criação fornecidas, categoria alheia/inexistente/utilizada, unicidade, catálogo, campos vazios/nulos, dinheiro inválido, calendário/data futura e tipo inválido. Mutations RLS com HTTP de sucesso e zero linhas são verificadas relendo o original; recusas de FK, dinheiro, data e unicidade também preservam a linha original.

As operações sob teste usam chave publicável e JWTs reais de signup, sem `service_role`. Configuração de integração separada, serial e com trava por URL/ref exatos de desenvolvimento antes da rede. A fixture remove suas linhas em ordem transações → categorias e faz logout global. O manifesto ignorado `test-results/finance-users.jsonl` contém somente IDs, project-ref e runId.

Limpeza administrativa separada pelo MCP: manifesto validado com 16 IDs únicos de oito execuções, todos com e-mail exato Alice/Bob correspondente ao runId; zero divergências. Antes de excluir Auth havia zero categorias, transações e sessões desses IDs. Removidas exatamente as 16 contas registradas, com guardas por ID/e-mail e ausência de dependências; nenhum dado externo ao manifesto removido. Conferência posterior: zero usuários, sessões e linhas financeiras das fixtures; ambas as tabelas financeiras vazias.

Limite da fixture: se um POST se efetivar e a resposta se perder, a linha pode não entrar em `track()`. A auditoria final por todos os IDs dos usuários recém-criados cobre esse caso nesta execução; não considerar `cleanup()` sozinho prova de ausência de resíduos. Em próximas execuções, repetir essa conferência restrita antes de remover as contas Auth.

## Limites e próxima etapa

O advisor de segurança retornou somente o aviso já existente de proteção contra senhas vazadas desativada em Auth; configuração fora do escopo, não alterada. [Referência do Supabase](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Não executados: reset/replay local com Docker, push/dry-run autenticado pelo CLI, E2E de navegador nesta tarefa, testes de virada de meia-noite com relógio do servidor simulado e testes de volume/concorrência das próximas entregas. O schema validado foi criado pelo mesmo SQL versionado e comparado ao histórico, sem aplicação duplicada. Produção não foi alterada. Nenhum bloqueio restante para o **prompt 3 — categorias**; não iniciado automaticamente.
