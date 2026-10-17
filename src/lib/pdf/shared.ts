/** Shared constants for the PDF builders. */

/** Required by the KanjiVG CC BY-SA 3.0 licence wherever the stroke data is used. */
export const CREDIT_LINE = 'Stroke data: KanjiVG (kanjivg.tagaini.net), CC BY-SA 3.0 · foxsensei.com'

/**
 * Grey levels (0 = black, 255 = white). PDFs are print art, not themed UI, so
 * they use their own palette rather than the Tailwind tokens.
 */
export const GREY = {
  text: 0,
  muted: 100,
  number: 110,
  modelBorder: 120,
  cellBorder: 150,
  rule: 200,
  trace: 200, // #C8C8C8
  guide: 205,
} as const

/** Fisher–Yates on a copy. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
