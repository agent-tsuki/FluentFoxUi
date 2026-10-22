import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { FormField, SelectInput, TextArea, TextInput } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { ChannelSelect } from '@/components/admin/ChannelSelect'
import { StringListEditor } from '@/components/admin/channel/StringListEditor'
import { CurriculumEditor } from './CurriculumEditor'
import type { AdminChannel, AdminCourse, CourseInput, CourseLevel, CoursePlatform } from '@/types/admin'

export function courseInputFrom(course: AdminCourse | null, channelId = ''): CourseInput {
  return {
    channelId:    course?.channelId ?? channelId,
    slug:         course?.slug ?? '',
    title:        course?.title ?? '',
    summary:      course?.summary ?? '',
    level:        course?.level ?? 'N5',
    platform:     course?.platform ?? 'youtube',
    url:          course?.url ?? '',
    playlistId:   course?.playlistId ?? '',
    thumbnailUrl: course?.thumbnailUrl ?? '',
    isFree:       course?.isFree ?? true,
    priceNote:    course?.priceNote ?? '',
    tags:         course?.tags ?? [],
    whatYouLearn: course?.whatYouLearn ?? [],
    curriculum:   course?.curriculum ?? [],
    sortOrder:    course?.sortOrder ?? 0,
  }
}

const LEVELS: CourseLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Create / edit form for a course (fields per the admin classes API). */
interface CourseFormProps {
  initial: CourseInput
  channels: AdminChannel[]
  isNew: boolean
  saving: boolean
  onSubmit: (input: CourseInput) => void
}

export function CourseForm({ initial, channels, isNew, saving, onSubmit }: CourseFormProps) {
  const [form, setForm] = useState<CourseInput>(initial)
  const set = <K extends keyof CourseInput>(key: K, value: CourseInput[K]) => setForm(prev => ({ ...prev, [key]: value }))
  const slugOk = SLUG.test(form.slug)
  const valid = Boolean(form.channelId && form.title.trim() && form.url.trim() && slugOk)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (valid) onSubmit({ ...form, tags: form.tags.filter(Boolean), whatYouLearn: form.whatYouLearn.filter(Boolean) })
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <fieldset disabled={saving} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Channel" htmlFor="c-channel">
            <ChannelSelect id="c-channel" channels={channels} value={form.channelId} onChange={v => set('channelId', v)} disabled={!isNew} />
          </FormField>
          <FormField label="Title" htmlFor="c-title">
            <TextInput id="c-title" required value={form.title} onChange={e => set('title', e.target.value)} />
          </FormField>
          <FormField label="Slug" htmlFor="c-slug" hint={slugOk || !form.slug ? 'Used in the URL: lowercase letters, numbers and dashes.' : 'Only lowercase letters, numbers and single dashes.'}>
            <TextInput id="c-slug" required value={form.slug} aria-invalid={!slugOk && !!form.slug} onChange={e => set('slug', e.target.value.toLowerCase())} />
          </FormField>
          <FormField label="Sort order" htmlFor="c-sort" hint="Lower numbers show first (featured courses always lead).">
            <TextInput id="c-sort" type="number" inputMode="numeric" value={form.sortOrder} onChange={e => set('sortOrder', Number(e.target.value) || 0)} />
          </FormField>
          <FormField label="Level" htmlFor="c-level">
            <SelectInput id="c-level" value={form.level} onChange={e => set('level', e.target.value as CourseLevel)}>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </SelectInput>
          </FormField>
          <FormField label="Platform" htmlFor="c-platform">
            <SelectInput id="c-platform" value={form.platform} onChange={e => set('platform', e.target.value as CoursePlatform)}>
              <option value="youtube">YouTube</option>
              <option value="udemy">Udemy</option>
              <option value="website">Website</option>
            </SelectInput>
          </FormField>
          <FormField label="Course URL" htmlFor="c-url">
            <TextInput id="c-url" type="url" required value={form.url} onChange={e => set('url', e.target.value)} />
          </FormField>
          {form.platform === 'youtube' && (
            <FormField label="Playlist ID" htmlFor="c-playlist" hint="Needed for Sync playlist.">
              <TextInput id="c-playlist" value={form.playlistId} onChange={e => set('playlistId', e.target.value)} />
            </FormField>
          )}
          <FormField label="Thumbnail URL" htmlFor="c-thumb" hint="Leave empty to use the playlist's thumbnail.">
            <TextInput id="c-thumb" type="url" value={form.thumbnailUrl} onChange={e => set('thumbnailUrl', e.target.value)} />
          </FormField>
          <FormField label="Price note" htmlFor="c-price" hint="e.g. “Free on YouTube” or “$19.99, often on sale”.">
            <TextInput id="c-price" value={form.priceNote} onChange={e => set('priceNote', e.target.value)} />
          </FormField>
        </div>
        <Switch label="Free course" checked={form.isFree} onChange={v => set('isFree', v)} />
        <FormField label="Summary" htmlFor="c-summary">
          <TextArea id="c-summary" rows={4} value={form.summary} onChange={e => set('summary', e.target.value)} />
        </FormField>
        <div className="grid gap-6 md:grid-cols-2">
          <StringListEditor label="What you'll learn" items={form.whatYouLearn} onChange={v => set('whatYouLearn', v)} />
          <StringListEditor label="Tags" items={form.tags} placeholder="e.g. Grammar" onChange={v => set('tags', v)} />
        </div>
        <CurriculumEditor sections={form.curriculum} onChange={v => set('curriculum', v)} />
      </fieldset>
      <Button type="submit" className="min-h-11 px-6 py-2 text-sm" disabled={!valid || saving}>
        {saving ? 'Saving…' : isNew ? 'Create course' : 'Save course'}
      </Button>
    </form>
  )
}
