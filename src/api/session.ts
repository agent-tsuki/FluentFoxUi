/**
 * Session core — owns token lifecycle (auth guide §2, §7).
 *
 *  - Access token  → Zustand memory only (src/store/authStore.ts).
 *  - Refresh token → localStorage (tokenManager), protected by the CSP.
 *
 * Refresh tokens ROTATE and there is ONE session per user, so two parallel
 * refreshes make one fail and log the user out. Therefore:
 *  - within a tab, concurrent callers share one in-flight refresh;
 *  - across tabs, refreshes are serialised with the Web Locks API, and the
 *    refresh token is re-read from storage inside the lock so each tab uses
 *    the newest token another tab may have just stored;
 *  - a rejected refresh clears storage only if the token it used is still the
 *    stored one (never wipe a newer token another tab just saved);
 *  - network/5xx failures never clear tokens.
 *
 * Login/logout are broadcast to other tabs over a BroadcastChannel.
 * React code subscribes with `subscribeSession` (see AuthContext).
 */

import { API_BASE } from '@/lib/config'
import { useAuthTokenStore } from '@/store/authStore'
import { tokenManager } from './tokenManager'
import { ApiError } from './errors'
import { isApiFailedResponse, type ApiUser, type AuthApiResponse } from '@/types/api'

const LOCK_NAME        = 'ff-auth-refresh'
const CHANNEL_NAME     = 'ff-auth'
const EARLY_REFRESH_MS = 30_000

const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' }

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
    clearLocalTokens()
    emit({ type: 'ended' })
  } else if (e.data?.type === 'login') {
    emit({ type: 'remote-login' })
  }
})

function broadcast(message: ChannelMessage): void {
  try { channel?.postMessage(message) } catch { /* channel closed */ }
}

// ── Token helpers ─────────────────────────────────────────────────────────────

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

function applyTokens(accessToken: string, refreshToken: string): void {
  useAuthTokenStore.getState().setAccessToken(accessToken)
  tokenManager.setRefreshToken(refreshToken)
  scheduleEarlyRefresh(accessToken)
}

function clearLocalTokens(): void {
  clearTimeout(refreshTimer)
  useAuthTokenStore.getState().clearAccessToken()
  tokenManager.clearRefreshToken()
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
  // Read inside the lock: another tab may have rotated it a moment ago.
  const usedToken = tokenManager.getRefreshToken()
  if (!usedToken) return { ok: false, reason: 'no-token' }

  let res: Response
  try {
    res = await fetch(`${API_BASE}/auth/refresh`, {
      method:  'POST',
      headers: JSON_HEADERS,
      body:    JSON.stringify({ refresh_token: usedToken }),
    })
  } catch {
    return { ok: false, reason: 'network' }
  }

  const body: unknown = await res.json().catch(() => null)

  if (res.ok && (body as AuthApiResponse | null)?.status === 'success') {
    const { access_token, refresh_token, user } = (body as AuthApiResponse).data
    if (epoch !== startEpoch) {
      // Logged out while this was in flight. Store only the rotated refresh
      // token so the waiting logout (next in the lock) revokes the newest one.
      tokenManager.setRefreshToken(refresh_token)
      return { ok: false, reason: 'no-token' }
    }
    applyTokens(access_token, refresh_token)
    return { ok: true, user }
  }

  // Server trouble or rate limiting: keep tokens, try again later.
  if (res.status >= 500 || res.status === 429) return { ok: false, reason: 'network' }

  const error = isApiFailedResponse(body)
    ? new ApiError(res.status, body.error.error_code, body.error.message, body.error.log_id)
    : new ApiError(res.status, 'SESSION_EXPIRED', 'Session expired', '')

  // Only clear if nobody stored a newer token meanwhile.
  if (tokenManager.getRefreshToken() === usedToken) {
    clearLocalTokens()
    broadcast({ type: 'logout' })
  }
  return { ok: false, reason: 'rejected', error }
}

/**
 * Exchange the stored refresh token for a new pair. Safe to call from
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

/** Store a new session (after login) and tell other tabs. */
export function startSession(accessToken: string, refreshToken: string): void {
  applyTokens(accessToken, refreshToken)
  broadcast({ type: 'login' })
}

/** End the session locally and in every tab, e.g. after a retried request still fails. */
export function expireSession(error?: ApiError): void {
  epoch++
  clearLocalTokens()
  broadcast({ type: 'logout' })
  emit({ type: 'ended', error })
}

/**
 * Log out: clear everything locally and in other tabs first (instant UI),
 * then revoke on the server. The revoke runs inside the refresh lock, so it
 * waits for any refresh already in flight (in any tab) and revokes the
 * newest refresh token instead of a rotated-away one. Never throws.
 */
export async function endSession(): Promise<void> {
  const tokenAtLogout = tokenManager.getRefreshToken()
  expireSession()

  await withRefreshLock(async () => {
    // A refresh that finished meanwhile stored a newer token; prefer it.
    const refreshToken = tokenManager.getRefreshToken() ?? tokenAtLogout
    tokenManager.clearRefreshToken()
    if (!refreshToken) return
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method:  'POST',
        headers: JSON_HEADERS,
        body:    JSON.stringify({ refresh_token: refreshToken }),
      })
    } catch { /* already logged out locally */ }
  })
}

/** Tell the app a protected call was refused because the email is unverified. */
export function notifyUnverified(): void {
  emit({ type: 'unverified' })
}

export function hasStoredSession(): boolean {
  return tokenManager.hasRefreshToken()
}
