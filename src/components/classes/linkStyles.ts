/**
 * Class strings for links styled as buttons on the Classes pages (Button is a
 * <button>; these are <a>/<Link>). Mirrors Button's primary/outline variants.
 */
const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition duration-200 ease-out ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ' +
  'motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]'

export const LINK_BUTTON = {
  primary: `${BASE} bg-primary text-on-primary shadow-elevation-1 hover:shadow-elevation-2`,
  outline: `${BASE} border-2 border-outline-variant/40 text-on-surface hover:bg-surface-container-low`,
} as const
