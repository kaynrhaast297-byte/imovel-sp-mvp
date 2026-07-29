# Governance

Governance Version: 0.1
Status: Approved
Effective Date: 2026-06-19
Consolidation Status: Completed
Consolidation Closed: 2026-07-29
Owner: Jonathan Medeiros

## Decisao oficial

O ImovelSP concluiu a `Consolidacao v1.0` e entrou em
`Desenvolvimento de Produto v1.0`.

Workspace oficial de desenvolvimento:

```text
D:\ESTUDOS\PROJETOS\imovel-sp-property-data-clean
```

A fonte versionada final e `master` no GitHub. O workspace oficial, o CI e o
deploy devem permanecer alinhados a ela.

O rastreamento no GitHub foi criado retrospectivamente em 2026-07-29 para
corrigir uma lacuna de processo. As issues nao existiam durante a execucao
original dos AUDs; seus corpos registram essa condicao explicitamente.

## Objetivo

Sair do modo de acumulacao de features e entrar em engenharia de produto estavel:

```text
Produto -> Governanca -> Codigo
```

## Escopo historico da Consolidacao v1.0

As regras abaixo valeram durante a fase encerrada e permanecem registradas para
auditoria. Elas nao bloqueiam features aprovadas na fase atual.

Permitido:

- definir fonte da verdade;
- inventariar clones;
- corrigir higiene de git/workspace;
- fortalecer CI/CD e quality gates;
- transformar auditoria em issues;
- fechar riscos criticos;
- documentar decisoes essenciais;
- estabilizar deploy e branch principal.

Bloqueado:

- feature nova;
- refatoracao oportunista fora da auditoria;
- mudanca em clones locais;
- expansao de escopo sem issue e justificativa.

Excecoes:

- correcao critica de seguranca;
- correcao critica de disponibilidade;
- ajuste minimo necessario para destravar a consolidacao.

## Fonte da verdade

Os quatro niveis de fonte da verdade sao:

1. Repositorio GitHub.
2. Branch principal.
3. Workspace local oficial.
4. Deploy em producao.

No fechamento, os quatro niveis convergiram no commit `4e414fc8`. Divergencias
futuras voltam a bloquear releases ate novo alinhamento.

## Rastreabilidade

- Toda tarefa deve estar vinculada a uma issue ou item de auditoria.
- Toda issue de consolidacao deve pertencer a milestone `Consolidacao v1.0`.
- Todo PR deve citar a issue relacionada.
- Toda decisao estrutural deve ser registrada em ADR quando afetar arquitetura, processo ou fonte da verdade.

## Branch principal

A branch principal foi protegida em 2026-07-29.

Regras ativas:

- exigir pull request antes de merge;
- exigir os oito status checks confirmados antes de merge;
- exigir branch atualizada antes de merge;
- impedir force push;
- impedir delecao da branch protegida;
- exigir resolucao de conversas;
- aplicar a protecao ao administrador; bypass exige emergencia documentada.

## Proxima fase

Features voltam a ser permitidas desde que tenham issue, branch propria,
fontes, criterios de aceite, validacao proporcional e pull request. A primeira
entrega aprovada e a listagem administrativa de imoveis, sem misturar criacao,
upload ou exclusao no mesmo incremento.

## Fontes

- Milestones rastreiam grupos de issues e pull requests: https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones
- Protected branches definem requisitos para pushes/merges e status checks: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- Configuracao pratica de branch protection: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule
- CI Node.js no GitHub Actions: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
