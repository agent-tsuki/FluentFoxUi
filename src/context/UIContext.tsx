import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface UIContextType {
  mouseFollowerEnabled: boolean
  toggleMouseFollower: () => void
  isProfileOverlayOpen: boolean
  setIsProfileOverlayOpen: (open: boolean) => void
  overlayProfile: { gender?: 'male' | 'female'; profileImage?: string; firstName?: string } | null
  setOverlayProfile: (profile: { gender?: 'male' | 'female'; profileImage?: string; firstName?: string } | null) => void
  triggerRect: DOMRect | null
  setTriggerRect: (rect: DOMRect | null) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  const [mouseFollowerEnabled, setMouseFollowerEnabled] = useState(() => {
    const saved = localStorage.getItem('mouseFollowerEnabled')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [isProfileOverlayOpen, setIsProfileOverlayOpen] = useState(false)
  const [overlayProfile, setOverlayProfile] = useState<{ gender?: 'male' | 'female'; profileImage?: string; firstName?: string } | null>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    localStorage.setItem('mouseFollowerEnabled', JSON.stringify(mouseFollowerEnabled))
  }, [mouseFollowerEnabled])

  const toggleMouseFollower = () => setMouseFollowerEnabled((prev: boolean) => !prev)

  return (
    <UIContext.Provider value={{ 
      mouseFollowerEnabled, 
      toggleMouseFollower,
      isProfileOverlayOpen,
      setIsProfileOverlayOpen,
      overlayProfile,
      setOverlayProfile,
      triggerRect,
      setTriggerRect
    }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}
