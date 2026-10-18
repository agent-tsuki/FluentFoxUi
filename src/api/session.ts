/**
 * Session core — owns token lifecycle (auth guide §2, §7).
 *
 *  - Access token  → Zustand memory only (src/store/authStore.ts).
 *  - Refresh token → Secure, HttpOnly, SameSite API cookie.
 *
 * JavaScript never reads or persists the refresh credential. A non-sensitive
 * localStorage hint merely avoids a refresh request for known guests; it is not
 * trusted by the API and conveys no authentication or authorization.
 *
 * Refresh tokens rotate and there is one session per user, so two parallel
 * refreshes make one fail and log the user out. Therefore:
 *  - within a tab, concurrent callers share one in-flight refresh;
 *  - across tabs, refreshes are serialised with the Web Locks API;
 *  - a rejected refresh clears only local session state; and
 *  - network/5xx failures never clear tokens.
 *
 * Login/logout are broadcast to other tabs over a BroadcastChannel.
 * React code subscribes with `subscribeSession` (see AuthContext).
 */

import { API_BASE } from '@/lib/config'
import { useAuthTokenStore } from '@/store/authStore'
import { ApiError } from './errors'
import { isApiFailedResponse, type ApiUser, type AuthApiResponse } from '@/types/api'

const LOCK_NAME        = 'ff-auth-refresh'
const CHANNEL_NAME     = 'ff-auth'
const EARLY_REFRESH_MS = 30_000
const SESSION_HINT_KEY  = 'ff-session-hint'
const LEGACY_TOKEN_KEY  = 'ff_refresh_token'

// A non-simple header forces a CORS preflight. The API requires it (and an
// allowlisted Origin) on cookie-authenticated refresh and logout requests.
const COOKIE_AUTH_HEADERS = { Accept: 'application/json', 'X-CSRF-Token': '1' }

// ── Local events (this tab) ───────────────────────────────────────────────────

export type SessionEvent =
  | { type: 'refreshed'; user: ApiUser }
  /** Session ended here or in another tab. `error` explains why when known. */
  | { type: 'ended'; error?: ApiError }
  /** Another tab logged in; this tab should restore its session. */
  | { type: 'remote-login' }
  /** A protected call returned 403 EMAIL_NOT_VERIFIED. */
  | { type: 'unverified' }

const listeners = new Set<(event: SessionEvent) => void>()

export function subscribeSession(listener: (event: SessionEvent) => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function emit(event: SessionEvent): void {
  listeners.forEach(listener => listener(event))
}

// ── Cross-tab channel ─────────────────────────────────────────────────────────

type ChannelMessage = { type: 'login' } | { type: 'logout' }

const channel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null

channel?.addEventListener('message', (e: MessageEvent<ChannelMessage>) => {
  if (e.data?.type === 'logout') {
    epoch++
    clearLocalSession()
    emit({ type: 'ended' })
  } else if (e.data?.type === 'login') {
    emit({ type: 'remote-login' })
  }
})

function broadcast(message: ChannelMessage): void {
  try { channel?.postMessage(message) } catch { /* channel closed */ }
}

// ── Local session state ───────────────────────────────────────────────────────

let refreshTimer: ReturnType<typeof setTimeout> | undefined

/**
 * Bumped on every logout (here or in another tab). A refresh that started
 * before a logout must not revive the session when it finishes.
 */
let epoch = 0

/** Reads `exp` from a JWT payload. Used ONLY for scheduling, never for security decisions. */
function readExpiryMs(jwt: string): number | null {
  try {
    const part = jwt.split('.')[1]
    if (!part) return null
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')
    const payload = JSON.parse(atob(base64)) as { exp?: unknown }
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

function scheduleEarlyRefresh(accessToken: string): void {
  clearTimeout(refreshTimer)
  const expiresAt = readExpiryMs(accessToken)
  if (expiresAt === null) return
  const delay = Math.max(0, expiresAt - Date.now() - EARLY_REFRESH_MS)
  refreshTimer = setTimeout(() => { void refreshSession() }, delay)
}

function writeSessionHint(present: boolean): void {
  try {
    if (present) localStorage.setItem(SESSION_HINT_KEY, '1')
    else localStorage.removeItem(SESSION_HINT_KEY)
  } catch { /* storage unavailable: refresh remains safe, just less optimised */ }
}

function sessionHintExists(): boolean {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === '1'
  } catch {
    // Cookie sessions must still work when browser storage is blocked.
    return true
  }
}

function clearLegacyRefreshToken(): void {
  try { localStorage.removeItem(LEGACY_TOKEN_KEY) } catch { /* storage unavailable */ }
}

// One-time client migration: raw refresh tokens from older builds must not be
// left readable in storage after the API begins issuing HttpOnly cookies.
clearLegacyRefreshToken()

function applyAccessToken(accessToken: string): void {
  useAuthTokenStore.getState().setAccessToken(accessToken)
  writeSessionHint(true)
  scheduleEarlyRefresh(accessToken)
}

function clearLocalSession(): void {
  clearTimeout(refreshTimer)
  useAuthTokenStore.getState().clearAccessToken()
  writeSessionHint(false)
  clearLegacyRefreshToken()
}

// ── Refresh (single-flight, cross-tab locked) ─────────────────────────────────

export type RefreshResult =
  | { ok: true; user: ApiUser }
  | { ok: false; reason: 'no-token' | 'network' }
  | { ok: false; reason: 'rejected'; error: ApiError }

let inFlight: Promise<RefreshResult> | null = null

async function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request(LOCK_NAME, fn) as Promise<T>
  }
  return fn()
}

