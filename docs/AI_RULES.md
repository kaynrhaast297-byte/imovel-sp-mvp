# AI Rules

Este documento e o contrato de trabalho das IAs no ImovelSP. Antes de qualquer alteracao, leia tambem `docs/ARCHITECTURE.md` e `docs/FEATURE_PLAN.md`.

## Regras do projeto

1. MVP primeiro, expansao depois.
2. Seguranca antes de qualquer funcionalidade de escrita ou upload.
3. Qualidade dos dados acima de quantidade de dados.
4. Entender o codigo depois de cada implementacao.
5. Nada entra na `master` sem testes e revisao.
6. Separar seguranca, dados e UX em branches diferentes.
7. Consistencia acima de velocidade.
8. Sempre usar branch separada, testes obrigatorios e revisao por multiplas IAs.

## Fluxo obrigatorio de feature

```text
Criar branch
Implementar
Rodar testes unitarios
Rodar testes de API
Rodar E2E Playwright
Rodar build
Revisar com Ollama
Corrigir apontamentos
Validar novamente
Commit + push
Abrir PR para master
```

Comandos minimos por feature:

```bash
npm run check
npm run test:coverage
npm run build
npm run test:e2e
```

Para validacao completa em uma unica chamada:

```bash
npm run check:full
```

## Papeis das IAs

| IA | Papel |
|---|---|
| Codex | Implementacao, testes, scripts e verificacao local |
| Claude / ChatGPT | Revisao arquitetural e sanidade de produto |
| Ollama | Auditoria local de seguranca, bugs e edge cases |
| Humano | Decisao final antes do merge |

## Niveis de permissao

| Nivel | O que pode fazer |
|---|---|
| 1 - Livre | Explicar, documentar, criar testes e sugerir melhorias |
| 2 - Com revisao | Componentes, paginas e refatoracoes pequenas |
| 3 - Aprovacao obrigatoria | Auth, Supabase, RLS, Storage, APIs e CI/CD |
| 4 - Proibido | Apagar testes para passar, expor `.env`, merge automatico e commit automatico sem pedido |

## Regras de seguranca para IA

- Nunca exponha variaveis de ambiente.
- Nunca use `service_role` ou chave secreta no frontend.
- Nunca remova testes para fazer a suite passar.
- Nunca reduza validacao server-side para simplificar uma feature.
- Nunca misture mudancas de seguranca, dados e UX na mesma branch sem justificativa.
- Sempre explique riscos quando tocar auth, Supabase, RLS, Storage, APIs ou CI/CD.

## Modo aprendiz

Ao final de cada feature, entregue uma explicacao didatica com:

```text
O que foi feito?
Por que foi feito?
Quais riscos existem?
Quais testes cobrem isso?
O que devo estudar agora?
```

## Pergunta de sanidade

Antes de cada decisao de escopo:

```text
Qual e a menor versao util disso?
```
