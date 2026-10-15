import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { AuthStep } from '@/types'
import type { AuthUser } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { ModalSidebar, AUTH_PANEL_COPY, type AuthTab } from './ModalSidebar'
import { SocialAuthButtons } from './SocialAuthButtons'
import { ArcEdge } from './ArcEdge'
import { SignUpForm } from './SignUpForm'
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
  const { isOpen, activeTab, closeModal, setActiveTab } = useModal()
  const { setUser } = useAuth()

  const [step, setStep]                   = useState<AuthStep>('form')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const navigate = useNavigate()

  // Desktop popup: the card glides to its content's height when tabs/steps swap.
  // Phones use a full-screen scrolling page, so no height animation there.
  const isDesktop     = useMediaQuery('(min-width: 768px)')
  const reducedMotion = useReducedMotion()
  const { ref: contentRef, height: contentHeight } = useMeasuredHeight<HTMLDivElement>()

  // Reset to form step whenever modal opens or tab changes
  useEffect(() => {
    if (isOpen) setStep('form')
  }, [isOpen, activeTab])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeModal()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeModal])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Social OAuth is not wired to the backend yet. Both entry points (desktop
  // sidebar sheet, mobile screen) share these handlers so wiring happens once.
  const handleGoogle = useCallback(() => {}, [])
  const handleX      = useCallback(() => {}, [])

  if (!isOpen) return null

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Login or signup (auto-login) succeeded. Unverified users go to the
  // "Verify your email" screen instead of into the app (auth guide §5).
  const handleAuthenticated = (user: AuthUser) => {
    setUser(user)
    closeModal()
    if (!user.emailVerified) navigate('/verify-email')
  }

  // Account created but auto-login failed → show "check your inbox".
  const handleRegisteredOnly = (email: string) => {
    setRegisteredEmail(email)
    setStep('registered')
  }

  // ── Layout helpers ────────────────────────────────────────────────────────

  const isRegisteredStep = step === 'registered'
  const isFullWidth      = isRegisteredStep

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
        role="dialog"
        aria-modal="true"
        aria-label={activeTab === 'signup' ? 'Create your account' : 'Log in'}
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
            {!isFullWidth && (
              <ArcEdge fillClassName="fill-surface-container-lowest" className="h-8 md:hidden" />
            )}

            {isRegisteredStep ? (
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
                      />
                    ) : (
                      <LoginForm
                        onSuccess={handleAuthenticated}
                        onForgotPassword={email => {
                          closeModal()
                          // Router state, not the URL: keeps the email out of history.
                          navigate('/forgot-password', { state: { email } })
                        }}
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
