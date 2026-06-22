# AUD-004B - Execucao Controlada da Higiene Operacional

Status: Higiene executada em escopo restrito; sem commit/push.

Data: 2026-06-20

Fase: Consolidacao v1.0

Owner: Jonathan Medeiros

## Objetivo

Executar apenas a higiene aprovada no `AUD-004A`: remover artefatos `.devcheck` rastreados em `imovel-sp-mvp` do controle de versao, mantendo os arquivos no disco e ignorados.

## Fontes consultadas

- Git rm: `git rm --cached` remove caminhos apenas do indice, mantendo arquivos no working tree.
  https://git-scm.com/docs/git-rm
- Git gitignore: `.gitignore` especifica arquivos intencionalmente nao rastreados.
  https://git-scm.com/docs/gitignore
- GitHub Docs - Ignoring files: uso de `.gitignore` para evitar versionar arquivos gerados localmente.
  https://docs.github.com/en/get-started/git-basics/ignoring-files

## Escopo executado

Worktree alterada:

```text
D:\ESTUDOS\PROJETOS\imovel-sp-mvp
```

Acoes executadas:

1. Adicionados ao `.gitignore` da worktree antiga:

```text
.devcheck/logs/
.devcheck/ai-report.md
```

2. Executado dry-run:

```powershell
git rm -r --cached -n -- .devcheck
```

3. Removidos do indice, mantendo arquivos no disco:

```powershell
git rm -r --cached -- .devcheck
```

4. Staged da alteracao de `.gitignore`:

```powershell
git add .gitignore
```

## Resultado produzido

Foram removidos do controle de versao, apenas no indice, 17 artefatos `.devcheck`:

```text
.devcheck/ai-report.md
.devcheck/logs/20260609_182302_health.txt
.devcheck/logs/20260609_182622_health.txt
.devcheck/logs/20260609_182705_health.txt
.devcheck/logs/20260609_182730_quick.txt
.devcheck/logs/20260609_182841_approve.txt
.devcheck/logs/20260609_183737_health.txt
.devcheck/logs/20260609_183746_quick.txt
.devcheck/logs/20260609_184242_quick.txt
.devcheck/logs/20260609_190421_quick.txt
.devcheck/logs/20260609_190653_approve.txt
.devcheck/logs/20260609_192039_quick.txt
.devcheck/logs/20260609_193050_approve.txt
.devcheck/logs/20260609_193341_approve.txt
.devcheck/logs/20260610_195804_approve.txt
.devcheck/logs/20260610_201237_approve.txt
.devcheck/logs/ultima-execucao.txt
```

Arquivos preservados no disco:

```text
.devcheck/logs/ultima-execucao.txt
.devcheck/ai-report.md
```

Ambos foram confirmados com `Test-Path`.

## Evidencia final

`git status --short` em `imovel-sp-mvp`:

```text
D  .devcheck/ai-report.md
D  .devcheck/logs/20260609_182302_health.txt
D  .devcheck/logs/20260609_182622_health.txt
D  .devcheck/logs/20260609_182705_health.txt
D  .devcheck/logs/20260609_182730_quick.txt
D  .devcheck/logs/20260609_182841_approve.txt
D  .devcheck/logs/20260609_183737_health.txt
D  .devcheck/logs/20260609_183746_quick.txt
D  .devcheck/logs/20260609_184242_quick.txt
D  .devcheck/logs/20260609_190421_quick.txt
D  .devcheck/logs/20260609_190653_approve.txt
D  .devcheck/logs/20260609_192039_quick.txt
D  .devcheck/logs/20260609_193050_approve.txt
D  .devcheck/logs/20260609_193341_approve.txt
D  .devcheck/logs/20260610_195804_approve.txt
D  .devcheck/logs/20260610_201237_approve.txt
D  .devcheck/logs/ultima-execucao.txt
M  .gitignore
```

`git diff --cached --stat`:

```text
18 files changed, 3 insertions(+), 414 deletions(-)
```

`git check-ignore -v` confirma:

```text
.gitignore:12:.devcheck/logs/       .devcheck/logs/20260610_204833_approve.txt
.gitignore:12:.devcheck/logs/       .devcheck/logs/ultima-execucao.txt
.gitignore:13:.devcheck/ai-report.md .devcheck/ai-report.md
```

## Hipoteses confirmadas

- `.devcheck` em `imovel-sp-mvp` era artefato operacional rastreado indevidamente.
- `git rm --cached` foi suficiente para remover do indice sem apagar do disco.
- `.devcheck/logs/` e `.devcheck/ai-report.md` precisavam ser adicionados ao `.gitignore` da worktree antiga para nao reaparecerem como untracked.

## Hipoteses rejeitadas

- Rejeitada a necessidade de alterar a base candidata para copiar logs.
- Rejeitada a necessidade de tratar `reports/validation-report.md` ou screenshots E2E como lixo.
- Rejeitada a necessidade de alterar CI, DevCheck runtime ou codigo de produto neste AUD.

## Risco antes

- `imovel-sp-mvp` misturava branch antiga com logs `.devcheck` rastreados e modificados.
- Um futuro `git status` podia parecer mais grave do que era, escondendo sujeira real entre artefatos gerados.

## Risco depois

- Artefatos `.devcheck` foram removidos do indice e continuam no disco.
- `.devcheck/logs/` e `.devcheck/ai-report.md` estao ignorados na worktree antiga.
- Mudancas pendentes ficaram restritas a `.gitignore` e remocao do rastreamento de artefatos.

## Proxima prioridade

Revisar e aprovar o resultado do `AUD-004B`.

Depois da aprovacao:

- decidir se a higiene de `imovel-sp-mvp` deve ser commitada nessa branch antiga;
- tratar `master-validation` em arquivamento controlado ou issue especifica;
- evitar novas auditorias longas sem retorno direto.

## Validacao

- Nenhum arquivo de produto alterado.
- Nenhum CI alterado.
- Nenhum merge executado.
- Nenhum cherry-pick executado.
- Nenhum push executado.
- Nenhuma worktree arquivada/removida.
- Arquivos `.devcheck` permaneceram no disco.
