/**
 * Where a progress page's "Practise this" goes: the practice screen that
 * starts POST /learn/practice with the server's suggested mode, unit or
 * look-alike pair. Pure.
 */
import type { LearningTrack, PracticeMode } from '@/types/learn'
import type { PracticeSuggestion } from '@/types/progress'
import { kanaBasePath } from '@/lib/content/kana/scriptIds'
import { kanjiLevelPath } from '@/lib/content/kanji/levels'
import type { KanaPracticeMode, KanjiPracticeMode } from '@/lib/learn/practiceSession'

// Kana modes without their own API mode (listen) ask for the weakest cards,
// or a unit's cards with ?unit=.
const KANA_SCREEN: Record<PracticeMode, KanaPracticeMode> = {
  weak: 'listen',
  unit: 'listen',
  lookalike: 'lookalike',
  speed: 'speed',
  match: 'match',
}

// Kanji have no speed round or match grid: those fall back to meanings.
const KANJI_SCREEN: Record<PracticeMode, KanjiPracticeMode> = {
  weak: 'meaning',
  unit: 'meaning',
  lookalike: 'lookalikes',
  speed: 'meaning',
  match: 'meaning',
}

/** v1 kanji are N5 only. */
const KANJI_LEVEL = 'n5'

function trackBase(track: LearningTrack): string {
  return track === 'kanji_n5' ? kanjiLevelPath(KANJI_LEVEL) : kanaBasePath(track)
}

function screenFor(track: LearningTrack, mode: PracticeMode): string {
  return track === 'kanji_n5' ? KANJI_SCREEN[mode] : KANA_SCREEN[mode]
}

export function practiceLink(s: PracticeSuggestion): string {
  const params = new URLSearchParams()
  if (s.mode === 'unit' && s.unit) params.set('unit', s.unit)
  if (s.mode === 'lookalike' && s.pair) params.set('pair', s.pair)
  const query = params.toString()
  const path = `${trackBase(s.track)}/practice/${screenFor(s.track, s.mode)}`
  return query ? `${path}?${query}` : path
}

/** A mix-up pair as the API's `pair` value ("ぬ:め"). */
export function confusionPair(target: string, chosen: string): string {
  return `${target}:${chosen}`
}

/** The look-alike drill for one mix-up pair. */
export function lookAlikeLink(track: LearningTrack, target: string, chosen: string): string {
  return practiceLink({ track, mode: 'lookalike', pair: confusionPair(target, chosen) })
}
