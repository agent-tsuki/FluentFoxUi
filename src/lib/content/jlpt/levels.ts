import { LOCKED_GRAMMAR_LEVELS } from '@/components/grammar/LevelSwitcher'

/**
 * JLPT levels (the navbar's JLPT menu). A level is a list of chapters, and
 * every chapter has four parts: Grammar (the notes), Vocabulary (its words),
 * Exercise (practice questions) and Listening. They live at
 * /grammar/<level>/<chapter>[/vocabulary | /exercise | /listening].
 */

export type JlptLevelId = 'n5' | 'n4' | 'n3' | 'n2' | 'n1'
export type ChapterTab = 'grammar' | 'vocabulary' | 'exercise' | 'listening'

export interface JlptLevelDef {
  id: JlptLevelId
  /** "N5" */
  label: string
  /** "Beginner" */
  name: string
  /** One line in the menu. */
  summary: string
}

export const JLPT_LEVELS: readonly JlptLevelDef[] = [
  { id: 'n5', label: 'N5', name: 'Beginner', summary: 'Basic sentences and everyday words, chapter by chapter.' },
  { id: 'n4', label: 'N4', name: 'Elementary', summary: 'Everyday conversation and common verb forms.' },
  { id: 'n3', label: 'N3', name: 'Intermediate', summary: 'Bridging everyday Japanese and natural, real-world texts.' },
  { id: 'n2', label: 'N2', name: 'Advanced', summary: 'News, articles and conversation at natural speed.' },
  { id: 'n1', label: 'N1', name: 'Mastery', summary: 'Complex texts and fluent, nuanced Japanese.' },
]

export interface ChapterTabDef {
  id: ChapterTab
  title: string
  icon: string
  /** One line in the menu. */
  summary: string
}

/** A chapter's four parts, in order. */
export const CHAPTER_TABS: readonly ChapterTabDef[] = [
  { id: 'grammar', title: 'Grammar', icon: 'menu_book', summary: 'The chapter’s patterns, with example sentences.' },
  { id: 'vocabulary', title: 'Vocabulary', icon: 'translate', summary: 'The chapter’s words, with readings and audio.' },
  { id: 'exercise', title: 'Exercise', icon: 'quiz', summary: 'Vocabulary, grammar and sentence practice, then a review.' },
  { id: 'listening', title: 'Listening', icon: 'headphones', summary: 'Hear the chapter’s words and sentences, pick what they mean.' },
]

const BY_ID = new Map(JLPT_LEVELS.map((l) => [l.id, l]))

export function isJlptLevelId(value: string | undefined): value is JlptLevelId {
  return value !== undefined && BY_ID.has(value as JlptLevelId)
}

export function jlptLevel(id: JlptLevelId): JlptLevelDef {
  const def = BY_ID.get(id)
  if (!def) throw new Error(`Unknown JLPT level: ${id}`)
  return def
}

export function isChapterTab(value: string | undefined): value is ChapterTab {
  return CHAPTER_TABS.some((t) => t.id === value)
}

/** A level is open once it has chapters. */
export function isLevelAvailable(level: JlptLevelId): boolean {
  return !LOCKED_GRAMMAR_LEVELS.has(level)
}

/** /grammar/<level>/<chapter>, plus /vocabulary, /exercise or /listening for those tabs. */
export function chapterPath(level: string, chapter: number, tab: ChapterTab = 'grammar'): string {
  return `/grammar/${level.toLowerCase()}/${chapter}${tab === 'grammar' ? '' : `/${tab}`}`
}

/** The level a path belongs to (the menus open on it). */
export function jlptLevelOf(pathname: string): JlptLevelId | null {
  const m = pathname.match(/^\/(?:grammar|jlpt)\/(n[1-5])\b/)
  return m && isJlptLevelId(m[1]) ? m[1] : null
}
