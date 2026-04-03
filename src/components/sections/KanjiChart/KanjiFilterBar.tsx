import type { JlptLevel } from '@/types'
import { Icon } from '@/components/ui/Icon'

type FilterValue = JlptLevel | 'all'

interface KanjiFilterBarProps {
  active: FilterValue
  available: JlptLevel[]
  onChange: (value: FilterValue) => void
}

const LEVEL_META: Record<JlptLevel, { label: string }> = {
  N5: { label: 'N5 Beginner' },
  N4: { label: 'N4 Elementary' },
  N3: { label: 'N3 Intermediate' },
  N2: { label: 'N2 Advanced' },
  N1: { label: 'N1 Mastery' },
}

export function KanjiFilterBar({ active, available, onChange }: KanjiFilterBarProps) {
  const currentLabel = active === 'all' ? 'All JLPT Levels' : LEVEL_META[active].label

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-20 px-4 md:px-0">
      {/* Level Label */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-black mb-1">
          Current View
        </span>
        <h2 className="text-3xl font-black font-headline text-slate-800 dark:text-slate-100 uppercase tracking-tight">
          {currentLabel}
        </h2>
      </div>

      {/* Dropdown Selector */}
      <div className="relative group cursor-pointer w-full md:w-auto">
        <div className="flex items-center justify-between md:justify-start gap-4 px-6 py-3.5 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-700/50 hover:border-orange-500/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold md:hidden">
              Filter Selection
            </span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
              Change Level
            </span>
          </div>
          <Icon name="keyboard_arrow_down" className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
        </div>

        {/* Invisible bridge to prevent hover gap */}
        <div className="absolute top-full right-0 w-full h-3" />

        {/* Dropdown Menu */}
        <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 absolute top-[calc(100%+0.75rem)] right-0 min-w-full md:min-w-[16rem] bg-white dark:bg-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-2 border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
          <button
            onClick={() => onChange('all')}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-bold flex items-center justify-between group/item ${active === 'all'
              ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
          >
            <span>All JLPT Levels</span>
            {active === 'all' ? (
              <Icon name="check" className="text-base" />
            ) : (
              <Icon name="chevron_right" className="text-sm opacity-0 group-hover/item:opacity-100 translate-x-[-4px] group-hover/item:translate-x-0 transition-all" />
            )}
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1 mx-2" />

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {available.map((level) => {
              const isActive = active === level
              return (
                <button
                  key={level}
                  onClick={() => onChange(level)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-bold flex items-center justify-between group/item ${isActive
                    ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                >
                  <span>{LEVEL_META[level].label}</span>
                  {isActive ? (
                    <Icon name="check" className="text-base" />
                  ) : (
                    <Icon name="chevron_right" className="text-sm opacity-0 group-hover/item:opacity-100 translate-x-[-4px] group-hover/item:translate-x-0 transition-all" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
