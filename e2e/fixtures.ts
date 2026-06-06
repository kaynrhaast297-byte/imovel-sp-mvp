export const mockImovel = {
  id: 'imovel-1',
  titulo: 'Apto Pinheiros',
  descricao: 'Apartamento mockado para testes E2E.',
  tipo: 'apartamento',
  negocio: 'venda',
  status: 'ativo',
  preco: 900000,
  area_m2: 90,
  quartos: 2,
  banheiros: 2,
  vagas: 1,
  bairro: 'Pinheiros',
  cidade: 'Sao Paulo',
  estado: 'SP',
  portal_origem: 'Mock',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

export const mockImoveisResponse = {
  imoveis: [mockImovel],
  pagination: {
    page: 1,
    per_page: 12,
    total: 1,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
}
