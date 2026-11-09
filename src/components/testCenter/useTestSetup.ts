import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { levelOptions } from '@/hooks/useTestSource'
import type { ScopeGroup } from '@/lib/testCenter/sources'
import { TEST_LENGTHS, isTestSubject, subjectDef } from '@/lib/testCenter/subjects'
import type { TestFormatId, TestSetup, TestSubjectId } from '@/lib/testCenter/types'

const KEY = 'ff-test-setup-v1'

/** One subject's choices. `scope: null` means not chosen yet (the first group is used). */
export type SetupChoices = Omit<TestSetup, 'subject' | 'scope'> & { scope: string[] | null }

/** Choices kept per subject, so switching subjects and back keeps them. */
type Saved = { subject: TestSubjectId; bySubject: Partial<Record<TestSubjectId, SetupChoices>> }

function read(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY)
    const saved = raw ? (JSON.parse(raw) as Saved) : null
    return saved && isTestSubject(saved.subject) ? saved : null
  } catch {
    return null
  }
}

function write(saved: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(saved))
  } catch {
    /* blocked storage: the choices last for this visit only */
  }
}

function defaults(subject: TestSubjectId): SetupChoices {
  const level = levelOptions(subject).find((l) => l.available)?.id ?? ''
  const formats = subjectDef(subject)
    .formats.slice(0, 2)
    .map((f) => f.id)
  return { level, scope: null, formats, count: TEST_LENGTHS[0] }
}

/**
 * The practice test setup: subject, level, what to cover, question types and
 * length. Remembered in this browser per subject; `?subject=` picks the
 * subject (links from elsewhere, e.g. /quiz?subject=grammar).
 */
export function useTestSetup() {
  const [params, setParams] = useSearchParams()
  const [saved, setSaved] = useState<Saved>(() => {
    const stored = read() ?? { subject: 'kana', bySubject: {} }
    const fromUrl = params.get('subject')
    return isTestSubject(fromUrl) ? { ...stored, subject: fromUrl } : stored
  })

  const subject = saved.subject
  const setup: SetupChoices & { subject: TestSubjectId } = useMemo(() => {
    const own = saved.bySubject[subject]
    const base = defaults(subject)
    const level = own && levelOptions(subject).some((l) => l.id === own.level && l.available) ? own.level : base.level
    const known = new Set(subjectDef(subject).formats.map((f) => f.id))
    const formats = own?.formats.filter((f) => known.has(f)) ?? base.formats
    return { subject, level, scope: own?.scope ?? null, formats: formats.length ? formats : base.formats, count: own?.count ?? base.count }
  }, [saved, subject])

  useEffect(() => {
    write(saved)
  }, [saved])

  const update = useCallback(
    (patch: Partial<SetupChoices>) =>
      setSaved((s) => {
        const current = s.bySubject[s.subject] ?? defaults(s.subject)
        return { ...s, bySubject: { ...s.bySubject, [s.subject]: { ...current, ...patch } } }
      }),
    [],
  )

  const setSubject = useCallback(
    (next: TestSubjectId) => {
      setSaved((s) => ({ ...s, subject: next }))
      setParams(
        (p) => {
          p.set('subject', next)
          return p
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return {
    setup,
    setSubject,
    setLevel: useCallback((level: string) => update({ level, scope: null }), [update]),
    setScope: useCallback((scope: string[]) => update({ scope }), [update]),
    setFormats: useCallback((formats: TestFormatId[]) => update({ formats }), [update]),
    setCount: useCallback((count: number) => update({ count }), [update]),
  }
}

/**
 * The chosen scope, kept to ids that exist. Not chosen yet (or only stale ids
 * left from an older course) → the first group; cleared on purpose → nothing.
 */
export function effectiveScope(scope: readonly string[] | null, groups: readonly ScopeGroup[]): string[] {
  const first = groups[0]?.items.map((i) => i.id) ?? []
  if (scope === null) return first
  const known = new Set(groups.flatMap((g) => g.items.map((i) => i.id)))
  const kept = scope.filter((id) => known.has(id))
  return kept.length || scope.length === 0 ? kept : first
}
