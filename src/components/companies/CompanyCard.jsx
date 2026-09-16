import { useState } from 'react'
import { Star, MapPin, Phone, MessageCircle, UserPlus, Eye } from 'lucide-react'
import { InstagramIcon } from '../ui/SocialIcons'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { SiteStatusBadge } from './SiteStatusBadge'
import { LeadScoreBadge } from './LeadScoreBadge'
import { buildWhatsappUrl } from '../../lib/whatsapp'

export function CompanyCard({
  company,
  onViewDetails,
  onAddLead,
  onGenerateMessage,
  isLead,
}) {
  const [adding, setAdding] = useState(false)
  const whatsappUrl = buildWhatsappUrl(company.phone)

  async function handleAddLead() {
    setAdding(true)
    try {
      await onAddLead(company)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-4 transition-transform hover:-translate-y-0.5">
      <div className="flex gap-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {company.photoUrl ? (
            <img src={company.photoUrl} alt={company.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">🏢</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900">{company.name}</h3>
          <p className="truncate text-xs text-slate-500">{company.category}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
            <Star size={13} className="fill-amber-400 text-amber-500" />
            {company.rating?.toFixed(1) ?? '—'} · {company.reviewCount} avaliações
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-xs text-slate-500">
        <p className="flex items-start gap-1.5">
          <MapPin size={13} className="mt-0.5 flex-shrink-0" />
          <span className="truncate">{company.address}</span>
        </p>
        {company.phone && (
          <p className="flex items-center gap-1.5">
            <Phone size={13} />
            {company.phone}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <SiteStatusBadge status={company.siteStatus} />
        <LeadScoreBadge score={company.leadScore} />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button variant="secondary" size="sm" icon={<Eye size={14} />} onClick={() => onViewDetails(company)}>
          Ver empresa
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<MapPin size={14} />}
          onClick={() => window.open(company.mapUrl, '_blank')}
        >
          Abrir no mapa
        </Button>
        {company.instagram && (
          <Button
            variant="secondary"
            size="sm"
            icon={<InstagramIcon size={14} />}
            onClick={() => window.open(company.instagram, '_blank')}
          >
            Instagram
          </Button>
        )}
        {whatsappUrl && (
          <Button
            variant="secondary"
            size="sm"
            icon={<MessageCircle size={14} />}
            onClick={() => window.open(whatsappUrl, '_blank')}
          >
            WhatsApp
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 border-t border-slate-200 pt-3">
        {!isLead && (
          <Button size="sm" icon={<UserPlus size={14} />} loading={adding} onClick={handleAddLead}>
            Adicionar aos leads
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="border border-slate-300"
          icon={<MessageCircle size={14} />}
          onClick={() => onGenerateMessage(company)}
        >
          Gerar mensagem
        </Button>
      </div>
    </Card>
  )
}
