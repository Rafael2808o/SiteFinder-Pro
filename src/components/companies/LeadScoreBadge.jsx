export function LeadScoreBadge({ score }) {
  const colorClass = score >= 80 ? 'text-red-700' : score >= 60 ? 'text-amber-700' : 'text-slate-500'
  const emoji = score >= 80 ? '🔥' : score >= 60 ? '⚡' : '📊'

  return (
    <span className={`text-sm font-semibold ${colorClass}`}>
      Potencial do lead: {score}/100 {emoji}
    </span>
  )
}
