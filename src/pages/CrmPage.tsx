import { useEffect, useMemo, useState } from 'react'
import { Download, FileSpreadsheet, Search } from 'lucide-react'
import type { Lead, LeadStatus } from '../lib/types'
import { LEAD_STATUS_LABELS } from '../lib/types'
import {
  listLeads,
  updateLeadStatus,
  updateLeadNotes,
  deleteLead,
} from '../services/leads'
import { exportLeadsToCsv, exportLeadsToExcel } from '../lib/export'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { LeadTable } from '../components/leads/LeadTable'

type SortKey = 'name' | 'leadScore' | 'rating' | 'createdAt'

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos os status' },
  ...(Object.entries(LEAD_STATUS_LABELS) as [LeadStatus, string][]).map(([value, label]) => ({
    value,
    label,
  })),
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'leadScore', label: 'Potencial do lead' },
  { value: 'rating', label: 'Avaliação' },
  { value: 'name', label: 'Nome' },
  { value: 'createdAt', label: 'Data de cadastro' },
]

export function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const [sortKey, setSortKey] = useState<SortKey>('leadScore')

  useEffect(() => {
    listLeads()
      .then(setLeads)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const result = leads.filter((l) => {
      if (status !== 'todos' && l.status !== status) return false
      if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    return [...result].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0)
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return b.leadScore - a.leadScore
      }
    })
  }, [leads, search, status, sortKey])

  async function handleStatusChange(id: string, newStatus: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)))
    await updateLeadStatus(id, newStatus)
  }

  async function handleNotesChange(id: string, notes: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)))
    await updateLeadNotes(id, notes)
  }

  async function handleDelete(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id))
    await deleteLead(id)
  }

  async function handleMarkClient(id: string) {
    await handleStatusChange(id, 'cliente')
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">CRM</h1>
          <p className="text-sm text-slate-500">Gerencie seus leads de prospecção</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => exportLeadsToCsv(filtered)}>
            Exportar CSV
          </Button>
          <Button variant="secondary" size="sm" icon={<FileSpreadsheet size={14} />} onClick={() => exportLeadsToExcel(filtered)}>
            Exportar Excel
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} />
        <Select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          options={SORT_OPTIONS}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <LeadTable
          leads={filtered}
          onStatusChange={handleStatusChange}
          onNotesChange={handleNotesChange}
          onDelete={handleDelete}
          onMarkClient={handleMarkClient}
        />
      )}
    </div>
  )
}
