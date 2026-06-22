# Engineering Rules

Estas regras definem como trabalhar no ImovelSP durante e depois da Consolidacao v1.0.

## Prioridade

Se existir duvida entre:

- criar uma nova funcionalidade; ou
- consolidar uma existente;

a consolidacao tem prioridade.

Excecao: correcao critica de seguranca ou disponibilidade.

## Evidencia antes de arquitetura

Nenhuma recomendacao de arquitetura deve ser aceita apenas porque parece boa.

Toda recomendacao deve indicar uma destas bases:

- documentacao oficial;
- padrao amplamente adotado;
- experiencia pratica consolidada;
- hipotese/opiniao explicitamente marcada como tal.

## Fluxo minimo

1. Definir problema.
2. Consultar fonte oficial ou confiavel.
3. Criar issue ou vincular a item de auditoria.
4. Definir criterio de aceite.
5. Definir validacao.
6. Implementar somente no projeto candidato oficial.
7. Rodar validacoes.
8. Registrar resultado e fontes.

## Validacao proporcional ao risco

- Mudanca de documentacao: revisar diff e links.
- Mudanca de UI: lint/type-check e, quando visual, Playwright/screenshot.
- Mudanca de API: testes de rota e casos de erro.
- Mudanca de auth, dados, upload, env ou seguranca: testes, security check, revisao manual e validacao de deploy quando aplicavel.
- Mudanca de CI/gate: provar falha quando possivel e provar sucesso depois.

## Anti-padroes bloqueados

- "Ja que estou aqui..." sem issue.
- Feature em clone antigo.
- Refatoracao sem criterio de aceite.
- Codigo sem fonte quando envolve API, framework, seguranca ou deploy.
- Aceitar warning como sucesso em etapa obrigatoria.
- Documentacao que nao gera decisao, criterio ou acao.

## Comandos preferenciais

```bash
npm run lint
npm run type-check
npm run test
npm run test:coverage
npm run check:security
npm run gate
```

## Fontes base

- GitHub Protected Branches: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- Managing branch protection rules: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule
- GitHub Actions Node.js CI: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
