# Auditoria Critica

Status: Consolidacao v1.0 encerrada em 2026-07-29.

Prioridade atual: desenvolvimento de produto controlado. Riscos deferidos estao
nas issues #15 e #16.

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
| AUD-003 | Worktree hygiene | Apos AUD-002, o risco predominante passou a ser operacional: estado das worktrees, artefatos `.devcheck`, `.gitignore`, branches ahead/behind e working trees sujas. | Alta | Git worktree/status/diff docs e pratica Git | Classificar estado de cada worktree e decidir limpar, manter, arquivar ou aguardar, sem perder rastreabilidade. | Issue #12 fechada; relatorios AUD-003 e AUD-004B. | Concluido |
| AUD-004 | CI/CD | Branch principal ainda precisava de protecao e status checks obrigatorios. | Critica | GitHub protected branches | Configurar branch protection com checks obrigatorios. | Issue #13 fechada; protecao confirmada pela API. | Concluido |
| AUD-005 | Testes | Gate local e CI precisavam estar verdes no projeto oficial. | Critica | GitHub Actions Node.js CI | Rodar gates e CI remoto. | Issue #14 fechada; workflow `30325091044` verde. | Concluido |
| AUD-006 | Seguranca | Admin por token unico e aceitavel para piloto, mas fraco para producao. | Alta | Supabase Auth/RLS | Planejar migracao para auth real/RBAC. | Issue #15 aberta em `Hardening pos-consolidacao`. | Deferido |
| AUD-007 | API IA | `/api/ai` possui limites e timeout, mas nao rate limit persistente. | Alta | Next.js Route Handlers e AbortController | Adicionar rate limit antes de exposicao real. | Issue #16 aberta em `Hardening pos-consolidacao`. | Deferido |
| AUD-008 | Frontend | Projetos auxiliares usam prototipos sem validacao suficiente. | Media | OWASP XSS e TypeScript/Next.js | Manter congelados; reaproveitar somente com issue propria. | Issue #17 fechada como not planned. | Risco aceito |
| AUD-009 | Fonte da verdade final | Base, branch principal, GitHub, banco e deploy precisavam convergir. | Critica | GitHub, Vercel e Supabase CLI | Alinhar todos ao estado validado. | Issue #18 fechada; commit `4e414fc8`, CI e smoke verdes. | Concluido |

As issues #10 a #19 foram criadas retrospectivamente em 2026-07-29 para
corrigir a ausencia de rastreamento durante a execucao original.

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
