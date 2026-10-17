import { useCallback, useMemo } from 'react'
import type { KanaChar, KanaSection } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { hiraganaService } from '@/api/services/hiraganaService'
import { katakanaService } from '@/api/services/katakanaService'

/** The same sound in both scripts, e.g. { id: 'ka', hiragana: か, katakana: カ }. */
export interface KanaPair {
  id: string
  hiragana: KanaChar
  katakana: KanaChar
}

export interface KanaPairsState {
  /** Every kana id both charts share, in hiragana chart order. */
  pairs: KanaPair[] | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

function playable(sections: KanaSection[]): KanaChar[] {
  return sections.flatMap((s) => s.chars).filter((c) => !c.isEmpty)
}

/**
 * Hiragana ↔ katakana pairs, matched by chart id (both charts use the same
 * ids for the standard 104). Loads both scripts' charts, whichever course the
 * learner is on; katakana-only kana (ー, ッ, foreign sounds) have no pair.
 */
export function useKanaPairs(): KanaPairsState {
  const load = useCallback(() => Promise.all([hiraganaService.getSections(), katakanaService.getSections()]), [])
  const { data, isLoading, error, refetch } = useAsync('kana-pairs', load)
  const pairs = useMemo(() => {
    if (!data) return undefined
    const [hira, kata] = data
    const kataById = new Map(playable(kata).map((k) => [k.id, k]))
    return playable(hira).flatMap((h) => {
      const k = kataById.get(h.id)
      return k ? [{ id: h.id, hiragana: h, katakana: k }] : []
    })
  }, [data])
  return { pairs, isLoading, error, refetch }
}
