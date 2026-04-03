import { useState, type FormEvent } from 'react'
import type { SignUpPayload, AuthResponse } from '@/types'
import { authService } from '@/api/services/authService'
import { Icon } from '@/components/ui/Icon'
import { GoogleAuthButton } from './GoogleAuthButton'
import { XAuthButton } from './XAuthButton'

interface SignUpFormProps {
  onSuccess: (response: AuthResponse) => void
}

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
  weak:        { label: 'Weak',        bars: 1, color: 'bg-error' },
  fair:        { label: 'Fair',        bars: 2, color: 'bg-amber-400' },
  strong:      { label: 'Strong',      bars: 3, color: 'bg-green-400' },
  'very-strong': { label: 'Very Strong', bars: 4, color: 'bg-green-500' },
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [form, setForm] = useState<SignUpPayload>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputClass =
    'w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 outline-none'
  const labelClass =
    'block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant px-1'

  const passwordStrength = form.password.length > 0 ? getPasswordStrength(form.password) : null
  const strengthMeta = passwordStrength ? strengthConfig[passwordStrength] : null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const result = await authService.signUp(form)
      if (result.success) {
        onSuccess(result)
      } else {
        setError(result.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>First Name</label>
          <input
            type="text"
            required
            maxLength={50}
            placeholder="Haruki"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Last Name</label>
          <input
            type="text"
            required
            maxLength={50}
            placeholder="Murakami"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className={labelClass}>Email Address</label>
        <input
          type="email"
          required
          maxLength={254}
          placeholder="haruki@FluentFox.jp"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            minLength={8}
            maxLength={128}
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          >
            <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-lg" />
          </button>
        </div>

        {/* Strength meter */}
        {strengthMeta && (
          <div className="space-y-1 px-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    bar <= strengthMeta.bars ? strengthMeta.color : 'bg-surface-container-highest'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-on-surface-variant font-medium">
              Password strength: <span className="font-bold">{strengthMeta.label}</span>
            </p>
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label className={labelClass}>Confirm Password</label>
        <input
          type="password"
          required
          maxLength={128}
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`${inputClass} ${confirmPassword && form.password !== confirmPassword ? 'ring-2 ring-error/40' : ''}`}
        />
      </div>

      {/* Error */}
      {error && <p className="text-error text-xs font-medium px-1">{error}</p>}

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-container text-on-primary font-headline font-bold py-4 rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account…' : 'Create Account'}
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-surface-container-high" />
        <span className="flex-shrink mx-4 text-[10px] text-outline font-bold uppercase tracking-tighter">
          Or continue with
        </span>
        <div className="flex-grow border-t border-surface-container-high" />
      </div>

      {/* Social — wired up but backends not yet implemented */}
      <div className="flex gap-4">
        <GoogleAuthButton onClick={() => null} disabled={loading} />
        <XAuthButton onClick={() => null} disabled={loading} />
      </div>

      {/* Legal */}
      <p className="text-center text-[10px] text-on-surface-variant/70 leading-relaxed max-w-[280px] mx-auto">
        By signing up, you agree to our{' '}
        <a href="/terms" className="underline hover:text-primary">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="underline hover:text-primary">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  )
}
