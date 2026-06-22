# AUD-003 - Classificacao Operacional das Worktrees

Status: Diagnostico concluido; nenhuma worktree removida.

Data: 2026-06-20

Fase: Consolidacao v1.0

Owner: Jonathan Medeiros

Base candidata oficial:

```text
D:\ESTUDOS\PROJETOS\imovel-sp-property-data-clean
```

## Problema pesquisado

Como classificar operacionalmente multiplas worktrees Git sem alterar o estado do repositorio, respondendo se cada worktree ainda precisa existir.

## Fontes consultadas

- Git worktree: gerenciamento de multiplas working trees associadas ao mesmo repositorio.
  https://git-scm.com/docs/git-worktree
- Git status: inspecao do estado da working tree e arquivos rastreados/nao rastreados.
  https://git-scm.com/docs/git-status
- NIST SP 800-128: gerenciamento de configuracao para monitorar configuracoes, reduzir risco e controlar mudancas.
  https://csrc.nist.gov/pubs/sp/800/128/upd1/final

Nivel de evidencia:

- Nivel A: comandos Git e conceitos de controle de configuracao documentados oficialmente.
- Nivel C: classificacao operacional baseada no estado local atual das worktrees do ImovelSP.

## Comandos usados

```powershell
git worktree list --porcelain
git status -sb
git status --short
git branch -vv
git rev-parse HEAD
git rev-parse --abbrev-ref --symbolic-full-name @{u}
git rev-list --left-right --count <upstream>...HEAD
git merge-base --is-ancestor <head> <candidate>
git rev-list --count <candidate>..<head>
git rev-list --count <head>..<candidate>
git diff -- .gitignore
git worktree remove --dry-run <path>
```

Observacao: o Git local nao suporta `git worktree remove --dry-run`; o comando retornou `unknown option 'dry-run'`. Por isso, nenhuma simulacao destrutiva foi forjada por outro meio.

## Resultado produzido

As 5 worktrees foram classificadas operacionalmente.

Nenhuma worktree foi removida, arquivada, limpa, mesclada ou alterada.

## Classificacao operacional

| Worktree | Tipo | Estado | Justificativa | Dependencias restantes | Riscos | Proxima acao |
|---|---|---|---|---|---|---|
| `imovel-sp-property-data-clean` | Linked worktree | ATIVA | E a base candidata oficial da Consolidacao v1.0. HEAD `a6233da`, branch `fix/vercel-env-hardening`, upstream sincronizado e sem commits ahead/behind. | Finalizar registro/commit das evidencias de governanca e auditoria; depois avancar para higiene e alinhamento. | Working tree suja por documentos da Consolidacao ainda nao versionados. | Continuar a Consolidacao somente aqui. |
| `imovel-sp-mvp` | Main worktree | CONGELADA | E a main worktree que contem o repositorio Git principal. `AUD-002` aprovou que seus 8 commits exclusivos nao justificam integracao direta. | Manter como raiz operacional do `.git` ate `AUD-009` ou ate uma decisao explicita de reorganizacao segura. | Working tree suja por `.devcheck`; branch `feature/property-data` esta 2 commits ahead do upstream; nao deve receber implementacao nova. | Manter congelada; tratar logs/artefatos no AUD-004 sem integrar commits. |
| `imovel-sp-devcheck-gate` | Linked worktree | CONGELADA | Worktree limpa e sincronizada com `origin/fix/devcheck-git-e2e-isolation`, mas tem 1 commit exclusivo contra a base candidata. | Revisao posterior do valor de DevCheck/E2E contra o hardening ja presente na base candidata. | Pode representar melhoria operacional duplicada ou obsoleta; nao deve ser integrada sem issue propria. | Manter congelada ate revisao especifica de DevCheck. |
| `imovel-sp-premium-ui` | Linked worktree | CONGELADA | Worktree limpa e sincronizada com `origin/feature/premium-ui`, mas frontend esta fora da prioridade imediata da Consolidacao. | Aguardar higiene, seguranca e estabilizacao antes de qualquer revisao visual/frontend. | Risco baixo/medio de divergencia visual; risco de retomar feature antes da consolidacao. | Manter congelada; sem implementacao nova. |
| `imovel-sp-master-validation` | Linked worktree | PRONTA PARA ARQUIVAMENTO | HEAD `9600dfb` ja esta contido na base candidata. A unica mudanca local e `.gitignore` adicionando `.vercel`, que ja existe na base candidata. | Aprovacao explicita do Owner antes de qualquer arquivamento/remocao real. | Working tree suja impede tratar como arquivada; Git local nao suporta `worktree remove --dry-run`; nao remover em lote. | Aguardar confirmacao do Owner; depois arquivar/remover em acao separada e validada. |

