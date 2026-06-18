import { afterEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE, createAdminSessionValue } from '@/lib/admin-auth'
import { GET } from '@/app/api/admin/environment/route'

function request(headers?: HeadersInit) {
  return new NextRequest('http://localhost/api/admin/environment', { headers })
}

function configureEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-value'
  process.env.IMOVEL_ADMIN_TOKEN = '0123456789abcdef0123456789abcdef'
  process.env.SUPABASE_SECRET_KEY = 'server-secret-value'
}

describe('/api/admin/environment', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    delete process.env.IMOVEL_ADMIN_TOKEN
    delete process.env.SUPABASE_SECRET_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  it('exige sessao admin valida', async () => {
    configureEnv()

    const response = await GET(request())

    expect(response.status).toBe(401)
  })

  it('retorna diagnostico seguro sem valores secretos', async () => {
    configureEnv()
    const session = createAdminSessionValue()

    const response = await GET(request({
      cookie: `${ADMIN_SESSION_COOKIE}=${session}`,
    }))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(json.adminAuthOk).toBe(true)
    expect(json.adminDataOk).toBe(true)
    expect(JSON.stringify(json)).not.toContain(process.env.IMOVEL_ADMIN_TOKEN)
    expect(JSON.stringify(json)).not.toContain(process.env.SUPABASE_SECRET_KEY)
  })

  it('aponta chave Supabase admin ausente sem revelar dados sensiveis', async () => {
    configureEnv()
    delete process.env.SUPABASE_SECRET_KEY
    const session = createAdminSessionValue()

    const response = await GET(request({
      cookie: `${ADMIN_SESSION_COOKIE}=${session}`,
    }))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.adminDataOk).toBe(false)
    expect(json.errors.join(' ')).toMatch(/SUPABASE_SECRET_KEY/)
  })
})
