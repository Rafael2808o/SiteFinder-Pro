// Supabase Edge Function: instead of generating a rendered prototype, this
// analyzes the company and returns TWO complete, ready-to-paste prompts —
// one to hand an AI coding assistant (Claude) to build a quick commercial
// demo, another to build the real, publishable site. Gemini only fills a
// small structured creative brief (visual identity, tone, section ideas);
// the actual prompt text is assembled in code from a fixed, reviewed
// template, so quality/structure never depends on the model's mood.
// Provider selected by AI_PROVIDER (default gemini) — see _shared/ai.ts.
import { corsHeaders, handleOptions } from '../_shared/cors.ts'
import { generateJson } from '../_shared/ai.ts'

const SCHEMA = {
  type: 'object',
  properties: {
    businessSummary: { type: 'string' },
    targetAudience: { type: 'string' },
    toneOfVoice: { type: 'string' },
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
    keySellingPoints: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5 },
    suggestedSections: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 8 },
    categoryFeatures: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 7 },
    seoKeywords: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 6 },
  },
  required: [
    'businessSummary',
    'targetAudience',
    'toneOfVoice',
    'colorPalette',
    'fontPairing',
    'keySellingPoints',
    'suggestedSections',
    'categoryFeatures',
    'seoKeywords',
  ],
}

interface Brief {
  businessSummary: string
  targetAudience: string
  toneOfVoice: string
  colorPalette: { primary: string; secondary: string; accent: string; background: string }
  fontPairing: { heading: string; body: string }
  keySellingPoints: string[]
  suggestedSections: string[]
  categoryFeatures: string[]
  seoKeywords: string[]
}

interface Company {
  id: string
  name: string
  category: string
  city: string
  state?: string
  phone?: string
  instagram?: string
  website?: string
  rating?: number
  reviewCount: number
}

