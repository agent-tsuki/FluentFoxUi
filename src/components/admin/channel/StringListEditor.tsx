import { useId, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { TextInput } from '@/components/ui/FormField'

/**
 * Editable list of short strings (best for, not for, pros, cons, tags):
 * edit in place, remove, and add new items with Enter or the Add button.
 */
interface StringListEditorProps {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function StringListEditor({ label, items, onChange, placeholder = 'Add an item', disabled }: StringListEditorProps) {
  const [draft, setDraft] = useState('')
  const id = useId()

  const add = () => {
    const value = draft.trim()
    if (!value) return
    onChange([...items, value])
    setDraft('')
  }

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="mb-2 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">{label}</legend>
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, index) => (
            // Index keys: items are plain strings and duplicates are allowed while typing.
            <li key={index} className="flex items-center gap-2">
              <TextInput
                aria-label={`${label} item ${index + 1}`}
                value={item}
                onChange={e => onChange(items.map((v, i) => (i === index ? e.target.value : v)))}
              />
              <button
                type="button"
                aria-label={`Remove ${label.toLowerCase()} item ${index + 1}`}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-error"
              >
                <Icon name="delete_forever" className="text-xl" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="sr-only">{`New ${label.toLowerCase()} item`}</label>
        <TextInput
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
        />
        <button
          type="button"
          onClick={add}
          aria-label={`Add ${label.toLowerCase()} item`}
          disabled={!draft.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/15 disabled:opacity-50"
        >
          <Icon name="add" className="text-xl" />
        </button>
      </div>
    </fieldset>
  )
}
