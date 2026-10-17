import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import type { KanjiEntry, KanjiIndexRow, KanjiLevelIndex } from '@/types/kanji'
import { useAllKanjiIndexes, useKanjiEntry, useKanjiStrokes } from '@/hooks/useKanji'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { useKanjiNote, type KanjiNoteSave } from '@/hooks/useKanjiNote'
import { LearnerOnly } from '@/components/auth/SignInPrompt'
import { isKanjiChar, isKanjiLevelId, kanjiCharPath, kanjiLevelMeta, kanjiLevelPagePath, kanjiLevelPath, kanjiUnitPath } from '@/lib/content/kanji/levels'
import { kunLabel } from '@/lib/content/kanji/kanjiText'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { Icon } from '@/components/ui/Icon'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { SpeakerButton } from '@/components/kana/SpeakerButton'
import { StrokeOrder } from '@/components/kana/StrokeOrder'
import { TracePad } from '@/components/kana/TracePad'
import { COURSE_CONTAINER } from '@/components/kanaCourse/coursePages'
import { kanjiGlyph } from '@/components/kanji/kanjiGlyph'
import { KanjiDataCredit } from '@/components/kanji/KanjiCourseHeader'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { cn } from '@/lib/cn'

/**
 * The kanji page (/kanji/日, shareable): stroke order and tracing, meanings,
 * every reading with the key one starred, parts (and where else they
 * appear), the memory hint and your own note, example words with audio,
 * look-alikes. `?in=n5` or `?in=browse` sets the back link
 * and previous / next.
 */
export function KanjiDetailPage() {
  const { char } = useParams<{ char: string }>()
  if (!isKanjiChar(char)) return <NotFoundPage />
  return <KanjiDetail key={char} char={char} />
}

function KanjiDetail({ char }: { char: string }) {
  const { data: entry, isLoading, error, refetch } = useKanjiEntry(char)
  const indexes = useAllKanjiIndexes()

  useEffect(() => {
    document.title = entry ? `${char} · ${entry.meanings[0]} · Kanji · FoxSensei` : `${char} · Kanji · FoxSensei`
  }, [char, entry])

  return (
    <main className="pb-24 pt-nav">
      <div className={cn(COURSE_CONTAINER, 'pt-4 md:pt-6')}>
        <ContextNav char={char} indexes={indexes.data} />
        {isLoading ? (
          <LoadingState label={`Loading ${char}…`}>
            <div className="mt-6 grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
              <SkeletonBlock className="aspect-square w-full rounded-2xl" />
              <div className="space-y-3">
                <SkeletonBlock className="h-10 w-2/3 rounded-xl" />
                <SkeletonBlock className="h-24 w-full rounded-2xl" />
                <SkeletonBlock className="h-40 w-full rounded-2xl" />
              </div>
            </div>
          </LoadingState>
        ) : error ? (
          <ErrorState message={`We couldn't load ${char}.`} onRetry={refetch} />
        ) : entry ? (
          <EntryView entry={entry} indexes={indexes.data ?? []} />
        ) : (
          <EmptyState
            icon="travel_explore"
            title={`${char} isn't in the course yet`}
            description="FoxSensei covers N5 and N4 kanji today; N3 to N1 are coming soon."
          />
        )}
        <KanjiDataCredit className="mt-12" />
      </div>
    </main>
  )
}

/** Back link (level or Browse) and previous / next within that list. */
function ContextNav({ char, indexes }: { char: string; indexes?: KanjiLevelIndex[] }) {
  const [params] = useSearchParams()
  const from = params.get('in') ?? undefined
  const rows = useMemo(() => {
    if (!indexes) return []
    if (isKanjiLevelId(from)) return indexes.find((i) => i.level === from)?.rows ?? []
    return indexes.find((i) => i.rows.some((r) => r.char === char))?.rows ?? []
  }, [indexes, from, char])
  const at = rows.findIndex((r) => r.char === char)
  const level = at >= 0 ? rows[at].level : isKanjiLevelId(from) ? from : undefined
  const back = from === 'browse' && level
    ? { to: kanjiLevelPagePath(level, 'browse'), label: 'Browse' }
    : level
      ? { to: kanjiLevelPath(level), label: kanjiLevelMeta(level).title }
      : { to: kanjiLevelPath('n5'), label: 'Kanji' }
  const prev = at > 0 ? rows[at - 1] : undefined
  const next = at >= 0 && at < rows.length - 1 ? rows[at + 1] : undefined
  const keepFrom = isKanjiLevelId(from) || from === 'browse' ? from : undefined

  return (
    <nav aria-label="Kanji navigation" className="flex items-center justify-between gap-2">
      <Link to={back.to} className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <Icon name="arrow_back" className="text-lg" />
        {back.label}
      </Link>
      <div className="flex items-center gap-1">
        <StepLink row={prev} dir="prev" from={keepFrom} />
        <StepLink row={next} dir="next" from={keepFrom} />
      </div>
    </nav>
  )
}

