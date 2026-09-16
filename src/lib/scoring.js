const RELEVANT_CATEGORIES = [
  'restaurante',
  'clínica',
  'dentista',
  'salão',
  'barbearia',
  'academia',
  'advocacia',
  'imobiliária',
  'oficina',
  'loja',
  'pet shop',
  'contabilidade',
  'construtora',
  'hotel',
  'pousada',
]

export function scoreLead(company) {
  let score = 0
  const reasons = []

  if (company.siteStatus === 'sem_site') {
    score += 40
    reasons.push('não possui site próprio')
  } else if (company.siteStatus === 'possivel_site') {
    score += 20
    reasons.push('possui apenas redes sociais, sem site próprio identificado')
  }

  if (company.reviewCount >= 50) {
    score += 20
    reasons.push('muitas avaliações')
  } else if (company.reviewCount >= 20) {
    score += 12
    reasons.push('bom volume de avaliações')
  } else if (company.reviewCount >= 5) {
    score += 5
  }

  if ((company.rating ?? 0) >= 4.5) {
    score += 15
    reasons.push('excelente avaliação')
  } else if ((company.rating ?? 0) >= 4.0) {
    score += 10
    reasons.push('boa avaliação')
  }

  if (company.phone) {
    score += 8
    reasons.push('possui telefone de contato')
  }

  if (company.instagram) {
    score += 7
    reasons.push('possui presença digital (Instagram)')
  }

  const categoryLower = company.category.toLowerCase()
  if (RELEVANT_CATEGORIES.some((c) => categoryLower.includes(c))) {
    score += 10
    reasons.push('categoria comercial relevante para criação de sites')
  }

  score = Math.min(100, score)

  const reason =
    reasons.length > 0
      ? `Empresa ${reasons.join(', ')}.`
      : 'Poucos dados públicos disponíveis para avaliação.'

  return { score, reason }
}
