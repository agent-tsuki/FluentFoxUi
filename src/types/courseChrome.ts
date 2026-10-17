/**
 * CourseChrome — the course-agnostic view of a course that the shared course
 * chrome reads (CourseHeader, SectionNav, UnitRow, ContinueCard,
 * CurriculumGroup, CourseRail). The kana provider derives it from
 * KanaScriptConfig; the kanji layout derives it from a level config + index.
 *
 * Phase 0 defines the shape only; Agent B switches the kana components to it
 * (kana stays pixel- and behaviour-identical) and may extend it.
 */

/** A unit as the chrome shows it. */
export interface CourseChromeUnit {
  id: string
  title: string
  summary: string
  /** Item ids taught in the unit (kana ids, or kanji chars), in order. */
  itemIds: string[]
}

export interface CourseChromeGroup {
  id: string
  title: string
  summary: string
  unitIds: string[]
}

/** One SectionNav page. */
export interface CourseChromePage {
  /** 'course' | 'chart' | 'tests' | 'downloads' (kana); kanji adds 'reviews' | 'browse'. */
  id: string
  /** Absolute path. */
  to: string
  navLabel: string
  /** The page h1. */
  heading: string
  description: string
  documentTitle: string
  /** Optional nav badge, e.g. due reviews ("12"). */
  badge?: number
}

export interface CourseChromeCounts {
  units: number
  /** Items taught by the path (104 hiragana, 80 N5 kanji). */
  items: number
  /** Singular/plural noun for items in copy: 'kana' | 'kanji'. */
  itemNoun: string
}

export interface CourseChrome {
  /** Progress-store id, e.g. 'hiragana', 'kanji-n5'. */
  id: string
  /** "Hiragana", "N5 Kanji". */
  label: string
  /** Header eyebrow, e.g. "Kana course", "Kanji course". */
  eyebrow: string
  /** "/kana/hiragana", "/kanji/n5". */
  basePath: string
  units: readonly CourseChromeUnit[]
  groups: readonly CourseChromeGroup[]
  /** SectionNav pages in nav order (pages[0] is the course hub). */
  pages: readonly CourseChromePage[]
  counts: CourseChromeCounts
  /** Final / level test summary for the curriculum's last row. */
  finalTest: { minutes: number; passMark: number; questions?: number }
  /** "Already know …? Test out" target. */
  skipAllPath: string
}
