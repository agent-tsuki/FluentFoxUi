import { type ComponentType } from 'react'
import type { KanaChar } from '@/types'
import type { KanaProgressStore } from '@/api/services/kanaProgressService'
import type { KanaScriptConfig } from '@/lib/content/kana/scripts'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useKanaProgressStore } from '@/hooks/useKanaProgress'
import { useKanaSections } from '@/hooks/useKanaSections'
import { LoadingState } from '@/components/ui/LoadingState'
import type { PracticeModeProps } from './types'

/** A practice mode that also needs the full chart (e.g. for distractors) and the current script. */
export interface WithAllKanaProps extends PracticeModeProps {
  /** Every playable kana of the script, in chart order. Equals `kana` outside unit sessions. */
  all: KanaChar[]
  /** True when `kana` is a unit's subset (?unit=…), not the whole chart. */
  isSubset: boolean
  /** The current script's config (words, sample words, storage keys…). */
  script: KanaScriptConfig
  /** The current script's progress store, for recording reviews. */
  progress: KanaProgressStore
}

/**
 * Wraps a practice mode so it receives the script's full kana set next to the
 * (possibly unit-limited) `kana` it should prompt from. Unit sessions can have
 * as few as three kana, too few for four answer options, so modes top up
 * distractors from `all`. If the full set fails to load, `kana` stands in.
 */
export function withAllKana(Mode: ComponentType<WithAllKanaProps>): ComponentType<PracticeModeProps> {
  function WithAllKana(props: PracticeModeProps) {
    const script = useKanaScript()
    const progress = useKanaProgressStore()
    const { kana: loaded, error, isLoading } = useKanaSections()
    const all = loaded ?? (error ? props.kana : undefined)
    if (isLoading || !all) return <LoadingState label="Loading practice…" />
    return <Mode {...props} all={all} isSubset={props.kana.length < all.length} script={script} progress={progress} />
  }
  WithAllKana.displayName = `WithAllKana(${Mode.displayName ?? Mode.name})`
  return WithAllKana
}
