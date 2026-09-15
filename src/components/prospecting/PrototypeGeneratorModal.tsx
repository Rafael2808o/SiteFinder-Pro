import { useEffect, useRef, useState } from 'react'
import { Sparkles, RefreshCw, FileDown } from 'lucide-react'
import type { Company, WebsitePrototype } from '../../lib/types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { generateWebsitePrototype } from '../../services/ai'
import { photoUrl } from '../../services/places'
import { useAuth } from '../../context/AuthContext'
import { getCountry } from '../../lib/countries'
import { exportNodeToPdf } from '../../lib/pdf'
import { PrototypePdfSheet } from './PrototypePdfSheet'

export function PrototypeGeneratorModal({
  company,
  onClose,
}: {
  company: Company
  onClose: () => void
}) {
  const { user } = useAuth()
  const [prototype, setPrototype] = useState<WebsitePrototype | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  function load() {
    setLoading(true)
    setError(null)
    generateWebsitePrototype(company)
      .then(setPrototype)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [company])

  const photos = prototype?.photos ?? company.photoRefs.slice(0, 4).map((r) => photoUrl(r))
  const language = getCountry(company.country).language
  const developerName = (user?.user_metadata?.name as string | undefined) || user?.email || 'nossa equipe'

  async function handleExportPdf() {
    if (!sheetRef.current) return
    setExporting(true)
    try {
      const safeName = company.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
      await exportNodeToPdf(sheetRef.current, `prototipo-${safeName}.pdf`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Modal title={`✨ Protótipo de site — ${company.name}`} onClose={onClose} wide>
      {loading && (
        <div className="flex flex-col items-center gap-3 py-12 text-sm text-slate-500">
          <Sparkles size={24} className="animate-pulse text-teal-600" />
          Pesquisando identidade visual, fotos e conteúdo de {company.name}...
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-8 text-sm text-red-600">
          {error}
          <Button size="sm" icon={<RefreshCw size={14} />} onClick={load}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!loading && prototype && (
        <div className="flex flex-col gap-4">
          <div
            className="overflow-hidden rounded-xl border border-slate-200"
            style={{ background: prototype.colorPalette.background }}
          >
            <div
              className="relative flex flex-col items-center justify-center gap-3 px-8 py-14 text-center"
              style={{ background: prototype.colorPalette.primary }}
            >
              {photos[0] && (
                <img
                  src={photos[0]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-25"
                />
              )}
              <h2
                className="relative text-2xl font-bold text-white"
                style={{ fontFamily: prototype.fontPairing.heading }}
              >
                {prototype.headline}
              </h2>
              <p className="relative max-w-md text-sm text-white/90">{prototype.subheadline}</p>
              <span
                className="relative rounded-full px-5 py-2 text-sm font-semibold text-white"
                style={{ background: prototype.colorPalette.accent }}
              >
                {company.name}
              </span>
            </div>

            <div className="px-8 py-6" style={{ fontFamily: prototype.fontPairing.body }}>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: prototype.colorPalette.primary }}>
                Sobre {company.name}
              </h3>
              <p className="text-sm text-slate-600">{prototype.aboutText}</p>
            </div>

            {photos.length > 1 && (
              <div className="grid grid-cols-4 gap-1 px-8 pb-6">
                {photos.slice(0, 4).map((src, i) => (
                  <img key={i} src={src} alt="" className="aspect-square rounded-lg object-cover" />
                ))}
              </div>
            )}

            <div className="px-8 pb-8">
              <h3 className="mb-3 text-lg font-semibold" style={{ color: prototype.colorPalette.primary }}>
                Serviços
              </h3>
              <div className="flex flex-wrap gap-2">
                {prototype.services.map((s) => (
                  <span
                    key={s}
                    className="rounded-full px-3 py-1.5 text-xs font-medium text-white"
                    style={{ background: prototype.colorPalette.secondary }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Protótipo gerado a partir de dados públicos (nome, categoria, fotos e avaliações) para
            uso exclusivo como demonstração comercial na prospecção de {company.name}. Baixe em PDF
            para enviar ao cliente.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" icon={<RefreshCw size={14} />} onClick={load}>
              Gerar novamente
            </Button>
            <Button variant="ghost" className="border border-slate-300" onClick={onClose}>
              Fechar
            </Button>
            <Button icon={<FileDown size={14} />} loading={exporting} onClick={handleExportPdf}>
              Baixar PDF
            </Button>
          </div>

          {/* Off-screen full print layout captured by html2canvas for the PDF export above. */}
          <div style={{ position: 'fixed', left: -9999, top: 0, pointerEvents: 'none' }} aria-hidden>
            <PrototypePdfSheet
              ref={sheetRef}
              company={company}
              prototype={prototype}
              developerName={developerName}
              language={language}
            />
          </div>
        </div>
      )}
    </Modal>
  )
}
