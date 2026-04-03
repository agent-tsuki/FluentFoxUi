import { useState, type FormEvent } from 'react'
import type { AuthResponse } from '@/types'
import { authService } from '@/api/services/authService'
import { Icon } from '@/components/ui/Icon'
import { GoogleAuthButton } from './GoogleAuthButton'
import { XAuthButton } from './XAuthButton'

interface LoginFormProps {
  onSuccess: (response: AuthResponse) => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    setLoading(true)
    try {
      const result = await authService.login({ email, password })
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
      {/* Email */}
      <div className="space-y-1.5">
        <label className={labelClass}>Email Address</label>
        <input
          type="email"
          required
          placeholder="haruki@FluentFox.jp"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
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

      <div className="text-right">
        <a href="#" className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline">
          Forgot password?
        </a>
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
          {loading ? 'Signing In…' : 'Sign In'}
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
    </form>
  )
}
