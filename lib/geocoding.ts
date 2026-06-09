const VIACEP_URL = 'https://viacep.com.br/ws'
const DEFAULT_NOMINATIM_URL = 'https://nominatim.openstreetmap.org'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const MAX_CACHE_ENTRIES = 500
const NOMINATIM_MIN_INTERVAL_MS = 1100

type CachedAddress = {
  expiresAt: number
  value: ResolvedAddress
}

type ViaCepResponse = {
  erro?: boolean
  cep?: string
  logradouro?: string
  complemento?: string
  bairro?: string
  localidade?: string
  uf?: string
}

type NominatimResponse = {
  lat?: string
  lon?: string
}[]

export type ResolvedAddress = {
  cep: string
  endereco: string
  numero?: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  latitude?: number
  longitude?: number
  localizacao_aproximada: boolean
}

const cache = new Map<string, CachedAddress>()
let nominatimQueue = Promise.resolve()
let lastNominatimRequestAt = 0

function normalizeCep(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 8) throw new Error('CEP invalido.')
  return digits
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok) throw new Error(`Servico externo respondeu ${response.status}.`)
  return response.json() as Promise<T>
}

async function geocodeWithNominatim(query: string) {
  const task = nominatimQueue.then(async () => {
    const waitMs = Math.max(lastNominatimRequestAt + NOMINATIM_MIN_INTERVAL_MS - Date.now(), 0)
    if (waitMs > 0) await new Promise(resolve => setTimeout(resolve, waitMs))

    lastNominatimRequestAt = Date.now()
    const baseUrl = process.env.NOMINATIM_URL?.trim() || DEFAULT_NOMINATIM_URL
    const userAgent = process.env.NOMINATIM_USER_AGENT?.trim() || 'ImovelSP-MVP/0.1'
    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      countrycodes: 'br',
      limit: '1',
    })

    return fetchJson<NominatimResponse>(`${baseUrl}/search?${params}`, {
      headers: {
        'Accept-Language': 'pt-BR',
        'User-Agent': userAgent,
      },
    })
  })

  nominatimQueue = task.then(() => undefined, () => undefined)
  return task
}

function cacheAddress(key: string, value: ResolvedAddress) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value })
}

export async function resolveAddressByCep(cepValue: string, numero?: string) {
  const cep = normalizeCep(cepValue)
  const cacheKey = `${cep}:${numero?.trim() || ''}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const viaCep = await fetchJson<ViaCepResponse>(`${VIACEP_URL}/${cep}/json/`)
  if (viaCep.erro || !viaCep.logradouro || !viaCep.bairro || !viaCep.localidade || !viaCep.uf) {
    throw new Error('CEP nao encontrado ou endereco incompleto.')
  }

  const query = [
    viaCep.logradouro,
    numero?.trim(),
    viaCep.bairro,
    viaCep.localidade,
    viaCep.uf,
    'Brasil',
  ].filter(Boolean).join(', ')

  let coordinates: NominatimResponse = []
  try {
    coordinates = await geocodeWithNominatim(query)
  } catch {
    coordinates = []
  }

  const latitude = Number(coordinates[0]?.lat)
  const longitude = Number(coordinates[0]?.lon)
  const value: ResolvedAddress = {
    cep: viaCep.cep || `${cep.slice(0, 5)}-${cep.slice(5)}`,
    endereco: viaCep.logradouro,
    numero: numero?.trim() || undefined,
    complemento: viaCep.complemento?.trim() || undefined,
    bairro: viaCep.bairro,
    cidade: viaCep.localidade,
    estado: viaCep.uf.toUpperCase(),
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    localizacao_aproximada: true,
  }

  cacheAddress(cacheKey, value)
  return value
}

export function resetGeocodingCache() {
  cache.clear()
  lastNominatimRequestAt = 0
  nominatimQueue = Promise.resolve()
}
