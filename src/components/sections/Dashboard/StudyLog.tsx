import { useState } from 'react'
import type { StudyLogEntry } from '@/types'
import { Icon } from '@/components/ui/Icon'

interface StudyLogProps {
  entries: StudyLogEntry[]
}

const FILTERS = ['Daily', 'Weekly'] as const
type Filter = typeof FILTERS[number]

export function StudyLog({ entries }: StudyLogProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>('Daily')

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary font-label block">
            Activity
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface font-headline">
            Study Log
          </h2>
        </div>

        {/* Filter toggle */}
        <div className="flex items-center gap-1 p-1 bg-surface-container rounded-full">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold font-label transition-all ${
                activeFilter === f
                  ? 'bg-on-surface text-inverse-on-surface'
                  : 'bg-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(25,28,29,0.04)]">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-outline-variant/30">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
            Course / Session
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label w-28 text-right">
            Date
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label w-20 text-right">
            Duration
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label w-24 text-center">
            Status
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label w-16 text-right">
            XP
          </span>
        </div>

        {/* Rows */}
        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-4 items-center transition-colors hover:bg-surface-container-low ${
              idx < entries.length - 1 ? 'border-b border-outline-variant/20' : ''
            }`}
          >
            {/* Title + icon */}
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${entry.iconColorClass}`}
              >
                <Icon name={entry.icon} className="text-xl" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-on-surface font-label text-sm truncate">
                  {entry.title}
                </p>
                <p className="text-xs text-on-surface-variant font-body truncate">
                  {entry.subtitle}
                </p>
              </div>
            </div>

            {/* Date */}
            <span className="text-sm text-on-surface-variant font-body w-28 text-right whitespace-nowrap">
              {entry.date}
            </span>

            {/* Duration */}
            <span className="text-sm text-on-surface font-label font-semibold w-20 text-right whitespace-nowrap">
              {entry.duration}
            </span>

            {/* Status pill */}
            <div className="w-24 flex justify-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold font-label whitespace-nowrap ${
                  entry.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {entry.status === 'completed' ? 'Completed' : 'In Progress'}
              </span>
            </div>

            {/* XP */}
            <div className="w-16 text-right">
              {entry.xp !== null ? (
                <span className="text-sm font-bold text-primary font-label">+{entry.xp} XP</span>
              ) : (
                <span className="text-sm text-on-surface-variant font-body">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
