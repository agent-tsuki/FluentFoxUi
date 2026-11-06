/**
 * Spread onto an <img> that is the first thing a page shows (its largest
 * content), so the browser fetches it before other images. React 18 doesn't
 * know the camel-case `fetchPriority` prop yet, so this sets the lowercase
 * HTML attribute directly.
 */
export const HIGH_FETCH_PRIORITY = { fetchpriority: 'high' } as Record<string, string>
