import type { SignUpPayload, LoginPayload, AuthResponse, OtpVerifyPayload, OtpResponse } from '@/types'
import { mockSignUpResponse, mockLoginResponse, mockOtpSuccess, mockOtpError, MOCK_OTP_CODE } from '@/api/mock/auth'

// ─── Swap mock returns for real fetch() calls when API is ready ───────────────
// signUp:  fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) })
// login:   fetch('/api/auth/login',  { method: 'POST', body: JSON.stringify(payload) })
// social:  fetch('/api/auth/social', { method: 'POST', body: JSON.stringify({ provider }) })

export const authService = {
  signUp: async (payload: SignUpPayload): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800))
    return mockSignUpResponse(payload.firstName, payload.email)
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    await new Promise((r) => setTimeout(r, 800))
    return mockLoginResponse(payload.email)
  },

  socialAuth: async (provider: 'google' | 'apple'): Promise<AuthResponse> => {
    await new Promise((r) => setTimeout(r, 600))
    return mockLoginResponse(`user@${provider}.com`)
  },

  // ── OTP ────────────────────────────────────────────────────────────────────
  // Replace with: fetch('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) })
  verifyOtp: async (payload: OtpVerifyPayload): Promise<OtpResponse> => {
    await new Promise((r) => setTimeout(r, 700))
    return payload.code === MOCK_OTP_CODE ? mockOtpSuccess : mockOtpError
  },

  // Replace with: fetch('/api/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) })
  resendOtp: async (_email: string): Promise<OtpResponse> => {
    await new Promise((r) => setTimeout(r, 500))
    return { success: true, message: 'A new code has been sent.' }
  },
}
