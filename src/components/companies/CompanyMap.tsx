import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { Company } from '../../lib/types'
import { SITE_STATUS_LABELS } from '../../lib/types'
import { Button } from '../ui/Button'

import 'leaflet/dist/leaflet.css'

const ICON_COLORS: Record<Company['siteStatus'], string> = {
  sem_site: '#ef4444',
  possivel_site: '#f59e0b',
  com_site: '#10b981',
}

function markerIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 2px rgba(0,0,0,0.3)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

export function CompanyMap({
  companies,
  onViewDetails,
}: {
  companies: Company[]
  onViewDetails: (company: Company) => void
}) {
  const center = companies.length
    ? [companies[0].latitude, companies[0].longitude]
    : [-20.9, -51.38]

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={center as [number, number]} zoom={13} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {companies.map((company) => (
          <Marker
            key={company.id}
            position={[company.latitude, company.longitude]}
            icon={markerIcon(ICON_COLORS[company.siteStatus])}
          >
            <Popup>
              <div className="flex min-w-[180px] flex-col gap-1 text-sm">
                <strong>{company.name}</strong>
                <span className="text-xs text-slate-500">{company.category}</span>
                <span className="text-xs">
                  ⭐ {company.rating?.toFixed(1) ?? '—'} · {SITE_STATUS_LABELS[company.siteStatus]}
                </span>
                {company.phone && <span className="text-xs">📞 {company.phone}</span>}
                <Button size="sm" className="mt-1" onClick={() => onViewDetails(company)}>
                  Ver detalhes
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
