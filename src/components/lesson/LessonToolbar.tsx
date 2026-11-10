import { romajiDefault, useLessonStore, type ReadingOption } from '@/store/lessonStore'

const OPTIONS: { key: ReadingOption; label: string }[] = [
  { key: 'furigana', label: 'Furigana' },
  { key: 'romaji', label: 'Romaji' },
  { key: 'english', label: 'English' },
]

/** The learner's reading choices for a chapter, resolved from what they picked and the chapter's default. */
export function useReadingPrefs(chapter: number) {
  const furigana = useLessonStore((s) => s.furigana)
  const english = useLessonStore((s) => s.english)
  const storedRomaji = useLessonStore((s) => s.romaji)
  return { furigana, english, romaji: storedRomaji ?? romajiDefault(chapter) }
}

interface LessonToolbarProps {
  chapter: number
  /** Options this lesson's content can actually show. */
  available?: readonly ReadingOption[]
  className?: string
}

/** LessonToolbar: one control that shows or hides furigana, romaji and English across the whole lesson. */
export function LessonToolbar({ chapter, available = ['furigana', 'romaji', 'english'], className }: LessonToolbarProps) {
  const setReading = useLessonStore((s) => s.setReading)
  const prefs = useReadingPrefs(chapter)
  const options = OPTIONS.filter((o) => available.includes(o.key))

  return (
    <div role="group" aria-label="Reading options" className={`flex flex-wrap items-center gap-3 ${className ?? ''}`}>
      <span className="text-caption text-ink-muted">Show</span>
      <div className="inline-flex gap-0.5 rounded-md bg-surface-sunken p-[3px]">
        {options.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={prefs[key]}
            onClick={() => setReading(key, !prefs[key])}
            className="min-h-touch-target rounded px-3 text-caption font-semibold text-ink-muted transition-colors duration-fast hover:text-ink aria-pressed:bg-surface-raised aria-pressed:text-ink aria-pressed:shadow-elevation-1"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
