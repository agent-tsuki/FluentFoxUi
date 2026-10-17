import type { KanaChar } from '@/types'
import { isTypeableKana } from '@/lib/content/kana/kanaMarks'
import { prioritise } from '@/lib/learn/practiceSession'
import { pickOptions, shuffle, type Confusables } from './pickOptions'

export const LISTEN_ROUNDS = 10
/** Answer tiles per round. */
const OPTION_COUNT = 4

export interface ListenRound {
  target: KanaChar
  options: KanaChar[]
}

/**
 * Kana that are read exactly like another one (を/お, ぢ/じ, づ/ず; katakana
 * ウォ/ヲ and the v-sounds, often said like b). Left out of the prompts and
 * answers so no round has two correct-sounding tiles.
 */
const HOMOPHONES = new Set(['wo', 'dji', 'dzu', 'who', 'vu', 'va', 'vi', 've', 'vo'])

/** Can be a prompt or a tile: has a sound of its own (not ー/ッ) and no homophone. */
const isAudible = (k: KanaChar) => isTypeableKana(k) && !HOMOPHONES.has(k.id)

/**
 * Prompt pool: the basic kana when there are any (the whole chart, or a basic
 * row unit), otherwise every kana given — so dakuten/compound-only units
 * (?unit=dakuten, combo-*) still play.
 */
function promptPool(kana: KanaChar[]): KanaChar[] {
  const audible = kana.filter(isAudible)
  const basic = audible.filter((k) => k.type === 'basic')
  return basic.length > 0 ? basic : audible
}

/** Two shuffled passes, without the same kana twice in a row at the seam. */
function twice(ids: string[]): string[] {
  const first = shuffle(ids)
  const second = shuffle(ids)
  if (second.length > 1 && second[0] === first[first.length - 1]) second.push(second.shift() as string)
  return [...first, ...second]
}

/**
 * Ten rounds over the prompt pool: the kana the learn API picked first
 * (`focusIds`, weakest first), topped up at random, then shuffled so rows
 * don't come in chart order.
 *
 * `all` is the full chart: when a unit has fewer than four kana (や row,
 * わ row) the distractors are topped up from it, but prompts stay in the unit.
 * Tiny units play each kana twice so the session isn't over in three taps.
 */
export function buildListenRounds(
  focusIds: readonly string[],
  kana: KanaChar[],
  all: KanaChar[] = kana,
  confusables?: Confusables,
): ListenRound[] {
  const pool = promptPool(kana)
  const optionPool =
    pool.length >= OPTION_COUNT
      ? pool
      : [...pool, ...all.filter((k) => isAudible(k) && !pool.some((p) => p.id === k.id))]
  const byId = new Map(pool.map((k) => [k.id, k]))
  const ids = pool.map((k) => k.id)
  const due = prioritise(focusIds, ids, LISTEN_ROUNDS)
  const rest = shuffle(ids.filter((id) => !due.includes(id)))
  const order = [...due, ...rest]
  const prompts = order.length < LISTEN_ROUNDS / 2 ? twice(order) : shuffle(order.slice(0, LISTEN_ROUNDS))

  return prompts.flatMap((id) => {
    const target = byId.get(id)
    return target ? [{ target, options: pickOptions(target, optionPool, OPTION_COUNT, confusables) }] : []
  })
}
