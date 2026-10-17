import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface SheetDialogOptions {
  open: boolean
  panelRef: RefObject<HTMLElement>
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

/**
 * Modal behaviour for the kana sheet (mirrors grammar/ChapterSheet): body scroll
 * lock, Escape to close, ←/→ to walk the chart, focus moved in on open and
 * restored on close, and a Tab trap. Handlers are read through a ref so a parent
 * re-render (new callbacks) never re-runs the open/close effect.
 */
export function useSheetDialog({ open, panelRef, onClose, onPrev, onNext }: SheetDialogOptions) {
  const handlers = useRef({ onClose, onPrev, onNext })
  handlers.current = { onClose, onPrev, onNext }

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handlers.current.onClose()
      else if (e.key === 'ArrowLeft') handlers.current.onPrev?.()
      else if (e.key === 'ArrowRight') handlers.current.onNext?.()
    }
    document.addEventListener('keydown', onKey)

    // Wait a frame so the portal content is mounted before focusing.
    const raf = requestAnimationFrame(() => panelRef.current?.focus())

    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus()
    }
  }, [open, panelRef])

  // Keep Tab / Shift+Tab inside the panel.
  return (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el !== panelRef.current)
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}
