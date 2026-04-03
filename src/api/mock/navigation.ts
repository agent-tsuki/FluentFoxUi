import type { NavItem, FooterLink } from '@/types'

export const mockNavItems: NavItem[] = [
  {
    label: 'Grammar',
    dropdown: [
      { label: 'N5 Beginner', href: '/grammar/n5' },
      { label: 'N4 Elementary', href: '/grammar/n4' },
      { label: 'N3 Intermediate', href: '/grammar/n3' },
      { label: 'N2 Advanced', href: '/grammar/n2' },
      { label: 'N1 Mastery', href: '/grammar/n1' },
    ],
  },
  {
    label: 'Kanas',
    dropdown: [
      { label: 'Hiragana', href: '/kana/hiragana' },
      { label: 'Katakana', href: '/kana/katakana' },
      { label: 'Kanji', href: '/kana/kanji' },
    ],
  },
  { label: 'Quiz', href: '/quiz' },
  { label: 'Pricing', href: '/pricing' },
]

export const mockFooterLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Support', href: '/support' },
]
