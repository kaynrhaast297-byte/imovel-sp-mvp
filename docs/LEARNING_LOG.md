# Learning Log

Use este arquivo para registrar o modo aprendiz apos cada feature.

## Template

```text
Data:
Branch:
Feature:

O que foi feito?

Por que foi feito?

Quais riscos existem?

Quais testes cobrem isso?

O que devo estudar agora?
```

## 2026-06-08 - AI Quality Lab

Branch: `feature/ai-quality-lab`

O que foi feito?

- Criada a estrutura base de documentos, scripts e relatorios do AI Quality Lab.
- Adicionados comandos no `package.json` para health check, validacao completa e relatorio.

Por que foi feito?

- Para padronizar como IAs trabalham no projeto.
- Para reduzir risco de mudancas grandes sem revisao.
- Para deixar testes, seguranca e aprendizado como parte do fluxo.

Quais riscos existem?

- O processo pode ficar pesado se usado sem criterio.
- Scripts locais dependem de ambiente correto, como Node, npm, Git e Ollama.

Quais testes cobrem isso?

- `npm run health` valida ambiente e estrutura.
- `npm run report:validation` valida geracao do relatorio.
- `npm run check:full` passou com type-check, lint, 84 testes, build e 37 cenarios Playwright.

O que devo estudar agora?

- Como revisar PRs pequenos.
- Como ler falhas de teste sem apagar cobertura.
- Como separar seguranca, dados e UX em branches independentes.
