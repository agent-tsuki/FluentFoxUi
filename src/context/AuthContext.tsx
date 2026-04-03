import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export interface AuthUser {
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

const AUTH_STORAGE_KEY = 'auth_user'

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(loadStoredUser)

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    } catch { /* storage unavailable */ }
  }, [user])

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u)
  }, [])

  const logout = useCallback(() => setUserState(null), [])

  const updateProfileImage = useCallback((url: string) => {
    setUserState(prev => prev ? { ...prev, profileImage: url } : null)
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
