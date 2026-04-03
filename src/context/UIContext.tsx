import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface UIContextType {
  mouseFollowerEnabled: boolean
  toggleMouseFollower: () => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  const [mouseFollowerEnabled, setMouseFollowerEnabled] = useState(() => {
    const saved = localStorage.getItem('mouseFollowerEnabled')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('mouseFollowerEnabled', JSON.stringify(mouseFollowerEnabled))
  }, [mouseFollowerEnabled])

  const toggleMouseFollower = () => setMouseFollowerEnabled((prev: boolean) => !prev)

  return (
    <UIContext.Provider value={{ mouseFollowerEnabled, toggleMouseFollower }}>
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
