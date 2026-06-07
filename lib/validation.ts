import { z } from 'zod'

const optionalText = (max: number) => z.string().trim().max(max).optional()
const optionalNonNegativeNumber = z.number().finite().nonnegative().optional()
const optionalNonNegativeInteger = z.number().int().nonnegative().optional()

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
  estado: z.string().trim().length(2).transform(value => value.toUpperCase()).optional(),
  cep: z.string().trim().regex(/^\d{5}-?\d{3}$/).optional(),
  endereco: optionalText(240),
  latitude: z.number().finite().min(-90).max(90).optional(),
  longitude: z.number().finite().min(-180).max(180).optional(),
  fotos: z.array(z.string().url().max(2048)).max(30).optional(),
  portal_origem: optionalText(120),
  url_original: z.string().url().max(2048).optional(),
}

export const imovelCreateSchema = z.object(imovelFields).strict()

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
