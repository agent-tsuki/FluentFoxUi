import { forwardRef } from 'react'
import type { KanaGrade } from '@/types/kanaProgress'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

interface GradeControlsProps {
  revealed: boolean
  disabled: boolean
  onReveal: () => void
  onGrade: (grade: KanaGrade) => void
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="ml-1.5 hidden rounded-md border border-outline-variant px-1.5 font-label text-xs opacity-70 sm:inline">
      {children}
    </kbd>
  )
}

/**
 * Reveal / grade buttons. Both states use the same three rows (hint, main,
 * secondary) so the layout doesn't jump when the card is revealed. The
 * forwarded ref is the wrapper; its first button is the main action.
 */
export const GradeControls = forwardRef<HTMLDivElement, GradeControlsProps>(function GradeControls(
  { revealed, disabled, onReveal, onGrade },
  ref,
) {
  const hint = revealed ? 'Swipe right if you knew it, left if not' : 'Do you remember how it sounds?'

  return (
    <div ref={ref} className="mt-4 flex flex-col gap-2">
      <p className="h-5 text-center text-sm text-on-surface-variant">{hint}</p>

      {revealed ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" disabled={disabled} onClick={() => onGrade('again')} className="flex min-h-14 items-center justify-center gap-2 disabled:opacity-60">
              <Icon name="thumb_down" className="text-xl text-warning" />
              Not yet<Kbd>←</Kbd>
            </Button>
            <Button disabled={disabled} onClick={() => onGrade('good')} className="flex min-h-14 items-center justify-center gap-2 disabled:opacity-60">
              <Icon name="thumb_up" className="text-xl" />
              I knew it<Kbd>→</Kbd>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" disabled={disabled} onClick={() => onGrade('hard')} className="min-h-11 text-sm disabled:opacity-60">
              Hard<Kbd>2</Kbd>
            </Button>
            <Button variant="ghost" disabled={disabled} onClick={() => onGrade('easy')} className="min-h-11 text-sm disabled:opacity-60">
              Easy<Kbd>4</Kbd>
            </Button>
          </div>
        </>
      ) : (
        <>
          <Button onClick={onReveal} className="flex min-h-14 w-full items-center justify-center gap-2">
            <Icon name="visibility" className="text-xl" />
            Show answer<Kbd>Space</Kbd>
          </Button>
          <p className="flex min-h-11 items-center justify-center text-xs text-on-surface-variant">
            <span className="hidden sm:inline">Keys: ← Not yet · → Knew it · 1–4 Again / Hard / Good / Easy</span>
          </p>
        </>
      )}
    </div>
  )
})
