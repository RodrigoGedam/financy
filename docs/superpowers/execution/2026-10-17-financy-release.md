# Financy — candidata à publicação

## Execução autorizada em 17/10/2026 — em andamento

Após a preparação e a lista concreta abaixo, o usuário autorizou explicitamente sua execução. A consulta explícita ao escopo Vercel voltou a funcionar antes da autorização. A candidata foi reconferida com os mesmos 100 arquivos e fingerprint `937c385a243947aa0e949404f6fac9281be855bfff313e9922c923ce649b3f90`; unitários (155), typecheck, lint e build passaram novamente (Vite 4,33 s). Integrações/E2E mantêm a evidência anterior de desenvolvimento; não foram executados em produção.

Autoria anonimizada com árvores e mensagens preservadas: `5c27730` e `22e02d9` permaneceram iguais, `48de98a` → `77fb13b03953b9488e13ad445511954864337de7`, `5b39842` → `d1d54c5a516f7939ac612d2e2dea27daf007a8e2`. Somente a cadeia publicável tem identidades noreply. A referência privada local `refs/financy-private/pre-anonymization` guarda recuperação e **não deve ser enviada**, nem por mirror; não é branch/tag de release.

Criado e confirmado `https://github.com/RodrigoGedam/financy`, público e inicialmente vazio, sem README automático. O repositório antigo foi preservado. Vercel criado no escopo confirmado: projeto `financy`, ID `prj_KwAs12YJXoldXBQErlBQd5QM9QG1`, Node 24/Vite/dist/pnpm. Configuradas somente as duas variáveis publicáveis: Development/Preview apontam a dev; Production aponta a prod, sem valores registrados. Sem conexão Git automática ou deployment nesta fase.

Reconferência de produção imediatamente antes da execução: zero migrations, objetos financeiros/funções e usuários Auth. Migrations, deployment e smoke ainda em andamento; esta seção será completada com os resultados reais. A CLI GitHub instalada não tinha sessão; a criação do repositório utilizou a sessão existente do navegador, sem obter credenciais da sessão.

## Registro da preparação anterior

17/10/2026, prompt 8 / tarefa 6. **Preparada localmente; não publicada.** Contrato comum aplicado. Consultas a produção somente em leitura; nenhuma migration, variável remota, Auth, repositório ou deployment alterado. A escolha dos nomes pelo usuário não foi tratada como autorização para publicar.

## Revisão e alvos

| Item | Estado concreto |
| --- | --- |
| Checkout | `feat/financy-v1`, HEAD `5b398426e51662e06308cccf294820150a3b17d8`, quatro commits locais; nenhum remote ou branch main |
| Conteúdo candidato | Dashboard e revisão integrada anteriores preservados, mais configuração/documentação de release; ainda sem commit de release |
| GitHub conectado | `RodrigoGedam`; listagem de repositórios acessíveis do proprietário, sem `financy` |
| Destino escolhido pelo usuário | Novo `RodrigoGedam/financy`, visibilidade pública; branch estável proposta `main` |
| Repositório antigo | `RodrigoGedam/ftr-financy` público, com `frontend/`, `backend/` e README GraphQL/Prisma; preservar integralmente, não vincular/sobrescrever |
| Vercel conectado | `rodrigogedam`, Hobby; projeto proposto `financy` |
| Escopo Vercel | `rodrigogedams-projects`, `team_GEBnCB8faol74Ab23BukVkI5`, identificado pelo defaultTeamId e projeto existente portfolio |
| Acesso Vercel | Listagem sem escopo mostra portfolio; listagem explícita do escopo retorna 403, inclusive após o usuário solicitar nova conferência. Painel do navegador sem sessão, CLI Vercel não instalado. Não inferir inexistência de financy no escopo negado; reconsultar após resolver acesso |
| Supabase dev | `gorymmpnavtudztnasny`, financy-dev, ACTIVE_HEALTHY, PostgreSQL 17.11, São Paulo |
| Supabase prod | `bqkmhzrrfurphiikylpa`, financy-prod, ACTIVE_HEALTHY, PostgreSQL 17.11, São Paulo; reutilizar |
| URL/deployment público | Ainda não atribuído; não prometer domínio disponível ou estado READY |

Identificador verificável da candidata: SHA-256 `937c385a243947aa0e949404f6fac9281be855bfff313e9922c923ce649b3f90`. Calculado sobre os 100 arquivos rastreados/novos elegíveis, ordenados por caminho: concatenar `caminho + NUL + sha256(bytes do arquivo) + LF` e calcular SHA-256. Exclui somente este registro para evitar autorreferência; ele acompanha a candidata como documentação revisável. Não é SHA de commit nem ID de deployment. Reconferir antes de executar a release; qualquer mudança dos arquivos invalida esse identificador.

## Evidências do prompt 7 e gates atuais

