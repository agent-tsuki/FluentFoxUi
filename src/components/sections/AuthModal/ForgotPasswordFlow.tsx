/**
 * ForgotPasswordFlow — runs inside the auth popup (password reset doc).
 *
 *   A. email → POST /auth/forgot-password (always 200: never reveal accounts)
 *   B. code  → POST /auth/forgot-password/verify-code
 *   C. sent  → the backend emails a one-time /reset-password link
 *
 * The email and code live in this component's state only: never storage,
 * the URL or logs. Closing the popup unmounts the flow and clears them.
 */

import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { authService, normalizeEmail } from '@/api/services/authService'
import { hasErrorCode, resolveErrorMessage } from '@/api/errors'
import { useCountdown } from '@/hooks/useCountdown'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { swapVariants } from '@/lib/motion'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { AuthField } from './AuthField'

const CODE_LENGTH = 8
const RESEND_COOLDOWN_SECONDS = 60
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const GENERIC_ERROR = 'Something went wrong. Please try again.'

/** Uppercase, letters and digits only, at most 8 (also cleans pasted "K7M9-Q2XR"). */
const cleanCode = (raw: string) => raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH)

type Step = 'email' | 'code' | 'sent'

interface ForgotPasswordFlowProps {
  initialEmail:   string
  /** Send the code right away and start on the code step (from Settings). */
  autoSend:       boolean
  /** Leave the flow: back to the Login tab, or close for a signed-in user. */
  onExit:         () => void
  /** Label for the exit action, e.g. "Back to login" or "Close". */
  exitLabel:      string
}

