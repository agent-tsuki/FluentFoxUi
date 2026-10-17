import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { KanjiLevelId } from '@/types/kanji'
import { availableKanjiLevels, kanjiLevelMeta, kanjiLevelPath } from '@/lib/content/kanji/levels'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { COURSE_CONTAINER } from '@/components/kanaCourse/coursePages'
import { KanjiLevelSwitcher } from '@/components/kanji/KanjiCourseHeader'

/**
 * /kanji/<level> for a level without data yet (N3–N1): a calm placeholder
 * with the level switcher. When the API serves the level, its status flips
 * to 'available' in levels.ts and the full course replaces this page.
 */
export function KanjiComingSoonPage({ level }: { level: KanjiLevelId }) {
  const meta = kanjiLevelMeta(level)
  const navigate = useNavigate()
  const available = availableKanjiLevels()
  const latest = available[available.length - 1] ?? 'n5'

  useEffect(() => {
    document.title = `${meta.title} · Coming soon · FoxSensei`
  }, [meta.title])

  return (
    <main className="pb-24 pt-nav">
      <div className={COURSE_CONTAINER}>
        <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 pb-5 pt-6 md:pt-10">
          <div>
            <Eyebrow>Kanji course</Eyebrow>
            <h1 className="font-headline text-display-sm font-extrabold tracking-tight text-on-surface">{meta.title}</h1>
          </div>
          <KanjiLevelSwitcher />
        </header>
        <EmptyState
          icon="schedule"
          title={`${meta.label} kanji are coming soon`}
          description={`We're preparing the ${meta.label} units, readings and words. Until then, keep going with ${kanjiLevelMeta(latest).title}.`}
          actionLabel={`Go to ${kanjiLevelMeta(latest).title}`}
          onAction={() => navigate(kanjiLevelPath(latest))}
        />
      </div>
    </main>
  )
}
