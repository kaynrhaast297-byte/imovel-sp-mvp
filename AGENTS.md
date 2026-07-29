# ImovelSP Agent Rules

This repository is in Desenvolvimento de Produto v1.0.

`Consolidacao v1.0` was formally closed on 2026-07-29 after the repository,
`master`, CI, production deploy, and migration history were aligned.

Workspace oficial de desenvolvimento:

```text
D:\ESTUDOS\PROJETOS\imovel-sp-property-data-clean
```

## Regras inegociaveis

- Toda feature nova deve nascer de issue com problema, criterio de aceite e plano de validacao.
- Nenhum clone/worktree local de `imovel-sp-*`, exceto o workspace oficial, recebe implementacao nova.
- Em caso de duvida entre criar feature nova e consolidar uma existente, consolidacao vence.
- Toda mudanca deve nascer no workspace oficial, em branch propria, e entrar em `master` por pull request.
- Os riscos deferidos de autenticacao admin e rate limit da IA permanecem rastreados nas issues `#15` e `#16`.

## Antes de implementar

Responda sim para todos os itens abaixo. Se algum item falhar, adie a implementacao.

- Existe uma issue ou item de auditoria rastreavel?
- Existe um problema real descrito?
- Existe fonte oficial, fonte tecnica confiavel ou experiencia pratica claramente declarada?
- Existe criterio de aceitacao?
- Existe plano de validacao proporcional ao risco?
- A mudanca reduz ou controla complexidade?
- A mudanca aproxima o projeto de producao?

## Regra de pesquisa

Para qualquer problema de programacao, arquitetura, deploy, seguranca, performance, banco, frontend ou ferramenta:

1. Pesquisar primeiro em documentacao oficial ou fonte tecnica confiavel.
2. Registrar problema pesquisado, fonte consultada e solucao escolhida.
3. Separar fatos documentados de hipotese/opiniao de arquitetura.
4. Implementar apenas depois de entender o padrao recomendado.
5. Validar com lint, type-check, teste, build ou revisao manual proporcional ao risco.
6. Entregar resumo com fontes e comandos de validacao.

## Definition of Done

Uma mudanca so esta pronta quando:

- a fonte consultada foi registrada;
- o escopo original foi respeitado;
- a validacao relevante passou;
- a documentacao minima foi atualizada;
- o git esta limpo ou as alteracoes pendentes estao explicitamente justificadas;
- a mudanca resolve a issue original;
- nao houve expansao de escopo.

## Fontes de governanca

- GitHub Milestones: https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones
- GitHub Protected Branches: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- Managing branch protection rules: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule
- GitHub Actions Node.js CI: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
