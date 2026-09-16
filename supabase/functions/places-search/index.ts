// Supabase Edge Function: searches local businesses via OpenStreetMap
// (Nominatim for geocoding + Overpass API for the actual place data).
// Free, no API key, no billing account required.
//
// NOTE on scope vs. Google Places: OSM has no rating/review-count data and
// (almost always) no business photos. `rating`/`reviewCount` come back
// undefined/0 and `photoRefs` is always empty — the frontend already
// handles both gracefully (badges show "—", prototype hero skips the photo
// overlay). Some OSM entries do carry contact:instagram/contact:facebook,
// which Google Places doesn't expose at all, so those fields are read here.
import { corsHeaders, handleOptions } from '../_shared/cors.ts'

const USER_AGENT = 'SiteFinderPro/1.0 (prospecting tool; contact via app owner)'

interface SearchBody {
  city: string
  state: string
  country: string
  neighborhood?: string
  radiusKm: number
  category: string
}

// Mirrors src/lib/countries.ts (nominatimCode + display name). Kept as a
// small standalone map since Deno edge functions don't share a build step
// with the Vite frontend.
const COUNTRY_INFO: Record<string, { name: string; nominatimCode: string }> = {
  BR: { name: 'Brasil', nominatimCode: 'br' },
  US: { name: 'United States', nominatimCode: 'us' },
  PT: { name: 'Portugal', nominatimCode: 'pt' },
}