const LABELS: Record<string, Record<string, string>> = {
  'pt-BR': {
    respondIn: 'Responda inteiramente em português do Brasil.',
    goal: 'Objetivo',
    protoTitle: 'PROTÓTIPO',
    protoGoal:
      'Você vai construir um PROTÓTIPO de site de demonstração comercial. Ele será mostrado ao dono do negócio — que hoje não tem site — para convencê-lo a contratar o site completo. Precisa impressionar rápido e parecer profissional; não precisa ter todas as funcionalidades do produto final.',
    fullTitle: 'SITE COMPLETO',
    fullGoal:
      'Você vai construir o SITE COMPLETO e publicável do negócio abaixo. Diferente de um protótipo, este é o produto final: precisa ser funcional, rápido, acessível e pronto para receber tráfego real de clientes.',
    about: 'Sobre o negócio (dados reais — não invente além disto)',
    name: 'Nome',
    category: 'Categoria',
    location: 'Cidade',
    phone: 'Telefone',
    phoneMissing: 'não informado — use um placeholder [TELEFONE]',
    instagram: 'Instagram',
    instagramMissing: 'não informado',
    rating: 'Avaliação pública',
    ratingMissing: 'sem dado de avaliação disponível',
    reviews: 'avaliações',
    analysis: 'Análise do negócio',
    audience: 'Público-alvo',
    identity: 'Identidade visual sugerida',
    palette: 'Paleta de cores',
    typography: 'Tipografia',
    typographyNote: '(Google Fonts)',
    tone: 'Tom de voz',
    structure: 'Estrutura da página (single-page)',
    fullStructure: 'Estrutura esperada (páginas/seções)',
    include: 'O que incluir',
    sellingPoints: 'Argumentos de venda a destacar',
    whatsappCta: 'Um botão de contato via WhatsApp usando o número acima (ou placeholder)',
    noPhotoNote:
      'Se não houver fotos reais, use um herói gráfico (gradiente/ilustração com a paleta acima) em vez de foto genérica de banco de imagens fingindo ser da empresa',
    features: 'Funcionalidades específicas do segmento a considerar',
    seo: 'Palavras-chave de SEO local',
    technical: 'Requisitos técnicos',
    techResponsive: 'Responsivo (mobile-first), testado em telas pequenas',
    techSeo:
      'SEO: título e meta description únicos, dados estruturados schema.org/LocalBusiness com os dados reais acima, Open Graph',
    techA11y: 'Acessibilidade: contraste AA, textos alternativos, navegação por teclado, hierarquia de headings correta',
    techPerf: 'Performance: imagens otimizadas/lazy-load, sem dependências pesadas desnecessárias',
    techNoBackend:
      'Não há backend real disponível — o formulário de contato deve abrir o app de e-mail (mailto:) ou o WhatsApp acima, nunca prometer envio para um servidor que não existe',
    techStack:
      'Stack sugerida (flexível): HTML/CSS/JS puro ou React + Vite — escolha a que resultar num site mais simples de hospedar de graça (Render, Vercel, Netlify ou GitHub Pages)',
    constraints: 'Restrições importantes',
    noFakeTestimonials:
      'Não invente depoimentos de clientes reais, preços exatos, prêmios ou anos de fundação — o que não foi informado acima deve aparecer como um placeholder claro entre colchetes, ex.: [ENDEREÇO COMPLETO]',
    demoFooter: 'Deixe explícito, em um rodapé discreto, que esta é uma demonstração comercial, não o site final',
    noFalseClaims:
      'Não afirme nenhuma funcionalidade que não existe de fato (ex.: não diga "compre online" se não há checkout implementado)',
    deliverable: 'Entregável',
    protoDeliverable:
      'Um único arquivo HTML autocontido (CSS embutido, sem dependências de build), responsivo, pronto para abrir direto no navegador. Pode usar Tailwind via CDN.',
    fullDeliverable:
      'Um projeto completo e publicável seguindo a stack escolhida acima, organizado, com instruções de build/deploy.',
    successCriteria: 'Critério de sucesso',
    successText:
      'O site deve poder ser publicado como está, sem exagerar nem inventar nada além do que foi informado neste briefing.',
  },
  'en-US': {
    respondIn: 'Respond entirely in natural American business English.',
    goal: 'Goal',
    protoTitle: 'PROTOTYPE',
    protoGoal:
      "You will build a commercial-demo website PROTOTYPE. It will be shown to the business owner — who currently has no website — to convince them to commission the full site. It needs to impress quickly and look professional; it doesn't need every feature of the final product.",
    fullTitle: 'FULL SITE',
    fullGoal:
      'You will build the FULL, publishable website for the business below. Unlike a prototype, this is the final product: it needs to be functional, fast, accessible, and ready for real customer traffic.',
    about: 'About the business (real data — do not invent beyond this)',
    name: 'Name',
    category: 'Category',
    location: 'City',
    phone: 'Phone',
    phoneMissing: 'not provided — use a [PHONE] placeholder',
    instagram: 'Instagram',
    instagramMissing: 'not provided',
    rating: 'Public rating',
    ratingMissing: 'no rating data available',
    reviews: 'reviews',
    analysis: 'Business analysis',
    audience: 'Target audience',
    identity: 'Suggested visual identity',
    palette: 'Color palette',
    typography: 'Typography',
    typographyNote: '(Google Fonts)',
    tone: 'Tone of voice',
    structure: 'Page structure (single page)',
    fullStructure: 'Expected structure (pages/sections)',
    include: 'What to include',
    sellingPoints: 'Selling points to highlight',
    whatsappCta: 'A WhatsApp contact button using the phone number above (or a placeholder)',
    noPhotoNote:
      'If no real photos are available, use a graphic hero (gradient/illustration in the palette above) instead of generic stock photography pretending to be the business',
    features: 'Segment-specific features to consider',
    seo: 'Local SEO keywords',
    technical: 'Technical requirements',
    techResponsive: 'Responsive (mobile-first), tested on small screens',
    techSeo:
      'SEO: unique title and meta description, schema.org/LocalBusiness structured data using the real data above, Open Graph',
    techA11y: 'Accessibility: AA contrast, alt text, keyboard navigation, correct heading hierarchy',
    techPerf: 'Performance: optimized/lazy-loaded images, no unnecessary heavy dependencies',
    techNoBackend:
      "There is no real backend available — the contact form must open the user's email app (mailto:) or the WhatsApp link above, never promise submission to a server that doesn't exist",
    techStack:
      'Suggested stack (flexible): plain HTML/CSS/JS or React + Vite — pick whichever ends up simplest to host for free (Render, Vercel, Netlify or GitHub Pages)',
    constraints: 'Important constraints',
    noFakeTestimonials:
      'Do not invent real customer testimonials, exact prices, awards, or founding years — anything not given above must appear as a clear bracketed placeholder, e.g. [FULL ADDRESS]',
    demoFooter: 'Make it explicit, in a discreet footer, that this is a commercial demo, not the final site',
    noFalseClaims:
      'Do not claim any feature that does not actually exist (e.g. do not say "buy online" if there is no checkout implemented)',
    deliverable: 'Deliverable',
    protoDeliverable:
      'A single self-contained HTML file (inline CSS, no build dependencies), responsive, ready to open directly in a browser. Tailwind via CDN is fine.',
    fullDeliverable: 'A complete, publishable project using the stack chosen above, organized, with build/deploy instructions.',
    successCriteria: 'Success criteria',
    successText: 'The site must be publishable as-is, without exaggerating or inventing anything beyond what was given in this brief.',
  },
}
LABELS['pt-PT'] = LABELS['pt-BR']

