-- Baseline recovered from the initial Git schema and verified against production metadata.
-- This migration is intentionally idempotent because production already contains this schema.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path to 'pg_catalog'
as $function$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name is not null
      and cmd.schema_name in ('public')
      and cmd.schema_name not in ('pg_catalog', 'information_schema')
      and cmd.schema_name not like 'pg_toast%'
      and cmd.schema_name not like 'pg_temp%'
    then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception
        when others then
          raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    else
      raise log 'rls_auto_enable: skip % (schema: %)', cmd.object_identity, cmd.schema_name;
    end if;
  end loop;
end;
$function$;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

do $event_trigger$
begin
  if not exists (select 1 from pg_event_trigger where evtname = 'ensure_rls') then
    execute $ddl$
      create event trigger ensure_rls
        on ddl_command_end
        when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
        execute function public.rls_auto_enable()
    $ddl$;
  end if;
end
$event_trigger$;

create table if not exists public.imoveis (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  tipo text not null check (tipo in ('apartamento', 'casa', 'terreno', 'comercial', 'hotel')),
  negocio text not null check (negocio in ('venda', 'aluguel', 'temporada')),
  status text not null default 'ativo' check (status in ('ativo', 'vendido', 'alugado', 'inativo')),
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
  updated_at timestamptz not null default now(),
  preco_m2 numeric generated always as (round(preco / nullif(area_m2, 0), 2)) stored
);

create table if not exists public.historico_precos (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid references public.imoveis(id) on delete cascade,
  preco numeric not null,
  data date not null default current_date
);

create table if not exists public.alertas_preco (
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

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid references public.imoveis(id) on delete set null,
  nome text not null,
  telefone text not null,
  email text,
  mensagem text not null,
  origem text not null default 'pagina_imovel',
  status text not null default 'novo' check (status in ('novo', 'em_atendimento', 'fechado', 'perdido')),
  created_at timestamptz not null default now()
);

create index if not exists idx_imoveis_bairro on public.imoveis (bairro);
create index if not exists idx_imoveis_tipo on public.imoveis (tipo);
create index if not exists idx_imoveis_negocio on public.imoveis (negocio);
create index if not exists idx_imoveis_status on public.imoveis (status);
create index if not exists idx_imoveis_preco on public.imoveis (preco);
create index if not exists idx_imoveis_busca_bairro_cidade on public.imoveis (bairro, cidade);
create index if not exists idx_imoveis_status_created_at on public.imoveis (status, created_at desc);
create index if not exists idx_imoveis_status_preco on public.imoveis (status, preco);
create index if not exists idx_imoveis_status_preco_m2 on public.imoveis (status, preco_m2);
create index if not exists idx_imoveis_status_area on public.imoveis (status, area_m2 desc);
create index if not exists idx_imoveis_status_tipo_negocio on public.imoveis (status, tipo, negocio);
create index if not exists idx_imoveis_cidade_tipo_negocio on public.imoveis (cidade, tipo, negocio);

do $trigram_indexes$
declare
  trgm_schema text;
begin
  select n.nspname
  into trgm_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pg_trgm';

  if not exists (select 1 from pg_class where relname = 'idx_imoveis_bairro_trgm') then
    execute format(
      'create index idx_imoveis_bairro_trgm on public.imoveis using gin (bairro %I.gin_trgm_ops)',
      trgm_schema
    );
  end if;

  if not exists (select 1 from pg_class where relname = 'idx_imoveis_cidade_trgm') then
    execute format(
      'create index idx_imoveis_cidade_trgm on public.imoveis using gin (cidade %I.gin_trgm_ops)',
      trgm_schema
    );
  end if;
end
$trigram_indexes$;

create index if not exists idx_leads_imovel on public.leads (imovel_id);
create index if not exists idx_leads_email on public.leads (email);
create index if not exists idx_leads_status_created_at on public.leads (status, created_at desc);

alter table public.imoveis enable row level security;
alter table public.historico_precos enable row level security;
alter table public.alertas_preco enable row level security;
alter table public.leads enable row level security;

grant select on public.imoveis to anon, authenticated;
grant select, insert, update, delete on public.imoveis to service_role;
grant select, insert, update, delete on public.historico_precos to service_role;
grant select, insert, update, delete on public.alertas_preco to service_role;
grant select, insert, update, delete on public.leads to service_role;
revoke all privileges on public.leads from anon, authenticated;

do $policies$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'imoveis'
      and policyname = 'Imoveis ativos sao publicos'
  ) then
    execute $ddl$
      create policy "Imoveis ativos sao publicos"
        on public.imoveis for select
        to anon, authenticated
        using (status = 'ativo')
    $ddl$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'imoveis'
      and policyname = 'Imoveis escrita via service role'
  ) then
    execute $ddl$
      create policy "Imoveis escrita via service role"
        on public.imoveis for all
        to service_role
        using (true)
        with check (true)
    $ddl$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'historico_precos'
      and policyname = 'Historico escrita via service role'
  ) then
    execute $ddl$
      create policy "Historico escrita via service role"
        on public.historico_precos for all
        to service_role
        using (true)
        with check (true)
    $ddl$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'alertas_preco'
      and policyname = 'Alertas escrita via service role'
  ) then
    execute $ddl$
      create policy "Alertas escrita via service role"
        on public.alertas_preco for all
        to service_role
        using (true)
        with check (true)
    $ddl$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'leads'
      and policyname = 'Leads escrita via service role'
  ) then
    execute $ddl$
      create policy "Leads escrita via service role"
        on public.leads for all
        to service_role
        using (true)
        with check (true)
    $ddl$;
  end if;
end
$policies$;
