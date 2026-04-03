import type { CurriculumCardData } from '@/types'

export const mockCurriculumCards: CurriculumCardData[] = [
  {
    id: 'beginner',
    icon: 'child_care',
    title: 'Absolute Beginner',
    description:
      'Master Hiragana, Katakana, and the essential 100 phrases to survive your first week in Tokyo.',
    href: '/curriculum/beginner',
  },
  {
    id: 'conversational',
    icon: 'forum',
    title: 'Conversational Fluency',
    description:
      'Move beyond the textbook. Learn how Japanese people actually speak in social and work environments.',
    href: '/curriculum/conversational',
  },
  {
    id: 'jlpt',
    icon: 'school',
    title: 'JLPT N5–N1',
    description:
      'Intensive preparation for the Japanese Language Proficiency Test with high-yield vocabulary and mock exams.',
    href: '/curriculum/jlpt',
  },
]
