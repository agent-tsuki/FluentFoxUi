import { useMemo } from 'react'
import type { KanaChar, KanaSection } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useKanaScript } from '@/context/KanaScriptContext'

export interface KanaSectionsState {
  /** The chart sections in order, spacer slots included. */
  sections: KanaSection[] | undefined
  /** Every playable kana (no empty grid slots), in chart order. */
  kana: KanaChar[] | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/** The current script's chart sections and playable kana, plus load state. */
export function useKanaSections(): KanaSectionsState {
  const script = useKanaScript()
  const { data, isLoading, error, refetch } = useAsync(`${script.id}-sections`, script.loadSections)
  const kana = useMemo(() => data?.flatMap((s) => s.chars).filter((c) => !c.isEmpty), [data])
  return { sections: data, kana, isLoading, error, refetch }
}
