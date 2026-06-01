'use client'

import { useState } from 'react'

const CAMPOS = [
  { key: 'titulo', label: 'Título', type: 'text', required: true, span: 2 },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['apartamento', 'casa', 'terreno', 'comercial'], required: true },
  { key: 'negocio', label: 'Negócio', type: 'select', options: ['venda', 'aluguel', 'temporada'], required: true },
  { key: 'preco', label: 'Preço (R$)', type: 'number', required: true },
  { key: 'area_m2', label: 'Área (m²)', type: 'number', required: true },
  { key: 'quartos', label: 'Quartos', type: 'number' },
  { key: 'banheiros', label: 'Banheiros', type: 'number' },
  { key: 'vagas', label: 'Vagas', type: 'number' },
  { key: 'condominio', label: 'Condomínio (R$/mês)', type: 'number' },
  { key: 'iptu', label: 'IPTU (R$/ano)', type: 'number' },
  { key: 'bairro', label: 'Bairro', type: 'text', required: true },
  { key: 'cidade', label: 'Cidade', type: 'text', required: true },
  { key: 'estado', label: 'Estado', type: 'text' },
  { key: 'cep', label: 'CEP', type: 'text' },
  { key: 'endereco', label: 'Endereço', type: 'text', span: 2 },
  { key: 'portal_origem', label: 'Portal de origem', type: 'text' },
  { key: 'url_original', label: 'URL original', type: 'text' },
  { key: 'descricao', label: 'Descrição', type: 'textarea', span: 2 },
]

export default function AdminPage() {
  const [form, setForm] = useState<Record<string, string>>({ cidade: 'São Paulo', estado: 'SP' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function salvar() {
    setStatus('loading')
    try {
      const payload: Record<string, unknown> = {}
      CAMPOS.forEach(c => {
        if (form[c.key]) {
          payload[c.key] = c.type === 'number' ? Number(form[c.key]) : form[c.key]
        }
      })

      const res = await fetch('/api/imoveis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Erro na requisição')
      setStatus('success')
      setMsg('Imóvel cadastrado com sucesso!')
      setForm({ cidade: 'São Paulo', estado: 'SP' })
    } catch (e) {
      setStatus('error')
      setMsg('Erro ao salvar. Verifique o Supabase.')
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', marginBottom: '0.5rem' }}>
        Painel Admin
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Cadastre imóveis manualmente para popular o banco de dados.
      </p>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.5rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
      }}>
        {CAMPOS.map(c => (
          <div key={c.key} style={{ gridColumn: c.span === 2 ? 'span 2' : 'span 1' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              {c.label}{c.required && <span style={{ color: 'var(--danger)' }}> *</span>}
            </label>
            {c.type === 'select' ? (
              <select value={form[c.key] ?? ''} onChange={e => setForm({ ...form, [c.key]: e.target.value })}>
                <option value="">Selecione</option>
                {c.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : c.type === 'textarea' ? (
              <textarea
                rows={3}
                value={form[c.key] ?? ''}
                onChange={e => setForm({ ...form, [c.key]: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            ) : (
              <input
                type={c.type}
                value={form[c.key] ?? ''}
                onChange={e => setForm({ ...form, [c.key]: e.target.value })}
              />
            )}
          </div>
        ))}

        {/* Feedback */}
        {status !== 'idle' && (
          <div style={{
            gridColumn: 'span 2',
            padding: '0.875rem',
            borderRadius: 'var(--radius-sm)',
            background: status === 'success' ? 'rgba(34,197,94,0.1)' : status === 'error' ? 'rgba(239,68,68,0.1)' : 'var(--bg-elevated)',
            color: status === 'success' ? 'var(--success)' : status === 'error' ? 'var(--danger)' : 'var(--text-muted)',
            fontSize: '0.875rem',
          }}>
            {status === 'loading' ? '⏳ Salvando…' : msg}
          </div>
        )}

        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setForm({ cidade: 'São Paulo', estado: 'SP' })}>
            Limpar
          </button>
          <button className="btn btn-primary" onClick={salvar} disabled={status === 'loading'}>
            {status === 'loading' ? 'Salvando…' : '💾 Salvar imóvel'}
          </button>
        </div>
      </div>
    </div>
  )
}
