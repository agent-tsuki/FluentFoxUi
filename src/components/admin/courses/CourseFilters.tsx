import { SelectInput, TextInput } from '@/components/ui/FormField'
import { Icon } from '@/components/ui/Icon'
import type { AdminChannel, CourseLevel, CoursePlatform } from '@/types/admin'

export interface CourseFilterValues {
  search: string
  channelId: string
  level: CourseLevel | ''
  platform: CoursePlatform | ''
  visibility: '' | 'published' | 'hidden'
}

export const EMPTY_COURSE_FILTERS: CourseFilterValues = { search: '', channelId: '', level: '', platform: '', visibility: '' }

const LEVELS: CourseLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

/** Search + filter bar for the course manager. */
export function CourseFilters({ value, channels, onChange }: { value: CourseFilterValues; channels: AdminChannel[]; onChange: (v: CourseFilterValues) => void }) {
  const set = <K extends keyof CourseFilterValues>(key: K, v: CourseFilterValues[K]) => onChange({ ...value, [key]: v })
  return (
    <div role="search" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="relative sm:col-span-2 lg:col-span-1">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <TextInput aria-label="Search courses" placeholder="Search title or slug" value={value.search} onChange={e => set('search', e.target.value)} className="pl-10" />
      </div>
      <SelectInput aria-label="Channel" value={value.channelId} onChange={e => set('channelId', e.target.value)}>
        <option value="">All channels</option>
        {channels.map(c => <option key={c.id} value={c.id}>{c.fields.name.effective ?? c.slug}</option>)}
      </SelectInput>
      <SelectInput aria-label="Level" value={value.level} onChange={e => set('level', e.target.value as CourseFilterValues['level'])}>
        <option value="">All levels</option>
        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
      </SelectInput>
      <SelectInput aria-label="Platform" value={value.platform} onChange={e => set('platform', e.target.value as CourseFilterValues['platform'])}>
        <option value="">All platforms</option>
        <option value="youtube">YouTube</option>
        <option value="udemy">Udemy</option>
        <option value="website">Website</option>
      </SelectInput>
      <SelectInput aria-label="Visibility" value={value.visibility} onChange={e => set('visibility', e.target.value as CourseFilterValues['visibility'])}>
        <option value="">Published and hidden</option>
        <option value="published">Published only</option>
        <option value="hidden">Hidden only</option>
      </SelectInput>
    </div>
  )
}
