import { useState, type FormEvent } from 'react'
import type { AuthUser } from '@/context/AuthContext'
import { authService } from '@/api/services/authService'
import { ApiError } from '@/api/errors'
import { resolveErrorMessage } from '@/api/errors'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

interface LoginFormProps {
  onSuccess:        (user: AuthUser) => void
  onForgotPassword: () => void
}

export function LoginForm({ onSuccess, onForgotPassword }: LoginFormProps) {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [showResend, setShowResend]     = useState(false)

  const inputClass =
    'w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 outline-none'
  const labelClass =
    'block text-2xs uppercase tracking-widest font-bold text-on-surface-variant px-1'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setShowResend(false)
    setLoading(true)

    try {
      const user = await authService.login(email, password)
      onSuccess(user)
    } catch (err) {
      // UNAUTHORIZE = backend code for "email not verified"
      if (err instanceof ApiError && (err.errorCode === 'UNAUTHORIZE' || err.errorCode === 'UNAUTHORIZED' || err.errorCode === 'ACCOUNT_NOT_VERIFIED')) {
        setError('Please verify your email before logging in. Check your inbox.')
        setShowResend(true)
      } else {
        setError(resolveErrorMessage(err))
        setShowResend(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="space-y-1.5">
        <label className={labelClass}>Email Address</label>
        <input
          type="email"
          required
          placeholder="haruki@foxsensei.jp"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className={labelClass}>Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          >
            <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-lg" />
          </button>
        </div>
      </div>

      <div className="text-right">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-xs text-primary font-bold uppercase tracking-wider hover:underline"
        >
          Forgot password?
        </button>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="space-y-1">
          <p className="text-error text-xs font-medium px-1">{error}</p>
          {showResend && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-primary font-bold hover:underline px-1"
            >
              Resend verification email →
            </button>
          )}
        </div>
      )}

      {/* Submit — disabled while loading to prevent double-submit */}
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
