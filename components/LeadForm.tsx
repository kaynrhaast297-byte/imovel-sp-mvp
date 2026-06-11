'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, MessageCircle } from 'lucide-react'
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
      aria-busy={status === 'loading'}
      aria-label="Formulario de contato"
      className="lead-form"
    >
      <div className="lead-form-head">
        <MessageCircle size={20} />
        <div>
        <h3>
          Quero saber mais
        </h3>
        <p>
          Envie seus dados para receber atendimento sobre este imovel.
        </p>
        </div>
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
        <textarea {...register('mensagem')} rows={4} />
      </LeadField>

      {feedback && (
        <div
          role={status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`lead-feedback ${status === 'success' ? 'lead-feedback-success' : 'lead-feedback-error'}`}
        >
          {feedback}
        </div>
      )}

      <button
        className="btn btn-primary"
        type="submit"
        disabled={status === 'loading'}
      >
        {status === 'loading' && <span className="button-spinner" aria-hidden="true" />}
        {status === 'loading' ? 'Enviando...' : 'Enviar contato'}
        {status !== 'loading' && <ArrowRight size={15} />}
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
    <label className="lead-field">
      <span className="lead-field-label">
        {label}
      </span>
      {children}
      {error && (
        <span className="lead-field-error">
          {error}
        </span>
      )}
    </label>
  )
}
