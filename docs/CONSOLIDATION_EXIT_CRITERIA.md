# Consolidation Exit Criteria

Este documento define quando a `Consolidacao v1.0` pode ser considerada concluida.

Nao depende de sensacao. Depende de criterios verificaveis.

## Criterios obrigatorios

- [ ] Existe uma unica base candidata oficial documentada.
- [ ] Todos os clones `imovel-sp-*` foram inventariados.
- [ ] Melhorias relevantes dos clones foram integradas ou descartadas com justificativa.
- [ ] Nenhum clone recebe implementacao nova.
- [ ] Branch principal, GitHub e deploy estao alinhados ao mesmo estado validado.
- [ ] Nao existem artefatos versionados indevidamente.
- [ ] `.gitignore` cobre logs, builds, cache, envs locais e artefatos de ferramentas.
- [ ] CI passa integralmente.
- [ ] Testes locais relevantes passam integralmente.
- [ ] Quality gate local passa integralmente.
- [ ] Branch principal esta protegida.
- [ ] Status checks obrigatorios estao configurados.
- [ ] Auditoria critica foi convertida em issues.
- [ ] Nenhuma issue critica da milestone permanece aberta.
- [ ] Workspace esta documentado.
- [ ] Working tree esta limpa antes do fechamento.
- [ ] Nao houve expansao de escopo durante a consolidacao.

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

A milestone so pode ser fechada quando todos os criterios obrigatorios estiverem marcados ou tiverem justificativa formal registrada em issue/ADR.
