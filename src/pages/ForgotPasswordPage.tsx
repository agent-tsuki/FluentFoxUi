/**
 * ForgotPasswordPage — /forgot-password (password reset guide §4.2).
 *
 * The API answers every request the same way, after a deliberate ~6s delay,
 * so nothing reveals whether an account exists. The UI must keep that
 * promise: one confirmation for every outcome, no "no account" / "not
 * verified" / "too many requests" wording, and a 60s client cooldown on
 * "send again" (the server silently drops extra sends).
 *
 * The email typed in the login form arrives via router state, not the URL,
 * so it never lands in browser history.
 */

import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { authService, normalizeEmail } from '@/api/services/authService'
import { hasErrorCode, resolveErrorMessage } from '@/api/errors'
import { useCountdown } from '@/hooks/useCountdown'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { swapVariants } from '@/lib/motion'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { AuthField } from '@/components/sections/AuthModal/AuthField'
import { AuthPageLayout, StatusCard, secondaryLinkClass } from '@/components/auth/AuthPageLayout'

const RESEND_COOLDOWN_SECONDS = 60
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordPage() {
  const location      = useLocation()
  const reducedMotion = useReducedMotion()
  const cooldown      = useCountdown()

  const prefill = (location.state as { email?: string } | null)?.email ?? ''

  const [email, setEmail]           = useState(prefill)
  const [sentTo, setSentTo]         = useState<string | null>(null)
  const [sending, setSending]       = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [error, setError]           = useState('')

  const send = async (address: string) => {
    setError('')
    setFieldError('')
    setSending(true)
    try {
      await authService.forgotPassword(address)
      setSentTo(normalizeEmail(address))
      cooldown.start(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      if (hasErrorCode(err, 'VALIDATION_ERROR')) setFieldError('Enter a valid email.')
      else setError(resolveErrorMessage(err)) // 500 → generic text + Ref id
    } finally {
      setSending(false)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_PATTERN.test(email.trim())) {
      setFieldError('Enter a valid email.')
      return
    }
    void send(email)
  }

  const motionProps = {
    variants: reducedMotion ? undefined : swapVariants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  } as const

  return (
    <AuthPageLayout>
      <AnimatePresence mode="wait" initial={false}>
        {sentTo === null ? (
          <motion.div key="form" {...motionProps}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                <Icon name="lock_reset" className="text-3xl" />
              </div>
              <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-3">
                Reset your password
              </h1>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Enter the email you signed up with and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5" noValidate>
              <AuthField
                label="Email Address"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                required
                maxLength={254}
                autoFocus={!prefill}
                placeholder="haruki@foxsensei.jp"
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldError('') }}
                error={fieldError || undefined}
              />

              {error && <p role="alert" className="text-error text-xs font-medium px-1">{error}</p>}

              <div className="space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={sending}
                  className="w-full py-3.5 font-headline disabled:opacity-60 disabled:cursor-wait disabled:scale-100"
                >
                  {sending ? 'Sending…' : 'Send reset link'}
                </Button>
                {/* The API takes ~6s on purpose; say so, so it doesn't feel broken. */}
                {sending && (
                  <p role="status" className="text-center text-xs text-on-surface-variant">
                    This can take a few seconds.
                  </p>
                )}
              </div>

              <div className="text-center">
                <Link to="/?login=1" className={secondaryLinkClass}>Back to login</Link>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div key="sent" {...motionProps}>
            <StatusCard
              icon="mark_email_read"
              tone="primary"
              title="Check your email"
              body={
                <>
                  If an account exists for{' '}
                  <span className="font-bold text-on-surface break-all">{sentTo}</span>, we've sent a link
                  to reset your password. It expires in 1 hour.
                </>
              }
            >
              <p className="text-xs text-on-surface-variant -mt-4 mb-1">
                Didn't get it? Check your spam folder, or send again.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void send(sentTo)}
                disabled={sending || cooldown.isRunning}
                className="w-full py-3 font-headline disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending…' : cooldown.isRunning ? `Send again in ${cooldown.remaining}s` : 'Send again'}
              </Button>
              {error && <p role="alert" className="text-error text-xs font-medium">{error}</p>}
              <button
                type="button"
                onClick={() => { setSentTo(null); setError('') }}
                className={secondaryLinkClass}
              >
                Use a different email
              </button>
              <Link to="/?login=1" className={secondaryLinkClass}>Back to login</Link>
            </StatusCard>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthPageLayout>
  )
}
