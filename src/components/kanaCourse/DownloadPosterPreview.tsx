import { memo } from 'react'
import type { PosterVariant } from '@/lib/pdf'
import { cn } from '@/lib/cn'

/** Row bands in the colour preview, echoing the poster's coloured rows. */
const ROW_TINTS = ['bg-primary/20', 'bg-primary/10', 'bg-success/15']

/**
 * DownloadPosterPreview — a small, decorative CSS mock of one chart poster
 * (colour bands, printer lines, or outlined colour-in kana). A3 previews are
 * portrait, the A4 one slightly squatter, as on paper.
 */
interface DownloadPosterPreviewProps {
  variant: PosterVariant
  /** "Hiragana" */
  label: string
  /** "ひらがな" */
  nativeLabel: string
  /** A few chart rows to show, e.g. あ か さ. */
  rows: readonly (readonly string[])[]
}

export const DownloadPosterPreview = memo(function DownloadPosterPreview({ variant, label, nativeLabel, rows }: DownloadPosterPreviewProps) {
  const colour = variant === 'colour-a3'
  const outline = variant === 'colour-in-a3'
  const print = variant === 'print-a4'
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-44 rounded-md bg-surface-raised shadow-elevation-1 p-2 shadow-elevation-1"
    >
      <div
        className={cn(
          'mb-1.5 flex items-center justify-between rounded-sm px-1.5 py-1',
          colour && 'bg-primary text-on-primary',
          outline && 'border border-primary/70 text-ink',
          print && 'border-b border-ink/40 text-ink',
        )}
      >
        <span className="font-display text-2xs font-bold">{label}</span>
        <span lang="ja" className="font-ja-display text-2xs font-bold">
          {nativeLabel}
        </span>
      </div>
      <div className="space-y-1">
        {rows.map((row, r) => (
          <div
            key={row[0]}
            className={cn(
              'grid grid-cols-5 gap-1 rounded-sm p-0.5',
              outline && 'border border-ink-muted/40',
              colour && ROW_TINTS[r],
            )}
          >
            {row.map((ch) => (
              <span
                key={ch}
                lang="ja"
                className={cn(
                  'flex aspect-square items-center justify-center rounded-sm bg-surface-raised font-ja-display text-sm font-bold leading-none text-ink',
                  outline &&
                    'border border-ink-muted/40 text-transparent [-webkit-text-stroke-color:rgb(var(--ink))] [-webkit-text-stroke-width:0.6px]',
                  print && 'border border-ink/30',
                )}
              >
                {ch}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
})
