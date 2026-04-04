import { Link, useParams, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { grammarData } from '@/api/mock/grammarData'

interface GrammarSidebarProps {
  level: string
  completedChapters: Set<number>
}

const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1']

export function GrammarSidebar({ level, completedChapters }: GrammarSidebarProps) {
  const { chapterId } = useParams<{ chapterId?: string }>()
  const activeChapterId = parseInt(chapterId || '1')
  const navigate = useNavigate()

  const chapters = grammarData[level.toLowerCase()] || []
  const completedCount = chapters.filter(ch => completedChapters.has(ch.id)).length
  const progressPct = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0

  return (
    <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-72 bg-surface-container-lowest flex flex-col border-r border-outline-variant/30 hidden lg:flex">

      {/* Level Switcher */}
      <div className="px-4 pt-5 pb-4 border-b border-outline-variant/20 flex-shrink-0">
        <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-3">Grammar Course</div>
        <div className="grid grid-cols-5 gap-1 p-1 bg-surface-container-high rounded-xl">
          {LEVELS.map(l => (
            <button
              key={l}
              onClick={() => navigate(`/grammar/${l}/1`)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                level.toLowerCase() === l
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {chapters.length > 0 && (
        <div className="px-4 py-3.5 border-b border-outline-variant/20 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-on-surface-variant font-medium">Your Progress</span>
            <span className="text-xs font-bold text-primary">
              {completedCount} / {chapters.length}
            </span>
          </div>
          <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {completedCount > 0 && (
            <p className="text-[10px] text-on-surface-variant/60 mt-1.5">
              {progressPct}% complete — keep going!
            </p>
          )}
        </div>
      )}

      {/* Chapter List */}
      <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {chapters.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Icon name="lock" className="text-4xl text-on-surface-variant/30 mb-3" />
            <p className="text-sm font-semibold text-on-surface-variant/60">Coming Soon</p>
            <p className="text-xs text-on-surface-variant/40 mt-1">
              {level.toUpperCase()} content is being prepared
            </p>
          </div>
        ) : (
          <div className="px-2 space-y-0.5">
            {chapters.map((ch) => {
              const isActive = ch.id === activeChapterId
              const isDone = completedChapters.has(ch.id)

              return (
                <Link
                  key={ch.id}
                  to={`/grammar/${level}/${ch.id}`}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                    isActive
                      ? 'bg-primary/10'
                      : 'hover:bg-surface-container-high'
                  }`}
                >
                  {/* Chapter number / done badge */}
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5 transition-colors ${
                    isDone
                      ? 'bg-primary text-on-primary'
                      : isActive
                      ? 'bg-primary/20 text-primary'
                      : 'bg-surface-container-highest text-on-surface-variant group-hover:bg-outline-variant/30'
                  }`}>
                    {isDone ? '✓' : ch.id}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className={`text-sm leading-snug ${
                      isActive
                        ? 'font-bold text-primary'
                        : isDone
                        ? 'font-medium text-on-surface'
                        : 'font-medium text-on-surface-variant group-hover:text-on-surface'
                    }`}>
                      {ch.title}
                    </div>
                    {isActive && (
                      <div className="text-[10px] text-primary/60 mt-0.5 font-medium">
                        Currently studying
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      {level.toLowerCase() !== 'n5' && (
        <div className="flex-shrink-0 p-4 border-t border-outline-variant/20">
          <Button variant="primary" className="w-full py-3 rounded-xl shadow-none">
            Unlock Pro Deck
          </Button>
        </div>
      )}
    </aside>
  )
}
