import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SkeletonBlock } from '@/components/ui/LoadingState'
import { useCardInfo } from '@/hooks/useCardInfo'
import type { LessonItem } from '@/types/learn'

interface LessonCardsProps {
  items: LessonItem[]
  /** Called after the last card: start the check quiz. */
  onDone: () => void
  /** Reports the card index, for the shell's progress bar. */
  onProgress?: (index: number) => void
}

/** The lesson's new items, one card at a time, before the check quiz. */
export function LessonCards({ items, onDone, onProgress }: LessonCardsProps) {
  const [index, setIndex] = useState(0)
  const item = items[index]
  if (!item) return null
  const isLast = index + 1 >= items.length
  const go = (to: number) => {
    setIndex(to)
    onProgress?.(to)
  }
  return (
    <div className="flex flex-1 flex-col">
      <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-primary">
        New {index + 1} of {items.length}
      </p>
      <LessonCard key={`${item.item_type}-${item.char}`} item={item} />
      <div className="mt-4 flex gap-2">
        {index > 0 && (
          <Button variant="outline" onClick={() => go(index - 1)} className="flex min-h-14 items-center justify-center" aria-label="Previous card">
            <Icon name="arrow_back" className="text-xl" />
          </Button>
        )}
        <Button onClick={isLast ? onDone : () => go(index + 1)} className="flex min-h-14 flex-1 items-center justify-center gap-2">
          {isLast ? 'Check what you learned' : 'Next'}
          <Icon name="arrow_forward" className="text-xl" />
        </Button>
      </div>
    </div>
  )
}

function LessonCard({ item }: { item: LessonItem }) {
  const { data: info, isLoading } = useCardInfo(item.item_type, item.char)
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
      <p lang="ja" className="font-jp text-8xl font-bold leading-none text-on-surface sm:text-9xl">
        {item.char}
      </p>
      {isLoading ? (
        <SkeletonBlock className="h-8 w-32 rounded-lg" />
      ) : info ? (
        <>
          <p className="font-headline text-3xl font-extrabold text-primary">{info.title}</p>
          {info.details.map((d) => (
            <p key={d} className="text-on-surface-variant">
              {d}
            </p>
          ))}
          {info.mnemonic && (
            <p className="mt-2 max-w-md rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
              <Icon name="lightbulb" className="mr-1 align-middle text-base text-tertiary" />
              {info.mnemonic}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-on-surface-variant">Details for this one are not available right now.</p>
      )}
    </div>
  )
}
