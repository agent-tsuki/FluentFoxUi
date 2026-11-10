import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { LearningTrack } from '@/types/learn'
import { useProgressOverview } from '@/hooks/useProgress'
import { useDashboardTitle } from '@/hooks/useDashboardTitle'
import { BarList } from '@/components/charts/BarList'
import { DashboardPageHeader, Panel, Segmented } from '@/components/dashboard/DashboardBits'
import { TrackDetail } from '@/components/dashboard/TrackDetail'
import { TRACK_FILL } from '@/lib/dashboard/trackSeries'
import { TRACK_LABEL } from '@/lib/learn/paths'
import { formatShare } from '@/lib/learn/progressShape'
import { formatSeconds } from '@/lib/dashboard/analytics'

type KanaTrack = Extract<LearningTrack, 'hiragana' | 'katakana'>
const KANA_TRACKS: readonly KanaTrack[] = ['hiragana', 'katakana']
const PERCENT = 100
const isKanaTrack = (v: string | null): v is KanaTrack => KANA_TRACKS.some((t) => t === v)

/** Hiragana next to katakana: mastered share, recall and speed. */
function ScriptComparison() {
  const { data } = useProgressOverview()
  const tracks = KANA_TRACKS.flatMap((t) => data?.tracks.find((o) => o.track === t) ?? [])
  if (tracks.length < KANA_TRACKS.length) return null
  const slowest = Math.max(1, ...tracks.map((t) => t.avg_answer_ms ?? 0))
  return (
    <Panel title="Hiragana vs katakana" description="The same measures side by side, to see which script needs time.">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ink-muted">Mastered</h3>
          <BarList
            label="Mastered share by script"
            rows={tracks.map((t) => ({ key: t.track, label: TRACK_LABEL[t.track], share: t.mastered_pct / PERCENT, display: `${Math.round(t.mastered_pct)}%`, fill: TRACK_FILL[t.track] }))}
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ink-muted">30-day recall</h3>
          <BarList
            label="Recall by script"
            rows={tracks.map((t) => ({ key: t.track, label: TRACK_LABEL[t.track], share: t.retention_30d, display: formatShare(t.retention_30d), fill: TRACK_FILL[t.track] }))}
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ink-muted">Answer time (shorter is better)</h3>
          <BarList
            label="Average answer time by script"
            rows={tracks.map((t) => ({
              key: t.track,
              label: TRACK_LABEL[t.track],
              share: t.avg_answer_ms === null ? null : t.avg_answer_ms / slowest,
              display: formatSeconds(t.avg_answer_ms),
              fill: TRACK_FILL[t.track],
            }))}
          />
        </div>
      </div>
    </Panel>
  )
}

/** /dashboard/kana: hiragana and katakana in detail. */
export function KanaPage() {
  useDashboardTitle('Kana')
  const [params, setParams] = useSearchParams()
  const raw = params.get('script')
  const script: KanaTrack = isKanaTrack(raw) ? raw : 'hiragana'
  const setScript = useCallback(
    (next: KanaTrack) =>
      setParams((prev) => {
        const p = new URLSearchParams(prev)
        p.set('script', next)
        return p
      }, { replace: true }),
    [setParams],
  )

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Kana"
        title="Hiragana & katakana"
        description="Every character by level, what's coming up for review, and the ones that trip you up."
        actions={<Segmented label="Script" value={script} options={KANA_TRACKS.map((t) => ({ value: t, label: TRACK_LABEL[t] }))} onChange={setScript} />}
      />
      <ScriptComparison />
      <TrackDetail key={script} track={script} />
    </div>
  )
}
