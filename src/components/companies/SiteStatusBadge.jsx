import { SITE_STATUS_LABELS } from '../../lib/constants'
import { Badge } from '../ui/Badge'

const TONE = {
  sem_site: 'red',
  possivel_site: 'yellow',
  com_site: 'green',
}

const EMOJI = {
  sem_site: '🔴',
  possivel_site: '🟡',
  com_site: '🟢',
}

export function SiteStatusBadge({ status }) {
  return (
    <Badge tone={TONE[status]}>
      {EMOJI[status]} {SITE_STATUS_LABELS[status].toUpperCase()}
    </Badge>
  )
}
