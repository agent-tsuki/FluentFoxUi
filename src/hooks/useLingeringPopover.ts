import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'

/**
 * A click-to-open preview: a click, tap or keyboard activation opens it (hover
 * alone never does). It stays open while the pointer is over the trigger or
 * the popover (both inside the wrapper) and closes `lingerMs` after the
 * pointer leaves; opened without the pointer over it (a tap, the keyboard) it
 * closes after `lingerMs`. Activating again while open follows the link.
 */
export function useLingeringPopover(lingerMs: number) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pointerInside = useRef(false)

  const cancelClose = useCallback(() => clearTimeout(timer.current), [])
  const scheduleClose = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(false), lingerMs)
  }, [lingerMs])
  const close = useCallback(() => {
    clearTimeout(timer.current)
    setOpen(false)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  /** Spread on the element that wraps both the trigger and the popover. */
  const wrapperProps = {
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointerInside.current = true
      // Coming back over an open preview keeps it; hover never opens it.
      cancelClose()
    },
    onPointerLeave: (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointerInside.current = false
      scheduleClose()
    },
    onFocus: cancelClose,
    onBlur: () => {
      if (!pointerInside.current) scheduleClose()
    },
  }

  /** The trigger's click: the first one opens the preview instead of following the link. */
  const onTriggerClick = (e: MouseEvent) => {
    if (open) return
    e.preventDefault()
    setOpen(true)
    if (!pointerInside.current) scheduleClose()
  }

  return { open, close, wrapperProps, onTriggerClick }
}
