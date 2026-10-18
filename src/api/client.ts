/**
 * Base API client (auth guide §7 "Example API wrapper").
 *
 *  - Attaches the in-memory Bearer access token — except on public auth
 *    endpoints, which must never carry one.
 *  - 401 with TOKEN_EXPIRED / TOKEN_INVALID / UNAUTHORIZED on a protected call:
 *    one shared refresh (see src/api/session.ts), then ONE retry. If the retry
 *    still fails, the session ends everywhere and the user goes to login.
 *    Public auth endpoints (login, register, refresh, logout, verify,
 *    forgot/reset password) never trigger a refresh: their errors are real
 *    answers (e.g. INVALID_CREDENTIALS, RESET_TOKEN_EXPIRED).
 *  - No client timeout: /auth/forgot-password deliberately takes ~6s, and the
 *    reset guide requires any timeout to be at least 15s.
 *  - 403 EMAIL_NOT_VERIFIED: notifies the app so it can show the verify screen.
 *  - Every failure becomes an ApiError; branch on `errorCode`.
 *  - Requests include credentials so the browser can send the HttpOnly refresh
 *    cookie to the API. Protected application calls still use the short-lived
 *    access token in Authorization; the refresh cookie is never readable here.
 */

import { API_BASE } from '@/lib/config'
import { getAccessToken } from '@/store/authStore'
import { ApiError } from './errors'
import { expireSession, notifyUnverified, refreshSession } from './session'
import { isApiFailedResponse } from '@/types/api'

export { ApiError } from './errors'

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept':       'application/json, application/problem+json',
}

const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/verify',
  '/auth/forgot-password',
  '/auth/forgot-password/verify-code',
  '/auth/reset-password',
  '/auth/oauth/google/exchange',
  '/auth/oauth/x/exchange',
  // Not auth, but public: the cold-start warm-up ping must never carry a
  // token or trigger a refresh.
  '/health',
]
// Public content (kana charts, kanji levels) is the same for everyone: guests
// browse it, and an expired token must never turn a chart load into a refresh.
const PUBLIC_PATH_PREFIXES = ['/content/']
const REFRESHABLE_CODES = new Set(['TOKEN_EXPIRED', 'TOKEN_INVALID', 'UNAUTHORIZED'])

function isPublicAuthPath(path: string): boolean {
  const bare = path.split('?')[0]
  return PUBLIC_AUTH_PATHS.includes(bare) || PUBLIC_PATH_PREFIXES.some(prefix => bare.startsWith(prefix))
}

function readRetryAfter(res: Response): number | undefined {
  const raw = res.headers.get('Retry-After')
  const seconds = raw === null ? NaN : Number(raw)
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined
}

const sessionExpiredError = () =>
  new ApiError(401, 'SESSION_EXPIRED', 'Your session has expired. Please log in again.', '')

// ── Core request ──────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit, isRetry = false): Promise<T> {
  const isPublic = isPublicAuthPath(path)
  const token    = isPublic ? null : getAccessToken()

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...DEFAULT_HEADERS,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed', '')
  }

  let body: unknown = null
  if (res.status !== 204) {
    try { body = await res.json() } catch { /* non-JSON body */ }
  }

  const failed = isApiFailedResponse(body) ? body.error : null
  const code   = failed?.error_code

  // ── Expired / invalid access token on a protected route ───────────────────
  if (res.status === 401 && !isPublic && (code === undefined || REFRESHABLE_CODES.has(code))) {
    if (isRetry) {
      // Refreshed once and still refused: stop here to avoid loops.
      expireSession()
      throw sessionExpiredError()
    }
    const result = await refreshSession()
    if (result.ok) return request<T>(path, options, true)
    if (result.reason === 'network') throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed', '')
    // 'rejected' / 'no-token': refreshSession already ended the session.
    throw sessionExpiredError()
  }

  if (res.status === 403 && code === 'EMAIL_NOT_VERIFIED') notifyUnverified()

  if (failed) {
    throw new ApiError(res.status, failed.error_code, failed.message, failed.log_id, readRetryAfter(res))
  }

  if (!res.ok) {
    const message = ((body as Record<string, unknown> | null)?.message as string | undefined) ?? res.statusText ?? 'Request failed'
    throw new ApiError(res.status, 'HTTP_ERROR', message, '', readRetryAfter(res))
  }

  if (res.status === 204) return {} as T
  return body as T
}

// ── Public client ─────────────────────────────────────────────────────────────

export const apiClient = {
  get:    <T>(path: string)                 => request<T>(path),
  post:   <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST',  body: body === undefined ? undefined : JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)  => request<T>(path, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)  => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)                 => request<T>(path, { method: 'DELETE' }),
}
