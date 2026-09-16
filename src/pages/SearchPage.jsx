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
const CATEGORY_OPTIONS = {
  'pt-BR': [
    { value: 'Todas', label: 'Todas' },
    // Alimentação
    { value: 'restaurante', label: 'Restaurantes e lanchonetes' },
    { value: 'padaria', label: 'Padarias' },
    { value: 'açougue', label: 'Açougues' },
    { value: 'hortifruti', label: 'Hortifrutis' },
    { value: 'mercearia', label: 'Mercearias e conveniências' },
    { value: 'supermercado', label: 'Supermercados' },
    { value: 'sorveteria', label: 'Sorveterias' },
    { value: 'adega', label: 'Adegas e lojas de bebidas' },
    // Beleza e bem-estar
    { value: 'salão de beleza', label: 'Salões de beleza e barbearias' },
    { value: 'estética', label: 'Clínicas de estética' },
    { value: 'tatuagem', label: 'Estúdios de tatuagem' },
    { value: 'ótica', label: 'Óticas' },
    { value: 'farmácia', label: 'Farmácias' },
    { value: 'academia', label: 'Academias' },
    // Saúde
    { value: 'clínica', label: 'Clínicas médicas' },
    { value: 'dentista', label: 'Dentistas' },
    { value: 'veterinária', label: 'Clínicas veterinárias' },
    { value: 'pet shop', label: 'Pet shops' },
    // Automotivo
    { value: 'posto de combustível', label: 'Postos de combustível' },
    { value: 'lava rápido', label: 'Lava-rápidos e lava-jatos' },
    { value: 'oficina mecânica', label: 'Oficinas mecânicas' },
    { value: 'autopeças', label: 'Autopeças' },
    { value: 'borracharia', label: 'Borracharias' },
    { value: 'concessionária', label: 'Concessionárias e lojas de veículos' },
    { value: 'autoescola', label: 'Autoescolas' },
    // Serviços profissionais
    { value: 'advocacia', label: 'Escritórios de advocacia' },
    { value: 'contabilidade', label: 'Escritórios de contabilidade' },
    { value: 'imobiliária', label: 'Imobiliárias' },
    { value: 'seguros', label: 'Corretoras de seguros' },
    { value: 'agência de viagens', label: 'Agências de viagens' },
    { value: 'arquitetura', label: 'Escritórios de arquitetura' },
    // Varejo
    { value: 'loja', label: 'Lojas em geral' },
    { value: 'loja de roupas', label: 'Lojas de roupas' },
    { value: 'loja de calçados', label: 'Lojas de calçados' },
    { value: 'eletrônicos', label: 'Lojas de celular e eletrônicos' },
    { value: 'papelaria', label: 'Papelarias' },
    { value: 'livraria', label: 'Livrarias' },
    { value: 'material de construção', label: 'Materiais de construção' },
    { value: 'móveis', label: 'Lojas de móveis' },
    { value: 'joalheria', label: 'Joalherias' },
    { value: 'floricultura', label: 'Floriculturas' },
    { value: 'presentes', label: 'Lojas de presentes' },
    { value: 'brinquedos', label: 'Lojas de brinquedos' },
    { value: 'artigos esportivos', label: 'Lojas de artigos esportivos' },
    { value: 'gráfica', label: 'Gráficas e copiadoras' },
    // Serviços residenciais
    { value: 'eletricista', label: 'Eletricistas' },
    { value: 'encanador', label: 'Encanadores' },
    { value: 'marcenaria', label: 'Marcenarias' },
    { value: 'serralheria', label: 'Serralherias' },
    { value: 'chaveiro', label: 'Chaveiros' },
    { value: 'pintor', label: 'Pintores' },
    // Hospedagem
    { value: 'hotel', label: 'Hotéis e pousadas' },
  ],
  'en-US': [
    { value: 'Todas', label: 'All categories' },
    { value: 'restaurante', label: 'Restaurants and fast food' },
    { value: 'padaria', label: 'Bakeries' },
    { value: 'açougue', label: 'Butcher shops' },
    { value: 'hortifruti', label: 'Produce markets' },
    { value: 'mercearia', label: 'Convenience stores' },
    { value: 'supermercado', label: 'Supermarkets' },
    { value: 'sorveteria', label: 'Ice cream shops' },
    { value: 'adega', label: 'Liquor stores' },
    { value: 'salão de beleza', label: 'Hair and beauty salons' },
    { value: 'estética', label: 'Aesthetics clinics' },
    { value: 'tatuagem', label: 'Tattoo studios' },
    { value: 'ótica', label: 'Optical shops' },
    { value: 'farmácia', label: 'Pharmacies' },
    { value: 'academia', label: 'Gyms' },
    { value: 'clínica', label: 'Medical clinics' },
    { value: 'dentista', label: 'Dentists' },
    { value: 'veterinária', label: 'Veterinary clinics' },
    { value: 'pet shop', label: 'Pet shops' },
    { value: 'posto de combustível', label: 'Gas stations' },
    { value: 'lava rápido', label: 'Car washes' },
    { value: 'oficina mecânica', label: 'Auto repair shops' },
    { value: 'autopeças', label: 'Auto parts stores' },
    { value: 'borracharia', label: 'Tire shops' },
    { value: 'concessionária', label: 'Car dealerships' },
    { value: 'autoescola', label: 'Driving schools' },
    { value: 'advocacia', label: 'Law firms' },
    { value: 'contabilidade', label: 'Accounting firms' },
    { value: 'imobiliária', label: 'Real estate agencies' },
    { value: 'seguros', label: 'Insurance brokers' },
    { value: 'agência de viagens', label: 'Travel agencies' },
    { value: 'arquitetura', label: 'Architecture firms' },
    { value: 'loja', label: 'Retail stores' },
    { value: 'loja de roupas', label: 'Clothing stores' },
    { value: 'loja de calçados', label: 'Shoe stores' },
    { value: 'eletrônicos', label: 'Phone and electronics stores' },
    { value: 'papelaria', label: 'Stationery stores' },
    { value: 'livraria', label: 'Bookstores' },
    { value: 'material de construção', label: 'Hardware stores' },
    { value: 'móveis', label: 'Furniture stores' },
    { value: 'joalheria', label: 'Jewelry stores' },
    { value: 'floricultura', label: 'Flower shops' },
    { value: 'presentes', label: 'Gift shops' },
    { value: 'brinquedos', label: 'Toy stores' },
    { value: 'artigos esportivos', label: 'Sporting goods stores' },
    { value: 'gráfica', label: 'Print shops' },
    { value: 'eletricista', label: 'Electricians' },
    { value: 'encanador', label: 'Plumbers' },
    { value: 'marcenaria', label: 'Carpentry shops' },
    { value: 'serralheria', label: 'Metalworking shops' },
    { value: 'chaveiro', label: 'Locksmiths' },
    { value: 'pintor', label: 'Painters' },
    { value: 'hotel', label: 'Hotels and inns' },
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
  const t = LABELS[country.language] ?? LABELS['en-US']
  const categoryOptions = CATEGORY_OPTIONS[country.language] ?? CATEGORY_OPTIONS['en-US']

  function handleCountryChange(code) {
    setCountryCode(code)
    const next = getCountry(code)
    setState(next.states?.[0]?.value ?? '')
  }

  async function handleSubmit(e) {
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
