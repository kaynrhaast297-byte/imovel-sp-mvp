'use client'

import { FormEvent, useState } from 'react'

type Campo = {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  required?: boolean
  span?: 2
  options?: readonly string[]
}

const CAMPOS: Campo[] = [
  { key: 'titulo', label: 'Titulo', type: 'text', required: true, span: 2 },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['apartamento', 'casa', 'terreno', 'comercial'], required: true },
  { key: 'negocio', label: 'Negocio', type: 'select', options: ['venda', 'aluguel', 'temporada'], required: true },
  { key: 'preco', label: 'Preco (R$)', type: 'number', required: true },
  { key: 'area_m2', label: 'Area (m2)', type: 'number', required: true },
  { key: 'quartos', label: 'Quartos', type: 'number' },
  { key: 'banheiros', label: 'Banheiros', type: 'number' },
  { key: 'vagas', label: 'Vagas', type: 'number' },
  { key: 'condominio', label: 'Condominio (R$/mes)', type: 'number' },
  { key: 'iptu', label: 'IPTU (R$/ano)', type: 'number' },
  { key: 'bairro', label: 'Bairro', type: 'text', required: true },
  { key: 'cidade', label: 'Cidade', type: 'text', required: true },
  { key: 'estado', label: 'Estado', type: 'text' },
  { key: 'cep', label: 'CEP', type: 'text' },
  { key: 'endereco', label: 'Endereco', type: 'text', span: 2 },
  { key: 'portal_origem', label: 'Portal de origem', type: 'text' },
  { key: 'url_original', label: 'URL original', type: 'text' },
  { key: 'descricao', label: 'Descricao', type: 'textarea', span: 2 },
]

const FORM_INICIAL = { cidade: 'Sao Paulo', estado: 'SP' }

export default function AdminPage() {
  const [form, setForm] = useState<Record<string, string>>(FORM_INICIAL)
  const [adminToken, setAdminToken] = useState('')
  const [desbloqueado, setDesbloqueado] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  function desbloquear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const token = adminToken.trim()
    if (!token) {
      setStatus('error')
      setMsg('Informe o token de admin.')
      return
    }

    setAdminToken(token)
    setDesbloqueado(true)
    setStatus('idle')
    setMsg('')
  }

  function bloquear() {
    setAdminToken('')
    setDesbloqueado(false)
    setStatus('idle')
    setMsg('')
  }

  function limpar() {
    setForm(FORM_INICIAL)
    setStatus('idle')
    setMsg('')
  }

  async function salvar() {
    const faltando = CAMPOS.find((campo) => campo.required && !form[campo.key]?.trim())
    if (faltando) {
      setStatus('error')
      setMsg(`Preencha o campo obrigatorio: ${faltando.label}.`)
      return
    }

    setStatus('loading')
    try {
      const payload: Record<string, unknown> = {}
      CAMPOS.forEach((campo) => {
        const valor = form[campo.key]?.trim()
        if (valor) payload[campo.key] = campo.type === 'number' ? Number(valor) : valor
      })

      const res = await fetch('/api/imoveis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Erro na requisicao')
      }

      setStatus('success')
      setMsg('Imovel cadastrado com sucesso.')
      setForm(FORM_INICIAL)
    } catch (error) {
      setStatus('error')
      setMsg(error instanceof Error ? error.message : 'Erro ao salvar. Verifique o Supabase.')
    }
  }

  if (!desbloqueado) {
    return (
      <div style={{ maxWidth: '440px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Painel Admin
        </h1>
        <form
          onSubmit={desbloquear}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '1.5rem',
            padding: '1.25rem',
          }}
        >
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Token de admin
            </label>
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {status === 'error' && (
            <div style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{msg}</div>
          )}

          <button className="btn btn-primary" type="submit" style={{ justifyContent: 'center' }}>
            Entrar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Painel Admin
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Cadastre imoveis manualmente para popular o banco de dados.
          </p>
        </div>
        <button className="btn btn-ghost" onClick={bloquear}>
          Sair
        </button>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}>
        {CAMPOS.map((campo) => (
          <div key={campo.key} style={{ gridColumn: campo.span === 2 ? '1 / -1' : undefined }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              {campo.label}{campo.required && <span style={{ color: 'var(--danger)' }}> *</span>}
            </label>
            {campo.type === 'select' ? (
              <select value={form[campo.key] ?? ''} onChange={(e) => setForm({ ...form, [campo.key]: e.target.value })}>
                <option value="">Selecione</option>
                {campo.options?.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : campo.type === 'textarea' ? (
              <textarea
                rows={3}
                value={form[campo.key] ?? ''}
                onChange={(e) => setForm({ ...form, [campo.key]: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            ) : (
              <input
                type={campo.type}
                value={form[campo.key] ?? ''}
                onChange={(e) => setForm({ ...form, [campo.key]: e.target.value })}
              />
            )}
          </div>
        ))}

        {status !== 'idle' && (
          <div style={{
            gridColumn: '1 / -1',
            padding: '0.875rem',
            borderRadius: 'var(--radius-sm)',
            background: status === 'success' ? 'rgba(34,197,94,0.1)' : status === 'error' ? 'rgba(239,68,68,0.1)' : 'var(--bg-elevated)',
            color: status === 'success' ? 'var(--success)' : status === 'error' ? 'var(--danger)' : 'var(--text-muted)',
            fontSize: '0.875rem',
          }}>
            {status === 'loading' ? 'Salvando...' : msg}
          </div>
        )}

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={limpar}>
            Limpar
          </button>
          <button className="btn btn-primary" onClick={salvar} disabled={status === 'loading'}>
            {status === 'loading' ? 'Salvando...' : 'Salvar imovel'}
          </button>
        </div>
      </div>
    </div>
  )
}
