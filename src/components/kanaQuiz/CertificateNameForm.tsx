import { useId, useState, type FormEvent } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { DownloadGlyph } from './DownloadGlyph'

const MAX_NAME = 60
type Status = 'idle' | 'saved' | 'downloading' | 'error'

interface CertificateNameFormProps {
  initialName: string
  /** Persists the trimmed name. */
  onSaveName: (name: string) => void
  /** Builds and downloads the PDF; a rejection shows the error line. */
  onDownload: (name: string) => Promise<void>
  /** e.g. "Download certificate (PDF)". */
  downloadLabel: string
}

/**
 * "Your name, as it should appear" + Download / Save name, shared by the
 * script certificate and the Kana master certificate.
 */
export function CertificateNameForm({ initialName, onSaveName, onDownload, downloadLabel }: CertificateNameFormProps) {
  const [name, setName] = useState(initialName)
  const [status, setStatus] = useState<Status>('idle')
  const [invalid, setInvalid] = useState(false)
  const inputId = useId()
  const errorId = useId()

  const save = (): string | null => {
    const trimmed = name.trim()
    if (!trimmed) {
      setInvalid(true)
      return null
    }
    setInvalid(false)
    setName(trimmed)
    onSaveName(trimmed)
    return trimmed
  }

  const onSave = () => {
    if (save()) setStatus('saved')
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const saved = save()
    if (!saved || status === 'downloading') return
    setStatus('downloading')
    try {
      await onDownload(saved)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3">
      <label htmlFor={inputId} className="text-sm font-semibold text-on-surface">Your name, as it should appear</label>
      <input
        id={inputId}
        value={name}
        onChange={(e) => {
          setName(e.target.value.slice(0, MAX_NAME))
          if (status !== 'downloading') setStatus('idle')
        }}
        maxLength={MAX_NAME}
        required
        autoComplete="name"
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        className={cn(
          'min-h-12 w-full rounded-xl border-2 bg-surface-container-lowest px-4 text-base text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none',
          invalid ? 'border-error' : 'border-outline-variant/60',
        )}
      />
      {invalid && <p id={errorId} className="text-sm font-semibold text-error">Please enter your name.</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={status === 'downloading'} className="flex min-h-12 items-center justify-center gap-2 disabled:opacity-60">
          <DownloadGlyph />
          {status === 'downloading' ? 'Preparing PDF…' : downloadLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onSave} className="min-h-12">Save name</Button>
      </div>
      <p role="status" className="min-h-5 text-sm">
        {status === 'saved' && <span className="text-success">Name saved.</span>}
        {status === 'error' && <span className="text-error">Couldn’t create the PDF. Please try again.</span>}
      </p>
      <p className="text-xs text-on-surface-variant">Saved on this device. Account-verified certificates are coming later.</p>
    </form>
  )
}
