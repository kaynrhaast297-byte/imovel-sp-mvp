export type TipoImovel = 'apartamento' | 'casa' | 'terreno' | 'comercial' | 'hotel'
export type TipoNegocio = 'venda' | 'aluguel' | 'temporada'
export type StatusImovel = 'ativo' | 'vendido' | 'alugado' | 'inativo'

export interface Imovel {
  id: string
  titulo: string
  descricao?: string
  tipo: TipoImovel
  negocio: TipoNegocio
  status: StatusImovel
  preco: number
  condominio?: number
  iptu?: number
  area_m2: number
  quartos?: number
  banheiros?: number
  vagas?: number
  bairro: string
  cidade: string
  estado: string
  cep?: string
  endereco?: string
  latitude?: number
  longitude?: number
  fotos?: string[]
  portal_origem?: string
  url_original?: string
  created_at: string
  updated_at: string
}

export interface ImovelFiltros {
  tipo?: TipoImovel
  negocio?: TipoNegocio
  bairro?: string
  cidade?: string
  preco_min?: number
  preco_max?: number
  quartos_min?: number
  area_min?: number
  area_max?: number
}

export interface AnalisePreco {
  imovel_id: string
  preco_medio_bairro: number
  preco_m2_imovel: number
  preco_m2_medio_bairro: number
  percentual_diferenca: number
  classificacao: 'abaixo' | 'na_media' | 'acima'
  imoveis_comparados: number
  imoveis_similares: ImovelSimilar[]
}

export interface ImovelSimilar {
  id: string
  titulo: string
  preco: number
  area_m2: number
  quartos?: number
  bairro: string
  portal_origem?: string
  url_original?: string
}

export interface HistoricoPreco {
  id: string
  imovel_id: string
  preco: number
  data: string
}

export interface Usuario {
  id: string
  email: string
  nome?: string
  created_at: string
}

export interface Favorito {
  id: string
  usuario_id: string
  imovel_id: string
  created_at: string
  imovel?: Imovel
}

export interface AlertaPreco {
  id: string
  usuario_id: string
  bairro: string
  tipo?: TipoImovel
  negocio: TipoNegocio
  preco_max: number
  quartos_min?: number
  ativo: boolean
  created_at: string
}
  'Vila Formosa',
  'Itaim Bibi',
  'Mooca',
  'Vila Prudente',
  'Saúde',
  'Ipiranga',
] as const

export const PROPERTY_TYPES = ['apartment', 'house', 'land'] as const

export const PROPERTY_TYPE_LABELS = {
  apartment: 'Apartamento',
  house: 'Casa',
  land: 'Terreno',
} as const

export type Neighborhood = (typeof NEIGHBORHOODS_SP)[number]
export type PropertyType = (typeof PROPERTY_TYPES)[number]

export interface Imovel {
  id: string
  titulo: string
  descricao: string
  preco: number
  preco_m2: number
  bairro: Neighborhood
  endereco: string
  cidade: string
  cep: string
  lat: number
  lng: number
  quartos: number
  banheiros: number
  vagas_garagem: number
  area_m2: number
  tipo: PropertyType
  estado_imovel: 'novo' | 'usado' | 'reforma'
  condominio_nome?: string
  condominio_valor?: number
  imagens: string[]
  usuario_id: string
  criado_em: string
  atualizado_em: string
}

export interface Usuario {
  id: string
  email: string
  nome: string
  criado_em: string
}

export interface Favorito {
  id: string
  usuario_id: string
  imovel_id: string
  criado_em: string
}

export interface HistoricoPrecos {
  id: string
  imovel_id: string
  preco_antigo: number
  preco_novo: number
  data_alteracao: string
}
