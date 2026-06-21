# AUD-001 - Clone Inventory

Status: Aprovado pelo Owner; acoes derivadas pendentes.

Data: 2026-06-19

Fase: Consolidacao v1.0

Owner: Jonathan Medeiros

Resultado: AUD-001 encerrado como inventario. A classificacao e destino dos commits exclusivos foi executada no `AUD-002`.

Atualizacao apos AUD-002: os 8 commits exclusivos de `imovel-sp-mvp` foram aprovados para descarte de integracao direta. O risco de perda de conhecimento caiu; o risco restante e operacional, ligado ao estado das worktrees e artefatos.

Base candidata oficial:

```text
D:\ESTUDOS\PROJETOS\imovel-sp-property-data-clean
```

## Problema pesquisado

Como inventariar diretorios locais `imovel-sp-*` que compartilham o mesmo repositorio Git, identificar divergencias relevantes e decidir o que integrar, arquivar ou descartar sem alterar codigo de feature.

## Fontes consultadas

- Git worktree docs: `git worktree` gerencia multiplas working trees anexadas ao mesmo repositorio.
  https://git-scm.com/docs/git-worktree
- Git status docs: `git status` mostra diferencas entre working tree, index, HEAD e arquivos nao rastreados.
  https://git-scm.com/docs/git-status
- Git remote docs: `git remote -v` mostra os remotes rastreados e suas URLs.
  https://git-scm.com/docs/git-remote
- Git config docs: `safe.directory` existe para permitir excecoes quando um repositorio pertence a outro usuario.
  https://git-scm.com/docs/git-config
- GitHub milestones docs: milestones agrupam issues e pull requests para acompanhar progresso.
  https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones

Nivel de evidencia:

- Nivel A: comportamento dos comandos Git e uso de milestones, conforme documentacao oficial.
- Nivel C: conclusoes sobre estes clones, com base na execucao local dos comandos abaixo.

## Comandos de validacao usados

```powershell
Get-ChildItem -Path 'D:\ESTUDOS' -Directory -Recurse -Filter 'imovel-sp-*'
git worktree list --porcelain
git remote -v
git status -sb
git status --short
git branch -vv
git branch -r
git log --oneline --decorate -8
git merge-base <candidate> <head>
git rev-list --left-right --count <upstream>...HEAD
git diff --stat <merge-base>..<head>
```

Observacao: `D:\ESTUDOS\PROJETOS\imovel-sp-mvp` acionou a protecao `dubious ownership` do Git porque o dono do diretorio e `jonathan`, mas o processo atual roda como `CodexSandboxOffline`. Para leitura do inventario, foi usado `git -c safe.directory=D:/ESTUDOS/PROJETOS/imovel-sp-mvp` somente no comando atual. Nenhuma configuracao global foi alterada.

## Resultado geral

Foram encontrados 5 diretorios Git `imovel-sp-*` dentro de `D:\ESTUDOS`.

Achado importante: isto nao e um conjunto de 5 clones independentes. A estrutura local e:

- 1 repositorio principal: `D:\ESTUDOS\PROJETOS\imovel-sp-mvp`
- 4 worktrees vinculadas ao `.git` desse repositorio principal:
  - `imovel-sp-devcheck-gate`
  - `imovel-sp-master-validation`
  - `imovel-sp-premium-ui`
  - `imovel-sp-property-data-clean`

Todos apontam para o mesmo remote:

```text
https://github.com/kaynrhaast297-byte/imovel-sp-mvp.git
```

## Inventario por diretorio

| Diretorio | Tipo | Branch | Upstream | HEAD | Working tree | Relacao com a base candidata | Risco | Decisao documentada |
|---|---|---|---|---|---|---|---|---|
| `imovel-sp-property-data-clean` | Worktree | `fix/vercel-env-hardening` | `origin/fix/vercel-env-hardening` | `a6233da` | Suja apenas por governanca v0.1 criada nesta consolidacao | Base candidata oficial | Baixo | Manter como unica base de trabalho. Toda mudanca nova nasce aqui. |
| `imovel-sp-mvp` | Repositorio principal local | `feature/property-data` | `origin/feature/property-data` | `f0b1442` | Suja: `.devcheck/logs/ultima-execucao.txt` modificado e `.devcheck/logs/20260610_204833_approve.txt` nao rastreado | 8 commits exclusivos classificados no `AUD-002`; nenhum justifica integracao direta | Medio | Preservar ate o `AUD-003` classificar estado operacional e decidir limpeza/arquivamento com aprovacao do Owner. |
| `imovel-sp-devcheck-gate` | Worktree | `fix/devcheck-git-e2e-isolation` | `origin/fix/devcheck-git-e2e-isolation` | `f94e473` | Limpa | 1 commit exclusivo contra a base candidata | Medio | Revisar para integracao. Provavel valor em DevCheck/E2E, mas precisa comparar com hardening ja existente na base para evitar duplicacao. |
| `imovel-sp-premium-ui` | Worktree | `feature/premium-ui` | `origin/feature/premium-ui` | `bd814bf` | Limpa | 1 commit exclusivo contra a base candidata | Medio | Revisar depois de higiene e seguranca. Nao integrar frontend durante a fase atual sem issue especifica. |
| `imovel-sp-master-validation` | Worktree | `master` | `origin/master` | `9600dfb` | Suja: `.gitignore` modificado | HEAD ja esta contido na base candidata; branch esta 3 commits behind `origin/master` | Baixo | Candidato a arquivamento apos confirmacao do Owner. A mudanca local adiciona `.vercel`, que ja existe na base candidata. |

