/**
 * AuthContext — session state for the whole app.
 *
 *  - Restores the session on mount through the locked, single-flight refresh
 *    (src/api/session.ts), so reloads and multiple tabs never race.
 *  - Mirrors session events: refreshed (user flags change), ended (expired,
 *    suspended, logged out in another tab), remote-login (another tab logged
 *    in), unverified (a call returned EMAIL_NOT_VERIFIED).
 *  - Inactive/suspended/deleted accounts are logged out with a `notice`
 *    the login form shows.
 *
 * Storage: access token in memory; refresh credential in an HttpOnly cookie;
 * a small cached user object (no tokens) so the UI and email survive a reload.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { hasStoredSession, refreshSession, subscribeSession } from '@/api/session'
import { authService, toAuthUser } from '@/api/services/authService'
import { profileService } from '@/api/services/profileService'
import { ApiError, resolveErrorMessage } from '@/api/errors'

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

export interface AuthNotice {
  tone: 'error' | 'success'
  text: string
}

interface AuthContextValue {
  user:               AuthUser | null
  /** True during the initial session restore. */
  isLoading:          boolean
  /**
   * Message for the login form: why the last session ended (error), or a
   * confirmation such as "Password updated" (success).
   */
  notice:             AuthNotice | null
  showNotice:         (text: string, tone?: AuthNotice['tone']) => void
  clearNotice:        () => void
  setUser:            (user: AuthUser | null) => void
  logout:             () => void
  /** Refresh tokens and user flags, e.g. after the email was verified. */
  refreshUser:        () => Promise<AuthUser | null>
  /** Update the displayed email after a successful change-email call. */
  updateEmail:        (email: string) => void
  updateProfileImage: (url: string) => void
}

// ── Cached user ───────────────────────────────────────────────────────────────

const AUTH_USER_KEY = 'ff_auth_user'

function loadStoredUser(): AuthUser | null {
  if (!hasStoredSession()) return null
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function persistUser(user: AuthUser | null): void {
  try {
    if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(AUTH_USER_KEY)
  } catch { /* storage unavailable */ }
}

const NOTICE_CODES = new Set(['ACCOUNT_SUSPENDED', 'ACCOUNT_DELETED', 'ACCOUNT_INACTIVE', 'USER_NOT_FOUND'])

function noticeFor(error: ApiError | undefined, wasLoggedIn: boolean): string | null {
  if (error && NOTICE_CODES.has(error.errorCode)) return resolveErrorMessage(error)
  if (error && wasLoggedIn) return 'Your session has expired. Please log in again.'
  return null
}

// ── Provider ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState]    = useState<AuthUser | null>(loadStoredUser)
  const [isLoading, setLoading] = useState<boolean>(() => hasStoredSession())
  const [notice, setNotice]     = useState<AuthNotice | null>(null)

  // Latest user for event handlers (avoids side effects inside state updaters).
  const userRef = useRef(user)
  useEffect(() => {
    userRef.current = user
    persistUser(user)
  }, [user])

  // ── Session events ────────────────────────────────────────────────────────
  useEffect(() => {
    return subscribeSession(event => {
      switch (event.type) {
        case 'refreshed': {
          if (!event.user.is_active) {
            setNotice({ tone: 'error', text: resolveErrorMessage(new ApiError(403, 'ACCOUNT_INACTIVE', '', '')) })
            setUserState(null)
            void authService.logout()
            return
          }
          setUserState(prev => {
            // Another tab may have just logged in: take the email it cached.
            const email = prev?.email || loadStoredUser()?.email || ''
            return { ...prev, ...toAuthUser(event.user, email) }
          })
          return
        }
        case 'ended': {
          // Never clear an existing notice here (e.g. the inactive notice set just before logout).
          const message = noticeFor(event.error, userRef.current !== null)
          if (message) setNotice({ tone: 'error', text: message })
          setUserState(null)
          return
        }
        case 'remote-login':
          void refreshSession()
          return
        case 'unverified':
          setUserState(prev => (prev && prev.emailVerified ? { ...prev, emailVerified: false } : prev))
          return
      }
    })
  }, [])

  // ── Profile details ───────────────────────────────────────────────────────
  // The token carries no name or avatar, so load them once per signed-in user.
  // /profile needs a verified email; unverified users keep the default avatar.
  const profileLoadedFor = useRef<string | null>(null)
  useEffect(() => {
    if (!user?.emailVerified || profileLoadedFor.current === user.userId) return
    profileLoadedFor.current = user.userId
    profileService.getProfile()
      .then(profile => setUserState(prev => (prev && prev.userId === profile.id
        ? { ...prev, firstName: profile.firstName, lastName: profile.lastName, profileImage: profile.avatar.url }
        : prev)))
      .catch(() => { profileLoadedFor.current = null })
  }, [user?.userId, user?.emailVerified])

  // ── Restore on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasStoredSession()) {
      setUserState(null)
      setLoading(false)
      return
    }
    // Success/failure are applied by the 'refreshed' / 'ended' listener above.
    void refreshSession().finally(() => setLoading(false))
  }, [])

  // ── Actions ───────────────────────────────────────────────────────────────

  const setUser = useCallback((u: AuthUser | null) => {
    setNotice(null)
    setUserState(u)
  }, [])

  const logout = useCallback(() => {
    setUserState(null)
    void authService.logout()
  }, [])

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    const result = await refreshSession()
    if (!result.ok) {
      if (result.reason === 'network') throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed', '')
      return null
    }
    // The 'refreshed' listener updates state; return the fresh view for the caller.
    return toAuthUser(result.user, loadStoredUser()?.email ?? '')
  }, [])

  const updateEmail = useCallback((email: string) => {
    setUserState(prev => (prev ? { ...prev, email } : prev))
  }, [])

  const updateProfileImage = useCallback((url: string) => {
    setUserState(prev => (prev ? { ...prev, profileImage: url } : null))
  }, [])

  const clearNotice = useCallback(() => setNotice(null), [])
  const showNotice  = useCallback((text: string, tone: AuthNotice['tone'] = 'error') => setNotice({ tone, text }), [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, notice, showNotice, clearNotice, setUser, logout, refreshUser, updateEmail, updateProfileImage }),
    [user, isLoading, notice, showNotice, clearNotice, setUser, logout, refreshUser, updateEmail, updateProfileImage],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
