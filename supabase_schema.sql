-- Execute este SQL no Supabase SQL Editor.
-- Modelo de seguranca:
-- 1. visitantes leem apenas imoveis ativos;
-- 2. escrita passa pelo backend/admin com chave secreta server-side;
-- 3. todas as tabelas publicas ficam com RLS habilitado.

create extension if not exists pgcrypto;

create table if not exists imoveis (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  tipo text not null check (tipo in ('apartamento','casa','terreno','comercial','hotel')),
  negocio text not null check (negocio in ('venda','aluguel','temporada')),
  status text not null default 'ativo' check (status in ('ativo','vendido','alugado','inativo')),
  preco numeric not null check (preco >= 0),
  condominio numeric check (condominio is null or condominio >= 0),
  iptu numeric check (iptu is null or iptu >= 0),
  area_m2 numeric not null check (area_m2 > 0),
  quartos integer check (quartos is null or quartos >= 0),
  banheiros integer check (banheiros is null or banheiros >= 0),
  vagas integer check (vagas is null or vagas >= 0),
  bairro text not null,
  cidade text not null default 'Sao Paulo',
  estado text not null default 'SP',
  cep text,
  endereco text,
  latitude numeric,
  longitude numeric,
  fotos text[] default '{}'::text[],
  portal_origem text,
  url_original text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_imoveis_bairro on imoveis (bairro);
create index if not exists idx_imoveis_tipo on imoveis (tipo);
create index if not exists idx_imoveis_negocio on imoveis (negocio);
create index if not exists idx_imoveis_status on imoveis (status);
create index if not exists idx_imoveis_preco on imoveis (preco);
create index if not exists idx_imoveis_busca_bairro_cidade on imoveis (bairro, cidade);

create table if not exists historico_precos (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid references imoveis(id) on delete cascade,
  preco numeric not null check (preco >= 0),
  data date not null default current_date
);

create table if not exists alertas_preco (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid,
  bairro text not null,
  tipo text,
  negocio text not null,
  preco_max numeric not null check (preco_max >= 0),
  quartos_min integer check (quartos_min is null or quartos_min >= 0),
  ativo boolean default true,
  created_at timestamptz not null default now()
);

alter table imoveis enable row level security;
alter table historico_precos enable row level security;
alter table alertas_preco enable row level security;

grant select on public.imoveis to anon, authenticated;
grant select, insert, update, delete on public.imoveis to service_role;
grant select, insert, update, delete on public.historico_precos to service_role;
grant select, insert, update, delete on public.alertas_preco to service_role;

drop policy if exists "Leitura pública de imóveis ativos" on imoveis;
drop policy if exists "Leitura publica de imoveis ativos" on imoveis;
drop policy if exists "Insert via service role" on imoveis;
drop policy if exists "Update via service role" on imoveis;
drop policy if exists "Imoveis ativos sao publicos" on imoveis;
drop policy if exists "Imoveis escrita via service role" on imoveis;
drop policy if exists "Historico escrita via service role" on historico_precos;
drop policy if exists "Alertas escrita via service role" on alertas_preco;

create policy "Imoveis ativos sao publicos"
  on imoveis for select
  to anon, authenticated
  using (status = 'ativo');

create policy "Imoveis escrita via service role"
  on imoveis for all
  to service_role
  using (true)
  with check (true);

create policy "Historico escrita via service role"
  on historico_precos for all
  to service_role
  using (true)
  with check (true);

create policy "Alertas escrita via service role"
  on alertas_preco for all
  to service_role
  using (true)
  with check (true);
