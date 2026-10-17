/**
 * Copy for the homepage "The path" section (LearningPath).
 * Edit freely — the component renders whatever is here. Japanese characters inside
 * mixed-language strings are automatically wrapped in `lang="ja"` spans by the component.
 *
 * SAMPLE VALUES — replace before launch: every `time`, the "12 chapters"/"10 chapters"
 * chips and the N3 launch timing (`PATH_COPY.lockedNote`, the N3 `time`) are plausible
 * placeholders, not real numbers.
 */

export interface PathStop {
  /** Station label in Japanese (rendered with lang="ja"). */
  ja: string
  /** Short English label under the station, e.g. "Kana", "N5". */
  en: string
  /** Eyebrow over the detail title, e.g. "Stop 1 of 3". */
  stage: string
  title: string
  /** Japanese sample shown on the board card. */
  sample: string
  /** Romanised reading, revealed with "Show meaning". Empty for locked stops. */
  reading: string
  /** English meaning, revealed with "Show meaning". Empty for locked stops. */
  meaning: string
  /** "After this stop you can:" bullet list. */
  can: readonly string[]
  chips: readonly string[]
  /** Time estimate line (SAMPLE — owner to replace). */
  time: string
  /** CTA label. Empty for locked stops (they show the notify button instead). */
  cta: string
  /** Planned/unreleased stop: dashed station, blurred sample, notify CTA. */
  locked?: boolean
}

export interface PathCopy {
  eyebrow: string
  title: string
  description: string
  /** Accessible name for the group of station buttons. */
  stationsLabel: string
  promptOpen: string
  promptLocked: string
  revealLabel: string
  /** Shown on the board card for a locked stop (SAMPLE timing — owner to replace). */
  lockedNote: string
  canLabelOpen: string
  canLabelLocked: string
  prevSrLabel: string
  nextSrLabel: string
  startOfLine: string
  endOfLine: string
  notifyCta: string
  /** Suffix appended to a locked station's aria-label. */
  plannedSuffix: string
}

export const PATH_COPY: PathCopy = {
  eyebrow: 'The path',
  title: 'Three stops from zero to JLPT N4.',
  description: "Tap a station to see what you'll be able to read when you get there.",
  stationsLabel: 'Stops on the path',
  promptOpen: 'Can you read this yet?',
  promptLocked: 'Coming later',
  revealLabel: 'Show meaning',
  lockedNote: 'Unlocks after N4 · planned for spring 2027',
  canLabelOpen: 'After this stop you can:',
  canLabelLocked: 'Planned for this stop:',
  prevSrLabel: 'Previous stop:',
  nextSrLabel: 'Next stop:',
  startOfLine: 'Start of line',
  endOfLine: 'End of line (for now)',
  notifyCta: 'Notify me when N3 opens',
  plannedSuffix: ' (planned)',
}

export const PATH_STOPS: readonly PathStop[] = [
  {
    ja: 'かな',
    en: 'Kana',
    stage: 'Stop 1 of 3',
    title: 'Hiragana & Katakana',
    sample: 'ラーメン・すし・カレー',
    reading: 'rāmen · sushi · karē',
    meaning: 'Ramen · sushi · curry — you can read a menu.',
    can: [
      'Read every sound in Japanese',
      'Sound out menus, signs and names',
      'Write each character from memory',
    ],
    chips: ['92 characters', 'Native audio', 'Writing quizzes'],
    time: 'About 2 weeks at 15 min a day',
    cta: 'Start at stop 1 — free',
  },
  {
    ja: 'きそ',
    en: 'N5',
    stage: 'Stop 2 of 3',
    title: 'N5 foundations',
    sample: '出口はどこですか。',
    reading: 'Deguchi wa doko desu ka.',
    meaning: '"Where is the exit?" — your first kanji, in a full question.',
    can: [
      'Introduce yourself and ask simple questions',
      'Read basic signs like 出口 (exit) and 入口 (entrance)',
      'Follow slow everyday phrases',
    ],
    chips: ['12 chapters', 'Vocab flashcards', 'Grammar quizzes'],
    time: 'About 3 months at 20 min a day',
    cta: 'Start N5 — free',
  },
  {
    ja: 'にちじょう',
    en: 'N4',
    stage: 'Stop 3 of 3',
    title: 'N4 everyday Japanese',
    sample: '明日は雨がふるそうです。',
    reading: 'Ashita wa ame ga furu sō desu.',
    meaning: '"I heard it\'s going to rain tomorrow." — real everyday grammar.',
    can: [
      'Read short everyday texts and messages',
      'Hold basic conversations on familiar topics',
      'Pass on what you heard with ～そうです',
    ],
    chips: ['10 chapters', 'N4 kanji sets', 'Mock quizzes'],
    time: 'About 4 months at 20 min a day',
    cta: 'Start N4 — free',
  },
  {
    ja: 'つぎ',
    en: 'N3',
    stage: 'Next stop · planned',
    title: 'N3 — coming later',
    sample: 'この電車は各駅に停まります。',
    reading: '',
    meaning: '',
    can: [
      'Read short articles and notices',
      'Follow everyday conversations at closer to natural speed',
    ],
    chips: ['Planned'],
    time: 'Planned launch: spring 2027',
    cta: '',
    locked: true,
  },
]
