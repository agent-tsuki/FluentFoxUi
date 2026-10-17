import { useCallback, useMemo } from 'react'
import type { KanaMastery } from '@/types/kanaProgress'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useKanaSections } from '@/hooks/useKanaSections'
import { useItemLevels } from '@/hooks/useProgress'
import { kanaTrack } from '@/lib/learn/practiceSession'

/**
 * Kana mastery for the chart and unit colours, by chart id, from the progress
 * overview (the current script's track). Every kana reads New for guests and
 * until the levels load.
 */
export function useKanaMastery(): (id: string) => KanaMastery {
  const script = useKanaScript()
  const { kana } = useKanaSections()
  const levelOf = useItemLevels(kanaTrack(script.id))
  const charById = useMemo(() => new Map(kana?.map((k) => [k.id, k.character])), [kana])
  return useCallback((id: string) => {
    const char = charById.get(id)
    return char ? levelOf(char) : 'new'
  }, [charById, levelOf])
}
