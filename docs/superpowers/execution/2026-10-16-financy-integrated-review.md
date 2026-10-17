# Financy — revisão integrada em desenvolvimento

Data: 16/10/2026. Contrato comum de `docs/prompts-implementacao-financy.md` aplicado. Base Git `5b39842`, branch `feat/financy-v1`; o dashboard já estava implementado e não commitado ao iniciar a revisão. Nenhum commit, publicação ou acesso a produção nesta etapa. A fotografia de 15/10 do guia não representa o estado atual.

Foram confrontados especificação, plano, DESIGN, componentes, consumidores de API/cache e registros de base, catálogo, dados, categorias, utilitários, transações e dashboard. React/Vite/TypeScript, TanStack e Supabase preservados; sem novas dependências, alterações de autenticação ou migrations nesta revisão.

## Matriz de requisitos e evidências

| Regras | Evidências executáveis existentes e complemento desta revisão |
| --- | --- |
| AUTH-01–07 | `access.spec.ts`, `auth.spec.ts`, testes de `session-cache`: cadastro/login/perfil, senha mínima por API, sessão restaurada, rota privada, rede indisponível, logout e segunda conta. `financy.spec.ts` completa a troca de identidade após operações financeiras. |
| CAT-01–07 | `categories.test.ts` unitário e integração, `security.test.ts`, `integrity.test.ts`, `categories.spec.ts`: catálogo fechado, duplicidade normalizada, isolamento, edição, exclusão sem uso e recusa com uso. Jornada integrada confere contagens após criação, edição, exclusão e reclassificação. |
| TX-01–08 | Unitários de dinheiro/datas/validação, integração `transactions.test.ts`, `integrity.test.ts`, `security.test.ts`, E2E `transactions.spec.ts`: CRUD, categoria obrigatória, FK composta, dinheiro textual grande/centavos, datas inválidas/futuras, mês/ano, conflitos e concorrência. Mutações negadas conferem persistência da linha original, inclusive resposta com zero linhas. |
| DASH-01–03 | Integração `dashboard.test.ts` e E2E `dashboard.spec.ts`: saldo histórico, mês vazio, ranking somente de despesas, recentes, desempates, centavos/negativos, outra conta/anônimo e 1.005 despesas além do limite padrão da API; link mantém mês. Mês trocado rapidamente não mistura respostas. |
| LIST-01–03 | Unitários de search, integração e E2E de transações: busca literal com curingas/caracteres especiais, filtros combinados, dez linhas, total remoto, ordenação determinística, última página após exclusão, URL/reload/voltar/avançar. Respostas pendentes na troca de conta não reaparecem na conta seguinte. |

As 19 integrações usam Data API/SDK reais, chave publicável e sessões de Alice/Bob/anônimo, sem service_role nas operações testadas. Capturas ou mocks de falha de rede não são apresentados como evidência de RLS. O schema remoto de desenvolvimento foi reconferido: três migrations locais/remotas correspondentes (`20261015182208`, `20261016183142`, `20261016190434`), duas tabelas com RLS, oito políticas de proprietário. Grants, SECURITY INVOKER, execução das RPCs e search_path foram revisados. Nenhuma migration foi reaplicada.

Arquivos alterados nesta revisão: `playwright.config.ts`, `vitest.integration.config.ts`, `tests/fixtures/supabase.ts`, `tests/e2e/auth.spec.ts`; novos `src/lib/test-config-environment.test.ts`, `tests/e2e/financy.spec.ts` e este registro; atualizados `README.md`, `DESIGN.md`, `docs/operations.md` e o plano. Os demais arquivos financeiros no diff são da implementação anterior do dashboard, preservada e revisada. Consumidores da fixture compartilhada, configurações e APIs foram conferidos; varredura de padrões de chave secreta/JWT/URI de banco nos arquivos elegíveis rastreados e novos não apontou candidatos. Isto não substitui a revisão do histórico Git antes da publicação.

## Falhas reproduzidas e correções

### Configurações de teste aceitavam produção antes das fixtures

