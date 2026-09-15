// Supabase Edge Function: streams a Google Places photo through the server
// so GOOGLE_PLACES_API_KEY never reaches the browser. GET only (used as <img src>).
import { corsHeaders, handleOptions } from '../_shared/cors.ts'

const PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  if (!PLACES_API_KEY) {
    return new Response('GOOGLE_PLACES_API_KEY não configurada.', { status: 500, headers: corsHeaders })
  }

  const url = new URL(req.url)
  const ref = url.searchParams.get('ref')
  const maxWidthPx = url.searchParams.get('maxWidthPx') ?? '800'
  if (!ref) {
    return new Response('Parâmetro "ref" obrigatório.', { status: 400, headers: corsHeaders })
  }

  const mediaUrl = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${maxWidthPx}&key=${PLACES_API_KEY}`
  const res = await fetch(mediaUrl)

  if (!res.ok) {
    return new Response('Falha ao carregar foto.', { status: res.status, headers: corsHeaders })
  }

  return new Response(res.body, {
    headers: {
      ...corsHeaders,
      'Content-Type': res.headers.get('Content-Type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  })
})
