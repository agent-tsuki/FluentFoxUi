/**
 * AuthContext — session state for the entire app.
 *
 * What lives here:
 *  - AuthUser: the in-memory user object built from the server's login response.
 *  - Silent session restore on mount: if a refresh token exists in localStorage,
 *    we call /auth/refresh before rendering children. This means users who
 *    reload the page are transparently re-authenticated (access token restored
 *    into Zustand memory) without seeing a login flash.
 *  - Listens for the 'auth:expired' event dispatched by apiClient when a token
 *    refresh fails mid-session, so the UI snaps back to logged-out state.
 *
 * Token storage:
 *  - Access token  → Zustand memory (src/store/authStore.ts) — never hits disk.
 *  - Refresh token → localStorage   (tokenManager) — survives page refresh.
 *  - User object   → localStorage   (AUTH_USER_KEY) — used to pre-populate UI
 *                    while session restore runs. Cleared on logout/expiry.
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
import { useAuthTokenStore } from '@/store/authStore'
import { authService } from '@/api/services/authService'

// ── AuthUser shape ────────────────────────────────────────────────────────────

export interface AuthUser {
  userId:        string
  username:      string
  email:         string
  isAdmin:       boolean
  emailVerified: boolean
  isActive:      boolean

  // Populated lazily by the profile API (not available right after login)
  firstName?:    string
  lastName?:     string
  gender?:       'male' | 'female'
  profileImage?: string
}

// ── Context value ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user:               AuthUser | null
  isLoading:          boolean           // true during the initial session restore
  setUser:            (user: AuthUser | null) => void
  logout:             () => void
  updateProfileImage: (url: string) => void
}

// ── User persistence ──────────────────────────────────────────────────────────

const AUTH_USER_KEY = 'ff_auth_user'

function loadStoredUser(): AuthUser | null {
  // Only restore the cached user if a refresh token still exists.
  // If there's no refresh token the session is dead regardless.
  if (!tokenManager.hasRefreshToken()) return null
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
  const [user, setUserState]   = useState<AuthUser | null>(loadStoredUser)
  const [isLoading, setLoading] = useState<boolean>(true)

  // ── Persist user whenever it changes ─────────────────────────────────────
  useEffect(() => {
    persistUser(user)
  }, [user])

  // ── Silent session restore on every mount ────────────────────────────────
  // If a refresh token exists, exchange it for a fresh access token.
  // This is what keeps users logged in after a page refresh.
  useEffect(() => {
    const storedUser = loadStoredUser()

    if (!tokenManager.hasRefreshToken() || !storedUser) {
      // No valid session to restore
      setLoading(false)
      return
    }

    authService
      .refreshSession(storedUser.email)
      .then((freshUser) => {
        setUserState(freshUser)
      })
      .catch(() => {
        // Refresh token expired or revoked — clear everything
        setUserState(null)
        useAuthTokenStore.getState().clearAccessToken()
        tokenManager.clearRefreshToken()
      })
      .finally(() => {
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Listen for mid-session token expiry dispatched by apiClient ──────────
  useEffect(() => {
    function onExpired() {
      setUserState(null)
      persistUser(null)
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  // ── Stable callbacks ──────────────────────────────────────────────────────

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u)
  }, [])

  const logout = useCallback(() => {
    setUserState(null)
    // Fire-and-forget: tokens cleared inside authService.logout before network call
    authService.logout().catch(() => {
      // Tokens already cleared — nothing more to do
    })
  }, [])

  const updateProfileImage = useCallback((url: string) => {
    setUserState(prev => (prev ? { ...prev, profileImage: url } : null))
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout, updateProfileImage }}>
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
