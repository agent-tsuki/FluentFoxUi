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
      className="mx-auto w-full max-w-44 rounded-md border border-outline-variant/60 bg-surface-container-lowest p-2 shadow-elevation-1 dark:border-outline/60"
    >
      <div
        className={cn(
          'mb-1.5 flex items-center justify-between rounded-sm px-1.5 py-1',
          colour && 'bg-primary text-on-primary',
          outline && 'border border-primary/70 text-on-surface',
          print && 'border-b border-on-surface/40 text-on-surface',
        )}
      >
        <span className="font-headline text-2xs font-bold">{label}</span>
        <span lang="ja" className="font-jp text-2xs font-bold">
          {nativeLabel}
        </span>
      </div>
      <div className="space-y-1">
        {rows.map((row, r) => (
          <div
            key={row[0]}
            className={cn(
              'grid grid-cols-5 gap-1 rounded-sm p-0.5',
              outline && 'border border-on-surface-variant/40',
              colour && ROW_TINTS[r],
            )}
          >
            {row.map((ch) => (
              <span
                key={ch}
                lang="ja"
                className={cn(
                  'flex aspect-square items-center justify-center rounded-sm bg-surface-container-lowest font-jp text-sm font-bold leading-none text-on-surface',
                  outline &&
                    'border border-on-surface-variant/40 text-transparent [-webkit-text-stroke-color:rgb(var(--on-surface))] [-webkit-text-stroke-width:0.6px]',
                  print && 'border border-on-surface/30',
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
