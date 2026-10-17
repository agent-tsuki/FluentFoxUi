import { useCallback, useMemo, useState } from 'react'
import type { KanaChar } from '@/types'
import type { PosterVariant } from '@/lib/pdf'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { DownloadPosterPreview } from '@/components/kanaCourse/DownloadPosterPreview'
import { cn } from '@/lib/cn'
import { useKanaScript } from '@/context/KanaScriptContext'

interface ChartDownloadsProps {
  /** Every kana of the script (spacers are fine); passed straight to the PDF builder. */
  kana: KanaChar[]
  className?: string
}

interface VariantInfo {
  id: PosterVariant
  title: string
  description: string
  size: 'A3' | 'A4'
}

const VARIANTS: VariantInfo[] = [
  {
    id: 'colour-a3',
    title: 'Colour wall poster',
    description: 'Each row on its own colour band, with stroke-order numbers.',
    size: 'A3',
  },
  {
    id: 'print-a4',
    title: 'Printer-friendly chart',
    description: 'Black and white with thin lines, to save ink on a home printer.',
    size: 'A4',
  },
  {
    id: 'colour-in-a3',
    title: 'Colour-in poster',
    description: "Outlined kana: colour in each row once you've learned it.",
    size: 'A3',
  },
]

type Status = 'idle' | 'working' | 'error'

interface PosterCardProps {
  info: VariantInfo
  kana: KanaChar[]
  /** The first basic rows, for the preview thumbnail. */
  previewRows: string[][]
}

function PosterCard({ info, kana, previewRows }: PosterCardProps) {
  const script = useKanaScript()
  const [status, setStatus] = useState<Status>('idle')
  const working = status === 'working'

  const download = useCallback(async () => {
    setStatus('working')
    try {
      const { generateChartPoster } = await import('@/lib/pdf')
      await generateChartPoster(script, info.id, kana)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }, [script, info.id, kana])

  const titleId = `chart-download-${info.id}`

  return (
    <li>
      <article
        aria-labelledby={titleId}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest dark:border-outline/60 dark:bg-surface-container-low"
      >
        <div className="flex h-44 items-center border-b border-outline-variant/60 bg-surface-container-low px-6 dark:border-outline/40 dark:bg-surface-container">
          <DownloadPosterPreview variant={info.id} label={script.label} nativeLabel={script.nativeLabel} rows={previewRows} />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex-1">
            <h3 id={titleId} className="text-base font-bold text-on-surface">
              {info.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold tabular-nums text-on-surface-variant">
              <span aria-hidden className="flex">
                <Icon name="picture_as_pdf" className="text-base" />
              </span>
              {info.size} · PDF
            </p>
            <p className="mt-2 text-sm leading-snug text-on-surface-variant">{info.description}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={download}
            disabled={working}
            aria-busy={working}
            aria-describedby={titleId}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 text-sm disabled:cursor-wait disabled:opacity-70"
          >
            <span aria-hidden className="flex">
              <Icon name={working ? 'progress_activity' : 'download'} className={cn('text-xl text-primary', working && 'motion-safe:animate-spin')} />
            </span>
            {working ? 'Preparing PDF…' : `Download ${info.size} PDF`}
          </Button>
          <p role="status" aria-live="polite" className="flex items-center gap-1 text-sm text-error empty:hidden">
            {status === 'error' && (
              <>
                <span aria-hidden className="flex">
                  <Icon name="error" className="text-base" />
                </span>
                We couldn't make the PDF. Please try again.
              </>
            )}
          </p>
        </div>
      </article>
    </li>
  )
}

/** Rows of the preview thumbnail: the first three basic rows (あ か さ). */
const PREVIEW_ROW_COUNT = 3
const ROW_LENGTH = 5

/** The three printable chart posters of the current script, each built in the browser on click. */
export function ChartDownloads({ kana, className }: ChartDownloadsProps) {
  const previewRows = useMemo(() => {
    const basic = kana.filter((k) => !k.isEmpty && k.type === 'basic').map((k) => k.character)
    return Array.from({ length: PREVIEW_ROW_COUNT }, (_, r) => basic.slice(r * ROW_LENGTH, r * ROW_LENGTH + ROW_LENGTH))
  }, [kana])
  return (
    <ul className={cn('grid gap-4 md:grid-cols-3', className)}>
      {VARIANTS.map((v) => (
        <PosterCard key={v.id} info={v} kana={kana} previewRows={previewRows} />
      ))}
    </ul>
  )
}
