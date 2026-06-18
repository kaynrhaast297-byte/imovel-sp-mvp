import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getRuntimeEnvHealth } from '@/lib/runtime-env'

const noStore = { 'Cache-Control': 'no-store' }

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req)
  if (unauthorized) return unauthorized

  return NextResponse.json(getRuntimeEnvHealth(), { headers: noStore })
}
