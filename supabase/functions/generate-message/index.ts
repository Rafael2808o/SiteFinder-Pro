// Supabase Edge Function: generates a personalized prospecting message.
// Follows a fixed structural template (see PROMPT below) so every message
// reads the same way regardless of company — only the specifics change.
// Provider selected by AI_PROVIDER (default gemini) — see _shared/ai.ts.
import { corsHeaders, handleOptions } from '../_shared/cors.ts'
import { generateText } from '../_shared/ai.ts'

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { company, language } = await req.json()
    const lang = language ?? 'pt-BR'

    const hasRating = typeof company.rating === 'number' && company.reviewCount > 0
    const complimentHint = hasRating
      ? `They have a real rating of ${company.rating} from ${company.reviewCount} reviews — compliment that specifically.`
      : company.instagram
        ? 'No rating data available, but they do have an Instagram — compliment their online presence/engagement with customers instead, generically (do not invent a number).'
        : 'No rating or social data available — skip the specific compliment beat entirely and go straight from the greeting to noticing they have no website. Do not invent numbers or facts.'

    const languageInstruction =
      lang === 'en-US'
        ? 'Write in natural American business English.'
        : lang === 'pt-PT'
          ? 'Escreva em português de Portugal, tom profissional.'
          : 'Escreva em português do Brasil, tom profissional e caloroso.'

    const prompt = `You are a freelance web developer writing a first-contact WhatsApp message to a local business you found while prospecting for clients. ${languageInstruction}

Follow this EXACT structure, in this order, as natural flowing prose (not a bulleted list, not labeled sections):
1. Greeting + context: mention you found "${company.name}" (category: ${company.category}) while looking at businesses in ${company.city}.
2. A brief compliment. ${complimentHint}
3. Note that you noticed they don't have their own website yet (their site status: ${company.siteStatus}).
4. Introduce yourself as a web developer.
5. Say you already put together a prototype/mockup for them, and ask if you can send it over as a PDF.
6. One short differentiator: you work with a one-time payment, no monthly subscription/recurring fee.
7. End with a soft, low-pressure call to action (a question, not a demand).

Constraints: 4-6 sentences total. Professional, warm, never pushy or salesy-sounding. No more than one emoji in the whole message, and only if it fits naturally. Never invent facts (ratings, review counts, addresses) that were not given to you. Output ONLY the message text, no quotes, no preamble, no labels.`

    const message = await generateText(prompt)

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
