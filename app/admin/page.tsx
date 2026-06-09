'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { ImagePlus, LogOut, MapPin, Save, Star, Trash2 } from 'lucide-react'
import { MAX_PROPERTY_IMAGES } from '@/lib/property-images'

type Campo = {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  required?: boolean
  span?: 2
  options?: readonly string[]
}

type UploadedImage = {
  path: string
  url: string
}

const CAMPOS: Campo[] = [
  { key: 'titulo', label: 'Titulo', type: 'text', required: true, span: 2 },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['apartamento', 'casa', 'terreno', 'comercial', 'hotel'], required: true },
  { key: 'negocio', label: 'Negocio', type: 'select', options: ['venda', 'aluguel', 'temporada'], required: true },
  { key: 'preco', label: 'Preco (R$)', type: 'number', required: true },
  { key: 'area_m2', label: 'Area (m2)', type: 'number', required: true },
  { key: 'quartos', label: 'Quartos', type: 'number' },
  { key: 'banheiros', label: 'Banheiros', type: 'number' },
  { key: 'vagas', label: 'Vagas', type: 'number' },
  { key: 'condominio', label: 'Condominio (R$/mes)', type: 'number' },
  { key: 'iptu', label: 'IPTU (R$/ano)', type: 'number' },
  { key: 'cep', label: 'CEP', type: 'text', required: true },
  { key: 'numero', label: 'Numero', type: 'text', required: true },
  { key: 'endereco', label: 'Endereco', type: 'text', required: true, span: 2 },
  { key: 'complemento', label: 'Complemento', type: 'text' },
  { key: 'bairro', label: 'Bairro', type: 'text', required: true },
  { key: 'cidade', label: 'Cidade', type: 'text', required: true },
  { key: 'estado', label: 'Estado', type: 'text', required: true },
  { key: 'latitude', label: 'Latitude', type: 'number' },
  { key: 'longitude', label: 'Longitude', type: 'number' },
  { key: 'portal_origem', label: 'Portal de origem', type: 'text' },
  { key: 'url_original', label: 'URL original', type: 'text' },
  { key: 'descricao', label: 'Descricao', type: 'textarea', span: 2 },
]

const FORM_INICIAL = { cidade: 'Sao Paulo', estado: 'SP' }

