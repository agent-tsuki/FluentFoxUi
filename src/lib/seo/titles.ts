/**
 * Page titles written for search results: the words people search for
 * first, the brand last, about 60 characters so Google and Bing show them
 * whole. One source for the build-time prerender (scripts/seo) and the pages
 * that set `document.title` after load, so the title a crawler indexes is
 * the one the page keeps once it renders.
 *
 * No content imports here: the router and course layouts load this file.
 */

export const SITE_NAME = 'FoxSensei'
export const SITE_URL = 'https://foxsensei.com'

const withBrand = (title: string) => `${title} | ${SITE_NAME}`

export const HOME_TITLE = withBrand('Learn Japanese Free: Hiragana, Katakana & Kanji')

export type KanaPageKind = 'chart' | 'course' | 'tests' | 'downloads'

/** A kana course page. `kanaCount` / `unitCount` are omitted until known. */
export function kanaPageTitle(script: string, kind: KanaPageKind, counts?: { kanaCount?: number; unitCount?: number }): string {
  switch (kind) {
    case 'chart':
      return withBrand(`${script} Chart with Romaji & Audio${counts?.kanaCount ? ` (All ${counts.kanaCount})` : ''}`)
    case 'course':
      return withBrand(`Learn ${script} Online Free${counts?.unitCount ? `: ${counts.unitCount} Guided Lessons` : ''}`)
    case 'tests':
      return withBrand(`${script} Quiz & Test: Check What You Know`)
    case 'downloads':
      return withBrand(`Printable ${script} Chart & Worksheets (PDF)`)
  }
}

export type KanjiPageKind = 'course' | 'browse' | 'tests' | 'downloads' | 'reviews'

/** A kanji level page, e.g. level "N5". `kanjiCount` is omitted until known. */
export function kanjiPageTitle(level: string, kind: KanjiPageKind, kanjiCount?: number): string {
  switch (kind) {
    case 'course':
      return withBrand(`JLPT ${level} Kanji List: Learn ${kanjiCount ? `All ${kanjiCount}` : 'Every'} Kanji`)
    case 'browse':
      return withBrand(`All JLPT ${level} Kanji with Meanings & Readings`)
    case 'tests':
      return withBrand(`JLPT ${level} Kanji Quiz & Level Test`)
    case 'downloads':
      return withBrand(`JLPT ${level} Kanji Worksheets (Printable PDF)`)
    case 'reviews':
      return withBrand(`${level} Kanji Reviews`)
  }
}

/** One kanji's page. */
export function kanjiTitle(char: string, meaning?: string): string {
  return withBrand(meaning ? `${char} Kanji: “${meaning}” – Readings & Stroke Order` : `${char} Kanji: Meaning, Readings & Stroke Order`)
}

/** One grammar chapter, e.g. level "N5", chapter 1. */
export function grammarTitle(level: string, chapter: number | string, title: string): string {
  return withBrand(`JLPT ${level} Grammar ${chapter}: ${title}`)
}

export const CLASSES_TITLE = withBrand('Japanese Courses & Classes by JLPT Level')
