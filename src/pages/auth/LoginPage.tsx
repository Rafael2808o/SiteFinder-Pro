import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { useAuth } from '../../context/AuthContext'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700">
            <Logo size={22} className="text-white" accent="#0f766e" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">SiteFinder Pro</h1>
          <p className="text-xs text-slate-500">Prospecção de clientes para sites</p>
        </div>

        <Card className="p-6">
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
            <Input
              id="password"
              type="password"
              label="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <Button type="submit" loading={loading} icon={<LogIn size={16} />}>
              Entrar
            </Button>
          </form>
          <div className="mt-4 flex justify-between text-xs text-slate-500">
            <Link to="/recuperar-senha" className="hover:text-teal-700">
              Esqueci minha senha
            </Link>
            <Link to="/cadastro" className="hover:text-teal-700">
              Criar conta
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