## Evidencias por worktree

### `imovel-sp-property-data-clean`

- Branch: `fix/vercel-env-hardening`
- Upstream: `origin/fix/vercel-env-hardening`
- HEAD: `a6233da`
- Upstream: `0 behind / 0 ahead`
- Relacao com base candidata: e a propria base candidata.
- `git status --short`: documentos de governanca/auditoria pendentes.

Decisao: ATIVA.

### `imovel-sp-mvp`

- Tipo: main worktree.
- Branch: `feature/property-data`
- Upstream: `origin/feature/property-data`
- HEAD: `f0b1442`
- Upstream: `0 behind / 2 ahead`
- Relacao com base candidata: 8 commits ahead e 8 behind.
- `AUD-002`: nenhum dos 8 commits justifica integracao direta.
- `git status --short`:

```text
 M .devcheck/logs/ultima-execucao.txt
?? .devcheck/logs/20260610_204833_approve.txt
```

Decisao: CONGELADA.

### `imovel-sp-devcheck-gate`

- Branch: `fix/devcheck-git-e2e-isolation`
- Upstream: `origin/fix/devcheck-git-e2e-isolation`
- HEAD: `f94e473`
- Upstream: `0 behind / 0 ahead`
- Relacao com base candidata: 1 commit ahead e 6 behind.
- `git status --short`: limpo.

Decisao: CONGELADA.

### `imovel-sp-premium-ui`

- Branch: `feature/premium-ui`
- Upstream: `origin/feature/premium-ui`
- HEAD: `bd814bf`
- Upstream: `0 behind / 0 ahead`
- Relacao com base candidata: 1 commit ahead e 5 behind.
- `git status --short`: limpo.

Decisao: CONGELADA.

### `imovel-sp-master-validation`

- Branch: `master`
- Upstream: `origin/master`
- HEAD: `9600dfb`
- Upstream: `3 behind / 0 ahead`
- Relacao com base candidata: HEAD contido na base candidata.
- `git status --short`:

```text
 M .gitignore
```

Diff local:

```diff
+.vercel
```

Essa entrada ja existe em `.gitignore` na base candidata.

Decisao: PRONTA PARA ARQUIVAMENTO, mas ainda nao arquivada.

## Hipoteses confirmadas

- `imovel-sp-property-data-clean` e a unica worktree que deve permanecer ativa para a Consolidacao v1.0.
- `imovel-sp-mvp` nao deve receber implementacao nova; seu valor restante e operacional/historico, nao integracao direta.
- `imovel-sp-master-validation` nao contem conteudo exclusivo relevante para integrar.
- `git worktree remove --dry-run` nao esta disponivel na versao local do Git.

## Hipoteses rejeitadas

- Rejeitada a ideia de que alguma worktree possa ser removida imediatamente durante o AUD-003.
- Rejeitada a ideia de que `imovel-sp-mvp` possa ser arquivada como uma linked worktree comum; ela e a main worktree do repositorio local.
- Rejeitada a ideia de limpar `.devcheck` ou `.gitignore` durante este diagnostico.

## Risco antes

- Worktrees sem estado operacional definitivo.
- Risco de limpeza em lote apos reducao de risco do AUD-002.
- `imovel-sp-mvp` ainda parecia risco tecnico por conter commits exclusivos.
- `master-validation` parecia descartavel, mas ainda tinha working tree suja.

## Risco depois

- Cada worktree tem estado operacional e proxima acao.
- Risco de perda de conhecimento permanece baixo apos AUD-002.
- Risco predominante agora e operacional: higiene de arquivos, working trees sujas e eventual arquivamento controlado.
- Nenhuma worktree ficou sem dono ou sem decisao.

## Proxima prioridade

AUD-004 - Higiene operacional do repositorio:

- `.gitignore`;
- `.devcheck`;
- artefatos;
- working trees limpas;
- validacao sem perda de rastreabilidade.

## Validacao

- Nenhuma worktree removida.
- Nenhuma worktree arquivada.
- Nenhum `git worktree remove` executado sem `--dry-run`.
- Nenhum merge executado.
- Nenhum push executado.
- Nenhum arquivo de produto alterado.
- Nenhuma limpeza de `.devcheck` ou `.gitignore` executada.
