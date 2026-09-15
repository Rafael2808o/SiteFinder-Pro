import { useState } from 'react'
import { KeyRound, Mail, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMessage('Senha atualizada com sucesso.')
      setPassword('')
    } catch (err) {
      setMessage((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Configurações</h1>

      <Card className="mb-6 flex items-center gap-3 p-5">
        <Mail size={18} className="text-slate-400" />
        <div>
          <p className="text-sm font-medium text-slate-900">{user?.email}</p>
          <p className="text-xs text-slate-500">Conta autenticada via Supabase</p>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <KeyRound size={16} /> Alterar senha
        </h3>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
          <Input
            type="password"
            placeholder="Nova senha"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {message && <p className="text-xs text-slate-500">{message}</p>}
          <Button type="submit" loading={saving} className="w-fit">
            Salvar nova senha
          </Button>
        </form>
      </Card>

      <Button variant="danger" icon={<LogOut size={16} />} className="mt-6" onClick={signOut}>
        Sair da conta
      </Button>
    </div>
  )
}
