import type { KanaChar } from '@/types'

/** Look-alike characters per character, tried first as distractors. */
export type Confusables = Readonly<Record<string, readonly string[]>>

/** Classic hiragana look-alikes, both directions where it makes sense. Edit freely. */
const CONFUSABLE: Confusables = {
  さ: ['ち', 'き'], ち: ['さ', 'ら'], き: ['さ', 'ち'],
  ぬ: ['め', 'ね'], め: ['ぬ', 'あ'],
  ね: ['れ', 'わ', 'ぬ'], れ: ['ね', 'わ'], わ: ['ね', 'れ'],
  は: ['ほ', 'け'], ほ: ['は', 'ま'], け: ['は', 'に'],
  る: ['ろ', 'れ'], ろ: ['る', 'ら'], ら: ['ろ', 'う'],
  い: ['り', 'こ'], り: ['い', 'け'], こ: ['い', 'に'], に: ['こ', 'た'],
  た: ['な', 'に'], な: ['た', 'は'], ま: ['ほ', 'も'], も: ['ま', 'し'],
  し: ['も', 'つ'], つ: ['う', 'し'], う: ['つ', 'ら'],
  あ: ['お', 'め'], お: ['あ', 'す'], す: ['お', 'む'], む: ['す', 'お'],
  く: ['へ', 'し'], へ: ['く', 'て'], て: ['そ', 'へ'], そ: ['ろ', 'て'],
  ゆ: ['よ', 'ぬ'], よ: ['ゆ', 'ま'], ふ: ['う', 'み'], み: ['ふ', 'め'],
}

/** Spelling exceptions that don't follow consonant + vowel. */
const ROW_OVERRIDES: Record<string, string> = { shi: 's', chi: 't', tsu: 't', fu: 'h', n: 'n' }

/** Consonant row ('' for the vowel row). */
function rowOf(romaji: string): string {
  return ROW_OVERRIDES[romaji] ?? romaji.slice(0, -1)
}

/** Vowel column ('n' for ん). */
function columnOf(romaji: string): string {
  return romaji === 'n' ? 'n' : romaji.slice(-1)
}

export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = out[i] as T
    out[i] = out[j] as T
    out[j] = a
  }
  return out
}

/**
 * Four answer options for `target`: look-alikes first, then the same row,
 * then the same vowel column, then anything — shuffled into a random order.
 * `pool` must not contain kana that *sound* the same as the target (e.g. を/お).
 * `confusables` defaults to the hiragana look-alikes; pass the script's own.
 */
export function pickOptions(target: KanaChar, pool: KanaChar[], count = 4, confusables: Confusables = CONFUSABLE): KanaChar[] {
  const others = pool.filter((k) => k.id !== target.id)
  const byChar = new Map(others.map((k) => [k.character, k]))
  const tiers: KanaChar[][] = [
    shuffle((confusables[target.character] ?? []).flatMap((c) => byChar.get(c) ?? [])),
    shuffle(others.filter((k) => rowOf(k.romaji) === rowOf(target.romaji))),
    shuffle(others.filter((k) => columnOf(k.romaji) === columnOf(target.romaji))),
    shuffle(others),
  ]

  const chosen = new Map<string, KanaChar>()
  // At most two look-alikes so the row/column relatives still get a turn.
  for (const k of (tiers[0] ?? []).slice(0, 2)) chosen.set(k.id, k)
  for (const tier of tiers.slice(1)) {
    for (const k of tier) {
      if (chosen.size >= count - 1) break
      chosen.set(k.id, k)
    }
  }
  return shuffle([target, ...chosen.values()])
}
