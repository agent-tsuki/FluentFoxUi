/**
 * Route guard components.
 *
 * RequireAuth — wraps protected pages (dashboard, profile, etc.).
 *   - While session is restoring: shows a spinner (avoids redirect flash).
 *   - Not authenticated after restore: opens the login modal immediately and
 *     remembers the intended task. Protected learning routes stay visible
 *     behind the popup, so there is no extra sign-in screen or second click.
 *   - Authenticated but email unverified: redirects to /verify-email
 *     (auth guide §5), unless `allowUnverified` is set (the verify screen itself).
 *     With `allowUnverified`, a verified user is sent on to /dashboard.
 *   - Authenticated: renders children normally.
 *
 * RedirectIfAuthed — wraps auth-only paths (unused here since auth uses a modal,
 *   but exported for future standalone auth pages).
 */

import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { SignInPrompt } from '@/components/auth/SignInPrompt'

// ── Spinner ───────────────────────────────────────────────────────────────────

function CentredSpinner() {
  return (
    <div className="flex items-center justify-center min-h-dvh">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── RequireAuth ───────────────────────────────────────────────────────────────

interface RequireAuthProps {
  children: React.ReactNode
  /** For the verify-email screen: only unverified users belong there. */
  allowUnverified?: boolean
  /**
   * Show the sign-in prompt in place (guests) instead of redirecting home.
   * After login the page itself renders, so the learner lands where they aimed.
   * 'inline' for a page inside a course layout, which already clears the navbar.
   */
  guestPrompt?: boolean | 'inline'
}

export function RequireAuth({ children, allowUnverified = false, guestPrompt = false }: RequireAuthProps) {
  const { user, isLoading } = useAuth()
  const { openModal }       = useModal()
  const navigate            = useNavigate()
  const { pathname, search, hash } = useLocation()
  const hasOpenedForGuest = useRef(false)

  useEffect(() => {
    // Only redirect after the session restore attempt finishes
    if (!isLoading && !user) {
      const returnTo = `${pathname}${search}${hash}`
      if (guestPrompt) {
        if (!hasOpenedForGuest.current) {
          hasOpenedForGuest.current = true
          openModal('login', { returnTo })
        }
        return
      }
      navigate('/', { replace: true })
      // Give React Router a tick to complete the navigation, then open login
      setTimeout(() => openModal('login', { returnTo }), 50)
      return
    }
    if (!isLoading && user) {
      if (!user.emailVerified && !allowUnverified) navigate('/verify-email', { replace: true })
      else if (user.emailVerified && allowUnverified) navigate('/dashboard', { replace: true })
    }
  }, [isLoading, user, allowUnverified, guestPrompt, navigate, openModal, pathname, search, hash])

  // Show spinner while session restore is in flight
  if (isLoading) return <CentredSpinner />

  if (!user && guestPrompt === 'inline') return <SignInPrompt variant="page" />
  if (!user && guestPrompt) return <main className="pt-nav"><SignInPrompt variant="page" /></main>

  // Not authenticated or on the wrong side of verification: the effect above is redirecting
  if (!user) return null
  if (user.emailVerified === allowUnverified) return null

  return <>{children}</>
}

// ── RedirectIfAuthed ──────────────────────────────────────────────────────────

export function RedirectIfAuthed({ children }: RequireAuthProps) {
  const { user, isLoading } = useAuth()
  const navigate            = useNavigate()

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoading, user, navigate])

  if (isLoading) return <CentredSpinner />
  if (user) return null

  return <>{children}</>
}
