import type { KanaChar } from '@/types'
import type { KanaPracticeWord, KanaScriptConfig } from '@/lib/content/kana/scripts'

export const ROUNDS_PER_GAME = 8
const DISTRACTORS = 3

export interface Tile {
  /** Stable key within the round. */
  key: string
  char: string
  kanaId: string
}

export interface BuildRound {
  word: KanaPracticeWord
  /** Chart id for each character of the word, in order. */
  ids: string[]
  /** Word kana + distractors, shuffled. */
  tiles: Tile[]
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/**
 * Which words a game may use: 0 = basic only, 1 = + dakuten, 2 = every tier
 * (katakana's 'extended' loanwords with ー, ッ, yōon and foreign sounds).
 * Stored as '0' / '1' / '2' under the script's `buildDakuten` key.
 */
export type BuildLevel = 0 | 1 | 2

const LEVEL_TIERS: Record<BuildLevel, KanaPracticeWord['tier'][]> = {
  0: ['basic'],
  1: ['basic', 'dakuten'],
  2: ['basic', 'dakuten', 'extended'],
}

/** The highest level the script has words for (2 for katakana, 1 for hiragana). */
export function maxBuildLevel(script: KanaScriptConfig): BuildLevel {
  if (script.practiceWords.some((w) => w.tier === 'extended')) return 2
  return script.practiceWords.some((w) => w.tier === 'dakuten') ? 1 : 0
}

/** The lowest level that fits a unit session's kana (a dakuten unit needs dakuten words, …). */
function levelForFocus(focus: KanaChar[]): BuildLevel {
  if (focus.some((k) => k.type === 'compound' || k.type === 'foreign')) return 2
  return focus.some((k) => k.type === 'dakuten') ? 1 : 0
}

/**
 * Picks words the given kana list can build (every chart character of the
 * word, compounds like シャ and フォ included, has a chart id) and prepares each
 * round's tile tray. Distractors come from the same tier (basic words never
 * show dakuten tiles) and include one look-alike, so ッ may meet a big ツ.
 *
 * `focus` (a unit session's kana) keeps only words containing at least one of
 * them, and raises the level so the unit's own kana are allowed. A level-2
 * game is mostly loanwords (the reason to learn katakana); level 1 is half
 * dakuten words.
 */
export function createRounds(script: KanaScriptConfig, kana: KanaChar[], level: BuildLevel, focus?: KanaChar[]): BuildRound[] {
  const idByChar = new Map(kana.map((k) => [k.character, k.id]))
  const focusChars = focus && new Set(focus.map((k) => k.character))
  const effective = Math.max(level, focus ? levelForFocus(focus) : 0) as BuildLevel
  const allowedTiers = LEVEL_TIERS[effective]
  const charsOf = (...types: KanaChar['type'][]) => kana.filter((k) => types.includes(k.type)).map((k) => k.character)
  const basicChars = charsOf('basic')
  const dakutenChars = charsOf('dakuten')
  const extendedChars = charsOf('compound', 'foreign')

  const playable = script.practiceWords.filter(
    (w) =>
      allowedTiers.includes(w.tier) &&
      w.kana.every((c) => idByChar.has(c)) &&
      (!focusChars || w.kana.some((c) => focusChars.has(c))),
  )
  const top = allowedTiers[allowedTiers.length - 1]
  // Make sure the newest tier actually shows up (not in unit sessions: there
  // the unit decides which words fit).
  const topShare = effective === 2 ? 5 : ROUNDS_PER_GAME / 2
  const picked =
    effective > 0 && !focusChars
      ? (() => {
          const fromTop = shuffle(playable.filter((w) => w.tier === top)).slice(0, topShare)
          const rest = shuffle(playable.filter((w) => w.tier !== top)).slice(0, ROUNDS_PER_GAME - fromTop.length)
          return shuffle([...fromTop, ...rest])
        })()
      : shuffle(playable).slice(0, ROUNDS_PER_GAME)

  return picked.map((word, roundIndex) => {
    const pool =
      word.tier === 'extended'
        ? [...basicChars, ...dakutenChars, ...extendedChars]
        : word.tier === 'dakuten'
          ? [...basicChars, ...dakutenChars]
          : basicChars
    const inWord = new Set(word.kana)
    const distractors: string[] = []
    const lookAlike = shuffle(word.kana.flatMap((c) => script.lookAlikes[c] ?? [])).find(
      (c) => !inWord.has(c) && idByChar.has(c) && pool.includes(c),
    )
    if (lookAlike) distractors.push(lookAlike)
    // Loanwords: offer a mark the word doesn't use (ー or ッ), so the learner has to decide.
    if (word.tier === 'extended') {
      const mark = shuffle(['ー', 'ッ']).find((c) => !inWord.has(c) && !distractors.includes(c) && idByChar.has(c))
      if (mark) distractors.push(mark)
    }
    for (const c of shuffle(pool)) {
      if (distractors.length >= DISTRACTORS) break
      if (!inWord.has(c) && !distractors.includes(c)) distractors.push(c)
    }
    const tiles = shuffle([...word.kana, ...distractors]).map((char, i) => ({
      key: `${roundIndex}-${i}`,
      char,
      kanaId: idByChar.get(char)!,
    }))
    return { word, ids: word.kana.map((c) => idByChar.get(c)!), tiles }
  })
}
