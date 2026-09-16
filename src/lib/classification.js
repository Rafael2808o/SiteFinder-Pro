const SOCIAL_ONLY_PATTERNS = [
  'instagram.com',
  'facebook.com',
  'linktr.ee',
  'linktree',
  'wa.me',
  'api.whatsapp.com',
  'g.page',
  'business.site',
]

// Website field pointing only at a social profile or Google-hosted business
// page is not an owned site, so it lands in "possível site", not "com site".
export function classifySite(website, hasSocial) {
  if (!website) {
    return hasSocial ? 'possivel_site' : 'sem_site'
  }
  const lower = website.toLowerCase()
  const isSocialOnly = SOCIAL_ONLY_PATTERNS.some((p) => lower.includes(p))
  return isSocialOnly ? 'possivel_site' : 'com_site'
}
