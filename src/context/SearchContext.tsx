import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Company, SearchParams } from '../lib/types'
import { searchCompanies } from '../services/places'

interface SearchContextValue {
  params: SearchParams | null
  companies: Company[]
  loading: boolean
  error: string | null
  contactedIds: Set<string>
  runSearch: (params: SearchParams) => Promise<void>
  markContacted: (placeId: string) => void
  selectedCompany: Company | null
  setSelectedCompany: (company: Company | null) => void
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<SearchParams | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contactedIds, setContactedIds] = useState<Set<string>>(new Set())
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  async function runSearch(searchParams: SearchParams) {
    setLoading(true)
    setError(null)
    setParams(searchParams)
    try {
      const results = await searchCompanies(searchParams)
      setCompanies(results)
    } catch (err) {
      setError((err as Error).message)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  function markContacted(placeId: string) {
    setContactedIds((prev) => new Set(prev).add(placeId))
  }

  return (
    <SearchContext.Provider
      value={{
        params,
        companies,
        loading,
        error,
        contactedIds,
        runSearch,
        markContacted,
        selectedCompany,
        setSelectedCompany,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch deve ser usado dentro de SearchProvider')
  return ctx
}
