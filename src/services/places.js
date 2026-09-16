import { supabase } from '../lib/supabase'
import { classifySite } from '../lib/classification'
import { scoreLead } from '../lib/scoring'

/**
 * Calls the `places-search` Supabase Edge Function, which holds the real
 * Google Places API key server-side and proxies Text Search. The browser
 * never sees GOOGLE_PLACES_API_KEY. The function returns raw public fields
 * only — site classification and lead scoring are computed here, once, so
 * the same rules apply regardless of which data source fed the search.
 */
export async function searchCompanies(params) {
  const { data, error } = await supabase.functions.invoke(
    'places-search',
    { body: params },
  )
  if (error) throw new Error(error.message)
  const raw = data?.companies ?? []
  return raw.map((company) => {
    const siteStatus = classifySite(company.website, Boolean(company.instagram || company.facebook))
    const { score, reason } = scoreLead({ ...company, siteStatus })
    const photoUrl0 = company.photoRefs[0] ? photoUrl(company.photoRefs[0]) : undefined
    return {
      ...company,
      country: params.country,
      photoUrl: photoUrl0,
      siteStatus,
      leadScore: score,
      leadScoreReason: reason,
    }
  })
}

export function photoUrl(photoRef, maxWidthPx = 800) {
  const base = import.meta.env.VITE_SUPABASE_URL
  return `${base}/functions/v1/places-photo?ref=${encodeURIComponent(photoRef)}&maxWidthPx=${maxWidthPx}`
}
