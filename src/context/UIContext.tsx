import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type BackgroundAnimation = 'petals' | 'fish' | 'none'

interface UIContextType {
  // Mouse follower
  mouseFollowerEnabled: boolean
  toggleMouseFollower: () => void
  // Dark mode
  darkMode: boolean
  toggleDarkMode: () => void
  // Background animation
  backgroundAnimation: BackgroundAnimation
  setBackgroundAnimation: (v: BackgroundAnimation) => void
  // Profile overlay
  isProfileOverlayOpen: boolean
  setIsProfileOverlayOpen: (open: boolean) => void
  overlayProfile: { gender?: 'male' | 'female'; profileImage?: string; firstName?: string } | null
  setOverlayProfile: (profile: { gender?: 'male' | 'female'; profileImage?: string; firstName?: string } | null) => void
  triggerRect: DOMRect | null
  setTriggerRect: (rect: DOMRect | null) => void
}

function safeLocalStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved !== null ? (JSON.parse(saved) as T) : fallback
  } catch {
    return fallback
  }
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  const [mouseFollowerEnabled, setMouseFollowerEnabled] = useState(() =>
    safeLocalStorage('mouseFollowerEnabled', true)
  )

  const [darkMode, setDarkMode] = useState(() =>
    safeLocalStorage('darkMode', false)
  )

  const [backgroundAnimation, setBackgroundAnimationState] = useState<BackgroundAnimation>(() =>
    safeLocalStorage<BackgroundAnimation>('backgroundAnimation', 'petals')
  )

  const [isProfileOverlayOpen, setIsProfileOverlayOpen] = useState(false)
  const [overlayProfile, setOverlayProfile] = useState<{ gender?: 'male' | 'female'; profileImage?: string; firstName?: string } | null>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    try { localStorage.setItem('mouseFollowerEnabled', JSON.stringify(mouseFollowerEnabled)) } catch { /* storage unavailable */ }
  }, [mouseFollowerEnabled])

  useEffect(() => {
    try { localStorage.setItem('backgroundAnimation', JSON.stringify(backgroundAnimation)) } catch { /* storage unavailable */ }
  }, [backgroundAnimation])

  useEffect(() => {
    try { localStorage.setItem('darkMode', JSON.stringify(darkMode)) } catch { /* storage unavailable */ }
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [darkMode])

  const toggleMouseFollower = () => setMouseFollowerEnabled((prev: boolean) => !prev)
  const toggleDarkMode = () => setDarkMode((prev: boolean) => !prev)
  const setBackgroundAnimation = (v: BackgroundAnimation) => setBackgroundAnimationState(v)

  return (
    <UIContext.Provider value={{
      mouseFollowerEnabled,
      toggleMouseFollower,
      darkMode,
      toggleDarkMode,
      backgroundAnimation,
      setBackgroundAnimation,
      isProfileOverlayOpen,
      setIsProfileOverlayOpen,
      overlayProfile,
      setOverlayProfile,
      triggerRect,
      setTriggerRect,
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
