# Financy — entrega 1: base e acesso

Data: 2026-10-15. Execução nativa do plano aprovado. Primeiro commit solicitado após esta entrega.

## Implementado

- React/TypeScript/Vite/pnpm com versões fixadas e lockfile.
- Router, Query, Form, Tailwind, componentes de base com Radix/CVA e identidade do Figma.
- Cadastro com acesso imediato; login; sessão persistente; perfil com edição do nome e e-mail somente leitura; logout local.
- Cancelamento e limpeza do cache na troca de identidade. Nome de perfil nunca usado como autorização.
- Projetos Free separados, criados pelo usuário: desenvolvimento `gorymmpnavtudztnasny` e produção `bqkmhzrrfurphiikylpa`, São Paulo.
- Confirmação de e-mail desativada nos dois projetos com confirmação explícita do usuário; senha mínima de oito caracteres; URL local exata em desenvolvimento.

## Evidências

- TypeScript e ESLint passaram; dependências sem conflitos de peers.
- Vitest: 1/1, cancelamento e limpeza com resposta atrasada de QueryClient real.
- Playwright: 7/7, formulários/validação, rota privada, falha de rede preservando campos, teclado e ausência de overflow em 1024/1440, senha curta recusada pela API, cadastro/login/perfil/restauração/logout/troca de conta reais.
- Perfil também inspecionado em capturas 1024/1440; logo oficial servido localmente.
- Build passou. JS principal: 572.40 kB, 169.09 kB gzip; rotas de acesso/perfil separadas. Vite ainda alerta chunk >500 kB antes de compressão. Sem alegação de benchmark de desempenho.
- Revisão independente encontrou risco de reutilizar servidor de outro ambiente nos testes; reproduzido com servidor sentinela (RED) e corrigido com `reuseExistingServer: false` (GREEN). Suíte de navegador repetida e verde.
- Requisitos mínimos do Node alinhados com ESLint: Node 22.13 ou Node 24+.
- Contas fictícias destas execuções removidas somente pelos dez IDs conferidos em desenvolvimento; consulta posterior retornou zero contas E2E restantes.
- Revisão dos 40 arquivos preparados para o commit não encontrou chaves administrativas, chaves privadas, ambientes locais ou artefatos de sessão.

## Decisões e ajustes

1. Branch `feat/financy-v1` no diretório inicialmente vazio, sem criar um segundo checkout. Motivo: não havia trabalho anterior para isolar. Se inadequado: mover o checkout depois.
2. Inter, branco, cartões e Lucide do Figma prevalecem sobre preferências genéricas de skills visuais. Se inadequado: ajustar após revisão visual.
3. Catálogo de categorias será extraído antes das constraints SQL da tarefa 2; seu arquivo frontend entra quando usado. Não é necessário no acesso. Se inadequado: antecipar esse arquivo.
4. Scripts de execução que exigem HEAD serão usados após o commit inicial; evidências da primeira entrega registradas aqui. Motivo: o usuário pediu primeiro commit depois da base. Se inadequado: reconstruir o registro pelo primeiro commit.
5. Teste de resposta tardia usa QueryClient real em unitário; E2E real verifica troca de conta. Motivo: não expor mecanismo de teste no produto. Se inadequado: ampliar E2E quando existirem consultas financeiras.
6. Compatibilidade do Node foi tratada como correção necessária, pois a instalação documentada precisa suportar a toolchain. Se inadequado: a versão 22.12 foi restringida desnecessariamente.

## Pendente

Tabelas financeiras, migrations/RLS e seus testes, categorias, transações, dashboard, publicação e revisão final do produto completo. As rotas futuras estão identificadas como em preparação; não exibem saldos fictícios. Vercel está conectada, mas a consulta não retornou equipes; alvo de hospedagem será definido na publicação.

Não houve testes que escrevem em produção. Dados e contas dos E2E pertencem somente a desenvolvimento. Arquivos de ambiente, sessões, relatórios e backups estão ignorados no Git.
