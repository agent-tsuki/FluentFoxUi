import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { showToast } from '@/store/toastStore'
import { cn } from '@/lib/cn'

/** One step tab of a unit: its label, whether it is done, and what it shows. */
export interface UnitTab<S extends string> {
  id: S
  title: string
  /** Label on phones, where the tabs share one line. */
  short?: string
  icon: string
  /** One line above the step's content. */
  hint: string
  done: boolean
  /** The step's content; `goTo` switches to another tab (e.g. Learn's end moves on to Write). */
  render: (goTo: (step: S) => void) => ReactNode
}

interface UnitStepTabsProps<S extends string> {
  /** Unique per unit: prefixes the tab and panel ids. */
  idPrefix: string
  /** Accessible name of the tab list, e.g. "か row steps". */
  label: string
  tabs: UnitTab<S>[]
  /** The tab shown first. */
  initial: S
  quiz: {
    passed: boolean
    /** Best score, 0–1, once taken. */
    best?: number
    /** Opens the quiz; only called for a signed-in, verified learner. */
    onStart: () => void
    /** Where a guest returns after signing in (the quiz's URL). */
    returnTo: string
  }
  /** The worksheet download, when the unit has one. Resolves false when it failed. */
  pdf?: { done: boolean; onDownload: () => Promise<boolean> }
}

/** A pill in the step row that acts at once (quiz popup, PDF download) rather than switching the content. */
const ACTION_PILL = cn(
  'inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-outline-variant/60 px-2 text-xs font-semibold text-on-surface-variant transition-colors sm:flex-none sm:px-3.5 sm:text-sm',
  'hover:border-outline hover:text-on-surface disabled:cursor-wait',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
)

/**
 * UnitStepTabs — a unit's steps under its row, kept short: the steps are
 * small tabs whose content swaps in place (done ones carry a tick), and Quiz
 * and Download PDF are pills in the same row that act at once. The quiz pill
 * shows the best score, green when passed and red when not yet; guests are
 * asked to sign in first and unverified learners are told why. Used by the
 * kana Learn page and the kanji course page.
 */
export function UnitStepTabs<S extends string>({ idPrefix, label, tabs, initial, quiz, pdf }: UnitStepTabsProps<S>) {
  const [active, setActive] = useState<S>(initial)
  const [pdfWorking, setPdfWorking] = useState(false)
  const buttons = useRef<Partial<Record<S, HTMLButtonElement | null>>>({})
  const startQuiz = useQuizGate(quiz.onStart, quiz.returnTo)
  const current = tabs.find((t) => t.id === active) ?? tabs[0]
  if (!current) return null
  const tabId = (step: S) => `${idPrefix}-tab-${step}`
  const panelId = `${idPrefix}-tabpanel`

  // Arrow keys move between tabs (and select), as in any tab list.
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const at = tabs.indexOf(current)
    const to = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: tabs.length - 1 }[e.key]
    if (to === undefined) return
    e.preventDefault()
    const tab = tabs[(to + tabs.length) % tabs.length]
    if (!tab) return
    setActive(tab.id)
    buttons.current[tab.id]?.focus()
  }

  const downloadPdf = async () => {
    if (!pdf) return
    setPdfWorking(true)
    const ok = await pdf.onDownload().catch(() => false)
    setPdfWorking(false)
    if (!ok) showToast({ tone: 'error', title: "We couldn't make the worksheet", message: 'Please try again.' })
  }

  return (
    <>
      <div className="flex gap-1 sm:gap-1.5">
        <div role="tablist" aria-label={label} className="contents">
          {tabs.map((tab) => {
            const selected = tab.id === current.id
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  buttons.current[tab.id] = el
                }}
                type="button"
                role="tab"
                id={tabId(tab.id)}
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.id)}
                onKeyDown={onTabKey}
                className={cn(
                  // Phones: the tabs share the width (labels only); from sm they size to their content with an icon.
                  'inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border px-2 text-xs font-semibold transition-colors sm:flex-none sm:px-3.5 sm:text-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
                  selected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline-variant/60 text-on-surface-variant hover:border-outline hover:text-on-surface',
                )}
              >
                <Icon
                  name={tab.done ? 'check_circle' : tab.icon}
                  filled={tab.done}
                  className={cn('text-base sm:text-lg', !tab.done && 'hidden sm:inline')}
                />
                {tab.short ? (
                  <>
                    <span className="sm:hidden">{tab.short}</span>
                    <span className="hidden sm:inline">{tab.title}</span>
                  </>
                ) : (
                  tab.title
                )}
                {tab.done && <span className="sr-only">, done</span>}
              </button>
            )
          })}
        </div>
        <button type="button" onClick={startQuiz} className={ACTION_PILL}>
          <Icon
            name={quiz.passed ? 'check_circle' : 'quiz'}
            filled={quiz.passed}
            className={cn('text-base sm:text-lg', quiz.passed ? 'text-success' : 'hidden sm:inline')}
          />
          Quiz
          {quiz.best !== undefined && (
            <span
              className={cn(
                'rounded-full px-1.5 text-xs font-bold tabular-nums',
                quiz.passed ? 'bg-success/15 text-success' : 'bg-error/10 text-error',
              )}
            >
              <span className="sr-only">{quiz.passed ? ', passed with ' : ', not passed yet, best '}</span>
              {Math.round(quiz.best * 100)}%
            </span>
          )}
        </button>
        {pdf && (
          <button type="button" onClick={downloadPdf} disabled={pdfWorking} aria-busy={pdfWorking || undefined} className={ACTION_PILL}>
            <Icon
              name={pdfWorking ? 'progress_activity' : pdf.done ? 'check_circle' : 'download'}
              filled={pdf.done && !pdfWorking}
              className={cn('text-base sm:text-lg', pdfWorking && 'animate-spin motion-reduce:animate-none')}
            />
            {pdfWorking ? (
              'Preparing…'
            ) : (
              <>
                <span className="sm:hidden">PDF</span>
                <span className="hidden sm:inline">Download PDF</span>
              </>
            )}
            {pdf.done && <span className="sr-only">, downloaded before</span>}
          </button>
        )}
      </div>

      <div role="tabpanel" id={panelId} aria-labelledby={tabId(current.id)} className="min-h-[7.5rem]">
        <p className="mb-3 text-sm text-on-surface-variant">{current.hint}</p>
        {current.render(setActive)}
      </div>
    </>
  )
}

/** Opens a graded quiz for a verified learner; a guest signs in first (and comes back to `returnTo`), an unverified one is told why. */
function useQuizGate(onStart: () => void, returnTo: string): () => void {
  const { user } = useAuth()
  const { openModal } = useModal()
  return () => {
    if (user?.emailVerified) return onStart()
    if (!user) return openModal('login', { returnTo })
    showToast({
      tone: 'info',
      title: 'Verify your email to take quizzes',
      message: 'Quizzes are graded and saved to your account.',
      actions: [{ label: 'Verify my email', to: '/verify-email' }],
    })
  }
}
