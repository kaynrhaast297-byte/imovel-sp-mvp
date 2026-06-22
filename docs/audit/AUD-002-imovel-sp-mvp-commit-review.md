# AUD-002 - Classificacao e Destino dos Commits Exclusivos

Status: Aprovado pelo Owner; nenhum commit justifica integracao direta.

Data: 2026-06-20

Fase: Consolidacao v1.0

Owner: Jonathan Medeiros

Resultado aprovado: os 8 commits exclusivos de `imovel-sp-mvp` representam historico espalhado, nao conhecimento que precise entrar diretamente na base candidata.

Base candidata oficial:

```text
D:\ESTUDOS\PROJETOS\imovel-sp-property-data-clean
```

## Problema pesquisado

Como classificar commits exclusivos de uma worktree antiga sem integrar em lote, separando trabalho util, duplicata, artefato e divida tecnica antes de decidir integrar, reescrever, arquivar ou descartar.

## Fontes consultadas

- Git show: inspecao de objetos/commits e seus diffs.
  https://git-scm.com/docs/git-show
- Git diff: comparacao entre commits, paths e snapshots.
  https://git-scm.com/docs/git-diff
- Git rev-list: listagem e contagem de commits por intervalo.
  https://git-scm.com/docs/git-rev-list
- Git merge-base: identificacao do ancestral comum usado para isolar divergencia real.
  https://git-scm.com/docs/git-merge-base

Nivel de evidencia:

- Nivel A: comandos Git usados conforme documentacao oficial.
- Nivel C: classificacoes baseadas no estado local deste repositorio.

## Referencias analisadas

```text
Base candidata HEAD: a6233dafa93f3669f8035b768bb045a94b742ac9
Worktree analisada:  D:\ESTUDOS\PROJETOS\imovel-sp-mvp
Branch analisada:    feature/property-data
HEAD analisado:      f0b1442d69b92bac08c5d76906acb5c8462e46bb
Merge-base:          a7d33de8c5f0d972c2404c9a40eca2e9e0718630
```

Commits exclusivos identificados:

```text
281d987 test: valida hook pre-push
0d38f79 chore: remove arquivos lixo do terminal
7d50856 chore: restaura devcheck.json
397f0df test: valida hook pre-push
1fc70b4 test: hook pre-push
94e694f test: hook pre-push
efa46b3 feat: add admin leads panel and fix project setup
f0b1442 feat: add admin leads dashboard
```

## Comandos de validacao usados

```powershell
git merge-base <candidate> <mvp-head>
git log --reverse --date=iso-strict --format='%H`t%h`t%ad`t%s' <merge-base>..<mvp-head>
git show --stat --name-status --format=fuller <commit>
git show --numstat --format='%H %s' <commit>
git cherry -v <candidate> <mvp-head>
git diff --stat <commit-a> <commit-b>
git diff --patch <commit-a> <commit-b> -- <path>
rg -n "getLeads|admin/leads|STATUS_LABELS|carregarLeads|Leads|leadsTotal" app lib __tests__ docs -S
```

## Resultado executivo

Nenhum dos 8 commits deve ser integrado diretamente na base candidata.

Resumo:

- `281d987` contem trabalho real de property data, mas misturado com logs `.devcheck` e arquivos lixo de terminal. O valor util foi refeito de forma mais limpa em `2a78cc4`.
- `0d38f79` remove lixo introduzido pelo commit anterior. Nao tem valor independente se `281d987` for descartado.
- `7d50856` restaura `devcheck.json`, mas com configuracao inferior a atual da base candidata.
- `397f0df`, `1fc70b4` e `94e694f` alteram `README.md` apenas para validar hook, incluindo ruido `# test`/`# hook test` e caracteres nulos.
- `efa46b3` cria painel/rota de leads, mas a base candidata ja possui a funcionalidade em estado superior, com testes.
- `f0b1442` melhora parte do dashboard de leads, mas a base candidata ja possui uma versao melhorada.

Decisao aprovada: descartar os 8 commits para integracao direta. Manter a branch/worktree apenas como referencia historica ate o `AUD-003` classificar o estado operacional das worktrees.

## Matriz por commit

