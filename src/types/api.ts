/**
 * Server API response shapes.
 * These types mirror the exact JSON your backend returns.
 * If the server schema changes, update here — nothing else needs touching.
 */

// ── Generic wrapper ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  $schema?: string
  status: 'success' | 'error'
  data: T
}

// ── Structured error response (status: "failed") ──────────────────────────────

export interface ApiErrorPayload {
  log_id:     string
  error_code: string
  message:    string
}

export interface ApiFailedResponse {
  status: 'failed'
  error:  ApiErrorPayload
}

/** Type guard — returns true if the value is a server-side failed response. */
export function isApiFailedResponse(body: unknown): body is ApiFailedResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    (body as ApiFailedResponse).status === 'failed' &&
    typeof (body as ApiFailedResponse).error === 'object'
  )
}

// ── User object returned inside auth responses ─────────────────────────────────

export interface ApiUser {
  user_id: string
  username: string
  is_admin: boolean
  email_verified: boolean
  is_active: boolean
}

// ── Auth token payload (login + refresh) ──────────────────────────────────────

export interface AuthTokenData {
  access_token: string
  refresh_token: string
  user: ApiUser
}

/** One-use response returned after the backend completes Google OAuth. */
export interface OAuthExchangeData extends AuthTokenData {
	email: string
	/** Server-validated internal route to continue to after sign-in. */
	return_to: string
}

/** Authenticated account-linking endpoints for the Google provider. */
export interface GoogleConnectionData {
  connected:       boolean
  provider_email?: string
}

export interface GoogleLinkStartData {
  authorization_url: string
}

/** Authenticated connection state for the X provider. */
export interface XConnectionData {
  connected: boolean
}

export interface XLinkStartData {
  authorization_url: string
}

// ── Simple message payload (register, logout) ─────────────────────────────────

export interface MessageData {
  message: string
}

/**
 * POST /auth/register success payload. Newer backends start the session
 * straight away (same token/user shape as login); older ones return only
 * `message`, so the session fields are optional and the caller falls back
 * to an explicit login.
 */
export interface RegisterData extends MessageData, Partial<AuthTokenData> {}

// ── Typed convenience aliases ─────────────────────────────────────────────────

export type AuthApiResponse    = ApiResponse<AuthTokenData>
export type OAuthExchangeApiResponse = ApiResponse<OAuthExchangeData>
export type GoogleConnectionApiResponse = ApiResponse<GoogleConnectionData>
export type GoogleLinkStartApiResponse = ApiResponse<GoogleLinkStartData>
export type XConnectionApiResponse = ApiResponse<XConnectionData>
export type XLinkStartApiResponse = ApiResponse<XLinkStartData>
export type MessageApiResponse = ApiResponse<MessageData>
export type RegisterApiResponse = ApiResponse<RegisterData>

// ── Request bodies ─────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email:         string
  password:      string
  first_name:    string
  /** ISO 639-1 code, e.g. "en". */
  native_lang:   string
  last_name?:    string
  /** Omit to let the server generate one. */
  user_name?:    string
  phone_number?: string
}

export interface ChangeEmailRequest {
  new_email:        string
  current_password: string
}

export interface LogoutRequest {
  refresh_token: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}
