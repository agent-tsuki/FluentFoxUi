/**
 * Copy + static SAMPLE data for the home-page "Example dashboard" section.
 * This is illustrative marketing content, not live learner data.
 */

/** Language of a text fragment — `ja` renders with `lang="ja"` + the Japanese font. */
export type ContentLang = 'en' | 'ja'

export type DashboardStatTone = 'primary' | 'default' | 'success'
export type QuizScoreTone = 'success' | 'primary'

export interface DashboardStat {
  id: string
  value: string
  label: string
  tone: DashboardStatTone
}

export interface RevisitTopic {
  id: string
  label: string
  lang: ContentLang
  /** Share of recent answers on this topic that were wrong (0–100). */
  missRate: number
}

export interface RecentQuiz {
  id: string
  name: string
  lang: ContentLang
  when: string
  score: string
  tone: QuizScoreTone
}

export const DASHBOARD_SECTION = {
  eyebrow: 'Your dashboard',
  title: "See what's slipping before it slips.",
  description:
    'Every quiz feeds your dashboard, so your next session starts with what you actually got wrong — not what you already know.',
  exampleBadge: 'Example dashboard',
  exampleNote: 'Sample data for illustration — not a live account.',
  greeting: 'Good morning, Yuki',
  streakPrefix: '7-day streak · next up: ',
  nextUp: 'は vs が',
  topicsTitle: 'Topics to revisit',
  quizzesTitle: 'Recent quizzes',
} as const

export const DASHBOARD_STATS: readonly DashboardStat[] = [
  { id: 'streak', value: '7', label: 'Day streak', tone: 'primary' },
  { id: 'cards', value: '142', label: 'Cards reviewed', tone: 'default' },
  { id: 'quizzes', value: '18', label: 'Quizzes done', tone: 'default' },
  { id: 'avg', value: '82%', label: 'Avg. score', tone: 'success' },
]

export const REVISIT_TOPICS: readonly RevisitTopic[] = [
  { id: 'te-form', label: 'て-form verbs', lang: 'ja', missRate: 72 },
  { id: 'wa-ga', label: 'は vs が', lang: 'ja', missRate: 55 },
  { id: 'katakana-ra', label: 'Katakana ラ row', lang: 'ja', missRate: 40 },
  { id: 'n4-kanji-3', label: 'N4 kanji set 3', lang: 'en', missRate: 30 },
]

export const RECENT_QUIZZES: readonly RecentQuiz[] = [
  { id: 'hira-speed', name: 'Hiragana speed test', lang: 'en', when: 'today', score: '95%', tone: 'success' },
  { id: 'n5-vocab-3', name: 'N5 vocab, chapter 3', lang: 'en', when: 'yesterday', score: '88%', tone: 'success' },
  { id: 'te-form-grammar', name: 'て-form grammar', lang: 'ja', when: '2 days ago', score: '62%', tone: 'primary' },
  { id: 'kata-matching', name: 'Katakana matching', lang: 'en', when: '3 days ago', score: '48%', tone: 'primary' },
]
