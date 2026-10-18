/**
 * App configuration — the only place that reads `import.meta.env`.
 * Env vars must be `VITE_`-prefixed to reach the browser.
 */

/** Backend base URL, no trailing slash. Empty string = same origin. */
export const API_BASE: string = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/+$/, '')

/** R2 CDN base URL for images, no trailing slash. Empty string = serve from `public/`. */
export const CDN_BASE: string = ((import.meta.env.VITE_CDN_URL as string | undefined) ?? '').replace(/\/+$/, '')

/**
 * Google Maps Embed API key for the login-location maps. Restrict it to the
 * site's referrers in Google Cloud; it is public by nature. Empty = show a
 * plain "Open in Google Maps" link instead of a map.
 */
export const GOOGLE_MAPS_EMBED_KEY: string = (import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY as string | undefined) ?? ''

/** Shown wherever users are told to contact support (suspended/deleted accounts, etc.). */
export const SUPPORT_EMAIL = 'support@foxsensei.com'

export const IS_DEV  = import.meta.env.DEV
export const IS_PROD = import.meta.env.PROD

// Tokens must never travel over plain HTTP in production (auth guide §1).
if (IS_PROD && API_BASE.startsWith('http://')) {
  console.error('[config] VITE_API_URL uses http:// in a production build. Tokens must only be sent over HTTPS.')
}
