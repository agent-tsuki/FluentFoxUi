import { memo } from 'react'
import type { KanaChar } from '@/types'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { Icon } from '@/components/ui/Icon'
import { JaText } from '@/components/learn/JaText'
import { UnitPrintButton } from '@/components/learn/UnitPrintButton'
import { kanaPreview } from '@/components/learn/unitStatus'

interface DownloadWorksheetRowProps {
  unit: KanaUnit
  /** Path position, 1-based. */
  number: number
  /** The unit's kana in order. */
  kana: KanaChar[]
  /** The unit's Print step is already done. */
  printed: boolean
}

/**
 * DownloadWorksheetRow — one unit's A4 worksheet on the Downloads page: title,
 * kana preview, and UnitPrintButton (downloading marks the Print step done).
 */
export const DownloadWorksheetRow = memo(function DownloadWorksheetRow({
  unit,
  number,
  kana,
  printed,
}: DownloadWorksheetRowProps) {
  const preview = kanaPreview(kana)
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4 dark:border-outline/60 dark:bg-surface-container-low">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container text-sm font-bold tabular-nums text-on-surface-variant dark:bg-surface-container-high"
        >
          {number}
        </span>
        <div className="min-w-0">
          <h4 className="text-base font-bold leading-snug text-on-surface">
            <span className="sr-only">Unit {number}: </span>
            <JaText text={unit.title} />
          </h4>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-on-surface-variant">
            <span>
              <span lang="ja" className="font-jp">
                {preview.text}
                {preview.truncated && '…'}
              </span>
              {` · ${kana.length} kana`}
            </span>
            {printed && (
              <span className="inline-flex items-center gap-0.5 font-semibold text-success">
                <span aria-hidden className="flex">
                  <Icon name="check_circle" filled className="text-sm" />
                </span>
                Downloaded
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="shrink-0 [&_button]:w-full [&_button]:px-4 [&_button]:text-sm sm:[&_button]:w-auto">
        <UnitPrintButton unit={unit} kana={kana} />
      </div>
    </li>
  )
})
