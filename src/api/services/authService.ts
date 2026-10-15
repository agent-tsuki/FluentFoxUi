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
  ChangeEmailRequest,
  LoginRequest,
  MessageApiResponse,
  RegisterRequest,
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

  /**
   * POST /auth/login. Unverified users CAN log in; the caller routes them to
   * the verify screen. An inactive account is refused here (guide §7).
   */
  async login(email: string, password: string): Promise<AuthUser> {
    const normalized = normalizeEmail(email)
    const payload: LoginRequest = { email: normalized, password }
    const res = await apiClient.post<AuthApiResponse>('/auth/login', payload)

    if (!res.data.user.is_active) {
      throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Account is not active', '')
    }
    startSession(res.data.access_token, res.data.refresh_token)
    return toAuthUser(res.data.user, normalized)
  },

  /** POST /auth/register. Optional fields are omitted when empty. */
  async register(input: RegisterInput): Promise<string> {
    const payload: RegisterRequest = {
      email:       normalizeEmail(input.email),
      password:    input.password,
      first_name:  input.firstName.trim(),
      native_lang: browserLanguageCode(),
      ...(input.lastName?.trim() ? { last_name: input.lastName.trim() } : {}),
      ...(input.userName?.trim() ? { user_name: input.userName.trim() } : {}),
    }
    const res = await apiClient.post<MessageApiResponse>('/auth/register', payload)
    return res.data.message
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
