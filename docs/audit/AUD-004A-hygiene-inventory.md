# AUD-004A - Inventario da Higiene Operacional

Status: Inventario concluido; nenhuma higiene executada.

Data: 2026-06-20

Fase: Consolidacao v1.0

Owner: Jonathan Medeiros

Base candidata oficial:

```text
D:\ESTUDOS\PROJETOS\imovel-sp-property-data-clean
```

## Objetivo

Responder quais artefatos deixam a working tree suja ou podem confundir a Consolidacao v1.0, sem alterar nenhum arquivo.

## Fontes consultadas

- Git gitignore: `.gitignore` especifica arquivos intencionalmente nao rastreados; arquivos ja rastreados nao sao afetados.
  https://git-scm.com/docs/gitignore
- GitHub Docs - Ignoring files: uso de `.gitignore` para evitar versionar arquivos gerados localmente.
  https://docs.github.com/en/get-started/git-basics/ignoring-files
- NIST SP 800-128: controle deliberado e rastreavel de mudancas de configuracao.
  https://csrc.nist.gov/pubs/sp/800/128/upd1/final

## Comandos usados

```powershell
git status --short
git status --short --ignored
git ls-files .devcheck .next coverage playwright-report test-results reports .vercel e2e/__screenshots__
git check-ignore -v <path>
Get-Content -Raw .gitignore
```

## Resultado produzido

O `.gitignore` da base candidata ja cobre os principais artefatos gerados localmente:

- `.next`
- `node_modules`
- `.npm-cache/`
- `.env.local`
- `.env`
- `dist`
- `coverage`
- `test-results`
- `playwright-report`
- `*.log`
- `tsconfig.tsbuildinfo`
- `.devcheck/logs/`
- `.devcheck/ai-report.md`
- `__pycache__/`
- `*.pyc`
- `.vercel`
- `.local/`

O principal problema de higiene nao e falta geral de `.gitignore`; e a existencia de artefatos ja rastreados em historico/worktrees antigas e working trees sujas por itens locais.

## Inventario classificado