- Reprodução: importar cada configuração com referência/URL de produção e uma chave publicável fictícia não lançava erro. Os guards das fixtures ainda impediam as escritas, mas a configuração do servidor podia iniciar com esse destino.
- Impacto: trava de ambiente tardia, dependente da entrada escolhida pelo teste.
- Correção: `integrationEnvironment(env)` executa ao carregar `playwright.config.ts` e `vitest.integration.config.ts`, antes do servidor/fixtures. Reutiliza a referência exata, URL exata e exigência de chave publicável existentes.
- Teste: dois novos casos em `src/lib/test-config-environment.test.ts`, RED (2 falhas) → GREEN. A configuração não realiza rede nesse teste. Um servidor HTTP descartável próprio na porta 5173 provocou exit 1 do Playwright com “already used”; `reuseExistingServer: false` e `--strictPort` continuam ativos. Nenhuma trava foi relaxada.

### Cadastro E2E podia deixar conta sem identificação no manifesto

- Reprodução: após cadastro bem-sucedido, abortar GET `/auth/v1/user` fazia o recorder anterior falhar com “Conta da fixture não identificada”. A conta criada foi identificada pelo coletor independente da resposta do signup durante a reprodução e incluída na limpeza.
- Impacto: falha posterior de perfil/navegação podia impedir a limpeza precisa da conta fictícia.
- Correção: observar POST `/auth/v1/signup` antes do clique, validar e registrar seu ID antes de afirmar navegação. Compartilhar `recordFixtureUser` com as fixtures financeiras. Manifesto contém somente userId, runId e project-ref; senhas permanecem apenas em memória nos clientes de teste.
- Teste: RED real em desenvolvimento com GET indisponível → GREEN sob a mesma condição. A suíte completa passou após a correção. Revisão independente confirmou os consumidores e encerrou o achado P2 sem outros defeitos concretos.

Não foi reproduzido um defeito financeiro do produto nesta revisão. Não se alteraram páginas, regras financeiras ou schema para obter testes verdes. Um timeout inicial da nova jornada veio de seletor exato que ignorava o símbolo no nome acessível do radio; corrigiu-se somente o seletor do teste.

## Jornada e execução

`tests/e2e/financy.spec.ts` cobre a lacuna do percurso contínuo: conta vazia, orientação sem categorias, criação de duas categorias, receita/despesa pelo formulário, paginação 10/2, reload e filtros, dashboard, edição e recusa de excluir categoria usada, exclusão de despesa, reclassificação, categoria com zero vínculos, exclusão permitida, logout e Bob sem dados de Alice. Dez despesas de centavo são criadas por API para exercitar paginação sem repetir formulários sem propósito. As credenciais são de contas geradas na execução, com login real pela tela.

| Verificação final | Resultado |
| --- | --- |
| `pnpm test` | 155 aprovados, 10 arquivos; 5,62 s |
| `pnpm test:integration` | 19 aprovados, 5 arquivos; 88,12 s; somente financy-dev |
| `pnpm test:e2e` | 15 aprovados; 2,8 min; Chromium, servidor próprio |
| `pnpm typecheck` | Exit 0 |
| `pnpm lint` | Exit 0 |
| `pnpm build` | Exit 0; 2,84 s |
| Prettier dos seis arquivos TS alterados nesta revisão | Aprovado; ajuste final de formatação verificado no arquivo afetado |
| `git diff --check` | Aprovado |

A integração foi executada uma vez após as mudanças da configuração/fixture. O E2E completo foi repetido porque a revisão independente encontrou depois a falha do manifesto; a segunda execução valida a correção. Casos RED e a jornada isolada foram usados somente para as novas lacunas. Nenhuma cobertura financeira foi duplicada para espelhar código.

## Figma, teclado e layout

