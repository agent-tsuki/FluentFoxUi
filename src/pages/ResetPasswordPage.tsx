/**
 * ResetPasswordPage — /reset-password?token=… (password reset guide §4.3).
 *
 *  - The token is read and stripped from the address bar in a layout effect,
 *    before the first paint, and kept in a ref only (never storage or logs).
 *  - Success: the backend revoked every session, so clear all local auth state
 *    and tell other tabs (no logout call needed), then open the login modal
 *    with a "Password updated" banner. There is no auto-login.
 *  - Errors are never 401s, so they never trigger refresh/logout.
 */

import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '@/api/services/authService'
import { hasErrorCode, resolveErrorMessage } from '@/api/errors'
import { expireSession } from '@/api/session'
import { useAuth } from '@/context/AuthContext'
import { SUPPORT_EMAIL } from '@/lib/config'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/passwordStrength'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { AuthField, PasswordToggle } from '@/components/sections/AuthModal/AuthField'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'
import {
  AuthPageLayout,
  StatusCard,
  SupportLink,
  primaryLinkClass,
  secondaryLinkClass,
} from '@/components/auth/AuthPageLayout'

type ResetState = 'init' | 'form' | 'invalid' | 'expired' | 'suspended' | 'deleted'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const { showNotice } = useAuth()

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
      tokenRef.current = null
      // Signed out everywhere by the backend: clear this browser and other tabs.
      expireSession()
      showNotice('Password updated. Please log in with your new password.', 'success')
      navigate('/?login=1', { replace: true })
    } catch (err) {
      if (hasErrorCode(err, 'RESET_TOKEN_EXPIRED'))      setState('expired')
      else if (hasErrorCode(err, 'RESET_TOKEN_INVALID')) setState('invalid')
      else if (hasErrorCode(err, 'ACCOUNT_SUSPENDED'))   setState('suspended')
      else if (hasErrorCode(err, 'ACCOUNT_DELETED'))     setState('deleted')
      else if (hasErrorCode(err, 'VALIDATION_ERROR'))    setPwError(`Use ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters.`)
      else setFormError(resolveErrorMessage(err)) // 500: keep the form, the link is still valid
    } finally {
      setSubmitting(false)
    }
  }

  const newLinkActions = (
    <>
      <Link to="/forgot-password" className={primaryLinkClass}>Send a new link</Link>
      <Link to="/?login=1" className={secondaryLinkClass}>Back to login</Link>
    </>
  )

  return (
    <AuthPageLayout noReferrer>
      {state === 'expired' && (
        <StatusCard icon="link_off" tone="warning" title="Link expired"
          body="This link has expired. Request a new one.">
          {newLinkActions}
        </StatusCard>
      )}

      {state === 'invalid' && (
        <StatusCard icon="error" tone="error" title="Link invalid"
          body="This link is invalid or has already been used.">
          {newLinkActions}
        </StatusCard>
      )}

      {(state === 'suspended' || state === 'deleted') && (
        <StatusCard
          icon="block"
          tone="error"
          title={state === 'suspended' ? 'Account suspended' : 'Account deleted'}
          body={
            <>
              {state === 'suspended'
                ? 'Your account is suspended. Please contact support.'
                : 'This account has been deleted. Please contact support.'}
              <span className="mt-2 block">
                <SupportLink email={SUPPORT_EMAIL} />
              </span>
            </>
          }
        >
          <Link to="/" className={secondaryLinkClass}>Back to home</Link>
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
              label="Confirm password"
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
                {submitting ? 'Updating…' : 'Set new password'}
              </Button>
            </div>
          </form>
        </>
      )}
    </AuthPageLayout>
  )
}
