-- Fixtures locais. Este arquivo nunca deve ser aplicado automaticamente em producao.

insert into public.imoveis (
  id,
  titulo,
  descricao,
  tipo,
  negocio,
  status,
  preco,
  area_m2,
  quartos,
  banheiros,
  vagas,
  bairro,
  cidade,
  estado,
  fotos,
  localizacao_aproximada
)
values (
  '00000000-0000-4000-8000-000000000001',
  'Apartamento fixture Centro',
  'Registro sintetico para desenvolvimento e testes locais.',
  'apartamento',
  'venda',
  'ativo',
  450000,
  62,
  2,
  1,
  1,
  'Centro',
  'Sao Paulo',
  'SP',
  array[]::text[],
  true
)
on conflict (id) do nothing;
