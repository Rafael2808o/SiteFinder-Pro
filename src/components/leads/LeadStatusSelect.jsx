import { LEAD_STATUS_LABELS } from '../../lib/constants'

const STATUS_ORDER = [
  'novo',
  'contato_realizado',
  'respondeu',
  'interessado',
  'negociacao',
  'cliente',
  'nao_interessado',
]

const STATUS_COLORS = {
  novo: 'text-slate-600',
  contato_realizado: 'text-blue-700',
  respondeu: 'text-ink',
  interessado: 'text-amber-700',
  negociacao: 'text-orange-700',
  cliente: 'text-emerald-700',
  nao_interessado: 'text-red-700',
}

export function LeadStatusSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-signal ${STATUS_COLORS[value]}`}
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {LEAD_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  )
}
