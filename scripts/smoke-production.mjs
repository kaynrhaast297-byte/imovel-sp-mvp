#!/usr/bin/env node
import { cleanBaseUrl, loadEnvFileIntoProcess } from './env-utils.mjs'

const args = process.argv.slice(2)

function getArg(name, fallback) {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

function safeJson(response) {
  return response.json().catch(() => null)
}

const envFile = getArg('--env-file', '.env.local')
loadEnvFileIntoProcess(envFile)

const baseUrl = cleanBaseUrl(getArg('--url', process.env.PRODUCTION_URL || 'https://imovel-sp-mvp.vercel.app'))
const adminToken = process.env.IMOVEL_ADMIN_TOKEN?.trim()

if (!adminToken) {
  console.error(`Smoke Vercel: IMOVEL_ADMIN_TOKEN ausente. Defina no ambiente ou em ${envFile}.`)
  process.exit(1)
}

async function assertOk(name, response, customMessage) {
  if (response.ok) {
    console.log(`[PASS] ${name}`)
    return
  }

  const body = await safeJson(response)
  const detail = body?.error ? ` ${body.error}` : ''
  throw new Error(customMessage ?? `${name} retornou HTTP ${response.status}.${detail}`)
}

async function main() {
  console.log(`Smoke Vercel: ${baseUrl}`)

  const publicResponse = await fetch(`${baseUrl}/api/imoveis?per_page=1`)
  await assertOk('API publica de imoveis', publicResponse)

  const loginResponse = await fetch(`${baseUrl}/api/admin/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: adminToken }),
  })

  if (loginResponse.status === 401) {
    throw new Error('Login admin falhou. O IMOVEL_ADMIN_TOKEN da Vercel Production nao confere com o token usado neste smoke test.')
  }
  await assertOk('Login admin de producao', loginResponse)

  const cookie = loginResponse.headers.get('set-cookie')?.split(';')[0]
  if (!cookie) throw new Error('Login admin nao retornou cookie de sessao.')

  const envResponse = await fetch(`${baseUrl}/api/admin/environment`, {
    headers: { Cookie: cookie },
  })
  await assertOk('Diagnostico protegido de ambiente', envResponse)
  const envHealth = await envResponse.json()
  if (!envHealth.adminAuthOk || !envHealth.adminDataOk || !envHealth.publicDataOk) {
    const detail = Array.isArray(envHealth.errors) ? envHealth.errors.join(' ') : 'Ambiente incompleto.'
    throw new Error(`Ambiente Vercel incompleto. ${detail}`)
  }
  console.log('[PASS] Variaveis obrigatorias da Vercel')

  const leadsResponse = await fetch(`${baseUrl}/api/admin/leads?pagina=1`, {
    headers: { Cookie: cookie },
  })
  await assertOk('API admin de leads', leadsResponse)

  console.log('Smoke Vercel: aprovado.')
}

main().catch((error) => {
  console.error(`Smoke Vercel: falhou. ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
