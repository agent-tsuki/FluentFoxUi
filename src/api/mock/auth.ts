import type { AuthResponse } from '@/types'

export const mockSignUpResponse = (firstName: string, email: string): AuthResponse => ({
  success: true,
  message: 'Account created successfully.',
  user: { id: 'mock-001', firstName, email },
})

export const mockLoginResponse = (email: string): AuthResponse => ({
  success: true,
  message: 'Logged in successfully.',
  user: { id: 'mock-001', firstName: 'Scholar', email },
})

export const mockAuthError: AuthResponse = {
  success: false,
  message: 'Invalid credentials. Please try again.',
}

// Mock OTP — in production the real code is sent via email.
// This constant must NEVER reach a production build.
if (import.meta.env.PROD) {
  throw new Error(
    '[FluentFox] MOCK_OTP_CODE is present in a production build. ' +
    'Replace authService with real API calls before deploying.',
  )
}
export const MOCK_OTP_CODE = '123456'

export const mockOtpSuccess = { success: true, message: 'Email verified. Welcome aboard!' }
export const mockOtpError = { success: false, message: 'Invalid code. Please try again.' }
