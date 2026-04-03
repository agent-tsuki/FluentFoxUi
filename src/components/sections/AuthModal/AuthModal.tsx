import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AuthResponse, AuthStep } from '@/types'
import { useModal } from '@/context/ModalContext'
import { useAuth } from '@/context/AuthContext'
import { ModalSidebar } from './ModalSidebar'
import { SignUpForm } from './SignUpForm'
import { LoginForm } from './LoginForm'
import { OtpForm } from './OtpForm'
import { CloseButton } from '@/components/ui/CloseButton'

export function AuthModal() {
  const { isOpen, activeTab, closeModal, setActiveTab } = useModal()
  const { setUser } = useAuth()

  // OTP step state — local to the modal lifecycle
  const [step, setStep] = useState<AuthStep>('form')
  const [pendingEmail, setPendingEmail] = useState('')
  const [pendingUser, setPendingUser] = useState<AuthResponse['user']>(undefined)

  // Reset to form step whenever modal opens/tab changes
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

  // Called by SignUpForm after successful submission → switch to OTP step
  const handleSignUpSuccess = (response: AuthResponse) => {
    if (response.user?.email) {
      setPendingEmail(response.user.email)
    }
    setPendingUser(response.user)
    setStep('otp')
  }

  // Called by LoginForm after successful login → close modal
  const handleLoginSuccess = (response: AuthResponse) => {
    if (response.user) setUser(response.user)
    closeModal()
  }

  // Called by OtpForm "Verify & Join" success → close modal
  const handleOtpSuccess = () => {
    if (pendingUser) setUser(pendingUser)
    closeModal()
  }

  const isOtpStep = step === 'otp'

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

        {/* Branding sidebar — hide on OTP step (compact, centred layout) */}
        {!isOtpStep && <ModalSidebar />}

        {/* Form panel */}
        <div className={`flex-1 overflow-y-auto max-h-[90vh] relative ${isOtpStep ? 'p-10' : 'p-8 md:p-12'}`}>
          {isOtpStep ? (
            // ── OTP view ──────────────────────────────────────────────────
            <OtpForm
              email={pendingEmail}
              onSuccess={handleOtpSuccess}
              onBack={() => setStep('form')}
            />
          ) : (
            // ── Login / Sign Up view ───────────────────────────────────────
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
                <LoginForm onSuccess={handleLoginSuccess} />
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