function StepLink({ row, dir, from }: { row?: KanjiIndexRow; dir: 'prev' | 'next'; from?: Parameters<typeof kanjiCharPath>[1] }) {
  if (!row) return <span className="h-11 w-11" aria-hidden />
  return (
    <Link
      to={kanjiCharPath(row.char, from)}
      aria-label={`${dir === 'prev' ? 'Previous' : 'Next'} kanji: ${row.char}, ${row.meaning}`}
      className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {dir === 'prev' && <Icon name="chevron_left" className="text-xl" />}
      <span lang="ja" className="font-jp text-lg">
        {row.char}
      </span>
      {dir === 'next' && <Icon name="chevron_right" className="text-xl" />}
    </Link>
  )
}

const PANEL = 'rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low sm:p-5'

function Section({ id, title, children, className }: { id: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={className}>
      <h2 id={id}>
        <Eyebrow>{title}</Eyebrow>
      </h2>
      {children}
    </section>
  )
}

function EntryView({ entry, indexes }: { entry: KanjiEntry; indexes: KanjiLevelIndex[] }) {
  const { speak, supported } = useJapaneseSpeech()
  const level = kanjiLevelMeta(entry.jlpt)
  const unitIndex = indexes.find((i) => i.level === entry.jlpt)
  const unitNumber = unitIndex ? unitIndex.units.findIndex((u) => u.id === entry.unitId) + 1 : 0
  const unit = unitIndex?.units[unitNumber - 1]

  return (
    <div className="mt-4 grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-12">
      <StrokePanel char={entry.char} />

      <div className="min-w-0 space-y-8">
        <header>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{level.label}</span>
            {entry.grade && <span className="rounded-full bg-surface-container-high px-2.5 py-1">{entry.grade <= 6 ? `Grade ${entry.grade}` : 'Secondary school'}</span>}
            <span className="rounded-full bg-surface-container-high px-2.5 py-1 tabular-nums">{entry.strokes} strokes</span>
            {entry.freq && <span className="rounded-full bg-surface-container-high px-2.5 py-1 tabular-nums">#{entry.freq} most common</span>}
          </div>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-headline text-display-sm font-extrabold tracking-tight text-on-surface">
            <span lang="ja" className="font-jp lg:hidden">
              {entry.char}
            </span>
            <span>{entry.meanings[0]}</span>
          </h1>
          {entry.meanings.length > 1 && <p className="mt-1 text-on-surface-variant">{entry.meanings.slice(1).join(', ')}</p>}
          {unit && (
            <Link
              to={kanjiUnitPath(entry.jlpt, unit.id)}
              className="-ml-2 mt-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {level.title} · Unit {unitNumber}: {unit.title}
              <Icon name="chevron_right" className="text-lg" />
            </Link>
          )}
        </header>

        <Readings entry={entry} />
        <Parts entry={entry} indexes={indexes} />
        <MemoryHint entry={entry} />
        <Section id="words-heading" title="Words">
          <ul className={cn(PANEL, 'divide-y divide-outline-variant/40 p-0 sm:p-0')}>
            {entry.vocab.map((v) => (
              <li key={v.word} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span lang="ja" className="font-jp text-xl font-bold text-on-surface">
                      {v.word}
                    </span>
                    <span lang="ja" className="font-jp text-on-surface-variant">
                      {v.reading}
                    </span>
                    {v.isKey && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary">
                        <Icon name="star" filled className="text-sm" />
                        Key word
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-on-surface-variant">{v.meaning}</p>
                </div>
                {supported && <SpeakerButton onClick={() => speak(v.reading)} label={`Play ${v.word}`} />}
              </li>
            ))}
          </ul>
        </Section>
        <LookAlikes entry={entry} indexes={indexes} />
      </div>
    </div>
  )
}

function StrokePanel({ char }: { char: string }) {
  const strokes = useKanjiStrokes(char)
  const [mode, setMode] = useState<'watch' | 'trace'>('watch')
  return (
    <div className="lg:sticky lg:top-[calc(theme(spacing.nav)+theme(spacing.6))] lg:self-start">
      <p lang="ja" aria-hidden className="hidden text-center font-jp text-8xl font-bold leading-none text-on-surface lg:block">
        {char}
      </p>
      <div className={cn(PANEL, 'mt-4')}>
        <div role="tablist" aria-label="Strokes" className="mb-3 flex gap-1">
          {(['watch', 'trace'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                'min-h-11 flex-1 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                mode === m ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low',
              )}
            >
              {m === 'watch' ? 'Stroke order' : 'Trace it'}
            </button>
          ))}
        </div>
        {strokes.status === 'loading' && (
          <LoadingState label="Loading strokes…">
            <SkeletonBlock className="mx-auto aspect-square w-full max-w-[15rem] rounded-2xl" />
          </LoadingState>
        )}
        {strokes.status === 'error' && <ErrorState title="Couldn't load strokes" message="Check your connection and try again." onRetry={strokes.retry} className="py-6" />}
        {strokes.status === 'missing' && <p className="text-sm text-on-surface-variant">Stroke data isn't available for this kanji yet.</p>}
        {strokes.status === 'ready' &&
          (mode === 'watch' ? (
            <StrokeOrder glyph={kanjiGlyph(strokes.data)} character={char} />
          ) : (
            <TracePad glyph={kanjiGlyph(strokes.data)} />
          ))}
      </div>
    </div>
  )
}

function Readings({ entry }: { entry: KanjiEntry }) {
  const key = entry.keyReading
  const star = (
    <span className="inline-flex items-center text-primary">
      <Icon name="star" filled className="text-sm" />
      <span className="sr-only">(key reading)</span>
    </span>
  )
  return (
    <Section id="readings-heading" title="Readings">
      <div className={cn(PANEL, 'grid gap-4 sm:grid-cols-2')}>
        <div>
          <h3 className="text-sm font-semibold text-on-surface">
            On’yomi <span className="font-normal text-on-surface-variant">· from Chinese, mostly in compounds</span>
          </h3>
          <p lang="ja" className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-jp text-xl text-on-surface">
            {entry.on.length ? entry.on.map((r) => (
              <span key={r} className={cn('inline-flex items-center gap-0.5', key.type === 'on' && key.kana === r && 'font-bold')}>
                {r}
                {key.type === 'on' && key.kana === r && star}
              </span>
            )) : <span className="font-body text-sm text-on-surface-variant">None</span>}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-on-surface">
            Kun’yomi <span className="font-normal text-on-surface-variant">· native Japanese</span>
          </h3>
          <p lang="ja" className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-jp text-xl text-on-surface">
            {entry.kun.length ? entry.kun.map((k) => {
              const isKey = key.type === 'kun' && key.kana === k.kana && !k.affix
              return (
                <span key={kunLabel(k)} className={cn('inline-flex items-center gap-0.5', isKey && 'font-bold')}>
                  {kunLabel(k)}
                  {isKey && star}
                </span>
              )
            }) : <span className="font-body text-sm text-on-surface-variant">None</span>}
          </p>
        </div>
        {entry.readingTip && (
          <p className="flex gap-2 rounded-xl bg-surface-container-low p-3 text-sm text-on-surface sm:col-span-2">
            <Icon name="lightbulb" className="shrink-0 text-lg text-primary" />
            <span lang="en">{entry.readingTip}</span>
          </p>
        )}
      </div>
    </Section>
  )
}

function Parts({ entry, indexes }: { entry: KanjiEntry; indexes: KanjiLevelIndex[] }) {
  const rows = useMemo(() => indexes.flatMap((i) => i.rows), [indexes])
  const parts = entry.parts.filter((p) => p.char !== entry.char || entry.parts.length > 1)
  if (parts.length === 0) return null
  return (
    <Section id="parts-heading" title="Built from">
      <ul className="space-y-2">
        {parts.map((p) => {
          const alsoIn = rows.filter((r) => r.char !== entry.char && r.parts.includes(p.char)).slice(0, 8)
          return (
            <li key={p.char} className={cn(PANEL, 'flex flex-wrap items-center gap-x-4 gap-y-2 p-3 sm:p-3')}>
              <span className="flex items-center gap-2">
                <span lang="ja" className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-high font-jp text-2xl text-on-surface">
                  {p.char}
                </span>
                <span className="font-semibold text-on-surface">{p.name}</span>
              </span>
              {alsoIn.length > 0 && (
                <span className="flex flex-wrap items-center gap-1 text-sm text-on-surface-variant">
                  also in
                  {alsoIn.map((r) => (
                    <Link
                      key={r.char}
                      to={kanjiCharPath(r.char, r.level)}
                      lang="ja"
                      aria-label={`${r.char}, ${r.meaning}`}
                      className="inline-flex h-11 w-9 items-center justify-center rounded-lg font-jp text-lg text-on-surface hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {r.char}
                    </Link>
                  ))}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

function MemoryHint({ entry }: { entry: KanjiEntry }) {
  return (
    <Section id="hint-heading" title="Remember it">
      <div className={cn(PANEL, 'space-y-4')}>
        {entry.mnemonic && (
          <p className="text-on-surface">
            {entry.mnemonic.text}
            {entry.mnemonic.draft && (
              <span className="ml-2 rounded-full bg-surface-container-high px-2 py-0.5 align-middle text-2xs font-semibold uppercase tracking-wide text-on-surface-variant">
                Draft
              </span>
            )}
          </p>
        )}
        <LearnerOnly>
          <KanjiNoteField char={entry.char} />
        </LearnerOnly>
      </div>
    </Section>
  )
}

const NOTE_SAVE_DELAY_MS = 500
/** The server keeps notes up to 1000 characters. */
const NOTE_MAX_LENGTH = 1000

const NOTE_STATUS: Record<KanjiNoteSave, string> = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved to your account.',
  failed: "Couldn't save your note. Check your connection, then edit it to try again.",
}

function KanjiNoteField({ char }: { char: string }) {
  const { text, isLoading, error, refetch, save, saveState } = useKanjiNote(char)
  if (isLoading) return <SkeletonBlock className="h-20 w-full rounded-xl" />
  if (error || text === undefined) return <ErrorState message="We couldn't load your note." onRetry={refetch} />
  return <NoteEditor initial={text} onSave={save} saveState={saveState} />
}

function NoteEditor({ initial, onSave, saveState }: { initial: string; onSave: (text: string) => void; saveState: KanjiNoteSave }) {
  const [note, setNote] = useState(initial)
  const [edited, setEdited] = useState(false)

  useEffect(() => {
    if (!edited) return
    const t = window.setTimeout(() => onSave(note), NOTE_SAVE_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [note, edited, onSave])

  return (
    <div>
      <label htmlFor="kanji-note" className="text-sm font-semibold text-on-surface">
        Your note
      </label>
      <textarea
        id="kanji-note"
        value={note}
        onChange={(e) => {
          setNote(e.target.value)
          setEdited(true)
        }}
        rows={2}
        maxLength={NOTE_MAX_LENGTH}
        placeholder="Write your own way to remember it"
        className="mt-1 w-full resize-y rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 text-base text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      <p aria-live="polite" className="min-h-4 text-xs text-on-surface-variant">
        {edited ? NOTE_STATUS[saveState] : ''}
      </p>
    </div>
  )
}

function LookAlikes({ entry, indexes }: { entry: KanjiEntry; indexes: KanjiLevelIndex[] }) {
  const byChar = useMemo(() => new Map(indexes.flatMap((i) => i.rows).map((r) => [r.char, r])), [indexes])
  if (!entry.lookAlikes?.length) return null
  return (
    <Section id="lookalikes-heading" title="Don’t mix it up with">
      <ul className="grid gap-2 sm:grid-cols-2">
        {entry.lookAlikes.map((l) => {
          const row = byChar.get(l.char)
          const body = (
            <>
              <span lang="ja" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-container-high font-jp text-3xl text-on-surface">
                {l.char}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-on-surface">{row?.meaning ?? 'Not in N5–N4'}</span>
                {l.note && <span className="block text-sm text-on-surface-variant">{l.note}</span>}
              </span>
            </>
          )
          return (
            <li key={l.char}>
              {row ? (
                <Link
                  to={kanjiCharPath(l.char, row.level)}
                  className={cn(PANEL, 'flex items-center gap-3 p-3 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-3')}
                >
                  {body}
                </Link>
              ) : (
                <div className={cn(PANEL, 'flex items-center gap-3 p-3 sm:p-3')}>{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

