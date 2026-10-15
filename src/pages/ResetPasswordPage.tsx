/**
 * ResetPasswordPage — /reset-password?token=… (the link from the second
 * password-reset email; the code step happens in the auth popup).
 *
 *  - The token is read and stripped from the address bar in a layout effect,
 *    before the first paint, and kept in a ref only (never storage or logs).
 *  - Success: form state is discarded, any session in this browser (and its
 *    other tabs) is ended, and a "Password reset successfully" screen offers
 *    a Log in button. There is no auto-login.
 *  - PASSWORD_RESET_TOKEN_INVALID → one "invalid, expired or used" state with
 *    a way to request a new code. Errors are never 401s (no refresh/logout).
 */

import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '@/api/services/authService'
import { hasErrorCode } from '@/api/errors'
import { expireSession } from '@/api/session'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/passwordStrength'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { AuthField, PasswordToggle } from '@/components/sections/AuthModal/AuthField'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'
import {
  AuthPageLayout,
  StatusCard,
  primaryLinkClass,
  secondaryLinkClass,
} from '@/components/auth/AuthPageLayout'

type ResetState = 'init' | 'form' | 'invalid' | 'success'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()

  const tokenRef = useRef<string | null>(null)
  const readRef  = useRef(false)

  const [state, setState]               = useState<ResetState>('init')
  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [passwordError, setPwError]     = useState('')
  const [formError, setFormError]       = useState('')

  // Read the token once, then remove it from the URL before anything paints.
  useLayoutEffect(() => {
    if (readRef.current) return
    readRef.current = true
    tokenRef.current = searchParams.get('token')
    navigate('/reset-password', { replace: true })
    setState(tokenRef.current ? 'form' : 'invalid')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const mismatch = confirm.length > 0 && password !== confirm

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setPwError('')
    setFormError('')
    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      setPwError(`Use ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters.`)
      return
    }
    if (password !== confirm) return

    const token = tokenRef.current
    if (!token) { setState('invalid'); return }

    setSubmitting(true)
    try {
      await authService.resetPassword(token, password)
      // Discard everything sensitive; there is no auto-login.
      tokenRef.current = null
      setPassword('')
      setConfirm('')
      // Old password is gone: end any session in this browser and its other tabs.
      expireSession()
      setState('success')
    } catch (err) {
      if (hasErrorCode(err, 'PASSWORD_RESET_TOKEN_INVALID')) {
        tokenRef.current = null
        setState('invalid')
      } else if (hasErrorCode(err, 'VALIDATION_ERROR')) {
        setPwError(`Use ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters.`)
      } else {
        // Network / 5xx: keep the form, the link may still be valid.
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPageLayout noReferrer>
      {state === 'invalid' && (
        <StatusCard icon="link_off" tone="error" title="Link invalid"
          body="This reset link is invalid, expired, or has already been used.">
          {/* Opens the auth popup on the forgot-password flow */}
          <Link to="/?forgot=1" className={primaryLinkClass}>Request a new code</Link>
          <Link to="/?login=1" className={secondaryLinkClass}>Back to login</Link>
        </StatusCard>
      )}

      {state === 'success' && (
        <StatusCard icon="check_circle" tone="success" title="Password reset successfully"
          body="You can now log in with your new password.">
          <Link to="/?login=1" className={primaryLinkClass}>Log in</Link>
        </StatusCard>
      )}

      {state === 'form' && (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
              <Icon name="password" className="text-3xl" />
            </div>
            <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
              Choose a new password
            </h1>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <AuthField
                label="New password"
                type={showPassword ? 'text' : 'password'}
                name="new-password"
                autoComplete="new-password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                autoFocus
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => { setPassword(e.target.value); setPwError('') }}
                error={passwordError || undefined}
                trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword(v => !v)} />}
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <AuthField
              label="Confirm new password"
              type={showPassword ? 'text' : 'password'}
              name="confirm-password"
              autoComplete="new-password"
              required
              maxLength={PASSWORD_MAX_LENGTH}
              placeholder="••••••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              error={mismatch ? 'Passwords do not match.' : undefined}
            />

            {formError && <p role="alert" className="text-error text-xs font-medium px-1">{formError}</p>}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full py-3.5 font-headline disabled:opacity-60 disabled:cursor-wait disabled:scale-100"
              >
                {submitting ? 'Resetting…' : 'Reset password'}
              </Button>
            </div>
          </form>
        </>
      )}
    </AuthPageLayout>
  )
}
