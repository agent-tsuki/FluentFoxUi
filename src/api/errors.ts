/**
 * Centralised error handling for the API layer.
 *
 * ApiError            — typed error thrown by apiClient for every non-success response.
 * ERROR_MESSAGES      — maps server error_code → user-facing string (auth guide §4).
 * resolveErrorMessage — call this in any catch block to get a displayable string.
 *
 * Always branch on `errorCode`, never on the server's message wording.
 */

// ── ApiError class ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  readonly httpStatus: number
  readonly errorCode:  string
  readonly logId:      string
  /**
   * Seconds from the `Retry-After` header on 429s. `undefined` when the header
   * is absent or not exposed to the browser via CORS (auth guide §6).
   */
  readonly retryAfter?: number

  constructor(httpStatus: number, errorCode: string, serverMessage: string, logId: string, retryAfter?: number) {
    super(serverMessage)
    this.name       = 'ApiError'
    this.httpStatus = httpStatus
    this.errorCode  = errorCode
    this.logId      = logId
    this.retryAfter = retryAfter
  }
}

// ── Error code → user-facing message map ─────────────────────────────────────
// Add new codes here as the backend introduces them.

const ERROR_MESSAGES: Record<string, string> = {
  // ── Login / session ───────────────────────────────────────────────────────
  // One generic message on purpose: the API does not reveal whether an email exists.
  INVALID_CREDENTIALS:        'Email or password is incorrect.',
  ACCOUNT_SUSPENDED:          'Your account is suspended. Please contact support.',
  ACCOUNT_DELETED:            'This account has been deleted. Please contact support.',
  ACCOUNT_INACTIVE:           'Your account is not active. Contact support.',
  SESSION_EXPIRED:            'Your session has expired. Please log in again.',
  TOKEN_EXPIRED:              'Your session has expired. Please log in again.',
  TOKEN_INVALID:              'Your session has expired. Please log in again.',
  UNAUTHORIZED:               'Please log in to continue.',
  USER_NOT_FOUND:             'Your session has ended. Please log in again.',
  EMAIL_NOT_VERIFIED:         'Please verify your email to continue.',

  // ── Registration / email ──────────────────────────────────────────────────
  EMAIL_ALREADY_IN_USE:       'An account with this email already exists.',
  USERNAME_ALREADY_IN_USE:    'That username is taken. Please choose another.',
  DISPOSABLE_EMAIL:           'Temporary email addresses are not allowed.',
  INVALID_EMAIL_DOMAIN:       "This email domain can't receive mail. Check the address.",
  EMAIL_DOMAIN_TYPO:          'That email address looks mistyped. Check the domain.',
  EMAIL_SEND_FAILED:          "We couldn't send the email. Please try again.",
  EMAIL_UNCHANGED:            "That's already your email.",
  INVALID_CURRENT_PASSWORD:   'Current password is incorrect.',
  VALIDATION_ERROR:           'Please check the highlighted fields and try again.',

  // ── Verification ──────────────────────────────────────────────────────────
  EMAIL_ALREADY_VERIFIED:     'Your email is already verified.',
  VERIFICATION_COOLDOWN:      'Please wait a moment before requesting another email.',
  VERIFICATION_DAILY_LIMIT:   "You've reached today's limit. Try again later.",
  REQUEST_EXPIRED:            'This link has expired or a newer one was sent.',
  RESOURCE_NOT_FOUND:         'This link is invalid.',
  OPERATION_ALREADY_PERFORMED:'Your email is already verified.',
  BAD_REQUEST:                'This link is invalid. Please request a new one.',

  // ── Password reset (code by email → reset link by email) ──────────────────
  PASSWORD_RESET_CODE_INVALID:      'That code is invalid or has expired. Request a new code and try again.',
  PASSWORD_RESET_TOKEN_INVALID:     'This reset link is invalid, expired, or has already been used.',
  PASSWORD_RESET_EMAIL_SEND_FAILED: "We couldn't send the reset link. Please try again.",

  // ── Connected accounts ──────────────────────────────────────────────────
  OAUTH_UNAVAILABLE:              'Google sign-in is not configured yet. Please try again later.',
  OAUTH_LINK_EMAIL_MISMATCH:      'Choose the Google account that uses your FoxSensei email address.',
  OAUTH_IDENTITY_ALREADY_LINKED:  'That Google account is already connected to another FoxSensei account.',
  OAUTH_EMAIL_NOT_VERIFIED:       'Google has not verified this email address. Choose another Google account.',
  OAUTH_FAILED:                   'Google sign-in could not be completed. Please try again.',

  // ── Network (client-side) ─────────────────────────────────────────────────
  NETWORK_ERROR:              "Can't reach the server. Check your connection and try again.",
}

/** Codes where support needs the log id to investigate. */
const SHOW_LOG_ID = new Set(['INTERNAL_ERROR', 'INTERNAL_SERVER_ERROR'])

// ── resolveErrorMessage ───────────────────────────────────────────────────────

/**
 * Convert any caught error into a safe, user-readable string.
 *
 *  1. Known error_code   → friendly mapped message
 *  2. Server error / unknown code → generic text + short reference id for support
 *  3. Plain Error        → error.message
 *  4. Anything else      → generic fallback
 */
export function resolveErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const mapped = ERROR_MESSAGES[err.errorCode]
    if (mapped) return mapped

    const ref = err.logId ? ` (Ref: ${err.logId})` : ''
    if (SHOW_LOG_ID.has(err.errorCode) || err.httpStatus >= 500) {
      return `Something went wrong on our end. Please try again.${ref}`
    }
    return (err.message || 'An unexpected error occurred.') + ref
  }

  if (err instanceof Error) return err.message

  return 'An unexpected error occurred. Please try again.'
}

/** True when the error carries one of the given codes. */
export function hasErrorCode(err: unknown, ...codes: string[]): err is ApiError {
  return err instanceof ApiError && codes.includes(err.errorCode)
}

/**
 * For EMAIL_DOMAIN_TYPO the server message carries the suggestion, e.g.
 * "did you mean you@gmail.com?". Returns that address, or null.
 */
export function getEmailSuggestion(err: unknown): string | null {
  if (!hasErrorCode(err, 'EMAIL_DOMAIN_TYPO')) return null
  const match = err.message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match ? match[0].toLowerCase() : null
}
