/**
 * Look-alike sets for the look-alike drill, per script: a few kana that are
 * easy to confuse plus one line telling them apart. `ids` are chart ids (the
 * same ids in both scripts); `chars` are the characters in the same order and
 * only a fallback for display (the drill shows the chart's own characters).
 *
 * Kept out of the script config so the drill can be added without touching
 * scripts.ts; a script with no sets here simply doesn't offer the drill.
 * (Could move to `KanaScriptConfig.lookAlikeSets` later.)
 */
import type { KanaScriptId } from '@/lib/content/kana/scriptIds'
import { KATAKANA_LOOK_ALIKES } from '@/lib/content/kana/katakanaLookAlikes'

export interface KanaLookAlikeSet {
  ids: string[]
  chars: string[]
  tip: string
}

/** Hiragana look-alikes with a distinguishing tip. Edit freely. */
export const HIRAGANA_LOOK_ALIKE_SETS: KanaLookAlikeSet[] = [
  { ids: ['sa', 'chi'], chars: ['さ', 'ち'], tip: 'さ’s lower curve opens to the right, like a c. ち bulges out to the right, like a 5.' },
  { ids: ['sa', 'ki'], chars: ['さ', 'き'], tip: 'き is さ with a second bar across the top: one bar for さ, two for き.' },
  { ids: ['nu', 'me'], chars: ['ぬ', 'め'], tip: 'ぬ finishes with a little loop at the bottom right; め just ends in an open tail.' },
  { ids: ['ne', 're', 'wa'], chars: ['ね', 'れ', 'わ'], tip: 'All three share the left post. ね ends in a loop, れ kicks out in a tail, わ curls round in a closed curve.' },
  { ids: ['ha', 'ho'], chars: ['は', 'ほ'], tip: 'In は the right post pokes up through the top; ほ caps it with an extra bar.' },
  { ids: ['ha', 'ke'], chars: ['は', 'け'], tip: 'け’s right post just falls straight down; は’s post ties a loop at the bottom.' },
  { ids: ['ru', 'ro'], chars: ['る', 'ろ'], tip: 'る ends in a loop (think “loop-ru”); ろ stays open.' },
  { ids: ['i', 'ri'], chars: ['い', 'り'], tip: 'い: two short strokes, the right one shorter. り: the right stroke is long and sweeps down.' },
  { ids: ['ko', 'ni'], chars: ['こ', 'に'], tip: 'に is こ with a post on the left.' },
  { ids: ['ta', 'na'], chars: ['た', 'な'], tip: 'た has a little こ on the right; な has a dot there and ties a loop at the bottom.' },
  { ids: ['a', 'o'], chars: ['あ', 'お'], tip: 'お has a dot at the top right; あ has no dot, and its big loop crosses the centre stroke.' },
  { ids: ['ma', 'mo'], chars: ['ま', 'も'], tip: 'ま’s post goes through the bars and ties a loop; も’s post curls up to the right with no loop.' },
  { ids: ['shi', 'tsu'], chars: ['し', 'つ'], tip: 'し falls straight down and hooks right; つ arches over the top like a wave.' },
  { ids: ['u', 'tsu', 'ra'], chars: ['う', 'つ', 'ら'], tip: 'つ has no top stroke. う has a dash on top; ら has a slanted dash and a short down-stroke on the left.' },
  { ids: ['su', 'mu'], chars: ['す', 'む'], tip: 'す ties its loop on the centre post. む ties it on the left and adds a dot on the right.' },
  { ids: ['ku', 'he'], chars: ['く', 'へ'], tip: 'く points left, like <. へ is a mountain roof, like ^.' },
]

/** Each script's look-alike sets. Empty (or missing) = no look-alike drill for that script. */
export const LOOK_ALIKE_SETS: Readonly<Record<KanaScriptId, readonly KanaLookAlikeSet[]>> = {
  hiragana: HIRAGANA_LOOK_ALIKE_SETS,
  katakana: KATAKANA_LOOK_ALIKES,
}

export function lookAlikeSetsFor(script: KanaScriptId): readonly KanaLookAlikeSet[] {
  return LOOK_ALIKE_SETS[script] ?? []
}

/** Sets with at least one kana among `kanaIds` (e.g. one unit's). */
export function lookAlikeSetsTouching(script: KanaScriptId, kanaIds: readonly string[]): KanaLookAlikeSet[] {
  const ids = new Set(kanaIds)
  return lookAlikeSetsFor(script).filter((set) => set.ids.some((id) => ids.has(id)))
}
