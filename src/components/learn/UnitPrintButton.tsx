import { useCallback, useState } from 'react'
import type { KanaChar } from '@/types'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useLearningPathStore } from '@/hooks/useLearningPath'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

interface UnitPrintButtonProps {
  unit: KanaUnit
  kana: KanaChar[]
}

type Status = 'idle' | 'working' | 'error'

/** Builds the unit's A4 worksheet in the browser. jsPDF only loads on click. */
export function UnitPrintButton({ unit, kana }: UnitPrintButtonProps) {
  const script = useKanaScript()
  const path = useLearningPathStore()
  const [status, setStatus] = useState<Status>('idle')

  const download = useCallback(async () => {
    setStatus('working')
    try {
      const { generateUnitWorksheet } = await import('@/lib/pdf')
      await generateUnitWorksheet(script, unit, kana)
      path.markPrinted(unit.id)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }, [script, path, unit, kana])

  const working = status === 'working'

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={download}
        disabled={working}
        aria-busy={working}
        className="inline-flex min-h-11 items-center gap-2 disabled:cursor-wait disabled:opacity-70"
      >
        <Icon name="download" className="text-xl text-primary" />
        {working ? 'Preparing PDF…' : 'Download worksheet (PDF)'}
      </Button>
      <p role="status" aria-live="polite" className="text-sm text-error empty:hidden">
        {status === 'error' ? "We couldn't make the worksheet. Please try again." : ''}
      </p>
    </div>
  )
}
