#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { readEnvFile } from './env-utils.mjs'

const args = process.argv.slice(2)

function getArg(name, fallback) {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

const file = getArg('--file', '.env.local')
const templateMode = args.includes('--template')
const productionMode = args.includes('--production')

const requiredKeys = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'IMOVEL_ADMIN_TOKEN',
]

const placeholderValues = new Set(['admin', 'changeme', 'change-me', 'example', 'secret', 'segredo', 'token', 'xxx'])
const errors = []
const warnings = []

function hasOwn(env, key) {
  return Object.prototype.hasOwnProperty.call(env, key)
}

function valueOf(env, key) {
  return env[key]?.trim() ?? ''
}

function addMissing(key) {
  errors.push(`${key} ausente em ${file}.`)
}

if (!existsSync(file)) {
  errors.push(`${file} nao encontrado.`)
} else {
  const env = readEnvFile(file)

  for (const key of requiredKeys) {
    if (!hasOwn(env, key)) {
      addMissing(key)
      continue
    }

    const value = valueOf(env, key)
    if (!templateMode && !value) errors.push(`${key} esta vazio em ${file}.`)
    if (!templateMode && placeholderValues.has(value.toLowerCase())) {
      errors.push(`${key} parece conter valor de exemplo em ${file}.`)
    }
  }

  const hasSecretKey = hasOwn(env, 'SUPABASE_SECRET_KEY')
  const hasServiceRoleKey = hasOwn(env, 'SUPABASE_SERVICE_ROLE_KEY')
  const secretKey = valueOf(env, 'SUPABASE_SECRET_KEY')
  const serviceRoleKey = valueOf(env, 'SUPABASE_SERVICE_ROLE_KEY')
  const adminKey = secretKey || serviceRoleKey

  if (!hasSecretKey && !hasServiceRoleKey) {
    errors.push(`SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY ausente em ${file}.`)
  } else if (!templateMode && !adminKey) {
    errors.push(`SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY esta vazio em ${file}.`)
  }

  const supabaseUrl = valueOf(env, 'NEXT_PUBLIC_SUPABASE_URL')
  if (!templateMode && supabaseUrl) {
    try {
      const url = new URL(supabaseUrl)
      if (url.protocol !== 'https:') errors.push('NEXT_PUBLIC_SUPABASE_URL deve usar HTTPS.')
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL precisa ser uma URL valida.')
    }
  }

  const adminToken = valueOf(env, 'IMOVEL_ADMIN_TOKEN')
  if (!templateMode && adminToken && adminToken.length < 32) {
    const message = 'IMOVEL_ADMIN_TOKEN deve ter pelo menos 32 caracteres aleatorios.'
    if (productionMode) errors.push(message)
    else warnings.push(message)
  }

  const anonKey = valueOf(env, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!templateMode && adminKey && anonKey && adminKey === anonKey) {
    errors.push('A chave administrativa do Supabase nao pode ser igual a NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }
}

for (const warning of warnings) console.warn(`[WARN] ${warning}`)

if (errors.length > 0) {
  console.error('Runtime env check: falhou.')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`Runtime env check: aprovado para ${file}${templateMode ? ' (template)' : ''}.`)
