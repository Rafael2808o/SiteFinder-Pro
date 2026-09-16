import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, MapIcon } from 'lucide-react'
import { useSearch } from '../context/SearchContext'
import { CompanyFilters } from '../components/companies/CompanyFilters'
import { CompanyCard } from '../components/companies/CompanyCard'
import { CompanyMap } from '../components/companies/CompanyMap'
import { MessageGeneratorModal } from '../components/prospecting/MessageGeneratorModal'
import { SitePromptModal } from '../components/prospecting/SitePromptModal'
import { Spinner } from '../components/ui/Spinner'
import { addLeadFromCompany } from '../services/leads'

const DEFAULT_FILTERS = {
  onlySemSite: false,
  onlyInstagram: false,
  minRating: 0,
  minReviews: 0,
  category: 'Todas',
  neighborhood: 'Todos',
  maxDistanceKm: 999,
  contactStatus: 'todas',
}

export function ResultsPage() {
  const { companies, loading, error, params, contactedIds, markContacted, setSelectedCompany } =
    useSearch()
  const navigate = useNavigate()
  const [view, setView] = useState('lista')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [messageTarget, setMessageTarget] = useState(null)
  const [sitePromptTarget, setSitePromptTarget] = useState(null)

  const categories = useMemo(() => [...new Set(companies.map((c) => c.category))], [companies])
  const neighborhoods = useMemo(
    () => [...new Set(companies.map((c) => c.neighborhood).filter(Boolean))],
    [companies],
  )

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (filters.onlySemSite && c.siteStatus !== 'sem_site') return false
      if (filters.onlyInstagram && !c.instagram) return false
      if ((c.rating ?? 0) < filters.minRating) return false
      if (c.reviewCount < filters.minReviews) return false
      if (filters.category !== 'Todas' && c.category !== filters.category) return false
      if (filters.neighborhood !== 'Todos' && c.neighborhood !== filters.neighborhood) return false
      const contacted = contactedIds.has(c.placeId)
      if (filters.contactStatus === 'contatadas' && !contacted) return false
      if (filters.contactStatus === 'nao_contatadas' && contacted) return false
      return true
    })
  }, [companies, filters, contactedIds])

  function handleViewDetails(company) {
    setSelectedCompany(company)
    navigate('/empresa')
  }

  async function handleAddLead(company) {
    await addLeadFromCompany(company)
    markContacted(company.placeId)
  }

  function handleOfferSitePrompts(company) {
    setMessageTarget(null)
    setSitePromptTarget(company)
  }

  if (!params) {
    return (
      <div className="flex h-full items-center justify-center p-12 text-sm text-slate-500">
        Nenhuma busca realizada. Volte para "Buscar empresas".
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Resultados em {params.city} — {params.state}
          </h1>
          <p className="text-sm text-slate-500">
            {filtered.length} de {companies.length} empresas encontradas · raio de {params.radiusKm} km
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setView('lista')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${view === 'lista' ? 'bg-teal-700 text-white' : 'text-slate-500'}`}
          >
            <List size={15} /> Lista
          </button>
          <button
            onClick={() => setView('mapa')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${view === 'mapa' ? 'bg-teal-700 text-white' : 'text-slate-500'}`}
          >
            <MapIcon size={15} /> Mapa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <CompanyFilters
          filters={filters}
          categories={categories}
          neighborhoods={neighborhoods}
          onChange={setFilters}
        />

        <div>
          {loading && (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && view === 'lista' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onViewDetails={handleViewDetails}
                  onAddLead={handleAddLead}
                  onGenerateMessage={setMessageTarget}
                />
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full py-12 text-center text-sm text-slate-500">
                  Nenhuma empresa corresponde aos filtros selecionados.
                </p>
              )}
            </div>
          )}

          {!loading && !error && view === 'mapa' && (
            <div className="h-[70vh]">
              <CompanyMap companies={filtered} onViewDetails={handleViewDetails} />
            </div>
          )}
        </div>
      </div>

      {messageTarget && (
        <MessageGeneratorModal
          company={messageTarget}
          onClose={() => setMessageTarget(null)}
          onGenerateSitePrompts={handleOfferSitePrompts}
        />
      )}
      {sitePromptTarget && (
        <SitePromptModal company={sitePromptTarget} onClose={() => setSitePromptTarget(null)} />
      )}
    </div>
  )
}
