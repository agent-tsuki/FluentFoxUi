/**
 * Illustrated N5 grammar boards (public/ paths; asset() maps them to the CDN).
 * File names spell the chapter number in words: n5_ch_twenty_one.webp. Each
 * board also has a 768px-wide copy (`-768`) for phones.
 */

const NUMBER_WORDS = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
  'twenty_one', 'twenty_two', 'twenty_three', 'twenty_four', 'twenty_five',
] as const

/** Chapters that have a board. Chapter 19 keeps its coded diagram. */
const N5_BOARD_CHAPTERS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25])

/** Full-size board path for an N5 chapter, or null when the chapter has none. */
export function n5BoardPath(chapter: number): string | null {
  if (!N5_BOARD_CHAPTERS.has(chapter)) return null
  return `/images/grammar/n5/boards/n5_ch_${NUMBER_WORDS[chapter]}.webp`
}

/** The 768px-wide copy of a board path. */
export function boardPhonePath(boardPath: string): string {
  return boardPath.replace(/\.webp$/, '-768.webp')
}

/** `sizes` for a board: full width on phones, at most ~33rem beside the caption. */
export const BOARD_SIZES = '(min-width: 768px) 528px, 100vw'