## Contribuicoes exclusivas encontradas

### `imovel-sp-property-data-clean`

Nenhum commit exclusivo contra si mesmo.

Decisao: manter como base candidata oficial.

### `imovel-sp-mvp`

Commits exclusivos contra a base candidata:

```text
f0b1442 feat: add admin leads dashboard
efa46b3 feat: add admin leads panel and fix project setup
94e694f test: hook pre-push
1fc70b4 test: hook pre-push
397f0df test: valida hook pre-push
7d50856 chore: restaura devcheck.json
0d38f79 chore: remove arquivos lixo do terminal
281d987 test: valida hook pre-push
```

Resumo do delta desde o merge-base:

```text
53 files changed, 1946 insertions(+), 176 deletions(-)
```

Areas afetadas:

- painel/admin;
- rotas admin;
- geocoding;
- imagens de propriedades;
- Supabase/schema/migration;
- testes;
- docs/runbook;
- logs e relatorios `.devcheck`.

Decisao atualizada apos AUD-002: nao ha pendencia de integracao direta. Preservar ate o `AUD-003` classificar o estado operacional, artefatos `.devcheck` e eventual arquivamento.

### `imovel-sp-devcheck-gate`

Commit exclusivo contra a base candidata:

```text
f94e473 fix: harden DevCheck git and E2E isolation
```

Resumo do delta desde o merge-base:

```text
11 files changed, 135 insertions(+), 12 deletions(-)
```

Areas afetadas:

- `.github/workflows/ci.yml`;
- `devcheck.json`;
- scripts de E2E e health check;
- `tools/devcheck/core/git.py`;
- `tools/devcheck/core/runner.py`;
- testes do DevCheck.

Decisao: revisar para integracao. O assunto e coerente com a consolidacao, mas precisa comparacao com o hardening ja presente na base candidata.

### `imovel-sp-premium-ui`

Commit exclusivo contra a base candidata:

```text
bd814bf feat: add premium editorial UI
```

Resumo do delta desde o merge-base:

```text
14 files changed, 1126 insertions(+), 1426 deletions(-)
```

Areas afetadas:

- paginas frontend;
- `app/globals.css`;
- componentes visuais;
- screenshots E2E;
- `design-qa.md`.

Decisao: revisar, mas nao integrar agora. Pela governanca v0.1, frontend vem depois de higiene, seguranca e estabilizacao.

### `imovel-sp-master-validation`

Commits exclusivos contra a base candidata:

```text
nenhum
```

Achado local:

```diff
+.vercel
```

Essa entrada ja existe em `.gitignore` na base candidata.

Decisao: candidato a arquivamento apos confirmacao do Owner. Nao ha melhoria exclusiva identificada neste inventario.

## Decisoes finais do AUD-001

- `imovel-sp-property-data-clean`: risco baixo; manter como base candidata oficial.
- `imovel-sp-mvp`: risco medio; preservar ate classificacao operacional no `AUD-003`.
- `imovel-sp-devcheck-gate`: risco medio; revisar para possivel integracao.
- `imovel-sp-premium-ui`: risco medio; revisar depois das etapas de higiene/seguranca; nao integrar agora.
- `imovel-sp-master-validation`: risco baixo; candidato a arquivamento depois de confirmacao do Owner.

## Proximas acoes recomendadas

1. Executar `AUD-003`: classificar estado das worktrees e tratar higiene operacional.
2. Criar a milestone `Consolidacao v1.0` no GitHub quando `gh auth login -h github.com` estiver resolvido.
3. Criar a issue `AUD-001` e associar este inventario a ela quando a milestone existir.
4. Abrir subtarefas para revisar:
   - commit exclusivo de `imovel-sp-devcheck-gate`;
   - diferenca entre `imovel-sp-premium-ui` e o estado premium ja contido na base candidata.
5. Nao remover nenhuma worktree ate as decisoes acima serem aprovadas pelo Owner.

## Validacao

- Nenhum merge executado.
- Nenhum arquivo removido.
- Nenhum clone arquivado.
- Nenhum push executado.
- Nenhuma feature alterada.
- Inventario local registrado com evidencias de branch, upstream, status, commits exclusivos e decisao por diretorio.
