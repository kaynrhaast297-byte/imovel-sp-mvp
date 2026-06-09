-- Property data MVP: endereco completo e imagens publicas com escrita server-side.

alter table public.imoveis
  add column if not exists numero text,
  add column if not exists complemento text,
  add column if not exists localizacao_aproximada boolean not null default true,
  add column if not exists foto_principal text;

update public.imoveis
set foto_principal = fotos[1]
where foto_principal is null
  and cardinality(fotos) > 0;

alter table public.imoveis
  drop constraint if exists imoveis_foto_principal_em_fotos;

alter table public.imoveis
  add constraint imoveis_foto_principal_em_fotos
  check (foto_principal is null or foto_principal = any(fotos));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'property-images',
  'property-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Nenhuma policy de INSERT/UPDATE/DELETE e criada para anon/authenticated.
-- Upload e remocao passam exclusivamente pelo backend com chave server-side.
