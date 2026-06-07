import { NextRequest, NextResponse } from 'next/server'
import { internalServerError, invalidRequest } from '@/lib/api-response'
import { checkRateLimit, getClientIp, getLeadRateLimitOptions } from '@/lib/rate-limit'
import { createLead } from '@/lib/supabase'
import { leadSchema } from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    const limit = checkRateLimit(getClientIp(req), getLeadRateLimitOptions())
    if (!limit.allowed) {
      const retryAfter = Math.max(Math.ceil((limit.resetAt - Date.now()) / 1000), 1)
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde antes de enviar novamente.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(limit.limit),
            'X-RateLimit-Remaining': String(limit.remaining),
          },
        },
      )
    }

    const parsed = leadSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return invalidRequest('Dados de contato invalidos.')

    await createLead({
      ...parsed.data,
      email: parsed.data.email || null,
      origem: parsed.data.origem || 'pagina_imovel',
      status: 'novo',
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    return internalServerError('Erro ao salvar contato.', err)
  }
}
