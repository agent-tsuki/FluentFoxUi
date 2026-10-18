/**
 * Zustand auth store — access token lives in memory ONLY.
 *
 * Why memory and not localStorage?
 *  - An XSS attack can read localStorage, stealing a persisted token.
 *  - Keeping a short-lived token only in memory limits its lifetime and avoids
 *    leaving a reusable credential behind after the tab closes.
 *
 * Trade-off: access token is lost on page refresh.
 * That is handled by AuthContext, which attempts a silent refresh on every
 * mount using the HttpOnly refresh cookie.
 *
 * The refresh token is intentionally inaccessible to JavaScript.
 */

import { create } from 'zustand'

interface AuthTokenStore {
  /** JWT access token — memory only, never persisted. */
  accessToken: string | null

  setAccessToken: (token: string) => void
  clearAccessToken: () => void
}

export const useAuthTokenStore = create<AuthTokenStore>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAccessToken: () => set({ accessToken: null }),
}))

/**
 * Non-reactive getter — used by apiClient so token reads
 * don't trigger component re-renders.
 */
export function getAccessToken(): string | null {
  return useAuthTokenStore.getState().accessToken
}
