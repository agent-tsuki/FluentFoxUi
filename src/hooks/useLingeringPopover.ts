import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'

/**
 * A hover preview that is forgiving to use: a mouse opens it on hover and it
 * stays open while the pointer is over the trigger or the popover (both inside
 * the wrapper), then lingers for `lingerMs` after the pointer leaves, so moving
 * across a gap never snaps it shut. A tap or keyboard activation opens it for
 * `lingerMs`; activating again within that time follows the link.
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
      cancelClose()
      setOpen(true)
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

  /**
   * The trigger's click: the first activation without a hover opens the
   * preview instead of following the link.
   */
  const onTriggerClick = (e: MouseEvent) => {
    if (open) return
    e.preventDefault()
    setOpen(true)
    if (!pointerInside.current) scheduleClose()
  }

  return { open, close, wrapperProps, onTriggerClick }
}
