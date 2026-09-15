import { SlidersHorizontal } from 'lucide-react'
import type { CompanyFilters as Filters } from '../../lib/types'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

const CONTACT_OPTIONS = [
  { value: 'todas', label: 'Todas as empresas' },
  { value: 'contatadas', label: 'Já contatadas' },
  { value: 'nao_contatadas', label: 'Ainda não contatadas' },
]

interface Props {
  filters: Filters
  categories: string[]
  neighborhoods: string[]
  onChange: (filters: Filters) => void
}

export function CompanyFilters({ filters, categories, neighborhoods, onChange }: Props) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <SlidersHorizontal size={16} />
        Filtros
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={filters.onlySemSite}
          onChange={(e) => set('onlySemSite', e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 accent-teal-700"
        />
        Somente empresas sem site
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={filters.onlyInstagram}
          onChange={(e) => set('onlyInstagram', e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 accent-teal-700"
        />
        Somente empresas com Instagram
      </label>

      <Input
        label="Nota mínima"
        type="number"
        min={0}
        max={5}
        step={0.1}
        value={filters.minRating}
        onChange={(e) => set('minRating', Number(e.target.value))}
      />

      <Input
        label="Número mínimo de avaliações"
        type="number"
        min={0}
        value={filters.minReviews}
        onChange={(e) => set('minReviews', Number(e.target.value))}
      />

      <Select
        label="Categoria"
        value={filters.category}
        onChange={(e) => set('category', e.target.value)}
        options={[{ value: 'Todas', label: 'Todas' }, ...categories.map((c) => ({ value: c, label: c }))]}
      />

      <Select
        label="Bairro"
        value={filters.neighborhood}
        onChange={(e) => set('neighborhood', e.target.value)}
        options={[
          { value: 'Todos', label: 'Todos' },
          ...neighborhoods.map((n) => ({ value: n, label: n })),
        ]}
      />

      <Input
        label="Distância máxima (km)"
        type="number"
        min={0}
        value={filters.maxDistanceKm}
        onChange={(e) => set('maxDistanceKm', Number(e.target.value))}
      />

      <Select
        label="Status de contato"
        value={filters.contactStatus}
        onChange={(e) => set('contactStatus', e.target.value as Filters['contactStatus'])}
        options={CONTACT_OPTIONS}
      />
    </Card>
  )
}
