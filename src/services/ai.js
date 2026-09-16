import { supabase } from '../lib/supabase'
import { getCountry } from '../lib/countries'

export async function generateProspectingMessage(company) {
  const language = getCountry(company.country).language
  const { data, error } = await supabase.functions.invoke(
    'generate-message',
    { body: { company, language } },
  )
  if (error) throw new Error(error.message)
  return data?.message ?? buildFallbackMessage(company)
}

function buildFallbackMessage(company) {
  const language = getCountry(company.country).language
  if (language === 'en-US') {
    return `Hi! I came across ${company.name} while researching local businesses in ${company.city} and noticed you don't have a website yet. I'm a web developer and I'd love to show you a quick preview of what your site could look like — mind if I send it over? It's worth a look: we work with a one-time payment, no monthly fees.`
  }
  return `Olá! Encontrei a ${company.name} pesquisando aqui em ${company.city} e percebi que vocês ainda não têm um site próprio. Sou desenvolvedor web e adoraria te mostrar uma prévia de como o site de vocês poderia ficar — posso te mandar? Vale a pena conhecer: trabalhamos com pagamento único, sem mensalidade.`
}

export async function generateSitePrompts(company) {
  const language = getCountry(company.country).language
  const { data, error } = await supabase.functions.invoke(
    'generate-site-prompts',
    { body: { company, language } },
  )
  if (error) throw new Error(error.message)
  if (!data?.prompts) throw new Error('Falha ao gerar os prompts do site.')
  return data.prompts
}
