/**
 * VerifyPendingPage — "Verify your email" for logged-in, unverified users
 * (auth guide §5). Route: /verify-email, guarded by <RequireAuth allowUnverified>.
 *
 *  - Resend:        POST /auth/verification/resend, 60s cooldown, daily limit.
 *  - Change email:  POST /auth/change-email (new email + current password).
 *  - I've verified: refresh; enter the app once email_verified is true.
 *  - Log out.
 */

import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { authService } from '@/api/services/authService'
import { getEmailSuggestion, hasErrorCode, resolveErrorMessage } from '@/api/errors'
import { useAuth } from '@/context/AuthContext'
import { useCountdown } from '@/hooks/useCountdown'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { swapVariants } from '@/lib/motion'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { AuthField, PasswordToggle } from '@/components/sections/AuthModal/AuthField'

/** Fallback when the browser can't read Retry-After (not exposed via CORS yet, guide §6). */
const DEFAULT_COOLDOWN_SECONDS = 60

type Feedback = { tone: 'success' | 'error'; text: string } | null

export function VerifyPendingPage() {
  const { user, refreshUser, updateEmail, logout } = useAuth()
  const navigate      = useNavigate()
  const reducedMotion = useReducedMotion()
  const cooldown      = useCountdown()

  const [feedback, setFeedback]       = useState<Feedback>(null)
  const [dailyLimited, setDailyLimit] = useState(false)
  const [resending, setResending]     = useState(false)
  const [checking, setChecking]       = useState(false)
  const [changing, setChanging]       = useState(false)

  const email = user?.email ?? ''

  const enterApp = () => navigate('/dashboard', { replace: true })

  /** Shared handling for resend / change-email rate limits and "already verified". */
  const handleSendError = async (err: unknown): Promise<boolean> => {
    if (hasErrorCode(err, 'VERIFICATION_COOLDOWN')) {
      cooldown.start(err.retryAfter ?? DEFAULT_COOLDOWN_SECONDS)
      setFeedback({ tone: 'error', text: resolveErrorMessage(err) })
      return true
    }
    if (hasErrorCode(err, 'VERIFICATION_DAILY_LIMIT')) {
      setDailyLimit(true)
      setFeedback({ tone: 'error', text: resolveErrorMessage(err) })
      return true
    }
    if (hasErrorCode(err, 'EMAIL_ALREADY_VERIFIED')) {
      await checkVerified()
      return true
    }
    return false
  }

  const resend = async () => {
    setFeedback(null)
    setResending(true)
    try {
      await authService.resendVerification()
      cooldown.start(DEFAULT_COOLDOWN_SECONDS)
      setFeedback({ tone: 'success', text: 'Sent! Check your inbox for the new link.' })
    } catch (err) {
      if (!(await handleSendError(err))) setFeedback({ tone: 'error', text: resolveErrorMessage(err) })
    } finally {
      setResending(false)
    }
  }

  const checkVerified = async () => {
    setFeedback(null)
    setChecking(true)
    try {
      const fresh = await refreshUser()
      if (fresh?.emailVerified) { enterApp(); return }
      if (fresh) setFeedback({ tone: 'error', text: "Not verified yet. Open the link in your email, or send a new one." })
    } catch (err) {
      setFeedback({ tone: 'error', text: resolveErrorMessage(err) })
    } finally {
      setChecking(false)
    }
  }

  const resendLabel = dailyLimited
    ? 'Try again later'
    : cooldown.isRunning
      ? `Resend in ${cooldown.remaining}s`
      : resending ? 'Sending…' : 'Resend email'

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 pt-28 pb-20">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-elevation-3 border border-outline-variant/40 p-8 md:p-10">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <Icon name="mark_email_unread" className="text-3xl" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-3">
            Verify your email
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We sent a verification link to{' '}
            <span className="font-bold text-on-surface break-all">{email || 'your email address'}</span>.
            Click it to continue.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={() => void checkVerified()}
            disabled={checking}
            className="w-full py-3.5 font-headline disabled:opacity-60 disabled:scale-100"
          >
            {checking ? 'Checking…' : "I've verified"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void resend()}
            disabled={resending || cooldown.isRunning || dailyLimited}
            className="w-full py-3 font-headline disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {resendLabel}
          </Button>
        </div>

        {feedback && (
          <p
            role={feedback.tone === 'error' ? 'alert' : 'status'}
            className={`mt-4 text-center text-xs font-medium ${feedback.tone === 'error' ? 'text-error' : 'text-success'}`}
          >
            {feedback.text}
          </p>
        )}

        <div className="mt-8 border-t border-surface-container-high pt-6">
          <AnimatePresence mode="wait" initial={false}>
            {changing ? (
              <motion.div key="form" variants={reducedMotion ? undefined : swapVariants} initial="initial" animate="animate" exit="exit">
                <ChangeEmailForm
                  currentEmail={email}
                  cooldownActive={cooldown.isRunning || dailyLimited}
                  onCancel={() => setChanging(false)}
                  onChanged={newEmail => {
                    updateEmail(newEmail)
                    cooldown.start(DEFAULT_COOLDOWN_SECONDS)
                    setChanging(false)
                    setFeedback({ tone: 'success', text: `Email updated. We sent a new link to ${newEmail}.` })
                  }}
                  onSendError={handleSendError}
                />
              </motion.div>
            ) : (
              <motion.div key="links" variants={reducedMotion ? undefined : swapVariants} initial="initial" animate="animate" exit="exit"
                className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => { setFeedback(null); setChanging(true) }} className="font-bold text-primary hover:underline">
                  Wrong email? Change it
                </button>
                <button type="button" onClick={logout} className="text-on-surface-variant hover:text-on-surface transition-colors">
                  Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

// ── Change email form ─────────────────────────────────────────────────────────

interface ChangeEmailFormProps {
  currentEmail:   string
  cooldownActive: boolean
  onCancel:       () => void
  onChanged:      (newEmail: string) => void
  /** Returns true when the error was a shared send error it already handled. */
  onSendError:    (err: unknown) => Promise<boolean>
}

function ChangeEmailForm({ currentEmail, cooldownActive, onCancel, onChanged, onSendError }: ChangeEmailFormProps) {
  const [newEmail, setNewEmail]         = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving]             = useState(false)
  const [emailError, setEmailError]     = useState<ReactNode>(null)
  const [passwordError, setPwError]     = useState('')
  const [formError, setFormError]       = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setEmailError(null); setPwError(''); setFormError('')
    setSaving(true)
    try {
      await authService.changeEmail(newEmail, password)
      onChanged(newEmail.trim().toLowerCase())
    } catch (err) {
      const suggestion = getEmailSuggestion(err)
      if (suggestion) {
        setEmailError(
          <span>
            Did you mean{' '}
            <button type="button" onClick={() => { setNewEmail(suggestion); setEmailError(null) }} className="font-bold underline">
              {suggestion}
            </button>
            ?
          </span>,
        )
      } else if (hasErrorCode(err, 'DISPOSABLE_EMAIL', 'INVALID_EMAIL_DOMAIN', 'EMAIL_ALREADY_IN_USE', 'EMAIL_UNCHANGED')) {
        setEmailError(resolveErrorMessage(err))
      } else if (hasErrorCode(err, 'INVALID_CURRENT_PASSWORD')) {
        // Wrong password here must NOT log the user out (guide §4).
        setPwError(resolveErrorMessage(err))
      } else if (!(await onSendError(err))) {
        setFormError(resolveErrorMessage(err))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-xs text-on-surface-variant">
        Currently <span className="font-bold text-on-surface break-all">{currentEmail || 'unknown'}</span>
      </p>
      <AuthField
        label="New email"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={254}
        value={newEmail}
        onChange={e => { setNewEmail(e.target.value); setEmailError(null) }}
        error={emailError}
      />
      <AuthField
        label="Current password"
        type={showPassword ? 'text' : 'password'}
        name="current-password"
        autoComplete="current-password"
        required
        maxLength={128}
        value={password}
        onChange={e => { setPassword(e.target.value); setPwError('') }}
        error={passwordError || undefined}
        trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword(v => !v)} />}
      />
      {formError && <p role="alert" className="text-xs text-error font-medium px-1">{formError}</p>}
      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 py-3">Cancel</Button>
        <Button
          type="submit"
          variant="primary"
          disabled={saving || cooldownActive}
          className="flex-1 py-3 font-headline disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Update email'}
        </Button>
      </div>
    </form>
  )
}
