import { memo, useId, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { hasJapanese } from '@/lib/testCenter/mark'
import type { ScopeGroup } from '@/lib/testCenter/sources'
import { ANSWER_LABEL, TEST_SUBJECTS, type TestFormatDef } from '@/lib/testCenter/subjects'
import type { TestFormatId, TestSubjectId } from '@/lib/testCenter/types'

const FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
const CARD = 'rounded-xl border bg-surface-raised transition-colors'
const CARD_IDLE = 'border-line hover:border-line-strong'
const CARD_ON = 'border-primary bg-primary/5 dark:bg-primary/10'

/** One part of the setup card: a small icon, a title with a hint, an optional action on the right. */
export function SetupSection({
  icon,
  title,
  hint,
  action,
  children,
}: {
  icon: string
  title: string
  hint?: string
  action?: ReactNode
  children: ReactNode
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Icon name={icon} className="shrink-0 text-xl text-primary" />
          <h2 id={id} className="font-display text-base font-bold text-ink">
            {title}
          </h2>
          {hint && <p className="hidden truncate text-sm text-ink-muted sm:block">· {hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

// ─── Subject ─────────────────────────────────────────────────────────────────

/** The subjects as compact radio tiles: glyph, name, tagline. */
export function SubjectPicker({ value, onChange }: { value: TestSubjectId; onChange: (id: TestSubjectId) => void }) {
  const name = useId()
  return (
    <fieldset>
      <legend className="sr-only">Subject</legend>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {TEST_SUBJECTS.map((s) => {
          const on = s.id === value
          return (
            <label
              key={s.id}
              className={cn(
                CARD,
                'relative flex cursor-pointer flex-col items-center px-2 py-3 text-center has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary',
                on ? CARD_ON : CARD_IDLE,
              )}
            >
              <input type="radio" name={name} value={s.id} checked={on} onChange={() => onChange(s.id)} className="sr-only" />
              <span
                aria-hidden
                lang="ja"
                className={cn('font-ja text-3xl font-bold leading-none', on ? 'text-primary' : 'text-ink')}
              >
                {s.glyph}
              </span>
              <span className="mt-2 text-sm font-bold text-ink">{s.title}</span>
              <span className="text-xs text-ink-muted">{s.tagline}</span>
              {on && <Icon name="check_circle" filled className="absolute right-2 top-2 text-lg text-primary" />}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

// ─── Pills (level, length) ───────────────────────────────────────────────────

export interface PillOption {
  id: string
  label: ReactNode
  disabled?: boolean
  /** Why it is disabled, e.g. "coming soon": a tooltip, and read out after the label. */
  note?: string
}

/** A single choice from a few short options, as a row of pills (a radio group). */
export function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: PillOption[]
  value: string
  onChange: (id: string) => void
}) {
  const name = useId()
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.id === value
          return (
            <label
              key={o.id}
              title={o.disabled ? o.note : undefined}
              className={cn(
                'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary',
                o.disabled
                  ? 'cursor-not-allowed border-line text-ink-subtle'
                  : on
                    ? 'cursor-pointer border-primary bg-primary text-on-primary'
                    : 'cursor-pointer border-line text-ink-muted hover:border-line-strong hover:text-ink',
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.id}
                checked={on}
                disabled={o.disabled}
                onChange={() => onChange(o.id)}
                className="sr-only"
              />
              {o.label}
              {o.disabled && o.note && <span className="sr-only">, {o.note}</span>}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

// ─── Scope ───────────────────────────────────────────────────────────────────

interface ScopePickerProps {
  groups: ScopeGroup[]
  selected: ReadonlySet<string>
  onChange: (ids: string[]) => void
  /** "rows", "units", "chapters". */
  noun: string
  /** Show chapter numbers in front of the titles (grammar). */
  numbered?: boolean
}

/** Rows / units / chapters as toggle chips, by group; each group can be taken whole or cleared. */
export function ScopePicker({ groups, selected, onChange, noun, numbered }: ScopePickerProps) {
  const all = groups.flatMap((g) => g.items.map((i) => i.id))
  const set = (ids: Iterable<string>) => onChange(all.filter((id) => new Set(ids).has(id)))
  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set(next)
  }
  const setGroup = (group: ScopeGroup, on: boolean) => {
    const next = new Set(selected)
    for (const i of group.items) {
      if (on) next.add(i.id)
      else next.delete(i.id)
    }
    set(next)
  }

  return (
    <div className="space-y-5">
      {groups.map((g) => {
        const count = g.items.filter((i) => selected.has(i.id)).length
        const whole = count === g.items.length
        return (
          <div key={g.id} role="group" aria-label={g.title}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">
                {g.title}
                <span className="ml-2 font-normal text-ink-muted">
                  {count} of {g.items.length}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setGroup(g, !whole)}
                className={cn('min-h-9 rounded-sm px-2 text-sm font-semibold text-primary underline-offset-2 hover:underline', FOCUS)}
              >
                {whole ? 'Clear' : `All ${g.items.length}`}
                <span className="sr-only">
                  {' '}
                  {noun} in {g.title}
                </span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {g.items.map((item) => (
                <ScopeChip
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  preview={numbered ? undefined : item.preview}
                  number={numbered ? item.id : undefined}
                  on={selected.has(item.id)}
                  onToggle={toggle}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface ScopeChipProps {
  id: string
  title: string
  preview?: string
  number?: string
  on: boolean
  onToggle: (id: string) => void
}

const ScopeChip = memo(function ScopeChip({ id, title, preview, number, on, onToggle }: ScopeChipProps) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onToggle(id)}
      className={cn(
        'inline-flex min-h-10 max-w-full items-center gap-2 rounded-md border px-3 py-1.5 text-left text-sm transition-colors',
        FOCUS,
        on
          ? 'border-primary bg-primary/10 text-ink'
          : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
      )}
    >
      <Icon
        name={on ? 'check_circle' : 'radio_button_unchecked'}
        filled={on}
        className={cn('shrink-0 text-lg', on ? 'text-primary' : 'text-ink-subtle')}
      />
      {number && <span className="shrink-0 font-bold tabular-nums">{number}</span>}
      <span lang={hasJapanese(title) ? 'ja' : undefined} className="min-w-0 truncate font-medium">
        {title}
      </span>
      {preview && (
        <span aria-hidden lang="ja" className="hidden shrink-0 font-ja text-xs text-ink-muted sm:inline">
          {preview}
        </span>
      )}
    </button>
  )
})

// ─── Question types ──────────────────────────────────────────────────────────

/** The subject's question formats as checkbox cards, each with a mini picture of the question. */
export function FormatPicker({
  formats,
  selected,
  onChange,
}: {
  formats: readonly TestFormatDef[]
  selected: readonly TestFormatId[]
  onChange: (ids: TestFormatId[]) => void
}) {
  const toggle = (id: TestFormatId) => {
    const next = selected.includes(id) ? selected.filter((f) => f !== id) : [...selected, id]
    // Keep the subject's order, so the summary reads the same way as the cards.
    onChange(formats.map((f) => f.id).filter((f) => next.includes(f)))
  }
  return (
    <fieldset>
      <legend className="sr-only">Question types</legend>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-2.5">
        {formats.map((f) => (
          <FormatCard key={f.id} format={f} on={selected.includes(f.id)} onToggle={toggle} />
        ))}
      </div>
    </fieldset>
  )
}

const FormatCard = memo(function FormatCard({
  format,
  on,
  onToggle,
}: {
  format: TestFormatDef
  on: boolean
  onToggle: (id: TestFormatId) => void
}) {
  const kind = ANSWER_LABEL[format.answer]
  return (
    <label
      title={format.summary}
      className={cn(
        CARD,
        'relative flex cursor-pointer flex-col items-center px-3 py-3 text-center has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary',
        on ? CARD_ON : CARD_IDLE,
      )}
    >
      <input type="checkbox" checked={on} onChange={() => onToggle(format.id)} className="sr-only" />
      <span
        aria-hidden
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full',
          on ? 'bg-primary/15 text-primary' : 'bg-surface-hover text-ink-muted',
        )}
      >
        <Icon name={kind.icon} className="text-xl" />
      </span>
      <span className="mt-2 text-sm font-bold leading-tight text-ink">{format.title}</span>
      <span className="mt-0.5 text-xs text-ink-muted">{kind.label}</span>
      <span className="sr-only">. {format.summary}</span>
      {on && <Icon name="check_circle" filled className="absolute right-2 top-2 text-lg text-primary" />}
    </label>
  )
})