| Item | Onde aparece | Classificacao | Motivo | Acao recomendada no AUD-004B |
|---|---|---|---|---|
| Documentos da Consolidacao (`AGENTS.md`, `docs/AUDITORIA_CRITICA.md`, `docs/GOVERNANCE.md`, `docs/CONSOLIDATION_EXIT_CRITERIA.md`, `docs/adr/`, `docs/audit/`, `docs/standards/`) | `imovel-sp-property-data-clean` | Versionar | Sao evidencias e governanca aprovadas da Consolidacao v1.0. | Adicionar ao controle de versao quando houver aprovacao para commit. |
| `docs/DECISIONS.md` | `imovel-sp-property-data-clean` | Versionar | Registro de decisoes aprovado pelo Owner. | Manter e versionar. |
| `.devcheck/logs/ultima-execucao.txt` | `imovel-sp-mvp` | Remover do Git / manter ignorado | Artefato gerado automaticamente; esta rastreado no historico antigo e modificado localmente. | Remover do rastreamento em acao controlada se essa branch/worktree ainda for mantida; nao copiar para a base candidata. |
| `.devcheck/logs/20260610_204833_approve.txt` | `imovel-sp-mvp` | Ignorar | Artefato gerado localmente e nao rastreado. | Nao versionar; manter ignorado. |
| `.devcheck/ai-report.md` | `imovel-sp-mvp` historico antigo | Remover do Git / manter ignorado | Relatorio gerado automaticamente; ja coberto por `.gitignore` na base candidata. | Nao integrar; remover do rastreamento apenas em acao de higiene aprovada. |
| `.gitignore` com `+.vercel` | `imovel-sp-master-validation` | Descartar alteracao local apos aprovacao | A entrada `.vercel` ja existe na base candidata. | Reverter/descartar somente no AUD-004B ou no arquivamento controlado dessa worktree. |
| `.next/` | Todas/varias worktrees | Ignorar | Saida local de build/dev server. | Manter ignorado. |
| `node_modules/` | Todas/varias worktrees | Ignorar | Dependencias instaladas localmente. | Manter ignorado. |
| `coverage/` | Worktrees com execucao de teste | Ignorar | Saida local de cobertura. | Manter ignorado. |
| `playwright-report/` | Worktrees com E2E | Ignorar | Saida local do Playwright. | Manter ignorado. |
| `test-results/` | Worktrees com E2E/testes | Ignorar | Saida local de testes. | Manter ignorado. |
| `tsconfig.tsbuildinfo` | Worktrees TypeScript | Ignorar | Cache incremental local do TypeScript. | Manter ignorado. |
| `.vercel/` | `property-data-clean`, `master-validation` | Ignorar / ja coberto | Configuracao local da Vercel. | Manter ignorado; nenhuma acao adicional. |
| `.local/` | `property-data-clean` | Ignorar / ja coberto | Diretorio local de ferramenta/ambiente. | Manter ignorado. |
| `.codex-*.log`, `.dev-server*.log`, `debug.log` | Worktrees antigas | Ignorar / ja coberto por `*.log` | Logs locais gerados por execucao de servidor ou agente. | Manter ignorado; nao versionar. |
| `tools/devcheck/**/__pycache__/`, `*.pyc` | Worktrees com DevCheck Python | Ignorar / ja coberto | Cache Python local. | Manter ignorado. |
| `reports/validation-report.md` | Base candidata e worktrees antigas | Manter | Relatorio versionado usado como evidencia historica/validacao. | Manter versionado ate decisao especifica em issue propria, se houver. |
| `e2e/__screenshots__/visual.spec.ts/*.png` | Base candidata e worktrees antigas | Manter | Baselines visuais versionados para testes E2E. | Manter versionado; nao tratar como lixo. |

## Hipoteses confirmadas

- A base candidata ja ignora os principais artefatos locais.
- `.devcheck/logs/` e `.devcheck/ai-report.md` ja estao cobertos por `.gitignore` na base candidata.
- Logs de servidor/Codex estao cobertos por `*.log`.
- `reports/validation-report.md` e screenshots E2E sao rastreados e nao devem ser classificados automaticamente como lixo.

## Hipoteses rejeitadas

- Rejeitada a hipotese de que o AUD-004A deveria alterar `.gitignore`.
- Rejeitada a hipotese de que toda pasta `reports/` e todo screenshot sao artefatos indevidos.
- Rejeitada a hipotese de que `.vercel` ainda precise ser adicionada ao `.gitignore` da base candidata.

## Risco antes

- Higiene operacional podia virar alteracao ampla e misturar `.gitignore`, DevCheck, logs, CI e remocao de artefatos.
- Nao estava claro quais itens eram lixo, quais eram evidencias e quais eram arquivos versionados intencionais.

## Risco depois

- Itens de higiene foram classificados sem alterar o repositorio.
- O AUD-004B pode ser menor: versionar documentos aprovados, tratar `.devcheck` rastreado nas worktrees antigas e resolver a alteracao local de `.gitignore` em `master-validation`.
- Nao ha evidencia de necessidade imediata de ampliar `.gitignore` da base candidata.

## Proxima prioridade

AUD-004B - Execucao controlada da higiene operacional, apos aprovacao deste inventario.

Escopo sugerido:

- versionar documentos aprovados da Consolidacao;
- tratar artefatos `.devcheck` rastreados em worktree antiga, sem integrar commits;
- resolver `.gitignore` sujo em `master-validation`;
- validar working trees com `git status --short`.

## Validacao

- Nenhum arquivo removido.
- Nenhum `.gitignore` alterado.
- Nenhum artefato limpo.
- Nenhum merge executado.
- Nenhum push executado.
- Nenhuma feature alterada.
- Resultado limitado a inventario e classificacao.
