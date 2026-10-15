import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react(), contentSecurityPolicy(env.VITE_API_URL)],
    assetsInclude: ['**/*.lottie'],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
