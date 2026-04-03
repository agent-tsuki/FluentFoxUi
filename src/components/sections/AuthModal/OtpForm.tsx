import { useRef, useState, useEffect, type ClipboardEvent, type KeyboardEvent } from 'react'
import { authService } from '@/api/services/authService'
import { Icon } from '@/components/ui/Icon'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60 // seconds

interface OtpFormProps {
  email: string
  onSuccess: () => void
  onBack: () => void
}

export function OtpForm({ email, onSuccess, onBack }: OtpFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendMsg, setResendMsg] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start cooldown timer
  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN)
    cooldownTimer.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current)
    }
  }, [])

  // ── helpers ──────────────────────────────────────────────────────────────

  const focusAt = (index: number) => inputRefs.current[index]?.focus()

  const updateDigits = (index: number, value: string) => {
    const next = [...digits]
    next[index] = value
    setDigits(next)
    return next
  }

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleChange = (index: number, raw: string) => {
    setError('')
    const char = raw.replace(/\D/g, '').slice(-1)
    updateDigits(index, char)
    if (char && index < OTP_LENGTH - 1) focusAt(index + 1)
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        updateDigits(index, '')
      } else if (index > 0) {
        updateDigits(index - 1, '')
        focusAt(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusAt(index - 1)
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusAt(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    const next = [...digits]
    pasted.split('').forEach((char, i) => { next[i] = char })
    setDigits(next)
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1))
  }

  const handleVerify = async () => {
    const code = digits.join('')
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await authService.verifyOtp({ email, code })
      if (result.success) {
        onSuccess()
      } else {
        setError(result.message)
        setDigits(Array(OTP_LENGTH).fill(''))
        focusAt(0)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setResendMsg('')
    setError('')
    const result = await authService.resendOtp(email)
    setResendMsg(result.message)
    setDigits(Array(OTP_LENGTH).fill(''))
    focusAt(0)
    startCooldown()
  }

  // ── render ───────────────────────────────────────────────────────────────

  const inputBase =
    'w-11 h-16 text-center text-2xl font-bold font-headline bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all outline-none caret-transparent'

  return (
    <div className="text-center">
      {/* Icon */}
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
        <Icon name="mark_email_unread" className="text-3xl" filled />
      </div>

      <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tighter mb-4">
        Verify Your Email
      </h2>

      <p className="text-on-surface-variant text-sm leading-relaxed mb-10 px-4">
        We've sent a 6-digit code to{' '}
        <span className="font-semibold text-on-surface">{email}</span>. Enter it below to
        complete your registration.
      </p>

      {/* OTP inputs — split 3 + spacer + 3 */}
      <div className="flex justify-center items-center gap-2 mb-10">
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          // Using React.Fragment with explicit key to fix fragment key warning
          <span key={i} className="contents">
            {i === 3 && <div className="w-4" aria-hidden />}
            <input
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digits[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className={`${inputBase} ${error ? 'ring-2 ring-error' : ''}`}
              autoFocus={i === 0}
              aria-label={`Digit ${i + 1}`}
            />
          </span>
        ))}
      </div>

      {/* Error */}
      {error && <p className="text-error text-xs font-medium mb-4">{error}</p>}

      {/* Resend success */}
      {resendMsg && !error && (
        <p className="text-tertiary text-xs font-medium mb-4">{resendMsg}</p>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-primary text-on-primary py-4 rounded-lg font-headline font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mb-8 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Verifying…' : 'Verify & Join'}
      </button>

      {/* Footer links */}
      <div className="space-y-4">
        <p className="text-sm text-on-surface-variant">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-primary font-bold hover:underline underline-offset-4 decoration-primary/30 transition-all disabled:text-on-surface-variant disabled:no-underline disabled:cursor-not-allowed"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </button>
        </p>

        <div className="h-px w-12 bg-surface-container-highest mx-auto" />

        <button
          type="button"
          onClick={onBack}
          className="text-xs text-on-surface-variant/60 font-medium hover:text-on-surface transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <Icon name="arrow_back" className="text-sm" />
          Back to Sign Up
        </button>
      </div>

      {/* Accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-secondary-container rounded-b-xl" />
    </div>
  )
}
