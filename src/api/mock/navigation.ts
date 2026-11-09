import type { NavItem, FooterLink } from '@/types'
import { CONTACT_MAILTO } from '@/lib/content/home/founder'

export const mockNavItems: NavItem[] = [
  {
    label: 'Kana',
    dropdown: [
      { label: 'Hiragana', href: '/kana/hiragana' },
      { label: 'Katakana', href: '/kana/katakana' },
      { label: 'Kanji', href: '/kanji' },
    ],
  },
  // Every level's chapters: grammar, vocabulary and exercise (JlptMegaMenu).
  { label: 'JLPT', mega: 'jlpt' },
  { label: 'Quiz', href: '/quiz' },
  { label: 'Classes', href: '/classes' },
]

export const mockFooterLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: CONTACT_MAILTO },
]
