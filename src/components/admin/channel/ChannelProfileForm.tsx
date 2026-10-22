import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { FormField, TextArea, TextInput } from '@/components/ui/FormField'
import { StringListEditor } from './StringListEditor'
import type { AdminChannel, ChannelTextUpdate } from '@/types/admin'

type ProfileValues = Required<Omit<ChannelTextUpdate, 'name' | 'description'>>

function valuesFrom(c: AdminChannel): ProfileValues {
  return {
    teachingStyle: c.teachingStyle,
    bestFor:       c.bestFor,
    notFor:        c.notFor,
    pros:          c.pros,
    cons:          c.cons,
    verdict:       c.verdict,
    accentColor:   c.accentColor ?? '',
  }
}

const clean = (items: string[]) => items.map(s => s.trim()).filter(Boolean)

/** Only changed fields are sent, so a save never overwrites what it didn't touch. */
function changes(before: ProfileValues, after: ProfileValues): ChannelTextUpdate {
  const patch: ChannelTextUpdate = {}
  for (const key of Object.keys(after) as (keyof ProfileValues)[]) {
    const next = after[key]
    const value = Array.isArray(next) ? clean(next) : next.trim()
    if (JSON.stringify(value) !== JSON.stringify(before[key])) Object.assign(patch, { [key]: value })
  }
  return patch
}

const HEX = /^#[0-9a-f]{6}$/i

/** Teaching style, best for / not for, pros, cons, verdict and accent colour. */
interface ChannelProfileFormProps {
  channel: AdminChannel
  canEdit: boolean
  saving: boolean
  onSave: (patch: ChannelTextUpdate) => Promise<boolean>
}

export function ChannelProfileForm({ channel, canEdit, saving, onSave }: ChannelProfileFormProps) {
  const [form, setForm] = useState<ProfileValues>(() => valuesFrom(channel))
  const patch = changes(valuesFrom(channel), form)
  const dirty = Object.keys(patch).length > 0
  const colorValid = form.accentColor === '' || HEX.test(form.accentColor)

  const set = <K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) => setForm(prev => ({ ...prev, [key]: value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!dirty || !colorValid) return
    await onSave(patch)
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <fieldset disabled={!canEdit || saving} className="space-y-6">
        <FormField label="Teaching style" htmlFor="ch-teaching-style">
          <TextArea id="ch-teaching-style" rows={3} value={form.teachingStyle} onChange={e => set('teachingStyle', e.target.value)} />
        </FormField>
        <div className="grid gap-6 md:grid-cols-2">
          <StringListEditor label="Best for" items={form.bestFor} onChange={v => set('bestFor', v)} />
          <StringListEditor label="Not for" items={form.notFor} onChange={v => set('notFor', v)} />
          <StringListEditor label="Pros" items={form.pros} onChange={v => set('pros', v)} />
          <StringListEditor label="Cons" items={form.cons} onChange={v => set('cons', v)} />
        </div>
        <FormField label="Verdict" htmlFor="ch-verdict">
          <TextArea id="ch-verdict" rows={3} value={form.verdict} onChange={e => set('verdict', e.target.value)} />
        </FormField>
        <FormField label="Accent colour" htmlFor="ch-accent" hint={colorValid ? 'Hex colour such as #E53935. Used on the channel card.' : 'Use a 6-digit hex colour, e.g. #E53935.'}>
          <div className="flex items-center gap-3">
            <input
              type="color"
              aria-label="Pick accent colour"
              value={HEX.test(form.accentColor) ? form.accentColor : '#000000'}
              onChange={e => set('accentColor', e.target.value)}
              className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-outline-variant bg-surface-container-lowest p-1"
            />
            <TextInput id="ch-accent" value={form.accentColor} placeholder="#E53935" aria-invalid={!colorValid} onChange={e => set('accentColor', e.target.value)} className="max-w-[10rem]" />
          </div>
        </FormField>
      </fieldset>
      {canEdit && (
        <div className="flex gap-2">
          <Button type="submit" className="min-h-11 px-5 py-2 text-sm" disabled={!dirty || !colorValid || saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
          <Button type="button" variant="ghost" className="min-h-11 px-4 py-2 text-sm" disabled={!dirty || saving} onClick={() => setForm(valuesFrom(channel))}>
            Discard changes
          </Button>
        </div>
      )}
    </form>
  )
}
