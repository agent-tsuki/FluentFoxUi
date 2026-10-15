import { useState, type FormEvent, type ReactNode } from 'react'
import type { AuthUser } from '@/context/AuthContext'
import { authService, normalizeEmail } from '@/api/services/authService'
import { getEmailSuggestion, hasErrorCode, resolveErrorMessage } from '@/api/errors'
import { Button } from '@/components/ui/Button'
import { AuthField, PasswordToggle } from './AuthField'
import type { SignUpValues } from './authFormValues'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/passwordStrength'

interface SignUpFormProps {
  /** Account created and logged in (unverified): caller routes to the verify screen. */
  onSuccess:         (user: AuthUser) => void
  /** Account created but auto-login failed: show "check your inbox". */
  onRegisteredOnly:  (email: string) => void
  onGoToLogin:       () => void
  /** Field values, held by the modal so they survive tab switches. */
  values:            SignUpValues
  onChange:          (patch: Partial<SignUpValues>) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

type FieldErrors = Partial<Record<'email' | 'userName', ReactNode>>

const EMAIL_FIELD_CODES = ['EMAIL_DOMAIN_TYPO', 'DISPOSABLE_EMAIL', 'INVALID_EMAIL_DOMAIN', 'EMAIL_ALREADY_IN_USE']

export function SignUpForm({ onSuccess, onRegisteredOnly, onGoToLogin, values, onChange }: SignUpFormProps) {
  const form = values
  const { password, confirmPassword } = values
  const setPassword        = (value: string) => onChange({ password: value })
  const setConfirmPassword = (value: string) => onChange({ confirmPassword: value })
  const [showPassword, setShowPassword]       = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')
  const [fieldErrors, setFieldErrors]         = useState<FieldErrors>({})

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const update = (key: 'firstName' | 'lastName' | 'userName' | 'email', value: string) => {
    onChange({ [key]: value })
    if (key === 'email' || key === 'userName') setFieldErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const emailErrorFor = (err: unknown): ReactNode => {
    const suggestion = getEmailSuggestion(err)
    if (suggestion) {
      return (
        <span>
          Did you mean{' '}
          <button type="button" onClick={() => update('email', suggestion)} className="font-bold underline hover:text-on-surface">
            {suggestion}
          </button>
          ?
        </span>
      )
    }
    if (hasErrorCode(err, 'EMAIL_ALREADY_IN_USE')) {
      return (
        <span>
          {resolveErrorMessage(err)}{' '}
          <button type="button" onClick={onGoToLogin} className="font-bold underline hover:text-on-surface">
            Log in instead
          </button>
        </span>
      )
    }
    return resolveErrorMessage(err)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (password.length < PASSWORD_MIN_LENGTH) { setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }

    setLoading(true)
    const email = normalizeEmail(form.email)
    try {
      await authService.register({
        email,
        password,
        firstName: form.firstName,
        lastName:  form.lastName,
        userName:  form.userName,
      })

      // Log straight in so the user lands on "Verify your email" (resend / change email need a session).
      try {
        const user = await authService.login(email, password)
        onSuccess(user)
      } catch {
        onRegisteredOnly(email)
      }
    } catch (err) {
      if (hasErrorCode(err, ...EMAIL_FIELD_CODES)) {
        setFieldErrors({ email: emailErrorFor(err) })
      } else if (hasErrorCode(err, 'USERNAME_ALREADY_IN_USE')) {
        setFieldErrors({ userName: resolveErrorMessage(err) })
      } else {
        // Includes EMAIL_SEND_FAILED (nothing was saved, safe to resubmit) and VALIDATION_ERROR.
        setError(resolveErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div className="grid grid-cols-2 gap-3">
        <AuthField
          label="First Name"
          name="given-name"
          autoComplete="given-name"
          required
          maxLength={50}
          placeholder="Haruki"
          value={form.firstName}
          onChange={e => update('firstName', e.target.value)}
        />
        <AuthField
          label="Last Name"
          name="family-name"
          autoComplete="family-name"
          required
          maxLength={50}
          placeholder="Murakami"
          value={form.lastName}
          onChange={e => update('lastName', e.target.value)}
        />
      </div>

      <AuthField
        label="Username"
        labelNote="(optional)"
        name="username"
        autoComplete="username"
        minLength={3}
        maxLength={30}
        placeholder="haruki09"
        value={form.userName}
        onChange={e => update('userName', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
        hint="Letters, numbers and underscores only. Leave empty and we'll pick one."
        error={fieldErrors.userName}
      />

      <AuthField
        label="Email Address"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={254}
        placeholder="haruki@foxsensei.jp"
        value={form.email}
        onChange={e => update('email', e.target.value)}
        error={fieldErrors.email}
      />

      <div>
        <AuthField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="new-password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          placeholder="Min. 8 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword(v => !v)} />}
        />
        <PasswordStrengthMeter password={password} />
      </div>

      <AuthField
        label="Confirm Password"
        type="password"
        name="confirm-password"
        autoComplete="new-password"
        required
        maxLength={128}
        placeholder="••••••••••••"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        error={passwordMismatch ? 'Passwords do not match.' : undefined}
      />

      {error && <p role="alert" className="text-error text-xs font-medium px-1">{error}</p>}

      <div className="pt-1">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full py-3.5 font-headline disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account…' : 'Create Account'}
        </Button>
      </div>

      <p className="text-center text-xs text-on-surface-variant/70 leading-relaxed max-w-[280px] mx-auto">
        By signing up, you agree to our{' '}
        <a href="/terms" className="underline hover:text-primary">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
      </p>
    </form>
  )
}
