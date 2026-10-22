import { useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { TextArea, TextInput } from '@/components/ui/FormField'

/** "Change" → inline input → Save / Cancel. Used for the channel name, description and intro video. */
interface InlineTextEditorProps {
  label: string
  initial: string
  multiline?: boolean
  placeholder?: string
  busy: boolean
  /** Resolves true when saved, so the editor can close. */
  onSave: (value: string) => Promise<boolean>
}

export function InlineTextEditor({ label, initial, multiline, placeholder, busy, onSave }: InlineTextEditorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(initial)
  const id = useId()

  if (!open) {
    return (
      <Button type="button" variant="outline" className="flex min-h-11 items-center gap-2 px-4 py-2 text-sm" onClick={() => { setValue(initial); setOpen(true) }}>
        <Icon name="edit" className="text-base" />
        Change
      </Button>
    )
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (await onSave(value.trim())) setOpen(false)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor={id} className="sr-only">{label}</label>
      {multiline ? (
        <TextArea id={id} rows={5} value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} disabled={busy} />
      ) : (
        <TextInput id={id} value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} disabled={busy} />
      )}
      <div className="flex gap-2">
        <Button type="submit" className="min-h-11 px-5 py-2 text-sm" disabled={busy || !value.trim()}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" className="min-h-11 px-4 py-2 text-sm" onClick={() => setOpen(false)} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

/** Upload / Change for an image field; the file is shrunk in the service before upload. */
interface ImageUploadButtonProps {
  label: string
  hasCustom: boolean
  busy: boolean
  onFile: (file: File) => void
}

export function ImageUploadButton({ label, hasCustom, busy, onFile }: ImageUploadButtonProps) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
      <Button type="button" variant="outline" className="flex min-h-11 items-center gap-2 px-4 py-2 text-sm" disabled={busy} onClick={() => input.current?.click()}>
        <Icon name={busy ? 'progress_activity' : 'photo_camera'} className={busy ? 'animate-spin text-base' : 'text-base'} />
        {busy ? 'Uploading…' : `${hasCustom ? 'Change' : 'Upload'} ${label.toLowerCase()}`}
      </Button>
    </>
  )
}
