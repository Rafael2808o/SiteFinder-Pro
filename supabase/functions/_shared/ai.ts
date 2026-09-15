// Shared AI provider switch for the generate-message / generate-site-prompts
// Edge Functions. AI_PROVIDER selects the backend; defaults to gemini.
// All keys are Supabase secrets — never sent to the browser.

const AI_PROVIDER = (Deno.env.get('AI_PROVIDER') ?? 'gemini').toLowerCase()

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-flash-latest'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini'

const MAX_ATTEMPTS = 3

function missingKeyError(): string {
  return AI_PROVIDER === 'openai'
    ? 'OPENAI_API_KEY não configurada.'
    : 'GEMINI_API_KEY não configurada.'
}

export function hasAiKey(): boolean {
  return AI_PROVIDER === 'openai' ? Boolean(OPENAI_API_KEY) : Boolean(GEMINI_API_KEY)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * gemini-flash-latest is a "preview" alias that runs hot under public demand
 * and occasionally returns a 503 or, on some calls, a candidate cut off
 * mid-sentence (finishReason != STOP) even with thinkingBudget forced to 0.
 * Both are transient, not caused by the prompt, so retrying a couple of
 * times resolves the vast majority of them instead of surfacing a broken
 * half-message to whoever is about to send it to a real lead.
 */
async function callGemini(body: Record<string, unknown>): Promise<{ text: string; finishReason?: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
  let lastError = ''

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        lastError = `Gemini: ${await res.text()}`
        if (res.status === 503 || res.status === 429) {
          await sleep(600 * attempt)
          continue
        }
        throw new Error(lastError)
      }
      const json = await res.json()
      const candidate = json.candidates?.[0]
      const text = candidate?.content?.parts?.[0]?.text ?? ''
      const finishReason = candidate?.finishReason

      if (!text || (finishReason && finishReason !== 'STOP')) {
        lastError = `Gemini: incomplete response (finishReason=${finishReason ?? 'empty'})`
        await sleep(400 * attempt)
        continue
      }
      return { text, finishReason }
    } catch (err) {
      lastError = (err as Error).message
      await sleep(400 * attempt)
    }
  }
  throw new Error(lastError || 'Gemini: falha após múltiplas tentativas.')
}

/** Plain-text generation (prospecting message). */
export async function generateText(prompt: string): Promise<string> {
  if (!hasAiKey()) throw new Error(missingKeyError())

  if (AI_PROVIDER === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })
    if (!res.ok) throw new Error(`OpenAI: ${await res.text()}`)
    const json = await res.json()
    return (json.choices?.[0]?.message?.content ?? '').trim()
  }

  const { text } = await callGemini({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
      thinkingConfig: { thinkingBudget: 0 },
    },
  })
  return text.trim()
}

/** Structured JSON generation (creative brief for site prompts), constrained by a JSON Schema. */
export async function generateJson(prompt: string, schema: Record<string, unknown>): Promise<unknown> {
  if (!hasAiKey()) throw new Error(missingKeyError())

  if (AI_PROVIDER === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'site_prompt_brief', schema, strict: true },
        },
      }),
    })
    if (!res.ok) throw new Error(`OpenAI: ${await res.text()}`)
    const json = await res.json()
    return JSON.parse(json.choices?.[0]?.message?.content ?? '{}')
  }

  const { text } = await callGemini({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 3072,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  })
  return JSON.parse(text)
}
