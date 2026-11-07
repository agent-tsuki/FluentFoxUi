import { useProgressDashboard } from '@/hooks/useProgress'
import { useDashboardTitle } from '@/hooks/useDashboardTitle'
import { BarList } from '@/components/charts/BarList'
import { AsyncBlock, DashboardPageHeader, Panel } from '@/components/dashboard/DashboardBits'
import { TrackDetail } from '@/components/dashboard/TrackDetail'
import { KANJI_TRACK } from '@/lib/learn/paths'

const PERCENT = 100

/** Meaning vs reading accuracy: kanji have two cards, and one usually lags. */
function KanjiSkillSplit() {
  const dashboard = useProgressDashboard()
  return (
    <Panel title="Meaning vs reading" description="Accuracy on each kind of kanji card. The lower one is where review time pays off most.">
      <AsyncBlock state={dashboard} what="your kanji skills" skeletonClassName="h-24">
        {(d) => {
          const meaning = d.skillBalance.kanjiMeaning
          const reading = d.skillBalance.kanjiReading
          const gap = Math.round(Math.abs(meaning - reading))
          const weaker = meaning < reading ? 'meanings' : 'readings'
          return (
            <div className="space-y-4">
              <BarList
                label="Kanji accuracy by card type"
                rows={[
                  { key: 'meaning', label: 'Meaning (漢字 → English)', share: meaning / PERCENT, display: `${Math.round(meaning)}%`, fill: 'bg-chart-3' },
                  { key: 'reading', label: 'Reading (漢字 → kana)', share: reading / PERCENT, display: `${Math.round(reading)}%`, fill: 'bg-chart-1' },
                ]}
              />
              <p className="text-sm text-on-surface-variant">
                {meaning === 0 && reading === 0
                  ? 'Answer some kanji cards to compare the two.'
                  : gap < 5
                    ? 'Balanced: meanings and readings are within a few points.'
                    : `Your ${weaker} trail by ${gap} points. Reviews that ask for ${weaker} will help most.`}
              </p>
            </div>
          )
        }}
      </AsyncBlock>
    </Panel>
  )
}

/** /dashboard/kanji: N5 kanji in detail. */
export function KanjiPage() {
  useDashboardTitle('Kanji')
  return (
    <div className="space-y-8">
      <DashboardPageHeader eyebrow="Kanji" title="N5 kanji" description="Each kanji by level, meaning against reading, upcoming reviews and the hardest cards." />
      <TrackDetail track={KANJI_TRACK}>
        <KanjiSkillSplit />
      </TrackDetail>
    </div>
  )
}
