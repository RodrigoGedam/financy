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
- V2 em execução: ensaio legado, migrations, RLS/ACL e aplicação limpa. Runtime `ca86d7e2-8c88-4764-bfad-e90d6fe2de8d`, projeto `financy-ux-premerge-ca86d7e2`, API/DB `55321/55322`, somente três migrations antigas preparadas. Portas livres verificadas antes do início.
- V3 pendente: geração real de tipos.
- V4 pendente: regressões e verificações de interação.
- V5 pendente: revisão e entrega com pendências explícitas.

Ruling: usar este registro versionado como ledger em Windows, como na execução anterior — facilita revisão e continuidade sem depender de scripts Bash.
