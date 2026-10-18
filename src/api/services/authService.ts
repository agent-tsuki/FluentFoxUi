/**
 * Auth service — every auth endpoint from the FoxSensei auth guide (§3).
 *
 * Thin by design: call the endpoint, hand tokens to the session core
 * (src/api/session.ts), map ApiUser → AuthUser. Refresh/retry lives in
 * apiClient + session, never here.
 */

import { apiClient } from '@/api/client'
import { ApiError } from '@/api/errors'
import { endSession, startSession } from '@/api/session'
import { API_BASE } from '@/lib/config'
import type {
  ApiUser,
  AuthApiResponse,
  AuthTokenData,
  ChangeEmailRequest,
	GoogleConnectionApiResponse,
	GoogleLinkStartApiResponse,
  LoginRequest,
  MessageApiResponse,
	OAuthExchangeApiResponse,
  RegisterApiResponse,
  RegisterRequest,
	XConnectionApiResponse,
	XLinkStartApiResponse,
  VerifyLoginCodeRequest,
} from '@/types/api'
import type { AuthUser } from '@/context/AuthContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

export function toAuthUser(apiUser: ApiUser, email: string): AuthUser {
  return {
    userId:        apiUser.user_id,
    username:      apiUser.username,
    email,
    isAdmin:       apiUser.is_admin,
    emailVerified: apiUser.email_verified,
    isActive:      apiUser.is_active,
  }
}

/** The server lowercases and trims emails; mirror it so display and storage match. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** ISO 639-1 code from the browser ("en-US" → "en"), defaulting to "en". */
function browserLanguageCode(): string {
  const tag = typeof navigator !== 'undefined' ? navigator.language : ''
  const code = tag.split('-')[0]?.toLowerCase() ?? ''
  return /^[a-z]{2}$/.test(code) ? code : 'en'
}

/**
 * OAuth return locations are deliberately internal paths only. The backend
 * validates this again; doing it here avoids ever sending an accidental
 * external URL into the OAuth flow.
 */
function safeOAuthReturnPath(path: string): string {
  return path.startsWith('/') && !path.startsWith('//') ? path : '/dashboard'
}

/** A login that must be finished with the 6-digit code emailed to the user. */
export interface LoginChallenge {
  challengeId: string
  /** Masked address the code went to, e.g. s****@gmail.com. */
  emailHint:   string
  /** Epoch ms after which the code no longer works. */
  expiresAt:   number
  email:       string
}

export type LoginResult =
  | { kind: 'session'; user: AuthUser }
  | { kind: 'code'; challenge: LoginChallenge }

function beginSession(data: AuthTokenData, email: string): AuthUser {
  if (!data.user.is_active) {
    throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Account is not active', '')
  }
  startSession(data.access_token)
  return toAuthUser(data.user, email)
}

/** Result of a successful registration. `user` is null when the backend did not start a session. */
export interface RegisterResult {
  message: string
  user:    AuthUser | null
}

/** Minimum gap between warm-up pings, so reopening the modal doesn't spam /health. */
const WARM_UP_INTERVAL_MS = 60_000
let lastWarmUpAt = 0

export interface RegisterInput {
  email:      string
  password:   string
  firstName:  string
  lastName?:  string
  userName?:  string
}

