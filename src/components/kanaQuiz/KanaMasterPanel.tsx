import { Link } from 'react-router-dom'
import type { FinalTestResult } from '@/api/services/learningPathService'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useKanaFinalTests } from '@/hooks/useLearningPath'
import { HIRAGANA_UNITS } from '@/lib/content/kana/hiraganaUnits'
import { KATAKANA_UNITS } from '@/lib/content/kana/katakanaUnits'
import { isRegisteredKanaScript, kanaBasePath } from '@/lib/content/kana/scripts'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { CertificateNameForm } from './CertificateNameForm'

type MasterScript = 'hiragana' | 'katakana'

const SCRIPTS: readonly { id: MasterScript; label: string; nativeLabel: string; kanaCount: number }[] = [
  { id: 'hiragana', label: 'Hiragana', nativeLabel: 'ひらがな', kanaCount: HIRAGANA_UNITS.reduce((n, u) => n + u.kanaIds.length, 0) },
  { id: 'katakana', label: 'Katakana', nativeLabel: 'カタカナ', kanaCount: KATAKANA_UNITS.reduce((n, u) => n + u.kanaIds.length, 0) },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'long' })
}

/**
 * Kana master: the combined certificate for passing both the hiragana and the
 * katakana final tests. Shown on each course's Tests page: a small progress
 * teaser until both are passed, then name + PDF download.
 */
export function KanaMasterPanel({ className }: { className?: string }) {
  const current = useKanaScript()
  const results = useKanaFinalTests()
  const passed = (id: MasterScript): FinalTestResult | undefined =>
    results[id]?.passedAt ? results[id] : undefined
  const hira = passed('hiragana')
  const kata = passed('katakana')

  if (!hira?.passedAt || !kata?.passedAt) {
    const missing = SCRIPTS.filter((s) => !passed(s.id))
    const other = missing.find((s) => s.id !== current.id)
    return (
      <section
        aria-labelledby="kana-master-title"
        className={cn('rounded-2xl border border-dashed border-outline-variant/60 p-4 dark:border-outline/50', className)}
      >
        <div className="flex items-start gap-3">
          <span aria-hidden className="flex">
            <Icon name="workspace_premium" className="text-2xl text-on-surface-variant" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 id="kana-master-title" className="font-headline text-base font-bold text-on-surface">Kana master</h3>
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="Final tests">
              {SCRIPTS.map((s) => {
                const ok = Boolean(passed(s.id))
                return (
                  <li
                    key={s.id}
                    className={cn(
                      'inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold',
                      ok ? 'bg-success/15 text-on-surface' : 'bg-surface-container text-on-surface-variant',
                    )}
                  >
                    <Icon name={ok ? 'check_circle' : 'radio_button_unchecked'} filled={ok} className={cn('text-base', ok && 'text-success')} />
                    {s.label}
                    <span className="sr-only">{ok ? ': final test passed' : ': not passed yet'}</span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-2 text-sm text-on-surface-variant">
              Pass both final tests to earn the Kana master certificate.
              {other && isRegisteredKanaScript(other.id) && (
                <>
                  {' '}
                  <Link
                    to={`${kanaBasePath(other.id)}/tests#certificate`}
                    className="-my-2 inline-flex min-h-11 items-center py-2 font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Go to the {other.label.toLowerCase()} final test
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    )
  }

  const hiraPassed = hira.passedAt
  const kataPassed = kata.passedAt
  const download = async (name: string) => {
    const { generateKanaMasterCertificate } = await import('@/lib/pdf')
    const [h, k] = SCRIPTS
    if (!h || !k) return
    await generateKanaMasterCertificate({
      name,
      hiragana: { label: h.label, kanaCount: h.kanaCount, score: hira.best, passedAt: new Date(hiraPassed) },
      katakana: { label: k.label, kanaCount: k.kanaCount, score: kata.best, passedAt: new Date(kataPassed) },
    })
  }

  return (
    <section
      aria-labelledby="kana-master-title"
      className={cn('rounded-2xl border border-primary/40 bg-primary/5 p-5 dark:bg-primary/10', className)}
    >
      <div className="flex items-start gap-3">
        <Icon name="workspace_premium" filled className="text-3xl text-primary" />
        <div className="min-w-0">
          <h3 id="kana-master-title" className="font-headline text-lg font-bold text-on-surface">Kana master</h3>
          <p className="text-sm text-on-surface-variant">You passed both — download your Kana master certificate.</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SCRIPTS.map((s) => {
          const [r, on] = s.id === 'hiragana' ? [hira, hiraPassed] : [kata, kataPassed]
          return (
            <div key={s.id} className="rounded-xl bg-surface-container-lowest px-4 py-3 dark:bg-surface-container-low">
              <dt className="flex items-baseline gap-2 text-sm font-semibold text-on-surface">
                <span lang="ja" className="font-jp text-on-surface-variant">{s.nativeLabel}</span>
                {s.label}
              </dt>
              <dd className="mt-0.5 text-sm text-on-surface-variant">
                <span className="font-bold tabular-nums text-on-surface">{Math.round(r.best * 100)}%</span> · passed{' '}
                {formatDate(on)}
              </dd>
            </div>
          )
        })}
      </dl>
      <CertificateNameForm
        initialName={results[current.id]?.certificateName ?? hira.certificateName ?? kata.certificateName ?? ''}
        onSaveName={results.saveName}
        onDownload={download}
        downloadLabel="Download Kana master (PDF)"
      />
    </section>
  )
}
