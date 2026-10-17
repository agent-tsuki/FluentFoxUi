/**
 * Practice modes of a kanji level (/kanji/<level>/practice/<mode>). Each is a
 * short round over the kanji the learner has opened (or a unit's kanji with
 * `?unit=`). Finishing a round with `?unit=` ticks that unit's Practise step.
 */
export type KanjiPracticeModeId = 'flashcards' | 'meaning' | 'reading' | 'listening' | 'lookalikes' | 'writing'

export interface KanjiPracticeMode {
  id: KanjiPracticeModeId
  title: string
  summary: string
  icon: string
}

export const KANJI_PRACTICE_MODES: readonly KanjiPracticeMode[] = [
  { id: 'flashcards', title: 'Flashcards', summary: 'Flip a card, say how well you knew it.', icon: 'style' },
  { id: 'meaning', title: 'Meanings', summary: 'See a kanji, give its meaning.', icon: 'translate' },
  { id: 'reading', title: 'Readings', summary: 'See a kanji, give a reading.', icon: 'menu_book' },
  { id: 'listening', title: 'Listening', summary: 'Hear a word, pick its kanji.', icon: 'headphones' },
  { id: 'lookalikes', title: 'Look-alikes', summary: 'Tell similar kanji apart.', icon: 'compare_arrows' },
  { id: 'writing', title: 'Writing', summary: 'Write each kanji from memory.', icon: 'gesture' },
]

export function isKanjiPracticeMode(value: string | undefined): value is KanjiPracticeModeId {
  return KANJI_PRACTICE_MODES.some((m) => m.id === value)
}
