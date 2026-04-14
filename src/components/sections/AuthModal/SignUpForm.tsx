import { useState, useEffect, type FormEvent } from 'react'
import type { SignUpPayload } from '@/types'
import { authService } from '@/api/services/authService'
import { Icon } from '@/components/ui/Icon'
import { GoogleAuthButton } from './GoogleAuthButton'
import { XAuthButton } from './XAuthButton'
import { CountryCodePicker, ALL_COUNTRIES, TOP_30 } from './CountryCodePicker'
import type { Country } from './CountryCodePicker'

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
  fair:          { label: 'Fair',        bars: 2, color: 'bg-amber-400' },
  strong:        { label: 'Strong',      bars: 3, color: 'bg-green-400' },
  'very-strong': { label: 'Very Strong', bars: 4, color: 'bg-green-500' },
}

// ── Language options ──────────────────────────────────────────────────────────

const NATIVE_LANG_OPTIONS = [
  'Arabic', 'English', 'French', 'German', 'Hindi',
  'Indonesian', 'Japanese', 'Korean', 'Mandarin', 'Portuguese',
  'Russian', 'Spanish', 'Turkish', 'Vietnamese', 'Other',
]

/**
 * Maps ISO alpha-2 country code → native language option.
 * Used to pre-select the language after IP geolocation.
 */
const COUNTRY_TO_LANG: Record<string, string> = {
  // South Asia
  IN: 'Hindi',   BD: 'Bengali',  NP: 'Hindi',   LK: 'Hindi',
  PK: 'Urdu',
  // East Asia
  CN: 'Mandarin', TW: 'Mandarin', HK: 'Mandarin',
  JP: 'Japanese', KR: 'Korean',
  // Southeast Asia
  ID: 'Indonesian', PH: 'English', VN: 'Vietnamese',
  TH: 'Thai',       MY: 'Malay',   KH: 'Khmer',
  MM: 'Burmese',
  // Western Europe
  GB: 'English',  IE: 'English',  AU: 'English',
  NZ: 'English',  CA: 'English',  ZA: 'English',
  US: 'English',
  DE: 'German',   AT: 'German',   CH: 'German',
  FR: 'French',   BE: 'French',
  ES: 'Spanish',  MX: 'Spanish',  AR: 'Spanish',
  CO: 'Spanish',  CL: 'Spanish',  PE: 'Spanish',
  VE: 'Spanish',  EC: 'Spanish',  BO: 'Spanish',
  GT: 'Spanish',  DO: 'Spanish',
  BR: 'Portuguese', PT: 'Portuguese',
  RU: 'Russian',  UA: 'Russian',  KZ: 'Russian',
  // Middle East / North Africa
  EG: 'Arabic',  SA: 'Arabic',  AE: 'Arabic',
  IQ: 'Arabic',  JO: 'Arabic',  LB: 'Arabic',
  MA: 'Arabic',  DZ: 'Arabic',  TN: 'Arabic',
  KW: 'Arabic',  QA: 'Arabic',  OM: 'Arabic',
  // Other
  TR: 'Turkish',  IT: 'Italian', NL: 'Dutch',
  PL: 'Polish',   GR: 'Greek',
}

// ── Default country: India ────────────────────────────────────────────────────

const DEFAULT_COUNTRY: Country = TOP_30[0] // India +91