O [registro integrado](2026-10-16-financy-integrated-review.md) contém a matriz AUTH/CAT/TX/DASH/LIST, reproduções RED/GREEN, revisão independente, 155 unitários, 19 integrações reais e 15 E2E. Foram conferidos arquivos/consumidores, guard exato de desenvolvimento, `reuseExistingServer: false`, fixtures ignoradas e último resultado local do Playwright (`passed`, nenhuma falha). A limpeza anterior registra zero contas/sessões/dados das 35 fixtures.

Nesta preparação, não houve alteração de código de produto, schema ou fixture. Reexecutados: `pnpm test` **155/155 em dez arquivos**, `pnpm lint`, `pnpm typecheck`, `pnpm build`, todos exit 0. Unitários: 3,65 s de execução; build Vite: 2,43 s. Integração e E2E de escrita não foram repetidos sem mudança relevante: sua evidência continua sendo a execução de 16/10, não uma nova execução desta fase. Nenhum teste de escrita rodou em produção.

Bundle principal 320,74 kB / 102,49 gzip, compartilhado Button 255,43 / 68,47; transações 64,76 / 17,11; dashboard 8,20 / 2,59. Nenhum chunk acima de 500 kB. Sem novo serviço, upgrade, CI ou otimização especulativa.

Inspeção do bundle local confirmou somente o endpoint de desenvolvimento, sem endpoint de produção e sem valores com formato de chave administrativa; não há sourcemaps emitidos. A string literal de prefixo `sb_secret_` faz parte do SDK e não é uma credencial. Este build é candidato local de desenvolvimento, não artefato Production: a fase autorizada deve gerar outro build com as duas variáveis publicáveis de produção.

## Schema comparado e migrations pendentes

Desenvolvimento tem oito políticas de proprietário nas duas tabelas; UPDATE verifica linha existente e resultante. As três versões abaixo correspondem ao SQL remoto, normalizando CRLF e whitespace externo. Não se comparou somente o nome/timestamp. SHA-256 dos arquivos locais:

| Ordem / arquivo | SHA-256 | Dev | Prod |
| --- | --- | --- | --- |
| `20261015182208_financy_core.sql` | `061cfdebd6901a3508b4b0a8a4bd0d3e6794f0d0c9db1d5acaed801e124ad8fd` | Aplicada | Pendente |
| `20261016183142_financy_transaction_conflicts.sql` | `353cfdd3f317fe868d0a740bb1cc5788c72da348deca56d033def6f4096c0418` | Aplicada | Pendente |
| `20261016190434_financy_dashboard.sql` | `8ee34c7ff2480acc8a3a9fe60d31229b7409d407fc8da59db67109b3727124e9` | Aplicada | Pendente |

Produção: histórico de migrations vazio, nenhuma tabela/view/sequência ou função em public, nenhuma função em private e zero usuários Auth nas consultas específicas. Não se concluiu “banco vazio” pela pasta local nem se afirmou ausência de todos os recursos internos. As migrations são aditivas sobre esse alvo observado. Reconferir imediatamente antes de aplicar; parar diante de drift/conflito, sem reset. Aplicação em um único caminho, com dry-run e versões preservadas; procedimento e recuperação em [operações](../../operations.md). CLI/dry-run/exportação ainda não executados por dependerem de vínculo/autenticação operacional e da fase autorizada. Nenhuma recuperação de banco foi prometida como testada.

## Variáveis e Auth

Somente `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` entram no bundle. Chave moderna publicável ativa confirmada em ambos os projetos, valores não impressos. `.env.local` atual contém apenas as duas variáveis esperadas e aponta a desenvolvimento. Nada administrativo usa VITE_.

| Vercel | URL Supabase | Origem da chave publicável |
| --- | --- | --- |
| Development e Preview | `https://gorymmpnavtudztnasny.supabase.co` | financy-dev |
| Production | `https://bqkmhzrrfurphiikylpa.supabase.co` | financy-prod |

`FINANCY_DEV_PROJECT_REF` fica somente nos testes locais, sem inclusão na Vercel. Não transmitir arquivos .env para o deploy; valores remotos ainda não configurados. Cada ambiente recebe build próprio; Preview não é promovido com credenciais dev para Production.

Painel Supabase consultado em leitura: desenvolvimento Site URL `http://127.0.0.1:5173`, produção `http://localhost:3000`, sem redirects extras em ambos. Produção: e-mail habilitado, confirmação de e-mail desativada, anônimo/OAuth desativados, mínimo de oito caracteres. Site URL de produção precisa da origem HTTPS real atribuída pelo projeto Vercel; URLs Preview exatas, se necessárias, pertencem somente à allowlist de desenvolvimento. Sem curingas, callback inventado ou recuperação de senha nova. Não houve mudança remota.

## Arquivos, segredos e privacidade

Alterados nesta preparação: `.env.example`, `.gitignore`, `README.md`, `docs/operations.md`, plano; novos `.vercelignore`, `vercel.json` e este registro. `graphify-out/` surgiu localmente entre as etapas e permanece preservado/ignorado, sem incluir caminhos locais/cache na release. Não confundir os demais arquivos modificados do dashboard/revisão anterior com alterações novas desta fase.

