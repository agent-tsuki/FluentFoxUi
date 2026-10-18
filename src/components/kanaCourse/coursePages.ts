import { scriptKanaCount, type KanaScriptConfig } from '@/lib/content/kana/scripts'

/**
 * The four pages of a kana course (the SectionNav items), in learning order:
 * Chart → Learn → Check → Print.
 * One source of truth for each page's path, nav label, h1, one-line
 * description and document title, shared by KanaCourseLayout,
 * CourseHeader, SectionNav and the unit page's course menu.
 */
export type CoursePageId = 'course' | 'chart' | 'tests' | 'downloads'

export interface CoursePage {
  id: CoursePageId
  /** Absolute path of the page. */
  to: string
  /** Label in the SectionNav. */
  navLabel: string
  /** The page h1 (the script name, e.g. "Hiragana", on the Learn page). */
  heading: string
  /** One line under the h1. */
  description: string
  /** `document.title` while the page is shown. */
  documentTitle: string
}

const cache = new WeakMap<KanaScriptConfig, readonly CoursePage[]>()

/** The four course pages of a script (built once per script). */
export function coursePagesFor(script: KanaScriptConfig): readonly CoursePage[] {
  const cachedPages = cache.get(script)
  if (cachedPages) return cachedPages
  const base = script.basePath
  const name = script.label
  const lower = name.toLowerCase()
  const pages: CoursePage[] = [
    {
      id: 'chart',
      to: `${base}/chart`,
      navLabel: 'Chart',
      heading: `${name} chart`,
      description: `Explore all ${scriptKanaCount(script)} ${lower}, then move into the guided units when you are ready.`,
      documentTitle: `Chart · ${name} · FoxSensei`,
    },
    {
      id: 'course',
      to: `${base}/learn`,
      navLabel: 'Learn',
      heading: `Learn ${name}`,
      description: `Build confidence through ${script.units.length} short, guided ${lower} units.`,
      documentTitle: `Learn · ${name} · FoxSensei`,
    },
    {
      id: 'tests',
      to: `${base}/tests`,
      navLabel: 'Check',
      heading: 'Check your progress',
      description: 'Use short unit checks, test out if you already know it, then take the final test.',
      documentTitle: `Check · ${name} · FoxSensei`,
    },
    {
      id: 'downloads',
      to: `${base}/downloads`,
      navLabel: 'Print',
      heading: 'Print & practise',
      description: 'Take chart posters and unit worksheets offline for focused revision.',
      documentTitle: `Print · ${name} · FoxSensei`,
    },
  ]
  cache.set(script, pages)
  return pages
}

/** The course page for a pathname; anything unrecognised falls back to Course. */
export function coursePageFor(script: KanaScriptConfig, pathname: string): CoursePage {
  const pages = coursePagesFor(script)
  const path = pathname.replace(/\/+$/, '')
  return pages.find((p) => p.to === path) ?? pages[0]
}

/**
 * Width + gutters shared by the course header, the SectionNav bar and the page
 * content, so all three left edges line up. At max width the inner column is
 * 1072 px (main 712 · gap 40 · rail 320 on the Course page).
 */
export const COURSE_CONTAINER = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10'
