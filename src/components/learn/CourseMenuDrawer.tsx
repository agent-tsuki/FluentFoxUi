import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { KanaChar } from '@/types'
import { useKanaScript } from '@/context/KanaScriptContext'
import { scriptKanaCount } from '@/lib/content/kana/scripts'
import { coursePagesFor } from '@/components/kanaCourse/coursePages'
import { useLearningPath } from '@/hooks/useLearningPath'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSheetDialog } from '@/components/kana/useSheetDialog'
import { CloseButton } from '@/components/ui/CloseButton'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { durations, easings, springs } from '@/lib/motion'
import { JaText } from '@/components/learn/JaText'
import { UnitStatusLine } from '@/components/learn/UnitStatusLine'
import { kanaPreview, unitKana, unitStatusSummary } from '@/components/learn/unitStatus'

interface CourseMenuDrawerProps {
  open: boolean
  onClose: () => void
  /** The unit being viewed; marked with aria-current="page". */
  currentUnitId: string
  /** Real kana by id, for the kana preview on each row. */
  kanaById: ReadonlyMap<string, KanaChar>
}

const TITLE_ID = 'course-menu-title'
const FOOTER_IDS = new Set(['course', 'chart', 'tests'])

const PANEL = {
  phone: 'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl border-t pb-[env(safe-area-inset-bottom)]',
  desktop: 'inset-y-0 right-0 w-full max-w-[360px] rounded-l-3xl border-l',
}

const ROW = cn(
  'group relative flex min-h-11 items-start gap-3 rounded-xl px-3 py-2.5 transition-colors',
  'hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
)

/**
 * CourseMenuDrawer — the unit page's syllabus: every unit grouped, with its
 * status, plus the final test and links back to the course pages. A right-side
 * drawer from `md`, a bottom sheet on phones. Accessible modal dialog (focus
 * trap, Esc / backdrop close, focus returns to the trigger, body scroll lock);
 * under reduced motion it fades instead of sliding.
 */
