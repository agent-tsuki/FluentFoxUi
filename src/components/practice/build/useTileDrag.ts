import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

const DRAG_THRESHOLD_PX = 6

export interface DragGhost {
  char: string
  x: number
  y: number
  /** Slot index under the pointer, if any. */
  overSlot: number | null
}

interface Pending {
  key: string
  char: string
  startX: number
  startY: number
  dragging: boolean
}

function slotAt(x: number, y: number): number | null {
  const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-slot]')
  if (!el) return null
  const index = Number(el.dataset.slot)
  return Number.isInteger(index) ? index : null
}

/**
 * Optional drag-and-drop from the tile tray onto a slot, for mouse users only.
 * Tapping/clicking stays the primary interaction: a press that never moves
 * past the threshold is left alone and the tile's normal `onClick` runs.
 * After a real drag, `consumeClick()` returns true once so the click the
 * browser fires on release doesn't also place the tile.
 */
export function useTileDrag(enabled: boolean, onDrop: (tileKey: string, slot: number) => void) {
  const [ghost, setGhost] = useState<DragGhost | null>(null)
  const pending = useRef<Pending | null>(null)
  const justDragged = useRef(false)
  const onDropRef = useRef(onDrop)
  onDropRef.current = onDrop
  const cleanup = useRef<(() => void) | null>(null)

  useEffect(() => () => cleanup.current?.(), [])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>, key: string, char: string) => {
      if (!enabled || e.pointerType !== 'mouse' || e.button !== 0) return
      e.preventDefault() // no text selection while dragging
      pending.current = { key, char, startX: e.clientX, startY: e.clientY, dragging: false }

      const move = (ev: PointerEvent) => {
        const p = pending.current
        if (!p) return
        if (!p.dragging && Math.hypot(ev.clientX - p.startX, ev.clientY - p.startY) < DRAG_THRESHOLD_PX) return
        p.dragging = true
        setGhost({ char: p.char, x: ev.clientX, y: ev.clientY, overSlot: slotAt(ev.clientX, ev.clientY) })
      }
      const end = (ev: PointerEvent) => {
        const p = pending.current
        if (p?.dragging) {
          justDragged.current = true
          window.setTimeout(() => (justDragged.current = false), 0)
          const slot = ev.type === 'pointerup' ? slotAt(ev.clientX, ev.clientY) : null
          if (slot !== null) onDropRef.current(p.key, slot)
        }
        detach()
      }
      const detach = () => {
        pending.current = null
        setGhost(null)
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', end)
        window.removeEventListener('pointercancel', end)
        cleanup.current = null
      }
      cleanup.current?.()
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', end)
      window.addEventListener('pointercancel', end)
      cleanup.current = detach
    },
    [enabled],
  )

  const consumeClick = useCallback(() => justDragged.current, [])

  return { ghost, onPointerDown, consumeClick }
}
