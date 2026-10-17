import type { KanjiLevelConfig } from '@/lib/content/kanji/courseTypes'
import { kanjiLevelPagePath, type KanjiLevelPageId } from '@/lib/content/kanji/levels'

/**
 * The five pages of a kanji level (the sub-nav items), in nav order: one
 * source for each page's path, nav label, h1, description and document title.
 */
export interface KanjiCoursePage {
  id: KanjiLevelPageId
  to: string
  navLabel: string
  heading: string
  description: string
  documentTitle: string
}

export function kanjiPagesFor(level: KanjiLevelConfig, counts?: { kanji: number; units: number }): KanjiCoursePage[] {
  const n = counts ? `${counts.kanji} ` : ''
  const page = (id: KanjiLevelPageId, navLabel: string, heading: string, description: string): KanjiCoursePage => ({
    id,
    to: kanjiLevelPagePath(level.id, id),
    navLabel,
    heading,
    description,
    documentTitle: `${heading === level.title ? 'Course' : heading} · ${level.title} · FoxSensei`,
  })
  return [
    page('course', 'Course', level.title, `Learn the ${n}${level.label} kanji${counts ? ` in ${counts.units} short units` : ''}, with readings and words.`),
    page('reviews', 'Reviews', 'Reviews', 'Spaced reviews bring each kanji back just before you would forget it.'),
    page('browse', 'Browse', 'Browse', `Search every ${level.label} kanji by meaning, reading or part.`),
    page('tests', 'Tests', 'Tests', 'Unit quizzes, test-outs and the level test for your certificate.'),
    page('downloads', 'Downloads', 'Downloads', 'Unit worksheets to print or save.'),
  ]
}

/** The page for a pathname; anything unrecognised falls back to Course. */
export function kanjiPageFor(pages: readonly KanjiCoursePage[], pathname: string): KanjiCoursePage {
  const path = pathname.replace(/\/+$/, '')
  return pages.find((p) => p.to === path) ?? pages[0]
}