// Portuguese category label (as offered in the search form) -> Overpass QL
// clauses. "Todas" falls through to the broad default set below.
function categoryClauses(category: string, around: string): string[] {
  const norm = category.toLowerCase()
  const byCategory: Record<string, string[]> = {
    // Alimentação
    restaurante: [`nwr["amenity"~"^(restaurant|fast_food|cafe|bar|pub)$"](${around});`],
    padaria: [`nwr["shop"="bakery"](${around});`],
    açougue: [`nwr["shop"="butcher"](${around});`],
    hortifruti: [`nwr["shop"~"^(greengrocer|farm)$"](${around});`],
    mercearia: [`nwr["shop"="convenience"](${around});`],
    supermercado: [`nwr["shop"~"^(supermarket|grocery)$"](${around});`],
    sorveteria: [`nwr["amenity"="ice_cream"](${around});`, `nwr["shop"="ice_cream"](${around});`],
    adega: [`nwr["shop"~"^(alcohol|wine)$"](${around});`],
    // Beleza e bem-estar
    'salão de beleza': [`nwr["shop"~"^(hairdresser|beauty)$"](${around});`],
    estética: [`nwr["shop"="beauty"](${around});`],
    tatuagem: [`nwr["shop"="tattoo"](${around});`],
    ótica: [`nwr["shop"="optician"](${around});`],
    farmácia: [`nwr["amenity"="pharmacy"](${around});`],
    academia: [`nwr["leisure"="fitness_centre"](${around});`, `nwr["sport"="fitness"](${around});`],
    // Saúde
    clínica: [`nwr["amenity"~"^(clinic|hospital)$"](${around});`],
    dentista: [`nwr["amenity"="dentist"](${around});`],
    veterinária: [`nwr["amenity"="veterinary"](${around});`],
    'pet shop': [`nwr["shop"="pet"](${around});`],
    // Automotivo
    'posto de combustível': [`nwr["amenity"="fuel"](${around});`],
    'lava rápido': [`nwr["amenity"="car_wash"](${around});`, `nwr["shop"="car_wash"](${around});`],
    'oficina mecânica': [`nwr["shop"="car_repair"](${around});`],
    autopeças: [`nwr["shop"~"^(car_parts|car_repair)$"](${around});`],
    borracharia: [`nwr["shop"="tyres"](${around});`],
    concessionária: [`nwr["shop"~"^(car|motorcycle)$"](${around});`],
    autoescola: [`nwr["amenity"="driving_school"](${around});`],
    // Serviços profissionais
    advocacia: [`nwr["office"="lawyer"](${around});`],
    contabilidade: [`nwr["office"="accountant"](${around});`],
    imobiliária: [`nwr["office"="estate_agent"](${around});`],
    seguros: [`nwr["office"="insurance"](${around});`],
    'agência de viagens': [`nwr["shop"="travel_agency"](${around});`, `nwr["office"="travel_agent"](${around});`],
    arquitetura: [`nwr["office"="architect"](${around});`],
    // Varejo
    loja: [`nwr["shop"](${around});`],
    'loja de roupas': [`nwr["shop"~"^(clothes|boutique)$"](${around});`],
    'loja de calçados': [`nwr["shop"="shoes"](${around});`],
    eletrônicos: [`nwr["shop"~"^(mobile_phone|electronics|computer)$"](${around});`],
    papelaria: [`nwr["shop"="stationery"](${around});`],
    livraria: [`nwr["shop"="books"](${around});`],
    'material de construção': [`nwr["shop"~"^(hardware|doityourself)$"](${around});`],
    móveis: [`nwr["shop"="furniture"](${around});`],
    joalheria: [`nwr["shop"="jewelry"](${around});`],
    floricultura: [`nwr["shop"="florist"](${around});`],
    presentes: [`nwr["shop"="gift"](${around});`],
    brinquedos: [`nwr["shop"="toys"](${around});`],
    'artigos esportivos': [`nwr["shop"="sports"](${around});`],
    gráfica: [`nwr["shop"="copyshop"](${around});`],
    // Serviços residenciais
    eletricista: [`nwr["craft"="electrician"](${around});`],
    encanador: [`nwr["craft"="plumber"](${around});`],
    marcenaria: [`nwr["craft"="carpenter"](${around});`],
    serralheria: [`nwr["craft"~"^(blacksmith|metal_construction)$"](${around});`],
    chaveiro: [`nwr["shop"="locksmith"](${around});`, `nwr["craft"="locksmith"](${around});`],
    pintor: [`nwr["craft"="painter"](${around});`],
    // Hospedagem
    hotel: [`nwr["tourism"~"^(hotel|guest_house|hostel)$"](${around});`],
  }
  if (norm !== 'todas' && byCategory[norm]) return byCategory[norm]

  return [
    `nwr["shop"](${around});`,
    `nwr["office"](${around});`,
    `nwr["amenity"~"^(restaurant|fast_food|cafe|bar|pub|pharmacy|bank|clinic|dentist|veterinary|fuel)$"](${around});`,
    `nwr["craft"](${around});`,
    `nwr["leisure"="fitness_centre"](${around});`,
  ]
}

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: 'Restaurante', fast_food: 'Fast food', cafe: 'Café', bar: 'Bar', pub: 'Bar',
  hairdresser: 'Salão de beleza', beauty: 'Clínica de estética', fitness_centre: 'Academia',
  clinic: 'Clínica', hospital: 'Hospital', dentist: 'Dentista', lawyer: 'Advocacia',
  estate_agent: 'Imobiliária', car_repair: 'Oficina mecânica', pet: 'Pet shop',
  accountant: 'Contabilidade', pharmacy: 'Farmácia', bank: 'Banco', veterinary: 'Veterinária',
  fuel: 'Posto de combustível', supermarket: 'Supermercado', grocery: 'Mercado',
  clothes: 'Loja de roupas', boutique: 'Loja de roupas', bakery: 'Padaria', butcher: 'Açougue',
  greengrocer: 'Hortifruti', farm: 'Produtor rural', convenience: 'Conveniência',
  ice_cream: 'Sorveteria', alcohol: 'Adega', wine: 'Adega', tattoo: 'Estúdio de tatuagem',
  optician: 'Ótica', car_wash: 'Lava-rápido', car_parts: 'Autopeças', tyres: 'Borracharia',
  car: 'Concessionária', motorcycle: 'Loja de motos', driving_school: 'Autoescola',
  insurance: 'Corretora de seguros', travel_agency: 'Agência de viagens',
  travel_agent: 'Agência de viagens', architect: 'Escritório de arquitetura',
  shoes: 'Loja de calçados', mobile_phone: 'Loja de celulares', electronics: 'Loja de eletrônicos',
  computer: 'Loja de informática', stationery: 'Papelaria', books: 'Livraria',
  hardware: 'Material de construção', doityourself: 'Material de construção',
  furniture: 'Loja de móveis', jewelry: 'Joalheria', florist: 'Floricultura',
  gift: 'Loja de presentes', toys: 'Loja de brinquedos', sports: 'Artigos esportivos',
  copyshop: 'Gráfica', electrician: 'Eletricista', plumber: 'Encanador',
  carpenter: 'Marcenaria', blacksmith: 'Serralheria', metal_construction: 'Serralheria',
  locksmith: 'Chaveiro', painter: 'Pintor', hotel: 'Hotel', guest_house: 'Pousada',
  hostel: 'Hostel', it: 'Loja de informática', mall: 'Shopping', government: 'Órgão público',
  paint: 'Loja de tintas',
}

function categoryLabel(tags: Record<string, string>): string {
  const raw = tags.shop || tags.office || tags.amenity || tags.craft || tags.leisure || 'estabelecimento'
  return CATEGORY_LABELS[raw] ?? raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_/g, ' ')
}

