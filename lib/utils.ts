import { AnalisePreco, Imovel, ImovelSimilar } from './types'

export function formatarPreco(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

export function formatarArea(m2: number): string {
  return `${m2} m2`
}

export function calcularPrecoM2(preco: number, area: number): number {
  if (!area || area === 0) return 0
  return Math.round(preco / area)
}

function media(valores: number[]) {
  if (!valores.length) return 0
  return Math.round(valores.reduce((total, valor) => total + valor, 0) / valores.length)
}

function mediana(valores: number[]) {
  if (!valores.length) return 0
  const ordenados = [...valores].sort((a, b) => a - b)
  const meio = Math.floor(ordenados.length / 2)
  if (ordenados.length % 2) return Math.round(ordenados[meio])
  return Math.round((ordenados[meio - 1] + ordenados[meio]) / 2)
}

function classificarConfianca(total: number): AnalisePreco['confianca'] {
  if (total >= 8) return 'alta'
  if (total >= 4) return 'media'
  return 'baixa'
}

function montarRecomendacao(classificacao: AnalisePreco['classificacao'], confianca: AnalisePreco['confianca']) {
  if (classificacao === 'abaixo') {
    return confianca === 'baixa'
      ? 'Possivel oportunidade, mas ainda ha poucos comparaveis para confirmar.'
      : 'Bom negocio: o preco por m2 esta abaixo de imoveis similares.'
  }

  if (classificacao === 'acima') {
    return confianca === 'baixa'
      ? 'Preco acima da referencia inicial, mas a amostra ainda e pequena.'
      : 'Negocie com cuidado: o preco por m2 esta acima dos similares.'
  }

  return 'Preco justo: o valor esta proximo da referencia dos imoveis comparaveis.'
}

export function calcularAnalise(imovel: Imovel, similares: ImovelSimilar[]): AnalisePreco {
  const precoM2Imovel = calcularPrecoM2(imovel.preco, imovel.area_m2)
  const similaresValidos = similares.filter((similar) => similar.preco > 0 && similar.area_m2 > 0)
  const precos = similaresValidos.map((similar) => similar.preco)
  const precosM2 = similaresValidos.map((similar) => calcularPrecoM2(similar.preco, similar.area_m2))
  const precoMedioBairro = media(precos) || imovel.preco
  const precoM2MedioBairro = media(precosM2) || precoM2Imovel
  const precoM2MedianoBairro = mediana(precosM2) || precoM2Imovel
  const precoEstimadoJusto = Math.round(precoM2MedianoBairro * imovel.area_m2)
  const percentualDiferenca = precoEstimadoJusto
    ? Math.round(((imovel.preco - precoEstimadoJusto) / precoEstimadoJusto) * 100)
    : 0
  const economiaEstimativa = Math.max(precoEstimadoJusto - imovel.preco, 0)
  const economiaPercentual = precoEstimadoJusto
    ? Math.round((economiaEstimativa / precoEstimadoJusto) * 1000) / 10
    : 0
  const confianca = classificarConfianca(similaresValidos.length)
  const classificacao =
    percentualDiferenca <= -8 ? 'abaixo' : percentualDiferenca >= 8 ? 'acima' : 'na_media'

  return {
    imovel_id: imovel.id,
    preco_medio_bairro: precoMedioBairro,
    preco_m2_imovel: precoM2Imovel,
    preco_m2_medio_bairro: precoM2MedioBairro,
    preco_m2_mediano_bairro: precoM2MedianoBairro,
    preco_estimado_justo: precoEstimadoJusto,
    menor_preco_comparavel: precos.length ? Math.min(...precos) : imovel.preco,
    maior_preco_comparavel: precos.length ? Math.max(...precos) : imovel.preco,
    economia_estimativa: economiaEstimativa,
    economia_percentual: economiaPercentual,
    percentual_diferenca: percentualDiferenca,
    classificacao,
    confianca,
    criterio: 'Mesmo tipo e negocio, area parecida e prioridade para o mesmo bairro.',
    recomendacao: montarRecomendacao(classificacao, confianca),
    imoveis_comparados: similaresValidos.length,
    imoveis_similares: similaresValidos.sort(
      (a, b) => calcularPrecoM2(a.preco, a.area_m2) - calcularPrecoM2(b.preco, b.area_m2),
    ),
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

export function calcularPrecoM2Medio(imoveis: Imovel[]): number {
  if (imoveis.length === 0) return 0
  const total = imoveis.reduce((sum, imovel) => sum + (imovel.preco / imovel.area_m2), 0)
  return Math.round(total / imoveis.length)
}

export function analisarPreco(imovel: Imovel, mediaReferencia: number) {
  const diferenca = imovel.preco - mediaReferencia
  const percentual = mediaReferencia ? Math.round((diferenca / mediaReferencia) * 100) : 0

  return {
    diferenca,
    percentual,
    status: percentual > 10 ? 'caro' : percentual < -10 ? 'barato' : 'justo',
  }
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor)
}

export function validarCep(cep: string): boolean {
  return /^\d{5}-?\d{3}$/.test(cep)
}

export function removerMascaraCep(cep: string): string {
  return cep.replace(/\D/g, '')
}
