import { useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { getLearningPath } from '@/api/services/learningPathService'
import { useProgressOverview } from '@/hooks/useProgress'
import { Icon } from '@/components/ui/Icon'
import { buttonClasses } from '@/components/ui/Button'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { HIRAGANA_UNITS } from '@/lib/content/kana/hiraganaUnits'
import { KATAKANA_UNITS } from '@/lib/content/kana/katakanaUnits'
import { kanaBasePath } from '@/lib/content/kana/scriptIds'
import { startedCount } from '@/lib/learn/mastery'
import { TRACK_LABEL, lessonPath } from '@/lib/learn/paths'

type KanaTrack = 'hiragana' | 'katakana'

const UNITS: Record<KanaTrack, readonly KanaUnit[]> = { hiragana: HIRAGANA_UNITS, katakana: KATAKANA_UNITS }
const TITLES_SHOWN = 3

/**
 * Units passed before the API scheduled a passed unit quiz's kana (it now
 * does, in TestScoreService) left those kana "new", so the dashboard read
 * "0 started" after two passed units. This says what the course has done and
 * offers the lesson that schedules it.
 * Renders nothing once reviews have caught up with the course.
 */
export function CourseBridge({ track }: { track: KanaTrack }) {
  const store = getLearningPath(track)
  const path = useSyncExternalStore(store.subscribe, store.getState)
  const { data } = useProgressOverview()
  const overview = data?.tracks.find((t) => t.track === track)

  const passed = UNITS[track].filter((u) => {
    const p = path.units[u.id]
    return Boolean(p?.quizPassedAt || p?.skippedAt)
  })
  const passedKana = passed.reduce((n, u) => n + u.kanaIds.length, 0)
  const started = overview ? startedCount(overview.items_per_level) : 0
  const notScheduled = passedKana - started
  if (!overview || passed.length === 0 || notScheduled <= 0) return null

  const label = TRACK_LABEL[track]
  const titles = passed.slice(0, TITLES_SHOWN).map((u) => u.title).join(', ')
  const more = passed.length > TITLES_SHOWN ? ` and ${passed.length - TITLES_SHOWN} more` : ''

  return (
    <section
      aria-labelledby="course-bridge-title"
      className="flex flex-col gap-4 rounded-lg border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="flex gap-3">
        <Icon name="schedule" className="mt-0.5 shrink-0 text-2xl text-primary" />
        <div className="space-y-1">
          <h2 id="course-bridge-title" className="font-display text-base font-bold text-ink">
            {notScheduled} {label} from the course {notScheduled === 1 ? "isn't" : "aren't"} in your reviews yet
          </h2>
          <p className="text-sm text-ink-muted">
            You passed {titles}{more} ({passed.length} of {UNITS[track].length} units) before passing a quiz put its kana
            into reviews. A short lesson adds them, so the levels below start counting.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Link to={lessonPath(track)} className={buttonClasses('primary', 'md', 'min-h-11 rounded-full')}>
          Add to reviews
        </Link>
        <Link to={kanaBasePath(track)} className={buttonClasses('secondary', 'md', 'min-h-11 rounded-full')}>
          Open course
        </Link>
      </div>
    </section>
  )
}
