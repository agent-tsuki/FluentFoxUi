/**
 * Google OAuth landing page.
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
  oauth_cancelled:             'Google sign-in was cancelled. You can try again whenever you are ready.',
  oauth_account_link_required: 'An account already exists for this email. Please sign in with your password first.',
  oauth_email_not_verified:    'Google has not verified this email address. Use another Google account or verify that email first.',
  oauth_unavailable:           'Google sign-in is not configured yet. Please try again later or use your password.',
  oauth_failed:                'Google sign-in could not be completed. Please try again.',
}

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [state, setState] = useState<CallbackState>({ kind: 'loading' })
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const params = new URLSearchParams(window.location.hash.slice(1))
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
        const result = await authService.completeGoogleOAuth(code)
        setUser(result.user)
        navigate(result.user.emailVerified ? result.returnTo : '/verify-email', { replace: true })
      } catch (error) {
        setState({ kind: 'error', message: resolveErrorMessage(error) })
      }
    })()
  }, [navigate, setUser])

  return (
    <AuthPageLayout noReferrer>
      {state.kind === 'loading' && (
        <StatusCard
          icon="account_circle"
          tone="primary"
          pulse
          title="Signing you in…"
          body="Securely finishing your Google sign-in."
        />
      )}

      {state.kind === 'error' && (
        <StatusCard
          icon="error"
          tone="error"
          title="Google sign-in didn't finish"
          body={state.message}
        >
          <Link to="/?login=1" className={primaryLinkClass}>Sign in with email</Link>
          <Link to="/" className={secondaryLinkClass}>Back to home</Link>
        </StatusCard>
      )}
    </AuthPageLayout>
  )
}
