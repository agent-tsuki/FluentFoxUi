import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { AuthTab } from '@/types'

/** A request to show the forgot-password flow inside the auth popup. */
export interface ForgotPasswordRequest {
  /** Changes on every request so the flow restarts fresh. */
  id:        number
  /** Prefills the email (and is where the code goes when `autoSend` is set). */
  email:     string
  /** Send the code immediately and start on the code step (used by Settings). */
  autoSend:  boolean
}

export interface AuthModalOptions {
  /** Where a verified learner should continue after a successful sign-in. */
  returnTo?: string
}

function safeReturnTo(value: string | undefined): string | null {
  // Auth callbacks also validate this server-side. Keeping the client guard
  // prevents a UI caller from accidentally creating an external redirect.
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null
}

interface ModalContextValue {
  isOpen: boolean
  activeTab: AuthTab
  /** The protected task that opened the popup, when there is one. */
  returnTo: string | null
  /** Set while the popup shows the forgot-password flow instead of the tabs. */
  forgotRequest: ForgotPasswordRequest | null
  openModal: (tab?: AuthTab, options?: AuthModalOptions) => void
  /** Open the popup on the forgot-password flow. */
  openForgotPassword: (options?: { email?: string; autoSend?: boolean }) => void
  closeModal: () => void
  setActiveTab: (tab: AuthTab) => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<AuthTab>('signup')
  const [forgotRequest, setForgotRequest] = useState<ForgotPasswordRequest | null>(null)
  const [returnTo, setReturnTo] = useState<string | null>(null)
  const requestId = useRef(0)

  const openModal = useCallback((tab: AuthTab = 'signup', options?: AuthModalOptions) => {
    setForgotRequest(null)
    setReturnTo(safeReturnTo(options?.returnTo))
    setActiveTab(tab)
    setIsOpen(true)
  }, [])

  const openForgotPassword = useCallback((options?: { email?: string; autoSend?: boolean }) => {
    requestId.current += 1
    setForgotRequest({
      id:       requestId.current,
      email:    options?.email?.trim() ?? '',
      autoSend: Boolean(options?.autoSend && options.email?.trim()),
    })
    setActiveTab('login')
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setForgotRequest(null)
    setReturnTo(null)
  }, [])

  const value = useMemo(
    () => ({ isOpen, activeTab, returnTo, forgotRequest, openModal, openForgotPassword, closeModal, setActiveTab }),
    [isOpen, activeTab, returnTo, forgotRequest, openModal, openForgotPassword, closeModal],
  )

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used inside <ModalProvider>')
  return ctx
}
