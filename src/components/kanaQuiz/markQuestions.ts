import type { KanaChar } from '@/types'
import type { KanaPracticeWord } from '@/lib/content/kana/scripts'
import { isKanaMark } from '@/lib/content/kana/kanaMarks'
import { shuffle } from '@/components/practice/listen/pickOptions'
import type { QuestionKind, QuizQuestion } from './types'

/**
 * Quiz questions for katakana's marks, ー (long vowel) and small ッ (pause).
 * Neither has a reading of its own, so instead of "which kana is this?" the
 * learner reads a loanword that uses the mark:
 *
 * - read   — see コーヒー, pick "koohii" (not "kohii", "koohi", "kohi").
 * - find   — see "koohii", pick コーヒー (not コヒー, コーヒ, コーヒーー).
 * - listen — hear コーヒー, pick its spelling from the same look-alikes.
 *
 * The question's target keeps the mark's id ('long' / 'sokuon'), so scoring,
 * per-unit results and spaced repetition count it against the mark; only its
 * character and romaji are the word's. Words come from the script's practice
 * words and use only basic, dakuten and yōon kana besides the mark (the foreign
 * sounds are a later unit), at most 6 characters so options fit on a phone.
 */

const MAX_WORD_LENGTH = 6
const DISTRACTORS = 3
const VOWELS = 'aeiou'

const ASK: Record<QuestionKind, string> = {
  read: 'How do you read this word?',
  find: 'Which spelling is right?',
  listen: 'Which word did you hear?',
}

/** Words that use `mark` and only kana the learner has met before the foreign sounds. */
function wordsFor(mark: KanaChar, words: readonly KanaPracticeWord[], all: KanaChar[]): KanaPracticeWord[] {
  const known = new Map(all.map((k) => [k.character, k]))
  return words.filter(
    (w) =>
      w.kana.length <= MAX_WORD_LENGTH &&
      w.kana.includes(mark.character) &&
      w.kana.every((c) => {
        const k = known.get(c)
        return k !== undefined && (k.type !== 'foreign' || isKanaMark(k))
      }),
  )
}

const uniq = (items: string[], not: string) => [...new Set(items)].filter((s) => s !== not && s.length > 0)

/** Romaji look-alikes: long vowels shortened, doubled consonants undoubled or read as "tsu", short vowels stretched. */
function romajiVariants(romaji: string, markId: string): { near: string[]; other: string[] } {
  const near: string[] = []
  const other: string[] = []
  const longVowels = [...romaji.matchAll(/([aeiou])\1/g)].map((m) => m.index ?? 0)
  const doubled = [...romaji.matchAll(/([bdfgkmprstz])\1|t(?=ch)/g)].map((m) => m.index ?? 0)
  const shorten = longVowels.map((i) => romaji.slice(0, i) + romaji.slice(i + 1))
  const undouble = doubled.map((i) => romaji.slice(0, i) + romaji.slice(i + 1))
  const asTsu = doubled.map((i) => romaji.slice(0, i) + 'tsu' + romaji.slice(i + 1))
  const stretch: string[] = []
  for (let i = 0; i < romaji.length; i++) {
    const ch = romaji[i] ?? ''
    if (!VOWELS.includes(ch) || romaji[i - 1] === ch || romaji[i + 1] === ch) continue
    stretch.push(romaji.slice(0, i + 1) + ch + romaji.slice(i + 1))
  }
  if (markId === 'long') {
    near.push(...shorten)
    if (longVowels.length > 1) near.push(longVowels.reduceRight((s, i) => s.slice(0, i) + s.slice(i + 1), romaji))
    other.push(...stretch, ...undouble)
  } else {
    near.push(...undouble, ...asTsu)
    other.push(...stretch, ...shorten)
  }
  return { near: uniq(near, romaji), other: uniq(other, romaji) }
}

/** Spelling look-alikes: the mark dropped, ッ written as big ツ, or a mark added where it doesn't belong. */
function kanaVariants(chars: string[], markChar: string): { near: string[]; other: string[] } {
  const word = chars.join('')
  const near: string[] = []
  const other: string[] = []
  chars.forEach((c, i) => {
    if (c === 'ー' || c === 'ッ') {
      const without = [...chars.slice(0, i), ...chars.slice(i + 1)].join('')
      ;(c === markChar ? near : other).push(without)
      if (c === 'ッ') near.push([...chars.slice(0, i), 'ツ', ...chars.slice(i + 1)].join(''))
    }
  })
  chars.forEach((c, i) => {
    const nextChar = chars[i + 1]
    // ー after any kana that isn't already long (or a mark).
    if (c !== 'ー' && c !== 'ッ' && c !== 'ン' && nextChar !== 'ー') {
      ;(markChar === 'ー' ? near : other).push([...chars.slice(0, i + 1), 'ー', ...chars.slice(i + 1)].join(''))
    }
    // ッ before a kana (not first, not after another mark or ン).
    const prev = chars[i - 1]
    if (i > 0 && c !== 'ー' && c !== 'ッ' && prev !== 'ッ' && prev !== 'ー' && prev !== 'ン') {
      ;(markChar === 'ッ' ? near : other).push([...chars.slice(0, i), 'ッ', ...chars.slice(i)].join(''))
    }
  })
  return { near: uniq(near, word), other: uniq(other, word) }
}

/** Up to `count` distractors: one or two near misses on the mark itself, then any others. */
function pickDistractors({ near, other }: { near: string[]; other: string[] }, count: number): string[] {
  const nearFirst = shuffle(near).slice(0, 2)
  const rest = shuffle([...near, ...other].filter((v) => !nearFirst.includes(v)))
  return [...nearFirst, ...rest].slice(0, count)
}

/**
 * Picks the next word for `mark`, cycling through the candidates before any
 * repeats. `used` is shared across one quiz so the same word isn't asked twice.
 */
function nextWord(candidates: KanaPracticeWord[], used: Set<string>): KanaPracticeWord | undefined {
  const fresh = candidates.filter((w) => !used.has(w.word))
  if (fresh.length === 0) candidates.forEach((w) => used.delete(w.word))
  const word = shuffle(fresh.length > 0 ? fresh : candidates)[0]
  if (word) used.add(word.word)
  return word
}

/** One loanword question for ー or ッ, or null when no word (or not enough look-alikes) can be found. */
export function buildMarkQuestion(
  mark: KanaChar,
  kind: QuestionKind,
  key: string,
  all: KanaChar[],
  words: readonly KanaPracticeWord[],
  used: Set<string>,
): QuizQuestion | null {
  const candidates = wordsFor(mark, words, all)
  for (let attempt = 0; attempt < candidates.length; attempt++) {
    const word = nextWord(candidates, used)
    if (!word) return null
    const spellings = kind === 'read' ? romajiVariants(word.romaji, mark.id) : kanaVariants(word.kana, mark.character)
    const distractors = pickDistractors(spellings, DISTRACTORS)
    if (distractors.length < DISTRACTORS) continue
    const target: KanaChar = { id: mark.id, character: word.word, romaji: word.romaji, type: mark.type }
    const options: KanaChar[] = distractors.map((v, i) => ({
      id: `${mark.id}~${i}`,
      character: kind === 'read' ? word.word : v,
      romaji: kind === 'read' ? v : word.romaji,
      type: mark.type,
    }))
    return {
      key,
      kind,
      target,
      options: shuffle([target, ...options]),
      prompt: ASK[kind],
      hint: `${word.picture} ${word.meaning}`,
    }
  }
  return null
}
