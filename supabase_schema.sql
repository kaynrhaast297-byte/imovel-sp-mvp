-- Execute este SQL no Supabase SQL Editor

-- Tabela principal de imóveis
create table if not exists imoveis (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  tipo text not null check (tipo in ('apartamento','casa','terreno','comercial','hotel')),
  negocio text not null check (negocio in ('venda','aluguel','temporada')),
  status text not null default 'ativo' check (status in ('ativo','vendido','alugado','inativo')),
  preco numeric not null,
  condominio numeric,
  iptu numeric,
  area_m2 numeric not null,
  quartos integer,
  banheiros integer,
  vagas integer,
  bairro text not null,
  cidade text not null default 'São Paulo',
  estado text not null default 'SP',
  cep text,
  endereco text,
  latitude numeric,
  longitude numeric,
  fotos text[],
  portal_origem text,
  url_original text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para performance nas buscas mais comuns
create index if not exists idx_imoveis_bairro on imoveis (bairro);
create index if not exists idx_imoveis_tipo on imoveis (tipo);
create index if not exists idx_imoveis_negocio on imoveis (negocio);
create index if not exists idx_imoveis_status on imoveis (status);
create index if not exists idx_imoveis_preco on imoveis (preco);

-- Histórico de preços
create table if not exists historico_precos (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid references imoveis(id) on delete cascade,
  preco numeric not null,
  data date not null default current_date
);

-- Alertas de preço (fase 2)
create table if not exists alertas_preco (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid,
  bairro text not null,
  tipo text,
  negocio text not null,
  preco_max numeric not null,
  quartos_min integer,
  ativo boolean default true,
  created_at timestamptz not null default now()
);

-- RLS: acesso público de leitura para imóveis ativos
alter table imoveis enable row level security;

create policy "Leitura pública de imóveis ativos"
  on imoveis for select
  using (status = 'ativo');

create policy "Insert via service role"
  on imoveis for insert
  with check (true);

create policy "Update via service role"
  on imoveis for update
  using (true);
