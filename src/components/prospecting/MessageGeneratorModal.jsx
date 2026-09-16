import { useEffect, useState } from 'react'
import { Send, Sparkles, CheckCircle2, Wand2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { generateProspectingMessage } from '../../services/ai'
import { buildWhatsappUrl } from '../../lib/whatsapp'

export function MessageGeneratorModal({ company, onClose, onGenerateSitePrompts }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    generateProspectingMessage(company)
      .then((msg) => {
        if (active) setMessage(msg)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [company])

  const whatsappUrl = buildWhatsappUrl(company.phone, message)

  function handleSend() {
    if (!whatsappUrl) return
    window.open(whatsappUrl, '_blank')
    setSent(true)
  }

  return (
    <Modal title={`✉️ Mensagem para ${company.name}`} onClose={onClose} wide>
      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
          <Sparkles size={16} className="animate-pulse text-signal" />
          Gerando mensagem personalizada...
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {error && <p className="text-sm text-amber-700">{error} — usando mensagem padrão.</p>}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            disabled={sent}
            className="w-full rounded-lg border border-slate-300 bg-white p-3.5 text-sm text-slate-900 outline-none focus:border-signal focus:ring-2 focus:ring-signal/15 disabled:bg-slate-50 disabled:text-slate-500"
          />

          {!sent && (
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button icon={<Send size={16} />} disabled={!whatsappUrl} onClick={handleSend}>
                Enviar pelo WhatsApp
              </Button>
            </div>
          )}
          {!whatsappUrl && !sent && (
            <p className="text-right text-xs text-slate-500">
              Empresa sem telefone válido para WhatsApp.
            </p>
          )}

          {sent && (
            <div className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                <CheckCircle2 size={16} /> Mensagem aberta no WhatsApp.
              </p>
              <p className="text-sm text-emerald-700">
                Quer gerar os prompts de IA pra criar o site agora, como a mensagem prometeu?
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Não, fechar
                </Button>
                <Button
                  size="sm"
                  icon={<Wand2 size={14} />}
                  onClick={() => onGenerateSitePrompts(company)}
                >
                  Gerar prompts do site
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
