import { useCallback, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { LearningTrack } from '@/types/learn'
import {
  useConfusions,
  useProgressCalendar,
  useProgressForecast,
  useProgressOverview,
  useWeakGroups,
  useWeakItems,
} from '@/hooks/useProgress'
import {
  ConfusionList,
  ForecastChart,
  MasteryBars,
  ProgressSection,
  RetentionCard,
  TodayCard,
  TrackFilter,
  WeakGroupsList,
  WeakItemsList,
} from '@/components/progress'
import { StreakCalendar } from '@/components/sections/Dashboard'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { isLearningTrack } from '@/lib/learn/paths'
import { streakCalendarFrom } from '@/lib/learn/progressShape'
import type { ProgressOverview } from '@/types/progress'

const FORECAST_DAYS = 14
const WEAK_ITEMS_LIMIT = 20
const CONFUSIONS_LIMIT = 10

/**
 * /progress — mastery per track, the 14-day review forecast, the activity
 * calendar with streaks and goal-met days, weak items and groups with
 * "Practise this", and mix-up pairs. `?track=` filters the forecast and the
 * weakness lists.
 */
export function ProgressPage() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('track')
  const track: LearningTrack | undefined = isLearningTrack(raw) ? raw : undefined
  const setTrack = useCallback(
    (next: LearningTrack | undefined) =>
      setParams((prev) => {
        const p = new URLSearchParams(prev)
        if (next) p.set('track', next)
        else p.delete('track')
        return p
      }, { replace: true }),
    [setParams],
  )

  useEffect(() => {
    document.title = 'Progress · FoxSensei'
  }, [])

  const overview = useProgressOverview()
  const forecast = useProgressForecast(FORECAST_DAYS)
  const calendar = useProgressCalendar()
  const weak = useWeakItems(track, WEAK_ITEMS_LIMIT)
  const groups = useWeakGroups(track)
  const confusions = useConfusions(track, CONFUSIONS_LIMIT)
  const streakData = useMemo(() => calendar.data && streakCalendarFrom(calendar.data), [calendar.data])
  const streak = { ...calendar, data: streakData }
  const filter = <TrackFilter value={track} onChange={setTrack} />

  return (
    <main className="pt-nav pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-14">
      <header className="space-y-2 pt-6">
        <Eyebrow variant="plain">Your progress</Eyebrow>
        <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">How your Japanese is settling in</h1>
        <p className="max-w-prose text-on-surface-variant">
          Levels come from how long you remember each card.{' '}
          <Link to="/learn/how-grading-works" className="font-semibold text-primary hover:underline underline-offset-4">
            How grading works
          </Link>
        </p>
      </header>

      <ProgressSection
        id="mastery"
        eyebrow="Mastery"
        title="Mastery by track"
        state={overview}
        isEmpty={(o: ProgressOverview) => o.tracks.length === 0}
        empty={{ icon: 'school', title: 'Nothing started yet', description: 'Take a first lesson and your levels show up here.' }}
      >
        {(o) => (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl bg-surface-container-low p-6 lg:col-span-2">
              <MasteryBars tracks={o.tracks} />
            </div>
            <TodayCard overview={o} />
            {o.retention && <RetentionCard retention={o.retention} className="lg:col-span-3" />}
          </div>
        )}
      </ProgressSection>

      <ProgressSection
        id="forecast"
        eyebrow="Coming up"
        title="Review forecast"
        description="Reviews due each day for the next two weeks."
        state={forecast}
        actions={filter}
        isEmpty={(f) => f.days.length === 0}
        empty={{ icon: 'event_available', title: 'No reviews scheduled', description: 'Learn something new and its reviews appear here.' }}
      >
        {(f) => <ForecastChart days={f.days} track={track} className="rounded-xl bg-surface-container-low p-6" />}
      </ProgressSection>

      <ProgressSection
        id="calendar"
        eyebrow="Consistency"
        title="Activity"
        state={streak}
        isEmpty={() => false}
        empty={{ icon: 'calendar_today', title: '', description: '' }}
      >
        {(data) => <StreakCalendar data={data} showHeading={false} />}
      </ProgressSection>

      <ProgressSection
        id="weak"
        eyebrow="Needs work"
        title="Weak items"
        description="The cards you find hardest right now, and why."
        state={weak}
        actions={filter}
        isEmpty={(items) => items.length === 0}
        empty={{ icon: 'verified', title: 'No weak items', description: 'Nothing stands out yet. Keep reviewing and this list fills in where you struggle.' }}
      >
        {(items) => <WeakItemsList items={items} />}
      </ProgressSection>

      <ProgressSection
        id="weak-groups"
        eyebrow="Needs work"
        title="Weak groups"
        description="Units and kana groups you miss more often than usual."
        state={groups}
        isEmpty={(g) => g.length === 0}
        empty={{ icon: 'grid_view', title: 'No weak groups', description: 'Every group is at or above your average.' }}
      >
        {(g) => <WeakGroupsList groups={g} />}
      </ProgressSection>

      <ProgressSection
        id="mix-ups"
        eyebrow="Look-alikes"
        title="Mix-ups"
        description="Pairs you confuse most. Tap one to drill just that pair."
        state={confusions}
        isEmpty={(p) => p.length === 0}
        empty={{ icon: 'compare_arrows', title: 'No mix-ups yet', description: 'When you pick one character for another, the pair shows up here.' }}
      >
        {(p) => <ConfusionList pairs={p} />}
      </ProgressSection>
    </main>
  )
}
