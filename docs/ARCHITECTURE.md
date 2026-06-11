# Architecture

## Visao geral

O ImovelSP e um MVP em Next.js para comparar precos de imoveis em Sao Paulo. O produto combina listagem publica, pagina de detalhe, analise de preco, formulario de leads, painel admin e persistencia em Supabase/PostgreSQL.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS |
| Formularios | React Hook Form, Zod |
| Dados | Supabase/PostgreSQL |
| Testes unitarios/API | Vitest, Testing Library |
| E2E | Playwright |
| IA local | Ollama em `localhost:11434` |

## Organizacao do codigo

```text
app/                 Rotas publicas, admin e APIs do Next.js
components/          Componentes reutilizaveis de UI
lib/                 Tipos, validacao, Supabase, auth admin e utilitarios
__tests__/           Testes unitarios, componentes e APIs
e2e/                 Testes Playwright
scripts/             Automacoes locais do projeto
tools/devcheck/      Fonte versionada do portao profissional de qualidade
docs/                Regras, arquitetura, planos e registros do AI Quality Lab
reports/             Relatorios gerados por validacoes
supabase/migrations/ Migrations incrementais do banco
```

## Fluxos principais

### Busca publica

1. Usuario acessa a home ou `/busca`.
2. Filtros sao enviados para a API de imoveis.
3. A API consulta Supabase com filtros seguros.
4. Cards exibem os resultados e conduzem para `/imovel/[id]`.

### Detalhe do imovel

1. Usuario acessa `/imovel/[id]`.
2. A pagina carrega dados do imovel.
3. A analise de preco compara o item com imoveis similares.
4. O formulario de lead envia dados para `POST /api/leads`.

### Admin

1. Admin acessa `/admin`.
2. Sessao administrativa deve ser protegida por cookie HttpOnly.
3. Escritas passam por validacao server-side.
4. Chaves secretas permanecem apenas no servidor.

### IA local

1. Usuario acessa `/ai` ou chama `/api/ai`.
2. A API envia o prompt ao Ollama.
3. O modelo recomendado e `qwen2.5-coder:7b`.

## Principios arquiteturais

- APIs validam entrada com Zod antes de tocar o banco.
- Frontend nunca recebe chaves server-side.
- Supabase RLS deve proteger leitura/escrita por regra de banco.
- Testes devem cobrir contrato de API, componentes criticos e fluxos reais.
- Uploads e funcionalidades de escrita exigem revisao de seguranca antes do merge.
