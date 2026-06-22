export type Campo = {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  required?: boolean
  span?: 2
  options?: readonly string[]
}

export type UploadedImage = {
  path: string
  url: string
}

export type Lead = {
  id: string
  nome: string
  telefone: string
  email: string | null
  mensagem: string
  origem: string
  status: string
  created_at: string
  imovel_id: string | null
  imoveis: { id: string; titulo: string } | null
}

export const CAMPOS: Campo[] = [
  { key: 'titulo', label: 'Titulo', type: 'text', required: true, span: 2 },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['apartamento', 'casa', 'terreno', 'comercial', 'hotel'], required: true },
  { key: 'negocio', label: 'Negocio', type: 'select', options: ['venda', 'aluguel', 'temporada'], required: true },
  { key: 'preco', label: 'Preco (R$)', type: 'number', required: true },
  { key: 'area_m2', label: 'Area (m2)', type: 'number' },
  { key: 'quartos', label: 'Quartos', type: 'number' },
  { key: 'banheiros', label: 'Banheiros', type: 'number' },
  { key: 'vagas', label: 'Vagas', type: 'number' },
  { key: 'condominio', label: 'Condominio (R$/mes)', type: 'number' },
  { key: 'iptu', label: 'IPTU (R$/ano)', type: 'number' },
  { key: 'cep', label: 'CEP', type: 'text' },
  { key: 'numero', label: 'Numero', type: 'text' },
  { key: 'endereco', label: 'Endereco', type: 'text', span: 2 },
  { key: 'complemento', label: 'Complemento', type: 'text' },
  { key: 'bairro', label: 'Bairro', type: 'text', required: true },
  { key: 'cidade', label: 'Cidade', type: 'text', required: true },
  { key: 'estado', label: 'Estado', type: 'text', required: true },
  { key: 'latitude', label: 'Latitude', type: 'number' },
  { key: 'longitude', label: 'Longitude', type: 'number' },
  { key: 'portal_origem', label: 'Portal de origem', type: 'text' },
  { key: 'url_original', label: 'URL original', type: 'text' },
  { key: 'descricao', label: 'Descricao', type: 'textarea', span: 2 },
]

export const FORM_INICIAL = { cidade: 'Sao Paulo', estado: 'SP' }

export const STATUS_LABELS: Record<string, string> = {
  novo: 'Novo',
  em_atendimento: 'Em atendimento',
  fechado: 'Fechado',
  perdido: 'Perdido',
}

export const STATUS_COLORS: Record<string, string> = {
  novo: 'rgba(59,130,246,0.15)',
  em_atendimento: 'rgba(234,179,8,0.15)',
  fechado: 'rgba(34,197,94,0.15)',
  perdido: 'rgba(239,68,68,0.15)',
}

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