async function performRefresh(): Promise<RefreshResult> {
  const startEpoch = epoch
  if (!sessionHintExists()) return { ok: false, reason: 'no-token' }

  let res: Response
  try {
    res = await fetch(`${API_BASE}/auth/refresh`, {
      method:  'POST',
      credentials: 'include',
      headers: COOKIE_AUTH_HEADERS,
    })
  } catch {
    return { ok: false, reason: 'network' }
  }

  const body: unknown = await res.json().catch(() => null)

  if (res.ok && (body as AuthApiResponse | null)?.status === 'success') {
    const { access_token, user } = (body as AuthApiResponse).data
    if (epoch !== startEpoch) {
      // A logout happened while refresh was in flight. endSession waits for
      // this lock, then revokes the newly-rotated HttpOnly cookie.
      return { ok: false, reason: 'no-token' }
    }
    applyAccessToken(access_token)
    return { ok: true, user }
  }

  // Server trouble or rate limiting: keep tokens, try again later.
  if (res.status >= 500 || res.status === 429) return { ok: false, reason: 'network' }

  const error = isApiFailedResponse(body)
    ? new ApiError(res.status, body.error.error_code, body.error.message, body.error.log_id)
    : new ApiError(res.status, 'SESSION_EXPIRED', 'Session expired', '')

  clearLocalSession()
  broadcast({ type: 'logout' })
  return { ok: false, reason: 'rejected', error }
}

/**
 * Exchange the HttpOnly refresh cookie for a new access token. Safe to call from
 * anywhere at any time: concurrent calls (and other tabs) are serialised.
 */
export function refreshSession(): Promise<RefreshResult> {
  if (!inFlight) {
    inFlight = withRefreshLock(performRefresh)
      .then(result => {
        if (result.ok) emit({ type: 'refreshed', user: result.user })
        else if (result.reason === 'rejected') emit({ type: 'ended', error: result.error })
        return result
      })
      .finally(() => { inFlight = null })
  }
  return inFlight
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

/** Store a new access token after login and tell other tabs. */
export function startSession(accessToken: string): void {
  applyAccessToken(accessToken)
  broadcast({ type: 'login' })
}

/** End the session locally and in every tab, e.g. after a retried request still fails. */
export function expireSession(error?: ApiError): void {
  epoch++
  clearLocalSession()
  broadcast({ type: 'logout' })
  emit({ type: 'ended', error })
}

/**
 * Log out: clear everything locally and in other tabs first (instant UI),
 * then revoke the HttpOnly refresh cookie on the server. The revoke runs
 * inside the refresh lock, so it waits for any refresh already in flight and
 * revokes the newest rotated cookie. Never throws.
 */
export async function endSession(): Promise<void> {
  expireSession()

  await withRefreshLock(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method:  'POST',
        credentials: 'include',
        headers: COOKIE_AUTH_HEADERS,
      })
    } catch { /* already logged out locally */ }
  })
}

/** Tell the app a protected call was refused because the email is unverified. */
export function notifyUnverified(): void {
  emit({ type: 'unverified' })
}

export function hasStoredSession(): boolean {
  return sessionHintExists()
}