function ratingLine(company: Company, t: Record<string, string>): string {
  if (!company.rating) return t.ratingMissing
  return `${company.rating}/5 (${company.reviewCount} ${t.reviews})`
}

function businessBlock(company: Company, brief: Brief, t: Record<string, string>): string {
  const location = company.state ? `${company.city}, ${company.state}` : company.city
  return [
    `## ${t.about}`,
    `- ${t.name}: ${company.name}`,
    `- ${t.category}: ${company.category}`,
    `- ${t.location}: ${location}`,
    `- ${t.phone}: ${company.phone ?? t.phoneMissing}`,
    `- ${t.instagram}: ${company.instagram ?? t.instagramMissing}`,
    `- ${t.rating}: ${ratingLine(company, t)}`,
    `- ${t.analysis}: ${brief.businessSummary}`,
    `- ${t.audience}: ${brief.targetAudience}`,
  ].join('\n')
}

function identityBlock(brief: Brief, t: Record<string, string>): string {
  const p = brief.colorPalette
  return [
    `## ${t.identity}`,
    `- ${t.palette}: ${p.primary} / ${p.secondary} / ${p.accent} / ${p.background}`,
    `- ${t.typography}: ${brief.fontPairing.heading} + ${brief.fontPairing.body} ${t.typographyNote}`,
    `- ${t.tone}: ${brief.toneOfVoice}`,
  ].join('\n')
}

function bulletList(items: string[]): string {
  return items.map((i) => `- ${i}`).join('\n')
}

function buildPrototypePrompt(company: Company, brief: Brief, t: Record<string, string>): string {
  return [
    `# ${t.protoTitle} — ${company.name}`,
    t.respondIn,
    '',
    `## ${t.goal}`,
    t.protoGoal,
    '',
    businessBlock(company, brief, t),
    '',
    identityBlock(brief, t),
    '',
    `## ${t.structure}`,
    bulletList(brief.suggestedSections.slice(0, 5)),
    '',
    `## ${t.include}`,
    `- ${t.sellingPoints}: ${brief.keySellingPoints.join('; ')}`,
    `- ${t.whatsappCta}`,
    `- ${t.noPhotoNote}`,
    '',
    `## ${t.constraints}`,
    `- ${t.noFakeTestimonials}`,
    `- ${t.demoFooter}`,
    '',
    `## ${t.deliverable}`,
    t.protoDeliverable,
  ].join('\n')
}

