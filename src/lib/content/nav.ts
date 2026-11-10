/** The site's main menu, flattened around the three courses. */
export interface TopNavChild {
  label: string
  href: string
  /** A Japanese character used as the menu item's tile. */
  glyph: string
  description: string
}

export interface TopNavItem {
  label: string
  href: string
  /** Path prefixes that mark this section as current. */
  match: readonly string[]
  /** A small menu; used only where one course has more than one entry point. */
  children?: readonly TopNavChild[]
}

export const TOP_NAV: readonly TopNavItem[] = [
  {
    label: 'Kana',
    href: '/kana/hiragana',
    match: ['/kana/hiragana', '/kana/katakana'],
    children: [
      { label: 'Hiragana', href: '/kana/hiragana', glyph: 'あ', description: 'Start here: the basic script' },
      { label: 'Katakana', href: '/kana/katakana', glyph: 'ア', description: 'For words from other languages' },
    ],
  },
  { label: 'Kanji', href: '/kanji', match: ['/kanji', '/kana/kanji'] },
  { label: 'Grammar', href: '/grammar/n5/1', match: ['/grammar', '/jlpt'] },
  { label: 'Practice', href: '/quiz', match: ['/quiz', '/review'] },
  { label: 'Classes', href: '/classes', match: ['/classes'] },
]

/** Lesson pages carry their own next step, so the nav doesn't offer one there. */
export function isLessonPath(pathname: string): boolean {
  return ['/kana', '/kanji', '/grammar'].some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function isNavItemActive(item: TopNavItem, pathname: string): boolean {
  return item.match.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}
