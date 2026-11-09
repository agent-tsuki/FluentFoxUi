import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { CHAPTER_TABS, chapterPath, type ChapterTab } from '@/lib/content/jlpt/levels'

interface ChapterTabsProps {
  level: string
  chapterId: number
  title: string
  current: ChapterTab
}

/**
 * A chapter's three parts as tabs above its content: Grammar, Vocabulary,
 * Exercise. Each is its own address, and the chapter list on the left keeps
 * the open tab when you switch chapters.
 */
export function ChapterTabs({ level, chapterId, title, current }: ChapterTabsProps) {
  return (
    <div className="px-6 pt-8 xl:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
        {level.toUpperCase()} · Chapter {chapterId}
        <span className="hidden sm:inline normal-case tracking-normal font-semibold"> · {title}</span>
      </p>
      <nav aria-label={`Chapter ${chapterId}`} className="mt-3 border-b border-outline-variant/50">
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
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                    on ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:border-outline-variant hover:text-on-surface',
                  )}
                >
                  <Icon name={tab.icon} className="hidden text-lg sm:inline" />
                  {tab.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
