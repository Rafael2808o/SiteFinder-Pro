// Supabase Edge Function: generates a website prototype briefing (visual
// identity, copy, sections) using only public company data (name, category,
// rating, real photos when available). This briefing feeds the client-side
// PDF renderer — this function returns structured content only, no PDF.
// Provider selected by AI_PROVIDER (default gemini) — see _shared/ai.ts.
import { corsHeaders, handleOptions } from '../_shared/cors.ts'
import { generateJson } from '../_shared/ai.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')

const SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    subheadline: { type: 'string' },
    aboutText: { type: 'string' },
    services: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 6 },
    colorPalette: {
      type: 'object',
      properties: {
        primary: { type: 'string' },
        secondary: { type: 'string' },
        accent: { type: 'string' },
        background: { type: 'string' },
      },
      required: ['primary', 'secondary', 'accent', 'background'],
    },
    fontPairing: {
      type: 'object',
      properties: { heading: { type: 'string' }, body: { type: 'string' } },
      required: ['heading', 'body'],
    },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['hero', 'about', 'services', 'gallery', 'testimonials', 'contact'],
          },
          title: { type: 'string' },
          content: { type: 'string' },
        },
        required: ['type', 'title', 'content'],
      },
    },
  },
  required: ['headline', 'subheadline', 'aboutText', 'services', 'colorPalette', 'fontPairing', 'sections'],
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { company, language } = await req.json()
    const lang = language ?? 'pt-BR'
    const hasPhotos = (company.photoRefs ?? []).length > 0

    const languageInstruction =
      lang === 'en-US'
        ? 'Write all copy in natural American business English.'
        : lang === 'pt-PT'
          ? 'Escreva todo o texto em portugues de Portugal.'
          : 'Escreva todo o texto em portugues do Brasil.'

    const photoNote = hasPhotos
      ? 'Real photos of the business were found and will be placed in the gallery by the renderer.'
      : 'No real photos of the business were found - do not reference photos in the copy, the layout will use a graphic hero instead.'

    const prompt = `You are an art director and copywriter creating the BRIEFING for a business
website for the real company "${company.name}" (category: "${company.category}"), located in
${company.city}. Public data available: rating ${company.rating ?? 'not available'} (${company.reviewCount} reviews),
phone ${company.phone ? 'available' : 'not available'}. ${photoNote}

${languageInstruction}

Infer the business's likely goal from its category (a restaurant sells atmosphere and menu items; a
law firm sells trust and expertise; a gym sells results and community) and write every section to serve
that specific goal, not generic business copy. Propose a visual identity: a hex color palette coherent
with the "${company.category}" segment and typical of well-designed brands in that segment, and a font
pairing chosen ONLY from this exact list (pick the heading/body combo that best fits the segment's
personality - e.g. Playfair Display or Cormorant Garamond for upscale/elegant, Oswald or Montserrat for
bold/modern, Nunito or Work Sans for friendly/approachable): Inter, Poppins, Montserrat, Playfair Display,
Merriweather, Lora, Oswald, Nunito, Work Sans, Cormorant Garamond. Use the exact name as listed. Write: a
short punchy headline, a subheadline, an "about" text
(2-3 sentences), a list of 3 to 6 plausible services for this category, and 4 to 5 page sections (hero,
about, services, gallery, contact) each with a title and brief content. Never invent contact details or
specific facts that were not given to you - this is a commercial demo proposal, keep that tone. Respond
strictly in the requested JSON format.`

    const content = (await generateJson(prompt, SCHEMA)) as Record<string, unknown>

    const photos: string[] = (company.photoRefs ?? [])
      .slice(0, 4)
      .map((ref: string) => `${SUPABASE_URL}/functions/v1/places-photo?ref=${encodeURIComponent(ref)}&maxWidthPx=900`)

    const prototype = {
      companyId: company.id,
      ...content,
      photos,
      generatedAt: new Date().toISOString(),
    }

    return new Response(JSON.stringify({ prototype }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
