import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { useAuth } from '../../context/AuthContext'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink">
            <Logo size={22} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Recuperar senha</h1>
        </div>

        <Card className="p-6">
          {sent ? (
            <p className="text-center text-sm text-emerald-700">
              Enviamos um link de recuperação para {email}.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="email"
                type="email"
                label="E-mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <Button type="submit" loading={loading} icon={<Mail size={16} />}>
                Enviar link de recuperação
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-xs text-slate-500">
            <Link to="/login" className="text-ink hover:underline">
              Voltar ao login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