Frames reconsultados no arquivo `rm4MepATAsOLyoYVuAT8YH`: [login 3101:353](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3101-353), [cadastro 3103:1915](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3103-1915), [perfil 3104:2925](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3104-2925), [categorias 3104:2028](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3104-2028), [transações 3104:362](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3104-362), [dashboard 3103:1987](https://www.figma.com/design/rm4MepATAsOLyoYVuAT8YH/Financy--Community-?node-id=3103-1987), modal categoria `3107:4607` e modal transação `3107:4295`.

Inspeção dos screenshots finais em 1024/1440: login, cadastro, perfil, categorias/cartões/modal, transações/tabela/filtros/modal, dashboard preenchido e vazio. Capturas locais ignoradas em `test-results/`: `login-*`, `signup-*`, `profile-*`, `categories-*`, `category-dialog-*`, `transactions-*`, `transaction-dialog-*`, `dashboard-*`, `integrated-empty-dashboard-*`. São evidências locais descartáveis, não arquivos versionados nem alegação de comparação pixel a pixel.

Sem overflow horizontal observado; valor grande completo na listagem, controles e ações acessíveis nas duas larguras. E2E verifica teclado, foco inicial/devolvido, cancelar/fechar/confirmar modais, nomes e labels, falha de rede com campos preservados e ação de recuperação. Foram preservadas as adaptações aprovadas: sessão persistente sem lembrar-me, ausência de recuperação de senha neste escopo, categoria sem descrição/resumos fictícios, períodos explícitos e filtros funcionais. Figma contém frames financeiros de 1280; 1024/1440 são adaptações responsivas, não frames encontrados. Vazio/carregamento/erro sem frame específico são requisitos da especificação; não se afirma fidelidade visual inexistente. Não houve redesign ou acréscimo mobile.

## Carga, cache e consultas

Build: principal 320,74 kB (102,49 gzip), chunk compartilhado Button 255,43 kB (68,47 gzip), transações 64,76 kB (17,11 gzip), dashboard 8,20 kB (2,59 gzip). Nenhum chunk acima de 500 kB, sem aviso correspondente. Não se elevou limite nem se fez otimização especulativa. Estes tamanhos não são medição de latência de usuários reais.

Categorias usam agregação `transactions(count)` no banco, uma consulta por lote de até 500 categorias, sem consulta por cartão. Listagem usa contagem remota e intervalo de dez, ordenado por data/criação/ID; TanStack Table usa paginação manual. Dashboard faz uma RPC: somas antes dos limites de cinco, valores textuais exatos. Não há download do histórico para somar no navegador. Cache por usuário/filtros/mês, cancelamento/limpeza ao trocar identidade, AbortSignal e invalidação do prefixo financeiro revisados nos consumidores. O catálogo frontend continua com sete cores e 16 ícones, correspondente às constraints, coberto pelos testes existentes.

## Limpeza e riscos

Todas as linhas financeiras das fixtures foram removidas pelos próprios clientes. Conferência administrativa limitada aos 35 IDs do manifesto desta revisão, com runId e e-mail exatos: zero dependências financeiras. Foi removida uma sessão residual de teste (não se atribuiu uma causa sem evidência), com cascade confirmado para refresh_tokens; depois foram excluídas as 35 contas fictícias. Conferência final para esses IDs: **accounts=0, sessions=0, categories=0, transactions=0**. Nenhuma limpeza por prefixo amplo. Revogar sessão/refresh não invalida instantaneamente JWT já emitido; tokens e contas eram descartáveis de desenvolvimento. Manifesto local preservado para rastreabilidade, sem credenciais.

Advisor: permanece o aviso de proteção contra senhas vazadas desativada em Auth, configuração anterior a esta etapa; nenhuma nova advertência de RLS/função. [Referência Supabase](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Não se mudou configuração de Auth por preferência nesta revisão. Recuperação de senha e Realtime continuam fora do escopo. Contagens que excedam inteiros seguros são recusadas pelo adapter; não há teto monetário arbitrário.

Aviso de ferramenta: Vitest/Vite alerta que o futuro configLoader native não aceita o import extensionless do guard. A versão atual executa todos os gates; não se suprimiu o aviso ou mudou o compilador. Reavaliar ao migrar o carregador/major.

## Preparação para publicação

Nenhum bloqueador funcional reproduzido permanece nos critérios deste prompt. **Pronto para o prompt 8**, que prepara publicação revisável; isto não autoriza nem comprova publicação.

Pendências reais: o checkout não tem remote Git configurado, `vercel.json` ou `.vercel/project.json`; faltam alvo/vínculo verificável, fallback SPA, variáveis Preview/Production, commit exato de entrega e revisão de segredos/histórico antes de tornar público. Produção precisa de conferência própria de estado, migrations, Auth/URLs e preservação de dados antes de qualquer aplicação autorizada. Não se infere inexistência de recursos remotos pela ausência local. Não foi feito export/backup de produção ou deployment/rollback.

Não verificado: produção, alvos remotos GitHub/Vercel e smoke publicado; outros navegadores/leitor de tela/auditoria completa de contraste; expiração/renovação por espera prolongada; 1920 px adicional do plano e mobile; carga/latência além da fixture de 1.005 registros e concorrência elevada. O passo 2 da tarefa 6 permanece parcialmente aberto por esses itens adicionais, sem invalidar os gates de desenvolvimento e as larguras solicitadas aqui.
