export type SiteStatus = 'sem_site' | 'possivel_site' | 'com_site'

export type LeadStatus =
  | 'novo'
  | 'contato_realizado'
  | 'respondeu'
  | 'interessado'
  | 'negociacao'
  | 'cliente'
  | 'nao_interessado'

export interface OpeningHours {
  weekdayText: string[]
  openNow?: boolean
}

export interface Company {
  id: string
  placeId: string
  name: string
  category: string
  categories: string[]
  address: string
  city: string
  state: string
  country: string
  neighborhood?: string
  phone?: string
  latitude: number
  longitude: number
  rating?: number
  reviewCount: number
  openingHours?: OpeningHours
  mapUrl: string
  website?: string
  instagram?: string
  facebook?: string
  photoUrl?: string
  photoRefs: string[]
  siteStatus: SiteStatus
  leadScore: number
  leadScoreReason: string
}

export interface SearchParams {
  city: string
  state: string
  country: string
  neighborhood?: string
  radiusKm: number
  category: string
}

export interface CompanyFilters {
  onlySemSite: boolean
  onlyInstagram: boolean
  minRating: number
  minReviews: number
  category: string
  neighborhood: string
  maxDistanceKm: number
  contactStatus: 'todas' | 'contatadas' | 'nao_contatadas'
}

export interface Lead {
  id: string
  userId: string
  placeId: string
  name: string
  category: string
  phone?: string
  whatsapp?: string
  address: string
  city: string
  instagram?: string
  website?: string
  rating?: number
  reviewCount: number
  status: LeadStatus
  notes: string
  leadScore: number
  leadScoreReason: string
  latitude?: number
  longitude?: number
  mapUrl?: string
  createdAt: string
  lastContactAt?: string
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  contato_realizado: 'Contato realizado',
  respondeu: 'Respondeu',
  interessado: 'Interessado',
  negociacao: 'Negociação',
  cliente: 'Cliente',
  nao_interessado: 'Não interessado',
}

export const SITE_STATUS_LABELS: Record<SiteStatus, string> = {
  sem_site: 'Sem site',
  possivel_site: 'Possível site',
  com_site: 'Com site',
}

export interface SitePrompts {
  companyId: string
  prototypePrompt: string
  fullSitePrompt: string
  generatedAt: string
}
