# Imovel SP MVP

[![Coverage](https://img.shields.io/badge/coverage-96%25-brightgreen)](#testes-automatizados)
[![E2E](https://img.shields.io/badge/Playwright-35%20cenarios-2EAD33)](#testes-end-to-end)
[![Accessibility](https://img.shields.io/badge/WCAG%20AA-critical%2Fserious%20verdes-2563eb)](#testes-end-to-end)

Comparador de precos de imoveis em Sao Paulo. A ideia central do MVP e ajudar o usuario a entender se um imovel esta abaixo, dentro ou acima da media local.

## Funcionalidades atuais

- Busca paginada por bairro/cidade, tipo, negocio, quartos e preco maximo
- Listagem com cards de imoveis
- Pagina de detalhes do imovel
- Analise de preco com comparacao por imoveis similares
- Formulario de contato do imovel com validacao
- Painel admin para cadastro manual
- API REST para leitura/escrita de imoveis e criacao de leads
- Supabase com RLS para leitura publica e escrita administrativa

## Stack

- Next.js + React + TypeScript
- Supabase/PostgreSQL
- Tailwind CSS
- React Hook Form + Zod

## Como executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Variaveis de ambiente

Crie `.env.local` com base em `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
IMOVEL_ADMIN_TOKEN=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_WHATSAPP_MESSAGE=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` pode ser usada no browser para leitura publica. `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` deve ficar somente no servidor e e usada para criar/editar/inativar imoveis. `IMOVEL_ADMIN_TOKEN` e o token digitado no painel `/admin`.

`NEXT_PUBLIC_WHATSAPP_NUMBER` e `NEXT_PUBLIC_WHATSAPP_MESSAGE` sao usados apenas na home para montar o link e o QR code do WhatsApp.

## Banco de dados

Revise `supabase_schema.sql` e execute no SQL Editor do Supabase depois de confirmar as mudancas.

O schema atual habilita RLS nas tabelas publicas, permite leitura anonima apenas de imoveis ativos, cria a tabela de leads, adiciona indices para busca/paginacao e reserva escrita para o backend usando chave server-side.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run type-check
npm test
npm run test:watch
npm run test:coverage
npm run test:e2e
npm run test:e2e:report
```

## Testes automatizados

O projeto usa Vitest com Testing Library para testes unitarios, de componentes e de rotas API.

```bash
npm test
npm run test:watch
npm run test:coverage
```

O relatorio visual de cobertura e gerado em `coverage/index.html`. A interface `vitest --ui` e opcional e requer instalar `@vitest/ui` separadamente.

Sao 60 testes cobrindo regras de preco, adaptador Supabase, autenticacao admin, componentes e contratos das APIs de IA, analise, imoveis e leads. O escopo de cobertura dos modulos criticos e explicito em `vitest.config.ts`, com thresholds que bloqueiam regressoes no CI.

## Testes end-to-end

O Playwright possui 35 cenarios cobrindo os fluxos principais, filtros combinados, ordenacao, estados vazios/erro, leads, paginacao, responsividade mobile, snapshots visuais e acessibilidade WCAG AA.

```bash
npm run build
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report
```

O relatorio HTML e gerado em `playwright-report/`. No CI, os testes E2E usam dois workers em paralelo e o relatorio fica disponivel como artefato por 14 dias.

## IA local com Ollama

A rota `/api/ai` envia prompts para uma instancia local do Ollama. Para testar manualmente:

```bash
ollama pull qwen2.5-coder:7b
ollama serve
npm run dev
```

Depois acesse `http://localhost:3000/ai` ou chame a API:

```bash
curl http://localhost:3000/api/ai
curl -X POST http://localhost:3000/api/ai -H "Content-Type: application/json" -d "{\"prompt\":\"Explique Next.js em uma linha.\"}"
```

Variaveis opcionais:

```bash
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:7b
```

## CI

O workflow `.github/workflows/ci.yml` roda em pushes e pull requests para `master`, `main` e `develop`:

- `npm run test:coverage`
- `npm run lint`
- `npm run type-check`
- `npm run build`
- `npm run test:e2e` com relatorio HTML e execucao paralela

## Proximos passos

- Executar o schema atualizado no Supabase para criar `leads`
- Criar listagem administrativa de leads
- Adicionar upload/galeria de fotos
- Criar login real com Supabase Auth para o admin
- Evoluir a analise para ponderar preco/m2, quartos, bairro, tipo, negocio e area
- Adicionar mapa real com dados de geolocalizacao
- Adicionar edicao/listagem administrativa de imoveis cadastrados
