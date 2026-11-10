import { useCardInfo } from '@/hooks/useCardInfo'
import { Icon } from '@/components/ui/Icon'
import type { SrsItemType } from '@/types/learn'

interface LeechHintProps {
  itemType: SrsItemType
  char: string
}

/**
 * Shown after a miss on a leech (a card missed many times): its memory hook
 * and the look-alikes it is confused with, side by side. Shows nothing if the
 * content has neither.
 */
export function LeechHint({ itemType, char }: LeechHintProps) {
  const { data: info } = useCardInfo(itemType, char)
  if (!info || (!info.mnemonic && info.lookAlikes.length === 0)) return null
  return (
    <aside aria-label="Memory hint" className="mb-3 rounded-xl border border-tertiary/30 bg-tertiary/5 p-4 text-sm">
      <p className="flex items-center gap-1.5 font-bold text-ink">
        <Icon name="lightbulb" className="text-lg text-tertiary" />
        This one keeps slipping. Try this:
      </p>
      {info.mnemonic && <p className="mt-1.5 text-ink-muted">{info.mnemonic}</p>}
      {info.lookAlikes.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Looks like">
          <li className="flex min-w-16 flex-col items-center rounded-md border-2 border-primary/50 bg-surface-raised px-3 py-2">
            <span lang="ja" className="font-ja text-3xl font-bold text-ink">{char}</span>
            <span className="text-xs text-ink-muted">{info.title}</span>
          </li>
          {info.lookAlikes.map((l) => (
            <li key={l.char} className="flex min-w-16 flex-col items-center rounded-md border border-line bg-surface-raised px-3 py-2">
              <span lang="ja" className="font-ja text-3xl font-bold text-ink-muted">{l.char}</span>
              {l.label && <span className="text-xs text-ink-muted">{l.label}</span>}
              {l.note && <span className="mt-1 max-w-40 text-center text-xs text-ink-muted">{l.note}</span>}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
