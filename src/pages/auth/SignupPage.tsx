import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { useAuth } from '../../context/AuthContext'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUp(email, password, name)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
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
          <h1 className="text-lg font-semibold text-slate-900">Criar conta</h1>
          <p className="text-xs text-slate-500">Comece a prospectar em minutos</p>
        </div>

        <Card className="p-6">
          {success ? (
            <p className="text-center text-sm text-emerald-700">
              Conta criada! Redirecionando para o login...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="name"
                label="Nome"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <Button type="submit" loading={loading} icon={<UserPlus size={16} />}>
                Cadastrar
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-xs text-slate-500">
            Já tem conta?{' '}
            <Link to="/login" className="text-teal-700 hover:underline">
              Entrar
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
