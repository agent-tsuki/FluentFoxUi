import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { AuthStep } from '@/types'
import type { AuthUser } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/api/services/authService'
import { ModalSidebar, AUTH_PANEL_COPY, type AuthTab } from './ModalSidebar'
import { SocialAuthButtons } from './SocialAuthButtons'
import { ArcEdge } from './ArcEdge'
import { SignUpForm } from './SignUpForm'
import { ForgotPasswordFlow } from './ForgotPasswordFlow'
import {
  EMPTY_LOGIN_VALUES,
  EMPTY_SIGNUP_VALUES,
  type LoginValues,
  type SignUpValues,
} from './authFormValues'
import { LoginForm } from './LoginForm'
import { CloseButton } from '@/components/ui/CloseButton'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { resizeTransition, swapVariants } from '@/lib/motion'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useMeasuredHeight } from '@/hooks/useMeasuredHeight'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function AuthModal() {
  const { isOpen, activeTab, returnTo, forgotRequest, openModal, openForgotPassword, closeModal, setActiveTab } = useModal()
  const { user, setUser } = useAuth()

  const [step, setStep]                   = useState<AuthStep>('form')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const navigate = useNavigate()
  const { pathname, search, hash } = useLocation()
  // The navbar "Log in" opens the popup without a task: bring the learner back
  // to the page they were on, not the dashboard.
  const returnPath = returnTo ?? `${pathname}${search}${hash}`

  // Desktop popup: the card glides to its content's height when tabs/steps swap.
  // Phones use a full-screen scrolling page, so no height animation there.
  const isDesktop     = useMediaQuery('(min-width: 768px)')
  const reducedMotion = useReducedMotion()
  const { ref: contentRef, height: contentHeight } = useMeasuredHeight<HTMLDivElement>()
  const dialogRef = useRef<HTMLDivElement>(null)

  // ── Form values ───────────────────────────────────────────────────────────
  // Held here (not in the forms) so they survive Login ⇄ Sign Up switches.
  const [loginValues, setLoginValues]   = useState<LoginValues>(EMPTY_LOGIN_VALUES)
  const [signUpValues, setSignUpValues] = useState<SignUpValues>(EMPTY_SIGNUP_VALUES)

  const updateLoginValues = useCallback((patch: Partial<LoginValues>) => {
    setLoginValues(prev => ({ ...prev, ...patch }))
  }, [])
  const updateSignUpValues = useCallback((patch: Partial<SignUpValues>) => {
    setSignUpValues(prev => ({ ...prev, ...patch }))
  }, [])
  const resetFormValues = useCallback(() => {
    setLoginValues(EMPTY_LOGIN_VALUES)
    setSignUpValues(EMPTY_SIGNUP_VALUES)
  }, [])

  // Closing the popup (X, Escape, outside click, "Forgot password?") clears everything.
  useEffect(() => {
    if (!isOpen) resetFormValues()
  }, [isOpen, resetFormValues])

  // On a tab switch, carry the email across if the other tab's email is empty.
  // Runs only when the tab changes (never while typing), and never overwrites
  // an email already typed in that tab.
  const latestValues = useRef({ login: loginValues, signUp: signUpValues })
  useEffect(() => {
    latestValues.current = { login: loginValues, signUp: signUpValues }
  }, [loginValues, signUpValues])
  useEffect(() => {
    const { login, signUp } = latestValues.current
    if (activeTab === 'login' && !login.email && signUp.email) {
      setLoginValues(prev => ({ ...prev, email: signUp.email }))
    } else if (activeTab === 'signup' && !signUp.email && login.email) {
      setSignUpValues(prev => ({ ...prev, email: login.email }))
    }
  }, [activeTab])

  // Reset to form step whenever modal opens or tab changes
  // (or to the forgot-password flow when that is what was requested)
  useEffect(() => {
    if (isOpen) setStep(forgotRequest ? 'forgot' : 'form')
  }, [isOpen, activeTab, forgotRequest])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeModal()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeModal])

  // Keep keyboard focus inside the popup and return it to the button that
  // opened it. The popup is portal-based for its animation, so this behaviour
  // is implemented here instead of relying on DOM nesting.
  useEffect(() => {
    if (!isOpen) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const getFocusable = () =>
      [...(dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [])].filter((element) => !element.hasAttribute('hidden') && element.getClientRects().length > 0)
    const focusInitial = window.requestAnimationFrame(() => {
      const firstField = dialogRef.current?.querySelector<HTMLElement>('input[type="email"]')
      ;(firstField ?? getFocusable()[0])?.focus()
    })
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', trapFocus)
    return () => {
      window.cancelAnimationFrame(focusInitial)
      window.removeEventListener('keydown', trapFocus)
      if (opener?.isConnected) opener.focus()
    }
  }, [isOpen])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Both entry points (desktop sidebar sheet and mobile screen) use this one
  // backend-owned OAuth navigation. No provider token is handled in React.
  const handleGoogle = useCallback(() => {
    authService.startGoogleOAuth(returnPath)
  }, [returnPath])
  const handleX = useCallback(() => {
    authService.startXOAuth(returnPath)
  }, [returnPath])

  if (!isOpen) return null

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Login or signup (auto-login) succeeded. Unverified users go to the
  // "Verify your email" screen instead of into the app (auth guide §5).
  const handleAuthenticated = (user: AuthUser) => {
    const destination = returnTo
    setUser(user)
    closeModal() // closing also clears the form values
    if (!user.emailVerified) {
      const suffix = destination ? `?returnTo=${encodeURIComponent(destination)}` : ''
      navigate(`/verify-email${suffix}`)
    } else if (destination) {
      navigate(destination, { replace: true })
    }
  }

  // Account created but auto-login failed → show "check your inbox".
  const handleRegisteredOnly = (email: string) => {
    // Account exists now: drop the sign-up values, keep the email ready for login.
    resetFormValues()
    setLoginValues({ ...EMPTY_LOGIN_VALUES, email })
    setRegisteredEmail(email)
    setStep('registered')
  }

  // ── Layout helpers ────────────────────────────────────────────────────────

  const isRegisteredStep = step === 'registered'
  const isForgotStep     = step === 'forgot' && forgotRequest !== null
  const isFullWidth      = isRegisteredStep || isForgotStep

  const tabs = [
    { id: 'login'  as const, label: 'Login'   },
    { id: 'signup' as const, label: 'Sign Up' },
  ]

  // Phones: full-screen, scrollable page (orange header + rising surface).
  // md and up: centered popup with the branding sidebar.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm md:flex md:items-center md:justify-center md:p-8"
      onClick={e => e.target === e.currentTarget && closeModal()}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        initial={false}
        animate={{ height: isDesktop && contentHeight !== undefined ? contentHeight : '100%' }}
        transition={isDesktop && !reducedMotion ? resizeTransition : { duration: 0 }}
        className={cn(
          'relative w-full overflow-y-auto overscroll-contain bg-surface-container-lowest',
          'md:overflow-hidden md:rounded-2xl md:ring-1 md:ring-outline-variant/50 md:shadow-elevation-3',
          // One width for both tabs, so switching never resizes sideways.
          isFullWidth ? 'md:max-w-2xl' : 'md:max-w-3xl',
        )}
      >
        {/* Natural-height content; its measured height drives the card height on desktop */}
        <div ref={contentRef} className="flex min-h-full flex-col md:min-h-0 md:flex-row">

          {/* Phone header — the orange panel, compacted */}
          {!isFullWidth && <MobileHeader tab={activeTab} />}

          {/* Branding sidebar with the social sheet — md and up, hidden on full-width steps */}
          {!isFullWidth && <ModalSidebar tab={activeTab} onGoogle={handleGoogle} onX={handleX} />}

          {/* Form panel — on phones it rises over the header with an arc top */}
          <div
            className={cn(
              'relative flex-1 bg-surface-container-lowest md:max-h-[90vh] md:overflow-y-auto',
              isFullWidth
                ? 'px-6 pb-10 pt-16 md:p-10'
                : 'px-6 pb-10 pt-2 max-md:animate-sheet-rise md:p-12',
            )}
          >
            <h2 id="auth-dialog-title" className="sr-only">
              {activeTab === 'signup' ? 'Create your FoxSensei account' : 'Log in to FoxSensei'}
            </h2>
            {!isFullWidth && (
              <ArcEdge fillClassName="fill-surface-container-lowest" className="h-8 md:hidden" />
            )}

            {isForgotStep ? (
              <ForgotPasswordFlow
                key={forgotRequest.id}
                initialEmail={forgotRequest.email}
                autoSend={forgotRequest.autoSend}
                // Signed in (e.g. started from Settings): just close. Otherwise back to Login.
                onExit={user ? closeModal : () => openModal('login', { returnTo: returnTo ?? undefined })}
                exitLabel={user ? 'Close' : 'Back to login'}
              />

            ) : isRegisteredStep ? (
              <RegisteredStep
                email={registeredEmail}
                onClose={closeModal}
                onLogin={() => { setActiveTab('login'); setStep('form') }}
              />

            ) : (
              <>
                {/* Tab nav */}
                <div className="flex gap-8 mb-8 md:mb-10 border-b border-surface-container-high">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-4 text-sm font-headline font-bold tracking-tight transition-colors ${
                        activeTab === tab.id
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Phones: social first, so it is visible without scrolling */}
                <div className="md:hidden mb-6 space-y-6">
                  <SocialAuthButtons onGoogle={handleGoogle} onX={handleX} />
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-surface-container-high" />
                    <span className="flex-shrink mx-4 text-2xs text-outline font-bold uppercase tracking-widest">
                      or use email
                    </span>
                    <div className="flex-grow border-t border-surface-container-high" />
                  </div>
                </div>

                {/* Old form fades out, card resizes, new form fades in */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeTab}
                    variants={reducedMotion ? undefined : swapVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {activeTab === 'signup' ? (
                      <SignUpForm
                        onSuccess={handleAuthenticated}
                        onRegisteredOnly={handleRegisteredOnly}
                        onGoToLogin={() => setActiveTab('login')}
                        values={signUpValues}
                        onChange={updateSignUpValues}
                      />
                    ) : (
                      <LoginForm
                        onSuccess={handleAuthenticated}
                        values={loginValues}
                        onChange={updateLoginValues}
                        onForgotPassword={email => openForgotPassword({ email })}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </div>
        </div>

        {/* Close button — pinned on phones so it stays reachable while scrolling */}
        <div className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 md:absolute md:right-4 md:top-4">
          <CloseButton onClick={closeModal} variant="floating" />
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}

// ── Phone header ──────────────────────────────────────────────────────────────

/** Compact version of the orange branding panel, shown above the form on phones. */
function MobileHeader({ tab }: { tab: AuthTab }) {
  const copy = AUTH_PANEL_COPY[tab]
  return (
    <div className="md:hidden shrink-0 bg-primary px-6 pb-14 pt-[max(1.5rem,env(safe-area-inset-top))] text-on-primary">
      <div className="text-xl font-headline font-extrabold tracking-tighter mb-6">
        FoxSensei
      </div>
      <h2 className="text-2xl font-headline font-bold leading-tight italic mb-2">
        {copy.headline}
      </h2>
      <p className="text-on-primary/80 text-sm leading-relaxed">{copy.shortBody}</p>
    </div>
  )
}

// ── "Check your email" confirmation step ──────────────────────────────────────

interface RegisteredStepProps {
  email:   string
  onClose: () => void
  onLogin: () => void
}

function RegisteredStep({ email, onClose, onLogin }: RegisteredStepProps) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon name="mark_email_read" className="text-3xl text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
          Check your inbox
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
          We sent a verification link to{' '}
          <span className="font-bold text-on-surface break-all">{email || 'your email'}</span>.
          Click it, then log in to continue.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          type="button"
          variant="primary"
          onClick={onLogin}
          className="w-full py-3.5 font-headline"
        >
          Go to Login
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="w-full text-sm text-on-surface-variant hover:text-on-surface transition-colors py-2"
        >
          Close
        </button>
      </div>
    </div>
  )
}
