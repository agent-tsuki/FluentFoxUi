/** Copy + outbound links for the home-page "Free courses hub" section (id="resources"). */

export type ResourceTone = 'primary' | 'info' | 'neutral'
export type ResourceBadgeTone = 'success' | 'info' | 'neutral'

export interface ExternalResource {
  id: string
  /** Decorative Japanese glyph shown in the card banner. */
  glyph: string
  tone: ResourceTone
  badge: string
  badgeTone: ResourceBadgeTone
  provider: string
  title: string
  bestAt: string
  description: string
  cta: string
  href: string
}

export const RESOURCES_SECTION = {
  eyebrow: 'Free courses hub',
  title: 'The best outside resources, picked and explained.',
  description:
    "We don't pretend to be everything. These are the ones worth your time, and where each fits on your path.",
  browseAll: 'Browse all resources',
  browseAllTo: '/classes',
  newTabHint: '(opens in new tab)',
} as const

export const EXTERNAL_RESOURCES: readonly ExternalResource[] = [
  {
    id: 'nhk-easy-japanese',
    glyph: 'あ',
    tone: 'primary',
    badge: 'FREE',
    badgeTone: 'success',
    provider: 'NHK WORLD-JAPAN',
    title: 'Easy Japanese',
    bestAt: 'Best at stage 1–2:',
    description: 'short audio lessons for everyday conversation.',
    cta: 'Visit NHK',
    href: 'https://www3.nhk.or.jp/nhkworld/lesson/en/',
  },
  {
    id: 'coursera-japanese-beginners',
    glyph: '文',
    tone: 'info',
    badge: 'COURSE',
    badgeTone: 'info',
    // TODO(owner): replace SAMPLE UNIVERSITY with the verified course provider.
    provider: 'COURSERA · SAMPLE UNIVERSITY',
    title: 'Japanese for Beginners',
    bestAt: 'Best at stage 2:',
    description: 'a structured, university-style course if you like deadlines.',
    cta: 'Visit Coursera',
    href: 'https://www.coursera.org/search?query=japanese%20for%20beginners',
  },
  {
    id: 'wanikani',
    glyph: '能',
    tone: 'neutral',
    badge: 'PAID · FREE START',
    badgeTone: 'neutral',
    provider: 'WANIKANI',
    title: 'Kanji & vocabulary SRS',
    bestAt: 'Best at stage 3+:',
    description: 'deep kanji drilling once kana and basic grammar feel easy.',
    cta: 'Visit WaniKani',
    href: 'https://www.wanikani.com/',
  },
]
