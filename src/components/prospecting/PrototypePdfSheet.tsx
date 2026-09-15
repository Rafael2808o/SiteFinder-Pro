import { forwardRef } from 'react'
import type { Company, WebsitePrototype } from '../../lib/types'
import { PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT } from '../../lib/pdf'

const LABELS: Record<string, {
  proposalTag: string
  ratingSuffix: string
  developedBy: string
  aboutFallback: string
  servicesTitle: string
  valueTitle: string
  valueBullets: string[]
  pricingTitle: string
  pricingBody: string
  ctaTitle: string
  ctaBody: string
}> = {
  'pt-BR': {
    proposalTag: 'Protótipo de site — proposta comercial',
    ratingSuffix: 'avaliações',
    developedBy: 'Protótipo preparado por',
    aboutFallback: 'Sobre',
    servicesTitle: 'Serviços',
    valueTitle: 'Por que ter um site profissional',
    valueBullets: [
      'Aparece no Google quando alguém procura o seu tipo de negócio na região',
      'Passa mais confiança do que só uma página de rede social',
      'Funciona 24 horas por dia, mesmo fora do horário de atendimento',
      'Facilita o contato: telefone, WhatsApp e endereço em um só lugar',
    ],
    pricingTitle: 'Pagamento único',
    pricingBody: 'Sem mensalidade, sem taxa recorrente. Você paga uma vez pelo desenvolvimento e o site é seu.',
    ctaTitle: 'Vamos conversar?',
    ctaBody: 'Esse protótipo foi feito especialmente para vocês. Responda a mensagem e vemos os próximos passos juntos.',
  },
  'en-US': {
    proposalTag: 'Website prototype — business proposal',
    ratingSuffix: 'reviews',
    developedBy: 'Prototype prepared by',
    aboutFallback: 'About',
    servicesTitle: 'Services',
    valueTitle: 'Why a professional website matters',
    valueBullets: [
      'Shows up on Google when someone searches for your type of business nearby',
      'Builds more trust than a social media page alone',
      'Works around the clock, even outside business hours',
      'Puts your phone, WhatsApp, and address all in one place',
    ],
    pricingTitle: 'One-time payment',
    pricingBody: 'No monthly fee, no recurring charge. You pay once for development and the site is yours.',
    ctaTitle: "Let's talk?",
    ctaBody: 'This prototype was made specifically for you. Reply to the message and we can go over next steps together.',
  },
}

function labelsFor(language: string) {
  return LABELS[language] ?? LABELS['en-US']
}

interface Props {
  company: Company
  prototype: WebsitePrototype
  developerName: string
  language: string
}

