import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export type BackgroundAnimation = 'petals' | 'fish' | 'none'

/** 'system' follows the device's light / dark setting; the others are the learner's own pick. */
export type ThemeChoice = 'system' | 'light' | 'dark'

interface UIContextType {
  // Mouse follower
  mouseFollowerEnabled: boolean
  toggleMouseFollower: () => void
  // Dark mode: the device's setting until the learner picks one (kept in this browser only)
  darkMode: boolean
  toggleDarkMode: () => void
  themeChoice: ThemeChoice
  setThemeChoice: (choice: ThemeChoice) => void
  // Background animation
  backgroundAnimation: BackgroundAnimation
  setBackgroundAnimation: (v: BackgroundAnimation) => void
}

function safeLocalStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved !== null ? (JSON.parse(saved) as T) : fallback
  } catch {
    return fallback
  }
}

const MOUSE_FOLLOWER_KEY = 'cursorTrailEnabled'
const BACKGROUND_ANIMATION_KEY = 'backgroundAnimationChoice'
/**
 * The learner's own light / dark pick, saved only when they make one. index.html
 * reads the same key before the first paint (and moves an old explicit dark
 * pick over from the former 'darkMode' key), so keep the two in step.
 */
const THEME_KEY = 'themeChoice'
const SYSTEM_DARK = '(prefers-color-scheme: dark)'

function savedTheme(): ThemeChoice {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    return 'system'
  }
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  // Off by default: the normal arrow cursor. Users can opt in from Account Settings.
  // New storage key so visitors who had the old auto-saved `true` also start with the arrow.
  const [mouseFollowerEnabled, setMouseFollowerEnabled] = useState(() =>
    safeLocalStorage(MOUSE_FOLLOWER_KEY, false)
  )

  const [themeChoice, setThemeChoiceState] = useState<ThemeChoice>(savedTheme)
  const systemDark = useMediaQuery(SYSTEM_DARK)
  const darkMode = themeChoice === 'system' ? systemDark : themeChoice === 'dark'

  // Off by default: no background motion until the user picks one in Account Settings.
  // New storage key so visitors who had the old auto-saved 'petals' also start calm.
  const [backgroundAnimation, setBackgroundAnimationState] = useState<BackgroundAnimation>(() =>
    safeLocalStorage<BackgroundAnimation>(BACKGROUND_ANIMATION_KEY, 'none')
  )

  useEffect(() => {
    try { localStorage.setItem(MOUSE_FOLLOWER_KEY, JSON.stringify(mouseFollowerEnabled)) } catch { /* storage unavailable */ }
  }, [mouseFollowerEnabled])

  useEffect(() => {
    try { localStorage.setItem(BACKGROUND_ANIMATION_KEY, JSON.stringify(backgroundAnimation)) } catch { /* storage unavailable */ }
  }, [backgroundAnimation])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [darkMode])

  const toggleMouseFollower = () => setMouseFollowerEnabled((prev: boolean) => !prev)
  // Only an explicit pick is saved; 'system' clears it, so the device's setting applies again.
  const setThemeChoice = (choice: ThemeChoice) => {
    setThemeChoiceState(choice)
    try {
      if (choice === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, choice)
    } catch { /* storage unavailable: the pick lasts for this visit */ }
  }
  const toggleDarkMode = () => setThemeChoice(darkMode ? 'light' : 'dark')
  const setBackgroundAnimation = (v: BackgroundAnimation) => setBackgroundAnimationState(v)

  return (
    <UIContext.Provider value={{
      mouseFollowerEnabled,
      toggleMouseFollower,
      darkMode,
      toggleDarkMode,
      themeChoice,
      setThemeChoice,
      backgroundAnimation,
      setBackgroundAnimation,
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
