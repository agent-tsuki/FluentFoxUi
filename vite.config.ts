import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'
import { grammarChapters } from './vite-plugins/grammarChapters'

/** Origin of the API (scheme + host + port), or null when unset/invalid. */
function apiOrigin(apiUrl: string | undefined): string | null {
  if (!apiUrl) return null
  try {
    return new URL(apiUrl).origin
  } catch {
    return null
  }
}

/**
 * Strict Content Security Policy for production builds (auth guide §7).
 *
 * Injected as a <meta> tag so `connect-src` follows VITE_API_URL per
 * environment. Build-only: Vite's dev server relies on an inline script.
 * `frame-ancestors`, HSTS and the other headers a meta tag can't carry are
 * set in vercel.json.
 *
 * - Scripts: same origin plus the Cloudflare Web Analytics beacon. No inline
 *   scripts or eval.
 * - Styles: 'unsafe-inline' is needed for runtime style attributes
 *   (framer-motion, lottie). It does not allow script execution.
 * - Workers: blob: for canvas-confetti's off-main-thread renderer.
 * - Frames: YouTube's privacy-enhanced player, loaded on click by
 *   VideoEmbed (its thumbnails come from i.ytimg.com via img-src https:),
 *   and Google Maps Embed for login locations.
 */
function contentSecurityPolicy(apiUrl: string | undefined, cdnUrl: string | undefined): Plugin {
  const api = apiOrigin(apiUrl)
  // Stroke JSON is fetched from the CDN; images already pass under img-src https:.
  const cdn = apiOrigin(cdnUrl)
  const policy = [
    "default-src 'self'",
    "script-src 'self' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src 'self' https://cloudflareinsights.com${api ? ` ${api}` : ''}${cdn ? ` ${cdn}` : ''}`,
    "worker-src 'self' blob:",
    // Google Maps Embed shows login locations in Account Settings.
    'frame-src https://www.youtube-nocookie.com https://www.google.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ')

  return {
    name: 'foxsensei-csp',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: policy }, injectTo: 'head-prepend' },
    ],
  }
}

/**
 * `<link rel="preconnect">` to the API origin, so DNS + TLS are done before
 * the first API call (the auth modal's /health warm-up, login, …). The origin
 * is only known at build time (VITE_API_URL), hence a plugin. `crossorigin`
 * because API requests are CORS requests; without it the browser opens a
 * second connection. Skipped when the API is same-origin or unset.
 */
function apiPreconnect(apiUrl: string | undefined): Plugin {
  const api = apiOrigin(apiUrl)
  return {
    name: 'foxsensei-api-preconnect',
    transformIndexHtml: () =>
      api ? [{ tag: 'link', attrs: { rel: 'preconnect', href: api, crossorigin: '' }, injectTo: 'head' }] : [],
  }
}

/**
 * `<link rel="preconnect">` to the image CDN so the first image does not wait
 * on DNS + TLS. No `crossorigin`: images are plain (non-CORS) requests, and
 * they are what blocks the first paint.
 */
function cdnPreconnect(cdnUrl: string | undefined): Plugin {
  const cdn = apiOrigin(cdnUrl)
  return {
    name: 'foxsensei-cdn-preconnect',
    transformIndexHtml: () =>
      cdn ? [{ tag: 'link', attrs: { rel: 'preconnect', href: cdn }, injectTo: 'head' }] : [],
  }
}

/**
 * Long-lived vendor chunks: libraries change far less often than app code,
 * so splitting them out lets browsers keep them cached across deploys.
 * lottie-web is only reached through lazy imports, so its chunk stays off
 * the initial load.
 */
const VENDOR_CHUNKS: Record<string, string[]> = {
  'vendor-react':  ['react', 'react-dom', 'scheduler'],
  'vendor-router': ['react-router', 'react-router-dom', '@remix-run/router'],
  'vendor-motion': ['framer-motion', 'motion-dom', 'motion-utils'],
  'vendor-lottie': ['lottie-react', 'lottie-web'],
}

function vendorChunk(id: string): string | undefined {
  if (!id.includes('/node_modules/')) return undefined
  for (const [chunk, packages] of Object.entries(VENDOR_CHUNKS)) {
    if (packages.some(pkg => id.includes(`/node_modules/${pkg}/`))) return chunk
  }
  return undefined
}

const YEAR_SECONDS = 60 * 60 * 24 * 365
const MONTH_SECONDS = 60 * 60 * 24 * 30

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Caching-only service worker (no offline mode).
 *
 * - Nothing is precached: a visit downloads only what the open page uses, and
 *   the worker keeps it for the next visit (mobile browsers evict the HTTP
 *   cache far sooner than Cache Storage).
 * - No navigation fallback: HTML always comes from the network, so a deploy is
 *   picked up on the next load and nobody is stuck on an old app.
 * - CDN images are left to the HTTP cache (year-long, immutable). Plain <img>
 *   requests are opaque, and Chrome counts each cached opaque response as
 *   several MB of storage quota.
 * - Registered from an external /registerSW.js because the CSP forbids inline scripts.
 */
function serviceWorker(cdnUrl: string | undefined): Plugin[] {
  const cdn = apiOrigin(cdnUrl)
  const strokeRuntimeCache = cdn
    ? [{
        urlPattern: new RegExp(`^${escapeRegExp(cdn)}/(?:kanji|kana)/.*\\.json$`),
        handler: 'StaleWhileRevalidate' as const,
        options: {
          cacheName: 'strokes',
          expiration: { maxEntries: 400, maxAgeSeconds: MONTH_SECONDS },
          cacheableResponse: { statuses: [200] },
        },
      }]
    : []

  return VitePWA({
    injectRegister: 'script-defer',
    registerType: 'autoUpdate',
    manifest: false,
    workbox: {
      globPatterns: [],
      navigateFallback: null,
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          // Hashed build output never changes under the same name.
          urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/assets/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'app-assets',
            expiration: { maxEntries: 300, maxAgeSeconds: MONTH_SECONDS },
            cacheableResponse: { statuses: [200] },
          },
        },
        ...strokeRuntimeCache,
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'google-font-styles', cacheableResponse: { statuses: [200] } },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-font-files',
            expiration: { maxEntries: 30, maxAgeSeconds: YEAR_SECONDS },
            cacheableResponse: { statuses: [200] },
          },
        },
      ],
    },
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      react(),
      contentSecurityPolicy(env.VITE_API_URL, env.VITE_CDN_URL),
      apiPreconnect(env.VITE_API_URL),
      cdnPreconnect(env.VITE_CDN_URL),
      grammarChapters(fileURLToPath(new URL('./src/assets/grammar', import.meta.url))),
      serviceWorker(env.VITE_CDN_URL),
    ],
    build: {
      rollupOptions: {
        output: { manualChunks: vendorChunk },
      },
    },
    assetsInclude: ['**/*.lottie'],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