export const PrototypePdfSheet = forwardRef<HTMLDivElement, Props>(function PrototypePdfSheet(
  { company, prototype, developerName, language },
  ref,
) {
  const t = labelsFor(language)
  const { colorPalette, fontPairing } = prototype
  const coverPhoto = prototype.photos[0]
  const galleryPhotos = prototype.photos.slice(1, 5)
  const initial = company.name.trim().charAt(0).toUpperCase() || '?'
  const dateLabel = new Date().toLocaleDateString(language === 'en-US' ? 'en-US' : 'pt-BR')

  const headingFont = `"${fontPairing.heading}", sans-serif`
  const bodyFont = `"${fontPairing.body}", sans-serif`

  return (
    <div
      ref={ref}
      style={{
        width: PDF_PAGE_WIDTH,
        background: '#ffffff',
        color: '#1e293b',
        fontFamily: bodyFont,
      }}
    >
      {/* Page 1 — Cover */}
      <section style={{ width: PDF_PAGE_WIDTH, height: PDF_PAGE_HEIGHT, position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            height: PDF_PAGE_HEIGHT * 0.62,
            position: 'relative',
            background: coverPhoto ? undefined : colorPalette.primary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 64px',
          }}
        >
          {coverPhoto && (
            <img
              src={coverPhoto}
              crossOrigin="anonymous"
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {!coverPhoto && (
            <span
              style={{
                position: 'absolute',
                fontSize: 340,
                fontFamily: headingFont,
                fontWeight: 700,
                color: colorPalette.secondary,
                opacity: 0.35,
                lineHeight: 1,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {initial}
            </span>
          )}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: coverPhoto
                ? `${colorPalette.primary}cc`
                : 'transparent',
            }}
          />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                fontFamily: bodyFont,
                fontSize: 13,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#ffffff',
                opacity: 0.85,
              }}
            >
              {company.category}
            </span>
            <h1 style={{ fontFamily: headingFont, fontSize: 48, fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1.15 }}>
              {company.name}
            </h1>
            <h2 style={{ fontFamily: headingFont, fontSize: 22, fontWeight: 600, color: '#ffffff', margin: 0, maxWidth: 560 }}>
              {prototype.headline}
            </h2>
            <p style={{ fontSize: 15, color: '#ffffff', opacity: 0.92, maxWidth: 520, margin: 0 }}>
              {prototype.subheadline}
            </p>
          </div>
        </div>

        <div style={{ padding: '40px 64px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {typeof company.rating === 'number' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#334155' }}>
              <span style={{ color: '#f59e0b' }}>★</span>
              <strong>{company.rating.toFixed(1)}</strong>
              <span>· {company.reviewCount} {t.ratingSuffix}</span>
            </div>
          )}
          <div style={{ fontSize: 12, color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {t.proposalTag} · {dateLabel}
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {t.developedBy} {developerName}
          </div>
        </div>
      </section>

      {/* Page 2 — About + services + gallery */}
      <section style={{ width: PDF_PAGE_WIDTH, height: PDF_PAGE_HEIGHT, padding: '64px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <h3 style={{ fontFamily: headingFont, fontSize: 26, color: colorPalette.primary, margin: '0 0 14px' }}>
            {t.aboutFallback} {company.name}
          </h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: '#334155', margin: 0 }}>{prototype.aboutText}</p>
        </div>

        <div>
          <h3 style={{ fontFamily: headingFont, fontSize: 22, color: colorPalette.primary, margin: '0 0 14px' }}>
            {t.servicesTitle}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {prototype.services.map((s) => (
              <span
                key={s}
                style={{
                  padding: '9px 16px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#ffffff',
                  background: colorPalette.secondary,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {galleryPhotos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
            {galleryPhotos.map((src, i) => (
              <img
                key={i}
                src={src}
                crossOrigin="anonymous"
                alt=""
                style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8 }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Page 3 — Value proposition + pricing + CTA */}
      <section style={{ width: PDF_PAGE_WIDTH, height: PDF_PAGE_HEIGHT, padding: '64px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 36 }}>
        <div>
          <h3 style={{ fontFamily: headingFont, fontSize: 24, color: colorPalette.primary, margin: '0 0 20px' }}>
            {t.valueTitle}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {t.valueBullets.map((b) => (
              <div key={b} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: colorPalette.accent, fontSize: 16, lineHeight: 1.5 }}>✓</span>
                <span style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: colorPalette.background === '#ffffff' ? '#f8fafc' : colorPalette.background,
            border: `1px solid ${colorPalette.primary}22`,
            borderRadius: 16,
            padding: 32,
          }}
        >
          <p style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colorPalette.primary, margin: '0 0 8px', fontWeight: 600 }}>
            {t.pricingTitle}
          </p>
          <p style={{ fontSize: 15, color: '#334155', margin: 0, lineHeight: 1.6 }}>{t.pricingBody}</p>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <h3 style={{ fontFamily: headingFont, fontSize: 22, color: colorPalette.primary, margin: '0 0 8px' }}>
            {t.ctaTitle}
          </h3>
          <p style={{ fontSize: 14.5, color: '#334155', margin: 0, maxWidth: 480 }}>{t.ctaBody}</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 24 }}>{t.developedBy} {developerName}</p>
        </div>
      </section>
    </div>
  )
})
