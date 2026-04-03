import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AuthResponse, AuthStep } from '@/types'
import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { ModalSidebar } from './ModalSidebar'
import { SignUpForm } from './SignUpForm'
import { LoginForm } from './LoginForm'
import { OtpForm } from './OtpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { CloseButton } from '@/components/ui/CloseButton'

export function AuthModal() {
  const { isOpen, activeTab, closeModal, setActiveTab } = useModal()
  const { setUser } = useAuth()

  const [step, setStep] = useState<AuthStep>('form')
  const [pendingEmail, setPendingEmail] = useState('')
  const [pendingUser, setPendingUser] = useState<AuthResponse['user']>(undefined)

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

  const handleSignUpSuccess = (response: AuthResponse) => {
    if (response.user?.email) setPendingEmail(response.user.email)
    setPendingUser(response.user)
    setStep('otp')
  }

  const handleLoginSuccess = (response: AuthResponse) => {
    if (response.user) setUser(response.user)
    closeModal()
  }

  const handleOtpSuccess = () => {
    if (pendingUser) setUser(pendingUser)
    closeModal()
  }

  const isOtpStep    = step === 'otp'
  const isForgotStep = step === 'forgot'
  const isFullWidth  = isOtpStep || isForgotStep

  const tabs = [
    { id: 'login' as const, label: 'Login' },
    { id: 'signup' as const, label: 'Sign Up' },
  ]

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4 md:p-8"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-xl shadow-[0_40px_80px_rgba(25,28,29,0.12)] overflow-hidden flex flex-col md:flex-row border border-outline-variant/10 relative">

        {/* Branding sidebar — hidden on OTP/forgot steps */}
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
          ) : (
            <>
              {/* Tab nav */}
              <div className="flex gap-8 mb-10 border-b border-surface-container-high">
                {tabs.map((tab) => (
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
                <SignUpForm onSuccess={handleSignUpSuccess} />
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
    document.body
  )
}
