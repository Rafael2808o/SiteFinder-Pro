import type { SiteStatus } from '../../lib/types'
import { SITE_STATUS_LABELS } from '../../lib/types'
import { Badge } from '../ui/Badge'

const TONE: Record<SiteStatus, 'red' | 'yellow' | 'green'> = {
  sem_site: 'red',
  possivel_site: 'yellow',
  com_site: 'green',
}

const EMOJI: Record<SiteStatus, string> = {
  sem_site: '🔴',
  possivel_site: '🟡',
  com_site: '🟢',
}

export function SiteStatusBadge({ status }: { status: SiteStatus }) {
  return (
    <Badge tone={TONE[status]}>
      {EMOJI[status]} {SITE_STATUS_LABELS[status].toUpperCase()}
    </Badge>
  )
}