| Commit | Classificacao | Resolve problema existente? | Existe issue correspondente? | Ja existe equivalente na base candidata? | Introduz divida tecnica? | Possui testes ou validacao proporcional? | Mantem aderencia a Governanca v0.1? | Destino | Justificativa |
|---|---|---|---|---|---|---|---|---|---|
| `281d987` | Commit misto com funcionalidade, logs e lixo de terminal | Sim | Sim, `AUD-002` | Sim, funcionalidade principal reescrita em `2a78cc4` | Sim | Parcial | Nao para integracao direta | Descartar | Contem property data util, mas mistura artefatos `.devcheck`, arquivos lixo e mudancas amplas. A base candidata tem implementacao limpa e mais completa. |
| `0d38f79` | Limpeza dependente de commit descartado | Sim, mas apenas para reverter lixo local | Sim, `AUD-002`/`AUD-003` | Nao aplicavel | Nao | Nao aplicavel | Nao para integracao direta | Descartar | Remove arquivos lixo criados em `281d987`. Sem integrar `281d987`, esta limpeza nao tem valor standalone. |
| `7d50856` | Configuracao DevCheck obsoleta | Sim | Sim, `AUD-002` | Sim, configuracao atual e superior | Sim, se integrada | Nao | Nao | Descartar | Reintroduz `devcheck.json` com threshold 80 e gates nao bloqueantes. A base candidata ja tem threshold 90, security/checks e gates bloqueantes. |
| `397f0df` | Artefato de teste de hook | Nao | Nao | Nao aplicavel | Sim | Nao | Nao | Descartar | Altera `README.md` com conversao/ruido e adiciona `# test` com caracteres nulos. |
| `1fc70b4` | Artefato de teste de hook | Nao | Nao | Nao aplicavel | Sim | Nao | Nao | Descartar | Adiciona `# hook test` no `README.md`; nao resolve problema do produto ou da consolidacao. |
| `94e694f` | Artefato de teste de hook duplicado | Nao | Nao | Nao aplicavel | Sim | Nao | Nao | Descartar | Duplica ruido `# hook test` no `README.md`. |
| `efa46b3` | Funcionalidade inicial de leads, superseded | Sim | Sim, `AUD-002` | Sim | Sim, para integracao direta | Parcial | Nao para integracao direta | Descartar | Adiciona rota `admin/leads`, `getLeads` e UI de leads, mas a base candidata ja contem esses elementos com testes e ajustes posteriores. O patch tambem comprime codigo e mistura mudancas de UI, dados e config. |
| `f0b1442` | Ajuste de dashboard de leads, superseded | Sim | Sim, `AUD-002` | Sim | Sim, para integracao direta | Parcial | Nao para integracao direta | Descartar | A base candidata ja contem a tela de leads com melhorias adicionais, incluindo controle de pagina por estado, protecao de verificacao de sessao e testes. Integrar direto poderia regredir o estado atual. |

## Evidencias principais

### Equivalencia funcional na base candidata

`git cherry -v <candidate> <mvp-head>` marcou os 8 commits com `+`, ou seja, nao ha patch equivalente exato na base candidata. Mesmo assim, a comparacao semantica mostrou que os valores de produto foram incorporados por commits posteriores e mais limpos.

O commit `2a78cc4 feat: add property data admin pipeline` na base candidata inclui:

- `app/api/admin/leads/route.ts`;
- `getLeads` em `lib/supabase.ts`;
- testes de geocoding, property images, Supabase e admin;
- `docs/PROPERTY_DATA_RUNBOOK.md`;
- migration `supabase/migrations/20260608185118_property_data_storage.sql`;
- ajustes de admin/property data.

O estado atual da base candidata tambem contem:

- `app/api/admin/leads/route.ts`;
- `getLeads`;
- tela de leads no admin;
- testes em `__tests__/pages/admin-page.test.tsx`;
- testes em `__tests__/lib/supabase.test.ts`.

### DevCheck

`7d50856` restaura uma versao fraca de `devcheck.json`:

```text
coverage_threshold: 80
git_check.blocking: false
integration_tests.blocking: false
coverage.blocking: false
security_scan.blocking: false
```

A base candidata atual possui configuracao mais forte:

```text
coverage_threshold: 90
git_check.blocking: true
git_check.require_clean: true
security_cmd: npm run check:security
security_scan.blocking: true
coverage.blocking: true
```

### README/hook tests

`397f0df`, `1fc70b4` e `94e694f` modificam `README.md` para validar hook e introduzem ruido (`# test`, `# hook test`, caracteres nulos/alteracao de codificacao). Nao ha problema real de produto ou consolidacao resolvido por esses commits.

### Leads/admin

`efa46b3` e `f0b1442` tem valor historico porque mostram a origem da tela de leads, mas a base candidata ja contem a funcionalidade em estado superior. A comparacao `f0b1442..a6233da` mostra melhorias posteriores na base candidata, incluindo:

- `useRef` para evitar duplicidade de verificacao de sessao;
- tratamento melhor da resposta de login;
- campos de imovel menos rigidos;
- paginacao de leads via estado;
- testes adicionais.

## Decisao final aprovada

| Destino | Commits |
|---|---|
| Integrar | Nenhum |
| Reescrever | Nenhum |
| Arquivar como referencia historica | Branch/worktree `imovel-sp-mvp` ate aprovacao do Owner |
| Descartar para integracao direta | `281d987`, `0d38f79`, `7d50856`, `397f0df`, `1fc70b4`, `94e694f`, `efa46b3`, `f0b1442` |

## Proximas acoes recomendadas

1. Considerar `imovel-sp-mvp` sem pendencia de integracao direta.
2. Executar `AUD-003` para classificar estado das worktrees, artefatos `.devcheck`, `.gitignore` e working trees sujas.
3. Manter a regra: nenhuma remocao de worktree antes de confirmacao explicita do Owner.

## Validacao

- Nenhum commit integrado.
- Nenhum `cherry-pick` executado.
- Nenhum merge executado.
- Nenhum arquivo de produto alterado.
- Nenhum arquivo removido.
- Nenhum push executado.
- Resultado limitado a classificacao documental do `AUD-002`.
