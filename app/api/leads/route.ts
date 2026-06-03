import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createLead } from '@/lib/supabase'

const leadSchema = z.object({
  imovel_id: z.string().uuid(),
  nome: z.string().trim().min(2).max(120),
  telefone: z.string().trim().min(8).max(40),
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  mensagem: z.string().trim().min(10).max(1200),
  origem: z.string().trim().max(80).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = leadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados de contato invalidos.' }, { status: 400 })
    }

    await createLead({
      ...parsed.data,
      email: parsed.data.email || null,
      origem: parsed.data.origem || 'pagina_imovel',
      status: 'novo',
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao salvar contato.', detail: String(err) }, { status: 500 })
  }
}
