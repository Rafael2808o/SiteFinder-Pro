import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw, Copy, Check, Wand2, Rocket } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { generateSitePrompts } from '../../services/ai'

export function SitePromptModal({ company, onClose }) {
  const [prompts, setPrompts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function load() {
    setLoading(true)
    setError(null)
    generateSitePrompts(company)
      .then(setPrompts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [company])

  return (
    <Modal title={`✨ Prompts de site — ${company.name}`} onClose={onClose} wide>
      {loading && (
        <div className="flex flex-col items-center gap-3 py-12 text-sm text-slate-500">
          <Sparkles size={24} className="animate-pulse text-signal" />
          Analisando {company.name} e montando os prompts...
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

      {!loading && prompts && (
        <div className="flex flex-col gap-5">
          <p className="text-xs text-slate-500">
            Copie um dos prompts abaixo e cole no Claude (ou Claude Code) para ele gerar o site de
            verdade. São dois níveis: um protótipo rápido pra mostrar ao lead, e o site completo
            pronto pra publicar depois que ele fechar.
          </p>

          <PromptBlock
            icon={<Wand2 size={16} />}
            title="Prompt do protótipo"
            subtitle="Peça comercial rápida — uma única página, pra impressionar o lead na abordagem."
            text={prompts.prototypePrompt}
          />

          <PromptBlock
            icon={<Rocket size={16} />}
            title="Prompt do site completo"
            subtitle="Site final publicável — usar depois que o lead fechar negócio."
            text={prompts.fullSitePrompt}
          />

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button variant="secondary" icon={<RefreshCw size={14} />} onClick={load}>
              Gerar novamente
            </Button>
            <Button variant="ghost" className="border border-slate-300" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function PromptBlock({ icon, title, subtitle, text }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-signal-50 text-ink">
            {icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant={copied ? 'secondary' : 'primary'}
          icon={copied ? <Check size={14} /> : <Copy size={14} />}
          onClick={handleCopy}
        >
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-slate-700">
        {text}
      </pre>
    </div>
  )
}
