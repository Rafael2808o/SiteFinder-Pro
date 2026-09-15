import type { LeadStatus } from '../../lib/types'
import { LEAD_STATUS_LABELS } from '../../lib/types'

const STATUS_ORDER: LeadStatus[] = [
  'novo',
  'contato_realizado',
  'respondeu',
  'interessado',
  'negociacao',
  'cliente',
  'nao_interessado',
]

const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: 'text-slate-600',
  contato_realizado: 'text-blue-700',
  respondeu: 'text-teal-700',
  interessado: 'text-amber-700',
  negociacao: 'text-orange-700',
  cliente: 'text-emerald-700',
  nao_interessado: 'text-red-700',
}

export function LeadStatusSelect({
  value,
  onChange,
}: {
  value: LeadStatus
  onChange: (status: LeadStatus) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
      className={`rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-teal-600 ${STATUS_COLORS[value]}`}
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {LEAD_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  )
}
