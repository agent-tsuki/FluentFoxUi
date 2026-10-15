import { useState, type FormEvent } from 'react'
import type { SignUpPayload } from '@/types'
import { authService } from '@/api/services/authService'
import { ApiError, resolveErrorMessage } from '@/api/errors'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

interface SignUpFormProps {
  onSuccess: (message: string) => void
}

// ── Password strength ─────────────────────────────────────────────────────────

type StrengthLevel = 'weak' | 'fair' | 'strong' | 'very-strong'

function getPasswordStrength(pw: string): StrengthLevel {
  if (pw.length < 8) return 'weak'
  let score = 0
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return 'fair'
  if (score === 2) return 'strong'
  return 'very-strong'
}

const strengthConfig: Record<StrengthLevel, { label: string; bars: number; color: string }> = {
  weak:          { label: 'Weak',        bars: 1, color: 'bg-error' },
  fair:          { label: 'Fair',        bars: 2, color: 'bg-warning' },
  strong:        { label: 'Strong',      bars: 3, color: 'bg-success/70' },
  'very-strong': { label: 'Very Strong', bars: 4, color: 'bg-success' },
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [form, setForm] = useState<SignUpPayload>({
    firstName:   '',
    lastName:    '',
    userName:    '',
    email:       '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [password, setPassword]               = useState('')
  const [showPassword, setShowPassword]       = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')

  // ── Shared styles ────────────────────────────────────────────────────────

  const inputClass =
    'w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 outline-none text-sm'
  const labelClass =
    'block text-2xs uppercase tracking-widest font-bold text-on-surface-variant px-1 mb-1.5'

  // ── Derived ──────────────────────────────────────────────────────────────

  const passwordStrength = password.length > 0 ? getPasswordStrength(password) : null
  const strengthMeta     = passwordStrength ? strengthConfig[passwordStrength] : null
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  // ── Handlers ─────────────────────────────────────────────────────────────

  const field = (key: keyof SignUpPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric + underscore
    const cleaned = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
    setForm(prev => ({ ...prev, userName: cleaned }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const message = await authService.register({
        email:        form.email,
        first_name:   form.firstName,
        last_name:    form.lastName,
        // Collected later on the profile page; the register contract still expects the keys.
        native_lang:  '',
        password,
        phone_number: '',
        user_name:    form.userName,
      })
      onSuccess(message)
    } catch (err) {
      if (err instanceof ApiError && err.errorCode === 'EMAIL_ALREADY_IN_USE') {
        setError('This email is already registered. Try logging in instead.')
      } else if (err instanceof ApiError && err.errorCode === 'USERNAME_ALREADY_IN_USE') {
        setError('That username is taken. Please choose a different one.')
      } else {
        setError(resolveErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* First Name | Last Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>First Name <span className="text-error normal-case tracking-normal font-bold">*</span></label>
          <input
            type="text"
            required
            maxLength={50}
            placeholder="Haruki"
            value={form.firstName}
            onChange={field('firstName')}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Last Name <span className="text-error normal-case tracking-normal font-bold">*</span></label>
          <input
            type="text"
            required
            maxLength={50}
            placeholder="Murakami"
            value={form.lastName}
            onChange={field('lastName')}
            className={inputClass}
          />
        </div>
      </div>

      {/* Username */}
      <div>
        <label className={labelClass}>
          Username{' '}
          <span className="normal-case text-outline/50 font-normal tracking-normal">(optional)</span>
        </label>
        <input
          type="text"
          minLength={3}
          maxLength={30}
          placeholder="haruki09"
          value={form.userName}
          onChange={handleUsernameChange}
          className={inputClass}
        />
        <p className="mt-1 px-1 text-xs text-on-surface-variant/60">
          Letters, numbers and underscores only.
        </p>
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Email Address <span className="text-error normal-case tracking-normal font-bold">*</span></label>
        <input
          type="email"
          required
          maxLength={254}
          placeholder="haruki@foxsensei.jp"
          value={form.email}
          onChange={field('email')}
          className={inputClass}
        />
      </div>

      {/* Password */}
      <div>
        <label className={labelClass}>Password <span className="text-error normal-case tracking-normal font-bold">*</span></label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            maxLength={128}
            placeholder="Min. 8 characters"
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

        {/* Strength meter */}
        {strengthMeta && (
          <div className="mt-2 space-y-1 px-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(bar => (
                <div
                  key={bar}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    bar <= strengthMeta.bars ? strengthMeta.color : 'bg-surface-container-highest'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              Strength: <span className="font-bold">{strengthMeta.label}</span>
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className={labelClass}>Confirm Password <span className="text-error normal-case tracking-normal font-bold">*</span></label>
        <input
          type="password"
          required
          maxLength={128}
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className={`${inputClass} ${passwordMismatch ? 'ring-2 ring-error/40' : ''}`}
        />
        {passwordMismatch && (
          <p className="mt-1 px-1 text-xs text-error font-medium">Passwords do not match.</p>
        )}
      </div>

      {/* General error */}
      {error && (
        <p className="text-error text-xs font-medium px-1">{error}</p>
      )}

      {/* Submit */}
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

      {/* Legal */}
      <p className="text-center text-xs text-on-surface-variant/70 leading-relaxed max-w-[280px] mx-auto">
        By signing up, you agree to our{' '}
        <a href="/terms" className="underline hover:text-primary">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
      </p>
    </form>
  )
}
