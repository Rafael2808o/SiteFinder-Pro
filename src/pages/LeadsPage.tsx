import { useEffect, useMemo, useState } from 'react'
import { Search, Phone, MapPin, MessageCircle } from 'lucide-react'
import { InstagramIcon } from '../components/ui/SocialIcons'
import type { Lead, LeadStatus } from '../lib/types'
import { LEAD_STATUS_LABELS } from '../lib/types'
import { listLeads, updateLeadStatus } from '../services/leads'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import { LeadStatusSelect } from '../components/leads/LeadStatusSelect'
import { buildWhatsappUrl } from '../lib/whatsapp'

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos os status' },
  ...(Object.entries(LEAD_STATUS_LABELS) as [LeadStatus, string][]).map(([value, label]) => ({
    value,
    label,
  })),
]

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')

  useEffect(() => {
    listLeads()
      .then(setLeads)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (status !== 'todos' && l.status !== status) return false
      if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [leads, search, status])

  async function handleStatusChange(id: string, newStatus: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)))
    await updateLeadStatus(id, newStatus)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Meus Leads</h1>
          <p className="text-sm text-slate-500">{leads.length} leads salvos</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Select value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lead) => {
            const whatsappUrl = buildWhatsappUrl(lead.whatsapp ?? lead.phone)
            return (
              <Card key={lead.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{lead.name}</h3>
                    <p className="text-xs text-slate-500">{lead.category}</p>
                  </div>
                  <Badge tone="teal">{lead.leadScore}/100</Badge>
                </div>

                <div className="flex flex-col gap-1 text-xs text-slate-500">
                  {lead.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone size={12} /> {lead.phone}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5">
                    <MapPin size={12} /> {lead.address}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <LeadStatusSelect value={lead.status} onChange={(s) => handleStatusChange(lead.id, s)} />
                  <div className="flex gap-1">
                    {whatsappUrl && (
                      <button
                        onClick={() => window.open(whatsappUrl, '_blank')}
                        className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-50"
                      >
                        <MessageCircle size={15} />
                      </button>
                    )}
                    {lead.instagram && (
                      <button
                        onClick={() => window.open(lead.instagram, '_blank')}
                        className="rounded-lg p-1.5 text-pink-700 hover:bg-pink-50"
                      >
                        <InstagramIcon size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 py-16 text-slate-500">
              <Search size={24} />
              <p className="text-sm">Nenhum lead encontrado. Adicione empresas na busca.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