function buildFullSitePrompt(company: Company, brief: Brief, t: Record<string, string>): string {
  return [
    `# ${t.fullTitle} — ${company.name}`,
    t.respondIn,
    '',
    `## ${t.goal}`,
    t.fullGoal,
    '',
    businessBlock(company, brief, t),
    `- ${t.sellingPoints}: ${brief.keySellingPoints.join('; ')}`,
    `- ${t.features}: ${brief.categoryFeatures.join('; ')}`,
    `- ${t.seo}: ${brief.seoKeywords.join(', ')}`,
    '',
    identityBlock(brief, t),
    '',
    `## ${t.fullStructure}`,
    bulletList(brief.suggestedSections),
    '',
    `## ${t.technical}`,
    bulletList([t.techResponsive, t.techSeo, t.techA11y, t.techPerf, t.techNoBackend, t.techStack]),
    '',
    `## ${t.constraints}`,
    bulletList([t.noFakeTestimonials, t.noFalseClaims]),
    '',
    `## ${t.deliverable}`,
    t.fullDeliverable,
    '',
    `## ${t.successCriteria}`,
    t.successText,
  ].join('\n')
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { company, language } = (await req.json()) as { company: Company; language?: string }
    const lang = language ?? 'pt-BR'
    const t = LABELS[lang] ?? LABELS['pt-BR']

    const languageInstruction =
      lang === 'en-US'
        ? 'Write every field in natural American business English.'
        : lang === 'pt-PT'
          ? 'Escreva todos os campos em português de Portugal.'
          : 'Escreva todos os campos em português do Brasil.'

    const briefPrompt = `You are a brand strategist and art director analyzing the real local business
"${company.name}" (category: "${company.category}"), located in ${company.city}. Public data available:
rating ${company.rating ?? 'not available'} (${company.reviewCount} reviews), phone ${company.phone ? 'available' : 'not available'},
Instagram ${company.instagram ? 'available' : 'not available'}.

${languageInstruction}

Infer the business's likely commercial goal from its category (a restaurant sells atmosphere and menu
items; a law firm sells trust and expertise; a gym sells results and community) and tailor everything to
that specific goal, not generic business advice. Propose: a one-to-two sentence analysis of the business
and its positioning; its likely target audience in one sentence; a tone of voice (2-4 words); a hex color
palette coherent with the "${company.category}" segment and typical of well-designed brands in that
segment; a font pairing chosen ONLY from this exact list (pick whichever combo best fits the segment's
personality): Inter, Poppins, Montserrat, Playfair Display, Merriweather, Lora, Oswald, Nunito, Work Sans,
Cormorant Garamond; 3 to 5 concrete selling points this specific business can credibly claim given the
data above; 5 to 8 page/section names appropriate for this segment (e.g. a restaurant needs "Cardápio", a
dentist needs "Agendamento", a gym needs "Planos"); 4 to 7 segment-specific website features that go beyond
a generic template (e.g. WhatsApp ordering button for a restaurant, before/after gallery for a salon,
online booking CTA for a clinic, service-area quote form for a contractor); and 3 to 6 local SEO keyword
phrases combining the category with the city. Never invent contact details or specific facts not given to
you. Respond strictly in the requested JSON format.`

    const brief = (await generateJson(briefPrompt, SCHEMA)) as Brief

    const prototypePrompt = buildPrototypePrompt(company, brief, t)
    const fullSitePrompt = buildFullSitePrompt(company, brief, t)

    return new Response(
      JSON.stringify({
        prompts: {
          companyId: company.id,
          prototypePrompt,
          fullSitePrompt,
          generatedAt: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