export default function AdminPage() {
  const [form, setForm] = useState<Record<string, string>>(FORM_INICIAL)
  const [adminToken, setAdminToken] = useState('')
  const [desbloqueado, setDesbloqueado] = useState(false)
  const [verificandoSessao, setVerificandoSessao] = useState(true)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [consultandoCep, setConsultandoCep] = useState(false)
  const [arquivos, setArquivos] = useState<File[]>([])
  const [principalIndex, setPrincipalIndex] = useState(0)

  const previews = useMemo(
    () => arquivos.map(arquivo => ({ arquivo, url: URL.createObjectURL(arquivo) })),
    [arquivos],
  )

  useEffect(() => () => {
    previews.forEach(preview => URL.revokeObjectURL(preview.url))
  }, [previews])

  useEffect(() => {
    fetch('/api/admin/session')
      .then(res => res.json())
      .then(data => setDesbloqueado(data?.authenticated === true))
      .catch(() => setDesbloqueado(false))
      .finally(() => setVerificandoSessao(false))
  }, [])

  async function desbloquear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const token = adminToken.trim()
    if (!token) {
      setStatus('error')
      setMsg('Informe o token de admin.')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) throw new Error('Token de admin invalido.')

      setAdminToken('')
      setDesbloqueado(true)
      setStatus('idle')
      setMsg('')
    } catch (error) {
      setStatus('error')
      setMsg(error instanceof Error ? error.message : 'Nao foi possivel autenticar.')
    }
  }

  async function bloquear() {
    await fetch('/api/admin/session', { method: 'DELETE' }).catch(() => null)
    setAdminToken('')
    setDesbloqueado(false)
    setStatus('idle')
    setMsg('')
  }

  function limpar() {
    setForm(FORM_INICIAL)
    setArquivos([])
    setPrincipalIndex(0)
    setStatus('idle')
    setMsg('')
  }

  function selecionarFotos(files: FileList | null) {
    const selecionados = Array.from(files ?? []).slice(0, MAX_PROPERTY_IMAGES)
    setArquivos(selecionados)
    setPrincipalIndex(0)
    setStatus('idle')
    setMsg('')
  }

  function removerFoto(index: number) {
    setArquivos(current => current.filter((_, fileIndex) => fileIndex !== index))
    setPrincipalIndex(current => current === index ? 0 : current > index ? current - 1 : current)
  }

  async function consultarCep() {
    if (!form.cep?.trim()) {
      setStatus('error')
      setMsg('Informe um CEP valido.')
      return
    }

    setConsultandoCep(true)
    setStatus('idle')
    setMsg('')

    try {
      const res = await fetch('/api/admin/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: form.cep, numero: form.numero || undefined }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Nao foi possivel consultar o CEP.')

      const endereco = data.endereco as Record<string, unknown>
      setForm(current => ({
        ...current,
        cep: String(endereco.cep ?? current.cep ?? ''),
        endereco: String(endereco.endereco ?? current.endereco ?? ''),
        complemento: String(endereco.complemento ?? current.complemento ?? ''),
        bairro: String(endereco.bairro ?? current.bairro ?? ''),
        cidade: String(endereco.cidade ?? current.cidade ?? ''),
        estado: String(endereco.estado ?? current.estado ?? ''),
        latitude: endereco.latitude == null ? current.latitude ?? '' : String(endereco.latitude),
        longitude: endereco.longitude == null ? current.longitude ?? '' : String(endereco.longitude),
      }))
      setMsg(endereco.latitude == null ? 'Endereco encontrado. Coordenadas nao localizadas.' : 'Endereco e coordenadas encontrados.')
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setMsg(error instanceof Error ? error.message : 'Nao foi possivel consultar o CEP.')
    } finally {
      setConsultandoCep(false)
    }
  }

  async function limparUploads(imagens: UploadedImage[]) {
    if (imagens.length === 0) return
    await fetch('/api/admin/property-images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: imagens.map(imagem => imagem.path) }),
    }).catch(() => null)
  }

  async function salvar() {
    const faltando = CAMPOS.find((campo) => campo.required && !form[campo.key]?.trim())
    if (faltando) {
      setStatus('error')
      setMsg(`Preencha o campo obrigatorio: ${faltando.label}.`)
      return
    }

    if (arquivos.length < 1) {
      setStatus('error')
      setMsg('Adicione ao menos uma foto do imovel.')
      return
    }

    setStatus('loading')
    let imagensEnviadas: UploadedImage[] = []

    try {
      const orderedFiles = [
        arquivos[principalIndex],
        ...arquivos.filter((_, index) => index !== principalIndex),
      ]
      const imageData = new FormData()
      orderedFiles.forEach(file => imageData.append('files', file))

      const uploadRes = await fetch('/api/admin/property-images', {
        method: 'POST',
        body: imageData,
      })
      const uploadData = await uploadRes.json().catch(() => null)
      if (!uploadRes.ok) throw new Error(uploadData?.error ?? 'Erro ao enviar fotos.')

      imagensEnviadas = uploadData.imagens
      const payload: Record<string, unknown> = {}
      CAMPOS.forEach((campo) => {
        const valor = form[campo.key]?.trim()
        if (valor) payload[campo.key] = campo.type === 'number' ? Number(valor) : valor
      })
      payload.localizacao_aproximada = true
      payload.fotos = uploadData.fotos
      payload.foto_principal = uploadData.fotos[0]

      const res = await fetch('/api/imoveis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Erro na requisicao')
      }

      setStatus('success')
      setMsg('Imovel cadastrado com fotos e localizacao.')
      setForm(FORM_INICIAL)
      setArquivos([])
      setPrincipalIndex(0)
    } catch (error) {
      await limparUploads(imagensEnviadas)
      setStatus('error')
      setMsg(error instanceof Error ? error.message : 'Erro ao salvar. Verifique o Supabase.')
    }
  }

  if (verificandoSessao) {
    return (
      <div style={{ maxWidth: '440px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Verificando sessao administrativa...</p>
      </div>
    )
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
            <label htmlFor="admin-token" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Token de admin
            </label>
            <input
              id="admin-token"
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {status === 'error' && <div style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{msg}</div>}

          <button className="btn btn-primary" type="submit" style={{ justifyContent: 'center' }}>
            {status === 'loading' ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Novo imovel real
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Complete dados, fotos e localizacao antes de publicar.
          </p>
        </div>
        <button className="btn btn-ghost" onClick={bloquear}>
          <LogOut size={16} aria-hidden="true" /> Sair
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
            <label htmlFor={`admin-${campo.key}`} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              {campo.label}{campo.required && <span style={{ color: 'var(--danger)' }}> *</span>}
            </label>
            {campo.type === 'select' ? (
              <select id={`admin-${campo.key}`} value={form[campo.key] ?? ''} onChange={(e) => setForm({ ...form, [campo.key]: e.target.value })}>
                <option value="">Selecione</option>
                {campo.options?.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : campo.type === 'textarea' ? (
              <textarea
                id={`admin-${campo.key}`}
                rows={4}
                value={form[campo.key] ?? ''}
                onChange={(e) => setForm({ ...form, [campo.key]: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            ) : (
              <input
                id={`admin-${campo.key}`}
                type={campo.type}
                step={campo.key === 'latitude' || campo.key === 'longitude' ? 'any' : undefined}
                value={form[campo.key] ?? ''}
                onChange={(e) => setForm({ ...form, [campo.key]: e.target.value })}
              />
            )}
            {campo.key === 'cep' && (
              <button className="btn btn-ghost" type="button" onClick={consultarCep} disabled={consultandoCep} style={{ marginTop: '0.5rem' }}>
                <MapPin size={16} aria-hidden="true" /> {consultandoCep ? 'Consultando...' : 'Consultar CEP'}
              </button>
            )}
          </div>
        ))}

        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="admin-fotos" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
            Fotos * <span style={{ fontWeight: 400 }}>JPG, PNG ou WebP, maximo 5 MB cada</span>
          </label>
          <label htmlFor="admin-fotos" className="btn btn-ghost" style={{ width: 'fit-content' }}>
            <ImagePlus size={16} aria-hidden="true" /> Selecionar fotos
          </label>
          <input
            id="admin-fotos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => selecionarFotos(event.target.files)}
            style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', opacity: 0 }}
          />
        </div>

        {previews.length > 0 && (
          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
            {previews.map((preview, index) => (
              <div key={`${preview.arquivo.name}-${index}`} style={{ border: index === principalIndex ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div
                  role="img"
                  aria-label={`Preview ${index + 1}: ${preview.arquivo.name}`}
                  style={{ aspectRatio: '4 / 3', backgroundImage: `url("${preview.url}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem', padding: '0.5rem' }}>
                  <button className="btn btn-ghost" type="button" onClick={() => setPrincipalIndex(index)} aria-label={`Definir foto ${index + 1} como principal`} style={{ padding: '0.4rem' }}>
                    <Star size={15} fill={index === principalIndex ? 'currentColor' : 'none'} aria-hidden="true" />
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={() => removerFoto(index)} aria-label={`Remover foto ${index + 1}`} style={{ padding: '0.4rem' }}>
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {status !== 'idle' && (
          <div style={{
            gridColumn: '1 / -1',
            padding: '0.875rem',
            borderRadius: 'var(--radius-sm)',
            background: status === 'success' ? 'rgba(34,197,94,0.1)' : status === 'error' ? 'rgba(239,68,68,0.1)' : 'var(--bg-elevated)',
            color: status === 'success' ? 'var(--success)' : status === 'error' ? 'var(--danger)' : 'var(--text-muted)',
            fontSize: '0.875rem',
          }}>
            {status === 'loading' ? 'Enviando fotos e salvando...' : msg}
          </div>
        )}

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={limpar}>
            Limpar
          </button>
          <button className="btn btn-primary" onClick={salvar} disabled={status === 'loading'}>
            <Save size={16} aria-hidden="true" /> {status === 'loading' ? 'Salvando...' : 'Salvar imovel'}
          </button>
        </div>
      </div>
    </div>
  )
}