export function ForgotPasswordFlow({ initialEmail, autoSend, onExit, exitLabel }: ForgotPasswordFlowProps) {
  const reducedMotion = useReducedMotion()
  const cooldown      = useCountdown()

  const [step, setStep]             = useState<Step>(autoSend && initialEmail ? 'code' : 'email')
  const [email, setEmail]           = useState(initialEmail)
  const [code, setCode]             = useState('')
  const [sending, setSending]       = useState(false)
  const [verifying, setVerifying]   = useState(false)
  const [emailError, setEmailError] = useState('')
  const [codeError, setCodeError]   = useState('')
  const [notice, setNotice]         = useState('')

  /** Request a code. Any 200 counts as success, whatever the account state. */
  const sendCode = async (address: string): Promise<boolean> => {
    setSending(true)
    setEmailError('')
    setCodeError('')
    setNotice('')
    try {
      await authService.forgotPassword(address)
      cooldown.start(RESEND_COOLDOWN_SECONDS)
      return true
    } catch (err) {
      const message = hasErrorCode(err, 'VALIDATION_ERROR') ? 'Enter a valid email.' : GENERIC_ERROR
      if (step === 'email') setEmailError(message)
      else setCodeError(message)
      return false
    } finally {
      setSending(false)
    }
  }

  // From Settings: the code is sent as soon as the flow opens.
  const autoSent = useRef(false)
  useEffect(() => {
    if (!autoSend || !initialEmail || autoSent.current) return
    autoSent.current = true
    void sendCode(initialEmail)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submitEmail = async (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_PATTERN.test(email.trim())) { setEmailError('Enter a valid email.'); return }
    if (await sendCode(email)) {
      setCode('')
      setStep('code')
    }
  }

  const submitCode = async (e: FormEvent) => {
    e.preventDefault()
    if (code.length !== CODE_LENGTH) { setCodeError(`Enter the ${CODE_LENGTH}-character code.`); return }
    setVerifying(true)
    setCodeError('')
    setNotice('')
    try {
      await authService.verifyPasswordResetCode(email, code)
      setCode('') // nothing sensitive kept once it has served its purpose
      setStep('sent')
    } catch (err) {
      if (hasErrorCode(err, 'PASSWORD_RESET_CODE_INVALID', 'PASSWORD_RESET_EMAIL_SEND_FAILED')) {
        setCodeError(resolveErrorMessage(err)) // send failed: stay here so the user can retry
      } else if (hasErrorCode(err, 'VALIDATION_ERROR')) {
        setCodeError(`Enter the ${CODE_LENGTH}-character code.`)
      } else {
        setCodeError(GENERIC_ERROR)
      }
    } finally {
      setVerifying(false)
    }
  }

  const resendCode = async () => {
    if (await sendCode(email)) {
      setCode('')
      setNotice('If an account exists for that email, a new code is on its way.')
    }
  }

  const useDifferentEmail = () => {
    setCode('')
    setCodeError('')
    setNotice('')
    setStep('email')
  }

  const onPasteCode = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    setCode(cleanCode(e.clipboardData.getData('text')))
    setCodeError('')
  }

  const motionProps = {
    variants: reducedMotion ? undefined : swapVariants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  } as const

  const shownEmail = normalizeEmail(email)

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === 'email' && (
        <motion.div key="email" {...motionProps}>
          <Header icon="lock_reset" title="Reset your password">
            Enter the email you signed up with and we'll send you a code.
          </Header>
          <form onSubmit={submitEmail} className="space-y-5" noValidate>
            <AuthField
              label="Email Address"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              required
              maxLength={254}
              autoFocus
              placeholder="haruki@foxsensei.jp"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError('') }}
              error={emailError || undefined}
            />
            <Button type="submit" variant="primary" disabled={sending}
              className="w-full py-3.5 font-headline disabled:opacity-60 disabled:cursor-wait disabled:scale-100">
              {sending ? 'Sending…' : 'Send code'}
            </Button>
            <ExitLink label={exitLabel} onClick={onExit} />
          </form>
        </motion.div>
      )}

      {step === 'code' && (
        <motion.div key="code" {...motionProps}>
          <Header icon="pin" title="Enter the code">
            {sending && !cooldown.isRunning ? 'Sending an 8-character code to ' : 'If an account exists, we sent an 8-character code to '}
            <span className="font-bold text-on-surface break-all">{shownEmail}</span>.
          </Header>
          <form onSubmit={submitCode} className="space-y-5" noValidate>
            <AuthField
              label="Code"
              name="one-time-code"
              autoComplete="one-time-code"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              maxLength={CODE_LENGTH}
              autoFocus
              placeholder="K7M9Q2XR"
              value={code}
              onChange={e => { setCode(cleanCode(e.target.value)); setCodeError('') }}
              onPaste={onPasteCode}
              error={codeError || undefined}
              className="text-center font-headline text-lg font-bold uppercase tracking-[0.35em] placeholder:tracking-[0.35em]"
            />
            {notice && <p role="status" className="px-1 text-xs text-success font-medium">{notice}</p>}
            <Button type="submit" variant="primary" disabled={verifying}
              className="w-full py-3.5 font-headline disabled:opacity-60 disabled:cursor-wait disabled:scale-100">
              {verifying ? 'Checking…' : 'Continue'}
            </Button>
            <div className="flex items-center justify-between gap-3 text-sm">
              <button type="button" onClick={useDifferentEmail} className="text-on-surface-variant hover:text-on-surface transition-colors">
                Use a different email
              </button>
              <button
                type="button"
                onClick={() => void resendCode()}
                disabled={sending || cooldown.isRunning}
                className="font-bold text-primary hover:underline disabled:text-on-surface-variant disabled:no-underline disabled:cursor-not-allowed"
              >
                {sending ? 'Sending…' : cooldown.isRunning ? `Send a new code in ${cooldown.remaining}s` : 'Send a new code'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {step === 'sent' && (
        <motion.div key="sent" {...motionProps} role="status" aria-live="polite">
          <Header icon="mark_email_read" title="Check your email">
            If the code was valid, we sent a password reset link to{' '}
            <span className="font-bold text-on-surface break-all">{shownEmail}</span>.
            The link expires in 1 hour and can be used once.
          </Header>
          <Button type="button" variant="primary" onClick={onExit} className="w-full py-3.5 font-headline">
            {exitLabel}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Pieces ────────────────────────────────────────────────────────────────────

function Header({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
        <Icon name={icon} className="text-3xl" />
      </div>
      <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-3">{title}</h2>
      <p className="text-sm text-on-surface-variant leading-relaxed">{children}</p>
    </div>
  )
}

function ExitLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="text-center">
      <button type="button" onClick={onClick} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors py-2">
        {label}
      </button>
    </div>
  )
}