// The main public instance (overpass-api.de) is known to be flaky under load
// and returns a bare Apache 406 when overloaded, unrelated to the query
// itself. Fall through to community mirrors so a transient hiccup on one
// doesn't fail the search.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

// A mirror can accept the TCP connection and then never respond at all
// (a network black hole, distinct from a clean HTTP error) — the query's own
// `[timeout:25]` only bounds Overpass's server-side processing, not how long
// `fetch` waits for bytes to arrive. Without a client-side abort, one bad
// mirror hangs the whole function until the platform kills the worker for
// exceeding its resource budget, instead of falling through to the next
// mirror in a few seconds.
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchOverpass(query: string): Promise<any> {
  let lastError = ''
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetchWithTimeout(
        endpoint,
        { method: 'POST', headers: { 'Content-Type': 'text/plain', 'User-Agent': USER_AGENT }, body: query },
        20000,
      )
      if (res.ok) return await res.json()
      lastError = `${endpoint} -> HTTP ${res.status}`
    } catch (err) {
      lastError = `${endpoint} -> ${(err as Error).name === 'AbortError' ? 'timeout' : (err as Error).message}`
    }
  }
  throw new Error(`Todos os espelhos Overpass falharam. Último erro: ${lastError}`)
}

async function geocode(query: string, nominatimCode: string): Promise<{ lat: number; lon: number } | null> {
  const countryFilter = nominatimCode ? `&countrycodes=${nominatimCode}` : ''
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1${countryFilter}&q=${encodeURIComponent(query)}`
  const res = await fetchWithTimeout(url, { headers: { 'User-Agent': USER_AGENT } }, 10000)
  if (!res.ok) return null
  const json = await res.json()
  const first = json?.[0]
  return first ? { lat: Number(first.lat), lon: Number(first.lon) } : null
}

function buildAddress(tags: Record<string, string>, fallbackCity: string): string {
  const parts = [
    [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(', '),
    tags['addr:suburb'],
    tags['addr:city'] || fallbackCity,
  ].filter(Boolean)
  return parts.join(' - ') || (tags['addr:city'] ?? fallbackCity)
}

function socialUrl(handle: string | undefined, base: string): string | undefined {
  if (!handle) return undefined
  return /^https?:\/\//i.test(handle) ? handle : `${base}${handle.replace(/^@/, '')}`
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const body: SearchBody = await req.json()
    const { city, state, neighborhood, radiusKm, category } = body
    const countryInfo = COUNTRY_INFO[body.country] ?? { name: '', nominatimCode: '' }

    const locationQuery = [neighborhood, city, state, countryInfo.name].filter(Boolean).join(', ')
    const center =
      (await geocode(locationQuery, countryInfo.nominatimCode)) ??
      (await geocode([city, state, countryInfo.name].filter(Boolean).join(', '), countryInfo.nominatimCode))

    if (!center) {
      return new Response(
        JSON.stringify({ error: `Não encontrei coordenadas para "${locationQuery}". Confira o nome da cidade/bairro.` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const radiusMeters = Math.min(Math.max(radiusKm, 1), 50) * 1000
    const around = `around:${radiusMeters},${center.lat},${center.lon}`
    const clauses = categoryClauses(category, around)

    const overpassQuery = `[out:json][timeout:25];(${clauses.join('')});out center tags 60;`

    const json = await fetchOverpass(overpassQuery)
    const elements = (json.elements ?? []) as any[]

    const companies = elements
      .filter((el) => el.tags?.name)
      .slice(0, 40)
      .map((el) => {
        const tags: Record<string, string> = el.tags ?? {}
        const lat = el.lat ?? el.center?.lat ?? center.lat
        const lon = el.lon ?? el.center?.lon ?? center.lon
        const category = categoryLabel(tags)

        return {
          id: `osm:${el.type}/${el.id}`,
          placeId: `osm:${el.type}/${el.id}`,
          name: tags.name,
          category,
          categories: [category],
          address: buildAddress(tags, city),
          city: tags['addr:city'] || city,
          state,
          neighborhood: tags['addr:suburb'] || tags['addr:neighbourhood'] || neighborhood,
          phone: tags.phone || tags['contact:phone'],
          latitude: lat,
          longitude: lon,
          rating: undefined,
          reviewCount: 0,
          openingHours: tags.opening_hours
            ? { weekdayText: [tags.opening_hours], openNow: undefined }
            : undefined,
          mapUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
          website: tags.website || tags['contact:website'],
          instagram: socialUrl(tags['contact:instagram'], 'https://instagram.com/'),
          facebook: socialUrl(tags['contact:facebook'], 'https://facebook.com/'),
          photoRefs: [],
        }
      })

    return new Response(JSON.stringify({ companies }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