// ── Auth service ──────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Start the backend-owned Google OAuth flow. The browser navigates to the
   * API so the frontend never handles Google credentials, authorization
   * codes, or client secrets.
   *
   * The API endpoint is implemented with the backend OAuth work. It will
   * validate `return_to` independently before redirecting to Google.
   */
  startGoogleOAuth(returnTo = '/dashboard'): void {
    const apiOrigin = API_BASE || window.location.origin
    const destination = new URL('/auth/oauth/google/start', apiOrigin)
    destination.searchParams.set('return_to', safeOAuthReturnPath(returnTo))
    window.location.assign(destination.toString())
  },

  /** Starts the backend-owned OAuth 1.0a Sign in with X redirect. */
  startXOAuth(returnTo = '/dashboard'): void {
    const apiOrigin = API_BASE || window.location.origin
    const destination = new URL('/auth/oauth/x/start', apiOrigin)
    destination.searchParams.set('return_to', safeOAuthReturnPath(returnTo))
    window.location.assign(destination.toString())
  },

  /**
   * Exchanges the one-time code delivered in the callback URL fragment. The
   * backend consumes it atomically, returns an access token, and sets the
   * HttpOnly refresh cookie; no Google credential reaches the UI.
   */
  async completeGoogleOAuth(code: string): Promise<{ user: AuthUser; returnTo: string }> {
    const res = await apiClient.post<OAuthExchangeApiResponse>('/auth/oauth/google/exchange', { code })
    if (!res.data.user.is_active) {
      throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Account is not active', '')
    }
    startSession(res.data.access_token)
    return {
      user:     toAuthUser(res.data.user, normalizeEmail(res.data.email)),
      returnTo: safeOAuthReturnPath(res.data.return_to),
    }
  },

  /** Exchanges a one-time X OAuth hand-off code for the normal app session. */
  async completeXOAuth(code: string): Promise<{ user: AuthUser; returnTo: string }> {
    const res = await apiClient.post<OAuthExchangeApiResponse>('/auth/oauth/x/exchange', { code })
    if (!res.data.user.is_active) {
      throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Account is not active', '')
    }
    startSession(res.data.access_token)
    return {
      user:     toAuthUser(res.data.user, normalizeEmail(res.data.email)),
      returnTo: safeOAuthReturnPath(res.data.return_to),
    }
  },

  /** Returns whether the signed-in user has linked a Google identity. */
  async getGoogleConnection(): Promise<{ connected: boolean; providerEmail?: string }> {
    const res = await apiClient.get<GoogleConnectionApiResponse>('/auth/oauth/google/link/status')
    return { connected: res.data.connected, providerEmail: res.data.provider_email }
  },

  /**
   * Starts an authenticated account-linking flow. The backend binds the state
   * to the current user, so the Google identity cannot be attached elsewhere.
   */
  async startGoogleAccountLink(): Promise<void> {
    const res = await apiClient.post<GoogleLinkStartApiResponse>('/auth/oauth/google/link/start')
    let destination: URL
    try {
      destination = new URL(res.data.authorization_url)
    } catch {
      throw new ApiError(500, 'OAUTH_FAILED', 'Google sign-in could not be started.', '')
    }
    if (destination.origin !== 'https://accounts.google.com') {
      throw new ApiError(500, 'OAUTH_FAILED', 'Google sign-in could not be started.', '')
    }
    window.location.assign(destination.toString())
  },

  /** Returns whether the signed-in user has explicitly connected X. */
  async getXConnection(): Promise<{ connected: boolean }> {
    const res = await apiClient.get<XConnectionApiResponse>('/auth/oauth/x/link/status')
    return { connected: res.data.connected }
  },

  /** Starts an authenticated X connection flow bound to the current account. */
  async startXAccountLink(): Promise<void> {
    const res = await apiClient.post<XLinkStartApiResponse>('/auth/oauth/x/link/start')
    let destination: URL
    try {
      destination = new URL(res.data.authorization_url)
    } catch {
      throw new ApiError(500, 'OAUTH_X_FAILED', 'X sign-in could not be started.', '')
    }
    if (destination.origin !== 'https://api.x.com') {
      throw new ApiError(500, 'OAUTH_X_FAILED', 'X sign-in could not be started.', '')
    }
    window.location.assign(destination.toString())
  },

  /**
   * POST /auth/login. Unverified users CAN log in; the caller routes them to
   * the verify screen. An inactive account is refused here (guide §7).
   * A login from a VPN gets no session yet: the result asks for the code the
   * API just emailed (see verifyLoginCode).
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const normalized = normalizeEmail(email)
    const payload: LoginRequest = { email: normalized, password }
    const res = await apiClient.post<AuthApiResponse>('/auth/login', payload)

    const challenge = res.data.login_challenge
    if (challenge) {
      return {
        kind: 'code',
        challenge: {
          challengeId: challenge.challenge_id,
          emailHint:   challenge.email_hint,
          expiresAt:   Date.now() + challenge.expires_in_seconds * 1000,
          email:       normalized,
        },
      }
    }
    return { kind: 'session', user: beginSession(res.data, normalized) }
  },

  /** POST /auth/login/verify-code: finishes a login that asked for an emailed code. */
  async verifyLoginCode(challenge: LoginChallenge, code: string): Promise<AuthUser> {
    const payload: VerifyLoginCodeRequest = { challenge_id: challenge.challengeId, code: code.trim() }
    const res = await apiClient.post<AuthApiResponse>('/auth/login/verify-code', payload)
    return beginSession(res.data, challenge.email)
  },

  /**
   * Fire-and-forget GET /health. The API is a serverless function backed by
   * a serverless Postgres, so the first request after idle pays a cold start;
   * /health pings the DB, waking both while the user is still typing. Called
   * when the auth modal opens; throttled, and every failure is ignored.
   */
  warmUp(): void {
    const now = Date.now()
    if (now - lastWarmUpAt < WARM_UP_INTERVAL_MS) return
    lastWarmUpAt = now
    apiClient.get<unknown>('/health').catch(() => { /* best effort only */ })
  },

  /**
   * POST /auth/register. Optional fields are omitted when empty.
   *
   * A successful registration returns an access token and sets an HttpOnly
   * refresh cookie, so the session can start without a separate login.
   */
  async register(input: RegisterInput): Promise<RegisterResult> {
    const payload: RegisterRequest = {
      email:       normalizeEmail(input.email),
      password:    input.password,
      first_name:  input.firstName.trim(),
      native_lang: browserLanguageCode(),
      ...(input.lastName?.trim() ? { last_name: input.lastName.trim() } : {}),
      ...(input.userName?.trim() ? { user_name: input.userName.trim() } : {}),
    }
    const res = await apiClient.post<RegisterApiResponse>('/auth/register', payload)
    const { message, access_token, user } = res.data

    if (!access_token || !user || !user.is_active) {
      return { message, user: null }
    }
    startSession(access_token)
    return { message, user: toAuthUser(user, payload.email) }
  },

  /** POST /auth/logout — clears locally and in all tabs, then revokes on the server. */
  logout(): Promise<void> {
    return endSession()
  },

  /** POST /auth/verify?token=… — a single call; the token is single-use. */
  async verifyEmailToken(token: string): Promise<string> {
    const res = await apiClient.post<MessageApiResponse>(`/auth/verify?token=${encodeURIComponent(token)}`)
    return res.data.message
  },

  /**
   * POST /auth/forgot-password (public). Emails an 8-character reset code.
   * Always 200 with the same message, so nothing reveals whether an account
   * exists (or whether a rate limit silently skipped the email).
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post<MessageApiResponse>('/auth/forgot-password', { email: normalizeEmail(email) })
  },

  /**
   * POST /auth/forgot-password/verify-code (public). On success the backend
   * emails a one-time reset link (/reset-password?token=…). The browser never
   * sees or builds that link.
   */
  async verifyPasswordResetCode(email: string, code: string): Promise<void> {
    await apiClient.post<MessageApiResponse>('/auth/forgot-password/verify-code', {
      email: normalizeEmail(email),
      code:  code.trim().toUpperCase(),
    })
  },

  /** POST /auth/reset-password (public). No auto-login afterwards. */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post<MessageApiResponse>('/auth/reset-password', { token, new_password: newPassword })
  },

  /** POST /auth/verification/resend (bearer). 60s cooldown, 5 per 24h. */
  async resendVerification(): Promise<string> {
    const res = await apiClient.post<MessageApiResponse>('/auth/verification/resend')
    return res.data.message
  },

  /** POST /auth/change-email (bearer). Only for unverified accounts. */
  async changeEmail(newEmail: string, currentPassword: string): Promise<string> {
    const payload: ChangeEmailRequest = { new_email: normalizeEmail(newEmail), current_password: currentPassword }
    const res = await apiClient.post<MessageApiResponse>('/auth/change-email', payload)
    return res.data.message
  },
}
