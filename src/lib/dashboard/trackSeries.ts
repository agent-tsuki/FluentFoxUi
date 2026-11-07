/**
 * Chart identity for the learning tracks: one fixed colour slot each
 * (hiragana → chart-1, katakana → chart-2, kanji → chart-3), so a track keeps
 * its colour on every chart and filter. Literal classes so Tailwind keeps them.
 */
import type { ChartSeries } from '@/components/charts/ChartParts'
import type { LearningTrack } from '@/types/learn'
import { LEARNING_TRACKS, TRACK_LABEL } from '@/lib/learn/paths'

export const TRACK_FILL: Record<LearningTrack, string> = {
  hiragana: 'bg-chart-1',
  katakana: 'bg-chart-2',
  kanji_n5: 'bg-chart-3',
}

export const TRACK_TEXT: Record<LearningTrack, string> = {
  hiragana: 'text-chart-1',
  katakana: 'text-chart-2',
  kanji_n5: 'text-chart-3',
}

export const TRACK_SERIES: readonly ChartSeries<LearningTrack>[] = LEARNING_TRACKS.map((t) => ({
  key: t,
  label: TRACK_LABEL[t],
  fill: TRACK_FILL[t],
}))
