import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { CHAPTER_TABS, chapterPath, type ChapterTab } from '@/lib/content/jlpt/levels'

interface ChapterTabsProps {
  level: string
  chapterId: number
  title: string
  current: ChapterTab
  /** Steps already finished: these show a tick. */
  done?: ReadonlySet<ChapterTab>
}

/**
 * A chapter's four parts as tabs above its content: Grammar, Vocabulary,
 * Exercise, Listening. Each is its own address, and the chapter list on the left keeps
 * the open tab when you switch chapters.
 */
export function ChapterTabs({ level, chapterId, title, current, done }: ChapterTabsProps) {
  return (
    <div className="px-6 pt-8 xl:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
        {level.toUpperCase()} · Chapter {chapterId}
        <span className="hidden sm:inline normal-case tracking-normal font-semibold"> · {title}</span>
      </p>
      <nav aria-label={`Chapter ${chapterId}`} className="mt-3 border-b border-line">
        <ul className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {CHAPTER_TABS.map((tab) => {
            const on = tab.id === current
            return (
              <li key={tab.id}>
                <Link
                  to={chapterPath(level, chapterId, tab.id)}
                  aria-current={on ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-2 text-sm font-semibold transition-colors sm:px-4',
                                        on ? 'border-primary text-primary-ink' : 'border-transparent text-ink-muted hover:border-line hover:text-ink',
                  )}
                >
                  <Icon name={tab.icon} className="hidden text-lg sm:inline" />
                  {tab.title}
                  {done?.has(tab.id) && (
                    <>
                      <Icon name="check" className="text-base text-success" />
                      <span className="sr-only"> (done)</span>
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
