import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AuthStep } from '@/types'
import type { AuthUser } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { ModalSidebar } from './ModalSidebar'
import { SignUpForm } from './SignUpForm'
import { LoginForm } from './LoginForm'
import { OtpForm } from './OtpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { CloseButton } from '@/components/ui/CloseButton'
import { Icon } from '@/components/ui/Icon'

export function AuthModal() {
  const { isOpen, activeTab, closeModal, setActiveTab } = useModal()
  const { setUser } = useAuth()

  const [step, setStep]                   = useState<AuthStep>('form')
  const [pendingEmail]                    = useState('')   // reserved for OTP step
  const [registeredMsg, setRegisteredMsg] = useState('')

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

  if (!isOpen) return null

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLoginSuccess = (user: AuthUser) => {
    setUser(user)
    closeModal()
  }

  // Register returned a server message → show "check your email" step
  const handleRegisterSuccess = (message: string) => {
    setRegisteredMsg(message)
    setStep('registered')
  }

  const handleOtpSuccess = () => {
    closeModal()
  }

  // ── Layout helpers ────────────────────────────────────────────────────────

  const isOtpStep        = step === 'otp'
  const isForgotStep     = step === 'forgot'
  const isRegisteredStep = step === 'registered'
  const isFullWidth      = isOtpStep || isForgotStep || isRegisteredStep

  const tabs = [
    { id: 'login'  as const, label: 'Login'   },
    { id: 'signup' as const, label: 'Sign Up' },
  ]

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4 md:p-8"
      onClick={e => e.target === e.currentTarget && closeModal()}
    >
      <div className={`bg-surface-container-lowest w-full rounded-xl shadow-[0_40px_80px_rgba(25,28,29,0.12)] overflow-hidden flex flex-col md:flex-row border border-outline-variant/10 relative transition-[max-width] duration-200 ${
            activeTab === 'signup' && !isFullWidth ? 'max-w-3xl' : 'max-w-2xl'
          }`}>

        {/* Branding sidebar — hidden on full-width steps */}
        {!isFullWidth && <ModalSidebar />}

        {/* Form panel */}
        <div className={`flex-1 overflow-y-auto max-h-[90vh] relative ${isFullWidth ? 'p-10' : 'p-8 md:p-12'}`}>

          {isOtpStep ? (
            <OtpForm
              email={pendingEmail}
              onSuccess={handleOtpSuccess}
              onBack={() => setStep('form')}
            />

          ) : isForgotStep ? (
            <ForgotPasswordForm onBack={() => setStep('form')} />

          ) : isRegisteredStep ? (
            <RegisteredStep
              message={registeredMsg}
              onClose={closeModal}
              onLogin={() => { setActiveTab('login'); setStep('form') }}
            />

          ) : (
            <>
              {/* Tab nav */}
              <div className="flex gap-8 mb-10 border-b border-surface-container-high">
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

              {activeTab === 'signup' ? (
                <SignUpForm onSuccess={handleRegisterSuccess} />
              ) : (
                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onForgotPassword={() => setStep('forgot')}
                />
              )}
            </>
          )}
        </div>

        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <CloseButton onClick={closeModal} />
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ── "Check your email" confirmation step ──────────────────────────────────────

interface RegisteredStepProps {
  message: string
  onClose: () => void
  onLogin: () => void
}

function RegisteredStep({ message, onClose, onLogin }: RegisteredStepProps) {
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
          {message || 'Registration successful. Check your email to verify your account before logging in.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={onLogin}
          className="w-full bg-primary text-on-primary font-headline font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Go to Login
        </button>
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
