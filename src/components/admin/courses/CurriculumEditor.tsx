import { Icon } from '@/components/ui/Icon'
import { TextInput } from '@/components/ui/FormField'
import { StringListEditor } from '@/components/admin/channel/StringListEditor'
import type { CurriculumSection } from '@/types/admin'

/** Curriculum sections: a title and a list of topics each. */
export function CurriculumEditor({ sections, onChange }: { sections: CurriculumSection[]; onChange: (s: CurriculumSection[]) => void }) {
  const update = (index: number, patch: Partial<CurriculumSection>) =>
    onChange(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)))

  return (
    <fieldset className="space-y-4">
      <legend className="mb-2 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Curriculum</legend>
      {sections.map((section, index) => (
        // Index keys: sections have no id and are only appended/removed.
        <div key={index} className="space-y-3 rounded-xl border border-outline-variant/50 p-4">
          <div className="flex items-center gap-2">
            <TextInput aria-label={`Section ${index + 1} title`} placeholder="Section title" value={section.title} onChange={e => update(index, { title: e.target.value })} />
            <button
              type="button"
              aria-label={`Remove section ${index + 1}`}
              onClick={() => onChange(sections.filter((_, i) => i !== index))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-error"
            >
              <Icon name="delete_forever" className="text-xl" />
            </button>
          </div>
          <StringListEditor label={`Section ${index + 1} topics`} items={section.topics} placeholder="Add a topic" onChange={topics => update(index, { topics })} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...sections, { title: '', topics: [] }])}
        className="-my-2 inline-flex min-h-11 items-center gap-1 py-2 text-sm font-semibold text-primary hover:underline"
      >
        <Icon name="add" className="text-base" /> Add section
      </button>
    </fieldset>
  )
}
