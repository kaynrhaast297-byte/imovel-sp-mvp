import type { Metadata } from 'next'
import AdminPropertiesList from '@/components/admin/AdminPropertiesList'
import type { AdminImovelStatusFilter } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Imoveis | Admin',
  robots: { index: false, follow: false },
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function AdminPropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const rawPage = Number(firstValue(params.page) ?? '1')
  const rawStatus = firstValue(params.status)
  const status: AdminImovelStatusFilter = rawStatus === 'ativo' || rawStatus === 'inativo'
    ? rawStatus
    : 'todos'

  return (
    <AdminPropertiesList
      page={Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1}
      q={firstValue(params.q)?.trim() ?? ''}
      status={status}
    />
  )
}
