# Imovel SP MVP

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
```

## Proximos passos

- Executar o schema atualizado no Supabase para criar `leads`
- Criar listagem administrativa de leads
- Adicionar upload/galeria de fotos
- Criar login real com Supabase Auth para o admin
- Evoluir a analise para ponderar preco/m2, quartos, bairro, tipo, negocio e area
- Adicionar mapa real com dados de geolocalizacao
- Adicionar edicao/listagem administrativa de imoveis cadastrados
