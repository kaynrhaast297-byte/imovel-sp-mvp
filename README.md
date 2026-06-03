# Imovel SP MVP

Comparador de precos de imoveis em Sao Paulo. A ideia central do MVP e ajudar o usuario a entender se um imovel esta abaixo, dentro ou acima da media local.

## Funcionalidades atuais

- Busca por bairro/cidade, tipo, negocio, quartos e preco maximo
- Listagem com cards de imoveis
- Pagina de detalhes do imovel
- Analise de preco com comparacao por imoveis similares
- Painel admin para cadastro manual
- API REST para leitura e escrita de imoveis
- Supabase com RLS para leitura publica e escrita administrativa

## Stack

- Next.js + React + TypeScript
- Supabase/PostgreSQL
- Tailwind CSS

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
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` pode ser usada no browser para leitura publica. `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` deve ficar somente no servidor e e usada para criar/editar/inativar imoveis. `IMOVEL_ADMIN_TOKEN` e o token digitado no painel `/admin`.

## Banco de dados

Execute `supabase_schema.sql` no SQL Editor do Supabase.

O schema atual habilita RLS nas tabelas publicas, permite leitura anonima apenas de imoveis ativos e reserva escrita para o backend usando chave server-side.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run type-check
```

## Proximos passos

- Adicionar upload/galeria de fotos
- Criar login real com Supabase Auth para o admin
- Evoluir a analise para ponderar preco/m2, quartos, bairro, tipo, negocio e area
- Adicionar mapa e dados de geolocalizacao
- Adicionar edicao/listagem administrativa de imoveis cadastrados
