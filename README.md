# Imovel SP MVP

[![Coverage](https://img.shields.io/badge/coverage-96%25-brightgreen)](#testes-automatizados)
[![E2E](https://img.shields.io/badge/Playwright-37%20cenarios-2EAD33)](#testes-end-to-end)
[![Accessibility](https://img.shields.io/badge/WCAG%20AA-critical%2Fserious%20verdes-2563eb)](#testes-end-to-end)

Comparador de precos de imoveis em Sao Paulo. A ideia central do MVP e ajudar o usuario a entender se um imovel esta abaixo, dentro ou acima da media local.

## Funcionalidades atuais

- Busca paginada por bairro/cidade, tipo, negocio, quartos e preco maximo
- Listagem com cards de imoveis
- Pagina de detalhes do imovel
- Analise de preco com comparacao por imoveis similares
- Formulario de contato do imovel com validacao
- Painel admin para cadastro manual com sessao HttpOnly
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
ADMIN_LOGIN_RATE_LIMIT_MAX=5
ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS=900000
LEAD_RATE_LIMIT_MAX=5
LEAD_RATE_LIMIT_WINDOW_MS=900000
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_WHATSAPP_MESSAGE=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` pode ser usada no browser para leitura publica. `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` deve ficar somente no servidor e e usada para criar/editar/inativar imoveis e salvar leads. `IMOVEL_ADMIN_TOKEN` e usado apenas para abrir uma sessao administrativa HttpOnly; as rotas protegidas nao aceitam o token diretamente.

Os limites de login e leads funcionam por IP e por processo do Next.js. Eles sao uma protecao adequada para o MVP local, mas devem ser substituidos por um limiter distribuido antes de escalar para multiplas instancias. Em producao, o proxy tambem precisa sobrescrever `x-forwarded-for` para que o IP usado pelo limiter seja confiavel.

`NEXT_PUBLIC_WHATSAPP_NUMBER` e `NEXT_PUBLIC_WHATSAPP_MESSAGE` sao usados apenas na home para montar o link e o QR code do WhatsApp.

## Banco de dados

O estado base do banco esta documentado em `supabase_schema.sql`. Mudancas incrementais ficam versionadas em `supabase/migrations/`.

O schema atual habilita RLS nas tabelas publicas, permite leitura anonima apenas de imoveis ativos, cria a tabela de leads, adiciona indices para busca/paginacao e reserva toda escrita para o backend usando chave server-side. As migrations de seguranca que restringem leads e a funcao automatica de RLS ja foram aplicadas ao projeto remoto.

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
npm run check:security
npm run gate
```

`npm run gate` executa o DevCheck em modo estrito e e obrigatorio antes de push, PR, merge ou
finalizacao. Instale o hook versionado uma vez com `npm run hooks:install`. Consulte
`docs/QUALITY_GATE.md` para a politica completa.

## Testes automatizados

O projeto usa Vitest com Testing Library para testes unitarios, de componentes e de rotas API.

```bash
npm test
npm run test:watch
npm run test:coverage
```

O relatorio visual de cobertura e gerado em `coverage/index.html`. A interface `vitest --ui` e opcional e requer instalar `@vitest/ui` separadamente.

Sao 84 testes cobrindo regras de preco, adaptador Supabase, sessao administrativa, rate limit, componentes e contratos das APIs de IA, analise, imoveis e leads. O escopo de cobertura dos modulos criticos e explicito em `vitest.config.ts`, com thresholds que bloqueiam regressoes no CI.

## Testes end-to-end

O Playwright possui 37 cenarios cobrindo os fluxos principais, sessao administrativa segura, filtros combinados, ordenacao, estados vazios/erro, leads, paginacao, responsividade mobile, snapshots visuais e acessibilidade WCAG AA.

```bash
npm run build
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report
```

O relatorio HTML e gerado em `playwright-report/`. No CI, os testes funcionais rodam no Ubuntu com dois workers, enquanto os snapshots visuais rodam no Windows, ambiente em que os baselines foram gerados. Os relatorios ficam disponiveis como artefatos por 14 dias.

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

O workflow `.github/workflows/ci.yml` roda em pushes para `master`, `main`, `develop` e `feature/**`, alem de pull requests para as branches principais:

- `npm run test:coverage`
- `npm run lint`
- `npm run type-check`
- `npm run build`
- `npm run test:e2e` com relatorio HTML, execucao paralela no Ubuntu e snapshots visuais no Windows
- `npm run check:security` com scan de segredos rastreados e `npm audit` sem vulnerabilidades aceitas

## Proximos passos

- Criar listagem administrativa de leads
- Adicionar upload/galeria de fotos
- Criar login real com Supabase Auth para o admin
- Evoluir a analise para ponderar preco/m2, quartos, bairro, tipo, negocio e area
- Adicionar mapa real com dados de geolocalizacao
- Adicionar edicao/listagem administrativa de imoveis cadastrados
