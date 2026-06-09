import { z } from 'zod'

const optionalText = (max: number) => z.string().trim().max(max).optional()
const optionalNonNegativeNumber = z.number().finite().nonnegative().optional()
const optionalNonNegativeInteger = z.number().int().nonnegative().optional()
const cepSchema = z.string().trim().regex(/^\d{5}-?\d{3}$/).transform((value) => {
  const digits = value.replace(/\D/g, '')
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
})
const photoUrlSchema = z.string().url().max(2048)

const imovelFields = {
  titulo: z.string().trim().min(3).max(180),
  descricao: optionalText(5000),
  tipo: z.enum(['apartamento', 'casa', 'terreno', 'comercial', 'hotel']),
  negocio: z.enum(['venda', 'aluguel', 'temporada']),
  preco: z.number().finite().nonnegative(),
  condominio: optionalNonNegativeNumber,
  iptu: optionalNonNegativeNumber,
  area_m2: z.number().finite().positive(),
  quartos: optionalNonNegativeInteger,
  banheiros: optionalNonNegativeInteger,
  vagas: optionalNonNegativeInteger,
  bairro: z.string().trim().min(2).max(120),
  cidade: z.string().trim().min(2).max(120),
  estado: z.string().trim().length(2).transform(value => value.toUpperCase()),
  cep: cepSchema,
  endereco: z.string().trim().min(3).max(240),
  numero: z.string().trim().min(1).max(30),
  complemento: optionalText(120),
  latitude: z.number().finite().min(-90).max(90).optional(),
  longitude: z.number().finite().min(-180).max(180).optional(),
  localizacao_aproximada: z.boolean().optional(),
  fotos: z.array(photoUrlSchema).min(1).max(12),
  foto_principal: photoUrlSchema,
  portal_origem: optionalText(120),
  url_original: z.string().url().max(2048).optional(),
}

export const imovelCreateSchema = z.object(imovelFields).strict().refine(
  data => data.fotos.includes(data.foto_principal),
  { message: 'A foto principal deve estar na lista de fotos.', path: ['foto_principal'] },
)

export const imovelUpdateSchema = z.object({
  ...Object.fromEntries(
    Object.entries(imovelFields).map(([key, schema]) => [key, schema.optional()]),
  ),
  status: z.enum(['ativo', 'vendido', 'alugado', 'inativo']).optional(),
}).strict().refine(data => Object.keys(data).length > 0, {
  message: 'Informe ao menos um campo para atualizar.',
})

export const leadSchema = z.object({
  imovel_id: z.string().uuid(),
  nome: z.string().trim().min(2).max(120),
  telefone: z.string().trim().min(8).max(40),
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  mensagem: z.string().trim().min(10).max(1200),
  origem: z.string().trim().max(80).optional(),
}).strict()

export const adminSessionSchema = z.object({
  token: z.string().trim().min(1).max(512),
}).strict()

export const geocodeRequestSchema = z.object({
  cep: cepSchema,
  numero: z.string().trim().max(30).optional(),
}).strict()

export const propertyImageDeleteSchema = z.object({
  paths: z.array(z.string().min(1).max(240)).min(1).max(12),
}).strict()
