# Governance

Governance Version: 0.1
Status: Approved
Effective Date: 2026-06-19
Owner: Jonathan Medeiros

## Decisao oficial

O ImovelSP entrou em `Consolidacao v1.0`.

Base candidata oficial:

```text
D:\ESTUDOS\PROJETOS\imovel-sp-property-data-clean
```

Esta base so vira fonte final quando branch principal, GitHub e deploy estiverem alinhados ao mesmo estado validado.

## Objetivo

Sair do modo de acumulacao de features e entrar em engenharia de produto estavel:

```text
Produto -> Governanca -> Codigo
```

## Escopo da Consolidacao v1.0

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

Existem quatro niveis que precisam convergir:

1. Repositorio GitHub.
2. Branch principal.
3. Workspace local candidato.
4. Deploy em producao.

Enquanto esses niveis divergirem, `property-data-clean` permanece base candidata, nao fonte final.

## Rastreabilidade

- Toda tarefa deve estar vinculada a uma issue ou item de auditoria.
- Toda issue de consolidacao deve pertencer a milestone `Consolidacao v1.0`.
- Todo PR deve citar a issue relacionada.
- Toda decisao estrutural deve ser registrada em ADR quando afetar arquitetura, processo ou fonte da verdade.

## Branch principal

A branch principal deve ser protegida antes do fechamento da Consolidacao v1.0.

Regras alvo:

- exigir pull request antes de merge;
- exigir status checks antes de merge;
- exigir branch atualizada antes de merge, se viavel;
- impedir force push;
- impedir delecao da branch protegida;
- exigir resolucao de conversas quando aplicavel.

## Fontes

- Milestones rastreiam grupos de issues e pull requests: https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones
- Protected branches definem requisitos para pushes/merges e status checks: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- Configuracao pratica de branch protection: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule
- CI Node.js no GitHub Actions: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
