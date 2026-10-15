/**
 * App configuration — the only place that reads `import.meta.env`.
 * Env vars must be `VITE_`-prefixed to reach the browser.
 */

/** Backend base URL, no trailing slash. Empty string = same origin. */
export const API_BASE: string = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/+$/, '')

/** Shown wherever users are told to contact support (suspended/deleted accounts, etc.). */
export const SUPPORT_EMAIL = 'support@foxsensei.com'

export const IS_DEV  = import.meta.env.DEV
export const IS_PROD = import.meta.env.PROD

// Tokens must never travel over plain HTTP in production (auth guide §1).
if (IS_PROD && API_BASE.startsWith('http://')) {
  console.error('[config] VITE_API_URL uses http:// in a production build. Tokens must only be sent over HTTPS.')
}
