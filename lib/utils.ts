import { AnalisePreco, Imovel, ImovelSimilar } from './types'

export function formatarPreco(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function formatarArea(m2: number): string {
  return `${m2} m²`
}

export function calcularPrecoM2(preco: number, area: number): number {
  if (!area || area === 0) return 0
  return Math.round(preco / area)
}

export function calcularAnalise(imovel: Imovel, similares: ImovelSimilar[]): AnalisePreco {
  const precoM2Imovel = calcularPrecoM2(imovel.preco, imovel.area_m2)

  const precos = similares.map((s) => s.preco)
  const precosM2 = similares.map((s) => calcularPrecoM2(s.preco, s.area_m2))

  const precoMedioBairro = precos.length
    ? Math.round(precos.reduce((a, b) => a + b, 0) / precos.length)
    : imovel.preco

  const precoM2MedioBairro = precosM2.length
    ? Math.round(precosM2.reduce((a, b) => a + b, 0) / precosM2.length)
    : precoM2Imovel

  const percentualDiferenca = precoMedioBairro
    ? Math.round(((imovel.preco - precoMedioBairro) / precoMedioBairro) * 100)
    : 0

  const classificacao =
    percentualDiferenca <= -5 ? 'abaixo' : percentualDiferenca >= 5 ? 'acima' : 'na_media'

  return {
    imovel_id: imovel.id,
    preco_medio_bairro: precoMedioBairro,
    preco_m2_imovel: precoM2Imovel,
    preco_m2_medio_bairro: precoM2MedioBairro,
    percentual_diferenca: percentualDiferenca,
    classificacao,
    imoveis_comparados: similares.length,
    imoveis_similares: similares,
  }
}

export function labelTipo(tipo: string): string {
  const map: Record<string, string> = {
    apartamento: 'Apartamento',
    casa: 'Casa',
    terreno: 'Terreno',
    comercial: 'Comercial',
    hotel: 'Hotel / Temporada',
  }
  return map[tipo] ?? tipo
}

export function labelNegocio(negocio: string): string {
  const map: Record<string, string> = { venda: 'Venda', aluguel: 'Aluguel', temporada: 'Temporada' }
  return map[negocio] ?? negocio
}

export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Calcula o preço médio por m² em um bairro
 */
export function calcularPrecoM2Medio(imoveis: Imovel[]): number {
  if (imoveis.length === 0) return 0
 const total = imoveis.reduce((sum, imovel) => sum + (imovel.preco / imovel.area_m2), 0)
  return Math.round(total / imoveis.length)
}

/**
 * Analisa se um imóvel está caro ou barato comparado à média
 */
export function analisarPreco(imovel: Imovel, media: number) {
  const diferenca = imovel.preco - media
  const percentual = Math.round((diferenca / media) * 100)

  return {
    diferenca,
    percentual,
    status: percentual > 10 ? 'caro' : percentual < -10 ? 'barato' : 'justo',
  }
}

/**
 * Formata valor monetário
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

/**
 * Formata número com separador de milhares
 */
export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor)
}

/**
 * Valida CEP (formato básico)
 */
export function validarCep(cep: string): boolean {
  return /^\d{5}-?\d{3}$/.test(cep)
}

/**
 * Remove máscara de CEP
 */
export function removerMascaraCep(cep: string): string {
  return cep.replace(/\D/g, '')
}
