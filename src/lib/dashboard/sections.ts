/**
 * The dashboard's sections, in sidebar order. Each is a child route of
 * /dashboard; Overview is the index.
 */
export interface DashboardSection {
  /** Child path under /dashboard ('' for the index). */
  path: string
  label: string
  icon: string
  /** One line under the label in the sidebar. */
  hint: string
}

export const DASHBOARD_PATH = '/dashboard'

export const DASHBOARD_SECTIONS: readonly DashboardSection[] = [
  { path: '', label: 'Overview', icon: 'dashboard', hint: 'Today and the big picture' },
  { path: 'activity', label: 'Activity', icon: 'insights', hint: 'Habits, time and accuracy' },
  { path: 'kana', label: 'Kana', icon: 'translate', hint: 'Hiragana and katakana' },
  { path: 'kanji', label: 'Kanji', icon: 'history_edu', hint: 'N5 kanji, meaning and reading' },
  { path: 'grammar', label: 'Grammar', icon: 'menu_book', hint: 'Chapters by JLPT level' },
  { path: 'review', label: 'Review', icon: 'reviews', hint: 'Forecast and recall' },
  { path: 'weak-spots', label: 'Weak spots', icon: 'fitness_center', hint: 'Hard cards and mix-ups' },
]

export function dashboardSectionPath(section: DashboardSection): string {
  return section.path ? `${DASHBOARD_PATH}/${section.path}` : DASHBOARD_PATH
}

/** Old /progress#hash links land on the section that now holds that block. */
export const LEGACY_HASH_SECTION: Readonly<Record<string, string>> = {
  '#forecast': 'review',
  '#weak': 'weak-spots',
  '#weak-groups': 'weak-spots',
  '#mix-ups': 'weak-spots',
}
