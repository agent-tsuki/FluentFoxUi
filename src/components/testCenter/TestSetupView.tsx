import { useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { levelOptions, useTestSource } from '@/hooks/useTestSource'
import { ANSWER_LABEL, TEST_LENGTHS, formatDef, subjectDef } from '@/lib/testCenter/subjects'
import type { TestSource } from '@/lib/testCenter/sources'
import type { TestQuestion, TestSetup } from '@/lib/testCenter/types'
import { FormatPicker, PillGroup, ScopePicker, SetupSection, SubjectPicker } from './SetupControls'
import { ReviewsStrip } from './ReviewsStrip'
import { TestHeroScene } from './TestHeroScene'
import { effectiveScope, useTestSetup } from './useTestSetup'

interface TestSetupViewProps {
  /** Starts a test with these questions (built fresh for each start). */
  onStart: (setup: TestSetup, questions: TestQuestion[], source: TestSource) => void
}

/**
 * The practice test setup (/quiz): pick a subject, its level, what to cover,
 * the question types that suit it, and a length; the summary on the side (a
 * bar at the bottom on phones) shows what you'll get and starts it.
 */
export function TestSetupView({ onStart }: TestSetupViewProps) {
  const { setup, setSubject, setLevel, setScope, setFormats, setCount } = useTestSetup()
  const subject = subjectDef(setup.subject)
  const source = useTestSource(setup.subject, setup.level)
  const groups = useMemo(() => source.data?.groups ?? [], [source.data])
  const scope = useMemo(() => effectiveScope(setup.scope, groups), [setup.scope, groups])
  const selected = useMemo(() => new Set(scope), [scope])

  // Built here to know how many questions the choices can make; Start builds a fresh, reshuffled set.
  const preview = useMemo(
    () => (source.data && scope.length && setup.formats.length ? source.data.build(scope, setup.formats, setup.count) : []),
    [source.data, scope, setup.formats, setup.count],
  )
  const covered = groups.flatMap((g) => g.items).filter((i) => selected.has(i.id))
  const size = covered.reduce((n, i) => n + i.size, 0)
  const seconds = setup.formats.reduce((n, f) => n + formatDef(f).seconds, 0) / Math.max(1, setup.formats.length)
  const minutes = Math.max(1, Math.round((preview.length * seconds) / 60))

  const blocked = !source.data
    ? 'Loading…'
    : !scope.length
      ? `Pick at least one ${subject.scopeNoun.one}`
      : !setup.formats.length
        ? 'Pick at least one question type'
        : !preview.length
          ? 'These choices have nothing to ask yet'
          : null

  const start = () => {
    if (!source.data || blocked) return
    const fullSetup: TestSetup = { ...setup, scope }
    onStart(fullSetup, source.data.build(scope, setup.formats, setup.count), source.data)
  }

  // What to cover is folded away (it's long); a summary line shows the choice.
  const [scopeOpen, setScopeOpen] = useState(false)
  const levels = levelOptions(setup.subject)
  const levelLabel = levels.find((l) => l.id === setup.level)?.label ?? ''
  const kinds = [...new Set(setup.formats.map((f) => formatDef(f).answer))]

  const summary = (
    <dl className="space-y-3 text-sm">
      <SummaryRow label="Subject">
        {subject.title} · {levelLabel}
      </SummaryRow>
      <SummaryRow label="Covers">
        {covered.length
          ? `${covered.length} ${covered.length === 1 ? subject.scopeNoun.one : subject.scopeNoun.many} · ${size} ${source.data?.unit ?? ''}`
          : '—'}
      </SummaryRow>
      <SummaryRow label="Answer by">
        {kinds.length ? (
          <span className="flex flex-wrap justify-end gap-1">
            {kinds.map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 rounded-full bg-surface-hover px-2 py-0.5 text-xs font-semibold text-ink-muted"
              >
                <Icon name={ANSWER_LABEL[k].icon} className="text-sm" />
                {ANSWER_LABEL[k].label}
              </span>
            ))}
          </span>
        ) : (
          '—'
        )}
      </SummaryRow>
      <SummaryRow label="Questions">
        {preview.length}
        {preview.length > 0 && preview.length < setup.count && (
          <span className="font-normal text-ink-muted"> (all there are)</span>
        )}
      </SummaryRow>
      <SummaryRow label="Time">{preview.length ? `about ${minutes} min` : '—'}</SummaryRow>
    </dl>
  )

  const scopeLine = covered.length
    ? `${covered.map((i) => (setup.subject === 'grammar' ? `Ch. ${i.id}` : i.title)).join(', ')}`
    : `No ${subject.scopeNoun.many} chosen`

  return (
    <main className="relative pb-28 pt-nav lg:pb-16">
      {/* Header scene, fading into the page and calmer behind the title. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] overflow-hidden sm:h-[27rem]">
        <TestHeroScene className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-surface" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <header className="max-w-xl pb-6 pt-8 sm:pb-8 sm:pt-12">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-surface/70 px-3 py-1 text-xs font-bold text-primary backdrop-blur">
            <Icon name="bolt" className="text-base" />
            Practice tests
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">Test yourself</h1>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            Choose a subject and how to answer, then start. Ungraded and just for practice.
          </p>
        </header>

        <ReviewsStrip className="mb-6" />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="min-w-0 space-y-6 rounded-3xl border border-line bg-surface-raised/90 p-4 shadow-elevation-2 backdrop-blur-md/90 sm:p-6">
            <SetupSection icon="grid_view" title="Subject" hint="What you want to practise">
              <SubjectPicker value={setup.subject} onChange={setSubject} />
            </SetupSection>

            <SetupSection icon="quiz" title="Question types" hint="Pick one or mix several">
              <FormatPicker formats={subject.formats} selected={setup.formats} onChange={setFormats} />
            </SetupSection>

            <div className="grid gap-6 sm:grid-cols-2">
              <SetupSection icon="school" title={subject.levelLabel}>
                <PillGroup
                  label={subject.levelLabel}
                  value={setup.level}
                  onChange={setLevel}
                  options={levels.map((l) => ({
                    id: l.id,
                    label: l.native ? (
                      <>
                        {l.label}
                        <span lang="ja" className="font-ja text-xs font-medium opacity-80">
                          {l.native}
                        </span>
                      </>
                    ) : (
                      l.label
                    ),
                    disabled: !l.available,
                    note: 'coming soon',
                  }))}
                />
              </SetupSection>
              <SetupSection icon="format_list_numbered" title="Questions">
                <PillGroup
                  label="Number of questions"
                  value={String(setup.count)}
                  onChange={(v) => setCount(Number(v))}
                  options={TEST_LENGTHS.map((n) => ({
                    id: String(n),
                    label: String(n),
                  }))}
                />
              </SetupSection>
            </div>

            <SetupSection
              icon="filter_list"
              title="What to cover"
              action={
                source.data && (
                  <button
                    type="button"
                    aria-expanded={scopeOpen}
                    aria-controls="test-scope"
                    onClick={() => setScopeOpen((o) => !o)}
                    className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-sm px-2 text-sm font-semibold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {scopeOpen ? 'Done' : 'Change'}
                    <Icon name={scopeOpen ? 'expand_less' : 'expand_more'} className="text-lg" />
                  </button>
                )
              }
            >
              {source.isLoading || (!source.data && !source.error) ? (
                <LoadingState label="Loading…">
                  <SkeletonBlock className="h-11 w-full rounded-md" />
                </LoadingState>
              ) : source.error || !source.data ? (
                <ErrorState message="We couldn't load this subject." onRetry={source.refetch} />
              ) : (
                <>
                  {!scopeOpen && (
                    <button
                      type="button"
                      onClick={() => setScopeOpen(true)}
                      className="flex w-full items-center gap-3 rounded-md bg-surface-sunken px-3 py-2.5 text-left text-sm hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-surface-sunken"
                    >
                      <span className="shrink-0 font-semibold text-ink">
                        {covered.length} {covered.length === 1 ? subject.scopeNoun.one : subject.scopeNoun.many}
                      </span>
                      <span lang={setup.subject === 'kana' ? 'ja' : undefined} className="min-w-0 flex-1 truncate text-ink-muted">
                        {scopeLine}
                      </span>
                      <span className="sr-only">, change</span>
                    </button>
                  )}
                  <div id="test-scope" hidden={!scopeOpen}>
                    <ScopePicker
                      groups={groups}
                      selected={selected}
                      onChange={setScope}
                      noun={subject.scopeNoun.many}
                      numbered={setup.subject === 'grammar'}
                    />
                  </div>
                </>
              )}
            </SetupSection>
          </div>

          {/* Desktop: a summary that stays in view. */}
          <aside aria-label="Your test" className="hidden lg:block">
            <div className="sticky top-[calc(theme(spacing.nav)+1.5rem)] space-y-4">
              <div className="rounded-3xl border border-line bg-surface-raised/90 p-5 shadow-elevation-2 backdrop-blur-md/90">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    aria-hidden
                    lang="ja"
                    className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-ja text-xl font-bold text-primary"
                  >
                    {subject.glyph}
                  </span>
                  <h2 className="font-display text-lg font-bold text-ink">Your test</h2>
                </div>
                {summary}
                <Button
                  onClick={start}
                  disabled={Boolean(blocked)}
                  className="mt-5 flex w-full items-center justify-center gap-2 py-3 text-base disabled:pointer-events-none disabled:opacity-50"
                >
                  Start test
                  <Icon name="arrow_forward" className="text-xl" />
                </Button>
                {blocked && <p className="mt-2 text-center text-xs text-ink-muted">{blocked}</p>}
              </div>
              <p className="flex gap-2 rounded-xl bg-surface-sunken px-4 py-3 text-sm text-ink-muted dark:bg-surface-sunken">
                <Icon name="tips_and_updates" className="shrink-0 text-lg text-primary" />
                Short tests often beat one long one. Retry what you missed straight after.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Phones and tablets: the essentials and Start, pinned to the bottom. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <p className="min-w-0 flex-1 text-sm">
            <span className="block truncate font-semibold text-ink">
              {subject.title} · {levelLabel}
            </span>
            <span className="block truncate text-ink-muted">
              {blocked ?? `${preview.length} questions · about ${minutes} min`}
            </span>
          </p>
          <Button
            onClick={start}
            disabled={Boolean(blocked)}
            className="flex shrink-0 items-center gap-1.5 disabled:pointer-events-none disabled:opacity-50"
          >
            Start
            <Icon name="arrow_forward" className="text-lg" />
          </Button>
        </div>
      </div>
    </main>
  )
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{children}</dd>
    </div>
  )
}
