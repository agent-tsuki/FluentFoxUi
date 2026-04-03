import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface AuthUser {
  id: string
  firstName: string
  email: string
  gender?: 'male' | 'female'
  profileImage?: string
}

interface AuthContextValue {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => void
  updateProfileImage: (url: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>({
    id: '1',
    firstName: 'Taro',
    email: 'taro@example.com',
    gender: 'male',
  })

  const logout = useCallback(() => setUser(null), [])

  const updateProfileImage = useCallback((url: string) => {
    setUser(prev => prev ? { ...prev, profileImage: url } : null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, logout, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
