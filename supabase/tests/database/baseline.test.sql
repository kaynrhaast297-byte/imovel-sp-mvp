begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;

select plan(23);

select has_table('public', 'imoveis', 'Tabela imoveis existe');
select has_table('public', 'leads', 'Tabela leads existe');
select has_table('public', 'historico_precos', 'Tabela historico_precos existe');
select has_table('public', 'alertas_preco', 'Tabela alertas_preco existe');

select columns_are(
  'public',
  'imoveis',
  array[
    'id', 'titulo', 'descricao', 'tipo', 'negocio', 'status', 'preco',
    'condominio', 'iptu', 'area_m2', 'quartos', 'banheiros', 'vagas',
    'bairro', 'cidade', 'estado', 'cep', 'endereco', 'latitude', 'longitude',
    'fotos', 'portal_origem', 'url_original', 'created_at', 'updated_at',
    'preco_m2', 'numero', 'complemento', 'localizacao_aproximada', 'foto_principal'
  ],
  'Colunas de imoveis correspondem ao contrato atual'
);
select col_is_pk('public', 'imoveis', 'id', 'imoveis.id e chave primaria');
select col_is_pk('public', 'leads', 'id', 'leads.id e chave primaria');
select col_is_pk('public', 'historico_precos', 'id', 'historico_precos.id e chave primaria');
select col_is_pk('public', 'alertas_preco', 'id', 'alertas_preco.id e chave primaria');

select has_index('public', 'imoveis', 'idx_imoveis_status_created_at', 'Indice da listagem publica existe');
select has_index('public', 'imoveis', 'idx_imoveis_bairro_trgm', 'Indice trigram de bairro existe');
select has_index('public', 'leads', 'idx_leads_status_created_at', 'Indice da listagem de leads existe');

select policies_are(
  'public',
  'imoveis',
  array['Imoveis ativos sao publicos', 'Imoveis escrita via service role'],
  'Policies de imoveis estao restritas ao contrato esperado'
);
select policies_are(
  'public',
  'leads',
  array['Leads escrita via service role'],
  'Leads nao possuem policy publica'
);
select policies_are(
  'public',
  'historico_precos',
  array['Historico escrita via service role'],
  'Historico e exclusivo do backend'
);
select policies_are(
  'public',
  'alertas_preco',
  array['Alertas escrita via service role'],
  'Alertas sao exclusivos do backend'
);

select ok((select relrowsecurity from pg_class where oid = 'public.imoveis'::regclass), 'RLS ativa em imoveis');
select ok((select relrowsecurity from pg_class where oid = 'public.leads'::regclass), 'RLS ativa em leads');
select ok((select relrowsecurity from pg_class where oid = 'public.historico_precos'::regclass), 'RLS ativa em historico_precos');
select ok((select relrowsecurity from pg_class where oid = 'public.alertas_preco'::regclass), 'RLS ativa em alertas_preco');

select is_definer('public', 'rls_auto_enable', array[]::name[], 'Funcao de RLS usa security definer');
select ok(
  not has_function_privilege('anon', 'public.rls_auto_enable()', 'EXECUTE')
  and not has_function_privilege('authenticated', 'public.rls_auto_enable()', 'EXECUTE'),
  'Funcao privilegiada nao e executavel pelos papeis da API'
);
select ok(
  exists (
    select 1
    from storage.buckets
    where id = 'property-images'
      and public
      and file_size_limit = 5242880
      and allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
  ),
  'Bucket property-images possui limites reproduziveis'
);

select * from finish();
rollback;
