/**
 * Base API client.
 *
 * Change VITE_API_URL in .env — every service picks it up automatically.
 *
 * Token strategy:
 *  - Access token  → Zustand memory (src/store/authStore.ts) — never hits disk.
 *  - Refresh token → localStorage via tokenManager — survives page refresh.
 *
 * Features:
 *  - Attaches Bearer access token on every request.
 *  - Parses structured server errors { status:"failed", error:{...} } BEFORE
 *    any 401 refresh logic — so business errors (e.g. UNAUTHORIZE for
 *    "verify email") are never misread as session-expiry.
 *  - On genuine 401 with no structured error: attempts one silent token refresh,
 *    retries original request, then dispatches 'auth:expired' if refresh fails.
 *  - Refresh-lock singleton: concurrent 401s share a single refresh call.
 */

import { getAccessToken, useAuthTokenStore } from '@/store/authStore'
import { tokenManager } from './tokenManager'
import { ApiError } from './errors'
import { isApiFailedResponse } from '@/types/api'
import type { AuthApiResponse } from '@/types/api'

export { ApiError } from './errors'

export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept':       'application/json, application/problem+json',
}

// ── Token refresh singleton ───────────────────────────────────────────────────
// All concurrent 401s wait on the same promise so we only call /auth/refresh once.

let refreshPromise: Promise<boolean> | null = null

async function attemptTokenRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = tokenManager.getRefreshToken()
    if (!refreshToken) return false

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method:  'POST',
        headers: DEFAULT_HEADERS,
        body:    JSON.stringify({ refresh_token: refreshToken }),
      })
      if (!res.ok) return false

      const json = (await res.json()) as AuthApiResponse
      if (json.status !== 'success') return false

      // Rotate both tokens
      useAuthTokenStore.getState().setAccessToken(json.data.access_token)
      tokenManager.setRefreshToken(json.data.refresh_token)
      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// ── Core request ──────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options?: RequestInit,
  _isRetry = false,
): Promise<T> {
  const token = getAccessToken()

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include', // sends cookies cross-origin if backend ever switches
    headers: {
      ...DEFAULT_HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  // ── Parse body once (204 has no body) ────────────────────────────────────
  let body: unknown = null
  if (res.status !== 204) {
    try { body = await res.json() } catch { /* non-JSON body — leave null */ }
  }

  // ── Structured server error: { status:"failed", error:{...} } ────────────
  // MUST come before 401 handling so business errors (e.g. UNAUTHORIZE for
  // "email not verified") are never misidentified as session expiry.
  if (isApiFailedResponse(body)) {
    throw new ApiError(
      res.status,
      body.error.error_code,
      body.error.message,
      body.error.log_id,
    )
  }

  // ── 401: attempt silent token refresh (only for genuine auth failures) ───
  if (res.status === 401 && !_isRetry) {
    const refreshed = await attemptTokenRefresh()

    if (refreshed) {
      return request<T>(path, options, true)
    }

    // Refresh failed — clear all auth state and signal the app
    useAuthTokenStore.getState().clearAccessToken()
    tokenManager.clearRefreshToken()
    window.dispatchEvent(new CustomEvent('auth:expired'))
    throw new ApiError(401, 'SESSION_EXPIRED', 'Your session has expired. Please log in again.', '')
  }

  // ── Other non-2xx HTTP errors ─────────────────────────────────────────────
  if (!res.ok) {
    const message =
      (body as Record<string, unknown> | null)?.message as string | undefined
      ?? res.statusText
      ?? 'Request failed'
    throw new ApiError(res.status, 'HTTP_ERROR', message, '')
  }

  // ── 204 No Content ────────────────────────────────────────────────────────
  if (res.status === 204) return {} as T

  return body as T
}

// ── Public client ─────────────────────────────────────────────────────────────

export const apiClient = {
  get:    <T>(path: string)                => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)               => request<T>(path, { method: 'DELETE' }),
}
