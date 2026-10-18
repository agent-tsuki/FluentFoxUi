import { useState, type FormEvent } from 'react'
import type { AuthUser } from '@/context/AuthContext'
import { authService, type LoginChallenge } from '@/api/services/authService'
import { resolveErrorMessage } from '@/api/errors'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { AuthField } from './AuthField'

const CODE_LENGTH = 6

interface LoginCodeStepProps {
  challenge: LoginChallenge
  onSuccess: (user: AuthUser) => void
  /** Signs in again, which emails a fresh code. */
  onResend:  () => Promise<void>
  onBack:    () => void
}

/** Second step of a password login that came through a VPN or proxy. */
export function LoginCodeStep({ challenge, onSuccess, onResend, onBack }: LoginCodeStepProps) {
  const [code, setCode]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      onSuccess(await authService.verifyLoginCode(challenge, code))
    } catch (err) {
      setError(resolveErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setCode('')
    setResending(true)
    try {
      await onResend()
    } catch (err) {
      setError(resolveErrorMessage(err))
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm text-on-surface">
        <Icon name="verified" className="text-xl text-primary shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold">Confirm it&apos;s you</p>
          <p className="text-xs text-on-surface-variant">
            You&apos;re signing in through a VPN or proxy, so we can&apos;t tell where you really are. We sent a
            6-digit code to <span className="font-semibold text-on-surface">{challenge.emailHint}</span>.
          </p>
        </div>
      </div>

      <AuthField
        label="Sign-in code"
        type="text"
        name="one-time-code"
        autoComplete="one-time-code"
        inputMode="numeric"
        pattern="[0-9]{6}"
        required
        maxLength={CODE_LENGTH}
        placeholder="123456"
        value={code}
        onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
      />

      {error && <p role="alert" className="text-error text-xs font-medium px-1">{error}</p>}

      <Button
        type="submit"
        variant="primary"
        disabled={loading || code.length !== CODE_LENGTH}
        className="w-full py-4 font-headline disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
      >
        {loading ? 'Checking…' : 'Verify and sign in'}
      </Button>

      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
        <button type="button" onClick={onBack} className="text-on-surface-variant hover:underline">
          Back
        </button>
        <button type="button" onClick={handleResend} disabled={resending} className="text-primary hover:underline disabled:opacity-60">
          {resending ? 'Sending…' : 'Send a new code'}
        </button>
      </div>
    </form>
  )
}
