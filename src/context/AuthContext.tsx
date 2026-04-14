/**
 * AuthContext — session state for the entire app.
 *
 * What lives here:
 *  - AuthUser: the in-memory user object built from the server's login response.
 *  - setUser / logout helpers used by authService consumers.
 *  - Listens for the 'auth:expired' event dispatched by apiClient when a token
 *    refresh fails, so the UI snaps back to logged-out state automatically.
 *
 * Tokens (access + refresh) are NOT stored here — tokenManager owns that.
 * AuthContext only tracks the user identity needed by the UI.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { tokenManager } from '@/api/tokenManager'
import { authService } from '@/api/services/authService'

// ── AuthUser shape (matches server response + UI extras) ──────────────────────

export interface AuthUser {
  userId:        string   // server: user_id
  username:      string   // server: username
  email:         string   // from login form (server omits it from user object)
  isAdmin:       boolean  // server: is_admin
  emailVerified: boolean  // server: email_verified
  isActive:      boolean  // server: is_active

  // Populated lazily by the profile API (not available right after login)
  firstName?:    string
  lastName?:     string
  gender?:       'male' | 'female'
  profileImage?: string
}

// ── Context value ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user:               AuthUser | null
  setUser:            (user: AuthUser | null) => void
  logout:             () => void
  updateProfileImage: (url: string) => void
}

// ── Persistence ───────────────────────────────────────────────────────────────

const AUTH_USER_KEY = 'ff_auth_user'

function loadStoredUser(): AuthUser | null {
  // Only restore the user if tokens are still present in storage.
  if (!tokenManager.hasTokens()) return null
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function persistUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_USER_KEY)
    }
  } catch { /* storage unavailable */ }
}

// ── Provider ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(loadStoredUser)

  // Persist user whenever it changes
  useEffect(() => {
    persistUser(user)
  }, [user])

  // Listen for token-refresh failures dispatched by apiClient
  useEffect(() => {
    function onExpired() {
      setUserState(null)
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u)
  }, [])

  const logout = useCallback(() => {
    setUserState(null)
    // Fire-and-forget: clear tokens + tell the server (don't block the UI)
    authService.logout().catch(() => {
      // Tokens already cleared inside authService.logout() — nothing to do here.
    })
  }, [])

  const updateProfileImage = useCallback((url: string) => {
    setUserState(prev => (prev ? { ...prev, profileImage: url } : null))
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, logout, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
