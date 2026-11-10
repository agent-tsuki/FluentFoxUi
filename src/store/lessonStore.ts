/**
 * What a learner keeps between lessons, on this device: where they were last
 * (the nav's course links reopen it) and how they like to read (LessonToolbar).
 */
import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LessonCourse = 'kana' | 'kanji' | 'grammar'

export interface LastLesson {
  course: LessonCourse
  href: string
  /** Short name of the position, e.g. "N5 Ch 2". */
  label: string
}

export type ReadingOption = 'furigana' | 'romaji' | 'english'

interface LessonState {
  last: LastLesson | null
  /** Most recent page in each course. */
  byCourse: Partial<Record<LessonCourse, string>>
  furigana: boolean
  english: boolean
  /** null until chosen: romaji then follows the chapter (on early, off later). */
  romaji: boolean | null
  /** Furthest concept reached (0-based), by "<level>-<chapter>". */
  conceptsRead: Record<string, number>
  markConceptRead: (key: string, index: number) => void
  recordLesson: (lesson: LastLesson) => void
  setReading: (option: ReadingOption, on: boolean) => void
}

export const useLessonStore = create<LessonState>()(
  persist(
    (set) => ({
      last: null,
      byCourse: {},
      furigana: true,
      english: true,
      romaji: null,
      conceptsRead: {},
      markConceptRead: (key, index) =>
        set((s) => ((s.conceptsRead[key] ?? -1) >= index ? s : { conceptsRead: { ...s.conceptsRead, [key]: index } })),
      recordLesson: (lesson) =>
        set((s) => (s.last?.href === lesson.href ? s : { last: lesson, byCourse: { ...s.byCourse, [lesson.course]: lesson.href } })),
      setReading: (option, on) => set({ [option]: on }),
    }),
    { name: 'ff-lesson' },
  ),
)

/** Remembers the current lesson page; pass `null` until it's known. */
export function useRecordLesson(lesson: LastLesson | null) {
  const recordLesson = useLessonStore((s) => s.recordLesson)
  const course = lesson?.course
  const href = lesson?.href
  const label = lesson?.label
  useEffect(() => {
    if (course && href && label) recordLesson({ course, href, label })
  }, [course, href, label, recordLesson])
}

/** Chapters up to this one start with romaji shown. */
const ROMAJI_ON_THROUGH_CHAPTER = 5

export function romajiDefault(chapter: number): boolean {
  return chapter <= ROMAJI_ON_THROUGH_CHAPTER
}
