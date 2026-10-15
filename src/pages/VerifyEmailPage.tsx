/**
 * VerifyEmailPage — the link from the verification email: /verify?token=…
 *
 * Auth guide §5:
 *  1. Read the token, then remove it from the address bar immediately.
 *  2. POST /auth/verify once (the token is single-use; guarded against
 *     React StrictMode's double effect).
 *  3. Success: logged in on this browser → refresh (new access token carries
 *     email_verified) and enter the app. Otherwise → "verified, please log in".
 *  4. Expired / invalid link → offer a new link (resend needs a login).
 *
 * Standalone page (outside the Shell) because users arrive from an email client.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '@/api/services/authService'
import { hasErrorCode } from '@/api/errors'
import { hasStoredSession } from '@/api/session'
import { useAuth } from '@/context/AuthContext'
import {
  AuthPageLayout,
  StatusCard,
  primaryLinkClass as primaryLink,
  secondaryLinkClass as secondaryLink,
} from '@/components/auth/AuthPageLayout'

type VerifyState =
  | 'loading'
  | 'entering'          // verified + logged in here → going to the app
  | 'verified_login'    // verified, not logged in here
  | 'already_verified'  // 409: link already used
  | 'expired'           // 410 REQUEST_EXPIRED
  | 'invalid'           // 404 / 400 / missing token
  | 'error'             // network or server error — retry is safe

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const { refreshUser } = useAuth()
  const [state, setState] = useState<VerifyState>('loading')

  const tokenRef   = useRef<string | null>(null)
  const startedRef = useRef(false)

  const enterIfLoggedIn = async (fallback: VerifyState) => {
    if (!hasStoredSession()) { setState(fallback); return }
    try {
      const user = await refreshUser()
      if (user?.emailVerified) setState('entering')
      else setState(fallback)
    } catch {
      setState(fallback)
    }
  }

  const verify = async () => {
    const token = tokenRef.current
    if (!token) { setState('invalid'); return }
    setState('loading')
    try {
      await authService.verifyEmailToken(token)
      await enterIfLoggedIn('verified_login')
    } catch (err) {
      if (hasErrorCode(err, 'OPERATION_ALREADY_PERFORMED')) await enterIfLoggedIn('already_verified')
      else if (hasErrorCode(err, 'REQUEST_EXPIRED')) setState('expired')
      else if (hasErrorCode(err, 'RESOURCE_NOT_FOUND', 'BAD_REQUEST')) setState('invalid')
      else setState('error')
    }
  }

  // Read the token once and strip it from the URL before the first paint.
  useLayoutEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    tokenRef.current = searchParams.get('token')
    navigate('/verify', { replace: true })
    void verify()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Verified and logged in: continue into the app after a short confirmation.
  useEffect(() => {
    if (state !== 'entering') return
    const id = window.setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
    return () => window.clearTimeout(id)
  }, [state, navigate])

  // Getting a new link needs a session: logged in → verify screen, else log in first.
  const newLinkAction = hasStoredSession()
    ? <Link to="/verify-email" className={primaryLink}>Send me a new link</Link>
    : <Link to="/?login=1" className={primaryLink}>Log in to get a new link</Link>

  return (
    <AuthPageLayout noReferrer>
      {state === 'loading' && (
        <StatusCard icon="mark_email_unread" tone="primary" pulse title="Verifying your email…"
          body="Just a moment while we confirm your address." />
      )}
      {state === 'entering' && (
        <StatusCard icon="verified" tone="success" title="Email verified!"
          body="You're all set. Taking you to your dashboard…">
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </StatusCard>
      )}
      {state === 'verified_login' && (
        <StatusCard icon="mark_email_read" tone="primary" title="Email verified!"
          body="Your account is confirmed. Please log in to start learning.">
          <Link to="/?login=1" className={primaryLink}>Log in</Link>
        </StatusCard>
      )}
      {state === 'already_verified' && (
        <StatusCard icon="check_circle" tone="success" title="Already verified"
          body="Your email address is already verified. You can log in right now.">
          <Link to="/?login=1" className={primaryLink}>Log in</Link>
        </StatusCard>
      )}
      {state === 'expired' && (
        <StatusCard icon="link_off" tone="warning" title="Link expired"
          body="This link has expired or a newer one was sent. Use the most recent email, or get a new link.">
          {newLinkAction}
          <Link to="/" className={secondaryLink}>Back to home</Link>
        </StatusCard>
      )}
      {state === 'invalid' && (
        <StatusCard icon="error" tone="error" title="Link invalid"
          body="This verification link is invalid or was already used. Request a new one.">
          {newLinkAction}
          <Link to="/" className={secondaryLink}>Back to home</Link>
        </StatusCard>
      )}
      {state === 'error' && (
        <StatusCard icon="cloud_off" tone="error" title="Couldn't verify right now"
          body="We couldn't reach the server. Check your connection and try again.">
          <button type="button" onClick={() => void verify()} className={primaryLink}>Try again</button>
          <Link to="/" className={secondaryLink}>Back to home</Link>
        </StatusCard>
      )}
    </AuthPageLayout>
  )
}
