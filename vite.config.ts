import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
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
 * - Scripts: same origin only. No inline scripts, no eval.
 * - Styles: 'unsafe-inline' is needed for runtime style attributes
 *   (framer-motion, lottie). It does not allow script execution.
 * - Workers: blob: for canvas-confetti's off-main-thread renderer.
 * - Frames: only YouTube's privacy-enhanced player, loaded on click by
 *   VideoEmbed (its thumbnails come from i.ytimg.com via img-src https:).
 */
function contentSecurityPolicy(apiUrl: string | undefined): Plugin {
  const api = apiOrigin(apiUrl)
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src 'self'${api ? ` ${api}` : ''}`,
    "worker-src 'self' blob:",
    'frame-src https://www.youtube-nocookie.com',
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      react(),
      contentSecurityPolicy(env.VITE_API_URL),
      apiPreconnect(env.VITE_API_URL),
      grammarChapters(fileURLToPath(new URL('./src/assets/grammar', import.meta.url))),
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
