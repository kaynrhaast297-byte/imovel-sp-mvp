# ImovelSP Agent Rules

This repository is in Consolidacao v1.0.

Base candidata oficial:

```text
D:\ESTUDOS\PROJETOS\imovel-sp-property-data-clean
```

## Regras inegociaveis

- Nenhuma feature nova entra enquanto a milestone `Consolidacao v1.0` nao estiver fechada.
- Nenhum clone local de `imovel-sp-*` recebe implementacao nova. Clones ficam em modo somente leitura ate inventario e consolidacao.
- Em caso de duvida entre criar feature nova e consolidar uma existente, consolidacao vence.
- Excecoes so existem para correcao critica de seguranca ou disponibilidade.
- Toda mudanca deve nascer no projeto candidato oficial.

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
