/**
 * Auth service — all auth endpoints wired to the real backend.
 *
 * Token split:
 *  - access_token  → Zustand memory (useAuthTokenStore.setAccessToken)
 *  - refresh_token → localStorage   (tokenManager.setRefreshToken)
 *
 * This service stays thin: set tokens, map ApiUser → AuthUser, return result.
 * Retry / refresh logic lives in apiClient — nothing here duplicates it.
 */

import { apiClient } from '@/api/client'
import { tokenManager } from '@/api/tokenManager'
import { useAuthTokenStore } from '@/store/authStore'
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

// ── Helper: map ApiUser → AuthUser ────────────────────────────────────────────

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

// ── Helper: store both tokens after login / refresh ───────────────────────────

function storeTokens(accessToken: string, refreshToken: string): void {
  useAuthTokenStore.getState().setAccessToken(accessToken)
  tokenManager.setRefreshToken(refreshToken)
}

// ── Auth service ──────────────────────────────────────────────────────────────

export const authService = {
  /**
   * POST /auth/login
   * Stores access token in Zustand memory, refresh token in localStorage.
   * Returns a normalised AuthUser for the UI.
   */
  async login(email: string, password: string): Promise<AuthUser> {
    const payload: LoginRequest = { email, password }
    const res = await apiClient.post<AuthApiResponse>('/auth/login', payload)

    storeTokens(res.data.access_token, res.data.refresh_token)
    return buildAuthUser(res.data.user, email)
  },

  /**
   * POST /auth/logout
   * Clears tokens immediately (UI is instant); then fires the server call.
   * Even if the network call fails, the user is logged out locally.
   */
  async logout(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken()

    // Clear tokens before the network call so the UI never waits
    useAuthTokenStore.getState().clearAccessToken()
    tokenManager.clearRefreshToken()

    if (!refreshToken) return

    const payload: LogoutRequest = { refresh_token: refreshToken }
    await apiClient.post<MessageApiResponse>('/auth/logout', payload)
  },

  /**
   * POST /auth/refresh
   * Rotates both tokens and returns the refreshed AuthUser.
   * Called by AuthContext on mount to restore a session after page refresh.
   * Automatic retry on 401 is handled inside apiClient — not here.
   */
  async refreshSession(email: string): Promise<AuthUser> {
    const refreshToken = tokenManager.getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token available.')

    const payload: RefreshTokenRequest = { refresh_token: refreshToken }
    const res = await apiClient.post<AuthApiResponse>('/auth/refresh', payload)

    storeTokens(res.data.access_token, res.data.refresh_token)
    return buildAuthUser(res.data.user, email)
  },

  /**
   * POST /auth/register
   * Creates a new account. Server responds with a message asking the user
   * to check their email for a verification link.
   */
  async register(payload: RegisterRequest): Promise<string> {
    const res = await apiClient.post<MessageApiResponse>('/auth/register', payload)
    return res.data.message
  },

  /**
   * POST /auth/verify
   * Verifies a signup email using the token from the email link (?token=…).
   * If the backend returns tokens, the user is silently logged in.
   * Returns { loggedIn, user?, message }.
   */
  async verifyEmailToken(token: string): Promise<{ loggedIn: boolean; user?: AuthUser; message: string }> {
    const url = `/auth/verify?token=${encodeURIComponent(token)}`

    // Try auth response first (backend may return tokens on verify)
    try {
      const res = await apiClient.post<AuthApiResponse>(url, {})
      if (res.data?.access_token && res.data?.refresh_token) {
        storeTokens(res.data.access_token, res.data.refresh_token)
        // email is inside the JWT — we don't have it here, so leave it blank;
        // AuthContext will populate it from the stored user once the user navigates
        const user = buildAuthUser(res.data.user, '')
        return { loggedIn: true, user, message: 'Email verified! You are now logged in.' }
      }
    } catch (err) {
      // Re-throw so VerifyEmailPage can handle specific error codes
      throw err
    }

    // Backend returned 200 but no tokens — just a message
    const res = await apiClient.post<MessageApiResponse>(url, {})
    return { loggedIn: false, message: res.data.message }
  },

  // ── Mocked endpoints (real API endpoints not yet confirmed) ───────────────

  /** Verify OTP code sent to email (login with OTP flow). */
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
