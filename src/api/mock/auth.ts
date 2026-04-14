/**
 * Mock data for OTP verification only.
 * Login, logout, refresh, and register now hit the real backend.
 *
 * MOCK_OTP_CODE is for local development only.
 * Remove this file once /auth/verify-otp is wired to the real endpoint.
 */

export const MOCK_OTP_CODE = '123456'

export const mockOtpSuccess = { success: true, message: 'Email verified. Welcome aboard!' }
export const mockOtpError   = { success: false, message: 'Invalid code. Please try again.' }
