import { memo, useDeferredValue, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { KanjiIndexRow, KanjiLevelId, KanjiSort } from '@/types/kanji'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useAsync } from '@/hooks/useAsync'
import { useKanjiProgress } from '@/hooks/useKanji'
import { kanjiService } from '@/api/services/kanjiService'
import { kanjiStage, KANJI_STAGE_LABEL } from '@/api/services/kanjiProgressService'
import { KANJI_LEVELS, isKanjiLevelId, kanjiCharPath } from '@/lib/content/kanji/levels'
import { romajiToHiragana } from '@/lib/content/kanji/romaji'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { cn } from '@/lib/cn'

const STROKE_RANGES: Record<string, { label: string; min?: number; max?: number }> = {
  any: { label: 'Any strokes' },
  '1-4': { label: '1–4 strokes', min: 1, max: 4 },
  '5-8': { label: '5–8 strokes', min: 5, max: 8 },
  '9-12': { label: '9–12 strokes', min: 9, max: 12 },
  '13+': { label: '13+ strokes', min: 13 },
}

const SORTS: Record<KanjiSort, string> = { course: 'Course order', strokes: 'Fewest strokes', freq: 'Most common' }

const FIELD =
  'min-h-11 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-surface-container-low'

/**
 * Browse page of a level (/kanji/<level>/browse): search by meaning, reading
 * (kana or romaji) or kanji, filter by level, strokes and part, sort, and
 * open any kanji's page. Every filter lives in the URL, so results are shareable.
 */
export function KanjiBrowsePage() {
  const level = useKanjiLevel()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const deferredQuery = useDeferredValue(query)
  const levels = useMemo(() => {
    const raw = (params.get('levels') ?? level.id).split(',').filter(isKanjiLevelId)
    return raw.length ? raw : [level.id]
  }, [params, level.id])
  const sort = (params.get('sort') as KanjiSort | null) ?? 'course'
  const strokesKey = params.get('strokes') ?? 'any'
  const part = params.get('part') ?? undefined
  const range = STROKE_RANGES[strokesKey] ?? STROKE_RANGES.any

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '') next.delete(k)
      else next.set(k, v)
    }
    setParams(next, { replace: true })
  }

  const kanaQuery = /[a-z]/i.test(deferredQuery) ? romajiToHiragana(deferredQuery.trim()) : undefined
  const key = JSON.stringify([deferredQuery, levels, sort, strokesKey, part])
  const { data: rows, isLoading, error, refetch } = useAsync(key, () =>
    kanjiService.search(deferredQuery, { levels, sort, part, kanaQuery, strokes: { min: range.min, max: range.max } }),
  )

  const toggleLevel = (id: KanjiLevelId) => {
    const next = levels.includes(id) ? levels.filter((l) => l !== id) : [...levels, id]
    update({ levels: (next.length ? next : [id]).join(',') })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label htmlFor="kanji-search" className="sr-only">
          Search kanji by meaning, reading or character
        </label>
        <input
          id="kanji-search"
          type="search"
          value={query}
          onChange={(e) => update({ q: e.target.value })}
          placeholder="Search: water, mizu, みず or 水"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className={cn(FIELD, 'w-full max-w-xl text-base')}
        />
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Levels" className="flex flex-wrap gap-1.5">
            {KANJI_LEVELS.map((l) => {
              const soon = l.status === 'coming-soon'
              const active = levels.includes(l.id)
              return (
                <button
                  key={l.id}
                  type="button"
                  disabled={soon}
                  aria-pressed={soon ? undefined : active}
                  onClick={() => toggleLevel(l.id)}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-1 rounded-full border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    soon
                      ? 'cursor-not-allowed border-outline-variant/40 text-on-surface-variant/70'
                      : active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low',
                  )}
                >
                  {l.label}
                  {soon && <span className="text-xs font-medium">Soon</span>}
                </button>
              )
            })}
          </div>
          <label className="sr-only" htmlFor="kanji-strokes">
            Strokes
          </label>
          <select id="kanji-strokes" value={strokesKey} onChange={(e) => update({ strokes: e.target.value === 'any' ? undefined : e.target.value })} className={FIELD}>
            {Object.entries(STROKE_RANGES).map(([k, r]) => (
              <option key={k} value={k}>
                {r.label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="kanji-sort">
            Sort
          </label>
          <select id="kanji-sort" value={sort} onChange={(e) => update({ sort: e.target.value === 'course' ? undefined : e.target.value })} className={FIELD}>
            {Object.entries(SORTS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
          {part && (
            <button
              type="button"
              onClick={() => update({ part: undefined })}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3.5 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Contains <span lang="ja" className="font-jp text-base">{part}</span>
              <Icon name="close" className="text-base" />
              <span className="sr-only">Remove part filter</span>
            </button>
          )}
        </div>
      </div>

      {error ? (
        <ErrorState message="We couldn't search the kanji." onRetry={refetch} />
      ) : !rows && isLoading ? (
        <LoadingState label="Searching…">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
            {Array.from({ length: 14 }, (_, i) => (
              <SkeletonBlock key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </LoadingState>
      ) : rows && rows.length === 0 ? (
        <EmptyState
          icon="search_off"
          title="No kanji match"
          description="Try a shorter word, another reading, or more levels."
          actionLabel="Clear search"
          onAction={() => setParams(new URLSearchParams(), { replace: true })}
        />
      ) : rows ? (
        <>
          <p aria-live="polite" className="text-sm tabular-nums text-on-surface-variant">
            {rows.length} kanji
          </p>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
            {rows.map((row) => (
              <KanjiTile key={row.char} row={row} />
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}

const KanjiTile = memo(function KanjiTile({ row }: { row: KanjiIndexRow }) {
  const progress = useKanjiProgress()
  const stage = kanjiStage(progress, row.char)
  return (
    <li>
      <Link
        to={kanjiCharPath(row.char, 'browse')}
        className="flex h-full flex-col items-center rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-2 pb-3 pt-2 text-center transition-colors hover:border-primary/60 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-surface-container-low"
      >
        <span className="self-end text-2xs font-semibold uppercase text-on-surface-variant">{row.level}</span>
        <span lang="ja" className="font-jp text-4xl font-bold leading-tight text-on-surface">
          {row.char}
        </span>
        <span className="mt-1 line-clamp-1 text-sm font-semibold text-on-surface">{row.meaning}</span>
        <span lang="ja" className="font-jp text-xs text-on-surface-variant">
          {row.keyReading}
        </span>
        {stage !== 'new' && <span className="mt-1 text-2xs font-semibold text-primary">{KANJI_STAGE_LABEL[stage]}</span>}
      </Link>
    </li>
  )
})
