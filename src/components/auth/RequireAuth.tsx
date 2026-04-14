/**
 * Route guard components.
 *
 * RequireAuth — wraps protected pages (dashboard, profile, etc.).
 *   - While session is restoring: shows a spinner (avoids redirect flash).
 *   - Not authenticated after restore: redirects to home and opens login modal.
 *   - Authenticated: renders children normally.
 *
 * RedirectIfAuthed — wraps auth-only paths (unused here since auth uses a modal,
 *   but exported for future standalone auth pages).
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'

// ── Spinner ───────────────────────────────────────────────────────────────────

function CentredSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── RequireAuth ───────────────────────────────────────────────────────────────

interface RequireAuthProps {
  children: React.ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, isLoading } = useAuth()
  const { openModal }       = useModal()
  const navigate            = useNavigate()

  useEffect(() => {
    // Only redirect after the session restore attempt finishes
    if (!isLoading && !user) {
      navigate('/', { replace: true })
      // Give React Router a tick to complete the navigation, then open login
      setTimeout(() => openModal('login'), 50)
    }
  }, [isLoading, user, navigate, openModal])

  // Show spinner while session restore is in flight
  if (isLoading) return <CentredSpinner />

  // Not authenticated: return null — the useEffect above is redirecting
  if (!user) return null

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
