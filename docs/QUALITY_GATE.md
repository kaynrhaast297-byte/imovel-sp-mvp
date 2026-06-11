# Quality Gate

O DevCheck e o portao local obrigatorio de todos os projetos. Ele funciona sem IA e deve evoluir
continuamente. Nenhuma entrega esta pronta para push, PR, merge ou finalizacao sem comprovacao local,
Git limpo e CI remoto verdes.

A fonte oficial usada pelo projeto esta versionada em `tools/devcheck`. Instalacoes globais podem ser
sincronizadas depois, mas nunca substituem a versao local durante a validacao.

## Regra obrigatoria

```text
Implementar -> validar candidato -> commit local -> npm run gate -> push -> CI verde -> aprovacao humana
```

- Nunca usar `--no-verify` para contornar o gate.
- Qualquer `FAIL`, `WARN`, erro interno ou etapa obrigatoria ausente bloqueia a entrega.
- Um check novo necessario deve ser incorporado ao gate, nao executado apenas uma vez.
- Uma falha ou falso resultado do DevCheck vira prioridade antes da feature.
- Seguranca falha de forma fechada: se o audit nao puder ser executado, a entrega nao e aprovada.
- O projeto nao aceita vulnerabilidades conhecidas de nenhuma severidade no lockfile.
- Ollama e outras IAs podem revisar o trabalho, mas nao sao dependencia do gate tecnico.

O commit local acontece antes do gate final porque o requisito de Git limpo so pode ser provado
depois que o candidato foi commitado. Nada e enviado ao GitHub ate o gate final passar.

## Camadas locais

| Camada DevCheck | Validacao executada | Bloqueia |
|---|---|---|
| Git Check | Segredos, arquivos sensiveis, diff commitado e working tree limpa | Sim |
| Quality Gates | ESLint sem warnings e build de producao | Sim |
| Unit Tests | Vitest | Sim |
| Integration Tests | TypeScript e testes integrados | Sim |
| E2E Tests | Playwright sobre build de producao | Sim |
| Coverage | Vitest com thresholds do projeto | Sim |
| Security Scan | Segredos rastreados e dependencias vulneraveis | Sim |
| Git Check Final | Confirma que o proprio gate nao sujou a working tree | Sim |

## Comandos

```bash
npm run hooks:install
npm run hooks:verify
npm run lint
npm run type-check
npm run test
npm run build
npm run check:security
npm run gate
npm run gate:security
```

`npm run hooks:install` configura o hook versionado em `.githooks/pre-push`. Depois disso, todo
`git push` chama automaticamente `npm run gate`.

O E2E normal inicia um servidor isolado em uma porta livre e nunca reutiliza silenciosamente um
servidor local desconhecido. Servidor externo so e aceito quando `PLAYWRIGHT_EXTERNAL_SERVER=1`.

## Evidencias

- DevCheck: `.devcheck/logs/ultima-execucao.txt`
- Cobertura: `coverage/index.html`
- Playwright: `playwright-report/index.html`
- CI oficial: GitHub Actions

Os logs locais sao ignorados pelo Git para que o gate possa manter a working tree limpa. O resultado
relevante deve ser resumido no relatorio da feature e confirmado novamente pelo CI.

## Melhoria continua

1. Registre o risco e um caso reproduzivel.
2. Adicione ou melhore o check automatizado.
3. Prove que o check falha antes da correcao e passa depois.
4. Atualize esta documentacao quando a politica mudar.
5. Nao finalize a feature enquanto a lacuna permitir uma falsa aprovacao.
