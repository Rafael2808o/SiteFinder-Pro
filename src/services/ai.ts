import { supabase } from '../lib/supabase'
import type { Company, WebsitePrototype } from '../lib/types'
import { getCountry } from '../lib/countries'

export async function generateProspectingMessage(company: Company): Promise<string> {
  const language = getCountry(company.country).language
  const { data, error } = await supabase.functions.invoke<{ message: string }>(
    'generate-message',
    { body: { company, language } },
  )
  if (error) throw new Error(error.message)
  return data?.message ?? buildFallbackMessage(company)
}

function buildFallbackMessage(company: Company): string {
  const language = getCountry(company.country).language
  if (language === 'en-US') {
    return `Hi! I came across ${company.name} while researching local businesses in ${company.city} and noticed you don't have a website yet. I'm a web developer, and I actually put together a quick prototype for you — mind if I send it over as a PDF? It's worth a look: we work with a one-time payment, no monthly fees.`
  }
  return `Olá! Encontrei a ${company.name} pesquisando aqui em ${company.city} e percebi que vocês ainda não têm um site próprio. Sou desenvolvedor web e já preparei um protótipo pra vocês — posso te mandar em PDF? Vale a pena conhecer: trabalhamos com pagamento único, sem mensalidade.`
}

export async function generateWebsitePrototype(company: Company): Promise<WebsitePrototype> {
  const language = getCountry(company.country).language
  const { data, error } = await supabase.functions.invoke<{ prototype: WebsitePrototype }>(
    'generate-prototype',
    { body: { company, language } },
  )
  if (error) throw new Error(error.message)
  if (!data?.prototype) throw new Error('Falha ao gerar protótipo.')
  return data.prototype
}