Varredura de 141 blobs alcançáveis dos quatro commits, nomes históricos e arquivos candidatos atuais, sem imprimir valores: sem candidatos a chave secreta Supabase/PAT/GitHub, JWT, chave privada ou URI de banco com senha; sem sessões, backups ou arquivos .env reais no histórico alcançável/índice. Um candidato de e-mail no formulário é somente placeholder visual, sem dado cadastrado. Assets/fontes próprios do projeto não contêm fixtures. Os artefatos locais ignorados podem conter sessões nos traces, portanto são excluídos também do upload Vercel.

**Privacidade pendente:** os metadados de autoria/committer do histórico têm duas identidades de e-mail, uma delas não é noreply. Nenhum valor foi impresso. Não enviar o histórico publicamente antes de autorizar sua anonimização; proposta da release: substituir somente esse e-mail por identidade GitHub noreply, preservando arquivos e sequência dos quatro commits. Isso muda seus SHAs; registrar o mapeamento antigo/novo e SHA final antes do push. Não reescrever sem a confirmação dessa lista. A candidata não assume que `.mailmap` removeria dados dos objetos antigos. A varredura é heurística e não garante ausência universal de todo dado pessoal/segredo.

## Configuração, aprovação e limites

Configuração Vercel local: Vite, raiz do repositório, Node 24 no projeto, pnpm 12.4.2 pelo packageManager, install pelo lockfile, build existente, dist e rewrite SPA. A regra segue a [documentação oficial de Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite). Sem deployment, o comportamento na infraestrutura Vercel ainda não foi testado.

Revisão independente desta preparação encontrou um P1 concreto: a exclusão inicial de `tests/` em `.vercelignore` removia `tests/fixtures/environment.ts`, importado por configurações/unitário incluídos no `tsc -b`. Reprodução em compiler host somente de leitura simulando a exclusão: três TS2307 nos consumidores. Correção mínima: remover essa regra, mantendo as exclusões dos dados gerados; compilação com as regras corrigidas e dependências instaladas resultou em zero diagnósticos (GREEN), sem mover fontes ou afrouxar tsconfig. Não foi adicionado um teste que apenas replica a configuração. Prettier de `vercel.json` aprovado após ajuste de indentação. Nenhum outro achado concreto do revisor.

A revisão independente posterior conferiu a correção e os três consumidores, encerrando o P1 sem achados pendentes. Não executou rede ou testes novamente.

Foi iniciado um preview local próprio na porta 4173 com `--strictPort`. Tentativas GET pelo executor retornaram proibição de socket e timeout, inclusive fora do sandbox; portanto esse smoke local não foi aprovado nem substitui o smoke Vercel futuro. Nenhum dado foi enviado a produção. O build continua aprovado; o fallback está configurado conforme a referência oficial, sem alegar comportamento de deployment ainda inexistente.

Servidor de preview próprio encerrado após a tentativa. `git diff --check` exit 0; apenas avisos da configuração Git de conversão LF/CRLF. Exclusões de .env, test-results, test-fixtures, graphify-out, .vercel e backups confirmadas com `git check-ignore`. Arquivos e lockfile de dependências foram preservados sem instalação/upgrade.

Lista única a autorizar, depois de resolver o acesso ao escopo: anonimizar o e-mail pessoal de autoria no histórico local; criar commit de release e main da candidata conferida; criar/vincular e enviar ao novo GitHub público escolhido; criar/reutilizar após reconferência o projeto Vercel financy no escopo identificado; definir as duas variáveis em Development/Preview/Production conforme a tabela; aplicar somente as três migrations em produção; ajustar Site URL canônica e redirects exatos pertinentes; publicar Production e fazer smoke somente de leitura nas rotas. Sem fixtures, contas/dados de teste de produção, reset, remoção do repositório antigo, plano pago ou domínio comprado. Se o alvo/SQL/conteúdo mudar materialmente, revisar a lista antes de executar.

Riscos/limites: e-mail não confirma propriedade por escopo aprovado; recuperação de senha não implementada; logout local não revoga instantaneamente JWT; proteção contra senhas vazadas requer Pro no painel e permanece desativada, sem upgrade; Supabase Free pode pausar. Não repetidos 1920 px/contraste completo/outros navegadores, conforme limites registrados no prompt 7. Não há URL pública, migrações aplicadas em produção, smoke publicado, rollback executado ou CRUD validado em produção. Rollback frontend só serve deployment anterior quando existir e não recupera dados; primeira release ainda não tem anterior.

**Próxima ação:** resolver 403 Vercel e obter uma confirmação da lista acima. Atualizar este registro com SHA final, projeto/deployment/URL READY, versões aplicadas e smoke antes de declarar publicado. Não há próximo prompt funcional a iniciar automaticamente.
