import type { FooterLink } from '@/types'
import { CONTACT_MAILTO } from '@/lib/content/home/founder'

export const mockFooterLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: CONTACT_MAILTO },
]
