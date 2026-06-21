# ADR 0002: Congelamento de Features na Consolidacao v1.0

Status: aprovado como decisao de governanca v0.1.

Data: 2026-06-19.

## Contexto

O projeto possui boa evolucao tecnica, mas tambem risco de dispersao: clones, features paralelas, melhorias visuais e refatoracoes podem competir com estabilizacao.

O principal risco identificado e iniciar novas funcionalidades antes de consolidar a base existente.

## Decisao

Durante a `Consolidacao v1.0`:

- nenhuma feature nova entra;
- nenhum clone recebe implementacao nova;
- consolidacao tem prioridade sobre feature;
- excecoes sao limitadas a seguranca critica, disponibilidade critica ou ajuste minimo para destravar a propria consolidacao.

## Criterio de desbloqueio

Features novas so voltam a ser consideradas depois que `docs/CONSOLIDATION_EXIT_CRITERIA.md` estiver atendido e a milestone `Consolidacao v1.0` for encerrada.

## Consequencias

- A velocidade aparente de features diminui.
- A confiabilidade do projeto aumenta.
- O backlog passa a ser rastreado por issues e milestone, nao por ideias soltas.
- Refatoracoes oportunistas ficam bloqueadas.

## Fontes

- GitHub Milestones: https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones
- Managing branch protection rules: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule
- GitHub Actions Node.js CI: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
