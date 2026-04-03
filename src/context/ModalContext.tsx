import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { AuthTab } from '@/types'

interface ModalContextValue {
  isOpen: boolean
  activeTab: AuthTab
  openModal: (tab?: AuthTab) => void
  closeModal: () => void
  setActiveTab: (tab: AuthTab) => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<AuthTab>('signup')

  const openModal = useCallback((tab: AuthTab = 'signup') => {
    setActiveTab(tab)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => setIsOpen(false), [])

  return (
    <ModalContext.Provider value={{ isOpen, activeTab, openModal, closeModal, setActiveTab }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used inside <ModalProvider>')
  return ctx
}
