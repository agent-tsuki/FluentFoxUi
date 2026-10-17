import { useKanaScript } from '@/context/KanaScriptContext'
import { useLearningPath, useLearningPathStore } from '@/hooks/useLearningPath'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { CertificateNameForm } from './CertificateNameForm'

/**
 * Name + PDF download for the current script's certificate. Renders nothing
 * until the script's final test has been passed at least once. The PDF code is
 * loaded on demand. (The combined certificate is KanaMasterPanel.)
 */
export function CertificatePanel({ className }: { className?: string }) {
  const script = useKanaScript()
  const path = useLearningPathStore()
  const finalTest = useLearningPath().finalTest

  if (!finalTest?.passedAt) return null
  const { passedAt, best } = finalTest

  const download = async (name: string) => {
    const { generateCertificate } = await import('@/lib/pdf')
    await generateCertificate(script, { name, score: best, date: new Date(passedAt) })
  }

  return (
    <section aria-labelledby="certificate-title" className={cn('rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5', className)}>
      <div className="flex items-start gap-3">
        <Icon name="verified" filled className="text-3xl text-primary" />
        <div>
          <h2 id="certificate-title" className="font-headline text-lg font-bold text-on-surface">{script.certificateTitle}</h2>
          <p className="text-sm text-on-surface-variant">
            Passed on {new Date(passedAt).toLocaleDateString(undefined, { dateStyle: 'long' })} · best score {Math.round(best * 100)}%
          </p>
        </div>
      </div>
      <CertificateNameForm
        initialName={finalTest.certificateName ?? ''}
        onSaveName={(name) => path.setCertificateName(name)}
        onDownload={download}
        downloadLabel="Download certificate (PDF)"
      />
    </section>
  )
}
