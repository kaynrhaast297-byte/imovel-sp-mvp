# Auditoria Critica

Status: governanca v0.1 criada durante a Consolidacao v1.0.

Prioridade atual: `AUD-003` - classificar o estado das worktrees e tratar higiene operacional apos o `AUD-002`.

Este arquivo transforma a auditoria tecnica em checklist executavel. Cada item critico deve virar issue na milestone `Consolidacao v1.0` antes de qualquer feature nova.

## Regras da auditoria

- Todo item deve ter problema, impacto, fonte, solucao recomendada e validacao.
- Itens criticos bloqueiam fechamento da Consolidacao v1.0.
- Itens nao aplicaveis devem ser descartados com justificativa, nao apagados silenciosamente.
- Auditoria nao e backlog infinito: cada item precisa ter decisao.

## Matriz obrigatoria do AUD-002

Nenhum commit exclusivo pode ser integrado porque parece util. Cada commit de `imovel-sp-mvp` deve receber uma decisao baseada na matriz abaixo.

| Criterio | Resposta esperada |
|---|---|
| Resolve problema existente? | Sim/Nao |
| Existe issue correspondente? | Sim/Nao |
| Ja existe equivalente na base candidata? | Sim/Nao |
| Introduz divida tecnica? | Sim/Nao |
| Possui testes ou validacao proporcional? | Sim/Nao |
| Mantem aderencia a Governanca v0.1? | Sim/Nao |

Destinos permitidos:

- Integrar.
- Reescrever.
- Arquivar.
- Descartar.

## Modelo operacional do AUD-003

Cada worktree deve ser tratada como ativo independente. Nao ha limpeza, arquivamento ou remocao em lote.

Estados permitidos:

- ATIVA: worktree ainda e base de trabalho ou contem atividade necessaria para a Consolidacao v1.0.
- CONGELADA: worktree preservada sem novas implementacoes enquanto aguarda decisao.
- PRONTA PARA ARQUIVAMENTO: worktree sem pendencia de integracao, com risco documentado e aguardando aprovacao do Owner.
- ARQUIVADA: worktree retirada de uso apos aprovacao formal e validacao de rastreabilidade.

Cada worktree no `AUD-003` deve registrar:

- estado atual;
- problema observado;
- comandos usados;
- evidencias encontradas;
- risco antes;
- risco depois;
- decisao recomendada;
- acao bloqueada ate aprovacao do Owner, quando houver limpeza ou arquivamento.

## Fechamento padrao a partir do AUD-003

Cada relatorio de auditoria deve encerrar com:

- resultado produzido;
- hipoteses confirmadas;
- hipoteses rejeitadas;
- risco antes;
- risco depois;
- proxima prioridade.

## Checklist inicial

| ID | Area | Problema | Severidade | Fonte | Solucao recomendada | Validacao | Status |
|---|---|---|---|---|---|---|---|
| AUD-001 | Governanca | Existem multiplos clones/worktrees `imovel-sp-*` apontando para o mesmo remote. | Critica | GitHub Issues/Milestones + Git worktree/status/remote docs | Inventariar clones, integrar ou descartar melhorias com justificativa. | Inventario aprovado em `docs/audit/AUD-001-clone-inventory.md`; acoes derivadas pendentes. | Aprovado |
| AUD-002 | Fonte da verdade | Existia risco de conhecimento importante fora da base candidata: `imovel-sp-mvp` tinha 8 commits exclusivos, 2 commits ahead e working tree suja por `.devcheck`. | Critica | Git merge-base/rev-list/diff/show docs + inventario AUD-001 | Classificar os 8 commits exclusivos, separar trabalho real de artefatos, e decidir destino: integrar, reescrever, arquivar ou descartar. | Relatorio `docs/audit/AUD-002-imovel-sp-mvp-commit-review.md` aprovado pelo Owner; nenhum commit justifica integracao direta. | Aprovado |
| AUD-003 | Worktree hygiene | Apos AUD-002, o risco predominante passou a ser operacional: estado das worktrees, artefatos `.devcheck`, `.gitignore`, branches ahead/behind e working trees sujas. | Alta | Git worktree/status/diff docs e pratica Git | Classificar estado de cada worktree e decidir limpar, manter, arquivar ou aguardar, sem perder rastreabilidade. | Relatorio `docs/audit/AUD-003-worktree-state.md` com estado por worktree, evidencias, risco antes/depois e fechamento padrao. | Proximo |
| AUD-004 | CI/CD | Branch principal ainda precisa confirmar protecao e status checks obrigatorios. | Critica | GitHub protected branches | Configurar branch protection com checks obrigatorios. | PR bloqueia merge se checks falharem. | Aberto |
| AUD-005 | Testes | Gate local e CI precisam estar verdes no projeto oficial. | Critica | GitHub Actions Node.js CI | Rodar `npm run check`, `npm run gate` e CI remoto. | Logs de aprovacao registrados. | Aberto |
| AUD-006 | Seguranca | Admin por token unico e aceitavel para MVP, mas fraco para producao. | Alta | Supabase Auth/RLS docs a pesquisar antes da correcao | Planejar migracao para auth real/RBAC apos consolidacao basica. | Issue e ADR especificos antes de implementar. | Aberto |
| AUD-007 | API IA | `/api/ai` precisa de limites, timeout e tratamento de erro mais defensivo antes de producao. | Alta | Next.js route handlers e boas praticas de API a pesquisar | Definir contrato, limites e falha segura. | Testes de rota e casos de erro. | Aberto |
| AUD-008 | Frontend | Projetos auxiliares usam `innerHTML`, `@ts-nocheck` e prototipos grandes sem validacao. | Media | OWASP XSS e TypeScript/Next.js docs a pesquisar | Corrigir depois da consolidacao do ImovelSP ou arquivar como prototipos. | Lint/type-check e revisao manual. | Aberto |
| AUD-009 | Fonte da verdade final | `property-data-clean` ainda e base candidata, nao fonte final alinhada com branch principal, GitHub e deploy. | Critica | GitHub protected branches + GitHub Actions | Alinhar branch principal, GitHub e deploy ao mesmo estado validado depois de resolver commits exclusivos. | Branch principal/deploy confirmados e CI verde. | Aberto |

## Conversao em issues

Cada item acima deve virar issue na milestone `Consolidacao v1.0` com:

- titulo no formato `[AUD-000] area: problema`;
- contexto;
- impacto;
- fonte consultada;
- criterios de aceite;
- plano de validacao;
- decisao final.

## Fontes consultadas

- GitHub Milestones: https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones
- GitHub Protected Branches: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- Managing branch protection rules: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule
- GitHub Actions Node.js CI: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
- Git diff: https://git-scm.com/docs/git-diff
- Git merge-base: https://git-scm.com/docs/git-merge-base
- Git rev-list: https://git-scm.com/docs/git-rev-list
- Git show: https://git-scm.com/docs/git-show
- Git worktree: https://git-scm.com/docs/git-worktree
- Git status: https://git-scm.com/docs/git-status
