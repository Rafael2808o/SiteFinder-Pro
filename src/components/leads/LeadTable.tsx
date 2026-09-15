import { useState } from 'react'
import { MapPin, MessageCircle, Trash2, CheckCircle2 } from 'lucide-react'
import type { Lead, LeadStatus } from '../../lib/types'
import { LeadStatusSelect } from './LeadStatusSelect'
import { buildWhatsappUrl } from '../../lib/whatsapp'
import { InstagramIcon } from '../ui/SocialIcons'

interface Props {
  leads: Lead[]
  onStatusChange: (id: string, status: LeadStatus) => void
  onNotesChange: (id: string, notes: string) => void
  onDelete: (id: string) => void
  onMarkClient: (id: string) => void
}

export function LeadTable({ leads, onStatusChange, onNotesChange, onDelete, onMarkClient }: Props) {
  const [editingNotes, setEditingNotes] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Empresa</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Contato</th>
            <th className="px-4 py-3">Avaliação</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Observações</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {leads.map((lead) => {
            const whatsappUrl = buildWhatsappUrl(lead.whatsapp ?? lead.phone)
            return (
              <tr key={lead.id} className="text-slate-700 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.city}</p>
                </td>
                <td className="px-4 py-3">{lead.category}</td>
                <td className="px-4 py-3 text-xs">{lead.phone ?? '—'}</td>
                <td className="px-4 py-3 text-xs">
                  {lead.rating ? `⭐ ${lead.rating.toFixed(1)} (${lead.reviewCount})` : '—'}
                </td>
                <td className="px-4 py-3">
                  <LeadStatusSelect value={lead.status} onChange={(s) => onStatusChange(lead.id, s)} />
                </td>
                <td className="px-4 py-3">
                  {editingNotes === lead.id ? (
                    <input
                      autoFocus
                      defaultValue={lead.notes}
                      onBlur={(e) => {
                        onNotesChange(lead.id, e.target.value)
                        setEditingNotes(null)
                      }}
                      className="w-40 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-teal-600"
                    />
                  ) : (
                    <button
                      onClick={() => setEditingNotes(lead.id)}
                      className="text-left text-xs text-slate-500 hover:text-slate-800"
                    >
                      {lead.notes || 'Adicionar observação...'}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {whatsappUrl && (
                      <button
                        title="Abrir WhatsApp"
                        onClick={() => window.open(whatsappUrl, '_blank')}
                        className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-50"
                      >
                        <MessageCircle size={15} />
                      </button>
                    )}
                    {lead.instagram && (
                      <button
                        title="Abrir Instagram"
                        onClick={() => window.open(lead.instagram, '_blank')}
                        className="rounded-lg p-1.5 text-pink-700 hover:bg-pink-50"
                      >
                        <InstagramIcon size={15} />
                      </button>
                    )}
                    {lead.mapUrl && (
                      <button
                        title="Abrir localização"
                        onClick={() => window.open(lead.mapUrl, '_blank')}
                        className="rounded-lg p-1.5 text-blue-700 hover:bg-blue-50"
                      >
                        <MapPin size={15} />
                      </button>
                    )}
                    <button
                      title="Marcar como cliente"
                      onClick={() => onMarkClient(lead.id)}
                      className="rounded-lg p-1.5 text-teal-700 hover:bg-teal-50"
                    >
                      <CheckCircle2 size={15} />
                    </button>
                    <button
                      title="Excluir lead"
                      onClick={() => onDelete(lead.id)}
                      className="rounded-lg p-1.5 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {leads.length === 0 && (
        <p className="p-8 text-center text-sm text-slate-500">Nenhum lead encontrado.</p>
      )}
    </div>
  )
}
