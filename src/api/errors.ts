/**
 * Centralised error handling for the API layer.
 *
 * ApiError     — typed error thrown by apiClient for every non-success response.
 * ERROR_MESSAGES — maps server error_code → user-facing string.
 * resolveErrorMessage — call this in any catch block to get a displayable string.
 */

// ── ApiError class ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  readonly httpStatus: number
  readonly errorCode:  string
  readonly logId:      string

  constructor(httpStatus: number, errorCode: string, serverMessage: string, logId: string) {
    super(serverMessage)
    this.name       = 'ApiError'
    this.httpStatus = httpStatus
    this.errorCode  = errorCode
    this.logId      = logId
  }
}

// ── Error code → user-facing message map ─────────────────────────────────────
// Add new codes here as the backend introduces them. Never show raw error_codes
// or internal server messages to users — always go through this map first.

const ERROR_MESSAGES: Record<string, string> = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  UNAUTHORIZE:              'Please verify your email before logging in. Check your inbox.',
  UNAUTHORIZED:             'Please verify your email before logging in. Check your inbox.',
  INVALID_CREDENTIALS:      'Incorrect email or password.',
  ACCOUNT_NOT_VERIFIED:     'Please verify your email before logging in. Check your inbox.',
  ACCOUNT_DISABLED:         'Your account has been suspended. Please contact support.',
  SESSION_EXPIRED:          'Your session has expired. Please log in again.',
  TOKEN_EXPIRED:            'Your session has expired. Please log in again.',
  INVALID_TOKEN:            'Invalid session. Please log in again.',

  // ── Registration ──────────────────────────────────────────────────────────
  EMAIL_ALREADY_IN_USE:     'This email is already registered. Try logging in instead.',
  USERNAME_ALREADY_IN_USE:  'That username is taken. Please choose a different one.',
  WEAK_PASSWORD:            "Password doesn't meet the requirements.",
  INVALID_EMAIL:            'Please enter a valid email address.',
  INVALID_PHONE:            'Please enter a valid phone number.',

  // ── Rate limiting ─────────────────────────────────────────────────────────
  RATE_LIMIT_EXCEEDED:      'Too many attempts. Please wait a moment and try again.',
  TOO_MANY_REQUESTS:        'Too many attempts. Please wait a moment and try again.',

  // ── Server / network ──────────────────────────────────────────────────────
  INTERNAL_SERVER_ERROR:    'Something went wrong on our end. Please try again shortly.',
  SERVICE_UNAVAILABLE:      'Service is temporarily unavailable. Please try again later.',
}

// ── resolveErrorMessage ───────────────────────────────────────────────────────

/**
 * Convert any caught error into a safe, user-readable string.
 *
 * Priority:
 *  1. Known error_code  → friendly mapped message
 *  2. Unknown error_code → server's own message + short Ref ID for support
 *  3. Plain Error        → error.message
 *  4. Anything else      → generic fallback
 */
export function resolveErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const mapped = ERROR_MESSAGES[err.errorCode]
    if (mapped) return mapped

    // Unknown code: show server message and a short ref so the user can report it
    const ref = err.logId ? `  (Ref: ${err.logId.slice(0, 8)})` : ''
    return (err.message || 'An unexpected error occurred.') + ref
  }

  if (err instanceof Error) return err.message

  return 'An unexpected error occurred. Please try again.'
}
