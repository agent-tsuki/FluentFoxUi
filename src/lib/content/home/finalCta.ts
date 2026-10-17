/**
 * Copy for the homepage closing call-to-action band (FinalCta).
 * Edit freely — the component renders whatever is here.
 */

export interface FinalCtaCopy {
  title: string
  body: string
  cta: string
  note: string
  /** Large decorative Japanese watermark behind the band (hidden from screen readers). */
  watermark: string
}

export const FINAL_CTA_COPY: FinalCtaCopy = {
  title: 'Your next five minutes: five new hiragana.',
  body: "You've already learned す and し — if you tried the lesson up top. Pick up from there.",
  cta: 'Start learning free',
  note: 'No card needed.',
  watermark: 'がんばれ',
}
