import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, MapPin, Phone, Globe, Clock, MessageCircle, UserPlus,
} from 'lucide-react'
import { InstagramIcon, FacebookIcon } from '../components/ui/SocialIcons'
import { useSearch } from '../context/SearchContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SiteStatusBadge } from '../components/companies/SiteStatusBadge'
import { LeadScoreBadge } from '../components/companies/LeadScoreBadge'
import { MessageGeneratorModal } from '../components/prospecting/MessageGeneratorModal'
import { PrototypeGeneratorModal } from '../components/prospecting/PrototypeGeneratorModal'
import { addLeadFromCompany } from '../services/leads'
import { buildWhatsappUrl } from '../lib/whatsapp'
import { photoUrl } from '../services/places'

export function CompanyDetailsPage() {
  const { selectedCompany: company, markContacted } = useSearch()
  const navigate = useNavigate()
  const [showMessage, setShowMessage] = useState(false)
  const [showPrototype, setShowPrototype] = useState(false)
  const [adding, setAdding] = useState(false)

  if (!company) {
    return (
      <div className="p-12 text-center text-sm text-slate-500">
        Nenhuma empresa selecionada.
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/resultados')}>
            Voltar aos resultados
          </Button>
        </div>
      </div>
    )
  }

  const activeCompany = company
  const whatsappUrl = buildWhatsappUrl(activeCompany.phone)

  async function handleAddLead() {
    setAdding(true)
    try {
      await addLeadFromCompany(activeCompany)
      markContacted(activeCompany.placeId)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <Card className="overflow-hidden">
        {company.photoRefs.length > 0 && (
          <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
            {company.photoRefs.slice(0, 4).map((ref, i) => (
              <img
                key={i}
                src={photoUrl(ref)}
                alt={company.name}
                className="aspect-square w-full object-cover"
              />
            ))}
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{company.name}</h1>
              <p className="text-sm text-slate-500">{company.category}</p>
            </div>
            <SiteStatusBadge status={company.siteStatus} />
          </div>

          <div className="mt-3">
            <LeadScoreBadge score={company.leadScore} />
            <p className="mt-1 text-xs text-slate-500">{company.leadScoreReason}</p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <Star size={15} className="fill-amber-400 text-amber-500" />
              {company.rating?.toFixed(1) ?? '—'} · {company.reviewCount} avaliações
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={15} /> {company.address}
            </p>
            {company.phone && (
              <p className="flex items-center gap-2">
                <Phone size={15} /> {company.phone}
              </p>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-blue-700 hover:underline"
              >
                <Globe size={15} /> {company.website}
              </a>
            )}
            {company.instagram && (
              <a
                href={company.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-pink-700 hover:underline"
              >
                <InstagramIcon size={15} /> Instagram
              </a>
            )}
            {company.facebook && (
              <a
                href={company.facebook}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-blue-700 hover:underline"
              >
                <FacebookIcon size={15} /> Facebook
              </a>
            )}
          </div>

          {company.openingHours && (
            <div className="mt-5">
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Clock size={15} /> Horário de funcionamento
              </p>
              <ul className="text-xs text-slate-500">
                {company.openingHours.weekdayText.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-5">
            <Button variant="secondary" icon={<MapPin size={16} />} onClick={() => window.open(company.mapUrl, '_blank')}>
              Abrir no mapa
            </Button>
            {whatsappUrl && (
              <Button variant="secondary" icon={<MessageCircle size={16} />} onClick={() => window.open(whatsappUrl, '_blank')}>
                Abrir WhatsApp
              </Button>
            )}
            <Button icon={<UserPlus size={16} />} loading={adding} onClick={handleAddLead}>
              Adicionar aos leads
            </Button>
            <Button variant="ghost" className="border border-slate-300" icon={<MessageCircle size={16} />} onClick={() => setShowMessage(true)}>
              Gerar mensagem
            </Button>
          </div>
        </div>
      </Card>

      {showMessage && (
        <MessageGeneratorModal
          company={company}
          onClose={() => setShowMessage(false)}
          onGeneratePrototype={() => {
            setShowMessage(false)
            setShowPrototype(true)
          }}
        />
      )}
      {showPrototype && (
        <PrototypeGeneratorModal company={company} onClose={() => setShowPrototype(false)} />
      )}
    </div>
  )
}
