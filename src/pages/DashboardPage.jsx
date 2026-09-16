import { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Building2, XCircle, CheckCircle2, Users, PhoneCall, Trophy } from 'lucide-react'
import { useSearch } from '../context/SearchContext'
import { listLeads } from '../services/leads'
import { LEAD_STATUS_LABELS } from '../lib/constants'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'

const COLORS = ['#0f766e', '#b45309', '#1d4ed8', '#be123c', '#4d7c0f', '#7c3aed']

function MetricCard({ icon: Icon, label, value, tone }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </Card>
  )
}

export function DashboardPage() {
  const { companies } = useSearch()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listLeads()
      .then(setLeads)
      .finally(() => setLoading(false))
  }, [])

  const semSite = companies.filter((c) => c.siteStatus === 'sem_site').length
  const comSite = companies.filter((c) => c.siteStatus === 'com_site').length
  const contatados = leads.filter((l) => l.status !== 'novo').length
  const clientes = leads.filter((l) => l.status === 'cliente').length

  const byCategory = useMemo(() => {
    const map = new Map()
    companies.forEach((c) => {
      const entry = map.get(c.category) ?? { total: 0, semSite: 0 }
      entry.total += 1
      if (c.siteStatus === 'sem_site') entry.semSite += 1
      map.set(c.category, entry)
    })
    return [...map.entries()].map(([category, v]) => ({ category, ...v }))
  }, [companies])

  const byRegion = useMemo(() => {
    const map = new Map()
    companies.forEach((c) => {
      const key = c.neighborhood || c.city
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return [...map.entries()].map(([region, total]) => ({ region, total }))
  }, [companies])

  const leadsByStatus = useMemo(() => {
    const map = new Map()
    leads.forEach((l) => {
      const label = LEAD_STATUS_LABELS[l.status]
      map.set(label, (map.get(label) ?? 0) + 1)
    })
    return [...map.entries()].map(([status, value]) => ({ status, value }))
  }, [leads])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mb-6 text-sm text-slate-500">
        Visão geral da última busca e da carteira de leads
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <MetricCard icon={Building2} label="Empresas encontradas" value={companies.length} tone="bg-signal-50 text-ink" />
        <MetricCard icon={XCircle} label="Empresas sem site" value={semSite} tone="bg-red-50 text-red-700" />
        <MetricCard icon={CheckCircle2} label="Empresas com site" value={comSite} tone="bg-emerald-50 text-emerald-700" />
        <MetricCard icon={Users} label="Possíveis leads" value={leads.length} tone="bg-blue-50 text-blue-700" />
        <MetricCard icon={PhoneCall} label="Leads contatados" value={contatados} tone="bg-amber-50 text-amber-700" />
        <MetricCard icon={Trophy} label="Clientes conquistados" value={clientes} tone="bg-slate-100 text-slate-700" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Empresas por categoria (sem site em vermelho)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="total" fill="#0f766e" name="Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="semSite" fill="#dc2626" name="Sem site" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Leads por status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={leadsByStatus} dataKey="value" nameKey="status" cx="50%" cy="50%" outerRadius={90}>
                {leadsByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 xl:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Quantidade de empresas por região</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byRegion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="region" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="total" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {companies.length === 0 && (
        <p className="mt-6 text-center text-xs text-slate-500">
          Nenhuma busca realizada ainda — as métricas de empresas aparecem após a primeira busca.
        </p>
      )}
    </div>
  )
}
