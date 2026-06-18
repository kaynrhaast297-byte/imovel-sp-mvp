import { describe, expect, it } from 'vitest'
import { getRuntimeEnvHealth, getSupabaseAdminEnv, getSupabasePublicEnv } from '@/lib/runtime-env'

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-value',
  IMOVEL_ADMIN_TOKEN: '0123456789abcdef0123456789abcdef',
  SUPABASE_SECRET_KEY: 'server-secret-value',
}

describe('runtime-env', () => {
  it('aprova ambiente completo sem expor valores', () => {
    const health = getRuntimeEnvHealth(validEnv)

    expect(health.ok).toBe(true)
    expect(health.publicDataOk).toBe(true)
    expect(health.adminAuthOk).toBe(true)
    expect(health.adminDataOk).toBe(true)
    expect(JSON.stringify(health)).not.toContain(validEnv.SUPABASE_SECRET_KEY)
    expect(JSON.stringify(health)).not.toContain(validEnv.IMOVEL_ADMIN_TOKEN)
  })

  it('detecta variaveis obrigatorias ausentes e URL invalida', () => {
    const health = getRuntimeEnvHealth({
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
    })

    expect(health.ok).toBe(false)
    expect(health.publicDataOk).toBe(false)
    expect(health.adminAuthOk).toBe(false)
    expect(health.adminDataOk).toBe(false)
    expect(health.errors.join(' ')).toMatch(/NEXT_PUBLIC_SUPABASE_ANON_KEY/)
    expect(health.errors.join(' ')).toMatch(/SUPABASE_SECRET_KEY/)
    expect(health.errors.join(' ')).toMatch(/HTTPS/)
  })

  it('alerta token admin fraco sem bloquear ambiente funcional', () => {
    const health = getRuntimeEnvHealth({
      ...validEnv,
      IMOVEL_ADMIN_TOKEN: 'curto',
    })

    expect(health.adminAuthOk).toBe(true)
    expect(health.warnings.join(' ')).toMatch(/32 caracteres/)
  })

  it('bloqueia quando a chave admin do Supabase e igual a chave publica', () => {
    const health = getRuntimeEnvHealth({
      ...validEnv,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'same-key',
      SUPABASE_SECRET_KEY: 'same-key',
    })

    expect(health.adminDataOk).toBe(false)
    expect(health.errors.join(' ')).toMatch(/nao pode ser igual/)
  })

  it('retorna envs normalizadas para Supabase public/admin', () => {
    expect(getSupabasePublicEnv(validEnv)).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key-value',
    })
    expect(getSupabaseAdminEnv(validEnv)).toEqual({
      url: 'https://example.supabase.co',
      key: 'server-secret-value',
    })
  })

  it('falha cedo para Supabase admin incompleto', () => {
    expect(() => getSupabaseAdminEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      IMOVEL_ADMIN_TOKEN: '0123456789abcdef0123456789abcdef',
    })).toThrow(/SUPABASE_SECRET_KEY/)
  })
})
