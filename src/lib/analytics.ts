/**
 * Cloudflare Web Analytics. The beacon loads once the first screen has settled
 * (or on the first interaction), so it never competes with the page's main
 * content on slow connections; it still reports the page-load timings because
 * it reads them from the Performance API. Production builds only (the CSP
 * allows its origin).
 */
import { IS_PROD } from '@/lib/config'
import { whenPageSettles } from '@/lib/afterPageSettles'

const BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js'
const BEACON_CONFIG = '{"token": "e78737c574d94d768432ea2036b00c03"}'

export function loadAnalyticsAfterPageLoad(): void {
  if (!IS_PROD || typeof window === 'undefined') return
  const inject = () => {
    const script = document.createElement('script')
    script.src = BEACON_SRC
    script.defer = true
    script.dataset.cfBeacon = BEACON_CONFIG
    document.body.appendChild(script)
  }
  whenPageSettles(inject)
}