// ── Component ─────────────────────────────────────────────────────────────────

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [form, setForm] = useState<SignUpPayload>({
    firstName:   '',
    lastName:    '',
    userName:    '',
    email:       '',
    nativeLang:  'Hindi',   // India default
    phoneNumber: '',
  })
  const [dialCountry, setDialCountry]         = useState<Country>(DEFAULT_COUNTRY)
  const [phoneDigits, setPhoneDigits]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [password, setPassword]               = useState('')
  const [showPassword, setShowPassword]       = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')
  const [phoneError, setPhoneError]           = useState('')

  // ── IP geolocation on mount ──────────────────────────────────────────────

  useEffect(() => {
    const controller = new AbortController()
    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(r => r.json())
      .then((data: { country_code?: string }) => {
        const code = data.country_code
        if (!code) return
        // Pre-select dial country
        const found = ALL_COUNTRIES.find(c => c.code === code)
        if (found) setDialCountry(found)
        // Pre-select native language
        const lang = COUNTRY_TO_LANG[code]
        if (lang && NATIVE_LANG_OPTIONS.includes(lang)) {
          setForm(prev => ({ ...prev, nativeLang: lang }))
        }
      })
      .catch(() => { /* silently fall back to India defaults */ })
    return () => controller.abort()
  }, [])

  // ── Shared styles ────────────────────────────────────────────────────────

  const inputClass =
    'w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 outline-none text-sm'
  const labelClass =
    'block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant px-1 mb-1.5'

  // ── Derived ──────────────────────────────────────────────────────────────

  const passwordStrength = password.length > 0 ? getPasswordStrength(password) : null
  const strengthMeta     = passwordStrength ? strengthConfig[passwordStrength] : null
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  // ── Handlers ─────────────────────────────────────────────────────────────

  const field = (key: keyof SignUpPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric + underscore
    const cleaned = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
    setForm(prev => ({ ...prev, userName: cleaned }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 15)
    setPhoneDigits(digits)
    setPhoneError('')
  }

  const handlePhoneBlur = () => {
    if (phoneDigits && (phoneDigits.length < 7 || phoneDigits.length > 15)) {
      setPhoneError('Enter 7–15 digits.')
    }
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
    if (phoneDigits && (phoneDigits.length < 7 || phoneDigits.length > 15)) {
      setPhoneError('Enter 7–15 digits.')
      return
    }

    setLoading(true)
    try {
      const message = await authService.register({
        email:        form.email,
        first_name:   form.firstName,
        last_name:    form.lastName,
        native_lang:  form.nativeLang,
        password,
        phone_number: phoneDigits,
        user_name:    form.userName,
      })
      onSuccess(message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
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
          <label className={labelClass}>First Name</label>
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
          <label className={labelClass}>Last Name</label>
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
        <label className={labelClass}>Username</label>
        <input
          type="text"
          required
          minLength={3}
          maxLength={30}
          placeholder="haruki09"
          value={form.userName}
          onChange={handleUsernameChange}
          className={inputClass}
        />
        <p className="mt-1 px-1 text-[10px] text-on-surface-variant/60">
          Letters, numbers and underscores only.
        </p>
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Email Address</label>
        <input
          type="email"
          required
          maxLength={254}
          placeholder="haruki@fluentfox.jp"
          value={form.email}
          onChange={field('email')}
          className={inputClass}
        />
      </div>

      {/* Native Language — full width */}
      <div>
        <label className={labelClass}>Native Language</label>
        <select
          required
          value={form.nativeLang}
          onChange={field('nativeLang')}
          className={`${inputClass} cursor-pointer appearance-none`}
        >
          <option value="" disabled>Select your native language</option>
          {NATIVE_LANG_OPTIONS.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {/* Phone Number — full width, dial picker + digits */}
      <div>
        <label className={labelClass}>
          Phone Number{' '}
          <span className="normal-case text-outline/50 font-normal tracking-normal">
            (optional)
          </span>
        </label>
        <div className="flex rounded-lg overflow-hidden ring-1 ring-transparent focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <CountryCodePicker value={dialCountry} onChange={setDialCountry} />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={15}
            placeholder="9876543210"
            value={phoneDigits}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            className="flex-1 bg-surface-container-low px-4 py-3 text-on-surface text-sm placeholder:text-outline/50 outline-none rounded-r-lg"
          />
        </div>
        {phoneError && (
          <p className="mt-1 px-1 text-[11px] text-error font-medium">{phoneError}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className={labelClass}>Password</label>
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
            <p className="text-[10px] text-on-surface-variant font-medium">
              Strength: <span className="font-bold">{strengthMeta.label}</span>
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className={labelClass}>Confirm Password</label>
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
          <p className="mt-1 px-1 text-[11px] text-error font-medium">Passwords do not match.</p>
        )}
      </div>

      {/* General error */}
      {error && (
        <p className="text-error text-xs font-medium px-1">{error}</p>
      )}

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary font-headline font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account…' : 'Create Account'}
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center py-0.5">
        <div className="flex-grow border-t border-surface-container-high" />
        <span className="flex-shrink mx-4 text-[10px] text-outline font-bold uppercase tracking-tighter">
          Or continue with
        </span>
        <div className="flex-grow border-t border-surface-container-high" />
      </div>

      {/* Social */}
      <div className="flex gap-4">
        <GoogleAuthButton onClick={() => null} disabled={loading} />
        <XAuthButton      onClick={() => null} disabled={loading} />
      </div>

      {/* Legal */}
      <p className="text-center text-[10px] text-on-surface-variant/70 leading-relaxed max-w-[280px] mx-auto">
        By signing up, you agree to our{' '}
        <a href="/terms" className="underline hover:text-primary">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
      </p>
    </form>
  )
}
