import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useToastStore, type Toast } from '@/store/toastStore'
import { CloseButton } from '@/components/ui/CloseButton'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/** How long a toast stays before closing itself; hovering or focusing the stack pauses this. */
const TOAST_MS = 7000
/** Collapsed stack: how far each older toast peeks out above the one in front. */
const PEEK_PX = 12
/** Collapsed stack: each older toast is this much smaller than the one in front. */
const SCALE_STEP = 0.05
/** Expanded stack: space between toasts. */
const GAP_PX = 12

/** Spread to make an element inert (lowercase attribute; React 18 passes it through). */
const INERT = { inert: '' } as Record<string, string>

const TONE: Record<Toast['tone'], { icon: string; iconClass: string }> = {
  info: { icon: 'info', iconClass: 'text-info' },
  error: { icon: 'error', iconClass: 'text-error' },
}

interface ToastCardProps {
  toast: Toast
  /** Paused while the stack is hovered or focused. */
  paused: boolean
  /** Hidden content (an older toast tucked behind the front one). */
  tucked: boolean
  style: CSSProperties
  onHeight: (id: number, height: number) => void
}

const ToastCard = memo(function ToastCard({ toast, paused, tucked, style, onHeight }: ToastCardProps) {
  const dismiss = useToastStore((s) => s.dismiss)
  useEffect(() => {
    if (paused) return
    const timer = setTimeout(() => dismiss(toast.id), TOAST_MS)
    return () => clearTimeout(timer)
  }, [paused, dismiss, toast.id])

  // Natural height (content size), for stacking. Measured on the inner box so the
  // collapsed height the stack gives this card never feeds back into it.
  const inner = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = inner.current
    if (!el) return
    const report = () => onHeight(toast.id, el.offsetHeight)
    report()
    const observer = new ResizeObserver(report)
    observer.observe(el)
    return () => observer.disconnect()
  }, [toast.id, onHeight])

  const tone = TONE[toast.tone]
  return (
    <li
      role={toast.tone === 'error' ? 'alert' : 'status'}
      aria-hidden={tucked || undefined}
      style={style}
      className="pointer-events-auto absolute inset-x-0 bottom-0 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-elevation-3 transition-[transform,height,opacity] duration-300 ease-out motion-reduce:transition-none"
    >
      <div
        ref={inner}
        className={cn('flex gap-3 py-3.5 pl-4 pr-3 transition-opacity duration-200', tucked && 'opacity-0')}
        // Tucked toasts can't be reached by Tab until the stack opens (React 18 has no typed `inert`).
        {...(tucked ? INERT : {})}
      >
        <Icon name={tone.icon} className={cn('mt-px text-lg', tone.iconClass)} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-bold text-on-surface">{toast.title}</p>
          {toast.message && <p className="text-xs leading-relaxed text-on-surface-variant">{toast.message}</p>}
          {toast.actions && toast.actions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {toast.actions.map((a, i) => (
                <Link
                  key={a.to}
                  to={a.to}
                  onClick={() => dismiss(toast.id)}
                  className={cn(
                    'inline-flex h-8 items-center rounded-full px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    i === 0 ? 'bg-primary text-on-primary hover:bg-primary/90' : 'border border-outline-variant text-on-surface hover:bg-surface-container',
                  )}
                >
                  {a.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        <CloseButton variant="danger" size="sm" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="-mr-1 -mt-1.5" />
      </div>
    </li>
  )
})

/**
 * Toaster — the toast store at the bottom right (full width on phones). With
 * more than one, only the newest is open; older ones tuck behind it as a
 * compact stack peeking out above. Hovering or focusing the stack fans them
 * all out (and pauses their timers) so each can be read or dismissed.
 * Mount once in the app shell.
 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const [heights, setHeights] = useState<Record<number, number>>({})
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const expanded = hovered || focused

  const onHeight = useCallback((id: number, height: number) => {
    setHeights((h) => (h[id] === height ? h : { ...h, [id]: height }))
  }, [])

  // Forget heights of dismissed toasts; collapse once the stack is empty.
  useEffect(() => {
    setHeights((h) => Object.fromEntries(toasts.filter((t) => h[t.id] !== undefined).map((t) => [t.id, h[t.id]])))
    if (toasts.length === 0) {
      setHovered(false)
      setFocused(false)
    }
  }, [toasts])

  if (toasts.length === 0) return null

  // Newest first: index 0 is the front toast.
  const ordered = [...toasts].reverse()
  const frontHeight = heights[ordered[0].id] ?? 0
  const offsets: number[] = []
  ordered.reduce((sum, t, i) => {
    offsets[i] = sum
    return sum + (heights[t.id] ?? 0) + GAP_PX
  }, 0)
  const stackHeight = expanded
    ? offsets[ordered.length - 1] + (heights[ordered[ordered.length - 1].id] ?? 0)
    : frontHeight + (ordered.length - 1) * PEEK_PX

  return (
    <ol
      aria-label={`Notifications (${toasts.length})`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
      style={{ height: stackHeight }}
      className="fixed inset-x-4 bottom-4 z-[60] transition-[height] duration-300 ease-out motion-reduce:transition-none sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[22rem]"
    >
      {ordered.map((t, i) => {
        const tucked = !expanded && i > 0
        const style: CSSProperties = {
          zIndex: ordered.length - i,
          transform: expanded ? `translateY(-${offsets[i]}px)` : `translateY(-${i * PEEK_PX}px) scale(${1 - i * SCALE_STEP})`,
          // Tucked toasts take the front toast's height, so only their top edge peeks out.
          height: tucked && frontHeight ? frontHeight : heights[t.id] || undefined,
          transformOrigin: 'bottom center',
        }
        return <ToastCard key={t.id} toast={t} paused={expanded} tucked={tucked} style={style} onHeight={onHeight} />
      })}
    </ol>
  )
}
