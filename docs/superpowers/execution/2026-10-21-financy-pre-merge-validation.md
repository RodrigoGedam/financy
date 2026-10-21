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
- V4 pendente: regressões e verificações de interação.
- V5 pendente: revisão e entrega com pendências explícitas.

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
