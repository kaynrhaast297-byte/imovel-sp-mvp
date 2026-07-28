# Politica de seguranca

## Baseline de dependencias

- `npm audit --omit=dev` deve concluir sem vulnerabilidades conhecidas.
- Vulnerabilidades em dependencias de producao bloqueiam a entrega.
- Excecoes devem identificar o advisory, o caminho afetado, o risco, os controles e a data de revisao.
- `npm audit fix --force` nao deve ser usado sem uma migracao separada e validada.

## Excecao temporaria: cadeia de desenvolvimento do ESLint

| Campo | Valor |
| --- | --- |
| Status | Aceita temporariamente para ferramentas de desenvolvimento |
| Registrada em | 2026-07-27 |
| Revisar ate | 2026-08-27 |
| Advisory raiz | `GHSA-mh99-v99m-4gvg` / `CVE-2026-14257` |
| Severidade | High |
| Pacote vulneravel | `brace-expansion@1.1.16` |
| Correcao indicada pelo audit | Atualizacao major do ESLint |

### Evidencias

- `npm audit` reporta nove entradas High derivadas do mesmo advisory transitivo.
- O caminho afetado e `eslint` / `eslint-config-next` -> `minimatch@3.1.5` -> `brace-expansion@1.1.16`.
- `npm audit --omit=dev` retorna zero vulnerabilidades.
- A cadeia e usada por lint e configuracao de desenvolvimento; ela nao faz parte do runtime de producao nem processa entrada HTTP da aplicacao.

### Decisao

A correcao automatica disponivel exige uma mudanca major ou uma versao incompativel de configuracao. Forcar essa alteracao agora pode quebrar o lint e reduzir a confiabilidade do gate. A excecao permanece restrita ao advisory acima ate existir uma atualizacao compativel e validada da cadeia ESLint/Next.js.

### Controles compensatorios

- Manter `npm audit --omit=dev` como bloqueio obrigatorio.
- Executar lint, TypeScript, testes, build e E2E antes do merge.
- Nao expor glob patterns controlados por usuarios a essa cadeia de ferramentas.
- Revisar o advisory e as versoes de ESLint, `eslint-config-next`, `minimatch` e `brace-expansion` ate a data definida.

### Referencias

- GitHub Advisory Database: <https://github.com/advisories/GHSA-mh99-v99m-4gvg>
- npm audit: <https://docs.npmjs.com/cli/v11/commands/npm-audit>
