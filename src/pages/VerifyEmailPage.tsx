/**
 * VerifyEmailPage — handles the email link clicked after signup.
 *
 * URL shape: /verify?token=<opaque-token>
 *
 * Flow:
 *  1. Extract ?token= from URL on mount.
 *  2. POST /auth/verify with the token.
 *  3a. If backend returns tokens → user is auto-logged in → redirect to /dashboard.
 *  3b. If backend returns only a message → show success → redirect to login modal.
 *  4. Show clear error states for every failure mode.
 *
 * This is a standalone page (not inside the AuthModal) because the user
 * arrives here from an email client, likely in a fresh tab.
 */

import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { authService } from '@/api/services/authService'
import { ApiError } from '@/api/errors'
import { useAuth } from '@/context/AuthContext'
import { Icon } from '@/components/ui/Icon'
import { FoxLogo } from '@/components/layout/Navbar/FoxLogo'

// ── State machine ─────────────────────────────────────────────────────────────

type VerifyState =
  | 'loading'
  | 'success_logged_in'   // verified + tokens returned → auto-login
  | 'success_check_login' // verified, no tokens → go login manually
  | 'expired'             // 410 TOKEN_EXPIRED
  | 'already_verified'    // 409 OPERATION_ALREADY_PERFORMED
  | 'invalid'             // 404 / bad token / missing token

// ── Page ─────────────────────────────────────────────────────────────────────

export function VerifyEmailPage() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const { setUser }     = useAuth()
  const [state, setState] = useState<VerifyState>('loading')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setState('invalid')
      return
    }

    authService
      .verifyEmailToken(token)
      .then(({ loggedIn, user, message: _ }) => {
        if (loggedIn && user) {
          setUser(user)
          setState('success_logged_in')
          // Give the user a moment to read the success message
          setTimeout(() => navigate('/dashboard', { replace: true }), 2500)
        } else {
          setState('success_check_login')
        }
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          if (
            err.errorCode === 'TOKEN_EXPIRED' ||
            err.errorCode === 'INVALID_TOKEN' ||
            err.httpStatus === 410
          ) {
            setState('expired')
          } else if (
            err.errorCode === 'OPERATION_ALREADY_PERFORMED' ||
            err.httpStatus === 409
          ) {
            setState('already_verified')
          } else {
            setState('invalid')
          }
        } else {
          setState('invalid')
        }
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link to="/" className="flex items-end gap-0 mb-12">
        <FoxLogo size={44} />
        <span className="text-3xl font-bold tracking-tighter font-headline bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
          FoxSensei
        </span>
      </Link>

      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-[0_32px_64px_rgba(25,28,29,0.10)] border border-outline-variant/10 p-10 text-center">
        {state === 'loading' && <LoadingState />}
        {state === 'success_logged_in' && <SuccessLoggedInState />}
        {state === 'success_check_login' && <SuccessCheckLoginState />}
        {state === 'expired' && <ExpiredState />}
        {state === 'already_verified' && <AlreadyVerifiedState />}
        {state === 'invalid' && <InvalidState />}
      </div>

      <p className="mt-8 text-xs text-on-surface-variant/60">
        FoxSensei · Japanese Learning Platform
      </p>
    </div>
  )
}

// ── State components ──────────────────────────────────────────────────────────

function IconRing({ name, color }: { name: string; color: string }) {
  return (
    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${color}`}>
      <Icon name={name} className="text-3xl" filled />
    </div>
  )
}

function LoadingState() {
  return (
    <div className="py-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
        <Icon name="mark_email_unread" className="text-3xl text-primary" />
      </div>
      <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-3">
        Verifying your email…
      </h1>
      <p className="text-sm text-on-surface-variant">
        Just a moment while we confirm your address.
      </p>
    </div>
  )
}

function SuccessLoggedInState() {
  return (
    <div className="py-4">
      <IconRing name="verified" color="bg-green-500/10 text-green-500" />
      <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-3">
        Email Verified!
      </h1>
      <p className="text-sm text-on-surface-variant mb-8">
        You're all set. Taking you to your dashboard now…
      </p>
      <div className="flex justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}

function SuccessCheckLoginState() {
  return (
    <div className="py-4">
      <IconRing name="mark_email_read" color="bg-primary/10 text-primary" />
      <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-3">
        Email Verified!
      </h1>
      <p className="text-sm text-on-surface-variant mb-8">
        Your account is confirmed. You can now sign in and start learning.
      </p>
      <Link
        to="/?login=1"
        className="inline-block w-full bg-primary text-on-primary font-headline font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        Go to Login
      </Link>
    </div>
  )
}

function ExpiredState() {
  return (
    <div className="py-4">
      <IconRing name="link_off" color="bg-amber-400/10 text-amber-500" />
      <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-3">
        Link Expired
      </h1>
      <p className="text-sm text-on-surface-variant mb-8">
        This verification link has expired. Verification links are valid for 24 hours.
        Sign up again to receive a new link.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          to="/?signup=1"
          className="inline-block w-full bg-primary text-on-primary font-headline font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Sign Up Again
        </Link>
        <Link
          to="/"
          className="text-sm text-on-surface-variant hover:text-on-surface transition-colors py-2"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

function AlreadyVerifiedState() {
  return (
    <div className="py-4">
      <IconRing name="check_circle" color="bg-green-500/10 text-green-500" />
      <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-3">
        Already Verified
      </h1>
      <p className="text-sm text-on-surface-variant mb-8">
        Your email address has already been verified. You can sign in right now.
      </p>
      <Link
        to="/?login=1"
        className="inline-block w-full bg-primary text-on-primary font-headline font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        Go to Login
      </Link>
    </div>
  )
}

function InvalidState() {
  return (
    <div className="py-4">
      <IconRing name="error" color="bg-error/10 text-error" />
      <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-3">
        Invalid Link
      </h1>
      <p className="text-sm text-on-surface-variant mb-8">
        This verification link is invalid or has already been used.
        Check your inbox for the most recent email from us.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          to="/"
          className="inline-block w-full bg-primary text-on-primary font-headline font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Back to Home
        </Link>
        <Link
          to="/?login=1"
          className="text-sm text-on-surface-variant hover:text-on-surface transition-colors py-2"
        >
          Try Logging In
        </Link>
      </div>
    </div>
  )
}
