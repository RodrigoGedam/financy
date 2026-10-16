# Financy — prompt 1: referências financeiras e catálogo

Data: 15/10/2026. Base: `5c27730`, branch `feat/financy-v1`. Escopo exclusivamente documental; contrato comum de `docs/prompts-implementacao-financy.md` aplicado.

## Resultado

- `DESIGN.md` preserva a referência de acesso e acrescenta fontes dos frames financeiros, medidas observadas, estados de componentes, regras funcionais e lacunas.
- Catálogo fechado: 7 cores do seletor `3107:4733` e 16 ícones de `3107:4701`, com chaves estáveis, tokens e IDs de instância/componente. Cinza é variante neutra de tag, ausente do seletor e excluído das opções persistidas.
- Correspondência entre banco e interface documentada, sem implementar constraints ou criar `category-options.ts` antes de seu consumidor.
- Divergências tratadas pelo escopo já aprovado: descrição de categoria, estatísticas adicionais do mockup e dados ilustrativos não ampliam o domínio. Dashboard exige seleção mensal, ranking de despesas e períodos explícitos; tabela exige dez itens por página apesar das oito linhas desenhadas.

## Evidências e verificações

- Git inicial: HEAD `5c27730`, sem alterações rastreadas; `docs/prompts-implementacao-financy.md` já estava não rastreado e foi preservado.
- Leitura da especificação, plano, contrato, operação e registro da base; inspeção de `styles.css`, `AppShell`, `Logo`, `Button` e `Input`.
- Figma: metadata das páginas `3:376`/`3:377`; contexto detalhado e screenshots dos modais `3107:4607`/`3107:4295`; leitura pela Plugin API de estilos locais, variantes, geometria e componentes principais das 16 instâncias. Nenhum node foi criado ou editado.
- Duas consultas programáticas excederam o limite de tamanho de retorno; repetidas com dados compactos, com sucesso. Consultas de contexto nos contêineres não retornaram seleção; resolvidas localizando os frames internos via metadata.
- Consulta às capturas completas de dashboard/categorias/transações bloqueada pelo limite de chamadas do plano Starter. Sem upgrade, sem contornar o limite e sem afirmar inspeção visual completa dessas páginas.
- Os 16 exports Lucide foram confirmados por leitura do entrypoint ESM da versão instalada `1.57.0`. A primeira busca por arquivos `.js` não se aplicava ao pacote `.mjs`; a verificação final usou o caminho declarado em `package.json`.
- Verificação documental: unicidade e cardinalidade das chaves, presença dos tokens e IDs, disponibilidade dos exports, links locais e `git diff --check`. Sem testes de aplicação, pois a alteração é documental.

## Próxima etapa e limites

Pronto para **prompt 2**, que deve inspecionar novamente o alvo Supabase de desenvolvimento antes de qualquer escrita e comprovar integridade, RLS/grants e transporte monetário. Nenhuma lacuna bloqueia as constraints do catálogo.

Pendentes para as telas: capturas completas, detalhes internos dos filtros, estados visuais não desenhados, overlay, tipografia de páginas, comparação dos vetores Lucide e validação real em 1024/1440 px. Regras de teclado/foco/vazio/carregando/erro estão documentadas como requisitos, não como comportamentos testados no Figma.

Sem implementação de telas, alteração de CSS, dependências, banco, ambientes, commit, push ou publicação.
