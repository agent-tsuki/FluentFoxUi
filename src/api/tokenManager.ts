/**
 * Token manager — refresh token storage ONLY.
 *
 * The access token (JWT, short-lived) now lives in Zustand memory:
 *   src/store/authStore.ts → getAccessToken()
 *
 * The refresh token (opaque UUID, 7-day) stays in localStorage because
 * the backend returns it in the JSON body rather than as an HttpOnly cookie.
 * It must survive page refresh so sessions can be silently restored.
 *
 * To switch to HttpOnly cookies in the future: delete this file and have
 * the backend set the cookie — apiClient already sends credentials:'include'.
 */

const REFRESH_TOKEN_KEY = 'ff_refresh_token'

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch { /* storage unavailable (private browsing quota, etc.) */ }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch { /* storage unavailable */ }
}

export const tokenManager = {
  /** Returns the stored refresh token, or null. */
  getRefreshToken(): string | null {
    return safeGet(REFRESH_TOKEN_KEY)
  },

  /** Persists the refresh token after a successful login or token rotation. */
  setRefreshToken(refreshToken: string): void {
    safeSet(REFRESH_TOKEN_KEY, refreshToken)
  },

  /** Removes the refresh token (logout / session expiry). */
  clearRefreshToken(): void {
    safeRemove(REFRESH_TOKEN_KEY)
  },

  /** True when a refresh token is present. */
  hasRefreshToken(): boolean {
    return Boolean(safeGet(REFRESH_TOKEN_KEY))
  },
}
