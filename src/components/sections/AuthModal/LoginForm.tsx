import { useState, type FormEvent } from 'react'
import { useAuth, type AuthUser } from '@/context/AuthContext'
import { authService } from '@/api/services/authService'
import { resolveErrorMessage } from '@/api/errors'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { AuthField, PasswordToggle } from './AuthField'
import type { LoginValues } from './authFormValues'

interface LoginFormProps {
  /** Called with the logged-in user. Unverified users are routed by the caller. */
  onSuccess:        (user: AuthUser) => void
  /** Receives the email typed so far, to prefill the forgot-password page. */
  onForgotPassword: (email: string) => void
  /** Field values, held by the modal so they survive tab switches. */
  values:           LoginValues
  onChange:         (patch: Partial<LoginValues>) => void
}

export function LoginForm({ onSuccess, onForgotPassword, values, onChange }: LoginFormProps) {
  const { notice, clearNotice } = useAuth()

  const { email, password } = values
  const setEmail    = (value: string) => onChange({ email: value })
  const setPassword = (value: string) => onChange({ password: value })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    clearNotice()
    setLoading(true)
    try {
      const user = await authService.login(email, password)
      onSuccess(user)
    } catch (err) {
      // INVALID_CREDENTIALS is deliberately generic: never hint whether the email exists.
      setError(resolveErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Session notice: why you were logged out, or "Password updated" */}
      {notice && (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'flex items-start gap-2 text-xs font-medium px-3 py-2.5 rounded-xl',
            notice.tone === 'error' ? 'text-error bg-error/10' : 'text-success bg-success/10',
          )}
        >
          <span aria-hidden className="material-symbols-outlined text-base leading-none">
            {notice.tone === 'error' ? 'error' : 'check_circle'}
          </span>
          {notice.text}
        </p>
      )}

      <AuthField
        label="Email Address"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={254}
        placeholder="haruki@foxsensei.jp"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <AuthField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        autoComplete="current-password"
        required
        maxLength={128}
        placeholder="••••••••••••"
        value={password}
        onChange={e => setPassword(e.target.value)}
        trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword(v => !v)} />}
      />

      <div className="text-right">
        <button
          type="button"
          onClick={() => onForgotPassword(email.trim())}
          className="text-xs text-primary font-bold uppercase tracking-wider hover:underline"
        >
          Forgot password?
        </button>
      </div>

      {error && (
        <p role="alert" className="text-error text-xs font-medium px-1">{error}</p>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full py-4 font-headline disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        >
          {loading ? 'Signing In…' : 'Sign In'}
        </Button>
      </div>
    </form>
  )
}
