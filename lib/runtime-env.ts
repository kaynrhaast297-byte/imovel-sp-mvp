type RuntimeEnv = NodeJS.ProcessEnv | Record<string, string | undefined>

export type RuntimeEnvStatus = 'pass' | 'warn' | 'fail'
export type RuntimeEnvScope = 'public-data' | 'admin-auth' | 'admin-data' | 'optional'

export type RuntimeEnvCheck = {
  key: string
  scope: RuntimeEnvScope
  status: RuntimeEnvStatus
  message: string
}

export type RuntimeEnvHealth = {
  ok: boolean
  publicDataOk: boolean
  adminAuthOk: boolean
  adminDataOk: boolean
  checks: RuntimeEnvCheck[]
  errors: string[]
  warnings: string[]
}

export class RuntimeEnvError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RuntimeEnvError'
  }
}

const PLACEHOLDER_VALUES = new Set([
  'admin',
  'changeme',
  'change-me',
  'example',
  'secret',
  'segredo',
  'token',
  'xxx',
])

function valueOf(env: RuntimeEnv, key: string) {
  return env[key]?.trim() ?? ''
}

function isPlaceholder(value: string) {
  return PLACEHOLDER_VALUES.has(value.toLowerCase())
}

function checkRequired(
  checks: RuntimeEnvCheck[],
  env: RuntimeEnv,
  key: string,
  scope: RuntimeEnvScope,
  label: string,
) {
  const value = valueOf(env, key)
  if (!value) {
    checks.push({
      key,
      scope,
      status: 'fail',
      message: `Configure ${key} para ${label}.`,
    })
    return ''
  }

  checks.push({
    key,
    scope,
    status: isPlaceholder(value) ? 'fail' : 'pass',
    message: isPlaceholder(value)
      ? `${key} parece conter um valor de exemplo. Troque por um segredo real.`
      : `${key} configurado.`,
  })
  return value
}

function checkUrl(checks: RuntimeEnvCheck[], value: string) {
  if (!value) return
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') {
      checks.push({
        key: 'NEXT_PUBLIC_SUPABASE_URL',
        scope: 'public-data',
        status: 'fail',
        message: 'NEXT_PUBLIC_SUPABASE_URL deve usar HTTPS.',
      })
    }
  } catch {
    checks.push({
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      scope: 'public-data',
      status: 'fail',
      message: 'NEXT_PUBLIC_SUPABASE_URL precisa ser uma URL valida.',
    })
  }
}

function checkAdminTokenStrength(checks: RuntimeEnvCheck[], value: string) {
  if (!value || isPlaceholder(value)) return
  if (value.length < 32) {
    checks.push({
      key: 'IMOVEL_ADMIN_TOKEN',
      scope: 'admin-auth',
      status: 'warn',
      message: 'IMOVEL_ADMIN_TOKEN deve ter pelo menos 32 caracteres aleatorios em producao.',
    })
  }
}

export function getRuntimeEnvHealth(env: RuntimeEnv = process.env): RuntimeEnvHealth {
  const checks: RuntimeEnvCheck[] = []

  const supabaseUrl = checkRequired(
    checks,
    env,
    'NEXT_PUBLIC_SUPABASE_URL',
    'public-data',
    'leitura publica do Supabase',
  )
  const anonKey = checkRequired(
    checks,
    env,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'public-data',
    'leitura publica do Supabase',
  )
  const adminToken = checkRequired(
    checks,
    env,
    'IMOVEL_ADMIN_TOKEN',
    'admin-auth',
    'login do painel administrativo',
  )

  checkUrl(checks, supabaseUrl)
  checkAdminTokenStrength(checks, adminToken)

  const secretKey = valueOf(env, 'SUPABASE_SECRET_KEY')
  const serviceRoleKey = valueOf(env, 'SUPABASE_SERVICE_ROLE_KEY')
  const adminKey = secretKey || serviceRoleKey

  if (!adminKey) {
    checks.push({
      key: 'SUPABASE_SECRET_KEY',
      scope: 'admin-data',
      status: 'fail',
      message: 'Configure SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY para operacoes administrativas.',
    })
  } else {
    checks.push({
      key: secretKey ? 'SUPABASE_SECRET_KEY' : 'SUPABASE_SERVICE_ROLE_KEY',
      scope: 'admin-data',
      status: isPlaceholder(adminKey) ? 'fail' : 'pass',
      message: isPlaceholder(adminKey)
        ? 'A chave administrativa do Supabase parece conter um valor de exemplo.'
        : 'Chave administrativa do Supabase configurada.',
    })
  }

  if (secretKey && serviceRoleKey) {
    checks.push({
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      scope: 'admin-data',
      status: 'warn',
      message: 'SUPABASE_SECRET_KEY e SUPABASE_SERVICE_ROLE_KEY estao configuradas; prefira manter apenas SUPABASE_SECRET_KEY.',
    })
  }

  if (adminKey && anonKey && adminKey === anonKey) {
    checks.push({
      key: 'SUPABASE_SECRET_KEY',
      scope: 'admin-data',
      status: 'fail',
      message: 'A chave administrativa do Supabase nao pode ser igual a NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    })
  }

  const errors = checks.filter(check => check.status === 'fail').map(check => check.message)
  const warnings = checks.filter(check => check.status === 'warn').map(check => check.message)
  const publicDataOk = !checks.some(check => check.scope === 'public-data' && check.status === 'fail')
  const adminAuthOk = !checks.some(check => check.scope === 'admin-auth' && check.status === 'fail')
  const adminDataOk = !checks.some(check => check.scope === 'admin-data' && check.status === 'fail')

  return {
    ok: errors.length === 0,
    publicDataOk,
    adminAuthOk,
    adminDataOk,
    checks,
    errors,
    warnings,
  }
}

export function getSupabasePublicEnv(env: RuntimeEnv = process.env) {
  const health = getRuntimeEnvHealth(env)
  if (!health.publicDataOk) {
    throw new RuntimeEnvError(health.errors.find(error => error.includes('NEXT_PUBLIC_SUPABASE')) ?? 'Configure as variaveis publicas do Supabase.')
  }

  return {
    url: valueOf(env, 'NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: valueOf(env, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  }
}

export function getSupabaseAdminEnv(env: RuntimeEnv = process.env) {
  const health = getRuntimeEnvHealth(env)
  if (!health.publicDataOk || !health.adminDataOk) {
    const message = health.errors.find(error => error.includes('SUPABASE'))
      ?? 'Configure as variaveis administrativas do Supabase.'
    throw new RuntimeEnvError(message)
  }

  return {
    url: valueOf(env, 'NEXT_PUBLIC_SUPABASE_URL'),
    key: valueOf(env, 'SUPABASE_SECRET_KEY') || valueOf(env, 'SUPABASE_SERVICE_ROLE_KEY'),
  }
}
