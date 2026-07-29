# Consolidation Exit Criteria

Este documento define quando a `Consolidacao v1.0` pode ser considerada concluida.

Nao depende de sensacao. Depende de criterios verificaveis.

## Criterios obrigatorios

- [x] Existe uma unica fonte oficial documentada: GitHub/`master`, com `property-data-clean` como workspace oficial.
- [x] Todos os clones e worktrees `imovel-sp-*` foram inventariados em `AUD-001`.
- [x] Melhorias relevantes foram integradas ou descartadas com justificativa em `AUD-002`.
- [x] Nenhuma worktree congelada recebe implementacao nova.
- [x] Branch principal, GitHub e deploy estao no commit `4e414fc8` validado.
- [x] A fonte oficial nao contem artefatos versionados indevidamente.
- [x] `.gitignore` cobre logs, builds, cache, envs locais e artefatos de ferramentas.
- [x] CI de `master` passa integralmente no workflow `30325091044`.
- [x] Testes relevantes passaram na PR #8, PR #9 e no CI pos-merge.
- [x] Quality gate passou na baseline de dependencias e no job `Seguranca`.
- [x] `master` esta protegida, inclusive para administradores.
- [x] Oito checks obrigatorios estao configurados com branch atualizada.
- [x] `AUD-001` a `AUD-009` foram convertidos nas issues #10 a #18 retrospectivamente.
- [x] Nenhuma issue critica permanece aberta na milestone; #15 e #16 foram movidas para hardening futuro.
- [x] Workspace e worktrees estao documentados nos relatorios `AUD-001` a `AUD-004B`.
- [x] Worktrees oficiais estao limpas; a higiene historica de `imovel-sp-mvp` esta justificada e congelada.
- [x] O fechamento permaneceu documental, sem feature ou expansao de escopo.

## Reconstrucao retrospectiva

A milestone e as issues #10 a #19 foram criadas em 2026-07-29. Elas nao
existiam durante a execucao original dos AUDs. O objetivo foi corrigir a lacuna
de rastreabilidade sem inventar evidencia retroativa.

Evidencias principais:

- PR #8: baseline de dependencias e zero vulnerabilidades de producao;
- PR #9: banco reproduzivel por migrations, seed separado e testes pgTAP;
- commit `4e414fc8`: estado alinhado de `master` e deploy;
- workflow `30325091044`: sete jobs aprovados;
- Vercel: deployment do commit com status `success`;
- smoke de producao: homepage e `/api/imoveis?per_page=1` com HTTP 200;
- Supabase: quatro migrations alinhadas e `db push --dry-run` vazio;
- PAT `codex-migration-repair`: revogado, com CLI desconectada;
- branch protection: PR, oito checks, conversas resolvidas, sem force-push ou delecao.

## Evidencias aceitas

- link da milestone `Consolidacao v1.0`;
- lista de issues fechadas;
- logs de CI verde;
- saida dos comandos locais relevantes;
- ADRs registrados;
- `git status --short` limpo;
- deploy validado.

## Comandos locais esperados

```bash
npm run lint
npm run type-check
npm run test
npm run test:coverage
npm run check:security
npm run gate
```

Quando mudancas envolverem ambiente, admin, leads, storage, cadastro de imoveis ou Vercel:

```bash
npm run env:check:production
npm run vercel:smoke
```

## Fechamento

A `Consolidacao v1.0` foi encerrada em 2026-07-29 pela PR documental que fecha
a issue #19. Os riscos nao concluidos foram movidos, ainda abertos, para a
milestone `Hardening pos-consolidacao`.
