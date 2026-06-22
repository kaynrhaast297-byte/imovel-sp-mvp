# ADR 0001: Fonte da Verdade do ImovelSP

Status: aprovado como decisao de governanca v0.1.

Data: 2026-06-19.

## Contexto

O workspace contem multiplos clones locais `imovel-sp-*` apontando para o mesmo projeto remoto. Isso cria risco de divergencia entre codigo local, branch principal, GitHub e deploy.

Uma pasta local isolada nao e suficiente como fonte da verdade. A fonte final precisa alinhar quatro niveis:

1. Repositorio GitHub.
2. Branch principal.
3. Workspace local.
4. Deploy em producao.

## Decisao

`D:\ESTUDOS\PROJETOS\imovel-sp-property-data-clean` passa a ser a base candidata oficial da Consolidacao v1.0.

Ela so vira fonte final quando:

- branch principal estiver alinhada;
- GitHub apontar para o mesmo estado validado;
- deploy estiver validado;
- CI/status checks estiverem verdes;
- clones tiverem sido inventariados e consolidados.

## Consequencias

- Toda nova mudanca nasce no projeto candidato oficial.
- Clones locais ficam em modo somente leitura.
- Melhorias dos clones devem ser inventariadas antes de arquivamento.
- Divergencias devem virar issues na milestone `Consolidacao v1.0`.

## Fontes

- GitHub Milestones: https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones
- GitHub Protected Branches: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
