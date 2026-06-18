# Ambiente Vercel

Este projeto depende de variaveis server-side na Vercel para operar o painel `/admin`.
O problema classico a evitar e: localhost funciona, mas producao retorna token invalido ou erro 500
porque a Vercel tem variaveis ausentes, antigas ou diferentes.

## Variaveis obrigatorias

Configure em **Production** e, quando usar previews reais, tambem em **Preview**:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
IMOVEL_ADMIN_TOKEN
SUPABASE_SECRET_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` tambem e aceito pelo app, mas a preferencia operacional e
`SUPABASE_SECRET_KEY`. Nunca use prefixo `NEXT_PUBLIC_` para chaves administrativas.

## Fonte de verdade

A Vercel deve ser a fonte de verdade para o ambiente de producao. O `.env.local` deve ser
sincronizado a partir dela quando possivel:

```bash
npm run vercel:env:pull:production
```

Se usar o dashboard da Vercel, atualize o `.env.local` manualmente com os mesmos valores
necessarios para validar smoke tests locais. Nao commite `.env.local`.

## Checklist depois de alterar envs

1. Atualize as variaveis em **Settings > Environment Variables** do projeto `imovel-sp-mvp`.
2. Confirme que `IMOVEL_ADMIN_TOKEN` local e o de **Production** sao o mesmo valor.
3. Confirme que existe `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` em **Production**.
4. Faca redeploy da producao; env antiga nao muda deploy ja criado.
5. Rode:

```bash
npm run env:check:production
npm run vercel:smoke
```

## O que o smoke valida

`npm run vercel:smoke` nao imprime segredos. Ele valida:

- API publica de imoveis responde.
- Login admin em producao aceita o token local.
- `/api/admin/environment` esta acessivel com cookie HttpOnly.
- Vercel possui envs obrigatorias para leitura publica, login admin e escrita Supabase.
- API admin de leads consegue usar a chave server-side do Supabase.

Se o smoke falhar com login admin, o problema provavel e `IMOVEL_ADMIN_TOKEN` divergente na Vercel.
Se falhar em leads ou ambiente admin, o problema provavel e `SUPABASE_SECRET_KEY` ou
`SUPABASE_SERVICE_ROLE_KEY` ausente/incorreta na Vercel.

## Rotas de diagnostico

- `POST /api/admin/session`: retorna `503` quando `IMOVEL_ADMIN_TOKEN` nao esta configurado.
- `GET /api/admin/environment`: rota protegida por sessao admin que retorna apenas status e nomes
  de variaveis, nunca valores.
- Rotas admin que dependem do Supabase retornam `503` com mensagem de configuracao quando falta
  chave administrativa, em vez de erro generico 500.
