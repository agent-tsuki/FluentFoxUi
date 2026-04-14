/**
 * Centralized token manager.
 *
 * All read/write operations for auth tokens go through here.
 * To switch storage strategy (e.g. localStorage → sessionStorage, or
 * move to httpOnly cookies via a proxy endpoint) change only this file —
 * nothing in services or context needs to change.
 */

const ACCESS_TOKEN_KEY  = 'ff_access_token'
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
  } catch { /* storage unavailable (e.g. private browsing quota) */ }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch { /* storage unavailable */ }
}

export const tokenManager = {
  /** Returns the current JWT access token, or null if not present. */
  getAccessToken(): string | null {
    return safeGet(ACCESS_TOKEN_KEY)
  },

  /** Returns the opaque refresh token UUID, or null if not present. */
  getRefreshToken(): string | null {
    return safeGet(REFRESH_TOKEN_KEY)
  },

  /** Persists both tokens after a successful login or token refresh. */
  setTokens(accessToken: string, refreshToken: string): void {
    safeSet(ACCESS_TOKEN_KEY,  accessToken)
    safeSet(REFRESH_TOKEN_KEY, refreshToken)
  },

  /** Removes both tokens (logout / session expiry). */
  clearTokens(): void {
    safeRemove(ACCESS_TOKEN_KEY)
    safeRemove(REFRESH_TOKEN_KEY)
  },

  /** True only when both tokens are present in storage. */
  hasTokens(): boolean {
    return Boolean(safeGet(ACCESS_TOKEN_KEY) && safeGet(REFRESH_TOKEN_KEY))
  },
}