export function CourseMenuDrawer({ open, onClose, currentUnitId, kanaById }: CourseMenuDrawerProps) {
  const reducedMotion = useReducedMotion()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const panelRef = useRef<HTMLDivElement>(null)
  const trapFocus = useSheetDialog({ open, panelRef, onClose })
  const script = useKanaScript()
  const path = useLearningPath()

  // useSheetDialog focuses the panel; move on to the current unit (next frame) and bring it into view.
  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => {
      const current = panelRef.current?.querySelector<HTMLElement>('[aria-current="page"]')
      if (!current) return
      current.focus()
      current.scrollIntoView({ block: 'center' })
    })
    return () => cancelAnimationFrame(raf)
  }, [open])

  const groups = useMemo(
    () =>
      script.groups.map((group) => ({
        group,
        units: script.units.flatMap((unit, i) =>
          group.unitIds.includes(unit.id)
            ? [{ unit, number: i + 1, status: unitStatusSummary(unit, path.units[unit.id]), preview: kanaPreview(unitKana(unit, kanaById)) }]
            : [],
        ),
      })),
    [script, path, kanaById],
  )
  const doneTotal = groups.reduce((n, g) => n + g.units.filter((u) => u.status.state === 'done' || u.status.state === 'skipped').length, 0)
  const finalTest = path.finalTest

  const hidden = isDesktop ? { x: '100%' } : { y: '100%' }
  const fade = { duration: durations.enter, ease: easings.out }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div key="course-menu" className="fixed inset-0 z-[60]">
          {/* Backdrop — bg-black (not on-surface, which flips per theme) so it always darkens. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: durations.exit } }}
            transition={fade}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={TITLE_ID}
            tabIndex={-1}
            onKeyDown={trapFocus}
            initial={reducedMotion ? { opacity: 0 } : hidden}
            animate={reducedMotion ? { opacity: 1 } : { x: 0, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { ...hidden, transition: { duration: durations.resize, ease: easings.out } }}
            transition={reducedMotion ? fade : springs.sheet}
            className={cn(
              'absolute flex flex-col border-outline-variant/40 bg-surface-container-lowest text-on-surface shadow-elevation-3 outline-none dark:border-outline/60',
              isDesktop ? PANEL.desktop : PANEL.phone,
            )}
          >
            {!isDesktop && <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-outline-variant" />}
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-outline-variant/40 pb-3 pl-5 pr-2 pt-2 dark:border-outline/40 md:pt-4">
              <div className="pt-2">
                <h2 id={TITLE_ID} className="font-headline text-lg font-bold text-on-surface">
                  Course menu
                </h2>
                <p className="text-sm tabular-nums text-on-surface-variant">
                  {script.label} · {doneTotal} of {script.units.length} units done
                </p>
              </div>
              <CloseButton onClick={onClose} aria-label="Close course menu" />
            </div>

            <nav aria-label={`${script.label} units`} className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3">
              {groups.map(({ group, units }) => {
                const groupDone = units.filter((u) => u.status.state === 'done' || u.status.state === 'skipped').length
                return (
                  <section key={group.id} aria-labelledby={`course-menu-${group.id}`} className="mb-3">
                    <h3
                      id={`course-menu-${group.id}`}
                      className="flex items-baseline justify-between gap-2 px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant"
                    >
                      <span>{group.title}</span>
                      <span className="font-semibold normal-case tracking-normal tabular-nums">
                        {groupDone} of {units.length} done
                      </span>
                    </h3>
                    <ol>
                      {units.map(({ unit, number, status, preview }) => {
                        const current = unit.id === currentUnitId
                        return (
                          <li key={unit.id}>
                            <Link
                              to={`${script.basePath}/unit/${unit.id}`}
                              onClick={onClose}
                              aria-current={current ? 'page' : undefined}
                              className={cn(ROW, current && 'bg-primary/10 hover:bg-primary/10')}
                            >
                              {current && <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />}
                              <span className="w-6 shrink-0 pt-0.5 text-right text-sm font-bold tabular-nums text-on-surface-variant">
                                {number}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-baseline gap-x-2">
                                  <span className={cn('text-base font-bold', current ? 'text-primary' : 'text-on-surface')}>
                                    <JaText text={unit.title} />
                                  </span>
                                  <span lang="ja" className="whitespace-nowrap font-jp text-sm text-on-surface-variant">
                                    {preview.text}
                                    {preview.truncated && '…'}
                                  </span>
                                </span>
                                <UnitStatusLine status={status} className="mt-0.5" />
                              </span>
                              {current && <span className="sr-only">(current unit)</span>}
                            </Link>
                          </li>
                        )
                      })}
                    </ol>
                  </section>
                )
              })}

              <Link to={`${script.basePath}/test`} onClick={onClose} className={cn(ROW, 'mt-1 items-center border-t border-outline-variant/40 pt-3 dark:border-outline/40')}>
                <span aria-hidden className="flex w-6 shrink-0 justify-end">
                  <Icon name="emoji_events" className="text-xl text-primary" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-on-surface">Final test</span>
                  <span className="block text-xs tabular-nums text-on-surface-variant">
                    All {scriptKanaCount(script)} {script.label.toLowerCase()} ·{' '}
                    {finalTest?.passedAt
                      ? `Passed · best ${Math.round(finalTest.best * 100)} %`
                      : finalTest
                        ? `Best ${Math.round(finalTest.best * 100)} %`
                        : `${Math.round(script.finalTest.passMark * 100)} % to pass`}
                  </span>
                </span>
                <Icon name="chevron_right" className="text-xl text-on-surface-variant" />
              </Link>
            </nav>

            <nav aria-label={`${script.label} course pages`} className="flex shrink-0 gap-1 border-t border-outline-variant/40 px-2 py-2 dark:border-outline/40">
              {coursePagesFor(script).filter((p) => FOOTER_IDS.has(p.id)).map((p) => (
                <Link
                  key={p.id}
                  to={p.to}
                  onClick={onClose}
                  className="flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {p.navLabel}
                </Link>
              ))}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
