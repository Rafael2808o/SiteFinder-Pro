import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { useSearch } from '../context/SearchContext'
import { COUNTRIES, getCountry } from '../lib/countries'

// value stays a stable internal key (matched against Overpass tags in the
// places-search function) — only the label is localized per country.
const CATEGORY_OPTIONS: Record<'pt-BR' | 'en-US', { value: string; label: string }[]> = {
  'pt-BR': [
    { value: 'Todas', label: 'Todas' },
    { value: 'restaurante', label: 'Restaurantes' },
    { value: 'salão de beleza', label: 'Salões de beleza' },
    { value: 'academia', label: 'Academias' },
    { value: 'clínica', label: 'Clínicas' },
    { value: 'dentista', label: 'Dentistas' },
    { value: 'advocacia', label: 'Escritórios de advocacia' },
    { value: 'imobiliária', label: 'Imobiliárias' },
    { value: 'oficina mecânica', label: 'Oficinas mecânicas' },
    { value: 'loja', label: 'Lojas em geral' },
    { value: 'pet shop', label: 'Pet shops' },
    { value: 'contabilidade', label: 'Escritórios de contabilidade' },
  ],
  'en-US': [
    { value: 'Todas', label: 'All categories' },
    { value: 'restaurante', label: 'Restaurants' },
    { value: 'salão de beleza', label: 'Beauty salons' },
    { value: 'academia', label: 'Gyms' },
    { value: 'clínica', label: 'Clinics' },
    { value: 'dentista', label: 'Dentists' },
    { value: 'advocacia', label: 'Law firms' },
    { value: 'imobiliária', label: 'Real estate agencies' },
    { value: 'oficina mecânica', label: 'Auto repair shops' },
    { value: 'loja', label: 'Retail stores' },
    { value: 'pet shop', label: 'Pet shops' },
    { value: 'contabilidade', label: 'Accounting firms' },
  ],
}

const LABELS = {
  'pt-BR': {
    title: 'Buscar empresas',
    subtitle: 'Encontre empresas locais e identifique quais ainda não possuem site próprio.',
    country: 'País',
    city: 'Cidade',
    cityPlaceholder: 'Ex: Andradina',
    state: 'Estado',
    statePlaceholder: 'Ex: São Paulo',
    neighborhood: 'Bairro ou região (opcional)',
    neighborhoodPlaceholder: 'Ex: Centro',
    radius: 'Raio de busca (km)',
    category: 'Categoria do estabelecimento',
    submit: 'Procurar empresas',
  },
  'en-US': {
    title: 'Search businesses',
    subtitle: "Find local businesses and see which ones don't have a website yet.",
    country: 'Country',
    city: 'City',
    cityPlaceholder: 'e.g. Austin',
    state: 'State',
    statePlaceholder: 'e.g. Texas',
    neighborhood: 'Neighborhood or area (optional)',
    neighborhoodPlaceholder: 'e.g. Downtown',
    radius: 'Search radius (km)',
    category: 'Business category',
    submit: 'Search businesses',
  },
}

export function SearchPage() {
  const { runSearch, loading, error } = useSearch()
  const navigate = useNavigate()
  const [countryCode, setCountryCode] = useState('BR')
  const [city, setCity] = useState('')
  const [state, setState] = useState('SP')
  const [neighborhood, setNeighborhood] = useState('')
  const [radiusKm, setRadiusKm] = useState(20)
  const [category, setCategory] = useState('Todas')

  const country = getCountry(countryCode)
  const t = LABELS[country.language as 'pt-BR' | 'en-US'] ?? LABELS['en-US']
  const categoryOptions = CATEGORY_OPTIONS[country.language as 'pt-BR' | 'en-US'] ?? CATEGORY_OPTIONS['en-US']

  function handleCountryChange(code: string) {
    setCountryCode(code)
    const next = getCountry(code)
    setState(next.states?.[0]?.value ?? '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!city) return
    await runSearch({ city, state, country: countryCode, neighborhood, radiusKm, category })
    navigate('/resultados')
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Select
              label={t.country}
              value={countryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
            />
          </div>

          <Input
            id="city"
            label={t.city}
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t.cityPlaceholder}
          />

          {country.states ? (
            <Select
              label={t.state}
              value={state}
              onChange={(e) => setState(e.target.value)}
              options={country.states}
            />
          ) : (
            <Input
              label={t.state}
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder={t.statePlaceholder}
            />
          )}

          <Input
            id="neighborhood"
            label={t.neighborhood}
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder={t.neighborhoodPlaceholder}
          />
          <Input
            id="radius"
            type="number"
            min={1}
            max={100}
            label={t.radius}
            required
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
          />
          <div className="sm:col-span-2">
            <Select
              label={t.category}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions}
            />
          </div>

          {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}

          <div className="sm:col-span-2">
            <Button type="submit" size="lg" className="w-full" loading={loading} icon={<Search size={18} />}>
              {t.submit}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
