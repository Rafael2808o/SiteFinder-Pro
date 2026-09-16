import { createContext, useContext, useState } from 'react'
import { searchCompanies } from '../services/places'

const SearchContext = createContext(undefined)

export function SearchProvider({ children }) {
  const [params, setParams] = useState(null)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [contactedIds, setContactedIds] = useState(new Set())
  const [selectedCompany, setSelectedCompany] = useState(null)

  async function runSearch(searchParams) {
    setLoading(true)
    setError(null)
    setParams(searchParams)
    try {
      const results = await searchCompanies(searchParams)
      setCompanies(results)
    } catch (err) {
      setError(err.message)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  function markContacted(placeId) {
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
