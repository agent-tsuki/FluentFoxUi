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
//
// The refresh credential is deliberately not represented here. The API stores
// it in an HttpOnly cookie, so JavaScript never receives, persists, or sends it.

export interface AuthTokenData {
  access_token: string
  user: ApiUser
  /** Present instead of a session when the login needs an emailed code (VPN detected). */
  login_challenge?: ApiLoginChallenge
}

export interface ApiLoginChallenge {
  challenge_id:       string
  reason:             'vpn'
  email_hint:         string
  expires_in_seconds: number
}

export interface VerifyLoginCodeRequest {
  challenge_id: string
  code:         string
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface ApiAvatar {
  kind:       'upload' | 'preset' | 'oauth' | 'default'
  preset_id?: string
  url:        string
}

export interface ApiSessionLocation {
  country_code: string | null
  region:       string | null
  city:         string | null
  latitude:     number | null
  longitude:    number | null
  source:       'ip' | 'gps' | null
  accuracy_m:   number | null
}

export interface ApiSession {
  id:           string
  browser:      string
  os:           string
  device_type:  'desktop' | 'mobile' | 'tablet' | 'unknown'
  ip_approx:    string
  location:     ApiSessionLocation
  is_vpn:       boolean | null
  is_current:   boolean
  created_at:   string
  last_used_at: string
}

export interface ApiProfile {
  user_id:         string
  username:        string
  email:           string
  email_verified:  boolean
  first_name:      string
  last_name:       string | null
  bio:             string | null
  native_language: string
  country_code:    string | null
  city:            string | null
  target_level:    'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null
  time_zone:       string | null
  daily_reminder:  boolean
  reminder_time:   string | null
  avatar:          ApiAvatar
  joined_at:       string
  last_login_at:   string | null
  last_login:      ApiSession | null
}

export interface ApiProfileUpdate {
  first_name?:      string
  last_name?:       string
  bio?:             string
  native_language?: string
  country_code?:    string
  city?:            string
  target_level?:    string
  time_zone?:       string
  avatar_preset?:   string
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
 * POST /auth/register success payload. A successful registration starts a
 * session: the access token is returned here and the refresh credential is set
 * as an HttpOnly cookie by the API.
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
