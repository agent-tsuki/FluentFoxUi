import { useState, type FormEvent } from 'react'
import type { SignUpPayload, AuthResponse } from '@/types'
import { authService } from '@/api/services/authService'
import { Icon } from '@/components/ui/Icon'
import { GoogleAuthButton } from './GoogleAuthButton'
import { XAuthButton } from './XAuthButton'

interface SignUpFormProps {
  onSuccess: (response: AuthResponse) => void
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
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

  const handleSocial = async (provider: 'google' | 'apple') => {
    setLoading(true)
    try {
      const result = await authService.socialAuth(provider)
      if (result.success) onSuccess(result)
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
            placeholder="••••••••••••"
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
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label className={labelClass}>Confirm Password</label>
        <input
          type="password"
          required
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
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

      {/* Social */}
      <div className="flex gap-4">
        {/*This button for google authentication*/}
        <GoogleAuthButton 
          onClick={() => null } 
          disabled={loading} 
        />
        {/*This button for x authentication*/}
        <XAuthButton
          onClick={() => null } 
          disabled={loading} 
        />
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
