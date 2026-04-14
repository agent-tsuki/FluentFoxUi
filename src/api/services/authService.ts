/**
 * Auth service — all four auth endpoints wired to the real backend.
 *
 * Base URL comes from VITE_API_URL in .env. Change it there; nothing here moves.
 *
 * Token management is delegated to tokenManager so this service stays thin:
 *  - login   → POST /auth/login      → stores tokens, returns AuthUser
 *  - logout  → POST /auth/logout     → clears tokens, fire-and-forget server call
 *  - refresh → POST /auth/refresh    → rotates tokens, returns AuthUser
 *  - register → POST /auth/register  → returns server message
 */

import { apiClient } from '@/api/client'
import { tokenManager } from '@/api/tokenManager'
import type {
  AuthApiResponse,
  MessageApiResponse,
  LoginRequest,
  RegisterRequest,
  LogoutRequest,
  RefreshTokenRequest,
} from '@/types/api'
import type { OtpVerifyPayload, OtpResponse } from '@/types'
import type { AuthUser } from '@/context/AuthContext'
import { mockOtpSuccess, mockOtpError, MOCK_OTP_CODE } from '@/api/mock/auth'

// ── Helper: map server ApiUser → AuthUser (app-level shape) ──────────────────

function buildAuthUser(
  apiUser: AuthApiResponse['data']['user'],
  email: string,
): AuthUser {
  return {
    userId:        apiUser.user_id,
    username:      apiUser.username,
    email,
    isAdmin:       apiUser.is_admin,
    emailVerified: apiUser.email_verified,
    isActive:      apiUser.is_active,
  }
}

// ── Auth service ──────────────────────────────────────────────────────────────

export const authService = {
  /**
   * POST /auth/login
   * Stores access + refresh tokens, returns a normalised AuthUser.
   */
  async login(email: string, password: string): Promise<AuthUser> {
    const payload: LoginRequest = { email, password }
    const res = await apiClient.post<AuthApiResponse>('/auth/login', payload)

    tokenManager.setTokens(res.data.access_token, res.data.refresh_token)
    return buildAuthUser(res.data.user, email)
  },

  /**
   * POST /auth/logout
   * Clears local tokens immediately; then fires the server call.
   * Even if the network call fails, the user is logged out locally.
   */
  async logout(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken()
    tokenManager.clearTokens()

    if (!refreshToken) return

    const payload: LogoutRequest = { refresh_token: refreshToken }
    // Intentionally not awaited at the call-site so UI is instant.
    // We still await inside to surface any unexpected throws to callers who do await.
    await apiClient.post<MessageApiResponse>('/auth/logout', payload)
  },

  /**
   * POST /auth/refresh
   * Rotates both tokens and returns the refreshed AuthUser.
   * Called automatically by apiClient on 401; can also be called manually.
   */
  async refreshToken(email: string): Promise<AuthUser> {
    const refreshToken = tokenManager.getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token available.')

    const payload: RefreshTokenRequest = { refresh_token: refreshToken }
    const res = await apiClient.post<AuthApiResponse>('/auth/refresh', payload)

    tokenManager.setTokens(res.data.access_token, res.data.refresh_token)
    return buildAuthUser(res.data.user, email)
  },

  /**
   * POST /auth/register
   * Creates a new account. Server responds with a message asking the user
   * to check their email for verification.
   */
  async register(payload: RegisterRequest): Promise<string> {
    const res = await apiClient.post<MessageApiResponse>('/auth/register', payload)
    return res.data.message
  },

  // ── Mocked endpoints (real API endpoints not yet provided) ────────────────

  /** Verify OTP code sent to email after registration. */
  async verifyOtp(payload: OtpVerifyPayload): Promise<OtpResponse> {
    await new Promise(r => setTimeout(r, 700))
    return payload.code === MOCK_OTP_CODE ? mockOtpSuccess : mockOtpError
  },

  /** Resend OTP code. */
  async resendOtp(_email: string): Promise<OtpResponse> {
    await new Promise(r => setTimeout(r, 500))
    return { success: true, message: 'A new code has been sent.' }
  },

  /** Forgot password — always returns success to avoid user enumeration. */
  async forgotPassword(_email: string): Promise<OtpResponse> {
    await new Promise(r => setTimeout(r, 800))
    return { success: true, message: 'If that email is registered, a reset link has been sent.' }
  },
}
