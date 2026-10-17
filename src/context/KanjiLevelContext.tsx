import { createContext, useContext, type ReactNode } from 'react'
import type { KanjiLevelId } from '@/types/kanji'
import type { KanjiLevelConfig } from '@/lib/content/kanji/courseTypes'
import { KANJI_LEVEL_CONFIGS } from '@/lib/content/kanji/levelConfigs'

const KanjiLevelContext = createContext<KanjiLevelConfig | null>(null)

/**
 * KanjiLevelProvider — one JLPT level's course settings for every kanji page
 * below it (wraps each `/kanji/<level>` route tree). Static config, so the
 * value never changes identity.
 */
export function KanjiLevelProvider({ level, children }: { level: KanjiLevelId; children: ReactNode }) {
  return <KanjiLevelContext.Provider value={KANJI_LEVEL_CONFIGS[level]}>{children}</KanjiLevelContext.Provider>
}

/** The current kanji level's config. Only call this inside a `/kanji/<level>` route. */
export function useKanjiLevel(): KanjiLevelConfig {
  const level = useContext(KanjiLevelContext)
  if (!level) throw new Error('useKanjiLevel must be used inside a KanjiLevelProvider')
  return level
}
