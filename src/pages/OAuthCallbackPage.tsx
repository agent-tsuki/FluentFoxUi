/**
 * Social OAuth landing page.
 *
 * The backend returns a short-lived, one-use application hand-off code in the
 * URL fragment. Fragments are not sent in HTTP requests; we remove it before
 * exchanging it, then create the app's normal session.
 */

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthPageLayout, StatusCard, primaryLinkClass, secondaryLinkClass } from '@/components/auth/AuthPageLayout'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/api/services/authService'
import { resolveErrorMessage } from '@/api/errors'

type CallbackState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }

const CALLBACK_ERRORS: Record<string, string> = {
  oauth_cancelled:             'Sign-in was cancelled. You can try again whenever you are ready.',
  oauth_account_link_required: 'An account already uses this email. Sign in with your password, then connect Google from Security settings.',
  oauth_provider_already_linked: 'Your FoxSensei account is already connected to a different account from this provider. Sign in with that one instead.',
  account_suspended:           'Your account is suspended. Please contact support.',
  account_deleted:             'This account has been deleted. Please contact support.',
  oauth_email_not_verified:    'Google has not verified this email address. Use another Google account or verify that email first.',
  oauth_unavailable:           'Google sign-in is not configured yet. Please try again later or use your password.',
  oauth_failed:                'Google sign-in could not be completed. Please try again.',
  oauth_x_account_link_required: 'An account already uses this email. Sign in with email, then connect X from Security settings.',
  oauth_x_email_missing:         "X didn't share a verified email for this account. Add and verify an email on X, or sign up with email.",
  oauth_x_unavailable:           'X sign-in is not configured yet. Please try again later or use your password.',
  oauth_x_failed:                'X sign-in could not be completed. Please try again.',
}

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [state, setState] = useState<CallbackState>({ kind: 'loading' })
  const [providerName, setProviderName] = useState('Google')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const params = new URLSearchParams(window.location.hash.slice(1))
    const isX = params.get('provider') === 'x'
    setProviderName(isX ? 'X' : 'Google')
    // Remove the one-time code before the network request and before rendering
    // any user-controlled data. This also protects against accidental copying.
    window.history.replaceState({}, document.title, window.location.pathname)

    const providerError = params.get('error')
    if (providerError) {
      setState({ kind: 'error', message: CALLBACK_ERRORS[providerError] ?? CALLBACK_ERRORS.oauth_failed })
      return
    }

    const code = params.get('code')
    if (!code) {
      setState({ kind: 'error', message: CALLBACK_ERRORS.oauth_failed })
      return
    }

    void (async () => {
      try {
        const result = isX
          ? await authService.completeXOAuth(code)
          : await authService.completeGoogleOAuth(code)
        setUser(result.user)
        navigate(result.user.emailVerified ? result.returnTo : '/verify-email', { replace: true })
      } catch (error) {
        setState({ kind: 'error', message: resolveErrorMessage(error) })
      }
    })()
  }, [navigate, setUser])

  // A successful sign-in should feel like Google returned straight to the app,
  // so the brief code exchange shows a blank surface instead of a status page.
  if (state.kind === 'loading') {
    return <div className="min-h-dvh bg-surface" aria-busy="true" />
  }

  return (
    <AuthPageLayout noReferrer>
      <StatusCard
        icon="error"
        tone="error"
        title={`${providerName} sign-in didn't finish`}
        body={state.message}
      >
        <Link to="/?login=1" className={primaryLinkClass}>Sign in with email</Link>
        <Link to="/" className={secondaryLinkClass}>Back to home</Link>
      </StatusCard>
    </AuthPageLayout>
  )
}
