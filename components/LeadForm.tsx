'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const leadSchema = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome.'),
  telefone: z.string().trim().min(8, 'Informe um telefone valido.'),
  email: z.string().trim().email('Informe um email valido.').optional().or(z.literal('')),
  mensagem: z.string().trim().min(10, 'Escreva uma mensagem um pouco maior.'),
})

type LeadFormData = z.infer<typeof leadSchema>

type LeadFormProps = {
  imovelId: string
  imovelTitulo: string
}

export default function LeadForm({ imovelId, imovelTitulo }: LeadFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      email: '',
      mensagem: `Tenho interesse no imovel: ${imovelTitulo}`,
    },
  })

  async function onSubmit(values: LeadFormData) {
    setStatus('loading')
    setFeedback('')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          imovel_id: imovelId,
          origem: 'pagina_imovel',
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Nao foi possivel enviar seu contato.')

      setStatus('success')
      setFeedback('Contato enviado. Em breve alguem fala com voce.')
      reset({
        nome: '',
        telefone: '',
        email: '',
        mensagem: `Tenho interesse no imovel: ${imovelTitulo}`,
      })
    } catch (error) {
      setStatus('error')
      setFeedback(error instanceof Error ? error.message : 'Erro ao enviar contato.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        padding: '1.25rem',
      }}
    >
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
          Quero saber mais
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Envie seus dados para receber atendimento sobre este imovel.
        </p>
      </div>

      <LeadField label="Nome" error={errors.nome?.message}>
        <input {...register('nome')} autoComplete="name" placeholder="Seu nome" />
      </LeadField>

      <LeadField label="Telefone" error={errors.telefone?.message}>
        <input {...register('telefone')} autoComplete="tel" placeholder="(11) 99999-9999" />
      </LeadField>

      <LeadField label="Email" error={errors.email?.message}>
        <input {...register('email')} autoComplete="email" placeholder="voce@email.com" />
      </LeadField>

      <LeadField label="Mensagem" error={errors.mensagem?.message}>
        <textarea {...register('mensagem')} rows={4} style={{ resize: 'vertical' }} />
      </LeadField>

      {feedback && (
        <div
          style={{
            background: status === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            borderRadius: 'var(--radius-sm)',
            color: status === 'success' ? 'var(--success)' : 'var(--danger)',
            fontSize: '0.85rem',
            padding: '0.75rem',
          }}
        >
          {feedback}
        </div>
      )}

      <button
        className="btn btn-primary"
        type="submit"
        disabled={status === 'loading'}
        style={{ justifyContent: 'center', opacity: status === 'loading' ? 0.75 : 1 }}
      >
        {status === 'loading' ? 'Enviando...' : 'Enviar contato'}
      </button>
    </form>
  )
}

function LeadField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
        {label}
      </span>
      {children}
      {error && (
        <span style={{ color: 'var(--danger)', display: 'block', fontSize: '0.78rem', marginTop: '0.25rem' }}>
          {error}
        </span>
      )}
    </label>
  )
}
